"use client";

import { Environment, Lightformer } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { TokenId } from "./tokens";

/* ------------------------------------------------------------------ */
/* Geometry                                                            */
/* ------------------------------------------------------------------ */

const HALF = 0.15; // half thickness

/** Coin body: lathe with a fully rounded rim, axis along Z (face points at the camera). */
function makeBody() {
  const pts: THREE.Vector2[] = [new THREE.Vector2(0, HALF)];
  const steps = 18;
  for (let i = 0; i <= steps; i++) {
    const a = Math.PI / 2 - (i / steps) * Math.PI;
    pts.push(new THREE.Vector2(1 - HALF + Math.cos(a) * HALF, Math.sin(a) * HALF));
  }
  pts.push(new THREE.Vector2(0, -HALF));
  // Lathe faces point outward when the profile runs bottom -> top.
  const g = new THREE.LatheGeometry(pts.reverse(), 128);
  g.rotateX(Math.PI / 2);
  return g;
}

const EXTRUDE: THREE.ExtrudeGeometryOptions = {
  depth: 0.045,
  bevelEnabled: true,
  bevelThickness: 0.018,
  bevelSize: 0.014,
  bevelSegments: 4,
  curveSegments: 32,
};

function poly(points: [number, number][]) {
  const s = new THREE.Shape();
  points.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y)));
  s.closePath();
  return s;
}

function hexRing(outer: number, inner: number) {
  const hex = (r: number) =>
    Array.from({ length: 6 }, (_, i) => {
      const a = Math.PI / 2 + (i * Math.PI) / 3;
      return [Math.cos(a) * r, Math.sin(a) * r] as [number, number];
    });
  const s = poly(hex(outer));
  const hole = new THREE.Path();
  hex(inner)
    .reverse()
    .forEach(([x, y], i) => (i ? hole.lineTo(x, y) : hole.moveTo(x, y)));
  hole.closePath();
  s.holes.push(hole);
  return s;
}

function arcBand(r1: number, r2: number, a0: number, a1: number) {
  const s = new THREE.Shape();
  s.absarc(0, 0, r1, a0, a1, false);
  s.absarc(0, 0, r2, a1, a0, true);
  s.closePath();
  return s;
}

function extrude(shapes: THREE.Shape[]) {
  return new THREE.ExtrudeGeometry(shapes, EXTRUDE);
}

function tube(points: [number, number][], radius: number, closed = false) {
  const curve = new THREE.CatmullRomCurve3(
    points.map(([x, y]) => new THREE.Vector3(x, y, 0)),
    closed,
    "centripetal",
  );
  return new THREE.TubeGeometry(curve, 160, radius, 16, closed);
}

/** Raised symbol for each token, in the coin's XY plane. */
function makeSymbol(id: TokenId): THREE.BufferGeometry[] {
  switch (id) {
    case "ETH":
      return [
        extrude([
          poly([[0, 0.56], [0.34, 0.04], [0, -0.12], [-0.34, 0.04]]),
          poly([[0, -0.2], [0.34, -0.04], [0, -0.56], [-0.34, -0.04]]),
        ]),
      ];
    case "ARB":
      return [
        extrude([
          hexRing(0.64, 0.52),
          poly([[-0.34, -0.36], [-0.06, 0.38], [0.08, 0.38], [-0.2, -0.36]]),
          poly([[-0.08, -0.36], [0.2, 0.38], [0.34, 0.38], [0.06, -0.36]]),
          poly([[0.18, -0.36], [0.3, -0.04], [0.38, -0.2], [0.32, -0.36]]),
        ]),
      ];
    case "USDT":
      return [
        extrude([
          poly([[-0.46, 0.4], [0.46, 0.4], [0.46, 0.24], [0.1, 0.24], [0.1, -0.5], [-0.1, -0.5], [-0.1, 0.24], [-0.46, 0.24]]),
        ]),
        (() => {
          const g = new THREE.TorusGeometry(0.42, 0.032, 12, 96);
          g.scale(1, 0.3, 1);
          g.translate(0, 0.06, 0.04);
          return g;
        })(),
      ];
    case "USDC":
      return [
        extrude([
          arcBand(0.62, 0.5, (115 * Math.PI) / 180, (245 * Math.PI) / 180),
          arcBand(0.62, 0.5, (-65 * Math.PI) / 180, (65 * Math.PI) / 180),
        ]),
        (() => {
          const g = tube(
            [[0.16, 0.22], [0.02, 0.29], [-0.15, 0.21], [-0.13, 0.05], [0.13, -0.05], [0.15, -0.21], [-0.02, -0.29], [-0.16, -0.22]],
            0.05,
          );
          g.translate(0, 0, 0.05);
          return g;
        })(),
      ];
    case "POL": {
      const pts: [number, number][] = [];
      for (let i = 0; i < 64; i++) {
        const t = (i / 64) * Math.PI * 2;
        const d = 1 + Math.sin(t) ** 2;
        pts.push([(0.62 * Math.cos(t)) / d, (0.62 * Math.sin(t) * Math.cos(t)) / d]);
      }
      const g = tube(pts, 0.075, true);
      g.rotateZ(Math.PI / 6);
      g.translate(0, 0, 0.05);
      return [g];
    }
  }
}

