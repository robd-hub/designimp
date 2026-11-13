"use client";

import type { Place } from "./places";
import { Part, geo, toon } from "./toon";
import { placeEvents } from "./store";
import { Sign, useSign } from "./MoreLandmarks";

type Props = { p: Place; font: string; reduce: boolean };

// The Architecture building, standing apart from the University's main building: stacked white rendered blocks with
// ribbon windows, a glazed ground floor on concrete columns, a grey block wall at one end and a white block at the other.
const WHITE = 0xf4f4f0;
const CONCRETE = 0x9fa3a8;
const GLASS = 0x3a4a5c;
const RIBBON = 0x6f8fab;
export function Architecture({ p, font }: Props) {
  const sign = useSign("ARCHITECTURE", "#2b2633", font);
  const hw = p.w / 2,
    hd = p.d / 2;
  // a block spanning the fraction a to b of the width
  const span = (a: number, b: number) => ({ x: -hw + (p.w * (a + b)) / 2, w: p.w * (b - a) });
  const wall = span(0, 0.32),
    glass = span(0.32, 0.78),
    end = span(0.78, 1),
    upper = span(0, 0.82),
    top = span(0.18, 0.7);
  return (
    <group position={[p.x, 0, p.z]} rotation-y={p.rot} {...placeEvents(p)}>
      {/* the ground floor: a grey block wall, a glazed hall on columns, and a white block at the end */}
      <Part geometry={geo.box(wall.w, 3, p.d - 1)} color={CONCRETE} outline={0.06} position={[wall.x, 1.5, 0]} />
      <Part geometry={geo.box(glass.w, 3, p.d - 1.4)} color={GLASS} outline={0.05} position={[glass.x, 1.5, 0]} />
      {[0.1, 0.3, 0.5, 0.7, 0.9].map((k) => (
        <Part key={k} geometry={geo.box(0.3, 3, 0.3)} color={CONCRETE} outline={0.03} position={[glass.x - glass.w / 2 + glass.w * k, 1.5, hd - 0.4]} />
      ))}
      <Part geometry={geo.box(end.w, 4.6, p.d * 0.85)} color={WHITE} outline={0.06} position={[end.x, 2.3, 0.4]} />
      {/* the long white block over it, with two ribbons of windows, and a smaller one set back on top */}
      <Part geometry={geo.box(upper.w + 0.4, 3.4, p.d)} color={WHITE} outline={0.06} position={[upper.x, 4.7, 0]} />
      {[4.1, 5.6].map((y) => (
        <mesh key={y} geometry={geo.box(upper.w * 0.9, 0.32, 0.06)} material={toon(RIBBON)} position={[upper.x, y, hd + 0.04]} />
      ))}
      <Part geometry={geo.box(top.w, 2.2, p.d * 0.62)} color={WHITE} outline={0.06} position={[top.x, 7.5, -hd * 0.3]} />
      <mesh geometry={geo.box(top.w * 0.8, 0.28, 0.06)} material={toon(RIBBON)} position={[top.x, 7.6, -hd * 0.3 + p.d * 0.31 + 0.04]} />
      {/* the name on the block wall */}
      <Sign map={sign} w={3.2} h={0.8} position={[wall.x, 1.7, (p.d - 1) / 2 + 0.04]} />
    </group>
  );
}
