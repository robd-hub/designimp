import { Part, geo, toon, LAMP } from "./toon";
import { RAIL, WEST_BANK, WHARF_EAST, WHARF_EAST_SOUTH, WITHAM, WITHAM_RUNS, seeded } from "./colliders";
import { Strip } from "./terrain";
import { NamePlate } from "./Wharf";

const BANK = 0x9c8d6e;
const WATER = 0x3aa6e8;
const BRIDGE_STONE = 0xb8a98a;
const TUNNEL = 0x1f2a33;
const GIRDER = 0x2b59c3;
const IRON = 0x2b2633;
const PAVING = 0xd9ccb2;
const PATH = 0xe8dcc2;
const CONCRETE = 0xcfcac0;
const CONCRETE_EDGE = 0xb5afa3;
const ROAD_EDGE = WHARF_EAST_SOUTH.z0;

const wide = WITHAM.half * 2;
const UNI_W = WITHAM.uniHalf * 2;
// The railings along the lane's river side, broken where the railway and the footbridge cross.
const RAIL_RUNS = [
  [ROAD_EDGE + 0.6, RAIL.z - RAIL.fence - 0.3],
  [RAIL.z + RAIL.fence + 0.3, WITHAM.foot - WITHAM.footHalf - 0.2],
  [WITHAM.foot + WITHAM.footHalf + 0.2, WHARF_EAST_SOUTH.z1],
];
// Paving slabs scattered down the lane, clear of the railway.
const rand = seeded(57);
const SLABS = Array.from({ length: 22 }, () => {
  const f = WHARF_EAST_SOUTH;
  return [f.x0 + 0.6 + rand() * (f.x1 - f.x0 - 1.2), f.z0 + 0.6 + rand() * (f.z1 - f.z0 - 1.2)] as const;
}).filter(([, z]) => Math.abs(z - RAIL.z) > RAIL.fence + 0.6);
const LANE_LAMPS = [ROAD_EDGE + 5, RAIL.z + RAIL.fence + 6, RAIL.z + RAIL.fence + 15];

