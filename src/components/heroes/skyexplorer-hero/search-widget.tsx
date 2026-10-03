"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowLeftRight, Check, ChevronDown, Minus, Plane, Plus } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const CITIES = [
  "Warsaw, Poland",
  "Bangkok, Thailand",
  "Lisbon, Portugal",
  "Tokyo, Japan",
  "New York, USA",
  "Dubai, UAE",
  "Reykjavík, Iceland",
  "Denpasar, Indonesia",
  "Paris, France",
  "Cape Town, South Africa",
  "Amman, Jordan",
  "Sydney, Australia",
  "Kraków, Poland",
  "Seoul, South Korea",
];

const TRIPS = ["Round trip", "One way", "Multi-city"];
const EASE = [0.22, 1, 0.36, 1] as const;

function useOutside(open: boolean, close: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);
  return ref;
}

const popover =
  "absolute top-full left-0 z-40 mt-2 rounded-xl border border-neutral-100 bg-white p-1.5 text-neutral-900 shadow-[0_18px_40px_-12px_rgba(60,50,120,.25)] backdrop-blur-xl";

function Menu({
  label,
  children,
}: {
  label: string;
  children: (close: () => void) => ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const ref = useOutside(open, close);
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 rounded-md py-1 text-[12px] font-medium text-neutral-600 transition-colors hover:text-neutral-950"
        aria-expanded={open}
      >
        {label}
        <ChevronDown className={cn("size-3 transition-transform", open && "rotate-180")} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            className={popover}
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.18 }}
          >
            {children(close)}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Counter({
  label,
  hint,
  value,
  min,
  onChange,
}: {
  label: string;
  hint: string;
  value: number;
  min: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-6 px-2.5 py-2">
      <div>
        <p className="text-[13px] font-medium text-neutral-900">{label}</p>
        <p className="text-[11px] text-neutral-400">{hint}</p>
      </div>
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          aria-label={`Fewer ${label}`}
          disabled={value <= min}
          onClick={() => onChange(value - 1)}
          className="grid size-6 place-items-center rounded-full border border-neutral-200 text-neutral-600 transition hover:border-neutral-400 disabled:opacity-30"
        >
          <Minus className="size-3" />
        </button>
        <span className="w-3 text-center text-[13px] tabular-nums">{value}</span>
        <button
          type="button"
          aria-label={`More ${label}`}
          disabled={value >= 9}
          onClick={() => onChange(value + 1)}
          className="grid size-6 place-items-center rounded-full border border-neutral-200 text-neutral-600 transition hover:border-neutral-400 disabled:opacity-30"
        >
          <Plus className="size-3" />
        </button>
      </div>
    </div>
  );
}

