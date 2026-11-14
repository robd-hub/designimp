"use client";

import { geo, LAMP } from "./toon";
import { CLASKET, EAST_TERRACES, MONKS } from "./colliders";
import { Instances, NameSign, TerraceHouses, type Item } from "./SincilStreets";
import { Strip, groundY } from "./terrain";

// Clasketgate and Monks Road (laid out in colliders.ts): one straight road east off the High Street just north of
// the Stonebow, across Broadgate at the foot of Lindum Hill, and on out past the Arboretum's gates. Older rendered and
// brick buildings along Clasketgate, red-brick terraces along Monks Road; generic, with no cards.
const PAVE = 0xe8dcc2;
const ROAD = 0x6b6573;
const POLE = 0x2b2633;
const OLD_TOWN = [0xe6d3b0, 0xf2ead8, 0xc98f6e, 0xd8c3a0, 0xb5553a];
const CLASKET_HOUSES = EAST_TERRACES.filter((h) => h.x < CLASKET.x1);
const MONKS_HOUSES = EAST_TERRACES.filter((h) => h.x > MONKS.x0);

const LAMPS: [number, number][] = [
  ...Array.from({ length: Math.floor((CLASKET.x1 - CLASKET.x0) / 14) }, (_, i): [number, number] => [CLASKET.x0 + 9 + i * 14, CLASKET.z + (i % 2 ? 1 : -1) * (CLASKET.half + 0.1)]),
  ...Array.from({ length: Math.floor((MONKS.x1 - MONKS.x0) / 14) }, (_, i): [number, number] => [MONKS.x0 + 8 + i * 14, MONKS.z + CLASKET.half + 0.1]),
].filter(([x]) => Math.abs(x - 47) > 3);
const POLES = LAMPS.map(([x, z]): Item => ({ at: [x, groundY(z) + 1.6, z], rot: 0 }));
const BULBS = LAMPS.map(([x, z]): Item => ({ at: [x, groundY(z) + 3.3, z], rot: 0 }));

export default function EastStreets({ font }: { font: string }) {
  const C = CLASKET,
    M = MONKS;
  return (
    <group raycast={() => null}>
      <Strip w={C.x1 - C.x0} d={C.half * 2 + 0.8} color={PAVE} x={(C.x0 + C.x1) / 2} z={C.z} y={0.033} />
      <Strip w={C.x1 - C.x0} d={C.half * 2 - 0.6} color={ROAD} x={(C.x0 + C.x1) / 2} z={C.z} y={0.043} />
      <Strip w={M.x1 - M.x0} d={M.half * 2 + 0.8} color={PAVE} x={(M.x0 + M.x1) / 2} z={M.z} y={0.033} />
      <Strip w={M.x1 - M.x0} d={M.half * 2 - 0.6} color={ROAD} x={(M.x0 + M.x1) / 2} z={M.z} y={0.043} />

      <TerraceHouses list={CLASKET_HOUSES} walls={OLD_TOWN} chimney={0x9c8f7a} />
      <TerraceHouses list={MONKS_HOUSES} />

      <Instances geometry={geo.cyl(0.1, 0.12, 3.2, 8)} color={POLE} list={POLES} outline={0.04} />
      <Instances geometry={geo.sphere(0.3)} color={LAMP} list={BULBS} outline={0.05} />

      <NameSign text="Clasketgate" font={font} x={C.x0 + 3.4} z={C.z + C.half + 0.4} rot={0} />
      <NameSign text="Monks Road" font={font} x={M.x0 + 2} z={M.z + M.half + 0.5} rot={0} />
    </group>
  );
}
