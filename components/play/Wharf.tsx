import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { PLACES } from "./places";
import { Part, geo, toon, signTexture, WINDOW, LAMP } from "./toon";
import { BRAYFORD, RIVER, WHARF, WHARF_EAST, WHARF_BARS } from "./colliders";
import { Strip } from "./terrain";
import { Boat } from "./Landmarks";
import { usePlay } from "./store";

const PAVING = 0xd9ccb2;
const SLAB = 0xc7b89a;
const IRON = 0x2b2633;

// The bars and restaurants along the wharf, quay first, then the two on Brayford Wharf East. Made-up names:
// these stand for the waterfront's bars, not any real one.
const BARS = [
  { name: "Quayside Kitchen", wall: 0xf2e2c4, awning: 0x2f8f5b, h: 4.2, flat: true },
  { name: "The Narrowboat", wall: 0x2b59c3, awning: 0xffb627, h: 3.8, flat: false },
  { name: "Swan & Lantern", wall: 0xd77a61, awning: 0xfff8e7, h: 4.4, flat: true },
  { name: "Fossdyke Pizza", wall: 0xfff1d6, awning: 0xe03a3e, h: 4, flat: false },
  { name: "Wharf Coffee", wall: 0x9fc0d8, awning: 0x1a1320, h: 3.8, flat: true },
];

// Lamps along the quay edge, clear of the footbridge, and the two on the Brayford's south quay.
const QUAY_LAMPS = [WHARF.x0 + 5.5, (WHARF.x0 + WHARF.x1) / 2 + 2.4, WHARF.x1 - 1].map((x) => [x, WHARF.z0 + 0.5] as const);
const brayford = PLACES.find((p) => p.kind === "water")!;
const POOL_LAMPS = [-12, 12].map((x) => [brayford.x + x, brayford.z + BRAYFORD.water.z1 + 1.2] as const);
// Mooring bollards along the quay edge, between the lamps.
const BOLLARDS = Array.from({ length: 12 }, (_, i) => WHARF.x0 + 3 + i * 1.4).filter((x) => QUAY_LAMPS.every(([lx]) => Math.abs(x - lx) > 0.8) && x < WHARF.x1 - 0.5);
// Narrowboats tied up on the river between the lamps, two along the quay and one on the far side by High Bridge,
// leaving the water under each lamp clear for its reflection. side is -1 for the north half of the river.
const BOATS = [
  { x: (QUAY_LAMPS[0][0] + QUAY_LAMPS[1][0]) / 2, len: 4.4, color: 0x7a2b3e, cabin: 0xf2e2c4, side: 1 },
  { x: (QUAY_LAMPS[1][0] + QUAY_LAMPS[2][0]) / 2, len: 4, color: 0x1f6b4a, cabin: 0xf2d06b, side: 1 },
  { x: WHARF.x1 + 1.5, len: 3.4, color: 0x2b59c3, cabin: 0xfff8e7, side: -1 },
];

// One frontage of a bar: the glazed ground floor and door, its name board over a striped awning, and a
// string of festoon lights along it.
function Facade({ w, f, awning, sign }: { w: number; f: number; awning: number; sign: THREE.Texture }) {
  return (
    <>
      {/* the glazed ground floor and the door */}
      <Part geometry={geo.box(w - 1.6, 1.7, 0.15)} color={WINDOW} outline={0.04} position={[-0.5, 1.15, f + 0.05]} />
      <Part geometry={geo.box(0.9, 1.9, 0.2)} color={0x5a3a22} outline={0.05} position={[w / 2 - 0.75, 0.95, f + 0.05]} />
      {/* name board and striped awning */}
      <Part geometry={geo.box(w - 0.3, 0.75, 0.15)} color={0xfff8e7} outline={0.04} position={[0, 2.55, f + 0.08]} />
      <mesh position={[0, 2.55, f + 0.17]}>
        <planeGeometry args={[Math.min(w - 0.5, 3.4), 0.68]} />
        <meshBasicMaterial map={sign} toneMapped={false} />
      </mesh>
      {Array.from({ length: 6 }, (_, k) => (
        <Part
          key={k}
          geometry={geo.box((w - 0.4) / 6, 0.1, 1.1)}
          color={k % 2 ? 0xfff8e7 : awning}
          outline={0.03}
          position={[-(w - 0.4) / 2 + ((w - 0.4) / 12) * (2 * k + 1), 2.05, f + 0.55]}
          rotation-x={0.3}
        />
      ))}
      {/* festoon lights along the front */}
      {Array.from({ length: Math.floor(w / 0.6) }, (_, k) => (
        <Part key={`l${k}`} geometry={geo.sphere(0.08, 8, 6)} color={LAMP} outline={0} shadow={false} position={[-w / 2 + 0.3 + k * 0.6, 3.15 - (k % 2) * 0.12, f + 0.25]} />
      ))}
    </>
  );
}

