import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Part, geo, toon, LAMP } from "./toon";
import { BOUND, BUS_STATION, CROSSING, EAST, RAIL, ROUNDABOUT, SOUTH } from "./colliders";
import { groundY } from "./terrain";
import { game } from "./store";
import { npcPos } from "./npcs";
import { AUDIO } from "./sound";

// A few cars driving round town, on the left as in the UK: eastbound traffic keeps to the north half
// of the main road and southbound traffic to the east half of the south road. Each drives its route,
// clockwise round the tank's roundabout, then off the edge of town, and comes back round after a pause.
// They wait at the level crossing while the barriers are down, and for anyone stepping out in front.
// Two buses do the same, turning in to the bus station on the way and stopping at a bay for a few seconds.

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

// Into the bus station off the eastbound lane, left at the west end, right along the bays and right
// again at the east end, then out onto the westbound lane.
const { entry: BX0, exit: BX1, bay: BAY } = BUS_STATION;
function viaBusStation(): Pt[] {
  return [
    [BX0 - 3.5, -LANE],
    ...arc(BX0 - 3.5, -LANE - 3.5, 3.5, Math.PI, Math.PI / 2),
    ...arc(BX0 + 3, BAY + 3, 3, (3 * Math.PI) / 2, 2 * Math.PI),
    ...arc(BX1 - 3, BAY + 3, 3, 0, Math.PI / 2),
    ...arc(BX1 - 4.5, LANE - 4.5, 4.5, Math.PI / 2, Math.PI),
  ];
}

type Route = { color: number; route: Pt[]; bus?: { decker: boolean } };
const ROUTES: Route[] = [
  // through town westbound and out past the roundabout
  { color: 0xe03a3e, route: [[EAST + OFF, LANE], [RX + ROUNDABOUT.edge, LANE], ...westbound, [RX - ROUNDABOUT.edge, LANE], [-BOUND - OFF, LANE]] },
  // in from the west, round the roundabout, then right at the T junction and over the level crossing down the south road
  { color: 0x2b59c3, route: [[-BOUND - OFF, -LANE], [RX - ROUNDABOUT.edge, -LANE], ...eastbound, [RX + ROUNDABOUT.edge, -LANE], ...arc(-3, 3, 4.5, 0, Math.PI / 2), [LANE, SOUTH + OFF]] },
  // up the south road, then right at the T junction towards the station
  { color: 0xffb627, route: [[-LANE, SOUTH + OFF], ...arc(3, 3, 4.5, (3 * Math.PI) / 2, 2 * Math.PI), [EAST + OFF, -LANE]] },
  // a single decker in from the west, round the roundabout, through the bus station and back out the way it came
  {
    color: 0x2f8f5b,
    bus: { decker: false },
    route: [[-BOUND - OFF, -LANE], [RX - ROUNDABOUT.edge, -LANE], ...eastbound, [RX + ROUNDABOUT.edge, -LANE], ...viaBusStation(), [RX + ROUNDABOUT.edge, LANE], ...westbound, [RX - ROUNDABOUT.edge, LANE], [-BOUND - OFF, LANE]],
  },
  // a double decker up the south road and over the level crossing, through the bus station, then left at the T junction and back down
  {
    color: 0xd1242f,
    bus: { decker: true },
    route: [[-LANE, SOUTH + OFF], ...arc(3, 3, 4.5, (3 * Math.PI) / 2, 2 * Math.PI), ...viaBusStation(), ...arc(6, 6, 4.5, 0, -Math.PI / 2), [LANE, SOUTH + OFF]],
  },
];
const BUS_LEN = 8;
const BUS_DWELL = 6; // seconds waiting at the bay
// How far each vehicle reaches either side of its middle, and points along it that others keep clear of.
const HALF = ROUTES.map((r) => (r.bus ? BUS_LEN / 2 : 1.5));
const BODY = HALF.map((h) => (h > 2 ? [-h + 1, -h / 3, h / 3, h - 1] : [0]));

