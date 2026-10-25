"use client";

import { useEffect, useRef } from "react";
import { PLACES, footprint, hex } from "./places";
import { AIRFIELD, AIRFIELD_ROAD, BUS_STATION, EAST_FOOTPATH, GREESTONE, RIVER, BOUND, EAST, SOUTH, HOUSE, HOUSES, HIGH_ST, SHOPFRONTS, BRAYFORD, BAILGATE, CLOSE, CORNHILL, STONEBOW_STREETS, NORTH, RAIL, ROUNDABOUT, STADIUM_ROAD, STATION, STREET_ROW, streetHouses, toWorld } from "./colliders";
import { RISE } from "./terrain";
import { game, walkTo } from "./store";
import s from "./play.module.css";

const L = -BOUND - 4,
  W = BOUND + EAST + 8;
const TOP = NORTH - 4,
  H = SOUTH + 4 - TOP;

// A little map of the town. Tap a building to walk there.
export default function Minimap() {
  const me = useRef<SVGGElement>(null);
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      me.current?.setAttribute("transform", `translate(${game.pos.x} ${game.pos.z}) rotate(${(-game.face * 180) / Math.PI})`);
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, []);
  const water = PLACES.find((p) => p.kind === "water");
  return (
    <svg className={`${s.card} ${s.minimap}`} viewBox={`${L} ${TOP} ${W} ${H}`} role="img" aria-label="Map of the town">
      {/* the ground darkens as it climbs the hill */}
      <defs>
        <linearGradient id="minimap-hill" gradientUnits="userSpaceOnUse" x1={0} y1={RISE.z0} x2={0} y2={RISE.z1}>
          <stop offset={0} stopColor="#6fd36b" />
          <stop offset={1} stopColor="#4ea84b" />
        </linearGradient>
      </defs>
      <rect x={L} y={TOP} width={W} height={H} fill="url(#minimap-hill)" />
      <rect x={L} y={RAIL.z - RAIL.gap - 1.5} width={W} height={RAIL.gap * 2 + 3} fill="#a39a8f" />
      <rect x={-3} y={0} width={6} height={SOUTH + 4} fill="#6b6573" />
      {[-1, 1].map((side) => (
        <rect key={side} x={L} y={RAIL.z + side * RAIL.gap - 0.6} width={W} height={1.2} fill="#55505e" pointerEvents="none" />
      ))}
      {STATION.platforms.map((pl) => (
        <rect key={pl.side} x={STATION.x0} y={pl.z0} width={STATION.x1 - STATION.x0} height={pl.z1 - pl.z0} fill="#e8dcc2" pointerEvents="none" />
      ))}
      <rect x={RIVER.x0} y={RIVER.z - RIVER.half} width={RIVER.x1 - RIVER.x0} height={RIVER.half * 2} fill="#3aa6e8" pointerEvents="none" />
      {RIVER.bridges
        .filter((b) => b.foot)
        .map((b) => (
          <rect key={b.x} x={b.x0} y={RIVER.z - RIVER.half - 0.8} width={b.x1 - b.x0} height={RIVER.half * 2 + 1.6} fill="#8a5a33" pointerEvents="none" />
        ))}
      <rect x={-HIGH_ST} y={RISE.z0} width={HIGH_ST * 2} height={-RISE.z0} fill="#d9ccb2" />
      <rect x={BAILGATE.x0} y={BAILGATE.z0} width={BAILGATE.x1 - BAILGATE.x0} height={BAILGATE.z1 - BAILGATE.z0} fill="#e8dcc2" />
      <rect x={CLOSE.x0} y={CLOSE.z0} width={CLOSE.x1 - CLOSE.x0} height={CLOSE.z1 - CLOSE.z0} fill="#e8dcc2" />
      {[...CORNHILL, ...STONEBOW_STREETS].map((r, i) => (
        <rect key={i} x={r.x0} y={r.z0} width={r.x1 - r.x0} height={r.z1 - r.z0} fill="#d9ccb2" pointerEvents="none" />
      ))}
      <rect x={L} y={-3} width={W} height={6} fill="#6b6573" />
      {[...GREESTONE, ...EAST_FOOTPATH].map((g, i) => (
        <rect key={i} x={g.x0} y={g.z0} width={g.x1 - g.x0} height={g.z1 - g.z0} fill="#e8dcc2" pointerEvents="none" />
      ))}
      {[BUS_STATION.kerb, ...BUS_STATION.tarmac].map((r, i) => (
        <rect key={i} x={r.x0} y={r.z0} width={r.x1 - r.x0} height={r.z1 - r.z0} fill={i ? "#6b6573" : "#e8dcc2"} pointerEvents="none" />
      ))}
      <circle cx={ROUNDABOUT.x} cy={ROUNDABOUT.z} r={ROUNDABOUT.ring} fill="#6b6573" />
      <rect x={STADIUM_ROAD.x0} y={STADIUM_ROAD.z - 3} width={STADIUM_ROAD.x1 - STADIUM_ROAD.x0} height={6} fill="#6b6573" />
      <rect x={AIRFIELD_ROAD.x0} y={AIRFIELD_ROAD.z - 3} width={AIRFIELD_ROAD.x1 - AIRFIELD_ROAD.x0} height={6} fill="#6b6573" />
      {water &&
        Object.entries(BRAYFORD).map(([k, b]) => (
          <rect key={k} x={water.x + b.x0} y={water.z + b.z0} width={b.x1 - b.x0} height={b.z1 - b.z0} fill={k === "front" ? "#f2e2c4" : "#3aa6e8"} />
        ))}
      {PLACES.filter((p) => p.kind !== "water").map((p) => {
        const f = footprint(p);
        return (
          <g key={p.id}>
            {/* the path right round the cathedral */}
            {p.kind === "cathedral" && <rect x={f.x0 - 3} y={f.z0 - 3} width={f.x1 - f.x0 + 6} height={f.z1 - f.z0 + 6} fill="#e8dcc2" pointerEvents="none" />}
          <rect
            x={f.x0}
            y={f.z0}
            width={f.x1 - f.x0}
            height={f.z1 - f.z0}
            rx={p.kind === "tank" ? 3.2 : 1.5}
            fill={hex(p.kind === "street" ? 0xb9ad9a : p.kind === "airfield" ? 0x7fcf6a : p.wall)}
            stroke="#1a1320"
            strokeWidth={1.2}
            onClick={() => walkTo(p)}
          >
            <title>{p.name}</title>
          </rect>
          </g>
        );
      })}
      {PLACES.filter((p) => p.kind === "street").flatMap((p) =>
        streetHouses(p).map((h) => (
          <rect key={`${p.id}${h.side}${h.i}`} x={p.x + h.x - STREET_ROW / 2} y={p.z + h.z - h.len / 2} width={STREET_ROW} height={h.len} fill={hex(p.roof)} pointerEvents="none" />
        )),
      )}
      {SHOPFRONTS.map((h) => (
        <rect key={`${h.x},${h.z}`} x={h.x - h.deep / 2} y={h.z - h.len / 2} width={h.deep} height={h.len} fill="#b5523b" pointerEvents="none" />
      ))}
      {HOUSES.map((h) => (
        <rect key={`${h.side}${h.i}`} x={h.x - HOUSE.d / 2} y={h.z - HOUSE.w / 2} width={HOUSE.d} height={HOUSE.w} fill="#b5523b" pointerEvents="none" />
      ))}
      {PLACES.filter((p) => p.kind === "airfield").flatMap((p) =>
        (["runway", "apron", "hangar"] as const).map((k) => {
          const r = toWorld(p, AIRFIELD[k]);
          return <rect key={k} x={r.x0} y={r.z0} width={r.x1 - r.x0} height={r.z1 - r.z0} fill={k === "runway" ? "#55505e" : k === "apron" ? "#c9c2b4" : hex(p.wall)} pointerEvents="none" />;
        }),
      )}
      <g ref={me}>
        <circle r={4.2} fill="#c8973a" stroke="#1a1320" strokeWidth={1.6} />
        <path d="M0 7.5 L-3 3 L3 3 Z" fill="#1a1320" />
      </g>
    </svg>
  );
}
