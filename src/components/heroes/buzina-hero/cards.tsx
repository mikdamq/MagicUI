"use client";

import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useTransform,
} from "motion/react";
import {
  Bell,
  BellOff,
  ChevronDown,
  CircleCheck,
  Lightbulb,
  Pause,
  Play,
  Sun,
  Volume2,
  VolumeX,
  Wind,
} from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const shell =
  "rounded-[22px] border border-neutral-100 bg-white p-2.5 shadow-[0_1px_2px_rgba(16,24,40,.04),0_12px_32px_-8px_rgba(80,70,140,.14),0_30px_60px_-20px_rgba(120,110,200,.18)]";

const panel = "rounded-2xl border border-neutral-100 bg-[#f8f8fa]";

const pill =
  "flex items-center gap-1 rounded-lg border border-neutral-200 bg-white px-2 py-1 text-[12px] text-neutral-500 transition-colors hover:border-neutral-300 hover:text-neutral-800";

/* ------------------------------------------------------------------ */
/* Team wellness pulse                                                 */
/* ------------------------------------------------------------------ */

const PULSE = { Week: 68, Month: 74 } as const;

export function WellnessCard() {
  const [range, setRange] = useState<keyof typeof PULSE>("Week");
  const value = useMotionValue(0);
  const display = useTransform(value, (v) => Math.round(v));

  useEffect(() => {
    const controls = animate(value, PULSE[range], {
      duration: 1.4,
      ease: [0.22, 1, 0.36, 1],
    });
    return () => controls.stop();
  }, [range, value]);

  return (
    <div className={shell}>
      <div className="flex items-center justify-between px-2 pt-1 pb-2.5">
        <div className="flex items-center gap-2 text-[15px] font-medium tracking-tight text-neutral-900">
          <Sun className="size-4" strokeWidth={1.75} />
          Team wellness pulse
        </div>
        <button
          type="button"
          className={pill}
          onClick={() => setRange((r) => (r === "Week" ? "Month" : "Week"))}
        >
          {range}
          <ChevronDown className="size-3" />
        </button>
      </div>
      <div className={cn(panel, "px-4 pt-4 pb-3")}>
        <div className="flex items-start justify-between">
          <p className="flex items-baseline gap-1">
            <motion.span className="text-[40px] leading-none font-semibold tracking-[-0.04em] text-neutral-950 tabular-nums">
              {display}
            </motion.span>
            <span className="text-[22px] font-light tracking-tight text-neutral-300">
              / 100%
            </span>
          </p>
          <Lightbulb className="mt-1 size-4 text-neutral-400" strokeWidth={1.5} />
        </div>
        <p className="mt-2 text-[14px] tracking-tight text-neutral-800">
          team is primed for success
        </p>
        <div className="mt-4 flex h-10 gap-1.5">
          <motion.div
            className="rounded-lg"
            initial={{ width: "0%" }}
            animate={{ width: `${PULSE[range]}%` }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
            style={{
              background:
                "repeating-linear-gradient(-55deg, #a99af5 0 3px, #bdb1f8 3px 6px)",
            }}
          />
          <div
            className="flex-1 rounded-lg"
            style={{
              background:
                "repeating-linear-gradient(-55deg, #e4e4ea 0 3px, #f1f1f4 3px 6px)",
            }}
          />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Insights                                                            */
/* ------------------------------------------------------------------ */

const TIPS = [
  "Start meetings with 60 seconds of shared silence.",
  "Boost focus: 2-min team check-ins. Share wins, align goals daily.",
  "Block a no-meeting hour after lunch for deep work.",
  "Try box breathing before high-stakes reviews.",
  "Close the week with three gratitudes in the team channel.",
  "Walk-and-talk one-on-ones reset tired minds.",
];

export function InsightsCard() {
  const [index, setIndex] = useState(1);
  const next = () => setIndex((i) => (i + 1) % TIPS.length);

  return (
    <div className={shell}>
      <div className="flex items-center justify-between px-2 pt-1 pb-3">
        <div className="flex items-center gap-2 text-[15px] font-medium tracking-tight text-neutral-900">
          <Lightbulb className="size-4" strokeWidth={1.75} />
          Insights
        </div>
        <span className="text-[13px] text-neutral-500 tabular-nums">
          {index + 1}/{TIPS.length}
        </span>
      </div>

      <div className="relative pt-2">
        <div className="absolute inset-x-5 top-0 h-6 rounded-t-2xl bg-[#fbe9f4]" />
        <div className="absolute inset-x-2.5 top-1 h-6 rounded-t-2xl bg-[#f9e0ef]" />
        <button
          type="button"
          onClick={next}
          aria-label="Next insight"
          className="relative flex h-[212px] w-full flex-col items-center justify-center overflow-hidden rounded-2xl bg-[#f7d9ec] px-6 text-center"
        >
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={index}
              className="flex flex-col items-center"
              initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -24, filter: "blur(6px)" }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <Wind className="size-7 text-neutral-700" strokeWidth={1.25} />
              <p className="mt-3 text-[15px] leading-snug font-medium tracking-tight text-neutral-800">
                {TIPS[index]}
              </p>
              <p className="mt-2 text-[11px] text-neutral-400">Pause and reflect</p>
            </motion.div>
          </AnimatePresence>
          <span className="absolute bottom-3 flex gap-1">
            {[0, 1, 2].map((d) => (
              <span
                key={d}
                className={cn(
                  "size-1 rounded-full transition-colors",
                  d === index % 3 ? "bg-neutral-500" : "bg-neutral-300",
                )}
              />
            ))}
          </span>
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Productivity peaks                                                  */
/* ------------------------------------------------------------------ */

const SCALLOP = (() => {
  const pts: string[] = [];
  for (let i = 0; i <= 120; i++) {
    const a = (i / 120) * Math.PI * 2;
    const r = 15 + 1.4 * Math.cos(a * 9);
    pts.push(`${(16 + r * Math.cos(a)).toFixed(2)} ${(16 + r * Math.sin(a)).toFixed(2)}`);
  }
  return `M${pts.join("L")}Z`;
})();

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = {
  Feb: [6, 9, 11, 12, 20, 25],
  Mar: [3, 4, 10, 17, 18, 24],
} as const;

export function CalendarCard() {
  const [month, setMonth] = useState<keyof typeof MONTHS>("Feb");
  const [peaks, setPeaks] = useState<Set<number>>(() => new Set(MONTHS.Feb));

  const switchMonth = () => {
    const m = month === "Feb" ? "Mar" : "Feb";
    setMonth(m);
    setPeaks(new Set(MONTHS[m]));
  };

  const toggle = (d: number) =>
    setPeaks((prev) => {
      const s = new Set(prev);
      if (s.has(d)) s.delete(d);
      else s.add(d);
      return s;
    });

  return (
    <div className={shell}>
      <div className="flex items-center justify-between px-2 pt-1 pb-2.5">
        <div className="flex items-center gap-2 text-[15px] font-medium tracking-tight text-neutral-900">
          <CircleCheck className="size-4" strokeWidth={1.75} />
          Productivity peaks
        </div>
        <button type="button" className={pill} onClick={switchMonth}>
          {month}
          <ChevronDown className="size-3" />
        </button>
      </div>
      <div className={cn(panel, "grid grid-cols-7 gap-y-1 px-2 py-3")}>
        {DAYS.map((d) => (
          <span key={d} className="pb-1 text-center text-[11px] text-neutral-400">
            {d}
          </span>
        ))}
        {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => {
          const on = peaks.has(d);
          return (
            <button
              type="button"
              key={`${month}-${d}`}
              onClick={() => toggle(d)}
              aria-pressed={on}
              className="group relative mx-auto grid size-8 place-items-center text-[13px] tabular-nums"
            >
              <AnimatePresence>
                {on && (
                  <motion.svg
                    viewBox="0 0 32 32"
                    className="absolute inset-0 size-8"
                    initial={{ scale: 0, rotate: -60 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 60 }}
                    transition={{ type: "spring", stiffness: 380, damping: 18, delay: on ? d * 0.012 : 0 }}
                  >
                    <path d={SCALLOP} fill="#cbbdf7" />
                  </motion.svg>
                )}
              </AnimatePresence>
              <span
                className={cn(
                  "relative transition-colors",
                  on
                    ? "font-medium text-[#4b33b5]"
                    : "text-neutral-700 group-hover:text-[#6b52dd]",
                )}
              >
                {d}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Team sync timer                                                     */
/* ------------------------------------------------------------------ */

const SESSION = 10 * 60;
const TICKS = 60;

export function SyncCard() {
  const [left, setLeft] = useState(8 * 60 + 21);
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(false);
  const [bell, setBell] = useState(true);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(
      () => setLeft((s) => (s <= 1 ? SESSION : s - 1)),
      1000,
    );
    return () => clearInterval(id);
  }, [playing]);

  const mins = Math.floor(left / 60);
  const secs = String(left % 60).padStart(2, "0");
  const lit = Math.round((left / SESSION) * TICKS);

  return (
    <div className={cn(shell, "h-full")}>
      <div className="relative h-full overflow-hidden rounded-2xl bg-gradient-to-b from-[#e6f0fc] via-[#d8e8fa] to-[#c9def6]">
        <svg
          viewBox="-100 -100 200 200"
          className="absolute top-1/2 left-1/2 w-[168px] -translate-x-1/2 -translate-y-1/2"
          aria-hidden
        >
          {Array.from({ length: TICKS }, (_, i) => {
            const major = i % 5 === 0;
            return (
              <line
                key={i}
                x1="0"
                y1={-88}
                x2="0"
                y2={major ? -76 : -80}
                transform={`rotate(${(i / TICKS) * 360})`}
                stroke="#1d2840"
                strokeWidth={major ? 1.6 : 1.1}
                strokeLinecap="round"
                className="transition-opacity duration-500"
                opacity={i < lit ? 0.75 : 0.15}
              />
            );
          })}
        </svg>
        <div className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 flex-col items-center">
          <p className="text-[30px] leading-none font-semibold tracking-[-0.04em] text-[#16213a] tabular-nums">
            {mins}:{secs}
          </p>
          <p className="mt-1 text-center text-[10px] leading-tight text-[#5b6884]">
            Team sync,
            <br />
            elevate minds
          </p>
          <div className="mt-2 flex items-center gap-2.5 text-[#4b5876]">
            <button
              type="button"
              aria-label={muted ? "Unmute" : "Mute"}
              onClick={() => setMuted((m) => !m)}
              className="transition-transform hover:scale-110"
            >
              {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
            </button>
            <button
              type="button"
              aria-label={playing ? "Pause" : "Play"}
              onClick={() => setPlaying((p) => !p)}
              className="grid size-7 place-items-center rounded-full border border-[#4b5876] transition-colors hover:bg-[#16213a] hover:text-white"
            >
              {playing ? (
                <Pause className="size-3" fill="currentColor" />
              ) : (
                <Play className="size-3" fill="currentColor" />
              )}
            </button>
            <button
              type="button"
              aria-label={bell ? "Mute reminder" : "Enable reminder"}
              onClick={() => setBell((b) => !b)}
              className="transition-transform hover:scale-110"
            >
              {bell ? <Bell className="size-4" /> : <BellOff className="size-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
