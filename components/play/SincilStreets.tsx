"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { geo, toon, outlineMat, WINDOW, LAMP } from "./toon";
import { CANWICK, SIDE, SIDE_STREETS, SINCIL, STADIUM_ROAD, TERRACE, TERRACES } from "./colliders";
import { Sign, useRoof, useSign } from "./MoreLandmarks";

// The terraced streets down to Sincil Bank (laid out in colliders.ts): Canwick Road on south from the foot of Pelham
// Bridge, Tentercroft, Portland and Scorer Streets east off the south road to it, and Sincil Bank past the ground.
// Rows of red-brick terraced houses line them, with a lamp every so often and the street's name at each end. The
// houses are generic two-up two-downs, not drawn from particular buildings, and none of them has a card.
const PAVE = 0xe8dcc2;
const ROAD = 0x6b6573;
const BRICKS = [0xa4472f, 0xb5553a, 0x8f3f2c, 0xc06a4a, 0x9a4a3a];
const DOORS = [0x2f4a7a, 0x7a1f3d, 0x1f6b4a, 0x2b2633, 0xf2e2c4];
const SLATE = 0x4b5160;
const POLE = 0x2b2633;
type V3 = [number, number, number];
type Item = { at: V3; rot: number };

// Many copies of one shape in one draw, optionally with the town's ink outline round each (a second, slightly larger
// copy drawn inside out, as Part does for single meshes).
function Instances({ geometry, color, list, outline = 0 }: { geometry: THREE.BufferGeometry; color: number; list: Item[]; outline?: number }) {
  const body = useRef<THREE.InstancedMesh>(null!);
  const ink = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const m = new THREE.Object3D();
    geometry.computeBoundingBox();
    const size = geometry.boundingBox!.getSize(new THREE.Vector3());
    const s = (n: number) => 1 + (2 * outline) / Math.max(n, 0.05);
    list.forEach((it, i) => {
      m.position.set(...it.at);
      m.rotation.set(0, it.rot, 0);
      m.scale.set(1, 1, 1);
      m.updateMatrix();
      body.current.setMatrixAt(i, m.matrix);
      if (ink.current) {
        m.scale.set(s(size.x), s(size.y), s(size.z));
        m.updateMatrix();
        ink.current.setMatrixAt(i, m.matrix);
      }
    });
    for (const r of [body.current, ink.current]) {
      if (!r) continue;
      r.instanceMatrix.needsUpdate = true;
      r.computeBoundingSphere();
    }
  }, [geometry, list, outline]);
  return (
    <>
      {outline > 0 && <instancedMesh key={`o${list.length}`} ref={ink} args={[geometry, outlineMat, list.length]} raycast={() => null} />}
      <instancedMesh key={list.length} ref={body} args={[geometry, toon(color), list.length]} castShadow receiveShadow />
    </>
  );
}

// A point on a house, from its own coordinates (front at +z) into the town's.
const onHouse = (h: (typeof TERRACES)[number], lx: number, y: number, lz: number): Item => ({
  at: [h.x + lx * Math.cos(h.rot) + lz * Math.sin(h.rot), y, h.z - lx * Math.sin(h.rot) + lz * Math.cos(h.rot)],
  rot: h.rot,
});

const { w: W, d: D, h: H } = TERRACE;
const front = D / 2 + 0.03;
// The houses' parts, sorted by colour so each colour is one draw.
const PARTS = (() => {
  const bodies = BRICKS.map(() => [] as Item[]);
  const doors = DOORS.map(() => [] as Item[]);
  const roofs: Item[] = [],
    chimneys: Item[] = [],
    big: Item[] = [],
    small: Item[] = [],
    sills: Item[] = [];
  TERRACES.forEach((h) => {
    const flip = h.k % 2 ? -1 : 1; // neighbours are mirror images, doors side by side
    bodies[(h.k * 7) % BRICKS.length].push(onHouse(h, 0, H / 2, 0));
    roofs.push(onHouse(h, 0, H, 0));
    chimneys.push(onHouse(h, flip * (W / 2 - 0.35), H + 1.1, -0.4));
    doors[(h.k * 3) % DOORS.length].push(onHouse(h, flip * (W / 2 - 0.85), 0.95, front));
    big.push(onHouse(h, -flip * 0.75, 1.35, front));
    for (const x of [-1.1, 1.1]) small.push(onHouse(h, x, H - 0.95, front));
    sills.push(onHouse(h, -flip * 0.75, 0.72, front + 0.05));
  });
  return { bodies, doors, roofs, chimneys, big, small, sills };
})();

// Lamps down the streets, every so often on alternate sides, and the posts for the name signs.
const LAMP_GAP = 13;
const clearOfJunctions = (z: number) => SIDE_STREETS.every((st) => Math.abs(z - st.z) > SIDE.pave + 0.8) && Math.abs(z - STADIUM_ROAD.z) > 5;
const along = (z0: number, z1: number, x: number, off: number): [number, number][] =>
  Array.from({ length: Math.floor((z1 - z0) / LAMP_GAP) }, (_, i): [number, number] => [x + (i % 2 ? 1 : -1) * off, z0 + i * LAMP_GAP]).filter(([, z]) => clearOfJunctions(z));
