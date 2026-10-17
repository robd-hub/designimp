import { PLACES, footprint } from "./places";

export const BOUND = 76;

// Small seeded random so the town is laid out the same on every visit.
export function seeded(seed: number) {
  return () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
}

export const STREET_ROW = 3.6; // depth of the house rows either side of Steep Hill
export const POOL = { rx: 14, rz: 8.5 }; // Brayford Pool's water, inside its footprint

const boxes = PLACES.filter((p) => p.kind !== "tank" && p.kind !== "water").flatMap((p) => {
  const f = footprint(p);
  if (p.kind === "lot") {
    // only the signboard at the back of the plot is solid
    const zs = p.z + Math.cos(p.rot) * (-p.d / 2 + 1);
    return [{ x0: p.x - 1.6, x1: p.x + 1.6, z0: zs - 0.6, z1: zs + 0.6 }];
  }
  if (p.kind === "street") {
    // two rows of houses with a walkable lane between them
    return [
      { x0: f.x0, x1: f.x0 + STREET_ROW, z0: f.z0, z1: f.z1 },
      { x0: f.x1 - STREET_ROW, x1: f.x1, z0: f.z0, z1: f.z1 },
    ];
  }
  return [{ x0: f.x0 - 0.4, x1: f.x1 + 0.4, z0: f.z0 - 0.4, z1: f.z1 + 0.4 }];
});
const pools = PLACES.filter((p) => p.kind === "water");

const onRoad = (x: number, z: number) => Math.abs(x) < 7 || (Math.abs(z) < 7 && Math.abs(x) < BOUND);
const nearBuilding = (x: number, z: number, pad: number) =>
  PLACES.some((p) => {
    const f = footprint(p);
    const door = p.kind === "lot" ? 0 : 4; // keep the approach to each entrance clear
    return x > f.x0 - pad && x < f.x1 + pad && z > f.z0 - pad - door && z < f.z1 + pad + door;
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
  for (const w of pools) if (((x - w.x) / POOL.rx) ** 2 + ((z - w.z) / POOL.rz) ** 2 < 1) return true;
  return false;
}