/** Fine knit-like grain used as a bump map for the clay surface. */
function makeGrain() {
  const size = 256;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  const img = ctx.createImageData(size, size);
  for (let i = 0; i < size * size; i++) {
    const x = i % size;
    const y = Math.floor(i / size);
    const v = 128 + Math.sin(x * 1.7) * 30 + Math.sin(y * 1.7) * 30 + (Math.random() - 0.5) * 60;
    img.data.set([v, v, v, 255], i * 4);
  }
  ctx.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(6, 6);
  return t;
}

/* ------------------------------------------------------------------ */
/* Coin                                                                */
/* ------------------------------------------------------------------ */

export type CoinSpec = {
  id: TokenId;
  color: string;
  symbol: string;
  metal?: boolean;
  pos: [number, number, number];
  rot: [number, number, number];
  scale: number;
};

export const DESKTOP_COINS: CoinSpec[] = [
  { id: "ETH", color: "#43b8f7", symbol: "#ee3fc8", pos: [0.25, 2.25, -0.8], rot: [-0.3, -0.62, 0.32], scale: 1.05 },
  { id: "ARB", color: "#ee4f8c", symbol: "#f4d27a", metal: true, pos: [0.62, 1.62, 0.3], rot: [-0.28, -0.5, 0.18], scale: 1.05 },
  { id: "USDT", color: "#f3848f", symbol: "#a9e6cf", pos: [0.98, 0.5, 0.9], rot: [-1.18, -0.08, 0.06], scale: 1.18 },
  { id: "USDC", color: "#f6e1a2", symbol: "#f14fd2", pos: [-0.28, -1.9, -1.0], rot: [-0.26, -0.62, 0.08], scale: 1.12 },
  { id: "POL", color: "#d5efb2", symbol: "#f6efc4", pos: [0.75, -1.38, 0.9], rot: [-0.3, -0.55, 0.12], scale: 1.08 },
];

export const MOBILE_COINS: CoinSpec[] = [
  { ...DESKTOP_COINS[0], pos: [-1.55, 0.95, -0.6], scale: 0.8 },
  { ...DESKTOP_COINS[1], pos: [-1.05, 0.55, 0.3], scale: 0.8 },
  { ...DESKTOP_COINS[2], pos: [0.1, -1.05, 0], scale: 0.85 },
  { ...DESKTOP_COINS[3], pos: [1.0, 0.75, -0.4], scale: 0.82 },
  { ...DESKTOP_COINS[4], pos: [1.75, 0.3, 0.35], scale: 0.8 },
];

const TAU = Math.PI * 2;

type Shared = {
  body: THREE.BufferGeometry;
  ring: THREE.BufferGeometry;
  grain: THREE.Texture;
  mouse: React.RefObject<{ x: number; y: number }>;
};

