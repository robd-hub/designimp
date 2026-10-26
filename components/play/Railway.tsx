import { useLayoutEffect, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Part, geo, toon, INK, WINDOW, LAMP } from "./toon";
import { BOUND, CROSSING, EAST, MID_X, RAIL, RAIL_FENCE_RUNS, STATION, WHARF_CROSSING } from "./colliders";
import { AUDIO } from "./sound";

// The railway south of the Workshop and HQ. Passenger trains and long tanker trains take it in
// turns to run across town, and the barriers drop for each one at the level crossings on the main road and on Brayford Wharf East.

const LEN = BOUND + EAST + 10; // track runs right across the map
const END = EAST + 24; // trains appear and disappear this far east and west, off the edge of town
const GAP_S = 7; // seconds between one train clearing town and the next setting off
const WARN_S = 6; // the barriers start dropping this long before a train reaches the crossing
const BRAKE = 3; // passenger trains slow and pull away at this rate (units/s²) at Lincoln Central
const DWELL_S = 6; // and wait this long at the platform
const SHUT_S = 3; // a train stopped short of the crossing gets its barriers this long before it leaves
const UP = Math.PI / 2 - 0.08; // barrier arm raised, just short of vertical
const BALLAST = 0xa39a8f;
const SLEEPER = 0x6b4a32;
const STEEL = 0x8a8f99;
const FENCE = 0x8a6a48;
const CREAM = 0xf4f1ea;
const BLUE = 0x2b59c3;
const YELLOW = 0xffd23f;
const DARK = 0x2b2633;

type Kind = "passenger" | "tanker";
// UK trains run on the left: eastbound on the north track, westbound on the south one.
const SCHEDULE: { kind: Kind; dir: 1 | -1 }[] = [
  { kind: "passenger", dir: 1 },
  { kind: "tanker", dir: -1 },
  { kind: "passenger", dir: -1 },
  { kind: "tanker", dir: 1 },
];

const CAR = 8,
  CARS = 3,
  LOCO = 10,
  WAGON = 4.6,
  WAGONS = 12,
  COUPLE = 0.4;
const TRAINS: Record<Kind, { speed: number; len: number }> = {
  passenger: { speed: 13, len: CARS * CAR + (CARS - 1) * COUPLE },
  tanker: { speed: 8, len: LOCO + WAGONS * (WAGON + COUPLE) },
};

// Many small identical pieces (sleepers, fence posts) drawn as one instanced mesh.
function Repeat({ geometry, color, at }: { geometry: THREE.BufferGeometry; color: number; at: [number, number, number][] }) {
  const ref = useRef<THREE.InstancedMesh>(null!);
  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    at.forEach(([x, y, z], i) => ref.current.setMatrixAt(i, m.makeTranslation(x, y, z)));
    ref.current.instanceMatrix.needsUpdate = true;
  }, [at]);
  return <instancedMesh ref={ref} args={[geometry, toon(color), at.length]} receiveShadow raycast={() => null} />;
}

const tracks = [-1, 1].map((s) => RAIL.z + s * RAIL.gap);
// no sleepers showing through the road and pavements at the crossing, or the paving of the one on Brayford Wharf East
const SLEEPERS = tracks.flatMap((z) =>
  Array.from({ length: Math.floor(LEN / 1.2) }, (_, i) => MID_X - LEN / 2 + 0.6 + i * 1.2)
    .filter((x) => Math.abs(x) > 4.6 && Math.abs(x - WHARF_CROSSING.x) > WHARF_CROSSING.half + 0.3)
    .map((x) => [x, 0.06, z] as [number, number, number]),
);
// fences run out from the crossing and stop at the station's platforms
const POSTS = [-1, 1].flatMap((sz) =>
  RAIL_FENCE_RUNS.flatMap(([x0, x1]) =>
    Array.from({ length: Math.floor((x1 - x0) / 2.5) + 1 }, (_, i) => (x0 < 0 ? x1 - i * 2.5 : x0 + i * 2.5)).map(
      (x) => [x, 0.55, RAIL.z + sz * RAIL.fence] as [number, number, number],
    ),
  ),
);

