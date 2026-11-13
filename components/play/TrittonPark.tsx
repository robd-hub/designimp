"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { hex, shopSign, type Place } from "./places";
import { Part, geo, toon, WINDOW, LAMP } from "./toon";
import { placeEvents, usePlay } from "./store";
import { EXTRA_BOXES, RAIL, TRITTON, TRITTON_CAR, TRITTON_SHELTER, toWorld } from "./colliders";
import { Sign, useSign } from "./MoreLandmarks";
import { Instances, type Item } from "./SincilStreets";
import { SHOP_COLOURS } from "./shop";

type Props = { p: Place; font: string; reduce: boolean };

// Tritton Road and Tritton Retail Park (laid out as TRITTON in colliders.ts): the road south off the tank roundabout,
// over its own level crossing and on over the Witham to the edge of the map, and the park: a car park of marked bays
// with cars parked in about half of them, the big units round its south and east sides with their names on coloured
// fascias front and back, a lorry at the loading bay round the back, trolley shelters, a planted island, a bus stop
// and a coffee drive-through by the way in. After dark the fascias glow and the lamps light the tarmac. The shops are
// generic stand-ins, named for what they sell, not real brands. The to-let unit is drawn here too (TrittonShell).
const PAVE = 0xe8dcc2;
const ROAD = 0x6b6573;
const TARMAC = 0x5d5866;
const CLAD = 0xd9d6cf;
const TRIM = 0x9aa3ad;
const UNIT_H = 7;
const R = TRITTON.road,
  X = TRITTON.x;
const P = TRITTON.park;
const B = TRITTON.bridge;
const CAR_COLOURS = [0xe03a3e, 0x2b59c3, 0xf4f1ea, 0x1a1320, 0x9aa3ad, 0xffd23f];

// The fascias' night glow: the same colour, lit from within.
const glowMats = new Map<number, THREE.MeshBasicMaterial>();
const glow = (c: number) => {
  if (!glowMats.has(c)) glowMats.set(c, new THREE.MeshBasicMaterial({ color: c, toneMapped: false }));
  return glowMats.get(c)!;
};
// A soft pool of light on the ground under each lamp after dark.
const POOL = new THREE.CircleGeometry(3.4, 24).rotateX(-Math.PI / 2);
const POOL_MAT = new THREE.MeshBasicMaterial({ color: 0xffd98a, transparent: true, opacity: 0.22, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false });

// lamps down the road (clear of the crossing and the bridge) and round the car park
const LAMPS: [number, number][] = [
  ...Array.from({ length: Math.floor((R.z1 - R.z0 - 6) / 13) }, (_, i): [number, number] => [X + (i % 2 ? 1 : -1) * (R.pave - 0.35), R.z0 + 6 + i * 13]).filter(
    ([, z]) => Math.abs(z - RAIL.z) > RAIL.fence + 1.5 && Math.abs(z - B.z) > B.half + 1.5,
  ),
  [-79.5, 33],
  [-79.5, 50],
  [-64, 29.6],
  [-56, 29.6],
  [-61, 60.6],
];
const POLES = LAMPS.map(([x, z]): Item => ({ at: [x, 2, z], rot: 0 }));
const BULBS = LAMPS.map(([x, z]): Item => ({ at: [x, 4, z], rot: 0 }));
const DASHES = Array.from({ length: Math.floor((R.z1 - R.z0) / 4) }, (_, i) => R.z0 + 6 + i * 4).filter(
  (z) => z < R.z1 - 1 && Math.abs(z - RAIL.z) > RAIL.fence + 1 && Math.abs(z - B.z) > B.half + 0.5,
);
// the white lines between the bays
const BAY_LINES: Item[] = TRITTON.bays.flatMap((b) => [-1, 1].map((s): Item => ({ at: [b.x + s * 1.35, 0.05, b.z], rot: 0 })));
// the parked cars, by colour: a body and a cabin a little towards the back
const CARS = CAR_COLOURS.map((_, c) => TRITTON.cars.filter((car) => (car.k * 5 + 1) % CAR_COLOURS.length === c));
const carBits = (list: typeof TRITTON.cars, y: number, back: number): Item[] => list.map((c) => ({ at: [c.x, y, c.z - c.face * back], rot: 0 }));
// a couple of trolleys left in empty bays, and a row of them in each shelter
const EMPTY = TRITTON.bays.filter((b) => !TRITTON.cars.some((c) => c.x === b.x && c.z === b.z));
const STRAYS: Item[] = [EMPTY[1], EMPTY[Math.floor(EMPTY.length / 2)]].filter(Boolean).map((b, i) => ({ at: [b.x + 0.3, 0, b.z - 0.6], rot: 0.4 + i }));
const SHELTERED: Item[] = TRITTON.shelters.flatMap((sh) =>
  [-0.7, 0, 0.7].map((o): Item => ({ at: [sh.x + Math.cos(sh.rot) * o, 0, sh.z - Math.sin(sh.rot) * o], rot: sh.rot + Math.PI / 2 })),
);
const TROLLEYS = [...STRAYS, ...SHELTERED];
const lift = (list: Item[], y: number, fwd = 0): Item[] => list.map((t) => ({ at: [t.at[0] + Math.sin(t.rot) * fwd, y, t.at[2] + Math.cos(t.rot) * fwd], rot: t.rot }));

