"use client";

import type { Place } from "./places";
import { Part, geo, toon, WINDOW, LAMP } from "./toon";
import { placeEvents } from "./store";
import { RAIL, TRITTON, TRITTON_CAR } from "./colliders";
import { Sign, useSign } from "./MoreLandmarks";
import { Instances, type Item } from "./SincilStreets";

type Props = { p: Place; font: string; reduce: boolean };

// Tritton Road and Tritton Retail Park (laid out as TRITTON in colliders.ts): the road south off the tank roundabout
// over its own level crossing, and the park, a car park of marked bays with cars parked in about half of them, the
// big units round its south and east sides with their names on coloured fascias, and a coffee drive-through by the
// way in. The shops are generic stand-ins, named for what they sell, not real brands.
const PAVE = 0xe8dcc2;
const ROAD = 0x6b6573;
const TARMAC = 0x5d5866;
const CLAD = 0xd9d6cf;
const UNIT_H = 7;
const R = TRITTON.road,
  X = TRITTON.x;
const P = TRITTON.park;
const CAR_COLOURS = [0xe03a3e, 0x2b59c3, 0xf4f1ea, 0x1a1320, 0x9aa3ad, 0xffd23f];

// lamps down the road (not on the crossing) and round the car park
const LAMPS: [number, number][] = [
  ...Array.from({ length: Math.floor((R.z1 - R.z0 - 6) / 13) }, (_, i): [number, number] => [X + (i % 2 ? 1 : -1) * (R.pave - 0.35), R.z0 + 6 + i * 13]).filter(
    ([, z]) => Math.abs(z - RAIL.z) > RAIL.fence + 1.5,
  ),
  [-78.5, 41],
  [-64, 41],
  [-51, 41],
  [-64, 58.5],
];
const POLES = LAMPS.map(([x, z]): Item => ({ at: [x, 2, z], rot: 0 }));
const BULBS = LAMPS.map(([x, z]): Item => ({ at: [x, 4, z], rot: 0 }));
const DASHES = Array.from({ length: Math.floor((R.z1 - R.z0) / 4) }, (_, i) => R.z0 + 6 + i * 4).filter((z) => z < R.z1 - 1 && Math.abs(z - RAIL.z) > RAIL.fence + 1);
// the white lines between the bays
const BAY_LINES: Item[] = TRITTON.bays.flatMap((b) => [-1, 1].map((s): Item => ({ at: [b.x + s * 1.35, 0.05, b.z], rot: 0 })));
// the parked cars, by colour: a body and a cabin a little towards the back
const CARS = CAR_COLOURS.map((_, c) => TRITTON.cars.filter((car) => (car.k * 5 + 1) % CAR_COLOURS.length === c));
const carBits = (list: typeof TRITTON.cars, y: number, back: number): Item[] => list.map((c) => ({ at: [c.x, y, c.z - c.face * back], rot: 0 }));

function Flat({ w, d, color, x, z, y }: { w: number; d: number; color: number; x: number; z: number; y: number }) {
  return <mesh geometry={geo.box(w, 0.04, d)} material={toon(color)} position={[x, y, z]} receiveShadow />;
}

// One big unit: cladding, a coloured fascia along the front with its name on it, a glass entrance under a canopy.
function Unit({ u, font }: { u: (typeof TRITTON.units)[number]; font: string }) {
  const sign = useSign(u.name, `#${u.color.toString(16).padStart(6, "0")}`, font);
  const n = u.face === "n";
  const W = n ? u.x1 - u.x0 : u.z1 - u.z0,
    D = n ? u.z1 - u.z0 : u.x1 - u.x0;
  const front = D / 2;
  return (
    <group position={[(u.x0 + u.x1) / 2, 0, (u.z0 + u.z1) / 2]} rotation-y={n ? Math.PI : -Math.PI / 2}>
      <Part geometry={geo.box(W, UNIT_H, D)} color={CLAD} outline={0.08} position-y={UNIT_H / 2} />
      <Part geometry={geo.box(W + 0.2, 0.3, D + 0.2)} color={0x9aa3ad} outline={0.05} position-y={UNIT_H + 0.15} />
      <Part geometry={geo.box(W, 1.8, 0.3)} color={u.color} outline={0.05} position={[0, UNIT_H - 1.3, front + 0.15]} />
      <Sign map={sign} w={Math.min(W - 1.5, 6)} h={1.3} position={[0, UNIT_H - 1.3, front + 0.32]} />
      <Part geometry={geo.box(Math.min(W - 2, 5), 3, 0.12)} color={WINDOW} outline={0.04} position={[0, 1.5, front + 0.06]} />
      <Part geometry={geo.box(Math.min(W - 1, 6), 0.2, 1.4)} color={u.color} outline={0.04} position={[0, 3.3, front + 0.7]} />
    </group>
  );
}

