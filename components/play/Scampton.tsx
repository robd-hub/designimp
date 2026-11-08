"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, type ThreeElements } from "@react-three/fiber";
import type { Place } from "./places";
import { Part, geo, toon, signTexture, WINDOW, LAMP, SIGNAL_GREEN, INK } from "./toon";
import { placeEvents, game } from "./store";
import { AIRFIELD, AIRFIELD_CAR, AIRFIELD_FENCE, AIRFIELD_GATE, AIRFIELD_STATE, onRunway } from "./colliders";
import { AUDIO } from "./sound";
import { Instances, type Item } from "./SincilStreets";

// RAF Scampton (laid out as AIRFIELD in colliders.ts, in the place's own coordinates: +x north, +z east towards the
// road). A fenced airfield with a runway along the north side, lit at night; the arched hangar, control tower and car
// park round the apron; 617 Squadron's heritage centre in a Nissen hut; and a guardhouse and barrier at the gate, which
// lifts as the Imp comes up to it.
//
// The jet on the apron goes out every so often: it taxis up to the runway, takes off west and climbs away, and while
// it's gone the team flies over in a diamond of nine trailing red, white and blue smoke, then breaks apart. Then it
// comes back in to land and taxis back to its stand. The runway is closed to walkers while it's using it (it waits for
// the Imp to get off first), and one jet keeps practising circuits overhead the rest of the time.

const ARROW_RED = 0xd0202e;
const RAF_BLUE = 0x2b59c3;
const CONCRETE = 0xc9c2b4;
const TARMAC = 0x55505e;
const FENCE = 0x3b5a45;
const CAR_COLOURS = [0x2b59c3, 0xe8e4da, 0x1a1320, 0xa8323a, 0x7d8794];

const A = AIRFIELD,
  R = A.runway,
  RX = (R.x0 + R.x1) / 2,
  S = A.stand;
type Rect = { x0: number; x1: number; z0: number; z1: number };
const mid = (r: Rect) => [(r.x0 + r.x1) / 2, (r.z0 + r.z1) / 2] as const;

// A Red Arrows Hawk, nose along +x: red with a white flash underneath, swept wings and a tall fin. lite leaves out the
// ink outlines, for the formation, where there are nine of them.
function Jet({ lite = false, ...props }: { lite?: boolean } & Omit<ThreeElements["group"], "children">) {
  const o = (n: number) => (lite ? 0 : n);
  return (
    <group {...props}>
      <Part geometry={geo.cyl(0.4, 0.28, 4, 10)} color={ARROW_RED} outline={o(0.05)} rotation-z={-Math.PI / 2} />
      <Part geometry={geo.cone(0.4, 1.1, 10)} color={ARROW_RED} outline={o(0.04)} position-x={2.55} rotation-z={-Math.PI / 2} />
      <Part geometry={geo.box(3, 0.14, 0.62)} color={0xffffff} outline={o(0.03)} position={[0.2, -0.3, 0]} />
      <Part geometry={geo.sphere(0.32)} color={0x3a4a6b} outline={o(0.04)} position={[1.1, 0.32, 0]} scale={[1.8, 0.8, 0.85]} />
      {[-1, 1].map((sz) => (
        <group key={sz}>
          <Part geometry={geo.box(1.3, 0.1, 2.5)} color={ARROW_RED} outline={o(0.04)} position={[-0.2, -0.12, sz * 1.4]} rotation-y={-sz * 0.35} />
          <Part geometry={geo.box(0.5, 0.11, 0.5)} color={0xffffff} outline={o(0.03)} position={[-0.75, -0.12, sz * 2.45]} rotation-y={-sz * 0.35} />
          <Part geometry={geo.box(0.7, 0.08, 1.1)} color={ARROW_RED} outline={o(0.03)} position={[-1.75, 0, sz * 0.65]} rotation-y={-sz * 0.35} />
        </group>
      ))}
      <Part geometry={geo.box(1, 1.2, 0.08)} color={ARROW_RED} outline={o(0.03)} position={[-1.65, 0.65, 0]} rotation-z={0.4} />
      <Part geometry={geo.box(0.5, 0.25, 0.09)} color={0xffffff} outline={o(0.02)} position={[-1.85, 1, 0]} rotation-z={0.4} />
    </group>
  );
}

// Heading as a group's rotation.y for a jet (nose +x) moving by dx, dz.
const headingOf = (dx: number, dz: number) => Math.atan2(-dz, dx);
const turnTo = (a: number, b: number, k: number) => {
  const d = Math.atan2(Math.sin(b - a), Math.cos(b - a));
  return a + d * k;
};

