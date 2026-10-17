import { PLACES, footprint } from "./places";

export const BOUND = 76;

// Small seeded random so the town is laid out the same on every visit.
export function seeded(seed: number) {
  return () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
}

const boxes = PLACES.map((p) => {
  const f = footprint(p);
  if (p.kind === "lot") {
    // only the signboard at the back of the plot is solid
    const zs = p.z - p.d / 2 + 1;
    return { x0: p.x - 1.6, x1: p.x + 1.6, z0: zs - 0.6, z1: zs + 0.6 };
  }
  return { x0: f.x0 - 0.4, x1: f.x1 + 0.4, z0: f.z0 - 0.4, z1: f.z1 + 0.4 };
});

const onRoad = (x: number, z: number) => Math.abs(x) < 7 || (Math.abs(z) < 7 && Math.abs(x) < BOUND);
const nearBuilding = (x: number, z: number, pad: number) =>
  PLACES.some((p) => {
    const f = footprint(p);
    return x > f.x0 - pad && x < f.x1 + pad && z > f.z0 - pad && z < f.z1 + pad + (p.kind === "lot" ? 0 : 4);
  });

// Trees scattered everywhere that isn't road, building or doorway.
export const TREES: [number, number, number][] = (() => {
  const rand = seeded(11);
  const out: [number, number, number][] = [];
  for (let tries = 0; out.length < 70 && tries < 3000; tries++) {
    const x = (rand() * 2 - 1) * (BOUND - 3),
      z = (rand() * 2 - 1) * (BOUND - 3);
    if (onRoad(x, z) || nearBuilding(x, z, 3) || Math.hypot(x, z) < 10) continue;
    if (out.some(([ox, oz]) => Math.hypot(ox - x, oz - z) < 5)) continue;
    out.push([x, z, 0.85 + (out.length % 4) * 0.12]);
  }
  return out;
})();

const circles = TREES.map(([cx, cz, s]) => ({ cx, cz, r: 0.7 * s + 0.5 }));

export function blocked(x: number, z: number) {
  if (Math.abs(x) > BOUND || Math.abs(z) > BOUND) return true;
  if (Math.hypot(x, z) < 4.3) return true; // fountain
  for (const c of circles) if (Math.hypot(x - c.cx, z - c.cz) < c.r) return true;
  for (const b of boxes) if (x > b.x0 && x < b.x1 && z > b.z0 && z < b.z1) return true;
  return false;
}
