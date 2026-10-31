"use client";

import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, type ThreeElements } from "@react-three/fiber";
import type { Place } from "./places";
import { footprint } from "./places";
import { Part, geo, toon, signTexture, INK, WINDOW, LAMP, STONE, STONE_DARK } from "./toon";
import { placeEvents } from "./store";
import { EXTRA_BOXES, seeded } from "./colliders";
import { groundY, groundTilt, Strip } from "./terrain";

type V3 = [number, number, number];
type Props = { p: Place; font: string; reduce: boolean };

// Height of the ground at a point dz along from a place's middle (in world z), relative to the middle,
// since Town has already lifted each place to the ground at its own z.
export const lift = (p: Place) => (dz: number) => groundY(p.z + dz) - groundY(p.z);

export function useSign(text: string, fg: string, font: string) {
  const sign = useMemo(() => signTexture(text, fg, font), [text, fg, font]);
  useEffect(() => () => sign.dispose(), [sign]);
  return sign;
}

export function Sign({ map, w, h, ...g }: { map: THREE.Texture; w: number; h: number } & Omit<ThreeElements["mesh"], "children">) {
  return (
    <mesh {...g}>
      <planeGeometry args={[w, h]} />
      <meshBasicMaterial map={map} toneMapped={false} />
    </mesh>
  );
}

// Lots of one small part in one draw call: each is [position, rotation?, scale?].
export type Inst = { at: V3; rot?: V3; scale?: V3; color?: number };
export function Many({ geometry, color, list, glow = false }: { geometry: THREE.BufferGeometry; color: number; list: Inst[]; glow?: boolean }) {
  const ref = useRef<THREE.InstancedMesh>(null!);
  const material = useMemo(() => (glow ? new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false }) : null), [glow]);
  useEffect(() => () => material?.dispose(), [material]);
  useLayoutEffect(() => {
    const m = new THREE.Object3D();
    const c = new THREE.Color();
    list.forEach((it, i) => {
      m.position.set(...it.at);
      m.rotation.set(...(it.rot ?? [0, 0, 0]));
      m.scale.set(...(it.scale ?? [1, 1, 1]));
      m.updateMatrix();
      ref.current.setMatrixAt(i, m.matrix);
      if (glow) ref.current.setColorAt(i, c.setHex(it.color ?? color));
    });
    ref.current.instanceMatrix.needsUpdate = true;
    if (ref.current.instanceColor) ref.current.instanceColor.needsUpdate = true;
    ref.current.computeBoundingSphere();
  }, [list, glow, color]);
  return <instancedMesh key={list.length} ref={ref} args={[geometry, material ?? toon(color), list.length]} castShadow={!glow} receiveShadow={!glow} />;
}

// A triangular prism for a pitched roof: span across, rise to the ridge, len along the ridge (local x).
export function useRoof(span: number, rise: number, len: number) {
  const g = useMemo(() => {
    const shape = new THREE.Shape([new THREE.Vector2(-span / 2, 0), new THREE.Vector2(span / 2, 0), new THREE.Vector2(0, rise)]);
    const out = new THREE.ExtrudeGeometry(shape, { depth: len, bevelEnabled: false }).translate(0, 0, -len / 2).rotateY(Math.PI / 2);
    out.computeBoundingBox();
    return out;
  }, [span, rise, len]);
  useEffect(() => () => g.dispose(), [g]);
  return g;
}

