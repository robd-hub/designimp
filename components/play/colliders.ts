import { PLACES } from "./places";

export const TREES: [number, number][] = [
  [-24, -4], [-22, -17], [-7, -16], [7, -16], [22, -17], [25, -4], [-25, 5], [-23, 18],
  [-6, 17], [6, 17], [23, 18], [26, 5], [-31, -26], [31, -27], [-10, -30], [10, -30],
  [-30, 27], [30, 28], [-34, 0], [34, -1], [-8, 30], [9, 31], [-18, -29], [18, -30],
];
export const treeScale = (i: number) => 0.85 + (i % 4) * 0.12;

const boxes = PLACES.map((p) => {
  // rot is 0 or PI, so the footprint stays axis-aligned
  return { x0: p.x - p.w / 2 - 0.4, x1: p.x + p.w / 2 + 0.4, z0: p.z - p.d / 2 - 0.4, z1: p.z + p.d / 2 + 0.4 };
});
const circles = TREES.map(([cx, cz], i) => ({ cx, cz, r: 0.7 * treeScale(i) + 0.5 }));

export function blocked(x: number, z: number) {
  if (Math.abs(x) > 40 || Math.abs(z) > 40) return true;
  if (Math.hypot(x, z) < 3.2) return true; // fountain
  for (const c of circles) if (Math.hypot(x - c.cx, z - c.cz) < c.r) return true;
  for (const b of boxes) if (x > b.x0 && x < b.x1 && z > b.z0 && z < b.z1) return true;
  return false;
}
