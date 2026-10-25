import { useRef, useState } from "react";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { Part, geo, INK } from "./toon";
import { NPCS, npcPos, chatLine, type Npc } from "./npcs";
import { game, usePlay, walkToNpc } from "./store";
import { groundY } from "./terrain";
import { atBarrier } from "./colliders";

const tmp = new THREE.Vector3();

// Townsfolk who pass each other stop for a quick chat: they turn to face each other and take turns to
// speak, each waving as they do, then walk on. A pair won't stop again until again seconds have passed.
const CHAT = { near: 1.8, secs: 5, again: 25 };
const chats = new Map<string, { with: Npc; t0: number; first: boolean }>();
const lastChat = new Map<string, number>();
const pairKey = (a: Npc, b: Npc) => [a.id, b.id].sort().join();

function Person({ npc, reduce }: { npc: Npc; reduce: boolean }) {
  const body = useRef<THREE.Group>(null!);
  const legL = useRef<THREE.Group>(null!);
  const legR = useRef<THREE.Group>(null!);
  const armL = useRef<THREE.Group>(null!);
  const armR = useRef<THREE.Group>(null!);
  const st = useRef({ leg: 1, walkT: 0, face: 0 });
  const [say, setSay] = useState<string | null>(null);
  const saying = useRef<string | null>(null);

  useFrame(({ clock }, delta) => {
    const dt = Math.min(delta, 0.05);
    const s = st.current;
    const pos = npcPos.get(npc.id)!;
    const talking = usePlay.getState().talk?.npc === npc;
    let moving = false;
    let want = s.face;
    const now = clock.elapsedTime;
    let chat = chats.get(npc.id);
    if (chat && now - chat.t0 > CHAT.secs) {
      chats.delete(npc.id);
      lastChat.set(pairKey(npc, chat.with), now);
      chat = undefined;
    }
    if (!chat && !talking) {
      for (const o of NPCS) {
        if (o === npc || chats.has(o.id) || usePlay.getState().talk?.npc === o) continue;
        if (now - (lastChat.get(pairKey(npc, o)) ?? -Infinity) < CHAT.again || npcPos.get(o.id)!.distanceTo(pos) > CHAT.near) continue;
        chat = { with: o, t0: now, first: true };
        chats.set(npc.id, chat);
        chats.set(o.id, { with: npc, t0: now, first: false });
        break;
      }
    }
    // the first to speak has the first half of the chat, the other the second
    const speaking = !talking && !!chat && now - chat.t0 < CHAT.secs / 2 === chat.first;
    const line = speaking ? chatLine(npc, chat!.with, chat!.first) : null;
    if (line !== saying.current) setSay((saying.current = line));
    if (talking) {
      want = Math.atan2(game.pos.x - pos.x, game.pos.z - pos.z);
    } else if (chat) {
      const o = npcPos.get(chat.with.id)!;
      want = Math.atan2(o.x - pos.x, o.z - pos.z);
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
    const wave = talking || speaking;
    armR.current.rotation.x = wave ? Math.PI : sw * 0.8;
    armR.current.rotation.z = wave && !reduce ? Math.sin(clock.elapsedTime * 8) * 0.35 : 0;
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
      {FLORAL.has(npc.id) &&
        BLOSSOM.map(([a, y], i) => (
          <mesh key={i} geometry={geo.sphere(0.04)} position={[Math.sin(a) * (0.47 - (y - 0.7) * 0.13), y, Math.cos(a) * (0.47 - (y - 0.7) * 0.13)]} scale={[1, 1, 0.4]} rotation-y={a}>
            <meshBasicMaterial color={0xffffff} />
          </mesh>
        ))}
      {[-0.46, 0.46].map((x, i) => (
        <group key={x} ref={i ? armR : armL} position={[x, 1.28, 0]}>
          <Part geometry={geo.cyl(0.09, 0.1, 0.5, 8)} color={npc.shirt} outline={0.04} position={[0, -0.25, 0]} />
          <Part geometry={geo.sphere(0.12)} color={npc.skin} outline={0.03} position={[0, -0.55, 0]} />
        </group>
      ))}
      <Head npc={npc} reduce={reduce} />
      {npc.dog !== undefined && <Dog color={npc.dog} reduce={reduce} />}
      {say && (
        <Html position={[0, 3.4, 0]} center zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
          <div className="max-w-[220px] w-max rounded-2xl border-2 border-[#1a1320] bg-white px-3 py-1.5 text-center text-xs font-semibold leading-snug text-[#1a1320] shadow-[0_3px_0_#1a1320]">
            {say}
          </div>
        </Html>
      )}
    </group>
  );
}

// A fluffy little dog trotting at its owner's left side on a lead from her hand, in the owner's own
// coordinates so it follows her round. Its tail wags all the time.
const DOG = { x: -0.85, z: 0.55 };
const HAND = new THREE.Vector3(-0.46, 0.73, 0);
const COLLAR = new THREE.Vector3(DOG.x, 0.62, DOG.z + 0.3);
const LEAD = (() => {
  const d = COLLAR.clone().sub(HAND);
  return {
    len: d.length(),
    at: HAND.clone().add(COLLAR).multiplyScalar(0.5),
    q: new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()),
  };
})();
function Dog({ color, reduce }: { color: number; reduce: boolean }) {
  const tail = useRef<THREE.Group>(null!);
  useFrame(({ clock }) => {
    if (!reduce) tail.current.rotation.z = Math.sin(clock.elapsedTime * 14) * 0.5;
  });
  return (
    <>
      <mesh geometry={geo.cyl(0.015, 0.015, LEAD.len, 4)} position={LEAD.at} quaternion={LEAD.q}>
        <meshBasicMaterial color={0xe03a3e} />
      </mesh>
      <group position={[DOG.x, 0, DOG.z]}>
        <Part geometry={geo.sphere(0.24)} color={color} outline={0.04} position-y={0.42} scale={[0.85, 0.8, 1.35]} />
        {[-1, 1].flatMap((sx) =>
          [-1, 1].map((sz) => <Part key={`${sx}${sz}`} geometry={geo.cyl(0.06, 0.06, 0.28, 6)} color={color} outline={0.03} position={[sx * 0.11, 0.14, sz * 0.18]} />),
        )}
        <group position={[0, 0.62, 0.32]}>
          <Part geometry={geo.sphere(0.19)} color={color} outline={0.04} />
          <Part geometry={geo.sphere(0.09)} color={color} outline={0.03} position={[0, -0.05, 0.17]} />
          <mesh geometry={geo.sphere(0.04)} position={[0, -0.02, 0.26]}>
            <meshBasicMaterial color={INK} />
          </mesh>
          {[-1, 1].map((sx) => (
            <group key={sx}>
              <mesh geometry={geo.sphere(0.03)} position={[sx * 0.08, 0.05, 0.16]}>
                <meshBasicMaterial color={INK} />
              </mesh>
              {/* floppy curly ears */}
              <Part geometry={geo.sphere(0.09)} color={color} outline={0.03} position={[sx * 0.17, -0.06, -0.02]} scale={[0.7, 1.4, 0.9]} />
            </group>
          ))}
        </group>
        <group ref={tail} position={[0, 0.52, -0.3]}>
          <Part geometry={geo.sphere(0.08)} color={color} outline={0.03} position={[0, 0.08, -0.04]} scale={[1, 1.3, 1]} />
        </group>
      </group>
    </>
  );
}

// Hair styles; anyone in a hat keeps it on.
const STYLE: Record<string, "long" | "bun" | "pony" | "bob" | "fringe"> = {
  christine: "long",
  justyna: "bun",
  elizabeth: "fringe",
  elsie: "bun",
  bea: "bob",
};
// and anyone here wears sunglasses
const SHADES = new Set(["elizabeth", "alan"]);
// Little white blossoms scattered over a dark top, as [angle round the body, height].
const FLORAL = new Set(["elizabeth"]);
const BLOSSOM = [
  [-0.9, 0.8], [-0.3, 0.75], [0.35, 0.82], [0.95, 0.76], [-0.6, 1.05], [0.05, 1.02], [0.65, 1.08],
  [-0.95, 1.25], [-0.25, 1.28], [0.4, 1.24], [1.0, 1.22], [2.2, 1], [-2.2, 1.1], [3.1, 0.9], [2.7, 1.25], [-2.7, 0.8],
] as const;
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
      {SHADES.has(npc.id) &&
        [-1, 1].map((sx) => (
          <mesh key={sx} geometry={geo.sphere(0.17)} position={[sx * 0.25, HY + 0.05, 0.64]} scale={[1.25, 0.85, 0.35]} rotation-z={sx * 0.2}>
            <meshBasicMaterial color={INK} />
          </mesh>
        ))}
      {SHADES.has(npc.id) && (
        <mesh geometry={geo.box(0.2, 0.05, 0.05)} position={[0, HY + 0.1, 0.69]}>
          <meshBasicMaterial color={INK} />
        </mesh>
      )}
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
      {style === "fringe" && (
        <>
          {/* shoulder-length at the back and sides, with a fringe across the forehead */}
          <Part geometry={geo.cyl(0.56, 0.62, 0.8, 16)} color={color} outline={0.05} position={[0, HY - 0.3, -0.36]} />
          {[-1, 1].map((sx) => (
            <Part key={sx} geometry={geo.sphere(0.28)} color={color} outline={0.05} position={[sx * 0.64, HY - 0.28, -0.12]} scale={[0.55, 1.5, 0.9]} />
          ))}
          <Part geometry={geo.sphere(0.5)} color={color} outline={0.04} position={[0, HY + 0.46, 0.3]} scale={[1.2, 0.3, 0.75]} />
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
