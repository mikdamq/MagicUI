"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import dynamic from "next/dynamic";
import { Inter, Instrument_Serif } from "next/font/google";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Airlines } from "./airlines";
import { RIDGES, type Ridge } from "./mountains";
import { PlaneBadge } from "./plane-badge";
import { SearchWidget } from "./search-widget";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const CloudsCanvas = dynamic(() => import("./clouds-canvas"), { ssr: false });

const sans = Inter({ subsets: ["latin"], variable: "--sx-sans" });
const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--sx-serif",
});

const EASE = [0.22, 1, 0.36, 1] as const;
const NAV = ["Features", "Method", "Pricing", "Changelog"];

const GRAIN =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .4  0 0 0 0 .38  0 0 0 0 .55  0 0 0 .55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";

/* ------------------------------------------------------------------ */

function Word({ children, delay }: { children: ReactNode; delay: number }) {
  return (
    <motion.span
      className="inline-block"
      initial={{ opacity: 0, y: "35%", filter: "blur(12px)" }}
      animate={{ opacity: 1, y: "0%", filter: "blur(0px)" }}
      transition={{ duration: 1.1, delay, ease: EASE }}
    >
      {children}
    </motion.span>
  );
}

function RidgeLayer({
  ridge,
  mx,
  reduce,
}: {
  ridge: Ridge;
  mx: MotionValue<number>;
  reduce: boolean;
}) {
  const x = useTransform(mx, (v) => (reduce ? 0 : v * -ridge.depth));
  return (
    <motion.div style={{ x }} className="absolute -inset-x-8 inset-y-0">
      <div data-ridge={ridge.id} className="absolute inset-0">
        <svg
          viewBox="0 0 1440 945"
          preserveAspectRatio="xMidYMax slice"
          className="absolute inset-0 h-full w-full"
          aria-hidden
        >
          <defs>
            <linearGradient id={`sx-${ridge.id}`} x1="0" x2="0" y1="0.6" y2="0.9">
              <stop offset="0" stopColor={ridge.top} />
              <stop offset="1" stopColor={ridge.bottom} />
            </linearGradient>
          </defs>
          <g transform="translate(0 26)">
            <path d={ridge.path} fill={`url(#sx-${ridge.id})`} />
          {ridge.snow && (
            <path
              d={ridge.snow}
              fill="none"
              stroke="#fbfaff"
              strokeWidth="2.2"
              strokeLinejoin="round"
              opacity=".85"
              style={{ filter: "blur(.6px)" }}
            />
          )}
          </g>
        </svg>
      </div>
    </motion.div>
  );
}

