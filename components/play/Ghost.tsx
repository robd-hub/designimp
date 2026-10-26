import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { geo, INK } from "./toon";
import { groundY } from "./terrain";
import { AUDIO } from "./sound";

// After dark a friendly ghost drifts round the top of Steep Hill, over the castle and past the cathedral.
// Its loop runs from over the castle, across the square, to swoop past the cathedral's west front.
const LOOP = { x: -2, z: -123, rx: 36, rz: 12, y: 10 };
const SHEET = new THREE.MeshToonMaterial({ color: 0xf4f7ff, emissive: 0xdfe8ff, emissiveIntensity: 0.9, transparent: true, opacity: 0.9 });

const at = (t: number, out: THREE.Vector3) => {
  const x = LOOP.x + Math.cos(t) * LOOP.rx,
    z = LOOP.z + Math.sin(t) * LOOP.rz;
  return out.set(x, groundY(z) + LOOP.y + Math.sin(t * 3), z);
};
const next = new THREE.Vector3();

export default function Ghost({ reduce }: { reduce: boolean }) {
  const g = useRef<THREE.Group>(null!);
  const hem = useRef<THREE.Group>(null!);
  useEffect(() => () => void (AUDIO.ghost.on = false), []);
  useFrame(({ clock }) => {
    const t = reduce ? 2 : clock.elapsedTime * 0.25;
    at(t, g.current.position);
    Object.assign(AUDIO.ghost, { on: true, x: g.current.position.x, z: g.current.position.z });
    at(t + 0.01, next);
    g.current.rotation.y = Math.atan2(next.x - g.current.position.x, next.z - g.current.position.z);
    if (reduce) return;
    g.current.rotation.z = Math.sin(clock.elapsedTime * 2) * 0.12;
    hem.current.children.forEach((c, i) => (c.position.y = -0.95 + Math.sin(clock.elapsedTime * 6 + i) * 0.08));
    SHEET.opacity = 0.82 + Math.sin(clock.elapsedTime * 1.7) * 0.1;
  });
  return (
    <group ref={g} raycast={() => null}>
      <mesh geometry={geo.sphere(0.9)} material={SHEET} position-y={0.5} />
      <mesh geometry={geo.cyl(0.9, 1.05, 1.3, 20)} material={SHEET} position-y={-0.2} />
      {/* wavy hem */}
      <group ref={hem}>
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i / 8) * Math.PI * 2;
          return <mesh key={i} geometry={geo.cone(0.28, 0.5, 8)} material={SHEET} position={[Math.cos(a) * 0.8, -0.95, Math.sin(a) * 0.8]} rotation-x={Math.PI} />;
        })}
      </group>
      {/* little arms held out */}
      {[-1, 1].map((s) => (
        <mesh key={s} geometry={geo.sphere(0.25)} material={SHEET} position={[s * 1.05, 0, 0.2]} scale={[1.4, 0.8, 0.8]} />
      ))}
      {[-1, 1].map((s) => (
        <mesh key={s} geometry={geo.sphere(0.16)} position={[s * 0.3, 0.65, 0.8]} scale={[0.8, 1.2, 0.5]}>
          <meshBasicMaterial color={INK} />
        </mesh>
      ))}
      <mesh geometry={geo.sphere(0.17)} position={[0, 0.25, 0.85]} scale={[0.8, 1, 0.4]}>
        <meshBasicMaterial color={INK} />
      </mesh>
    </group>
  );
}