export function TrittonPark({ p, font }: Props) {
  const road = useSign("Tritton Road", "#2b2633", font);
  const coffee = useSign(TRITTON.pod.name, "#7a4a2e", font);
  const pod = TRITTON.pod;
  return (
    <group>
      {/* Tritton Road, south from the roundabout over the railway */}
      <group raycast={() => null}>
        <Flat w={R.pave * 2} d={R.z1 - R.z0} color={PAVE} x={X} z={(R.z0 + R.z1) / 2} y={0.012} />
        <Flat w={R.half * 2} d={R.z1 - R.z0} color={ROAD} x={X} z={(R.z0 + R.z1) / 2} y={0.022} />
        {DASHES.map((z) => (
          <Flat key={z} w={0.25} d={1.8} color={0xffd23f} x={X} z={z} y={0.05} />
        ))}
        {/* give way where it meets the roundabout */}
        {[-0.5, 0.5, 1.5, 2.5].map((x) => (
          <Flat key={x} w={0.6} d={0.2} color={0xf4f1ea} x={X + x} z={8.6} y={0.05} />
        ))}
      </group>
      <group position={[X + R.pave + 0.3, 0, 10]} rotation-y={Math.PI / 2}>
        <mesh geometry={geo.box(0.1, 2, 0.1)} material={toon(0x2b2633)} position-y={1} />
        <Sign map={road} w={2.6} h={0.55} position={[0, 2.2, 0.03]} />
        <Sign map={road} w={2.6} h={0.55} position={[0, 2.2, -0.03]} rotation-y={Math.PI} />
      </group>

      {/* the car park: tarmac from the road to the units, the pavement along their fronts and the walkway through the east
          row to the river, and the bays */}
      <group raycast={() => null}>
        <Flat w={-48 - (X + R.pave)} d={63 - 26} color={TARMAC} x={(-48 + X + R.pave) / 2} z={(26 + 63) / 2} y={0.015} />
        <Flat w={-38.5 - P.x0} d={2.6} color={PAVE} x={(-38.5 + P.x0) / 2} z={61.7} y={0.025} />
        <Flat w={1.8} d={60 - 26} color={PAVE} x={-48.9} z={(26 + 60) / 2} y={0.025} />
        <Flat w={-34.9 - -48} d={8} color={PAVE} x={(-34.9 + -48) / 2} z={43.5} y={0.025} />
        <Instances geometry={geo.box(0.12, 0.02, 5)} color={0xf4f1ea} list={BAY_LINES} />
      </group>
      {CARS.map((list, c) => (
        <group key={c} raycast={() => null}>
          <Instances geometry={geo.box(TRITTON_CAR.w, 0.7, TRITTON_CAR.len)} color={CAR_COLOURS[c]} list={carBits(list, 0.55, 0)} outline={0.05} />
          <Instances geometry={geo.box(TRITTON_CAR.w - 0.2, 0.55, 1.8)} color={WINDOW} list={carBits(list, 1.15, 0.25)} outline={0.04} />
        </group>
      ))}
      <group raycast={() => null}>
        <Instances geometry={geo.cyl(0.1, 0.12, 4, 8)} color={0x2b2633} list={POLES} outline={0.04} />
        <Instances geometry={geo.sphere(0.3)} color={LAMP} list={BULBS} outline={0.05} />
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
