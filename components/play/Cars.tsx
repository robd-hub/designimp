import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Part, geo, LAMP } from "./toon";
import { BOUND, CROSSING, EAST, RAIL, ROUNDABOUT, SOUTH } from "./colliders";
import { groundY } from "./terrain";
import { game } from "./store";
import { npcPos } from "./npcs";

// A few cars driving round town, on the left as in the UK: eastbound traffic keeps to the north half
// of the main road and southbound traffic to the east half of the south road. Each drives its route,
// clockwise round the tank's roundabout, then off the edge of town, and comes back round after a pause.
// They wait at the level crossing while the barriers are down, and for anyone stepping out in front.

const LANE = 1.5; // each lane's offset from the road's centre line
const SPEED = 7;
const ACCEL = 6;
const OFF = 10; // routes start and end this far past the edge of town
const AROUND = ROUNDABOUT.island + 1.2; // the circle cars drive round the roundabout

type Pt = [number, number];

// Points along a circular arc, angle 0 pointing north (-z) and increasing clockwise seen from above.
function arc(cx: number, cz: number, r: number, a0: number, a1: number): Pt[] {
  const n = Math.max(4, Math.ceil((Math.abs(a1 - a0) * r) / 0.8));
  return Array.from({ length: n + 1 }, (_, i) => {
    const a = a0 + ((a1 - a0) * i) / n;
    return [cx + r * Math.sin(a), cz - r * Math.cos(a)];
  });
}

// Round the roundabout from where one lane meets it to where another leaves it.
const tilt = Math.asin(LANE / AROUND);
const { x: RX, z: RZ } = ROUNDABOUT;
const westbound = arc(RX, RZ, AROUND, Math.PI / 2 + tilt, (3 * Math.PI) / 2 - tilt); // in from the east, round the south side
const eastbound = arc(RX, RZ, AROUND, (3 * Math.PI) / 2 + tilt, (5 * Math.PI) / 2 - tilt); // in from the west, round the north side

const ROUTES: { color: number; route: Pt[] }[] = [
  // through town westbound and out past the roundabout
  { color: 0xe03a3e, route: [[EAST + OFF, LANE], [RX + ROUNDABOUT.edge, LANE], ...westbound, [RX - ROUNDABOUT.edge, LANE], [-BOUND - OFF, LANE]] },
  // in from the west, round the roundabout, then right at the T junction and over the level crossing down the south road
  { color: 0x2b59c3, route: [[-BOUND - OFF, -LANE], [RX - ROUNDABOUT.edge, -LANE], ...eastbound, [RX + ROUNDABOUT.edge, -LANE], ...arc(-3, 3, 4.5, 0, Math.PI / 2), [LANE, SOUTH + OFF]] },
  // up the south road, then right at the T junction towards the station
  { color: 0xffb627, route: [[-LANE, SOUTH + OFF], ...arc(3, 3, 4.5, (3 * Math.PI) / 2, 2 * Math.PI), [EAST + OFF, -LANE]] },
];

// Each route as a polyline with the distance along it to every point, for moving a car by distance.
const PATHS = ROUTES.map(({ route }) => {
  const at = [0];
  for (let i = 1; i < route.length; i++) at.push(at[i - 1] + Math.hypot(route[i][0] - route[i - 1][0], route[i][1] - route[i - 1][1]));
  return { route, at, len: at.at(-1)! };
});

function pointAt(i: number, d: number, out: THREE.Vector3) {
  const { route, at } = PATHS[i];
  let k = 1;
  while (k < at.length - 1 && at[k] < d) k++;
  const t = THREE.MathUtils.clamp((d - at[k - 1]) / (at[k] - at[k - 1] || 1), 0, 1);
  const [x0, z0] = route[k - 1],
    [x1, z1] = route[k];
  return out.set(x0 + (x1 - x0) * t, 0, z0 + (z1 - z0) * t);
}

const onCrossing = (p: THREE.Vector3) => Math.abs(p.x) < RAIL.crossing && Math.abs(p.z - RAIL.z) < RAIL.fence + 0.3;
const inTown = (p: THREE.Vector3) => p.x > -BOUND - 2 && p.x < EAST + 2 && p.z < SOUTH + 4;

