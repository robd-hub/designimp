import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { Place } from "./places";
import { Part, geo, toon, signTexture, WINDOW, LAMP } from "./toon";
import { BAILGATE, CLOSE, SHOPFRONTS } from "./colliders";
import { groundY, groundTilt } from "./terrain";
import { placeEvents, usePlay } from "./store";
import { NamePlate } from "./Wharf";

const TIMBER = 0x3a2a20;
const IRON = 0x2b2633;
const SASH = 0xfff8e7;

// Bailgate's shops, each side listed from Newport Arch down to Castle Square. Made-up names: these stand for the
// street's pubs, tea rooms and independents, not any real one. Georgian fronts are three storeys of brick or render
// behind a parapet; Tudor ones have a jettied, timber-framed upper floor under a gable onto the street.
type Look = { name: string; kind: "pub" | "tea" | "shop"; tudor: boolean; wall: number; front: number };
const LOOKS: Record<number, Look[]> = {
  [-1]: [
    { name: "The Roman Gate", kind: "pub", tudor: false, wall: 0xa9553f, front: 0x1f4d3a },
    { name: "Thimble & Thread", kind: "shop", tudor: true, wall: 0xfaf3e3, front: 0x7a3b8f },
    { name: "Quill & Ink", kind: "shop", tudor: false, wall: 0xf5dfa0, front: 0x2b59c3 },
    { name: "Pennyfeather Teas", kind: "tea", tudor: true, wall: 0xe8c36a, front: 0x9fc7b3 },
    { name: "The Wandering Imp", kind: "pub", tudor: false, wall: 0xf2e2c4, front: 0x6b1f2a },
  ],
  [1]: [
    { name: "The Bishop's Mitre", kind: "pub", tudor: true, wall: 0xfaf3e3, front: 0x1f2f5a },
    { name: "Cobble Cheese Co.", kind: "shop", tudor: false, wall: 0xc9dbe8, front: 0xffb627 },
    { name: "Honeycomb Sweets", kind: "shop", tudor: true, wall: 0xf2d6c4, front: 0xe03a3e },
    { name: "Bailgate Books", kind: "shop", tudor: false, wall: 0xa9553f, front: 0x2f8f5b },
    { name: "Minster Teacups", kind: "tea", tudor: true, wall: 0xe8f0d8, front: 0xd77a61 },
  ],
};

const SHOPS = SHOPFRONTS.filter((s) => s.bailgate);
const JETTY = 0.35; // how far a Tudor upper floor oversails the shop below
const GROUND = 2.9; // height of the ground floor

// After dark a soft halo hangs round each lantern.
const haloMat = new THREE.MeshBasicMaterial({ color: 0xffc96b, transparent: true, opacity: 0.16, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });

function useSign(text: string, fg: string, font: string) {
  const t = useMemo(() => signTexture(text, fg, font), [text, fg, font]);
  useEffect(() => () => t.dispose(), [t]);
  return t;
}

// A sash window in its white frame, with the glazing bar across the middle.
function Sash({ x, y, z, w = 0.62, h = 0.95 }: { x: number; y: number; z: number; w?: number; h?: number }) {
  return (
    <group position={[x, y, z]}>
      <Part geometry={geo.box(w + 0.16, h + 0.16, 0.08)} color={SASH} outline={0.03} />
      <Part geometry={geo.box(w, h, 0.1)} color={WINDOW} outline={0} position-z={0.02} />
      <Part geometry={geo.box(w, 0.06, 0.12)} color={SASH} outline={0} position-z={0.03} />
    </group>
  );
}

