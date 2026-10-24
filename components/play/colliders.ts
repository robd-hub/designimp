import { PLACES, footprint } from "./places";

export const BOUND = 76; // the west edge of the map
export const EAST = 100; // the east edge, further out to make room for the cathedral's long east end
export const MID_X = (EAST - BOUND) / 2; // the map's centre line, east to west
export const SOUTH = 168; // the south road runs a long way down, past rows of shops and houses to Sincil Bank and RAF Scampton
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

// The houses lining the south road between the railway and the side roads to Sincil Bank and
// RAF Scampton, in short terraces either side with to-let plots between them. Each faces the road.
export const HOUSE = { w: 5, d: 5, h: 3.4 };
export const HOUSE_X = 12.5;
export const HOUSES = [-1, 1].flatMap((side) =>
  [58, 64, 70, 76, 98, 104, 110, 116].map((z, i) => ({ x: side * HOUSE_X, z, side, i })),
);

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
// the Brayford's east quay, then climbs the hill alongside the castle wall to its gate on Castle Square.
const castlePlace = PLACES.find((p) => p.kind === "castle")!;
const castle = footprint(castlePlace);
const PATH_X = castle.x1 + 1;
// Another runs right round the cathedral, crossing its west front where it meets Castle Square.
const cathedral = footprint(PLACES.find((p) => p.kind === "cathedral")!);
const PRECINCT = { x0: cathedral.x0 - 3, x1: cathedral.x1 + 3, z0: cathedral.z0 - 3, z1: cathedral.z1 + 3, w: 2.4 };
const P = PRECINCT;
export const FOOTPATHS = [
  { x0: PATH_X - 1, x1: PATH_X + 1, z0: castlePlace.z - 1, z1: -4.3 },
  { x0: P.x0, x1: P.x1, z0: P.z0, z1: P.z0 + P.w },
  { x0: P.x0, x1: P.x1, z0: P.z1 - P.w, z1: P.z1 },
  { x0: P.x0, x1: P.x0 + P.w, z0: P.z0 + P.w, z1: P.z1 - P.w },
  { x0: P.x1 - P.w, x1: P.x1, z0: P.z0 + P.w, z1: P.z1 - P.w },
];
// The walk along it, from the main road to the castle gate.
export const FOOTPATH_ROUTE: [number, number][] = [
  [PATH_X, -5],
  [PATH_X, castlePlace.z],
];

// Castle Square: a pedestrianised square at the top of Steep Hill, from the castle gate
// across to the cathedral, with a row of farmers' market stalls along its north side, either side of the way into Bailgate.
const hill = footprint(PLACES.find((p) => p.kind === "street")!);
export const CLOSE = { x0: castle.x1 - 1, x1: cathedral.x0 + 1, z0: hill.z0 - 12, z1: hill.z0 + 3 };
// Bailgate, pedestrianised too, running north from the square between the castle and the cathedral.
export const BAILGATE = { x0: -4.3, x1: 4.3, z0: NORTH + 3, z1: CLOSE.z0 + 0.5 };
export const STALL = { w: 4, d: 2.4 };
export const STALLS = [-16, -10, 10, 16].map((x) => ({ x, z: CLOSE.z0 + 2.5 }));

// The Stonebow: the old city gate with the Guildhall above it, spanning the pedestrianised
// High Street just north of the Post and the Town Hall, partway up to Steep Hill. Only its two piers are solid.
const gate = PLACES.find((p) => p.kind === "gate")!;
// It's modelled 16 wide and scaled down to the place's width, so it sits in proportion with the shops.
export const STONEBOW = { z: gate.z, scale: gate.w / 16, open: (3.5 * gate.w) / 16, half: gate.w / 2, d: gate.d };
const STONEBOW_PIERS = [-1, 1].map((s) => ({
  x0: s < 0 ? -STONEBOW.half : STONEBOW.open,
  x1: s < 0 ? -STONEBOW.open : STONEBOW.half,
  z0: STONEBOW.z - STONEBOW.d / 2,
  z1: STONEBOW.z + STONEBOW.d / 2,
}));