// The jet's trips: each step is the seconds it takes to get there, then x, z and height, and for a turn on the spot the
// heading it turns to. Out: up the taxiway, along the runway to its east end, round, and off west, climbing away.
// In: down onto the runway from the west, rolling out, round, back along it and down the taxiway onto its stand.
type Step = [number, number, number, number, number?];
const OUT: Step[] = [
  [0, S.x, S.z, 0],
  [6, RX, S.z, 0],
  [1.5, RX, S.z, 0, -Math.PI / 2],
  [6.5, RX, 17, 0],
  [2.5, RX, 17, 0, Math.PI / 2],
  [2.2, RX, 13, 0],
  [1.8, RX, 4, 0],
  [1.3, RX, -6, 0.3],
  [1, RX, -17, 2.5],
  [1.9, RX, -42, 9],
  [3.5, RX, -110, 26],
];
const IN: Step[] = [
  [0, RX, -110, 24],
  [7, RX, -40, 7],
  [2.5, RX, -16, 0.6],
  [0.7, RX, -10, 0],
  [2.3, RX, 3, 0],
  [3, RX, 10, 0],
  [2.5, RX, 10, 0, Math.PI / 2],
  [4, RX, S.z, 0],
  [1.5, RX, S.z, 0, Math.PI],
  [5.5, S.x, S.z, 0],
  [3, S.x, S.z, 0, 0],
];
type Track = { t: number[]; at: Step[]; h: number[]; pitch: number[]; turn: boolean[] };
function track(steps: Step[], h0: number): Track {
  const t = [0],
    h = [h0],
    pitch = [0],
    turn = [false];
  for (let i = 1; i < steps.length; i++) {
    const [d, x, z, y, to] = steps[i],
      [, px, pz, py] = steps[i - 1];
    t.push(t[i - 1] + d);
    const run = Math.hypot(x - px, z - pz);
    turn.push(to !== undefined);
    h.push(to ?? (run > 0.01 ? headingOf(x - px, z - pz) : h[i - 1]));
    pitch.push(run > 0.01 ? Math.atan2(y - py, run) : 0);
  }
  return { t, at: steps, h, pitch, turn };
}
const OUT_TRACK = track(OUT, 0),
  IN_TRACK = track(IN, -Math.PI / 2);
const end = (k: Track) => k.t[k.t.length - 1];
function sample(k: Track, time: number, o: { pos: THREE.Vector3; h: number; pitch: number }) {
  let i = 1;
  while (i < k.t.length - 1 && k.t[i] < time) i++;
  const f = Math.min(1, Math.max(0, (time - k.t[i - 1]) / (k.t[i] - k.t[i - 1] || 1)));
  const a = k.at[i - 1],
    b = k.at[i];
  o.pos.set(a[1] + (b[1] - a[1]) * f, a[3] + (b[3] - a[3]) * f, a[2] + (b[2] - a[2]) * f);
  // turn on the spot over the step; otherwise ease round onto the new heading at the start of each leg
  const into = k.turn[i] ? f : Math.min(1, (time - k.t[i - 1]) / 0.6);
  o.h = turnTo(k.h[i - 1], k.h[i], into);
  o.pitch = k.pitch[i - 1] + (k.pitch[i] - k.pitch[i - 1]) * Math.min(1, (time - k.t[i - 1]) / 0.6);
}

// How long the jet sits on its stand, and how long it's away (the display runs in the middle of that).
const PARK_SECS = 30,
  AWAY_SECS = 34;
const SORTIE = { phase: "park" as "park" | "out" | "away" | "in", t: 0 };

// The display: nine in a diamond come in from the east along the runway, smoking, and break apart over it, the outside
// jets turning away to either side and the middle ones pulling up. Each is [rows back, places to the side].
const DIAMOND: [number, number][] = [
  [0, 0],
  [1, -1],
  [1, 1],
  [2, -2],
  [2, 0],
  [2, 2],
  [3, -1],
  [3, 1],
  [4, 0],
];
// (along the south edge of the runway and low, to stay in sight of the map camera, which sits 15 up at the default zoom)
const SHOW = { from: 4, len: 20, v: 9, gap: 3.3, start: 95, x: 7, y: 6.5, brk: 11, smokeFrom: 1.5, scale: 0.6 };
const PUFFS = 28,
  PUFF_GAP = 0.11;
