import { PLACES, footprint } from "./places";

export const BOUND = 100; // the west edge of the map, well out past the university for the tank roundabout on the road to Tritton Road
export const EAST = 140; // the east edge, well out past the cathedral's long east end, with the Arboretum out along Monks Road
export const MID_X = (EAST - BOUND) / 2; // the map's centre line, east to west
export const SOUTH = 168; // the south road runs a long way down, past rows of shops and houses to Sincil Bank and RAF Scampton
export const NORTH = -164; // the map runs further north, up the hill to the cathedral and castle

// Small seeded random so the town is laid out the same on every visit.
export function seeded(seed: number) {
  return () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
}

export const STREET_ROW = 3.6; // depth of the house rows either side of Steep Hill
export const STREET_HOUSES = 7;
export const STREET_GAP = 4; // house left out on both sides: a little square halfway up the hill

// The old stone houses that stand in the rows on Steep Hill, in place of an ordinary house each.
const OLD_HOUSES = PLACES.filter((p) => p.kind === "oldhouse");
// The Magna Carta stands on the top house's plot on the east side.
const PUBS = PLACES.filter((p) => p.kind === "pub").map(footprint);

// Steep Hill's houses, bottom of the hill first, in the street's own coordinates.
export function streetHouses(p: { x: number; z: number; w: number; d: number }) {
  const len = p.d / STREET_HOUSES;
  return [-1, 1].flatMap((side) =>
    Array.from({ length: STREET_HOUSES }, (_, i) => ({ side, i, len, x: side * (p.w / 2 - STREET_ROW / 2), z: p.d / 2 - len / 2 - i * len })).filter(
      (h) =>
        h.i !== STREET_GAP &&
        !OLD_HOUSES.some((o) => Math.abs(o.x - p.x - h.x) < 0.5 && Math.abs(o.z - p.z - h.z) < 0.5) &&
        !PUBS.some((f) => p.x + h.x > f.x0 && p.x + h.x < f.x1 && p.z + h.z > f.z0 && p.z + h.z < f.z1),
    ),
  );
}

// The houses lining the south road between the railway and the side roads to Sincil Bank and
// RAF Scampton, in short terraces either side with to-let plots between them. Each faces the road.
export const HOUSE = { w: 5, d: 5, h: 3.4 };
export const HOUSE_X = 12.5;
// On the east side they make way for the side streets to Sincil Bank (Portland, Monson and Scorer Streets).
export const HOUSES = [-1, 1].flatMap((side) =>
  (side < 0 ? [58, 64, 70, 76, 98, 104, 110, 116] : [56, 69, 75, 98, 104, 110]).map((z, i) => ({ x: side * HOUSE_X, z, side, i })),
);

// The paved High Street, from the main road to the foot of Steep Hill: half its width, as wide as the
// Stonebow, so the shopfronts either side and the gate's walkway arches all open onto it.
export const HIGH_ST = 7.6;

// Brayford in its own coordinates: the pool, the Fossdyke running off west to the edge of
// the map, and the row of waterfront buildings along the far quay. The pool's south and east edges stay where they
// are (the Witham leaves its south-east corner and the University is just south); it grows north and west.
export const BRAYFORD = {
  water: { x0: -36, x1: 12, z0: -19, z1: 5 },
  canal: { x0: -BOUND + 46, x1: -36, z0: -2.5, z1: 0.5 }, // runs off west to the map's edge (the Brayford is at x -46)
  front: { x0: -40, x1: 16, z0: -23, z1: -20 },
};

// The road off the south road to Sincil Bank, east of the high street as in real Lincoln.
// It runs from the main road's centre line to the stadium's west-facing entrance.
const stadium = footprint(PLACES.find((p) => p.kind === "stadium")!);
export const STADIUM_ROAD = { z: (stadium.z0 + stadium.z1) / 2, x0: 0, x1: stadium.x0 };

// RAF Scampton in its own coordinates (front faces the road, so +x is north and +z is east, towards the road): a
// runway along the north edge, the hangar at the west end of the apron with its doors onto it, the control tower and
// a car park south of the apron, a Nissen hut for 617 Squadron's heritage centre in the south-west corner, and a drive
// in from the gate, with its guardhouse and barrier. A fence runs right round, with the gap for the drive.
// The jet stands on the apron at stand, nose north, and taxis up the taxiway to the runway.
export const AIRFIELD = {
  runway: { x0: 12, x1: 17.5, z0: -18, z1: 21 },
  taxiway: { x0: 6, x1: 12, z0: -2.5, z1: 0.5 },
  apron: { x0: -6, x1: 6, z0: -11, z1: 10 },
  drive: { x0: -3, x1: 3, z0: 10, z1: 22.5 },
  hangar: { x0: -4, x1: 6, z0: -21, z1: -11 },
  stand: { x: 3.7, z: -1 }, // off to the side of the way in from the gate
  parked: { x0: 1.4, x1: 7, z0: -3.7, z1: 1.7 },
  tower: { x0: -13, x1: -9, z0: 1, z1: 5 },
  heritage: { x0: -18.5, x1: -13, z0: -20, z1: -13 },
  guard: { x0: -6.8, x1: -4.3, z0: 16.5, z1: 19.5 },
  carpark: { x0: -18, x1: -8, z0: 10, z1: 21 },
  cars: [
    { x: -15.5, z: 11.5, k: 0 },
    { x: -15.5, z: 15.9, k: 1 },
    { x: -15.5, z: 18.1, k: 2 },
    { x: -10.5, z: 13.7, k: 3 },
    { x: -10.5, z: 18.1, k: 4 },
  ],
  windsock: { x: 9.5, z: -15 },
  fence: 0.3, // in from the edge
  gate: 3.2, // half the gap in the fence for the drive
  barrier: 21, // z of the barrier across the drive
};
export const AIRFIELD_CAR = { w: 1.5, len: 3.3 }; // len along x
// What the jet is doing, set every frame by the airfield: the runway (and the taxiway up to it) is closed to walkers
// while the jet is using it, and its stand is solid only while it's parked there.
export const AIRFIELD_STATE = { runway: false, parked: true };
// A rect in a place's own coordinates, turned and moved into world coordinates.
export function toWorld(p: { x: number; z: number; rot: number }, r: { x0: number; x1: number; z0: number; z1: number }) {
  const c = Math.round(Math.cos(p.rot)),
    s = Math.round(Math.sin(p.rot));
  const xs = [r.x0 * c + r.z0 * s, r.x1 * c + r.z1 * s],
    zs = [-r.x0 * s + r.z0 * c, -r.x1 * s + r.z1 * c];
  return { x0: p.x + Math.min(...xs), x1: p.x + Math.max(...xs), z0: p.z + Math.min(...zs), z1: p.z + Math.max(...zs) };
}

// The road west off the south road to RAF Scampton, opposite the one to Sincil Bank.
const airfieldPlace = PLACES.find((p) => p.kind === "airfield")!;
const airfield = footprint(airfieldPlace);
export const AIRFIELD_ROAD = { z: (airfield.z0 + airfield.z1) / 2, x0: airfield.x1, x1: 0 };
// The same in world coordinates. The fence, as thin solid boxes with the gap for the drive on the road side; the
// gate's points just outside and inside it, which walks in or out go through; and the closable runway and stand.
const AF = AIRFIELD,
  half = { x: airfieldPlace.w / 2 - AF.fence, z: airfieldPlace.d / 2 - AF.fence };
export const AIRFIELD_FENCE = [
  { x0: -half.x, x1: half.x, z0: -half.z - 0.15, z1: -half.z + 0.15 },
  { x0: -half.x - 0.15, x1: -half.x + 0.15, z0: -half.z, z1: half.z },
  { x0: half.x - 0.15, x1: half.x + 0.15, z0: -half.z, z1: half.z },
  { x0: -half.x, x1: -AF.gate, z0: half.z - 0.15, z1: half.z + 0.15 },
  { x0: AF.gate, x1: half.x, z0: half.z - 0.15, z1: half.z + 0.15 },
];
const fenceWorld = toWorld(airfieldPlace, { x0: -half.x, x1: half.x, z0: -half.z, z1: half.z });
const gateAt = (z: number) => {
  const w = toWorld(airfieldPlace, { x0: 0, x1: 0, z0: z, z1: z });
  return [w.x0, w.z0] as [number, number];
};
const AF_OUT = gateAt(half.z + 2.6),
  AF_IN = gateAt(half.z - 4);
