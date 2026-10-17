"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { PLACES, hex } from "./places";
import { usePlay, walkTo, zoomBy } from "./store";
import { HIDDEN } from "./hidden";
import PlayLeadForm from "./PlayLeadForm";
import Minimap from "./Minimap";
import Joystick from "./Joystick";
import s from "./play.module.css";

function useMedia(q: string) {
  return useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia(q);
      m.addEventListener("change", cb);
      return () => m.removeEventListener("change", cb);
    },
    () => window.matchMedia(q).matches,
    () => false,
  );
}

export default function Hud() {
  const { open, near, nearNpc, talk, ready, openPlace, close, startTalk, nextLine, night, toggleNight, found, badge, setBadge } = usePlay();
  const total = HIDDEN.length;
  const spotter = found.length >= total;
  const touch = useMedia("(pointer: coarse)");
  const narrow = useMedia("(max-width: 600px)");
  const [navPick, setNavOpen] = useState<boolean | null>(null);
  const navOpen = navPick ?? !narrow; // the list starts folded away on phones


  useEffect(() => {
    usePlay.getState().hydrate();
    const id = new URLSearchParams(window.location.search).get("place");
    const p = PLACES.find((x) => x.id === id);
    if (p) usePlay.getState().openPlace(p);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const st = usePlay.getState();
      if (e.key === "Escape") {
        st.setBadge(false);
        st.close();
        st.endTalk();
      }
      if (e.key.toLowerCase() !== "e" || st.open || e.repeat) return;
      if (st.talk) st.nextLine();
      else if (st.nearNpc) st.startTalk(st.nearNpc);
      else if (st.near) st.openPlace(st.near);
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
      <div className={s.status}>
        <button className={s.card} onClick={toggleNight} aria-label={night ? "Switch to day" : "Switch to night"} title={night ? "Day" : "Night"}>
          {night ? "☾" : "☀"}
        </button>
        <span className={`${s.card} ${spotter ? s.spotter : ""}`} aria-live="polite">
          {spotter ? "Imp Spotter ★" : `Imps found ${found.length}/${total}`}
        </span>
      </div>
      <nav className={`${s.card} ${s.places} ${navOpen ? "" : s.shut}`} aria-label="Places">
        <button className={s.lbl} onClick={() => setNavOpen(!navOpen)} aria-expanded={navOpen}>
          Go to {navOpen ? "▴" : "▾"}
        </button>
        {navOpen && PLACES.map((p) => (
          <button key={p.id} onClick={() => walkTo(p)}>
            <i style={{ background: hex(p.wall) }} />
            {p.nav ?? (p.kicker.startsWith("Case study") ? p.name : p.kicker)}
          </button>
        ))}
      </nav>
      <Minimap />
      <div className={s.zoom}>
        <button className={s.card} onClick={() => zoomBy(-0.3)} aria-label="Zoom in">
          +
        </button>
        <button className={s.card} onClick={() => zoomBy(0.3)} aria-label="Zoom out">
          −
        </button>
      </div>
      {touch && <Joystick />}
      {badge && (
        <div className={`${s.card} ${s.badge}`} role="dialog" aria-label="Imp Spotter badge">
          <div className={s.medal}>★</div>
          <h2>Imp Spotter!</h2>
          <p>You found all {total} hidden imps and earned the Imp Spotter badge. Fancy a free mockup of your own website next?</p>
          <button
            className={s.cta}
            onClick={() => {
              setBadge(false);
              openPlace(PLACES.find((p) => p.id === "tolet-east")!);
            }}
          >
            Get my free mockup →
          </button>
          <button className={s.close} onClick={() => setBadge(false)}>
            ✕
          </button>
        </div>
      )}
      <div className={`${s.card} ${s.hint}`}>
        <kbd>WASD</kbd> walk · click to go · <kbd>E</kbd> enter or chat
      </div>
      {talk ? (
        <button className={`${s.card} ${s.speech}`} onClick={nextLine} aria-live="polite">
          <b>{talk.npc.name}</b>
          <span>{talk.npc.lines[talk.line]}</span>
          <small>
            <kbd>E</kbd> {talk.line + 1 < talk.npc.lines.length ? "more" : "bye"}
          </small>
        </button>
      ) : nearNpc && !open ? (
        <button className={`${s.card} ${s.prompt}`} onClick={() => startTalk(nearNpc)}>
          <kbd>E</kbd>
          <span>Talk to {nearNpc.name}</span>
        </button>
      ) : (
        near &&
        !open && (
          <button className={`${s.card} ${s.prompt}`} onClick={() => openPlace(near)}>
            <kbd>E</kbd>
            <span>{near.kind === "lot" || near.kind === "tank" ? "Look at" : "Enter"} {near.name}</span>
          </button>
        )
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
            {open.kind === "lot" && <PlayLeadForm />}
            {open.link.external ? (
              <a className={s.cta} href={open.link.href} target="_blank" rel="noopener noreferrer">
                {open.link.label} ↗
              </a>
            ) : (
              <Link className={s.cta} href={open.link.href}>
                {open.link.label} →
              </Link>
            )}
          </div>
        )}
      </aside>
    </>
  );
}