function Flat({ w, d, color, x, z, y }: { w: number; d: number; color: number; x: number; z: number; y: number }) {
  return <mesh geometry={geo.box(w, 0.04, d)} material={toon(color)} position={[x, y, z]} receiveShadow />;
}

// A coloured fascia band with a name on it, glowing after dark.
function Fascia({ w, color, map, z, flip = false }: { w: number; color: number; map: THREE.Texture | null; z: number; flip?: boolean }) {
  const night = usePlay((s) => s.night);
  return (
    <group position={[0, UNIT_H - 1.3, z]} rotation-y={flip ? Math.PI : 0}>
      {night ? <mesh geometry={geo.box(w, 1.8, 0.3)} material={glow(color)} position-z={0.15} /> : <Part geometry={geo.box(w, 1.8, 0.3)} color={color} outline={0.05} position-z={0.15} />}
      {map && <Sign map={map} w={Math.min(w - 1.5, 6)} h={1.3} position={[0, 0, 0.32]} />}
    </group>
  );
}

// One big unit: cladding, a fascia front and back with its name, a glass entrance under a canopy at the front and
// roller doors to the loading bay at the back.
function Unit({ u, font }: { u: (typeof TRITTON.units)[number]; font: string }) {
  const sign = useSign(u.name, hex(u.color), font);
  const n = u.face === "n";
  const W = n ? u.x1 - u.x0 : u.z1 - u.z0,
    D = n ? u.z1 - u.z0 : u.x1 - u.x0;
  const front = D / 2;
  return (
    <group position={[(u.x0 + u.x1) / 2, 0, (u.z0 + u.z1) / 2]} rotation-y={n ? Math.PI : -Math.PI / 2}>
      <Part geometry={geo.box(W, UNIT_H, D)} color={CLAD} outline={0.08} position-y={UNIT_H / 2} />
      <Part geometry={geo.box(W + 0.2, 0.3, D + 0.2)} color={TRIM} outline={0.05} position-y={UNIT_H + 0.15} />
      <Fascia w={W} color={u.color} map={sign} z={front} />
      <Part geometry={geo.box(Math.min(W - 2, 5), 3, 0.12)} color={WINDOW} outline={0.04} position={[0, 1.5, front + 0.06]} />
      <Part geometry={geo.box(Math.min(W - 1, 6), 0.2, 1.4)} color={u.color} outline={0.04} position={[0, 3.3, front + 0.7]} />
      {/* round the back: the name again, smaller, and the loading bay's roller doors */}
      <Fascia w={Math.min(W, 7)} color={u.color} map={sign} z={-front} flip />
      {[-1, 1].map((s) => (
        <Part key={s} geometry={geo.box(2.6, 3, 0.12)} color={TRIM} outline={0.04} position={[s * Math.min(W / 4, 3), 1.5, -front - 0.06]} />
      ))}
    </group>
  );
}