export const AIRFIELD_GATE = gateAt(AF.barrier);
const RUNWAY_BOX = (() => {
  const r = toWorld(airfieldPlace, AF.runway),
    t = toWorld(airfieldPlace, { x0: AF.parked.x0, x1: AF.runway.x0, z0: AF.parked.z0, z1: AF.parked.z1 });
  return [r, t];
})();
const STAND_BOX = toWorld(airfieldPlace, AF.parked);
// Whether the Imp is on the runway or the jet's way up to it (with a margin), so the jet waits before using it.
export const onRunway = (x: number, z: number, pad = 1) => RUNWAY_BOX.some((b) => x > b.x0 - pad && x < b.x1 + pad && z > b.z0 - pad && z < b.z1 + pad);
const inAirfield = ([x, z]: [number, number]) => x > fenceWorld.x0 && x < fenceWorld.x1 && z > fenceWorld.z0 && z < fenceWorld.z1;
const nearAirfield = (x: number, z: number, pad: number) => x > airfield.x0 - pad && x < airfield.x1 + pad && z > airfield.z0 - pad && z < airfield.z1 + pad;
// Round the airfield's fence, by its north or south side, whichever is shorter, for any leg that would cut across it.
function crossesBox(a: [number, number], b: [number, number], r: { x0: number; x1: number; z0: number; z1: number }) {
  let t0 = 0,
    t1 = 1;
  const d = [b[0] - a[0], b[1] - a[1]];
  for (const [p, q] of [
    [-d[0], a[0] - r.x0],
    [d[0], r.x1 - a[0]],
    [-d[1], a[1] - r.z0],
    [d[1], r.z1 - a[1]],
  ]) {
    if (p === 0) {
      if (q < 0) return false;
    } else {
      const t = q / p;
      if (p < 0) t0 = Math.max(t0, t);
      else t1 = Math.min(t1, t);
    }
  }
  return t0 < t1;
}
// Any leg of a route that cuts across box goes round it instead: round one of the corners (pad out from it), or two
// next to each other, whichever clear way is shortest. skip leaves a leg alone.
function aroundBox(route: [number, number][], box: { x0: number; x1: number; z0: number; z1: number }, pad: number, skip?: (a: [number, number], b: [number, number]) => boolean) {
  const corners: [number, number][] = [
    [box.x0 - pad, box.z0 - pad],
    [box.x1 + pad, box.z0 - pad],
    [box.x1 + pad, box.z1 + pad],
    [box.x0 - pad, box.z1 + pad],
  ];
  const len = (pts: [number, number][]) => pts.slice(1).reduce((s, p, i) => s + Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]), 0);
  const out: [number, number][] = [route[0]];
  for (const b of route.slice(1)) {
    const a = out.at(-1)!;
    if (!skip?.(a, b) && crossesBox(a, b, box)) {
      const ways = [...corners.map((c) => [c]), ...corners.flatMap((c, i) => [corners[(i + 1) % 4], corners[(i + 3) % 4]].map((d) => [c, d]))];
      const clear = ways.filter((w) => [...w, b].every((p, i, all) => !crossesBox(i ? all[i - 1] : a, p, box)));
      const best = clear.sort((x, y) => len([a, ...x, b]) - len([a, ...y, b]))[0];
      if (best) out.push(...best);
    }
    out.push(b);
  }
  return out;
}
// Round the airfield's fence from outside it, and round the jet on its stand inside.
const aroundAirfield = (route: [number, number][]) => aroundBox(route, airfield, 2.5, (a, b) => inAirfield(a) || inAirfield(b));
const aroundStand = (route: [number, number][]) => aroundBox(route, STAND_BOX, 0.8);

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
// Paths out to the landmarks beyond the streets: Mill Road, north off Castle Square clear of the castle's cannons
// and west along the ridge behind its walls to Ellis Mill; and Monks Road, east from the Greestone path to the
// Arboretum's gates.
const doorAt = (id: string) => {
  const p = PLACES.find((q) => q.id === id)!;
  const off = p.d / 2 + 1.8;
  return { x: p.x + Math.round(Math.sin(p.rot)) * off, z: p.z + Math.round(Math.cos(p.rot)) * off };
};
// The Exchequer Gate closes the east side of Castle Square; walks go through its big arch, between these two points
// either side of it, the west one a little south so as to come in clear of the farmers' market stalls.
const gatePlace = PLACES.find((p) => p.kind === "gatehouse")!;
const ARCH_WEST: [number, number] = [gatePlace.x - gatePlace.d / 2 - 1.1, gatePlace.z + 1.2];
const ARCH_EAST: [number, number] = [gatePlace.x + gatePlace.d / 2 + 1.1, gatePlace.z];
// Minster Yard's close houses, along the north side of the lawn: reached along the path round the cathedral and up a spur.
const yardPlace = PLACES.find((p) => p.kind === "yard")!;
const YARD_SPUR_X = yardPlace.x;
const MILL_DOOR = doorAt("ellis-mill"),
  ARBORETUM_DOOR = doorAt("arboretum"),
  MARKET_DOOR = doorAt("christmas-market"),
  LAWN_DOOR = doorAt("the-lawn");
