import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import type { Place } from "./places";
import { Part, geo, toon, signTexture, WINDOW, LAMP } from "./toon";
import { placeClick } from "./store";
import { BRAYFORD, STREET_ROW, seeded, streetHouses } from "./colliders";

const CASTLE_STONE = 0xb8a98a;
const CASTLE_DARK = 0x9c8d6e;

function Crenels({ len, y, ...g }: { len: number; y: number; position?: [number, number, number]; "rotation-y"?: number }) {
  const n = Math.floor(len / 1.4);
  return (
    <group {...g}>
      {Array.from({ length: n }, (_, i) => (
        <Part key={i} geometry={geo.box(0.7, 0.7, 0.9)} color={CASTLE_STONE} outline={0.04} position={[-len / 2 + 0.7 + i * 1.4, y, 0]} />
      ))}
    </group>
  );
}

// Lincoln Castle, simplified: a walled bailey with round corner towers, a gatehouse and a keep on a mound.
export function Castle({ p, font }: { p: Place; font: string }) {
  const sign = useMemo(() => signTexture(p.name, "#5b6b7a", font), [p, font]);
  const hw = p.w / 2,
    hd = p.d / 2,
    wh = 5;
  return (
    <group position={[p.x, 0, p.z]} rotation-y={p.rot} onClick={placeClick(p)}>
      <mesh geometry={geo.box(p.w - 1, 0.06, p.d - 1)} material={toon(0x5fbf5b)} position-y={0.04} receiveShadow />
      {/* curtain walls */}
      {[
        { pos: [0, wh / 2, -hd] as const, len: p.w, ry: 0 },
        { pos: [-hw, wh / 2, 0] as const, len: p.d, ry: Math.PI / 2 },
        { pos: [hw, wh / 2, 0] as const, len: p.d, ry: Math.PI / 2 },
      ].map((w, i) => (
        <group key={i} position={[w.pos[0], 0, w.pos[2]]} rotation-y={w.ry}>
          <Part geometry={geo.box(w.len, wh, 1.2)} color={CASTLE_STONE} outline={0.08} position-y={wh / 2} />
          <Crenels len={w.len} y={wh + 0.35} />
        </group>
      ))}
      {/* front wall either side of the gatehouse */}
      {[-1, 1].map((sx) => (
        <group key={sx} position={[sx * (hw / 2 + 1.6), 0, hd]}>
          <Part geometry={geo.box(hw - 3.2, wh, 1.2)} color={CASTLE_STONE} outline={0.08} position-y={wh / 2} />
          <Crenels len={hw - 3.2} y={wh + 0.35} />
        </group>
      ))}
      {/* round towers at the corners */}
      {[-1, 1].flatMap((sx) =>
        [-1, 1].map((sz) => (
          <group key={`${sx}${sz}`} position={[sx * hw, 0, sz * hd]}>
            <Part geometry={geo.cyl(1.6, 1.8, 7, 14)} color={CASTLE_DARK} outline={0.08} position-y={3.5} />
            <Part geometry={geo.cyl(1.9, 1.9, 0.6, 14)} color={CASTLE_STONE} outline={0.06} position-y={7.3} />
          </group>
        )),
      )}
      {/* gatehouse */}
      <Part geometry={geo.box(6.4, 8, 3)} color={CASTLE_DARK} outline={0.08} position={[0, 4, hd]} />
      <Part geometry={geo.box(2.4, 3.4, 0.3)} color={0x3a2a1a} outline={0.05} position={[0, 1.7, hd + 1.55]} />
      <Part geometry={geo.cyl(1.2, 1.2, 0.3, 16)} color={0x3a2a1a} outline={0.05} position={[0, 3.4, hd + 1.55]} rotation-x={Math.PI / 2} />
      <Crenels len={6.4} y={8.35} position={[0, 0, hd + 1]} />
      <mesh position={[0, 6.2, hd + 1.53]}>
        <planeGeometry args={[5.6, 1.4]} />
        <meshBasicMaterial map={sign} toneMapped={false} />
      </mesh>
      {/* the keep on its mound, like the Lucy Tower */}
      <Part geometry={geo.cyl(4.5, 6, 2, 20)} color={0x5fbf5b} outline={0.06} position={[-hw + 6, 1, -hd + 5]} />
      <Part geometry={geo.cyl(3, 3.2, 5, 16)} color={CASTLE_DARK} outline={0.08} position={[-hw + 6, 4.5, -hd + 5]} />
      <Part geometry={geo.box(0.8, 1.1, 0.2)} color={WINDOW} outline={0.04} position={[-hw + 6, 5, -hd + 8.1]} />
    </group>
  );
}

