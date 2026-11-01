"use client";

import type { Place } from "./places";
import { Part, geo, toon, INK, WINDOW } from "./toon";
import { placeEvents } from "./store";
import { Sign, useRoof, useSign } from "./MoreLandmarks";

type Props = { p: Place; font: string; reduce: boolean };

// The two campus buildings that stand beside the University of Lincoln, between it and the University Bridge.

// ---------------------------------------------------------------------------------------------
// The Engine Shed: a Victorian brick railway shed with a slate roof and smoke vents along its
// ridge, arched windows, gig posters, and a modern glass entrance with the name over it.
const POSTERS = [0xd0202e, 0xf2d06b, 0x5bc0eb, 0x9b5de5, 0xf15bb5, 0x00bb77];
export function Venue({ p, font }: Props) {
  const sign = useSign("ENGINE SHED", "#1a1320", font);
  const roof = useRoof(p.d + 0.7, 1.9, p.w + 0.5);
  const vent = useRoof(1.6, 0.5, 1.5);
  const front = p.d / 2;
  const windows = [-4.1, -2.9, 2.9, 4.1];
  return (
    <group position={[p.x, 0, p.z]} rotation-y={p.rot} {...placeEvents(p)}>
      <Part geometry={geo.box(p.w, p.h, p.d)} color={p.wall} position-y={p.h / 2} />
      {/* a pale brick band and the slate roof, with its row of smoke vents */}
      <mesh geometry={geo.box(p.w + 0.05, 0.25, p.d + 0.05)} material={toon(0xd9b48f)} position-y={p.h - 0.4} />
      <Part geometry={roof} color={p.roof} position-y={p.h} />
      {[-3, 0, 3].map((x) => (
        <group key={x} position={[x, p.h + 1.75, 0]}>
          <Part geometry={geo.box(1.2, 0.5, 1.1)} color={0x3b3f46} outline={0.03} position-y={0.25} />
          <Part geometry={vent} color={p.roof} outline={0.03} position-y={0.5} />
        </group>
      ))}
      {/* arched windows down the front, a pair each side of the doors */}
      {windows.map((x) => (
        <group key={x} position={[x, 2.2, front + 0.03]}>
          <mesh geometry={geo.box(0.9, 1.5, 0.06)} material={toon(WINDOW)} />
          <mesh geometry={geo.cyl(0.45, 0.45, 0.06, 14)} material={toon(WINDOW)} position-y={0.75} rotation-x={Math.PI / 2} />
          <mesh geometry={geo.box(1.1, 0.12, 0.12)} material={toon(0xd9b48f)} position-y={-0.8} />
        </group>
      ))}
      {/* gig posters beneath them */}
      {windows.map((x, i) => (
        <Part key={x} geometry={geo.box(0.75, 1.05, 0.05)} color={POSTERS[i % POSTERS.length]} outline={0.02} position={[x, 0.95, front + 0.04]} />
      ))}
      {/* the glass entrance block, its canopy and the name above */}
      <Part geometry={geo.box(3.4, 3, 0.9)} color={0x2b2633} outline={0.04} position={[0, 1.5, front + 0.35]} />
      <mesh geometry={geo.box(3, 2.6, 0.06)} material={toon(WINDOW)} position={[0, 1.4, front + 0.82]} />
      <mesh geometry={geo.box(0.06, 2.6, 0.08)} material={toon(INK)} position={[0, 1.4, front + 0.84]} />
      <Sign map={sign} w={4} h={1} position={[0, p.h - 0.85, front + 0.04]} />
    </group>
  );
}

// ---------------------------------------------------------------------------------------------
// The University Library, a restored Victorian railway warehouse: a long brick shed with arched
// windows and a pitched roof, its name over the door.
const BRICK = 0xb5543a;
const BRICK_DARK = 0x8f3f2c;
export function Library({ p, font }: Props) {
  const sign = useSign("University Library", "#7a1f3d", font);
  return (
    <group position={[p.x, 0, p.z]} rotation-y={p.rot} {...placeEvents(p)}>
      <Part geometry={geo.box(8, 4.4, 5.6)} color={BRICK} outline={0.08} position-y={2.2} />
      <group position-y={4.4} rotation-y={Math.PI / 2}>
        <Part geometry={geo.cyl(3.4, 3.4, 8.2, 3)} color={0x4a4f5c} outline={0.06} rotation-x={-Math.PI / 2} scale={[1, 1, 0.38]} position-y={0.6} />
      </group>
      {[-2.7, -0.9, 0.9, 2.7].map((x) => (
        <group key={x} position={[x, 0, 2.85]}>
          <Part geometry={geo.box(1, 1.6, 0.1)} color={WINDOW} outline={0.03} position-y={2.3} />
          <Part geometry={geo.cyl(0.5, 0.5, 0.1, 12)} color={WINDOW} outline={0.03} position-y={3.1} rotation-x={Math.PI / 2} />
        </group>
      ))}
      <Part geometry={geo.box(8.3, 0.3, 5.9)} color={BRICK_DARK} outline={0.04} position-y={1.1} />
      <Part geometry={geo.box(1.4, 2.2, 0.1)} color={0x2b2633} outline={0.03} position={[0, 1.1, 3]} />
      <Sign map={sign} w={3.4} h={0.7} position={[0, 4.0, 2.84]} />
    </group>
  );
}
