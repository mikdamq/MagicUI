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
varying vec3 vNormal;
varying vec3 vView;
varying vec3 vPos;
${NOISE}
void main(){
  vec3 p = position;
  float n = snoise(normal * 1.3 + vec3(uTime * 0.22));
  p += normal * n * (0.012 + uEnergy * 0.022);
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vNormal = normalize(normalMatrix * normal);
  vView = normalize(-mv.xyz);
  vPos = position;
  gl_Position = projectionMatrix * mv;
}
`;

const fragmentShader = /* glsl */ `
uniform float uTime;
uniform vec2 uMouse;
varying vec3 vNormal;
varying vec3 vView;
varying vec3 vPos;
${NOISE}
void main(){
  vec3 n = normalize(vNormal);
  float facing = max(dot(n, vView), 0.0);
  float fres = 1.0 - facing;

  // Gradient axis: sky-blue top-left -> pink bottom-right, nudged by the cursor.
  vec2 dir = normalize(vec2(-1.0, 1.05) + uMouse * 0.7);
  float g = dot(n.xy, dir) * 0.55 + 0.5;
  float flow = snoise(vPos * 1.6 + vec3(0.0, uTime * 0.16, uTime * 0.11));
  float flow2 = snoise(vPos * 3.2 - vec3(uTime * 0.09));
  g = clamp(g + flow * 0.13 + flow2 * 0.04, 0.0, 1.0);

  vec3 pink = vec3(0.98, 0.76, 0.94);
  vec3 lav  = vec3(0.82, 0.67, 0.97);
  vec3 peri = vec3(0.67, 0.66, 0.98);
  vec3 blue = vec3(0.53, 0.73, 0.98);
  vec3 col = mix(pink, lav, smoothstep(0.05, 0.42, g));
  col = mix(col, peri, smoothstep(0.38, 0.68, g));
  col = mix(col, blue, smoothstep(0.62, 0.98, g));

  // Milky core and a soft highlight that follows the pointer.
  col = mix(col, vec3(0.95, 0.89, 1.0), pow(facing, 4.0) * 0.22);
  vec3 L = normalize(vec3(-0.45 + uMouse.x * 0.9, 0.55 + uMouse.y * 0.7, 1.0));
  col += pow(max(dot(n, L), 0.0), 14.0) * 0.16;

  // Bright, hazy rim that dissolves into the white page.
  col = mix(col, vec3(0.97, 0.94, 1.0), smoothstep(0.5, 1.0, fres) * 0.6);
  float alpha = smoothstep(1.0, 0.8, fres);
  gl_FragColor = vec4(col * alpha, alpha);
}
`;

type Pointer = { x: number; y: number };

function Sphere({ pointer }: { pointer: React.RefObject<Pointer> }) {
  const mesh = useRef<THREE.Mesh>(null);
  const material = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2() },
      uEnergy: { value: 0 },
    }),
    [],
  );

  useFrame((state, delta) => {
    const u = material.current?.uniforms;
    if (!u) return;
    const p = pointer.current;
    const m = u.uMouse.value as THREE.Vector2;
    const prevX = m.x;
    const prevY = m.y;
    m.x += (p.x - m.x) * Math.min(1, delta * 3);
    m.y += (p.y - m.y) * Math.min(1, delta * 3);
    // Pointer speed briefly energises the surface.
    const speed = Math.hypot(m.x - prevX, m.y - prevY) / Math.max(delta, 1e-3);
    u.uEnergy.value += (Math.min(speed * 0.5, 1) - u.uEnergy.value) * 0.04;
    u.uTime.value = state.clock.elapsedTime;

    if (mesh.current) {
      mesh.current.rotation.y += delta * 0.12;
      mesh.current.rotation.x = m.y * 0.25;
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
