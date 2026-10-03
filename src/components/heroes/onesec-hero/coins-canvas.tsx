"use client";

import { Environment, Lightformer } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import { EMBOSS_SVG } from "./logos";
import { COIN_ANGLES, ringPoint } from "./track";
import type { TokenId } from "./tokens";

/* ------------------------------------------------------------------ */
/* Geometry                                                            */
/* ------------------------------------------------------------------ */

const THICK = 0.2;
const HALF = THICK / 2;

/** Minted coin: flat faces, straight reeded edge (axis along Z). */
function makeBody() {
  const g = new THREE.CylinderGeometry(1, 1, THICK, 160, 1, false);
  g.rotateX(Math.PI / 2);
  return g;
}

/** Raised rim on a face, with a small bevel. */
function makeRim() {
  const s = new THREE.Shape();
  s.absarc(0, 0, 0.985, 0, Math.PI * 2, false);
  const hole = new THREE.Path();
  hole.absarc(0, 0, 0.885, 0, Math.PI * 2, true);
  s.holes.push(hole);
  return new THREE.ExtrudeGeometry(s, {
    depth: 0.028,
    bevelEnabled: true,
    bevelThickness: 0.01,
    bevelSize: 0.008,
    bevelSegments: 3,
    curveSegments: 128,
  });
}

