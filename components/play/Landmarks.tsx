import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, type ThreeElements } from "@react-three/fiber";
import type { Place } from "./places";
import { Part, geo, toon, signTexture, INK, WINDOW, LAMP, STONE, STONE_DARK } from "./toon";
import { placeEvents } from "./store";
import { BRAYFORD, CANNONS, CASTLE, NEWPORT, RIVER, RIVER_RUNS, STONEBOW, STREET_ROW, seeded, streetHouses } from "./colliders";
import { Strip, groundY, groundTilt, humpY, FOOT_HUMP } from "./terrain";
import { useRoof } from "./MoreLandmarks";

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

// The Stonebow, simplified from its south front: a low segmental arch over the street between two
// round buttresses with niches, two narrow walkway arches either side, the Guildhall's windows above
// (four sashes on the left, three on the right, then a pair of mullioned windows each side), battlements,
// a stepped gable with a clock over the middle, and the old Mote Bell in a little cupola on the roof.
export function Stonebow({ p, font }: { p: Place; font: string }) {
  const sign = useMemo(() => signTexture(p.name, "#5b6b7a", font), [p, font]);
  const { half, d, arches } = STONEBOW;
  const top = p.h,
    mid = arches[0][1] / 2, // half the main arch's span
    side = half - mid - 0.8; // length of each side range, out from the buttresses
  return (
    <group position={[p.x, 0, p.z]} rotation-y={p.rot} {...placeEvents(p)}>
      {/* paving carried out under the walkway arches */}
      <mesh geometry={geo.box(half * 2 + 1, 0.05, d + 3)} material={toon(0xd9ccb2)} position-y={0.05} receiveShadow />
      <Part geometry={geo.arches(half * 2, top, d, arches)} color={STONE} outline={0.08} />
      {/* the roll-moulded ring round each arch, on both faces */}
      {[-1, 1].flatMap((sz) =>
        arches.slice(1).map(([x, span, spring]) => (
          <Part key={`${sz}${x}`} geometry={geo.smile(span / 2 + 0.12, 0.12)} color={STONE_DARK} outline={0.03} position={[x, spring, sz * (d / 2 + 0.04)]} rotation-z={Math.PI} scale={[1, 1, 0.4]} />
        )),
      )}
      {[-1, 1].map((sz) => (
        <Part key={sz} geometry={geo.box(mid * 2 + 0.3, 0.3, 0.2)} color={STONE_DARK} outline={0.03} position={[0, arches[0][2] + arches[0][3]! + 0.15, sz * (d / 2 + 0.05)]} />
      ))}
      {/* round buttresses either side of the main arch on the south front, each with a canopied niche */}
      {[-1, 1].map((sx) => (
        <group key={sx} position={[sx * (mid + 0.4), 0, d / 2]}>
          <Part geometry={geo.cyl(0.45, 0.5, top + 0.5, 10)} color={STONE} outline={0.06} position-y={(top + 0.5) / 2} />
          <Part geometry={geo.cone(0.5, 0.8, 10)} color={STONE_DARK} outline={0.04} position-y={top + 0.9} />
          <Part geometry={geo.box(0.5, 0.9, 0.2)} color={0x6e6457} outline={0.03} position={[0, 4.6, 0.38]} />
          <Part geometry={geo.cone(0.38, 0.45, 4)} color={STONE_DARK} outline={0.03} position={[0, 5.3, 0.36]} rotation-y={Math.PI / 4} scale={[1, 1, 0.5]} />
        </group>
      ))}
      {/* over the main arch: the tablet (here, the sign) and a pair of two-light windows */}
      {[-1, 1].flatMap((sz) =>
        [-1.1, 1.1].flatMap((x) =>
          [-0.26, 0.26].map((dx) => <Part key={`${sz}${x}${dx}`} geometry={geo.box(0.42, 1.1, 0.2)} color={WINDOW} outline={0.03} position={[x + dx, 6.1, sz * (d / 2 + 0.06)]} />),
        ),
      )}
      {/* the side ranges: sashes on the lower floor (four left, three right), mullioned windows above */}
      {[-1, 1].flatMap((sz) =>
        [-1, 1].flatMap((sx) => {
          const n = sx < 0 ? 4 : 3;
          const sashes = Array.from({ length: n }, (_, i) => mid + 0.8 + ((i + 0.5) * side) / n);
          return [
            ...sashes.map((x) => <Part key={`s${sz}${sx}${x}`} geometry={geo.box(0.62, 1.05, 0.2)} color={WINDOW} outline={0.03} position={[sx * x, 4.3, sz * (d / 2 + 0.06)]} />),
            ...[0.27, 0.73].flatMap((f) =>
              [-0.34, 0.34].map((dx) => (
                <Part key={`m${sz}${sx}${f}${dx}`} geometry={geo.box(0.6, 0.85, 0.2)} color={WINDOW} outline={0.03} position={[sx * (mid + 0.8 + f * side) + dx, 6.4, sz * (d / 2 + 0.06)]} />
              )),
            ),
          ];
        }),
      )}
      {/* battlements along the side ranges */}
      {[-1, 1].flatMap((sz) =>
        [-1, 1].flatMap((sx) =>
          Array.from({ length: 4 }, (_, i) => (
            <Part key={`${sz}${sx}${i}`} geometry={geo.box(0.7, 0.6, 0.45)} color={STONE} outline={0.04} position={[sx * (mid + 1.3 + (i * (side - 1)) / 3), top + 0.3, sz * (d / 2 - 0.2)]} />
          )),
        ),
      )}
      {/* the stepped gable with its clock, on both faces */}
      {[-1, 1].map((sz) => (
        <group key={sz} position-z={sz * (d / 2 - 0.25)}>
          {[mid * 2, mid * 2 - 1.6, mid * 2 - 3.2].map((w, i) => (
            <Part key={w} geometry={geo.box(w, 0.6, 0.5)} color={STONE} outline={0.05} position-y={top + 0.3 + i * 0.6} />
          ))}
          <group position={[0, top + 0.85, sz * 0.27]} rotation-y={sz < 0 ? Math.PI : 0}>
            <Part geometry={geo.cyl(0.42, 0.42, 0.08, 20)} color={0xf4efe2} outline={0.03} rotation-x={Math.PI / 2} />
            <mesh geometry={geo.box(0.06, 0.32, 0.04)} material={toon(INK)} position={[0, 0.13, 0.06]} />
            <mesh geometry={geo.box(0.24, 0.06, 0.04)} material={toon(INK)} position={[0.1, 0, 0.06]} />
          </group>
        </group>
      ))}
      {/* the Mote Bell, raised on a little plinth so it shows over the gable */}
      <Part geometry={geo.box(1.4, 1, 1.4)} color={STONE} outline={0.04} position-y={top + 0.5} />
      <group position-y={top + 1}>
        {[-1, 1].flatMap((sx) =>
          [-1, 1].map((sz) => (
            <Part key={`${sx}${sz}`} geometry={geo.box(0.15, 1.3, 0.15)} color={STONE_DARK} outline={0.03} position={[sx * 0.5, 0.65, sz * 0.5]} />
          )),
        )}
        <Part geometry={geo.cone(1, 0.9, 4)} color={0x5b6b7a} outline={0.05} position-y={1.75} rotation-y={Math.PI / 4} />
        <Part geometry={geo.cone(0.32, 0.5, 12)} color={0xc8973a} outline={0.03} position-y={0.95} />
      </group>
      <mesh position={[0, 4.75, d / 2 + 0.06]}>
        <planeGeometry args={[3.4, 0.85]} />
        <meshBasicMaterial map={sign} toneMapped={false} />
      </mesh>
    </group>
  );
}