const LAWN_PATH_Z = LAWN_DOOR.z + 0.7; // just south of The Lawn's gate, clear of the castle
// The streets round the castle (CastleStreets.tsx): Westgate west off Bailgate along the castle's north side, Union
// Road south off it down the castle's west side between the walls and The Lawn, to the path in to The Lawn's gate,
// and Burton Road north off Westgate's west end, with Ellis Mill on the corner. (The real mill is a little way up
// Burton Road and along Mill Road; here it fronts Westgate.)
const lawnBox = footprint(PLACES.find((p) => p.id === "the-lawn")!);
export const BURTON = { x: -70, half: 2.5, z0: NORTH, z1: castle.z0 - 2.4 };
export const WESTGATE = { z: castle.z0 - 5, half: 2.6, x0: BURTON.x - BURTON.half, x1: -4.3 }; // east end: Bailgate's west side
export const UNION = { x: (castle.x0 + lawnBox.x1) / 2 - 0.3, half: 1.9, z0: WESTGATE.z + WESTGATE.half, z1: LAWN_PATH_Z + 1 };
export const CASTLE_ROADS = [
  { x0: WESTGATE.x0, x1: WESTGATE.x1, z0: WESTGATE.z - WESTGATE.half, z1: WESTGATE.z + WESTGATE.half },
  { x0: UNION.x - UNION.half, x1: UNION.x + UNION.half, z0: UNION.z0, z1: UNION.z1 },
  { x0: BURTON.x - BURTON.half, x1: BURTON.x + BURTON.half, z0: BURTON.z0, z1: WESTGATE.z - WESTGATE.half },
];
export const LANDMARK_PATHS = [
  { x0: MILL_DOOR.x - 1, x1: MILL_DOOR.x + 1, z0: MILL_DOOR.z - 0.6, z1: WESTGATE.z - WESTGATE.half }, // the mill's yard, off Westgate
  { x0: EAST_PATH_X + 1, x1: ARBORETUM_DOOR.x + 1, z0: ARBORETUM_DOOR.z - 1, z1: ARBORETUM_DOOR.z + 1 },
  { x0: LAWN_DOOR.x - 1, x1: PATH_X - 1, z0: LAWN_PATH_Z - 1, z1: LAWN_PATH_Z + 1 }, // west off the castle footpath to The Lawn's gate
];
// Lindum Hill: the steep road up the east side of the hill. Broadgate brings it up from the main road, over the Witham on
// a road bridge and past the Arboretum's gates where Monks Road comes in; from there it climbs north past the Usher Gallery's east end,
// then at the top sweeps in a smooth curve east, clear of the cathedral's south-east corner, and on north along the
// cathedral's east end, with a footway across to the path round the precinct. Tall townhouses line both sides of the
// hill, left out on the west side where the gallery and the path along its front come up to it, and on the east side
// at the top where the road curves away.
const lindum = PLACES.find((p) => p.kind === "hill")!;
const LH = footprint(lindum);
export const LINDUM_ROW = 3.2; // depth of the house rows
const LINDUM_N = 7;
const lindumLen = (LH.z1 - 0.5 - LH.z0) / LINDUM_N;
const LINDUM_HALF = (LH.x1 - LH.x0) / 2;
const LEG_X = 104; // the road's centre line along the cathedral's east end
const CURVE_Z = -88; // where the straight road ends and the curve begins
const LEG_END = -141;
// The centre line of the road on from the top of the hill, a cubic curve from the end of the straight road (heading north)
// round to the north along the east end, then straight on. It starts well down the hill so the bend is gentle.
const bend = (t: number): [number, number] => {
  const u = 1 - t,
    P: [number, number][] = [[lindum.x, CURVE_Z], [lindum.x, -100], [LEG_X, -102], [LEG_X, -114]];
  return [u * u * u * P[0][0] + 3 * u * u * t * P[1][0] + 3 * u * t * t * P[2][0] + t * t * t * P[3][0], u * u * u * P[0][1] + 3 * u * u * t * P[1][1] + 3 * u * t * t * P[2][1] + t * t * t * P[3][1]];
};
export const LINDUM_PATH: [number, number][] = [...Array.from({ length: 41 }, (_, i) => bend(i / 40)), [LEG_X, -120], [LEG_X, -130], [LEG_X, LEG_END]];
export const LINDUM = {
  road: { ...LH, z0: CURVE_Z }, // the straight part, up to where the curve begins
  half: LINDUM_HALF,
  path: LINDUM_PATH,
  broadgate: { x0: LH.x0, x1: LH.x1, z0: LH.z1, z1: -4.3 }, // down to the main road's pavement
  link: { x0: P.x1, x1: LEG_X - LINDUM_HALF + 0.2, z0: -126, z1: -124 }, // a footway across to the path round the precinct
  // each side listed from the bottom of the hill up; side -1 is the west row, its fronts facing east onto the road
  houses: [-1, 1].flatMap((side) =>
    Array.from({ length: LINDUM_N }, (_, i) => ({
      side,
      i,
      len: lindumLen,
      x: side < 0 ? LH.x0 - LINDUM_ROW / 2 : LH.x1 + LINDUM_ROW / 2,
      z: LH.z1 - 0.5 - lindumLen * (i + 0.5),
    }))
      .filter((h) => h.z - h.len / 2 >= CURVE_Z - 0.5) // the houses stop where the road starts to curve away
      .filter((h) => side > 0 || h.z + h.len / 2 < gallery.z0 - 1.5 || h.z - h.len / 2 > gallery.z1 + 3.2),
  ),
};
// Rectangles round the curved road, so trees keep off it.
const LINDUM_ROADBOXES = LINDUM_PATH.map(([x, z]) => ({ x0: x - LINDUM_HALF, x1: x + LINDUM_HALF, z0: z - LINDUM_HALF, z1: z + LINDUM_HALF }));
// Pelham Bridge, Broadgate's way on south of the main road: flat to a, up a ramp to the deck at b, high over the railway
// to c, down again to d and flat on to the end of the road. h is the deck's height; only the road itself is lifted
// (deckY in terrain.tsx), with a parapet each side keeping walkers on it.
const flyover = footprint(PLACES.find((p) => p.kind === "flyover")!);
export const PELHAM = { x0: flyover.x0, x1: flyover.x1, z0: flyover.z0, a: 4.5, b: 14.5, c: 23, d: 33, z1: flyover.z1, h: 6 };
const PELHAM_PARAPETS = [-1, 1].map((s) => {
  const x = s < 0 ? PELHAM.x0 - 0.2 : PELHAM.x1 + 0.2;
  return { x0: x - 0.25, x1: x + 0.25, z0: PELHAM.a + 1, z1: PELHAM.d - 1 };
});
export const lindumBox = (h: (typeof LINDUM.houses)[number]) => ({
  x0: h.x - LINDUM_ROW / 2,
  x1: h.x + LINDUM_ROW / 2,
  z0: h.z - h.len / 2,
  z1: h.z + h.len / 2,
});
// Going to one of them (or the Christmas market) from Go to: join its path at the nearest of these points and follow it in.
export const APPROACH: Record<string, [number, number][]> = {
  // up the castle footpath, west along the path to The Lawn, up Union Road and along Westgate to the mill
  "ellis-mill": [
    [PATH_X, 0],
    [PATH_X, LAWN_PATH_Z],
    [UNION.x, LAWN_PATH_Z],
    [UNION.x, WESTGATE.z],
    [MILL_DOOR.x, WESTGATE.z],
  ],
  arboretum: [
    [EAST_PATH_X, 0],
    [EAST_PATH_X, ARBORETUM_DOOR.z],
  ],
  // up the castle footpath and west along the path south of the castle to the gate
  "the-lawn": [
    [PATH_X, 0],
    [PATH_X, LAWN_PATH_Z],
    [UNION.x, LAWN_PATH_Z], // the foot of Union Road, shared with the way to the mill
    [LAWN_DOOR.x, LAWN_PATH_Z],
  ],
  // off the main road and up Broadgate to the foot of the hill
  "lindum-hill": [[lindum.x, 0]],
  // the chalets line the north side of Minster Yard's forecourt: up Steep Hill, across the square and through the gate
  "christmas-market": [
    [0, 0],
    [0, -121],
    ARCH_WEST,
    ARCH_EAST,
    [MARKET_DOOR.x, MARKET_DOOR.z],
  ],
  // the gatehouse's doorway on the square: from the top of Steep Hill, clear of Bailgate's shops and the stalls
  "exchequer-gate": [[0, -121]],
  // through the gate, north up the path along the west front and east along the north side to the spur
  "minster-yard": [
    [0, -121],
    ARCH_WEST,
    ARCH_EAST,
    [P.x0 + P.w / 2, gatePlace.z - 1.5],
    [P.x0 + P.w / 2, P.z0 + P.w / 2],
    [YARD_SPUR_X, P.z0 + P.w / 2],
  ],
};
// The path round the cathedral is Minster Yard's, laid in setts (Town.tsx), with a spur north across the lawn to
// the close houses' doors.
export const RING_PATHS = [
  { x0: P.x0, x1: P.x1, z0: P.z0, z1: P.z0 + P.w },
  { x0: P.x0, x1: P.x1, z0: P.z1 - P.w, z1: P.z1 },
  { x0: P.x0, x1: P.x0 + P.w, z0: P.z0 + P.w, z1: P.z1 - P.w },
  { x0: P.x1 - P.w, x1: P.x1, z0: P.z0 + P.w, z1: P.z1 - P.w },
  { x0: YARD_SPUR_X - 1, x1: YARD_SPUR_X + 1, z0: footprint(yardPlace).z1, z1: P.z0 },
];
export const FOOTPATHS = [
  { x0: PATH_X - 1, x1: PATH_X + 1, z0: castlePlace.z - 1, z1: -4.3 },
  ...RING_PATHS,
  ...GREESTONE,
  ...EAST_FOOTPATH,
  ...LANDMARK_PATHS,
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
    // and Broadgate's road bridge, on the way up to Lindum Hill (drawn with it)
    { x: lindum.x, x0: LH.x0, x1: LH.x1, foot: false },
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

// Brayford Wharf: a paved quay along the south bank of the Witham, from the Brayford's east quay to the Post
// by High Bridge, with bars and restaurants facing the water across it. Brayford Wharf East runs south off it,
// down the east side of the pool to the main road, with two more bars along its east side facing west.
// Each bar is [x, z, along, deep, rot], rot turning its front to face the quay or the lane.
const post = footprint(PLACES.find((p) => p.id === "post")!);
export const WHARF = { x0: PATH_X - 2, x1: post.x0 - 0.6, z0: RIVER.z + RIVER.half + 0.3, z1: RIVER.z + RIVER.half + 4.8 };
export const WHARF_EAST = { x0: PATH_X - 2, x1: PATH_X + 2, z0: WHARF.z1, z1: -4.3 };
const BAR_DEEP = 4.5;
const quayRow = { x0: WHARF_EAST.x1, x1: WHARF.x1, n: 3 },
  laneRow = { z0: WHARF.z1 + BAR_DEEP, z1: -8.5, n: 2 };
export const WHARF_BARS = [
  ...Array.from({ length: quayRow.n }, (_, i) => {
    const len = (quayRow.x1 - quayRow.x0) / quayRow.n;
    return { x: quayRow.x0 + len * (i + 0.5), z: WHARF.z1 + BAR_DEEP / 2, len, deep: BAR_DEEP, rot: Math.PI };
  }),
  ...Array.from({ length: laneRow.n }, (_, i) => {
    const len = (laneRow.z1 - laneRow.z0) / laneRow.n;
    return { x: WHARF_EAST.x1 + BAR_DEEP / 2, z: laneRow.z0 + len * (i + 0.5), len, deep: BAR_DEEP, rot: -Math.PI / 2 };
  }),
];
// A bar's footprint in world coordinates.
export const barBox = (b: (typeof WHARF_BARS)[number]) => {
  const [hx, hz] = Math.abs(Math.sin(b.rot)) > 0.5 ? [b.deep / 2, b.len / 2] : [b.len / 2, b.deep / 2];
  return { x0: b.x - hx, x1: b.x + hx, z0: b.z - hz, z1: b.z + hz };
};

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
export const CLOSE = { x0: castle.x1 - 1, x1: gatePlace.x - gatePlace.d / 2, z0: hill.z0 - 12, z1: hill.z0 + 3 };
// The Exchequer Gate across its east side (local x along the gate, so world z): solid but for its big central arch,
// in line with the cathedral's west door, and a footway arch either side, with a short stub of the close wall off
// each end.
export const EXCHEQUER = { x: gatePlace.x, z: gatePlace.z, half: gatePlace.w / 2, d: gatePlace.d, arch: 1.6, foot: [2.9, 4.3], stub: 3.5, t: 0.3 };
const E = EXCHEQUER;
export const EXCHEQUER_BOXES = [
  ...([[-E.half, -E.foot[1]], [-E.foot[0], -E.arch], [E.arch, E.foot[0]], [E.foot[1], E.half]] as const).map(([z0, z1]) => ({ x0: E.x - E.d / 2, x1: E.x + E.d / 2, z0: E.z + z0, z1: E.z + z1 })),
  ...[-1, 1].map((s) => ({ x0: E.x - E.t, x1: E.x + E.t, z0: Math.min(E.z + s * E.half, E.z + s * (E.half + E.stub)), z1: Math.max(E.z + s * E.half, E.z + s * (E.half + E.stub)) })),
];
// Minster Yard beyond it: a paved forecourt out to the path along the cathedral's west front, the lawn north of the
// cathedral in front of the close houses, and a plainer row of houses on the south side, east of the Greestone Stairs,
// looking north onto the path.
export const MINSTER = {
  forecourt: { x0: E.x + E.d / 2, x1: P.x0, z0: E.z - 7, z1: E.z + 7 },
  lawn: { x0: P.x0, x1: P.x1, z0: footprint(yardPlace).z1, z1: P.z0 },
  south: Array.from({ length: 5 }, (_, i) => ({ x: 63.2 + i * 6.4, z: P.z1 + 4.3, w: 6.4, d: 3.6 })),
};
const yardBox = (h: { x: number; z: number; w: number; d: number }) => ({ x0: h.x - h.w / 2, x1: h.x + h.w / 2, z0: h.z - h.d / 2, z1: h.z + h.d / 2 });
// A few trees on the lawn, clear of the walk from the path to the spur.
export const YARD_TREES: [number, number, number][] = [
  [40, -149.4, 1],
  [47, -150, 0.9],
  [80, -147.2, 1.05],
  [87, -146.6, 0.95],
  [93, -148.4, 1],
];
// Walks across the line of the gate and its wall stubs go through the big arch, square on. On the square side, setting
// off from (or heading to) north of the market stalls' front, step south of them first so as not to cut through them.
const STALLS_FRONT = hill.z0 - 6;
// On the yard side, from the lawn or the path north of the cathedral, come down the path along the west front and
// into the forecourt south of the Christmas chalets along its north edge.
const WEST_PATH: [number, number] = [P.x0 + P.w / 2, E.z - 2.5];
const yardSteps = ([x, z]: [number, number]): [number, number][] =>
  z > WEST_PATH[1] - 0.5 ? [] : x > P.x0 + P.w ? [[WEST_PATH[0], P.z0 + P.w / 2], WEST_PATH] : [[WEST_PATH[0], z], WEST_PATH];
// Between the forecourt (or the west door) and the lawn north of the cathedral, the same way round its corner.
const inForecourt = ([x, z]: [number, number]) => x > E.x && x < P.x0 + P.w && z > WEST_PATH[1] - 0.5;
const northOfCathedral = ([x, z]: [number, number]) => x > E.x && z < cathedral.z0 - 0.5;
function throughGate(route: [number, number][]) {
  const out: [number, number][] = [route[0]];
  for (const b of route.slice(1)) {
    const a = out.at(-1)!;
    if ((a[0] - E.x) * (b[0] - E.x) < 0 && Math.max(Math.abs(a[0] - E.x), Math.abs(b[0] - E.x)) > E.d / 2 + 1.5) {
      const z = a[1] + ((E.x - a[0]) / (b[0] - a[0])) * (b[1] - a[1]);
      if (Math.abs(z - E.z) < E.half + E.stub + 0.5) {
        const [west, east] = a[0] < E.x ? [a, b] : [b, a];
        const step: [number, number][] = west[1] < STALLS_FRONT - 0.5 ? [[west[0], STALLS_FRONT]] : [];
        const yard = yardSteps(east);
        out.push(...(a === west ? [...step, ARCH_WEST, ARCH_EAST, ...yard.slice().reverse()] : [...yard, ARCH_EAST, ARCH_WEST, ...step]));
      }
    } else if (inForecourt(a) && northOfCathedral(b)) out.push(...yardSteps(b).reverse());
    else if (northOfCathedral(a) && inForecourt(b)) out.push(...yardSteps(a));
    out.push(b);
  }
  return out;
}
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
  // (the east pair a little in from the Exchequer Gate, to leave its doorway and the way through its arch clear)
  ...[-16, -10, 8, 13.5].map((x) => ({ x, z: CLOSE.z0 + 2.5 })),
  // and two more on Cornhill, west of the Corn Exchange
  ...[22.2, 26.6].map((x) => ({ x, z: exchange.z0 + 3.4 })),
];