// A lorry backed up to the loading yard: a long box trailer and a cab, built along x.
function Lorry() {
  const l = TRITTON.lorry;
  const z = (l.z0 + l.z1) / 2,
    w = l.z1 - l.z0;
  const cab = 2.6;
  const trailer = l.x1 - l.x0 - cab;
  return (
    <group position={[l.x0, 0, z]} raycast={() => null}>
      <Part geometry={geo.box(trailer, 3, w)} color={0xf4f1ea} outline={0.07} position={[trailer / 2, 2.2, 0]} />
      <Part geometry={geo.box(trailer + 0.04, 0.5, w + 0.04)} color={0x2b59c3} outline={0} position={[trailer / 2, 1, 0]} />
      <Part geometry={geo.box(cab, 2.4, w)} color={0x2b59c3} outline={0.06} position={[trailer + cab / 2, 1.8, 0]} />
      <Part geometry={geo.box(0.06, 0.9, w - 0.4)} color={0x2b3a55} outline={0} position={[l.x1 - l.x0 + 0.02, 2.3, 0]} />
      {[1.2, trailer - 1.6, trailer - 0.6, trailer + cab - 0.8].flatMap((x) =>
        [-1, 1].map((s) => <Part key={`${x}${s}`} geometry={geo.cyl(0.45, 0.45, 0.3, 12)} color={0x1a1320} outline={0.03} position={[x, 0.45, s * (w / 2 - 0.1)]} rotation-x={Math.PI / 2} />),
      )}
    </group>
  );
}

// A shelter: four posts and a roof, open at the front (local +z). The bus stop has a glass back and a flag.
function Shelter({ x, z, rot, bus = false }: { x: number; z: number; rot: number; bus?: boolean }) {
  const { w, d } = TRITTON_SHELTER;
  return (
    <group position={[x, 0, z]} rotation-y={rot}>
      {[-1, 1].flatMap((sx) =>
        [-1, 1].map((sz) => <Part key={`${sx}${sz}`} geometry={geo.box(0.1, 2.2, 0.1)} color={0x5b6470} outline={0.02} position={[(sx * (w - 0.1)) / 2, 1.1, (sz * (d - 0.1)) / 2]} />),
      )}
      <Part geometry={geo.box(w + 0.2, 0.12, d + 0.2)} color={bus ? 0x2b2633 : 0x2f8f5b} outline={0.03} position-y={2.25} />
      {bus && (
        <>
          <mesh geometry={geo.box(w, 1.6, 0.05)} material={toon(WINDOW)} position={[0, 1.2, -d / 2 + 0.05]} />
          <Part geometry={geo.box(0.1, 2.8, 0.1)} color={0x5b6470} outline={0.02} position={[w / 2 + 0.6, 1.4, d / 2]} />
          <Part geometry={geo.box(0.7, 0.45, 0.06)} color={0xd1242f} outline={0.02} position={[w / 2 + 0.6, 2.7, d / 2]} />
        </>
      )}
    </group>
  );
}

