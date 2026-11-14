"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";

// The moving parts of the home page hero: who the sites are for, a browser window flicking through real client
// work, and the numbers counting up as they come into view. All of it holds still for visitors who've asked
// for less motion.

const FOR = ["salons", "cafés", "dance studios", "tradespeople", "clinics", "small shops"];

export function WhoFor() {
  const reduced = useReducedMotion();
  const [i, setI] = useState(0);
  useEffect(() => {
    if (reduced) return;
    const t = setInterval(() => setI((n) => (n + 1) % FOR.length), 2200);
    return () => clearInterval(t);
  }, [reduced]);
  return (
    <p className="text-xl text-muted md:text-2xl" aria-label={`Websites for ${FOR.join(", ")}`}>
      Websites for{" "}
      <span className="relative inline-block min-w-[9ch] text-left align-bottom font-semibold text-accent" aria-hidden="true">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={FOR[i]}
            className="inline-block"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            {FOR[i]}.
          </motion.span>
        </AnimatePresence>
      </span>
    </p>
  );
}

const SHOWCASE = [
  { name: "Ayuri Beauty", image: "/work/ayuri-beauty.jpg", href: "/work/ayuri-beauty" },
  { name: "WellSway Dance Studio", image: "/work/wellswaydance.jpg", href: "/work/wellsway" },
  { name: "Bullwhip", image: "/work/bullwhip.jpg", href: "https://supply-chain-talent.vercel.app" },
];

export function Showcase() {
  const reduced = useReducedMotion();
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (reduced || paused) return;
    const t = setInterval(() => setI((n) => (n + 1) % SHOWCASE.length), 3600);
    return () => clearInterval(t);
  }, [reduced, paused]);
  const s = SHOWCASE[i];
  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl border border-border bg-card shadow-[0_30px_80px_-30px_rgba(200,151,58,0.45)]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* the browser's top bar, with the site's name in the address field */}
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        <span className="ml-3 flex-1 truncate rounded-full bg-background/70 px-3 py-1 text-left text-xs text-muted">{s.name}</span>
      </div>
      <Link href={s.href} className="relative block aspect-[16/10] w-full" aria-label={`See ${s.name}`}>
        <AnimatePresence initial={false}>
          <motion.div key={s.image} className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }}>
            <Image src={s.image} alt={`${s.name} website`} fill priority sizes="(max-width: 1024px) 100vw, 45vw" className="object-cover object-top" />
          </motion.div>
        </AnimatePresence>
      </Link>
      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
        {SHOWCASE.map((p, n) => (
          <button
            key={p.name}
            onClick={() => setI(n)}
            aria-label={`Show ${p.name}`}
            className={`h-2 rounded-full transition-all ${n === i ? "w-6 bg-accent" : "w-2 bg-foreground/40 hover:bg-foreground/70"}`}
          />
        ))}
      </div>
    </div>
  );
}

// "53%" counts up from 0 to 53, "2.5×" from 0.0 to 2.5, keeping whatever comes after the number ("32 pts").
export function CountUp({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const seen = useInView(ref, { once: true, margin: "-40px" });
  const reduced = useReducedMotion();
  const m = value.match(/^([\d.]+)(.*)$/);
  const target = m ? parseFloat(m[1]) : 0;
  const places = m && m[1].includes(".") ? m[1].split(".")[1].length : 0;
  const [n, setN] = useState(0);
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
      {(reduced ? target : n).toFixed(places)}
      {m[2]}
    </span>
  );
}
