"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { PLACES, hex, shopSign, type Place } from "./places";
import { usePlay, walkTo, zoomBy, keepHover, leaveCard } from "./store";
import { HIDDEN } from "./hidden";
import PlayLeadForm from "./PlayLeadForm";
import Minimap from "./Minimap";
import Joystick from "./Joystick";
import s from "./play.module.css";

// First sentence of a place's intro, for the hover card.
function blurb(p: Place) {
  const t = p.intro[0] ?? "";
  const m = t.match(/^.*?[.!?](\s|$)/);
  return (m ? m[0] : t).trim();
}

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
  const { open, near, nearNpc, talk, ready, openPlace, close, startTalk, nextLine, night, toggleNight, street, toggleStreet, found, badge, setBadge, hover, setHover } = usePlay();
  const openShop = usePlay((st) => (open && st.shop?.lot === open.id ? st.shop.name : ""));
  const total = HIDDEN.length;
  const spotter = found.length >= total;
  const touch = useMedia("(pointer: coarse)");
  const narrow = useMedia("(max-width: 600px)");
  const [navPick, setNavOpen] = useState<boolean | null>(null);
  const navOpen = navPick ?? !narrow; // the list starts folded away on phones
  const navRef = useRef<HTMLElement>(null);
  // The Imp's hello, once per visit, pointing straight at a client's shop.
  const { welcome, setWelcome } = usePlay();
  const greet = welcome && ready && !open && !talk;

  // Keep the joystick sitting just above the Go to box, however tall it gets.
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const ro = new ResizeObserver(() => document.documentElement.style.setProperty("--nav-h", `${nav.offsetHeight}px`));
    ro.observe(nav);
    return () => ro.disconnect();
  }, []);

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
          Walk around the work of <Link href="/">Design Imp</Link> · <Link href="/#work">Prefer a list?</Link>
        </p>
      </div>
      <div className={s.status}>
        <button className={s.card} onClick={toggleNight} aria-label={night ? "Switch to day" : "Switch to night"} title={night ? "Day" : "Night"}>
          {night ? "☾" : "☀"}
        </button>
        <button className={s.card} onClick={toggleStreet} aria-pressed={street} title={street ? "Back to map view" : "Street view"}>
          {narrow ? (street ? "Map" : "Street") : street ? "Map view" : "Street view"}
        </button>
        <span className={`${s.card} ${spotter ? s.spotter : ""}`} aria-live="polite">
          {spotter ? "Imp Spotter ★" : `Imps found ${found.length}/${total}`}
        </span>
      </div>
      <nav ref={navRef} className={`${s.card} ${s.places} ${navOpen ? "" : s.shut}`} aria-label="Places">
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
      {greet && (
        <div className={`${s.card} ${s.welcome}`} role="dialog" aria-label="Welcome">
          <b>Hello, I&apos;m the Imp!</b>
          <p>Every shop on this street is a real Design Imp client. Pop in to see their new websites.</p>
          <button
            className={s.cta}
            onClick={() => {
              setWelcome(false);
              walkTo(PLACES.find((p) => p.id === "ayuri")!);
            }}
          >
            Show me a client →
          </button>
          <button className={s.skip} onClick={() => setWelcome(false)}>
            I&apos;ll explore
          </button>
        </div>
      )}
      <div className={`${s.card} ${s.hint}`}>
        {street ? (
          <>
            <kbd>W</kbd>
            <kbd>S</kbd> walk · <kbd>A</kbd>
            <kbd>D</kbd> turn · drag to look · <kbd>E</kbd> enter or chat
          </>
        ) : (
          <>
            <kbd>WASD</kbd> walk · click to go · <kbd>E</kbd> enter or chat
          </>
        )}
      </div>
      {hover && !open && (
        <div
          className={`${s.card} ${s.peek}`}
          style={{ left: Math.min(hover.x + 16, window.innerWidth - 276), top: Math.min(hover.y + 16, window.innerHeight - 190), "--c": hex(hover.place.wall) } as React.CSSProperties}
          onPointerEnter={keepHover}
          onPointerLeave={leaveCard}
        >
          <div className={s.kicker}>{hover.place.kicker}</div>
          <b>{hover.place.name}</b>
          <p>{blurb(hover.place)}</p>
          <button
            onClick={() => {
              leaveCard();
              setHover(null);
              openPlace(hover.place);
            }}
          >
            Learn more →
          </button>
        </div>
      )}
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
            <span>{near.kind === "lot" || near.kind === "tank" || near.kind === "gate" ? "Look at" : "Enter"} {near.name}</span>
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
            <div className={s.kicker}>{openShop ? "Opening soon" : open.kicker}</div>
            <h2>{openShop ? shopSign(openShop) : open.name}</h2>
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
            {open.kind === "lot" && <PlayLeadForm lot={open.id} />}
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