// Each route as a polyline with the distance along it to every point, for moving a car by distance.
const PATHS = ROUTES.map(({ route, bus }) => {
  const at = [0];
  for (let i = 1; i < route.length; i++) at.push(at[i - 1] + Math.hypot(route[i][0] - route[i - 1][0], route[i][1] - route[i - 1][1]));
  // where a bus turns onto the lane past the bays, and so how far along the route each bay is
  const bays = bus ? at[route.findIndex(([x, z]) => Math.abs(x - BX0 - 3) < 1e-6 && Math.abs(z - BAY) < 1e-6)] - BX0 - 3 : NaN;
  return { route, at, len: at.at(-1)!, bays: BUS_STATION.stops.map((x) => bays + x) };
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

// A bus, built facing +x, with its doors on the left by the kerb and a destination board over the windscreen.
// The double decker has a second row of windows on top.
function Bus({ color, decker }: { color: number; decker: boolean }) {
  const h = decker ? 3.9 : 2.7;
  const len = BUS_LEN,
    hl = len / 2;
  const rows = decker ? [1.75, 3.25] : [1.75];
  return (
    <>
      <Part geometry={geo.box(len, h, 2.4)} color={0xf4f1ea} outline={0.06} position-y={0.35 + h / 2} />
      {/* the livery: a coloured skirt and roof */}
      <Part geometry={geo.box(len + 0.04, 0.8, 2.44)} color={color} outline={0} position-y={0.75} />
      <Part geometry={geo.box(len + 0.04, 0.34, 2.44)} color={color} outline={0} position-y={0.35 + h - 0.15} />
      {/* windows down both sides, leaving room for the doors at the front on the left */}
      {rows.flatMap((y) =>
        [-1, 1].map((s) => {
          const front = s < 0 && y < 2 ? 1.6 : 0.6;
          const w = len - front - 0.5;
          return <Part key={`${y}${s}`} geometry={geo.box(w, 0.95, 0.06)} color={0x2b3a55} outline={0} shadow={false} position={[-hl + 0.5 + w / 2, y, s * 1.22]} />;
        }),
      )}
      {/* windscreen and the doors behind it */}
      <Part geometry={geo.box(0.06, 1.3, 2.1)} color={0x2b3a55} outline={0} shadow={false} position={[hl + 0.01, 1.6, 0]} />
      <Part geometry={geo.box(0.06, 0.35, 1.7)} color={0x1a1320} outline={0} shadow={false} position={[hl + 0.02, 0.35 + h - (decker ? 1.55 : 0.5), 0]}>
        <mesh geometry={geo.box(0.02, 0.18, 1.4)} material={toon(0xffb627)} position-x={0.03} />
      </Part>
      <Part geometry={geo.box(1, 1.9, 0.06)} color={0x2b3a55} outline={0.02} shadow={false} position={[hl - 1.1, 1.3, -1.22]} />
      {decker && <Part geometry={geo.box(0.06, 0.95, 2.1)} color={0x2b3a55} outline={0} shadow={false} position={[hl + 0.01, 3.25, 0]} />}
      <Part geometry={geo.box(0.06, 1.3, 2.1)} color={0x2b3a55} outline={0} shadow={false} position={[-hl - 0.01, 1.75, 0]} />
      {[-1, 1].flatMap((sx) =>
        [-1, 1].map((sz) => (
          <Part key={`${sx}${sz}`} geometry={geo.cyl(0.45, 0.45, 0.3, 14)} color={0x1a1320} outline={0.03} position={[sx * (hl - 1.5), 0.45, sz * 1.1]} rotation-x={Math.PI / 2} />
        )),
      )}
      {[-1, 1].map((s) => (
        <group key={s}>
          <Part geometry={geo.box(0.06, 0.2, 0.35)} color={LAMP} outline={0} shadow={false} position={[hl + 0.03, 0.75, s * 0.85]} />
          <Part geometry={geo.box(0.06, 0.3, 0.25)} color={0xd1242f} outline={0} shadow={false} position={[-hl - 0.03, 0.75, s * 0.95]} />
        </group>
      ))}
    </>
  );
}

export default function Cars({ reduce }: { reduce: boolean }) {
  const groups = useRef<(THREE.Group | null)[]>([]);
  // d is the distance along the route, v the speed, wait the pause before setting off again and dwell the time
  // left at the bus stop; they start spread out along their routes so the roads aren't empty when the town loads,
  // the buses a little way short of the bus station
  const st = useRef(PATHS.map((p, i) => ({ d: ROUTES[i].bus ? p.bays[0] - 30 - (i % 2) * 45 : p.len * (0.25 + i * 0.2), v: SPEED, wait: 0, dwell: 0, bay: -1, stopped: false })));
  const tmp = useRef({ a: new THREE.Vector3(), b: new THREE.Vector3(), c: new THREE.Vector3() }).current;

  useFrame((_, delta) => {
    const dt = reduce ? 0 : Math.min(delta, 0.05);
    const cars = st.current;
    // the points along every vehicle that others keep their distance from
    const body = cars.map((c, i) => BODY[i].map((o) => pointAt(i, c.d + o, new THREE.Vector3())));
    const people = [game.pos, ...npcPos.values()];
    cars.forEach((c, i) => {
      const g = groups.current[i];
      const len = PATHS[i].len;
      if (c.wait > 0) {
        c.wait -= dt;
        if (g) g.visible = false;
        if (AUDIO.cars[i]) AUDIO.cars[i].on = false;
        return;
      }
      if (c.dwell > 0) c.dwell -= dt;
      else {
        // look a few steps up the road for anything in the way
        let clear = true;
        const here = body[i].some(onCrossing);
        for (let ahead = HALF[i] + 0.1; ahead <= HALF[i] + 2.9 && clear; ahead += 0.7) {
          const p = pointAt(i, c.d + ahead, tmp.a);
          if (CROSSING.closed && !here && onCrossing(p)) clear = false;
          else if (people.some((q) => Math.hypot(q.x - p.x, q.z - p.z) < 1.3)) clear = false;
          // another vehicle: if each is in the other's way, the one further down the list waits
          else if (
            body.some(
              (pts, j) =>
                j !== i &&
                cars[j].wait <= 0 &&
                pts.some((q) => q.distanceTo(p) < 1.9) &&
                !(j > i && body[i].some((q) => pointAt(j, cars[j].d + HALF[j] + 0.5, tmp.c).distanceTo(q) < 1.9)),
            )
          )
            clear = false;
        }
        // a bus picks the bay furthest along that no other bus is using as it turns in, and slows to a halt there
        const { bays } = PATHS[i];
        if (ROUTES[i].bus && c.bay < 0 && !c.stopped && c.d > bays[0] - 25) {
          const taken = (k: number) => cars.some((o, j) => j !== i && o.bay === k && o.d < PATHS[j].bays[k] + BUS_LEN);
          c.bay = bays.length - 1;
          while (c.bay > 0 && taken(c.bay)) c.bay--;
        }
        const stop = c.bay < 0 ? Infinity : bays[c.bay];
        const top = !c.stopped && stop > c.d ? Math.min(SPEED, Math.sqrt(2 * ACCEL * (stop - c.d)) + 0.3) : SPEED;
        c.v = clear ? Math.min(top, c.v + ACCEL * dt) : Math.max(0, c.v - ACCEL * 3 * dt);
        c.d += c.v * dt;
        if (!c.stopped && c.d >= stop) {
          c.d = stop;
          c.v = 0;
          c.dwell = BUS_DWELL;
          c.stopped = true;
        }
      }
      if (c.d >= len) {
        c.d = 0;
        c.v = SPEED;
        c.wait = 4 + i * 3;
        c.stopped = false;
        c.bay = -1;
      }
      const at = pointAt(i, c.d, tmp.a);
      AUDIO.cars[i] = { x: at.x, z: at.z, v: c.v, on: !reduce && inTown(at), bus: !!ROUTES[i].bus };
      if (!g) return;
      const next = pointAt(i, c.d + 0.6, tmp.b);
      g.visible = inTown(at);
      g.position.set(at.x, groundY(at.z), at.z);
      g.rotation.y = Math.atan2(-(next.z - at.z), next.x - at.x);
    });
  });

  return (
    <>
      {ROUTES.map(({ color, bus }, i) => (
        <group key={i} ref={(g) => void (groups.current[i] = g)} visible={false}>
          {bus ? <Bus color={color} decker={bus.decker} /> : <Car color={color} />}
        </group>
      ))}
    </>
  );
}