function Coin({
  spec,
  index,
  shared,
  pulse,
  animate,
}: {
  spec: CoinSpec;
  index: number;
  shared: Shared;
  pulse: number;
  animate: boolean;
}) {
  const outer = useRef<THREE.Group>(null);
  const tilt = useRef<THREE.Group>(null);
  const spin = useRef<THREE.Group>(null);
  const state = useRef({ angle: 0, vel: 0, bounce: 0, hover: 0, hovered: false });
  const symbols = useMemo(() => makeSymbol(spec.id), [spec.id]);

  const bodyMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: spec.color,
        roughness: 0.5,
        clearcoat: 0.45,
        clearcoatRoughness: 0.35,
        sheen: 0.25,
        sheenRoughness: 0.5,
        sheenColor: new THREE.Color("#ffffff"),
        bumpMap: shared.grain,
        bumpScale: 0.6,
      }),
    [spec.color, shared.grain],
  );
  const symMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: spec.symbol,
        metalness: spec.metal ? 0.6 : 0.1,
        roughness: spec.metal ? 0.22 : 0.4,
        clearcoat: 0.6,
        clearcoatRoughness: 0.2,
      }),
    [spec.symbol, spec.metal],
  );

  // A token picked in the swap card makes its coin flip.
  useEffect(() => {
    if (!pulse) return;
    state.current.vel += TAU * 2.2;
    state.current.bounce = 1;
  }, [pulse]);

  useFrame((s, delta) => {
    const dt = Math.min(delta, 1 / 30);
    const t = s.clock.elapsedTime;
    const st = state.current;

    // Entrance: drop in with a slight overshoot.
    const p = animate ? Math.min(1, Math.max(0, (t - 0.35 - index * 0.12) / 1.1)) : 1;
    const c1 = 1.70158;
    const ease = p === 0 ? 0 : 1 + (c1 + 1) * (p - 1) ** 3 + c1 * (p - 1) ** 2;

    st.hover += ((st.hovered ? 1 : 0) - st.hover) * Math.min(1, dt * 8);
    st.bounce = Math.max(0, st.bounce - dt * 1.6);

    if (outer.current) {
      const float = animate ? Math.sin(t * 0.75 + index * 1.3) * 0.1 : 0;
      outer.current.position.set(
        spec.pos[0],
        spec.pos[1] + float + (1 - ease) * 1.6 + Math.sin(st.bounce * Math.PI) * 0.35,
        spec.pos[2],
      );
      outer.current.scale.setScalar(spec.scale * Math.max(0.001, ease) * (1 + st.hover * 0.06));
    }

    if (tilt.current) {
      const m = shared.mouse.current;
      const wob = animate ? Math.sin(t * 0.5 + index) * 0.05 : 0;
      const tx = spec.rot[0] - m.y * 0.28 + wob;
      const ty = spec.rot[1] + m.x * 0.32;
      tilt.current.rotation.x += (tx - tilt.current.rotation.x) * Math.min(1, dt * 3);
      tilt.current.rotation.y += (ty - tilt.current.rotation.y) * Math.min(1, dt * 3);
      tilt.current.rotation.z = spec.rot[2] + wob * 0.6;
    }

    // Flick spin: decays, then eases to the nearest full turn.
    st.angle += st.vel * dt;
    st.vel *= Math.pow(0.3, dt);
    if (Math.abs(st.vel) < 1.2) {
      const target = Math.round(st.angle / TAU) * TAU;
      st.angle += (target - st.angle) * Math.min(1, dt * 4);
      st.vel *= 0.9;
    }
    if (spin.current) spin.current.rotation.y = st.angle;
  });

  return (
    <group ref={outer}>
      <group ref={tilt} rotation={spec.rot}>
        <group
          ref={spin}
          onPointerOver={(e) => {
            e.stopPropagation();
            state.current.hovered = true;
            document.body.style.cursor = "grab";
          }}
          onPointerOut={() => {
            state.current.hovered = false;
            document.body.style.cursor = "";
          }}
          onPointerDown={(e) => {
            e.stopPropagation();
            state.current.vel += TAU * (1.4 + Math.random() * 0.6);
          }}
        >
          <mesh geometry={shared.body} material={bodyMat} />
          <mesh geometry={shared.ring} material={bodyMat} position={[0, 0, HALF - 0.005]} />
          <mesh geometry={shared.ring} material={bodyMat} position={[0, 0, -HALF + 0.005]} />
          {symbols.map((g, i) => (
            <mesh key={i} geometry={g} material={symMat} position={[0, 0, HALF - 0.012]} />
          ))}
          {symbols.map((g, i) => (
            <mesh
              key={`b${i}`}
              geometry={g}
              material={symMat}
              position={[0, 0, -HALF + 0.012]}
              rotation={[0, Math.PI, 0]}
            />
          ))}
        </group>
      </group>
    </group>
  );
}

function Coins({
  specs,
  pulses,
  animate,
  mouse,
}: {
  specs: CoinSpec[];
  pulses: Record<TokenId, number>;
  animate: boolean;
  mouse: React.RefObject<{ x: number; y: number }>;
}) {
  const shared = useMemo<Shared>(
    () => ({
      body: makeBody(),
      ring: new THREE.TorusGeometry(0.84, 0.028, 12, 128),
      grain: makeGrain(),
      mouse,
    }),
    [mouse],
  );
  return (
    <>
      {specs.map((spec, i) => (
        <Coin key={spec.id} spec={spec} index={i} shared={shared} pulse={pulses[spec.id]} animate={animate} />
      ))}
    </>
  );
}

export default function CoinsCanvas({
  mobile,
  pulses,
  animate,
  onReady,
}: {
  mobile: boolean;
  pulses: Record<TokenId, number>;
  animate: boolean;
  onReady?: () => void;
}) {
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ alpha: true, antialias: true }}
      camera={{ position: [0, 0, 12], fov: 30 }}
      resize={{ offsetSize: true }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.NeutralToneMapping;
        gl.toneMappingExposure = 1.0;
        onReady?.();
      }}
      style={{ position: "absolute", inset: 0 }}
    >
      <ambientLight intensity={0.35} />
      <directionalLight position={[-4, 6, 8]} intensity={1.4} />
      <directionalLight position={[5, -3, 4]} intensity={0.45} color="#f3c8ff" />
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={2.2} position={[0, 5, 5]} scale={[10, 3, 1]} />
        <Lightformer form="rect" intensity={1.2} color="#b9d4ff" position={[-6, 0, 3]} rotation-y={Math.PI / 2} scale={[8, 6, 1]} />
        <Lightformer form="rect" intensity={1.1} color="#ffc6ec" position={[6, -1, 3]} rotation-y={-Math.PI / 2} scale={[8, 6, 1]} />
        <Lightformer form="circle" intensity={1.5} position={[2, 2, 8]} scale={3} />
      </Environment>
      <Coins specs={mobile ? MOBILE_COINS : DESKTOP_COINS} pulses={pulses} animate={animate} mouse={mouse} />
    </Canvas>
  );
}
