import { useEffect, useMemo } from "react";
import type { ThreeElements } from "@react-three/fiber";
import type { Place } from "./places";
import { Part, geo, toon, signTexture, INK, WINDOW, LAMP } from "./toon";
import { placeEvents } from "./store";
import { STATION } from "./colliders";

const PLATFORM = 0xc9c2b4;
const COPING = 0xf4f1ea;
const SAFETY = 0xffd23f;
const IRON = 0x2f6b4f; // canopy columns and footbridge, in old railway green
const BR_BLUE = 0x2b59c3;

// A triangular prism running along local z, base width w and height h, its base at y = 0.
function Prism({ w, h, len, color, ...g }: { w: number; h: number; len: number; color: number } & Omit<ThreeElements["group"], "children">) {
  return (
    <group {...g}>
      <Part geometry={geo.cyl(1, 1, len, 3)} color={color} outline={0.05} rotation-x={-Math.PI / 2} scale={[w / 1.732, 1, h / 1.5]} position-y={h / 3} />
    </group>
  );
}

// Lincoln Central, simplified: a long buff-brick booking hall with a gabled entrance and clock on the
// main road, a canopy over the platform behind it, a second platform across the line with a shelter,
// and a covered footbridge between the two. The platforms and footbridge are in world coordinates.
export function Station({ p, font }: { p: Place; font: string }) {
  const sign = useMemo(() => signTexture(p.name, "#2b59c3", font), [p, font]);
  const board = useMemo(() => signTexture("Lincoln", "#2b59c3", font), [font]);
  useEffect(
    () => () => {
      sign.dispose();
      board.dispose();
    },
    [sign, board],
  );
  const hw = p.w / 2,
    hd = p.d / 2;
  const [north, south] = STATION.platforms;
  const len = STATION.x1 - STATION.x0,
    mid = (STATION.x0 + STATION.x1) / 2;
  const bx = (STATION.bridge.x0 + STATION.bridge.x1) / 2,
    bw = STATION.bridge.x1 - STATION.bridge.x0;
  return (
    <>
      <group position={[p.x, 0, p.z]} rotation-y={p.rot} {...placeEvents(p)}>
        <Part geometry={geo.box(p.w, p.h, p.d)} color={p.wall} outline={0.09} position-y={p.h / 2} />
        <Part geometry={geo.box(p.w + 0.2, 0.3, p.d + 0.2)} color={0xc9a46b} outline={0.04} position-y={p.h - 0.15} />
        <Prism w={p.d + 0.8} h={2.4} len={p.w + 0.6} color={p.roof} position-y={p.h} rotation-y={Math.PI / 2} />
        {[-1, 1].map((sx) => (
          <Part key={sx} geometry={geo.box(0.7, 1.6, 0.7)} color={0xb5543a} outline={0.04} position={[sx * (hw - 2), p.h + 2, 0]} />
        ))}
        {/* tall windows along the front and back */}
        {[-1, 1].flatMap((sz) =>
          [-5.5, -4, -2.6, 2.6, 4, 5.5].map((x) => (
            <Part key={`${sz}${x}`} geometry={geo.box(0.8, 1.7, 0.1)} color={WINDOW} outline={0.04} position={[x, 2, sz * (hd + 0.03)]} />
          )),
        )}
        {/* the gabled entrance, with the station's name and a clock above the doors */}
        <group position-z={hd + 0.6}>
          <Part geometry={geo.box(4.2, p.h + 1.2, 1.2)} color={p.wall} outline={0.07} position-y={(p.h + 1.2) / 2} />
          <Prism w={4.8} h={1.6} len={1.6} color={p.roof} position-y={p.h + 1.2} />
          <Part geometry={geo.box(2, 2.6, 0.1)} color={0x7a4a2a} outline={0.04} position={[0, 1.3, 0.62]} />
          <mesh geometry={geo.box(0.06, 2.5, 0.12)} material={toon(INK)} position={[0, 1.3, 0.64]} />
          <mesh position={[0, 3.55, 0.62]}>
            <planeGeometry args={[3.8, 0.95]} />
            <meshBasicMaterial map={sign} toneMapped={false} />
          </mesh>
          <group position={[0, 4.95, 0.62]}>
            <Part geometry={geo.cyl(0.55, 0.55, 0.12, 20)} color={0xfff8e7} outline={0.05} rotation-x={Math.PI / 2} />
            <mesh geometry={geo.box(0.07, 0.42, 0.04)} material={toon(INK)} position={[0, 0.17, 0.08]} />
            <mesh geometry={geo.box(0.3, 0.07, 0.04)} material={toon(INK)} position={[0.12, 0, 0.08]} />
          </group>
        </group>
        {/* canopy over the platform behind, on green iron columns */}
        <group position-z={-hd}>
          {/* stopping short of the platform edge so trains clear it */}
          <Part geometry={geo.box(p.w + 2, 0.25, 2.3)} color={COPING} outline={0.05} position={[0, 3.7, -1.15]} />
          <mesh geometry={geo.box(p.w + 2, 0.35, 0.08)} material={toon(IRON)} position={[0, 3.45, -2.3]} />
          {[-6, -2, 2, 6].map((x) => (
            <Part key={x} geometry={geo.cyl(0.09, 0.09, 3.6, 8)} color={IRON} outline={0.03} position={[x, 1.8, -1.9]} />
          ))}
          <Part geometry={geo.box(1.8, 2.4, 0.1)} color={0x7a4a2a} outline={0.04} position={[0, 1.2, -0.05]} />
        </group>
      </group>

      {/* the platforms, one along each track, with a white edge and a yellow line to stand behind */}
      {[north, south].map((pl) => (
        <group key={pl.side} position={[mid, 0, (pl.z0 + pl.z1) / 2]} {...placeEvents(p)}>
          <mesh geometry={geo.box(len, 0.12, pl.z1 - pl.z0)} material={toon(PLATFORM)} position-y={0.06} receiveShadow />
          <mesh geometry={geo.box(len, 0.13, 0.35)} material={toon(COPING)} position={[0, 0.065, (pl.edge - (pl.z0 + pl.z1) / 2) - pl.side * 0.17]} />
          <mesh geometry={geo.box(len, 0.13, 0.12)} material={toon(SAFETY)} position={[0, 0.07, (pl.edge - (pl.z0 + pl.z1) / 2) - pl.side * 0.6]} />
        </group>
      ))}
      {[north, south].map((pl) => {
        const back = pl.side < 0 ? pl.z0 + 0.4 : pl.z1 - 0.4;
        return (
          <group key={pl.side}>
            {/* nameboards, readable from either side */}
            <group position={[pl.side < 0 ? STATION.x0 + 2 : STATION.x0 + 8, 0, back]}>
              {[-1.2, 1.2].map((x) => (
                <Part key={x} geometry={geo.cyl(0.07, 0.07, 2.6, 6)} color={INK} outline={0.02} position={[x, 1.3, 0]} />
              ))}
              <Part geometry={geo.box(3, 0.8, 0.1)} color={BR_BLUE} outline={0.04} position-y={2.2} />
              {[0.06, -0.06].map((z) => (
                <mesh key={z} position={[0, 2.2, z]} rotation-y={z < 0 ? Math.PI : 0}>
                  <planeGeometry args={[2.8, 0.62]} />
                  <meshBasicMaterial map={board} toneMapped={false} />
                </mesh>
              ))}
            </group>
            {/* lamps along the back of the platform */}
            {[STATION.x0 + 5, STATION.x0 + 11, STATION.x0 + 17].map((x) => (
              <group key={x} position={[x, 0, back]}>
                <Part geometry={geo.cyl(0.07, 0.09, 2.8, 8)} color={IRON} outline={0.03} position-y={1.4} />
                <Part geometry={geo.sphere(0.24)} color={LAMP} outline={0.04} position-y={2.9} />
              </group>
            ))}
          </group>
        );
      })}
      {/* benches under the canopy */}
      {[STATION.x0 + 7.5, STATION.x0 + 13.5].map((x) => (
        <Part key={x} geometry={geo.box(1.8, 0.45, 0.6)} color={0x8a5a33} outline={0.04} position={[x, 0.35, north.z0 + 0.6]} />
      ))}
      {/* a glass-sided waiting shelter on the far platform */}
      <group position={[STATION.x0 + 5, 0, south.z1 - 0.7]}>
        <Part geometry={geo.box(4.4, 2.5, 0.12)} color={WINDOW} outline={0.04} position={[0, 1.25, 0.4]} />
        {[-1, 1].map((s) => (
          <Part key={s} geometry={geo.box(0.12, 2.5, 1.1)} color={WINDOW} outline={0.04} position={[s * 2.2, 1.25, -0.1]} />
        ))}
        <Part geometry={geo.box(4.8, 0.2, 1.7)} color={IRON} outline={0.04} position={[0, 2.6, -0.15]} />
        <Part geometry={geo.box(3.4, 0.45, 0.5)} color={0x8a5a33} outline={0.04} position={[0, 0.35, 0.05]} />
      </group>
      {/* the covered footbridge, a stair tower on each platform and a glazed span high over the line */}
      {[north, south].map((pl) => (
        <group key={pl.side} position={[bx, 0, (pl.z0 + pl.z1) / 2]}>
          <Part geometry={geo.box(bw, 7.2, pl.z1 - pl.z0)} color={IRON} outline={0.07} position-y={3.6} />
          <Part geometry={geo.box(bw + 0.3, 0.25, pl.z1 - pl.z0 + 0.3)} color={COPING} outline={0.04} position-y={7.3} />
          <Part geometry={geo.box(0.1, 2, 1.2)} color={0x7a4a2a} outline={0.03} position={[-bw / 2 - 0.03, 1, 0]} />
          {[2.6, 4.6].map((y) => (
            <Part key={y} geometry={geo.box(0.1, 1, 1.6)} color={WINDOW} outline={0.03} position={[-bw / 2 - 0.03, y, 0]} />
          ))}
        </group>
      ))}
      <group position={[bx, 0, (north.z1 + south.z0) / 2]}>
        <Part geometry={geo.box(bw - 0.3, 2, south.z0 - north.z1 + 1)} color={IRON} outline={0.06} position-y={6.1} />
        {[-1, 1].map((s) => (
          <Part key={s} geometry={geo.box(0.1, 0.9, south.z0 - north.z1 - 0.6)} color={WINDOW} outline={0.03} position={[s * (bw / 2 - 0.12), 6.3, 0]} />
        ))}
        <Part geometry={geo.box(bw + 0.2, 0.2, south.z0 - north.z1 + 1.4)} color={COPING} outline={0.04} position-y={7.2} />
      </group>
    </>
  );
}
