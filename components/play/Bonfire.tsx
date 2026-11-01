"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import type { Place } from "./places";
import { Part, geo, toon } from "./toon";
import { placeEvents, usePlay } from "./store";
import { EXTRA_BOXES } from "./colliders";
import { Many, Sign, useSign, type Inst } from "./MoreLandmarks";

type Props = { p: Place; font: string; reduce: boolean };
type V3 = [number, number, number];

// Bonfire Night, around 5 November: a bonfire in the middle of a roped-off field, with embers rising from it,
// and after dark a firework show over the field. Made up for the game; it is not a real Lincoln display.
const RING = 4.4; // radius of the rope round the fire
const LOG = 0x6b4a2e;
// a cluster of flame tongues: a ring of orange and red ones round a taller yellow one in the middle
const FLAMES = [
  { x: 0, z: 0, r: 0.6, h: 4.2, color: 0xffe27a },
  ...Array.from({ length: 6 }, (_, i) => {
    const a = (i / 6) * Math.PI * 2;
    return { x: Math.cos(a) * 0.65, z: Math.sin(a) * 0.65, r: 0.62 + (i % 2) * 0.12, h: 2.2 + (i % 3) * 0.55, color: i % 2 ? 0xff4a1c : 0xff9a2e };
  }),
];
const FLAME_BASE = 0.9;
const EMBERS = 28;
const dummy = new THREE.Object3D();

export function Bonfire({ p, font, reduce }: Props) {
  const night = usePlay((s) => s.night);
  const sign = useSign("Bonfire Night", "#b3410f", font);
  const flames = useRef<(THREE.Mesh | null)[]>([]);
  const embers = useRef<THREE.InstancedMesh>(null!);
  const glow = useRef<THREE.PointLight>(null!);

  const flameMats = useMemo(() => FLAMES.map((f) => new THREE.MeshBasicMaterial({ color: f.color, toneMapped: false })), []);
  const emberMat = useMemo(() => new THREE.MeshBasicMaterial({ color: 0xffc24d, toneMapped: false }), []);
  useEffect(
    () => () => {
      flameMats.forEach((m) => m.dispose());
      emberMat.dispose();
    },
    [flameMats, emberMat],
  );

  // the pile of logs is solid, the field round it is open
  useEffect(() => {
    EXTRA_BOXES.set(p.id, { x0: p.x - 1.6, x1: p.x + 1.6, z0: p.z - 1.6, z1: p.z + 1.6 });
    return () => {
      EXTRA_BOXES.delete(p.id);
    };
  }, [p]);

  // posts every so often round the ring, with a rope between them; the gap is on the side the path comes in from (+z)
  const { posts, ropes } = useMemo(() => {
    const n = 20,
      step = (Math.PI * 2) / n;
    const posts: Inst[] = [],
      ropes: Inst[] = [];
    for (let i = 0; i < n; i++) {
      const a = i * step,
        mid = a + step / 2;
      if (Math.abs(a - Math.PI / 2) > 0.3) posts.push({ at: [Math.cos(a) * RING, 0.55, Math.sin(a) * RING] });
      if (Math.abs(mid - Math.PI / 2) > 0.3 && Math.abs(a - Math.PI / 2) > 0.3 && Math.abs(a + step - Math.PI / 2) > 0.3) {
        const r = RING * Math.cos(step / 2);
        ropes.push({ at: [Math.cos(mid) * r, 0.95, Math.sin(mid) * r], rot: [0, -(mid + Math.PI / 2), 0], scale: [2 * RING * Math.sin(step / 2), 1, 1] });
      }
    }
    return { posts, ropes };
  }, []);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    FLAMES.forEach((f, i) => {
      const m = flames.current[i];
      if (!m) return;
      const sy = reduce ? 1 : 1 + 0.2 * Math.sin(t * 9 + i * 2) + 0.1 * Math.sin(t * 17 + i * 5);
      const sx = reduce ? 1 : 1 + 0.07 * Math.sin(t * 7 + i * 3);
      m.scale.set(sx, sy, sx);
      m.position.y = FLAME_BASE + (f.h * sy) / 2;
    });
    const e = embers.current;
    if (e) {
      for (let i = 0; i < EMBERS; i++) {
        const ph = (i * 0.618) % 1;
        const k = reduce ? ph : (t * 0.3 + ph) % 1; // how far up its climb
        const a = i * 2.4;
        const spread = 0.4 + k * 1.1;
        dummy.position.set(Math.cos(a) * spread + (reduce ? 0 : Math.sin(t * 2 + i) * 0.25), FLAME_BASE + 1 + k * 6, Math.sin(a) * spread);
        dummy.scale.setScalar(Math.max(0.05, 1 - k));
        dummy.updateMatrix();
        e.setMatrixAt(i, dummy.matrix);
      }
      e.instanceMatrix.needsUpdate = true;
    }
    if (glow.current) glow.current.intensity = night ? 90 + (reduce ? 0 : Math.sin(t * 11) * 18 + Math.sin(t * 23) * 8) : 0;
  });

  return (
    <group position={[p.x, 0, p.z]} rotation-y={p.rot} {...placeEvents(p)}>
      {/* the logs, leaning in round the middle */}
      {Array.from({ length: 11 }, (_, i) => (
        <group key={i} rotation-y={(i / 11) * Math.PI * 2 + (i % 2) * 0.2}>
          <Part geometry={geo.cyl(0.16, 0.2, 3.1, 6)} color={LOG} outline={0.03} position={[0, 1.35, 0.8 + (i % 3) * 0.12]} rotation-x={-(0.5 + (i % 3) * 0.1)} />
        </group>
      ))}
      <Part geometry={geo.cyl(1.5, 1.7, 0.5, 10)} color={0x3a2a1e} outline={0.04} position-y={0.25} />
      {FLAMES.map((f, i) => (
        <mesh key={i} ref={(m) => void (flames.current[i] = m)} geometry={geo.cone(f.r, f.h, 8)} material={flameMats[i]} position={[f.x, FLAME_BASE + f.h / 2, f.z]} />
      ))}
      <instancedMesh ref={embers} args={[geo.sphere(0.08, 5, 4), emberMat, EMBERS]} frustumCulled={false} raycast={() => null} />
      <pointLight ref={glow} position={[0, 2.4, 0]} color={0xff8a3a} distance={30} decay={2} intensity={0} />
      {/* the rope round it, and the sign by the gap */}
      <Many geometry={geo.cyl(0.07, 0.07, 1.1, 6)} color={0x8a5a32} list={posts} />
      <Many geometry={geo.box(1, 0.05, 0.05)} color={0xe8dcc2} list={ropes} />
      <mesh geometry={geo.box(0.1, 2.2, 0.1)} material={toon(0x3a2418)} position={[-2.6, 1.1, RING + 0.5]} />
      <Sign map={sign} w={3.2} h={0.8} position={[-2.6, 2.4, RING + 0.58]} />
      {night && !reduce && <Fireworks />}
    </group>
  );
}