// A bar on the wharf, its frontage on both sides, and either a slate roof or a flat one with a terrace on top
// under parasols. The festoon lights along the fronts glow after dark.
function Bar({ b, i, font }: { b: (typeof WHARF_BARS)[number]; i: number; font: string }) {
  const look = BARS[i % BARS.length];
  const sign = useMemo(() => signTexture(look.name, "#1a1320", font), [look, font]);
  useEffect(() => () => sign.dispose(), [sign]);
  const w = b.len - 0.15,
    d = b.deep,
    f = d / 2;
  return (
    <group position={[b.x, 0, b.z]} rotation-y={b.rot}>
      <Part geometry={geo.box(w, look.h, d)} color={look.wall} outline={0.07} position-y={look.h / 2} />
      {look.flat ? (
        <>
          <Part geometry={geo.box(w + 0.2, 0.3, d + 0.2)} color={0x5b6b7a} outline={0.04} position-y={look.h + 0.15} />
          {/* the roof terrace: a rail round the edge and a couple of parasols */}
          {[-1, 1].map((sz) => (
            <Part key={sz} geometry={geo.box(w, 0.08, 0.08)} color={IRON} outline={0.02} position={[0, look.h + 1, (sz * d) / 2]} />
          ))}
          {[-1, 1].map((sx) => (
            <Part key={`s${sx}`} geometry={geo.box(0.08, 0.08, d)} color={IRON} outline={0.02} position={[(sx * w) / 2, look.h + 1, 0]} />
          ))}
          {[-1, 1].map((sx) => (
            <group key={`p${sx}`} position={[(sx * w) / 4, look.h + 0.3, 0]}>
              <Part geometry={geo.cyl(0.04, 0.04, 1.5, 6)} color={IRON} outline={0.02} position-y={0.75} />
              <Part geometry={geo.cone(0.8, 0.4, 8)} color={look.awning === 0x1a1320 ? 0xffb627 : look.awning} outline={0.03} position-y={1.5} />
            </group>
          ))}
        </>
      ) : (
        <group position-y={look.h + (d / 1.6) * 0.275} rotation-y={Math.PI / 2}>
          <Part geometry={geo.cyl(d / 1.6, d / 1.6, w + 0.2, 3)} color={0x5b6b7a} outline={0.06} rotation-x={-Math.PI / 2} scale={[1, 1, 0.55]} />
        </group>
      )}
      {/* the same frontage on the back too, onto the main road side, so the row reads from both ways */}
      {[0, Math.PI].map((r) => (
        <group key={r} rotation-y={r}>
          <Facade w={w} f={f} awning={look.awning} sign={sign} />
        </group>
      ))}
      {/* a table out front under a parasol */}
      <group position={[-w / 4, 0, f + 1.5]}>
        <Part geometry={geo.cyl(0.42, 0.42, 0.08, 10)} color={0xffffff} outline={0.03} position-y={0.75} />
        <Part geometry={geo.cyl(0.05, 0.05, 0.75, 6)} color={IRON} outline={0.02} position-y={0.38} />
        <Part geometry={geo.cyl(0.04, 0.04, 1.6, 6)} color={IRON} outline={0.02} position-y={1.2} />
        <Part geometry={geo.cone(0.85, 0.45, 8)} color={look.awning === 0xfff8e7 ? 0xe03a3e : look.awning} outline={0.03} position-y={2} />
        {[-0.7, 0.7].map((x) => (
          <Part key={x} geometry={geo.box(0.36, 0.45, 0.36)} color={0x8a5a33} outline={0.02} position={[x, 0.23, 0]} />
        ))}
      </group>
    </group>
  );
}

