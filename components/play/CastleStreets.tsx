"use client";

import { geo, LAMP } from "./toon";
import { BURTON, CASTLE_TERRACES, UNION, WESTGATE } from "./colliders";
import { Instances, NameSign, TerraceHouses, type Item } from "./SincilStreets";
import { Strip, groundY } from "./terrain";

// The streets round the castle (laid out in colliders.ts): Westgate along its north side from Bailgate, Union Road down
// its west side past The Lawn, and Burton Road north past Ellis Mill. Old stone, rendered and brick terraces line
// them, generic like the ones down by Sincil Bank, with no cards. Uphill, so everything follows the ground.
const PAVE = 0xe8dcc2;
const ROAD = 0x6b6573;
const POLE = 0x2b2633;
const WALLS = [0xcdb994, 0xf2ead8, 0xe6d3b0, 0xb5553a, 0xd9c7a0];

const W = WESTGATE,
  U = UNION,
  B = BURTON;
const wgLen = W.x1 - W.x0,
  uLen = U.z1 - U.z0,
  bLen = W.z - W.half - B.z0;

// lamps along Westgate's south side, clear of the corners, and up Union Road's east side
const LAMPS: [number, number][] = [
  ...Array.from({ length: Math.floor((W.x1 - W.x0 - 8) / 12) + 1 }, (_, i): [number, number] => [W.x0 + 6 + i * 12, W.z + W.half - 0.3]).filter(([x]) => Math.abs(x - U.x) > 4 && x < W.x1 - 3),
  ...[-138, -124, -112].map((z): [number, number] => [U.x + U.half - 0.3, z]),
];
const POLES = LAMPS.map(([x, z]): Item => ({ at: [x, groundY(z) + 1.6, z], rot: 0 }));
const BULBS = LAMPS.map(([x, z]): Item => ({ at: [x, groundY(z) + 3.3, z], rot: 0 }));

export default function CastleStreets({ font }: { font: string }) {
  return (
    <group raycast={() => null}>
      {/* Westgate, east to west, then Union Road and Burton Road off it */}
      <Strip w={wgLen} d={W.half * 2 + 0.8} color={PAVE} x={(W.x0 + W.x1) / 2} z={W.z} y={0.03} />
      <Strip w={wgLen} d={W.half * 2 - 0.6} color={ROAD} x={(W.x0 + W.x1) / 2 + 0.3} z={W.z} y={0.04} />
      <Strip w={U.half * 2 + 0.6} d={uLen} color={PAVE} x={U.x} z={(U.z0 + U.z1) / 2} y={0.032} />
      <Strip w={U.half * 2 - 0.6} d={uLen - 0.3} color={ROAD} x={U.x} z={(U.z0 + U.z1) / 2 - 0.15} y={0.042} />
      <Strip w={B.half * 2 + 0.8} d={bLen} color={PAVE} x={B.x} z={(B.z0 + W.z - W.half) / 2} y={0.034} />
      <Strip w={B.half * 2 - 0.6} d={bLen} color={ROAD} x={B.x} z={(B.z0 + W.z - W.half) / 2} y={0.044} />

      <TerraceHouses list={CASTLE_TERRACES} walls={WALLS} chimney={0x9c8f7a} />

      <Instances geometry={geo.cyl(0.1, 0.12, 3.2, 8)} color={POLE} list={POLES} outline={0.04} />
      <Instances geometry={geo.sphere(0.3)} color={LAMP} list={BULBS} outline={0.05} />

      <NameSign text="Westgate" font={font} x={W.x1 - 1.2} z={W.z + W.half + 0.3} rot={Math.PI / 2} />
      <NameSign text="Union Road" font={font} x={U.x + U.half + 0.4} z={W.z + W.half + 0.6} rot={0} />
      <NameSign text="Burton Road" font={font} x={B.x + B.half + 0.4} z={W.z - W.half - 0.3} rot={0} />
    </group>
  );
}
