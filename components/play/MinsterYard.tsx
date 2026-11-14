"use client";

import { useMemo, type ReactNode } from "react";
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
// ---------------------------------------------------------------------------------------------
// More of the close (laid out in MINSTER, colliders.ts): scenery without cards, drawn without photos to go on, so the
// shapes are generic: old houses, the stone Deanery with its porch, the Chancery's red-brick front with its stone
// doorway and an oriel window, and the Old Palace's walled grounds below its vineyard terrace.
type Box = { x: number; z: number; w: number; d: number };
// A house facing one way ("s", "w" or "n"), in world coordinates; local x runs along its front.
function CloseHouse({ b, face, h, wall, roof, door, children }: { b: Box; face: "s" | "w" | "n"; h: number; wall: number; roof: number; door: number; children?: ReactNode }) {
  const side = face === "w";
  const w = side ? b.d : b.w,
    d = side ? b.w : b.d;
  const r = useRoof(d + 0.4, 1.7, w + 0.1);
  const rot = face === "s" ? 0 : face === "n" ? Math.PI : -Math.PI / 2;
  const front = d / 2 + 0.03;
  const across = Math.max(1, Math.round(w / 2.4));
  return (
    <group position={[b.x, groundY(b.z), b.z]} rotation-y={rot}>
      <Part geometry={geo.box(w, h + 0.6, d)} color={wall} outline={0.04} position-y={h / 2 - 0.3} />
      <Part geometry={r} color={roof} outline={0.04} position-y={h} />
      <Part geometry={geo.box(0.6, 1.3, 0.6)} color={0x8a5a44} outline={0.03} position={[w / 2 - 0.7, h + 1.1, -0.5]} />
      <Part geometry={geo.box(0.9, 1.8, 0.1)} color={door} outline={0.03} position={[0, 0.9, front]} />
      {Array.from({ length: across }, (_, i) => -w / 2 + (w / across) * (i + 0.5)).flatMap((x) => [
        <mesh key={`u${x}`} geometry={geo.box(0.8, 1, 0.06)} material={toon(WINDOW)} position={[x, h - 1.4, front]} />,
        ...(Math.abs(x) > 0.8 ? [<mesh key={`l${x}`} geometry={geo.box(0.8, 1, 0.06)} material={toon(WINDOW)} position={[x, 1.5, front]} />] : []),
      ])}
      {children}
    </group>
  );
}

function NamePlate({ text, font, y, z }: { text: string; font: string; y: number; z: number }) {
  const map = useSign(text, "#2b2633", font);
  return (
    <>
      <Part geometry={geo.box(2.8, 0.6, 0.08)} color={0xfff8e7} outline={0.03} position={[0, y, z]} />
      <Sign map={map} w={2.6} h={0.5} position={[0, y, z + 0.05]} />
    </>
  );
}

const CLOSE_WALLS = [0xd8c3a0, 0xe8e0cf, 0xc98f6e];
const CLOSE_ROOFS = [0x5b6b7a, 0x6e4a3a, 0x8a5a33];
const BRICK_FRONT = 0xa4472f;
const GROUND_WALL = 0xb8a67f;

