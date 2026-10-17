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

export const WINDOW = 0xbff0ff;
export const LAMP = 0xfff1a8;
export const STONE = 0xd9cbb0;
export const STONE_DARK = 0xc4b393;

// At night windows and lamps glow and the cathedral is floodlit gold.
const GLOW: [number, number, number][] = [
  [WINDOW, 0xffc96b, 0.85],
  [LAMP, 0xffe08a, 1],
  [STONE, 0xffb347, 0.75],
  [STONE_DARK, 0xffa52e, 0.7],
];
export function setNightGlow(on: boolean) {
  for (const [c, e, i] of GLOW) {
    const m = toon(c);
    m.emissive.setHex(e);
    m.emissiveIntensity = on ? i : 0;
  }
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
  // the lower half of a ring, for smiles
  smile: (r: number, t: number) => cached(`m${r},${t}`, () => new THREE.TorusGeometry(r, t, 6, 16, Math.PI).rotateZ(Math.PI)),
  cone: (r: number, h: number, s = 12) => cached(`k${r},${h},${s}`, () => new THREE.ConeGeometry(r, h, s)),
  // side profile of a WW1 rhomboid tank's track frame, extruded to track width
  tankSide: () =>
    cached("tank", () => {
      const pts = [[-2.6, 0.7], [-2, 0], [1.6, 0], [2.6, 1.1], [2.5, 1.9], [2, 2], [-2.1, 2], [-2.6, 1.4]];
      const shape = new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x, y)));
      return new THREE.ExtrudeGeometry(shape, { depth: 0.6, bevelEnabled: false }).center();
    }),
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

// Each line of text (split on \n) gets its own row on the sign.
export function signTexture(text: string, fg: string, font: string) {
  const lines = text.split("\n");
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 32 + 96 * lines.length;
  const x = c.getContext("2d")!;
  x.fillStyle = "#fff8e7";
  x.fillRect(0, 0, c.width, c.height);
  x.lineWidth = 10;
  x.strokeStyle = "#1a1320";
  x.strokeRect(5, 5, c.width - 10, c.height - 10);
  let px = 64;
  do x.font = `${px}px ${font}`;
  while (Math.max(...lines.map((l) => x.measureText(l).width)) > 420 && --px > 30);
  x.textAlign = "center";
  x.textBaseline = "middle";
  x.lineWidth = 8;
  x.fillStyle = fg;
  lines.forEach((l, i) => {
    const y = 68 + i * 96;
    x.strokeText(l, 256, y);
    x.fillText(l, 256, y);
  });
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}
