"use client";

import { useEffect, useMemo } from "react";
import type { ThreeEvent } from "@react-three/fiber";
import { Part, geo, signTexture, WINDOW, INK } from "./toon";
import { groundY } from "./terrain";
import { usePlay, RIDE_MS } from "./store";
import x from "./extras.module.css";

// Getting about faster than on foot: pick Taxi in Go to (or tap the taxi rank by the start) and the Imp
// is driven to the door instead of walking. Short hops are still walked.

export function TravelToggle() {
  const taxi = usePlay((st) => st.taxi);
  const setTaxi = usePlay((st) => st.setTaxi);
  return (
    <div className={x.travel} role="group" aria-label="How to get there">
      <button type="button" aria-pressed={!taxi} onClick={() => setTaxi(false)}>
        Walk
      </button>
      <button type="button" aria-pressed={taxi} onClick={() => setTaxi(true)}>
        Taxi
      </button>
    </div>
  );
}

function TaxiIcon() {
  return (
    <svg viewBox="0 0 64 36" width="96" height="54" aria-hidden="true">
      <path d="M8 22 L14 10 Q16 6 21 6 H41 Q46 6 48 10 L54 22 Z" fill="#ffd23f" stroke="#1a1320" strokeWidth="3" strokeLinejoin="round" />
      <rect x="2" y="20" width="60" height="10" rx="4" fill="#ffd23f" stroke="#1a1320" strokeWidth="3" />
      <path d="M18 20 L21 11 H30 V20 Z M34 20 V11 H42 L46 20 Z" fill="#bff0ff" stroke="#1a1320" strokeWidth="2.5" strokeLinejoin="round" />
      <rect x="25" y="1" width="14" height="6" rx="2" fill="#fff8e7" stroke="#1a1320" strokeWidth="2.5" />
      <circle cx="16" cy="31" r="5" fill="#1a1320" />
      <circle cx="48" cy="31" r="5" fill="#1a1320" />
    </svg>
  );
}

// The ride itself: the screen fades out while a taxi drives across, then back in at the door.
export function TaxiRide() {
  const ride = usePlay((st) => st.ride);
  if (!ride) return null;
  return (
    <div className={x.ride} style={{ "--ride": `${RIDE_MS}ms` } as React.CSSProperties} role="status" aria-live="polite">
      <div className={x.car}>
        <TaxiIcon />
      </div>
      <p>Taxi to {ride.name}…</p>
    </div>
  );
}

// A taxi rank on the corner by where the Imp starts, with a cab waiting. Tapping it switches Go to over to taxis.
export const RANK = { x: 5.4, z: 11.5 };

export function TaxiRank({ font }: { font: string }) {
  const sign = useMemo(() => signTexture("TAXI", "#1a1320", font), [font]);
  const roof = useMemo(() => signTexture("TAXI", "#ff5a3c", font), [font]);
  useEffect(
    () => () => {
      sign.dispose();
      roof.dispose();
    },
    [sign, roof],
  );
  const hail = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    usePlay.getState().setTaxi(true);
    window.dispatchEvent(new Event("imp:goto"));
  };
  const point = (on: boolean) => () => void (document.body.style.cursor = on ? "pointer" : "");
  return (
    <group position={[RANK.x, groundY(RANK.z), RANK.z]} onClick={hail} onPointerOver={point(true)} onPointerOut={point(false)}>
      {/* the rank sign */}
      <Part geometry={geo.cyl(0.08, 0.1, 3, 8)} color={INK} outline={0.03} position={[-1.3, 1.5, -2.2]} />
      <Part geometry={geo.box(2.3, 0.85, 0.12)} color={0xfff8e7} outline={0.05} position={[-1.3, 2.8, -2.2]} />
      <mesh position={[-1.3, 2.8, -2.13]}>
        <planeGeometry args={[2.1, 0.72]} />
        <meshBasicMaterial map={sign} toneMapped={false} />
      </mesh>
      {/* the cab, waiting nose to the north */}
      <group position={[0, 0, 0.6]}>
        <Part geometry={geo.box(1.7, 0.7, 3.4)} color={0xffd23f} outline={0.05} position-y={0.65} />
        <Part geometry={geo.box(1.5, 0.6, 1.8)} color={0xffd23f} outline={0.05} position={[0, 1.3, 0.2]} />
        <Part geometry={geo.box(1.52, 0.4, 1.5)} color={WINDOW} outline={0} position={[0, 1.32, 0.2]} />
        <Part geometry={geo.box(0.7, 0.25, 0.35)} color={0xfff8e7} outline={0.03} position={[0, 1.72, 0.2]} />
        <mesh position={[0, 1.72, 0.38]}>
          <planeGeometry args={[0.66, 0.22]} />
          <meshBasicMaterial map={roof} toneMapped={false} />
        </mesh>
        {[-1, 1].flatMap((sx) =>
          [-1.1, 1.1].map((z) => (
            <Part key={`${sx},${z}`} geometry={geo.cyl(0.32, 0.32, 0.25, 12)} color={INK} outline={0} position={[sx * 0.85, 0.32, z]} rotation-z={Math.PI / 2} />
          )),
        )}
        {[-0.55, 0.55].map((sx) => (
          <Part key={sx} geometry={geo.box(0.3, 0.18, 0.06)} color={0xfff1a8} outline={0} position={[sx, 0.75, -1.72]} />
        ))}
      </group>
    </group>
  );
}