function PalaceGrounds() {
  const g = MINSTER.grounds;
  const vines = useMemo(() => {
    const out: Inst[] = [];
    for (let z = g.z0 + 2; z < g.z1 - 1.5; z += 2.4) for (let x = g.x0 + 2.5; x < g.x1 - 2; x += 1.6) out.push({ at: [x, groundY(z) + 0.85, z], scale: [1.4, 0.8, 0.6] });
    return out;
  }, [g]);
  const posts = useMemo(() => vines.map((v) => ({ at: [v.at[0], v.at[1] - 0.35, v.at[2]] as V3 })), [vines]);
  // a low wall round the west, south and east sides in short lengths down the slope, a gate in the east side
  const gate = (g.z0 + g.z1) / 2;
  const walls = useMemo(() => {
    const out: Inst[] = [];
    for (let x = g.x0 + 0.5; x < g.x1; x += 1) out.push({ at: [x, groundY(g.z1) + 0.35, g.z1] });
    for (let z = g.z0 + 0.5; z < g.z1; z += 1) {
      out.push({ at: [g.x0, groundY(z) + 0.35, z], rot: [0, Math.PI / 2, 0] });
      if (Math.abs(z - gate) > 1.2) out.push({ at: [g.x1, groundY(z) + 0.35, z], rot: [0, Math.PI / 2, 0] });
    }
    return out;
  }, [g, gate]);
  return (
    <group raycast={() => null}>
      <Strip w={g.x1 - g.x0} d={g.z1 - g.z0} color={0x7cc46a} x={(g.x0 + g.x1) / 2} z={(g.z0 + g.z1) / 2} y={0.03} />
      <Strip w={g.x1 - g.x0 - 1} d={1.2} color={0xe8dcc2} x={(g.x0 + g.x1) / 2 + 0.5} z={gate} y={0.05} />
      <Many geometry={geo.box(1.02, 0.7, 0.4)} color={GROUND_WALL} list={walls} />
      <Many geometry={geo.cyl(0.05, 0.05, 1, 6)} color={0x6b4a2e} list={posts} />
      <Many geometry={geo.sphere(0.4, 10, 8)} color={0x4f9a3a} list={vines} />
      {[g.x0 + 3, g.x0 + 9].map((x) => (
        <group key={x} position={[x, groundY(gate), gate - 1.1]}>
          <Part geometry={geo.box(1.6, 0.12, 0.5)} color={0x8a5a33} outline={0.02} position-y={0.45} />
          <Part geometry={geo.box(1.6, 0.5, 0.1)} color={0x8a5a33} outline={0.02} position={[0, 0.75, -0.22]} />
        </group>
      ))}
    </group>
  );
}

export function MoreClose({ font }: { font: string }) {
  const dn = MINSTER.deanery,
    ch = MINSTER.chancery;
  return (
    <group raycast={() => null}>
      {MINSTER.closeWest.map((b, i) => (
        <CloseHouse key={b.x} b={b} face="s" h={[4.8, 5.6, 4.4][i]} wall={CLOSE_WALLS[i]} roof={CLOSE_ROOFS[i]} door={YARD_DOORS[i]} />
      ))}
      {MINSTER.east.map((b, i) => (
        <CloseHouse key={b.z} b={b} face="w" h={[5, 4.4, 5.4][i]} wall={CLOSE_WALLS[(i + 1) % 3]} roof={CLOSE_ROOFS[(i + 2) % 3]} door={YARD_DOORS[i + 1]} />
      ))}
      {/* the Deanery: a bigger stone house with a porch, looking south across the lawn */}
      <CloseHouse b={dn} face="s" h={6.4} wall={0xd8c9a8} roof={0x5b6470} door={0x2f4a3a}>
        <Part geometry={geo.box(2.6, 2.8, 1.4)} color={STONE_DARK} outline={0.04} position={[0, 1.4, dn.d / 2 + 0.7]} />
        <Part geometry={geo.box(1, 1.9, 0.1)} color={0x2f4a3a} outline={0.03} position={[0, 0.95, dn.d / 2 + 1.42]} />
        <NamePlate text="The Deanery" font={font} y={2.35} z={dn.d / 2 + 1.45} />
      </CloseHouse>
      {/* the Chancery: a red-brick front with a stone doorway and an oriel window above it, facing the east end */}
      <CloseHouse b={ch} face="w" h={5.6} wall={BRICK_FRONT} roof={0x8a5a33} door={0x5a3a22}>
        <Part geometry={geo.box(1.6, 2.4, 0.2)} color={STONE_DARK} outline={0.03} position={[0, 1.2, ch.w / 2 + 0.06]} />
        <Part geometry={geo.box(1, 1.8, 0.1)} color={0x5a3a22} outline={0.03} position={[0, 0.9, ch.w / 2 + 0.18]} />
        <Part geometry={geo.box(2.2, 1.6, 0.8)} color={STONE_DARK} outline={0.04} position={[2.8, 3.6, ch.w / 2 + 0.4]} />
        <mesh geometry={geo.box(1.8, 1.1, 0.06)} material={toon(WINDOW)} position={[2.8, 3.6, ch.w / 2 + 0.82]} />
        <NamePlate text="The Chancery" font={font} y={2.9} z={ch.w / 2 + 0.1} />
      </CloseHouse>
      <PalaceGrounds />
    </group>
  );
}

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
