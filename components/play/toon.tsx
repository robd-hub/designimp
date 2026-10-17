import * as THREE from "three";
import type { ThreeElements } from "@react-three/fiber";

export const INK = 0x1a1320;

// 3-step toon ramp with nearest filtering, shared by every material.
const ramp = new THREE.DataTexture(new Uint8Array([110, 190, 255]), 3, 1, THREE.RedFormat);
ramp.minFilter = ramp.magFilter = THREE.NearestFilter;
ramp.needsUpdate = true;

const mats = new Map<number, THREE.MeshToonMaterial>();
export function toon(color: number) {
  let m = mats.get(color);
  if (!m) {
    m = new THREE.MeshToonMaterial({ color, gradientMap: ramp });
    mats.set(color, m);
  }
  return m;
}

export const outlineMat = new THREE.MeshBasicMaterial({ color: INK, side: THREE.BackSide });

const geos = new Map<string, THREE.BufferGeometry>();
function cached(key: string, make: () => THREE.BufferGeometry) {
  let g = geos.get(key);
  if (!g) {
    g = make();
    g.computeBoundingBox();
    geos.set(key, g);
  }
  return g;
}

export const geo = {
  box: (w: number, h: number, d: number) => cached(`b${w},${h},${d}`, () => new THREE.BoxGeometry(w, h, d)),
  sphere: (r: number, ws = 20, hs = 14) => cached(`s${r},${ws},${hs}`, () => new THREE.SphereGeometry(r, ws, hs)),
  dome: (r: number) => cached(`d${r}`, () => new THREE.SphereGeometry(r, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2)),
  cyl: (rt: number, rb: number, h: number, s = 16) =>
    cached(`c${rt},${rb},${h},${s}`, () => new THREE.CylinderGeometry(rt, rb, h, s)),
  cone: (r: number, h: number, s = 12) => cached(`k${r},${h},${s}`, () => new THREE.ConeGeometry(r, h, s)),
};

const size = new THREE.Vector3();

type PartProps = ThreeElements["group"] & {
  geometry: THREE.BufferGeometry;
  color: number;
  outline?: number;
  shadow?: boolean;
};

// A solid mesh plus an inverted-hull outline slightly larger than it.
export function Part({ geometry, color, outline = 0.07, shadow = true, children, ...group }: PartProps) {
  geometry.boundingBox!.getSize(size);
  const s = (n: number) => 1 + (2 * outline) / Math.max(n, 0.05);
  return (
    <group {...group}>
      {outline > 0 && (
        <mesh geometry={geometry} material={outlineMat} scale={[s(size.x), s(size.y), s(size.z)]} raycast={() => null} />
      )}
      <mesh geometry={geometry} material={toon(color)} castShadow={shadow} receiveShadow />
      {children}
    </group>
  );
}
