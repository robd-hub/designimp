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

// The old stone houses that stand in the rows on Steep Hill, in place of an ordinary house each.
const OLD_HOUSES = PLACES.filter((p) => p.kind === "oldhouse");

// Steep Hill's houses, bottom of the hill first, in the street's own coordinates.
export function streetHouses(p: { x: number; z: number; w: number; d: number }) {
  const len = p.d / STREET_HOUSES;
  return [-1, 1].flatMap((side) =>
    Array.from({ length: STREET_HOUSES }, (_, i) => ({ side, i, len, x: side * (p.w / 2 - STREET_ROW / 2), z: p.d / 2 - len / 2 - i * len })).filter(
      (h) => h.i !== STREET_GAP && !OLD_HOUSES.some((o) => Math.abs(o.x - p.x - h.x) < 0.5 && Math.abs(o.z - p.z - h.z) < 0.5),
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

// The paved High Street, from the main road to the foot of Steep Hill: half its width, as wide as the
// Stonebow, so the shopfronts either side and the gate's walkway arches all open onto it.
export const HIGH_ST = 7.6;

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
// And the Greestone Stairs, from the south side of the precinct down the hill between the Bishop's
// Old Palace and the Usher Gallery, turning along the gallery's front at the bottom.
const gallery = footprint(PLACES.find((p) => p.kind === "gallery")!);
export const GREESTONE = [
  { x0: gallery.x0 - 2.5, x1: gallery.x0 - 0.5, z0: P.z1 - 0.2, z1: gallery.z1 + 2.6 },
  { x0: gallery.x0 - 2.5, x1: gallery.x1, z0: gallery.z1 + 0.6, z1: gallery.z1 + 2.6 },
];
// From the foot of the stairs a path heads west along the gallery's front and turns south, down past the
// bus station's west end and over the Witham on a footbridge to the main road.
const EAST_PATH_X = gallery.x0 - 10;
export const EAST_FOOTPATH = [
  { x0: EAST_PATH_X - 1, x1: gallery.x0 - 2.5, z0: gallery.z1 + 0.6, z1: gallery.z1 + 2.6 },
  { x0: EAST_PATH_X - 1, x1: EAST_PATH_X + 1, z0: gallery.z1 + 2.6, z1: -4.3 },
];
export const FOOTPATHS = [
  { x0: PATH_X - 1, x1: PATH_X + 1, z0: castlePlace.z - 1, z1: -4.3 },
  { x0: P.x0, x1: P.x1, z0: P.z0, z1: P.z0 + P.w },
  { x0: P.x0, x1: P.x1, z0: P.z1 - P.w, z1: P.z1 },
  { x0: P.x0, x1: P.x0 + P.w, z0: P.z0 + P.w, z1: P.z1 - P.w },
  { x0: P.x1 - P.w, x1: P.x1, z0: P.z0 + P.w, z1: P.z1 - P.w },
  ...GREESTONE,
  ...EAST_FOOTPATH,
];
// The walk along it, from the main road to the castle gate.
export const FOOTPATH_ROUTE: [number, number][] = [
  [PATH_X, -5],
  [PATH_X, castlePlace.z],
];

// The River Witham, flowing east out of Brayford Pool, under High Bridge on the High Street just
// south of the Stonebow, and on across the town to the east edge of the map. bridges are where it can
// be crossed, west to east: the footbridge on the castle footpath, High Bridge, from the timber-framed
// shops on its west side across the street to the parapet on its east side, and the footbridge on the
// path down from the Greestone Stairs. foot marks the footbridges.
const brayford = PLACES.find((p) => p.kind === "water")!;
const highBridge = PLACES.find((p) => p.kind === "bridge")!;
export const RIVER = {
  z: highBridge.z,
  half: 1.5,
  x0: brayford.x + BRAYFORD.water.x1,
  x1: EAST,
  bridges: [
    { x: PATH_X, x0: PATH_X - 1.2, x1: PATH_X + 1.2, foot: true },
    { x: 0, x0: footprint(highBridge).x0, x1: 4.3, foot: false },
    { x: EAST_PATH_X, x0: EAST_PATH_X - 1.2, x1: EAST_PATH_X + 1.2, foot: true },
  ],
};
const RIVER_BANKS = [RIVER.x0, ...RIVER.bridges.flatMap((b) => [b.x0, b.x1]), RIVER.x1];
// The open water between the bridges, west to east.
export const RIVER_RUNS = Array.from({ length: RIVER_BANKS.length / 2 }, (_, i) => [RIVER_BANKS[2 * i], RIVER_BANKS[2 * i + 1]] as [number, number]);
const RIVER_BOXES = RIVER_RUNS.map(([x0, x1]) => ({ x0, x1, z0: RIVER.z - RIVER.half - 0.3, z1: RIVER.z + RIVER.half + 0.3 }));
// Which side of the river z is on: -1 north, 1 south, 0 on a bridge.
const riverSide = (z: number) => (z < RIVER.z - RIVER.half - 1 ? -1 : z > RIVER.z + RIVER.half + 1 ? 1 : 0);
// Waypoints for a walk from one side of the river to the other, over whichever bridge is the shorter way round.
export function overRiver([fx, fz]: [number, number], [tx, tz]: [number, number]) {
  const a = riverSide(fz),
    b = riverSide(tz);
  const pts: [number, number][] = [];
  if (a === b) return pts;
  const bridge = RIVER.bridges.reduce((m, br) => (Math.abs(fx - br.x) + Math.abs(tx - br.x) < Math.abs(fx - m.x) + Math.abs(tx - m.x) ? br : m));
  if (a) pts.push([bridge.x, RIVER.z + a * (RIVER.half + 1.5)]);
  if (b) pts.push([bridge.x, RIVER.z + b * (RIVER.half + 1.5)]);
  return pts;
}

// Newport Arch, the Roman north gate, over the top of Bailgate: a wide arch for the road and a little
// one for people on foot on its east side. open is the half-width of the road arch, and postern the
// little arch's span; only the stonework either side of them is solid.
const arch = PLACES.find((p) => p.kind === "arch")!;
export const NEWPORT = { z: arch.z, half: arch.w / 2, d: arch.d, open: 3.2, postern: [4.6, 6] as [number, number] };
const NEWPORT_PIERS = ([[-NEWPORT.half, -NEWPORT.open], [NEWPORT.open, NEWPORT.postern[0]], [NEWPORT.postern[1], NEWPORT.half]] as const).map(([x0, x1]) => ({
  x0: arch.x + x0,
  x1: arch.x + x1,
  z0: NEWPORT.z - NEWPORT.d / 2,
  z1: NEWPORT.z + NEWPORT.d / 2,
}));

// Castle Square: a pedestrianised square at the top of Steep Hill, from the castle gate
// across to the cathedral, with a row of farmers' market stalls along its north side, either side of the way into Bailgate.
const hill = footprint(PLACES.find((p) => p.kind === "street")!);
export const CLOSE = { x0: castle.x1 - 1, x1: cathedral.x0 + 1, z0: hill.z0 - 12, z1: hill.z0 + 3 };
// Bailgate, pedestrianised too, running north from the square between the castle and the cathedral.
export const BAILGATE = { x0: -4.3, x1: 4.3, z0: NORTH + 3, z1: CLOSE.z0 + 0.5 };
export const STALL = { w: 4, d: 2.4 };

// Cornhill: Lincoln's old market place, south of High Bridge on the east side of the High Street, between the
// river and the railway. The Corn Exchange stands along its north side, its front facing south onto the square.
// The square runs from the shops at its west end across to the footpath down from the Greestone Stairs; a way in
// runs south to the main road between WellSway and the plot opposite the station, and Sincil Street east to the
// bus station's kerb.
const exchange = footprint(PLACES.find((p) => p.kind === "exchange")!);
const busKerb = footprint(PLACES.find((p) => p.kind === "busstation")!).x0 - 1.5; // the west end of the kerb under the canopy
export const CORNHILL = [
  { x0: 19.8, x1: 46, z0: exchange.z0 + 0.3, z1: -15.8 },
  { x0: 19.8, x1: 30.4, z0: -15.8, z1: -4.3 },
  { x0: 46, x1: busKerb, z0: exchange.z1 + 0.4, z1: -15.8 },
];
export const inCornhill = (x: number, z: number) => CORNHILL.some((r) => x > r.x0 && x < r.x1 && z > r.z0 && z < r.z1);
// The way in off the main road, for walks to the Corn Exchange from outside the square.
export const CORNHILL_WAY = (CORNHILL[1].x0 + CORNHILL[1].x1) / 2;

export const STALLS = [
  ...[-16, -10, 10, 16].map((x) => ({ x, z: CLOSE.z0 + 2.5 })),
  // and two more on Cornhill, west of the Corn Exchange
  ...[22.2, 26.6].map((x) => ({ x, z: exchange.z0 + 3.4 })),
];

// Plain shopfronts lining the High Street either side of the Stonebow, and both sides of Bailgate up to
// Newport Arch, so the old streets read as streets. Each run is [side, front, z0, z1, shops]: front is how
// far its frontage stands from the centre line, and the run is split into shops of equal length.
// A run can also have its own centre line, cx, for the row along the west side of Cornhill.
export const SHOPFRONT = { deep: 5, bailgate: 4 };
const SHOP_RUNS: [number, number, number, number, number, number?][] = [
  [-1, HIGH_ST, -44, -33, 3], // north of High Bridge's timber-framed shops
  [1, HIGH_ST, -44, -32, 3],
  ...[-1, 1].map((side) => [side, BAILGATE.x1, NEWPORT.z + NEWPORT.d / 2 + 0.6, CLOSE.z0, 4] as [number, number, number, number, number]),
  [-1, 5, CORNHILL[0].z0, CORNHILL[0].z1, 3, CORNHILL[0].x0 + 5], // backing onto the Town Hall, fronts onto the square
];
export const SHOPFRONTS = SHOP_RUNS.flatMap(([side, front, z0, z1, n, cx = 0], r) => {
  const len = (z1 - z0) / n,
    deep = front === HIGH_ST ? SHOPFRONT.deep : SHOPFRONT.bailgate;
  return Array.from({ length: n }, (_, i) => ({ side, x: cx + side * (front + deep / 2), z: z0 + len * (i + 0.5), len, deep, k: r * 2 + i }));
});

// The Stonebow: the old city gate with the Guildhall above it, spanning the pedestrianised
// High Street just north of the Post and the Town Hall, partway up to Steep Hill. As on the real
// south front, a low segmental arch over the street is flanked by two narrow walkway arches either
// side. Each arch is [centre x, span, height its head springs, rise of a segmental head]; only the
// piers between them are solid.
const gate = PLACES.find((p) => p.kind === "gate")!;
export const STONEBOW = {
  z: gate.z,
  half: gate.w / 2,
  d: gate.d,
  arches: [[0, 5.2, 2.6, 1], ...[-1, 1].flatMap((s) => [[s * 4.4, 1.4, 2.1], [s * 6.2, 1.4, 2.1]])] as [number, number, number, number?][],
};
const stonebowEdges = [-STONEBOW.half, ...STONEBOW.arches.map(([x, span]) => [x - span / 2, x + span / 2]).sort((a, b) => a[0] - b[0]).flat(), STONEBOW.half];
const STONEBOW_PIERS = Array.from({ length: stonebowEdges.length / 2 }, (_, i) => ({
  x0: gate.x + stonebowEdges[2 * i],
  x1: gate.x + stonebowEdges[2 * i + 1],
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
// Lincoln Central Bus Station, across the main road from the railway station: the concourse along the back,
// a kerb under its canopy where the buses pull in, the lane past the bays, and a way in off the main road at
// the west end and out at the east end, with a grassy island between them. Buses go round one way, west to east,
// so their doors on the left open onto the kerb. bay is the lane's centre line, and stops where each bus waits.
const busPlace = PLACES.find((p) => p.kind === "busstation")!;
const concourse = footprint(busPlace);
const BUS_X0 = concourse.x0 - 1.5,
  BUS_X1 = concourse.x1 + 1.5;
export const BUS_STATION = {
  entry: concourse.x0 + 1,
  exit: concourse.x1 - 1,
  bay: concourse.z1 + 6.5,
  stops: [concourse.x0 + 6, concourse.x0 + 16],
  kerb: { x0: BUS_X0, x1: BUS_X1, z0: concourse.z1, z1: concourse.z1 + 4 },
  tarmac: [
    { x0: BUS_X0, x1: BUS_X1, z0: concourse.z1 + 4, z1: concourse.z1 + 9 },
    { x0: concourse.x0 - 3, x1: concourse.x0 + 4.5, z0: concourse.z1 + 9, z1: -3 },
    { x0: concourse.x1 - 4.5, x1: concourse.x1 + 3, z0: concourse.z1 + 9, z1: -3 },
  ],
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

// Waypoints for a walk across the river, the railway or both, in the order it comes to them.
export function crossings(from: [number, number], to: [number, number]) {
  const pts: [number, number][] = [];
  let at = from;
  for (const leg of to[1] > from[1] ? [overRiver, overRailway] : [overRailway, overRiver]) {
    const p = leg(at, to);
    pts.push(...p);
    at = p.at(-1) ?? at;
  }
  return pts;
}

// The roundabout on the main road out west with the tank memorial in the middle, as at the start of
// Tritton Road. island is the radius of the raised middle, ring the outer edge of the road round it,
// and edge the outer edge of the pavement.
const tank = PLACES.find((p) => p.kind === "tank")!;
export const ROUNDABOUT = { x: tank.x, z: tank.z, island: 4.3, ring: 6.8, edge: 8.2 };

// Two cannons guarding the castle gate, on the right as you face it (in the castle's own coordinates).
export const CANNONS = [4.8, 7.6].map((x) => ({ x, z: castlePlace.d / 2 + 2.6 }));

const boxes = PLACES.filter((p) => p.kind !== "tank" && p.kind !== "gate" && p.kind !== "arch").flatMap((p) => {
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
  if (p.kind === "oldhouse") return [f]; // fills its plot in the row exactly, like the houses either side
  if (p.kind === "airfield") {
    // the runway and apron are walkable; only the hangar and the parked jet are solid
    return [AIRFIELD.hangar, AIRFIELD.parked].map((b) => toWorld(p, b));
  }
  return [{ x0: f.x0 - 0.4, x1: f.x1 + 0.4, z0: f.z0 - 0.4, z1: f.z1 + 0.4 }];
}).concat(HOUSES.map((h) => ({ x0: h.x - HOUSE.d / 2, x1: h.x + HOUSE.d / 2, z0: h.z - HOUSE.w / 2, z1: h.z + HOUSE.w / 2 })), SHOPFRONTS.map((h) => ({ x0: h.x - h.deep / 2, x1: h.x + h.deep / 2, z0: h.z - h.len / 2, z1: h.z + h.len / 2 })), STALLS.map((s) => ({ x0: s.x - STALL.w / 2, x1: s.x + STALL.w / 2, z0: s.z - STALL.d / 2, z1: s.z + STALL.d / 2 })), STONEBOW_PIERS, NEWPORT_PIERS, RIVER_BOXES, RAIL_FENCES, STATION_BOXES);

const HIGH_STREET = { x0: -HIGH_ST, x1: HIGH_ST, z0: hill.z1, z1: -4.3 };
const onRoad = (x: number, z: number) =>
  Math.abs(x) < 7 ||
  (Math.abs(z) < 7 && x > -BOUND && x < EAST) ||
  (Math.abs(z - STADIUM_ROAD.z) < 7 && x < STADIUM_ROAD.x1) ||
  (Math.abs(z - AIRFIELD_ROAD.z) < 7 && x > AIRFIELD_ROAD.x0) ||
  Math.abs(z - RAIL.z) < RAIL.fence + 2 ||
  [CLOSE, BAILGATE, HIGH_STREET, ...CORNHILL, BUS_STATION.kerb, ...BUS_STATION.tarmac, ...STONEBOW_PIERS, ...NEWPORT_PIERS, ...RIVER_BOXES, ...FOOTPATHS, ...STATION.platforms.map((pl) => ({ ...pl, x0: STATION.x0, x1: STATION.x1 }))].some((f) => x > f.x0 - 2 && x < f.x1 + 2 && z > f.z0 - 2 && z < f.z1 + 2);
const nearBuilding = (x: number, z: number, pad: number) =>
  HOUSES.some((h) => Math.abs(x - h.x) < HOUSE.d / 2 + pad && Math.abs(z - h.z) < HOUSE.w / 2 + pad) ||
  SHOPFRONTS.some((h) => Math.abs(x - h.x) < h.deep / 2 + pad && Math.abs(z - h.z) < h.len / 2 + pad) ||
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
    if (onRoad(x, z) || nearBuilding(x, z, 3) || Math.hypot(x - ROUNDABOUT.x, z - ROUNDABOUT.z) < ROUNDABOUT.edge + 2) continue;
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
  if (Math.hypot(x - ROUNDABOUT.x, z - ROUNDABOUT.z) < ROUNDABOUT.island) return true;
  for (const c of circles) if (Math.hypot(x - c.cx, z - c.cz) < c.r) return true;
  for (const b of boxes) if (x > b.x0 && x < b.x1 && z > b.z0 && z < b.z1) return true;
  return false;
}
