import { useEffect, useMemo } from "react";
import * as THREE from "three";
import type { Place } from "./places";
import { Part, geo, toon, signTexture, WINDOW, LAMP } from "./toon";
import { ST_MARKS, seeded } from "./colliders";
import { placeEvents, usePlay } from "./store";
import { Strip } from "./terrain";

const PAVING = 0xd9ccb2;
const SLAB = 0xc7b89a;
const IRON = 0x2b2633;
const STONE = 0xf2ead8;

// The shops along the street, in the order of ST_MARKS.units. Plain trade signs, not real shops.
const UNITS = [
  { name: "Fashion", wall: 0xffd6e4, awning: 0xe03a3e, h: 4.2 },
  { name: "Phones", wall: 0x9fc0d8, awning: 0x1a1320, h: 3.9 },
  { name: "Books", wall: 0xf2e2c4, awning: 0x2f8f5b, h: 4.1 },
];

// One shop: glazed front and door under its sign and a striped awning, a flat roof, and the same frontage on its
// back so the row reads from the map, which always looks north, as well as from the street.
function Unit({ u, i, font }: { u: (typeof ST_MARKS.units)[number]; i: number; font: string }) {
  const look = UNITS[i % UNITS.length];
  const sign = useMemo(() => signTexture(look.name, "#1a1320", font), [look, font]);
  useEffect(() => () => sign.dispose(), [sign]);
  const w = u.len - 0.15,
    f = u.deep / 2;
  return (
    <group position={[u.x, 0, u.z]} rotation-y={u.rot}>
      <Part geometry={geo.box(w, look.h, u.deep)} color={look.wall} outline={0.07} position-y={look.h / 2} />
      <Part geometry={geo.box(w + 0.2, 0.3, u.deep + 0.2)} color={0x5b6b7a} outline={0.04} position-y={look.h + 0.15} />
      {[0, Math.PI].map((r) => (
        <group key={r} rotation-y={r}>
          <Part geometry={geo.box(w - 1.6, 1.7, 0.15)} color={WINDOW} outline={0.04} position={[-0.5, 1.15, f + 0.05]} />
          <Part geometry={geo.box(0.9, 1.9, 0.2)} color={0x5a3a22} outline={0.05} position={[w / 2 - 0.75, 0.95, f + 0.05]} />
          <Part geometry={geo.box(w - 0.3, 0.75, 0.15)} color={0xfff8e7} outline={0.04} position={[0, 2.6, f + 0.08]} />
          <mesh position={[0, 2.6, f + 0.17]}>
            <planeGeometry args={[Math.min(w - 0.5, 3.2), 0.68]} />
            <meshBasicMaterial map={sign} toneMapped={false} />
          </mesh>
          {Array.from({ length: 6 }, (_, k) => (
            <Part
              key={k}
              geometry={geo.box((w - 0.4) / 6, 0.1, 1)}
              color={k % 2 ? 0xfff8e7 : look.awning}
              outline={0.03}
              position={[-(w - 0.4) / 2 + ((w - 0.4) / 12) * (2 * k + 1), 2.1, f + 0.5]}
              rotation-x={0.3}
            />
          ))}
        </group>
      ))}
    </group>
  );
}

