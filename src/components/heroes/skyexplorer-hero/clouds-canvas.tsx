"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

const vertexShader = /* glsl */ `
varying vec2 vUv;
void main(){
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

const fragmentShader = /* glsl */ `
precision highp float;
uniform float uTime;
uniform vec2 uRes;
uniform vec2 uMouse;
uniform float uRise;
varying vec2 vUv;

float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1,0)), u.x), mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), u.x), u.y);
}
float fbm(vec2 p){
  float v = 0.0, a = 0.5;
  mat2 r = mat2(0.8, -0.6, 0.6, 0.8);
  for (int i = 0; i < 6; i++){ v += a * noise(p); p = r * p * 2.03 + 11.7; a *= 0.5; }
  return v;
}

// Cloud density at a point: domain-warped fbm drifting sideways.
float clouds(vec2 p, float t){
  vec2 q = vec2(fbm(p + vec2(t * 0.05, 0.0)), fbm(p + vec2(5.2, 1.3) - t * 0.03));
  return fbm(p * 1.1 + q * 1.4 + vec2(t * 0.035, 0.0));
}

void main(){
  float aspect = uRes.x / uRes.y;
  vec2 uv = vUv;
  vec2 p = vec2(uv.x * aspect, uv.y) * 1.7 + uMouse * vec2(0.05, 0.025);
  float t = uTime;

  float d = clouds(p, t);
  // Light from the upper left: sample towards it for soft self-shadowing.
  float dl = clouds(p + vec2(-0.035, 0.06), t);
  float lit = clamp(0.72 + (d - dl) * 4.0, 0.0, 1.0);

  float edge = abs(uv.x - 0.5) * 2.0;
  float rise = uRise * 0.16;

  // Rolling cloud sea along the bottom.
  float seaTop = 0.2 + rise + (fbm(vec2(uv.x * 2.2 + t * 0.015, 3.0)) - 0.5) * 0.16;
  float sea = smoothstep(seaTop + 0.08, seaTop - 0.12, uv.y);
  // Tall cumulus banks climbing both edges.
  float bankTop = 0.56 + rise + (fbm(vec2(uv.y * 3.0, t * 0.02)) - 0.5) * 0.1;
  float banks = smoothstep(0.66, 1.0, edge) * smoothstep(bankTop, bankTop - 0.3, uv.y);
  // A faint veil of mist across the ridge line.
  float veil = smoothstep(0.5, 0.36, uv.y) * smoothstep(0.2, 0.3, uv.y) * 0.18;

  float mask = max(sea, banks);
  float c = smoothstep(0.5, 0.66, d * 0.85 + mask * 0.55);
  c = max(c, veil * smoothstep(0.35, 0.75, d));
  c = max(c, smoothstep(0.1, 0.0, uv.y));

  vec3 shadow = vec3(0.86, 0.84, 0.94);
  vec3 col = mix(shadow, vec3(1.0), clamp(lit + uRise * 0.35, 0.0, 1.0));
  col = mix(col, vec3(1.0), smoothstep(0.2, 0.0, uv.y));

  float a = clamp(c, 0.0, 1.0);
  gl_FragColor = vec4(col * a, a);
}
`;

type Pointer = { x: number; y: number };

function CloudPlane({
  pointer,
  rise,
  animate,
}: {
  pointer: React.RefObject<Pointer>;
  rise: React.RefObject<number>;
  animate: boolean;
}) {
  const material = useRef<THREE.ShaderMaterial>(null);
  const size = useThree((s) => s.size);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 12 },
      uRes: { value: new THREE.Vector2(1, 1) },
      uMouse: { value: new THREE.Vector2() },
      uRise: { value: 0 },
    }),
    [],
  );

  useFrame((state, delta) => {
    const u = material.current?.uniforms;
    if (!u) return;
    (u.uRes.value as THREE.Vector2).set(size.width, size.height);
    if (animate) u.uTime.value += delta;
    const m = u.uMouse.value as THREE.Vector2;
    m.x += (pointer.current.x - m.x) * Math.min(1, delta * 2);
    m.y += (pointer.current.y - m.y) * Math.min(1, delta * 2);
    u.uRise.value += (rise.current - u.uRise.value) * Math.min(1, delta * 6);
  });

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        premultipliedAlpha
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
}

export default function CloudsCanvas({
  rise,
  animate,
  onReady,
}: {
  rise: React.RefObject<number>;
  animate: boolean;
  onReady?: () => void;
}) {
  const pointer = useRef<Pointer>({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <Canvas
      dpr={[1, 1.25]}
      gl={{ alpha: true, antialias: false }}
      frameloop={animate ? "always" : "demand"}
      resize={{ offsetSize: true }}
      onCreated={() => onReady?.()}
      style={{ position: "absolute", inset: 0 }}
    >
      <CloudPlane pointer={pointer} rise={rise} animate={animate} />
    </Canvas>
  );
}
