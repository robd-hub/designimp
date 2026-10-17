"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import { PLACES, hex, type Place } from "./places";
import { Part, geo, toon, INK } from "./toon";
import { TREES, treeScale } from "./colliders";
import { game, usePlay, walkTo } from "./store";
import Imp from "./Imp";

function Flat({ w, d, color, x = 0, z = 0, y = 0.02 }: { w: number; d: number; color: number; x?: number; z?: number; y?: number }) {
  return <mesh geometry={geo.box(w, 0.04, d)} material={toon(color)} position={[x, y, z]} receiveShadow />;
}

function Roads() {
  const dashes: number[] = [];
  for (let i = -42; i <= 42; i += 4) if (Math.abs(i) > 5) dashes.push(i);
  return (
    <>
      <Flat w={8.6} d={90} color={0xe8dcc2} y={0.01} />
      <Flat w={90} d={8.6} color={0xe8dcc2} y={0.01} />
      <Flat w={6} d={90} color={0x6b6573} />
      <Flat w={90} d={6} color={0x6b6573} />
      {dashes.map((i) => (
        <group key={i}>
          <Flat w={0.25} d={1.8} color={0xffd23f} z={i} y={0.05} />
          <Flat w={1.8} d={0.25} color={0xffd23f} x={i} y={0.05} />
        </group>
      ))}
    </>
  );
}

function Fountain({ reduce }: { reduce: boolean }) {
  const splash = useRef<THREE.Group>(null!);
  useFrame(({ clock }) => {
    if (reduce) return;
    const s = Math.sin(clock.elapsedTime * 4);
    splash.current.position.y = 2.3 + s * 0.12;
    splash.current.scale.setScalar(1 + s * 0.06);
  });
  return (
    <>
      <mesh geometry={geo.cyl(6, 6, 0.06, 40)} material={toon(0xe8dcc2)} position-y={0.04} receiveShadow />
      <Part geometry={geo.cyl(2.6, 2.8, 0.8, 28)} color={0xd6cfe0} position-y={0.4} />
      <mesh geometry={geo.cyl(2.3, 2.3, 0.1, 28)} material={toon(0x4fc3ff)} position-y={0.78} />
      <Part geometry={geo.cyl(0.3, 0.45, 1.8, 12)} color={0xd6cfe0} position-y={1.2} />
      <Part ref={splash} geometry={geo.sphere(0.55)} color={0x9fe3ff} outline={0.05} position-y={2.3} />
    </>
  );
}

function signTexture(text: string, fg: string, font: string) {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 128;
  const x = c.getContext("2d")!;
  x.fillStyle = "#fff8e7";
  x.fillRect(0, 0, 512, 128);
  x.lineWidth = 10;
  x.strokeStyle = "#1a1320";
  x.strokeRect(5, 5, 502, 118);
  let px = 64;
  do x.font = `${px}px ${font}`;
  while (x.measureText(text).width > 450 && --px > 30);
  x.textAlign = "center";
  x.textBaseline = "middle";
  x.lineWidth = 8;
  x.strokeText(text, 256, 68);
  x.fillStyle = fg;
  x.fillText(text, 256, 68);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

function Building({ p, font }: { p: Place; font: string }) {
  const sign = useMemo(() => signTexture(p.name, hex(p.wall), font), [p, font]);
  const floors = Math.max(1, Math.floor((p.h - 1.5) / 2.6));
  const windows: [number, number][] = [];
  for (let f = 0; f < floors; f++)
    for (const sx of [-1, 1]) for (const col of p.w > 8 ? [2.2, 3.6] : [2.4]) windows.push([sx * col, f === 0 ? 1.7 : 3.8 + (f - 1) * 2.4]);
  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (e.delta <= 8) walkTo(p);
  };
  return (
    <group position={[p.x, 0, p.z]} rotation-y={p.rot} onClick={onClick}>
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
        <Part key={`${wx},${wy}`} geometry={geo.box(1, 1.1, 0.2)} color={0xbff0ff} outline={0.05} position={[wx, wy, p.d / 2 + 0.05]} />
      ))}
      <mesh position={[0, Math.min(p.h - 0.9, 4.1), p.d / 2 + 0.08]}>
        <planeGeometry args={[4.4, 1.1]} />
        <meshBasicMaterial map={sign} toneMapped={false} />
      </mesh>
    </group>
  );
}

