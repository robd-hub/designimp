"use client";

import { useMemo, useRef, type ReactNode, type RefObject } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import type { Place } from "./places";
import { Part, geo, toon, signTexture, WINDOW, LAMP } from "./toon";
import { placeEvents, game } from "./store";
import { CANWICK, EMERGENCY, SIDE_STREETS, SINCIL } from "./colliders";
import { npcPos } from "./npcs";
import { AUDIO } from "./sound";

// The fire station and the ambulance station behind the stadium, side by side on one site and both facing Canwick Road
// across a forecourt (laid out as EMERGENCY in colliders.ts). Each has a bay its vehicle goes out from on a call every
// few minutes: the door rolls up, the blue lights start, and it pulls out left up Canwick Road, round the block by the
// side streets and Sincil Bank, back down Canwick Road past the station, and reverses into its bay before the door comes
// down again. The other bays: the fire station's first stands open with an engine in it and its third is shut; the
// ambulance station's second stands open with an ambulance in it. Vehicles stop for anyone in their way.

const E = EMERGENCY;
const FIRE_RED = 0xc8102e;
const AMB_YELLOW = 0xf2d21b;
const AMB_GREEN = 0x1f8a4c;
const BLUE_OFF = 0x2b59c3;
const DARK = 0x2b2633;
const CONCRETE = 0xc9c2b4;
const LINE_YELLOW = 0xf2c94c;
const BLUE_ON = new THREE.MeshBasicMaterial({ color: 0x6fb8ff, toneMapped: false });

type Pt = [number, number];
const N: Pt = [0, -1],
  S: Pt = [0, 1],
  EAST: Pt = [1, 0],
  W: Pt = [-1, 0];
// Round a corner from one heading to another: a smooth curve from r before the corner point to r after it.
function corner(c: Pt, from: Pt, to: Pt, r: number): Pt[] {
  const a: Pt = [c[0] - from[0] * r, c[1] - from[1] * r],
    b: Pt = [c[0] + to[0] * r, c[1] + to[1] * r];
  return Array.from({ length: 7 }, (_, i) => {
    const t = i / 6,
      u = 1 - t;
    return [u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]];
  });
}

// The driving lines: on the left, as in the UK.
const NB = CANWICK.x - E.lane, // northbound on Canwick Road
  SB = CANWICK.x + E.lane, // southbound
  SINCIL_SB = SINCIL.x + E.sideLane; // southbound on Sincil Bank
const street = (name: string) => SIDE_STREETS.find((s) => s.name.startsWith(name))!.z;
const westbound = (name: string) => street(name) + E.sideLane,
  eastbound = (name: string) => street(name) - E.sideLane;

// Each vehicle's run: out of its bay, left up Canwick Road, left along one street, left down Sincil Bank, left along the
// next street back to Canwick Road, right down it and past the station; then back, reversing round into the bay.
type Run = { out: Pt[]; back: Pt[] };
function run(bay: number, inBay: number, first: string, second: string): Run {
  const stop = bay + 4.5;
  return {
    out: [
      [inBay, bay],
      ...corner([NB, bay], EAST, N, 3),
      ...corner([NB, westbound(first)], N, W, 3.5),
      ...corner([SINCIL_SB, westbound(first)], W, S, 3),
      ...corner([SINCIL_SB, eastbound(second)], S, EAST, 3),
      ...corner([SB, eastbound(second)], EAST, S, 3.5),
      [SB, stop],
    ],
    back: [[SB, stop], ...corner([SB, bay], N, W, 3.5), [inBay, bay]],
  };
}

const FIRE_LEN = 6.2,
  AMB_LEN = 5;
const VEHICLES = [
  { kind: "fire" as const, half: FIRE_LEN / 2, bay: E.fire.bays[1], ...run(E.fire.bays[1], E.front - 3.5, "Monson", "Scorer"), at: 30 },
  { kind: "amb" as const, half: AMB_LEN / 2, bay: E.amb.bays[0], ...run(E.amb.bays[0], E.front - 3, "Portland", "Monson"), at: 105 },
];
const CYCLE = 150; // seconds; each vehicle goes out once a cycle, at its own time, so they're not out together
const SPEED = 7,
  REVERSE = 1.8,
  ACCEL = 4,
  DOOR_SECS = 2;

