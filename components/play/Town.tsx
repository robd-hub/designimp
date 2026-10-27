"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, type ThreeEvent, type ThreeElements } from "@react-three/fiber";
import { PLACES, hex, inSeason, shopSign, type Place } from "./places";
import { Part, geo, toon, INK, signTexture, WINDOW, LAMP, STONE, STONE_DARK, setNightGlow } from "./toon";
import { Castle, SteepHill, Brayford, Campus, Airfield, Stonebow, HighBridge, NewportArch, OldHouse, Gallery, Ruins, River } from "./Landmarks";
import { EXTRA_BOXES, toWorld, TREES, BOUND, EAST, MID_X, NORTH, SOUTH, HOUSE, HOUSES, HIGH_ST, SHOPFRONTS, CLOSE, BAILGATE, STALL, STALLS, CORNHILL, STONEBOW_STREETS, STADIUM_ROAD, AIRFIELD_ROAD, FOOTPATHS, RING_PATHS, RAIL, RIVER, ROUNDABOUT, BUS_STATION, crossings, seeded } from "./colliders";
import { Strip, groundY, groundTilt } from "./terrain";
import Townsfolk from "./Townsfolk";
import { game, usePlay, placeEvents, zoomBy, walkRoute, isMatchday } from "./store";
import Imp from "./Imp";
import Hunt from "./Hunt";
import Ghost from "./Ghost";
import Railway from "./Railway";
import Cars from "./Cars";
import Soundscape from "./Soundscape";
import { Station } from "./Station";
import { BusStation } from "./BusStation";
import { CornExchange } from "./CornExchange";
import { Waterside } from "./Waterside";
import Wharf from "./Wharf";
import Witham from "./Witham";
import { StMarks } from "./StMarks";
import Bailgate, { Pub } from "./Bailgate";
import { Mill, Park, Market as XmasMarket } from "./MoreLandmarks";
import { Gatehouse, Yard, MinsterGrounds, SETTS } from "./MinsterYard";
import { Crowd, Chant } from "./Matchday";
import { TaxiRank } from "./Taxi";
import { Weather, useSky } from "./Weather";
import { SHOP_COLOURS, type ShopType } from "./shop";

function Flat({ w, d, color, x = 0, z = 0, y = 0.02 }: { w: number; d: number; color: number; x?: number; z?: number; y?: number }) {
  return <mesh geometry={geo.box(w, 0.04, d)} material={toon(color)} position={[x, y, z]} receiveShadow />;
}

const SIZE = BOUND + EAST + 10;
const DEPTH = SOUTH - NORTH + 10; // north to south
const MID_Z = (SOUTH + NORTH) / 2;
const NS_START = PLACES.find((p) => p.kind === "street")!.z + 20; // the High Street runs north to the foot of Steep Hill
const PAVED = 0xd9ccb2; // the pedestrianised High Street and Castle Square
const NS_LEN = SOUTH + 5 - NS_START;
const NS_MID = (SOUTH + 5 + NS_START) / 2;
const SB_LEN = STADIUM_ROAD.x1 - STADIUM_ROAD.x0;
const SB_MID = (STADIUM_ROAD.x0 + STADIUM_ROAD.x1) / 2;
const AF_LEN = AIRFIELD_ROAD.x1 - AIRFIELD_ROAD.x0;
const AF_MID = (AIRFIELD_ROAD.x0 + AIRFIELD_ROAD.x1) / 2;

function Roads() {
  const dashes: number[] = [];
  // clear of the T junction and the roundabout
  for (let i = -BOUND; i <= EAST; i += 4) if (Math.abs(i) > 5 && Math.abs(i - ROUNDABOUT.x) > ROUNDABOUT.edge + 1) dashes.push(i);
  // down the south road, clear of the level crossing and the junction with the side roads
  const nsDashes: number[] = [];
  for (let i = 8; i <= SOUTH; i += 4) if (Math.abs(i - STADIUM_ROAD.z) > 5 && Math.abs(i - RAIL.z) > RAIL.fence + 1) nsDashes.push(i);
  const sbDashes: number[] = [];
  for (let i = 8; i < STADIUM_ROAD.x1 - 2; i += 4) sbDashes.push(i);
  for (let i = -8; i > AIRFIELD_ROAD.x0 + 2; i -= 4) sbDashes.push(i);
  return (
    <>
      <Strip w={8.6} d={NS_LEN} color={0xe8dcc2} z={NS_MID} y={0.03} />
      <Flat w={SIZE} d={8.6} color={0xe8dcc2} x={MID_X} y={0.01} />
      {/* the road south from the T junction; north of it the High Street is pedestrianised */}
      <Strip w={6} d={SOUTH + 5} color={0x6b6573} z={(SOUTH + 5) / 2} y={0.04} />
      <Strip w={HIGH_ST * 2} d={-4.3 - NS_START} color={PAVED} z={(NS_START - 4.3) / 2} y={0.045} />
      <Flat w={SIZE} d={6} color={0x6b6573} x={MID_X} />
      {/* the road east to Sincil Bank */}
      <Flat w={SB_LEN} d={8.6} color={0xe8dcc2} x={SB_MID} z={STADIUM_ROAD.z} y={0.01} />
      <Flat w={SB_LEN} d={6} color={0x6b6573} x={SB_MID} z={STADIUM_ROAD.z} />
      {/* and west to RAF Scampton, opposite */}
      <Flat w={AF_LEN} d={8.6} color={0xe8dcc2} x={AF_MID} z={AIRFIELD_ROAD.z} y={0.01} />
      <Flat w={AF_LEN} d={6} color={0x6b6573} x={AF_MID} z={AIRFIELD_ROAD.z} />
      {/* Castle Square, pedestrianised */}
      <Strip w={CLOSE.x1 - CLOSE.x0} d={CLOSE.z1 - CLOSE.z0} color={PAVED} x={(CLOSE.x0 + CLOSE.x1) / 2} z={(CLOSE.z0 + CLOSE.z1) / 2} y={0.035} />
      {/* Cornhill, the old market place, with its way in off the main road and Sincil Street to the bus station */}
      {CORNHILL.map((r, i) => (
        <Flat key={i} w={r.x1 - r.x0} d={r.z1 - r.z0} color={PAVED} x={(r.x0 + r.x1) / 2} z={(r.z0 + r.z1) / 2} y={0.035 + i * 0.002} />
      ))}
      {/* the side streets either way off the High Street at the Stonebow */}
      {STONEBOW_STREETS.map((r, i) => (
        <Flat key={i} w={r.x1 - r.x0} d={r.z1 - r.z0} color={PAVED} x={(r.x0 + r.x1) / 2} z={(r.z0 + r.z1) / 2} y={0.034} />
      ))}
      {/* and Bailgate, north from the square: the bed its cobbles are laid in */}
      <Strip w={BAILGATE.x1 - BAILGATE.x0} d={BAILGATE.z1 - BAILGATE.z0} color={0x9c8f7a} z={(BAILGATE.z0 + BAILGATE.z1) / 2} y={0.035} />
      {dashes.map((i) => (
        <Flat key={i} w={1.8} d={0.25} color={0xffd23f} x={i} y={0.05} />
      ))}
      {nsDashes.map((i) => (
        <Flat key={i} w={0.25} d={1.8} color={0xffd23f} z={i} y={0.05} />
      ))}
      {sbDashes.map((i) => (
        <Flat key={i} w={1.8} d={0.25} color={0xffd23f} x={i} z={STADIUM_ROAD.z} y={0.05} />
      ))}
      {/* give way lines where the south road meets the main road */}
      {[-2.5, -1.5, -0.5].flatMap((x) =>
        [3.3, 3.75].map((z) => <Flat key={`${x},${z}`} w={0.6} d={0.2} color={0xf4f1ea} x={x} z={z} y={0.05} />),
      )}
    </>
  );
}

// A WW1 rhomboid tank (the tank was invented in Lincoln), nodding to the memorial on Tritton Road.
const TANK = 0x7a6a45;
const TRACK = 0x564a32;