const HOUSE_COLORS = [0xe8a33d, 0xf2e2c4, 0x9fc0d8, 0xd77a61, 0xf2d06b, 0xc8b6e2];

// Steep Hill: a narrow cobbled lane climbing north, lined with old houses that step up the hill.
export function SteepHill({ p, font }: { p: Place; font: string }) {
  const sign = useMemo(() => signTexture(p.name, "#8a3b2e", font), [p, font]);
  const rows = streetHouses(p).map((h) => ({
    ...h,
    step: h.i * 0.6, // each house sits a little higher up the hill
    h: 4.2 + ((h.i * 7 + h.side * 3 + 10) % 4) * 0.5,
    color: HOUSE_COLORS[(h.i + (h.side > 0 ? 3 : 0)) % HOUSE_COLORS.length],
  }));
  const cobbles = useMemo(() => {
    const r = seeded(5);
    return Array.from({ length: 70 }, () => [(r() - 0.5) * (p.w - 2 * STREET_ROW - 0.6), (r() - 0.5) * (p.d - 1)] as const);
  }, [p]);
  return (
    <group position={[p.x, 0, p.z]} rotation-y={p.rot} onClick={placeClick(p)}>
      <mesh geometry={geo.box(p.w - 2 * STREET_ROW, 0.06, p.d)} material={toon(0xb9ad9a)} position-y={0.03} receiveShadow />
      {cobbles.map(([x, z], i) => (
        <mesh key={i} geometry={geo.box(0.5, 0.07, 0.4)} material={toon(0xa0947f)} position={[x, 0.04, z]} />
      ))}
      {rows.map((r) => {
        const { x, len } = r;
        const front = -r.side * (STREET_ROW / 2); // faces the lane
        return (
          <group key={`${r.side}${r.i}`} position={[x, 0, r.z]}>
            <Part geometry={geo.box(STREET_ROW, r.step + 0.01, len - 0.2)} color={0x9c8d6e} outline={0.05} position-y={r.step / 2} />
            <Part geometry={geo.box(STREET_ROW - 0.2, r.h, len - 0.4)} color={r.color} outline={0.07} position-y={r.step + r.h / 2} />
            <group position={[0, r.step + r.h, 0]} rotation-y={Math.PI / 2}>
              <Part geometry={geo.cyl(2.3, 2.3, len - 0.2, 3)} color={p.roof} outline={0.06} rotation-x={-Math.PI / 2} scale={[1, 1, 0.5]} position-y={0.55} />
            </group>
            <Part geometry={geo.box(0.2, 1.8, 0.9)} color={0x5a3a22} outline={0.04} position={[front, r.step + 0.9, 0]} />
            <Part geometry={geo.box(0.2, 0.9, 0.9)} color={WINDOW} outline={0.04} position={[front, r.step + r.h - 1.2, len / 4]} />
            <Part geometry={geo.box(0.2, 0.9, 0.9)} color={WINDOW} outline={0.04} position={[front, r.step + r.h - 1.2, -len / 4]} />
          </group>
        );
      })}
      {/* name board hung across the bottom of the hill */}
      <group position={[0, 0, p.d / 2 - 0.4]}>
        <Part geometry={geo.box(p.w - 2 * STREET_ROW + 0.4, 0.25, 0.25)} color={0x2b2633} outline={0.04} position-y={5.6} />
        <Part geometry={geo.box(4.6, 1.2, 0.15)} color={0xfff8e7} outline={0.05} position-y={4.8} />
        <mesh position={[0, 4.8, 0.09]}>
          <planeGeometry args={[4.4, 1.1]} />
          <meshBasicMaterial map={sign} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

function Boat({ color, cabin = 0xfff8e7, len = 3.6, ...g }: { color: number; cabin?: number; len?: number; position: [number, number, number]; "rotation-y"?: number }) {
  return (
    <group {...g}>
      <Part geometry={geo.box(1.3, 0.55, len)} color={color} outline={0.05} position-y={0.28} />
      <Part geometry={geo.box(1, 0.6, len * 0.55)} color={cabin} outline={0.04} position={[0, 0.85, -len * 0.08]} />
      {Array.from({ length: Math.floor(len / 1.4) }, (_, i) => (
        <Part key={i} geometry={geo.box(1.02, 0.25, 0.3)} color={WINDOW} outline={0.02} position={[0, 0.95, -len * 0.3 + i * 0.75]} />
      ))}
    </group>
  );
}

function Sailboat({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <Part geometry={geo.box(1.1, 0.5, 2.6)} color={0xffffff} outline={0.04} position-y={0.25} />
      <Part geometry={geo.cyl(0.06, 0.06, 4, 6)} color={0x8a8a8a} outline={0.02} position-y={2.4} />
      <Part geometry={geo.cone(0.9, 3.2, 3)} color={0xfff8e7} outline={0.03} position={[0, 2.5, 0.35]} scale={[0.1, 1, 1]} />
    </group>
  );
}

const W = BRAYFORD.water;
const WX = (W.x0 + W.x1) / 2,
  WZ = (W.z0 + W.z1) / 2,
  WRX = (W.x1 - W.x0) / 2,
  WRZ = (W.z1 - W.z0) / 2;

// Swans paddling slow loops round the pool.
function Swan({ phase, reduce, r }: { phase: number; reduce: boolean; r: number }) {
  const g = useRef<THREE.Group>(null!);
  useFrame(({ clock }) => {
    const t = reduce ? phase : clock.elapsedTime * 0.1 + phase;
    g.current.position.set(WX + Math.cos(t) * (WRX - 2.5) * r, 0.15, WZ + Math.sin(t) * (WRZ - 1.6) * r);
    g.current.rotation.y = -t;
  });
  return (
    <group ref={g}>
      <Part geometry={geo.sphere(0.45)} color={0xffffff} outline={0.04} scale={[1, 0.7, 1.4]} position-y={0.2} />
      <Part geometry={geo.cyl(0.1, 0.12, 0.8, 8)} color={0xffffff} outline={0.03} position={[0, 0.65, 0.5]} rotation-x={-0.3} />
      <Part geometry={geo.sphere(0.16)} color={0xffffff} outline={0.03} position={[0, 1.05, 0.62]} />
      <Part geometry={geo.cone(0.07, 0.25, 6)} color={0xff7a1a} outline={0.02} position={[0, 1.03, 0.82]} rotation-x={Math.PI / 2} />
    </group>
  );
}

// A sightseeing boat doing laps of the pool.
function TourBoat({ reduce }: { reduce: boolean }) {
  const g = useRef<THREE.Group>(null!);
  useFrame(({ clock }) => {
    const t = reduce ? 1 : clock.elapsedTime * 0.06;
    g.current.position.set(WX + Math.cos(t) * (WRX - 5), 0.1, WZ + Math.sin(t) * (WRZ - 3.2));
    g.current.rotation.y = -t;
  });
  return (
    <group ref={g}>
      <group rotation-y={Math.PI / 2}>
        <Part geometry={geo.box(2, 0.6, 5)} color={0x2b59c3} outline={0.05} position-y={0.3} />
        <Part geometry={geo.box(1.7, 0.9, 3.2)} color={0xfff8e7} outline={0.04} position={[0, 1.05, -0.3]} />
        <Part geometry={geo.box(1.9, 0.12, 3.6)} color={0xe03a3e} outline={0.04} position={[0, 1.56, -0.3]} />
      </group>
    </group>
  );
}

const FRONT = [
  { w: 6.5, h: 6, color: 0x9fd8e8, glass: true }, // glassy university block
  { w: 6, h: 4.5, color: 0xf2e2c4, awning: 0xe03a3e },
  { w: 6.5, h: 5, color: 0xd77a61, awning: 0x1fb5a8 },
  { w: 6, h: 4.2, color: 0xf2d06b, awning: 0x2b59c3 },
  { w: 6, h: 7, color: 0x9fc0d8, glass: true },
].map((b, i, all) => ({ ...b, x: BRAYFORD.front.x0 + all.slice(0, i).reduce((a, o) => a + o.w + 0.1, 0) + b.w / 2 }));

// Brayford Pool: a marina basin with stone quays, moored boats, waterside bars,
// the university on the far side and the Fossdyke heading off west.
export function Brayford({ p, font, reduce }: { p: Place; font: string; reduce: boolean }) {
  const sign = useMemo(() => signTexture(p.name, "#2b59c3", font), [p, font]);
  const C = BRAYFORD.canal,
    F = BRAYFORD.front;
  return (
    <group position={[p.x, 0, p.z]} rotation-y={p.rot} onClick={placeClick(p)}>
      {/* promenade and quay edge */}
      <mesh geometry={geo.box(p.w, 0.06, p.d)} material={toon(0xe8dcc2)} position-y={0.03} receiveShadow />
      <Part geometry={geo.box(W.x1 - W.x0 + 0.8, 0.3, W.z1 - W.z0 + 0.8)} color={0x9c8d6e} outline={0.05} position={[WX, 0.08, WZ]} />
      <mesh geometry={geo.box(W.x1 - W.x0, 0.12, W.z1 - W.z0)} material={toon(0x3aa6e8)} position={[WX, 0.2, WZ]} />
      {/* the Fossdyke */}
      <Part geometry={geo.box(C.x1 - C.x0 + 0.6, 0.3, C.z1 - C.z0 + 0.8)} color={0x9c8d6e} outline={0.05} position={[(C.x0 + C.x1) / 2, 0.08, (C.z0 + C.z1) / 2]} />
      <mesh geometry={geo.box(C.x1 - C.x0 + 0.6, 0.12, C.z1 - C.z0)} material={toon(0x3aa6e8)} position={[(C.x0 + C.x1) / 2, 0.2, (C.z0 + C.z1) / 2]} />
      {/* waterfront buildings along the far quay */}
      {FRONT.map((b, i) => {
        const z = (F.z0 + F.z1) / 2;
        return (
          <group key={i} position={[b.x, 0, z]}>
            <Part geometry={geo.box(b.w, b.h, F.z1 - F.z0)} color={b.color} outline={0.07} position-y={b.h / 2} />
            {b.glass ? (
              Array.from({ length: Math.floor(b.h / 1.5) }, (_, r) => (
                <Part key={r} geometry={geo.box(b.w - 0.6, 0.7, 0.1)} color={WINDOW} outline={0.03} position={[0, 1.1 + r * 1.5, (F.z1 - F.z0) / 2 + 0.05]} />
              ))
            ) : (
              <>
                <Part geometry={geo.box(b.w - 1.2, 1.4, 0.1)} color={WINDOW} outline={0.03} position={[0, 1.1, (F.z1 - F.z0) / 2 + 0.05]} />
                <Part geometry={geo.box(b.w - 0.6, 0.15, 1.2)} color={b.awning!} outline={0.04} position={[0, 2.2, (F.z1 - F.z0) / 2 + 0.6]} rotation-x={0.25} />
                <Part geometry={geo.box(b.w - 1.6, 0.8, 0.1)} color={WINDOW} outline={0.03} position={[0, b.h - 1.1, (F.z1 - F.z0) / 2 + 0.05]} />
              </>
            )}
          </group>
        );
      })}
      {/* outdoor tables on the north quay */}
      {[-9, -3, 9].map((x) => (
        <group key={x} position={[x, 0, F.z1 + 0.6]}>
          <Part geometry={geo.cyl(0.45, 0.45, 0.08, 10)} color={0xffffff} outline={0.03} position-y={0.75} />
          <Part geometry={geo.cyl(0.05, 0.05, 0.75, 6)} color={0x2b2633} outline={0.02} position-y={0.38} />
          <Part geometry={geo.cone(0.9, 0.5, 8)} color={0xe03a3e} outline={0.03} position-y={2} />
          <Part geometry={geo.cyl(0.04, 0.04, 1.6, 6)} color={0x2b2633} outline={0.02} position-y={1.2} />
        </group>
      ))}
      {/* pontoon with moored boats */}
      <Part geometry={geo.box(1.4, 0.25, 7)} color={0x8a5a33} outline={0.05} position={[5, 0.3, W.z1 - 3.4]} />
      <Boat color={0x2f8f5b} position={[3.4, 0.15, W.z1 - 3.6]} />
      <Boat color={0xe03a3e} cabin={0xf2d06b} position={[6.6, 0.15, W.z1 - 3.4]} len={4.2} />
      <Sailboat position={[9.5, 0.15, W.z1 - 2.2]} />
      {/* narrowboats tied up along the north quay */}
      <Boat color={0x1f6b4a} position={[-6, 0.15, W.z0 + 0.9]} rotation-y={Math.PI / 2} len={5.5} />
      <Boat color={0x7a2b3e} cabin={0xf2e2c4} position={[0, 0.15, W.z0 + 0.9]} rotation-y={Math.PI / 2} len={5} />
      <Boat color={0x2b59c3} position={[-16, 0.15, (C.z0 + C.z1) / 2]} rotation-y={Math.PI / 2} len={5.5} />
      <TourBoat reduce={reduce} />
      {[0, 1.3, 2.6, 3.9, 5.2].map((ph, i) => (
        <Swan key={ph} phase={ph} reduce={reduce} r={i % 2 ? 0.55 : 0.85} />
      ))}
      {/* railings and lamps along the near quay */}
      {Array.from({ length: 9 }, (_, i) => -11 + i * 2.75).map((x) =>
        x > 3.5 && x < 6.5 ? null : <Part key={x} geometry={geo.cyl(0.07, 0.07, 1, 6)} color={0x2b2633} outline={0.02} position={[x, 0.7, W.z1 + 0.45]} />,
      )}
      <Part geometry={geo.box(7.6, 0.08, 0.08)} color={0x2b2633} outline={0.02} position={[-1.8 - 3.4, 1.15, W.z1 + 0.45]} />
      <Part geometry={geo.box(4.6, 0.08, 0.08)} color={0x2b2633} outline={0.02} position={[9.5, 1.15, W.z1 + 0.45]} />
      {[-12, 12].map((x) => (
        <group key={x} position={[x, 0, W.z1 + 1.2]}>
          <Part geometry={geo.cyl(0.1, 0.12, 3.2, 8)} color={0x2b2633} outline={0.04} position-y={1.6} />
          <Part geometry={geo.sphere(0.3)} color={LAMP} outline={0.05} position-y={3.3} />
        </group>
      ))}
      {/* benches */}
      {[-7, 1].map((x) => (
        <group key={x} position={[x, 0, W.z1 + 2.4]}>
          <Part geometry={geo.box(2, 0.15, 0.6)} color={0x8a5a33} outline={0.03} position-y={0.5} />
          <Part geometry={geo.box(2, 0.6, 0.12)} color={0x8a5a33} outline={0.03} position={[0, 0.85, 0.3]} />
        </group>
      ))}
      {/* name board on the promenade, facing the town */}
      <group position={[-3, 0, p.d / 2 - 1.4]}>
        {[-1.6, 1.6].map((x) => (
          <Part key={x} geometry={geo.box(0.2, 2.2, 0.2)} color={0x2b2633} outline={0.04} position={[x, 1.1, 0]} />
        ))}
        <Part geometry={geo.box(4.2, 1, 0.15)} color={0xfff8e7} outline={0.05} position={[0, 2.1, 0]} />
        <mesh position={[0, 2.1, 0.09]}>
          <planeGeometry args={[4, 0.9]} />
          <meshBasicMaterial map={sign} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}