const SMOKE = [0xe8404a, 0xffffff, 0x3b6fd8]; // left, middle, right
const smokeOf = (s: number) => (s < 0 ? 0 : s > 0 ? 2 : 1);
function formation(i: number, tau: number, o: THREE.Vector3) {
  const [b, s] = DIAMOND[i];
  const lzb = SHOW.start - SHOW.v * SHOW.brk + b * SHOW.gap,
    lxb = SHOW.x + s * SHOW.gap,
    yb = SHOW.y - b * 0.35;
  if (tau < SHOW.brk) {
    o.set(lxb, yb, lzb + SHOW.v * (SHOW.brk - tau));
    return { h: Math.PI / 2, roll: 0, pitch: 0 };
  }
  const u = tau - SHOW.brk,
    w = s * 0.2,
    vy = s ? 1.2 : b === 0 ? 3 : b === 2 ? 2.2 : 1.4,
    psi = w * u;
  o.set(w ? lxb + (SHOW.v / w) * (1 - Math.cos(psi)) : lxb, yb + vy * u, w ? lzb - (SHOW.v / w) * Math.sin(psi) : lzb - SHOW.v * u);
  return { h: Math.atan2(Math.cos(psi), Math.sin(psi)), roll: Math.sign(w) * 0.7 * Math.min(1, u), pitch: Math.atan2(vy, SHOW.v) * Math.min(1, u) };
}

// The practising jet's circuit over the runway.
const CIRCUIT = { x: RX, z: 1.5, rx: 7, rz: 20 };
const TRAIL = 18;
const circuitAt = (t: number, o: THREE.Vector3) => o.set(CIRCUIT.x + Math.sin(t) * CIRCUIT.rx, 8 + Math.sin(t * 2) * 1.2, CIRCUIT.z + Math.cos(t) * CIRCUIT.rz);

const m4 = new THREE.Matrix4(),
  v3 = new THREE.Vector3(),
  v4 = new THREE.Vector3(),
  q = new THREE.Quaternion();
const PUFF = geo.sphere(1, 8, 6);

// Where a point in the airfield's own coordinates is in the world.
function toWorldPt(p: Place, x: number, z: number): [number, number] {
  const c = Math.round(Math.cos(p.rot)),
    s = Math.round(Math.sin(p.rot));
  return [p.x + x * c + z * s, p.z - x * s + z * c];
}

