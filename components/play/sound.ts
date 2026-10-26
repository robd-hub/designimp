import { create } from "zustand";
import type * as THREE from "three";
import { PLACES, type Place } from "./places";
import { RAIL, RIVER } from "./colliders";
import { game, usePlay, isMatchday } from "./store";

// The town's sounds, all made on the fly with the Web Audio API, so there are no audio files to download or license.
// Sound starts off. Nothing is built until the visitor turns it on with the speaker button, and the choice is
// remembered: someone who left it on hears the town again from their first tap or key press on the next visit
// (browsers won't play sound before then).

// Where the moving things are, written each frame by the scene for their sounds to follow.
export const AUDIO = {
  cars: [] as { x: number; z: number; v: number; on: boolean; bus: boolean }[],
  train: { on: false, x0: 0, x1: 0, head: 0, dir: 1, v: 0, run: -1 },
  crossing: false, // the barrier lamps are flashing
  ghost: { on: false, x: 0, z: 0 },
};

const KEY = "imp-sound";

type Voice = { gain: GainNode; pan: StereoPannerNode };

let ac: AudioContext | null = null;
let out: GainNode; // everything
let amb: GainNode; // the town around you
let ui: GainNode; // clicks, chimes and the Imp
let noise: AudioBuffer;
let white: AudioBufferSourceNode;
let wind: GainNode, hum: GainNode;
const cars: { v: Voice; o1: OscillatorNode; o2: OscillatorNode; lp: BiquadFilterNode; tyre: GainNode }[] = [];
let train: { v: Voice; o1: OscillatorNode; o2: OscillatorNode; roar: GainNode; clack: GainNode };
let alarm: Voice, river: Voice, crowd: Voice & { swell: GainNode }, ghost: Voice;
// listener: where the Imp stands, and which way is right on screen
let lx = 0,
  lz = 0,
  rx = 1,
  rz = 0;
let since = 0;
const next = { bird: 0, cricket: 0, owl: 0, clack: 0, roar: 0 };
let horned = -1;
let rung = "";
let pealed = false;
let lastStep = 0;

const CATHEDRAL = PLACES.find((p) => p.id === "cathedral")!;
const STADIUM = PLACES.find((p) => p.id === "sincil-bank")!;
const QUIET_KINDS = new Set(["lot", "tank", "gate", "bridge", "arch", "oldhouse", "ruins", "street", "water", "lane", "mill", "park", "memorial"]);

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const rand = (a: number, b: number) => a + Math.random() * (b - a);
const now = () => ac!.currentTime;
const ease = (p: AudioParam, v: number, tc = 0.08) => p.setTargetAtTime(v, now(), tc);

function osc(type: OscillatorType, f: number) {
  const o = ac!.createOscillator();
  o.type = type;
  o.frequency.value = f;
  o.start();
  return o;
}
function filter(type: BiquadFilterType, f: number, q = 0.7) {
  const b = ac!.createBiquadFilter();
  b.type = type;
  b.frequency.value = f;
  b.Q.value = q;
  return b;
}
function gain(v = 0) {
  const g = ac!.createGain();
  g.gain.value = v;
  return g;
}
// A slow wobble added to a parameter.
function lfo(f: number, depth: number, param: AudioParam, type: OscillatorType = "sine") {
  osc(type, f).connect(gain(depth)).connect(param);
}
function voice(): Voice {
  const v = { gain: gain(), pan: ac!.createStereoPanner() };
  v.gain.connect(v.pan).connect(amb);
  return v;
}

// Louder up close, fading to nothing at far, and panned to the side it's on.
function level(x: number, z: number, ref: number, far: number) {
  const d = Math.hypot(x - lx, z - lz);
  return (Math.max(0, 1 - d / far) * ref) / (ref + d);
}
function panOf(x: number, z: number) {
  const dx = x - lx,
    dz = z - lz;
  return clamp((dx * rx + dz * rz) / Math.max(Math.hypot(dx, dz), 3), -0.85, 0.85);
}
function place(v: Voice, x: number, z: number, loud: number, ref: number, far: number) {
  ease(v.gain.gain, loud * level(x, z, ref, far));
  ease(v.pan.pan, panOf(x, z));
}

