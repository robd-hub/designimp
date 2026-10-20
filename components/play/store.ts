import { create } from "zustand";
import type { ThreeEvent } from "@react-three/fiber";
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
  night: boolean;
  toggleNight: () => void;
  street: boolean; // first-person "street view"
  toggleStreet: () => void;
  found: string[];
  collect: (id: string, total: number) => void;
  hydrate: () => void;
  badge: boolean;
  setBadge: (b: boolean) => void;
  hover: { place: Place; x: number; y: number } | null;
  setHover: (h: { place: Place; x: number; y: number } | null) => void;
  // The visitor's business name, painted on the sign of the plot they typed it at.
  shop: { name: string; lot: string } | null;
  welcome: boolean; // the Imp's hello, once per visit
  setWelcome: (w: boolean) => void;
  setShop: (name: string, lot: string) => void;
};

const FOUND_KEY = "imp-hunt";
function loadFound(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(FOUND_KEY) ?? "[]");
    return Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}
const SHOP_KEY = "imp-shop";
function loadShop(): PlayState["shop"] {
  try {
    const v = JSON.parse(localStorage.getItem(SHOP_KEY) ?? "null");
    return typeof v?.name === "string" && typeof v?.lot === "string" ? v : null;
  } catch {
    return null;
  }
}

// Greet first-time arrivals, not someone sent straight to a building by link.
function firstArrival() {
  try {
    const seen = sessionStorage.getItem("imp-welcome");
    sessionStorage.setItem("imp-welcome", "1");
    return !seen && !new URLSearchParams(window.location.search).has("place");
  } catch {
    return false;
  }
}

function isNight() {
  const h = new Date().getHours();
  return h < 7 || h >= 19;
}

// Per-frame values live outside React state so movement never re-renders.
export const game = {
  pos: new THREE.Vector3(0, 0, 9),
  face: 0,
  target: null as THREE.Vector3 | null,
  pending: null as Place | null,
  pendingNpc: null as Npc | null,
  zoom: 1,
  keys: {} as Record<string, boolean>,
  joy: { x: 0, z: 0 }, // touch joystick, -1..1
  pitch: 0, // street view: look up/down
};

// Camera distance multiplier: smaller is closer.
export function zoomBy(d: number) {
  game.zoom = Math.min(2.4, Math.max(0.55, game.zoom + d));
}

function syncUrl(p: Place | null) {
  const url = new URL(window.location.href);
  if (p) url.searchParams.set("place", p.id);
  else url.searchParams.delete("place");
  window.history.replaceState(null, "", url);
}

export const usePlay = create<PlayState>((set) => ({
  hover: null,
  setHover: (hover) => set({ hover }),
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
  // set on mount (not during server render) so the HUD hydrates cleanly
  night: false,
  toggleNight: () => set(({ night }) => ({ night: !night })),
  street: false,
  toggleStreet: () =>
    set(({ street }) => {
      if (!street) {
        // Step into street view facing north, the way the map view looks.
        game.face = Math.PI;
        game.pitch = 0;
      }
      return { street: !street };
    }),
  found: [],
  hydrate: () => set({ night: isNight(), found: loadFound(), shop: loadShop(), welcome: firstArrival() }),
  welcome: false,
  setWelcome: (welcome) => set({ welcome }),
  shop: null,
  setShop: (name, lot) => {
    const shop = name.trim() ? { name, lot } : null;
    try {
      localStorage.setItem(SHOP_KEY, JSON.stringify(shop));
    } catch {}
    set({ shop });
  },
  collect: (id, total) =>
    set(({ found }) => {
      if (found.includes(id)) return {};
      const next = [...found, id];
      try {
        localStorage.setItem(FOUND_KEY, JSON.stringify(next));
      } catch {}
      return { found: next, badge: next.length >= total };
    }),
  badge: false,
  setBadge: (badge) => set({ badge }),
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
  const door = DOORS.get(p.id)!;
  // Sincil Bank and RAF Scampton sit down side roads: go by the junction rather than into the shops on the corner.
  const sideRoad = (p.kind === "stadium" || p.kind === "airfield") && Math.abs(game.pos.z - door.z) > 4;
  game.target = sideRoad ? new THREE.Vector3(0, 0, door.z) : door.clone();
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

// Click handler for a building: walk to its door (ignores drags).
export function placeClick(p: Place) {
  return (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (e.delta <= 8) walkTo(p);
  };
}

// Mouse hover over a building shows a little card about it. Pointer-out waits a
// brief moment so the mouse can travel onto the card's Learn more button.
let hideTimer: ReturnType<typeof setTimeout> | undefined;
let onCard = false;
export function keepHover() {
  onCard = true;
  clearTimeout(hideTimer);
}
function cancelHide() {
  clearTimeout(hideTimer);
}
export function leaveCard() {
  onCard = false;
  dropHover();
}
export function dropHover() {
  clearTimeout(hideTimer);
  if (onCard) return;
  hideTimer = setTimeout(() => {
    document.body.style.cursor = "";
    usePlay.getState().setHover(null);
  }, 150);
}
export function placeEvents(p: Place) {
  return {
    onClick: placeClick(p),
    onPointerOver: (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      if (e.pointerType !== "mouse") return;
      cancelHide();
      document.body.style.cursor = "pointer";
      const h = usePlay.getState().hover;
      if (h?.place.id !== p.id) usePlay.getState().setHover({ place: p, x: e.nativeEvent.clientX, y: e.nativeEvent.clientY });
    },
    onPointerOut: (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      dropHover();
    },
  };
}