/** Fine vertical ridges for the coin's edge (bump map). */
function makeReeding() {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 8;
  const ctx = c.getContext("2d")!;
  for (let x = 0; x < 512; x++) {
    const v = 128 + Math.sin((x / 512) * Math.PI * 2 * 180) * 110;
    ctx.fillStyle = `rgb(${v},${v},${v})`;
    ctx.fillRect(x, 0, 1, 8);
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

type Emboss = { geometry: THREE.BufferGeometry; color: string }[];

/** Official logo glyphs, extruded from SVG and fitted to the coin face. */
function makeEmboss(id: TokenId): Emboss {
  const data = new SVGLoader().parse(EMBOSS_SVG[id]);
  const parts: Emboss = [];
  const box = new THREE.Box3();
  for (const path of data.paths) {
    const shapes = SVGLoader.createShapes(path);
    if (!shapes.length) continue;
    const g = new THREE.ExtrudeGeometry(shapes, {
      depth: 1.2,
      bevelEnabled: true,
      bevelThickness: 0.25,
      bevelSize: 0.12,
      bevelSegments: 2,
      curveSegments: 24,
    });
    g.computeBoundingBox();
    box.union(g.boundingBox!);
    parts.push({ geometry: g, color: ((path.userData?.style as { fill?: string } | undefined)?.fill) || "#ffffff" });
  }
  // Fit all parts together: centre, flip SVG's downward Y, scale to ~62% of the face.
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  box.getSize(size);
  box.getCenter(center);
  const target = id === "USDC" ? 1.42 : id === "ARB" ? 1.4 : 1.2;
  const k = target / Math.max(size.x, size.y);
  for (const part of parts) {
    const g = part.geometry;
    g.translate(-center.x, -center.y, 0);
    g.scale(k, k, 0.022);
    g.rotateX(Math.PI); // SVG y-down -> y-up (extrusion now points -Z)
    g.computeBoundingBox();
    g.translate(0, 0, -g.boundingBox!.min.z); // sit on the face, raised toward +Z
    g.computeVertexNormals();
  }
  return parts;
}

/* ------------------------------------------------------------------ */
/* Coins                                                               */
/* ------------------------------------------------------------------ */

export type CoinSpec = {
  id: TokenId;
  face: string;
  edge: string;
  /** Static world position (mobile). */
  pos: [number, number, number];
  rot: [number, number, number];
  scale: number;
  /** Desktop: fixed spot on the dashed ring (degrees). */
  angle?: number;
};

const BRAND: Record<TokenId, { face: string; edge: string }> = {
  ETH: { face: "#627eea", edge: "#4b63c9" },
  ARB: { face: "#213147", edge: "#16212f" },
  USDT: { face: "#26a17b", edge: "#1d8263" },
  USDC: { face: "#2775ca", edge: "#1e5ea6" },
  POL: { face: "#7b3fe4", edge: "#6230bf" },
};

const coin = (id: TokenId, rot: CoinSpec["rot"], angle: number): CoinSpec => ({
  id,
  ...BRAND[id],
  pos: [0, 0, 0],
  rot,
  scale: 0.56,
  angle,
});

/** Desktop: five separate coins pinned along the right side of the dashed ring. */
export const DESKTOP_COINS: CoinSpec[] = [
  coin("ETH", [-0.25, -0.55, 0.2], COIN_ANGLES[0]),
  coin("ARB", [-0.3, -0.5, 0.15], COIN_ANGLES[1]),
  coin("USDT", [-0.55, -0.35, 0.06], COIN_ANGLES[2]),
  coin("USDC", [-0.25, -0.6, 0.08], COIN_ANGLES[3]),
  coin("POL", [-0.3, -0.5, 0.12], COIN_ANGLES[4]),
];

export const MOBILE_COINS: CoinSpec[] = [
  { ...DESKTOP_COINS[0], pos: [-2.1, 0.75, 0], scale: 0.62, angle: undefined },
  { ...DESKTOP_COINS[1], pos: [-1.05, -0.35, 0], scale: 0.62, angle: undefined },
  { ...DESKTOP_COINS[2], pos: [0, 0.75, 0], scale: 0.62, angle: undefined },
  { ...DESKTOP_COINS[3], pos: [1.05, -0.35, 0], scale: 0.62, angle: undefined },
  { ...DESKTOP_COINS[4], pos: [2.1, 0.75, 0], scale: 0.62, angle: undefined },
];

/** Camera: z = 12, fov 30 -> visible world height at the z = 0 plane. */
const VIEW_H = 2 * 12 * Math.tan((15 * Math.PI) / 180);

const TAU = Math.PI * 2;

type Shared = {
  size: React.RefObject<{ width: number; height: number }>;
  body: THREE.BufferGeometry;
  rim: THREE.BufferGeometry;
  reeding: THREE.Texture;
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
  const emboss = useMemo(() => makeEmboss(spec.id), [spec.id]);

  const mats = useMemo(() => {
    const face = new THREE.MeshPhysicalMaterial({
      color: spec.face,
      metalness: 0.35,
      roughness: 0.32,
      clearcoat: 1,
      clearcoatRoughness: 0.18,
    });
    const edge = new THREE.MeshPhysicalMaterial({
      color: spec.edge,
      metalness: 0.45,
      roughness: 0.35,
      clearcoat: 0.8,
      bumpMap: shared.reeding,
      bumpScale: 1.2,
    });
    const rim = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(spec.face).lerp(new THREE.Color("#ffffff"), 0.12),
      metalness: 0.4,
      roughness: 0.25,
      clearcoat: 1,
    });
    const logos = new Map<string, THREE.Material>();
    for (const part of emboss) {
      if (!logos.has(part.color)) {
        logos.set(
          part.color,
          new THREE.MeshPhysicalMaterial({
            color: part.color,
            metalness: 0.2,
            roughness: 0.25,
            clearcoat: 1,
            clearcoatRoughness: 0.12,
          }),
        );
      }
    }
    return { body: [edge, face, face], rim, logos };
  }, [spec.face, spec.edge, shared.reeding, emboss]);

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

    const p = animate ? Math.min(1, Math.max(0, (t - 0.35 - index * 0.12) / 1.1)) : 1;
    const c1 = 1.70158;
    const ease = p === 0 ? 0 : 1 + (c1 + 1) * (p - 1) ** 3 + c1 * (p - 1) ** 2;

    st.hover += ((st.hovered ? 1 : 0) - st.hover) * Math.min(1, dt * 8);
    st.bounce = Math.max(0, st.bounce - dt * 1.6);

    if (outer.current) {
      // Fixed spot: on the dashed ring (desktop) or its static position (mobile).
      let x = spec.pos[0];
      let y = spec.pos[1];
      if (spec.angle !== undefined) {
        const { width, height } = shared.size.current;
        const pt = ringPoint(width, height, spec.angle);
        const ppu = height / VIEW_H;
        x = (pt.x - width / 2) / ppu;
        y = -(pt.y - height / 2) / ppu;
      }
      outer.current.position.set(
        x,
        y + (1 - ease) * 1.2 + Math.sin(st.bounce * Math.PI) * 0.25,
        spec.pos[2],
      );
      outer.current.scale.setScalar(spec.scale * Math.max(0.001, ease) * (1 + st.hover * 0.05));
    }

    // The only ambient motion: a small tilt toward the cursor.
    if (tilt.current) {
      const m = shared.mouse.current;
      const tx = spec.rot[0] - m.y * 0.16;
      const ty = spec.rot[1] + m.x * 0.2;
      tilt.current.rotation.x += (tx - tilt.current.rotation.x) * Math.min(1, dt * 3);
      tilt.current.rotation.y += (ty - tilt.current.rotation.y) * Math.min(1, dt * 3);
      tilt.current.rotation.z = spec.rot[2];
    }

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
          <mesh geometry={shared.body} material={mats.body} />
          {/* Front and back faces: rim + official logo */}
          {[1, -1].map((side) => (
            <group key={side} position={[0, 0, side * HALF]} rotation={[0, side === 1 ? 0 : Math.PI, 0]}>
              <mesh geometry={shared.rim} material={mats.rim} />
              {emboss.map((part, i) => (
                <mesh key={i} geometry={part.geometry} material={mats.logos.get(part.color)} />
              ))}
            </group>
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
  const size = useThree((s) => s.size);
  const sizeRef = useRef({ width: size.width, height: size.height });
  useEffect(() => {
    sizeRef.current = { width: size.width, height: size.height };
  }, [size.width, size.height]);
  const shared = useMemo<Shared>(
    () => ({ size: sizeRef, body: makeBody(), rim: makeRim(), reeding: makeReeding(), mouse }),
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
        onReady?.();
      }}
      style={{ position: "absolute", inset: 0 }}
    >
      <ambientLight intensity={0.4} />
      <directionalLight position={[-4, 6, 8]} intensity={1.5} />
      <directionalLight position={[5, -3, 4]} intensity={0.5} color="#f3c8ff" />
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={2.4} position={[0, 5, 5]} scale={[10, 3, 1]} />
        <Lightformer form="rect" intensity={1.3} color="#b9d4ff" position={[-6, 0, 3]} rotation-y={Math.PI / 2} scale={[8, 6, 1]} />
        <Lightformer form="rect" intensity={1.1} color="#ffc6ec" position={[6, -1, 3]} rotation-y={-Math.PI / 2} scale={[8, 6, 1]} />
        <Lightformer form="circle" intensity={1.6} position={[2, 2, 8]} scale={3} />
      </Environment>
      <Coins specs={mobile ? MOBILE_COINS : DESKTOP_COINS} pulses={pulses} animate={animate} mouse={mouse} />
    </Canvas>
  );
}