function Tank(props: Omit<ThreeElements["group"], "children">) {
  return (
    <group {...props}>
      {[-1, 1].map((sz) => (
        <group key={sz}>
          <Part geometry={geo.tankSide()} color={TRACK} outline={0.06} position={[0, 1, sz * 1.05]} />
          {/* sponson with a short gun poking out */}
          <Part geometry={geo.box(1.3, 0.8, 0.55)} color={TANK} outline={0.05} position={[0.1, 1.05, sz * 1.65]} />
          <Part geometry={geo.cyl(0.09, 0.09, 1, 8)} color={0x2b2633} outline={0.03} position={[0.75, 1.15, sz * 1.75]} rotation-z={Math.PI / 2} />
        </group>
      ))}
      <Part geometry={geo.box(4, 1.5, 1.5)} color={TANK} outline={0.06} position={[0, 1.05, 0]} />
      <Part geometry={geo.box(1, 0.55, 1.2)} color={TANK} outline={0.05} position={[1.2, 2.05, 0]} />
      <Part geometry={geo.box(0.6, 0.18, 0.06)} color={0x1a1320} outline={0} position={[1.71, 2.1, 0]} rotation-y={Math.PI / 2} />
    </group>
  );
}

const TANK_PLACE = PLACES.find((p) => p.kind === "tank")!;

// The roundabout out west, with the tank on a fountain in the middle.
function Roundabout({ reduce }: { reduce: boolean }) {
  const jets = useRef<THREE.Group>(null!);
  useFrame(({ clock }) => {
    if (reduce) return;
    jets.current.children.forEach((j, i) => {
      const s = Math.sin(clock.elapsedTime * 4 + i * 1.6);
      j.position.y = 1.15 + s * 0.12;
      j.scale.setScalar(1 + s * 0.08);
    });
  });
  const { edge, ring } = ROUNDABOUT;
  return (
    <group position={[ROUNDABOUT.x, 0, ROUNDABOUT.z]}>
      <mesh geometry={geo.cyl(edge, edge, 0.06, 48)} material={toon(0xe8dcc2)} position-y={0.045} receiveShadow />
      {/* the main road carries on through the pavement to the ring */}
      <mesh geometry={geo.box(edge * 2 + 0.2, 0.04, 6)} material={toon(0x6b6573)} position-y={0.06} receiveShadow />
      <mesh geometry={geo.cyl(ring, ring, 0.06, 48)} material={toon(0x6b6573)} position-y={0.055} receiveShadow />
      <Part geometry={geo.cyl(3.6, 3.8, 0.8, 32)} color={0xd6cfe0} position-y={0.4} />
      <mesh geometry={geo.cyl(3.3, 3.3, 0.1, 32)} material={toon(0x4fc3ff)} position-y={0.78} />
      <Part geometry={geo.box(4.4, 0.5, 2.6)} color={0xd6cfe0} outline={0.06} position-y={0.95} />
      <Tank position-y={1.2} rotation-y={-0.5} {...placeEvents(TANK_PLACE)} />
      <group ref={jets}>
        {[0.6, 2.2, 3.8, 5.4].map((a) => (
          <Part key={a} geometry={geo.sphere(0.32)} color={0x9fe3ff} outline={0.04} shadow={false} position={[Math.cos(a) * 2.9, 1.15, Math.sin(a) * 2.9]} />
        ))}
      </group>
    </group>
  );
}

function Building({ p, font }: { p: Place; font: string }) {
  const sign = useMemo(() => signTexture(p.name, hex(p.wall), font), [p, font]);
  const floors = Math.max(1, Math.floor((p.h - 1.5) / 2.6));
  const windows: [number, number][] = [];
  for (let f = 0; f < floors; f++)
    for (const sx of [-1, 1]) for (const col of p.w > 8 ? [2.2, 3.6] : [2.4]) windows.push([sx * col, f === 0 ? 1.7 : 3.8 + (f - 1) * 2.4]);
  return (
    <group position={[p.x, 0, p.z]} rotation-y={p.rot} {...placeEvents(p)}>
      <Part geometry={geo.box(p.w, p.h, p.d)} color={p.wall} outline={0.09} position-y={p.h / 2} />
      {p.roofType === "pitch" ? (
        <Part
          geometry={geo.cone(0.72, 1, 4)}
          color={p.roof}
          outline={0.06}
          rotation-y={Math.PI / 4}
          scale={[p.w * 0.98, p.h * 0.55, p.d * 0.98]}
          position-y={p.h + p.h * 0.275}
        />
      ) : (
        <Part geometry={geo.box(p.w + 0.6, 0.5, p.d + 0.6)} color={p.roof} position-y={p.h + 0.25} />
      )}
      <Part geometry={geo.box(1.6, 2.6, 0.3)} color={0x7a4a2a} outline={0.06} position={[0, 1.3, p.d / 2 + 0.1]} />
      <Part geometry={geo.sphere(0.09)} color={0xffd23f} outline={0.02} position={[0.5, 1.3, p.d / 2 + 0.3]} />
      <Part
        geometry={geo.box(2.6, 0.25, 1)}
        color={p.roof === INK ? 0xffd23f : p.roof}
        outline={0.05}
        position={[0, 2.95, p.d / 2 + 0.45]}
        rotation-x={0.25}
      />
      {windows.map(([wx, wy]) => (
        <Part key={`${wx},${wy}`} geometry={geo.box(1, 1.1, 0.2)} color={WINDOW} outline={0.05} position={[wx, wy, p.d / 2 + 0.05]} />
      ))}
      <mesh position={[0, Math.min(p.h - 0.9, 4.1), p.d / 2 + 0.08]}>
        <planeGeometry args={[4.4, 1.1]} />
        <meshBasicMaterial map={sign} toneMapped={false} />
      </mesh>
    </group>
  );
}

const LEAD = 0x5b6b7a;

// Prism roof running along local z; r is the triangle's circumradius.
function Ridge({ r, len, color, ...g }: { r: number; len: number; color: number } & Omit<ThreeElements["group"], "children">) {
  return (
    <group {...g}>
      <Part geometry={geo.cyl(r, r, len, 3)} color={color} outline={0.08} rotation-x={-Math.PI / 2} scale={[1, 1, 0.55]} />
    </group>
  );
}

function Pinnacles({ x, z, w, y }: { x: number; z: number; w: number; y: number }) {
  return (
    <>
      {[-1, 1].flatMap((sx) =>
        [-1, 1].map((sz) => (
          <Part key={`${sx}${sz}`} geometry={geo.cone(0.4, 2.4, 6)} color={STONE_DARK} outline={0.05} position={[x + (sx * w) / 2, y + 1.2, z + (sz * w) / 2]} />
        )),
      )}
    </>
  );
}

const RECESS = 0xb3a383; // shaded stone in the deep arches, left unlit when the cathedral is floodlit
const LOUVRE = 0x4a4060;
const ROSE = 0x7fb3ff;
const NAVE_W = 8,
  NAVE_H = 11,
  AISLE_W = 2.4,
  AISLE_H = 6;
const SQ3 = Math.sqrt(3);

// A tall lancet window, its pane facing +z, with a pointed head.
function Lancet({ w, h, color = WINDOW, ...g }: { w: number; h: number; color?: number } & Omit<ThreeElements["group"], "children">) {
  return (
    <group {...g}>
      <mesh geometry={geo.box(w, h, 0.12)} material={toon(color)} position-y={h / 2} />
      <mesh geometry={geo.cone(w / 2, w * 0.8, 4)} material={toon(color)} position-y={h + w * 0.4} scale={[1, 1, 0.12]} />
    </group>
  );
}

