import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { toon, signTexture } from "./toon";
import { seeded } from "./colliders";

type Stand = { x: number; z: number; w: number; d: number; ry: number };

const SHIRTS = [0xe03a3e, 0xffffff, 0x1a1320, 0xe03a3e, 0xffd23f];
const SKINS = [0xf2c9a0, 0xd9a066, 0x8d5a3b, 0xf5d6b8];
const fan = new THREE.BoxGeometry(0.55, 0.7, 0.4);
const head = new THREE.SphereGeometry(0.24, 10, 8);
const mat = toon(0xffffff);
const headMat = toon(0xfffffe);
const m4 = new THREE.Matrix4();
const col = new THREE.Color();

// A full house on matchday: rows of fans in red and white who bounce when they sing.
export function Crowd({ stands, reduce }: { stands: Stand[]; reduce: boolean }) {
  const ref = useRef<THREE.InstancedMesh>(null!);
  const heads = useRef<THREE.InstancedMesh>(null!);
  const seats = useMemo(() => {
    const r = seeded(11);
    const out: { x: number; y: number; z: number; ph: number; c: number; sk: number }[] = [];
    for (const st of stands) {
      const c = Math.cos(st.ry),
        s = Math.sin(st.ry);
      for (let row = 0; row < 3; row++)
        for (let lx = -st.w / 2 + 0.9; lx < st.w / 2 - 0.6; lx += 0.85) {
          if (r() < 0.08) continue; // the odd empty seat
          const lz = st.d / 2 - 0.75 - row * 1.3,
            y = 1.9 + row * 0.9 + 0.4;
          out.push({ x: st.x + lx * c + lz * s, y, z: st.z - lx * s + lz * c, ph: r() * 6, c: SHIRTS[Math.floor(r() * SHIRTS.length)], sk: SKINS[Math.floor(r() * SKINS.length)] });
        }
    }
    return out;
  }, [stands]);
  const place = (t: number) => {
    const singing = !reduce && Math.sin(t * 0.6) > 0.2;
    seats.forEach((p, i) => {
      const y = p.y + (singing ? Math.max(0, Math.sin(t * 7 + p.ph)) * 0.35 : 0);
      ref.current.setMatrixAt(i, m4.makeTranslation(p.x, y, p.z));
      heads.current.setMatrixAt(i, m4.makeTranslation(p.x, y + 0.55, p.z));
    });
    ref.current.instanceMatrix.needsUpdate = true;
    heads.current.instanceMatrix.needsUpdate = true;
  };
  useEffect(() => {
    seats.forEach((p, i) => {
      ref.current.setColorAt(i, col.setHex(p.c));
      heads.current.setColorAt(i, col.setHex(p.sk));
    });
    if (ref.current.instanceColor) ref.current.instanceColor.needsUpdate = true;
    if (heads.current.instanceColor) heads.current.instanceColor.needsUpdate = true;
  }, [seats]);
  useFrame(({ clock }) => place(clock.elapsedTime));
  return (
    <>
      <instancedMesh ref={ref} args={[fan, mat, seats.length]} />
      <instancedMesh ref={heads} args={[head, headMat, seats.length]} />
    </>
  );
}

// "IMPS! IMPS! IMPS!" rises over the ground every so often.
export function Chant({ font, reduce }: { font: string; reduce: boolean }) {
  const tex = useMemo(() => signTexture("IMPS! IMPS! IMPS!", "#e03a3e", font), [font]);
  const g = useRef<THREE.Mesh>(null!);
  const m = useRef<THREE.MeshBasicMaterial>(null!);
  useFrame(({ clock, camera }) => {
    const t = (clock.elapsedTime % 10.5) / 10.5; // matches the crowd singing
    const k = reduce ? 0.5 : t;
    g.current.position.y = 9 + k * 6;
    m.current.opacity = reduce ? 1 : Math.max(0, Math.sin(k * Math.PI));
    g.current.quaternion.copy(camera.quaternion);
  });
  return (
    <mesh ref={g} position={[0, 10, 0]}>
      <planeGeometry args={[12, 2.4]} />
      <meshBasicMaterial ref={m} map={tex} transparent toneMapped={false} depthWrite={false} />
    </mesh>
  );
}