// The railway: two tracks running east to west across the town, south of the Workshop and HQ,
// fenced off on both sides. It crosses the main road at a level crossing, as the real line crosses
// Lincoln's High Street. gap is each track's offset from the centre line, fence the fences' offset,
// and crossing the half-width of the gap left in the fences for the road and its pavements.
export const RAIL = { z: 18.5, gap: 1.6, fence: 3.6, crossing: 4.6 };
// Set every frame by the railway while the barriers are down.
export const CROSSING = { closed: false };
export const atBarrier = (x: number, z: number) => CROSSING.closed && Math.abs(x) < RAIL.crossing && Math.abs(z - RAIL.z) < RAIL.fence + 0.4;
// Lincoln Central, just east of the crossing as in real Lincoln: the station building on the main road,
// a platform along each track and a covered footbridge between them at the east end. edge is the
// platform edges' offset from the line's centre, and the fences are left out alongside the platforms.
const stationPlace = PLACES.find((p) => p.kind === "station")!;
const PLATFORM = { edge: RAIL.gap + 1.3, depth: 2.6 };
export const STATION = {
  x: stationPlace.x,
  x0: stationPlace.x - 10,
  x1: stationPlace.x + 10,
  platforms: [-1, 1].map((s) => {
    const a = RAIL.z + s * PLATFORM.edge,
      b = a + s * PLATFORM.depth;
    return { side: s, z0: Math.min(a, b), z1: Math.max(a, b), edge: a };
  }),
  bridge: { x0: stationPlace.x + 8, x1: stationPlace.x + 10 }, // the stair towers stand on the platforms' east ends
};
// Runs of fence along each side of the line, west to east.
export const RAIL_FENCE_RUNS: [number, number][] = [
  [-BOUND, -RAIL.crossing],
  [RAIL.crossing, STATION.x0],
  [STATION.x1, EAST],
];
const RAIL_FENCES = RAIL_FENCE_RUNS.flatMap(([x0, x1]) =>
  [-1, 1].map((sz) => ({ x0, x1, z0: RAIL.z + sz * RAIL.fence - 0.3, z1: RAIL.z + sz * RAIL.fence + 0.3 })),
);
// Nobody steps off the platform edges onto the line, and the footbridge's stair towers are solid.
const STATION_BOXES = STATION.platforms.flatMap((p) => [
  { x0: STATION.x0 - 0.3, x1: STATION.x1 + 0.3, z0: p.edge - 0.35, z1: p.edge + 0.35 },
  { x0: STATION.bridge.x0, x1: STATION.bridge.x1, z0: p.z0, z1: p.z1 },
]);
// Which side of the railway z is on: -1 north, 1 south, 0 on the crossing itself.
const railSide = (z: number) => (z < RAIL.z - RAIL.fence ? -1 : z > RAIL.z + RAIL.fence ? 1 : 0);
// Waypoints for a walk from one side of the railway to the other: onto the main road, over the
// level crossing, and back off the road on the far side. Empty when the walk doesn't cross the line.
export function overRailway([fx, fz]: [number, number], [tx, tz]: [number, number]) {
  const a = railSide(fz),
    b = railSide(tz);
  const pts: [number, number][] = [];
  if (a === b) return pts;
  if (a && Math.abs(fx) > 7) pts.push([0, fz]);
  if (a) pts.push([0, RAIL.z + a * (RAIL.fence + 1)]);
  if (b) pts.push([0, RAIL.z + b * (RAIL.fence + 1)]);
  if (b && Math.abs(tx) > 7) pts.push([0, tz]);
  return pts;
}

// Two cannons guarding the castle gate, on the right as you face it (in the castle's own coordinates).
export const CANNONS = [4.8, 7.6].map((x) => ({ x, z: castlePlace.d / 2 + 2.6 }));