// One arm of the cathedral, nave or choir, running from z0 to z1: a tall lead-roofed body with
// lower aisles either side under lean-to roofs, flying buttresses between the bays, and a window in every bay.
function Arm({ z0, z1 }: { z0: number; z1: number }) {
  const len = z1 - z0,
    zc = (z0 + z1) / 2;
  const n = Math.max(1, Math.round(len / 2.8)),
    step = len / n;
  const bays = Array.from({ length: n }, (_, i) => z0 + (i + 0.5) * step);
  const piers = bays.slice(1).map((z) => z - step / 2);
  const r = NAVE_W / SQ3;
  const inner = NAVE_W / 2,
    outer = inner + AISLE_W;
  const lean = Math.atan2(NAVE_H - 3.4 - AISLE_H, AISLE_W);
  const fly = Math.atan2(3, 2.75);
  return (
    <>
      <Part geometry={geo.box(NAVE_W, NAVE_H, len)} color={STONE} outline={0.09} position={[0, NAVE_H / 2, zc]} />
      <Ridge r={r} len={len} color={LEAD} position={[0, NAVE_H + r * 0.275, zc]} />
      {[-1, 1].map((s) => (
        <group key={s}>
          <Part geometry={geo.box(AISLE_W, AISLE_H, len)} color={STONE} outline={0.08} position={[s * (inner + AISLE_W / 2), AISLE_H / 2, zc]} />
          <Part
            geometry={geo.box(Math.hypot(AISLE_W, NAVE_H - 3.4 - AISLE_H) + 0.3, 0.22, len)}
            color={LEAD}
            outline={0.05}
            position={[s * (inner + AISLE_W / 2), (NAVE_H - 3.4 + AISLE_H) / 2 + 0.1, zc]}
            rotation-z={-s * lean}
          />
          {piers.map((z) => (
            <group key={z} position={[s * (outer + 0.3), 0, z]}>
              <Part geometry={geo.box(0.7, AISLE_H + 1.2, 0.8)} color={STONE_DARK} outline={0.05} position-y={(AISLE_H + 1.2) / 2} />
              <Part geometry={geo.cone(0.4, 1.6, 4)} color={STONE_DARK} outline={0.04} position-y={AISLE_H + 2} rotation-y={Math.PI / 4} />
              {/* the flying buttress, leaping from the pier to the top of the nave wall */}
              <Part geometry={geo.box(4.1, 0.35, 0.4)} color={STONE_DARK} outline={0.04} position={[-s * 1.35, AISLE_H + 2.3, 0]} rotation-z={-s * fly} />
            </group>
          ))}
          {bays.map((z) => (
            <group key={z}>
              <Lancet w={0.8} h={2.4} position={[s * (outer + 0.02), 1.8, z]} rotation-y={(s * Math.PI) / 2} />
              <Lancet w={0.9} h={2} position={[s * (inner + 0.02), NAVE_H - 3, z]} rotation-y={(s * Math.PI) / 2} />
            </group>
          ))}
        </group>
      ))}
    </>
  );
}

// A transept: an arm crossing the cathedral from side to side, with a lancet in each bay and a rose window in each end.
function Transept({ z, span, d, h, rose }: { z: number; span: number; d: number; h: number; rose?: boolean }) {
  const r = d / SQ3;
  const wing = span / 2 - NAVE_W / 2 - AISLE_W;
  return (
    <>
      <Part geometry={geo.box(span, h, d)} color={STONE} outline={0.09} position={[0, h / 2, z]} />
      <group position={[0, h + r * 0.275, z]} rotation-y={Math.PI / 2}>
        <Ridge r={r} len={span} color={LEAD} />
      </group>
      {[-1, 1].map((s) => (
        <group key={s}>
          {rose ? (
            <>
              <Part geometry={geo.cyl(1.5, 1.5, 0.2, 24)} color={ROSE} outline={0.07} position={[(s * span) / 2, h - 3.6, z]} rotation-z={Math.PI / 2} />
              <Lancet w={0.8} h={2.6} position={[(s * span) / 2 + s * 0.02, 1.4, z]} rotation-y={(s * Math.PI) / 2} />
            </>
          ) : (
            [-0.9, 0.9].map((o) => <Lancet key={o} w={0.7} h={3.4} position={[(s * span) / 2 + s * 0.02, 2.2, z + o]} rotation-y={(s * Math.PI) / 2} />)
          )}
          {/* turrets at the corners of each end */}
          {[-1, 1].map((sz) => (
            <group key={sz} position={[(s * span) / 2, 0, z + (sz * d) / 2]}>
              <Part geometry={geo.cyl(0.5, 0.5, h + 1.2, 8)} color={STONE_DARK} outline={0.05} position-y={(h + 1.2) / 2} />
              <Part geometry={geo.cone(0.6, 2.2, 8)} color={STONE_DARK} outline={0.04} position-y={h + 2.3} />
            </group>
          ))}
          {/* windows along the side walls of the arm, beyond the aisles */}
          {Array.from({ length: Math.max(0, Math.floor(wing / 2.4)) }, (_, i) => s * (span / 2 - 1.4 - i * 2.4)).flatMap((x) =>
            [-1, 1].map((sz) => <Lancet key={`${x}${sz}`} w={0.8} h={2.8} position={[x, 2, z + sz * (d / 2 + 0.02)]} rotation-y={sz < 0 ? Math.PI : 0} />),
          )}
        </group>
      ))}
    </>
  );
}

// A tower with a belfry stage of tall louvred openings near the top, a parapet and corner pinnacles.
function Tower({ x, z, w, h, belfry }: { x: number; z: number; w: number; h: number; belfry: number }) {
  const n = w > 5 ? 3 : 2;
  return (
    <group position={[x, 0, z]}>
      <Part geometry={geo.box(w, h, w)} color={STONE_DARK} outline={0.09} position-y={h / 2} />
      <Part geometry={geo.box(w + 0.4, 0.4, w + 0.4)} color={STONE} outline={0.05} position-y={h - belfry - 0.8} />
      <Part geometry={geo.box(w + 0.5, 0.6, w + 0.5)} color={STONE} outline={0.05} position-y={h + 0.3} />
      {[0, 1, 2, 3].map((side) => (
        <group key={side} rotation-y={(side * Math.PI) / 2}>
          {Array.from({ length: n }, (_, i) => (i - (n - 1) / 2) * (w / n)).map((o) => (
            <Lancet key={o} w={w / n - 0.7} h={belfry - 1.8} color={LOUVRE} position={[o, h - belfry, w / 2 + 0.02]} />
          ))}
        </group>
      ))}
      <Pinnacles x={0} z={0} w={w} y={h + 0.6} />
    </group>
  );
}