// Everything that moves: the jet's trips, the display and the practising jet, plus the jet noise for the soundscape.
function Flying({ p, reduce }: { p: Place; reduce: boolean }) {
  const jet = useRef<THREE.Group>(null!);
  const jetPitch = useRef<THREE.Group>(null!);
  const circuit = useRef<THREE.Group>(null!);
  const circuitRoll = useRef<THREE.Group>(null!);
  const circuitPuffs = useRef<THREE.Mesh[]>([]);
  const team = useRef<{ h: THREE.Group; pitch: THREE.Group; roll: THREE.Group }[]>([]);
  const smoke = useRef<THREE.InstancedMesh[]>([]);
  const pose = useMemo(() => ({ pos: new THREE.Vector3(), h: 0, pitch: 0 }), []);
  useFrame(({ clock }, delta) => {
    const dt = Math.min(delta, 0.1);
    const st = SORTIE;
    const me = game.pos;
    const sounds: { x: number; z: number; loud: number }[] = [];
    const hear = (lx: number, lz: number, loud: number) => {
      const [x, z] = toWorldPt(p, lx, lz);
      sounds.push({ x, z, loud });
    };
    if (reduce) {
      st.phase = "park";
      AIRFIELD_STATE.runway = false;
      AIRFIELD_STATE.parked = true;
    } else {
      st.t += dt;
      if (st.phase === "park" && st.t > PARK_SECS && !onRunway(me.x, me.z)) {
        st.phase = "out";
        st.t = 0;
      } else if (st.phase === "out" && st.t > end(OUT_TRACK)) {
        st.phase = "away";
        st.t = 0;
      } else if (st.phase === "away" && st.t > AWAY_SECS && !onRunway(me.x, me.z)) {
        st.phase = "in";
        st.t = 0;
      } else if (st.phase === "in" && st.t > end(IN_TRACK)) {
        st.phase = "park";
        st.t = 0;
      }
      AIRFIELD_STATE.runway = st.phase === "out" || st.phase === "in";
      AIRFIELD_STATE.parked = st.phase === "park";
    }

    // the jet on its stand, or out on a trip
    const g = jet.current;
    if (st.phase === "out" || st.phase === "in") {
      sample(st.phase === "out" ? OUT_TRACK : IN_TRACK, st.t, pose);
      g.visible = true;
      g.position.set(pose.pos.x, pose.pos.y, pose.pos.z);
      g.rotation.y = pose.h;
      jetPitch.current.rotation.z = pose.pitch;
      hear(pose.pos.x, pose.pos.z, pose.pos.y > 0.1 || Math.abs(pose.pos.z - 17) > 0.5 ? 1 : 0.4);
    } else {
      g.visible = st.phase === "park";
      g.position.set(S.x, 0, S.z);
      g.rotation.y = 0;
      jetPitch.current.rotation.z = 0;
    }

    // the display, in the middle of the jet's time away
    const tau = st.phase === "away" ? st.t - SHOW.from : -1;
    const showing = tau >= 0 && tau < SHOW.len;
    const counts = [0, 0, 0];
    team.current.forEach((j, i) => {
      j.h.visible = showing;
      if (!showing) return;
      const f = formation(i, tau, j.h.position);
      j.h.rotation.y = f.h;
      j.pitch.rotation.z = f.pitch;
      j.roll.rotation.x = f.roll;
      if (i === 0) hear(j.h.position.x, j.h.position.z, 1.3);
      const c = smokeOf(DIAMOND[i][1]);
      for (let k = 1; k <= PUFFS; k++) {
        const at = tau - k * PUFF_GAP;
        if (at < SHOW.smokeFrom) break;
        formation(i, at, v3);
        const age = k / PUFFS;
        const r = (0.25 + age * 0.4) * (1 - Math.max(0, age - 0.8) * 4);
        smoke.current[c].setMatrixAt(counts[c]++, m4.compose(v3, q, v4.setScalar(r)));
      }
    });
    smoke.current.forEach((m, c) => {
      m.count = counts[c];
      m.visible = counts[c] > 0;
      m.instanceMatrix.needsUpdate = true;
    });

    // the practising jet, which joins the display while the other one's away
    const ct = reduce ? 0.8 : clock.elapsedTime * 0.35;
    circuit.current.visible = st.phase !== "away";
    circuitAt(ct, circuit.current.position);
    const dir = circuitAt(ct + 0.01, v3).sub(circuit.current.position);
    const ry = Math.atan2(-dir.z, dir.x);
    circuit.current.rotation.y = ry;
    const pos = circuit.current.position;
    circuitRoll.current.rotation.x = Math.sign(Math.sin(ry) * (CIRCUIT.x - pos.x) + Math.cos(ry) * (CIRCUIT.z - pos.z)) * 0.55;
    circuitPuffs.current.forEach((m, i) => {
      m.visible = circuit.current.visible;
      circuitAt(ct - (i + 1) * 0.035, m.position);
    });
    if (circuit.current.visible) hear(pos.x, pos.z, 0.45);

    // the loudest one, for its roar
    let best = null as (typeof sounds)[number] | null,
      score = 0;
    for (const s of sounds) {
      const k = s.loud / (6 + Math.hypot(s.x - me.x, s.z - me.z));
      if (k > score) [best, score] = [s, k];
    }
    AUDIO.jet.on = !!best && !reduce;
    if (best) Object.assign(AUDIO.jet, { x: best.x, z: best.z, loud: best.loud });
  });
  return (
    <>
      <group ref={jet} position={[S.x, 0, S.z]}>
        <group ref={jetPitch}>
          {/* on its wheels */}
          {[[1.8, 0], [-0.6, -0.9], [-0.6, 0.9]].map(([x, z]) => (
            <group key={`${x}${z}`} position={[x, 0, z]}>
              <Part geometry={geo.cyl(0.05, 0.05, 0.7, 6)} color={INK} outline={0.02} position-y={0.55} />
              <Part geometry={geo.cyl(0.22, 0.22, 0.14, 12)} color={0x1a1320} outline={0.02} position-y={0.22} rotation-x={Math.PI / 2} />
            </group>
          ))}
          <Jet position-y={1.05} />
        </group>
      </group>
      {DIAMOND.map((_, i) => (
        <group
          key={i}
          visible={false}
          ref={(h) => {
            if (h) team.current[i] = { h, pitch: h.children[0] as THREE.Group, roll: h.children[0].children[0] as THREE.Group };
          }}
        >
          <group>
            <group>
              <Jet lite scale={SHOW.scale} />
            </group>
          </group>
        </group>
      ))}
      {SMOKE.map((c, i) => (
        <instancedMesh
          key={c}
          ref={(m) => void (m && (smoke.current[i] = m))}
          args={[PUFF, toon(c), 3 * PUFFS]}
          visible={false}
          frustumCulled={false}
          raycast={() => null}
        />
      ))}
      <group ref={circuit}>
        <group ref={circuitRoll}>
          <Jet />
        </group>
      </group>
      {Array.from({ length: TRAIL }, (_, i) => (
        <mesh
          key={i}
          ref={(m) => void (m && (circuitPuffs.current[i] = m))}
          geometry={geo.sphere(0.55 - i * 0.022, 10, 8)}
          material={toon(0xffffff)}
          raycast={() => null}
        />
      ))}
    </>
  );
}