function Tree({ x, z, s }: { x: number; z: number; s: number }) {
  const c = [0x3fae4f, 0x4cc25c, 0x36994a][Math.floor(Math.abs(x * 7 + z * 3)) % 3];
  return (
    <group position={[x, 0, z]} scale={s}>
      <Part geometry={geo.cyl(0.25, 0.35, 1.6, 8)} color={0x8a5a33} outline={0.05} position-y={0.8} />
      {([[0, 2.3, 0, 1.2], [0.6, 1.9, 0.3, 0.8], [-0.55, 2, -0.2, 0.85]] as const).map(([a, b, cc, r]) => (
        <Part key={r} geometry={geo.sphere(r)} color={c} outline={0.06} position={[a, b, cc]} />
      ))}
    </group>
  );
}

function Lamps() {
  return (
    <>
      {[[-5.5, -5.5], [5.5, -5.5], [-5.5, 5.5], [5.5, 5.5]].map(([x, z]) => (
        <group key={`${x},${z}`}>
          <Part geometry={geo.cyl(0.1, 0.12, 3.2, 8)} color={0x2b2633} outline={0.04} position={[x, 1.6, z]} />
          <Part geometry={geo.sphere(0.3)} color={0xfff1a8} outline={0.05} position={[x, 3.3, z]} />
        </group>
      ))}
    </>
  );
}

// Small seeded random so the sky is the same on every visit.
let seed = 7;
const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
const CLOUDS = Array.from({ length: 9 }, (_, i) => ({
  pos: [-45 + i * 11, 16 + rand() * 6, -40 + rand() * 60] as const,
  puffs: Array.from({ length: 4 }, (_, j) => ({ r: Math.round((1.2 + rand() * 1.1) * 10) / 10, p: [j * 1.5 - 2.2, rand() * 0.8, rand() - 0.5] as const })),
}));

function Clouds({ reduce }: { reduce: boolean }) {
  const refs = useRef<THREE.Group[]>([]);
  useFrame((_, delta) => {
    if (reduce) return;
    refs.current.forEach((c, i) => {
      c.position.x += Math.min(delta, 0.05) * (0.6 + (i % 3) * 0.2);
      if (c.position.x > 55) c.position.x = -55;
    });
  });
  return (
    <>
      {CLOUDS.map((c, i) => (
        <group key={i} ref={(g) => void (g && (refs.current[i] = g))} position={c.pos}>
          {c.puffs.map((b, j) => (
            <Part key={j} geometry={geo.sphere(b.r)} color={0xffffff} outline={0.08} shadow={false} position={b.p} />
          ))}
        </group>
      ))}
    </>
  );
}

export default function Town({ font }: { font: string }) {
  const reduce = useMemo(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches, []);
  const [signsReady, setSignsReady] = useState(false);

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
    game.target = e.point.clone().setY(0);
    game.pending = null;
  };

  return (
    <Canvas
      shadows
      flat
      dpr={[1, 2]}
      camera={{ fov: 45, near: 0.1, far: 300, position: [0, 15, 23] }}
      onCreated={() => usePlay.getState().setReady()}
      onWheel={(e) => (game.zoom = Math.min(1.5, Math.max(0.55, game.zoom + e.deltaY * 0.001)))}
      style={{ position: "fixed", inset: 0, touchAction: "none" }}
    >
      <color attach="background" args={["#7ccaff"]} />
      <hemisphereLight args={[0xffffff, 0x88aa66, 2]} />
      <directionalLight
        color={0xfff3d6}
        intensity={2.4}
        position={[20, 35, 15]}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-40}
        shadow-camera-right={40}
        shadow-camera-top={40}
        shadow-camera-bottom={-40}
        shadow-camera-far={100}
      />
      <mesh rotation-x={-Math.PI / 2} material={toon(0x6fd36b)} receiveShadow onClick={onGround}>
        <planeGeometry args={[90, 90]} />
      </mesh>
      <Roads />
      <Fountain reduce={reduce} />
      {signsReady && PLACES.map((p) => <Building key={p.id} p={p} font={font} />)}
      {TREES.map(([x, z], i) => (
        <Tree key={i} x={x} z={z} s={treeScale(i)} />
      ))}
      <Lamps />
      <Clouds reduce={reduce} />
      <Imp reduce={reduce} />
    </Canvas>
  );
}