const boxes = PLACES.filter((p) => p.kind !== "tank" && p.kind !== "gate").flatMap((p) => {
  const f = footprint(p);
  if (p.kind === "lot") {
    // only the signboard at the back of the plot is solid
    const back = -p.d / 2 + 1,
      side = Math.abs(Math.sin(p.rot)) > 0.5;
    const xs = p.x + Math.sin(p.rot) * back,
      zs = p.z + Math.cos(p.rot) * back,
      [hx, hz] = side ? [0.6, 1.6] : [1.6, 0.6];
    return [{ x0: xs - hx, x1: xs + hx, z0: zs - hz, z1: zs + hz }];
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
  if (p.kind === "castle") {
    const walls = { x0: f.x0 - 0.4, x1: f.x1 + 0.4, z0: f.z0 - 0.4, z1: f.z1 + 0.4 };
    return [walls, ...CANNONS.map((c) => toWorld(p, { x0: c.x - 0.7, x1: c.x + 0.7, z0: c.z - 1.3, z1: c.z + 1.3 }))];
  }
  if (p.kind === "airfield") {
    // the runway and apron are walkable; only the hangar and the parked jet are solid
    return [AIRFIELD.hangar, AIRFIELD.parked].map((b) => toWorld(p, b));
  }
  return [{ x0: f.x0 - 0.4, x1: f.x1 + 0.4, z0: f.z0 - 0.4, z1: f.z1 + 0.4 }];
}).concat(HOUSES.map((h) => ({ x0: h.x - HOUSE.d / 2, x1: h.x + HOUSE.d / 2, z0: h.z - HOUSE.w / 2, z1: h.z + HOUSE.w / 2 })), STALLS.map((s) => ({ x0: s.x - STALL.w / 2, x1: s.x + STALL.w / 2, z0: s.z - STALL.d / 2, z1: s.z + STALL.d / 2 })), STONEBOW_PIERS, RAIL_FENCES, STATION_BOXES);

const onRoad = (x: number, z: number) =>
  Math.abs(x) < 7 ||
  (Math.abs(z) < 7 && x > -BOUND && x < EAST) ||
  (Math.abs(z - STADIUM_ROAD.z) < 7 && x < STADIUM_ROAD.x1) ||
  (Math.abs(z - AIRFIELD_ROAD.z) < 7 && x > AIRFIELD_ROAD.x0) ||
  Math.abs(z - RAIL.z) < RAIL.fence + 2 ||
  [CLOSE, BAILGATE, ...STONEBOW_PIERS, ...FOOTPATHS, ...STATION.platforms.map((pl) => ({ ...pl, x0: STATION.x0, x1: STATION.x1 }))].some((f) => x > f.x0 - 2 && x < f.x1 + 2 && z > f.z0 - 2 && z < f.z1 + 2);
const nearBuilding = (x: number, z: number, pad: number) =>
  HOUSES.some((h) => Math.abs(x - h.x) < HOUSE.d / 2 + pad && Math.abs(z - h.z) < HOUSE.w / 2 + pad) ||
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
  for (let tries = 0; out.length < 140 && tries < 6000; tries++) {
    const x = -BOUND + 3 + rand() * (BOUND + EAST - 6),
      z = NORTH + 3 + rand() * (SOUTH - NORTH - 6);
    if (onRoad(x, z) || nearBuilding(x, z, 3) || Math.hypot(x, z) < 10) continue;
    if (out.some(([ox, oz]) => Math.hypot(ox - x, oz - z) < 5)) continue;
    out.push([x, z, 0.85 + (out.length % 4) * 0.12]);
  }
  return out;
})();

const circles = TREES.map(([cx, cz, s]) => ({ cx, cz, r: 0.7 * s + 0.5 }));

// barrier: whether the level crossing counts as blocked while its barriers are down.
export function blocked(x: number, z: number, barrier = true) {
  if (barrier && atBarrier(x, z)) return true;
  if (x < -BOUND || x > EAST || z > SOUTH || z < NORTH) return true;
  if (Math.hypot(x, z) < 4.3) return true; // fountain
  for (const c of circles) if (Math.hypot(x - c.cx, z - c.cz) < c.r) return true;
  for (const b of boxes) if (x > b.x0 && x < b.x1 && z > b.z0 && z < b.z1) return true;
  return false;
}