// An old cannon on a wooden carriage, barrel pointing out over Castle Square, with a pile of shot.
function Cannon(g: { position: [number, number, number] }) {
  return (
    <group {...g}>
      <Part geometry={geo.box(1, 0.5, 1.8)} color={0x6b4a2a} outline={0.05} position-y={0.55} />
      {[-1, 1].flatMap((sx) =>
        [-0.55, 0.6].map((z) => (
          <Part key={`${sx}${z}`} geometry={geo.cyl(0.45, 0.45, 0.16, 14)} color={0x4a3320} outline={0.04} position={[sx * 0.62, 0.45, z]} rotation-z={Math.PI / 2} />
        )),
      )}
      <group position={[0, 1, 0.1]} rotation-x={Math.PI / 2 - 0.15}>
        <Part geometry={geo.cyl(0.24, 0.34, 2.4, 14)} color={0x2b2633} outline={0.04} />
        <Part geometry={geo.cyl(0.3, 0.3, 0.14, 14)} color={0x2b2633} outline={0.03} position-y={1.15} />
      </group>
      <Part geometry={geo.sphere(0.32, 12, 8)} color={0x2b2633} outline={0.04} position={[0, 0.9, -1.05]} />
      {([[-0.25, 0.2], [0.25, 0.2], [0, 0.6]] as const).map(([x, y]) => (
        <Part key={`${x}${y}`} geometry={geo.sphere(0.22, 10, 8)} color={0x2b2633} outline={0.03} position={[x + 1.3, y, 0.6]} />
      ))}
    </group>
  );
}

// Lincoln Castle: a walkable bailey inside crenellated curtain walls, entered by the East Gate off Castle Square or the
// West Gate out the back. Cobb Hall stands at the north-east corner; on the south side are the two mottes, Lucy Tower's
// shell keep at the west end and the Observatory Tower at the east end; inside are the Victorian prison, the Magna Carta
// Vault and the Crown Court. Layout and collisions share CASTLE (colliders.ts), in the castle's own coordinates: x along
// the East Gate's wall (+x north), z from the back wall to the front (+z east).
const PRISON_BRICK = 0xa9553f,
  SLATE = 0x5b6b7a,
  GRAVEL = 0xd8c9a6,
  GRASS = 0x5fbf5b;
function CastleWall({ len, along, ...g }: { len: number; along: "x" | "z"; position: [number, number, number] }) {
  const { wall, thick } = CASTLE;
  return (
    <group {...g} rotation-y={along === "z" ? Math.PI / 2 : 0}>
      <Part geometry={geo.box(len, wall, thick)} color={CASTLE_STONE} outline={0.08} position-y={wall / 2} />
      <Crenels len={len} y={wall + 0.35} />
    </group>
  );
}
function RoundTower({ r, h, ...g }: { r: number; h: number; position: [number, number, number] }) {
  return (
    <group {...g}>
      <Part geometry={geo.cyl(r, r + 0.2, h, 14)} color={CASTLE_DARK} outline={0.08} position-y={h / 2} />
      <Part geometry={geo.cyl(r + 0.3, r + 0.3, 0.6, 14)} color={CASTLE_STONE} outline={0.06} position-y={h + 0.3} />
    </group>
  );
}
export function Castle({ p, font }: { p: Place; font: string }) {
  const sign = useMemo(() => signTexture(p.name, "#5b6b7a", font), [p, font]);
  const { hw, hd, westGate: wg, lucy, observatory: obs, prison, vault, court } = CASTLE;
  const mid = (a: number, b: number) => (a + b) / 2;
  return (
    <group position={[p.x, 0, p.z]} rotation-y={p.rot} {...placeEvents(p)}>
      <mesh geometry={geo.box(2 * hw - 1, 0.06, 2 * hd - 1)} material={toon(GRASS)} position-y={0.04} receiveShadow />
      {/* gravel paths: in from the East Gate, across, and out to the West Gate */}
      <Part geometry={geo.box(2, 0.04, hd + 1)} color={GRAVEL} position={[0, 0.08, (hd - 1) / 2]} />
      <Part geometry={geo.box(wg + 2, 0.04, 2)} color={GRAVEL} position={[wg / 2, 0.08, -1]} />
      <Part geometry={geo.box(2, 0.04, hd - 1)} color={GRAVEL} position={[wg, 0.08, (-hd - 1) / 2]} />
      {/* curtain walls: north and south full length, the back and front either side of their gates */}
      <CastleWall len={2 * hd} along="z" position={[hw, 0, 0]} />
      <CastleWall len={2 * hd} along="z" position={[-hw, 0, 0]} />
      <CastleWall len={wg - 2.2 + hw} along="x" position={[mid(-hw, wg - 2.2), 0, -hd]} />
      <CastleWall len={hw - wg - 2.2} along="x" position={[mid(wg + 2.2, hw), 0, -hd]} />
      <CastleWall len={hw - 3.2} along="x" position={[mid(-hw, -3.2), 0, hd]} />
      <CastleWall len={hw - 3.2} along="x" position={[mid(3.2, hw), 0, hd]} />
      {/* round towers at the north corners, Cobb Hall the big one at the north-east; the south corners are the mottes' */}
      <RoundTower r={2.2} h={7.5} position={[hw, 0, hd]} />
      <RoundTower r={1.7} h={7} position={[hw, 0, -hd]} />
      {/* the East Gate, open through its arch, its front flush with the wall's and the name over it */}
      <mesh geometry={geo.arches(6.4, 8, 3, [[0, 2.4, 2.4]])} material={toon(CASTLE_DARK)} position={[0, 0, hd - 0.9]} castShadow />
      <Crenels len={6.4} y={8.35} position={[0, 0, hd + 0.1]} />
      <mesh position={[0, 6.2, hd + 0.63]}>
        <planeGeometry args={[5.6, 1.4]} />
        <meshBasicMaterial map={sign} toneMapped={false} />
      </mesh>
      {CANNONS.map((c) => (
        <Cannon key={c.x} position={[c.x, 0, c.z]} />
      ))}
      {/* the West Gate, smaller, out the back */}
      <mesh geometry={geo.arches(4.4, 6.5, 2.4, [[0, 2.2, 2.2]])} material={toon(CASTLE_DARK)} position={[wg, 0, -hd]} castShadow />
      <Crenels len={4.4} y={6.85} position={[wg, 0, -hd - 0.8]} />
      {/* Lucy Tower: the shell keep on the west motte, grassed inside */}
      <group position={[lucy.x, 0, lucy.z]}>
        <Part geometry={geo.cyl(lucy.r - 1.6, lucy.r, lucy.h, 24)} color={GRASS} outline={0.06} position-y={lucy.h / 2} />
        <Part geometry={geo.cyl(4.2, 4.4, 4.2, 20)} color={CASTLE_DARK} outline={0.08} position-y={lucy.h + 2.1} />
        <mesh geometry={geo.cyl(3.5, 3.5, 0.1, 20)} material={toon(GRASS)} position-y={lucy.h + 4.22} />
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i / 12) * Math.PI * 2;
          return <Part key={i} geometry={geo.box(0.7, 0.7, 0.7)} color={CASTLE_STONE} outline={0.04} position={[Math.cos(a) * 4, lucy.h + 4.55, Math.sin(a) * 4]} rotation-y={-a} />;
        })}
      </group>
      {/* the Observatory Tower on the east motte, its little round turret on top */}
      <group position={[obs.x, 0, obs.z]}>
        <Part geometry={geo.cyl(obs.r - 1.3, obs.r, obs.h, 20)} color={GRASS} outline={0.06} position-y={obs.h / 2} />
        <Part geometry={geo.box(3.4, 6, 3.4)} color={CASTLE_STONE} outline={0.08} position-y={obs.h + 3} />
        <Crenels len={3.4} y={obs.h + 6.35} position={[0, 0, 1.5]} />
        <Crenels len={3.4} y={obs.h + 6.35} position={[0, 0, -1.5]} />
        <Part geometry={geo.cyl(0.9, 0.9, 1.8, 12)} color={CASTLE_DARK} outline={0.05} position={[1, obs.h + 6.9, 1]} />
        <Part geometry={geo.box(0.6, 0.9, 0.1)} color={WINDOW} outline={0.03} position={[0, obs.h + 4, 1.75]} />
      </group>
      {/* the Victorian prison, red brick along the north wall, its front facing into the bailey */}
      <group position={[mid(prison.x0, prison.x1), 0, mid(prison.z0, prison.z1)]}>
        <Part geometry={geo.box(prison.x1 - prison.x0, 6, prison.z1 - prison.z0)} color={PRISON_BRICK} outline={0.08} position-y={3} />
        <Part geometry={geo.box(prison.x1 - prison.x0 + 0.3, 0.4, prison.z1 - prison.z0 + 0.3)} color={SLATE} outline={0.05} position-y={6.2} />
        {[1.6, 4].flatMap((y) =>
          Array.from({ length: 5 }, (_, i) => (
            <Part key={`${y}${i}`} geometry={geo.box(0.1, 0.8, 0.5)} color={WINDOW} outline={0.03} position={[-(prison.x1 - prison.x0) / 2 - 0.05, y, -4 + i * 2]} />
          )),
        )}
        <Part geometry={geo.box(0.12, 1.9, 1.1)} color={0x3a2a1a} outline={0.04} position={[-(prison.x1 - prison.x0) / 2 - 0.06, 0.95, 1]} />
      </group>
      {/* the Magna Carta Vault beside it: pale stone with a band of glass */}
      <group position={[mid(vault.x0, vault.x1), 0, mid(vault.z0, vault.z1)]}>
        <Part geometry={geo.box(vault.x1 - vault.x0, 3, vault.z1 - vault.z0)} color={0xd9cbb0} outline={0.07} position-y={1.5} />
        <Part geometry={geo.box(0.1, 1.2, vault.z1 - vault.z0 - 1)} color={WINDOW} outline={0.03} position={[-(vault.x1 - vault.x0) / 2 - 0.05, 1.8, 0]} />
      </group>
      {/* the Crown Court by the West Gate, castellated, its front facing into the bailey */}
      <group position={[mid(court.x0, court.x1), 0, mid(court.z0, court.z1)]}>
        <Part geometry={geo.box(court.x1 - court.x0, 5, court.z1 - court.z0)} color={0xe8dcc2} outline={0.08} position-y={2.5} />
        <Crenels len={court.x1 - court.x0} y={5.35} position={[0, 0, (court.z1 - court.z0) / 2 - 0.45]} />
        {[-2.4, -0.8, 0.8, 2.4].map((x) => (
          <Part key={x} geometry={geo.box(0.6, 1.6, 0.1)} color={WINDOW} outline={0.03} position={[x, 3, (court.z1 - court.z0) / 2 + 0.05]} />
        ))}
        <Part geometry={geo.box(1.1, 1.9, 0.12)} color={0x3a2a1a} outline={0.04} position={[0, 0.95, (court.z1 - court.z0) / 2 + 0.06]} />
      </group>
    </group>
  );
}

