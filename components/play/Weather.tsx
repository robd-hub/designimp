"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { create } from "zustand";
import { game, usePlay } from "./store";
import { groundY } from "./terrain";
import { seeded } from "./colliders";
import x from "./extras.module.css";

// The weather in Lincoln right now, from Open-Meteo (free, no key), shown in the town: a greyer sky and
// softer light under cloud, rain or snow falling round the Imp, fog, and day or night by Lincoln's clock.
// ?weather=rain (or clear, cloudy, fog, snow, storm) previews any of them without asking Open-Meteo.

export type Sky = "clear" | "cloudy" | "fog" | "rain" | "snow" | "storm";
const SKIES: Sky[] = ["clear", "cloudy", "fog", "rain", "snow", "storm"];

type Now = { sky: Sky; label: string; temp: number | null; day: boolean };
type WeatherState = {
  now: Now | null;
  fx: boolean; // effects on; the visitor can turn them off
  toggleFx: () => void;
};

const FX_KEY = "imp-weather-fx";
const CACHE_KEY = "imp-weather";
const CACHE_MS = 10 * 60 * 1000;
const URL =
  "https://api.open-meteo.com/v1/forecast?latitude=53.2307&longitude=-0.5406&current=weather_code,is_day,cloud_cover,precipitation,wind_speed_10m,temperature_2m&timezone=Europe%2FLondon";

export const useWeather = create<WeatherState>((set) => ({
  now: null,
  fx: true,
  toggleFx: () =>
    set(({ fx }) => {
      try {
        localStorage.setItem(FX_KEY, fx ? "0" : "1");
      } catch {}
      return { fx: !fx };
    }),
}));

// WMO weather codes, as Open-Meteo reports them.
const LABELS: Record<number, string> = {
  0: "clear sky",
  1: "mainly clear",
  2: "partly cloudy",
  3: "overcast",
  45: "fog",
  48: "freezing fog",
  51: "light drizzle",
  53: "drizzle",
  55: "heavy drizzle",
  56: "freezing drizzle",
  57: "freezing drizzle",
  61: "light rain",
  63: "rain",
  65: "heavy rain",
  66: "freezing rain",
  67: "freezing rain",
  71: "light snow",
  73: "snow",
  75: "heavy snow",
  77: "snow grains",
  80: "rain showers",
  81: "rain showers",
  82: "heavy showers",
  85: "snow showers",
  86: "heavy snow showers",
  95: "thunderstorm",
  96: "thunderstorm with hail",
  99: "thunderstorm with hail",
};
export function skyOf(code: number, cloud = 0): Sky {
  if (code >= 95) return "storm";
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return "snow";
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return "rain";
  if (code === 45 || code === 48) return "fog";
  if (code === 3 || (code === 2 && cloud >= 60)) return "cloudy";
  return "clear";
}
const PREVIEW: Record<Sky, string> = { clear: "clear sky", cloudy: "overcast", fog: "fog", rain: "light rain", snow: "snow", storm: "thunderstorm" };
const ICON: Record<Sky, string> = { clear: "☀", cloudy: "☁", fog: "≋", rain: "☂", snow: "❄", storm: "⚡" };

type Current = { weather_code: number; is_day: number; cloud_cover?: number; temperature_2m?: number };
function fromCurrent(c: Current): Now {
  return {
    sky: skyOf(c.weather_code, c.cloud_cover),
    label: LABELS[c.weather_code] ?? "",
    temp: typeof c.temperature_2m === "number" ? Math.round(c.temperature_2m) : null,
    day: c.is_day !== 0,
  };
}

async function fetchNow(): Promise<Current | null> {
  try {
    const hit = JSON.parse(localStorage.getItem(CACHE_KEY) ?? "null");
    if (hit && Date.now() - hit.at < CACHE_MS && typeof hit.current?.weather_code === "number") return hit.current;
  } catch {}
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), 6000);
  try {
    const res = await fetch(URL, { signal: ctl.signal });
    if (!res.ok) return null;
    const current = (await res.json())?.current;
    if (typeof current?.weather_code !== "number") return null;
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), current }));
    } catch {}
    return current;
  } catch {
    return null; // offline or blocked: the town just stays sunny
  } finally {
    clearTimeout(t);
  }
}

// Load once, when the scene mounts. Lincoln's day or night sets the town's, unless previewing.
function useLoadWeather() {
  useEffect(() => {
    let live = true;
    try {
      if (localStorage.getItem(FX_KEY) === "0") useWeather.setState({ fx: false });
    } catch {}
    const ask = new URLSearchParams(window.location.search).get("weather") as Sky | null;
    if (ask && SKIES.includes(ask)) {
      useWeather.setState({ now: { sky: ask, label: PREVIEW[ask], temp: null, day: !usePlay.getState().night } });
      return;
    }
    fetchNow().then((c) => {
      if (!live || !c) return;
      const now = fromCurrent(c);
      useWeather.setState({ now });
      usePlay.setState({ night: !now.day });
    });
    return () => {
      live = false;
    };
  }, []);
}

