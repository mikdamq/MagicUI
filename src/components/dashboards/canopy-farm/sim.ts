/**
 * Canopy farm simulation. Plain TypeScript, no React: the 3D scene reads the
 * live object every frame, the HUD subscribes to a throttled snapshot.
 */

/* ------------------------------ World layout ------------------------------ */

export const FH = 2.2; // floor height
export const NFLOORS = 4;
export const TOWER = { x0: -5.5, x1: 5.5, z0: -2, z1: 2 };
export const SLAB = 0.16;
export const LIFT_X = 6.45;
export const HOME = { x: -8.2, y: 0.45, z: 3.4 };
export const CONVEYOR_Y = 0.55;
export const PACKER = { x: 10.4, z: -1.15 };
export const SEEDER = { x: 8.3, z: -1.35 };
export const DOCK = { x: 12.7, z: 3.9 };
export const VAN_DOCK_X = 11.6;
export const VAN_Z = 6.7;

/** Plant grid for one floor: two trays, two rows each. */
export const PLANT_X = Array.from({ length: 16 }, (_, i) => -4.85 + i * 0.647);
export const PLANT_Z = [-1.1, -0.6, 0.6, 1.1];

/** Sensor tag anchors on a floor, relative to its floor height. */
export const SENSOR_POS: [number, number, number][] = [
  [-3.4, 1.55, 1.9],
  [3.6, 1.5, 1.9],
  [-0.8, 0.55, 1.6],
  [1.9, FH - 0.2, 0.9],
];

/* ------------------------------ Crops & light ----------------------------- */

export type Spectrum = "pink" | "white" | "blue";

export const SPECTRA: Record<
  Spectrum,
  { label: string; nm: string; color: string; growth: number; energy: number; heat: number }
> = {
  pink: { label: "Red + blue", nm: "660 + 450 nm", color: "#ff4fd8", growth: 1, energy: 1, heat: 0 },
  white: { label: "Full white", nm: "400–700 nm", color: "#fff1d6", growth: 0.86, energy: 1.18, heat: 0.7 },
  blue: { label: "Blue heavy", nm: "450 nm", color: "#5b8cff", growth: 0.76, energy: 0.9, heat: -0.4 },
};

export const CROPS = [
  { name: "Lettuce", color: "#7ccb6b", days: 32, kg: 38, base: 70 },
  { name: "Basil", color: "#3fa35b", days: 24, kg: 22, base: 55 },
  { name: "Strawberries", color: "#4e9f5d", days: 60, kg: 30, base: 95, berry: true },
  { name: "Microgreens", color: "#a6d86a", days: 10, kg: 14, base: 38 },
] as const;

export type FloorState = "growing" | "ready" | "harvesting" | "empty" | "seeding";

export type Floor = {
  crop: number;
  g: number;
  state: FloorState;
  spectrum: Spectrum;
  hours: number;
  readyFor: number;
};

export type Stage =
  | "drone-out"
  | "sweep"
  | "drop"
  | "lift-down"
  | "convey"
  | "pack"
  | "to-dock"
  | "seed"
  | "lift-up"
  | "plant";

/** Which step of the seed-to-plate journey a stage belongs to. */
export const JOURNEY = ["Seed", "Grow", "Harvest", "Pack", "Deliver"] as const;
export type JourneyStep = (typeof JOURNEY)[number];
const STAGE_STEP: Record<Stage, JourneyStep> = {
  "drone-out": "Harvest",
  sweep: "Harvest",
  drop: "Harvest",
  "lift-down": "Harvest",
  convey: "Pack",
  pack: "Pack",
  "to-dock": "Pack",
  seed: "Seed",
  "lift-up": "Seed",
  plant: "Seed",
};

/* -------------------------------- Helpers --------------------------------- */

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
type V3 = { x: number; y: number; z: number };

/** Move `p` toward `t` at `speed`; returns true once it has arrived. */
function approach(p: V3, t: V3, speed: number, dt: number) {
  const dx = t.x - p.x;
  const dy = t.y - p.y;
  const dz = t.z - p.z;
  const d = Math.hypot(dx, dy, dz);
  const step = speed * dt;
  if (d <= step || d < 1e-4) {
    p.x = t.x;
    p.y = t.y;
    p.z = t.z;
    return true;
  }
  p.x += (dx / d) * step;
  p.y += (dy / d) * step;
  p.z += (dz / d) * step;
  return false;
}

/** Point along an XZ polyline at distance d. */
function alongXZ(path: [number, number][], d: number) {
  let r = d;
  for (let i = 0; i < path.length - 1; i++) {
    const [ax, az] = path[i];
    const [bx, bz] = path[i + 1];
    const len = Math.hypot(bx - ax, bz - az);
    if (r <= len) return { x: ax + ((bx - ax) * r) / len, z: az + ((bz - az) * r) / len, done: false };
    r -= len;
  }
  const [x, z] = path[path.length - 1];
  return { x, z, done: true };
}