// A shimmer of lamplight on the water below a lamp, after dark.
const glowMat = new THREE.MeshBasicMaterial({ color: 0xffc04d, transparent: true, opacity: 0.7, depthWrite: false, toneMapped: false });
const haloMat = new THREE.MeshBasicMaterial({ color: 0xffc96b, transparent: true, opacity: 0.16, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
function Reflection({ x, z, len, reduce }: { x: number; z: number; len: number; reduce: boolean }) {
  const g = useRef<THREE.Group>(null!);
  useFrame(({ clock }) => {
    if (reduce) return;
    const t = clock.elapsedTime * 2 + x;
    g.current.scale.x = 1 + Math.sin(t) * 0.25;
    g.current.position.x = x + Math.sin(t * 0.7) * 0.06;
  });
  return (
    <group ref={g} position={[x, 0.28, z]} raycast={() => null}>
      {[0.55, 0.3].map((w, i) => (
        <mesh key={w} material={glowMat} rotation-x={-Math.PI / 2} position-z={i * 0.25}>
          <planeGeometry args={[w, len - i * 0.8]} />
        </mesh>
      ))}
    </group>
  );
}

// Swans paddling up and down the river past the moored boats.
function RiverSwan({ phase, reduce }: { phase: number; reduce: boolean }) {
  const g = useRef<THREE.Group>(null!);
  const mid = (WHARF.x0 + 2 + WHARF.x1) / 2,
    reach = (WHARF.x1 - WHARF.x0 - 6) / 2;
  useFrame(({ clock }) => {
    const t = reduce ? phase : clock.elapsedTime * 0.08 + phase;
    g.current.position.set(mid + Math.sin(t) * reach, 0.15, RIVER.z - 0.6 + (phase % 1) * 0.3);
    g.current.rotation.y = Math.cos(t) >= 0 ? Math.PI / 2 : -Math.PI / 2;
  });
  return (
    <group ref={g} scale={0.8}>
      <Part geometry={geo.sphere(0.45)} color={0xffffff} outline={0.04} scale={[1, 0.7, 1.4]} position-y={0.2} />
      <Part geometry={geo.cyl(0.1, 0.12, 0.8, 8)} color={0xffffff} outline={0.03} position={[0, 0.65, 0.5]} rotation-x={-0.3} />
      <Part geometry={geo.sphere(0.16)} color={0xffffff} outline={0.03} position={[0, 1.05, 0.62]} />
      <Part geometry={geo.cone(0.07, 0.25, 6)} color={0xff7a1a} outline={0.02} position={[0, 1.03, 0.82]} rotation-x={Math.PI / 2} />
    </group>
  );
}

// A street name plate on two posts.
export function NamePlate({ text, font, position, rot = 0 }: { text: string; font: string; position: [number, number, number]; rot?: number }) {
  const sign = useMemo(() => signTexture(text, "#1a1320", font), [text, font]);
  useEffect(() => () => sign.dispose(), [sign]);
  return (
    <group position={position} rotation-y={rot}>
      {[-1.1, 1.1].map((x) => (
        <Part key={x} geometry={geo.box(0.12, 1.6, 0.12)} color={IRON} outline={0.03} position={[x, 0.8, 0]} />
      ))}
      <Part geometry={geo.box(2.6, 0.7, 0.1)} color={0xfff8e7} outline={0.04} position-y={1.5} />
      <mesh position={[0, 1.5, 0.06]}>
        <planeGeometry args={[2.5, 0.62]} />
        <meshBasicMaterial map={sign} toneMapped={false} />
      </mesh>
    </group>
  );
}

// Brayford Wharf: the paved quay along the south bank of the Witham between the Brayford and High Bridge, its bars
// and restaurants facing the water, narrowboats moored alongside and swans on the river, and Brayford Wharf East
// running down to the main road. After dark the lamps and festoons glow and their light shimmers on the water.
export default function Wharf({ font, reduce }: { font: string; reduce: boolean }) {
  const night = usePlay((s) => s.night);
  const slabs = useMemo(() => {
    let seed = 41;
    const r = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
    return [WHARF, WHARF_EAST].flatMap((f) =>
      Array.from({ length: Math.round(((f.x1 - f.x0) * (f.z1 - f.z0)) / 7) }, () => [f.x0 + 0.6 + r() * (f.x1 - f.x0 - 1.2), f.z0 + 0.6 + r() * (f.z1 - f.z0 - 1.2)] as const),
    );
  }, []);
  return (
    <group>
      {[WHARF, WHARF_EAST].map((f, i) => (
        <Strip key={i} w={f.x1 - f.x0} d={f.z1 - f.z0} color={PAVING} x={(f.x0 + f.x1) / 2} z={(f.z0 + f.z1) / 2} y={0.065 + i * 0.002} raycast={() => null} />
      ))}
      {slabs.map(([x, z], i) => (
        <mesh key={i} geometry={geo.box(1.1, 0.06, 0.8)} material={toon(SLAB)} position={[x, 0.07, z]} raycast={() => null} />
      ))}
      {/* the stone quay edge */}
      <Part geometry={geo.box(WHARF.x1 - WHARF.x0, 0.18, 0.35)} color={0x9c8d6e} outline={0.03} position={[(WHARF.x0 + WHARF.x1) / 2, 0.12, WHARF.z0 + 0.15]} />
      {BOLLARDS.map((x) => (
        <Part key={x} geometry={geo.cyl(0.14, 0.17, 0.5, 8)} color={IRON} outline={0.03} position={[x, 0.3, WHARF.z0 + 0.45]} />
      ))}
      {WHARF_BARS.map((b, i) => (
        <Bar key={i} b={b} i={i} font={font} />
      ))}
      {BOATS.map((b) => (
        <Boat key={b.x} color={b.color} cabin={b.cabin} len={b.len} position={[b.x, 0.15, RIVER.z + b.side * (RIVER.half - 0.75)]} rotation-y={Math.PI / 2} />
      ))}
      {[0.4, 2.3, 4.1].map((ph) => (
        <RiverSwan key={ph} phase={ph} reduce={reduce} />
      ))}
      {QUAY_LAMPS.map(([x, z]) => (
        <group key={x} position={[x, 0, z]}>
          <Part geometry={geo.cyl(0.1, 0.12, 3.2, 8)} color={IRON} outline={0.04} position-y={1.6} />
          <Part geometry={geo.box(0.7, 0.08, 0.08)} color={IRON} outline={0.02} position-y={3.05} />
          <Part geometry={geo.sphere(0.3)} color={LAMP} outline={0.05} position-y={3.3} />
          {night && <mesh geometry={geo.sphere(0.75)} material={haloMat} position-y={3.3} raycast={() => null} />}
        </group>
      ))}
      {night && (
        <>
          {QUAY_LAMPS.map(([x]) => (
            <Reflection key={x} x={x} z={RIVER.z} len={RIVER.half * 2 - 0.2} reduce={reduce} />
          ))}
          {POOL_LAMPS.map(([x]) => (
            <Reflection key={x} x={x + Math.sign(brayford.x - x) * 1.2} z={brayford.z + BRAYFORD.water.z1 - 2} len={3.6} reduce={reduce} />
          ))}
        </>
      )}
      <NamePlate text="Brayford Wharf East" font={font} position={[WHARF_EAST.x1 + 0.6, 0, WHARF_EAST.z1 - 3.2]} />
      <NamePlate text="Brayford Wharf" font={font} position={[WHARF.x0 - 0.9, 0, WHARF.z1 + 0.4]} />
    </group>
  );
}
