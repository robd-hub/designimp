"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { RIVER } from "./colliders";
import { Boat } from "./Landmarks";

// Narrowboats on the Witham. The first sets off from the mouth of Brayford Pool, goes east through the Glory Hole under
// High Bridge, on past Waterside and under the footbridge below the Greestone Stairs, turns round short of Broadgate's
// bridge and comes all the way back. It keeps to the north half of the river, clear of the boats moored along the
// south bank. The river can't really run under the street (it's flat), so the boat goes into the dark arch on one side
// of the bridge and comes out of the other after a pause. A second boat plies the south half east of High Bridge, past
// Waterside, so there's usually one going by the shopping centre.
type Pt = [number, number];
const NORTH = RIVER.z - (RIVER.half - 0.75),
  SOUTH = RIVER.z + (RIVER.half - 0.75);
const TURN_EAST = 77; // short of Broadgate's bridge
const SPEED = 1.5; // units a second
const BOATS: { path: Pt[]; color: number; cabin: number; len: number; still: Pt }[] = [
  // in the pool's south-east corner, clear of the moored boats and the tour boat's loop, then out into the river
  { path: [[-41, -31.6], [-35, NORTH], [TURN_EAST, NORTH]], color: 0x7a2b3e, cabin: 0xf2e2c4, len: 4.4, still: [-18.5, NORTH] },
  // from just east of the boat moored below High Bridge
  { path: [[14.5, SOUTH], [TURN_EAST, SOUTH]], color: 0x2f6b5a, cabin: 0xf2d06b, len: 4, still: [30, SOUTH] },
];

// How much of the boat shows at x: all of it clear of High Bridge, shrinking away as it goes in under it. The arch
// under the bridge's shops runs from x -10.6 to -5.1 and then the street, with the open water starting again at 4.3.
const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const shown = (x: number) => 1 - smooth(-7.4, -6.4, x) * (1 - smooth(5.8, 7, x));

// The point a distance s along a path (clamped to its ends), and the path's total length.
function along(path: Pt[], cum: number[], s: number): Pt {
  s = Math.min(cum[cum.length - 1], Math.max(0, s));
  let i = 1;
  while (i < cum.length - 1 && cum[i] < s) i++;
  const k = (s - cum[i - 1]) / (cum[i] - cum[i - 1] || 1);
  return [path[i - 1][0] + (path[i][0] - path[i - 1][0]) * k, path[i - 1][1] + (path[i][1] - path[i - 1][1]) * k];
}

function RiverBoat({ path, color, cabin, len, still, delay, reduce }: (typeof BOATS)[number] & { delay: number; reduce: boolean }) {
  const g = useRef<THREE.Group>(null!);
  const cum = useMemo(() => path.reduce<number[]>((c, p, i) => [...c, i ? c[i - 1] + Math.hypot(p[0] - path[i - 1][0], p[1] - path[i - 1][1]) : 0], []), [path]);
  useFrame(({ clock }) => {
    if (reduce) return;
    const c = cum,
      L = c[c.length - 1];
    const period = (2 * L) / SPEED;
    const a = ((clock.elapsedTime + delay * period) / period) * Math.PI * 2;
    const s = (L * (1 - Math.cos(a))) / 2; // there and back, easing in and out at each end
    const [x, z] = along(path, c, s);
    // heading along the path (looked at a little either side so it turns smoothly at a bend), flipping round at the
    // ends as it sets off back
    const [ax, az] = along(path, c, s - 1),
      [bx, bz] = along(path, c, s + 1);
    const ahead = Math.atan2(bx - ax, bz - az);
    const sh = shown(x);
    g.current.position.set(x, 0.15, z);
    g.current.rotation.y = ahead + (Math.PI / 2) * (1 - Math.tanh(6 * Math.sin(a)));
    g.current.scale.setScalar(Math.max(0.001, sh));
    g.current.visible = sh > 0.01;
  });
  return (
    <group ref={g} position={[still[0], 0.15, still[1]]} rotation-y={Math.PI / 2}>
      <Boat color={color} cabin={cabin} len={len} position={[0, 0, 0]} />
    </group>
  );
}

export function GloryBoat({ reduce }: { reduce: boolean }) {
  return (
    <>
      {BOATS.map((b, i) => (
        <RiverBoat key={i} {...b} delay={i * 0.5} reduce={reduce} />
      ))}
    </>
  );
}