export function lightsOn(hour: number, hours: number) {
  // Lights run overnight, when power is cheapest: from 18:00 for `hours` hours.
  const since = (hour - 18 + 24) % 24;
  return since < hours;
}

export function fmtHour(h: number) {
  const hh = Math.floor(h) % 24;
  const mm = Math.floor((h - Math.floor(h)) * 60);
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

export function dayFactor(hour: number) {
  return clamp(Math.sin(((hour - 6) / 12) * Math.PI) * 1.6 + 0.15, 0, 1);
}

const TO_CONVEYOR: [number, number][] = [
  [LIFT_X, 0],
  [PACKER.x, 0],
];
const TO_DOCK: [number, number][] = [
  [PACKER.x, 0],
  [DOCK.x, 0],
  [DOCK.x, DOCK.z - 0.6],
];

/* ------------------------------- Snapshot --------------------------------- */

export type FloorView = {
  name: string;
  color: string;
  g: number;
  state: FloorState;
  spectrum: Spectrum;
  hours: number;
  on: boolean;
  window: string;
  day: number;
  days: number;
  daysLeft: number;
  /** Real seconds until ready at the current recipe. */
  etaSec: number;
  speedPct: number;
  kwhPerKg: number;
  temp: number;
  hum: number;
  co2: number;
  ph: number;
  ec: number;
};

export type Snapshot = {
  hour: number;
  day: number;
  playing: boolean;
  sel: number;
  focus: number | null;
  floors: FloorView[];
  step: JourneyStep;
  busyFloor: number | null;
  stats: { kg: number; crates: number; deliveries: number; seeded: number };
  stack: number;
  van: VanMode;
  solarKw: number;
  loadKw: number;
  log: { time: string; msg: string }[];
};

type VanMode = "docked" | "loading" | "leaving" | "away" | "arriving";

/* -------------------------------- The sim --------------------------------- */

export class FarmSim {
  t = 0;
  hour = 15.25;
  playing = true;
  sel = 1;
  focus: number | null = null;

  floors: Floor[] = CROPS.map((_, i) => ({
    crop: i,
    g: [0.86, 0.5, 0.97, 0.22][i],
    state: "growing" as FloorState,
    spectrum: "pink" as Spectrum,
    hours: [16, 16, 14, 18][i],
    readyFor: 0,
  }));

  drone = { x: HOME.x, y: HOME.y, z: HOME.z, mode: "idle" as "idle" | "busy" | "home", sweepX: 0 };
  lift = { y: 0, cargo: null as null | "crate" | "seed" };
  batch: null | { floor: number; stage: Stage; t: number; d: number; yieldKg: number } = null;
  crate = { x: 0, y: 0, z: 0, visible: false };
  tray = { x: 0, y: 0, z: 0, visible: false };
  packerA = 0;
  seederA = 0;
  stack = 2;
  van = { x: VAN_DOCK_X, mode: "docked" as VanMode, t: 0, v: 0 };
  stats = { kg: 186, crates: 14, deliveries: 3, seeded: 17 };
  log: { time: string; msg: string }[] = [
    { time: "14:52", msg: "Van left for the Abdali market" },
    { time: "14:31", msg: "Floor 2 reseeded with basil" },
  ];

  private listeners = new Set<() => void>();
  private snap: Snapshot;
  private snapAcc = 0;

  constructor() {
    this.snap = this.build();
  }

  /* ---------------------------- Subscription ---------------------------- */

  subscribe = (cb: () => void) => {
    this.listeners.add(cb);
    return () => {
      this.listeners.delete(cb);
    };
  };
  getSnapshot = () => this.snap;
  private emit() {
    this.snap = this.build();
    this.listeners.forEach((l) => l());
  }

  /* ------------------------------ Controls ------------------------------ */

  select(k: number) {
    this.sel = k;
    this.emit();
  }
  setFocus(k: number | null) {
    this.focus = k;
    if (k !== null) this.sel = k;
    this.emit();
  }
  setSpectrum(k: number, s: Spectrum) {
    this.floors[k].spectrum = s;
    this.emit();
  }
  setHours(k: number, h: number) {
    this.floors[k].hours = h;
    this.emit();
  }
  setHour(h: number) {
    this.hour = clamp(h, 0, 23.99);
    this.emit();
  }
  setPlaying(p: boolean) {
    this.playing = p;
    this.emit();
  }
  canHarvest(k: number) {
    const f = this.floors[k];
    return !this.batch && (f.state === "growing" || f.state === "ready") && f.g >= 0.6;
  }
  harvest(k: number) {
    if (!this.canHarvest(k)) return;
    this.startHarvest(k);
    this.emit();
  }

  /* ------------------------------- Model -------------------------------- */

  rate(f: Floor) {
    return (1 / CROPS[f.crop].base) * SPECTRA[f.spectrum].growth;
  }

  private note(msg: string) {
    this.log = [{ time: fmtHour(this.hour), msg }, ...this.log].slice(0, 6);
  }

  private startHarvest(k: number) {
    const f = this.floors[k];
    this.batch = { floor: k, stage: "drone-out", t: 0, d: 0, yieldKg: Math.round(CROPS[f.crop].kg * f.g) };
    this.drone.mode = "busy";
    f.readyFor = 0;
  }

  step(rawDt: number) {
    if (!this.playing) return;
    const dt = Math.min(rawDt, 0.1);
    this.t += dt;
    this.hour = (this.hour + dt * 0.2) % 24; // a day every two minutes

    this.floors.forEach((f, k) => {
      if ((f.state === "growing" || f.state === "ready") && lightsOn(this.hour, f.hours)) {
        f.g = Math.min(1, f.g + this.rate(f) * dt);
      }
      if (f.state === "growing" && f.g >= 1) {
        f.state = "ready";
        this.note(`Floor ${k + 1} ${CROPS[f.crop].name.toLowerCase()} ready to harvest`);
      }
      if (f.state === "ready") {
        f.readyFor += dt;
        if (!this.batch && f.readyFor > 2.5) this.startHarvest(k);
      }
    });

    this.stepBatch(dt);
    this.stepDrone(dt);
    this.stepVan(dt);

    this.snapAcc += dt;
    if (this.snapAcc > 0.2) {
      this.snapAcc = 0;
      this.emit();
    }
  }

  private liftTo(y: number, dt: number) {
    const d = y - this.lift.y;
    const s = 2.4 * dt;
    if (Math.abs(d) <= s) {
      this.lift.y = y;
      return true;
    }
    this.lift.y += Math.sign(d) * s;
    return false;
  }

  private stepBatch(dt: number) {
    const b = this.batch;
    if (!b) {
      this.liftTo(0, dt);
      this.packerA *= 0.92;
      this.seederA *= 0.92;
      return;
    }
    const f = this.floors[b.floor];
    const fy = b.floor * FH;
    b.t += dt;
    const go = (stage: Stage) => {
      b.stage = stage;
      b.t = 0;
      b.d = 0;
    };

    switch (b.stage) {
      case "drone-out":
        this.liftTo(fy + SLAB, dt);
        if (approach(this.drone, { x: TOWER.x1 + 0.4, y: fy + 1.45, z: TOWER.z1 + 0.85 }, 6, dt)) {
          f.state = "harvesting";
          this.drone.sweepX = TOWER.x1 + 0.4;
          go("sweep");
        }
        break;
      case "sweep":
        this.liftTo(fy + SLAB, dt);
        this.drone.sweepX -= 2.8 * dt;
        this.drone.x = this.drone.sweepX;
        this.drone.y = fy + 1.45 + Math.sin(this.t * 6) * 0.04;
        if (this.drone.sweepX < TOWER.x0 + 0.2) {
          f.state = "empty";
          f.g = 0;
          this.stats.kg += b.yieldKg;
          this.note(`Floor ${b.floor + 1} ${CROPS[f.crop].name.toLowerCase()} harvested · ${b.yieldKg} kg`);
          go("drop");
        }
        break;
      case "drop": {
        const lifted = this.liftTo(fy + SLAB, dt);
        if (approach(this.drone, { x: LIFT_X, y: fy + 1.7, z: 1.5 }, 7, dt) && lifted) {
          this.lift.cargo = "crate";
          this.drone.mode = "home";
          go("lift-down");
        }
        break;
      }
      case "lift-down":
        if (this.liftTo(0, dt)) {
          this.lift.cargo = null;
          go("convey");
        }
        break;
      case "convey": {
        b.d += 2.2 * dt;
        const p = alongXZ(TO_CONVEYOR, b.d);
        Object.assign(this.crate, { x: p.x, y: CONVEYOR_Y, z: p.z, visible: true });
        if (p.done) go("pack");
        break;
      }
      case "pack":
        this.packerA = Math.sin(Math.min(1, b.t / 1.6) * Math.PI);
        this.crate.y = CONVEYOR_Y + this.packerA * 0.12;
        if (b.t > 1.6) go("to-dock");
        break;
      case "to-dock": {
        b.d += 2.2 * dt;
        const p = alongXZ(TO_DOCK, b.d);
        Object.assign(this.crate, { x: p.x, y: CONVEYOR_Y, z: p.z });
        if (p.done) {
          this.crate.visible = false;
          this.stack = Math.min(6, this.stack + 1);
          this.stats.crates += 1;
          this.note(`Crate packed and labelled for delivery`);
          go("seed");
        }
        break;
      }
      case "seed":
        this.seederA = Math.sin(Math.min(1, b.t / 1.4) * Math.PI);
        if (b.t > 1.4) {
          this.lift.cargo = "seed";
          f.state = "seeding";
          go("lift-up");
        }
        break;
      case "lift-up":
        if (this.liftTo(fy + SLAB, dt)) go("plant");
        break;
      case "plant": {
        const p = Math.min(1, b.t / 1.1);
        this.lift.cargo = null;
        Object.assign(this.tray, { x: LIFT_X - p * 6, y: fy + SLAB + 0.32, z: 0, visible: p < 1 });
        if (p >= 1) {
          this.tray.visible = false;
          f.state = "growing";
          f.g = 0.03;
          this.stats.seeded += 1;
          this.note(`Floor ${b.floor + 1} reseeded with ${CROPS[f.crop].name.toLowerCase()}`);
          this.batch = null;
        }
        break;
      }
    }
  }

  private stepDrone(dt: number) {
    const d = this.drone;
    if (d.mode === "home") {
      if (approach(d, HOME, 5, dt)) d.mode = "idle";
    } else if (d.mode === "idle") {
      d.y = HOME.y + Math.sin(this.t * 2) * 0.06;
    }
  }

  private stepVan(dt: number) {
    const v = this.van;
    v.t += dt;
    switch (v.mode) {
      case "docked":
        if (this.stack >= 3) {
          v.mode = "loading";
          v.t = 0;
        }
        break;
      case "loading":
        if (v.t > 2) {
          this.stack -= 3;
          v.mode = "leaving";
          v.t = 0;
          v.v = 0;
          this.note("Van left for the Abdali market");
        }
        break;
      case "leaving":
        v.v = Math.min(9, v.v + 3 * dt);
        v.x += v.v * dt;
        if (v.x > 34) {
          v.mode = "away";
          v.t = 0;
          this.stats.deliveries += 1;
        }
        break;
      case "away":
        if (v.t > 6) {
          v.mode = "arriving";
          v.x = -34;
          v.t = 0;
        }
        break;
      case "arriving": {
        const rem = VAN_DOCK_X - v.x;
        v.x += Math.max(0.6, Math.min(9, rem * 0.9)) * dt;
        if (rem < 0.02) {
          v.x = VAN_DOCK_X;
          v.mode = "docked";
          v.t = 0;
        }
        break;
      }
    }
  }

  /* ------------------------------ Snapshot ------------------------------ */

  private build(): Snapshot {
    const day = dayFactor(this.hour);
    const floors = this.floors.map((f, k): FloorView => {
      const c = CROPS[f.crop];
      const sp = SPECTRA[f.spectrum];
      const on = lightsOn(this.hour, f.hours);
      const rate = this.rate(f) * (f.hours / 24);
      const end = (18 + f.hours) % 24;
      const wobble = Math.sin(this.t * 0.3 + k) * 0.15;
      return {
        name: c.name,
        color: c.color,
        g: f.g,
        state: f.state,
        spectrum: f.spectrum,
        hours: f.hours,
        on,
        window: `${fmtHour(18)} → ${fmtHour(end)}`,
        day: Math.max(1, Math.round(f.g * c.days)),
        days: c.days,
        daysLeft: Math.max(0, Math.ceil((1 - f.g) * c.days)),
        etaSec: f.state === "growing" ? (1 - f.g) / rate : 0,
        speedPct: Math.round(sp.growth * (f.hours / 16) * 100),
        kwhPerKg: 9.4 * (sp.energy / sp.growth) * (1 + (f.hours - 16) * 0.02),
        temp: 21.2 + k * 0.5 + sp.heat + (on ? 0.6 : -0.4) + wobble,
        hum: 64 + k * 3 + (on ? 2 : 0) - sp.heat * 2,
        co2: Math.round(880 + k * 30 + (on ? 140 : 0)),
        ph: 5.8 + k * 0.05,
        ec: 1.6 + k * 0.15,
      };
    });
    const lit = this.floors.filter((f) => lightsOn(this.hour, f.hours));
    const loadKw = 18 + lit.reduce((s, f) => s + 42 * SPECTRA[f.spectrum].energy, 0);
    return {
      hour: this.hour,
      day,
      playing: this.playing,
      sel: this.sel,
      focus: this.focus,
      floors,
      step: this.batch ? STAGE_STEP[this.batch.stage] : this.van.mode === "loading" || this.van.mode === "leaving" ? "Deliver" : "Grow",
      busyFloor: this.batch?.floor ?? null,
      stats: { ...this.stats },
      stack: this.stack,
      van: this.van.mode,
      solarKw: Math.round(Math.max(0, Math.sin(((this.hour - 6) / 12) * Math.PI)) * 96),
      loadKw: Math.round(loadKw),
      log: this.log,
    };
  }
}