function Track() {
  return (
    <group raycast={() => null}>
      {/* ballast under the road and pavements, which are drawn over it at the crossing */}
      <mesh geometry={geo.box(LEN, 0.04, RAIL.gap * 2 + 3)} material={toon(BALLAST)} position={[MID_X, 0.005, RAIL.z]} receiveShadow />
      <Repeat geometry={geo.box(0.45, 0.08, 2.3)} color={SLEEPER} at={SLEEPERS} />
      {tracks.flatMap((z) =>
        [-0.7, 0.7].map((o) => <mesh key={`${z}${o}`} geometry={geo.box(LEN, 0.12, 0.14)} material={toon(STEEL)} position={[MID_X, 0.11, z + o]} receiveShadow />),
      )}
      {/* post-and-rail fences either side of the line, open where the road crosses */}
      <Repeat geometry={geo.box(0.22, 1.1, 0.22)} color={FENCE} at={POSTS} />
      {RAIL_FENCE_RUNS.flatMap(([x0, x1]) =>
        [-1, 1].flatMap((sz) =>
          [0.45, 0.9].map((y) => (
            <mesh
              key={`${x0}${sz}${y}`}
              geometry={geo.box(x1 - x0, 0.1, 0.08)}
              material={toon(FENCE)}
              position={[(x0 + x1) / 2, y, RAIL.z + sz * RAIL.fence]}
              castShadow
            />
          )),
        ),
      )}
      {/* white stop lines on the road before the crossing, one for each lane */}
      {[-1, 1].map((s) => (
        <mesh key={s} geometry={geo.box(2.8, 0.03, 0.35)} material={toon(0xffffff)} position={[-s * 1.5, 0.06, RAIL.z + s * (RAIL.fence + 0.9)]} />
      ))}
    </group>
  );
}

// Red lamps that flash in turn while a train is coming. Shared by both sides of the crossing.
const LAMP_ON = 0xff3b2a,
  LAMP_OFF = 0x4a2226;
const flash = () => [new THREE.MeshBasicMaterial({ color: LAMP_OFF }), new THREE.MeshBasicMaterial({ color: LAMP_OFF })];
// the High Street's lamps, and the ones on the Brayford Wharf East crossing, which flash for their own trains
const FLASH = flash(),
  FLASH_WHARF = flash();
const CROSSINGS = [
  { x: 0, half: RAIL.crossing, lamps: FLASH },
  { x: WHARF_CROSSING.x, half: WHARF_CROSSING.half, lamps: FLASH_WHARF },
];

// One barrier on each side of the crossing, its post at the kerb and the arm spanning the road
// and both pavements, or the footpath. side is -1 for the north barrier, 1 for the south one.
function Barrier({ side, arm, x, half, lamps }: { side: -1 | 1; arm: (g: THREE.Group | null) => void; x: number; half: number; lamps: THREE.MeshBasicMaterial[] }) {
  const len = half * 2 + 0.4;
  const z = RAIL.z + side * (RAIL.fence + 0.1);
  const stripes = Array.from({ length: Math.floor(len / 2) }, (_, k) => 1.6 + k * 2);
  return (
    // the north post is on the east kerb, the south one on the west, so each arm swings down across the road
    <group position={[x - side * (half + 0.5), 0, z]} rotation-y={side < 0 ? Math.PI : 0}>
      <Part geometry={geo.box(0.5, 1.4, 0.5)} color={0xe8e1d0} outline={0.05} position-y={0.7} />
      <group ref={arm} position-y={1.15} rotation-z={UP}>
        <Part geometry={geo.box(len, 0.2, 0.16)} color={0xffffff} outline={0.04} position-x={len / 2 + 0.2} />
        {stripes.map((x) => (
          <mesh key={x} geometry={geo.box(0.8, 0.22, 0.18)} material={toon(0xe03a3e)} position-x={x + 0.2} />
        ))}
        {[3, 6, 9].filter((x) => x < len).map((x, i) => (
          <mesh key={x} geometry={geo.sphere(0.12)} material={lamps[i % 2]} position={[x, 0.16, 0]} />
        ))}
      </group>
      {/* the twin flashing lights, facing traffic coming towards the crossing */}
      <group position={[0, 0, -side * 0.6]} rotation-y={Math.PI}>
        <Part geometry={geo.cyl(0.08, 0.08, 2.6, 8)} color={DARK} outline={0.03} position-y={1.3} />
        <Part geometry={geo.box(1.4, 0.55, 0.1)} color={INK} outline={0.03} position-y={2.6} />
        {[-0.4, 0.4].map((x, i) => (
          <mesh key={x} geometry={geo.sphere(0.2)} material={lamps[i]} position={[x, 2.6, -0.1]} scale={[1, 1, 0.5]} />
        ))}
        <Part geometry={geo.box(0.9, 0.3, 0.06)} color={YELLOW} outline={0.02} position-y={2.1} />
      </group>
    </group>
  );
}

function Bogies({ len }: { len: number }) {
  return (
    <>
      {[-1, 1].map((s) => (
        <Part key={s} geometry={geo.box(2, 0.45, 2.2)} color={DARK} outline={0.04} position={[s * (len / 2 - 1.4), 0.42, 0]} />
      ))}
    </>
  );
}

