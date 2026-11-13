import { useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { soundFrame } from "./sound";

// Keeps the town's sounds following the Imp and the camera. Does nothing while sound is off.
export default function Soundscape() {
  const dir = useMemo(() => new THREE.Vector3(), []);
  useFrame(({ camera }, delta) => soundFrame(camera, Math.min(delta, 0.1), dir));
  return null;
}
