import { PLACES, footprint } from "./places";

export const BOUND = 76;

// Small seeded random so the town is laid out the same on every visit.
export function seeded(seed: number) {
  return () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
}

export const STREET_ROW = 3.6; // depth of the house rows either side of Steep Hill
export const STREET_HOUSES = 7;
export const STREET_GAP = 4; // house left out on both sides: a little square by the Post Office and Town Hall

// Steep Hill's houses, bottom of the hill first, in the street's own coordinates.
export function streetHouses(p: { w: number; d: number }) {
  const len = p.d / STREET_HOUSES;
  return [-1, 1].flatMap((side) =>
    Array.from({ length: STREET_HOUSES }, (_, i) => ({ side, i, len, x: side * (p.w / 2 - STREET_ROW / 2), z: p.d / 2 - len / 2 - i * len })).filter(
      (h) => h.i !== STREET_GAP,
    ),
  );
}

// Brayford in its own coordinates: the pool, the Fossdyke running off west to the edge of
// the map, and the row of waterfront buildings along the far quay.
export const BRAYFORD = {
  water: { x0: -12, x1: 12, z0: -7, z1: 5 },
  canal: { x0: -30, x1: -12, z0: -2.5, z1: 0.5 },
  front: { x0: -16, x1: 16, z0: -11, z1: -8 },
};

// The road off the south road to Sincil Bank, east of the high street as in real Lincoln.
// It runs from the main road's centre line to the stadium's west-facing entrance.
const stadium = footprint(PLACES.find((p) => p.kind === "stadium")!);
export const STADIUM_ROAD = { z: (stadium.z0 + stadium.z1) / 2, x0: 0, x1: stadium.x0 };

const boxes = PLACES.filter((p) => p.kind !== "tank").flatMap((p) => {
  const f = footprint(p);
  if (p.kind === "lot") {
    // only the signboard at the back of the plot is solid
    const zs = p.z + Math.cos(p.rot) * (-p.d / 2 + 1);
    return [{ x0: p.x - 1.6, x1: p.x + 1.6, z0: zs - 0.6, z1: zs + 0.6 }];
  }
  if (p.kind === "street") {
    // two rows of houses with a walkable lane between them
    return streetHouses(p).map((h) => ({
      x0: p.x + h.x - STREET_ROW / 2,
      x1: p.x + h.x + STREET_ROW / 2,
      z0: p.z + h.z - h.len / 2,
      z1: p.z + h.z + h.len / 2,
    }));
  }
  if (p.kind === "water") {
    return Object.values(BRAYFORD).map((b) => ({ x0: p.x + b.x0, x1: p.x + b.x1, z0: p.z + b.z0, z1: p.z + b.z1 }));
  }
  return [{ x0: f.x0 - 0.4, x1: f.x1 + 0.4, z0: f.z0 - 0.4, z1: f.z1 + 0.4 }];
});

const onRoad = (x: number, z: number) =>
  Math.abs(x) < 7 || (Math.abs(z) < 7 && Math.abs(x) < BOUND) || (Math.abs(z - STADIUM_ROAD.z) < 7 && x < STADIUM_ROAD.x1);
const nearBuilding = (x: number, z: number, pad: number) =>
  PLACES.some((p) => {
    const f = footprint(p);
    const door = p.kind === "lot" ? 0 : 4; // keep the approach to each entrance clear
    const side = Math.abs(Math.sin(p.rot)) > 0.5; // entrance on an east or west face
    const dx = side ? door : 0,
      dz = side ? 0 : door;
    return x > f.x0 - pad - dx && x < f.x1 + pad + dx && z > f.z0 - pad - dz && z < f.z1 + pad + dz;
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