// A one-off note with a quick attack and a decay, optionally gliding to another pitch.
function tone(f: number, at: number, dur: number, loud: number, type: OscillatorType = "sine", to?: number, dest: AudioNode = ui) {
  const o = ac!.createOscillator();
  o.type = type;
  o.frequency.setValueAtTime(f, at);
  if (to) o.frequency.exponentialRampToValueAtTime(to, at + dur);
  const g = gain();
  g.gain.setValueAtTime(0, at);
  g.gain.linearRampToValueAtTime(loud, at + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  o.connect(g).connect(dest);
  o.start(at);
  o.stop(at + dur + 0.05);
}
// A short burst of filtered noise: footsteps, rail joints, whooshes.
function burst(at: number, dur: number, loud: number, f: number, q: number, dest: AudioNode = ui, to?: number) {
  const s = ac!.createBufferSource();
  s.buffer = noise;
  const b = filter("bandpass", f, q);
  if (to) b.frequency.exponentialRampToValueAtTime(to, at + dur);
  const g = gain();
  g.gain.setValueAtTime(0, at);
  g.gain.linearRampToValueAtTime(loud, at + Math.min(0.01, dur / 4));
  g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  s.connect(b).connect(g).connect(dest);
  s.start(at, rand(0, 1.5));
  s.stop(at + dur + 0.05);
}

// A church bell: a handful of slightly out-of-tune partials, the high ones dying away first.
const PARTIALS: [number, number, number][] = [
  [0.5, 0.5, 5], // hum
  [1, 1, 3.6], // prime
  [1.19, 0.45, 2.8], // tierce, the minor third that makes a bell sound like a bell
  [1.5, 0.3, 2.2],
  [2, 0.55, 1.8], // nominal
  [2.52, 0.22, 1.2],
  [3.01, 0.18, 0.9],
  [4.16, 0.08, 0.6],
];
function bell(f: number, at: number, loud: number, ring = 1) {
  const g = gain(loud * level(CATHEDRAL.x, CATHEDRAL.z, 35, 420));
  const p = ac!.createStereoPanner();
  p.pan.value = panOf(CATHEDRAL.x, CATHEDRAL.z);
  g.connect(p).connect(amb);
  for (const [r, a, d] of PARTIALS) tone(f * r, at, d * ring, a * 0.5, "sine", undefined, g);
}
// Rounds on six bells, twice down the scale.
function peal() {
  const t = now() + 0.1;
  const scale = [587.33, 554.37, 493.88, 440, 392, 369.99];
  for (let i = 0; i < 12; i++) bell(scale[i % 6], t + i * 0.3 + (i >= 6 ? 0.3 : 0), 0.7, 0.8);
}
function chimes(d: Date) {
  const t = now() + 0.1;
  const m = d.getMinutes();
  const quarter = [659.25, 523.25, 587.33, 392];
  const q = m === 0 ? 4 : m / 15;
  for (let i = 0; i < q * 4; i++) bell(quarter[(i + Math.floor(i / 4)) % 4], t + i * 0.7 + Math.floor(i / 4) * 0.8, 0.6);
  // the big bell counts the hour after the full chime
  if (m === 0) for (let i = 0; i < (d.getHours() % 12 || 12); i++) bell(110, t + q * 3.6 + 1.5 + i * 2.6, 1.3, 1.6);
}

function chirp() {
  const t = now() + 0.02;
  const p = ac!.createStereoPanner();
  p.pan.value = rand(-0.8, 0.8);
  const g = gain(rand(0.3, 1));
  g.connect(p).connect(amb);
  const base = rand(2600, 4600);
  const notes = Math.floor(rand(2, 6));
  for (let i = 0; i < notes; i++) {
    const f = base * rand(0.85, 1.15);
    tone(f, t + i * rand(0.08, 0.14), rand(0.05, 0.1), 0.05, "sine", f * rand(0.75, 1.35), g);
  }
}
function cricket() {
  const t = now() + 0.02;
  const p = ac!.createStereoPanner();
  p.pan.value = rand(-0.7, 0.7);
  const g = gain(rand(0.5, 1));
  g.connect(p).connect(amb);
  const f = rand(4200, 4700);
  for (let i = 0; i < 3; i++) tone(f, t + i * 0.045, 0.03, 0.03, "sine", undefined, g);
}
function owl() {
  const t = now() + 0.05;
  const p = ac!.createStereoPanner();
  p.pan.value = rand(-0.6, 0.6);
  p.connect(amb);
  [0, 0.9, 1.25, 1.6].forEach((dt, i) => tone(i ? 370 : 390, t + dt, i ? 0.3 : 0.5, 0.05, "sine", i ? 350 : 360, p));
}
function horn(x: number) {
  const t = now() + 0.02;
  const g = gain(level(x, RAIL.z, 12, 220));
  const p = ac!.createStereoPanner();
  p.pan.value = panOf(x, RAIL.z);
  const lp = filter("lowpass", 1600);
  lp.connect(g).connect(p).connect(amb);
  // the two-tone horn, high then low
  for (const [f, at] of [
    [370, 0],
    [311, 0.55],
  ])
    for (const type of ["sawtooth", "square"] as const) {
      const o = ac!.createOscillator();
      o.type = type;
      o.frequency.value = f;
      const e = gain();
      e.gain.setValueAtTime(0, t + at);
      e.gain.linearRampToValueAtTime(0.06, t + at + 0.04);
      e.gain.setValueAtTime(0.06, t + at + 0.45);
      e.gain.linearRampToValueAtTime(0, t + at + 0.52);
      o.connect(e).connect(lp);
      o.start(t + at);
      o.stop(t + at + 0.6);
    }
}

// An engine: two detuned saws that beat against each other, through a filter that opens with speed, plus tyre noise.
function engine() {
  const v = voice();
  const lp = filter("lowpass", 300);
  const o1 = osc("sawtooth", 40),
    o2 = osc("sawtooth", 41.5);
  o1.connect(lp);
  o2.connect(lp);
  lp.connect(v.gain);
  const tyre = gain();
  white.connect(filter("bandpass", 800, 0.6)).connect(tyre).connect(v.gain);
  return { v, o1, o2, lp, tyre };
}

function build() {
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  ac = new AC({ latencyHint: "interactive" });
  // iPhones mute web audio on the silent switch unless the page says it's playing on purpose; it is, the visitor asked
  try {
    (navigator as unknown as { audioSession: { type: string } }).audioSession.type = "playback";
  } catch {}
  const comp = ac.createDynamicsCompressor();
  comp.threshold.value = -20;
  comp.ratio.value = 4;
  out = gain(0);
  out.connect(comp).connect(ac.destination);
  amb = gain(1);
  ui = gain(0.9);
  amb.connect(out);
  ui.connect(out);

  noise = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate);
  const d = noise.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  white = ac.createBufferSource();
  white.buffer = noise;
  white.loop = true;
  white.start();

  // wind, gusting now and then
  const wl = filter("lowpass", 380, 0.8);
  lfo(0.09, 160, wl.frequency);
  wind = gain(0.25);
  lfo(0.05, 0.1, wind.gain);
  white.connect(wl).connect(wind).connect(amb);
  // the low hum of traffic somewhere out of town
  hum = gain(0.3);
  white.connect(filter("lowpass", 170, 0.5)).connect(hum).connect(amb);

  // the train: a diesel throb, the roar of wheels on rails and the clack of the rail joints
  {
    const v = voice();
    const lp = filter("lowpass", 260);
    const o1 = osc("sawtooth", 34),
      o2 = osc("square", 51);
    o1.connect(lp);
    o2.connect(gain(0.4)).connect(lp);
    lp.connect(v.gain);
    const roar = gain();
    white.connect(filter("lowpass", 700)).connect(roar).connect(v.gain);
    const clack = gain(1);
    clack.connect(v.gain);
    train = { v, o1, o2, roar, clack };
  }

  // the level crossing's warble while the lamps flash
  alarm = voice();
  {
    const o = osc("square", 720);
    lfo(1.7, 110, o.frequency, "square");
    o.connect(filter("lowpass", 1400)).connect(gain(0.5)).connect(alarm.gain);
  }

  // the Witham, babbling along its length
  river = voice();
  {
    const g = gain(0.6);
    lfo(3.1, 0.15, g.gain);
    lfo(0.37, 0.2, g.gain);
    const bp = filter("bandpass", 1300, 0.6);
    lfo(0.7, 400, bp.frequency);
    white.connect(bp).connect(g).connect(river.gain);
  }

  // the crowd at Sincil Bank on matchday
  {
    const v = voice();
    const swell = gain(0.5);
    lfo(0.13, 0.12, swell.gain);
    white.connect(filter("bandpass", 650, 0.5)).connect(swell).connect(v.gain);
    crowd = { ...v, swell };
  }

  // the ghost's woo
  ghost = voice();
  {
    const o = osc("sine", 280);
    lfo(5, 7, o.frequency);
    lfo(0.3, 70, o.frequency);
    const g = gain(0.5);
    lfo(0.2, 0.5, g.gain);
    o.connect(g).connect(ghost.gain);
  }

  // What happens in the game, as it happens.
  usePlay.subscribe((s, was) => {
    if (!running()) return;
    const t = now() + 0.01;
    if (s.open && s.open !== was.open) opened(s.open);
    else if (!s.open && was.open) tone(520, t, 0.09, 0.05, "triangle", 330);
    if (s.talk && (s.talk.npc !== was.talk?.npc || s.talk.line !== was.talk?.line)) {
      // a little babble, pitched a bit differently for each speaker
      const base = 380 + (s.talk.npc.id.length % 5) * 60;
      for (let i = 0; i < 4; i++) tone(base * rand(0.85, 1.35), t + i * 0.075, 0.06, 0.04, "triangle");
    }
    if (s.found.length === was.found.length + 1) [1047, 1319, 1568, 2093].forEach((f, i) => tone(f, t + i * 0.07, 0.25, 0.05, "triangle"));
    if (s.badge && !was.badge)
      [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone(f, t + 0.3 + i * 0.12 + (i > 3 ? 0.1 : 0), i === 5 ? 0.9 : 0.2, 0.06, "square"));
    if (s.night !== was.night) burst(t, 0.6, 0.06, s.night ? 2400 : 500, 1.5, ui, s.night ? 500 : 2400);
    if (s.street !== was.street) burst(t, 0.35, 0.05, 900, 1, ui, s.street ? 2600 : 400);
    if (s.hover && s.hover.place !== was.hover?.place) tone(1800, t, 0.03, 0.015);
  });
}

