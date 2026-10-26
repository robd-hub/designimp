import { create } from "zustand";
import type { ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { PLACES, type Place } from "./places";
import { NPCS, npcPos, type Npc } from "./npcs";
import { crossings, inCornhill, CORNHILL_WAY, RAIL } from "./colliders";
import { cleanName, cleanType, cleanColour, type ShopType } from "./shop";

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
  // Optionally styled: the kind of business and the colour of its front.
  shop: { name: string; lot: string; type?: ShopType; colour?: string } | null;
  welcome: boolean; // the Imp's hello, once per visit
  setWelcome: (w: boolean) => void;
  setShop: (name: string, lot: string) => void;
  styleShop: (lot: string, style: { type?: ShopType; colour?: string }) => void;
  // Go to by taxi rather than on foot, and the ride in progress.
  taxi: boolean;
  setTaxi: (taxi: boolean) => void;
  ride: Place | null;
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
    if (typeof v?.name !== "string" || typeof v?.lot !== "string") return null;
    return { name: cleanName(v.name).trim(), lot: v.lot, type: cleanType(v.type), colour: cleanColour(v.colour) };
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

// Sincil Bank: Saturdays are matchdays; ?matchday=1 previews one any day.
export function isMatchday() {
  return new Date().getDay() === 6 || new URLSearchParams(window.location.search).get("matchday") === "1";
}

function isNight() {
  const h = new Date().getHours();
  return h < 7 || h >= 19;
}

function saveShop(shop: PlayState["shop"]) {
  try {
    localStorage.setItem(SHOP_KEY, JSON.stringify(shop));
  } catch {}
}

// Per-frame values live outside React state so movement never re-renders.
export const game = {
  pos: new THREE.Vector3(0, 0, 9),
  face: 0,
  target: null as THREE.Vector3 | null,
  via: [] as THREE.Vector3[], // where to head next after target, e.g. over the level crossing
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
    const prev = usePlay.getState().shop;
    const clean = cleanName(name);
    const style = prev?.lot === lot ? { type: prev.type, colour: prev.colour } : {};
    const shop = clean.trim() || style.type || style.colour ? { name: clean, lot, ...style } : null;
    saveShop(shop);
    set({ shop });
  },
  styleShop: (lot, style) => {
    const prev = usePlay.getState().shop;
    const shop = { name: prev?.lot === lot ? prev.name : "", lot, type: cleanType(style.type) ?? (prev?.lot === lot ? prev.type : undefined), colour: cleanColour(style.colour) ?? (prev?.lot === lot ? prev.colour : undefined) };
    saveShop(shop);
    set({ shop });
  },
  taxi: false,
  setTaxi: (taxi) => set({ taxi }),
  ride: null,
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
  if (s.ride) return;
  const door = DOORS.get(p.id)!;
  if (s.taxi && door.distanceTo(game.pos) > TAXI_MIN) return taxiTo(p);
  s.close();
  s.endTalk();
  const route = crossings([game.pos.x, game.pos.z], [door.x, door.z]).map(([x, z]) => new THREE.Vector3(x, 0, z));
  // Everything south of the railway lines the south road or sits down a side road off it: walk down the road
  // and turn off level with the door, rather than cutting across the shops and houses on the way.
  const from = route.at(-1) ?? game.pos;
  const sideRoad = door.z > RAIL.z + RAIL.fence && Math.abs(door.x) > 7 && Math.abs(from.z - door.z) > 4;
  if (sideRoad && Math.abs(from.x) > 7 && from.z > RAIL.z + RAIL.fence) route.push(new THREE.Vector3(0, 0, from.z));
  if (sideRoad) route.push(new THREE.Vector3(0, 0, door.z));
  // The tank's roundabout is a long way out along the main road: step onto the road first and follow it,
  // rather than cutting across the buildings beside it.
  const alongMain = !sideRoad && Math.abs(door.z) < 7 && Math.abs(from.z) > 4.3 && Math.abs(from.x - door.x) > 12;
  if (alongMain) route.push(new THREE.Vector3(from.x, 0, 0));
  // Cornhill is closed in by the shops round it: come in off the main road, unless already on the square.
  if (inCornhill(door.x, door.z) && !inCornhill(from.x, from.z)) {
    if (from.z < -4.3) route.push(new THREE.Vector3(from.x, 0, 0));
    route.push(new THREE.Vector3(CORNHILL_WAY, 0, 0), new THREE.Vector3(CORNHILL_WAY, 0, -12));
  }
  walkRoute([...route, door.clone()]);
  game.pending = p;
  game.pendingNpc = null;
}

// Walk to each point in turn.
export function walkRoute([first, ...rest]: THREE.Vector3[]) {
  game.target = first;
  game.via = rest;
}

// Taxi: a short ride with the screen faded out, then out at the door and straight in. Anything
// closer than this is quicker on foot.
const TAXI_MIN = 14;
export const RIDE_MS = 1600;
export function taxiTo(p: Place) {
  const s = usePlay.getState();
  s.close();
  s.endTalk();
  game.target = null;
  game.via = [];
  game.pending = p; // so nothing on the way counts as "near" and E does nothing mid-ride
  game.pendingNpc = null;
  usePlay.setState({ ride: p });
  // the screen is fully faded by now: drop the Imp at the door, facing in
  setTimeout(() => {
    const door = DOORS.get(p.id)!;
    game.pos.copy(door);
    game.face = Math.atan2(p.x - door.x, p.z - door.z);
    game.target = null;
    game.via = [];
  }, RIDE_MS * 0.45);
  setTimeout(() => {
    game.pending = null;
    usePlay.setState({ ride: null });
    usePlay.getState().openPlace(p);
  }, RIDE_MS);
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
if (typeof window !== "undefined") (window as unknown as { __game: typeof game }).__game = game;