// ---------------------------------------------------------------------------------------------
// Ellis Mill: a tarred brick tower mill with a white ogee cap, four sails facing the door and a
// fantail behind keeping them to the wind. The sails turn slowly, unless motion is reduced.
const TAR = 0x34302e;
const CAP = 0xfff8e7;
const SAIL = 0xe8dcc2;
const MILL_WOOD = 0x5a3a22;
export function Mill({ p, font, reduce }: Props) {
  const sign = useSign(p.name, "#2b2633", font);
  const sails = useRef<THREE.Group>(null!);
  const fan = useRef<THREE.Group>(null!);
  useFrame((_, dt) => {
    if (reduce) return;
    sails.current.rotation.z -= dt * 0.45;
    fan.current.rotation.x += dt * 0.9;
  });
  const H = p.h,
    RB = 2.7,
    RT = 1.8;
  const r = (y: number) => RB - ((RB - RT) * y) / H;
  return (
    <group position={[p.x, 0, p.z]} rotation-y={p.rot} {...placeEvents(p)}>
      {/* a little plinth so the tower sits into the ground on the slope */}
      <Part geometry={geo.cyl(RB + 0.2, RB + 0.3, 0.8, 16)} color={STONE_DARK} outline={0.05} position-y={-0.2} />
      <Part geometry={geo.cyl(RT, RB, H, 16)} color={TAR} position-y={H / 2} />
      {/* door, windows and the name over the door */}
      <Part geometry={geo.box(1, 1.9, 0.3)} color={0x8a5a32} outline={0.03} position={[0, 0.95, r(0.95) - 0.05]} />
      <Sign map={sign} w={2} h={0.5} position={[0, 2.35, r(2.35) + 0.02]} rotation-x={Math.atan((RB - RT) / H)} />
      {[3.6, 5.6].map((wy, i) => (
        <Part key={wy} geometry={geo.box(0.55, 0.8, 0.2)} color={WINDOW} outline={0.03} position={[i ? -0.5 : 0.5, wy, r(wy) - 0.02]} />
      ))}
      <Part geometry={geo.box(0.55, 0.8, 0.2)} color={WINDOW} outline={0.03} position={[r(4.4) - 0.02, 4.4, 0]} rotation-y={Math.PI / 2} />
      <Part geometry={geo.box(0.55, 0.8, 0.2)} color={WINDOW} outline={0.03} position={[-r(4.8) + 0.02, 4.8, 0]} rotation-y={Math.PI / 2} />
      {/* the ogee cap, its finial, and the fantail on a frame out the back */}
      <Part geometry={geo.cyl(RT + 0.25, RT + 0.25, 0.35, 16)} color={CAP} outline={0.04} position-y={H + 0.15} />
      <Part geometry={geo.dome(RT + 0.2)} color={CAP} position-y={H + 0.3} scale={[1, 1.3, 1]} />
      <Part geometry={geo.sphere(0.32, 10, 8)} color={CAP} outline={0.04} position-y={H + 0.3 + (RT + 0.2) * 1.3 + 0.2} />
      <group position={[0, H + 0.4, -RT - 0.4]}>
        <Part geometry={geo.box(0.12, 1.6, 0.12)} color={MILL_WOOD} outline={0.02} position={[0, 0.6, -0.4]} rotation-x={0.5} />
        <group ref={fan} position={[0, 1.3, -0.9]}>
          {Array.from({ length: 6 }, (_, i) => (
            <group key={i} rotation-x={(i * Math.PI) / 3}>
              <Part geometry={geo.box(0.04, 0.9, 0.28)} color={CAP} outline={0.02} position-y={0.45} />
            </group>
          ))}
        </group>
      </group>
      {/* the four sails on their windshaft, out front over the door */}
      <group position={[0, H - 0.4, RT + 0.85]}>
        <Part geometry={geo.cyl(0.18, 0.18, 1.2, 10)} color={MILL_WOOD} outline={0.03} position-z={-0.5} rotation-x={Math.PI / 2} />
        <group ref={sails}>
          <Part geometry={geo.sphere(0.32, 10, 8)} color={MILL_WOOD} outline={0.03} />
          {[0, 1, 2, 3].map((i) => (
            <group key={i} rotation-z={(i * Math.PI) / 2 + Math.PI / 4}>
              <Part geometry={geo.box(0.18, 5.6, 0.14)} color={MILL_WOOD} outline={0.03} position-y={2.8} />
              {/* the lattice: a light frame with three cross bars */}
              <Part geometry={geo.box(1.15, 4.2, 0.06)} color={SAIL} outline={0.03} position={[0.68, 3.35, 0.02]} />
              {[1.9, 3.35, 4.8].map((y) => (
                <mesh key={y} geometry={geo.box(1.15, 0.07, 0.1)} material={toon(MILL_WOOD)} position={[0.68, y, 0.04]} />
              ))}
            </group>
          ))}
        </group>
      </group>
      {/* an old millstone propped by the door */}
      <Part geometry={geo.cyl(0.75, 0.75, 0.25, 16)} color={0x9d968a} outline={0.03} position={[1.9, 0.75, 2.2]} rotation={[Math.PI / 2, 0, 0.5]} />
    </group>
  );
}

