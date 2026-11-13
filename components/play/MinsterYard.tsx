"use client";

import { useMemo } from "react";
import type { Place } from "./places";
import { Part, geo, toon, WINDOW, LAMP, STONE_DARK } from "./toon";
import { placeEvents } from "./store";
import { EXCHEQUER, MINSTER } from "./colliders";
import { groundY, Strip } from "./terrain";
import { Many, Sign, useRoof, useSign, type Inst } from "./MoreLandmarks";

type V3 = [number, number, number];
type Props = { p: Place; font: string; reduce: boolean };

const GATE_STONE = 0xcbbd9f;
const E = EXCHEQUER;

// ---------------------------------------------------------------------------------------------
// The Exchequer Gate: a three-storey battlemented stone gatehouse, its big arch in line with the cathedral's west
// door and a small footway arch either side. Local x runs along it (world z), local +z out of its face onto the square.
export function Gatehouse({ p, font }: Props) {
  const sign = useSign(p.name, "#5e4a2e", font);
  const spring = 3.4,
    span = E.arch * 2,
    foot = (E.foot[0] + E.foot[1]) / 2,
    footSpan = E.foot[1] - E.foot[0];
  const merlons = useMemo(() => {
    const out: Inst[] = [];
    for (let x = -p.w / 2 + 0.35; x <= p.w / 2 - 0.3; x += 1.25) for (const z of [-p.d / 2 + 0.2, p.d / 2 - 0.2]) out.push({ at: [x, p.h + 0.3, z] });
    return out;
  }, [p.w, p.d, p.h]);
  // small windows on the two upper floors, both faces, lit at night
  const windows = useMemo(
    () =>
      [-1, 1].flatMap((s) => [
        ...[-5, -2.2, 2.2, 5].map((x) => ({ at: [x, 7.4, s * (p.d / 2 + 0.03)] as V3 })),
        ...[-5, 5].map((x) => ({ at: [x, 5.6, s * (p.d / 2 + 0.03)] as V3 })),
      ]),
    [p.d],
  );
  return (
    <group position={[p.x, 0, p.z]} rotation-y={p.rot} {...placeEvents(p)}>
      <Part geometry={geo.box(p.w + 0.3, 0.4, p.d + 0.3)} color={STONE_DARK} outline={0.03} position-y={-0.15} />
      <Part
        geometry={geo.arches(p.w, p.h, p.d, [
          [-foot, footSpan, 1.9],
          [0, span, spring],
          [foot, footSpan, 1.9],
        ])}
        color={GATE_STONE}
        outline={0.05}
      />
      {/* string courses between the floors, and the battlements */}
      <Part geometry={geo.box(p.w + 0.2, 0.22, p.d + 0.2)} color={STONE_DARK} outline={0.03} position-y={6.6} />
      <Part geometry={geo.box(p.w + 0.2, 0.25, p.d + 0.2)} color={STONE_DARK} outline={0.03} position-y={p.h - 0.1} />
      <Many geometry={geo.box(0.7, 0.6, 0.4)} color={GATE_STONE} list={merlons} />
      {/* a hood over the big arch on each face */}
      {[-1, 1].map((s) => (
        <mesh key={s} geometry={geo.box(span + 0.8, 0.22, 0.12)} material={toon(STONE_DARK)} position={[0, spring + span / 2 + 0.35, s * (p.d / 2 + 0.06)]} />
      ))}
      <Many geometry={geo.box(0.6, 0.9, 0.06)} color={WINDOW} list={windows} />
      {/* the name over the arch on the square side, and a lantern either side of it */}
      <Part geometry={geo.box(3.2, 0.7, 0.08)} color={0x2b2633} outline={0.03} position={[0, 5.75, p.d / 2 + 0.05]} />
      <Sign map={sign} w={3} h={0.6} position={[0, 5.75, p.d / 2 + 0.1]} />
      {[-1, 1].map((s) => (
        <group key={s} position={[s * 2.3, 3.4, p.d / 2]}>
          <mesh geometry={geo.box(0.08, 0.08, 0.4)} material={toon(0x2b2633)} position-z={0.2} />
          <Part geometry={geo.box(0.32, 0.45, 0.32)} color={LAMP} outline={0.03} position={[0, -0.2, 0.42]} />
        </group>
      ))}
    </group>
  );
}

