import { useRef } from "react";
import * as THREE from "three";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { Part, geo, toon, INK, STONE } from "./toon";
import { game, usePlay, nearestPlace, nearestNpc } from "./store";
import { npcPos } from "./npcs";
import { atBarrier, blocked, crossings } from "./colliders";
import { groundY, groundTilt } from "./terrain";
import { footstep, squeak } from "./sound";

const SKIN = 0xd9a441; // Design Imp gold, a touch warmer
const BELLY = 0xf3d48e;
const HORN = 0x4a2f22;
const EAR = 0xf0be62;
const EYE = 0x3b2a1e;
const MOUTH = 0x2a1410;
const SIT_AFTER = 8; // seconds standing still before he perches like the cathedral carving
const WAVE_FOR = 1.6;

const want = new THREE.Vector3();
const look = new THREE.Vector3();
const TURN = 2.4; // street view turn speed, radians a second
const STEER = [0.5, -0.5, 1, -1, 1.5, -1.5];

// The town guide: an original little imp nodding to the Lincoln Imp carving: big ears, horns, a wide grin,
// and when left alone he sits on a stone with one leg crossed over the other, like the carving does.
export default function Imp({ reduce }: { reduce: boolean }) {
  const body = useRef<THREE.Group>(null!);
  const legL = useRef<THREE.Group>(null!);
  const legR = useRef<THREE.Group>(null!);
  const armL = useRef<THREE.Group>(null!);
  const armR = useRef<THREE.Group>(null!);
  const tail = useRef<THREE.Group>(null!);
  const blob = useRef<THREE.Mesh>(null!);
  const rig = useRef<THREE.Group>(null!);
  const head = useRef<THREE.Group>(null!);
  const eyeL = useRef<THREE.Group>(null!);
  const eyeR = useRef<THREE.Group>(null!);
  const stone = useRef<THREE.Group>(null!);
  const walkT = useRef(0);
  const still = useRef(0); // seconds without moving
  const sitK = useRef(0); // 0 standing .. 1 sat on the stone
  const waveUntil = useRef(0);
  const wasOpen = useRef(false);
  const now = useRef(0);
  const wave = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    waveUntil.current = now.current + WAVE_FOR;
    squeak();
  };

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
    if (!game.target) game.via = [];
    if (game.pendingNpc) {
      // townsfolk keep walking, so keep chasing them until we're close, over a bridge or the level crossing if need be
      const npc = npcPos.get(game.pendingNpc.id)!;
      const hop = crossings([pos.x, pos.z], [npc.x, npc.z]).find(([x, z]) => Math.hypot(x - pos.x, z - pos.z) > 0.5);
      game.target = hop ? new THREE.Vector3(hop[0], 0, hop[1]) : npc.clone();
      if (npc.distanceTo(pos) < 1.8) startTalk(game.pendingNpc);
    }
    if (vx || vz) {
      game.target = null;
      game.pending = null;
      game.pendingNpc = null;
    } else if (game.target) {
      const dx = game.target.x - pos.x,
        dz = game.target.z - pos.z,
        dist = Math.hypot(dx, dz);
      if (dist < 0.25 && game.via.length) {
        game.target = game.via.shift()!; // reached a junction on the way, now on to the next
      } else if (dist < 0.25) {
        game.target = null;
        if (game.pending) openPlace(game.pending);
      } else {
        vx = dx / dist;
        vz = dz / dist;
      }
    }
    let moving = !!(vx || vz);
    if (moving) {
      const l = Math.hypot(vx, vz),
        sp = 7 * dt;
      vx /= l;
      vz /= l;
      const nx = pos.x + vx * sp,
        nz = pos.z + vz * sp;
      // caught on the crossing when the barriers came down: let the imp walk off it
      const onCrossing = atBarrier(pos.x, pos.z);
      const hit = (x: number, z: number) => blocked(x, z, !onCrossing);
      if (!onCrossing && atBarrier(nx, nz)) moving = false; // wait at the barrier for the train
      else if (!hit(nx, nz)) pos.set(nx, 0, nz);
      else if (Math.abs(vx) > 0.2 && !hit(nx, pos.z)) pos.x = nx;
      else if (Math.abs(vz) > 0.2 && !hit(pos.x, nz)) pos.z = nz;
      else if (game.target) {
        // Walking somewhere and bumped into something: veer around it.
        const step = STEER.find((a) => {
          const c = Math.cos(a),
            s = Math.sin(a);
          return !hit(pos.x + (vx * c - vz * s) * sp, pos.z + (vx * s + vz * c) * sp);
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
    }
    if (moving) {
      // a footfall each time a foot comes down
      const was = Math.floor(walkT.current / Math.PI);
      walkT.current += dt * 11;
      if (Math.floor(walkT.current / Math.PI) !== was) footstep();
    } else walkT.current *= 0.85;

    const t = clock.elapsedTime;
    now.current = t;
    const { welcome } = usePlay.getState();
    // wave hello on the welcome card and on arriving at a door
    if (open && !wasOpen.current) waveUntil.current = t + WAVE_FOR;
    wasOpen.current = !!open;
    const waving = welcome || t < waveUntil.current;
    still.current = moving || waving || open || talk ? 0 : still.current + dt;
    const sitting = !street && still.current > SIT_AFTER;
    sitK.current = reduce ? +sitting : THREE.MathUtils.damp(sitK.current, +sitting, 8, dt);
    const k2 = sitK.current;

    const sw = Math.sin(walkT.current) * 0.6 * (moving ? 1 : 0);
    // sat down: left leg hangs over the front of the stone, the right crosses over its knee
    legL.current.rotation.set(sw * (1 - k2) - 1.05 * k2, 0, 0);
    legR.current.rotation.set(-sw * (1 - k2) - 1.55 * k2, 0, -0.55 * k2);
    legR.current.position.y = 0.55 + 0.12 * k2;
    armL.current.rotation.set(-sw * 0.8 * (1 - k2), 0, -0.2 * k2);
    const wv = waving ? 2 + Math.sin(t * 14) * 0.4 : 0; // out to the side, clear of the big head
    // right hand rests on the crossed knee while sat
    armR.current.rotation.set(waving ? -0.5 : sw * 0.8 * (1 - k2) - 0.9 * k2, 0, wv || -0.25 * k2);
    rig.current.position.set(0, 0.12 * k2, 0.15 * k2);
    stone.current.scale.setScalar(k2);
    const breathe = reduce ? 1 : 1 + Math.sin(t * 2.2) * 0.02;
    rig.current.scale.set(1, breathe, 1);
    head.current.rotation.z = 0.12 * k2 + (waving && !reduce ? Math.sin(t * 7) * 0.06 : 0);
    // blink every few seconds
    const blink = t % 3.7 < 0.12 ? 0.12 : 1;
    eyeL.current.scale.y = eyeR.current.scale.y = blink;
    tail.current.rotation.y = reduce ? 0 : Math.sin(t * (moving ? 6 : 3)) * (moving ? 0.25 : 0.35);
    tail.current.rotation.x = moving ? 0.25 : 0;
    // game.pos stays on the flat map; the imp is drawn up on the hill wherever the ground rises
    const gy = groundY(pos.z);
    body.current.position.set(pos.x, gy + (moving ? Math.abs(Math.sin(walkT.current)) * 0.12 : 0), pos.z);
    // he turns to face the camera to pose for the sit
    const toCam = Math.atan2(Math.sin(-game.face), Math.cos(-game.face));
    body.current.rotation.y = game.face + toCam * k2;
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
      <group ref={body} onClick={wave}>
        {/* the stone he perches on for the Lincoln sit */}
        <group ref={stone} position={[0, 0.27, -0.3]} scale={0}>
          <Part geometry={geo.box(1.1, 0.55, 0.75)} color={STONE} outline={0.05} />
        </group>
        <group ref={rig}>
          {[-0.2, 0.2].map((x, i) => (
            <group key={x} ref={i ? legR : legL} position={[x, 0.55, 0]}>
              <Part geometry={geo.cyl(0.12, 0.14, 0.42, 10)} color={SKIN} outline={0.05} position={[0, -0.2, 0]} />
              <Part geometry={geo.sphere(0.17)} color={HORN} outline={0.04} position={[0, -0.44, 0.08]} scale={[1, 0.55, 1.45]} />
            </group>
          ))}
          {/* pear-shaped body with a pale belly */}
          <Part geometry={geo.sphere(0.56)} color={SKIN} outline={0.06} position={[0, 0.98, 0]} scale={[1, 1.12, 0.92]} />
          <Part geometry={geo.sphere(0.3)} color={BELLY} outline={0} position={[0, 0.92, 0.36]} scale={[1, 1.05, 0.5]} />
          {[-0.46, 0.46].map((x, i) => (
            <group key={x} ref={i ? armR : armL} position={[x, 1.3, 0]}>
              <Part geometry={geo.cyl(0.09, 0.1, 0.48, 8)} color={SKIN} outline={0.04} position={[0, -0.24, 0]} />
              <Part geometry={geo.sphere(0.13)} color={SKIN} outline={0.04} position={[0, -0.52, 0]} />
            </group>
          ))}
          {/* long tail that curls up behind, with a spade you can see from above */}
          <group ref={tail} position={[0, 0.72, -0.42]}>
            <Part geometry={geo.cyl(0.06, 0.08, 0.6, 8)} color={SKIN} outline={0.04} position={[0, -0.05, -0.27]} rotation={[-1.75, 0, 0]} />
            <Part geometry={geo.cyl(0.05, 0.06, 0.7, 8)} color={SKIN} outline={0.04} position={[0, 0.25, -0.7]} rotation={[-0.45, 0, 0]} />
            <group position={[0, 0.66, -0.86]} rotation={[-0.35, 0, 0]}>
              <Part geometry={geo.sphere(0.17)} color={HORN} outline={0.04} scale={[1.15, 0.9, 0.4]} />
              <Part geometry={geo.cone(0.13, 0.26, 8)} color={HORN} outline={0.04} position={[0, 0.2, 0]} scale={[1, 1, 0.4]} />
            </group>
          </group>
          <group ref={head} position={[0, 2.02, 0]}>
            <Part geometry={geo.sphere(0.78)} color={SKIN} outline={0.06} scale={[1.06, 0.95, 1]} />
            {[-1, 1].map((s) => (
              <group key={s}>
                {/* big leaf ears swept up like the carving's */}
                <group position={[s * 0.72, 0.28, -0.05]} rotation={[0.15, -s * 0.35, -s * 0.75]}>
                  <Part geometry={geo.cone(0.25, 0.8, 10)} color={SKIN} outline={0.04} position={[0, 0.34, 0]} scale={[1, 1, 0.4]} />
                  <mesh geometry={geo.cone(0.15, 0.5, 10)} material={toon(EAR)} position={[0, 0.3, 0.07]} scale={[1, 1, 0.25]} />
                </group>
                {/* tall horns with a little curl inwards at the tip */}
                <group position={[s * 0.36, 0.62, -0.05]} rotation={[0, 0, -s * 0.3]}>
                  <Part geometry={geo.cone(0.15, 0.42, 10)} color={HORN} outline={0.04} position={[0, 0.2, 0]} />
                  <Part geometry={geo.cone(0.09, 0.32, 10)} color={HORN} outline={0.03} position={[s * 0.06, 0.5, 0]} rotation={[0, 0, s * 0.55]} />
                </group>
                {/* mischievous brows */}
                <mesh geometry={geo.box(0.22, 0.05, 0.05)} position={[s * 0.28, 0.4, 0.65]} rotation={[0, 0, s * 0.22]}>
                  <meshBasicMaterial color={INK} />
                </mesh>
                {/* big eyes with a shine; the ref'd groups squash for a blink */}
                <group ref={s < 0 ? eyeL : eyeR} position={[s * 0.27, 0.16, 0.62]}>
                  <Part geometry={geo.sphere(0.19)} color={0xffffff} outline={0.035} scale={[1, 1.15, 0.8]}>
                    <mesh geometry={geo.sphere(0.1)} position={[-s * 0.02, -0.02, 0.14]}>
                      <meshBasicMaterial color={EYE} />
                    </mesh>
                    <mesh geometry={geo.sphere(0.05)} position={[-s * 0.02, -0.02, 0.21]}>
                      <meshBasicMaterial color={INK} />
                    </mesh>
                    <mesh geometry={geo.sphere(0.03)} position={[0.03, 0.03, 0.24]}>
                      <meshBasicMaterial color={0xffffff} />
                    </mesh>
                  </Part>
                </group>
                {/* rosy cheeks */}
                <mesh geometry={geo.sphere(0.1)} position={[s * 0.5, -0.08, 0.55]} scale={[1.3, 0.7, 0.3]}>
                  <meshBasicMaterial color={0xff8f6b} />
                </mesh>
                {/* two little fangs */}
                <mesh geometry={geo.cone(0.035, 0.09, 6)} position={[s * 0.11, -0.17, 0.765]} rotation={[Math.PI, 0, 0]}>
                  <meshBasicMaterial color={0xffffff} />
                </mesh>
              </group>
            ))}
            {/* the wide Lincoln grin */}
            <mesh position={[0, -0.13, 0.75]} rotation={[0.2, 0, 0]} scale={[1.15, 0.7, 1]}>
              <circleGeometry args={[0.3, 16, Math.PI, Math.PI]} />
              <meshBasicMaterial color={MOUTH} side={THREE.DoubleSide} />
            </mesh>
          </group>
        </group>
      </group>
      <mesh ref={blob} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[0.7, 20]} />
        <meshBasicMaterial color={INK} transparent opacity={0.18} />
      </mesh>
    </>
  );
}