// ---------------------------------------------------------------------------------------------
// The Arboretum: a railed Victorian park on the hillside, with its gates on the west side, a path in
// past the stone lion to the octagonal bandstand, a pond and plenty of trees. Drawn in world axes
// (its lawn follows the slope, which only runs north-south), with its gates facing the door.
const RAIL_GREEN = 0x2f4a3a;
const LAWN = 0x7cc46a;
const GRAVEL = 0xe0d2b4;
export function Park({ p, font }: Props) {
  const sign = useSign(p.name, "#2f4a3a", font);
  const y = lift(p);
  const f = footprint(p);
  const hw = (f.x1 - f.x0) / 2,
    hd = (f.z1 - f.z0) / 2;
  const GATE = 1.8; // half the width of the gateway in the west railings
  const { posts, rails } = useMemo(() => {
    const posts: Inst[] = [],
      rails: Inst[] = [];
    const add = (x: number, z: number, along: "x" | "z") => {
      posts.push({ at: [x, y(z) + 0.55, z] });
      if (along === "x") rails.push({ at: [x + 0.5, y(z) + 1.05, z], scale: [1, 1, 1] });
      else rails.push({ at: [x, y(z + 0.5) + 1.05, z + 0.5], rot: [groundTilt(p.z + z + 0.5), Math.PI / 2, 0] });
    };
    for (let x = -hw; x < hw; x += 1) {
      add(x, -hd, "x");
      add(x, hd, "x");
    }
    for (let z = -hd; z < hd; z += 1) {
      if (Math.abs(z + 0.5) > GATE) add(-hw, z, "z");
      add(hw, z, "z");
    }
    return { posts, rails };
  }, [p]); // eslint-disable-line react-hooks/exhaustive-deps
  const trees = useMemo(() => {
    const rand = seeded(73);
    const out: { x: number; z: number; s: number }[] = [];
    const clear = (x: number, z: number) =>
      Math.hypot(x - 2.5, z + 2.5) > 4.2 && Math.hypot(x - 3.5, z - 5.5) > 3.6 && Math.abs(z) > 1.8 && Math.abs(x - 2.5) > 1.6 && !(x < -2 && Math.abs(z - 2.6) < 2);
    for (let tries = 0; out.length < Math.round((hw * hd) / 6) && tries < 1200; tries++) {
      const x = -hw + 1.6 + rand() * (2 * hw - 3.2),
        z = -hd + 1.6 + rand() * (2 * hd - 3.2);
      if (!clear(x, z) || out.some((t) => Math.hypot(t.x - x, t.z - z) < 3)) continue;
      out.push({ x, z, s: 0.8 + rand() * 0.6 });
    }
    return out;
  }, [hw, hd]);
  const trunks = useMemo(() => trees.map((t) => ({ at: [t.x, y(t.z) + 0.8 * t.s, t.z] as V3, scale: [t.s, t.s, t.s] as V3 })), [trees]); // eslint-disable-line react-hooks/exhaustive-deps
  const crowns = useMemo(() => trees.map((t, i) => ({ at: [t.x, y(t.z) + 2.3 * t.s, t.z] as V3, scale: [t.s, t.s * (i % 3 ? 1 : 1.35), t.s] as V3 })), [trees]); // eslint-disable-line react-hooks/exhaustive-deps
  const band = { x: 2.5, z: -2.5 },
    lion = { x: -3.5, z: 2.6 },
    pond = { x: 3.5, z: 5.5 };
  return (
    <group position={[p.x, 0, p.z]} {...placeEvents(p)}>
      <Strip w={2 * hw} d={2 * hd} color={LAWN} y={0.03} wz={p.z} />
      {/* gravel paths: in from the gates, and across the park north to south */}
      <Strip w={hw + 2.5} d={1.6} color={GRAVEL} x={(-hw + 2.5) / 2} y={0.06} wz={p.z} />
      <Strip w={1.6} d={2 * hd - 0.6} color={GRAVEL} x={2.5} y={0.05} wz={p.z} />
      <Many geometry={geo.box(0.12, 1.1, 0.12)} color={RAIL_GREEN} list={posts} />
      <Many geometry={geo.box(1, 0.08, 0.08)} color={RAIL_GREEN} list={rails} />
      {/* stone gate piers with the name on an iron arch between them */}
      {[-1, 1].map((s) => (
        <Part key={s} geometry={geo.box(0.7, 2.4, 0.7)} color={STONE} outline={0.04} position={[-hw, y(s * GATE) + 1.1, s * (GATE + 0.2)]} />
      ))}
      <Part geometry={geo.box(0.14, 0.14, 2 * GATE + 0.8)} color={RAIL_GREEN} outline={0.02} position={[-hw, y(0) + 2.9, 0]} />
      <Sign map={sign} w={3} h={0.75} position={[-hw - 0.09, y(0) + 2.45, 0]} rotation-y={-Math.PI / 2} />
      {/* the octagonal bandstand */}
      <group position={[band.x, y(band.z), band.z]}>
        <Part geometry={geo.cyl(2.2, 2.35, 1, 8)} color={STONE} outline={0.05} position-y={0.1} />
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i * Math.PI) / 4 + Math.PI / 8;
          return <mesh key={i} geometry={geo.cyl(0.08, 0.08, 2.1, 6)} material={toon(0xf2ead8)} position={[Math.sin(a) * 1.9, 1.65, Math.cos(a) * 1.9]} />;
        })}
        <Part geometry={geo.cyl(2.45, 2.45, 0.25, 8)} color={0xf2ead8} outline={0.04} position-y={2.75} />
        <Part geometry={geo.cone(2.5, 1.4, 8)} color={0x2f6d55} outline={0.05} position-y={3.55} />
        <Part geometry={geo.sphere(0.2, 8, 6)} color={0xc8973a} outline={0.03} position-y={4.35} />
      </group>
      {/* the stone lion on his plinth, looking out towards the gates */}
      <group position={[lion.x, y(lion.z), lion.z]} rotation-y={-Math.PI / 2}>
        <Part geometry={geo.box(1.3, 1.3, 2.3)} color={STONE_DARK} outline={0.04} position-y={0.45} />
        <group position-y={1.1}>
          <Part geometry={geo.box(0.8, 0.55, 1.6)} color={STONE} outline={0.04} position={[0, 0.3, -0.1]} />
          <Part geometry={geo.sphere(0.5, 12, 10)} color={STONE_DARK} outline={0.04} position={[0, 0.75, 0.65]} />
          <Part geometry={geo.sphere(0.32, 10, 8)} color={STONE} outline={0.03} position={[0, 0.8, 0.98]} />
          <Part geometry={geo.box(0.7, 0.25, 0.5)} color={STONE} outline={0.03} position={[0, 0.12, 1]} />
          <mesh geometry={geo.box(0.08, 0.08, 0.6)} material={toon(STONE_DARK)} position={[0.3, 0.45, -1]} rotation-x={0.6} />
        </group>
      </group>
      {/* the pond, with a stone kerb */}
      <group position={[pond.x, y(pond.z), pond.z]} rotation-x={groundTilt(p.z + pond.z)} scale={[1.25, 1, 0.85]}>
        <Part geometry={geo.cyl(2.3, 2.3, 0.2, 20)} color={STONE_DARK} outline={0.03} position-y={0.05} />
        <mesh geometry={geo.cyl(2, 2, 0.2, 20)} material={toon(0x3aa6e8)} position-y={0.09} />
      </group>
      <Many geometry={geo.cyl(0.18, 0.24, 1.6, 6)} color={0x6b4a2e} list={trunks} />
      <Many geometry={geo.sphere(1.25, 10, 8)} color={0x3f8f3a} list={crowns} />
    </group>
  );
}

