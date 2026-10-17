import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Part, geo, INK } from "./toon";
import { game, usePlay, nearestPlace, nearestNpc } from "./store";
import { npcPos } from "./npcs";
import { blocked } from "./colliders";

const SKIN = 0xc8973a; // Design Imp gold
const BELLY = 0xf2c879;
const HORN = 0x4a2f22;

const want = new THREE.Vector3();
const STEER = [0.5, -0.5, 1, -1, 1.5, -1.5];

// The town guide: an original little imp, loosely nodding to the Lincoln Imp carving.
export default function Imp({ reduce }: { reduce: boolean }) {
  const body = useRef<THREE.Group>(null!);
  const legL = useRef<THREE.Group>(null!);
  const legR = useRef<THREE.Group>(null!);
  const armL = useRef<THREE.Group>(null!);
  const armR = useRef<THREE.Group>(null!);
  const tail = useRef<THREE.Group>(null!);
  const blob = useRef<THREE.Mesh>(null!);
  const walkT = useRef(0);

  useFrame(({ camera, size, clock }, delta) => {
    const dt = Math.min(delta, 0.05);
    const k = game.keys;
    const { open, near, nearNpc, talk, setNear, openPlace, startTalk, endTalk } = usePlay.getState();
    let vx = 0,
      vz = 0;
    if (!open) {
      if (k.w || k.arrowup) vz -= 1;
      if (k.s || k.arrowdown) vz += 1;
      if (k.a || k.arrowleft) vx -= 1;
      if (k.d || k.arrowright) vx += 1;
    }
    const pos = game.pos;
    if (game.pendingNpc) {
      // townsfolk keep walking, so keep chasing them until we're close
      game.target = npcPos.get(game.pendingNpc.id)!.clone();
      if (game.target.distanceTo(pos) < 1.8) startTalk(game.pendingNpc);
    }
    if (vx || vz) {
      game.target = null;
      game.pending = null;
      game.pendingNpc = null;
    } else if (game.target) {
      const dx = game.target.x - pos.x,
        dz = game.target.z - pos.z,
        dist = Math.hypot(dx, dz);
      if (dist < 0.25) {
        game.target = null;
        if (game.pending) openPlace(game.pending);
      } else {
        vx = dx / dist;
        vz = dz / dist;
      }
    }
    const moving = !!(vx || vz);
    if (moving) {
      const l = Math.hypot(vx, vz),
        sp = 7 * dt;
      vx /= l;
      vz /= l;
      const nx = pos.x + vx * sp,
        nz = pos.z + vz * sp;
      if (!blocked(nx, nz)) pos.set(nx, 0, nz);
      else if (Math.abs(vx) > 0.2 && !blocked(nx, pos.z)) pos.x = nx;
      else if (Math.abs(vz) > 0.2 && !blocked(pos.x, nz)) pos.z = nz;
      else if (game.target) {
        // Walking somewhere and bumped into something: veer around it.
        const step = STEER.find((a) => {
          const c = Math.cos(a),
            s = Math.sin(a);
          return !blocked(pos.x + (vx * c - vz * s) * sp, pos.z + (vx * s + vz * c) * sp);
        });
        if (step === undefined) {
          game.target = null;
          game.pending = null;
        } else {
          const c = Math.cos(step),
            s = Math.sin(step);
          [vx, vz] = [vx * c - vz * s, vx * s + vz * c];
          pos.x += vx * sp;
          pos.z += vz * sp;
        }
      }
      let d = Math.atan2(vx, vz) - game.face;
      d = Math.atan2(Math.sin(d), Math.cos(d));
      game.face += d * Math.min(1, dt * 12);
      walkT.current += dt * 11;
    } else walkT.current *= 0.85;

    const sw = Math.sin(walkT.current) * 0.6 * (moving ? 1 : 0);
    legL.current.rotation.x = sw;
    legR.current.rotation.x = -sw;
    armL.current.rotation.x = -sw * 0.8;
    armR.current.rotation.x = sw * 0.8;
    const t = clock.elapsedTime;
    tail.current.rotation.y = reduce ? 0 : Math.sin(t * 3) * 0.35;
    body.current.position.set(pos.x, moving ? Math.abs(Math.sin(walkT.current)) * 0.12 : 0, pos.z);
    body.current.rotation.y = game.face;
    blob.current.position.set(pos.x, 0.06, pos.z);

    if (talk && npcPos.get(talk.npc.id)!.distanceTo(pos) > 4) endTalk();
    const nn = open ? null : nearestNpc();
    const n = open || nn ? null : nearestPlace();
    if (n !== near || nn !== nearNpc) setNear(n, nn);

    want.set(0, 15, 15).multiplyScalar(game.zoom * (size.width < 600 ? 1.25 : 1)).add(pos);
    camera.position.lerp(want, reduce ? 1 : Math.min(1, dt * 5));
    camera.lookAt(pos.x, 1.2, pos.z);
  });

  return (
    <>
      <group ref={body}>
        {[-0.22, 0.22].map((x, i) => (
          <group key={x} ref={i ? legR : legL} position={[x, 0.9, 0]}>
            <Part geometry={geo.box(0.32, 0.9, 0.32)} color={SKIN} outline={0.05} position={[0, -0.45, 0]} />
          </group>
        ))}
        <Part geometry={geo.cyl(0.48, 0.55, 1.1)} color={SKIN} outline={0.06} position={[0, 1.45, 0]} />
        <Part geometry={geo.sphere(0.36)} color={BELLY} outline={0.03} position={[0, 1.4, 0.28]} scale={[1, 1.1, 0.5]} />
        {[-0.68, 0.68].map((x, i) => (
          <group key={x} ref={i ? armR : armL} position={[x, 1.9, 0]}>
            <Part geometry={geo.box(0.24, 0.85, 0.24)} color={SKIN} outline={0.05} position={[0, -0.4, 0]} />
          </group>
        ))}
        <Part geometry={geo.sphere(0.6)} color={SKIN} outline={0.06} position={[0, 2.55, 0]} />
        {[-1, 1].map((s) => (
          <group key={s}>
            {/* horns */}
            <Part geometry={geo.cone(0.13, 0.55)} color={HORN} outline={0.04} position={[s * 0.3, 3.15, -0.05]} rotation={[0, 0, -s * 0.35]} />
            {/* pointy ears */}
            <Part geometry={geo.cone(0.14, 0.5)} color={SKIN} outline={0.04} position={[s * 0.68, 2.65, 0]} rotation={[0, 0, -s * 1.25]} />
            {/* eyes */}
            <Part geometry={geo.sphere(0.16)} color={0xffffff} outline={0.035} position={[s * 0.21, 2.6, 0.5]}>
              <mesh geometry={geo.sphere(0.07)} position={[0, 0, 0.13]}>
                <meshBasicMaterial color={INK} />
              </mesh>
            </Part>
          </group>
        ))}
        {/* cheeky grin */}
        <Part geometry={geo.box(0.42, 0.07, 0.05)} color={INK} outline={0} position={[0, 2.3, 0.56]} rotation={[0, 0, 0]} />
        {[-1, 1].map((s) => (
          <Part key={s} geometry={geo.box(0.12, 0.07, 0.05)} color={INK} outline={0} position={[s * 0.24, 2.34, 0.55]} rotation={[0, 0, s * 0.6]} />
        ))}
        {/* tail */}
        <group ref={tail} position={[0, 1.05, -0.5]}>
          <Part geometry={geo.cyl(0.06, 0.08, 0.9, 8)} color={SKIN} outline={0.04} position={[0, 0, -0.35]} rotation={[-1.1, 0, 0]} />
          <Part geometry={geo.cone(0.18, 0.3, 4)} color={HORN} outline={0.04} position={[0, 0.25, -0.75]} rotation={[-0.4, 0, 0]} />
        </group>
      </group>
      <mesh ref={blob} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[0.7, 20]} />
        <meshBasicMaterial color={INK} transparent opacity={0.18} />
      </mesh>
    </>
  );
}