// Lincoln Cathedral. From the west: the great screen front with its arcading and two towers rising
// behind it, the long aisled nave, the main transept under the tall central tower, the choir crossed
// by the east transept, and the square east end. The polygonal chapter house stands off the north side.
// In its own coordinates the west front faces +z and north is -x.
function Cathedral({ p, font }: { p: Place; font: string }) {
  const sign = useMemo(() => signTexture(p.name, "#5b6b7a", font), [p, font]);
  useEffect(() => () => sign.dispose(), [sign]);
  const front = p.d / 2,
    back = -p.d / 2;
  const SCREEN = { w: 21.5, h: 15 };
  const cross = back + 30; // main crossing, under the central tower, with the long choir east of it
  const east = back + 13; // east transept, with the Angel Choir beyond it
  const chapter = { x: -9.6, z: east - 2.15, r: 2.3 };
  return (
    <group position={[p.x, 0, p.z]} rotation-y={p.rot} {...placeEvents(p)}>
      {/* a stone apron the whole cathedral stands on, levelling it on the brow of the hill */}
      <Part geometry={geo.box(p.w + 0.4, 2, p.d + 0.4)} color={0xd2c4a6} outline={0.05} position-y={-0.95} />
      <Arm z0={cross + 2.5} z1={front - 2} />
      <Arm z0={back} z1={cross - 2.5} />
      <Transept z={cross} span={p.w - 2} d={5} h={NAVE_H - 0.5} rose />
      <Transept z={east} span={18} d={3.5} h={NAVE_H - 1.5} />
      <Tower x={0} z={cross} w={7.4} h={37} belfry={8} />
      {/* the square east end with its great window */}
      <group position-z={back - 0.02} rotation-y={Math.PI}>
        <Lancet w={1.2} h={5} position={[-1.5, 2.6, 0]} />
        <Lancet w={1.4} h={5.8} position={[0, 2.6, 0]} />
        <Lancet w={1.2} h={5} position={[1.5, 2.6, 0]} />
        <Part geometry={geo.cyl(0.8, 0.8, 0.14, 16)} color={ROSE} outline={0.04} position={[0, 9.6, 0]} rotation-x={Math.PI / 2} />
        {[-1, 1].map((s) => (
          <Lancet key={s} w={1} h={2.6} position={[s * (NAVE_W / 2 + AISLE_W / 2), 1.6, 0]} />
        ))}
      </group>
      {[-1, 1].map((s) => (
        <group key={s} position={[(s * NAVE_W) / 2, 0, back]}>
          <Part geometry={geo.cyl(0.6, 0.6, NAVE_H + 2, 8)} color={STONE_DARK} outline={0.05} position-y={(NAVE_H + 2) / 2} />
          <Part geometry={geo.cone(0.7, 2.6, 8)} color={STONE_DARK} outline={0.04} position-y={NAVE_H + 3.3} />
        </group>
      ))}
      {/* the chapter house: ten-sided, under a tall lead roof, braced by flying buttresses */}
      <group position={[chapter.x, 0, chapter.z]}>
        <Part geometry={geo.cyl(chapter.r, chapter.r, 7, 10)} color={STONE} outline={0.08} position-y={3.5} />
        <Part geometry={geo.cone(chapter.r + 0.4, 3.6, 10)} color={LEAD} outline={0.07} position-y={8.8} />
        {[160, 200, 240, 280, 320].map((deg) => (
          <group key={deg} rotation-y={(-deg * Math.PI) / 180}>
            <Part geometry={geo.box(0.6, 4.4, 0.6)} color={STONE_DARK} outline={0.04} position={[chapter.r + 1.1, 2.2, 0]} />
            <Part geometry={geo.box(2.5, 0.3, 0.35)} color={STONE_DARK} outline={0.04} position={[chapter.r + 0.55, 5.4, 0]} rotation-z={-Math.atan2(2, 1.1)} />
          </group>
        ))}
        {[180, 220, 260, 300, 340].map((deg) => (
          <group key={deg} rotation-y={(-deg * Math.PI) / 180}>
            <Lancet w={0.8} h={3.2} position={[chapter.r * 0.98, 2, 0]} rotation-y={Math.PI / 2} />
          </group>
        ))}
      </group>
      {/* the two west towers, rising behind the screen */}
      {[-1, 1].map((s) => (
        <Tower key={s} x={s * 4.6} z={front - 3.6} w={3.8} h={31} belfry={7} />
      ))}
      {/* the west front: a broad screen with three great recessed arches, a band of arcading and a turret at each end */}
      <Part geometry={geo.box(SCREEN.w, SCREEN.h, 2)} color={STONE} outline={0.09} position={[0, SCREEN.h / 2, front - 1]} />
      <Part geometry={geo.box(3.4, 3.4, 0.8)} color={STONE} outline={0.07} position={[0, SCREEN.h, front - 1]} rotation-z={Math.PI / 4} />
      <Lancet w={4.4} h={7.6} color={RECESS} position={[0, 0, front + 0.01]} />
      {[-1, 1].map((s) => (
        <group key={s}>
          <Lancet w={2.8} h={5.6} color={RECESS} position={[s * 5.4, 0, front + 0.01]} />
          <Part geometry={geo.box(1.4, 2.8, 0.3)} color={0x5a3a22} outline={0.05} position={[s * 5.4, 1.4, front + 0.1]} />
          <Lancet w={1} h={2.4} position={[s * 5.4, 3.6, front + 0.04]} />
          {[0, 1].map((i) => (
            <Lancet key={i} w={0.9} h={3} color={RECESS} position={[s * (7 + i * 1.1), 5, front + 0.01]} />
          ))}
          <group position={[(s * SCREEN.w) / 2, 0, front - 1]}>
            <Part geometry={geo.cyl(0.8, 0.8, SCREEN.h + 2.5, 8)} color={STONE_DARK} outline={0.06} position-y={(SCREEN.h + 2.5) / 2} />
            <Part geometry={geo.cone(0.9, 3, 8)} color={STONE_DARK} outline={0.05} position-y={SCREEN.h + 4} />
          </group>
        </group>
      ))}
      {/* the arcading high across the screen */}
      {[13, 14.6].map((y) => (
        <Part key={y} geometry={geo.box(SCREEN.w, 0.25, 0.3)} color={STONE_DARK} outline={0.03} position={[0, y, front + 0.1]} />
      ))}
      {Array.from({ length: 24 }, (_, i) => -SCREEN.w / 2 + 0.6 + i * ((SCREEN.w - 1.2) / 23)).map((x) => (
        <mesh key={x} geometry={geo.box(0.18, 1.35, 0.14)} material={toon(STONE_DARK)} position={[x, 13.8, front + 0.06]} />
      ))}
      {/* rose window, great door and the imp perched above it */}
      <Part geometry={geo.cyl(1.4, 1.4, 0.25, 24)} color={ROSE} outline={0.07} position={[0, 8.9, front + 0.08]} rotation-x={Math.PI / 2} />
      <Part geometry={geo.box(2.8, 4.4, 0.3)} color={0x5a3a22} outline={0.06} position={[0, 2.2, front + 0.1]} />
      <Part geometry={geo.cyl(1.4, 1.4, 0.3, 16)} color={0x5a3a22} outline={0.06} position={[0, 4.4, front + 0.1]} rotation-x={Math.PI / 2} scale={[1, 1, 0.6]} />
      <Part geometry={geo.box(3.6, 0.3, 0.8)} color={STONE_DARK} outline={0.05} position={[0, 5.6, front + 0.3]} />
      <group position={[0, 6.05, front + 0.4]}>
        <Part geometry={geo.sphere(0.3)} color={0xc8973a} outline={0.04} position={[0, 0, 0]} />
        <Part geometry={geo.sphere(0.24)} color={0xc8973a} outline={0.04} position={[0, 0.42, 0.04]} />
        {[-1, 1].map((sx) => (
          <Part key={sx} geometry={geo.cone(0.07, 0.25)} color={0x4a2f22} outline={0.02} position={[sx * 0.12, 0.7, 0.02]} rotation-z={-sx * 0.4} />
        ))}
      </group>
      <mesh position={[0, 11.9, front + 0.03]}>
        <planeGeometry args={[6.4, 1.6]} />
        <meshBasicMaterial map={sign} toneMapped={false} />
      </mesh>
    </group>
  );
}

// The visitor's own shop, built on the plot they typed its name at: a front in their colour with a
// striped awning, their name over it and a window display for their kind of business.
function YourShop({ p, font, name, type, colour }: { p: Place; font: string; name: string; type: ShopType; colour: number }) {
  const sign = useMemo(() => signTexture(shopSign(name), hex(colour), font), [name, colour, font]);
  useEffect(() => () => sign.dispose(), [sign]);
  const fw = p.w - 1.6,
    fd = Math.min(3.6, p.d * 0.5),
    back = -p.d / 2 + 0.4,
    front = back + fd,
    h = 3.8;
  // solid while it stands
  useEffect(() => {
    EXTRA_BOXES.set(p.id, toWorld(p, { x0: -fw / 2, x1: fw / 2, z0: back, z1: front }));
    return () => void EXTRA_BOXES.delete(p.id);
  }, [p, fw, back, front]);
  const signW = Math.min(fw - 0.6, 4.4);
  const stripes = Math.max(5, Math.round(fw / 0.6));
  const winW = fw * 0.45,
    winX = -fw * 0.18,
    doorX = fw / 2 - 0.9;
  const z = front + 0.2; // just in front of the glass
  return (
    <group>
      <Part geometry={geo.box(fw, h, fd)} color={colour} outline={0.07} position={[0, h / 2, (back + front) / 2]} />
      <Part geometry={geo.box(fw + 0.3, 0.3, fd + 0.3)} color={INK} outline={0.04} position={[0, h + 0.15, (back + front) / 2]} />
      {/* name board */}
      <Part geometry={geo.box(signW + 0.2, 1.05, 0.12)} color={0xfff8e7} outline={0.05} position={[0, 3.15, front + 0.06]} />
      <mesh position={[0, 3.15, front + 0.13]}>
        <planeGeometry args={[signW, 0.95]} />
        <meshBasicMaterial map={sign} toneMapped={false} />
      </mesh>
      {/* striped awning */}
      {Array.from({ length: stripes }, (_, i) => (
        <Part
          key={i}
          geometry={geo.box(fw / stripes + 0.01, 0.08, 1.05)}
          color={i % 2 ? 0xfff8e7 : colour}
          outline={0.02}
          position={[-fw / 2 + (fw / stripes) * (i + 0.5), 2.35, front + 0.5]}
          rotation-x={0.35}
        />
      ))}
      <Part geometry={geo.box(fw, 0.22, 0.06)} color={colour} outline={0.03} position={[0, 2.08, front + 0.98]} />
      {/* window, sill and door */}
      <Part geometry={geo.box(winW, 1.3, 0.12)} color={WINDOW} outline={0.04} position={[winX, 1.2, front + 0.06]} />
      <Part geometry={geo.box(winW + 0.2, 0.1, 0.35)} color={0xfff8e7} outline={0.03} position={[winX, 0.5, front + 0.15]} />
      <Part geometry={geo.box(0.95, 2, 0.14)} color={0x7a4a2a} outline={0.05} position={[doorX, 1, front + 0.07]} />
      <Part geometry={geo.sphere(0.07)} color={0xffd23f} outline={0.02} position={[doorX + 0.3, 1, front + 0.2]} />
      <group position={[winX, 0.55, z]}>
        <Display type={type} colour={colour} />
      </group>
      {/* flowers either side of the door */}
      {[doorX - 0.85, doorX + 0.85].filter((x) => x < fw / 2).map((x) => (
        <group key={x} position={[x, 0, front + 0.45]}>
          <Part geometry={geo.box(0.5, 0.4, 0.5)} color={0x8a5a33} outline={0.03} position-y={0.2} />
          {[0xff7eb6, 0xffd23f, 0xff5a3c].map((c, i) => (
            <Part key={c} geometry={geo.sphere(0.13)} color={c} outline={0.02} position={[(i - 1) * 0.15, 0.52 + (i % 2) * 0.08, 0]} />
          ))}
        </group>
      ))}
    </group>
  );
}