// Driving cab end: yellow warning panel, windscreen and headlamps, facing +x.
function Cab({ x, colour }: { x: number; colour: number }) {
  return (
    <group position-x={x}>
      <Part geometry={geo.box(0.2, 1.7, 2.3)} color={YELLOW} outline={0.04} position-y={1.55} />
      <Part geometry={geo.box(0.22, 0.7, 1.9)} color={WINDOW} outline={0.03} position-y={2.35} />
      <Part geometry={geo.box(0.22, 0.25, 2.3)} color={colour} outline={0.02} position-y={2.9} />
      {[-0.75, 0.75].map((z) => (
        <Part key={z} geometry={geo.sphere(0.13)} color={LAMP} outline={0.03} position={[0.1, 1.1, z]} />
      ))}
    </group>
  );
}

// A three-car regional passenger train, cabs at both ends. Built facing +x, its front at x = 0.
function Passenger() {
  return (
    <>
      {Array.from({ length: CARS }, (_, i) => {
        const cx = -(i * (CAR + COUPLE) + CAR / 2);
        return (
          <group key={i} position-x={cx}>
            <Bogies len={CAR} />
            <Part geometry={geo.box(CAR - 1, 0.45, 2)} color={DARK} outline={0.03} position-y={0.75} />
            <Part geometry={geo.box(CAR, 2.3, 2.4)} color={CREAM} outline={0.07} position-y={2} />
            <Part geometry={geo.box(CAR - 0.9, 0.65, 2.46)} color={WINDOW} outline={0.03} position-y={2.35} />
            <mesh geometry={geo.box(CAR, 0.3, 2.44)} material={toon(BLUE)} position-y={1.4} />
            {[-1, 1].map((s) => (
              <Part key={s} geometry={geo.box(0.9, 1.8, 2.48)} color={BLUE} outline={0.03} position={[s * (CAR / 4), 1.95, 0]} />
            ))}
            <Part geometry={geo.box(CAR - 0.3, 0.2, 2.2)} color={0xd6cfe0} outline={0.04} position-y={3.25} />
            {i === 0 && <Cab x={CAR / 2} colour={BLUE} />}
            {i === CARS - 1 && (
              <group rotation-y={Math.PI}>
                <Cab x={CAR / 2} colour={BLUE} />
              </group>
            )}
          </group>
        );
      })}
    </>
  );
}

// A diesel freight loco hauling a long rake of tank wagons. Built facing +x, its front at x = 0.
function Tanker() {
  return (
    <>
      <group position-x={-LOCO / 2}>
        <Bogies len={LOCO} />
        <Part geometry={geo.box(LOCO - 0.6, 0.5, 2.2)} color={DARK} outline={0.04} position-y={0.85} />
        <Part geometry={geo.box(LOCO, 2.3, 2.4)} color={0xc0392b} outline={0.07} position-y={2.2} />
        <mesh geometry={geo.box(LOCO, 0.25, 2.44)} material={toon(YELLOW)} position-y={1.25} />
        {[-2.5, -1, 0.5, 2].map((x) => (
          <Part key={x} geometry={geo.box(1, 0.5, 2.46)} color={0x8a2a20} outline={0.02} position={[x, 2.5, 0]} />
        ))}
        <Part geometry={geo.box(LOCO - 0.4, 0.25, 2.2)} color={DARK} outline={0.04} position-y={3.45} />
        <Part geometry={geo.cyl(0.25, 0.25, 0.4, 10)} color={DARK} outline={0.03} position={[-1.5, 3.7, 0]} />
        <Cab x={LOCO / 2} colour={0xc0392b} />
      </group>
      {Array.from({ length: WAGONS }, (_, i) => (
        <group key={i} position-x={-(LOCO + COUPLE + i * (WAGON + COUPLE) + WAGON / 2)}>
          <Bogies len={WAGON} />
          <Part geometry={geo.box(WAGON, 0.3, 2.1)} color={DARK} outline={0.04} position-y={0.8} />
          <Part geometry={geo.cyl(1.05, 1.05, WAGON - 0.3, 16)} color={i % 3 === 2 ? 0xb8bcc4 : DARK} outline={0.06} position-y={2} rotation-z={Math.PI / 2} />
          <Part geometry={geo.cyl(0.35, 0.35, 0.35, 10)} color={i % 3 === 2 ? 0xb8bcc4 : DARK} outline={0.03} position-y={3.15} />
        </group>
      ))}
    </>
  );
}