export function TrittonPark({ p, font }: Props) {
  const road = useSign("Tritton Road", "#2b2633", font);
  const coffee = useSign(TRITTON.pod.name, "#7a4a2e", font);
  const night = usePlay((s) => s.night);
  const pod = TRITTON.pod;
  const isl = TRITTON.island;
  return (
    <group>
      {/* Tritton Road, south from the roundabout over the railway, past the park and on over the Witham */}
      <group raycast={() => null}>
        <Flat w={R.pave * 2} d={R.z1 - R.z0} color={PAVE} x={X} z={(R.z0 + R.z1) / 2} y={0.012} />
        <Flat w={R.half * 2} d={R.z1 - R.z0} color={ROAD} x={X} z={(R.z0 + R.z1) / 2} y={0.022} />
        {DASHES.map((z) => (
          <Flat key={z} w={0.25} d={1.8} color={0xffd23f} x={X} z={z} y={0.05} />
        ))}
        {[-0.5, 0.5, 1.5, 2.5].map((x) => (
          <Flat key={x} w={0.6} d={0.2} color={0xf4f1ea} x={X + x} z={8.6} y={0.05} />
        ))}
        {/* the road bridge: a deck over the water and a parapet either side */}
        <Part geometry={geo.box(R.pave * 2, 0.3, B.half * 2)} color={0xb8a888} outline={0.05} position={[X, 0.2, B.z]} />
        <mesh geometry={geo.box(R.half * 2, 0.04, B.half * 2)} material={toon(ROAD)} position={[X, 0.37, B.z]} />
        {[-1, 1].map((s) => (
          <Part key={s} geometry={geo.box(0.4, 0.9, B.half * 2 + 0.6)} color={0xb8a888} outline={0.05} position={[X + s * (R.pave + 0.2), 0.6, B.z]} />
        ))}
      </group>
      <group position={[X + R.pave + 0.3, 0, 10]} rotation-y={Math.PI / 2}>
        <mesh geometry={geo.box(0.1, 2, 0.1)} material={toon(0x2b2633)} position-y={1} />
        <Sign map={road} w={2.6} h={0.55} position={[0, 2.2, 0.03]} />
        <Sign map={road} w={2.6} h={0.55} position={[0, 2.2, -0.03]} rotation-y={Math.PI} />
      </group>
      <Shelter {...TRITTON.busStop} bus />

      {/* the car park: tarmac from the road to the units, the pavement along their fronts and the walkway through the east
          row to the river, the loading yard round the back, and the bays */}
      <group raycast={() => null}>
        <Flat w={-48 - (X + R.pave)} d={63 - 26} color={TARMAC} x={(-48 + X + R.pave) / 2} z={(26 + 63) / 2} y={0.015} />
        <Flat w={-38.5 - P.x0} d={2.6} color={PAVE} x={(-38.5 + P.x0) / 2} z={61.7} y={0.025} />
        <Flat w={1.8} d={60 - 26} color={PAVE} x={-48.9} z={(26 + 60) / 2} y={0.025} />
        <Flat w={-34.9 - -48} d={8} color={PAVE} x={(-34.9 + -48) / 2} z={43.5} y={0.025} />
        <Flat w={15} d={7} color={TARMAC} x={-71.5} z={76.5} y={0.015} />
        <Instances geometry={geo.box(0.12, 0.02, 5)} color={0xf4f1ea} list={BAY_LINES} />
        {/* the planted island at the end of the double row, with a tree */}
        <Part geometry={geo.box(isl.x1 - isl.x0, 0.25, isl.z1 - isl.z0)} color={0x6cc86a} outline={0.03} position={[(isl.x0 + isl.x1) / 2, 0.12, (isl.z0 + isl.z1) / 2]} />
        <Part geometry={geo.cyl(0.15, 0.2, 1.6, 6)} color={0x6b4a2e} outline={0.03} position={[(isl.x0 + isl.x1) / 2, 1, isl.z0 + 2]} />
        <Part geometry={geo.sphere(1.2, 10, 8)} color={0x3f8f3a} outline={0.04} position={[(isl.x0 + isl.x1) / 2, 2.4, isl.z0 + 2]} />
      </group>
      {CARS.map((list, c) => (
        <group key={c} raycast={() => null}>
          <Instances geometry={geo.box(TRITTON_CAR.w, 0.7, TRITTON_CAR.len)} color={CAR_COLOURS[c]} list={carBits(list, 0.55, 0)} outline={0.05} />
          <Instances geometry={geo.box(TRITTON_CAR.w - 0.2, 0.55, 1.8)} color={WINDOW} list={carBits(list, 1.15, 0.25)} outline={0.04} />
        </group>
      ))}
      <group raycast={() => null}>
        {TRITTON.shelters.map((sh) => (
          <Shelter key={`${sh.x},${sh.z}`} {...sh} />
        ))}
        <Instances geometry={geo.box(0.55, 0.45, 0.85)} color={0xb8c0c8} list={lift(TROLLEYS, 0.65)} outline={0.03} />
        <Instances geometry={geo.box(0.55, 0.06, 0.06)} color={0xe03a3e} list={lift(TROLLEYS, 1.05, -0.45)} outline={0.02} />
        <Lorry />
        <Instances geometry={geo.cyl(0.1, 0.12, 4, 8)} color={0x2b2633} list={POLES} outline={0.04} />
        <Instances geometry={geo.sphere(0.3)} color={LAMP} list={BULBS} outline={0.05} />
        {night && LAMPS.map(([x, z]) => <mesh key={`${x},${z}`} geometry={POOL} material={POOL_MAT} position={[x, 0.08, z]} />)}
      </group>

      {/* the units and the coffee pod open the park's card */}
      <group {...placeEvents(p)}>
        {TRITTON.units.map((u) => (
          <Unit key={u.name} u={u} font={font} />
        ))}
        <group position={[(pod.x0 + pod.x1) / 2, 0, (pod.z0 + pod.z1) / 2]}>
          <Part geometry={geo.box(pod.x1 - pod.x0, 3.2, pod.z1 - pod.z0)} color={0xf2e2c4} outline={0.06} position-y={1.6} />
          <Part geometry={geo.box(pod.x1 - pod.x0 + 0.6, 0.3, pod.z1 - pod.z0 + 0.6)} color={pod.color} outline={0.05} position-y={3.35} />
          <Part geometry={geo.box(2.4, 1.4, 0.1)} color={WINDOW} outline={0.03} position={[-0.8, 1.6, (pod.z1 - pod.z0) / 2 + 0.05]} />
          <Sign map={coffee} w={2.6} h={0.65} position={[0, 2.85, (pod.z1 - pod.z0) / 2 + 0.06]} />
        </group>
      </group>
    </group>
  );
}