// The Witham south of the Brayford: open water in stone banks out of the pool's south-east corner, under the
// main road through an arch in each face of its bridge, under the railway between the bridge's blue girders,
// under the University Bridge, past the back of St Marks under a footbridge, and off west towards Boultham. Beside it, Brayford Wharf East
// carries on down the east bank, railed off from the water, and a path runs down the west bank by the University.
export default function Witham({ font }: { font: string }) {
  return (
    <group raycast={() => null}>
      {WITHAM_RUNS.map((r) => (
        <group key={`${r.x0},${r.z0}`} position={[(r.x0 + r.x1) / 2, 0, (r.z0 + r.z1) / 2]}>
          {/* the stone bank along both sides: east and west of the stretches running south, north and south of the one running west */}
          <Part geometry={r.x1 - r.x0 > r.z1 - r.z0 ? geo.box(r.x1 - r.x0, 0.3, r.z1 - r.z0 + 0.8) : geo.box(r.x1 - r.x0 + 0.8, 0.3, r.z1 - r.z0)} color={BANK} outline={0.05} position-y={0.08} />
          <mesh geometry={geo.box(r.x1 - r.x0, 0.12, r.z1 - r.z0)} material={toon(WATER)} position-y={0.2} />
        </group>
      ))}
      {/* the road bridge: a stone face either side of the road, an arch through each over the water */}
      {[-1, 1].map((s) => (
        <group key={s} position={[WITHAM.x, 0, s * (ROAD_EDGE + 0.25)]}>
          <Part geometry={geo.arches(wide + 1, 1.2, 0.5, [[0, wide - 0.2, 0.15, 0.7]])} color={BRIDGE_STONE} outline={0.05} />
          <mesh geometry={geo.box(wide - 0.2, 0.85, 0.05)} material={toon(TUNNEL)} position={[0, 0.42, -s * 0.2]} />
        </group>
      ))}
      {/* the rail bridge: a blue plate girder along each side of the line, where the fences run over the water */}
      {[-1, 1].map((s) => (
        <group key={s} position={[WITHAM.x, 0, RAIL.z + s * RAIL.fence]}>
          <Part geometry={geo.box(wide + 1, 0.9, 0.3)} color={GIRDER} outline={0.05} position-y={0.45} />
          {[-1, 0, 1].map((k) => (
            <Part key={k} geometry={geo.box(0.12, 0.9, 0.36)} color={IRON} outline={0.02} position={[(k * (wide + 0.6)) / 2, 0.45, 0]} />
          ))}
          <mesh geometry={geo.box(wide - 0.2, 0.3, 0.05)} material={toon(TUNNEL)} position={[0, 0.15, -s * 0.18]} />
        </group>
      ))}
      {/* the footbridge from the end of the St Marks street, humped a little, with a rail along each side */}
      <group position={[WITHAM.x, 0, WITHAM.foot]}>
        <mesh geometry={geo.box(wide, 0.12, WITHAM.footHalf * 2)} material={toon(WATER)} position-y={0.2} />
        <Part geometry={geo.box(wide + 1.6, 0.25, WITHAM.footHalf * 2 - 0.2)} color={0x8a5a33} outline={0.04} position-y={0.4} />
        {[-1, 1].flatMap((sz) => [
          <Part key={`r${sz}`} geometry={geo.box(wide + 1.6, 0.1, 0.1)} color={0x5a3a22} outline={0.02} position={[0, 1.35, (sz * (WITHAM.footHalf * 2 - 0.3)) / 2]} />,
          ...[-1, 0, 1].map((k) => (
            <Part key={`${sz}${k}`} geometry={geo.box(0.12, 1, 0.12)} color={0x5a3a22} outline={0.02} position={[k * (wide / 2 + 0.6), 0.85, (sz * (WITHAM.footHalf * 2 - 0.3)) / 2]} />
          )),
        ])}
      </group>
      {/* the University Bridge from Brayford Wharf East to the campus: a flat concrete beam with a lip along each edge,
          steel railings, a lamp at each corner on the wharf side and its name on the south rail */}
      <group position={[WITHAM.x, 0, WITHAM.uni]}>
        <mesh geometry={geo.box(wide, 0.12, UNI_W)} material={toon(WATER)} position-y={0.2} />
        <Part geometry={geo.box(wide + 1.6, 0.35, UNI_W - 0.1)} color={CONCRETE} outline={0.04} position-y={0.35} />
        {[-1, 1].flatMap((sz) => [
          <Part key={`e${sz}`} geometry={geo.box(wide + 1.6, 0.2, 0.18)} color={CONCRETE_EDGE} outline={0.03} position={[0, 0.6, (sz * (UNI_W - 0.3)) / 2]} />,
          ...[0.95, 1.4].map((y) => (
            <Part key={`r${sz}${y}`} geometry={geo.box(wide + 1.6, 0.08, 0.08)} color={IRON} outline={0.02} position={[0, y, (sz * (UNI_W - 0.3)) / 2]} />
          )),
          ...[-1, -0.33, 0.33, 1].map((k) => (
            <Part key={`${sz}${k}`} geometry={geo.box(0.1, 0.8, 0.1)} color={IRON} outline={0.02} position={[k * (wide / 2 + 0.7), 1.05, (sz * (UNI_W - 0.3)) / 2]} />
          )),
          <group key={`l${sz}`} position={[wide / 2 + 0.75, 0, (sz * (UNI_W - 0.3)) / 2]}>
            <Part geometry={geo.cyl(0.08, 0.1, 2.6, 8)} color={IRON} outline={0.04} position-y={1.8} />
            <Part geometry={geo.sphere(0.25)} color={LAMP} outline={0.05} position-y={3.2} />
          </group>,
        ])}
        <NamePlate text="University Bridge" font={font} position={[-0.4, 0.5, (UNI_W - 0.3) / 2 + 0.1]} />
      </group>
      {/* Brayford Wharf East, paved on down to St Marks and over the line, and the path down the west bank */}
      <Strip w={WHARF_EAST_SOUTH.x1 - WHARF_EAST_SOUTH.x0} d={WHARF_EAST_SOUTH.z1 - WHARF_EAST_SOUTH.z0} color={PAVING} x={(WHARF_EAST_SOUTH.x0 + WHARF_EAST_SOUTH.x1) / 2} z={(WHARF_EAST_SOUTH.z0 + WHARF_EAST_SOUTH.z1) / 2} y={0.065} />
      {SLABS.map(([x, z], i) => (
        <mesh key={i} geometry={geo.box(1.1, 0.06, 0.8)} material={toon(0xc7b89a)} position={[x, 0.07, z]} />
      ))}
      <Strip w={WEST_BANK.x1 - WEST_BANK.x0} d={WEST_BANK.z1 - WEST_BANK.z0} color={PATH} x={(WEST_BANK.x0 + WEST_BANK.x1) / 2} z={(WEST_BANK.z0 + WEST_BANK.z1) / 2} y={0.06} />
      {RAIL_RUNS.map(([z0, z1]) => (
        <group key={z0} position={[WHARF_EAST.x0 + 0.15, 0, 0]}>
          {[0.5, 0.95].map((y) => (
            <Part key={y} geometry={geo.box(0.08, 0.08, z1 - z0)} color={IRON} outline={0.02} position={[0, y, (z0 + z1) / 2]} />
          ))}
          {Array.from({ length: Math.floor((z1 - z0) / 1.6) + 1 }, (_, i) => z0 + i * 1.6).map((z) => (
            <Part key={z} geometry={geo.box(0.1, 1, 0.1)} color={IRON} outline={0.02} position={[0, 0.5, z]} />
          ))}
        </group>
      ))}
      {LANE_LAMPS.map((z) => (
        <group key={z} position={[WHARF_EAST.x1 - 0.4, 0, z]}>
          <Part geometry={geo.cyl(0.1, 0.12, 3.2, 8)} color={IRON} outline={0.04} position-y={1.6} />
          <Part geometry={geo.sphere(0.3)} color={LAMP} outline={0.05} position-y={3.3} />
        </group>
      ))}
      <NamePlate text="Brayford Wharf East" font={font} position={[WHARF_EAST.x1 + 1.6, 0, ROAD_EDGE + 1.4]} />
    </group>
  );
}

