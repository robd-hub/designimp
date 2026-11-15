import { useEffect, useMemo } from "react";
import type { Place } from "./places";
import { Part, geo, signTexture, WINDOW } from "./toon";
import { placeEvents } from "./store";

const STONE = 0xe6dcc6;
const FRAME = 0x2b2633;
const DOOR = 0x6b1f2a;
const CANOPY = 0xf2e2c4;
const BULB = 0xffd23f;
const BILLS = [0xe03a3e, 0x2b59c3];

// A round-headed window in a stone surround.
function Arched({ w, h, x, y, z }: { w: number; h: number; x: number; y: number; z: number }) {
  const r = w / 2;
  return (
    <group position={[x, y, z]}>
      <Part geometry={geo.box(w + 0.24, h, 0.1)} color={STONE} outline={0.03} position-y={h / 2} />
      <Part geometry={geo.cyl(r + 0.12, r + 0.12, 0.1, 16)} color={STONE} outline={0.03} position-y={h} rotation-x={Math.PI / 2} />
      <Part geometry={geo.box(w, h, 0.12)} color={WINDOW} outline={0} position={[0, h / 2, 0.02]} />
      <Part geometry={geo.cyl(r, r, 0.12, 16)} color={WINDOW} outline={0} position={[0, h, 0.02]} rotation-x={Math.PI / 2} />
    </group>
  );
}

// The Theatre Royal on Clasketgate, after the real theatre of 1893: a Victorian front in red brick with stone
// dressings, three round-headed windows upstairs, a pediment on the parapet, and over the doors a canopy on iron
// columns with the name on its fascia under a row of bulbs, playbills either side of the doors.
export function TheatreRoyal({ p, font }: { p: Place; font: string }) {
  const sign = useMemo(() => signTexture(p.name, "#6b1f2a", font), [p, font]);
  useEffect(() => () => sign.dispose(), [sign]);
  const hd = p.d / 2,
    floor = p.h * 0.48,
    r = p.d / Math.sqrt(3);
  const canopy = { y: floor - 0.5, out: 1.7, w: p.w * 0.56 };
  const bulbs = Array.from({ length: 9 }, (_, i) => -canopy.w / 2 + 0.4 + (i * (canopy.w - 0.8)) / 8);
  return (
    <group position={[p.x, 0, p.z]} rotation-y={p.rot} {...placeEvents(p)}>
      {/* the hall, its plinth, the band between the floors and the cornice */}
      <Part geometry={geo.box(p.w, p.h, p.d)} color={p.wall} outline={0.08} position-y={p.h / 2} />
      <Part geometry={geo.box(p.w + 0.2, 0.4, p.d + 0.2)} color={STONE} outline={0.04} position-y={0.2} />
      <Part geometry={geo.box(p.w + 0.16, 0.22, p.d + 0.16)} color={STONE} outline={0.03} position-y={floor} />
      <Part geometry={geo.box(p.w + 0.3, 0.35, p.d + 0.3)} color={STONE} outline={0.04} position-y={p.h} />
      {/* the parapet along the front, with a pediment over the middle, and the slate roof behind */}
      <Part geometry={geo.box(p.w + 0.3, 0.6, 0.3)} color={STONE} outline={0.04} position={[0, p.h + 0.45, hd]} />
      <group position={[0, p.h + 0.55, hd]}>
        <Part geometry={geo.cyl(1.6, 1.6, 0.5, 3)} color={STONE} outline={0.05} rotation-x={-Math.PI / 2} scale={[2.2, 1, 0.55]} position-y={0.45} />
      </group>
      <group position-y={p.h + 0.17 + r * 0.275} rotation-y={Math.PI / 2}>
        <Part geometry={geo.cyl(r, r, p.w - 0.3, 3)} color={p.roof} outline={0.07} rotation-x={-Math.PI / 2} scale={[1, 1, 0.5]} />
      </group>
      {/* three round-headed windows upstairs */}
      {[-3.4, 0, 3.4].map((x) => (
        <Arched key={x} w={1.3} h={1.7} x={x} y={floor + 0.7} z={hd + 0.05} />
      ))}
      {/* the doors, the playbills either side and a window at each end */}
      <Part geometry={geo.box(2.8, 2.8, 0.2)} color={STONE} outline={0.04} position={[0, 1.4, hd + 0.08]} />
      <Part geometry={geo.box(2.4, 2.5, 0.1)} color={DOOR} outline={0.03} position={[0, 1.25, hd + 0.2]} />
      <Part geometry={geo.box(0.08, 2.5, 0.12)} color={STONE} outline={0} position={[0, 1.25, hd + 0.24]} />
      {[-1, 1].map((s, i) => (
        <group key={s} position={[s * 2.6, 1.6, hd + 0.08]}>
          <Part geometry={geo.box(1.3, 1.7, 0.1)} color={CANOPY} outline={0.03} />
          <Part geometry={geo.box(1.05, 1.45, 0.12)} color={BILLS[i]} outline={0} position-z={0.02} />
        </group>
      ))}
      {[-1, 1].map((s) => (
        <Part key={s} geometry={geo.box(1.2, 1.4, 0.15)} color={WINDOW} outline={0.03} position={[s * 5, 1.9, hd + 0.05]} />
      ))}
      {/* the canopy over the pavement, on two iron columns, with the name on the fascia and bulbs along its top */}
      <Part geometry={geo.box(canopy.w, 0.16, canopy.out)} color={CANOPY} outline={0.04} position={[0, canopy.y, hd + canopy.out / 2]} />
      <Part geometry={geo.box(canopy.w, 0.9, 0.12)} color={DOOR} outline={0.04} position={[0, canopy.y - 0.45, hd + canopy.out]} />
      {[-1, 1].map((s) => (
        <Part key={s} geometry={geo.cyl(0.09, 0.09, canopy.y - 0.9, 8)} color={FRAME} outline={0.02} position={[(s * canopy.w) / 2 - s * 0.35, (canopy.y - 0.9) / 2, hd + canopy.out - 0.3]} />
      ))}
      {bulbs.map((x) => (
        <Part key={x} geometry={geo.sphere(0.1, 8, 6)} color={BULB} outline={0} shadow={false} position={[x, canopy.y + 0.18, hd + canopy.out - 0.1]} />
      ))}
      <mesh position={[0, canopy.y - 0.45, hd + canopy.out + 0.07]}>
        <planeGeometry args={[3.2, 0.8]} />
        <meshBasicMaterial map={sign} toneMapped={false} />
      </mesh>
    </group>
  );
}
