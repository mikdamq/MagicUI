"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useLayoutEffect, useRef } from "react";
import * as THREE from "three";
import {
  CONVEYOR_Y,
  CROPS,
  DOCK,
  FH,
  HOME,
  LIFT_X,
  NFLOORS,
  PACKER,
  PLANT_X,
  PLANT_Z,
  SENSOR_POS,
  SEEDER,
  SLAB,
  SPECTRA,
  TOWER,
  VAN_Z,
  dayFactor,
  lightsOn,
  type FarmSim,
} from "./sim";

/** Receives screen positions of 3D anchors so the HUD can pin DOM labels to them. */
export type AnchorSink = { set: (key: string, x: number, y: number, visible: boolean) => void; flush: () => void };

type Props = { sim: FarmSim; reduce: boolean; compact: boolean; anchors: AnchorSink };
type SimProp = { sim: FarmSim };

/* ------------------------------ Palette ------------------------------ */

const C = {
  white: "#ffffff",
  shell: "#f6f8fb",
  wall: "#e9edf3",
  soil: "#4a3a2d",
  ink: "#2a3348",
  steel: "#c3cad6",
  wood: "#cfa56b",
  glass: "#cfe0f2",
  green: "#2e9e5b",
};
const SKY_DAY = new THREE.Color("#e8eef4");
const SKY_NIGHT = new THREE.Color("#0b1222");
const GROUND_DAY = new THREE.Color("#eef2ee");
const GROUND_NIGHT = new THREE.Color("#18202f");
const ROAD_DAY = new THREE.Color("#d6dce5");
const ROAD_NIGHT = new THREE.Color("#222b3c");
const SPROUT = new THREE.Color("#c8eba8");

// Scratch objects reused every frame.
const _o = new THREE.Object3D();
const _c = new THREE.Color();
const _c2 = new THREE.Color();
const _v = new THREE.Vector3();

const range = (n: number) => Array.from({ length: n }, (_, i) => i);

/* ------------------------------- Canvas ------------------------------- */

export default function FarmCanvas(props: Props) {
  return (
    <Canvas
      shadows="percentage"
      dpr={[1, 2]}
      camera={{ fov: 26, near: 0.5, far: 240, position: [32, 24, 38] }}
      gl={{ antialias: true }}
      onPointerMissed={() => {
        document.body.style.cursor = "";
      }}
    >
      <Ticker sim={props.sim} />
      <Sky sim={props.sim} />
      <CameraRig {...props} />
      <Ground sim={props.sim} />
      <Tower sim={props.sim} />
      <Lift sim={props.sim} />
      <Hall sim={props.sim} />
      <Drone sim={props.sim} />
      <Van sim={props.sim} />
      <Grounds />
      <Projector sim={props.sim} anchors={props.anchors} />
    </Canvas>
  );
}

function Ticker({ sim }: SimProp) {
  useFrame((_, dt) => sim.step(dt));
  return null;
}

/* ------------------------------ Lighting ------------------------------ */

function Sky({ sim }: SimProp) {
  const bg = useRef<THREE.Color>(null);
  const fog = useRef<THREE.Fog>(null);
  const sun = useRef<THREE.DirectionalLight>(null);
  const hemi = useRef<THREE.HemisphereLight>(null);
  const moon = useRef<THREE.DirectionalLight>(null);

  useLayoutEffect(() => {
    sun.current?.target.position.set(3, 0, 1);
    sun.current?.target.updateMatrixWorld();
  }, []);

  useFrame(() => {
    const day = dayFactor(sim.hour);
    bg.current?.lerpColors(SKY_NIGHT, SKY_DAY, day);
    if (fog.current && bg.current) fog.current.color.copy(bg.current);
    const a = ((sim.hour - 6) / 12) * Math.PI;
    if (sun.current) {
      sun.current.position.set(Math.cos(a) * 34 + 3, Math.max(6, Math.sin(a) * 34), 22);
      sun.current.intensity = 0.15 + day * 2.6;
    }
    if (hemi.current) {
      hemi.current.intensity = 0.35 + day * 0.85;
      hemi.current.color.set(day > 0.4 ? "#eef4ff" : "#5b6fa8");
    }
    if (moon.current) moon.current.intensity = (1 - day) * 0.35;
  });

  return (
    <>
      <color ref={bg} attach="background" args={["#e8eef4"]} />
      <fog ref={fog} attach="fog" args={["#e8eef4", 70, 150]} />
      <hemisphereLight ref={hemi} args={["#eef4ff", "#c9d3c2", 1]} />
      <directionalLight
        ref={sun}
        castShadow
        position={[20, 30, 22]}
        intensity={2.4}
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-camera-left={-26}
        shadow-camera-right={26}
        shadow-camera-top={26}
        shadow-camera-bottom={-26}
        shadow-camera-near={1}
        shadow-camera-far={110}
      />
      <directionalLight ref={moon} position={[-20, 25, 10]} color="#8aa2ff" intensity={0} />
    </>
  );
}