// The barrier at the gate, lifting as the Imp comes up to it.
function Barrier({ reduce }: { reduce: boolean }) {
  const arm = useRef<THREE.Group>(null!);
  useFrame((_, delta) => {
    const near = Math.hypot(game.pos.x - AIRFIELD_GATE[0], game.pos.z - AIRFIELD_GATE[1]) < 6.5;
    const to = near ? 1.35 : 0;
    const a = arm.current.rotation;
    a.z = reduce ? to : a.z + (to - a.z) * Math.min(1, delta * 3);
  });
  const x0 = A.drive.x0 - 0.5,
    len = A.drive.x1 - A.drive.x0 + 0.6;
  return (
    <group position={[x0, 0, A.barrier]}>
      <Part geometry={geo.box(0.45, 1.1, 0.45)} color={0xffffff} outline={0.04} position-y={0.55} />
      <group ref={arm} position-y={0.95}>
        {Array.from({ length: 6 }, (_, i) => (
          <Part key={i} geometry={geo.box(len / 6, 0.14, 0.14)} color={i % 2 ? 0xffffff : ARROW_RED} outline={0.02} position-x={0.2 + (i + 0.5) * (len / 6)} />
        ))}
      </group>
    </group>
  );
}

// The windsock, swinging about in the breeze.
function Windsock({ reduce }: { reduce: boolean }) {
  const sock = useRef<THREE.Group>(null!);
  useFrame(({ clock }) => {
    const t = reduce ? 0 : clock.elapsedTime;
    sock.current.rotation.y = 0.6 + Math.sin(t * 0.4) * 0.35 + Math.sin(t * 1.3) * 0.08;
    sock.current.rotation.z = -0.15 + Math.sin(t * 0.9) * 0.08;
  });
  return (
    <group position={[A.windsock.x, 0, A.windsock.z]}>
      <Part geometry={geo.cyl(0.07, 0.09, 4, 8)} color={0xffffff} outline={0.03} position-y={2} />
      <group ref={sock} position-y={3.9}>
        {[0, 1, 2].map((i) => (
          <Part
            key={i}
            geometry={geo.cyl(0.36 - i * 0.06, 0.3 - i * 0.06, 0.6, 12)}
            color={i % 2 ? 0xffffff : 0xf06a1d}
            outline={0.03}
            position-x={0.35 + i * 0.6}
            rotation-z={Math.PI / 2}
          />
        ))}
      </group>
    </group>
  );
}

// The control tower's beacon, turning.
function Beacon({ reduce }: { reduce: boolean }) {
  const g = useRef<THREE.Group>(null!);
  useFrame((_, delta) => {
    if (!reduce) g.current.rotation.y += delta * 3;
  });
  return (
    <group ref={g} position-y={5.35}>
      <Part geometry={geo.box(0.55, 0.28, 0.28)} color={LAMP} outline={0.03} />
    </group>
  );
}

