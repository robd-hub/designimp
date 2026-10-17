import { useRef } from "react";
import * as THREE from "three";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { Part, geo, INK } from "./toon";
import { NPCS, npcPos, type Npc } from "./npcs";
import { game, usePlay, walkToNpc } from "./store";

const tmp = new THREE.Vector3();

function Person({ npc, reduce }: { npc: Npc; reduce: boolean }) {
  const body = useRef<THREE.Group>(null!);
  const legL = useRef<THREE.Group>(null!);
  const legR = useRef<THREE.Group>(null!);
  const armL = useRef<THREE.Group>(null!);
  const armR = useRef<THREE.Group>(null!);
  const st = useRef({ leg: 1, walkT: 0, face: 0 });

  useFrame(({ clock }, delta) => {
    const dt = Math.min(delta, 0.05);
    const s = st.current;
    const pos = npcPos.get(npc.id)!;
    const talking = usePlay.getState().talk?.npc === npc;
    let moving = false;
    let want = s.face;
    if (talking) {
      want = Math.atan2(game.pos.x - pos.x, game.pos.z - pos.z);
    } else {
      const [tx, tz] = npc.path[s.leg];
      tmp.set(tx - pos.x, 0, tz - pos.z);
      const dist = tmp.length();
      if (dist < 0.1) s.leg = (s.leg + 1) % npc.path.length;
      else {
        const step = Math.min(dist, npc.speed * dt);
        pos.addScaledVector(tmp.normalize(), step);
        want = Math.atan2(tmp.x, tmp.z);
        moving = true;
      }
    }
    let d = want - s.face;
    d = Math.atan2(Math.sin(d), Math.cos(d));
    s.face += d * Math.min(1, dt * 8);
    if (moving) s.walkT += dt * npc.speed * 4;
    else s.walkT *= 0.85;
    const sw = Math.sin(s.walkT) * 0.5 * (moving ? 1 : 0);
    legL.current.rotation.x = sw;
    legR.current.rotation.x = -sw;
    armL.current.rotation.x = -sw * 0.8;
    // wave hello while chatting
    armR.current.rotation.x = talking ? Math.PI : sw * 0.8;
    armR.current.rotation.z = talking && !reduce ? Math.sin(clock.elapsedTime * 8) * 0.35 : 0;
    body.current.position.set(pos.x, moving ? Math.abs(Math.sin(s.walkT)) * 0.08 : 0, pos.z);
    body.current.rotation.y = s.face;
  });

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (e.delta <= 8) walkToNpc(npc);
  };

  return (
    <group ref={body} scale={0.9} onClick={onClick}>
      {[-0.2, 0.2].map((x, i) => (
        <group key={x} ref={i ? legR : legL} position={[x, 0.85, 0]}>
          <Part geometry={geo.box(0.3, 0.85, 0.3)} color={npc.legs} outline={0.05} position={[0, -0.42, 0]} />
        </group>
      ))}
      <Part geometry={geo.cyl(0.42, 0.5, 1.05)} color={npc.shirt} outline={0.06} position={[0, 1.37, 0]} />
      {[-0.6, 0.6].map((x, i) => (
        <group key={x} ref={i ? armR : armL} position={[x, 1.8, 0]}>
          <Part geometry={geo.box(0.22, 0.8, 0.22)} color={npc.shirt} outline={0.05} position={[0, -0.38, 0]} />
        </group>
      ))}
      <Part geometry={geo.sphere(0.52)} color={npc.skin} outline={0.06} position={[0, 2.38, 0]} />
      {npc.hat !== undefined && (
        <>
          <Part geometry={geo.dome(0.54)} color={npc.hat} outline={0.05} position={[0, 2.45, 0]} />
          <Part geometry={geo.box(0.66, 0.07, 0.42)} color={npc.hat} outline={0.04} position={[0, 2.49, 0.52]} />
        </>
      )}
      {npc.hair !== undefined && (
        <Part geometry={geo.dome(0.55)} color={npc.hair} outline={0.05} position={[0, 2.42, -0.06]} rotation-x={-0.35} />
      )}
      {[-0.18, 0.18].map((x) => (
        <mesh key={x} geometry={geo.sphere(0.07)} position={[x, 2.42, 0.47]}>
          <meshBasicMaterial color={INK} />
        </mesh>
      ))}
    </group>
  );
}

export default function Townsfolk({ reduce }: { reduce: boolean }) {
  return (
    <>
      {NPCS.map((n) => (
        <Person key={n.id} npc={n} reduce={reduce} />
      ))}
    </>
  );
}
