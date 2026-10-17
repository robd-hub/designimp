import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Part, geo } from "./toon";
import { game, usePlay } from "./store";
import { HIDDEN } from "./hidden";


const GOLD = 0xffc93a;

function MiniImp({ id, x, z, reduce }: { id: string; x: number; z: number; reduce: boolean }) {
  const g = useRef<THREE.Group>(null!);
  const found = usePlay((s) => s.found.includes(id));
  useFrame(({ clock }) => {
    if (found) return;
    const t = clock.elapsedTime + x;
    if (!reduce) {
      g.current.position.y = 0.3 + Math.sin(t * 2.5) * 0.15;
      g.current.rotation.y = t * 1.2;
    }
    if (Math.hypot(game.pos.x - x, game.pos.z - z) < 1.6) usePlay.getState().collect(id, HIDDEN.length);
  });
  if (found) return null;
  return (
    <group ref={g} position={[x, 0.3, z]} scale={0.55}>
      <Part geometry={geo.sphere(0.6)} color={GOLD} outline={0.06} position-y={0.7} scale={[1, 1.1, 0.9]} />
      <Part geometry={geo.sphere(0.48)} color={GOLD} outline={0.06} position-y={1.6} />
      {[-1, 1].map((s) => (
        <Part key={s} geometry={geo.cone(0.12, 0.45, 8)} color={0x4a2f22} outline={0.03} position={[s * 0.28, 2.05, 0]} rotation-z={-s * 0.4} />
      ))}
      {[-1, 1].map((s) => (
        <mesh key={s} geometry={geo.sphere(0.08)} position={[s * 0.17, 1.68, 0.42]}>
          <meshBasicMaterial color={0x1a1320} />
        </mesh>
      ))}
    </group>
  );
}

export default function Hunt({ reduce }: { reduce: boolean }) {
  return (
    <>
      {HIDDEN.map((h) => (
        <MiniImp key={h.id} {...h} reduce={reduce} />
      ))}
    </>
  );
}
