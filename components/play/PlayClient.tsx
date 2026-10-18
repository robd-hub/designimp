"use client";

import { Component, useSyncExternalStore, type ReactNode } from "react";
import dynamic from "next/dynamic";
import Hud from "./Hud";
import StreetList from "./StreetList";
import s from "./play.module.css";

// The 3D scene loads after the page shell, on the client only.
const Town = dynamic(() => import("./Town"), { ssr: false });

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") ?? c.getContext("webgl"));
  } catch {
    return false;
  }
}
const noop = () => () => {};

// If the scene still fails to start, show the plain list instead of a stuck loader.
class SceneGuard extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? <StreetList /> : this.props.children;
  }
}

export default function PlayClient({ fontClass, signFont }: { fontClass: string; signFont: string }) {
  const webgl = useSyncExternalStore(noop, hasWebGL, () => true);
  return (
    <main id="main-content" className={`${s.root} ${fontClass}`}>
      {webgl ? (
        <SceneGuard>
          <Town font={signFont} />
          <Hud />
        </SceneGuard>
      ) : (
        <StreetList />
      )}
    </main>
  );
}
