import { PLACES, footprint } from "./places";

export const BOUND = 76; // east, west and south edges of the map
export const NORTH = -138; // the map runs further north, up the hill to the cathedral and castle

// Small seeded random so the town is laid out the same on every visit.
export function seeded(seed: number) {
  return () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
}

export const STREET_ROW = 3.6; // depth of the house rows either side of Steep Hill
export const STREET_HOUSES = 7;
export const STREET_GAP = 4; // house left out on both sides: a little square halfway up the hill

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

// RAF Scampton in its own coordinates (front faces the road, so +x is north): a runway along
// the north edge, the hangar in the middle with its doors onto the apron, and a drive to the gate.
export const AIRFIELD = {
  runway: { x0: 8.5, x1: 13.5, z0: -14, z1: 14 },
  taxiway: { x0: 7, x1: 8.5, z0: 3, z1: 5.4 },
  apron: { x0: -5, x1: 7, z0: -5, z1: 9 },
  drive: { x0: -3, x1: 3, z0: 9, z1: 15 },
  hangar: { x0: -4, x1: 6, z0: -14, z1: -5 },
  parked: { x0: 1.1, x1: 6.7, z0: -3.6, z1: 1.6 },
};
// A rect in a place's own coordinates, turned and moved into world coordinates.
export function toWorld(p: { x: number; z: number; rot: number }, r: { x0: number; x1: number; z0: number; z1: number }) {
  const c = Math.round(Math.cos(p.rot)),
    s = Math.round(Math.sin(p.rot));
  const xs = [r.x0 * c + r.z0 * s, r.x1 * c + r.z1 * s],
    zs = [-r.x0 * s + r.z0 * c, -r.x1 * s + r.z1 * c];
  return { x0: p.x + Math.min(...xs), x1: p.x + Math.max(...xs), z0: p.z + Math.min(...zs), z1: p.z + Math.max(...zs) };
}

// The road west off the south road to RAF Scampton, opposite the one to Sincil Bank.
const airfield = footprint(PLACES.find((p) => p.kind === "airfield")!);
export const AIRFIELD_ROAD = { z: (airfield.z0 + airfield.z1) / 2, x0: airfield.x1, x1: 0 };

// Footpaths in world coordinates: one runs north from the main road past the university and
// the Brayford's east quay, climbs the hill, then turns east to the castle gate.
const castle = footprint(PLACES.find((p) => p.kind === "castle")!);
const PATH_X = -29;
export const FOOTPATHS = [
  { x0: PATH_X - 1, x1: PATH_X + 1, z0: castle.z1 + 2, z1: -4.3 },
  { x0: PATH_X - 1, x1: (castle.x0 + castle.x1) / 2 + 3, z0: castle.z1 + 2, z1: castle.z1 + 4 },
];
// The walk along them, from the main road to the castle gate.
export const FOOTPATH_ROUTE: [number, number][] = [
  [PATH_X, -5],
  [PATH_X, castle.z1 + 3],
  [(castle.x0 + castle.x1) / 2, castle.z1 + 3],
];

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
  if (p.kind === "airfield") {
    // the runway and apron are walkable; only the hangar and the parked jet are solid
    return [AIRFIELD.hangar, AIRFIELD.parked].map((b) => toWorld(p, b));
  }
  return [{ x0: f.x0 - 0.4, x1: f.x1 + 0.4, z0: f.z0 - 0.4, z1: f.z1 + 0.4 }];
});

// The cathedral close at the top of Steep Hill, between the cathedral and the castle.
const hill = footprint(PLACES.find((p) => p.kind === "street")!);
export const CLOSE = { x0: -13, x1: 13, z0: hill.z0 - 5, z1: hill.z0 + 3 };

const onRoad = (x: number, z: number) =>
  Math.abs(x) < 7 ||
  (Math.abs(z) < 7 && Math.abs(x) < BOUND) ||
  (Math.abs(z - STADIUM_ROAD.z) < 7 && x < STADIUM_ROAD.x1) ||
  (Math.abs(z - AIRFIELD_ROAD.z) < 7 && x > AIRFIELD_ROAD.x0) ||
  [CLOSE, ...FOOTPATHS].some((f) => x > f.x0 - 2 && x < f.x1 + 2 && z > f.z0 - 2 && z < f.z1 + 2);
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
  for (let tries = 0; out.length < 95 && tries < 4000; tries++) {
    const x = (rand() * 2 - 1) * (BOUND - 3),
      z = NORTH + 3 + rand() * (BOUND - NORTH - 6);
    if (onRoad(x, z) || nearBuilding(x, z, 3) || Math.hypot(x, z) < 10) continue;
    if (out.some(([ox, oz]) => Math.hypot(ox - x, oz - z) < 5)) continue;
    out.push([x, z, 0.85 + (out.length % 4) * 0.12]);
  }
  return out;
})();

const circles = TREES.map(([cx, cz, s]) => ({ cx, cz, r: 0.7 * s + 0.5 }));

export function blocked(x: number, z: number) {
  if (Math.abs(x) > BOUND || z > BOUND || z < NORTH) return true;
  if (Math.hypot(x, z) < 4.3) return true; // fountain
  for (const c of circles) if (Math.hypot(x - c.cx, z - c.cz) < c.r) return true;
  for (const b of boxes) if (x > b.x0 && x < b.x1 && z > b.z0 && z < b.z1) return true;
  return false;
}
