import { useEffect, useMemo } from "react";
import type { ThreeElements } from "@react-three/fiber";
import type { Place } from "./places";
import { Part, geo, signTexture, WINDOW, INK } from "./toon";
import { placeEvents } from "./store";

const DRESSING = 0xe6dcc6; // the stone dressings on the red brick
const DOOR = 0x5a3a22;

// Prism roof running along local z; r is the triangle's circumradius.
function Ridge({ r, len, color, ...g }: { r: number; len: number; color: number } & Omit<ThreeElements["group"], "children">) {
  return (
    <group {...g}>
      <Part geometry={geo.cyl(r, r, len, 3)} color={color} outline={0.07} rotation-x={-Math.PI / 2} scale={[1, 1, 0.55]} />
    </group>
  );
}

// A round-headed first-floor window in its stone surround, with a keystone at the top of the arch.
function Arched({ w, h, ...g }: { w: number; h: number } & Omit<ThreeElements["group"], "children">) {
  const r = w / 2;
  return (
    <group {...g}>
      <Part geometry={geo.box(w + 0.24, h, 0.1)} color={DRESSING} outline={0.03} position-y={h / 2} />
      <Part geometry={geo.cyl(r + 0.12, r + 0.12, 0.1, 16)} color={DRESSING} outline={0.03} position-y={h} rotation-x={Math.PI / 2} />
      <Part geometry={geo.box(w, h, 0.12)} color={WINDOW} outline={0} position={[0, h / 2, 0.02]} />
      <Part geometry={geo.cyl(r, r, 0.12, 16)} color={WINDOW} outline={0} position={[0, h, 0.02]} rotation-x={Math.PI / 2} />
      <Part geometry={geo.box(0.16, 0.26, 0.16)} color={DRESSING} outline={0.02} position={[0, h + r - 0.08, 0.04]} />
    </group>
  );
}

// The Corn Exchange on Cornhill, after the real 1879 building: an Italianate hall in red brick with stone
// dressings, twelve bays along its south front. Eleven are two storeys, square-headed openings below and
// round-headed windows above; the bay at the west end stands a storey taller, with three-light windows,
// a wide opening at the bottom and a gable with a diamond date stone. The slate roof ends in a pedimented
// gable at the east end.
export function CornExchange({ p, font }: { p: Place; font: string }) {
  const sign = useMemo(() => signTexture(p.name, "#7a2e22", font), [p, font]);
  useEffect(() => () => sign.dispose(), [sign]);
  const hw = p.w / 2,
    hd = p.d / 2,
    floor = p.h / 2;
  const gable = { w: 2.6, h: p.h + 2.4 };
  const gx = -hw + gable.w / 2;
  const run = p.w - gable.w,
    bay = run / 11;
  const bays = Array.from({ length: 11 }, (_, i) => -hw + gable.w + bay * (i + 0.5));
  const door = bays.reduce((m, x) => (Math.abs(x) < Math.abs(m) ? x : m)); // the doors at the middle of the front
  const r = p.d / Math.sqrt(3);
  return (
    <group position={[p.x, 0, p.z]} rotation-y={p.rot} {...placeEvents(p)}>
      {/* the long hall, its plinth, the stone band between the floors and the cornice under the eaves */}
      <Part geometry={geo.box(run, p.h, p.d)} color={p.wall} outline={0.08} position={[gable.w / 2, p.h / 2, 0]} />
      <Part geometry={geo.box(p.w + 0.2, 0.4, p.d + 0.2)} color={DRESSING} outline={0.04} position-y={0.2} />
      <Part geometry={geo.box(run, 0.22, p.d + 0.16)} color={DRESSING} outline={0.03} position={[gable.w / 2, floor, 0]} />
      <Part geometry={geo.box(run + 0.3, 0.35, p.d + 0.4)} color={DRESSING} outline={0.04} position={[gable.w / 2, p.h, 0]} />
      <Ridge r={r} len={run + 0.1} color={p.roof} position={[gable.w / 2, p.h + 0.17 + r * 0.275, 0]} rotation-y={Math.PI / 2} />
      {/* the pediment on the east end gable */}
      <Ridge r={r + 0.2} len={0.2} color={DRESSING} position={[hw + 0.12, p.h + 0.17 + r * 0.275 - 0.05, 0]} rotation-y={Math.PI / 2} />
      {bays.map((x) => (
        <group key={x} position={[x, 0, hd + 0.03]}>
          {x === door ? (
            <Part geometry={geo.box(bay - 0.3, 2.3, 0.12)} color={DOOR} outline={0.04} position-y={1.55} />
          ) : (
            <Part geometry={geo.box(bay - 0.35, 2.1, 0.12)} color={WINDOW} outline={0.03} position-y={1.55} />
          )}
          <Part geometry={geo.box(bay - 0.1, 0.2, 0.18)} color={DRESSING} outline={0.02} position-y={2.75} />
          <Arched w={bay * 0.5} h={1.3} position={[0, floor + 0.45, 0]} />
        </group>
      ))}
      {/* the taller west end bay, with its mansard roof behind the gable */}
      <group position-x={gx}>
        <Part geometry={geo.box(gable.w, gable.h, p.d + 0.1)} color={p.wall} outline={0.08} position-y={gable.h / 2} />
        <Part geometry={geo.box(gable.w + 0.3, 0.35, p.d + 0.45)} color={DRESSING} outline={0.04} position-y={gable.h} />
        <Part geometry={geo.box(gable.w - 0.3, 1.2, p.d - 1.6)} color={p.roof} outline={0.05} position={[0, gable.h + 0.7, -0.6]} />
        {/* cresting along the top of the mansard */}
        {[-0.7, 0, 0.7].map((x) => (
          <Part key={x} geometry={geo.box(0.08, 0.3, 0.08)} color={INK} outline={0} position={[x, gable.h + 1.45, -0.6]} />
        ))}
        <Ridge r={gable.w / Math.sqrt(3)} len={1.4} color={p.wall} position={[0, gable.h + 0.17 + (gable.w / Math.sqrt(3)) * 0.275, hd - 0.6]} />
        <Part geometry={geo.box(0.36, 0.36, 0.1)} color={DRESSING} outline={0.02} position={[0, gable.h + 0.62, hd + 0.13]} rotation-z={Math.PI / 4} />
        <Part geometry={geo.box(gable.w - 0.5, 2.7, 0.12)} color={DOOR} outline={0.04} position={[0, 1.75, hd + 0.08]} />
        {[floor + 0.5, p.h + 0.4].map((y) =>
          [-0.7, 0, 0.7].map((x) => <Part key={`${x},${y}`} geometry={geo.box(0.5, 1.3, 0.12)} color={WINDOW} outline={0.03} position={[x, y + 0.65, hd + 0.08]} />),
        )}
      </group>
      <mesh position={[door, floor - 0.05, hd + 0.16]}>
        <planeGeometry args={[3.6, 0.9]} />
        <meshBasicMaterial map={sign} toneMapped={false} />
      </mesh>
    </group>
  );
}
