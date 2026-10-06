"use client";

import { ArrowLeft, Moon, PackageCheck, Pause, Play, Scissors, Search, Sprout, Sun, Truck, ZoomIn } from "lucide-react";
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from "motion/react";
import dynamic from "next/dynamic";
import { Bricolage_Grotesque, IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import { useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { AnchorSink } from "./scene";
import { FarmSim, JOURNEY, SPECTRA, fmtHour, type JourneyStep, type Snapshot, type Spectrum } from "./sim";

const FarmCanvas = dynamic(() => import("./scene"), { ssr: false });

const display = Bricolage_Grotesque({ subsets: ["latin"], weight: ["600", "700", "800"], variable: "--cf-display" });
const sans = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--cf-sans" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--cf-mono" });

const EASE = [0.22, 1, 0.36, 1] as const;

function subscribeWide(cb: () => void) {
  const mq = window.matchMedia("(min-width: 1024px)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}
function useIsWide() {
  return useSyncExternalStore<boolean | null>(
    subscribeWide,
    () => window.matchMedia("(min-width: 1024px)").matches,
    () => null,
  );
}

/** DOM labels pinned to 3D anchors; positions arrive every frame from the scene. */
class Anchors implements AnchorSink {
  private els = new Map<string, HTMLElement>();
  private pos = new Map<string, [number, number, boolean]>();
  bind = (key: string) => (el: HTMLElement | null) => {
    if (el) this.els.set(key, el);
    else this.els.delete(key);
  };
  set = (key: string, x: number, y: number, visible: boolean) => {
    this.pos.set(key, [x, y, visible]);
  };
  flush = () => {
    this.els.forEach((el, key) => {
      const p = this.pos.get(key);
      if (!p) return;
      const dx = el.dataset.align === "left" ? "-100%" : "-50%";
      el.style.transform = `translate(${p[0].toFixed(1)}px, ${p[1].toFixed(1)}px) translate(${dx}, -50%)`;
      el.style.visibility = p[2] ? "visible" : "hidden";
    });
  };
}

const TAG_STATE = { growing: "", ready: "ready", harvesting: "harvesting", empty: "empty", seeding: "seeding" } as const;

function TagLayer({ snap, sim, anchors }: { snap: Snapshot; sim: FarmSim; anchors: Anchors }) {
  const hidden = { visibility: "hidden" as const };
  if (snap.focus === null) {
    return (
      <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
        {snap.floors.map((fl, k) => (
          <button
            key={k}
            type="button"
            ref={anchors.bind(`f${k}`)}
            data-align="left"
            style={hidden}
            onClick={() => sim.setFocus(k)}
            className={cn(
              "pointer-events-auto absolute top-0 left-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap shadow-sm transition-colors",
              k === snap.sel ? "border-[#141b2b] bg-[#141b2b] text-white" : "border-[#dce2ec] bg-white/95 hover:border-[#141b2b]",
            )}
          >
            F{k + 1}<span className="hidden sm:inline"> · {fl.name}</span> · {fl.state === "growing" ? `${Math.round(fl.g * 100)}%` : TAG_STATE[fl.state]}
          </button>
        ))}
      </div>
    );
  }
  const fl = snap.floors[snap.focus];
  const tags: [string, string][] = [
    ["Air", `${fl.temp.toFixed(1)} °C · ${Math.round(fl.hum)}% RH`],
    ["CO₂", `${fl.co2} ppm`],
    ["Nutrient water", `pH ${fl.ph.toFixed(1)} · EC ${fl.ec.toFixed(1)}`],
    ["LED", fl.on ? `${SPECTRA[fl.spectrum].nm} · on` : "Off until 18:00"],
  ];
  return (
    <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
      {tags.map(([k, v], i) => (
        <div
          key={k}
          ref={anchors.bind(`s${i}`)}
          style={hidden}
          className="absolute top-0 left-0 rounded-lg border border-[#dce2ec] bg-white/95 px-2 py-1 whitespace-nowrap shadow-sm"
        >
          <div className="text-[9.5px] font-medium tracking-[0.08em] text-[#5b677d] uppercase">{k}</div>
          <div className="font-[family-name:var(--cf-mono)] text-[11.5px]">{v}</div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------ Primitives ------------------------------ */

function Card({ className, children, delay = 0 }: { className?: string; children: ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE, delay }}
      className={cn(
        "rounded-2xl border border-[#dce2ec] bg-white/92 shadow-[0_12px_32px_-20px_rgba(20,27,43,0.45)] backdrop-blur-md",
        className,
      )}
    >
      {children}
    </motion.div>
  );
}

const Kicker = ({ children }: { children: ReactNode }) => (
  <div className="font-[family-name:var(--cf-mono)] text-[10.5px] tracking-[0.1em] text-[#5b677d] uppercase">{children}</div>
);

function Mark() {
  return (
    <span className="grid size-7 place-items-center rounded-lg bg-[#2e9e5b] text-white">
      <Sprout className="size-4" strokeWidth={2.2} />
    </span>
  );
}

/* -------------------------------- Top bar ------------------------------- */

function TopBar({ snap }: { snap: Snapshot }) {
  const night = snap.day < 0.35;
  return (
    <Card className="flex min-w-0 items-center gap-3 px-3 py-2 sm:gap-4">
      <div className="flex items-center gap-2 font-[family-name:var(--cf-display)] text-[17px] font-bold whitespace-nowrap">
        <Mark />
        Canopy
      </div>
      <div className="hidden min-w-0 flex-1 items-center gap-2 truncate rounded-lg border border-[#dce2ec] bg-[#f8fafc] px-2.5 py-1.5 text-[13px] text-[#5b677d] md:flex">
        <Search className="size-3.5 shrink-0" />
        <span className="truncate">Search floors, crops, sensors</span>
      </div>
      <div className="ml-auto hidden rounded-full border border-[#dce2ec] bg-white px-2.5 py-1 font-[family-name:var(--cf-mono)] text-[11.5px] whitespace-nowrap sm:block md:ml-0">
        Tower 2 · Amman
      </div>
      <div className="ml-auto flex items-center gap-1.5 font-[family-name:var(--cf-mono)] text-[12px] whitespace-nowrap text-[#0e9f6e] sm:ml-0">
        {night ? <Moon className="size-3.5 text-[#5b6fa8]" /> : <Sun className="size-3.5 text-[#f5a524]" />}
        {fmtHour(snap.hour)}
      </div>
      <div className="hidden items-center gap-2 whitespace-nowrap lg:flex">
        <span className="grid size-[30px] place-items-center rounded-full bg-[#141b2b] font-[family-name:var(--cf-mono)] text-[11px] text-white">MQ</span>
        <span>
          <b className="block text-[13px] leading-tight">Mikdam Q.</b>
          <small className="block text-[11px] text-[#5b677d]">Grow Manager</small>
        </span>
      </div>
    </Card>
  );
}

/* --------------------------------- Stats -------------------------------- */

const VAN_TEXT: Record<Snapshot["van"], string> = {
  docked: "Van at the dock",
  loading: "Loading the van",
  leaving: "On the way to market",
  away: "Delivering in town",
  arriving: "Van returning",
};

function Stats({ snap }: { snap: Snapshot }) {
  const solarShare = Math.min(100, Math.round((snap.solarKw / snap.loadKw) * 100));
  const items = [
    { k: "Harvested today", v: `${snap.stats.kg} kg`, s: `${snap.stats.crates} crates packed`, c: "text-[#0e9f6e]" },
    { k: "Solar covers", v: `${solarShare}%`, s: `Solar ${snap.solarKw} kW · uses ${snap.loadKw} kW`, c: snap.solarKw > 0 ? "text-[#b76e00]" : "text-[#5b677d]" },
    { k: "Deliveries today", v: `${snap.stats.deliveries}`, s: VAN_TEXT[snap.van], c: "text-[#2f5bea]" },
  ];
  return (
    <div className="grid grid-cols-3 gap-2 lg:flex lg:gap-2.5">
      {items.map((it, i) => (
        <Card key={it.k} delay={0.05 * i} className="min-w-0 px-3 py-2.5 lg:min-w-[158px] lg:px-3.5">
          <div className="text-[11px] leading-tight text-[#5b677d] lg:truncate lg:text-[11.5px]">{it.k}</div>
          <div className="font-[family-name:var(--cf-display)] text-[19px] leading-tight font-bold tabular-nums lg:text-[24px]">{it.v}</div>
          <div className={cn("line-clamp-2 font-[family-name:var(--cf-mono)] text-[10.5px] leading-snug lg:truncate", it.c)}>{it.s}</div>
        </Card>
      ))}
    </div>
  );
}

/* ------------------------------ Floor panel ----------------------------- */

const STATE_PILL: Record<Snapshot["floors"][number]["state"], [string, string]> = {
  growing: ["Growing", "bg-[#ddf4ea] text-[#086b4a]"],
  ready: ["Ready", "bg-[#fff1d6] text-[#8a5300]"],
  harvesting: ["Harvesting", "bg-[#e3ebff] text-[#2f5bea]"],
  empty: ["Empty", "bg-[#eef1f6] text-[#5b677d]"],
  seeding: ["Seeding", "bg-[#e3ebff] text-[#2f5bea]"],
};

function FloorPanel({ snap, sim, reduce }: { snap: Snapshot; sim: FarmSim; reduce: boolean }) {
  const k = snap.sel;
  const f = snap.floors[k];
  const sp = SPECTRA[f.spectrum];
  const canHarvest = snap.busyFloor === null && (f.state === "growing" || f.state === "ready") && f.g >= 0.6;
  const zoomed = snap.focus === k;
  const [pill, pillCls] = STATE_PILL[f.state];
  return (
    <Card delay={0.1} className="flex min-w-0 flex-col gap-3.5 p-3.5">
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Floor">
        {snap.floors.map((fl, i) => (
          <button
            key={i}
            type="button"
            aria-pressed={i === k}
            onClick={() => (snap.focus === null ? sim.select(i) : sim.setFocus(i))}
            className={cn(
              "rounded-full border px-2.5 py-1 text-[12px] font-medium transition-colors",
              i === k ? "border-[#141b2b] bg-[#141b2b] text-white" : "border-[#dce2ec] bg-white hover:border-[#141b2b]",
            )}
          >
            Floor {i + 1}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={k}
          initial={{ opacity: 0, x: reduce ? 0 : 8 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: reduce ? 0 : -8 }}
          transition={{ duration: 0.25, ease: EASE }}
          className="flex flex-col gap-3.5"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <Kicker>Floor {k + 1}</Kicker>
              <div className="font-[family-name:var(--cf-display)] text-[22px] leading-tight font-bold">{f.name}</div>
            </div>
            <span className={cn("mt-1 rounded-full px-2 py-0.5 font-[family-name:var(--cf-mono)] text-[11px]", pillCls)}>{pill}</span>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-[12.5px]">
              <span className="text-[#5b677d]">
                {f.state === "ready" ? "Ready to harvest" : f.state === "growing" ? `Day ${f.day} of ${f.days}` : pill}
              </span>
              <span className="font-[family-name:var(--cf-mono)] tabular-nums">
                {f.state === "growing" ? `${f.daysLeft} days left` : `${Math.round(f.g * 100)}%`}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[#e9edf4]">
              <motion.div
                className="h-full rounded-full"
                style={{ background: f.color }}
                animate={{ width: `${Math.max(2, f.g * 100)}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 border-t border-dashed border-[#dce2ec] pt-3">
            <Kicker>Light recipe</Kicker>
            <div className="grid grid-cols-3 gap-1.5" role="group" aria-label="LED spectrum">
              {(Object.keys(SPECTRA) as Spectrum[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  aria-pressed={f.spectrum === s}
                  onClick={() => sim.setSpectrum(k, s)}
                  className={cn(
                    "flex min-w-0 flex-col items-start gap-1 rounded-xl border px-2 py-1.5 text-left transition-colors",
                    f.spectrum === s ? "border-[#141b2b] bg-[#f4f6fa]" : "border-[#dce2ec] bg-white hover:border-[#8c97ab]",
                  )}
                >
                  <span className="h-1.5 w-full rounded-full" style={{ background: SPECTRA[s].color, boxShadow: `0 0 10px ${SPECTRA[s].color}` }} />
                  <span className="truncate text-[11.5px] font-semibold">{SPECTRA[s].label}</span>
                  <span className="truncate font-[family-name:var(--cf-mono)] text-[9.5px] text-[#5b677d]">{SPECTRA[s].nm}</span>
                </button>
              ))}
            </div>
            <label htmlFor="cf-hours" className="mt-1 flex items-baseline justify-between text-[12.5px]">
              <span>
                Lights on <b className="font-[family-name:var(--cf-mono)] font-medium">{f.hours} h</b>
              </span>
              <span className="font-[family-name:var(--cf-mono)] text-[11px] text-[#5b677d]">
                {f.window} · {f.on ? "on now" : "off now"}
              </span>
            </label>
            <input
              id="cf-hours"
              type="range"
              min={10}
              max={22}
              step={1}
              value={f.hours}
              onChange={(e) => sim.setHours(k, Number(e.target.value))}
              className="w-full accent-[#2e9e5b]"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              ["Growth speed", `${f.speedPct}%`, f.speedPct >= 100 ? "text-[#0e9f6e]" : "text-[#b76e00]"],
              ["Energy / kg", `${f.kwhPerKg.toFixed(1)} kWh`, f.kwhPerKg <= 9.6 ? "text-[#0e9f6e]" : "text-[#b76e00]"],
              ["Air", `${f.temp.toFixed(1)} °C`, "text-[#141b2b]"],
            ].map(([a, b, c]) => (
              <div key={a} className="min-w-0 rounded-xl bg-[#f4f6fa] px-2 py-1.5">
                <div className="truncate text-[10.5px] text-[#5b677d]">{a}</div>
                <div className={cn("truncate font-[family-name:var(--cf-mono)] text-[13px] font-medium tabular-nums", c)}>{b}</div>
              </div>
            ))}
          </div>
          <p className="-mt-1 text-[11.5px] leading-snug text-[#5b677d]">
            {sp.label} light: {f.spectrum === "pink" ? "fastest growth per kWh." : f.spectrum === "white" ? "easier for staff to see, uses more power." : "compact, sturdy plants, grows slower."}
          </p>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => sim.setFocus(zoomed ? null : k)}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-[#dce2ec] bg-white px-3 py-2 text-[13px] font-semibold transition-colors hover:border-[#141b2b]"
            >
              {zoomed ? <ArrowLeft className="size-4" /> : <ZoomIn className="size-4" />}
              {zoomed ? "Back to tower" : "Zoom in"}
            </button>
            <button
              type="button"
              disabled={!canHarvest}
              onClick={() => sim.harvest(k)}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-[#141b2b] px-3 py-2 text-[13px] font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Scissors className="size-4" />
              {snap.busyFloor === k ? "Harvesting…" : snap.busyFloor !== null ? "Line busy" : f.g < 0.6 ? "Too early" : "Harvest now"}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </Card>
  );
}

/* -------------------------------- Journey ------------------------------- */

const STEP_ICON: Record<JourneyStep, typeof Sprout> = {
  Seed: Sprout,
  Grow: Sun,
  Harvest: Scissors,
  Pack: PackageCheck,
  Deliver: Truck,
};

function Journey({ snap }: { snap: Snapshot }) {
  const counts: Record<JourneyStep, string> = {
    Seed: `${snap.stats.seeded} trays`,
    Grow: `${snap.floors.filter((f) => f.state === "growing" || f.state === "ready").length} floors`,
    Harvest: `${snap.stats.kg} kg`,
    Pack: `${snap.stats.crates} crates`,
    Deliver: `${snap.stats.deliveries} runs`,
  };
  return (
    <Card delay={0.15} className="flex min-w-0 flex-col gap-3 p-3.5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <b className="text-[13.5px]">Seed to plate</b>
        <span className="font-[family-name:var(--cf-mono)] text-[11px] text-[#5b677d]">
          {snap.busyFloor !== null ? `Floor ${snap.busyFloor + 1} in the line` : `${snap.stack} crates at the dock`}
        </span>
      </div>
      <ol className="grid grid-cols-5 gap-1">
        {JOURNEY.map((s, i) => {
          const Icon = STEP_ICON[s];
          const active = snap.step === s;
          return (
            <li key={s} className="relative flex flex-col items-center gap-1 text-center">
              {i < JOURNEY.length - 1 && <span className="absolute top-[17px] left-[calc(50%+20px)] h-0.5 w-[calc(100%-40px)] bg-[#dce2ec]" />}
              <span
                className={cn(
                  "relative grid size-[34px] place-items-center rounded-full transition-colors",
                  active ? "bg-[#2e9e5b] text-white shadow-[0_0_0_5px_rgba(46,158,91,0.18)]" : "bg-[#eef1f6] text-[#5b677d]",
                )}
              >
                <Icon className="size-4" />
              </span>
              <span className={cn("text-[12px] font-semibold", active ? "text-[#141b2b]" : "text-[#5b677d]")}>{s}</span>
              <span className="font-[family-name:var(--cf-mono)] text-[10.5px] text-[#5b677d] tabular-nums">{counts[s]}</span>
            </li>
          );
        })}
      </ol>
      <ul className="flex flex-col gap-1 border-t border-dashed border-[#dce2ec] pt-2.5">
        <AnimatePresence initial={false}>
          {snap.log.slice(0, 3).map((l) => (
            <motion.li
              key={l.time + l.msg}
              layout
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex gap-2.5 text-[12px]"
            >
              <span className="font-[family-name:var(--cf-mono)] text-[#5b677d]">{l.time}</span>
              <span className="min-w-0 truncate">{l.msg}</span>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </Card>
  );
}

/* --------------------------------- Clock -------------------------------- */

function Clock({ snap, sim }: { snap: Snapshot; sim: FarmSim }) {
  const night = snap.day < 0.35;
  const lit = snap.floors.filter((f) => f.on).length;
  return (
    <Card delay={0.2} className="flex min-w-0 flex-col gap-2.5 p-3.5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <Kicker>{night ? "Night shift" : "Day shift"}</Kicker>
          <div className="flex items-center gap-2 font-[family-name:var(--cf-display)] text-[30px] leading-none font-bold tabular-nums">
            {night ? <Moon className="size-5 text-[#5b6fa8]" /> : <Sun className="size-5 text-[#f5a524]" />}
            {fmtHour(snap.hour)}
          </div>
        </div>
        <button
          type="button"
          aria-pressed={snap.playing}
          onClick={() => sim.setPlaying(!snap.playing)}
          className={cn(
            "flex items-center gap-1.5 rounded-xl px-3 py-2 text-[13px] font-semibold transition-colors",
            snap.playing ? "bg-[#2e9e5b] text-white" : "border border-[#dce2ec] bg-white",
          )}
        >
          {snap.playing ? <Pause className="size-4" /> : <Play className="size-4" />}
          {snap.playing ? "Pause" : "Play"}
        </button>
      </div>
      <input
        type="range"
        min={0}
        max={23.75}
        step={0.25}
        value={snap.hour}
        aria-label="Time of day"
        onChange={(e) => sim.setHour(Number(e.target.value))}
        className="w-full accent-[#2e9e5b]"
      />
      <div className="flex justify-between font-[family-name:var(--cf-mono)] text-[10.5px] text-[#5b677d]">
        <span>00:00</span>
        <span>06:00</span>
        <span>12:00</span>
        <span>18:00</span>
        <span>24:00</span>
      </div>
      <p className="text-[11.5px] leading-snug text-[#5b677d]">
        {lit} of 4 floors lit. LEDs run overnight when power is cheapest; the solar roof covers the day.
      </p>
    </Card>
  );
}

/* --------------------------------- Page --------------------------------- */

export default function CanopyFarm() {
  const reduce = useReducedMotion() ?? false;
  const [sim] = useState(() => new FarmSim());
  const [anchors] = useState(() => new Anchors());
  const snap = useSyncExternalStore(sim.subscribe, sim.getSnapshot, sim.getSnapshot);
  const wide = useIsWide();

  useEffect(() => {
    if (reduce) sim.setPlaying(false);
  }, [reduce, sim]);

  const zoomed = snap.focus !== null;

  return (
    <MotionConfig reducedMotion="user">
      <div
        className={cn(
          display.variable,
          sans.variable,
          mono.variable,
          "relative w-full overflow-x-hidden bg-[#e8eef4] font-[family-name:var(--cf-sans)] text-[#141b2b] lg:h-svh lg:min-h-[740px] lg:overflow-hidden",
        )}
      >
        <div className="relative h-[60svh] min-h-[360px] lg:absolute lg:inset-0 lg:h-auto">
          {wide !== null && <FarmCanvas sim={sim} reduce={reduce} compact={!wide} anchors={anchors} />}
          <TagLayer snap={snap} sim={sim} anchors={anchors} />

          <div className="pointer-events-none absolute inset-x-3 top-3 z-30 lg:inset-x-4 lg:top-4 [&>*]:pointer-events-auto">
            <TopBar snap={snap} />
          </div>

          <AnimatePresence>
            {zoomed && (
              <motion.button
                type="button"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                onClick={() => sim.setFocus(null)}
                className="absolute bottom-3 left-3 z-30 flex items-center gap-1.5 rounded-full bg-[#141b2b] px-3.5 py-2 text-[13px] font-semibold text-white shadow-lg lg:bottom-auto lg:left-1/2 lg:top-[92px] lg:-translate-x-1/2"
              >
                <ArrowLeft className="size-4" />
                Back to tower
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {wide ? (
          <>
            <div className="absolute top-[84px] left-4 z-30">
              <Stats snap={snap} />
            </div>
            <div className="absolute top-[84px] right-4 bottom-4 z-30 flex w-[340px] flex-col gap-3 overflow-y-auto">
              <FloorPanel snap={snap} sim={sim} reduce={reduce} />
              <Clock snap={snap} sim={sim} />
            </div>
            <div className="absolute bottom-4 left-4 z-30 w-[min(560px,calc(100%-388px))]">
              <Journey snap={snap} />
            </div>
          </>
        ) : (
          <div className="flex flex-col gap-3 border-t border-[#dce2ec] bg-[#f1f4f8] p-3">
            <Stats snap={snap} />
            <FloorPanel snap={snap} sim={sim} reduce={reduce} />
            <Journey snap={snap} />
            <Clock snap={snap} sim={sim} />
          </div>
        )}
      </div>
    </MotionConfig>
  );
}