export default function Railway({ reduce }: { reduce: boolean }) {
  const trains = useRef<Record<Kind, THREE.Group | null>>({ passenger: null, tanker: null });
  const arms = useRef<(THREE.Group | null)[][]>(CROSSINGS.map(() => []));
  // the first train sets off a few seconds after the town loads
  // v is the train's speed; called and dwell track a passenger train's stop at the station.
  const st = useRef({ i: 0, head: -SCHEDULE[0].dir * END, wait: 3, arms: CROSSINGS.map(() => UP), v: TRAINS[SCHEDULE[0].kind].speed, called: false, dwell: 0 });

  useFrame(({ clock }, delta) => {
    const dt = Math.min(delta, 0.05);
    const s = st.current;
    const run = SCHEDULE[s.i % SCHEDULE.length];
    const train = TRAINS[run.kind];
    // whether each crossing's barriers are down, the High Street's first
    const closed = CROSSINGS.map(() => false);
    if (reduce) {
      // no trains with reduced motion, so the barriers stay up
    } else if (s.wait > 0) {
      s.wait -= dt;
    } else {
      // passenger trains brake to a stop with their middle car at Lincoln Central, wait, then pull away
      const stopAt = STATION.x + (run.dir * train.len) / 2;
      const stops = run.kind === "passenger";
      if (stops && !s.called) {
        const left = run.dir * (stopAt - s.head);
        s.v = Math.min(train.speed, Math.sqrt(2 * BRAKE * Math.max(left, 0)));
        if (left <= s.v * dt + 0.01) {
          s.head = stopAt;
          s.v = 0;
          s.called = true;
          s.dwell = DWELL_S;
        } else s.head += run.dir * s.v * dt;
      } else if (stops && s.dwell > 0) {
        s.dwell -= dt;
      } else {
        s.v = Math.min(train.speed, s.v + BRAKE * dt);
        s.head += run.dir * s.v * dt;
      }
      CROSSINGS.forEach((c, k) => {
        const ahead = run.dir * (c.x - s.head); // how far the front still has to go to reach the crossing
        const tail = run.dir * (s.head - run.dir * train.len - c.x); // how far the back is past it
        closed[k] = ahead < train.speed * WARN_S && tail < c.half + 1;
        // a train calling at the station before it reaches the crossing keeps it open until it's nearly ready to go
        if (stops && run.dir * (c.x - stopAt) > 0 && (!s.called || s.dwell > SHUT_S)) closed[k] = false;
      });
      if (run.dir * (s.head - run.dir * train.len) > END) {
        s.i++;
        s.wait = GAP_S;
        s.head = -SCHEDULE[s.i % SCHEDULE.length].dir * END;
        s.v = TRAINS[SCHEDULE[s.i % SCHEDULE.length].kind].speed;
        s.called = false;
      }
    }
    [CROSSING.closed, CROSSING.wharf] = closed;
    const t = AUDIO.train;
    t.on = !reduce && s.wait <= 0;
    [t.head, t.dir, t.v, t.run] = [s.head, run.dir, s.v, s.i];
    [t.x0, t.x1] = [s.head, s.head - run.dir * train.len];
    for (const k of ["passenger", "tanker"] as const) {
      const g = trains.current[k];
      if (!g) continue;
      g.visible = !reduce && s.wait <= 0 && run.kind === k;
      g.position.set(s.head, 0.17, RAIL.z - run.dir * RAIL.gap);
      g.rotation.y = run.dir > 0 ? 0 : Math.PI;
    }
    // arms take about a second and a half to swing down, and a little longer to rise
    const on = Math.floor(clock.elapsedTime * 2.4) % 2;
    CROSSINGS.forEach((c, k) => {
      const want = closed[k] ? 0 : UP;
      s.arms[k] += Math.sign(want - s.arms[k]) * Math.min(Math.abs(want - s.arms[k]), dt * (closed[k] ? 1.1 : 0.9));
      arms.current[k].forEach((a) => a && (a.rotation.z = s.arms[k]));
      const flashing = closed[k] || s.arms[k] < UP - 0.01;
      if (!k) AUDIO.crossing = flashing;
      c.lamps.forEach((m, i) => m.color.setHex(flashing && i === on ? LAMP_ON : LAMP_OFF));
    });
  });

  return (
    <>
      <Track />
      {CROSSINGS.flatMap((c, k) =>
        ([-1, 1] as const).map((side, i) => <Barrier key={`${k}${side}`} side={side} x={c.x} half={c.half} lamps={c.lamps} arm={(g) => void (arms.current[k][i] = g)} />),
      )}
      <group ref={(g) => void (trains.current.passenger = g)} visible={false}>
        <Passenger />
      </group>
      <group ref={(g) => void (trains.current.tanker = g)} visible={false}>
        <Tanker />
      </group>
    </>
  );
}