// ---------------------------------------------------------------------------------------------
// Minster Yard's close houses: a terrace of old stone, brick and rendered houses along the north side of the lawn,
// looking south across it to the cathedral.
const YARD_WALLS = [0xe0d2b4, 0xc98f6e, 0xe8e0cf, 0xd8c3a0, 0xb8735a];
const YARD_HEIGHTS = [4.6, 5.4, 4.2, 5.8, 4.8];
const YARD_DOORS = [0x2f4a3a, 0x1f2a4a, 0x7a1f3d, 0x2b2633, 0x2f4a3a];
export function Yard({ p, font }: Props) {
  const sign = useSign(p.name, "#2b2633", font);
  const n = YARD_WALLS.length,
    each = p.w / n;
  const roof = useRoof(p.d + 0.4, 1.7, each + 0.1);
  const front = p.d / 2;
  const houses = useMemo(() => YARD_WALLS.map((wall, i) => ({ x: -p.w / 2 + each * (i + 0.5), h: YARD_HEIGHTS[i], wall, door: YARD_DOORS[i] })), [p.w, each]);
  const windows = useMemo(
    () =>
      houses.flatMap(({ x, h }, i) => [
        ...(i % 2 ? [0.4, 2] : [-0.2, 1.8]).map((dx) => ({ at: [x + dx, 1.5, front + 0.03] as V3 })),
        ...[-1.8, 0, 1.8].map((dx) => ({ at: [x + dx, h - 1.3, front + 0.03] as V3 })),
      ]),
    [houses, front],
  );
  return (
    <group position={[p.x, 0, p.z]} rotation-y={p.rot} {...placeEvents(p)}>
      {houses.map(({ x, h, wall, door }, i) => (
        <group key={x} position-x={x}>
          <Part geometry={geo.box(each, h + 0.4, p.d)} color={wall} outline={0.04} position-y={h / 2 - 0.2} />
          <Part geometry={roof} color={p.roof} outline={0.04} position-y={h} />
          <Part geometry={geo.box(0.6, 1.3, 0.6)} color={0x8a5a44} outline={0.03} position={[i % 2 ? -2 : 2.2, h + 1.2, -0.7]} />
          <Part geometry={geo.box(0.9, 1.7, 0.1)} color={door} outline={0.03} position={[i % 2 ? -1.6 : -1.9, 0.85, front + 0.03]} />
        </group>
      ))}
      <Many geometry={geo.box(0.8, 1, 0.06)} color={WINDOW} list={windows} />
      {/* the name, on the middle house by the end of the path */}
      <Part geometry={geo.box(3.2, 0.7, 0.08)} color={0xfff8e7} outline={0.03} position={[0, 3.1, front + 0.06]} />
      <Sign map={sign} w={3} h={0.6} position={[0, 3.1, front + 0.11]} />
    </group>
  );
}

// ---------------------------------------------------------------------------------------------
// The rest of the yard, in world coordinates: the forecourt's setts, the stubs of the close wall either side of the
// gate, the lawn in front of the close houses, the row of houses on the south side and a few lamps on the path.
export const SETTS = 0xcdbf9f;
const SOUTH_WALLS = [0xd8c3a0, 0xe8e0cf, 0xc98f6e, 0xe0d2b4, 0xb8735a];
const SOUTH_ROOFS = [0x6e4a3a, 0x5b6b7a, 0x6e4a3a, 0x8a5a33, 0x5b6b7a];
export const YARD_LAMPS: [number, number][] = [45, 60, 82].map((x) => [x, MINSTER.lawn.z1 - 0.6]);
export function MinsterGrounds() {
  const f = MINSTER.forecourt,
    l = MINSTER.lawn;
  const h0 = MINSTER.south[0];
  const southRoof = useRoof(h0.d + 0.4, 1.6, h0.w + 0.1);
  return (
    <>
      <Strip w={f.x1 - f.x0} d={f.z1 - f.z0} color={SETTS} x={(f.x0 + f.x1) / 2} z={(f.z0 + f.z1) / 2} y={0.05} raycast={() => null} />
      <Strip w={l.x1 - l.x0} d={l.z1 - l.z0} color={0x8cc46a} x={(l.x0 + l.x1) / 2} z={(l.z0 + l.z1) / 2} y={0.02} raycast={() => null} />
      {[-1, 1].map((s) => {
        const z = E.z + s * (E.half + E.stub / 2);
        return (
          <group key={s} position={[E.x, groundY(z), z]}>
            <Part geometry={geo.box(E.t * 2, 2.2, E.stub)} color={STONE_DARK} outline={0.04} position-y={1.1} />
            <Part geometry={geo.box(E.t * 2 + 0.25, 0.2, E.stub)} color={GATE_STONE} outline={0.03} position-y={2.3} />
          </group>
        );
      })}
      {MINSTER.south.map((h, i) => {
        // on the hillside: the floor is level with the path in front, and the wall runs down to the ground behind
        const front = groundY(h.z - h.d / 2),
          back = groundY(h.z + h.d / 2),
          tall = 4.4 + (i % 2) * 0.8;
        return (
          <group key={h.x} position={[h.x, front, h.z]}>
            <Part geometry={geo.box(h.w, tall + front - back, h.d)} color={SOUTH_WALLS[i]} outline={0.04} position-y={(tall - (front - back)) / 2} />
            <Part geometry={southRoof} color={SOUTH_ROOFS[i]} outline={0.04} position-y={tall} />
            <Part geometry={geo.box(0.9, 1.7, 0.1)} color={0x2b2633} outline={0.03} position={[i % 2 ? 1.6 : -1.6, 0.85, -h.d / 2 - 0.03]} />
            {[-1.8, 1.8].map((dx) => (
              <mesh key={dx} geometry={geo.box(0.8, 1, 0.06)} material={toon(WINDOW)} position={[dx, tall - 1.3, -h.d / 2 - 0.03]} />
            ))}
            <mesh geometry={geo.box(0.8, 1, 0.06)} material={toon(WINDOW)} position={[i % 2 ? -1.4 : 1.4, 1.5, -h.d / 2 - 0.03]} />
          </group>
        );
      })}
      {YARD_LAMPS.map(([x, z]) => (
        <group key={x} position={[x, groundY(z), z]}>
          <Part geometry={geo.cyl(0.08, 0.1, 2.6, 8)} color={0x2b2633} outline={0.03} position-y={1.3} />
          <Part geometry={geo.sphere(0.24)} color={LAMP} outline={0.04} position-y={2.7} />
        </group>
      ))}
    </>
  );
}