// What the scene should look like under the current sky (clear when the effects are off).
const DAY_SKY: Record<Sky, string> = { clear: "#7ccaff", cloudy: "#a9bccd", fog: "#c3ccd4", rain: "#8d9db0", snow: "#cfd9e4", storm: "#6f7e92" };
const NIGHT_SKY: Record<Sky, string> = { clear: "#1d2547", cloudy: "#262c40", fog: "#2c3244", rain: "#20263a", snow: "#2e3550", storm: "#181d2c" };
const LIGHT: Record<Sky, { hemi: number; sun: number; cloud: number; fog: [number, number] | null }> = {
  clear: { hemi: 1, sun: 1, cloud: 0xffffff, fog: null },
  cloudy: { hemi: 0.85, sun: 0.45, cloud: 0xd9dee6, fog: null },
  fog: { hemi: 0.9, sun: 0.4, cloud: 0xe4e8ec, fog: [8, 60] },
  rain: { hemi: 0.75, sun: 0.35, cloud: 0xb8c0cc, fog: [35, 140] },
  snow: { hemi: 0.95, sun: 0.55, cloud: 0xeef2f6, fog: [30, 130] },
  storm: { hemi: 0.6, sun: 0.25, cloud: 0x9aa3b0, fog: [30, 120] },
};
export function useSky(night: boolean) {
  const sky = useWeather((w) => (w.fx && w.now ? w.now.sky : "clear"));
  return { sky, color: (night ? NIGHT_SKY : DAY_SKY)[sky], ...LIGHT[sky] };
}

// Rain or snow in a box round the Imp. One instanced mesh; fewer drops on phones; held still (not
// falling) for anyone who prefers reduced motion.
const BOX = 56,
  HIGH = 26;
function Fall({ snow, heavy, reduce }: { snow: boolean; heavy: boolean; reduce: boolean }) {
  const mesh = useRef<THREE.InstancedMesh>(null!);
  const phone = useMemo(() => window.matchMedia("(pointer: coarse), (max-width: 600px)").matches, []);
  const count = Math.round((snow ? 700 : 1100) * (phone ? 0.4 : 1) * (heavy ? 1.3 : 1));
  const seeds = useMemo(() => {
    const a = new Float32Array(count * 4);
    const rand = seeded(count);
    for (let i = 0; i < count; i++) {
      a[i * 4] = rand() * BOX;
      a[i * 4 + 1] = rand() * HIGH;
      a[i * 4 + 2] = rand() * BOX;
      a[i * 4 + 3] = 0.8 + rand() * 0.4; // speed
    }
    return a;
  }, [count]);
  const geometry = useMemo(() => (snow ? new THREE.SphereGeometry(0.07, 5, 4) : new THREE.BoxGeometry(0.035, 0.7, 0.035)), [snow]);
  const material = useMemo(
    () => new THREE.MeshBasicMaterial({ color: snow ? 0xffffff : 0xb9d4f2, transparent: true, opacity: snow ? 0.95 : 0.6, depthWrite: false }),
    [snow],
  );
  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );
  const wrap = (v: number, n: number) => ((v % n) + n) % n;
  const place = (t: number) => {
    const m = mesh.current;
    if (!m) return;
    const arr = m.instanceMatrix.array as Float32Array;
    const fall = snow ? 1.6 : heavy ? 22 : 16;
    const { x: px, z: pz } = game.pos;
    for (let i = 0; i < count; i++) {
      const sp = seeds[i * 4 + 3];
      let wx = px - BOX / 2 + wrap(seeds[i * 4] - px, BOX),
        wz = pz - BOX / 2 + wrap(seeds[i * 4 + 2] - pz, BOX);
      if (snow) {
        wx += Math.sin(t * 0.8 + i) * 0.5;
        wz += Math.cos(t * 0.6 + i * 1.3) * 0.3;
      }
      const y = groundY(wz) + wrap(seeds[i * 4 + 1] - t * fall * sp, HIGH);
      const o = i * 16;
      arr[o] = arr[o + 5] = arr[o + 10] = arr[o + 15] = 1;
      arr[o + 12] = wx;
      arr[o + 13] = y;
      arr[o + 14] = wz;
    }
    m.instanceMatrix.needsUpdate = true;
  };
  useEffect(() => place(0));
  useFrame(({ clock }) => {
    if (!reduce) place(clock.elapsedTime);
  });
  return <instancedMesh ref={mesh} args={[geometry, material, count]} frustumCulled={false} raycast={() => null} renderOrder={2} />;
}

export function Weather({ reduce }: { reduce: boolean }) {
  useLoadWeather();
  const sky = useWeather((w) => (w.fx && w.now ? w.now.sky : "clear"));
  if (sky === "rain" || sky === "storm") return <Fall key="rain" snow={false} heavy={sky === "storm"} reduce={reduce} />;
  if (sky === "snow") return <Fall key="snow" snow heavy={false} reduce={reduce} />;
  return null;
}

// "Lincoln now: 12°C, light rain", which also turns the effects off and on.
export function WeatherChip({ narrow }: { narrow: boolean }) {
  const now = useWeather((w) => w.now);
  const fx = useWeather((w) => w.fx);
  const toggleFx = useWeather((w) => w.toggleFx);
  if (!now) return null;
  const temp = now.temp === null ? "" : `${now.temp}°C`;
  const full = `Lincoln now: ${[temp, now.label].filter(Boolean).join(", ")}`;
  return (
    <button
      className={`${x.weather} ${fx ? "" : x.off}`}
      onClick={toggleFx}
      aria-pressed={fx}
      title={`${full}. ${fx ? "Turn weather effects off" : "Turn weather effects on"}`}
      aria-label={`${full}. Weather effects ${fx ? "on" : "off"}`}
    >
      <span aria-hidden="true">{ICON[now.sky]}</span> {narrow ? temp || now.label : full}
    </button>
  );
}
