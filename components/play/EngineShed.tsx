"use client";

import type { Place } from "./places";
import { Part, geo, toon, INK, WINDOW } from "./toon";
import { placeEvents } from "./store";
import { Sign, useSign } from "./MoreLandmarks";

type Props = { p: Place; font: string; reduce: boolean };

// ---------------------------------------------------------------------------------------------
// The Engine Shed, the Students' Union building: a modern dark glass box under a wide flat roof that overhangs
// all round, a big red box jutting out of the front with the name on it, tall glazing beside it, and a timber
// boardwalk in front.
const GLASS_DARK = 0x20252d;
const RED = 0xd0202e;
export function Venue({ p, font }: Props) {
  const sign = useSign("ENGINE SHED", "#d0202e", font);
  const front = p.d / 2;
  return (
    <group position={[p.x, 0, p.z]} rotation-y={p.rot} {...placeEvents(p)}>
      {/* the dark body, its glazing, and the flat roof overhanging it */}
      <Part geometry={geo.box(p.w, p.h, p.d)} color={GLASS_DARK} outline={0.06} position-y={p.h / 2} />
      <Part geometry={geo.box(p.w + 1.2, 0.3, p.d + 1.2)} color={0x2e3641} outline={0.05} position-y={p.h + 0.15} />
      <mesh geometry={geo.box(p.w * 0.45, 2.2, 0.06)} material={toon(0x7fa8c4)} position={[-p.w * 0.22, 3, front + 0.03]} />
      <mesh geometry={geo.box(p.w * 0.45, 1.2, 0.06)} material={toon(0x4a5c6e)} position={[-p.w * 0.22, 1.1, front + 0.03]} />
      <mesh geometry={geo.box(p.w * 0.2, 2.6, 0.06)} material={toon(0x4a5c6e)} position={[p.w * 0.4, 1.9, front + 0.03]} />
      {/* the red box standing out from the front, with a dark opening in it and the name beneath */}
      <Part geometry={geo.box(4, 3.1, 1.4)} color={RED} outline={0.05} position={[p.w * 0.1, 3, front + 0.5]} />
      <mesh geometry={geo.box(2.8, 1, 0.08)} material={toon(GLASS_DARK)} position={[p.w * 0.1, 3.9, front + 1.22]} />
      <Sign map={sign} w={3.2} h={0.8} position={[p.w * 0.1, 2.5, front + 1.24]} />
      {/* the entrance and a lamp post, and the boardwalk in front */}
      <mesh geometry={geo.box(2.2, 2.2, 0.06)} material={toon(WINDOW)} position={[p.w * 0.1, 1.1, front + 0.03]} />
      <mesh geometry={geo.box(0.06, 2.2, 0.08)} material={toon(INK)} position={[p.w * 0.1, 1.1, front + 0.07]} />
      <mesh geometry={geo.box(p.w, 0.1, 1.3)} material={toon(0xb59a78)} position={[0, 0.07, front + 0.9]} receiveShadow />
    </group>
  );
}