const LAMPS: [number, number][] = [
  ...SIDE_STREETS.flatMap((st) => Array.from({ length: Math.floor((st.x1 - 30) / LAMP_GAP) }, (_, i): [number, number] => [30 + i * LAMP_GAP, st.z + (i % 2 ? 1 : -1) * (SIDE.pave - 0.35)])),
  ...along(SINCIL.z0 + 8, SINCIL.z1, SINCIL.x, SIDE.pave - 0.35),
  ...along(CANWICK.z0 + 6, CANWICK.z1, CANWICK.x, CANWICK.pave - 0.35),
];
const POLES = LAMPS.map(([x, z]): Item => ({ at: [x, 1.6, z], rot: 0 }));
const BULBS = LAMPS.map(([x, z]): Item => ({ at: [x, 3.3, z], rot: 0 }));
// dashes down the middle of Canwick Road, clear of the junctions
const DASHES = Array.from({ length: Math.floor((CANWICK.z1 - CANWICK.z0) / 4) }, (_, i) => CANWICK.z0 + 2 + i * 4).filter((z) => SIDE_STREETS.every((st) => Math.abs(z - st.z) > SIDE.pave + 1));

function Flat({ w, d, color, x, z, y }: { w: number; d: number; color: number; x: number; z: number; y: number }) {
  return <mesh geometry={geo.box(w, 0.04, d)} material={toon(color)} position={[x, y, z]} receiveShadow />;
}

// A street name on a post at a corner, readable from both sides.
function NameSign({ text, font, x, z, rot }: { text: string; font: string; x: number; z: number; rot: number }) {
  const map = useSign(text, "#2b2633", font);
  return (
    <group position={[x, 0, z]} rotation-y={rot}>
      <mesh geometry={geo.box(0.1, 2, 0.1)} material={toon(POLE)} position-y={1} />
      <Sign map={map} w={2.6} h={0.55} position={[0, 2.2, 0.03]} />
      <Sign map={map} w={2.6} h={0.55} position={[0, 2.2, -0.03]} rotation-y={Math.PI} />
    </group>
  );
}

export default function SincilStreets({ font }: { font: string }) {
  const roof = useRoof(D + 0.5, 1.5, W + 0.12);
  const P = PARTS;
  const sideLen = useMemo(() => SIDE_STREETS.map((st) => st.x1 - st.x0), []);
  return (
    <group raycast={() => null}>
      {/* the side streets east off the south road, then Sincil Bank and Canwick Road */}
      {SIDE_STREETS.map((st, i) => (
        <group key={st.name}>
          <Flat w={sideLen[i]} d={SIDE.pave * 2} color={PAVE} x={(st.x0 + st.x1) / 2} z={st.z} y={0.012} />
          <Flat w={sideLen[i]} d={SIDE.half * 2} color={ROAD} x={(st.x0 + st.x1) / 2} z={st.z} y={0.022} />
        </group>
      ))}
      <Flat w={SIDE.pave * 2} d={SINCIL.z1 - SINCIL.z0} color={PAVE} x={SINCIL.x} z={(SINCIL.z0 + SINCIL.z1) / 2} y={0.014} />
      <Flat w={SIDE.half * 2} d={SINCIL.z1 - SINCIL.z0 - 1} color={ROAD} x={SINCIL.x} z={(SINCIL.z0 + SINCIL.z1) / 2} y={0.024} />
      <Flat w={CANWICK.pave * 2} d={CANWICK.z1 - CANWICK.z0} color={PAVE} x={CANWICK.x} z={(CANWICK.z0 + CANWICK.z1) / 2} y={0.016} />
      <Flat w={CANWICK.half * 2} d={CANWICK.z1 - CANWICK.z0} color={ROAD} x={CANWICK.x} z={(CANWICK.z0 + CANWICK.z1) / 2} y={0.026} />
      {DASHES.map((z) => (
        <Flat key={z} w={0.25} d={1.8} color={0xffd23f} x={CANWICK.x} z={z} y={0.05} />
      ))}

      {/* the terraced houses */}
      {P.bodies.map((list, i) => (
        <Instances key={i} geometry={geo.box(W, H, D)} color={BRICKS[i]} list={list} outline={0.07} />
      ))}
      <Instances geometry={roof} color={SLATE} list={P.roofs} outline={0.05} />
      <Instances geometry={geo.box(0.5, 1, 0.6)} color={0x8f3f2c} list={P.chimneys} outline={0.04} />
      {P.doors.map((list, i) => (
        <Instances key={i} geometry={geo.box(0.85, 1.8, 0.1)} color={DOORS[i]} list={list} outline={0.03} />
      ))}
      <Instances geometry={geo.box(1.4, 1.2, 0.1)} color={WINDOW} list={P.big} outline={0.03} />
      <Instances geometry={geo.box(0.9, 0.9, 0.1)} color={WINDOW} list={P.small} outline={0.03} />
      <Instances geometry={geo.box(1.6, 0.12, 0.2)} color={0xe8dcc2} list={P.sills} />

      {/* street lamps */}
      <Instances geometry={geo.cyl(0.1, 0.12, 3.2, 8)} color={POLE} list={POLES} outline={0.04} />
      <Instances geometry={geo.sphere(0.3)} color={LAMP} list={BULBS} outline={0.05} />

      {/* the names, at each end of each street, facing the road they're seen from */}
      {SIDE_STREETS.flatMap((st) => [
        <NameSign key={`${st.name}w`} text={st.name} font={font} x={5.6} z={st.z - SIDE.pave - 0.3} rot={-Math.PI / 2} />,
        <NameSign key={`${st.name}e`} text={st.name} font={font} x={CANWICK.x - CANWICK.pave - 0.3} z={st.z + SIDE.pave + 0.3} rot={Math.PI / 2} />,
      ])}
      <NameSign text="Sincil Bank" font={font} x={SINCIL.x - SIDE.pave - 0.3} z={SIDE_STREETS[0].z + SIDE.pave + 1.2} rot={0} />
      <NameSign text="Canwick Road" font={font} x={CANWICK.x + CANWICK.pave + 0.3} z={CANWICK.z0 + 4} rot={0} />
    </group>
  );
}