// A small hatchback, built facing +x.
function Car({ color }: { color: number }) {
  return (
    <>
      <Part geometry={geo.box(3, 0.7, 1.5)} color={color} outline={0.05} position-y={0.6} />
      <Part geometry={geo.box(1.7, 0.6, 1.36)} color={color} outline={0.05} position={[-0.25, 1.25, 0]} />
      {/* windscreen, rear window and side windows */}
      <Part geometry={geo.box(0.06, 0.42, 1.12)} color={0x2b3a55} outline={0} shadow={false} position={[0.61, 1.27, 0]} />
      <Part geometry={geo.box(0.06, 0.42, 1.12)} color={0x2b3a55} outline={0} shadow={false} position={[-1.11, 1.27, 0]} />
      {[-1, 1].map((s) => (
        <Part key={s} geometry={geo.box(1.4, 0.4, 0.06)} color={0x2b3a55} outline={0} shadow={false} position={[-0.25, 1.27, s * 0.69]} />
      ))}
      {[-1, 1].flatMap((sx) =>
        [-1, 1].map((sz) => (
          <Part key={`${sx}${sz}`} geometry={geo.cyl(0.33, 0.33, 0.26, 14)} color={0x1a1320} outline={0.03} position={[sx * 0.95, 0.33, sz * 0.7]} rotation-x={Math.PI / 2} />
        )),
      )}
      {[-1, 1].map((s) => (
        <group key={s}>
          <Part geometry={geo.box(0.06, 0.18, 0.3)} color={LAMP} outline={0} shadow={false} position={[1.51, 0.72, s * 0.5]} />
          <Part geometry={geo.box(0.06, 0.16, 0.26)} color={0xd1242f} outline={0} shadow={false} position={[-1.51, 0.72, s * 0.5]} />
        </group>
      ))}
    </>
  );
}

export default function Cars({ reduce }: { reduce: boolean }) {
  const groups = useRef<(THREE.Group | null)[]>([]);
  // d is the distance along the route, v the speed and wait the pause before setting off again;
  // they start spread out along their routes so the roads aren't empty when the town loads
  const st = useRef(PATHS.map((p, i) => ({ d: p.len * (0.25 + i * 0.2), v: SPEED, wait: 0 })));
  const tmp = useRef({ a: new THREE.Vector3(), b: new THREE.Vector3(), c: new THREE.Vector3() }).current;

  useFrame((_, delta) => {
    const dt = reduce ? 0 : Math.min(delta, 0.05);
    const cars = st.current;
    const pos = cars.map((c, i) => pointAt(i, c.d, new THREE.Vector3()));
    const people = [game.pos, ...npcPos.values()];
    cars.forEach((c, i) => {
      const g = groups.current[i];
      const len = PATHS[i].len;
      if (c.wait > 0) {
        c.wait -= dt;
        if (g) g.visible = false;
        return;
      }
      // look a few steps up the road for anything in the way
      let clear = true;
      const here = onCrossing(pos[i]);
      for (let ahead = 1.6; ahead <= 4.4 && clear; ahead += 0.7) {
        const p = pointAt(i, c.d + ahead, tmp.a);
        if (CROSSING.closed && !here && onCrossing(p)) clear = false;
        else if (people.some((q) => Math.hypot(q.x - p.x, q.z - p.z) < 1.3)) clear = false;
        // another car: the one further along the road gets to go first
        else if (pos.some((q, j) => j !== i && cars[j].wait <= 0 && q.distanceTo(p) < 1.9 && !(pointAt(j, cars[j].d + 2, tmp.c).distanceTo(pos[i]) < 1.9 && j > i)))
          clear = false;
      }
      c.v = clear ? Math.min(SPEED, c.v + ACCEL * dt) : Math.max(0, c.v - ACCEL * 3 * dt);
      c.d += c.v * dt;
      if (c.d >= len) {
        c.d = 0;
        c.v = SPEED;
        c.wait = 4 + i * 3;
      }
      if (!g) return;
      const at = pointAt(i, c.d, tmp.a);
      const next = pointAt(i, c.d + 0.6, tmp.b);
      g.visible = inTown(at);
      g.position.set(at.x, groundY(at.z), at.z);
      g.rotation.y = Math.atan2(-(next.z - at.z), next.x - at.x);
    });
  });

  return (
    <>
      {ROUTES.map(({ color }, i) => (
        <group key={i} ref={(g) => void (groups.current[i] = g)} visible={false}>
          <Car color={color} />
        </group>
      ))}
    </>
  );
}
