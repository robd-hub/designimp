"use client";

import { useEffect, useRef } from "react";
import { PLACES, footprint, hex } from "./places";
import { BOUND, POOL } from "./colliders";
import { game, walkTo } from "./store";
import s from "./play.module.css";

const V = BOUND + 4;

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
    <svg className={`${s.card} ${s.minimap}`} viewBox={`${-V} ${-V} ${V * 2} ${V * 2}`} role="img" aria-label="Map of the town">
      <rect x={-V} y={-V} width={V * 2} height={V * 2} fill="#6fd36b" />
      <rect x={-3} y={-44} width={6} height={BOUND + 5 + 44} fill="#6b6573" />
      <rect x={-V} y={-3} width={V * 2} height={6} fill="#6b6573" />
      {water && <ellipse cx={water.x} cy={water.z} rx={POOL.rx} ry={POOL.rz} fill="#3aa6e8" stroke="#1a1320" strokeWidth={1} />}
      {PLACES.filter((p) => p.kind !== "water").map((p) => {
        const f = footprint(p);
        return (
          <rect
            key={p.id}
            x={f.x0}
            y={f.z0}
            width={f.x1 - f.x0}
            height={f.z1 - f.z0}
            rx={p.kind === "tank" ? 3.2 : 1.5}
            fill={hex(p.kind === "street" ? p.roof : p.wall)}
            stroke="#1a1320"
            strokeWidth={1.2}
            onClick={() => walkTo(p)}
          >
            <title>{p.name}</title>
          </rect>
        );
      })}
      <g ref={me}>
        <circle r={4.2} fill="#c8973a" stroke="#1a1320" strokeWidth={1.6} />
        <path d="M0 7.5 L-3 3 L3 3 Z" fill="#1a1320" />
      </g>
    </svg>
  );
}
