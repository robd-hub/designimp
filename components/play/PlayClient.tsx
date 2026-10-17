"use client";

import dynamic from "next/dynamic";
import Hud from "./Hud";
import s from "./play.module.css";

// The 3D scene loads after the page shell, on the client only.
const Town = dynamic(() => import("./Town"), { ssr: false });

export default function PlayClient({ fontClass, signFont }: { fontClass: string; signFont: string }) {
  return (
    <main id="main-content" className={`${s.root} ${fontClass}`}>
      <Town font={signFont} />
      <Hud />
    </main>
  );
}
