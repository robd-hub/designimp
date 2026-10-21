import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Part, geo, INK } from "./toon";
import { game, usePlay, nearestPlace, nearestNpc, DOORS } from "./store";
import { npcPos } from "./npcs";
import { blocked } from "./colliders";
import { groundY, groundTilt } from "./terrain";

const SKIN = 0xc8973a; // Design Imp gold
const BELLY = 0xf2c879;
const HORN = 0x4a2f22;

const want = new THREE.Vector3();
const look = new THREE.Vector3();
const TURN = 2.4; // street view turn speed, radians a second
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
    const { open, near, nearNpc, talk, setNear, openPlace, startTalk, endTalk, street } = usePlay.getState();
    let vx = 0,
      vz = 0,
      steered = false; // street view: keys drive along the facing, so don't re-face to the motion
    if (!open && street) {
      let fwd = 0,
        turn = 0;
      if (k.w || k.arrowup) fwd += 1;
      if (k.s || k.arrowdown) fwd -= 1;
      if (k.a || k.arrowleft) turn += 1;
      if (k.d || k.arrowright) turn -= 1;
      if (!fwd && !turn && Math.hypot(game.joy.x, game.joy.z) > 0.2) [fwd, turn] = [-game.joy.z, -game.joy.x];
      if (turn) {
        game.face += turn * TURN * dt;
        game.target = null;
        game.pending = null;
        game.pendingNpc = null;
      }
      if (Math.abs(fwd) > 0.05) [vx, vz, steered] = [Math.sin(game.face) * fwd, Math.cos(game.face) * fwd, true];
    } else if (!open) {
      if (k.w || k.arrowup) vz -= 1;
      if (k.s || k.arrowdown) vz += 1;
      if (k.a || k.arrowleft) vx -= 1;
      if (k.d || k.arrowright) vx += 1;
      if (!vx && !vz && Math.hypot(game.joy.x, game.joy.z) > 0.2) [vx, vz] = [game.joy.x, game.joy.z];
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
      const door = game.pending && DOORS.get(game.pending.id);
      if (dist < 0.25 && door && door.distanceTo(pos) > 0.5) {
        game.target = door.clone(); // reached a junction on the way, now on to the door
      } else if (dist < 0.25) {
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
      if (!steered) {
        let d = Math.atan2(vx, vz) - game.face;
        d = Math.atan2(Math.sin(d), Math.cos(d));
        game.face += d * Math.min(1, dt * 12);
      }
      walkT.current += dt * 11;
    } else walkT.current *= 0.85;

    const sw = Math.sin(walkT.current) * 0.6 * (moving ? 1 : 0);
    legL.current.rotation.x = sw;
    legR.current.rotation.x = -sw;
    armL.current.rotation.x = -sw * 0.8;
    armR.current.rotation.x = sw * 0.8;
    const t = clock.elapsedTime;
    tail.current.rotation.y = reduce ? 0 : Math.sin(t * 3) * 0.35;
    // game.pos stays on the flat map; the imp is drawn up on the hill wherever the ground rises
    const gy = groundY(pos.z);
    body.current.position.set(pos.x, gy + (moving ? Math.abs(Math.sin(walkT.current)) * 0.12 : 0), pos.z);
    body.current.rotation.y = game.face;
    blob.current.position.set(pos.x, gy + 0.08, pos.z);
    blob.current.rotation.x = -Math.PI / 2 + groundTilt(pos.z);

    if (talk && npcPos.get(talk.npc.id)!.distanceTo(pos) > 4) endTalk();
    const nn = open ? null : nearestNpc();
    const n = open || nn ? null : nearestPlace();
    if (n !== near || nn !== nearNpc) setNear(n, nn);

    body.current.visible = blob.current.visible = !street;
    // Street view sees wider (and zoom widens or narrows it); the map view keeps a tight lens.
    const cam = camera as THREE.PerspectiveCamera;
    const fov = street ? Math.min(100, Math.max(40, 62 * game.zoom * (size.width < size.height ? 1.35 : 1))) : 45;
    if (Math.abs(cam.fov - fov) > 0.01) {
      cam.fov = fov;
      cam.updateProjectionMatrix();
    }
    if (street) {
      // Eyes just in front of the imp's face, looking where it faces.
      const fx = Math.sin(game.face),
        fz = Math.cos(game.face);
      want.set(pos.x + fx * 0.9, gy + 2.3, pos.z + fz * 0.9);
      camera.position.copy(want);
      look.set(want.x + fx, want.y + Math.tan(game.pitch), want.z + fz);
      camera.lookAt(look);
      return;
    }
    want.set(0, 15, 15).multiplyScalar(game.zoom * (size.width < 600 ? 1.25 : 1)).add(pos);
    want.y += gy;
    camera.position.lerp(want, reduce ? 1 : Math.min(1, dt * 5));
    camera.lookAt(pos.x, gy + 1.2, pos.z);
  });

  return (
    <>
      <group ref={body}>
        {[-0.22, 0.22].map((x, i) => (
          <group key={x} ref={i ? legR : legL} position={[x, 0.62, 0]}>
            <Part geometry={geo.cyl(0.14, 0.16, 0.5, 10)} color={SKIN} outline={0.05} position={[0, -0.25, 0]} />
            <Part geometry={geo.sphere(0.18)} color={HORN} outline={0.04} position={[0, -0.5, 0.07]} scale={[1, 0.6, 1.4]} />
          </group>
        ))}
        <Part geometry={geo.cyl(0.42, 0.52, 0.8)} color={SKIN} outline={0.06} position={[0, 1.02, 0]} />
        <Part geometry={geo.sphere(0.52)} color={SKIN} outline={0.06} position={[0, 0.64, 0]} scale={[1, 0.42, 1]} />
        <Part geometry={geo.sphere(0.32)} color={BELLY} outline={0.03} position={[0, 0.95, 0.33]} scale={[1, 1.1, 0.45]} />
        {[-0.52, 0.52].map((x, i) => (
          <group key={x} ref={i ? armR : armL} position={[x, 1.32, 0]}>
            <Part geometry={geo.cyl(0.1, 0.11, 0.5, 8)} color={SKIN} outline={0.04} position={[0, -0.25, 0]} />
            <Part geometry={geo.sphere(0.14)} color={SKIN} outline={0.04} position={[0, -0.55, 0]} />
          </group>
        ))}
        <Part geometry={geo.sphere(0.78)} color={SKIN} outline={0.06} position={[0, 2.15, 0]} />
        {[-1, 1].map((s) => (
          <group key={s}>
            {/* horns */}
            <Part geometry={geo.cone(0.15, 0.6)} color={HORN} outline={0.04} position={[s * 0.38, 2.92, -0.05]} rotation={[0, 0, -s * 0.4]} />
            {/* pointy ears */}
            <Part geometry={geo.cone(0.16, 0.55)} color={SKIN} outline={0.04} position={[s * 0.88, 2.25, 0]} rotation={[0, 0, -s * 1.25]} />
            {/* big eyes with a shine */}
            <Part geometry={geo.sphere(0.2)} color={0xffffff} outline={0.035} position={[s * 0.27, 2.24, 0.64]} scale={[1, 1.15, 0.8]}>
              <mesh geometry={geo.sphere(0.1)} position={[0, -0.02, 0.15]}>
                <meshBasicMaterial color={INK} />
              </mesh>
              <mesh geometry={geo.sphere(0.035)} position={[0.04, 0.03, 0.24]}>
                <meshBasicMaterial color={0xffffff} />
              </mesh>
            </Part>
            {/* rosy cheeks */}
            <mesh geometry={geo.sphere(0.11)} position={[s * 0.47, 2.0, 0.6]} scale={[1.3, 0.7, 0.3]}>
              <meshBasicMaterial color={0xff8f6b} />
            </mesh>
          </group>
        ))}
        {/* cheeky grin */}
        <mesh geometry={geo.smile(0.2, 0.035)} position={[0, 1.98, 0.72]}>
          <meshBasicMaterial color={INK} />
        </mesh>
        {/* tail */}
        <group ref={tail} position={[0, 0.75, -0.48]}>
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
