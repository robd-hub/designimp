import { useEffect, useMemo } from "react";
import type { Place } from "./places";
import { Part, geo, toon, signTexture, INK, WINDOW } from "./toon";
import { placeEvents } from "./store";
import { BUS_STATION } from "./colliders";

const TARMAC = 0x6b6573;
const KERB = 0xe8dcc2;
const SAFETY = 0xffd23f;
const COLUMN = 0xf4f1ea;

// A flat strip of ground in world coordinates.
function Ground({ r, color, y }: { r: { x0: number; x1: number; z0: number; z1: number }; color: number; y: number }) {
  return (
    <mesh geometry={geo.box(r.x1 - r.x0, 0.04, r.z1 - r.z0)} material={toon(color)} position={[(r.x0 + r.x1) / 2, y, (r.z0 + r.z1) / 2]} receiveShadow />
  );
}

// Lincoln Central Bus Station, simplified: a long glazed concourse with a white canopy reaching out over
// the kerb, a bay at each stop with its own sign, and the bus lane looping in off the main road and out again.
// The kerb, lanes and bays are in world coordinates.
export function BusStation({ p, font }: { p: Place; font: string }) {
  const sign = useMemo(() => signTexture(p.name, "#2f8f5b", font), [p, font]);
  const bays = useMemo(() => BUS_STATION.stops.map((_, i) => signTexture(`Bay ${String.fromCharCode(65 + i)}`, "#2b59c3", font)), [font]);
  useEffect(
    () => () => {
      sign.dispose();
      bays.forEach((b) => b.dispose());
    },
    [sign, bays],
  );
  const hw = p.w / 2,
    hd = p.d / 2;
  const { kerb } = BUS_STATION;
  const reach = kerb.z1 - kerb.z0 + 0.3; // how far the canopy reaches out in front of the concourse
  return (
    <>
      <group position={[p.x, 0, p.z]} rotation-y={p.rot} {...placeEvents(p)}>
        <Part geometry={geo.box(p.w, p.h, p.d)} color={p.wall} outline={0.09} position-y={p.h / 2} />
        {/* glazing all along the front, split into panes, with the doors in the middle */}
        <Part geometry={geo.box(p.w - 1.2, p.h - 0.9, 0.1)} color={WINDOW} outline={0.04} position={[0, (p.h - 0.9) / 2 + 0.15, hd + 0.03]} />
        {Array.from({ length: 11 }, (_, i) => -hw + 1.1 + (i * (p.w - 2.2)) / 10).map((x) => (
          <mesh key={x} geometry={geo.box(0.12, p.h - 0.9, 0.06)} material={toon(INK)} position={[x, (p.h - 0.9) / 2 + 0.15, hd + 0.1]} />
        ))}
        <Part geometry={geo.box(2.4, 2.4, 0.08)} color={0x8fd8f0} outline={0.03} position={[0, 1.35, hd + 0.11]} />
        <mesh geometry={geo.box(0.06, 2.3, 0.1)} material={toon(INK)} position={[0, 1.35, hd + 0.16]} />
        {/* the white roof, running on out over the kerb as the canopy, on slim columns along its edge */}
        <Part geometry={geo.box(p.w + 3, 0.35, p.d + reach + 0.6)} color={p.roof} outline={0.06} position={[0, p.h + 0.17, (reach + 0.6) / 2 - 0.3]} />
        {Array.from({ length: 6 }, (_, i) => -hw - 0.6 + (i * (p.w + 1.2)) / 5).map((x) => (
          <Part key={x} geometry={geo.cyl(0.12, 0.12, p.h, 8)} color={COLUMN} outline={0.03} position={[x, p.h / 2, hd + reach - 0.6]} />
        ))}
        {/* the name along the front of the canopy */}
        <mesh position={[0, p.h + 0.85, hd + reach + 0.05]}>
          <planeGeometry args={[5.2, 1.3]} />
          <meshBasicMaterial map={sign} toneMapped={false} />
        </mesh>
        <Part geometry={geo.box(5.4, 1.5, 0.12)} color={INK} outline={0} position={[0, p.h + 0.85, hd + reach - 0.03]} />
        {/* benches along the front, either side of the doors */}
        {[-7, -3.5, 3.5, 7].map((x) => (
          <Part key={x} geometry={geo.box(2, 0.45, 0.6)} color={0x8a5a33} outline={0.04} position={[x, 0.35, hd + 0.7]} />
        ))}
      </group>

      {/* the kerb under the canopy, the bus lane, and the ways in and out */}
      <Ground r={kerb} color={KERB} y={0.035} />
      {BUS_STATION.tarmac.map((r, i) => (
        <Ground key={i} r={r} color={TARMAC} y={0.04} />
      ))}
      <mesh geometry={geo.box(kerb.x1 - kerb.x0, 0.12, 0.3)} material={toon(0xf4f1ea)} position={[(kerb.x0 + kerb.x1) / 2, 0.06, kerb.z1 - 0.15]} />
      {/* a yellow box marked out at each bay, and the bay's sign at the kerb */}
      {BUS_STATION.stops.map((x, i) => (
        <group key={x} position={[x, 0, BUS_STATION.bay]}>
          {[-1.4, 1.4].map((z) => (
            <mesh key={z} geometry={geo.box(9, 0.04, 0.18)} material={toon(SAFETY)} position={[0, 0.06, z]} />
          ))}
          {[-4.5, 4.5].map((dx) => (
            <mesh key={dx} geometry={geo.box(0.18, 0.04, 2.98)} material={toon(SAFETY)} position={[dx, 0.06, 0]} />
          ))}
          <group position={[3.6, 0, kerb.z1 - BUS_STATION.bay - 0.6]}>
            <Part geometry={geo.cyl(0.07, 0.07, 2.6, 6)} color={INK} outline={0.02} position-y={1.3} />
            <Part geometry={geo.box(1.8, 0.55, 0.1)} color={0x2b59c3} outline={0.04} position-y={2.45} />
            {[0.06, -0.06].map((z) => (
              <mesh key={z} position={[0, 2.45, z]} rotation-y={z < 0 ? Math.PI : 0}>
                <planeGeometry args={[1.68, 0.42]} />
                <meshBasicMaterial map={bays[i]} toneMapped={false} />
              </mesh>
            ))}
          </group>
        </group>
      ))}
    </>
  );
}