// A hanging sign on an iron bracket, standing out from the wall so it reads from along the street.
function HangingSign({ sign, color, x, y, z }: { sign: THREE.Texture; color: number; x: number; y: number; z: number }) {
  return (
    <group position={[x, y, z]}>
      <Part geometry={geo.box(0.08, 0.08, 1.5)} color={IRON} outline={0.02} position={[0, 0, 0.75]} />
      <Part geometry={geo.box(0.06, 0.4, 0.06)} color={IRON} outline={0.01} position={[0, -0.2, 0.18]} rotation-x={0.8} />
      {[0.5, 1.3].map((z) => (
        <Part key={z} geometry={geo.box(0.03, 0.2, 0.03)} color={IRON} outline={0} position={[0, -0.1, z]} />
      ))}
      <group position={[0, -0.62, 0.9]}>
        <Part geometry={geo.box(0.08, 0.84, 1.32)} color={color} outline={0.03} />
        {[-1, 1].map((s) => (
          <mesh key={s} position-x={s * 0.05} rotation-y={(s * Math.PI) / 2}>
            <planeGeometry args={[1.16, 0.5]} />
            <meshBasicMaterial map={sign} toneMapped={false} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

// A lantern on a bracket off the wall, glowing after dark.
function Lantern({ x, y, z, night }: { x: number; y: number; z: number; night: boolean }) {
  return (
    <group position={[x, y, z]}>
      <Part geometry={geo.box(0.06, 0.06, 0.45)} color={IRON} outline={0.02} position={[0, 0.3, 0.22]} />
      <Part geometry={geo.box(0.28, 0.38, 0.28)} color={LAMP} outline={0.03} position={[0, 0, 0.45]} />
      <Part geometry={geo.cone(0.24, 0.2, 4)} color={IRON} outline={0.02} position={[0, 0.29, 0.45]} rotation-y={Math.PI / 4} />
      {night && <mesh geometry={geo.sphere(0.6)} material={haloMat} position={[0, 0, 0.45]} raycast={() => null} />}
    </group>
  );
}

// One of Bailgate's shops, its front onto the street. It is drawn level, on a plinth that takes up the slope.
function BailgateShop({ o, font }: { o: (typeof SHOPS)[number]; font: string }) {
  const look = LOOKS[o.side][o.i];
  const fascia = useSign(look.name, "#1a1320", font);
  const w = o.len - 0.15,
    d = o.deep,
    f = d / 2;
  const h = look.tudor ? 5.4 : 6.2 + (o.i % 2) * 0.4;
  const jetty = look.tudor ? JETTY : 0;
  // the ground under the shop falls away to the south, so the floor sits on the higher, north end
  const low = Math.min(groundY(o.z - o.len / 2), groundY(o.z + o.len / 2));
  const floor = Math.max(groundY(o.z - o.len / 2), groundY(o.z + o.len / 2));
  return (
    <group position={[o.x, floor, o.z]} rotation-y={(-o.side * Math.PI) / 2}>
      <Part geometry={geo.box(w, floor - low + 0.4, d)} color={0xb3a68a} outline={0.05} position-y={(low - floor - 0.4) / 2} />
      {look.tudor ? (
        <>
          <Part geometry={geo.box(w, GROUND, d)} color={0xd9cfb6} outline={0.07} position-y={GROUND / 2} />
          {/* the jettied upper floor: plaster between dark timber studs and rails */}
          <Part geometry={geo.box(w + 0.1, h - GROUND, d + jetty)} color={look.wall} outline={0.07} position={[0, (h + GROUND) / 2, jetty / 2]} />
          {[GROUND + 0.06, h - 0.06, (GROUND + h) / 2 + 0.55].map((y) => (
            <Part key={y} geometry={geo.box(w + 0.12, 0.12, 0.06)} color={TIMBER} outline={0} position={[0, y, f + jetty + 0.03]} />
          ))}
          {Array.from({ length: Math.floor(w / 0.55) + 1 }, (_, k) => -w / 2 + 0.05 + (k * (w - 0.1)) / Math.floor(w / 0.55))
            .filter((x) => Math.abs(Math.abs(x) - w / 4) > 0.5)
            .map((x) => (
              <Part key={x} geometry={geo.box(0.12, h - GROUND, 0.06)} color={TIMBER} outline={0} position={[x, (h + GROUND) / 2, f + jetty + 0.03]} />
            ))}
          {[-1, 1].map((s) => (
            <group key={s}>
              <Part geometry={geo.box(0.95, 0.8, 0.08)} color={TIMBER} outline={0} position={[(s * w) / 4, (GROUND + h) / 2 - 0.05, f + jetty + 0.03]} />
              <Part geometry={geo.box(0.8, 0.66, 0.1)} color={WINDOW} outline={0} position={[(s * w) / 4, (GROUND + h) / 2 - 0.05, f + jetty + 0.05]} />
              <Part geometry={geo.box(0.05, 0.66, 0.12)} color={TIMBER} outline={0} position={[(s * w) / 4, (GROUND + h) / 2 - 0.05, f + jetty + 0.06]} />
            </group>
          ))}
          {/* the gable onto the street, with a little window in it */}
          <group position={[0, h + ((w + 0.1) / 1.6) * 0.275, jetty / 2]}>
            <Part geometry={geo.cyl((w + 0.1) / 1.6, (w + 0.1) / 1.6, d + jetty + 0.3, 3)} color={0x5a3a2e} outline={0.07} rotation-x={-Math.PI / 2} scale={[1, 1, 0.55]} />
          </group>
          <Part geometry={geo.box(w * 0.86, 0.06, 0.06)} color={TIMBER} outline={0} position={[0, h + 0.06, f + jetty + 0.18]} />
          <Part geometry={geo.box(0.5, 0.45, 0.08)} color={WINDOW} outline={0.03} position={[0, h + 0.65, f + jetty + 0.18]} />
        </>
      ) : (
        <>
          <Part geometry={geo.box(w, h, d)} color={look.wall} outline={0.07} position-y={h / 2} />
          {/* cornice, parapet and the slate roof behind it */}
          <Part geometry={geo.box(w + 0.1, 0.18, d + 0.2)} color={SASH} outline={0.03} position-y={h - 0.5} />
          <Part geometry={geo.box(w + 0.05, 0.45, 0.25)} color={look.wall} outline={0.04} position={[0, h + 0.2, f - 0.1]} />
          <group position-y={h + (d / 1.8) * 0.275 - 0.1} rotation-y={Math.PI / 2}>
            <Part geometry={geo.cyl(d / 1.8, d / 1.8, w - 0.1, 3)} color={0x5b6b7a} outline={0.06} rotation-x={-Math.PI / 2} scale={[1, 1, 0.55]} />
          </group>
          <Part geometry={geo.box(0.4, 1, 0.5)} color={0x9a5a44} outline={0.04} position={[w / 2 - 0.35, h + 0.9, 0]} />
          {[3.7, 5.05].map((y) =>
            [-1, 0, 1].map((k) => <Sash key={`${y}${k}`} x={(k * w) / 3.3} y={y} z={f + 0.04} />),
          )}
        </>
      )}
      {/* the shopfront: a painted frame round the window and door, under a fascia with the name on it */}
      <Part geometry={geo.box(w - 0.3, GROUND - 0.25, 0.12)} color={look.front} outline={0.04} position={[0, (GROUND - 0.25) / 2, f + 0.06]} />
      <Part geometry={geo.box(w * 0.5, 1.4, 0.12)} color={WINDOW} outline={0.03} position={[-w * 0.13, 1.15, f + 0.12]} />
      <Part geometry={geo.box(0.05, 1.4, 0.16)} color={look.front} outline={0} position={[-w * 0.13, 1.15, f + 0.13]} />
      <Part geometry={geo.box(0.85, 1.9, 0.14)} color={0x3a2a20} outline={0.04} position={[w / 2 - 0.75, 0.95, f + 0.1]} />
      <Part geometry={geo.box(0.85, 0.3, 0.14)} color={WINDOW} outline={0.02} position={[w / 2 - 0.75, 2.08, f + 0.1]} />
      <Part geometry={geo.box(Math.min(w - 0.5, 3), 0.56, 0.1)} color={0xfff8e7} outline={0.03} position={[-0.25, 2.5, f + 0.16]} />
      <mesh position={[-0.25, 2.5, f + 0.22]}>
        <planeGeometry args={[Math.min(w - 0.6, 2.9), 0.5]} />
        <meshBasicMaterial map={fascia} toneMapped={false} />
      </mesh>
      {/* tea rooms put a table out on the cobbles */}
      {look.kind === "tea" && (
        <group position={[-w * 0.13, 0, f + 1.1]}>
          <Part geometry={geo.cyl(0.36, 0.36, 0.06, 10)} color={0xffffff} outline={0.03} position-y={0.72} />
          <Part geometry={geo.cyl(0.05, 0.05, 0.72, 6)} color={IRON} outline={0.02} position-y={0.36} />
          <Part geometry={geo.sphere(0.09, 8, 6)} color={look.front} outline={0.02} position={[0.1, 0.82, 0]} />
          {[-0.62, 0.62].map((x) => (
            <Part key={x} geometry={geo.box(0.34, 0.42, 0.34)} color={0x8a5a33} outline={0.02} position={[x, 0.21, 0]} />
          ))}
        </group>
      )}
    </group>
  );
}

// Bailgate's cobbles: rows of stone setts over a darker bed, laid on the gentle climb to Newport Arch.
const SETT = { w: 0.5, d: 0.34, gap: 0.07 };
const SETT_COLORS = [0xc9bba0, 0xbcae92, 0xd4c7ad];
function Setts() {
  const rows = useMemo(() => {
    const out: [number, number][][] = SETT_COLORS.map(() => []);
    const r = (n: number) => Math.abs(Math.sin(n * 12.9898) * 43758.5453) % 1;
    let k = 0;
    for (let z = BAILGATE.z0 + 0.3, row = 0; z < BAILGATE.z1 - 0.2; z += SETT.d + SETT.gap, row++) {
      for (let x = BAILGATE.x0 + 0.3 + (row % 2) * (SETT.w / 2); x < BAILGATE.x1 - 0.3; x += SETT.w + SETT.gap) out[Math.floor(r(++k) * SETT_COLORS.length)].push([x, z]);
    }
    return out;
  }, []);
  return (
    <>
      {rows.map((list, c) => (
        <SettMesh key={c} list={list} color={SETT_COLORS[c]} />
      ))}
    </>
  );
}

function SettMesh({ list, color }: { list: [number, number][]; color: number }) {
  const ref = useRef<THREE.InstancedMesh>(null!);
  useLayoutEffect(() => {
    const m = new THREE.Object3D();
    list.forEach(([x, z], i) => {
      m.position.set(x, groundY(z) + 0.05, z);
      m.rotation.set(groundTilt(z), 0, 0);
      m.updateMatrix();
      ref.current.setMatrixAt(i, m.matrix);
    });
    ref.current.instanceMatrix.needsUpdate = true;
    ref.current.computeBoundingSphere();
  }, [list]);
  return <instancedMesh ref={ref} args={[geo.box(SETT.w, 0.05, SETT.d), toon(color), list.length]} receiveShadow raycast={() => null} />;
}

// Bailgate: the old street running north from Castle Square between the castle and the cathedral, climbing
// gently to Newport Arch. Cobbled, lined with Georgian and Tudor fronts, pubs, tea rooms and little shops.
export default function Bailgate({ font }: { font: string }) {
  return (
    <group>
      <Setts />
      {SHOPS.map((o) => (
        <BailgateShop key={`${o.x},${o.z}`} o={o} font={font} />
      ))}
      <NamePlate text="Bailgate" font={font} position={[-5.9, groundY(CLOSE.z0 + 1.6), CLOSE.z0 + 1.6]} />
    </group>
  );
}

// The Magna Carta: a red-brick Georgian pub on the corner at the top of Steep Hill, as in real Lincoln: three
// storeys under a slate roof, bay windows on the first floor, and a black-and-white painted pub frontage with white
// pilasters on the ground floor. Its front door opens onto Castle Square; its back looks down the hill, so the
// camera coming up Steep Hill sees a painted frontage and the name there too.
export function Pub({ p, font }: { p: Place; font: string }) {
  const night = usePlay((s) => s.night);
  const fascia = useSign(p.name.replace(/^The /, "").toUpperCase(), "#1a1320", font);
  const hanging = useSign("The Magna\nCarta", "#1a1320", font);
  const front = 0x1a1320;
  // the ground climbs to the north (the front), so the floor sits at the square's level on a plinth
  const y = (dz: number) => groundY(p.z + dz * Math.cos(p.rot)) - groundY(p.z);
  const floor = Math.max(y(p.d / 2), y(-p.d / 2)),
    low = Math.min(y(p.d / 2), y(-p.d / 2)) - 0.3;
  const w = p.w,
    d = p.d,
    h = p.h,
    f = d / 2;
  return (
    <group position={[p.x, 0, p.z]} rotation-y={p.rot} {...placeEvents(p)}>
      <Part geometry={geo.box(w + 0.2, floor - low, d + 0.2)} color={0xb3a68a} outline={0.05} position-y={(floor + low) / 2} />
      <group position-y={floor}>
        <Part geometry={geo.box(w, h, d)} color={p.wall} outline={0.08} position-y={h / 2} />
        <Part geometry={geo.box(w + 0.15, 0.2, d + 0.15)} color={0x1a1320} outline={0.03} position-y={GROUND + 0.1} />
        <Part geometry={geo.box(w + 0.2, 0.18, d + 0.2)} color={SASH} outline={0.03} position-y={h - 0.09} />
        <group position-y={h + (d / 1.6) * 0.275} rotation-y={Math.PI / 2}>
          <Part geometry={geo.cyl(d / 1.6, d / 1.6, w + 0.3, 3)} color={p.roof} outline={0.07} rotation-x={-Math.PI / 2} scale={[1, 1, 0.55]} />
        </group>
        {[-1, 1].map((s) => (
          <Part key={s} geometry={geo.box(0.8, 1.8, 1)} color={0x9a4a34} outline={0.04} position={[s * (w / 2 - 0.3), h + 1.7, 0]} />
        ))}
        {/* the first floor's bay windows and the sash windows above, on both faces */}
        {[0, Math.PI].map((r) => (
          <group key={r} rotation-y={r}>
            {[-1, 1].map((s) => (
              <group key={s} position={[s * 2.2, GROUND + 1.3, f + 0.25]}>
                <Part geometry={geo.box(1.7, 1.5, 0.5)} color={front} outline={0.04} />
                <Part geometry={geo.box(1.4, 1.2, 0.52)} color={WINDOW} outline={0} />
                {[-0.35, 0.35].map((x) => (
                  <Part key={x} geometry={geo.box(0.06, 1.2, 0.56)} color={front} outline={0} position-x={x} />
                ))}
              </group>
            ))}
            {[-2.2, 0, 2.2].map((x) => (
              <Sash key={x} x={x} y={h - 1.1} z={f + 0.04} w={0.75} h={1} />
            ))}
            <Sash x={0} y={GROUND + 1.3} z={f + 0.04} w={0.75} h={1.1} />
          </group>
        ))}
        {/* the same painted frontage on both faces: the door onto the square and the windows down the hill */}
        {[0, Math.PI].map((r) => (
          <group key={r} rotation-y={r}>
            <Part geometry={geo.box(w - 0.4, GROUND - 0.2, 0.12)} color={front} outline={0.04} position={[0, (GROUND - 0.2) / 2, f + 0.06]} />
            {[-3.6, -0.75, 0.75, 3.6].map((x) => (
              <Part key={x} geometry={geo.box(0.22, GROUND - 0.2, 0.18)} color={SASH} outline={0.02} position={[x, (GROUND - 0.2) / 2, f + 0.1]} />
            ))}
            {[-1, 1].map((s) => (
              <Part key={s} geometry={geo.box(2.1, 1.4, 0.12)} color={WINDOW} outline={0.03} position={[s * 2.3, 1.2, f + 0.12]} />
            ))}
            {r === 0 ? (
              <>
                <Part geometry={geo.box(1.1, 2, 0.14)} color={0x3a2a20} outline={0.04} position={[0, 1, f + 0.12]} />
                <Part geometry={geo.box(1.1, 0.3, 0.14)} color={WINDOW} outline={0.02} position={[0, 2.2, f + 0.12]} />
                {[-1, 1].map((s) => (
                  <Lantern key={s} x={s * 1} y={1.75} z={f + 0.1} night={night} />
                ))}
              </>
            ) : (
              <Part geometry={geo.box(1.1, 1.4, 0.12)} color={WINDOW} outline={0.03} position={[0, 1.2, f + 0.12]} />
            )}
            <Part geometry={geo.box(w - 0.8, 0.6, 0.1)} color={0x1a1320} outline={0.03} position={[0, 2.52, f + 0.16]} />
            <mesh position={[0, 2.52, f + 0.22]}>
              <planeGeometry args={[4.2, 0.56]} />
              <meshBasicMaterial map={fascia} toneMapped={false} />
            </mesh>
          </group>
        ))}
        {/* ground-floor windows along the west side (local +x, as the pub is turned to face north), onto the top of Steep Hill,
            and the pub sign on its bracket at the corner, readable from the hill and the square */}
        <group position={[w / 2 + 0.02, 0, 0]} rotation-y={Math.PI / 2}>
          {[-1.4, 1.4].map((x) => (
            <group key={x}>
              <Sash x={x} y={GROUND + 1.3} z={0} />
              <Sash x={x} y={p.h - 1.1} z={0} />
              <Part geometry={geo.box(1.1, 1.2, 0.12)} color={WINDOW} outline={0.03} position={[x, 1.3, 0.04]} />
            </group>
          ))}
          <HangingSign sign={hanging} color={0x1a1320} x={-2.4} y={3.75} z={0} />
        </group>
        {/* benches out on the square either side of the door */}
        {[-1, 1].map((s) => (
          <group key={s} position={[s * 2.7, 0, f + 1.3]}>
            <Part geometry={geo.box(1.8, 0.1, 0.7)} color={0x8a5a33} outline={0.03} position-y={0.72} />
            {[-1, 1].map((sz) => (
              <Part key={sz} geometry={geo.box(1.8, 0.08, 0.3)} color={0x8a5a33} outline={0.02} position={[0, 0.42, sz * 0.62]} />
            ))}
            {[-0.75, 0.75].map((x) => (
              <Part key={x} geometry={geo.box(0.1, 0.72, 1.4)} color={0x6b4426} outline={0.02} position={[x, 0.36, 0]} />
            ))}
          </group>
        ))}
      </group>
    </group>
  );
}