// The old St Marks station building on the corner of the High Street: a stone block with a portico of four
// columns under a pediment on its street front, the centre's name across the entablature, tall windows behind.
function Station({ p, font }: { p: Place; font: string }) {
  const sign = useMemo(() => signTexture(p.name, "#5b4632", font), [p, font]);
  useEffect(() => () => sign.dispose(), [sign]);
  const f = p.d / 2,
    col = 3.4,
    span = p.w - 0.8,
    R = span / Math.sqrt(3);
  return (
    <group position={[p.x, 0, p.z]} rotation-y={p.rot} {...placeEvents(p)}>
      <Part geometry={geo.box(p.w, p.h, p.d)} color={p.wall} outline={0.08} position-y={p.h / 2} />
      <Part geometry={geo.box(p.w + 0.3, 0.35, p.d + 0.3)} color={STONE} outline={0.04} position-y={p.h + 0.17} />
      {/* tall windows down each side and on the back, and the doors behind the columns */}
      {[Math.PI / 2, Math.PI, -Math.PI / 2].map((a) => (
        <group key={a} rotation-y={a}>
          {[-1, 1].map((k) => (
            <Part key={k} geometry={geo.box(0.9, 2, 0.1)} color={WINDOW} outline={0.03} position={[(k * (a === Math.PI ? p.w : p.d)) / 4, 2, (a === Math.PI ? p.d : p.w) / 2 + 0.05]} />
          ))}
        </group>
      ))}
      {[-1.4, 0, 1.4].map((x) => (
        <Part key={x} geometry={geo.box(0.9, x ? 2 : 2.4, 0.12)} color={x ? WINDOW : 0x5a3a22} outline={0.03} position={[x, x ? 1.6 : 1.2, f + 0.06]} />
      ))}
      {/* the portico: steps, four columns, the entablature with the name, and the pediment */}
      <Part geometry={geo.box(span + 0.4, 0.25, 2)} color={STONE} outline={0.04} position={[0, 0.12, f + 1]} />
      {[-1.5, -0.5, 0.5, 1.5].map((k) => (
        <group key={k} position={[(k * (span - 0.6)) / 3, 0, f + 1.3]}>
          <Part geometry={geo.cyl(0.22, 0.25, col, 12)} color={STONE} outline={0.04} position-y={0.25 + col / 2} />
          <Part geometry={geo.box(0.6, 0.18, 0.6)} color={STONE} outline={0.03} position-y={0.25 + col + 0.09} />
        </group>
      ))}
      <Part geometry={geo.box(span, 0.7, 2)} color={STONE} outline={0.05} position={[0, 0.25 + col + 0.18 + 0.35, f + 0.85]} />
      <mesh position={[0, 0.25 + col + 0.53, f + 1.86]}>
        <planeGeometry args={[span - 0.4, 0.6]} />
        <meshBasicMaterial map={sign} toneMapped={false} />
      </mesh>
      {/* the name again on the side onto the shopping street, where the map can see it */}
      <group rotation-y={-Math.PI / 2}>
        <Part geometry={geo.box(3.6, 0.8, 0.12)} color={0xfff8e7} outline={0.04} position={[0, p.h - 0.7, p.w / 2 + 0.06]} />
        <mesh position={[0, p.h - 0.7, p.w / 2 + 0.13]}>
          <planeGeometry args={[3.4, 0.7]} />
          <meshBasicMaterial map={sign} toneMapped={false} />
        </mesh>
      </group>
      <group position={[0, 0.25 + col + 0.88 + R * 0.175, f + 0.85]}>
        <Part geometry={geo.cyl(R, R, 2, 3)} color={STONE} outline={0.05} rotation-x={-Math.PI / 2} scale={[1, 1, 0.35]} />
      </group>
    </group>
  );
}

// Paving slabs scattered over the street.
const rand = seeded(73);
const SLABS = Array.from({ length: 26 }, () => {
  const s = ST_MARKS.street;
  return [s.x0 + 0.6 + rand() * (s.x1 - s.x0 - 1.2), s.z0 + 0.6 + rand() * (s.z1 - s.z0 - 1.2)] as const;
});

const glow = new THREE.MeshBasicMaterial({ color: 0xffc96b, transparent: true, opacity: 0.16, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });

// St Marks: the old station building on the High Street, and the paved street of shops behind it running back to
// Brayford Wharf East, with benches and lamps down the middle.
export function StMarks({ p, font }: { p: Place; font: string }) {
  const night = usePlay((st) => st.night);
  const s = ST_MARKS.street;
  const mid = (s.z0 + s.z1) / 2;
  const along = [s.x0 + 8, (s.x0 + s.x1) / 2 + 2, s.x1 - 4];
  return (
    <>
      <Station p={p} font={font} />
      <Strip w={s.x1 - s.x0} d={s.z1 - s.z0} color={PAVING} x={(s.x0 + s.x1) / 2} z={mid} y={0.066} raycast={() => null} />
      {SLABS.map(([x, z], i) => (
        <mesh key={i} geometry={geo.box(1.1, 0.06, 0.8)} material={toon(SLAB)} position={[x, 0.075, z]} raycast={() => null} />
      ))}
      {ST_MARKS.units.map((u, i) => (
        <Unit key={i} u={u} i={i} font={font} />
      ))}
      {/* lamps down the middle of the street, with a bench either side of each of the first two */}
      {along.map((x, i) => (
        <group key={x} position={[x, 0, mid]}>
          <Part geometry={geo.cyl(0.1, 0.12, 3.2, 8)} color={IRON} outline={0.04} position-y={1.6} />
          <Part geometry={geo.sphere(0.3)} color={LAMP} outline={0.05} position-y={3.3} />
          {night && <mesh geometry={geo.sphere(0.7)} material={glow} position-y={3.3} raycast={() => null} />}
          {i < 2 &&
            [-1, 1].map((sx) => (
              <group key={sx} position-x={sx * 1.6}>
                <Part geometry={geo.box(1.4, 0.12, 0.5)} color={0x8a5a33} outline={0.03} position-y={0.45} />
                <Part geometry={geo.box(1.4, 0.4, 0.1)} color={0x8a5a33} outline={0.03} position={[0, 0.7, -0.22]} />
                {[-0.55, 0.55].map((lx) => (
                  <Part key={lx} geometry={geo.box(0.1, 0.45, 0.45)} color={IRON} outline={0.02} position={[lx, 0.22, 0]} />
                ))}
              </group>
            ))}
        </group>
      ))}
    </>
  );
}