function opened(p: Place) {
  const t = now() + 0.01;
  if (p.id === "cathedral") peal();
  else if (QUIET_KINDS.has(p.kind ?? "shop")) tone(660, t, 0.18, 0.05, "sine", 880);
  else {
    // the bell over a shop door
    tone(1568, t, 0.6, 0.04);
    tone(2093, t + 0.13, 0.7, 0.035);
  }
}

const running = () => !!ac && ac.state === "running" && useSound.getState().on;

function start() {
  if (!ac) build();
  if (document.hidden) return;
  ac!.resume().then(() => ease(out.gain, 0.85, 0.3));
}
function stop() {
  if (!ac) return;
  ease(out.gain, 0, 0.08);
  setTimeout(() => !useSound.getState().on && ac?.suspend(), 400);
}

// Someone who left sound on last time hears it again from their first tap or key press.
function armOnGesture() {
  const go = () => {
    ["pointerup", "touchend", "keydown"].forEach((e) => window.removeEventListener(e, go, true));
    if (useSound.getState().on) start();
  };
  ["pointerup", "touchend", "keydown"].forEach((e) => window.addEventListener(e, go, true));
}

let watching = false;
function watchVisibility() {
  if (watching) return;
  watching = true;
  document.addEventListener("visibilitychange", () => {
    if (!ac) return;
    if (document.hidden) ac.suspend();
    else if (useSound.getState().on) ac.resume();
  });
}

