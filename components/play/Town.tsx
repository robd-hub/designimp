"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, type ThreeEvent, type ThreeElements } from "@react-three/fiber";
import { PLACES, hex, shopSign, type Place } from "./places";
import { Part, geo, toon, INK, signTexture, WINDOW, LAMP, STONE, STONE_DARK, setNightGlow } from "./toon";
import { Castle, SteepHill, Brayford, Campus, Airfield, Stonebow } from "./Landmarks";
import { TREES, BOUND, NORTH, CLOSE, STALL, STALLS, STADIUM_ROAD, AIRFIELD_ROAD, FOOTPATHS, seeded } from "./colliders";
import { Strip, groundY, groundTilt } from "./terrain";
import Townsfolk from "./Townsfolk";
import { game, usePlay, placeEvents, zoomBy } from "./store";
import Imp from "./Imp";
import Hunt from "./Hunt";
import Ghost from "./Ghost";
import { Crowd, Chant } from "./Matchday";

function Flat({ w, d, color, x = 0, z = 0, y = 0.02 }: { w: number; d: number; color: number; x?: number; z?: number; y?: number }) {
  return <mesh geometry={geo.box(w, 0.04, d)} material={toon(color)} position={[x, y, z]} receiveShadow />;
}

const SIZE = BOUND * 2 + 10;
const DEPTH = BOUND - NORTH + 10; // north to south
const MID_Z = (BOUND + NORTH) / 2;
const NS_START = PLACES.find((p) => p.kind === "street")!.z + 20; // the High Street runs north to the foot of Steep Hill
const PAVED = 0xd9ccb2; // the pedestrianised High Street and Castle Square
const NS_LEN = BOUND + 5 - NS_START;
const NS_MID = (BOUND + 5 + NS_START) / 2;
const SB_LEN = STADIUM_ROAD.x1 - STADIUM_ROAD.x0;
const SB_MID = (STADIUM_ROAD.x0 + STADIUM_ROAD.x1) / 2;
const AF_LEN = AIRFIELD_ROAD.x1 - AIRFIELD_ROAD.x0;
const AF_MID = (AIRFIELD_ROAD.x0 + AIRFIELD_ROAD.x1) / 2;