/* ------------------------------- Camera ------------------------------- */

function CameraRig({ sim, reduce, compact }: Props) {
  const { camera } = useThree();
  const target = useRef(new THREE.Vector3(3.5, 3.4, 1.4));
  const want = useRef(new THREE.Vector3());
  const wantT = useRef(new THREE.Vector3());
  const first = useRef(true);

  useFrame((state, dt) => {
    const f = sim.focus;
    const zoom = compact ? 1.45 : 1.22;
    if (f === null) {
      wantT.current.set(compact ? 0.6 : 6.2, compact ? 3.4 : 2.6, 1.6);
      want.current.set(26 * zoom, 19 * zoom, 31 * zoom).add(wantT.current);
      if (!compact && !reduce) want.current.add(_v.set(state.pointer.x * 2.2, state.pointer.y * 1.2, -state.pointer.x * 1.4));
    } else {
      wantT.current.set(compact ? 0.4 : 1.6, f * FH + 0.8, 0.2);
      want.current.set(compact ? 9.5 : 10.5, f * FH + (compact ? 4.8 : 4.2), compact ? 15 : 14);
      if (!compact && !reduce) want.current.add(_v.set(state.pointer.x * 0.8, state.pointer.y * 0.4, 0));
    }
    const k = reduce || first.current ? 1 : 1 - Math.exp(-dt * 2.4);
    first.current = false;
    camera.position.lerp(want.current, k);
    target.current.lerp(wantT.current, k);
    camera.lookAt(target.current);
  });
  return null;
}

/* ------------------------------- Ground ------------------------------- */