// The to-let unit: an empty shell of the same build as the others, its fascia blank under a TO LET banner and its
// windows whitewashed. When a visitor (or a prospect link) puts their business here, the fascia takes their colour
// and name and the windows clear. Drawn in the plot's own coordinates, front at +z.
export function TrittonShell({ p, font, name, colour }: { p: Place; font: string; name: string; colour?: string }) {
  const c = TRITTON.shell;
  const W = c.x1 - c.x0,
    D = c.z1 - c.z0,
    mid = (c.z0 + c.z1) / 2;
  const col = parseInt((colour ?? SHOP_COLOURS[0]).slice(1), 16);
  const letting = useSign("TO LET", "#7a1f3d", font);
  const named = useMemo(() => (name ? shopSign(name) : ""), [name]);
  const sign = useSign(named || " ", hex(col), font);
  useEffect(() => {
    EXTRA_BOXES.set(p.id, toWorld(p, c));
    return () => void EXTRA_BOXES.delete(p.id);
  }, [p, c]);
  return (
    <group position={[p.x, 0, p.z]} rotation-y={p.rot} {...placeEvents(p)}>
      <mesh geometry={geo.box(p.w, 0.06, p.d)} material={toon(PAVE)} position-y={0.03} receiveShadow />
      <group position-z={mid}>
        <Part geometry={geo.box(W, UNIT_H, D)} color={CLAD} outline={0.08} position-y={UNIT_H / 2} />
        <Part geometry={geo.box(W + 0.2, 0.3, D + 0.2)} color={TRIM} outline={0.05} position-y={UNIT_H + 0.15} />
        {name ? <Fascia w={W} color={col} map={sign} z={D / 2} /> : <Fascia w={W} color={0xc4c0b8} map={null} z={D / 2} />}
        <Part geometry={geo.box(5, 3, 0.12)} color={name ? WINDOW : 0xf2efe6} outline={0.04} position={[0, 1.5, D / 2 + 0.06]} />
        {!name && <Sign map={letting} w={4.4} h={1} position={[0, 3.9, D / 2 + 0.08]} />}
        {name && <Part geometry={geo.box(6, 0.2, 1.4)} color={col} outline={0.04} position={[0, 3.3, D / 2 + 0.7]} />}
      </group>
    </group>
  );
}