// ---------------------------------------------------------------------------------------------
// The fireworks: a few shells in turn, each a rocket that climbs, then bursts into a ball of sparks that
// spreads, sinks and fades. Each launch gets its own spot and colour, but the show is the same every visit.
const SHELLS = 3;
const SPARKS = 70;
const PERIOD = 5.4; // seconds between one shell's launches
const CLIMB = 0.9;
const BURN = 2.6;
const COLOURS = [0xff4d4d, 0xffd84d, 0x6dff8a, 0x6dd3ff, 0xc77dff, 0xffffff];
const DIRS: V3[] = Array.from({ length: SPARKS }, (_, i) => {
  const y = 1 - (2 * (i + 0.5)) / SPARKS,
    r = Math.sqrt(1 - y * y),
    a = i * 2.399963;
  return [Math.cos(a) * r, y, Math.sin(a) * r];
});
const rnd = (n: number) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};

// a soft round dot, so the sparks aren't squares
function sparkTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const x = c.getContext("2d")!;
  const g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.35, "rgba(255,255,255,0.7)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  x.fillStyle = g;
  x.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

function Fireworks() {
  const dot = useMemo(() => sparkTexture(), []);
  useEffect(() => () => dot.dispose(), [dot]);
  const shells = useMemo(
    () =>
      Array.from({ length: SHELLS }, () => {
        const g = new THREE.BufferGeometry();
        g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(SPARKS * 3), 3));
        const m = new THREE.PointsMaterial({ map: dot, size: 0.9, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, fog: false });
        return { g, m };
      }),
    [dot],
  );
  useEffect(
    () => () =>
      shells.forEach(({ g, m }) => {
        g.dispose();
        m.dispose();
      }),
    [shells],
  );
  useFrame(({ clock }) => {
    shells.forEach(({ g, m }, i) => {
      const t = clock.elapsedTime + i * (PERIOD / SHELLS);
      const n = Math.floor(t / PERIOD),
        k = t - n * PERIOD;
      const id = n * 7 + i;
      const ox = (rnd(id) - 0.5) * 26,
        oz = (rnd(id + 50) - 0.5) * 26,
        top = 13 + rnd(id + 99) * 7;
      const pos = g.attributes.position.array as Float32Array;
      if (k < CLIMB) {
        // the rocket, one bright point sliding up
        const e = k / CLIMB,
          y = top * (1 - (1 - e) * (1 - e));
        for (let s = 0; s < SPARKS; s++) pos.set([ox, y, oz], s * 3);
        m.size = 1.2;
        m.opacity = 1;
        m.color.setHex(0xffe9b0);
      } else {
        const s = k - CLIMB;
        const spread = 7 * (1 - Math.exp(-2.6 * s)),
          sink = 2.2 * s * s;
        for (let j = 0; j < SPARKS; j++) pos.set([ox + DIRS[j][0] * spread, top + DIRS[j][1] * spread - sink, oz + DIRS[j][2] * spread], j * 3);
        m.size = 1.6;
        m.opacity = Math.max(0, 1 - s / BURN);
        m.color.setHex(COLOURS[id % COLOURS.length]);
      }
      g.attributes.position.needsUpdate = true;
    });
  });
  return (
    <>
      {shells.map(({ g, m }, i) => (
        <points key={i} geometry={g} material={m} frustumCulled={false} raycast={() => null} />
      ))}
    </>
  );
}