// Runway numbers painted on the tarmac, white on a see-through ground.
function paint(text: string, font: string) {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 160;
  const x = c.getContext("2d")!;
  x.fillStyle = "#ffffff";
  x.font = `140px ${font}`;
  x.textAlign = "center";
  x.textBaseline = "middle";
  x.fillText(text, 128, 84);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function Airfield({ p, font, reduce }: { p: Place; font: string; reduce: boolean }) {
  const sign = useMemo(() => signTexture(p.name, "#2b59c3", font), [p, font]);
  const heritage = useMemo(() => signTexture("617 Squadron\nHeritage Centre", "#2b59c3", font), [font]);
  const numbers = useMemo(() => ({ west: paint("09", font), east: paint("27", font) }), [font]);
  const flat = (r: Rect, color: number, y: number) => (
    <mesh geometry={geo.box(r.x1 - r.x0, 0.06, r.z1 - r.z0)} material={toon(color)} position={[(r.x0 + r.x1) / 2, y, (r.z0 + r.z1) / 2]} receiveShadow />
  );
  const H = A.hangar,
    [hx, hz] = mid(H),
    hw = H.x1 - H.x0,
    hd = H.z1 - H.z0;
  const T = A.tower,
    [tx, tz] = mid(T);
  const N = A.heritage,
    [nx, nz] = mid(N),
    nr = (N.x1 - N.x0) / 2 - 0.15;
  const G = A.guard,
    [gx, gz] = mid(G);
  const lights = useMemo(() => {
    const edge: Item[] = [],
      green: Item[] = [],
      approach: Item[] = [];
    for (let z = R.z0 + 1; z <= R.z1 - 1; z += 3) for (const x of [R.x0 + 0.25, R.x1 - 0.25]) edge.push({ at: [x, 0.16, z], rot: 0 });
    for (let x = R.x0 + 0.4; x <= R.x1 - 0.3; x += 0.8) for (const z of [R.z0 + 0.25, R.z1 - 0.25]) green.push({ at: [x, 0.16, z], rot: 0 });
    for (const z of [R.z0 - 1.5, R.z0 - 3]) for (let x = RX - 1.6; x <= RX + 1.65; x += 0.8) approach.push({ at: [x, 0.35, z], rot: 0 });
    return { edge, green, approach };
  }, []);
  const fencePosts = useMemo(() => {
    const out: Item[] = [];
    for (const f of AIRFIELD_FENCE) {
      const alongX = f.x1 - f.x0 > f.z1 - f.z0,
        len = alongX ? f.x1 - f.x0 : f.z1 - f.z0,
        n = Math.max(1, Math.round(len / 2.5));
      for (let i = 0; i <= n; i++) {
        const k = i / n;
        out.push({ at: alongX ? [f.x0 + k * len, 0.8, (f.z0 + f.z1) / 2] : [(f.x0 + f.x1) / 2, 0.8, f.z0 + k * len], rot: 0 });
      }
    }
    return out;
  }, []);
  return (
    <group position={[p.x, 0, p.z]} rotation-y={p.rot} {...placeEvents(p)}>
      <mesh geometry={geo.box(p.w, 0.06, p.d)} material={toon(0x7fcf6a)} position-y={0.03} receiveShadow />
      {flat(A.taxiway, CONCRETE, 0.06)}
      {flat(A.apron, CONCRETE, 0.065)}
      {flat(A.drive, CONCRETE, 0.06)}
      {flat(A.carpark, 0x6b6573, 0.062)}
      {flat(R, TARMAC, 0.07)}
      {/* the jet's stand: a yellow lead-in line and box on the apron */}
      <mesh geometry={geo.box(A.taxiway.x0 - S.x + 2, 0.06, 0.14)} material={toon(0xf2c94c)} position={[(S.x + A.taxiway.x0) / 2 + 1, 0.1, S.z]} />
      {[A.parked.x0 - 0.3, A.parked.x1 + 0.3].map((x) => (
        <mesh key={x} geometry={geo.box(0.14, 0.06, A.parked.z1 - A.parked.z0 + 0.6)} material={toon(0xf2c94c)} position={[x, 0.1, S.z]} />
      ))}
      {/* centre line, threshold stripes and numbers */}
      {Array.from({ length: Math.floor((R.z1 - R.z0 - 14) / 3.6) + 1 }, (_, i) => R.z0 + 7 + i * 3.6).map((z) => (
        <mesh key={z} geometry={geo.box(0.25, 0.06, 1.6)} material={toon(0xffffff)} position={[RX, 0.1, z]} />
      ))}
      {[R.z0 + 1.4, R.z1 - 1.4].flatMap((z) =>
        [-2.1, -1.5, -0.9, 0.9, 1.5, 2.1].map((dx) => (
          <mesh key={`${z}${dx}`} geometry={geo.box(0.35, 0.06, 1.6)} material={toon(0xffffff)} position={[RX + dx, 0.1, z]} />
        )),
      )}
      <mesh position={[RX, 0.11, R.z0 + 4]} rotation={[-Math.PI / 2, 0, -Math.PI / 2]} raycast={() => null}>
        <planeGeometry args={[2.4, 1.5]} />
        <meshBasicMaterial map={numbers.west} transparent toneMapped={false} depthWrite={false} />
      </mesh>
      <mesh position={[RX, 0.11, R.z1 - 4]} rotation={[-Math.PI / 2, 0, Math.PI / 2]} raycast={() => null}>
        <planeGeometry args={[2.4, 1.5]} />
        <meshBasicMaterial map={numbers.east} transparent toneMapped={false} depthWrite={false} />
      </mesh>
      {/* runway lights: white along the edges, green across the ends, and the approach lights off the west end */}
      <Instances geometry={geo.box(0.22, 0.2, 0.22)} color={LAMP} list={lights.edge} />
      <Instances geometry={geo.box(0.22, 0.2, 0.22)} color={SIGNAL_GREEN} list={lights.green} />
      <Instances geometry={geo.box(0.26, 0.7, 0.26)} color={LAMP} list={lights.approach} outline={0.03} />

      {/* the hangar: low walls under a big arched roof, doors facing the apron */}
      <group position={[hx, 0, hz]}>
        <Part geometry={geo.box(hw, 3.2, hd)} color={p.roof} outline={0.08} position-y={1.6} />
        <Part geometry={geo.cyl(hw / 2, hw / 2, hd, 24)} color={0x6f7888} outline={0.08} position-y={3.2} rotation-x={Math.PI / 2} scale={[1, 1, 0.45]} />
        <Part geometry={geo.box(hw - 2, 3, 0.2)} color={0x4a4f5c} outline={0.05} position={[0, 1.5, hd / 2 + 0.05]} />
        {[-2.5, 0, 2.5].map((x) => (
          <mesh key={x} geometry={geo.box(0.08, 2.9, 0.22)} material={toon(0x2b2633)} position={[x, 1.5, hd / 2 + 0.07]} />
        ))}
        {/* RAF roundel on the gable */}
        {([[0.9, RAF_BLUE], [0.6, 0xffffff], [0.3, ARROW_RED]] as const).map(([r, c], i) => (
          <Part key={r} geometry={geo.cyl(r, r, 0.1, 24)} color={c} outline={i ? 0 : 0.04} position={[0, 4.3, hd / 2 + 0.05 + i * 0.03]} rotation-x={Math.PI / 2} />
        ))}
      </group>

      {/* the control tower: a white two-storey block with the glass control room on top, a balcony round it, a mast and
          the turning beacon */}
      <group position={[tx, 0, tz]}>
        <Part geometry={geo.box(T.x1 - T.x0, 3, T.z1 - T.z0)} color={0xf2efe6} outline={0.06} position-y={1.5} />
        {[0.9, 2.2].map((y) => (
          <mesh key={y} geometry={geo.box(T.x1 - T.x0 + 0.04, 0.5, 2.6)} material={toon(WINDOW)} position-y={y} />
        ))}
        <mesh geometry={geo.box(0.9, 1.6, 0.06)} material={toon(0x2b2633)} position={[(T.x1 - T.x0) / 2 + 0.02, 0.8, 0]} rotation-y={Math.PI / 2} />
        <Part geometry={geo.box(T.x1 - T.x0 + 0.8, 0.15, T.z1 - T.z0 + 0.8)} color={0xd8d2c4} outline={0.04} position-y={3.07} />
        <Part geometry={geo.box(T.x1 - T.x0 - 0.5, 1.5, T.z1 - T.z0 - 0.5)} color={WINDOW} outline={0.05} position-y={3.9} />
        <Part geometry={geo.box(T.x1 - T.x0 + 0.2, 0.22, T.z1 - T.z0 + 0.2)} color={0x4a4f5c} outline={0.04} position-y={4.76} />
        <Part geometry={geo.cyl(0.12, 0.12, 0.5, 8)} color={0x4a4f5c} outline={0.02} position-y={5.05} />
        <Beacon reduce={reduce} />
        <Part geometry={geo.cyl(0.04, 0.04, 2.2, 6)} color={0xdcdcdc} outline={0.02} position={[-1.2, 5.95, -1.2]} />
      </group>
      <Windsock reduce={reduce} />

      {/* 617 Squadron's heritage centre: a corrugated Nissen hut with its door at the east end and a board in front */}
      <group position={[nx, 0, nz]}>
        <Part geometry={geo.cyl(nr, nr, N.z1 - N.z0, 20)} color={0x6b7a5e} outline={0.06} rotation-x={Math.PI / 2} />
        {Array.from({ length: 6 }, (_, i) => N.z0 - nz + 0.6 + i * ((N.z1 - N.z0 - 1.2) / 5)).map((z) => (
          <mesh key={z} geometry={geo.cyl(nr + 0.04, nr + 0.04, 0.08, 20)} material={toon(0x5a6850)} position-z={z} rotation-x={Math.PI / 2} />
        ))}
        <mesh geometry={geo.box(1, 1.7, 0.1)} material={toon(0x5a3a22)} position={[0, 0.85, (N.z1 - N.z0) / 2 + 0.02]} />
        {[-1.5, 1.5].map((x) => (
          <mesh key={x} geometry={geo.box(0.7, 0.6, 0.1)} material={toon(WINDOW)} position={[x, 1.1, (N.z1 - N.z0) / 2 + 0.02]} />
        ))}
        <group position={[-1.6, 0, (N.z1 - N.z0) / 2 + 1.4]} rotation-y={-0.7}>
          {[-0.9, 0.9].map((x) => (
            <Part key={x} geometry={geo.box(0.14, 1.6, 0.14)} color={INK} outline={0.03} position={[x, 0.8, 0]} />
          ))}
          <Part geometry={geo.box(2.3, 1.1, 0.12)} color={0xfff8e7} outline={0.04} position-y={1.5} />
          <mesh position={[0, 1.5, 0.07]}>
            <planeGeometry args={[2.2, 1]} />
            <meshBasicMaterial map={heritage} toneMapped={false} />
          </mesh>
        </group>
      </group>

      {/* the car park by the gate */}
      {A.cars.map((c) => (
        <group key={c.k}>
          <Part geometry={geo.box(AIRFIELD_CAR.len, 0.7, AIRFIELD_CAR.w)} color={CAR_COLOURS[c.k % CAR_COLOURS.length]} outline={0.05} position={[c.x, 0.55, c.z]} />
          <Part geometry={geo.box(1.8, 0.55, AIRFIELD_CAR.w - 0.2)} color={WINDOW} outline={0.04} position={[c.x - 0.25, 1.15, c.z]} />
        </group>
      ))}
      {[10.4, 12.6, 14.8, 17, 19.2].flatMap((z) =>
        [-15.5, -10.5].map((x) => <mesh key={`${x}${z}`} geometry={geo.box(3.4, 0.06, 0.1)} material={toon(0xffffff)} position={[x, 0.1, z]} />),
      )}

      {/* the guardhouse by the drive, and the barrier across it */}
      <group position={[gx, 0, gz]}>
        <Part geometry={geo.box(G.x1 - G.x0, 2.4, G.z1 - G.z0)} color={0xf2efe6} outline={0.05} position-y={1.2} />
        <mesh geometry={geo.box(0.06, 0.8, G.z1 - G.z0 - 0.6)} material={toon(WINDOW)} position={[(G.x1 - G.x0) / 2 + 0.02, 1.5, 0]} />
        <Part geometry={geo.box(G.x1 - G.x0 + 0.4, 0.2, G.z1 - G.z0 + 0.4)} color={RAF_BLUE} outline={0.04} position-y={2.5} />
      </group>
      <Barrier reduce={reduce} />

      {/* the fence right round, with white gateposts either side of the drive */}
      <Instances geometry={geo.box(0.12, 1.6, 0.12)} color={FENCE} list={fencePosts} />
      {AIRFIELD_FENCE.flatMap((f, i) =>
        [0.55, 1.45].map((y) => (
          <mesh key={`${i}${y}`} geometry={geo.box(Math.max(0.06, f.x1 - f.x0), 0.07, Math.max(0.06, f.z1 - f.z0))} material={toon(FENCE)} position={[(f.x0 + f.x1) / 2, y, (f.z0 + f.z1) / 2]} raycast={() => null} />
        )),
      )}
      {[A.drive.x0 - 0.5, A.drive.x1 + 0.5].map((x) => (
        <Part key={x} geometry={geo.box(0.5, 1.6, 0.5)} color={0xffffff} outline={0.04} position={[x, 0.8, p.d / 2 - A.fence]} />
      ))}
      {/* name board by the gate, turned to face the road and the town */}
      <group position={[6.5, 0, p.d / 2 - 2]} rotation-y={-Math.PI / 4}>
        {[-1.6, 1.6].map((x) => (
          <Part key={x} geometry={geo.box(0.2, 2.2, 0.2)} color={0x2b2633} outline={0.04} position={[x, 1.1, 0]} />
        ))}
        <Part geometry={geo.box(4.2, 1, 0.15)} color={0xfff8e7} outline={0.05} position={[0, 2.1, 0]} />
        <mesh position={[0, 2.1, 0.09]}>
          <planeGeometry args={[4, 0.9]} />
          <meshBasicMaterial map={sign} toneMapped={false} />
        </mesh>
      </group>
      <Flying p={p} reduce={reduce} />
    </group>
  );
}
