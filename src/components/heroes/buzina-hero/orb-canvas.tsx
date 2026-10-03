"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

// Ashima Arts 3D simplex noise (MIT).
const NOISE = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0);
  const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy));
  vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);
  vec3 l=1.0-g;
  vec3 i1=min(g.xyz,l.zxy);
  vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;
  vec3 x2=x0-i2+C.yyy;
  vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857;
  vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z);
  vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy;
  vec4 y=y_*ns.x+ns.yyyy;
  vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);
  vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0;
  vec4 s1=floor(b1)*2.0+1.0;
  vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
  vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);
  vec3 p1=vec3(a0.zw,h.y);
  vec3 p2=vec3(a1.xy,h.z);
  vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);
  m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
`;

const vertexShader = /* glsl */ `
uniform float uTime;
uniform float uEnergy;
uniform vec2 uPull;
uniform float uPullAmt;
uniform float uWobble;
varying vec3 vNormal;
varying vec3 vView;
varying vec3 vPos;
${NOISE}
void main(){
  vec3 p = position;
  vec3 nView = normalize(normalMatrix * normal);
  // Liquid bulge reaching toward the cursor.
  vec3 pullDir = normalize(vec3(uPull, 0.85));
  float bulge = pow(max(dot(nView, pullDir), 0.0), 3.0) * uPullAmt * 0.11;
  float n = snoise(normal * 1.3 + vec3(uTime * 0.22));
  float wobble = snoise(normal * 1.2 + vec3(uTime * 1.4)) * uWobble;
  p += normal * (n * (0.012 + uEnergy * 0.012) + bulge + wobble * 0.045);
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vNormal = nView;
  vView = normalize(-mv.xyz);
  vPos = position;
  gl_Position = projectionMatrix * mv;
}
`;

const fragmentShader = /* glsl */ `
uniform float uTime;
uniform vec2 uPull;
uniform float uPullAmt;
varying vec3 vNormal;
varying vec3 vView;
varying vec3 vPos;
${NOISE}
void main(){
  vec3 n = normalize(vNormal);
  float facing = max(dot(n, vView), 0.0);
  float fres = 1.0 - facing;

  // Gradient axis swings toward the cursor; colours swirl after it.
  vec2 dir = normalize(vec2(-1.0, 1.05) + uPull * 1.3);
  float g = dot(n.xy, dir) * 0.55 + 0.5;
  vec3 swirl = vec3(uPull * 0.9, 0.0);
  float flow = snoise(vPos * 1.6 + swirl + vec3(0.0, uTime * 0.16, uTime * 0.11));
  float flow2 = snoise(vPos * 3.2 - swirl - vec3(uTime * 0.09));
  g = clamp(g + flow * 0.14 + flow2 * 0.05, 0.0, 1.0);

  vec3 pink = vec3(0.98, 0.76, 0.94);
  vec3 lav  = vec3(0.82, 0.67, 0.97);
  vec3 peri = vec3(0.67, 0.66, 0.98);
  vec3 blue = vec3(0.53, 0.73, 0.98);
  vec3 col = mix(pink, lav, smoothstep(0.05, 0.42, g));
  col = mix(col, peri, smoothstep(0.38, 0.68, g));
  col = mix(col, blue, smoothstep(0.62, 0.98, g));

  // Milky core and a glossy highlight that tracks the cursor.
  col = mix(col, vec3(0.95, 0.89, 1.0), pow(facing, 4.0) * 0.22);
  vec3 L = normalize(vec3(-0.25 + uPull.x * 0.9, 0.35 + uPull.y * 0.8, 1.0));
  col += pow(max(dot(n, L), 0.0), 10.0) * (0.14 + uPullAmt * 0.12);

  // Bright, hazy rim that dissolves into the white page.
  col = mix(col, vec3(0.97, 0.94, 1.0), smoothstep(0.5, 1.0, fres) * 0.6);
  float alpha = smoothstep(1.0, 0.8, fres);
  gl_FragColor = vec4(col * alpha, alpha);
}
`;

/** Last pointer position in client pixels (null until the pointer moves). */
type Pointer = { x: number; y: number; active: boolean };

function Sphere({ pointer }: { pointer: React.RefObject<Pointer> }) {
  const mesh = useRef<THREE.Mesh>(null);
  const material = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uEnergy: { value: 0 },
      uPull: { value: new THREE.Vector2() },
      uPullAmt: { value: 0 },
      uWobble: { value: 0 },
    }),
    [],
  );
  // Spring state for the jelly lag between cursor and surface.
  const spring = useRef({ x: 0, y: 0, vx: 0, vy: 0 });

  useFrame((state, delta) => {
    const u = material.current?.uniforms;
    if (!u) return;
    const dt = Math.min(delta, 1 / 30);

    // Cursor position relative to the sphere, in sphere radii.
    const rect = state.gl.domElement.getBoundingClientRect();
    const radius = rect.height * 0.4 || 1;
    const p = pointer.current;
    let tx = 0;
    let ty = 0;
    let amt = 0;
    if (p.active) {
      const lx = (p.x - (rect.left + rect.width / 2)) / radius;
      const ly = -(p.y - (rect.top + rect.height / 2)) / radius;
      const dist = Math.hypot(lx, ly);
      const reach = Math.min(dist, 1.15) / Math.max(dist, 1e-3);
      tx = lx * reach;
      ty = ly * reach;
      // Strong when close, still noticeable across the hero.
      amt = Math.max(0.35, 1.2 - dist * 0.2);
    }

    // Under-damped spring: overshoots, wobbles, then settles.
    const sp = spring.current;
    sp.vx += (tx - sp.x) * 90 * dt;
    sp.vy += (ty - sp.y) * 90 * dt;
    sp.vx *= Math.pow(0.02, dt);
    sp.vy *= Math.pow(0.02, dt);
    sp.x += sp.vx * dt;
    sp.y += sp.vy * dt;

    (u.uPull.value as THREE.Vector2).set(sp.x, sp.y);
    u.uPullAmt.value += (amt - u.uPullAmt.value) * Math.min(1, dt * 4);
    const speed = Math.hypot(sp.vx, sp.vy);
    u.uWobble.value += (Math.min(speed * 0.12, 0.5) - u.uWobble.value) * Math.min(1, dt * 6);
    u.uEnergy.value += (Math.min(speed * 0.3, 1) - u.uEnergy.value) * Math.min(1, dt * 3);
    u.uTime.value = state.clock.elapsedTime;

    if (mesh.current) {
      // Magnetic drift and tilt toward the cursor.
      mesh.current.position.x = sp.x * 0.07;
      mesh.current.position.y = sp.y * 0.07;
      mesh.current.rotation.y += dt * 0.12 + sp.vx * dt * 0.4;
      mesh.current.rotation.x = -sp.y * 0.35;
      const s = 1 + Math.sin(state.clock.elapsedTime * 0.9) * 0.012;
      mesh.current.scale.setScalar(s);
    }
  });

  return (
    <mesh ref={mesh}>
      <sphereGeometry args={[1, 128, 128]} />
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        premultipliedAlpha
        depthWrite={false}
      />
    </mesh>
  );
}

export default function OrbCanvas({ onReady }: { onReady?: () => void }) {
  const pointer = useRef<Pointer>({ x: 0, y: 0, active: false });

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = e.clientX;
      pointer.current.y = e.clientY;
      pointer.current.active = true;
    };
    const onLeave = () => {
      pointer.current.active = false;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ alpha: true, antialias: true }}
      camera={{ position: [0, 0, 4.66], fov: 30 }}
      resize={{ offsetSize: true }}
      onCreated={() => onReady?.()}
      style={{ position: "absolute", inset: 0 }}
    >
      <Sphere pointer={pointer} />
    </Canvas>
  );
}