// Plain shopfronts lining the High Street either side of the Stonebow, and both sides of Bailgate up to
// Newport Arch, so the old streets read as streets. Each run is [side, front, z0, z1, shops]: front is how
// far its frontage stands from the centre line, and the run is split into shops of equal length.
// A run can also have its own centre line, cx, for the row along the west side of Cornhill.
export const SHOPFRONT = { deep: 5, bailgate: 4 };
const SHOP_RUNS: [number, number, number, number, number, number?][] = [
  ...[-1, 1].flatMap((side) => [
    // from the side streets by the river up to the Stonebow
    [side, HIGH_ST, -50.2, -36.6, 3],
    // north of the Stonebow, either side of the to-let plots, on up to the foot of Steep Hill
    [side, HIGH_ST, -58, -53.8, 1],
    [side, HIGH_ST, -76, -64.4, 3],
  ] as [number, number, number, number, number][]),
  [-1, BAILGATE.x1, WESTGATE.z + WESTGATE.half, CLOSE.z0, 4], // the west side stops at the corner of Westgate
  [1, BAILGATE.x1, NEWPORT.z + NEWPORT.d / 2 + 0.6, CLOSE.z0, 5],
  [-1, 5, CORNHILL[0].z0, CORNHILL[0].z1, 3, CORNHILL[0].x0 + 5], // backing onto the Town Hall, fronts onto the square
];
export const SHOPFRONTS = SHOP_RUNS.flatMap(([side, front, z0, z1, n, cx = 0], r) => {
  const len = (z1 - z0) / n,
    deep = front === HIGH_ST ? SHOPFRONT.deep : SHOPFRONT.bailgate;
  return Array.from({ length: n }, (_, i) => ({ side, x: cx + side * (front + deep / 2), z: z0 + len * (i + 0.5), len, deep, k: r * 2 + i, i, bailgate: front === BAILGATE.x1 }));
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

// The paved side streets off the High Street just north of High Bridge, along the north bank of the Witham:
// west to the Brayford's east quay, and east in front of Waterside as far as the footbridge over to Cornhill.
// The Stonebow stands a little further up the High Street, beyond Waterside, as in real Lincoln.
const sideZ = { z0: -36.2, z1: RIVER.z - RIVER.half - 1.2 };
export const STONEBOW_STREETS = [
  { x0: brayford.x + BRAYFORD.water.x1 + 0.4, x1: -HIGH_ST, ...sideZ },
  { x0: HIGH_ST, x1: EAST_PATH_X + 1, ...sideZ },
];

// The railway: two tracks running east to west across the town, south of the Workshop and HQ,
// fenced off on both sides. It crosses the main road at a level crossing, as the real line crosses
// Lincoln's High Street. gap is each track's offset from the centre line, fence the fences' offset,
// and crossing the half-width of the gap left in the fences for the road and its pavements.
export const RAIL = { z: 18.5, gap: 1.6, fence: 3.6, crossing: 4.6 };
// Set every frame by the railway while the barriers are down.
// wharf is the same for the crossing on Brayford Wharf East.
export const CROSSING = { closed: false, wharf: false, tritton: false };
// Tritton Road and Tritton Retail Park, out west: the road runs south off the tank roundabout, over the railway on a
// level crossing of its own, to the retail park on the west side of the Witham. The park is a car park with an L of
// big shop units round its south and east sides (their fronts facing it), a to-let unit at the south end of the east
// row and a coffee drive-through by the way in. The east row leaves a walkway through from the Witham footbridge. Each unit is
// [x0, x1, z0, z1] with face "n" or "w" for the side its front is on; bays are the parked cars, in world coordinates.
const TRITTON_X = PLACES.find((p) => p.kind === "tank")!.x;
const TRITTON_PARK = { x0: -79, x1: -50, z0: 30, z1: 60 };
const BAY_XS = Array.from({ length: 9 }, (_, i) => -76.65 + i * 2.7);
const BAY_ROWS = [
  { z: 33, face: 1 },
  { z: 49, face: -1 },
  { z: 54, face: 1 },
];
const bayRand = seeded(91);
export const TRITTON = {
  x: TRITTON_X,
  road: { half: 3, pave: 4.3, z0: 4.3, z1: SOUTH }, // on south over the Witham on a road bridge, to the edge of the map
  bridge: { z: 100, half: 2.6 }, // where it crosses the Witham's westward stretch
  park: TRITTON_PARK,
  units: [
    { name: "DIY", x0: -79, x1: -66, z0: 63, z1: 73, face: "n", color: 0xe8732a },
    { name: "Furniture", x0: -66, x1: -56, z0: 63, z1: 73, face: "n", color: 0x2b59c3 },
    { name: "Electricals", x0: -56, x1: -47, z0: 63, z1: 73, face: "n", color: 0xd1242f },
    { name: "Sports", x0: -47, x1: -38.5, z0: 63, z1: 73, face: "n", color: 0x2f8f5b },
    { name: "Pets", x0: -48, x1: -38.5, z0: 28, z1: 39.5, face: "w", color: 0x1fb5a8 },

  ],
  pod: { name: "Coffee", x0: -71, x1: -65, z0: 20, z1: 25, color: 0x7a4a2e },
  // round the back of the south row: a lorry unloading at the DIY unit's loading bay
  lorry: { x0: -78.5, x1: -65.5, z0: 75.8, z1: 78.2 },
  // a planted island with a tree at the east end of the double row of bays, trolley shelters on it and on the
  // pavement in front of the DIY unit, and a bus stop on Tritton Road by the way in
  island: { x0: -53.6, x1: -52.6, z0: 46.5, z1: 56.5 },
  shelters: [
    { x: -53.1, z: 53.5, rot: Math.PI / 2 },
    { x: -73, z: 61.9, rot: 0 },
  ],
  busStop: { x: -89.6, z: 34, rot: Math.PI / 2 },
  // the to-let unit is an empty shell with its own frontage, solid like the rest (in its own coordinates)
  shell: { x0: -5.7, x1: 5.7, z0: -4.75, z1: 3.4 },
  bays: BAY_ROWS.flatMap((r) => BAY_XS.map((x) => ({ x, z: r.z, face: r.face }))),
  cars: [] as { x: number; z: number; face: number; k: number }[],
};
TRITTON.cars = TRITTON.bays.filter(() => bayRand() < 0.6).map((b, k) => ({ ...b, k }));
export const TRITTON_CAR = { w: 1.5, len: 3.3 };
export const TRITTON_SHELTER = { w: 2.6, d: 1.1 };
const TRITTON_BOXES = [
  ...TRITTON.units.map((u) => ({ x0: u.x0, x1: u.x1, z0: u.z0, z1: u.z1 })),
  { x0: TRITTON.pod.x0, x1: TRITTON.pod.x1, z0: TRITTON.pod.z0, z1: TRITTON.pod.z1 },
  TRITTON.lorry,
  ...[...TRITTON.shelters, TRITTON.busStop].map((sh) => {
    const side = Math.abs(Math.sin(sh.rot)) > 0.5;
    const [hx, hz] = side ? [TRITTON_SHELTER.d / 2, TRITTON_SHELTER.w / 2] : [TRITTON_SHELTER.w / 2, TRITTON_SHELTER.d / 2];
    return { x0: sh.x - hx, x1: sh.x + hx, z0: sh.z - hz, z1: sh.z + hz };
  }),
  ...TRITTON.cars.map((c) => ({ x0: c.x - TRITTON_CAR.w / 2, x1: c.x + TRITTON_CAR.w / 2, z0: c.z - TRITTON_CAR.len / 2, z1: c.z + TRITTON_CAR.len / 2 })),
];
const TRITTON_PAVED = [
  { x0: TRITTON_X - TRITTON.road.pave, x1: TRITTON_X + TRITTON.road.pave, z0: TRITTON.road.z0, z1: TRITTON.road.z1 },
  { x0: TRITTON_PARK.x0, x1: -38.5, z0: 20, z1: 73 },
  { x0: -79, x1: -64, z0: 73, z1: 80 }, // the loading yard
];
const nearTritton = (x: number, z: number, pad: number) => TRITTON_PAVED.some((b) => x > b.x0 - pad && x < b.x1 + pad && z > b.z0 - pad && z < b.z1 + pad);
// (and the airfield's runway while the jet is using it: walkers wait at its edge, and one caught on it can walk off)
export const atBarrier = (x: number, z: number) =>
  (AIRFIELD_STATE.runway && onRunway(x, z, 0)) ||
  (Math.abs(z - RAIL.z) < RAIL.fence + 0.4 &&
    ((CROSSING.closed && Math.abs(x) < RAIL.crossing) || (CROSSING.wharf && Math.abs(x - WHARF_CROSSING.x) < WHARF_CROSSING.half) || (CROSSING.tritton && Math.abs(x - TRITTON_X) < RAIL.crossing)));
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
const pool = { x1: brayford.x + BRAYFORD.water.x1, z1: brayford.z + BRAYFORD.water.z1 };
const ROAD_EDGE = 4.3; // the main road's pavements
// St Marks: a paved street of shops off the High Street just south of the level crossing, running back from the
// pavement to Brayford Wharf East, with the old station building on the corner and two to-let units on its south side.
const stMarks = footprint(PLACES.find((p) => p.id === "st-marks")!);
const stMarksLot = footprint(PLACES.find((p) => p.id === "st-marks-1")!);
export const ST_MARKS = {
  street: { x0: WHARF_EAST.x0, x1: -ROAD_EDGE, z0: stMarks.z1, z1: stMarksLot.z0 },
  // the shops along the street: two in a row west of the old station building facing south onto it, and one
  // on the south side west of the two to-let units, facing north. Each is [x, z, along, deep, rot] like a bar.
  units: [
    ...[0, 1].map((i) => ({ x: WHARF_EAST.x1 + 2.5 + i * 5, z: (stMarks.z0 + stMarks.z1) / 2, len: 5, deep: stMarks.z1 - stMarks.z0, rot: 0 })),
    { x: WHARF_EAST.x1 + 2.5, z: (stMarksLot.z0 + stMarksLot.z1) / 2, len: 5, deep: stMarksLot.z1 - stMarksLot.z0, rot: Math.PI },
  ],
};
// The Witham coming up from the south into the Brayford's south-east corner, between the University on its
// west bank and Brayford Wharf East on its east bank, as in real Lincoln. It passes under the main road on a road
// bridge and under the railway on a rail bridge, runs on south past the back of St Marks, then turns west at
// bend and leaves the map towards Boultham. foot is the footbridge from the end of the St Marks street over to
// the open ground on its west bank. uni is the University Bridge, the concrete footbridge from Brayford Wharf East
// over to the campus, level with the middle of the University building, and uniHalf half its width.
const university = PLACES.find((p) => p.kind === "campus")!;
export const WITHAM = { x: pool.x1 + 1, half: RIVER.half, z0: pool.z1, bend: 100, foot: (ST_MARKS.street.z0 + ST_MARKS.street.z1) / 2, footHalf: 1.2, uni: university.z, uniHalf: 1.4 };
// Brayford Wharf East carried on south of the main road, over the railway on its own level crossing for people on
// foot, down the river bank to the end of the St Marks street.
export const WHARF_EAST_SOUTH = { x0: WHARF_EAST.x0, x1: WHARF_EAST.x1, z0: ROAD_EDGE, z1: ST_MARKS.street.z1 };
export const WHARF_CROSSING = { x: (WHARF_EAST.x0 + WHARF_EAST.x1) / 2, half: (WHARF_EAST.x1 - WHARF_EAST.x0) / 2 };
// The path along the Witham's west bank between the University and the water, from the Brayford's south quay to the main road.
const W0 = WITHAM.x - WITHAM.half;
export const WEST_BANK = { x0: W0 - 2.9, x1: W0 - 0.5, z0: brayford.z + brayford.d / 2, z1: -ROAD_EDGE };
// The open water, north to south and then the stretch running off west: out of the pool to the road bridge,
// either side of the University Bridge, on to the rail bridge, on south past St Marks either side of the footbridge
// to the bend, and away west.
const footZ = [WITHAM.foot - WITHAM.footHalf, WITHAM.foot + WITHAM.footHalf];
export const WITHAM_RUNS = [
  [WITHAM.z0, WITHAM.uni - WITHAM.uniHalf],
  [WITHAM.uni + WITHAM.uniHalf, -ROAD_EDGE],
  [ROAD_EDGE, RAIL.z - RAIL.fence],
  [RAIL.z + RAIL.fence, footZ[0]],
  [footZ[1], WITHAM.bend - WITHAM.half],
]
  .map(([z0, z1]) => ({ x0: W0, x1: WITHAM.x + WITHAM.half, z0, z1 }))
  .concat({ x0: -BOUND - 4, x1: WITHAM.x + WITHAM.half, z0: WITHAM.bend - WITHAM.half, z1: WITHAM.bend + WITHAM.half });
const WITHAM_BOXES = WITHAM_RUNS.map((r) => ({ ...r, x0: r.x0 - 0.3, x1: r.x1 + 0.3, z1: r.z1 === WITHAM.bend + WITHAM.half ? r.z1 + 0.3 : r.z1 })).flatMap((b) =>
  // open where Tritton Road's bridge crosses the westward stretch
  b.z1 > WITHAM.bend && b.x0 < TRITTON_X ? [{ ...b, x1: TRITTON_X - TRITTON.road.pave }, { ...b, x0: TRITTON_X + TRITTON.road.pave }] : [b],
);
// The two pockets of ground on the Witham's west bank, closed in by the river, the pool and the Fossdyke or the
// railway: n north of the railway, reached over the road bridge or the University Bridge, and s south of it, reached
// over the footbridge. For each, the points either side of its bridge, east bank first.
const pocket = (x: number, z: number) =>
  x > W0 - 0.4 ? null : z > WITHAM.z0 && z < RAIL.z - RAIL.fence ? "n" : z > RAIL.z + RAIL.fence && z < WITHAM.bend - WITHAM.half ? "s" : null;
const WEST_PATH_X = (WEST_BANK.x0 + WEST_BANK.x1) / 2;
// The Brayford's door is on its south quay, in the gap between the University and the Engine Shed: go up the west bank
// path to the quay and along it, rather than straight at the door through the shed.
APPROACH.brayford = [
  [WEST_PATH_X, -21],
  [-46, -20.4],
];
// The Architecture building is out west past the campus, and the straight line to its door from the bridge landing runs
// through the Engine Shed: go along the grass in front of the campus instead.
APPROACH.architecture = [
  [WEST_PATH_X, -6],
  [-79.5, -6.5],
];
// Tritton Retail Park: its door is on Tritton Road at the end of the aisle between the parking rows, and the to-let
// unit's at the east end of that aisle, by the walkway off the Witham footbridge.
// Bullwhip sits behind Front Desk with its door on the Brayford Wharf East path: in off the main road at the top of
// the path and down it over the wharf's own level crossing, rather than through Front Desk from the High Street. Both
// points stay up on the main road so a walk from south of the railway joins the path at its top as well (a point down
// by the door would be the nearest one, and the walk to it would cut across Front Desk).
APPROACH.bullwhip = [
  [WHARF_CROSSING.x, 0],
  [WHARF_CROSSING.x, ROAD_EDGE - 1.3],
];
APPROACH["tritton-park"] = [[-78, 42]];
APPROACH["tritton-unit"] = [
  [-44, 43.5],
  [-49.8, 46],
];
const POCKET_BRIDGES: Record<"n" | "s" | "uni", [number, number][]> = {
  n: [
    [WHARF_CROSSING.x, 0],
    [WEST_PATH_X, 0],
  ],
  // in off the High Street along the St Marks street, so as not to cut across the shops
  s: [
    [-ROAD_EDGE - 1.5, WITHAM.foot],
    [WHARF_CROSSING.x, WITHAM.foot],
    [W0 - 2.5, WITHAM.foot],
  ],
  uni: [
    [WHARF_CROSSING.x, WITHAM.uni],
    [WEST_PATH_X, WITHAM.uni],
  ],
};
// Which bridge a walk into or out of a pocket uses: from the north pocket's campus side to anywhere north of the main
// road, the University Bridge; otherwise the pocket's own.
const pocketBridge = (p: "n" | "s", [, z]: [number, number], [, oz]: [number, number]) =>
  p === "n" && z < -ROAD_EDGE && oz < -ROAD_EDGE ? POCKET_BRIDGES.uni : POCKET_BRIDGES[p];
// Waypoints out of a west-bank pocket to the east bank, and the other way in, other being the far end of the walk.
// The University and the Brayford's south quay are reached along the west bank path.
function leaveWitham([x, z]: [number, number], other: [number, number]) {
  const p = pocket(x, z);
  if (!p) return [];
  const pts: [number, number][] = p === "n" && z < -ROAD_EDGE ? [[WEST_PATH_X, z]] : [];
  return [...pts, ...pocketBridge(p, [x, z], other).slice().reverse()];
}
function enterWitham([x, z]: [number, number], other: [number, number]) {
  const p = pocket(x, z);
  if (!p) return [];
  const pts = pocketBridge(p, [x, z], other).slice();
  if (p === "n" && z < -ROAD_EDGE) pts.push([WEST_PATH_X, z]);
  return pts;
}

// Runs of fence along each side of the line, west to east.
export const RAIL_FENCE_RUNS: [number, number][] = [
  [-BOUND, TRITTON_X - RAIL.crossing], // open where Tritton Road crosses
  [TRITTON_X + RAIL.crossing, WHARF_EAST.x0],
  [WHARF_EAST.x1, -RAIL.crossing],
  [RAIL.crossing, STATION.x0],
  [STATION.x1, PELHAM.x0 - 0.6], // left open under Pelham Bridge
  [PELHAM.x1 + 0.6, EAST],
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
// Out of a pocket on the Witham's west bank first, if setting off from one, and into one last.
// In or out of the airfield, through its gate; and round its fence otherwise.
export function crossings(from: [number, number], to: [number, number]): [number, number][] {
  const a = inAirfield(from),
    b = inAirfield(to);
  const outside = (f: [number, number], t: [number, number]) => aroundAirfield([f, ...townCrossings(f, t), t]).slice(1, -1);
  if (a && b) return aroundStand([from, to]).slice(1, -1);
  if (a) return [...aroundStand([from, AF_IN]).slice(1), AF_OUT, ...outside(AF_OUT, to)];
  if (b) return [...outside(from, AF_OUT), AF_OUT, ...aroundStand([AF_IN, to]).slice(0, -1)];
  return throughCastle([from, ...outside(from, to), to]).slice(1, -1);
}
function townCrossings(from: [number, number], to: [number, number]): [number, number][] {
  const off = leaveDyke(from, to),
    on = leaveDyke(to, from).reverse();
  if (off.length || on.length) return aroundDyke([from, ...off, ...townCrossings(off.at(-1) ?? from, on[0] ?? to), ...on, to]).slice(1, -1);
  const a = pocket(...from),
    b = pocket(...to);
  if (a && a === b) return [];
  if (a && b) {
    // both on the Witham's west bank, either side of the railway: over Tritton Road's level crossing
    // (round the east side of the roundabout's island from north of the main road, and down the road to the car park's
    // aisle for the retail park)
    const [np, sp] = a === "n" ? [from, to] : [to, from];
    const north: [number, number][] = [...(np[1] < ROAD_EDGE ? [[TRITTON_X + 7, 0] as [number, number]] : []), [TRITTON_X, RAIL.z - RAIL.fence - 1]];
    const south: [number, number][] = [[TRITTON_X, RAIL.z + RAIL.fence + 1], ...(sp[1] > TRITTON_PARK.z0 && sp[0] > TRITTON_X ? [[TRITTON_X, 42] as [number, number]] : [])];
    const way = [...north, ...south];
    return throughGate(aroundDyke([from, ...(a === "n" ? way : way.reverse()), to])).slice(1, -1);
  }
  const pts: [number, number][] = leaveWitham(from, to);
  let at = pts.at(-1) ?? from;
  const end = enterWitham(to, from);
  const goal = end[0] ?? to;
  for (const leg of goal[1] > at[1] ? [overRiver, overRailway] : [overRailway, overRiver]) {
    const p = leg(at, goal);
    pts.push(...p);
    at = p.at(-1) ?? at;
  }
  return throughGate(aroundDyke([from, ...pts, ...end, to])).slice(1, -1);
}

// The roundabout on the main road out west with the tank memorial in the middle, as at the start of
// Tritton Road. island is the radius of the raised middle, ring the outer edge of the road round it,
// and edge the outer edge of the pavement.
const tank = PLACES.find((p) => p.kind === "tank")!;
export const ROUNDABOUT = { x: tank.x, z: tank.z, island: 4.3, ring: 6.8, edge: 8.2 };

// Two cannons guarding the castle gate, on the right as you face it, clear of the footpath coming up from the south (in
// the castle's own coordinates).
export const CANNONS = [4.8, 7.6].map((x) => ({ x, z: castlePlace.d / 2 + 2.6 }));

// Lincoln Castle's bailey, in the castle's own coordinates: x along the East Gate's wall (+x north), z from the back
// wall to the front (+z east, the East Gate on Castle Square). The walls and their towers, the two mottes on the south
// side (Lucy Tower's at the west end, the Observatory Tower's at the east end, as in real Lincoln), and the buildings
// inside are solid; the rest of the bailey is open lawn, reached through the East Gate or the West Gate. The bailey
// is drawn square-cornered: the real one is an irregular four-sided shape.
const CHW = castlePlace.w / 2,
  CHD = castlePlace.d / 2;
export const CASTLE = {
  hw: CHW,
  hd: CHD,
  wall: 5,
  thick: 1.2,
  westGate: 7, // where the West Gate sits along the back wall
  lucy: { x: -CHW + 5.5, z: -CHD + 5.5, r: 6.2, h: 3 },
  observatory: { x: -CHW + 5, z: CHD - 5, r: 4.6, h: 2.5 },
  // the Victorian prison along the north wall, the Magna Carta Vault beside it, the Crown Court by the West Gate
  prison: { x0: CHW - 6.5, x1: CHW - 0.6, z0: -3, z1: 7 },
  vault: { x0: CHW - 5, x1: CHW - 0.6, z0: -10, z1: -4 },
  court: { x0: -3, x1: 4.5, z0: -CHD + 2, z1: -CHD + 7 },
};
const sq = (x: number, z: number, r: number) => ({ x0: x - r, x1: x + r, z0: z - r, z1: z + r });
const padded = (b: { x0: number; x1: number; z0: number; z1: number }, pad = 0.3) => ({ x0: b.x0 - pad, x1: b.x1 + pad, z0: b.z0 - pad, z1: b.z1 + pad });
const WG = CASTLE.westGate;
const CASTLE_BOXES = [
  // north and south walls
  { x0: CHW - 0.6, x1: CHW + 0.6, z0: -CHD, z1: CHD },
  { x0: -CHW - 0.6, x1: -CHW + 0.6, z0: -CHD, z1: CHD },
  // back wall either side of the West Gate, its gatehouse a little deeper
  { x0: -CHW, x1: WG - 1.2, z0: -CHD - 0.6, z1: -CHD + 0.6 },
  { x0: WG + 1.2, x1: CHW, z0: -CHD - 0.6, z1: -CHD + 0.6 },
  { x0: WG - 2.2, x1: WG - 1.2, z0: -CHD - 1.2, z1: -CHD + 1.2 },
  { x0: WG + 1.2, x1: WG + 2.2, z0: -CHD - 1.2, z1: -CHD + 1.2 },
  // front wall either side of the East Gate, the gatehouse deeper but set back inside the wall line, so the footpath up
  // alongside the wall stays clear
  { x0: -CHW, x1: -1.2, z0: CHD - 0.6, z1: CHD + 0.6 },
  { x0: 1.2, x1: CHW, z0: CHD - 0.6, z1: CHD + 0.6 },
  { x0: -3.2, x1: -1.2, z0: CHD - 2.4, z1: CHD + 0.6 },
  { x0: 1.2, x1: 3.2, z0: CHD - 2.4, z1: CHD + 0.6 },
  // round towers at the north corners, Cobb Hall the big one at the north-east (the south corners are the mottes')
  sq(CHW, CHD, 2.3),
  sq(CHW, -CHD, 1.9),
  // the mottes, too steep to walk up
  sq(CASTLE.lucy.x, CASTLE.lucy.z, CASTLE.lucy.r * 0.85),
  sq(CASTLE.observatory.x, CASTLE.observatory.z, CASTLE.observatory.r * 0.85),
  CASTLE.prison,
  CASTLE.vault,
  CASTLE.court,
  ...CANNONS.map((c) => ({ x0: c.x - 0.4, x1: c.x + 0.4, z0: c.z - 1, z1: c.z + 1 })),
].map((b) => padded(b));
// Just outside and just inside each gate, in world coordinates, for walks into and out of the bailey.
const castleAt = (x: number, z: number): [number, number] => {
  const b = toWorld(castlePlace, { x0: x, x1: x, z0: z, z1: z });
  return [b.x0, b.z0];
};
const CASTLE_GATES = [
  { out: castleAt(0, CHD + 2.4), in: castleAt(0, CHD - 3.4) },
  { out: castleAt(WG, -CHD - 2.4), in: castleAt(WG, -CHD + 7.5) }, // in past the Crown Court's front
];
const inBailey = ([x, z]: [number, number]) => x > castle.x0 + 1.5 && x < castle.x1 - 1.5 && z > castle.z0 + 1.5 && z < castle.z1 - 1.5;
// A walk into or out of the bailey goes through whichever gate is nearer the end that's outside.
function throughCastle(route: [number, number][]) {
  const out: [number, number][] = [route[0]];
  for (const b of route.slice(1)) {
    const a = out.at(-1)!;
    if (inBailey(a) !== inBailey(b)) {
      const far = inBailey(a) ? b : a;
      const d = (g: (typeof CASTLE_GATES)[number]) => Math.hypot(g.out[0] - far[0], g.out[1] - far[1]);
      const g = CASTLE_GATES.reduce((m, g) => (d(g) < d(m) ? g : m));
      out.push(...(inBailey(a) ? [g.in, g.out] : [g.out, g.in]));
    }
    out.push(b);
  }
  return out;
}

// The terraced streets east of the south road, down towards the football ground, as in real Lincoln. Canwick Road
// carries on south from the foot of Pelham Bridge. Tentercroft Street (nearest the railway, at the foot of the bridge),
// Portland Street, Monson Street and Scorer Street (just north of the ground) each run east from the south road, across Sincil Bank,
// to Canwick Road. Sincil Bank runs south past the ground's west side, where the turnstiles are. half is the road's
// half width, pave the pavement's outer edge. Each house is in its own coordinates, front (the door) at +z, turned by
// rot to face its street.
export const SIDE = { half: 2.6, pave: 3.3 };
export const CANWICK = { x: (PELHAM.x0 + PELHAM.x1) / 2, half: 3, pave: (PELHAM.x1 - PELHAM.x0) / 2, z0: PELHAM.z1 - 2, z1: SOUTH };
export const SINCIL = { x: 24, z0: 32.4, z1: 160 };
// The fire station and the ambulance station behind the stadium, both facing Canwick Road across a forecourt that runs
// out to its pavement. bays are the z of each bay door along their fronts; lanes are the driving lines' offsets from a
// road's centre (on the left, as in the UK) on Canwick Road and on the narrower streets.
const firePlace = PLACES.find((p) => p.id === "fire-station")!,
  ambPlace = PLACES.find((p) => p.id === "ambulance-station")!;
const fireBox = footprint(firePlace),
  ambBox = footprint(ambPlace);
export const EMERGENCY = {
  front: fireBox.x1, // both fronts line up
  fire: { ...fireBox, bays: [fireBox.z0 + 2.6, fireBox.z0 + 6.6, fireBox.z0 + 10.6] },
  amb: { ...ambBox, bays: [ambBox.z0 + 2.2, ambBox.z0 + 5.8] },
  forecourts: [
    { x0: fireBox.x1, x1: CANWICK.x - CANWICK.pave, z0: fireBox.z0, z1: fireBox.z1 },
    { x0: ambBox.x1, x1: CANWICK.x - CANWICK.pave, z0: ambBox.z0, z1: ambBox.z1 },
  ],
  lane: 1.5,
  sideLane: 1.2,
};
const nearEmergency = (x: number, z: number, pad: number) =>
  [fireBox, ambBox, ...EMERGENCY.forecourts].some((b) => x > b.x0 - pad && x < b.x1 + pad && z > b.z0 - pad && z < b.z1 + pad);
// Tentercroft and Scorer Streets fixed at either end, the four evenly spaced between them.
const STREET_N = 35.75,
  STREET_S = 117,
  SIDE_GAP = (STREET_S - STREET_N) / 3;
export const SIDE_STREETS = ["Tentercroft Street", "Portland Street", "Monson Street", "Scorer Street"].map((name, i) => ({ name, z: STREET_N + i * SIDE_GAP, x0: 0, x1: CANWICK.x }));
// Walks to either come down Canwick Road to the corner of Scorer Street, then across the forecourt, clear of the
// street's terraces.
APPROACH["fire-station"] = APPROACH["ambulance-station"] = [[CANWICK.x - CANWICK.pave + 0.8, SIDE_STREETS[3].z]];
export const TERRACE = { w: 4.4, d: 4, h: 3.6, gap: 0.1, alley: 2.6 };
const TERRACE_SET = SIDE.pave + 0.3 + TERRACE.d / 2; // from the street's centre line to the middle of a house
type TerraceHouse = { x: number; z: number; rot: number; k: number };
// a row of houses from a to b along a street, with an alley through after every fifth house so the backs can be reached
function terraceRow(a: number, b: number, at: (u: number) => [number, number], rot: number, seed: number): TerraceHouse[] {
  const out: TerraceHouse[] = [];
  for (let u = a, n = 0; u + TERRACE.w <= b; n++) {
    if (n % 6 === 5) {
      u += TERRACE.alley;
      continue;
    }
    const [x, z] = at(u + TERRACE.w / 2);
    out.push({ x, z, rot, k: seed + n });
    u += TERRACE.w + TERRACE.gap;
  }
  return out;
}
const stadiumEnd = stadium.x1 + 3.5; // Scorer Street's south side only has houses past the ground
const ROW_X0 = SINCIL.x + SIDE.pave + 2.4,
  ROW_X1 = CANWICK.x - CANWICK.pave - 0.8;
export const TERRACES: TerraceHouse[] = SIDE_STREETS.flatMap((st, i) => [
  ...terraceRow(ROW_X0, ROW_X1, (x) => [x, st.z - TERRACE_SET], 0, i * 40), // north side, facing south onto the street
  ...terraceRow(st.name === "Scorer Street" ? stadiumEnd : ROW_X0, ROW_X1, (x) => [x, st.z + TERRACE_SET], Math.PI, i * 40 + 20),
  // and a pair along Sincil Bank's east side between this street and the next, facing west
  ...(i < SIDE_STREETS.length - 1
    ? terraceRow(st.z + TERRACE_SET + TERRACE.d / 2 + 1, SIDE_STREETS[i + 1].z - TERRACE_SET - TERRACE.d / 2 - 1, (z) => [SINCIL.x + TERRACE_SET, z], -Math.PI / 2, 200 + i * 10)
    : []),
]);
// Older houses along the streets round the castle, in the same terraced rows: along Westgate's north side from Ellis
// Mill to Bailgate, both sides of the castle on its south side (between Burton Road and Union Road, and from the
// castle's north-east corner to Bailgate), and down Burton Road's west side.
const UP_SET = 0.4 + TERRACE.d / 2;
const millBox = footprint(PLACES.find((p) => p.id === "ellis-mill")!);
const WG_N = WESTGATE.z - WESTGATE.half - UP_SET,
  WG_S = WESTGATE.z + WESTGATE.half + UP_SET;
export const CASTLE_TERRACES: TerraceHouse[] = [
  ...terraceRow(millBox.x1 + 2, WESTGATE.x1 - 5, (x) => [x, WG_N], 0, 300),
  ...terraceRow(BURTON.x - BURTON.half, UNION.x - UNION.half - 0.4, (x) => [x, WG_S], Math.PI, 340),
  ...terraceRow(castle.x1 + 3, WESTGATE.x1 - 4.5, (x) => [x, WG_S], Math.PI, 360),
  ...terraceRow(NORTH + 1, WESTGATE.z + WESTGATE.half, (z) => [BURTON.x - BURTON.half - UP_SET, z], Math.PI / 2, 380),
];
export const terraceBox = (h: TerraceHouse) => {
  const side = Math.abs(Math.sin(h.rot)) > 0.5;
  const [hx, hz] = side ? [TERRACE.d / 2, TERRACE.w / 2] : [TERRACE.w / 2, TERRACE.d / 2];
  return { x0: h.x - hx, x1: h.x + hx, z0: h.z - hz, z1: h.z + hz };
};
// The streets' paved area, for keeping trees off them.
export const SINCIL_PAVED = [
  ...SIDE_STREETS.map((st) => ({ x0: st.x0, x1: st.x1, z0: st.z - SIDE.pave, z1: st.z + SIDE.pave })),
  { x0: SINCIL.x - SIDE.pave, x1: SINCIL.x + SIDE.pave, z0: SINCIL.z0, z1: SINCIL.z1 },
  { x0: CANWICK.x - CANWICK.pave, x1: CANWICK.x + CANWICK.pave, z0: CANWICK.z0, z1: CANWICK.z1 },
];
const nearSincil = (x: number, z: number, pad: number) => [...SINCIL_PAVED, ...TERRACES.map(terraceBox), ...DYKE_RUNS].some((b) => x > b.x0 - pad && x < b.x1 + pad && z > b.z0 - pad && z < b.z1 + pad);

// The Sincil Dyke: water in stone banks down the west side of Sincil Bank (the street), north up to the railway, east
// behind the station's south platform and on under Pelham Bridge, then north under the railway and the main road to
// join the Witham east of Broadgate, near Stamp End. It goes through a culvert under each road it meets, which is
// where it can be crossed on foot. x is the stretch beside Sincil Bank, z the stretch behind the station, east the
// stretch up to the river.
export const DYKE = { half: 1, x: SINCIL.x - SIDE.pave - 1.4, z: 25.6, east: 100, north: RIVER.z + RIVER.half - 0.4 };
const DYKE_A_GAPS: [number, number][] = [...SIDE_STREETS.map((st): [number, number] => [st.z - SIDE.pave, st.z + SIDE.pave]), [STADIUM_ROAD.z - 4.3, STADIUM_ROAD.z + 4.3]];
const DYKE_C_GAPS: [number, number][] = [
  [-ROAD_EDGE, ROAD_EDGE],
  [RAIL.z - RAIL.fence - 0.3, RAIL.z + RAIL.fence + 0.3],
];
export const DYKE_CULVERTS = { a: DYKE_A_GAPS, c: DYKE_C_GAPS };
// the open water from a to b, broken where gaps cross it
const between = (a: number, b: number, gaps: [number, number][]) => {
  const cuts = [a, ...gaps.flatMap(([g0, g1]) => [g0, g1]), b];
  return Array.from({ length: cuts.length / 2 }, (_, i): [number, number] => [cuts[2 * i], cuts[2 * i + 1]]);
};
const DH = DYKE.half;
export const DYKE_RUNS = [
  ...between(DYKE.z - DH, SOUTH + 6, DYKE_A_GAPS).map(([z0, z1]) => ({ x0: DYKE.x - DH, x1: DYKE.x + DH, z0, z1 })),
  { x0: DYKE.x - DH, x1: DYKE.east + DH, z0: DYKE.z - DH, z1: DYKE.z + DH }, // runs on under Pelham Bridge, high above it
  ...between(DYKE.north, DYKE.z + DH, DYKE_C_GAPS).map(([z0, z1]) => ({ x0: DYKE.east - DH, x1: DYKE.east + DH, z0, z1 })),
];
// Solid like the river's banks, bar under Pelham Bridge, where the Imp walks over it on the deck.
const DYKE_BOXES = DYKE_RUNS.flatMap((r) => {
  const box = { x0: r.x0 - 0.3, x1: r.x1 + 0.3, z0: r.z0 - 0.3, z1: r.z1 + 0.3 };
  if (r.z1 - r.z0 > r.x1 - r.x0) return [box];
  return [
    { ...box, x1: PELHAM.x0 },
    { ...box, x0: PELHAM.x1 },
  ];
});
// Which side of the dyke a point is on: past the stretch beside Sincil Bank (the side streets' east ends, Canwick Road
// and beyond), or past the stretch up to the river (between the main road and the Witham, east of it).
const eastOfA = ([x, z]: [number, number]) => x > DYKE.x && z > DYKE.z + DH;
const eastOfC = ([x, z]: [number, number]) => x > DYKE.east && z > DYKE.north && z < RAIL.z;
// Leaving one of those for anywhere else: over the dyke at the culvert that's least out of the way first.
// Along its street to the culvert (the stadium road's only for the ground's own entrance side), then over.
function leaveDyke(p: [number, number], other: [number, number]): [number, number][] {
  if (eastOfA(p) && !eastOfA(other)) {
    const oz = Math.max(other[1], DYKE.z);
    const ways = DYKE_A_WAYS.filter((c) => c !== STADIUM_ROAD.z || p[0] < stadium.x0 + 1);
    const c = ways.reduce((m, c) => (2 * Math.abs(p[1] - c) + Math.abs(oz - c) < 2 * Math.abs(p[1] - m) + Math.abs(oz - m) ? c : m));
    const along: [number, number][] = p[0] > DYKE.x + 3.5 && Math.abs(p[1] - c) > 0.5 ? [[p[0], c]] : [];
    return [...along, [DYKE.x + 3, c], [DYKE.x - 3, c], [0, c]]; // and out onto the south road
  }
  if (eastOfC(p) && !eastOfC(other))
    return [
      [DYKE.east + 3, 0],
      [DYKE.east - 3, 0],
    ];
  return [];
}
// Waypoints round the dyke: a walk that would still cross it away from a culvert goes over the nearest one instead.
const DYKE_A_WAYS = DYKE_A_GAPS.map(([g0, g1]) => (g0 + g1) / 2);
function aroundDyke(route: [number, number][]) {
  const out: [number, number][] = [route[0]];
  const cross = (a: [number, number], b: [number, number], x: number) => a[1] + ((x - a[0]) / (b[0] - a[0])) * (b[1] - a[1]);
  for (const b of route.slice(1)) {
    const a = out.at(-1)!;
    if ((a[0] - DYKE.x) * (b[0] - DYKE.x) < 0) {
      const z = cross(a, b, DYKE.x);
      if (z > DYKE.z - DH - 0.5 && !DYKE_A_GAPS.some(([g0, g1]) => z > g0 + 0.6 && z < g1 - 0.6)) {
        const c = DYKE_A_WAYS.reduce((m, c) => (Math.abs(a[1] - c) + Math.abs(b[1] - c) < Math.abs(a[1] - m) + Math.abs(b[1] - m) ? c : m));
        const s = Math.sign(a[0] - DYKE.x);
        out.push([DYKE.x + s * 3, c], [DYKE.x - s * 3, c]);
      }
    }
    if ((a[0] - DYKE.east) * (b[0] - DYKE.east) < 0) {
      const z = cross(a, b, DYKE.east);
      if (z > DYKE.north - 0.5 && z < DYKE.z + DH + 0.5 && Math.abs(z) > ROAD_EDGE - 0.6) {
        const s = Math.sign(a[0] - DYKE.east);
        out.push([DYKE.east + s * 3, 0], [DYKE.east - s * 3, 0]);
      }
    }
    out.push(b);
  }
  return out;
}

// The seasonal market adds its own solid parts while it's in town (MoreLandmarks.tsx).
const boxes = PLACES.filter((p) => !["tank", "gate", "arch", "market", "gatehouse", "lawn", "retailpark"].includes(p.kind ?? "shop")).flatMap((p) => {
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
  if (p.kind === "hill") return LINDUM.houses.map(lindumBox); // the road is open, its houses solid
  if (p.kind === "flyover") return PELHAM_PARAPETS;
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
  if (p.kind === "castle") return CASTLE_BOXES.map((b) => toWorld(p, b)); // the bailey's open, its walls and buildings solid
  if (p.kind === "oldhouse") return [f]; // fills its plot in the row exactly, like the houses either side
  if (p.kind === "airfield") {
    // the runway and apron are walkable; the buildings, the cars and the fence are solid (the parked jet only while it's
    // there, in blocked)
    const cars = AIRFIELD.cars.map((c) => ({ x0: c.x - AIRFIELD_CAR.len / 2, x1: c.x + AIRFIELD_CAR.len / 2, z0: c.z - AIRFIELD_CAR.w / 2, z1: c.z + AIRFIELD_CAR.w / 2 }));
    return [AIRFIELD.hangar, AIRFIELD.tower, AIRFIELD.heritage, AIRFIELD.guard, ...cars, ...AIRFIELD_FENCE].map((b) => toWorld(p, b));
  }
  return [{ x0: f.x0 - 0.4, x1: f.x1 + 0.4, z0: f.z0 - 0.4, z1: f.z1 + 0.4 }];
}).concat(HOUSES.map((h) => ({ x0: h.x - HOUSE.d / 2, x1: h.x + HOUSE.d / 2, z0: h.z - HOUSE.w / 2, z1: h.z + HOUSE.w / 2 })), SHOPFRONTS.map((h) => ({ x0: h.x - h.deep / 2, x1: h.x + h.deep / 2, z0: h.z - h.len / 2, z1: h.z + h.len / 2 })), STALLS.map((s) => ({ x0: s.x - STALL.w / 2, x1: s.x + STALL.w / 2, z0: s.z - STALL.d / 2, z1: s.z + STALL.d / 2 })), WHARF_BARS.map(barBox), ST_MARKS.units.map(barBox), TERRACES.map(terraceBox), CASTLE_TERRACES.map(terraceBox), TRITTON_BOXES, STONEBOW_PIERS, NEWPORT_PIERS, EXCHEQUER_BOXES, MINSTER.south.map(yardBox), RIVER_BOXES, WITHAM_BOXES, RAIL_FENCES, STATION_BOXES, DYKE_BOXES);

const HIGH_STREET = { x0: -HIGH_ST, x1: HIGH_ST, z0: hill.z1, z1: -4.3 };
const onRoad = (x: number, z: number) =>
  Math.abs(x) < 7 ||
  (Math.abs(z) < 7 && x > -BOUND && x < EAST) ||
  (Math.abs(z - STADIUM_ROAD.z) < 7 && x < STADIUM_ROAD.x1) ||
  (Math.abs(z - AIRFIELD_ROAD.z) < 7 && x > AIRFIELD_ROAD.x0) ||
  Math.abs(z - RAIL.z) < RAIL.fence + 2 ||
  [CLOSE, BAILGATE, HIGH_STREET, ...CORNHILL, ...STONEBOW_STREETS, WHARF, WHARF_EAST, BUS_STATION.kerb, ...BUS_STATION.tarmac, ...STONEBOW_PIERS, ...NEWPORT_PIERS, ...EXCHEQUER_BOXES, MINSTER.forecourt, MINSTER.lawn, ...LINDUM_ROADBOXES, LINDUM.broadgate, LINDUM.link, flyover, ...RIVER_BOXES, ...WITHAM_RUNS, WHARF_EAST_SOUTH, ST_MARKS.street, WEST_BANK, ...ST_MARKS.units.map(barBox), ...FOOTPATHS.filter((f) => f !== LANDMARK_PATHS[0]), ...OLD_MILL_PATHS, ...STATION.platforms.map((pl) => ({ ...pl, x0: STATION.x0, x1: STATION.x1 }))].some((f) => x > f.x0 - 2 && x < f.x1 + 2 && z > f.z0 - 2 && z < f.z1 + 2);
const nearBuilding = (x: number, z: number, pad: number) =>
  HOUSES.some((h) => Math.abs(x - h.x) < HOUSE.d / 2 + pad && Math.abs(z - h.z) < HOUSE.w / 2 + pad) ||
  SHOPFRONTS.some((h) => Math.abs(x - h.x) < h.deep / 2 + pad && Math.abs(z - h.z) < h.len / 2 + pad) ||
  [...[...WHARF_BARS, ...ST_MARKS.units].map(barBox), ...MINSTER.south.map(yardBox), ...LINDUM.houses.map(lindumBox), OLD_BAILGATE_WEST].some((b) => x > b.x0 - pad && x < b.x1 + pad && z > b.z0 - pad && z < b.z1 + pad) ||
  PLACES.some((p) => {
    if (p.id.startsWith("tritton-") || EMERGENCY_IDS.includes(p.id)) return false; // added later, and cleared of trees afterwards instead
    const f = p.kind === "airfield" ? OLD_AIRFIELD : p.id === "ellis-mill" ? OLD_MILL : footprint(p); // the airfield grew later, the mill moved; as for Tritton
    const door = p.kind === "lot" ? 0 : 4; // keep the approach to each entrance clear
    const side = Math.abs(Math.sin(p.rot)) > 0.5; // entrance on an east or west face
    const dx = side ? door : 0,
      dz = side ? 0 : door;
    return x > f.x0 - pad - dx && x < f.x1 + pad + dx && z > f.z0 - pad - dz && z < f.z1 + pad + dz;
  });

// Trees scattered everywhere that isn't road, building or doorway. The first lot are laid out as they were before the
// map was widened west (so they haven't moved), then a second lot fill the new strip.
const OLD_BOUND = 76;
const EMERGENCY_IDS = ["fire-station", "ambulance-station"];
const OLD_AIRFIELD = { x0: -59, x1: -29, z0: 126, z1: 154 };
// Ellis Mill stood a little further south, and Bailgate's west shops ran on north past where Westgate now comes in.
const OLD_MILL = { x0: -65, x1: -59, z0: -155, z1: -149 };
const OLD_MILL_PATHS = [
  { x0: PATH_X + 4, x1: PATH_X + 6, z0: -148.2, z1: castlePlace.z - 4 },
  { x0: -63, x1: PATH_X + 4, z0: -148.2, z1: -146.2 },
];
const OLD_BAILGATE_WEST = { x0: -8.3, x1: -4.3, z0: -151.8, z1: -130 };
const nearCastleStreets = (x: number, z: number, pad: number) =>
  [...CASTLE_ROADS, ...CASTLE_TERRACES.map(terraceBox), ...LANDMARK_PATHS, millBox].some((b) => x > b.x0 - pad && x < b.x1 + pad && z > b.z0 - pad && z < b.z1 + pad);
export const TREES: [number, number, number][] = (() => {
  const out: [number, number, number][] = [];
  const free = (x: number, z: number) =>
    !onRoad(x, z) && !nearBuilding(x, z, 3) && Math.hypot(x - ROUNDABOUT.x, z - ROUNDABOUT.z) >= ROUNDABOUT.edge + 2 && !out.some(([ox, oz]) => Math.hypot(ox - x, oz - z) < 5);
  const rand = seeded(11);
  for (let tries = 0; out.length < 140 && tries < 6000; tries++) {
    const x = -OLD_BOUND + 3 + rand() * (OLD_BOUND + EAST - 6),
      z = NORTH + 3 + rand() * (SOUTH - NORTH - 6);
    if (free(x, z)) out.push([x, z, 0.85 + (out.length % 4) * 0.12]);
  }
  const west = seeded(12);
  for (let tries = 0, n = 0; n < 30 && tries < 3000; tries++) {
    const x = -BOUND + 3 + west() * (BOUND - OLD_BOUND),
      z = NORTH + 3 + west() * (SOUTH - NORTH - 6);
    if (free(x, z)) {
      out.push([x, z, 0.85 + (n % 4) * 0.12]);
      n++;
    }
  }
  // the streets down to Sincil Bank came later: the trees already there stay put, bar any in their way
  return [...out.filter(([x, z]) => !nearSincil(x, z, 2) && !nearTritton(x, z, 2) && !nearAirfield(x, z, 3.5) && !nearEmergency(x, z, 2) && !nearCastleStreets(x, z, 2)), ...YARD_TREES];
})();

const circles = TREES.map(([cx, cz, s]) => ({ cx, cz, r: 0.7 * s + 0.5 }));

// Solid boxes that come and go while the town is up, like a visitor's own shop built on a plot, by id.
export const EXTRA_BOXES = new Map<string, { x0: number; x1: number; z0: number; z1: number }>();

// barrier: whether the level crossing counts as blocked while its barriers are down.
export function blocked(x: number, z: number, barrier = true) {
  if (barrier && atBarrier(x, z)) return true;
  if (AIRFIELD_STATE.parked && x > STAND_BOX.x0 && x < STAND_BOX.x1 && z > STAND_BOX.z0 && z < STAND_BOX.z1) return true;
  if (x < -BOUND || x > EAST || z > SOUTH || z < NORTH) return true;
  if (Math.hypot(x - ROUNDABOUT.x, z - ROUNDABOUT.z) < ROUNDABOUT.island) return true;
  for (const c of circles) if (Math.hypot(x - c.cx, z - c.cz) < c.r) return true;
  for (const b of boxes) if (x > b.x0 && x < b.x1 && z > b.z0 && z < b.z1) return true;
  for (const b of EXTRA_BOXES.values()) if (x > b.x0 && x < b.x1 && z > b.z0 && z < b.z1) return true;
  return false;
}

// Whether the Imp could walk straight from a to b without running into anything (it's checked only at its centre).
export function clearLine([ax, az]: [number, number], [bx, bz]: [number, number]) {
  const len = Math.hypot(bx - ax, bz - az);
  if (len < 0.01) return true;
  const ux = (bx - ax) / len,
    uz = (bz - az) / len;
  for (let t = 0; t <= len; t += 0.4) if (blocked(ax + ux * t, az + uz * t, false)) return false;
  return true;
}
