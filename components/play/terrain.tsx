import { useEffect, useMemo } from "react";
import * as THREE from "three";
import type { ThreeElements } from "@react-three/fiber";
import { PLACES, footprint } from "./places";
import { toon } from "./toon";

// Uphill Lincoln: the ground climbs Steep Hill to the cathedral and castle on the hilltop,
// while the high street, the Brayford and everything south of them stay down by the river.
// The slope stretches right across the map from east to west, so height only depends on z.
const hill = footprint(PLACES.find((p) => p.kind === "street")!);
export const RISE = { z0: hill.z1 + 2, z1: hill.z0 - 2, h: 9 }; // from the foot of the hill (south) to the top (north)

const along = (z: number) => Math.min(1, Math.max(0, (RISE.z0 - z) / (RISE.z0 - RISE.z1)));

export function groundY(z: number) {
  const t = along(z);
  return RISE.h * t * t * (3 - 2 * t);
}

// Rotation about x that lays something flat on the slope at z.
export function groundTilt(z: number) {
  const t = along(z);
  const dydz = t > 0 && t < 1 ? (-RISE.h * 6 * t * (1 - t)) / (RISE.z0 - RISE.z1) : 0;
  return -Math.atan(dydz);
}

// A flat rectangle that follows the ground. wz is the world z of the parent's origin, for strips
// drawn inside a place that has already been lifted to the ground at its own z.
export function Strip({
  w,
  d,
  color,
  x = 0,
  z = 0,
  y = 0,
  wz = 0,
  ...mesh
}: { w: number; d: number; color: number; x?: number; z?: number; y?: number; wz?: number } & Omit<ThreeElements["mesh"], "geometry" | "material">) {
  const geometry = useMemo(() => {
    const g = new THREE.PlaneGeometry(w, d, 1, Math.max(1, Math.ceil(d / 1.5))).rotateX(-Math.PI / 2);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) p.setY(i, groundY(wz + z + p.getZ(i)) - groundY(wz) + y);
    g.computeVertexNormals();
    return g;
  }, [w, d, z, y, wz]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return <mesh geometry={geometry} material={toon(color)} position={[x, 0, z]} receiveShadow {...mesh} />;
}