export const useSound = create<{ on: boolean; toggle: () => void; hydrate: () => void }>((set, get) => ({
  on: false,
  hydrate: () => {
    let on = false;
    try {
      on = localStorage.getItem(KEY) === "on";
    } catch {}
    watchVisibility();
    if (on) armOnGesture();
    set({ on });
  },
  toggle: () => {
    const on = !get().on;
    try {
      localStorage.setItem(KEY, on ? "on" : "off");
    } catch {}
    set({ on });
    if (on) {
      start();
      const t = now() + 0.05;
      tone(784, t, 0.3, 0.05);
      tone(1175, t + 0.1, 0.45, 0.04);
    } else stop();
  },
}));

// Called from inside the 3D scene each frame.
export function soundFrame(camera: THREE.Camera, dt: number, dir: THREE.Vector3) {
  if (!running()) return;
  // footsteps don't wait for the rest
  since += dt;
  if (since < 1 / 20) return;
  since = 0;
  const { night, open } = usePlay.getState();
  lx = game.pos.x;
  lz = game.pos.z;
  camera.getWorldDirection(dir);
  const l = Math.hypot(dir.x, dir.z) || 1;
  [rx, rz] = [-dir.z / l, dir.x / l];
  const t = now();

  ease(wind.gain, night ? 0.32 : 0.25, 1);
  ease(hum.gain, night ? 0.08 : 0.3, 1);
  // a panel open over the town turns the town down a little
  ease(amb.gain, open ? 0.5 : 1, 0.3);

  AUDIO.cars.forEach((c, i) => {
    const k = (cars[i] ??= engine());
    const f = c.bus ? 28 + c.v * 3.5 : 38 + c.v * 6;
    ease(k.o1.frequency, f, 0.15);
    ease(k.o2.frequency, f * 1.01 + 1.5, 0.15);
    ease(k.lp.frequency, 220 + c.v * 45, 0.15);
    ease(k.tyre.gain, 0.12 * (c.v / 7), 0.15);
    place(k.v, c.x, c.z, c.on ? (c.bus ? 0.4 : 0.3) : 0, 5, 70);
  });

  const tr = AUDIO.train;
  const tx = clamp(lx, Math.min(tr.x0, tr.x1), Math.max(tr.x0, tr.x1));
  ease(train.o1.frequency, 30 + tr.v * 0.8, 0.2);
  ease(train.o2.frequency, 45 + tr.v * 1.2, 0.2);
  ease(train.roar.gain, 0.1 * Math.min(1, tr.v / 10), 0.2);
  place(train.v, tx, RAIL.z, tr.on ? 0.7 : 0, 8, 140);
  if (tr.on && tr.v > 2 && t > next.clack) {
    burst(t + 0.02, 0.05, 0.35, 2200, 1.2, train.clack);
    burst(t + 0.14, 0.05, 0.3, 2000, 1.2, train.clack);
    next.clack = t + 9 / tr.v;
  }
  const ahead = -tr.dir * tr.head; // how far the front has to go to reach the crossing
  if (tr.on && tr.run !== horned && ahead > 25 && ahead < 60) {
    horned = tr.run;
    horn(tr.head);
  }
  place(alarm, 0, RAIL.z, AUDIO.crossing ? 0.25 : 0, 6, 70);
  place(river, clamp(lx, RIVER.x0, RIVER.x1), RIVER.z, 0.25, 3, 28);

  const match = isMatchday();
  place(crowd, STADIUM.x, STADIUM.z, match ? 0.6 : 0, 20, 150);
  if (match && t > next.roar) {
    // a near miss, or a goal
    crowd.swell.gain.setTargetAtTime(1.6, t, 0.3);
    crowd.swell.gain.setTargetAtTime(0.5, t + 2.5, 0.8);
    next.roar = t + rand(20, 45);
  }
  const g = AUDIO.ghost;
  place(ghost, g.x, g.z, night && g.on ? 0.25 : 0, 6, 50);

  if (!night && t > next.bird) {
    chirp();
    next.bird = t + rand(0.8, 4);
  }
  if (night && t > next.cricket) {
    cricket();
    next.cricket = t + rand(0.5, 1.4);
  }
  if (night && t > next.owl) {
    if (next.owl) owl();
    next.owl = t + rand(18, 40);
  }

  // the cathedral's clock chimes the quarters and strikes the hours, and rings out the first time you come up the hill
  const d = new Date();
  const key = `${d.getHours()}:${d.getMinutes()}`;
  if (d.getMinutes() % 15 === 0 && d.getSeconds() < 5 && rung !== key) {
    rung = key;
    chimes(d);
  }
  if (!pealed && Math.hypot(CATHEDRAL.x - lx, CATHEDRAL.z - lz) < 40) {
    pealed = true;
    peal();
  }
}

// One step of the Imp's feet.
export function footstep() {
  if (!running()) return;
  const t = now();
  if (t - lastStep < 0.12) return;
  lastStep = t;
  burst(t + 0.005, 0.07, 0.12, rand(700, 1100), 1.4);
  tone(rand(90, 110), t + 0.005, 0.06, 0.05, "sine", 60);
}

// The Imp's squeak when you poke him.
export function squeak() {
  if (!running()) return;
  const t = now() + 0.01;
  tone(900, t, 0.12, 0.05, "sine", 1600);
  tone(1500, t + 0.12, 0.15, 0.04, "sine", 1100);
}
