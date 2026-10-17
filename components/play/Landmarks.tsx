import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import type { Place } from "./places";
import { Part, geo, toon, signTexture, WINDOW } from "./toon";
import { placeClick } from "./store";
import { POOL, STREET_ROW, seeded } from "./colliders";

const CASTLE_STONE = 0xb8a98a;
const CASTLE_DARK = 0x9c8d6e;

function Crenels({ len, y, ...g }: { len: number; y: number; position?: [number, number, number]; "rotation-y"?: number }) {
  const n = Math.floor(len / 1.4);
  return (
    <group {...g}>
      {Array.from({ length: n }, (_, i) => (
        <Part key={i} geometry={geo.box(0.7, 0.7, 0.9)} color={CASTLE_STONE} outline={0.04} position={[-len / 2 + 0.7 + i * 1.4, y, 0]} />
      ))}
    </group>
  );
}

// Lincoln Castle, simplified: a walled bailey with round corner towers, a gatehouse and a keep on a mound.
export function Castle({ p, font }: { p: Place; font: string }) {
  const sign = useMemo(() => signTexture(p.name, "#5b6b7a", font), [p, font]);
  const hw = p.w / 2,
    hd = p.d / 2,
    wh = 5;
  return (
    <group position={[p.x, 0, p.z]} rotation-y={p.rot} onClick={placeClick(p)}>
      <mesh geometry={geo.box(p.w - 1, 0.06, p.d - 1)} material={toon(0x5fbf5b)} position-y={0.04} receiveShadow />
      {/* curtain walls */}
      {[
        { pos: [0, wh / 2, -hd] as const, len: p.w, ry: 0 },
        { pos: [-hw, wh / 2, 0] as const, len: p.d, ry: Math.PI / 2 },
        { pos: [hw, wh / 2, 0] as const, len: p.d, ry: Math.PI / 2 },
      ].map((w, i) => (
        <group key={i} position={[w.pos[0], 0, w.pos[2]]} rotation-y={w.ry}>
          <Part geometry={geo.box(w.len, wh, 1.2)} color={CASTLE_STONE} outline={0.08} position-y={wh / 2} />
          <Crenels len={w.len} y={wh + 0.35} />
        </group>
      ))}
      {/* front wall either side of the gatehouse */}
      {[-1, 1].map((sx) => (
        <group key={sx} position={[sx * (hw / 2 + 1.6), 0, hd]}>
          <Part geometry={geo.box(hw - 3.2, wh, 1.2)} color={CASTLE_STONE} outline={0.08} position-y={wh / 2} />
          <Crenels len={hw - 3.2} y={wh + 0.35} />
        </group>
      ))}
      {/* round towers at the corners */}
      {[-1, 1].flatMap((sx) =>
        [-1, 1].map((sz) => (
          <group key={`${sx}${sz}`} position={[sx * hw, 0, sz * hd]}>
            <Part geometry={geo.cyl(1.6, 1.8, 7, 14)} color={CASTLE_DARK} outline={0.08} position-y={3.5} />
            <Part geometry={geo.cyl(1.9, 1.9, 0.6, 14)} color={CASTLE_STONE} outline={0.06} position-y={7.3} />
          </group>
        )),
      )}
      {/* gatehouse */}
      <Part geometry={geo.box(6.4, 8, 3)} color={CASTLE_DARK} outline={0.08} position={[0, 4, hd]} />
      <Part geometry={geo.box(2.4, 3.4, 0.3)} color={0x3a2a1a} outline={0.05} position={[0, 1.7, hd + 1.55]} />
      <Part geometry={geo.cyl(1.2, 1.2, 0.3, 16)} color={0x3a2a1a} outline={0.05} position={[0, 3.4, hd + 1.55]} rotation-x={Math.PI / 2} />
      <Crenels len={6.4} y={8.35} position={[0, 0, hd + 1]} />
      <mesh position={[0, 6.2, hd + 1.53]}>
        <planeGeometry args={[5.6, 1.4]} />
        <meshBasicMaterial map={sign} toneMapped={false} />
      </mesh>
      {/* the keep on its mound, like the Lucy Tower */}
      <Part geometry={geo.cyl(4.5, 6, 2, 20)} color={0x5fbf5b} outline={0.06} position={[-hw + 6, 1, -hd + 5]} />
      <Part geometry={geo.cyl(3, 3.2, 5, 16)} color={CASTLE_DARK} outline={0.08} position={[-hw + 6, 4.5, -hd + 5]} />
      <Part geometry={geo.box(0.8, 1.1, 0.2)} color={WINDOW} outline={0.04} position={[-hw + 6, 5, -hd + 8.1]} />
    </group>
  );
}

