"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import type { Place } from "./places";
import { Part, geo, WINDOW, STONE } from "./toon";
import { placeEvents } from "./store";
import { EXTRA_BOXES } from "./colliders";
import { Strip } from "./terrain";
import { Many, Sign, lift, useRoof, useSign, type Inst } from "./MoreLandmarks";

type Props = { p: Place; font: string; reduce: boolean };
type V3 = [number, number, number];

// The Lawn on Union Road, west of the castle: a hedged green with a gateway on the south side, the pale Georgian main
// building along the north side with a columned porch, and the glass conservatory beside it with palms inside. Drawn
// without a photo to go on, so the shapes are generic. Laid out in the place's own coordinates, front (the gate) at +z.
const RENDER = 0xf2ead8;
const SLATE = 0x5b6470;
const HEDGE = 0x3f8f3a;
const PATH = 0xe8dcc2;
const MAIN = { x: 0, z: -6, w: 12, d: 6, h: 5.2 }; // the main building
const GLASS = { x: 9.5, z: -4, w: 6, d: 6, h: 4 }; // the conservatory
const TREES: [number, number][] = [
  [-11, 1],
  [-8, 7],
  [5, 6],
  [10.5, 5],
  [-11.5, -8],
];
const PALMS: [number, number][] = [
  [-1.4, -1.4],
  [1.2, 0.8],
  [0, 1.8],
];