function Ground({ sim }: SimProp) {
  const ground = useRef<THREE.MeshStandardMaterial>(null);
  const road = useRef<THREE.MeshStandardMaterial>(null);
  const lamps = useRef<THREE.MeshStandardMaterial>(null);
  useFrame(() => {
    const day = dayFactor(sim.hour);
    ground.current?.color.lerpColors(GROUND_NIGHT, GROUND_DAY, day);
    road.current?.color.lerpColors(ROAD_NIGHT, ROAD_DAY, day);
    if (lamps.current) lamps.current.emissiveIntensity = day < 0.35 ? 2.2 : 0;
  });
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position-y={-0.01} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial ref={ground} color={GROUND_DAY} roughness={1} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.005, VAN_Z + 0.2]} receiveShadow>
        <planeGeometry args={[200, 2.8]} />
        <meshStandardMaterial ref={road} color={ROAD_DAY} roughness={0.95} />
      </mesh>
      {range(30).map((i) => (
        <mesh key={i} rotation-x={-Math.PI / 2} position={[-58 + i * 4, 0.012, VAN_Z + 0.2]}>
          <planeGeometry args={[1.6, 0.1]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      ))}
      {[-15, -5, 5, 15].map((x) => (
        <group key={x} position={[x + 2, 0, VAN_Z - 1.6]}>
          <mesh position-y={1.4} castShadow>
            <cylinderGeometry args={[0.05, 0.07, 2.8, 8]} />
            <meshStandardMaterial color={C.steel} />
          </mesh>
          <mesh position={[0, 2.8, 0.25]}>
            <boxGeometry args={[0.18, 0.08, 0.6]} />
            <meshStandardMaterial ref={x === -15 ? lamps : undefined} color="#fff6dc" emissive="#ffd27a" emissiveIntensity={0} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* -------------------------------- Tower ------------------------------- */

function Tower({ sim }: SimProp) {
  const top = NFLOORS * FH;
  const fanA = useRef<THREE.Group>(null);
  const fanB = useRef<THREE.Group>(null);
  const glow = useRef<THREE.MeshStandardMaterial>(null);
  useFrame((_, dt) => {
    const lit = sim.floors.filter((f) => lightsOn(sim.hour, f.hours)).length;
    const s = sim.playing ? (2 + lit * 2.5) * dt : 0;
    if (fanA.current) fanA.current.rotation.y += s;
    if (fanB.current) fanB.current.rotation.y += s * 0.9;
    if (glow.current) glow.current.emissiveIntensity = (1 - dayFactor(sim.hour)) * lit * 0.12;
  });
  return (
    <group>
      {range(NFLOORS).map((k) => (
        <FloorLevel key={k} k={k} sim={sim} />
      ))}
      {/* Roof with solar panels and climate fans */}
      <mesh position={[0, top + 0.15, 0]} castShadow receiveShadow>
        <boxGeometry args={[11.5, 0.3, 4.5]} />
        <meshStandardMaterial color={C.white} />
      </mesh>
      {range(4).map((i) => (
        <mesh key={i} position={[-4.1 + i * 2.25, top + 0.62, -0.6]} rotation-x={-0.38} castShadow>
          <boxGeometry args={[2, 0.08, 1.9]} />
          <meshStandardMaterial color="#2d4fa0" roughness={0.3} metalness={0.2} />
        </mesh>
      ))}
      {[
        [3.6, fanA],
        [1.6, fanB],
      ].map(([x, ref], i) => (
        <group key={i} position={[x as number, top + 0.3, 1.35]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.55, 0.55, 0.45, 20]} />
            <meshStandardMaterial color={C.wall} />
          </mesh>
          <group ref={ref as React.RefObject<THREE.Group>} position-y={0.24}>
            {range(3).map((b) => (
              <mesh key={b} rotation-y={(b * Math.PI * 2) / 3}>
                <boxGeometry args={[0.85, 0.03, 0.14]} />
                <meshStandardMaterial color={C.ink} />
              </mesh>
            ))}
          </group>
        </group>
      ))}
      {/* Glass side wall and front columns */}
      <mesh position={[TOWER.x1 + 0.04, top / 2, 0]}>
        <boxGeometry args={[0.06, top, 4]} />
        <meshStandardMaterial ref={glow} color={C.glass} transparent opacity={0.3} roughness={0.1} emissive="#ff4fd8" emissiveIntensity={0} />
      </mesh>
      {[TOWER.x0, TOWER.x1].map((x) => (
        <mesh key={x} position={[x, top / 2, TOWER.z1]} castShadow>
          <boxGeometry args={[0.28, top, 0.28]} />
          <meshStandardMaterial color={C.white} />
        </mesh>
      ))}
      {/* Water tanks feeding the nutrient loop */}
      {[-2.2, 0.2].map((z) => (
        <mesh key={z} position={[-8.4, 1.3, z]} castShadow receiveShadow>
          <cylinderGeometry args={[0.85, 0.85, 2.6, 28]} />
          <meshStandardMaterial color="#e3ecf7" />
        </mesh>
      ))}
      <mesh position={[-6.9, 1.9, -1]} rotation-z={Math.PI / 2}>
        <cylinderGeometry args={[0.08, 0.08, 2.8, 10]} />
        <meshStandardMaterial color={C.steel} />
      </mesh>
    </group>
  );
}

function FloorLevel({ k, sim }: SimProp & { k: number }) {
  const y0 = k * FH;
  const crop = CROPS[k];
  const ledA = useRef<THREE.MeshStandardMaterial>(null);
  const ledB = useRef<THREE.MeshStandardMaterial>(null);
  const light = useRef<THREE.PointLight>(null);
  const plants = useRef<THREE.InstancedMesh>(null);
  const berries = useRef<THREE.InstancedMesh>(null);
  const hover = useRef<THREE.Mesh>(null);
  const count = PLANT_X.length * PLANT_Z.length;
  const berry = "berry" in crop && crop.berry;

  useFrame(() => {
    const f = sim.floors[k];
    const sp = SPECTRA[f.spectrum];
    const on = lightsOn(sim.hour, f.hours);
    for (const m of [ledA.current, ledB.current]) {
      if (!m) continue;
      m.emissive.set(sp.color);
      m.emissiveIntensity = on ? 2.6 : 0.04;
    }
    if (light.current) {
      light.current.color.set(sp.color);
      light.current.intensity = on ? 14 : 0;
    }
    const pm = plants.current;
    const bm = berries.current;
    if (!pm) return;
    _c.set(crop.color);
    let i = 0;
    for (const z of PLANT_Z) {
      for (const x of PLANT_X) {
        let g = f.g;
        if (f.state === "empty" || f.state === "seeding") g = 0;
        if (f.state === "harvesting" && x > sim.drone.sweepX) g = 0;
        const s = g <= 0 ? 0.0001 : 0.22 + g * 0.95;
        const j = Math.sin(i * 12.9898) * 0.06;
        _o.position.set(x + j, y0 + SLAB + 0.3 + s * 0.16, z + j * 0.5);
        _o.rotation.set(0, i * 1.7, 0);
        _o.scale.set(s, s * 0.82, s);
        _o.updateMatrix();
        pm.setMatrixAt(i, _o.matrix);
        pm.setColorAt(i, _c2.copy(_c).lerp(SPROUT, Math.max(0, 1 - g * 1.25) + (j > 0 ? 0.06 : 0)));
        if (bm) {
          const bs = berry && g > 0.75 ? 0.09 + (g - 0.75) * 0.25 : 0.0001;
          _o.position.set(x + j + 0.12, y0 + SLAB + 0.42 + s * 0.12, z + 0.16);
          _o.scale.setScalar(bs);
          _o.updateMatrix();
          bm.setMatrixAt(i, _o.matrix);
        }
        i++;
      }
    }
    pm.instanceMatrix.needsUpdate = true;
    if (pm.instanceColor) pm.instanceColor.needsUpdate = true;
    if (bm) bm.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      <mesh position={[0, y0 + SLAB / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[11, SLAB, 4]} />
        <meshStandardMaterial color={C.shell} />
      </mesh>
      <mesh position={[0, y0 + FH / 2, TOWER.z0 - 0.06]} receiveShadow>
        <boxGeometry args={[11, FH, 0.12]} />
        <meshStandardMaterial color={k % 2 ? "#f1f4f8" : "#ebeff5"} />
      </mesh>
      <mesh position={[TOWER.x0 - 0.06, y0 + FH / 2, 0]} receiveShadow>
        <boxGeometry args={[0.12, FH, 4]} />
        <meshStandardMaterial color="#e2e7ef" />
      </mesh>
      {[-0.85, 0.85].map((z) => (
        <group key={z}>
          <mesh position={[0, y0 + SLAB + 0.14, z]} castShadow receiveShadow>
            <boxGeometry args={[10.4, 0.28, 1.0]} />
            <meshStandardMaterial color={C.soil} roughness={1} />
          </mesh>
          <mesh position={[0, y0 + SLAB + 0.285, z]}>
            <boxGeometry args={[10.2, 0.01, 0.1]} />
            <meshStandardMaterial color="#3b82a6" emissive="#3b82a6" emissiveIntensity={0.25} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, y0 + FH - 0.08, -0.85]}>
        <boxGeometry args={[10.2, 0.06, 0.14]} />
        <meshStandardMaterial ref={ledA} color="#ffffff" emissive="#ff4fd8" emissiveIntensity={2} />
      </mesh>
      <mesh position={[0, y0 + FH - 0.08, 0.85]}>
        <boxGeometry args={[10.2, 0.06, 0.14]} />
        <meshStandardMaterial ref={ledB} color="#ffffff" emissive="#ff4fd8" emissiveIntensity={2} />
      </mesh>
      <pointLight ref={light} position={[0, y0 + FH - 0.5, 0.6]} distance={9} decay={1.6} intensity={12} color="#ff4fd8" />
      <instancedMesh ref={plants} args={[undefined, undefined, count]}>
        <icosahedronGeometry args={[0.27, 0]} />
        <meshStandardMaterial flatShading roughness={0.75} />
      </instancedMesh>
      {berry && (
        <instancedMesh ref={berries} args={[undefined, undefined, count]}>
          <sphereGeometry args={[1, 8, 6]} />
          <meshStandardMaterial color="#e5484d" roughness={0.5} />
        </instancedMesh>
      )}
      {/* Hover outline + click target */}
      <mesh ref={hover} position={[0, y0 + FH / 2, 0]} visible={false}>
        <boxGeometry args={[11.1, FH - 0.04, 4.1]} />
        <meshBasicMaterial color="#2e9e5b" transparent opacity={0.08} depthWrite={false} />
      </mesh>
      <mesh
        position={[0, y0 + FH / 2, 0]}
        onClick={(e) => {
          e.stopPropagation();
          sim.setFocus(k);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          if (hover.current) hover.current.visible = true;
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          if (hover.current) hover.current.visible = false;
          document.body.style.cursor = "";
        }}
      >
        <boxGeometry args={[11, FH, 4]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}

/* --------------------------------- Lift -------------------------------- */

function Crate({ seed = false }: { seed?: boolean }) {
  return seed ? (
    <group>
      <mesh castShadow>
        <boxGeometry args={[0.95, 0.1, 1.0]} />
        <meshStandardMaterial color="#3d2f24" />
      </mesh>
      {range(12).map((i) => (
        <mesh key={i} position={[-0.36 + (i % 4) * 0.24, 0.08, -0.3 + Math.floor(i / 4) * 0.3]}>
          <sphereGeometry args={[0.05, 6, 4]} />
          <meshStandardMaterial color="#b9e39a" />
        </mesh>
      ))}
    </group>
  ) : (
    <group>
      <mesh castShadow position-y={0.2}>
        <boxGeometry args={[0.8, 0.4, 0.6]} />
        <meshStandardMaterial color={C.wood} roughness={0.9} />
      </mesh>
      <mesh position-y={0.42}>
        <icosahedronGeometry args={[0.24, 0]} />
        <meshStandardMaterial color="#6cbf6a" flatShading />
      </mesh>
    </group>
  );
}

function Lift({ sim }: SimProp) {
  const top = NFLOORS * FH;
  const plat = useRef<THREE.Group>(null);
  const crate = useRef<THREE.Group>(null);
  const seed = useRef<THREE.Group>(null);
  useFrame(() => {
    if (plat.current) plat.current.position.y = sim.lift.y;
    if (crate.current) crate.current.visible = sim.lift.cargo === "crate";
    if (seed.current) seed.current.visible = sim.lift.cargo === "seed";
  });
  return (
    <group position={[LIFT_X, 0, 0]}>
      {[
        [-0.6, -0.7],
        [0.6, -0.7],
        [-0.6, 0.7],
        [0.6, 0.7],
      ].map(([x, z]) => (
        <mesh key={`${x}${z}`} position={[x, (top + 0.4) / 2, z]} castShadow>
          <boxGeometry args={[0.08, top + 0.4, 0.08]} />
          <meshStandardMaterial color={C.steel} />
        </mesh>
      ))}
      <mesh position={[0, top + 0.42, 0]}>
        <boxGeometry args={[1.4, 0.1, 1.6]} />
        <meshStandardMaterial color={C.steel} />
      </mesh>
      <group ref={plat}>
        <mesh position-y={0.05} castShadow receiveShadow>
          <boxGeometry args={[1.15, 0.1, 1.3]} />
          <meshStandardMaterial color={C.ink} />
        </mesh>
        <group ref={crate} position-y={0.1} visible={false}>
          <Crate />
        </group>
        <group ref={seed} position-y={0.16} visible={false}>
          <Crate seed />
        </group>
      </group>
    </group>
  );
}

/* --------------------------- Packing hall ------------------------------ */

function Arm({ a, color, x, z }: { a: () => number; color: string; x: number; z: number }) {
  const yaw = useRef<THREE.Group>(null);
  const upper = useRef<THREE.Group>(null);
  useFrame(() => {
    const v = a();
    if (yaw.current) yaw.current.rotation.y = 0.6 + v * 1.5;
    if (upper.current) upper.current.rotation.z = -0.5 + v * 0.8;
  });
  return (
    <group position={[x, 0.1, z]}>
      <mesh position-y={0.15} castShadow>
        <cylinderGeometry args={[0.38, 0.45, 0.3, 24]} />
        <meshStandardMaterial color={C.ink} />
      </mesh>
      <group ref={yaw} position-y={0.3}>
        <mesh position-y={0.2} castShadow>
          <cylinderGeometry args={[0.22, 0.26, 0.4, 20]} />
          <meshStandardMaterial color={color} />
        </mesh>
        <group ref={upper} position-y={0.4}>
          <mesh position={[0.45, 0.35, 0]} rotation-z={-0.9} castShadow>
            <boxGeometry args={[0.18, 1.1, 0.18]} />
            <meshStandardMaterial color={color} />
          </mesh>
          <mesh position={[1.05, 0.55, 0]} rotation-z={0.6} castShadow>
            <boxGeometry args={[0.14, 0.8, 0.14]} />
            <meshStandardMaterial color={C.white} />
          </mesh>
          <mesh position={[1.3, 0.25, 0]}>
            <boxGeometry args={[0.28, 0.1, 0.28]} />
            <meshStandardMaterial color={C.ink} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

function Hall({ sim }: SimProp) {
  const moving = useRef<THREE.Group>(null);
  const tray = useRef<THREE.Group>(null);
  const stack = useRef<THREE.Group>(null);
  const panel = useRef<THREE.MeshStandardMaterial>(null);
  useFrame(() => {
    const c = sim.crate;
    if (moving.current) {
      moving.current.visible = c.visible;
      moving.current.position.set(c.x, c.y, c.z);
    }
    const t = sim.tray;
    if (tray.current) {
      tray.current.visible = t.visible;
      tray.current.position.set(t.x, t.y, t.z);
    }
    stack.current?.children.forEach((ch, i) => {
      ch.visible = i < sim.stack && !(sim.van.mode === "loading" && i >= sim.stack - Math.floor(sim.van.t / 0.6) - 1 && i >= sim.stack - 3);
    });
    if (panel.current) panel.current.emissiveIntensity = dayFactor(sim.hour) < 0.35 ? 1.4 : 0.15;
  });
  const conveyor = (from: [number, number], to: [number, number]) => {
    const [ax, az] = from;
    const [bx, bz] = to;
    const len = Math.hypot(bx - ax, bz - az) + 0.7;
    const rot = Math.atan2(-(bz - az), bx - ax);
    return (
      <group position={[(ax + bx) / 2, 0, (az + bz) / 2]} rotation-y={rot}>
        <mesh position-y={CONVEYOR_Y / 2} castShadow receiveShadow>
          <boxGeometry args={[len, CONVEYOR_Y, 0.75]} />
          <meshStandardMaterial color="#3b4459" />
        </mesh>
        {range(Math.floor(len / 0.45)).map((i) => (
          <mesh key={i} position={[-len / 2 + 0.25 + i * 0.45, CONVEYOR_Y + 0.005, 0]}>
            <boxGeometry args={[0.06, 0.01, 0.7]} />
            <meshStandardMaterial color="#596379" />
          </mesh>
        ))}
      </group>
    );
  };
  return (
    <group>
      <mesh position={[11, 0.05, 0.3]} receiveShadow>
        <boxGeometry args={[7.2, 0.1, 5.8]} />
        <meshStandardMaterial color={C.wall} />
      </mesh>
      <mesh position={[11, 1.2, -2.5]} castShadow receiveShadow>
        <boxGeometry args={[7.2, 2.4, 0.14]} />
        <meshStandardMaterial color={C.white} />
      </mesh>
      <mesh position={[11, 1.6, -2.42]}>
        <boxGeometry args={[4.2, 0.5, 0.02]} />
        <meshStandardMaterial ref={panel} color="#e9fbef" emissive="#7ee0a0" emissiveIntensity={0.15} />
      </mesh>
      {[7.6, 14.4].map((x) => (
        <mesh key={x} position={[x, 0.35, 0.3]}>
          <boxGeometry args={[0.06, 0.6, 5.8]} />
          <meshStandardMaterial color={C.glass} transparent opacity={0.5} />
        </mesh>
      ))}
      {conveyor([LIFT_X + 0.5, 0], [PACKER.x, 0])}
      {conveyor([PACKER.x, 0], [DOCK.x, 0])}
      {conveyor([DOCK.x, 0], [DOCK.x, DOCK.z - 0.6])}
      <Arm a={() => sim.packerA} color={C.green} x={PACKER.x} z={PACKER.z} />
      <Arm a={() => sim.seederA} color="#f5a524" x={SEEDER.x} z={SEEDER.z} />
      {range(3).map((i) => (
        <group key={i} position={[SEEDER.x - 1.2, 0.12 + i * 0.12, -1.9]}>
          <Crate seed />
        </group>
      ))}
      <group ref={moving}>
        <Crate />
      </group>
      <group ref={tray}>
        <Crate seed />
      </group>
      <group ref={stack}>
        {range(6).map((i) => (
          <group key={i} position={[DOCK.x - 1.6 + (i % 3) * 0.85, Math.floor(i / 3) * 0.42, DOCK.z + 0.2]}>
            <Crate />
          </group>
        ))}
      </group>
    </group>
  );
}

/* -------------------------------- Drone -------------------------------- */

function Drone({ sim }: SimProp) {
  const g = useRef<THREE.Group>(null);
  const rotors = useRef<THREE.Group>(null);
  const beam = useRef<THREE.Mesh>(null);
  const carry = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    const d = sim.drone;
    g.current?.position.set(d.x, d.y, d.z);
    if (g.current) g.current.rotation.z = sim.batch?.stage === "sweep" ? 0.12 : 0;
    rotors.current?.children.forEach((r) => (r.rotation.y += (sim.playing ? 40 : 0) * dt));
    if (beam.current) beam.current.visible = sim.batch?.stage === "sweep";
    if (carry.current) carry.current.visible = sim.batch?.stage === "drop";
  });
  return (
    <group>
      <mesh position={[HOME.x, 0.04, HOME.z]} receiveShadow>
        <cylinderGeometry args={[0.95, 0.95, 0.08, 32]} />
        <meshStandardMaterial color="#dfe5ee" />
      </mesh>
      <mesh position={[HOME.x, 0.09, HOME.z]} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[0.55, 0.65, 32]} />
        <meshBasicMaterial color={C.green} />
      </mesh>
      <group ref={g}>
        <mesh castShadow>
          <boxGeometry args={[0.55, 0.16, 0.55]} />
          <meshStandardMaterial color={C.ink} />
        </mesh>
        <mesh position-y={-0.1}>
          <sphereGeometry args={[0.07, 10, 8]} />
          <meshStandardMaterial color="#5eead4" emissive="#5eead4" emissiveIntensity={2} />
        </mesh>
        <group ref={rotors}>
          {[
            [-0.45, -0.45],
            [0.45, -0.45],
            [-0.45, 0.45],
            [0.45, 0.45],
          ].map(([x, z]) => (
            <group key={`${x}${z}`} position={[x, 0.1, z]}>
              <mesh>
                <boxGeometry args={[0.5, 0.02, 0.06]} />
                <meshStandardMaterial color="#5b6478" />
              </mesh>
            </group>
          ))}
        </group>
        {[
          [-0.45, -0.45],
          [0.45, -0.45],
          [-0.45, 0.45],
          [0.45, 0.45],
        ].map(([x, z]) => (
          <mesh key={`r${x}${z}`} position={[x, 0.08, z]}>
            <cylinderGeometry args={[0.26, 0.26, 0.02, 20]} />
            <meshStandardMaterial color="#9aa6ba" transparent opacity={0.35} />
          </mesh>
        ))}
        <mesh ref={beam} position={[0, -0.55, -0.7]} rotation-x={0.9} visible={false}>
          <coneGeometry args={[0.55, 1.6, 20, 1, true]} />
          <meshBasicMaterial color="#5eead4" transparent opacity={0.22} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
        <group ref={carry} position-y={-0.55} visible={false}>
          <Crate />
        </group>
      </group>
    </group>
  );
}

/* --------------------------------- Van --------------------------------- */

function Van({ sim }: SimProp) {
  const g = useRef<THREE.Group>(null);
  const door = useRef<THREE.Mesh>(null);
  const lights = useRef<THREE.MeshStandardMaterial>(null);
  useFrame(() => {
    g.current?.position.set(sim.van.x, 0, VAN_Z);
    if (door.current) door.current.rotation.y = sim.van.mode === "loading" ? -1.4 : 0;
    if (lights.current) lights.current.emissiveIntensity = dayFactor(sim.hour) < 0.4 ? 3 : 0.2;
  });
  return (
    <group ref={g}>
      <mesh position={[-0.3, 1.0, 0]} castShadow>
        <boxGeometry args={[2.9, 1.5, 1.45]} />
        <meshStandardMaterial color={C.white} />
      </mesh>
      <mesh position={[-0.3, 0.75, 0.73]}>
        <boxGeometry args={[2.6, 0.22, 0.01]} />
        <meshStandardMaterial color={C.green} />
      </mesh>
      <mesh position={[1.55, 0.78, 0]} castShadow>
        <boxGeometry args={[0.9, 1.05, 1.4]} />
        <meshStandardMaterial color={C.green} />
      </mesh>
      <mesh position={[1.72, 1.05, 0]}>
        <boxGeometry args={[0.6, 0.4, 1.42]} />
        <meshStandardMaterial color="#1f2937" roughness={0.2} />
      </mesh>
      <mesh position={[2.01, 0.6, 0]}>
        <boxGeometry args={[0.02, 0.16, 1.2]} />
        <meshStandardMaterial ref={lights} color="#fff6dc" emissive="#ffe6a8" emissiveIntensity={0.2} />
      </mesh>
      <mesh ref={door} position={[-1.75, 1.0, -0.72]}>
        <boxGeometry args={[0.04, 1.4, 1.4]} />
        <meshStandardMaterial color="#eef1f6" />
      </mesh>
      {[
        [-1.1, 0.72],
        [1.3, 0.72],
        [-1.1, -0.72],
        [1.3, -0.72],
      ].map(([x, z]) => (
        <mesh key={`${x}${z}`} position={[x, 0.3, z]} rotation-x={Math.PI / 2} castShadow>
          <cylinderGeometry args={[0.3, 0.3, 0.2, 16]} />
          <meshStandardMaterial color={C.ink} />
        </mesh>
      ))}
    </group>
  );
}

/* ------------------------------- Grounds ------------------------------- */

const TREES: [number, number, number][] = [
  [-14, -5, 1.1],
  [-12, 1.5, 0.9],
  [-17, -1, 1.3],
  [-4, -7.5, 1],
  [3, -8, 1.2],
  [10, -6.5, 0.9],
  [17, -4, 1.2],
  [19.5, 1, 1],
  [-20, 3, 1],
  [22, -8, 1.3],
];

function Grounds() {
  return (
    <group>
      {TREES.map(([x, z, s]) => (
        <group key={`${x}${z}`} position={[x, 0, z]} scale={s}>
          <mesh position-y={0.5} castShadow>
            <cylinderGeometry args={[0.1, 0.14, 1, 8]} />
            <meshStandardMaterial color="#a48868" />
          </mesh>
          <mesh position-y={1.45} castShadow>
            <icosahedronGeometry args={[0.85, 0]} />
            <meshStandardMaterial color="#69bb88" flatShading />
          </mesh>
          <mesh position={[0.35, 1.15, 0.3]} castShadow>
            <icosahedronGeometry args={[0.5, 0]} />
            <meshStandardMaterial color="#7fcb98" flatShading />
          </mesh>
        </group>
      ))}
      {[
        [-11, -3, 6, 9],
        [16, -3, 7, 6],
      ].map(([x, z, w, d]) => (
        <mesh key={`${x}`} rotation-x={-Math.PI / 2} position={[x, 0.004, z]} receiveShadow>
          <planeGeometry args={[w, d]} />
          <meshStandardMaterial color="#dcefe2" roughness={1} />
        </mesh>
      ))}
    </group>
  );
}

/* ------------------------------ Anchors ------------------------------ */

function Projector({ sim, anchors }: { sim: FarmSim; anchors: AnchorSink }) {
  const { camera, size } = useThree();
  useFrame(() => {
    const put = (key: string, x: number, y: number, z: number) => {
      _v.set(x, y, z).project(camera);
      anchors.set(key, ((_v.x + 1) / 2) * size.width, ((1 - _v.y) / 2) * size.height, _v.z < 1);
    };
    for (let k = 0; k < NFLOORS; k++) put(`f${k}`, TOWER.x0 - 0.3, k * FH + 1.1, TOWER.z1);
    const y0 = (sim.focus ?? sim.sel) * FH;
    SENSOR_POS.forEach(([x, y, z], i) => put(`s${i}`, x, y0 + y, z));
    anchors.flush();
  });
  return null;
}
