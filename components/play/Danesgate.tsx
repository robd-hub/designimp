import { BailgateShop, type Look } from "./Bailgate";
import { DANESGATE, DANES_FRONTS } from "./colliders";
import { groundY, Strip } from "./terrain";
import { NamePlate } from "./Wharf";
import { usePlay } from "./store";

// Danesgate's shops and houses (laid out as DANESGATE and DANES_FRONTS in colliders.ts), each side listed from the
// top of the hill down; the alleys between runs are left out of the lists. Made-up names: these stand for the lane's independents, not any real one. The west side's
// To Let plot is a place of its own (tolet-danesgate), below the last of these.
const LOOKS: Record<number, Look[]> = {
  [-1]: [
    { name: "The Climbing Imp", kind: "pub", tudor: true, wall: 0xfaf3e3, front: 0x6b1f2a },
    { name: "Wren & Willow", kind: "shop", tudor: false, wall: 0xc9dbe8, front: 0x2f8f5b },
    { name: "Old Town Vinyl", kind: "shop", tudor: true, wall: 0xe8c36a, front: 0x2b2633 },
    { name: "Saltbox Deli", kind: "shop", tudor: false, wall: 0xa9553f, front: 0xffb627 },
    { name: "Hillside Pottery", kind: "shop", tudor: true, wall: 0xf2d6c4, front: 0x3fa7d6 },
    { name: "Kettle & Crumb", kind: "tea", tudor: false, wall: 0xf5dfa0, front: 0xd77a61 },
    { name: "Inkwell Gallery", kind: "shop", tudor: false, wall: 0xe8f0d8, front: 0x7a3b8f },
  ],
  [1]: [
    { name: "Bookworm & Co.", kind: "shop", tudor: false, wall: 0xa9553f, front: 0x1f2f5a },
    { name: "Thistle Tea Room", kind: "tea", tudor: true, wall: 0xfaf3e3, front: 0x9fc7b3 },
    { name: "Little Lantern Toys", kind: "shop", tudor: false, wall: 0xf2e2c4, front: 0xe03a3e },
    { name: "Ammonite & Amber", kind: "shop", tudor: true, wall: 0xe8c36a, front: 0x6b4426 },
    { name: "Fern & Fable", kind: "shop", tudor: false, wall: 0xc9dbe8, front: 0x2f8f5b },
    { name: "Steep Street Bakery", kind: "tea", tudor: true, wall: 0xf2d6c4, front: 0xffb627 },
    // lower down, older houses
    { name: "", kind: "house", tudor: false, wall: 0xa9553f, front: 0x1f4d3a },
    { name: "", kind: "house", tudor: true, wall: 0xfaf3e3, front: 0x2b59c3 },
    { name: "", kind: "house", tudor: false, wall: 0xf5dfa0, front: 0x6b1f2a },
    { name: "", kind: "house", tudor: false, wall: 0xe8f0d8, front: 0x2b2633 },
    { name: "", kind: "house", tudor: true, wall: 0xe8c36a, front: 0x7a3b8f },
  ],
};
const SETTS = 0xc4b597;

// Danesgate: the cobbled lane climbing the hill beside Steep Hill, from Clasketgate up to Castle Square.
export default function Danesgate({ font }: { font: string }) {
  const night = usePlay((s) => s.night);
  const D = DANESGATE;
  const len = D.z1 - D.z0;
  return (
    <group>
      <Strip w={2 * D.half} d={len} color={SETTS} x={D.x} z={(D.z0 + D.z1) / 2} y={0.05} />
      {[-1, 1].flatMap((side) =>
        DANES_FRONTS.filter((o) => o.side === side).map((o, i) => (
          <BailgateShop key={`${o.x},${o.z}`} at={{ x: o.x, z: o.z, w: o.len, d: o.deep, rot: (-side * Math.PI) / 2 }} look={LOOKS[side][i]} i={i} font={font} night={night} />
        )),
      )}
      <NamePlate text="Danesgate" font={font} position={[D.x + D.half + 0.8, groundY(D.z1 - 4), D.z1 - 4]} rot={-Math.PI / 2} />
    </group>
  );
}