// ---------------------------------------------------------------------------------------------
// The Christmas market, in December: a row of wooden chalets with snowy roofs along the north side of
// Castle Square, with a big tree behind them.
const CHALET = 0x8a5a32;
const SNOW = 0xfafafa;
const GOODS = [0xd0202e, 0xf2d06b, 0x2f6d55, 0xfff8e7, 0x9b5de5];
const BULBS = [0xff4d4d, 0xffd84d, 0x6dff8a, 0xfff1a8];
export function Market({ p, font }: Props) {
  const sign = useSign("Christmas Market", "#a01a24", font);
  const roof = useRoof(2.9, 1, 3.4);
  const y = lift(p);
  // as many chalets as fit, each a touch narrower when the row is short
  const n = Math.round(p.w / 3.2),
    gap = p.w / n,
    fit = Math.min(1, (gap - 0.05) / 3.2);
  const xs = useMemo(() => Array.from({ length: n }, (_, i) => -p.w / 2 + gap * (i + 0.5)), [p.w, gap, n]);
  const TREE = { x: 0, z: -3.8 };
  // solid while it's in town: the row of chalets and the tree behind
  useEffect(() => {
    const f = footprint(p);
    EXTRA_BOXES.set(p.id, { x0: f.x0 - 0.4, x1: f.x1 + 0.4, z0: f.z0 - 0.4, z1: f.z1 + 0.4 });
    const tx = p.x + Math.sin(p.rot) * TREE.z,
      tz = p.z + Math.cos(p.rot) * TREE.z;
    EXTRA_BOXES.set(`${p.id}-tree`, { x0: tx - 1.4, x1: tx + 1.4, z0: tz - 1.4, z1: tz + 1.4 });
    return () => {
      EXTRA_BOXES.delete(p.id);
      EXTRA_BOXES.delete(`${p.id}-tree`);
    };
  }, [p, TREE.z]);
  const lights = useMemo(
    () => xs.flatMap((x, c) => Array.from({ length: 7 }, (_, i) => ({ at: [x + (-1.5 + i * 0.5) * fit, 2.25 - Math.sin((i / 6) * Math.PI) * 0.12, 1.35] as V3, color: BULBS[(i + c) % BULBS.length] }))),
    [xs, fit],
  );
  const baubles = useMemo(() => {
    const out: Inst[] = [];
    const rand = seeded(5);
    for (let i = 0; i < 26; i++) {
      const t = 0.15 + rand() * 0.75,
        a = rand() * Math.PI * 2,
        r = (1 - t) * 2.3 + 0.15;
      out.push({ at: [Math.sin(a) * r, 0.9 + t * 6.2, Math.cos(a) * r], color: BULBS[i % BULBS.length] });
    }
    return out;
  }, []);
  return (
    <group position={[p.x, 0, p.z]} rotation-y={p.rot} {...placeEvents(p)}>
      {xs.map((x, i) => (
        <group key={x} position={[x, y(0), 0]} scale-x={fit}>
          <Part geometry={geo.box(3.2, 2.2, 2.4)} color={CHALET} position={[0, 1.1, -0.1]} />
          <Part geometry={roof} color={SNOW} position-y={2.2} />
          {/* the counter and its goods, under the open shutter */}
          <mesh geometry={geo.box(2.6, 1.1, 0.06)} material={toon(0x3a2418)} position={[0, 1.55, 1.12]} />
          <Part geometry={geo.box(3, 0.9, 0.45)} color={0xb98552} outline={0.03} position={[0, 0.45, 1.25]} />
          {[-0.9, -0.3, 0.3, 0.9].map((gx, j) => (
            <Part key={gx} geometry={geo.box(0.4, 0.28, 0.3)} color={GOODS[(i + j) % GOODS.length]} outline={0.02} position={[gx, 1.04, 1.25]} />
          ))}
          <Part geometry={geo.box(3.3, 0.12, 0.7)} color={i % 2 ? 0xd0202e : 0x2f6d55} outline={0.03} position={[0, 2.25, 1.45]} rotation-x={0.3} />
        </group>
      ))}
      <Many geometry={geo.sphere(0.07, 6, 4)} color={LAMP} list={lights} glow />
      <Sign map={sign} w={3.4} h={0.85} position={[0, y(0) + 3.9, 0.3]} />
      <mesh geometry={geo.box(0.1, 1.4, 0.1)} material={toon(INK)} position={[0, y(0) + 3.1, 0.25]} />
      {/* the tree */}
      <group position={[TREE.x, y(Math.cos(p.rot) * TREE.z), TREE.z]}>
        <mesh geometry={geo.cyl(0.3, 0.4, 1.2, 8)} material={toon(0x6b4a2e)} position-y={0.6} />
        {[0, 1, 2].map((i) => (
          <Part key={i} geometry={geo.cone(2.4 - i * 0.65, 2.8, 10)} color={0x2f6d45} outline={0.05} position-y={2.1 + i * 1.9} />
        ))}
        <Part geometry={geo.sphere(0.32, 8, 6)} color={0xffd84d} outline={0.03} position-y={7.6} />
        <Many geometry={geo.sphere(0.14, 8, 6)} color={LAMP} list={baubles} glow />
      </group>
    </group>
  );
}