const HOUSE_COLORS = [0xe8a33d, 0xf2e2c4, 0x9fc0d8, 0xd77a61, 0xf2d06b, 0xc8b6e2];

// Steep Hill: a narrow cobbled lane climbing north, lined with old houses that step up the hill.
export function SteepHill({ p, font }: { p: Place; font: string }) {
  const sign = useMemo(() => signTexture(p.name, "#8a3b2e", font), [p, font]);
  const n = 7;
  const len = p.d / n;
  const rows = [-1, 1].flatMap((side) =>
    Array.from({ length: n }, (_, i) => ({
      side,
      i,
      z: p.d / 2 - len / 2 - i * len,
      step: i * 0.45, // each house sits a little higher up the hill
      h: 4.2 + ((i * 7 + side * 3 + 10) % 4) * 0.5,
      color: HOUSE_COLORS[(i + (side > 0 ? 3 : 0)) % HOUSE_COLORS.length],
    })),
  );
  const cobbles = useMemo(() => {
    const r = seeded(5);
    return Array.from({ length: 70 }, () => [(r() - 0.5) * (p.w - 2 * STREET_ROW - 0.6), (r() - 0.5) * (p.d - 1)] as const);
  }, [p]);
  return (
    <group position={[p.x, 0, p.z]} rotation-y={p.rot} onClick={placeClick(p)}>
      <mesh geometry={geo.box(p.w - 2 * STREET_ROW, 0.06, p.d)} material={toon(0xb9ad9a)} position-y={0.03} receiveShadow />
      {cobbles.map(([x, z], i) => (
        <mesh key={i} geometry={geo.box(0.5, 0.07, 0.4)} material={toon(0xa0947f)} position={[x, 0.04, z]} />
      ))}
      {rows.map((r) => {
        const x = r.side * (p.w / 2 - STREET_ROW / 2);
        const front = -r.side * (STREET_ROW / 2); // faces the lane
        return (
          <group key={`${r.side}${r.i}`} position={[x, 0, r.z]}>
            <Part geometry={geo.box(STREET_ROW, r.step + 0.01, len - 0.2)} color={0x9c8d6e} outline={0.05} position-y={r.step / 2} />
            <Part geometry={geo.box(STREET_ROW - 0.2, r.h, len - 0.4)} color={r.color} outline={0.07} position-y={r.step + r.h / 2} />
            <group position={[0, r.step + r.h, 0]} rotation-y={Math.PI / 2}>
              <Part geometry={geo.cyl(2.3, 2.3, len - 0.2, 3)} color={p.roof} outline={0.06} rotation-x={-Math.PI / 2} scale={[1, 1, 0.5]} position-y={0.55} />
            </group>
            <Part geometry={geo.box(0.2, 1.8, 0.9)} color={0x5a3a22} outline={0.04} position={[front, r.step + 0.9, 0]} />
            <Part geometry={geo.box(0.2, 0.9, 0.9)} color={WINDOW} outline={0.04} position={[front, r.step + r.h - 1.2, len / 4]} />
            <Part geometry={geo.box(0.2, 0.9, 0.9)} color={WINDOW} outline={0.04} position={[front, r.step + r.h - 1.2, -len / 4]} />
          </group>
        );
      })}
      {/* street sign at the bottom of the hill */}
      <group position={[-(p.w / 2 - STREET_ROW) + 0.6, 0, p.d / 2 + 1.2]}>
        <Part geometry={geo.box(0.2, 2.6, 0.2)} color={0x2b2633} outline={0.04} position-y={1.3} />
        <mesh position={[1.4, 2.4, 0.12]}>
          <planeGeometry args={[2.8, 0.7]} />
          <meshBasicMaterial map={sign} toneMapped={false} />
        </mesh>
        <Part geometry={geo.box(2.9, 0.8, 0.15)} color={0xfff8e7} outline={0.04} position={[1.4, 2.4, 0.02]} />
      </group>
    </group>
  );
}