export function Lawn({ p, font }: Props) {
  const sign = useSign(p.name, "#2f4a3a", font);
  const y = lift(p);
  const hw = p.w / 2,
    hd = p.d / 2;
  const roof = useRoof(MAIN.d + 0.4, 1.6, MAIN.w + 0.4);
  const pediment = useRoof(4.6, 1.1, 1.4);
  const glassRoof = useRoof(GLASS.d + 0.2, 2, GLASS.w + 0.2);
  const glass = useMemo(() => new THREE.MeshToonMaterial({ color: 0xbfe8f0, transparent: true, opacity: 0.45, depthWrite: false }), []);
  useEffect(() => () => glass.dispose(), [glass]);

  // the main building and the conservatory are solid; the green, its hedges and trees are open to walk round
  useEffect(() => {
    const box = (b: { x: number; z: number; w: number; d: number }, front = 0) => ({ x0: p.x + b.x - b.w / 2, x1: p.x + b.x + b.w / 2, z0: p.z + b.z - b.d / 2, z1: p.z + b.z + b.d / 2 + front });
    EXTRA_BOXES.set(`${p.id}-main`, box(MAIN, 1.4)); // and its porch
    EXTRA_BOXES.set(`${p.id}-glass`, box(GLASS));
    return () => {
      EXTRA_BOXES.delete(`${p.id}-main`);
      EXTRA_BOXES.delete(`${p.id}-glass`);
    };
  }, [p]);

  // the hedges round the edge, in short lengths so they follow the slope, with a gap for the gate on the south side
  const hedges = useMemo(() => {
    const out: Inst[] = [];
    for (let x = -hw + 1; x < hw; x += 2) out.push({ at: [x, y(-hd + 0.3) + 0.4, -hd + 0.3] });
    for (let x = -hw + 1; x < hw; x += 2) if (Math.abs(x) > 2.5) out.push({ at: [x, y(hd - 0.3) + 0.4, hd - 0.3] });
    for (let z = -hd + 1; z < hd; z += 2) for (const x of [-hw + 0.3, hw - 0.3]) out.push({ at: [x, y(z) + 0.4, z], rot: [0, Math.PI / 2, 0] });
    return out;
  }, [hw, hd]); // eslint-disable-line react-hooks/exhaustive-deps
  const trunks = useMemo(() => TREES.map(([x, z]) => ({ at: [x, y(z) + 0.8, z] as V3 })), []); // eslint-disable-line react-hooks/exhaustive-deps
  const crowns = useMemo(() => TREES.map(([x, z], i) => ({ at: [x, y(z) + 2.3, z] as V3, scale: [1, i % 2 ? 1 : 1.3, 1] as V3 })), []); // eslint-disable-line react-hooks/exhaustive-deps

  const my = y(MAIN.z),
    front = MAIN.z + MAIN.d / 2;
  const gy = y(GLASS.z);
  return (
    // only the gate, the sign and the buildings open The Lawn's card, so a click on the grass walks onto the green
    <group position={[p.x, 0, p.z]} rotation-y={p.rot}>
      <Strip w={p.w} d={p.d} color={0x6cc86a} wz={p.z} y={0.04} />
      {/* paths: in from the gate to the porch, and across to the conservatory */}
      <Strip w={2} d={hd - front} color={PATH} x={0} z={(hd + front) / 2} wz={p.z} y={0.06} />
      <Strip w={GLASS.x - 1} d={1.4} color={PATH} x={(GLASS.x + 1) / 2} z={0.2} wz={p.z} y={0.06} />
      <Many geometry={geo.box(2, 0.8, 0.6)} color={HEDGE} list={hedges} />
      <group {...placeEvents(p)}>
        {[-2.3, 2.3].map((x) => (
          <Part key={x} geometry={geo.box(0.5, 1.4, 0.5)} color={STONE} outline={0.04} position={[x, y(hd - 0.3) + 0.7, hd - 0.3]} />
        ))}
        <group position={[0, y(hd - 0.3), hd - 0.3]}>
          <Sign map={sign} w={3.2} h={0.8} position={[0, 1.6, 0.3]} />
        </group>

        {/* the main building: two storeys of pale render under a slate roof, rows of sash windows, and a porch of four
            columns with a pediment over the door */}
        <group position={[MAIN.x, my, MAIN.z]}>
          <Part geometry={geo.box(MAIN.w, MAIN.h, MAIN.d)} color={RENDER} outline={0.08} position-y={MAIN.h / 2} />
          <Part geometry={roof} color={SLATE} outline={0.06} position-y={MAIN.h} />
          {[1.6, 3.7].flatMap((wy) =>
            [-5, -3.7, 3.7, 5].map((wx) => <Part key={`${wx}${wy}`} geometry={geo.box(0.8, 1.1, 0.08)} color={WINDOW} outline={0.03} position={[wx, wy, MAIN.d / 2 + 0.04]} />),
          )}
          <Part geometry={geo.box(1.2, 2.2, 0.1)} color={0x2b2633} outline={0.03} position={[0, 1.1, MAIN.d / 2 + 0.05]} />
        </group>
        <group position={[MAIN.x, y(front + 0.8), front + 0.8]}>
          {[-1.8, -0.6, 0.6, 1.8].map((x) => (
            <Part key={x} geometry={geo.cyl(0.22, 0.25, 3.8, 10)} color={0xfaf6ec} outline={0.03} position={[x, 1.9, 0]} />
          ))}
          <Part geometry={geo.box(4.6, 0.45, 1.4)} color={RENDER} outline={0.04} position={[0, 4, -0.1]} />
          <group position={[0, 4.22, -0.1]} rotation-y={Math.PI / 2}>
            <Part geometry={pediment} color={RENDER} outline={0.04} />
          </group>
        </group>

        {/* the conservatory: a glasshouse on white frames with palms showing through */}
        <group position={[GLASS.x, gy, GLASS.z]}>
          <mesh geometry={geo.box(GLASS.w, GLASS.h, GLASS.d)} material={glass} position-y={GLASS.h / 2} />
          <mesh geometry={glassRoof} material={glass} position-y={GLASS.h} />
          {[-1, 0, 1].flatMap((i) =>
            [-1, 1].map((s) => <Part key={`${i}${s}`} geometry={geo.box(0.14, GLASS.h, 0.14)} color={0xffffff} outline={0.02} position={[(i * GLASS.w) / 2, GLASS.h / 2, (s * GLASS.d) / 2]} />),
          )}
          {[-1, 1].map((s) => (
            <Part key={s} geometry={geo.box(GLASS.w + 0.1, 0.16, 0.16)} color={0xffffff} outline={0.02} position={[0, GLASS.h, (s * GLASS.d) / 2]} />
          ))}
          <Part geometry={geo.box(1.3, 2.3, 0.1)} color={0xffffff} outline={0.03} position={[0, 1.15, GLASS.d / 2 + 0.05]} />
          {PALMS.map(([x, z]) => (
            <group key={`${x}${z}`} position={[x, 0, z]}>
              <Part geometry={geo.cyl(0.12, 0.17, 2.6, 8)} color={0x7a5a3a} outline={0.03} position-y={1.3} />
              <Part geometry={geo.sphere(0.9, 10, 6)} color={0x2f8f45} outline={0.03} position-y={2.8} scale={[1.5, 0.4, 1.5]} />
            </group>
          ))}
        </group>

      </group>

      {/* trees on the green */}
      <Many geometry={geo.cyl(0.18, 0.24, 1.6, 6)} color={0x6b4a2e} list={trunks} />
      <Many geometry={geo.sphere(1.25, 10, 8)} color={0x3f8f3a} list={crowns} />
    </group>
  );
}