type Path = { pts: Pt[]; at: number[]; len: number };
const path = (pts: Pt[]): Path => {
  const at = [0];
  for (let i = 1; i < pts.length; i++) at.push(at[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  return { pts, at, len: at[at.length - 1] };
};
const PATHS = VEHICLES.map((v) => ({ out: path(v.out), back: path(v.back) }));
function pointAt({ pts, at }: Path, d: number, o: THREE.Vector3) {
  let k = 1;
  while (k < at.length - 1 && at[k] < d) k++;
  const t = THREE.MathUtils.clamp((d - at[k - 1]) / (at[k] - at[k - 1] || 1), 0, 1);
  return o.set(pts[k - 1][0] + (pts[k][0] - pts[k - 1][0]) * t, 0, pts[k - 1][1] + (pts[k][1] - pts[k - 1][1]) * t);
}

// Where each bay door is up to (0 shut, 1 up), shared with the buildings.
const DOORS = VEHICLES.map(() => ({ open: 0 }));

// Blue lights: a pair on the roof flashing turn about while lit.
function Blues({ lit, x, y, z }: { lit: RefObject<boolean>; x: number; y: number; z: number }) {
  const a = useRef<THREE.Mesh>(null!),
    b = useRef<THREE.Mesh>(null!);
  useFrame(({ clock }) => {
    const on = lit.current,
      flip = Math.sin(clock.elapsedTime * 14) > 0;
    a.current.visible = on && flip;
    b.current.visible = on && !flip;
  });
  return (
    <group position={[x, y, 0]}>
      {[-1, 1].map((s) => (
        <Part key={s} geometry={geo.box(0.32, 0.2, z)} color={BLUE_OFF} outline={0.02} position-z={(s * z) / 2 + s * 0.02} />
      ))}
      <mesh ref={a} geometry={geo.box(0.34, 0.22, z)} material={BLUE_ON} position-z={-z / 2 - 0.02} visible={false} />
      <mesh ref={b} geometry={geo.box(0.34, 0.22, z)} material={BLUE_ON} position-z={z / 2 + 0.02} visible={false} />
    </group>
  );
}

const NEVER = { current: false };
function Wheels({ xs, z, r }: { xs: number[]; z: number; r: number }) {
  return (
    <>
      {xs.flatMap((x) =>
        [-1, 1].map((s) => <Part key={`${x}${s}`} geometry={geo.cyl(r, r, 0.26, 14)} color={0x1a1320} outline={0.03} position={[x, r, s * z]} rotation-x={Math.PI / 2} />),
      )}
    </>
  );
}

// A fire engine, facing +x: red with a white band, silver lockers, a ladder on the roof and a blue light bar on the cab.
function FireEngine({ lit = NEVER }: { lit?: RefObject<boolean> }) {
  return (
    <group>
      <Part geometry={geo.box(4.6, 2, 2.2)} color={FIRE_RED} outline={0.05} position={[-0.8, 1.4, 0]} />
      <Part geometry={geo.box(1.6, 2.1, 2.2)} color={FIRE_RED} outline={0.05} position={[2.3, 1.45, 0]} />
      <Part geometry={geo.box(0.06, 0.8, 1.9)} color={0x2b3a55} outline={0} shadow={false} position={[3.12, 1.95, 0]} />
      {[-1, 1].map((s) => (
        <Part key={s} geometry={geo.box(1.1, 0.7, 0.06)} color={0x2b3a55} outline={0} shadow={false} position={[2.4, 1.95, s * 1.11]} />
      ))}
      <Part geometry={geo.box(FIRE_LEN + 0.02, 0.22, 2.24)} color={0xf4f1ea} outline={0} position={[0, 0.95, 0]} />
      {[-2.4, -1.1, 0.2].flatMap((x) =>
        [-1, 1].map((s) => <Part key={`${x}${s}`} geometry={geo.box(1.15, 1.05, 0.05)} color={0xc7ccd4} outline={0.02} shadow={false} position={[x, 1.7, s * 1.12]} />),
      )}
      {/* the ladder */}
      {[-0.45, 0.45].map((z) => (
        <Part key={z} geometry={geo.box(4.8, 0.1, 0.1)} color={0xdcdcdc} outline={0.02} position={[-0.6, 2.55, z]} />
      ))}
      {Array.from({ length: 9 }, (_, i) => -2.9 + i * 0.57).map((x) => (
        <mesh key={x} geometry={geo.box(0.07, 0.07, 0.9)} material={toon(0xdcdcdc)} position={[x, 2.55, 0]} />
      ))}
      {[-1, 1].map((s) => (
        <Part key={s} geometry={geo.box(0.06, 0.2, 0.3)} color={LAMP} outline={0} shadow={false} position={[3.12, 0.8, s * 0.75]} />
      ))}
      <Blues lit={lit} x={2.3} y={2.6} z={0.8} />
      <Wheels xs={[-2.2, -1.2, 2.2]} z={1} r={0.45} />
    </group>
  );
}

// An ambulance, facing +x: yellow, with the green-and-yellow chequer (Battenburg) along its sides and blue lights.
function Ambulance({ lit = NEVER }: { lit?: RefObject<boolean> }) {
  return (
    <group>
      <Part geometry={geo.box(3.4, 2.3, 2.1)} color={AMB_YELLOW} outline={0.05} position={[-0.8, 1.5, 0]} />
      <Part geometry={geo.box(1.6, 1.6, 2)} color={AMB_YELLOW} outline={0.05} position={[1.7, 1.15, 0]} />
      <Part geometry={geo.box(0.06, 0.6, 1.7)} color={0x2b3a55} outline={0} shadow={false} position={[2.51, 1.5, 0]} />
      {[-1, 1].map((s) => (
        <Part key={s} geometry={geo.box(0.9, 0.55, 0.06)} color={0x2b3a55} outline={0} shadow={false} position={[1.8, 1.5, s * 1.01]} />
      ))}
      {/* the chequer: two rows of squares, staggered */}
      {[0, 1].flatMap((row) =>
        Array.from({ length: 6 }, (_, i) => i)
          .filter((i) => (i + row) % 2 === 0)
          .flatMap((i) =>
            [-1, 1].map((s) => (
              <mesh key={`${row}${i}${s}`} geometry={geo.box(0.56, 0.5, 0.04)} material={toon(AMB_GREEN)} position={[-2.2 + 0.28 + i * 0.56, 0.95 + row * 0.5, s * 1.06]} />
            )),
          ),
      )}
      {[-1, 1].map((s) => (
        <Part key={s} geometry={geo.box(0.06, 0.18, 0.28)} color={LAMP} outline={0} shadow={false} position={[2.51, 0.75, s * 0.7]} />
      ))}
      <Blues lit={lit} x={0.75} y={2.75} z={0.75} />
      <Wheels xs={[-1.6, 1.6]} z={0.95} r={0.4} />
    </group>
  );
}

// The vehicles out on their calls.
export function EmergencyCalls({ reduce }: { reduce: boolean }) {
  const groups = useRef<THREE.Group[]>([]);
  const lits = useMemo(() => VEHICLES.map(() => ({ current: false })), []);
  const st = useRef(VEHICLES.map(() => ({ phase: "idle" as "idle" | "doors" | "out" | "pause" | "back" | "close", d: 0, v: 0, t: 0 }))).current;
  const tmp = useMemo(() => ({ a: new THREE.Vector3(), b: new THREE.Vector3() }), []);
  useFrame(({ clock }, delta) => {
    const dt = Math.min(delta, 0.05);
    const people = [game.pos, ...npcPos.values()];
    let siren: THREE.Vector3 | null = null;
    VEHICLES.forEach((veh, i) => {
      const s = st[i],
        g = groups.current[i],
        P = PATHS[i];
      if (reduce) {
        s.phase = "idle";
        DOORS[i].open = 0;
      } else {
        s.t += dt;
        const due = (clock.elapsedTime - veh.at) % CYCLE;
        if (s.phase === "idle" && clock.elapsedTime > veh.at && due >= 0 && due < 1) [s.phase, s.t] = ["doors", 0];
        else if (s.phase === "doors") {
          DOORS[i].open = Math.min(1, s.t / DOOR_SECS);
          if (s.t > DOOR_SECS) [s.phase, s.d, s.v] = ["out", 0, 0];
        } else if (s.phase === "pause" && s.t > 1.5) [s.phase, s.d, s.v] = ["back", 0, 0];
        else if (s.phase === "close") {
          DOORS[i].open = Math.max(0, 1 - s.t / DOOR_SECS);
          if (s.t > DOOR_SECS) [s.phase, s.t] = ["idle", 0];
        }
        if (s.phase === "out" || s.phase === "back") {
          const p = s.phase === "out" ? P.out : P.back;
          const top = s.phase === "out" ? SPEED : REVERSE;
          // anyone (or the other vehicle) just ahead: stop for them
          let clear = true;
          for (let ahead = veh.half + 0.2; ahead <= veh.half + 3 && clear; ahead += 0.7) {
            const q = pointAt(p, s.d + ahead, tmp.a);
            if (s.d + ahead > p.len + 0.5) break;
            if (people.some((o) => Math.hypot(o.x - q.x, o.z - q.z) < 1.4)) clear = false;
            else if (groups.current.some((o, j) => j !== i && o.visible && Math.hypot(o.position.x - q.x, o.position.z - q.z) < 3.5)) clear = false;
          }
          const cap = Math.min(top, Math.sqrt(2 * ACCEL * Math.max(0, p.len - s.d)) + 0.3);
          s.v = clear ? Math.min(cap, s.v + ACCEL * dt) : Math.max(0, s.v - ACCEL * 3 * dt);
          s.d = Math.min(p.len, s.d + s.v * dt);
          if (s.d >= p.len) [s.phase, s.t] = s.phase === "out" ? ["pause", 0] : ["close", 0];
        }
      }
      // lights and siren from the door going up until it's well on its way round
      lits[i].current = s.phase === "doors" || (s.phase === "out" && s.d < P.out.len * 0.55);
      // place it: in its bay, or along the way (back to front when reversing)
      const moving = s.phase === "out" || s.phase === "pause" || s.phase === "back";
      const p = s.phase === "back" ? P.back : P.out;
      const d = s.phase === "pause" ? P.out.len : moving ? s.d : 0;
      const at = pointAt(p, d, tmp.a);
      const next = pointAt(p, d + 0.6, tmp.b);
      let h = Math.atan2(-(next.z - at.z), next.x - at.x);
      if (d + 0.6 > p.len) {
        const prev = pointAt(p, d - 0.6, tmp.b);
        h = Math.atan2(-(at.z - prev.z), at.x - prev.x);
      }
      if (s.phase === "back") h += Math.PI;
      g.position.set(at.x, 0, at.z);
      g.rotation.y = h;
      g.visible = true;
      if (lits[i].current && !siren) siren = at.clone();
    });
    const sv = siren as THREE.Vector3 | null;
    AUDIO.siren.on = !!sv && !reduce;
    if (sv) [AUDIO.siren.x, AUDIO.siren.z] = [sv.x, sv.z];
  });
  return (
    <>
      {VEHICLES.map((v, i) => (
        <group key={i} ref={(g) => void (g && (groups.current[i] = g))} position={[E.front - 3, 0, v.bay]}>
          {v.kind === "fire" ? <FireEngine lit={lits[i]} /> : <Ambulance lit={lits[i]} />}
        </group>
      ))}
    </>
  );
}

// A bay's roller door, rolling up into the top of the opening as it opens.
function RollerDoor({ i, w, h, color, x, z }: { i: number | null; w: number; h: number; color: number; x: number; z: number }) {
  const g = useRef<THREE.Group>(null!);
  useFrame(() => {
    const open = i === null ? 0 : DOORS[i].open;
    const k = 1 - open * 0.92;
    g.current.scale.y = k;
    g.current.position.y = h - (h * k) / 2;
  });
  return (
    <group ref={g} position={[x, h / 2, z]}>
      <Part geometry={geo.box(0.12, h, w)} color={color} outline={0.03} />
      {Array.from({ length: 5 }, (_, k) => -h / 2 + (h / 6) * (k + 1)).map((y) => (
        <mesh key={y} geometry={geo.box(0.14, 0.05, w - 0.1)} material={toon(DARK)} position-y={y} raycast={() => null} />
      ))}
    </group>
  );
}

// The buildings: brick (or render) at the back and between the bays, a lintel over them with the sign on it, an office
// end with windows and a door, and the forecourt in front with yellow lines marking where to keep clear.
type Bays = { x0: number; x1: number; z0: number; z1: number; bays: number[] };
function Station({
  p,
  box,
  font,
  label,
  doorW,
  doorH,
  depth,
  doors,
  trim,
  signColor,
  children,
}: {
  p: Place;
  box: Bays;
  font: string;
  label: string;
  doorW: number;
  doorH: number;
  depth: number;
  doors: { color: number; i: number | null; open?: boolean }[];
  trim: number;
  signColor: string;
  children?: ReactNode;
}) {
  const sign = useMemo(() => signTexture(label, signColor, font), [label, signColor, font]);
  const h = p.h,
    front = box.x1,
    back = front - depth;
  const bayEdge = box.bays[box.bays.length - 1] + doorW / 2 + 0.2; // the office end starts here
  const piers: [number, number][] = [];
  let z = box.z0;
  for (const b of box.bays) {
    piers.push([z, b - doorW / 2]);
    z = b + doorW / 2;
  }
  piers.push([z, bayEdge]);
  const fc = box === E.fire ? E.forecourts[0] : E.forecourts[1];
  return (
    <group {...placeEvents(p)}>
      {/* back of the bays, the piers between them, the lintel over them and the roof */}
      <Part geometry={geo.box(back - box.x0, h, bayEdge - box.z0)} color={p.wall} outline={0.07} position={[(box.x0 + back) / 2, h / 2, (box.z0 + bayEdge) / 2]} />
      <mesh geometry={geo.box(0.05, doorH, bayEdge - box.z0 - 0.2)} material={toon(DARK)} position={[back + 0.03, doorH / 2, (box.z0 + bayEdge) / 2]} />
      <mesh geometry={geo.box(depth, 0.04, bayEdge - box.z0)} material={toon(0x6b6573)} position={[(back + front) / 2, 0.03, (box.z0 + bayEdge) / 2]} />
      {piers.map(([a, b]) => (
        <Part key={a} geometry={geo.box(depth, h, b - a)} color={p.wall} outline={0.05} position={[(back + front) / 2, h / 2, (a + b) / 2]} />
      ))}
      <Part geometry={geo.box(depth, h - doorH, bayEdge - box.z0)} color={p.wall} outline={0.06} position={[(back + front) / 2, doorH + (h - doorH) / 2, (box.z0 + bayEdge) / 2]} />
      <Part geometry={geo.box(front - box.x0 + 0.3, 0.25, box.z1 - box.z0 + 0.3)} color={p.roof} outline={0.05} position={[(box.x0 + front) / 2, h + 0.1, (box.z0 + box.z1) / 2]} />
      <mesh geometry={geo.box(0.06, 0.25, box.z1 - box.z0)} material={toon(trim)} position={[front + 0.04, h - 0.3, (box.z0 + box.z1) / 2]} />
      {/* the sign on the lintel */}
      <mesh position={[front + 0.08, doorH + (h - doorH) / 2 - 0.08, (box.z0 + bayEdge) / 2]} rotation-y={Math.PI / 2}>
        <planeGeometry args={[Math.min(5.6, bayEdge - box.z0 - 0.8), Math.min(0.9, h - doorH - 0.2)]} />
        <meshBasicMaterial map={sign} toneMapped={false} />
      </mesh>
      {/* the doors */}
      {box.bays.map((b, k) => {
        const d = doors[k];
        return d.open ? null : <RollerDoor key={b} i={d.i} w={doorW} h={doorH} color={d.color} x={front - 0.1} z={b} />;
      })}
      {/* the office end */}
      <Part geometry={geo.box(front - box.x0, h, box.z1 - bayEdge)} color={p.wall} outline={0.07} position={[(box.x0 + front) / 2, h / 2, (bayEdge + box.z1) / 2]} />
      <mesh geometry={geo.box(0.06, 1.9, 1)} material={toon(DARK)} position={[front + 0.02, 0.95, bayEdge + 1]} />
      <mesh geometry={geo.box(0.06, 0.9, Math.max(0.6, box.z1 - bayEdge - 2.6))} material={toon(WINDOW)} position={[front + 0.02, 1.6, (bayEdge + 1.6 + box.z1) / 2]} />
      <mesh geometry={geo.box(0.06, 0.6, box.z1 - bayEdge - 0.8)} material={toon(WINDOW)} position={[front + 0.02, h - 0.95, (bayEdge + box.z1) / 2]} />
      {/* the forecourt, with a yellow box in front of the bays to keep clear */}
      <mesh geometry={geo.box(fc.x1 - fc.x0, 0.04, fc.z1 - fc.z0)} material={toon(CONCRETE)} position={[(fc.x0 + fc.x1) / 2, 0.02, (fc.z0 + fc.z1) / 2]} receiveShadow />
      {[
        [fc.x0 + 0.3, fc.x1 - 0.3, box.z0 + 0.3, box.z0 + 0.42],
        [fc.x0 + 0.3, fc.x1 - 0.3, bayEdge - 0.42, bayEdge - 0.3],
        [fc.x1 - 0.42, fc.x1 - 0.3, box.z0 + 0.3, bayEdge - 0.3],
      ].map(([x0, x1, z0, z1]) => (
        <mesh key={`${x0}${z0}`} geometry={geo.box(x1 - x0, 0.03, z1 - z0)} material={toon(LINE_YELLOW)} position={[(x0 + x1) / 2, 0.05, (z0 + z1) / 2]} />
      ))}
      {children}
    </group>
  );
}

export function FireStation({ p, font }: { p: Place; font: string }) {
  const F = E.fire;
  return (
    <Station
      p={p}
      box={F}
      font={font}
      label="Fire Station"
      doorW={3.4}
      doorH={3.4}
      depth={7}
      trim={0xf4f1ea}
      signColor="#c8102e"
      doors={[
        { color: FIRE_RED, i: null, open: true },
        { color: FIRE_RED, i: 0 },
        { color: FIRE_RED, i: null },
      ]}
    >
      {/* the engine standing in the open bay */}
      <group position={[E.front - 3.5, 0, F.bays[0]]}>
        <FireEngine />
      </group>
      {/* the drill tower at the back corner, where crews practise with ladders and hoses */}
      <group position={[F.x0 + 1.6, 0, F.z0 + 1.6]}>
        <Part geometry={geo.box(3, 10, 3)} color={0x8f3f31} outline={0.07} position-y={5} />
        {[3, 5.5, 8].map((y) => (
          <mesh key={y} geometry={geo.box(0.06, 1, 1.2)} material={toon(DARK)} position={[1.53, y, 0]} />
        ))}
        <Part geometry={geo.box(3.3, 0.25, 3.3)} color={p.roof} outline={0.04} position-y={10.1} />
      </group>
    </Station>
  );
}

export function AmbulanceStation({ p, font }: { p: Place; font: string }) {
  const A = E.amb;
  return (
    <Station
      p={p}
      box={A}
      font={font}
      label="Ambulance Station"
      doorW={3.2}
      doorH={3}
      depth={6}
      trim={AMB_GREEN}
      signColor="#1f8a4c"
      doors={[
        { color: 0xdcdcdc, i: 1 },
        { color: 0xdcdcdc, i: null, open: true },
      ]}
    >
      <group position={[E.front - 3, 0, A.bays[1]]}>
        <Ambulance />
      </group>
      {/* a green band round the top, as on the ambulances */}
      <mesh geometry={geo.box(A.x1 - A.x0 + 0.04, 0.3, A.z1 - A.z0 + 0.04)} material={toon(AMB_GREEN)} position={[(A.x0 + A.x1) / 2, p.h - 0.35, (A.z0 + A.z1) / 2]} />
    </Station>
  );
}