function Roads() {
  const dashes: number[] = [];
  for (let i = -BOUND; i <= BOUND; i += 4) if (Math.abs(i) > 5) dashes.push(i);
  const sbDashes: number[] = [];
  for (let i = 8; i < STADIUM_ROAD.x1 - 2; i += 4) sbDashes.push(i);
  for (let i = -8; i > AIRFIELD_ROAD.x0 + 2; i -= 4) sbDashes.push(i);
  return (
    <>
      <Strip w={8.6} d={NS_LEN} color={0xe8dcc2} z={NS_MID} y={0.03} />
      <Flat w={SIZE} d={8.6} color={0xe8dcc2} y={0.01} />
      {/* the road south of the roundabout; north of it the High Street is pedestrianised */}
      <Strip w={6} d={BOUND + 5} color={0x6b6573} z={(BOUND + 5) / 2} y={0.04} />
      <Strip w={8.6} d={-6 - NS_START} color={PAVED} z={(NS_START - 6) / 2} y={0.045} />
      <Flat w={SIZE} d={6} color={0x6b6573} />
      {/* the road east to Sincil Bank */}
      <Flat w={SB_LEN} d={8.6} color={0xe8dcc2} x={SB_MID} z={STADIUM_ROAD.z} y={0.01} />
      <Flat w={SB_LEN} d={6} color={0x6b6573} x={SB_MID} z={STADIUM_ROAD.z} />
      {/* and west to RAF Scampton, opposite */}
      <Flat w={AF_LEN} d={8.6} color={0xe8dcc2} x={AF_MID} z={AIRFIELD_ROAD.z} y={0.01} />
      <Flat w={AF_LEN} d={6} color={0x6b6573} x={AF_MID} z={AIRFIELD_ROAD.z} />
      {/* Castle Square, pedestrianised */}
      <Strip w={CLOSE.x1 - CLOSE.x0} d={CLOSE.z1 - CLOSE.z0} color={PAVED} x={(CLOSE.x0 + CLOSE.x1) / 2} z={(CLOSE.z0 + CLOSE.z1) / 2} y={0.035} />
      {dashes.map((i) => (
        <group key={i}>
          {i > 0 && Math.abs(i - STADIUM_ROAD.z) > 5 && (
            <group position={[0, groundY(i), i]} rotation-x={groundTilt(i)}>
              <Flat w={0.25} d={1.8} color={0xffd23f} y={0.05} />
            </group>
          )}
          <Flat w={1.8} d={0.25} color={0xffd23f} x={i} y={0.05} />
        </group>
      ))}
      {sbDashes.map((i) => (
        <Flat key={i} w={1.8} d={0.25} color={0xffd23f} x={i} z={STADIUM_ROAD.z} y={0.05} />
      ))}
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

function Fountain({ reduce }: { reduce: boolean }) {
  const jets = useRef<THREE.Group>(null!);
  useFrame(({ clock }) => {
    if (reduce) return;
    jets.current.children.forEach((j, i) => {
      const s = Math.sin(clock.elapsedTime * 4 + i * 1.6);
      j.position.y = 1.15 + s * 0.12;
      j.scale.setScalar(1 + s * 0.08);
    });
  });
  return (
    <>
      <mesh geometry={geo.cyl(7, 7, 0.06, 40)} material={toon(0xe8dcc2)} position-y={0.04} receiveShadow />
      <Part geometry={geo.cyl(3.6, 3.8, 0.8, 32)} color={0xd6cfe0} position-y={0.4} />
      <mesh geometry={geo.cyl(3.3, 3.3, 0.1, 32)} material={toon(0x4fc3ff)} position-y={0.78} />
      <Part geometry={geo.box(4.4, 0.5, 2.6)} color={0xd6cfe0} outline={0.06} position-y={0.95} />
      <Tank position-y={1.2} rotation-y={-0.5} {...placeEvents(TANK_PLACE)} />
      <group ref={jets}>
        {[0.6, 2.2, 3.8, 5.4].map((a) => (
          <Part key={a} geometry={geo.sphere(0.32)} color={0x9fe3ff} outline={0.04} shadow={false} position={[Math.cos(a) * 2.9, 1.15, Math.sin(a) * 2.9]} />
        ))}
      </group>
    </>
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

// Lincoln Cathedral, simplified: west front with twin towers, long nave, transept and a central tower.
function Cathedral({ p, font }: { p: Place; font: string }) {
  const sign = useMemo(() => signTexture(p.name, "#5b6b7a", font), [p, font]);
  const front = p.d / 2;
  return (
    <group position={[p.x, 0, p.z]} rotation-y={p.rot} {...placeEvents(p)}>
      <Part geometry={geo.box(10, 10, 24)} color={STONE} outline={0.09} position={[0, 5, -2]} />
      <Ridge r={5.8} len={24} color={LEAD} position={[0, 10 + 5.8 * 0.5 * 0.55, -2]} />
      <Part geometry={geo.box(22, 9, 5)} color={STONE} outline={0.09} position={[0, 4.5, -4]} />
      <group position={[0, 9 + 2.9 * 0.55, -4]} rotation-y={Math.PI / 2}>
        <Ridge r={2.9} len={22} color={LEAD} />
      </group>
      {/* central tower */}
      <Part geometry={geo.box(6.5, 25, 6.5)} color={STONE_DARK} outline={0.09} position={[0, 12.5, -4]} />
      <Pinnacles x={0} z={-4} w={6.5} y={25} />
      {/* west front */}
      <Part geometry={geo.box(15, 13, 2)} color={STONE} outline={0.09} position={[0, 6.5, front - 1]} />
      {[-1, 1].map((sx) => (
        <group key={sx}>
          <Part geometry={geo.box(3.6, 21, 3.6)} color={STONE_DARK} outline={0.09} position={[sx * 5.6, 10.5, front - 1.6]} />
          <Pinnacles x={sx * 5.6} z={front - 1.6} w={3.6} y={21} />
          <Part geometry={geo.box(1.4, 2.8, 0.3)} color={0x5a3a22} outline={0.05} position={[sx * 3.2, 1.4, front + 0.1]} />
        </group>
      ))}
      {/* rose window, great door and the imp perched above it */}
      <Part geometry={geo.cyl(1.6, 1.6, 0.25, 24)} color={0x7fb3ff} outline={0.08} position={[0, 8.6, front + 0.05]} rotation-x={Math.PI / 2} />
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
      <mesh position={[0, 11.6, front + 0.02]}>
        <planeGeometry args={[6.4, 1.6]} />
        <meshBasicMaterial map={sign} toneMapped={false} />
      </mesh>
    </group>
  );
}

// An empty plot with a signboard, waiting for the next client.
function Lot({ p, font }: { p: Place; font: string }) {
  const shop = usePlay((st) => (st.shop?.lot === p.id ? st.shop.name : ""));
  const sign = useMemo(() => signTexture(shop ? shopSign(shop) : p.name, hex(p.wall), font), [p, font, shop]);
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
// Saturdays are matchdays; ?matchday=1 previews one any day.
function isMatchday() {
  return new Date().getDay() === 6 || new URLSearchParams(window.location.search).get("matchday") === "1";
}

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

function Sun({ night }: { night: boolean }) {
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
      intensity={night ? 0.7 : 2.4}
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
for (let i = 20; i < BOUND; i += 18) {
  LAMPS.push([5.5, i], [-5.5, i], [i, -5.5], [i, 5.5], [-i, -5.5], [-i, 5.5]);
}
for (let i = -27; i > NS_START; i -= 16) LAMPS.push([5.5, i], [-5.5, i]); // up the High Street

// Paving slabs scattered over Castle Square and up the High Street.
const SLABS = (() => {
  const r = seeded(23);
  const square = Array.from({ length: 90 }, () => [CLOSE.x0 + 1 + r() * (CLOSE.x1 - CLOSE.x0 - 2), CLOSE.z0 + 1 + r() * (CLOSE.z1 - CLOSE.z0 - 2)] as const);
  const street = Array.from({ length: 40 }, () => [(r() - 0.5) * 7, NS_START + 1 + r() * (-8 - NS_START)] as const);
  return [...square, ...street];
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
        <group key={s.x} position={[s.x, groundY(s.z), s.z]}>
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
          color={0xe8dcc2}
          x={(f.x0 + f.x1) / 2}
          z={(f.z0 + f.z1) / 2}
          y={0.06 + i * 0.002}
          raycast={() => null}
        />
      ))}
      {Array.from({ length: Math.floor((run.z1 - run.z0) / 16) }, (_, i) => -12 - i * 16).map((z) => (
        <group key={z} position={[run.x1 + 0.8, groundY(z), z]}>
          <Part geometry={geo.cyl(0.08, 0.1, 2.6, 8)} color={0x2b2633} outline={0.03} position-y={1.3} />
          <Part geometry={geo.sphere(0.24)} color={LAMP} outline={0.04} position-y={2.7} />
        </group>
      ))}
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
  pos: [-85 + i * 11, 16 + rand() * 6, NORTH - 4 + rand() * (BOUND - NORTH)] as const,
  puffs: Array.from({ length: 4 }, (_, j) => ({ r: Math.round((1.2 + rand() * 1.1) * 10) / 10, p: [j * 1.5 - 2.2, rand() * 0.8, rand() - 0.5] as const })),
}));

function Clouds({ reduce }: { reduce: boolean }) {
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
            <Part key={j} geometry={geo.sphere(b.r)} color={0xffffff} outline={0.08} shadow={false} position={b.p} />
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
  // round an oval, since the town is longer north to south
  return [Math.cos(a) * r, MID_Z + Math.sin(a) * r * 1.35, 18 + hillRand() * 22] as const;
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
    game.target = e.point.clone().setY(0);
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
      <color attach="background" args={[night ? "#1d2547" : "#7ccaff"]} />
      {street && <fog attach="fog" args={[night ? "#1d2547" : "#7ccaff", 30, 150]} />}
      {street && <Hills />}
      <hemisphereLight args={night ? [0x6a7bd6, 0x2a3350, 1.1] : [0xffffff, 0x88aa66, 2]} />
      <Sun night={night} />
      <Strip w={SIZE} d={DEPTH} color={0x6fd36b} z={MID_Z} onClick={onGround} />
      <Roads />
      <Fountain reduce={reduce} />
      {signsReady &&
        PLACES.map((p) => {
          if (p.kind === "tank") return null;
          const C = { cathedral: Cathedral, lot: Lot, stadium: Stadium, shop: Building, castle: Castle, street: SteepHill, water: Brayford, campus: Campus, airfield: Airfield }[p.kind ?? "shop"];
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
      <Lamps />
      <Footpaths />
      <Market />
      {signsReady && <Stonebow font={font} />}
      <Clouds reduce={reduce} />
      <Hunt reduce={reduce} />
      {night && <Ghost reduce={reduce} />}
      <Imp reduce={reduce} />
    </Canvas>
  );
}
