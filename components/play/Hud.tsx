"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { PLACES, hex } from "./places";
import { usePlay, walkTo, nearestPlace } from "./store";
import s from "./play.module.css";

export default function Hud() {
  const { open, near, ready, openPlace, close } = usePlay();

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("place");
    const p = PLACES.find((x) => x.id === id);
    if (p) usePlay.getState().openPlace(p);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") usePlay.getState().close();
      if (e.key.toLowerCase() === "e" && !usePlay.getState().open) {
        const n = nearestPlace();
        if (n) usePlay.getState().openPlace(n);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      {!ready && <div className={s.loading}>Building the town…</div>}
      <div className={`${s.card} ${s.title}`}>
        <h1>Imp&apos;s High Street</h1>
        <p>
          Walk around the work of <Link href="/">Design Imp</Link>
        </p>
      </div>
      <nav className={`${s.card} ${s.places}`} aria-label="Places">
        <span className={s.lbl}>Go to</span>
        {PLACES.map((p) => (
          <button key={p.id} onClick={() => walkTo(p)}>
            <i style={{ background: hex(p.wall) }} />
            {p.kicker.split(" · ")[0] === "Case study" ? p.name : p.kicker}
          </button>
        ))}
      </nav>
      <div className={`${s.card} ${s.hint}`}>
        <kbd>WASD</kbd> walk · click to go · <kbd>E</kbd> enter
      </div>
      {near && !open && (
        <button className={`${s.card} ${s.prompt}`} onClick={() => openPlace(near)}>
          <kbd>E</kbd>
          <span>Enter {near.name}</span>
        </button>
      )}
      <aside
        className={`${s.panel} ${open ? s.open : ""}`}
        style={{ "--c": open ? hex(open.wall) : undefined } as React.CSSProperties}
        aria-live="polite"
        aria-hidden={!open}
        inert={!open}
      >
        <div className={s.awning} />
        <button className={s.close} onClick={close}>
          Close ✕
        </button>
        {open && (
          <div>
            <div className={s.kicker}>{open.kicker}</div>
            <h2>{open.name}</h2>
            {open.image && (
              <Image className={s.shot} src={open.image.src} alt={open.image.alt} width={800} height={500} sizes="380px" />
            )}
            {open.intro.map((t) => (
              <p key={t}>{t}</p>
            ))}
            {open.items && (
              <ul>
                {open.items.map((i) => (
                  <li key={i.title}>
                    <b>{i.title}</b>
                    <span>{i.detail}</span>
                  </li>
                ))}
              </ul>
            )}
            <Link className={s.cta} href={open.link.href}>
              {open.link.label} →
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
