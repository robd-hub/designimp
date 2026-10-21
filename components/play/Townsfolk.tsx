import { useRef } from "react";
import * as THREE from "three";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { Part, geo, INK } from "./toon";
import { NPCS, npcPos, type Npc } from "./npcs";
import { game, usePlay, walkToNpc } from "./store";
import { groundY } from "./terrain";
import { atBarrier } from "./colliders";

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
        tmp.normalize();
        want = Math.atan2(tmp.x, tmp.z);
        // townsfolk wait at the level crossing too
        if (atBarrier(pos.x, pos.z) || !atBarrier(pos.x + tmp.x * step, pos.z + tmp.z * step)) {
          pos.addScaledVector(tmp, step);
          moving = true;
        }
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
    body.current.position.set(pos.x, groundY(pos.z) + (moving ? Math.abs(Math.sin(s.walkT)) * 0.08 : 0), pos.z);
    body.current.rotation.y = s.face;
  });

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (e.delta <= 8) walkToNpc(npc);
  };

  return (
    <group ref={body} scale={0.9} onClick={onClick}>
      {[-0.17, 0.17].map((x, i) => (
        <group key={x} ref={i ? legR : legL} position={[x, 0.62, 0]}>
          <Part geometry={geo.cyl(0.12, 0.13, 0.5, 10)} color={npc.legs} outline={0.04} position={[0, -0.25, 0]} />
          <Part geometry={geo.sphere(0.16)} color={INK} outline={0.03} position={[0, -0.5, 0.06]} scale={[1, 0.6, 1.4]} />
        </group>
      ))}
      <Part geometry={geo.cyl(0.36, 0.46, 0.75)} color={npc.shirt} outline={0.06} position={[0, 1, 0]} />
      <Part geometry={geo.sphere(0.46)} color={npc.shirt} outline={0.06} position={[0, 0.64, 0]} scale={[1, 0.4, 1]} />
      {[-0.46, 0.46].map((x, i) => (
        <group key={x} ref={i ? armR : armL} position={[x, 1.28, 0]}>
          <Part geometry={geo.cyl(0.09, 0.1, 0.5, 8)} color={npc.shirt} outline={0.04} position={[0, -0.25, 0]} />
          <Part geometry={geo.sphere(0.12)} color={npc.skin} outline={0.03} position={[0, -0.55, 0]} />
        </group>
      ))}
      <Head npc={npc} reduce={reduce} />
    </group>
  );
}

// Hair styles; anyone in a hat keeps it on.
const STYLE: Record<string, "long" | "bun" | "pony" | "bob"> = {
  christine: "long",
  justyna: "bun",
  priya: "pony",
  elsie: "bun",
  bea: "bob",
};
const BLUSH = 0xff8fa3;
const HY = 2.05; // head centre

function Head({ npc, reduce }: { npc: Npc; reduce: boolean }) {
  const eyes = useRef<THREE.Group>(null!);
  const phase = npc.id.length * 0.7;
  useFrame(({ clock }) => {
    if (reduce) return;
    eyes.current.scale.y = (clock.elapsedTime + phase) % 4 < 0.13 ? 0.1 : 1; // blink
  });
  const style = STYLE[npc.id];
  return (
    <group>
      <Part geometry={geo.sphere(0.7)} color={npc.skin} outline={0.06} position-y={HY} />
      <group ref={eyes} position={[0, HY + 0.03, 0]}>
        {[-1, 1].map((sx) => (
          <group key={sx} position={[sx * 0.24, 0, 0.63]}>
            <mesh geometry={geo.sphere(0.12)} scale={[0.85, 1.2, 0.6]}>
              <meshBasicMaterial color={INK} />
            </mesh>
            <mesh geometry={geo.sphere(0.04)} position={[0.03, 0.05, 0.06]}>
              <meshBasicMaterial color={0xffffff} />
            </mesh>
          </group>
        ))}
      </group>
      {[-1, 1].map((sx) => (
        <mesh key={sx} geometry={geo.sphere(0.1)} position={[sx * 0.4, HY - 0.13, 0.55]} scale={[1.3, 0.7, 0.3]}>
          <meshBasicMaterial color={BLUSH} />
        </mesh>
      ))}
      <mesh geometry={geo.smile(0.09, 0.025)} position={[0, HY - 0.16, 0.66]}>
        <meshBasicMaterial color={INK} />
      </mesh>
      {npc.hat !== undefined ? (
        <>
          <Part geometry={geo.dome(0.73)} color={npc.hat} outline={0.05} position-y={HY + 0.08} />
          <Part geometry={geo.box(0.8, 0.07, 0.5)} color={npc.hat} outline={0.04} position={[0, HY + 0.12, 0.72]} />
        </>
      ) : (
        npc.hair !== undefined && <Hair color={npc.hair} style={style} />
      )}
    </group>
  );
}

function Hair({ color, style }: { color: number; style?: string }) {
  return (
    <>
      <Part geometry={geo.dome(0.74)} color={color} outline={0.05} position={[0, HY + 0.02, -0.04]} rotation-x={-0.3} />
      {style === "long" && <Part geometry={geo.cyl(0.55, 0.62, 1, 16)} color={color} outline={0.05} position={[0, HY - 0.35, -0.28]} />}
      {style === "bun" && <Part geometry={geo.sphere(0.28)} color={color} outline={0.05} position={[0, HY + 0.78, -0.12]} />}
      {style === "pony" && (
        <>
          <Part geometry={geo.sphere(0.24)} color={color} outline={0.05} position={[0, HY + 0.25, -0.78]} />
          <Part geometry={geo.cone(0.2, 0.7, 10)} color={color} outline={0.04} position={[0, HY - 0.2, -0.85]} rotation-x={Math.PI} />
        </>
      )}
      {style === "bob" &&
        [-1, 1].map((sx) => (
          <Part key={sx} geometry={geo.sphere(0.3)} color={color} outline={0.05} position={[sx * 0.56, HY - 0.15, -0.1]} scale={[0.8, 1.2, 1]} />
        ))}
    </>
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
