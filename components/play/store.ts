import { create } from "zustand";
import * as THREE from "three";
import { PLACES, type Place } from "./places";

type PlayState = {
  ready: boolean;
  open: Place | null;
  near: Place | null;
  setReady: () => void;
  setNear: (p: Place | null) => void;
  openPlace: (p: Place) => void;
  close: () => void;
};

// Per-frame values live outside React state so movement never re-renders.
export const game = {
  pos: new THREE.Vector3(0, 0, 8),
  face: 0,
  target: null as THREE.Vector3 | null,
  pending: null as Place | null,
  zoom: 1,
  keys: {} as Record<string, boolean>,
};

function syncUrl(p: Place | null) {
  const url = new URL(window.location.href);
  if (p) url.searchParams.set("place", p.id);
  else url.searchParams.delete("place");
  window.history.replaceState(null, "", url);
}

export const usePlay = create<PlayState>((set) => ({
  ready: false,
  open: null,
  near: null,
  setReady: () => set({ ready: true }),
  setNear: (near) => set({ near }),
  openPlace: (open) => {
    game.target = null;
    game.pending = null;
    syncUrl(open);
    set({ open });
  },
  close: () => {
    syncUrl(null);
    set({ open: null });
  },
}));

export function doorOf(p: Place) {
  const off = p.d / 2 + 1.8;
  return new THREE.Vector3(p.x + Math.sin(p.rot) * off, 0, p.z + Math.cos(p.rot) * off);
}

export const DOORS = new Map(PLACES.map((p) => [p.id, doorOf(p)]));

export function walkTo(p: Place) {
  const s = usePlay.getState();
  if (!s.ready) return s.openPlace(p); // no 3D scene: just open the panel
  s.close();
  game.target = DOORS.get(p.id)!.clone();
  game.pending = p;
}

export function nearestPlace(): Place | null {
  for (const p of PLACES) if (DOORS.get(p.id)!.distanceTo(game.pos) < 3.2) return p;
  return null;
}
