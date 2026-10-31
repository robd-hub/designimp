import { Fragment } from "react";
import type { Place } from "./places";
import { Part, geo, WINDOW } from "./toon";
import { LINDUM, LINDUM_ROW } from "./colliders";
import { groundY, Strip } from "./terrain";
import { placeEvents } from "./store";
import { NamePlate } from "./Wharf";
import { Sign, useSign } from "./MoreLandmarks";

const TARMAC = 0x6b6573;
const PAVEMENT = 0xe8dcc2;
const SASH = 0xfff8e7;

// The townhouses up Lindum Hill, by side and then from the bottom of the hill up: brick or painted render, three
// storeys under slate roofs. A few have a name board over the door. Made-up names: they stand for the offices,
// guest houses and cafés along the road, not any real one.
type Look = { wall: number; door: number; name?: string };
const LOOKS: Record<number, Look[]> = {
  [-1]: [
    { wall: 0xa9553f, door: 0x1f2f5a, name: "Roman Road Dental" },
    { wall: 0xf2e2c4, door: 0x1a1320 },
    { wall: 0xfaf3e3, door: 0x2f8f5b },
    { wall: 0xb86a4b, door: 0x6b1f2a },
    { wall: 0xe8d9b5, door: 0x1f4d3a },
    { wall: 0xc9dbe8, door: 0x1a1320 },
    { wall: 0x9c4a36, door: 0x2b59c3 },
  ],
  [1]: [
    { wall: 0xf5e6c8, door: 0x1a1320 },
    { wall: 0xa9553f, door: 0x1f4d3a, name: "Colonnade Architects" },
    { wall: 0xfaf3e3, door: 0x7a3b8f },
    { wall: 0xb86a4b, door: 0x1f2f5a, name: "Halfway House B&B" },
    { wall: 0xe8f0d8, door: 0x6b1f2a },
    { wall: 0x9c4a36, door: 0x2f8f5b },
    { wall: 0xf2d6c4, door: 0x1f2f5a, name: "Puffed Out Café" },
  ],
};

// A sash window in its white frame, standing proud of a wall that faces +z.
function Sash({ x, y }: { x: number; y: number }) {
  return (
    <group position={[x, y, 0]}>
      <Part geometry={geo.box(0.74, 1.06, 0.08)} color={SASH} outline={0.03} />
      <Part geometry={geo.box(0.6, 0.92, 0.1)} color={WINDOW} outline={0} position-z={0.02} />
      <Part geometry={geo.box(0.6, 0.06, 0.12)} color={SASH} outline={0} position-z={0.03} />
    </group>
  );
}

function NameBoard({ text, font, color }: { text: string; font: string; color: number }) {
  const sign = useSign(text, "#1a1320", font);
  return (
    <group position={[0, 2.75, 0.12]}>
      <Part geometry={geo.box(2.5, 0.62, 0.1)} color={color} outline={0.03} />
      <Sign map={sign} w={2.3} h={0.5} position-z={0.06} />
    </group>
  );
}

function House({ h, font, place }: { h: (typeof LINDUM.houses)[number]; font: string; place: Place }) {
  const look = LOOKS[h.side][h.i];
  // level with the uphill end of its plot, on a stone plinth down to the road below
  const top = groundY(h.z - h.len / 2),
    low = groundY(h.z + h.len / 2) - 0.3;
  // the doorstep comes down to the road outside the door
  const step = Math.max(0.25, top - groundY(h.z - h.side * 0.9) + 0.1);
  const tall = 5.6 + ((h.i * 5 + (h.side > 0 ? 2 : 0)) % 3) * 0.5;
  return (
    <group position={[h.x, 0, h.z]} {...placeEvents(place)}>
      <Part geometry={geo.box(LINDUM_ROW, top - low + 0.01, h.len - 0.15)} color={0x9c8d6e} outline={0.05} position-y={(top + low) / 2} />
      <Part geometry={geo.box(LINDUM_ROW - 0.2, tall, h.len - 0.35)} color={look.wall} outline={0.07} position-y={top + tall / 2} />
      {/* slate roof, with a chimney stack at each end */}
      <group position={[0, top + tall, 0]} rotation-y={Math.PI / 2}>
        <Part geometry={geo.cyl(1.9, 1.9, h.len - 0.2, 3)} color={0x4a4f5c} outline={0.06} rotation-x={-Math.PI / 2} scale={[1, 1, 0.5]} position-y={0.45} />
      </group>
      {[-1, 1].map((e) => (
        <Part key={e} geometry={geo.box(0.5, 0.9, 0.5)} color={0x8a3b2e} outline={0.04} position={[0, top + tall + 0.9, e * (h.len / 2 - 0.6)]} />
      ))}
      {/* the front: door with a fanlight and steps, sashes on the floors above and beside it */}
      <group position={[-h.side * (LINDUM_ROW / 2 - 0.1), top, 0]} rotation-y={(-h.side * Math.PI) / 2}>
        <Part geometry={geo.box(0.95, 2, 0.12)} color={look.door} outline={0.04} position={[-0.9, 1, 0.02]} />
        <Part geometry={geo.box(0.95, 0.35, 0.12)} color={WINDOW} outline={0.03} position={[-0.9, 2.2, 0.02]} />
        <Part geometry={geo.box(1.3, step, 0.5)} color={0xd9cbb0} outline={0.03} position={[-0.9, 0.1 - step / 2, 0.2]} />
        <Sash x={0.9} y={1.3} />
        {[3.3, 4.8].map((y) =>
          y + 0.6 < tall ? (
            <Fragment key={y}>
              <Sash x={-0.9} y={y} />
              <Sash x={0.9} y={y} />
            </Fragment>
          ) : null,
        )}
        {look.name && <NameBoard text={look.name} font={font} color={0xfff8e7} />}
      </group>
    </group>
  );
}

// Lindum Hill: the roadway up the hill with its houses either side, the pavement past the Arboretum to Monks Road, the
// bend east along the top and the footway up into Minster Yard. Drawn in world coordinates, so the group drops back
// down by the height Town has lifted it to at the road's middle.
export function LindumHill({ p, font }: { p: Place; font: string }) {
  const { road, top, foot, eastgate } = LINDUM;
  const rect = (r: { x0: number; x1: number; z0: number; z1: number }) => ({ w: r.x1 - r.x0, d: r.z1 - r.z0, x: (r.x0 + r.x1) / 2, z: (r.z0 + r.z1) / 2 });
  const dashes = Array.from({ length: Math.floor((road.z1 - road.z0) / 4) }, (_, i) => road.z1 - 2 - i * 4);
  return (
    <group position-y={-groundY(p.z)}>
      <Strip {...rect(road)} color={TARMAC} y={0.05} {...placeEvents(p)} />
      <Strip {...rect(top)} color={TARMAC} y={0.052} {...placeEvents(p)} />
      <Strip {...rect(foot)} color={PAVEMENT} y={0.054} {...placeEvents(p)} />
      <Strip {...rect(eastgate)} color={PAVEMENT} y={0.07} {...placeEvents(p)} />
      {dashes.map((z) => (
        <Strip key={z} w={0.22} d={1.8} color={0xfff8e7} x={(road.x0 + road.x1) / 2} z={z} y={0.07} raycast={() => null} />
      ))}
      {LINDUM.houses.map((h) => (
        <House key={`${h.side}${h.i}`} h={h} font={font} place={p} />
      ))}
      <NamePlate text={p.name} font={font} position={[road.x0 - 0.7, groundY(road.z1 + 0.6), road.z1 + 0.6]} />
    </group>
  );
}
