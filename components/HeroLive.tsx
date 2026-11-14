"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

// "53%" counts up from 0 to 53, "2.5×" from 0.0 to 2.5, keeping whatever comes after the number ("32 pts").
// The real figure is what renders on the server and before the count starts, so crawlers, slow connections and
// visitors without JavaScript never see a zero.
export function CountUp({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const seen = useInView(ref, { once: true, margin: "-40px" });
  const reduced = useReducedMotion();
  const m = value.match(/^([\d.]+)(.*)$/);
  const target = m ? parseFloat(m[1]) : 0;
  const places = m && m[1].includes(".") ? m[1].split(".")[1].length : 0;
  const [n, setN] = useState<number | null>(null);
  useEffect(() => {
    if (!seen || reduced) return;
    let raf = 0;
    const t0 = performance.now();
    const step = (t: number) => {
      const k = Math.min(1, (t - t0) / 1200);
      setN(target * (1 - Math.pow(1 - k, 3)));
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [seen, reduced, target]);
  if (!m) return <span>{value}</span>;
  return (
    <span ref={ref}>
      {(reduced || n === null ? target : n).toFixed(places)}
      {m[2]}
    </span>
  );
}
