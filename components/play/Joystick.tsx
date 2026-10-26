"use client";

import { useRef, useState } from "react";
import { game } from "./store";
import s from "./play.module.css";

const R = 44;

// On-screen thumbstick for phones and tablets.
export default function Joystick() {
  const base = useRef<HTMLDivElement>(null);
  const [knob, setKnob] = useState({ x: 0, y: 0 });
  const id = useRef<number | null>(null);

  const move = (e: React.PointerEvent) => {
    if (e.pointerId !== id.current) return;
    const b = base.current!.getBoundingClientRect();
    let x = e.clientX - (b.left + b.width / 2),
      y = e.clientY - (b.top + b.height / 2);
    const l = Math.hypot(x, y);
    if (l > R) [x, y] = [(x / l) * R, (y / l) * R];
    setKnob({ x, y });
    game.joy = { x: x / R, z: y / R };
    game.target = null;
    game.pending = null;
    game.pendingNpc = null;
  };
  const end = (e: React.PointerEvent) => {
    if (e.pointerId !== id.current) return;
    id.current = null;
    setKnob({ x: 0, y: 0 });
    game.joy = { x: 0, z: 0 };
  };

  return (
    <div
      ref={base}
      className={s.joy}
      aria-hidden
      onPointerDown={(e) => {
        id.current = e.pointerId;
        e.currentTarget.setPointerCapture(e.pointerId);
        move(e);
      }}
      onPointerMove={move}
      onPointerUp={end}
      onPointerCancel={end}
    >
      <i style={{ transform: `translate(${knob.x}px, ${knob.y}px)` }} />
    </div>
  );
}