function Boat({ color, ...g }: { color: number; position: [number, number, number]; "rotation-y"?: number }) {
  return (
    <group {...g}>
      <Part geometry={geo.box(1.4, 0.6, 3.6)} color={color} outline={0.05} position-y={0.3} />
      <Part geometry={geo.box(1, 0.6, 1.4)} color={0xfff8e7} outline={0.04} position={[0, 0.9, -0.3]} />
    </group>
  );
}

function Swan({ phase, reduce }: { phase: number; reduce: boolean }) {
  const g = useRef<THREE.Group>(null!);
  useFrame(({ clock }) => {
    const t = reduce ? phase : clock.elapsedTime * 0.12 + phase;
    g.current.position.set(Math.cos(t) * (POOL.rx - 4), 0.15, Math.sin(t) * (POOL.rz - 3));
    g.current.rotation.y = -t;
  });
  return (
    <group ref={g}>
      <Part geometry={geo.sphere(0.45)} color={0xffffff} outline={0.04} scale={[1, 0.7, 1.4]} position-y={0.2} />
      <Part geometry={geo.cyl(0.1, 0.12, 0.8, 8)} color={0xffffff} outline={0.03} position={[0, 0.65, 0.5]} rotation-x={-0.3} />
      <Part geometry={geo.sphere(0.16)} color={0xffffff} outline={0.03} position={[0, 1.05, 0.62]} />
      <Part geometry={geo.cone(0.07, 0.25, 6)} color={0xff7a1a} outline={0.02} position={[0, 1.03, 0.82]} rotation-x={Math.PI / 2} />
    </group>
  );
}

// Brayford Pool: water ringed by a promenade, a jetty, narrowboats and swans.
export function Brayford({ p, font, reduce }: { p: Place; font: string; reduce: boolean }) {
  const sign = useMemo(() => signTexture(p.name, "#2b59c3", font), [p, font]);
  return (
    <group position={[p.x, 0, p.z]} rotation-y={p.rot} onClick={placeClick(p)}>
      <mesh geometry={geo.cyl(1, 1, 0.06, 48)} material={toon(0xe8dcc2)} scale={[POOL.rx + 2.5, 1, POOL.rz + 2.5]} position-y={0.03} receiveShadow />
      <mesh geometry={geo.cyl(1, 1, 0.1, 48)} material={toon(0x3aa6e8)} scale={[POOL.rx, 1, POOL.rz]} position-y={0.06} />
      <mesh geometry={geo.cyl(1, 1, 0.11, 48)} material={toon(0x5bc0f5)} scale={[POOL.rx - 3, 1, POOL.rz - 3]} position-y={0.065} />
      {/* jetty reaching out from the near shore */}
      <Part geometry={geo.box(2, 0.3, 6)} color={0x8a5a33} outline={0.05} position={[4, 0.25, POOL.rz - 2]} />
      {[-0.8, 0.8].flatMap((x) =>
        [-2.5, 0.5].map((z) => <Part key={`${x}${z}`} geometry={geo.cyl(0.15, 0.15, 1, 8)} color={0x5a3a22} outline={0.03} position={[4 + x, 0.1, POOL.rz - 2 + z]} />),
      )}
      <Boat color={0x2f8f5b} position={[7, 0.1, POOL.rz - 3]} />
      <Boat color={0xe03a3e} position={[-6, 0.1, -POOL.rz + 3.5]} rotation-y={1.4} />
      <Boat color={0x2b59c3} position={[-9, 0.1, 1]} rotation-y={0.3} />
      {[0, 2.1, 4.2].map((ph) => (
        <Swan key={ph} phase={ph} reduce={reduce} />
      ))}
      {/* name board on the promenade, facing the town */}
      <group position={[-4, 0, POOL.rz + 1.6]} rotation-y={Math.PI}>
        {[-1.6, 1.6].map((x) => (
          <Part key={x} geometry={geo.box(0.2, 2.2, 0.2)} color={0x2b2633} outline={0.04} position={[x, 1.1, 0]} />
        ))}
        <Part geometry={geo.box(4.2, 1, 0.15)} color={0xfff8e7} outline={0.05} position={[0, 2.1, 0]} />
        <mesh position={[0, 2.1, 0.09]}>
          <planeGeometry args={[4, 0.9]} />
          <meshBasicMaterial map={sign} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}
