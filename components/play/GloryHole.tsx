"use client";

import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { RIVER } from "./colliders";
import { Boat } from "./Landmarks";

// A narrowboat on the Witham, going to and fro along the river and in and out of the Glory Hole under High Bridge. The
// river can't really run under the street (it's flat), so the boat goes into the dark arch on one side of the bridge and
// comes out of the other after a pause. It keeps to the north half of the river, away from the moored boats.
const X_WEST = -23.5; // turns round short of the castle footpath's footbridge
const X_EAST = 42; // and short of the footbridge on the path down from the Greestone Stairs
const CENTRE = (X_WEST + X_EAST) / 2,
  SWING = (X_EAST - X_WEST) / 2;
const PERIOD = 150; // seconds for there and back
// How much of the boat shows at x: all of it clear of the bridge, shrinking away as it goes in under it. The arch under the
// bridge's shops runs from x -10.6 to -5.1 and then the street, with the open water starting again at 4.3.
const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const shown = (x: number) => 1 - smooth(-7.4, -6.4, x) * (1 - smooth(5.8, 7, x));

export function GloryBoat({ reduce }: { reduce: boolean }) {
  const g = useRef<THREE.Group>(null!);
  useFrame(({ clock }) => {
    if (reduce) return;
    const a = (clock.elapsedTime / PERIOD) * Math.PI * 2;
    const x = CENTRE - SWING * Math.cos(a);
    const s = shown(x);
    g.current.position.x = x;
    g.current.rotation.y = (Math.PI / 2) * Math.tanh(6 * Math.sin(a)); // east on the way out, west on the way back, swinging round at each end
    g.current.scale.setScalar(Math.max(0.001, s));
    g.current.visible = s > 0.01;
  });
  return (
    <group ref={g} position={[reduce ? -18.5 : X_WEST, 0.15, RIVER.z - (RIVER.half - 0.75)]} rotation-y={Math.PI / 2}>
      <Boat color={0x7a2b3e} cabin={0xf2e2c4} len={4.4} position={[0, 0, 0]} />
    </group>
  );
}