function CityField({
  label,
  value,
  onChange,
  swapKey,
  direction,
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  swapKey: number;
  direction: 1 | -1;
  className?: string;
}) {
  const [query, setQuery] = useState<string | null>(null);
  const editing = query !== null;
  const close = () => setQuery(null);
  const ref = useOutside(editing, close);
  const q = (query ?? "").toLowerCase();
  const matches = CITIES.filter((c) => c !== value && c.toLowerCase().includes(q)).slice(0, 5);

  const pick = (city: string) => {
    onChange(city);
    close();
  };

  return (
    <div ref={ref} className={cn("relative", className)}>
      <label
        className={cn(
          "flex h-[59px] cursor-text flex-col justify-center overflow-hidden rounded-[11px] bg-white px-[19px] shadow-[0_1px_2px_rgba(30,30,60,.06),0_8px_24px_-10px_rgba(70,60,140,.18)] ring-1 ring-black/[.03] transition-shadow",
          editing && "ring-2 ring-[#b9b0e6]",
        )}
      >
        <span className="text-[10px] leading-none text-neutral-500">{label}</span>
        <span className="relative mt-[5px] block h-5">
          {editing ? (
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && matches[0]) {
                  e.preventDefault();
                  pick(matches[0]);
                }
              }}
              placeholder={value}
              className="w-full bg-transparent text-[15px] font-medium tracking-[-0.01em] text-neutral-900 outline-none placeholder:text-neutral-300"
            />
          ) : (
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.button
                type="button"
                key={`${value}-${swapKey}`}
                onClick={() => setQuery("")}
                initial={{ y: 22 * direction, opacity: 0, filter: "blur(4px)" }}
                animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                exit={{ y: -22 * direction, opacity: 0, filter: "blur(4px)" }}
                transition={{ duration: 0.4, ease: EASE }}
                className="absolute inset-0 truncate text-left text-[15px] font-medium tracking-[-0.01em] text-neutral-900"
              >
                {value}
              </motion.button>
            </AnimatePresence>
          )}
        </span>
      </label>
      <AnimatePresence>
        {editing && matches.length > 0 && (
          <motion.ul
            className={cn(popover, "w-full")}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
          >
            {matches.map((c, i) => (
              <motion.li
                key={c}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <button
                  type="button"
                  onClick={() => pick(c)}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] text-neutral-700 transition-colors hover:bg-[#f1effa] hover:text-neutral-950"
                >
                  <Plane className="size-3.5 text-[#9b92c9]" />
                  {c}
                </button>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

export function SearchWidget() {
  const [trip, setTrip] = useState("Round trip");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [from, setFrom] = useState("Warsaw, Poland");
  const [to, setTo] = useState("Bangkok, Thailand");
  const [swaps, setSwaps] = useState(0);
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");

  const travellers = adults + children;
  const passengersLabel =
    travellers === 1 ? "Passengers" : `${travellers} passengers`;

  const swap = () => {
    setFrom(to);
    setTo(from);
    setSwaps((s) => s + 1);
    setStatus("idle");
  };

  const search = () => {
    if (status === "loading") return;
    setStatus("loading");
    setTimeout(() => setStatus("done"), 1600);
  };

  const city = (s: string) => s.split(",")[0];
  const flights = 24 + ((from.length * 7 + to.length * 3) % 31);
  const price = 280 + ((from.length * 13 + to.length * 17) % 420);

  return (
    <div className="mx-auto w-full max-w-[672px]">
      <div className="flex items-center gap-6 pl-[3px]">
        <Menu label={trip}>
          {(close) =>
            TRIPS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setTrip(t);
                  close();
                }}
                className="flex w-36 items-center justify-between rounded-lg px-2.5 py-2 text-left text-[13px] text-neutral-700 hover:bg-[#f1effa]"
              >
                {t}
                {t === trip && <Check className="size-3.5 text-[#7b6fc4]" />}
              </button>
            ))
          }
        </Menu>
        <Menu label={passengersLabel}>
          {() => (
            <div className="w-64">
              <Counter label="Adults" hint="12+ years" value={adults} min={1} onChange={setAdults} />
              <Counter label="Children" hint="2–11 years" value={children} min={0} onChange={setChildren} />
            </div>
          )}
        </Menu>
      </div>

      <div className="mt-2.5 flex flex-col gap-2 sm:flex-row sm:gap-0">
        <div className="relative flex flex-1 flex-col gap-2 sm:flex-row">
          <CityField label="From" value={from} onChange={setFrom} swapKey={swaps} direction={1} className="flex-1" />
          <CityField label="To" value={to} onChange={setTo} swapKey={swaps} direction={-1} className="flex-1" />
          <motion.button
            type="button"
            onClick={swap}
            aria-label="Swap origin and destination"
            animate={{ rotate: swaps * 180 }}
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
            className="absolute top-1/2 left-1/2 z-10 grid size-[31px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-[#ecebf1] text-neutral-800 shadow-[0_0_0_4px_rgba(255,255,255,.6),0_2px_6px_rgba(40,30,90,.15)]"
          >
            <ArrowLeftRight className="size-3.5 rotate-90 sm:rotate-0" strokeWidth={2.2} />
          </motion.button>
        </div>
        <motion.button
          type="button"
          onClick={search}
          whileTap={{ scale: 0.97 }}
          className="relative h-[59px] overflow-hidden rounded-[11px] border border-black/60 text-[17px] font-medium text-white shadow-[0_10px_24px_-10px_rgba(20,15,40,.6),inset_0_1px_0_rgba(255,255,255,.12)] sm:ml-[14px] sm:w-[147px]"
          style={{ background: "linear-gradient(180deg, #34333a 0%, #18171c 100%)" }}
        >
          <AnimatePresence mode="wait" initial={false}>
            {status === "loading" ? (
              <motion.span
                key="loading"
                className="absolute inset-0 grid place-items-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <span className="relative block h-5 w-16 overflow-hidden">
                  <motion.span
                    className="absolute top-0.5"
                    initial={{ x: -20 }}
                    animate={{ x: 70 }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Plane className="size-4 rotate-45" fill="currentColor" />
                  </motion.span>
                </span>
              </motion.span>
            ) : (
              <motion.span
                key="label"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                Search
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      <div className="relative h-0">
        <AnimatePresence>
          {status === "done" && (
            <motion.div
              initial={{ opacity: 0, y: -8, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="absolute inset-x-0 top-3 z-30 mx-auto flex w-fit items-center gap-3 rounded-full border border-white bg-white/80 py-1.5 pr-4 pl-1.5 text-[13px] text-neutral-700 shadow-[0_10px_30px_-10px_rgba(60,50,120,.3)] backdrop-blur-xl"
            >
              <span className="grid size-6 place-items-center rounded-full bg-neutral-900 text-white">
                <Plane className="size-3 rotate-45" fill="currentColor" />
              </span>
              <span>
                <b className="font-semibold text-neutral-950">{flights} flights</b>{" "}
                {city(from)} → {city(to)} · from{" "}
                <b className="font-semibold text-neutral-950">${price}</b>
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
