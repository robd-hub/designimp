import { useEffect, useMemo } from "react";
import type { Place } from "./places";
import { Part, geo, signTexture } from "./toon";
import { placeEvents } from "./store";

const STONE = [0xd9cfb6, 0xcfc3a8];
const TILE = 0xa9553f;

// The Mint Wall, by Newport Arch at the east end of Westgate: what's left of the north wall of the basilica on the
// Roman forum, a long run of coursed limestone with bonding courses of red tile, its top broken down unevenly.
// Shown lower than the real wall, which stands about 7 metres, with a plaque on the street side naming it.
export function MintWall({ p, font }: { p: Place; font: string }) {
  const sign = useMemo(() => signTexture(p.name, "#5b5262", font), [p, font]);
  useEffect(() => () => sign.dispose(), [sign]);
  const hw = p.w / 2,
    hd = p.d / 2;
  const n = 10,
    seg = p.w / n;
  const tops = [1, 0.82, 0.94, 0.72, 0.9, 1, 0.78, 0.96, 0.74, 0.88];
  return (
    <group position={[p.x, 0, p.z]} rotation-y={p.rot} {...placeEvents(p)}>
      {tops.map((t, i) => {
        const h = p.h * t;
        return <Part key={i} geometry={geo.box(seg + 0.02, h, p.d)} color={STONE[i % 2]} outline={0.05} position={[-hw + seg * (i + 0.5), h / 2, 0]} />;
      })}
      {/* the tile courses, right through the wall */}
      {[0.9, 1.9].map((y) => (
        <Part key={y} geometry={geo.box(p.w + 0.04, 0.14, p.d + 0.06)} color={TILE} outline={0.02} position-y={y} />
      ))}
      {/* a few fallen blocks at the foot of the wall */}
      {[-hw + 1.2, hw - 2.1].map((x, i) => (
        <Part key={x} geometry={geo.box(0.7, 0.4, 0.5)} color={STONE[(i + 1) % 2]} outline={0.04} position={[x, 0.2, hd + 0.5]} rotation-y={0.3 - i * 0.5} />
      ))}
      {/* the plaque, on the street side */}
      <mesh position={[hw - 1.6, 1.35, hd + 0.03]}>
        <planeGeometry args={[2.2, 0.55]} />
        <meshBasicMaterial map={sign} toneMapped={false} />
      </mesh>
    </group>
  );
}
