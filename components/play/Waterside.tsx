import { useEffect, useMemo } from "react";
import type { Place } from "./places";
import { Part, geo, signTexture, WINDOW } from "./toon";
import { placeEvents } from "./store";

const TRIM = 0xf2e2c4;
const FRAME = 0x2b2633;

// Waterside Shopping Centre on the north bank of the Witham: two brick wings under green roofs either side of
// a tall glazed atrium over the entrance, shop windows along the ground floor, all facing the river.
export function Waterside({ p, font }: { p: Place; font: string }) {
  const sign = useMemo(() => signTexture(p.name, "#2f6b5a", font), [p, font]);
  useEffect(() => () => sign.dispose(), [sign]);
  const hd = p.d / 2,
    atrium = 6,
    wing = (p.w - atrium) / 2,
    tall = p.h + 2.4;
  const r = p.d / Math.sqrt(3);
  return (
    <group position={[p.x, 0, p.z]} rotation-y={p.rot} {...placeEvents(p)}>
      {[-1, 1].map((side) => {
        const cx = side * (atrium / 2 + wing / 2);
        return (
          <group key={side} position-x={cx}>
            <Part geometry={geo.box(wing, p.h, p.d)} color={p.wall} outline={0.08} position-y={p.h / 2} />
            <Part geometry={geo.box(wing + 0.2, 0.3, p.d + 0.2)} color={TRIM} outline={0.04} position-y={p.h / 2} />
            <group position-y={p.h + r * 0.275} rotation-y={Math.PI / 2}>
              <Part geometry={geo.cyl(r, r, wing + 0.3, 3)} color={p.roof} outline={0.07} rotation-x={-Math.PI / 2} scale={[1, 1, 0.5]} />
            </group>
            {/* shop windows under a canopy, and a row of windows upstairs */}
            {[-1, 0, 1].map((k) => (
              <group key={k} position={[(k * wing) / 3, 0, hd + 0.05]}>
                <Part geometry={geo.box(wing / 3 - 0.5, 1.8, 0.15)} color={WINDOW} outline={0.03} position-y={1.2} />
                <Part geometry={geo.box(wing / 3 - 0.6, 0.9, 0.15)} color={WINDOW} outline={0.03} position-y={p.h - 1.4} />
              </group>
            ))}
            <Part geometry={geo.box(wing - 0.2, 0.12, 1.1)} color={p.roof} outline={0.03} position={[0, 2.4, hd + 0.55]} />
          </group>
        );
      })}
      {/* the glazed atrium over the entrance, with its glass gable */}
      <Part geometry={geo.box(atrium, tall, p.d - 0.6)} color={WINDOW} outline={0.07} position-y={tall / 2} />
      {[-1, 0, 1].map((k) => (
        <Part key={k} geometry={geo.box(0.12, tall, 0.12)} color={FRAME} outline={0} position={[(k * atrium) / 3, tall / 2, hd - 0.25]} />
      ))}
      {[1.2, 3.6, 6].map((y) => (
        <Part key={y} geometry={geo.box(atrium, 0.1, 0.12)} color={FRAME} outline={0} position={[0, y, hd - 0.25]} />
      ))}
      <group position-y={tall + (atrium / Math.sqrt(3)) * 0.275}>
        <Part geometry={geo.cyl(atrium / Math.sqrt(3), atrium / Math.sqrt(3), p.d - 0.6, 3)} color={WINDOW} outline={0.06} rotation-x={-Math.PI / 2} scale={[1, 1, 0.45]} />
      </group>
      <Part geometry={geo.box(2.4, 2.1, 0.2)} color={FRAME} outline={0.04} position={[0, 1.05, hd - 0.2]} />
      <Part geometry={geo.box(2.1, 1.9, 0.1)} color={0x9fd8e8} outline={0} position={[0, 1, hd - 0.08]} />
      <mesh position={[0, 2.9, hd - 0.12]}>
        <planeGeometry args={[4.4, 1.1]} />
        <meshBasicMaterial map={sign} toneMapped={false} />
      </mesh>
    </group>
  );
}