/** Soft cloud banks behind the mountains (CSS, cheap, always on). */
function BackClouds({ reduce }: { reduce: boolean }) {
  const blobs = [
    { l: "-8%", t: "44%", w: "34%", h: "34%", o: 0.95, d: 26 },
    { l: "4%", t: "36%", w: "22%", h: "22%", o: 0.8, d: 32 },
    { l: "74%", t: "44%", w: "34%", h: "34%", o: 0.95, d: 28 },
    { l: "78%", t: "37%", w: "22%", h: "22%", o: 0.8, d: 34 },
    { l: "30%", t: "58%", w: "40%", h: "16%", o: 0.55, d: 40 },
  ];
  return (
    <>
      {blobs.map((b, i) => (
        <motion.div
          key={i}
          aria-hidden
          className="absolute rounded-full"
          style={{
            left: b.l,
            top: b.t,
            width: b.w,
            height: b.h,
            opacity: b.o,
            background:
              "radial-gradient(closest-side, #ffffff 0%, rgba(250,249,255,.85) 45%, rgba(230,226,245,0) 100%)",
            filter: "blur(18px)",
          }}
          animate={reduce ? undefined : { x: ["-3%", "3%", "-3%"], y: ["0%", "-4%", "0%"] }}
          transition={{ duration: b.d, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </>
  );
}

/* ------------------------------------------------------------------ */

export default function SkyExplorerHero() {
  const root = useRef<HTMLDivElement>(null);
  const rise = useRef(0);
  const reduce = useReducedMotion() ?? false;
  const [cloudsReady, setCloudsReady] = useState(false);

  const rawX = useMotionValue(0);
  const mx = useSpring(rawX, { stiffness: 40, damping: 16 });

  useEffect(() => {
    if (reduce) return;
    const onMove = (e: PointerEvent) => rawX.set((e.clientX / window.innerWidth) * 2 - 1);
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduce, rawX]);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: "[data-hero]",
            start: "top top",
            end: "+=80%",
            scrub: 0.8,
            pin: true,
            onUpdate: (self) => {
              rise.current = self.progress;
            },
          },
        });
        RIDGES.forEach((r) => {
          tl.to(`[data-ridge="${r.id}"]`, { y: r.scroll, ease: "none" }, 0);
        });
        tl.to("[data-headline]", { y: -70, opacity: 0, filter: "blur(10px)", ease: "none" }, 0);
        tl.to("[data-nav]", { opacity: 0.4, ease: "none" }, 0);
        tl.to("[data-logos]", { y: 40, opacity: 0, ease: "none" }, 0);
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <div
      ref={root}
      className={cn(sans.variable, serif.variable, "min-h-screen bg-white font-[family-name:var(--sx-sans)] antialiased")}
    >
      <section data-hero className="relative min-h-[880px] overflow-hidden bg-white lg:h-[945px] lg:min-h-0">
        {/* ---------- Scene ---------- */}
        <div
          className="absolute inset-3 overflow-hidden rounded-[28px]"
          style={{
            background:
              "linear-gradient(180deg, #ffffff 0%, #fdfdfd 20%, #f2f2f5 42%, #e9e8ef 58%, #e2dfed 70%, #f5f4f9 88%, #ffffff 100%)",
          }}
        >
          <motion.div
            aria-hidden
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.6 }}
          >
            <BackClouds reduce={reduce} />
          </motion.div>

          <motion.div
            className="absolute inset-0"
            initial={reduce ? false : { opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 2, delay: 0.2, ease: EASE }}
          >
            {RIDGES.map((r) => (
              <RidgeLayer key={r.id} ridge={r} mx={mx} reduce={reduce} />
            ))}
          </motion.div>

          {/* CSS mist under the WebGL clouds, so first paint already looks right */}
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-[34%]"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(250,249,253,.7) 50%, #ffffff 85%)",
            }}
          />

          <div
            className={cn(
              "absolute inset-0 transition-opacity duration-[1500ms]",
              cloudsReady ? "opacity-100" : "opacity-0",
            )}
          >
            <CloudsCanvas rise={rise} animate={!reduce} onReady={() => setCloudsReady(true)} />
          </div>

          {/* Edge vignette + film grain */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, #fff 0px, rgba(255,255,255,0) clamp(40px, 9%, 140px), rgba(255,255,255,0) calc(100% - clamp(40px, 9%, 140px)), #fff 100%)",
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[.35] mix-blend-multiply"
            style={{ backgroundImage: GRAIN }}
          />
        </div>

        {/* ---------- Header ---------- */}
        <motion.header
          data-nav
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE }}
          className="relative z-30 mx-auto flex max-w-[924px] items-center justify-between px-6 pt-8 lg:pt-[42px]"
        >
          <a href="#" className="flex items-baseline text-[22px] leading-none">
            <span className="font-[family-name:var(--sx-serif)] text-[25px] text-[#8a8893] italic">
              Sky
            </span>
            <span
              className="bg-clip-text font-medium tracking-[-0.02em] text-transparent"
              style={{ backgroundImage: "linear-gradient(90deg, #1d1c22 0%, #2c2b33 50%, #9b99a6 100%)" }}
            >
              Explorer
            </span>
          </a>
          <nav className="absolute left-1/2 hidden -translate-x-1/2 gap-[34px] md:flex">
            {NAV.map((n) => (
              <a
                key={n}
                href="#"
                className="text-[14.5px] text-neutral-800 transition-colors hover:text-[#6e62b6]"
              >
                {n}
              </a>
            ))}
          </nav>
          <a
            href="#"
            className="grid h-[45px] place-items-center rounded-[11px] border border-white px-6 text-[14.5px] sm:px-[42px] font-medium text-neutral-900 shadow-[0_0_0_1px_rgba(30,30,60,.07),0_4px_10px_-4px_rgba(40,40,80,.18)] transition hover:shadow-[0_0_0_1px_rgba(30,30,60,.12),0_8px_18px_-6px_rgba(40,40,80,.25)]"
            style={{ background: "linear-gradient(180deg, #ffffff 0%, #f0f1f5 100%)" }}
          >
            Log in
          </a>
        </motion.header>

        {/* ---------- Copy + search ---------- */}
        <div className="relative z-20 mx-auto max-w-[1100px] px-4 pt-24 text-center sm:px-6 lg:pt-[142px]">
          <h1
            data-headline
            className="font-[family-name:var(--sx-serif)] text-[46px] leading-[0.95] tracking-[-0.01em] italic sm:text-[64px] lg:text-[76px] lg:leading-[0.93]"
          >
            <span className="block text-[#0e0d12]">
              <Word delay={0.15}>Find</Word> <Word delay={0.23}>the</Word>{" "}
              <Word delay={0.31}>best</Word>
              <PlaneBadge />
              <Word delay={0.45}>flights</Word> <Word delay={0.53}>faster</Word>
            </span>
            <span className="mt-1 block text-[#7d7b86] lg:mt-0">
              <Word delay={0.7}>Travel</Word> <Word delay={0.78}>smarter</Word>
            </span>
          </h1>

          <motion.div
            className="mt-14 text-left lg:mt-[92px]"
            initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1, delay: 0.95, ease: EASE }}
          >
            <SearchWidget />
          </motion.div>
        </div>

        {/* ---------- Partners ---------- */}
        <motion.div
          data-logos
          className="relative z-20 mt-56 pb-16 lg:absolute lg:inset-x-0 lg:bottom-[66px] lg:mt-0 lg:pb-0"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.3, ease: EASE }}
        >
          <Airlines />
        </motion.div>
      </section>
    </div>
  );
}