// What's in the window, by kind of business.
function Display({ type, colour }: { type: ShopType; colour: number }) {
  if (type === "salon")
    return (
      <>
        <Part geometry={geo.cyl(0.36, 0.36, 0.06, 20)} color={0xc8973a} outline={0.03} position={[-0.35, 0.65, -0.05]} rotation-x={Math.PI / 2} />
        <Part geometry={geo.cyl(0.29, 0.29, 0.07, 20)} color={0xe8f7ff} outline={0} position={[-0.35, 0.65, -0.03]} rotation-x={Math.PI / 2} />
        <Part geometry={geo.box(0.4, 0.12, 0.35)} color={colour} outline={0.03} position={[0.4, 0.25, 0]} />
        <Part geometry={geo.box(0.4, 0.45, 0.08)} color={colour} outline={0.03} position={[0.4, 0.5, -0.14]} />
        <Part geometry={geo.cyl(0.04, 0.04, 0.2, 8)} color={INK} outline={0} position={[0.4, 0.1, 0]} />
      </>
    );
  if (type === "cafe")
    return (
      <>
        <Part geometry={geo.cyl(0.26, 0.26, 0.22, 16)} color={0xff9ec7} outline={0.03} position={[-0.3, 0.16, 0]} />
        <Part geometry={geo.cyl(0.27, 0.27, 0.06, 16)} color={0xfff8e7} outline={0.02} position={[-0.3, 0.29, 0]} />
        <Part geometry={geo.sphere(0.07)} color={0xe03a3e} outline={0.02} position={[-0.3, 0.37, 0]} />
        {[0.25, 0.6].map((x) => (
          <group key={x} position={[x, 0.12, 0]}>
            <Part geometry={geo.cyl(0.1, 0.08, 0.18, 12)} color={0xffffff} outline={0.02} />
            <Part geometry={geo.cyl(0.11, 0.11, 0.02, 12)} color={0x6b4226} outline={0} position-y={0.09} />
          </group>
        ))}
      </>
    );
  if (type === "trades")
    return (
      <>
        <Part geometry={geo.box(0.6, 0.3, 0.28)} color={0xe03a3e} outline={0.03} position={[-0.3, 0.2, 0]} />
        <Part geometry={geo.box(0.3, 0.06, 0.06)} color={INK} outline={0} position={[-0.3, 0.42, 0]} />
        {/* a spanner and a hammer */}
        <Part geometry={geo.box(0.06, 0.5, 0.04)} color={0xb8c0cc} outline={0.02} position={[0.3, 0.35, 0]} rotation-z={0.5} />
        <Part geometry={geo.box(0.05, 0.45, 0.05)} color={0x8a5a33} outline={0.02} position={[0.6, 0.3, 0]} rotation-z={-0.3} />
        <Part geometry={geo.box(0.22, 0.1, 0.08)} color={INK} outline={0.02} position={[0.67, 0.52, 0]} rotation-z={-0.3} />
      </>
    );
  return (
    <>
      {[
        [-0.45, 0.15, 0.3, 0xff5a3c],
        [0.05, 0.13, 0.26, 0x3fa7d6],
        [-0.2, 0.42, 0.22, 0xffd23f],
        [0.5, 0.11, 0.22, colour],
      ].map(([x, y, sz, c]) => (
        <group key={x} position={[x, y, 0]}>
          <Part geometry={geo.box(sz, sz, sz)} color={c} outline={0.03} />
          <Part geometry={geo.box(sz + 0.02, 0.04, sz + 0.02)} color={0xfff8e7} outline={0} />
        </group>
      ))}
    </>
  );
}

// An empty plot with a signboard, waiting for the next client.
function Lot({ p, font }: { p: Place; font: string }) {
  const mine = usePlay((st) => (st.shop?.lot === p.id ? st.shop : null));
  const shop = mine?.name.trim() ?? "";
  if (shop) {
    return (
      <group position={[p.x, 0, p.z]} rotation-y={p.rot} {...placeEvents(p)}>
        <mesh geometry={geo.box(p.w, 0.06, p.d)} material={toon(0xd9ccb2)} position-y={0.03} receiveShadow />
        <YourShop p={p} font={font} name={shop} type={mine?.type ?? "shop"} colour={parseInt((mine?.colour ?? SHOP_COLOURS[0]).slice(1), 16)} />
      </group>
    );
  }
  return <EmptyLot p={p} font={font} />;
}

function EmptyLot({ p, font }: { p: Place; font: string }) {
  const sign = useMemo(() => signTexture(p.name, hex(p.wall), font), [p, font]);
  useEffect(() => () => sign.dispose(), [sign]);
  const back = -p.d / 2 + 1;
  return (
    <group position={[p.x, 0, p.z]} rotation-y={p.rot} {...placeEvents(p)}>
      <mesh geometry={geo.box(p.w, 0.06, p.d)} material={toon(0xc9a46b)} position-y={0.03} receiveShadow />
      {[-1.3, 1.3].map((x) => (
        <Part key={x} geometry={geo.box(0.22, 2.6, 0.22)} color={0x8a5a33} outline={0.04} position={[x, 1.3, back]} />
      ))}
      <Part geometry={geo.box(3.4, 1.1, 0.2)} color={0xfff8e7} outline={0.06} position={[0, 2.3, back]} />
      <mesh position={[0, 2.3, back + 0.11]}>
        <planeGeometry args={[3.3, 0.9]} />
        <meshBasicMaterial map={sign} toneMapped={false} />
      </mesh>
      {[-1, 1].flatMap((sx) =>
        [-1, 1].map((sz) => (
          <group key={`${sx}${sz}`} position={[(sx * (p.w - 1)) / 2, 0, (sz * (p.d - 1)) / 2]}>
            <Part geometry={geo.cone(0.3, 0.8, 10)} color={0xff7a1a} outline={0.04} position-y={0.4} />
            <Part geometry={geo.box(0.7, 0.08, 0.7)} color={0xff7a1a} outline={0.03} position-y={0.04} />
          </group>
        )),
      )}
    </group>
  );
}

// Sincil Bank, simplified: a pitch ringed by four red-and-white stands with floodlights.

