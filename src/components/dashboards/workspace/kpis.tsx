"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, CalendarDays, ClipboardCheck, ClipboardList, Flag, MoreHorizontal } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { AvatarStack, CountUp } from "./parts";

const EASE = [0.22, 1, 0.36, 1] as const;

function Card({ title, action, children, delay, className }: { title: string; action?: ReactNode; children: ReactNode; delay: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay, ease: EASE }}
      whileHover={{ y: -3 }}
      className={cn("relative flex h-[200px] flex-col rounded-[18px] bg-[#f5f6f8] px-[11px] pt-[13px] transition-shadow hover:shadow-[0_10px_24px_-14px_rgba(16,24,40,.25)]", className)}
    >
      <div className="flex items-center justify-between">
        <p className="text-[13px] text-neutral-900">{title}</p>
        <span className="text-neutral-400">{action}</span>
      </div>
      {children}
    </motion.div>
  );
}

/* ------------------------------ Mails ------------------------------ */

export function MailsCard({ delay = 0 }: { delay?: number }) {
  const [hover, setHover] = useState(false);
  return (
    <Card title="Mails" delay={delay} action={<MoreHorizontal className="size-4" />}>
      <div className="relative mt-1 flex-1" onPointerEnter={() => setHover(true)} onPointerLeave={() => setHover(false)}>
        <svg viewBox="0 0 166 150" className="absolute inset-x-0 bottom-[2px] mx-auto w-[160px] overflow-visible" aria-hidden>
          <defs>
            <linearGradient id="wd-env-side" x1="0" x2="1">
              <stop offset="0" stopColor="#f472b6" />
              <stop offset="1" stopColor="#a855f7" />
            </linearGradient>
            <linearGradient id="wd-env-front" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#ffffff" />
              <stop offset="1" stopColor="#ecebf0" />
            </linearGradient>
            <filter id="wd-env-shadow" x="-20%" y="-20%" width="140%" height="160%">
              <feDropShadow dx="0" dy="8" stdDeviation="7" floodColor="#4b2a7a" floodOpacity=".16" />
            </filter>
          </defs>
          <g filter="url(#wd-env-shadow)">
            <path d="M14 64 L83 22 L152 64 L152 140 L14 140 Z" fill="#e9e7ef" />
            <path d="M14 64 L30 54 L30 112 Z" fill="url(#wd-env-side)" />
            <path d="M152 64 L136 54 L136 112 Z" fill="url(#wd-env-side)" />
            {/* letters */}
            {[0, 1].map((i) => (
              <motion.g
                key={i}
                animate={{ y: hover ? -22 + i * 8 : 0, rotate: hover ? (i ? 3 : -3) : 0 }}
                transition={{ type: "spring", stiffness: 220, damping: 16, delay: i * 0.04 }}
              >
                <rect x={36 + i * 6} y={i ? 14 : 8} width={94 - i * 6} height="96" rx="4" fill="#fff" stroke="#ececf2" />
                {i === 1 && (
                  <g>
                    <circle cx="52" cy="26" r="4" fill="#d9c8f7" />
                    <rect x="59" y="22" width="22" height="3" rx="1.5" fill="#2a2a33" />
                    <rect x="59" y="28" width="16" height="2" rx="1" fill="#b9b9c4" />
                    {Array.from({ length: 7 }, (_, k) => (
                      <rect key={k} x="49" y={38 + k * 6} width={k % 3 === 2 ? 46 : 70} height="2" rx="1" fill="#d5d5de" />
                    ))}
                  </g>
                )}
              </motion.g>
            ))}
            <path d="M14 64 L83 104 L152 64 L152 140 L14 140 Z" fill="url(#wd-env-front)" />
            <path d="M14 140 L76 98 M152 140 L90 98" stroke="#e1dfe8" strokeWidth="1.2" />
          </g>
        </svg>
        <AnimatePresence>
          {hover && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute top-1 right-3 rounded-full bg-[#8b3fe0] px-2 py-0.5 text-[10.5px] font-medium text-white"
            >
              3 unread
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
}

/* ---------------------------- Latest Task ---------------------------- */

export function LatestTaskCard({ delay = 0 }: { delay?: number }) {
  const [done, setDone] = useState(false);
  return (
    <Card title="Latest Task" delay={delay} action={<ArrowUpRight className="size-4" />}>
      <div className="mt-[18px] flex items-center gap-[9px]">
        <span className="grid size-[36px] place-items-center rounded-[10px] bg-white shadow-[0_1px_2px_rgba(16,24,40,.06)]">
          <svg viewBox="0 0 20 20" className="size-[18px]" aria-hidden>
            {[
              [10, 4],
              [4, 10],
              [16, 10],
              [10, 16],
            ].map(([x, y], i) => (
              <rect key={i} x={x - 3} y={y - 3} width="6" height="6" rx="1.2" transform={`rotate(45 ${x} ${y})`} fill={["#c084fc", "#a855f7", "#d8b4fe", "#9333ea"][i]} />
            ))}
          </svg>
        </span>
        <p className={cn("flex-1 text-[13px] leading-[15px] text-neutral-900 transition-colors", done && "text-neutral-400 line-through")}>
          Token
          <br />
          Design System
        </p>
        <button type="button" onClick={() => setDone((d) => !d)} aria-label={done ? "Mark as not done" : "Mark as done"} className="text-neutral-600 transition-colors hover:text-[#8b3fe0]">
          {done ? <ClipboardCheck className="size-[17px] text-[#22c55e]" strokeWidth={1.6} /> : <ClipboardList className="size-[17px]" strokeWidth={1.6} />}
        </button>
      </div>
      <div className="mt-[14px]">
        <AvatarStack names={["p1", "p2", "p7", "p4"]} size={22} more={1} />
      </div>
      <p className="mt-[14px] flex items-center gap-[7px] text-[10px] text-neutral-500">
        <CalendarDays className="size-[13px]" strokeWidth={1.6} /> Dec 19 - Dec 24
      </p>
      <p className="mt-[10px] flex items-center gap-[7px] text-[10px] text-neutral-500">
        <Flag className="size-[13px] fill-[#fbbf24] text-[#f59e0b]" strokeWidth={1.6} /> High Priority
      </p>
    </Card>
  );
}

/* --------------------------- Sprint Velocity --------------------------- */

const SEGMENTS = [
  { label: "Fixed", color: "#f05252", w: 72, from: "#fca5a5" },
  { label: "In Progress", color: "#f97316", w: 10 },
  { label: "Stage", color: "#f6b42c", w: 8 },
  { label: "Grooming", color: "#4ade80", w: 6 },
  { label: "Clarification", color: "#2dd4bf", w: 5 },
  { label: "In Box", color: "#a78bfa", w: 4 },
];
const LEGEND = [
  { label: "Fixed", color: "#f05252" },
  { label: "In Progress", color: "#f97316" },
  { label: "Stage", color: "#f6b42c" },
  { label: "Grooming", color: "#4ade80" },
  { label: "Clarification", color: "#2dd4bf" },
  { label: "In Box", color: "#3f3f46" },
];

export function SprintCard({ delay = 0 }: { delay?: number }) {
  const [hover, setHover] = useState<number | null>(null);
  return (
    <Card title="Sprint Velocity" delay={delay} action={<CalendarDays className="size-4" strokeWidth={1.6} />}>
      <p className="mt-[5px] text-[17.5px] leading-none font-semibold text-neutral-950">
        <CountUp value={87.29} decimals={2} delay={delay + 0.3} />
      </p>
      <p className="mt-[4px] text-[6.5px] text-neutral-500">Avg daily Velocity</p>
      <div className="relative mt-[16px] flex h-[33px] overflow-hidden rounded-[7px] bg-[#e8e9ee]">
        {SEGMENTS.map((s, i) => (
          <motion.span
            key={s.label}
            className="h-full cursor-pointer"
            initial={{ width: 0 }}
            animate={{ width: s.w, opacity: hover === null || hover === i ? 1 : 0.45 }}
            transition={{ width: { duration: 1, delay: delay + 0.3 + i * 0.08, ease: EASE } }}
            style={{ background: s.from ? `linear-gradient(90deg, ${s.from}, ${s.color})` : s.color }}
            onPointerEnter={() => setHover(i)}
            onPointerLeave={() => setHover(null)}
          />
        ))}
        <span className="ml-auto grid w-[46px] place-items-center text-[10.5px] font-medium text-neutral-800">%72</span>
        <AnimatePresence>
          {hover !== null && (
            <motion.span
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="pointer-events-none absolute top-1/2 left-2 -translate-y-1/2 rounded-md bg-neutral-950/85 px-1.5 py-0.5 text-[10px] font-medium text-white"
            >
              {SEGMENTS[hover].label} · {Math.round((SEGMENTS[hover].w / 105) * 72)}%
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      <div className="mt-[18px] grid grid-cols-2 gap-x-[8px] gap-y-[7px] text-[10.5px] text-neutral-700">
        {LEGEND.map((l) => (
          <span key={l.label} className="flex items-center gap-[7px]">
            <span className="size-[6px] rounded-full" style={{ background: l.color }} />
            {l.label}
          </span>
        ))}
      </div>
    </Card>
  );
}

/* ---------------------------- Time Spending ---------------------------- */

const MONTHS = [
  { m: "Jan", a: 58, b: 46, h: "4h 05m" },
  { m: "Feb", a: 96, b: 74, h: "5h 48m" },
  { m: "Mar", a: 70, b: 52, h: "4h 31m" },
  { m: "Apr", a: 112, b: 88, h: "6h 12m" },
  { m: "May", a: 42, b: 34, h: "3h 22m" },
  { m: "Jun", a: 84, b: 58, h: "5h 03m" },
];

function useTicker(start: number) {
  const [s, setS] = useState(start);
  useEffect(() => {
    const id = setInterval(() => setS((v) => v + 1), 1000);
    return () => clearInterval(id);
  }, []);
  return s;
}

export function TimeCard({ delay = 0 }: { delay?: number }) {
  const secs = useTicker(4 * 3600 + 24 * 60 + 45);
  const [hover, setHover] = useState<number | null>(null);
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return (
    <Card title="Time Spending" delay={delay} action={<CalendarDays className="size-4" strokeWidth={1.6} />}>
      <p className="mt-[5px] text-[17.5px] leading-none font-semibold text-neutral-950 tabular-nums">
        {h}h {m}m {String(s).padStart(2, "0")}s
      </p>
      <p className="mt-[4px] text-[6.5px] text-neutral-500">Avg daily Times</p>
      <div className="relative mt-auto mb-[6px] flex h-[124px] items-end justify-between px-[16px]">
        {MONTHS.map((mo, i) => (
          <div
            key={mo.m}
            className="relative flex h-full cursor-pointer flex-col items-center justify-end gap-1"
            onPointerEnter={() => setHover(i)}
            onPointerLeave={() => setHover(null)}
          >
            <div className="flex items-end gap-[3px]">
              {[mo.a, mo.b].map((v, k) => (
                <motion.span
                  key={k}
                  className="w-[3px] rounded-full"
                  style={{ background: k ? "#cbbcf6" : "#7c5ce6" }}
                  initial={{ height: 0 }}
                  animate={{ height: v, opacity: hover === null || hover === i ? 1 : 0.4 }}
                  transition={{ height: { duration: 1, delay: delay + 0.35 + i * 0.07, ease: EASE } }}
                />
              ))}
            </div>
            <span className="text-[6px] text-neutral-500">{mo.m}</span>
            <AnimatePresence>
              {hover === i && (
                <motion.span
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="pointer-events-none absolute z-10 rounded-md bg-neutral-950/85 px-1.5 py-0.5 text-[10px] font-medium whitespace-nowrap text-white"
                  style={{ bottom: mo.a + 18 }}
                >
                  {mo.m} · {mo.h}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </Card>
  );
}
