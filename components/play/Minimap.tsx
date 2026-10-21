"use client";

import { useEffect, useRef } from "react";
import { PLACES, footprint, hex } from "./places";
import { AIRFIELD, AIRFIELD_ROAD, BOUND, SOUTH, HOUSE, HOUSES, BRAYFORD, BAILGATE, CLOSE, NORTH, RAIL, STADIUM_ROAD, STREET_ROW, streetHouses, toWorld } from "./colliders";
import { RISE } from "./terrain";
import { game, walkTo } from "./store";
import s from "./play.module.css";

const V = BOUND + 4;
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
    <svg className={`${s.card} ${s.minimap}`} viewBox={`${-V} ${TOP} ${V * 2} ${H}`} role="img" aria-label="Map of the town">
      {/* the ground darkens as it climbs the hill */}
      <defs>
        <linearGradient id="minimap-hill" gradientUnits="userSpaceOnUse" x1={0} y1={RISE.z0} x2={0} y2={RISE.z1}>
          <stop offset={0} stopColor="#6fd36b" />
          <stop offset={1} stopColor="#4ea84b" />
        </linearGradient>
      </defs>
      <rect x={-V} y={TOP} width={V * 2} height={H} fill="url(#minimap-hill)" />
      <rect x={-V} y={RAIL.z - RAIL.gap - 1.5} width={V * 2} height={RAIL.gap * 2 + 3} fill="#a39a8f" />
      <rect x={-3} y={0} width={6} height={SOUTH + 4} fill="#6b6573" />
      {[-1, 1].map((side) => (
        <rect key={side} x={-V} y={RAIL.z + side * RAIL.gap - 0.6} width={V * 2} height={1.2} fill="#55505e" pointerEvents="none" />
      ))}
      <rect x={-4.3} y={RISE.z0} width={8.6} height={-RISE.z0} fill="#d9ccb2" />
      <rect x={BAILGATE.x0} y={BAILGATE.z0} width={BAILGATE.x1 - BAILGATE.x0} height={BAILGATE.z1 - BAILGATE.z0} fill="#e8dcc2" />
      <rect x={CLOSE.x0} y={CLOSE.z0} width={CLOSE.x1 - CLOSE.x0} height={CLOSE.z1 - CLOSE.z0} fill="#e8dcc2" />
      <rect x={-V} y={-3} width={V * 2} height={6} fill="#6b6573" />
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
