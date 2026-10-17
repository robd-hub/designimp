import { create } from "zustand";
import * as THREE from "three";
import { PLACES, type Place } from "./places";
import { NPCS, npcPos, type Npc } from "./npcs";

type PlayState = {
  ready: boolean;
  open: Place | null;
  near: Place | null;
  nearNpc: Npc | null;
  talk: { npc: Npc; line: number } | null;
  setReady: () => void;
  setNear: (p: Place | null, n: Npc | null) => void;
  startTalk: (n: Npc) => void;
  nextLine: () => void;
  endTalk: () => void;
  openPlace: (p: Place) => void;
  close: () => void;
};

// Per-frame values live outside React state so movement never re-renders.
export const game = {
  pos: new THREE.Vector3(0, 0, 9),
  face: 0,
  target: null as THREE.Vector3 | null,
  pending: null as Place | null,
  pendingNpc: null as Npc | null,
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
  nearNpc: null,
  talk: null,
  setReady: () => set({ ready: true }),
  setNear: (near, nearNpc) => set({ near, nearNpc }),
  openPlace: (open) => {
    game.target = null;
    game.pending = null;
    game.pendingNpc = null;
    syncUrl(open);
    set({ open, talk: null });
  },
  startTalk: (npc) => {
    game.target = null;
    game.pendingNpc = null;
    set({ talk: { npc, line: 0 } });
  },
  nextLine: () =>
    set(({ talk }) => ({ talk: talk && talk.line + 1 < talk.npc.lines.length ? { ...talk, line: talk.line + 1 } : null })),
  endTalk: () => set({ talk: null }),
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
  s.endTalk();
  game.target = DOORS.get(p.id)!.clone();
  game.pending = p;
  game.pendingNpc = null;
}

export function walkToNpc(n: Npc) {
  const s = usePlay.getState();
  s.close();
  s.endTalk();
  game.pending = null;
  game.pendingNpc = n;
  game.target = npcPos.get(n.id)!.clone();
}

export function nearestNpc(): Npc | null {
  let best: Npc | null = null,
    bestD = 2.6;
  for (const n of NPCS) {
    const d = npcPos.get(n.id)!.distanceTo(game.pos);
    if (d < bestD) [best, bestD] = [n, d];
  }
  return best;
}

export function nearestPlace(): Place | null {
  for (const p of PLACES) if (DOORS.get(p.id)!.distanceTo(game.pos) < 3.2) return p;
  return null;
}