const HOUSE_COLORS = [0xe8a33d, 0xf2e2c4, 0x9fc0d8, 0xd77a61, 0xf2d06b, 0xc8b6e2];

// Steep Hill: a narrow cobbled lane climbing north, lined with old houses that step up the hill.
// The street is drawn lifted to the ground at its middle, so heights here are relative to that.
export function SteepHill({ p, font }: { p: Place; font: string }) {
  const sign = useMemo(() => signTexture(p.name, "#8a3b2e", font), [p, font]);
  const y = (z: number) => groundY(p.z + z) - groundY(p.z);
  const rows = streetHouses(p).map((h) => ({
    ...h,
    // each house stands level with the uphill end of its plot, on a stone plinth down to the lane below
    top: y(h.z - h.len / 2),
    low: y(h.z + h.len / 2) - 0.3,
    h: 4.2 + ((h.i * 7 + h.side * 3 + 10) % 4) * 0.5,
    color: HOUSE_COLORS[(h.i + (h.side > 0 ? 3 : 0)) % HOUSE_COLORS.length],
  }));
  const cobbles = useMemo(() => {
    const r = seeded(5);
    return Array.from({ length: 70 }, () => [(r() - 0.5) * (p.w - 2 * STREET_ROW - 0.6), (r() - 0.5) * (p.d - 1)] as const);
  }, [p]);
  return (
    <group position={[p.x, 0, p.z]} rotation-y={p.rot} {...placeEvents(p)}>
      <Strip w={p.w - 2 * STREET_ROW} d={p.d} color={0xb9ad9a} wz={p.z} y={0.06} />
      {cobbles.map(([x, z], i) => (
        <mesh key={i} geometry={geo.box(0.5, 0.07, 0.4)} material={toon(0xa0947f)} position={[x, y(z) + 0.06, z]} rotation-x={groundTilt(p.z + z)} />
      ))}
      {rows.map((r) => {
        const { x, len } = r;
        const front = -r.side * (STREET_ROW / 2); // faces the lane
        return (
          <group key={`${r.side}${r.i}`} position={[x, 0, r.z]}>
            <Part geometry={geo.box(STREET_ROW, r.top - r.low + 0.01, len - 0.2)} color={0x9c8d6e} outline={0.05} position-y={(r.top + r.low) / 2} />
            <Part geometry={geo.box(STREET_ROW - 0.2, r.h, len - 0.4)} color={r.color} outline={0.07} position-y={r.top + r.h / 2} />
            <group position={[0, r.top + r.h, 0]} rotation-y={Math.PI / 2}>
              <Part geometry={geo.cyl(2.3, 2.3, len - 0.2, 3)} color={p.roof} outline={0.06} rotation-x={-Math.PI / 2} scale={[1, 1, 0.5]} position-y={0.55} />
            </group>
            <Part geometry={geo.box(0.2, 1.8, 0.9)} color={0x5a3a22} outline={0.04} position={[front, r.top + 0.9, 0]} />
            <Part geometry={geo.box(0.2, 0.9, 0.9)} color={WINDOW} outline={0.04} position={[front, r.top + r.h - 1.2, len / 4]} />
            <Part geometry={geo.box(0.2, 0.9, 0.9)} color={WINDOW} outline={0.04} position={[front, r.top + r.h - 1.2, -len / 4]} />
          </group>
        );
      })}
      {/* name board hung across the bottom of the hill */}
      <group position={[0, y(p.d / 2 - 0.4), p.d / 2 - 0.4]}>
        <Part geometry={geo.box(p.w - 2 * STREET_ROW + 0.4, 0.25, 0.25)} color={0x2b2633} outline={0.04} position-y={5.6} />
        <Part geometry={geo.box(4.6, 1.2, 0.15)} color={0xfff8e7} outline={0.05} position-y={4.8} />
        <mesh position={[0, 4.8, 0.09]}>
          <planeGeometry args={[4.4, 1.1]} />
          <meshBasicMaterial map={sign} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

export function Boat({ color, cabin = 0xfff8e7, len = 3.6, ...g }: { color: number; cabin?: number; len?: number; position: [number, number, number]; "rotation-y"?: number }) {
  return (
    <group {...g}>
      <Part geometry={geo.box(1.3, 0.55, len)} color={color} outline={0.05} position-y={0.28} />
      <Part geometry={geo.box(1, 0.6, len * 0.55)} color={cabin} outline={0.04} position={[0, 0.85, -len * 0.08]} />
      {Array.from({ length: Math.floor(len / 1.4) }, (_, i) => (
        <Part key={i} geometry={geo.box(1.02, 0.25, 0.3)} color={WINDOW} outline={0.02} position={[0, 0.95, -len * 0.3 + i * 0.75]} />
      ))}
    </group>
  );
}

function Sailboat({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <Part geometry={geo.box(1.1, 0.5, 2.6)} color={0xffffff} outline={0.04} position-y={0.25} />
      <Part geometry={geo.cyl(0.06, 0.06, 4, 6)} color={0x8a8a8a} outline={0.02} position-y={2.4} />
      <Part geometry={geo.cone(0.9, 3.2, 3)} color={0xfff8e7} outline={0.03} position={[0, 2.5, 0.35]} scale={[0.1, 1, 1]} />
    </group>
  );
}

const W = BRAYFORD.water;
const WX = (W.x0 + W.x1) / 2,
  WZ = (W.z0 + W.z1) / 2,
  WRX = (W.x1 - W.x0) / 2,
  WRZ = (W.z1 - W.z0) / 2;

// Swans paddling slow loops round the pool.
function Swan({ phase, reduce, r }: { phase: number; reduce: boolean; r: number }) {
  const g = useRef<THREE.Group>(null!);
  useFrame(({ clock }) => {
    const t = reduce ? phase : clock.elapsedTime * 0.1 + phase;
    g.current.position.set(WX + Math.cos(t) * (WRX - 2.5) * r, 0.15, WZ + Math.sin(t) * (WRZ - 1.6) * r);
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

// A sightseeing boat doing laps of the pool.
function TourBoat({ reduce }: { reduce: boolean }) {
  const g = useRef<THREE.Group>(null!);
  useFrame(({ clock }) => {
    const t = reduce ? 1 : clock.elapsedTime * 0.06;
    g.current.position.set(WX + Math.cos(t) * (WRX - 7), 0.1, WZ + Math.sin(t) * (WRZ - 3.2));
    g.current.rotation.y = -t;
  });
  return (
    <group ref={g}>
      <group rotation-y={Math.PI / 2}>
        <Part geometry={geo.box(2, 0.6, 5)} color={0x2b59c3} outline={0.05} position-y={0.3} />
        <Part geometry={geo.box(1.7, 0.9, 3.2)} color={0xfff8e7} outline={0.04} position={[0, 1.05, -0.3]} />
        <Part geometry={geo.box(1.9, 0.12, 3.6)} color={0xe03a3e} outline={0.04} position={[0, 1.56, -0.3]} />
      </group>
    </group>
  );
}

const FRONT = [
  { w: 6.5, h: 6, color: 0x9fd8e8, glass: true },
  { w: 6, h: 4.5, color: 0xf2e2c4, awning: 0xe03a3e },
  { w: 6.5, h: 5, color: 0xd77a61, awning: 0x1fb5a8 },
  { w: 6, h: 4.2, color: 0xf2d06b, awning: 0x2b59c3 },
  { w: 6, h: 7, color: 0x9fc0d8, glass: true },
  { w: 6.5, h: 5.5, color: 0xf2e2c4, awning: 0x2b59c3 },
  { w: 6, h: 6.5, color: 0x9fd8e8, glass: true },
  { w: 6.5, h: 4.5, color: 0xd77a61, awning: 0xf2d06b },
  { w: 6, h: 5, color: 0xf2d06b, awning: 0x1fb5a8 },
].map((b, i, all) => ({ ...b, x: BRAYFORD.front.x0 + all.slice(0, i).reduce((a, o) => a + o.w + 0.1, 0) + b.w / 2 }));

// Brayford Pool: a marina basin with stone quays, moored boats, waterside bars
// on the far side and the Fossdyke heading off west. The university is just south, see Campus.
export function Brayford({ p, font, reduce }: { p: Place; font: string; reduce: boolean }) {
  const sign = useMemo(() => signTexture(p.name, "#2b59c3", font), [p, font]);
  const C = BRAYFORD.canal,
    F = BRAYFORD.front;
  return (
    <group position={[p.x, 0, p.z]} rotation-y={p.rot} {...placeEvents(p)}>
      {/* promenade and quay edge */}
      <mesh geometry={geo.box(p.w + 24, 0.06, p.d + 12)} material={toon(0xe8dcc2)} position={[-12, 0.03, -6]} receiveShadow />
      <Part geometry={geo.box(W.x1 - W.x0 + 0.8, 0.3, W.z1 - W.z0 + 0.8)} color={0x9c8d6e} outline={0.05} position={[WX, 0.08, WZ]} />
      <mesh geometry={geo.box(W.x1 - W.x0, 0.12, W.z1 - W.z0)} material={toon(0x3aa6e8)} position={[WX, 0.2, WZ]} />
      {/* the Fossdyke */}
      <Part geometry={geo.box(C.x1 - C.x0 + 0.6, 0.3, C.z1 - C.z0 + 0.8)} color={0x9c8d6e} outline={0.05} position={[(C.x0 + C.x1) / 2, 0.08, (C.z0 + C.z1) / 2]} />
      <mesh geometry={geo.box(C.x1 - C.x0 + 0.6, 0.12, C.z1 - C.z0)} material={toon(0x3aa6e8)} position={[(C.x0 + C.x1) / 2, 0.2, (C.z0 + C.z1) / 2]} />
      {/* waterfront buildings along the far quay */}
      {FRONT.map((b, i) => {
        const z = (F.z0 + F.z1) / 2;
        return (
          <group key={i} position={[b.x, 0, z]}>
            <Part geometry={geo.box(b.w, b.h, F.z1 - F.z0)} color={b.color} outline={0.07} position-y={b.h / 2} />
            {b.glass ? (
              Array.from({ length: Math.floor(b.h / 1.5) }, (_, r) => (
                <Part key={r} geometry={geo.box(b.w - 0.6, 0.7, 0.1)} color={WINDOW} outline={0.03} position={[0, 1.1 + r * 1.5, (F.z1 - F.z0) / 2 + 0.05]} />
              ))
            ) : (
              <>
                <Part geometry={geo.box(b.w - 1.2, 1.4, 0.1)} color={WINDOW} outline={0.03} position={[0, 1.1, (F.z1 - F.z0) / 2 + 0.05]} />
                <Part geometry={geo.box(b.w - 0.6, 0.15, 1.2)} color={b.awning!} outline={0.04} position={[0, 2.2, (F.z1 - F.z0) / 2 + 0.6]} rotation-x={0.25} />
                <Part geometry={geo.box(b.w - 1.6, 0.8, 0.1)} color={WINDOW} outline={0.03} position={[0, b.h - 1.1, (F.z1 - F.z0) / 2 + 0.05]} />
              </>
            )}
          </group>
        );
      })}
      {/* outdoor tables on the north quay */}
      {[-33, -27, -15, -9, -3, 9].map((x) => (
        <group key={x} position={[x, 0, F.z1 + 0.6]}>
          <Part geometry={geo.cyl(0.45, 0.45, 0.08, 10)} color={0xffffff} outline={0.03} position-y={0.75} />
          <Part geometry={geo.cyl(0.05, 0.05, 0.75, 6)} color={0x2b2633} outline={0.02} position-y={0.38} />
          <Part geometry={geo.cone(0.9, 0.5, 8)} color={0xe03a3e} outline={0.03} position-y={2} />
          <Part geometry={geo.cyl(0.04, 0.04, 1.6, 6)} color={0x2b2633} outline={0.02} position-y={1.2} />
        </group>
      ))}
      {/* pontoon with moored boats */}
      <Part geometry={geo.box(1.4, 0.25, 7)} color={0x8a5a33} outline={0.05} position={[5, 0.3, W.z1 - 3.4]} />
      <Boat color={0x2f8f5b} position={[3.4, 0.15, W.z1 - 3.6]} />
      <Boat color={0xe03a3e} cabin={0xf2d06b} position={[6.6, 0.15, W.z1 - 3.4]} len={4.2} />
      <Sailboat position={[9.5, 0.15, W.z1 - 2.2]} />
      {/* narrowboats tied up along the north quay */}
      <Boat color={0x1f6b4a} position={[-6, 0.15, W.z0 + 0.9]} rotation-y={Math.PI / 2} len={5.5} />
      <Boat color={0x7a2b3e} cabin={0xf2e2c4} position={[0, 0.15, W.z0 + 0.9]} rotation-y={Math.PI / 2} len={5} />
      <Boat color={0x2b59c3} position={[-42, 0.15, (C.z0 + C.z1) / 2]} rotation-y={Math.PI / 2} len={5.5} />
      <TourBoat reduce={reduce} />
      {[0, 1.3, 2.6, 3.9, 5.2].map((ph, i) => (
        <Swan key={ph} phase={ph} reduce={reduce} r={i % 2 ? 0.55 : 0.85} />
      ))}
      {/* railings and lamps along the near quay */}
      {Array.from({ length: 17 }, (_, i) => -35 + i * 2.75).map((x) =>
        x > 3.5 && x < 6.5 ? null : <Part key={x} geometry={geo.cyl(0.07, 0.07, 1, 6)} color={0x2b2633} outline={0.02} position={[x, 0.7, W.z1 + 0.45]} />,
      )}
      <Part geometry={geo.box(38, 0.08, 0.08)} color={0x2b2633} outline={0.02} position={[-16.5, 1.15, W.z1 + 0.45]} />
      <Part geometry={geo.box(4.6, 0.08, 0.08)} color={0x2b2633} outline={0.02} position={[9.5, 1.15, W.z1 + 0.45]} />
      {[-36, -24, -12, 12].map((x) => (
        <group key={x} position={[x, 0, W.z1 + 1.2]}>
          <Part geometry={geo.cyl(0.1, 0.12, 3.2, 8)} color={0x2b2633} outline={0.04} position-y={1.6} />
          <Part geometry={geo.sphere(0.3)} color={LAMP} outline={0.05} position-y={3.3} />
        </group>
      ))}
      {/* benches */}
      {[-27, -17, -7, 1].map((x) => (
        <group key={x} position={[x, 0, W.z1 + 2.4]}>
          <Part geometry={geo.box(2, 0.15, 0.6)} color={0x8a5a33} outline={0.03} position-y={0.5} />
          <Part geometry={geo.box(2, 0.6, 0.12)} color={0x8a5a33} outline={0.03} position={[0, 0.85, 0.3]} />
        </group>
      ))}
      {/* name board on the promenade, facing the town */}
      <group position={[-3, 0, p.d / 2 - 1.4]}>
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

const BRICK = 0x7b3a2c; // the library's dark red brick
const BRICK_DARK = 0x8f3f2c;

// University of Lincoln's Brayford Pool campus, on the south side of the water: an old
// red-brick railway warehouse (now the library), a big modern main building on a lawn,
// and a glassy teaching block, all facing the main road.
export function Campus({ p, font }: { p: Place; font: string }) {
  const sign = useMemo(() => signTexture("University\nof Lincoln", "#7a1f3d", font), [font]);
  const libSign = useMemo(() => signTexture("GREAT CENTRAL\nWAREHOUSE LIBRARY", "#7b3a2c", font), [font]);
  const libRoof = useRoof(4, 1.7, 5.8);
  const hd = p.d / 2,
    front = hd - 1.2;
  // from the west: the main building, then the library at the east end, next to the Engine Shed
  const MAIN = -4.6,
    LIB = p.w / 2 - 4.45;
  return (
    <group position={[p.x, 0, p.z]} rotation-y={p.rot} {...placeEvents(p)}>
      <mesh geometry={geo.box(p.w, 0.06, p.d)} material={toon(0x5fbf5b)} position-y={0.04} receiveShadow />
      {/* paths across the lawn to each door */}
      {[MAIN, LIB].map((x) => (
        <mesh key={x} geometry={geo.box(1.6, 0.07, 2.4)} material={toon(0xe8dcc2)} position={[x, 0.05, hd - 1.2]} />
      ))}
      {/* the Great Central Warehouse Library: a dark red brick railway warehouse with two gables to the front, a round
          window in each, rows of arched windows, glazing at the foot and its name across the middle */}
      <group position={[LIB, 0, -0.6]}>
        <Part geometry={geo.box(8, 4.6, 5.6)} color={BRICK} outline={0.08} position-y={2.3} />
        {[-2, 2].map((x) => (
          <group key={x} position={[x, 4.6, 0]} rotation-y={Math.PI / 2}>
            <Part geometry={libRoof} color={0x4a4f5c} outline={0.06} />
          </group>
        ))}
        <Part geometry={geo.box(8.3, 0.3, 5.9)} color={BRICK_DARK} outline={0.04} position-y={0.15} />
        <mesh geometry={geo.box(8.1, 0.2, 0.1)} material={toon(0xd9cbb0)} position={[0, 4.6, 2.82]} />
        {[-2, 2].map((x) => (
          <group key={x}>
            <Part geometry={geo.cyl(0.4, 0.4, 0.1, 12)} color={0x2b2633} outline={0.03} position={[x, 5.3, 2.83]} rotation-x={Math.PI / 2} />
            <Part geometry={geo.box(1.7, 1.6, 0.1)} color={0x20252d} outline={0.03} position={[x, 0.95, 2.82]} />
          </group>
        ))}
        {[-3, -1, 1, 3].map((x) => (
          <group key={x} position={[x, 3.75, 2.83]}>
            <Part geometry={geo.box(0.6, 0.8, 0.1)} color={WINDOW} outline={0.03} />
            <Part geometry={geo.cyl(0.3, 0.3, 0.1, 10)} color={WINDOW} outline={0.03} position-y={0.4} rotation-x={Math.PI / 2} />
          </group>
        ))}
        <mesh position={[0, 2.5, 2.83]}>
          <planeGeometry args={[4.4, 1.9]} />
          <meshBasicMaterial map={libSign} toneMapped={false} />
        </mesh>
      </group>
      {/* the main building: a long glass and steel block with a row of arched roofs over each wing, a tall glass atrium
          between them and a pale stone tower either side of it */}
      <group position={[MAIN, 0, -1]}>
        {[-1, 1].map((side) => (
          <group key={side} position={[side * 5.3, 0, 0]}>
            <Part geometry={geo.box(5.2, 7, 6)} color={0x2f3a46} outline={0.07} position-y={3.5} />
            {[1.8, 3.6, 5.4].map((y) => (
              <mesh key={y} geometry={geo.box(4.7, 0.75, 0.06)} material={toon(0x7fa8c4)} position={[0, y, 3.03]} />
            ))}
            {[-1.75, 0, 1.75].map((x) => (
              <Part key={x} geometry={geo.cyl(0.85, 0.85, 5.8, 12)} color={0x7fa8c4} outline={0.04} position={[x, 7, 0]} rotation-x={Math.PI / 2} />
            ))}
          </group>
        ))}
        <Part geometry={geo.box(5.4, 6.4, 6.2)} color={0x9fd8e8} outline={0.07} position-y={3.2} />
        {[-2, -1, 0, 1, 2].map((x) => (
          <Part key={x} geometry={geo.box(0.12, 6.2, 0.1)} color={0x2f3a46} outline={0.02} position={[x * 1.1, 3.2, 3.15]} />
        ))}
        {[-1, 1].map((side) => (
          <Part key={side} geometry={geo.box(2.2, 9.2, 2.6)} color={0xd9cbb0} outline={0.07} position={[side * 3.2, 4.6, -0.6]} />
        ))}
        <Part geometry={geo.box(1.6, 2.2, 0.1)} color={0x2b2633} outline={0.03} position={[0, 1.1, 3.2]} />
        <mesh position={[0, 4.8, 3.18]}>
          <planeGeometry args={[3.6, 1.6]} />
          <meshBasicMaterial map={sign} toneMapped={false} />
        </mesh>
      </group>
      {/* flagpole in front of the main building */}
      <group position={[MAIN - 8.2, 0, front]}>
        <Part geometry={geo.cyl(0.06, 0.06, 5, 6)} color={0x8a8a8a} outline={0.02} position-y={2.5} />
        <Part geometry={geo.box(1.4, 0.8, 0.05)} color={0x7a1f3d} outline={0.03} position={[0.75, 4.5, 0]} />
      </group>
    </group>
  );
}

const TIMBER = 0x2b2633;
const BRIDGE_STONE = 0xb8a98a;

// Black timber studs and rails over a plastered face len wide and h tall, centred on its foot.
function Studs({ len, h, ...g }: { len: number; h: number } & Omit<ThreeElements["group"], "children">) {
  const n = Math.round(len / 0.8);
  return (
    <group {...g}>
      {Array.from({ length: n + 1 }, (_, i) => (
        <Part key={i} geometry={geo.box(0.16, h, 0.08)} color={TIMBER} outline={0} position={[-len / 2 + (i * len) / n, h / 2, 0]} />
      ))}
      {[0.08, h / 2, h - 0.08].map((y) => (
        <Part key={y} geometry={geo.box(len, 0.16, 0.08)} color={TIMBER} outline={0} position-y={y} />
      ))}
      {/* a pair of braces in the middle panel */}
      {[-1, 1].map((s) => (
        <Part key={s} geometry={geo.box(0.12, h * 0.62, 0.06)} color={TIMBER} outline={0} position={[s * 0.4, h * 0.25, 0.01]} rotation-z={s * 0.6} />
      ))}
    </group>
  );
}

// High Bridge: the black-and-white timber-framed shops standing on the Norman bridge over the Witham,
// on the west side of the High Street. The stone ground floor is the bridge itself, with the dark
// channel the river runs through, the Glory Hole, opening on its back face; two jettied floors
// and a pair of gables facing the street sit above. Its own +x runs upstream, along the street.
export function HighBridge({ p, font }: { p: Place; font: string }) {
  const sign = useMemo(() => signTexture(p.name, "#2b2633", font), [p, font]);
  const ground = 2.6,
    floor = 2;
  const floors = [
    { y: ground, s: p.w + 0.4 },
    { y: ground + floor, s: p.w + 0.8 },
  ];
  const top = ground + 2 * floor;
  const roof = floors[1].s;
  const r = roof / 2 / 1.732; // circumradius of each gable's triangle, two side by side across the front
  return (
    <group position={[p.x, 0, p.z]} rotation-y={p.rot} {...placeEvents(p)}>
      {/* the bridge: stone ground floor, its arch over the river on the upstream (back) face */}
      {/* the Glory Hole: a round arch right through the stone ground floor, with the river's dark water in it, a ring of
          big stones round its mouth on the upstream (back) face, and a stone block closing it at the street end */}
      <Part geometry={geo.arches(p.w, ground, p.d, [[0, RIVER.half * 2, 0.5]])} color={BRIDGE_STONE} outline={0.08} />
      <mesh geometry={geo.box(RIVER.half * 2 + 0.2, 0.12, p.d - 0.5)} material={toon(0x1a4f73)} position={[0, 0.2, -0.25]} raycast={() => null} />
      <Part geometry={geo.box(RIVER.half * 2 + 0.3, ground, 0.5)} color={BRIDGE_STONE} outline={0.04} position={[0, ground / 2, p.d / 2 - 0.25]} />
      <Part geometry={geo.smile(RIVER.half + 0.2, 0.18)} color={0x9c8d6e} outline={0.03} position={[0, 0.5, -p.d / 2 - 0.04]} rotation-z={Math.PI} scale={[1, 1, 0.4]} />
      {/* shopfront onto the street */}
      <Part geometry={geo.box(1.2, 2, 0.2)} color={0x5a3a22} outline={0.05} position={[1.8, 1, p.d / 2 + 0.06]} />
      <Part geometry={geo.box(2.6, 1.3, 0.2)} color={WINDOW} outline={0.05} position={[-1, 1.15, p.d / 2 + 0.06]} />
      <mesh position={[0, 2.25, p.d / 2 + 0.17]}>
        <planeGeometry args={[3.4, 0.85]} />
        <meshBasicMaterial map={sign} toneMapped={false} />
      </mesh>
      {/* two jettied, timber-framed floors, each a little wider than the one below */}
      {floors.map((f) => (
        <group key={f.y} position-y={f.y}>
          <Part geometry={geo.box(f.s, floor, f.s)} color={p.wall} outline={0.07} position-y={floor / 2} />
          {[0, Math.PI / 2, Math.PI, -Math.PI / 2].map((a) => (
            <group key={a} rotation-y={a}>
              <Studs len={f.s} h={floor} position-z={f.s / 2 + 0.04} />
              {[-1, 1].map((sx) => (
                <Part key={sx} geometry={geo.box(1, 0.9, 0.1)} color={WINDOW} outline={0.03} position={[sx * f.s * 0.26, floor / 2 + 0.1, f.s / 2 + 0.09]} />
              ))}
            </group>
          ))}
        </group>
      ))}
      {/* a pair of gables facing the street */}
      {[-1, 1].map((sx) => (
        <Part
          key={sx}
          geometry={geo.cyl(r, r, roof + 0.3, 3)}
          color={p.roof}
          outline={0.06}
          rotation-x={-Math.PI / 2}
          scale={[1, 1, 0.75]}
          position={[(sx * roof) / 4, top + 0.5 * r * 0.75, 0]}
        />
      ))}
      <Part geometry={geo.box(0.7, 1.6, 0.7)} color={BRICK_DARK} outline={0.04} position={[0, top + 1.3, -1.6]} />
    </group>
  );
}

// The River Witham between Brayford Pool and the east edge of the map: open water in stone banks
// between the bridges, the parapet on the downstream side of High Bridge, and a little footbridge
// wherever a footpath crosses. Everything here is on the flat below the hill.
export function River() {
  const z = RIVER.z,
    wide = RIVER.half * 2;
  return (
    <group raycast={() => null}>
      {RIVER_RUNS.map(([x0, x1]) => (
        <group key={x0} position={[(x0 + x1) / 2, 0, z]}>
          <Part geometry={geo.box(x1 - x0, 0.3, wide + 0.8)} color={0x9c8d6e} outline={0.05} position-y={0.08} />
          <mesh geometry={geo.box(x1 - x0, 0.12, wide)} material={toon(0x3aa6e8)} position-y={0.2} />
        </group>
      ))}
      {/* High Bridge's parapet on the east side of the street, and the river coming out from under it */}
      <Part geometry={geo.box(0.5, 1, wide + 1.2)} color={BRIDGE_STONE} outline={0.05} position={[RIVER.bridges[1].x1 + 0.2, 0.5, z]} />
      <Part geometry={geo.smile(RIVER.half + 0.15, 0.16)} color={0x9c8d6e} outline={0.03} position={[RIVER.bridges[1].x1 + 0.47, -0.65, z]} rotation={[0, Math.PI / 2, Math.PI]} scale={[1, 1, 0.4]} />
      {/* the footbridges, humped up high enough for the boats to pass under, the water running on beneath them, with
          a rail along each side; drawn as short lengths of deck and rail laid along the hump */}
      {RIVER.bridges
        .filter((b) => b.foot)
        .map((foot) => {
          const span = foot.x1 - foot.x0;
          return (
            <group key={foot.x} position={[foot.x, 0, z]}>
              <mesh geometry={geo.box(span, 0.12, wide)} material={toon(0x3aa6e8)} position-y={0.2} />
              {HUMP_SEGS.map(({ z: sz, y, tilt, len }) => (
                <group key={sz} position={[0, y, sz]} rotation-x={tilt}>
                  <Part geometry={geo.box(span - 0.2, 0.25, len)} color={0x8a5a33} outline={0.04} position-y={0.3} />
                  {[-1, 1].map((sx) => (
                    <Part key={sx} geometry={geo.box(0.1, 0.1, len)} color={0x5a3a22} outline={0.02} position={[(sx * (span - 0.3)) / 2, 1.25, 0]} />
                  ))}
                </group>
              ))}
              {HUMP_POSTS.flatMap((pz) =>
                [-1, 1].map((sx) => (
                  <Part key={`${pz}${sx}`} geometry={geo.box(0.12, 0.85, 0.12)} color={0x5a3a22} outline={0.02} position={[(sx * (span - 0.3)) / 2, humpY(pz) + 0.85, pz]} />
                )),
              )}
              {/* a stone pier under each end of the flat top, on the bank */}
              {[-1, 1].map((s2) => (
                <Part key={s2} geometry={geo.box(span - 0.4, FOOT_HUMP.top + 0.2, 0.5)} color={BRIDGE_STONE} outline={0.03} position={[0, (FOOT_HUMP.top + 0.2) / 2, s2 * (RIVER.half + 0.35)]} />
              ))}
            </group>
          );
        })}
    </group>
  );
}

// The footbridges' deck as short straight lengths along the hump, and where the rail posts stand.
const HUMP_N = 14;
const HUMP_SEGS = Array.from({ length: HUMP_N }, (_, i) => {
  const step = (2 * FOOT_HUMP.half) / HUMP_N,
    a = -FOOT_HUMP.half + i * step,
    b = a + step;
  const ya = humpY(a),
    yb = humpY(b);
  return { z: (a + b) / 2, y: (ya + yb) / 2, tilt: -Math.atan2(yb - ya, step), len: Math.hypot(step, yb - ya) + 0.04 };
});
const HUMP_POSTS = [-3.4, -1.6, 0, 1.6, 3.4];

// Newport Arch, the Roman north gate of the city, still standing over the road at the top of Bailgate:
// a big round arch for the road, the little arch for people on foot beside it on the east, and
// a weathered, uneven top.
export function NewportArch({ p, font }: { p: Place; font: string }) {
  const sign = useMemo(() => signTexture(p.name, "#5b6b7a", font), [p, font]);
  const spring = 3.6,
    [pa, pb] = NEWPORT.postern;
  const tops = useMemo(() => {
    const r = seeded(17);
    return Array.from({ length: 9 }, (_, i) => ({ x: -p.w / 2 + 0.8 + i * ((p.w - 1.6) / 8), h: 0.3 + r() * 0.7, w: 1 + r() * 0.6 }));
  }, [p]);
  return (
    <group position={[p.x, 0, p.z]} rotation-y={p.rot} {...placeEvents(p)}>
      <Part
        geometry={geo.arches(p.w, p.h, p.d, [
          [0, NEWPORT.open * 2, spring],
          [(pa + pb) / 2, pb - pa, 1.8],
        ])}
        color={p.wall}
        outline={0.08}
      />
      {/* the ring of big stones round each arch, on both faces */}
      {[-1, 1].flatMap((sz) => [
        <Part key={`a${sz}`} geometry={geo.smile(NEWPORT.open + 0.35, 0.35)} color={STONE} outline={0.03} position={[0, spring, sz * (p.d / 2 + 0.04)]} rotation-z={Math.PI} scale={[1, 1, 0.25]} />,
        <Part key={`b${sz}`} geometry={geo.smile((pb - pa) / 2 + 0.2, 0.2)} color={STONE} outline={0.03} position={[(pa + pb) / 2, 1.8, sz * (p.d / 2 + 0.04)]} rotation-z={Math.PI} scale={[1, 1, 0.3]} />,
      ])}
      {tops.map((t) => (
        <Part key={t.x} geometry={geo.box(t.w, t.h, p.d - 0.4)} color={p.wall} outline={0.05} position={[t.x, p.h + t.h / 2, 0]} />
      ))}
      <mesh position={[0, p.h - 0.55, p.d / 2 + 0.03]}>
        <planeGeometry args={[3.6, 0.9]} />
        <meshBasicMaterial map={sign} toneMapped={false} />
      </mesh>
    </group>
  );
}

// One of Steep Hill's Norman stone houses, standing in the row in place of an ordinary house:
// two storeys of stone on a plinth stepping down the hill, a round-arched doorway (with a chimney
// rising from just above it on Norman's House) and pairs of round-headed windows upstairs.
export function OldHouse({ p, font }: { p: Place; font: string }) {
  const sign = useMemo(() => signTexture(p.name, "#8a3b2e", font), [p, font]);
  const y = (dz: number) => groundY(p.z + dz) - groundY(p.z);
  const len = p.w - 0.2,
    deep = p.d - 0.2;
  // stand level with the uphill (north) end of the plot, like the houses either side
  const top = y(-p.w / 2),
    low = y(p.w / 2) - 0.3;
  const front = deep / 2 + 0.06;
  const chimney = p.id === "normans-house";
  const door = chimney ? 0 : -len / 4;
  const arched = (w: number, h: number, color: number, x: number, yy: number, key?: string) => (
    <group key={key} position={[x, yy, front]}>
      <Part geometry={geo.box(w, h - w / 2, 0.12)} color={color} outline={0.03} position-y={(h - w / 2) / 2} />
      <Part geometry={geo.cyl(w / 2, w / 2, 0.12, 14)} color={color} outline={0.03} position-y={h - w / 2} rotation-x={Math.PI / 2} />
    </group>
  );
  return (
    <group position={[p.x, 0, p.z]} rotation-y={p.rot} {...placeEvents(p)}>
      <Part geometry={geo.box(len + 0.2, top - low + 0.01, p.d)} color={0x9c8d6e} outline={0.05} position-y={(top + low) / 2} />
      <group position-y={top}>
        <Part geometry={geo.box(len, p.h, deep)} color={p.wall} outline={0.07} position-y={p.h / 2} />
        {/* a string course between the floors */}
        <Part geometry={geo.box(len + 0.1, 0.18, deep + 0.1)} color={STONE_DARK} outline={0.03} position-y={2.3} />
        <group>
          {/* the doorway, under a carved arch */}
          <Part geometry={geo.smile(0.78, 0.16)} color={STONE_DARK} outline={0.03} position={[door, 1.55, front + 0.04]} rotation-z={Math.PI} scale={[1, 1, 0.5]} />
          {arched(1.3, 2.2, 0x5a3a22, door, 0)}
          {/* pairs of round-headed windows upstairs */}
          {[-len / 4 - 0.2, len / 4 + 0.2].flatMap((cx) => [-0.32, 0.32].map((dx) => arched(0.5, 1.1, WINDOW, cx + dx, 2.8, `${cx}${dx}`)))}
          {!chimney && arched(0.5, 1, WINDOW, len / 4, 0.8)}
        </group>
        {chimney && (
          <>
            {/* the chimney breast rising from above the doorway arch, through the eaves */}
            <Part geometry={geo.box(1, p.h - 2.2, 0.4)} color={STONE_DARK} outline={0.04} position={[0, 2.2 + (p.h - 2.2) / 2, front + 0.14]} />
            <Part geometry={geo.box(0.8, 1.8, 0.8)} color={STONE_DARK} outline={0.04} position={[0, p.h + 0.9, deep / 2 - 0.3]} />
          </>
        )}
        {/* the roof, its ridge running along the street */}
        <group position-y={p.h}>
          <group rotation-y={Math.PI / 2}>
            <Part geometry={geo.cyl(2.3, 2.3, len + 0.2, 3)} color={p.roof} outline={0.06} rotation-x={-Math.PI / 2} scale={[1, 1, 0.5]} position-y={0.55} />
          </group>
        </group>
        <mesh position={[chimney ? len / 4 + 0.35 : len / 4, 1.95, front + 0.09]}>
          <planeGeometry args={[1.8, 0.45]} />
          <meshBasicMaterial map={sign} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

const INK_FRAME = 0x2b2633;

// A framed picture for the front of the Usher Gallery, like an exhibition banner, showing one of the case study sites.
function Banner({ src, w, h, ...g }: { src: string; w: number; h: number } & Omit<ThreeElements["group"], "children">) {
  const map = useMemo(() => {
    const t = new THREE.TextureLoader().load(src);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, [src]);
  useEffect(() => () => map.dispose(), [map]);
  return (
    <group {...g}>
      <Part geometry={geo.box(w + 0.3, h + 0.3, 0.12)} color={INK_FRAME} outline={0.03} />
      <mesh position-z={0.07}>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial map={map} toneMapped={false} />
      </mesh>
    </group>
  );
}
// The Usher Gallery: a pale stone gallery on a podium, with a columned portico and a little copper dome
// over the middle, and steps down the slope to the town. Banners either side of the door show the case studies.
export function Gallery({ p, font }: { p: Place; font: string }) {
  const sign = useMemo(() => signTexture(p.name, "#5b6b7a", font), [p, font]);
  useEffect(() => () => sign.dispose(), [sign]);
  const y = (dz: number) => groundY(p.z + dz) - groundY(p.z);
  const half = p.d / 2,
    back = -half,
    face = 2; // the front wall; the portico and steps stand in front of it
  const top = y(back),
    low = y(half) - 0.3;
  const porch = face + 1.4;
  const steps = 5;
  const banners = (p.items ?? []).filter((i) => i.image);
  return (
    <group position={[p.x, 0, p.z]} rotation-y={p.rot} {...placeEvents(p)}>
      {/* the podium, levelling the gallery on the slope */}
      <Part geometry={geo.box(p.w, top - low, porch - back)} color={0xcfc3a8} outline={0.05} position={[0, (top + low) / 2, (porch + back) / 2]} />
      {/* steps down from the portico to the street */}
      {Array.from({ length: steps }, (_, i) => {
        const z0 = porch + (i * (half - porch)) / steps,
          z1 = porch + ((i + 1) * (half - porch)) / steps;
        const h = top - (i * (top - y(half))) / steps;
        return <Part key={i} geometry={geo.box(7 - i * 0.2, h - low, z1 - z0)} color={0xd9cfb6} outline={0.03} position={[0, (h + low) / 2, (z0 + z1) / 2]} />;
      })}
      <group position-y={top}>
        <Part geometry={geo.box(p.w, p.h, face - back)} color={p.wall} outline={0.08} position={[0, p.h / 2, (face + back) / 2]} />
        <Part geometry={geo.box(p.w + 0.4, 0.4, face - back + 0.4)} color={0xd2c6aa} outline={0.04} position={[0, p.h + 0.2, (face + back) / 2]} />
        {/* pilasters along the front */}
        {[-8.4, -3.6, 3.6, 8.4].map((x) => (
          <Part key={x} geometry={geo.box(0.5, p.h - 0.4, 0.2)} color={0xd2c6aa} outline={0.03} position={[x, (p.h - 0.4) / 2, face + 0.1]} />
        ))}
        {banners.map((b, i) => (
          <Banner key={b.title} src={b.image!} w={3.8} h={2.375} position={[(i ? 1 : -1) * 6, 3.4, face + 0.08]} />
        ))}
        {/* the portico: four columns under a pediment */}
        {[-2.4, -0.8, 0.8, 2.4].map((x) => (
          <Part key={x} geometry={geo.cyl(0.32, 0.36, p.h - 1.2, 12)} color={0xf1e9d6} outline={0.04} position={[x, (p.h - 1.2) / 2, porch - 0.5]} />
        ))}
        <Part geometry={geo.box(6.6, 1.2, porch - face + 0.3)} color={0xd2c6aa} outline={0.05} position={[0, p.h - 0.6, (porch + face) / 2]} />
        <group position={[0, p.h, (porch + face) / 2]}>
          <Part geometry={geo.cyl(1.9, 1.9, porch - face + 0.3, 3)} color={0xe6dcc6} outline={0.05} rotation-x={-Math.PI / 2} scale={[1.8, 1, 0.55]} position-y={0.5} />
        </group>
        <Part geometry={geo.box(1.6, 2.6, 0.1)} color={0x5a3a22} outline={0.03} position={[0, 1.3, face + 0.05]} />
        <mesh position={[0, p.h - 0.6, porch + 0.17]}>
          <planeGeometry args={[4.4, 1.1]} />
          <meshBasicMaterial map={sign} toneMapped={false} />
        </mesh>
        {/* the raised middle with its copper dome */}
        <Part geometry={geo.box(6, 1.8, 5)} color={p.wall} outline={0.06} position={[0, p.h + 0.9, -1.6]} />
        <Part geometry={geo.cyl(1.9, 1.9, 0.6, 20)} color={0xd2c6aa} outline={0.04} position={[0, p.h + 2.1, -1.6]} />
        <Part geometry={geo.dome(1.8)} color={p.roof} outline={0.05} position={[0, p.h + 2.4, -1.6]} />
        <Part geometry={geo.sphere(0.25)} color={0xc8973a} outline={0.03} position={[0, p.h + 4.35, -1.6]} />
      </group>
    </group>
  );
}

// The Bishop's Old Palace: ruined halls on a terrace cut into the hillside, the gatehouse tower still
// standing with its roof on, and rows of vines on the lower terrace in front.
export function Ruins({ p, font }: { p: Place; font: string }) {
  const sign = useMemo(() => signTexture(p.name, "#5e4a2e", font), [p, font]);
  useEffect(() => () => sign.dispose(), [sign]);
  const y = (dz: number) => groundY(p.z + dz) - groundY(p.z);
  const half = p.d / 2,
    step = 0.5; // where the upper terrace drops to the vineyard
  const upper = y(-half),
    lower = y(step);
  const dark = 0xa8966f;
  // the broken tops of the hall's back wall
  const jagged = useMemo(() => {
    const rand = seeded(29);
    return Array.from({ length: 10 }, (_, i) => ({ x: -7.5 + i + 0.5, h: 2.2 + rand() * (i > 6 ? 1.2 : 3.4) }));
  }, []);
  return (
    <group position={[p.x, 0, p.z]} rotation-y={p.rot} {...placeEvents(p)}>
      {/* the two terraces, each with a retaining wall down its south side */}
      <Part geometry={geo.box(p.w, upper - lower + 0.3, step + half)} color={dark} outline={0.05} position={[0, (upper + lower - 0.3) / 2, (step - half) / 2]} />
      <Part geometry={geo.box(p.w, lower - y(half) + 0.3, half - step)} color={dark} outline={0.05} position={[0, (lower + y(half) - 0.3) / 2, (half + step) / 2]} />
      <mesh geometry={geo.box(p.w - 0.4, 0.04, step + half - 0.4)} material={toon(0x7cc46a)} position={[0, upper + 0.02, (step - half) / 2]} receiveShadow />
      <mesh geometry={geo.box(p.w - 0.4, 0.04, half - step - 0.4)} material={toon(0x8a6a48)} position={[0, lower + 0.02, (half + step) / 2]} receiveShadow />
      <group position-y={upper}>
        {/* the great hall's back wall, broken off at different heights */}
        {jagged.map((j) => (
          <Part key={j.x} geometry={geo.box(1, j.h, 0.7)} color={p.wall} outline={0.04} position={[j.x, j.h / 2, -4]} />
        ))}
        {/* its front wall, a row of tall window openings with a low run of broken wall at the east end */}
        <Part geometry={geo.box(10, 1, 0.7)} color={p.wall} outline={0.04} position={[-2.5, 0.5, -0.6]} />
        <Part geometry={geo.arches(7, 3.4, 0.7, [[-2.3, 1.1, 1.7], [0, 1.1, 1.7], [2.3, 1.1, 1.7]])} color={p.wall} outline={0.04} position={[-4, 1, -0.6]} />
        <Part geometry={geo.box(3, 1.6, 0.7)} color={p.wall} outline={0.04} position={[1, 1.8, -0.6]} />
        {/* the tall west gable, with its great window */}
        <Part geometry={geo.arches(3.4, p.h, 0.7, [[0, 1.4, 3.6]])} color={p.wall} outline={0.05} position={[-7.5, 0, -2.3]} rotation-y={Math.PI / 2} />
        {/* the gatehouse tower, restored and roofed */}
        <group position={[6, 0, -2.4]}>
          <Part geometry={geo.box(3.2, p.h + 1.5, 3.2)} color={0xbfa982} outline={0.07} position-y={(p.h + 1.5) / 2} />
          {[-0.9, 0.9].map((x) => (
            <Part key={x} geometry={geo.box(0.5, 1, 0.1)} color={WINDOW} outline={0.03} position={[x, p.h - 0.6, 1.65]} />
          ))}
          <Part geometry={geo.box(1.1, 1.9, 0.1)} color={0x5a3a22} outline={0.03} position={[0, 0.95, 1.65]} />
          {[-1, 1].flatMap((s) =>
            [-1.2, 0, 1.2].flatMap((t) => [
              <Part key={`x${s}${t}`} geometry={geo.box(0.6, 0.6, 0.5)} color={0xbfa982} outline={0.03} position={[t, p.h + 1.8, s * 1.35]} />,
              <Part key={`z${s}${t}`} geometry={geo.box(0.5, 0.6, 0.6)} color={0xbfa982} outline={0.03} position={[s * 1.35, p.h + 1.8, t]} />,
            ]),
          )}
          <Part geometry={geo.cone(1.8, 1.4, 4)} color={0x5b6b7a} outline={0.04} position-y={p.h + 2.2} rotation-y={Math.PI / 4} />
        </group>
      </group>
      {/* the sign, on the vineyard's retaining wall */}
      <mesh position={[0, (lower + y(half)) / 2 - 0.1, half + 0.06]}>
        <planeGeometry args={[4.4, 1.1]} />
        <meshBasicMaterial map={sign} toneMapped={false} />
      </mesh>
      {/* the vineyard: rows of vines on posts, running along the terrace */}
      <group position-y={lower}>
        {[1.5, 3.3].flatMap((z) =>
          Array.from({ length: 9 }, (_, i) => -8 + i * 2).map((x) => (
            <group key={`${z}${x}`} position={[x, 0, z]}>
              <mesh geometry={geo.cyl(0.05, 0.05, 1, 6)} material={toon(0x6b4a2e)} position-y={0.5} />
              <Part geometry={geo.sphere(0.4, 10, 8)} color={0x4f9a3a} outline={0.03} position-y={0.85} scale={[1.7, 0.8, 0.6]} />
            </group>
          )),
        )}
      </group>
    </group>
  );
}