function Stadium({ p, font, reduce }: { p: Place; font: string; reduce: boolean }) {
  const matchday = useMemo(() => isMatchday(), []);
  const sign = useMemo(() => signTexture(p.name, hex(p.wall), font), [p, font]);
  const champs = useMemo(() => signTexture("League 1 Champions\n2025/26", hex(p.wall), font), [p, font]);
  const pw = p.w - 9,
    pd = p.d - 9;
  const stands: { x: number; z: number; w: number; d: number; ry: number }[] = [
    { x: 0, z: -(pd / 2 + 2.2), w: p.w, d: 4.4, ry: 0 },
    { x: 0, z: pd / 2 + 2.2, w: p.w - 8, d: 4.4, ry: Math.PI },
    { x: -(pw / 2 + 2.2), z: 0, w: pd, d: 4.4, ry: Math.PI / 2 },
    { x: pw / 2 + 2.2, z: 0, w: pd, d: 4.4, ry: -Math.PI / 2 },
  ];
  return (
    <group position={[p.x, 0, p.z]} rotation-y={p.rot} {...placeEvents(p)}>
      <mesh geometry={geo.box(pw, 0.08, pd)} material={toon(0x4cc25c)} position-y={0.05} receiveShadow />
      {Array.from({ length: 6 }, (_, i) => (
        <mesh key={i} geometry={geo.box(pw / 6, 0.09, pd)} material={toon(0x3fae4f)} position={[-pw / 2 + pw / 12 + (i * pw) / 6, 0.051, 0]} visible={i % 2 === 0} />
      ))}
      {/* pitch markings */}
      <mesh geometry={geo.box(0.15, 0.1, pd - 1)} material={toon(0xffffff)} position-y={0.06} />
      <mesh geometry={geo.cyl(2.2, 2.2, 0.1, 32)} material={toon(0xffffff)} position-y={0.055} />
      <mesh geometry={geo.cyl(2.05, 2.05, 0.11, 32)} material={toon(0x4cc25c)} position-y={0.056} />
      {[-1, 1].map((sx) => (
        <group key={sx}>
          <Part geometry={geo.box(0.15, 1.6, 3.2)} color={0xffffff} outline={0.04} position={[sx * (pw / 2 - 0.3), 0.8, 0]} />
          <Part geometry={geo.box(0.15, 0.15, 3.2)} color={0xffffff} outline={0.04} position={[sx * (pw / 2 - 0.3), 1.6, 0]} />
        </group>
      ))}
      {/* stands: a sloped tier of red seats with a white roof */}
      {stands.map((st, i) => (
        <group key={i} position={[st.x, 0, st.z]} rotation-y={st.ry}>
          <Part geometry={geo.box(st.w, 1.2, st.d)} color={0xe8e1d0} outline={0.07} position={[0, 0.6, 0]} />
          {[0, 1, 2].map((r) => (
            <Part key={r} geometry={geo.box(st.w - 0.4, 0.9, 1.3)} color={r % 2 ? 0xffffff : p.wall} outline={0.05} position={[0, 1.45 + r * 0.9, st.d / 2 - 0.75 - r * 1.3]} />
          ))}
          <Part geometry={geo.box(st.w, 0.3, st.d + 0.6)} color={p.roof} outline={0.07} position={[0, 5.4, 0.2]} rotation-x={-0.08} />
          {[-1, 1].map((sx) => (
            <Part key={sx} geometry={geo.box(0.3, 5.2, 0.3)} color={0x2b2633} outline={0.04} position={[(sx * (st.w - 1)) / 2, 2.6, st.d / 2]} />
          ))}
        </group>
      ))}
      {/* floodlights */}
      {[-1, 1].flatMap((sx) =>
        [-1, 1].map((sz) => (
          <group key={`${sx}${sz}`} position={[(sx * (pw + 7)) / 2, 0, (sz * (pd + 7)) / 2]}>
            <Part geometry={geo.cyl(0.2, 0.3, 11, 8)} color={0x2b2633} outline={0.04} position-y={5.5} />
            <Part geometry={geo.box(2, 1.2, 0.4)} color={LAMP} outline={0.05} position-y={11.2} rotation-y={Math.atan2(-sx, -sz)} />
          </group>
        )),
      )}
      <mesh position={[0, 4.2, pd / 2 + 4.45]}>
        <planeGeometry args={[6, 1.5]} />
        <meshBasicMaterial map={sign} toneMapped={false} />
      </mesh>
      {matchday && (
        <>
          <Crowd stands={stands} reduce={reduce} />
          <Chant font={font} reduce={reduce} />
        </>
      )}
      {/* champions board beside the main entrance */}
      <group position={[7.5, 0, p.d / 2 + 3]} rotation-y={-p.rot - 0.15}>
        {[-2.6, 2.6].map((x) => (
          <Part key={x} geometry={geo.box(0.3, 4.6, 0.3)} color={0x2b2633} outline={0.04} position={[x, 2.3, 0]} />
        ))}
        <Part geometry={geo.box(6.6, 2.9, 0.25)} color={0xe03a3e} outline={0.07} position={[0, 4, 0]} />
        <mesh position={[0, 4, 0.13]}>
          <planeGeometry args={[6.2, 2.5]} />
          <meshBasicMaterial map={champs} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

function Sun({ night, dim = 1 }: { night: boolean; dim?: number }) {
  const light = useRef<THREE.DirectionalLight>(null!);
  // keep the shadow box centred on the imp so shadows work across the whole town
  useFrame(() => {
    const { x, z } = game.pos;
    const y = groundY(z);
    light.current.position.set(x + 20, y + 35, z + 15);
    light.current.target.position.set(x, y, z);
    light.current.target.updateMatrixWorld();
  });
  return (
    <directionalLight
      ref={light}
      color={night ? 0x8fa3ff : 0xfff3d6}
      intensity={(night ? 0.7 : 2.4) * dim}
      castShadow
      shadow-mapSize={[2048, 2048]}
      shadow-camera-left={-40}
      shadow-camera-right={40}
      shadow-camera-top={40}
      shadow-camera-bottom={-40}
      shadow-camera-far={100}
    />
  );
}

function Tree({ x, z, s }: { x: number; z: number; s: number }) {
  const c = [0x3fae4f, 0x4cc25c, 0x36994a][Math.floor(Math.abs(x * 7 + z * 3)) % 3];
  return (
    <group position={[x, groundY(z), z]} scale={s}>
      <Part geometry={geo.cyl(0.25, 0.35, 1.6, 8)} color={0x8a5a33} outline={0.05} position-y={0.8} />
      {([[0, 2.3, 0, 1.2], [0.6, 1.9, 0.3, 0.8], [-0.55, 2, -0.2, 0.85]] as const).map(([a, b, cc, r]) => (
        <Part key={r} geometry={geo.sphere(r)} color={c} outline={0.06} position={[a, b, cc]} />
      ))}
    </group>
  );
}

const LAMPS: [number, number][] = [[-5.5, -5.5], [5.5, -5.5], [-5.5, 5.5], [5.5, 5.5]];
for (let i = 20; i < BOUND; i += 18) if (Math.abs(-i - ROUNDABOUT.x) > ROUNDABOUT.edge) LAMPS.push([-i, -5.5], [-i, 5.5]);
// none across the ways in and out of the bus station
for (let i = 20; i < EAST; i += 18) {
  LAMPS.push([i, 5.5]);
  if (BUS_STATION.tarmac.every((r) => i < r.x0 - 1 || i > r.x1 + 1)) LAMPS.push([i, -5.5]);
}
// down the south road, none on the level crossing or across the junction with the side roads
for (let i = 20; i < SOUTH; i += 18) if (Math.abs(i - RAIL.z) > 5 && Math.abs(i - STADIUM_ROAD.z) > 5) LAMPS.push([5.5, i], [-5.5, i]);
// up the High Street, along the shopfronts and clear of the river and the Stonebow
for (const i of [-12, -24, -43, -61, -70]) LAMPS.push([HIGH_ST - 0.7, i], [0.7 - HIGH_ST, i]);
// on Cornhill, in front of the shops and by the way in
LAMPS.push([CORNHILL[0].x0 + 0.8, CORNHILL[0].z1 - 0.8], [CORNHILL[1].x1 - 0.8, -10]);

// Paving slabs scattered over Castle Square, up the High Street and along its side streets.
const SLABS = (() => {
  const r = seeded(23);
  const square = Array.from({ length: 90 }, () => [CLOSE.x0 + 1 + r() * (CLOSE.x1 - CLOSE.x0 - 2), CLOSE.z0 + 1 + r() * (CLOSE.z1 - CLOSE.z0 - 2)] as const);
  const street = Array.from({ length: 60 }, () => [(r() - 0.5) * (HIGH_ST * 2 - 1), NS_START + 1 + r() * (-8 - NS_START)] as const);
  const c = CORNHILL[0];
  const cornhill = Array.from({ length: 30 }, () => [c.x0 + 1 + r() * (c.x1 - c.x0 - 2), c.z0 + 1 + r() * (c.z1 - c.z0 - 2)] as const);
  const sides = STONEBOW_STREETS.flatMap((f) => Array.from({ length: Math.round((f.x1 - f.x0) / 3) }, () => [f.x0 + 1 + r() * (f.x1 - f.x0 - 2), f.z0 + 0.6 + r() * (f.z1 - f.z0 - 1.2)] as const));
  return [...square, ...street, ...cornhill, ...sides];
})();

// The farmers' market on Castle Square: striped stalls piled with fruit and veg.
const AWNINGS = [0xe03a3e, 0x2f8f5b, 0x2b59c3, 0xffb627];
const PRODUCE = [0xe03a3e, 0xff8c1a, 0x6cc24a, 0xffd23f, 0x7a3b8f];
function Market() {
  return (
    <>
      {SLABS.map(([x, z], i) => (
        <mesh key={i} geometry={geo.box(1.1, 0.06, 0.8)} material={toon(0xc7b89a)} position={[x, groundY(z) + 0.05, z]} rotation-x={groundTilt(z)} raycast={() => null} />
      ))}
      {STALLS.map((s, i) => (
        <group key={`${s.x},${s.z}`} position={[s.x, groundY(s.z), s.z]}>
          {[-1, 1].flatMap((sx) =>
            [-1, 1].map((sz) => (
              <Part key={`${sx}${sz}`} geometry={geo.box(0.12, 2.6, 0.12)} color={0x8a5a33} outline={0.03} position={[(sx * (STALL.w - 0.2)) / 2, 1.3, (sz * (STALL.d - 0.2)) / 2]} />
            )),
          )}
          <Part geometry={geo.box(STALL.w - 0.2, 0.9, STALL.d - 0.6)} color={0xc9a46b} outline={0.05} position={[0, 0.45, 0.2]} />
          {/* striped awning */}
          {Array.from({ length: 5 }, (_, k) => (
            <Part
              key={k}
              geometry={geo.box(STALL.w / 5, 0.12, STALL.d + 0.4)}
              color={k % 2 ? 0xfff8e7 : AWNINGS[i % AWNINGS.length]}
              outline={0.03}
              position={[-STALL.w / 2 + STALL.w / 10 + (k * STALL.w) / 5, 2.65, 0.1]}
              rotation-x={0.18}
            />
          ))}
          {/* crates of produce on the counter */}
          {[-1.2, 0, 1.2].map((x, j) => (
            <group key={x} position={[x, 0.9, 0.5]}>
              <Part geometry={geo.box(1, 0.3, 0.8)} color={0x8a5a33} outline={0.03} position-y={0.15} />
              {[-0.25, 0.25].flatMap((px) =>
                [-0.18, 0.18].map((pz) => (
                  <Part key={`${px}${pz}`} geometry={geo.sphere(0.17, 10, 8)} color={PRODUCE[(i * 3 + j) % PRODUCE.length]} outline={0.02} position={[px, 0.38, pz]} />
                )),
              )}
            </group>
          ))}
        </group>
      ))}
    </>
  );
}

// Footpaths ignore the pointer so clicking one still walks the Imp to that spot.
function Footpaths() {
  const run = FOOTPATHS[0];
  return (
    <>
      {FOOTPATHS.map((f, i) => (
        <Strip
          key={i}
          w={f.x1 - f.x0}
          d={f.z1 - f.z0}
          color={RING_PATHS.includes(f) ? SETTS : 0xe8dcc2}
          x={(f.x0 + f.x1) / 2}
          z={(f.z0 + f.z1) / 2}
          y={0.06 + i * 0.002}
          raycast={() => null}
        />
      ))}
      {/* lamps along the path, leaving out the one that would stand on the river bank by the footbridge */}
      {Array.from({ length: Math.floor((run.z1 - run.z0) / 16) }, (_, i) => -12 - i * 16)
        .filter((z) => Math.abs(z - RIVER.z) > RIVER.half + 2)
        .map((z) => (
        <group key={z} position={[run.x1 + 0.8, groundY(z), z]}>
          <Part geometry={geo.cyl(0.08, 0.1, 2.6, 8)} color={0x2b2633} outline={0.03} position-y={1.3} />
          <Part geometry={geo.sphere(0.24)} color={LAMP} outline={0.04} position-y={2.7} />
        </group>
      ))}
    </>
  );
}

// The houses down the south road: little two-up two-down cottages, front doors onto the road.
const HOUSE_WALLS = [0xfff1d6, 0xffd9b8, 0xd6ecff, 0xe8f5c8, 0xffd6e4, 0xf2e2c4];
const HOUSE_ROOFS = [0xb5523b, 0x5b6b7a, 0x8a5a33, 0x7a3b8f];
const DOORS = [0x2b59c3, 0xe03a3e, 0x2f8f5b, 0x1a1320, 0xffb627];
function Houses() {
  const { w, d, h } = HOUSE;
  return (
    <>
      {HOUSES.map((o) => {
        const k = o.i + (o.side > 0 ? 3 : 0);
        return (
          <group key={`${o.side}${o.i}`} position={[o.x, 0, o.z]} rotation-y={(-o.side * Math.PI) / 2}>
            <Part geometry={geo.box(w, h, d)} color={HOUSE_WALLS[k % HOUSE_WALLS.length]} outline={0.07} position-y={h / 2} />
            <Ridge r={d / 1.6} len={w + 0.4} color={HOUSE_ROOFS[k % HOUSE_ROOFS.length]} position-y={h + (d / 1.6) * 0.275} rotation-y={Math.PI / 2} />
            <Part geometry={geo.box(0.6, 1.4, 0.6)} color={0x9a5a44} outline={0.04} position={[w / 2 - 0.8, h + 1.6, -0.6]} />
            <Part geometry={geo.box(1, 1.9, 0.2)} color={DOORS[k % DOORS.length]} outline={0.05} position={[-0.9, 0.95, d / 2 + 0.05]} />
            {[
              [1.1, 1.3],
              [-1.1, 2.75],
              [1.1, 2.75],
            ].map(([x, y]) => (
              <Part key={`${x}${y}`} geometry={geo.box(1, 0.9, 0.2)} color={WINDOW} outline={0.04} position={[x, y, d / 2 + 0.05]} />
            ))}
          </group>
        );
      })}
    </>
  );
}

// The shopfronts along the High Street and on Cornhill (Bailgate's own are in Bailgate.tsx): two storeys
// over a shop window, a coloured fascia board over it, and the door to one side, front onto the street.
function Shopfronts() {
  return (
    <>
      {SHOPFRONTS.filter((o) => !o.bailgate).map((o) => {
        const h = 4.6 + (o.k % 3) * 0.6,
          w = o.len - 0.15,
          d = o.deep;
        return (
          <group key={`${o.x},${o.z}`} position={[o.x, groundY(o.z), o.z]} rotation-y={(-o.side * Math.PI) / 2}>
            <Part geometry={geo.box(w, h, d)} color={HOUSE_WALLS[o.k % HOUSE_WALLS.length]} outline={0.07} position-y={h / 2} />
            <Ridge r={d / 1.6} len={w + 0.2} color={HOUSE_ROOFS[o.k % HOUSE_ROOFS.length]} position-y={h + (d / 1.6) * 0.275} rotation-y={Math.PI / 2} />
            <Part geometry={geo.box(w - 0.4, 0.5, 0.25)} color={AWNINGS[o.k % AWNINGS.length]} outline={0.04} position={[0, 2.35, d / 2 + 0.1]} />
            <Part geometry={geo.box(w * 0.5, 1.4, 0.2)} color={WINDOW} outline={0.04} position={[-w * 0.15, 1.15, d / 2 + 0.05]} />
            <Part geometry={geo.box(0.9, 1.8, 0.2)} color={DOORS[o.k % DOORS.length]} outline={0.05} position={[w / 2 - 0.85, 0.9, d / 2 + 0.05]} />
            {[-1, 1].map((x) => (
              <Part key={x} geometry={geo.box(0.9, 0.9, 0.2)} color={WINDOW} outline={0.04} position={[(x * w) / 4, h - 1.2, d / 2 + 0.05]} />
            ))}
          </group>
        );
      })}
    </>
  );
}

function Lamps() {
  return (
    <>
      {LAMPS.map(([x, z]) => (
        <group key={`${x},${z}`} position-y={groundY(z)}>
          <Part geometry={geo.cyl(0.1, 0.12, 3.2, 8)} color={0x2b2633} outline={0.04} position={[x, 1.6, z]} />
          <Part geometry={geo.sphere(0.3)} color={LAMP} outline={0.05} position={[x, 3.3, z]} />
        </group>
      ))}
    </>
  );
}

// Small seeded random so the sky is the same on every visit.
const rand = seeded(7);
const CLOUDS = Array.from({ length: 16 }, (_, i) => ({
  pos: [-85 + i * 11, 16 + rand() * 6, NORTH - 4 + rand() * (SOUTH - NORTH)] as const,
  puffs: Array.from({ length: 4 }, (_, j) => ({ r: Math.round((1.2 + rand() * 1.1) * 10) / 10, p: [j * 1.5 - 2.2, rand() * 0.8, rand() - 0.5] as const })),
}));

function Clouds({ reduce, color = 0xffffff }: { reduce: boolean; color?: number }) {
  const refs = useRef<THREE.Group[]>([]);
  useFrame((_, delta) => {
    if (reduce) return;
    refs.current.forEach((c, i) => {
      c.position.x += Math.min(delta, 0.05) * (0.6 + (i % 3) * 0.2);
      if (c.position.x > 95) c.position.x = -95;
    });
  });
  return (
    <>
      {CLOUDS.map((c, i) => (
        <group key={i} ref={(g) => void (g && (refs.current[i] = g))} position={[c.pos[0], c.pos[1] + groundY(c.pos[2]), c.pos[2]]}>
          {c.puffs.map((b, j) => (
            <Part key={j} geometry={geo.sphere(b.r)} color={color} outline={0.08} shadow={false} position={b.p} />
          ))}
        </group>
      ))}
    </>
  );
}

// Rolling hills past the edge of town, so street view has a horizon.
const hillRand = seeded(4242);
const HILLS = Array.from({ length: 28 }, (_, i) => {
  const a = (i / 28) * Math.PI * 2 + hillRand() * 0.2,
    r = 100 + hillRand() * 40;
  // round an oval, since the town is much longer north to south, pushed out further east where
  // the map runs on past the cathedral's east end
  const c = Math.cos(a);
  return [c * r + Math.max(0, c) * 34, MID_Z + Math.sin(a) * r * 1.8, 18 + hillRand() * 22] as const;
});
function Hills() {
  return (
    <group>
      <Strip w={520} d={560} color={0x5fc25c} z={MID_Z} y={-0.05} raycast={() => null} />
      {HILLS.map(([x, z, r], i) => (
        <mesh key={i} geometry={geo.dome(1)} material={toon(i % 2 ? 0x56b553 : 0x4ea84b)} position={[x, groundY(z) - 2, z]} scale={[r, r * 0.45, r]} />
      ))}
    </group>
  );
}

// Street view: drag with one finger or the mouse to look around.
function dragLook(el: HTMLElement) {
  const down = new Map<number, { x: number; y: number }>();
  el.addEventListener("pointerdown", (e) => down.set(e.pointerId, { x: e.clientX, y: e.clientY }));
  el.addEventListener("pointermove", (e) => {
    const last = down.get(e.pointerId);
    if (!last || down.size !== 1 || !usePlay.getState().street) return;
    game.face -= (e.clientX - last.x) * 0.006;
    game.pitch = Math.min(0.6, Math.max(-0.5, game.pitch - (e.clientY - last.y) * 0.004));
    down.set(e.pointerId, { x: e.clientX, y: e.clientY });
  });
  const up = (e: PointerEvent) => down.delete(e.pointerId);
  el.addEventListener("pointerup", up);
  el.addEventListener("pointercancel", up);
  el.addEventListener("pointerleave", up);
}

// Two-finger pinch on touch screens zooms the camera in and out.
function pinchZoom(el: HTMLElement) {
  let last = 0;
  const gap = (t: TouchList) => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
  el.addEventListener("touchstart", (e) => {
    if (e.touches.length === 2) last = gap(e.touches);
  });
  el.addEventListener(
    "touchmove",
    (e) => {
      if (e.touches.length !== 2 || !last) return;
      e.preventDefault();
      const g = gap(e.touches);
      zoomBy((last - g) * 0.006);
      last = g;
    },
    { passive: false },
  );
  el.addEventListener("touchend", (e) => {
    if (e.touches.length < 2) last = 0;
  });
}

export default function Town({ font }: { font: string }) {
  const reduce = useMemo(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches, []);
  const [signsReady, setSignsReady] = useState(false);
  const night = usePlay((s) => s.night);
  const street = usePlay((s) => s.street);
  const xmas = usePlay((s) => s.xmas);
  const wx = useSky(night);
  useEffect(() => setNightGlow(night), [night]);

  useEffect(() => {
    // Signs are drawn to a canvas, so the display font has to be loaded first.
    const done = () => setSignsReady(true);
    Promise.race([document.fonts.load(`64px ${font}`), new Promise((r) => setTimeout(r, 1800))]).then(done, done);
  }, [font]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if ((tag === "BUTTON" || tag === "A") && (e.key === " " || e.key === "Enter")) return;
      game.keys[e.key.toLowerCase()] = true;
    };
    const up = (e: KeyboardEvent) => void (game.keys[e.key.toLowerCase()] = false);
    const blur = () => (game.keys = {});
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", blur);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", blur);
    };
  }, []);

  const onGround = (e: ThreeEvent<MouseEvent>) => {
    if (e.delta > 8) return;
    usePlay.getState().close();
    usePlay.getState().endTalk();
    const to = e.point.clone().setY(0);
    walkRoute([...crossings([game.pos.x, game.pos.z], [to.x, to.z]).map(([x, z]) => new THREE.Vector3(x, 0, z)), to]);
    game.pending = null;
    game.pendingNpc = null;
  };

  return (
    <Canvas
      shadows
      flat
      dpr={[1, 2]}
      camera={{ fov: 45, near: 0.1, far: 300, position: [0, 15, 23] }}
      onCreated={({ gl }) => {
        pinchZoom(gl.domElement);
        dragLook(gl.domElement);
        usePlay.getState().setReady();
      }}
      onWheel={(e) => zoomBy(e.deltaY * 0.001)}
      style={{ position: "fixed", inset: 0, touchAction: "none" }}
    >
      <color attach="background" args={[wx.color]} />
      {(street || wx.fog) && <fog attach="fog" args={[wx.color, ...(wx.fog && (!street || wx.fog[1] < 150) ? wx.fog : ([30, 150] as const))]} />}
      {street && <Hills />}
      <hemisphereLight args={night ? [0x6a7bd6, 0x2a3350, 1.1 * wx.hemi] : [0xffffff, 0x88aa66, 2 * wx.hemi]} />
      <Sun night={night} dim={wx.sun} />
      <Strip w={SIZE} d={DEPTH} color={0x6fd36b} x={MID_X} z={MID_Z} onClick={onGround} />
      <Roads />
      <Roundabout reduce={reduce} />
      <Cars reduce={reduce} />
      <Railway reduce={reduce} />
      <River />
      {signsReady &&
        PLACES.map((p) => {
          if (p.kind === "tank" || !inSeason(p, xmas)) return null;
          const C = { cathedral: Cathedral, lot: Lot, stadium: Stadium, shop: Building, castle: Castle, street: SteepHill, water: Brayford, campus: Campus, airfield: Airfield, gate: Stonebow, station: Station, bridge: HighBridge, arch: NewportArch, oldhouse: OldHouse, gallery: Gallery, ruins: Ruins, busstation: BusStation, exchange: CornExchange, mall: Waterside, pub: Pub, mill: Mill, park: Park, market: XmasMarket, retail: StMarks, gatehouse: Gatehouse, yard: Yard }[p.kind ?? "shop"];
          return (
            <group key={p.id} position-y={groundY(p.z)}>
              <C p={p} font={font} reduce={reduce} />
            </group>
          );
        })}
      {TREES.map(([x, z, sc], i) => (
        <Tree key={i} x={x} z={z} s={sc} />
      ))}
      <Townsfolk reduce={reduce} />
      <Houses />
      <Shopfronts />
      <Lamps />
      <Footpaths />
      <MinsterGrounds />
      {signsReady && <Wharf font={font} reduce={reduce} />}
      {signsReady && <Witham font={font} />}
      {signsReady && <Bailgate font={font} />}
      <Market />
      <Clouds reduce={reduce} color={wx.cloud} />
      <Weather reduce={reduce} />
      {signsReady && <TaxiRank font={font} />}
      <Hunt reduce={reduce} />
      {night && <Ghost reduce={reduce} />}
      <Imp reduce={reduce} />
      <Soundscape />
    </Canvas>
  );
}
