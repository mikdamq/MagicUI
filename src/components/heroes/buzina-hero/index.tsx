"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Check } from "lucide-react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { Inter_Tight } from "next/font/google";
import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ComponentType,
  type FormEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";
import { CalendarCard, InsightsCard, SyncCard, WellnessCard } from "./cards";
import { BuzinaMark } from "./logo";
import { Orb } from "./orb";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const font = Inter_Tight({ subsets: ["latin"], weight: ["300", "400", "500", "600"] });

const EASE = [0.22, 1, 0.36, 1] as const;

/* Stage is laid out 1:1 against the 1440px design, then scaled per breakpoint. */
const STAGE = { w: 1440, h: 550, orbX: 720, orbY: 246, orbBox: 459 };

type CardSpec = {
  id: string;
  Comp: ComponentType;
  left: number;
  top: number;
  w: number;
  h?: number;
  rotate: number;
  z: number;
  depth: number;
  fan: { x: number; y: number; rotate: number };
};

const CARDS: CardSpec[] = [
  { id: "wellness", Comp: WellnessCard, left: 108, top: 20, w: 363, rotate: 4, z: 10, depth: 14, fan: { x: -110, y: -30, rotate: 5 } },
  { id: "insights", Comp: InsightsCard, left: 151, top: 168, w: 285, rotate: -6, z: 20, depth: 26, fan: { x: -60, y: 70, rotate: -6 } },
  { id: "sync", Comp: SyncCard, left: 1025, top: 238, w: 242, h: 207, rotate: 6, z: 10, depth: 22, fan: { x: 70, y: 80, rotate: 6 } },
  { id: "calendar", Comp: CalendarCard, left: 963, top: 23, w: 367, rotate: -4, z: 20, depth: 12, fan: { x: 110, y: -30, rotate: -5 } },
];

const NAV = ["Platform", "Resources", "Prices", "Blog"];

/* ------------------------------------------------------------------ */

function subscribeMd(cb: () => void) {
  const mq = window.matchMedia("(min-width: 768px)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

/** null on the server so neither layout mounts WebGL before we know which is visible. */
function useIsMd() {
  return useSyncExternalStore<boolean | null>(
    subscribeMd,
    () => window.matchMedia("(min-width: 768px)").matches,
    () => null,
  );
}

function Rise({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 18, filter: "blur(6px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.9, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

function Headline() {
  const lines = ["Boost team productivity", "with mindful moments"];
  let i = 0;
  return (
    <h1 className="text-[40px] leading-[1.06] font-semibold tracking-[-0.055em] text-neutral-950 sm:text-[54px] lg:text-[68px]">
      {lines.map((line) => (
        <span key={line} className="block">
          {line.split(" ").map((word) => {
            const d = 0.15 + i++ * 0.06;
            return (
              <motion.span
                key={word}
                className="mr-[0.22em] inline-block last:mr-0"
                initial={{ opacity: 0, y: "45%", filter: "blur(10px)" }}
                animate={{ opacity: 1, y: "0%", filter: "blur(0px)" }}
                transition={{ duration: 0.9, delay: d, ease: EASE }}
              >
                {word}
              </motion.span>
            );
          })}
        </span>
      ))}
    </h1>
  );
}

function EmailForm() {
  const [sent, setSent] = useState(false);
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto mt-9 flex w-full max-w-[452px] flex-col gap-2.5 sm:flex-row sm:gap-3"
    >
      <input
        type="email"
        required
        disabled={sent}
        placeholder="Your work email"
        aria-label="Your work email"
        className="h-[50px] w-full rounded-xl border border-neutral-200 bg-white px-4 text-[16px] tracking-tight text-neutral-900 shadow-[inset_0_1px_2px_rgba(16,24,40,.04)] transition outline-none placeholder:text-neutral-400 focus:border-[#b8a8f6] focus:ring-4 focus:ring-[#b8a8f6]/20 disabled:text-neutral-400 sm:w-[273px]"
      />
      <button
        type="submit"
        className="group relative h-[50px] shrink-0 overflow-hidden rounded-xl bg-neutral-950 px-[22px] text-[16px] font-medium tracking-tight whitespace-nowrap text-white transition-transform active:scale-[.98]"
      >
        <span
          aria-hidden
          className="absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-[320%]"
        />
        <motion.span
          key={String(sent)}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative flex items-center justify-center gap-1.5"
        >
          {sent ? (
            <>
              <Check className="size-4" /> You&apos;re on the list
            </>
          ) : (
            "Empower your team"
          )}
        </motion.span>
      </button>
    </form>
  );
}

/** Hover tilt that follows the pointer inside the card. */
function Tilt({ children, disabled }: { children: ReactNode; disabled: boolean }) {
  const rx = useSpring(0, { stiffness: 220, damping: 18 });
  const ry = useSpring(0, { stiffness: 220, damping: 18 });

  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (disabled) return;
    const r = e.currentTarget.getBoundingClientRect();
    ry.set(((e.clientX - r.left) / r.width - 0.5) * 14);
    rx.set(-((e.clientY - r.top) / r.height - 0.5) * 14);
  };
  const reset = () => {
    rx.set(0);
    ry.set(0);
  };

  return (
    <motion.div
      onPointerMove={onMove}
      onPointerLeave={reset}
      whileHover={disabled ? undefined : { scale: 1.035 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 900 }}
      className="h-full"
    >
      {children}
    </motion.div>
  );
}

function Parallax({
  mx,
  my,
  depth,
  children,
}: {
  mx: MotionValue<number>;
  my: MotionValue<number>;
  depth: number;
  children: ReactNode;
}) {
  const x = useTransform(mx, (v) => v * depth);
  const y = useTransform(my, (v) => v * depth * 0.6);
  return (
    <motion.div style={{ x, y }} className="h-full">
      {children}
    </motion.div>
  );
}

function Rings() {
  const rings = [
    { r: 477, d: "3 7", s: "#e6e7ef", dur: 160 },
    { r: 718, d: "3 8", s: "#ececf2", dur: 220 },
    { r: 980, d: "2 9", s: "#f0f0f5", dur: 300 },
  ];
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute"
      style={{ left: STAGE.orbX - 1000, top: STAGE.orbY - 1000 }}
      width={2000}
      height={2000}
      viewBox="-1000 -1000 2000 2000"
    >
      {rings.map((ring, i) => (
        <motion.circle
          key={ring.r}
          r={ring.r}
          fill="none"
          stroke={ring.s}
          strokeWidth={1.2}
          strokeDasharray={ring.d}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1, rotate: i % 2 ? -360 : 360 }}
          transition={{
            opacity: { duration: 1.2, delay: 0.3 + i * 0.15 },
            scale: { duration: 1.6, delay: 0.3 + i * 0.15, ease: EASE },
            rotate: { duration: ring.dur, repeat: Infinity, ease: "linear" },
          }}
        />
      ))}
    </svg>
  );
}

/* ------------------------------------------------------------------ */

export default function BuzinaHero() {
  const root = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion() ?? false;
  const isMd = useIsMd();

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const mx = useSpring(rawX, { stiffness: 60, damping: 18 });
  const my = useSpring(rawY, { stiffness: 60, damping: 18 });

  useEffect(() => {
    if (reduce) return;
    const onMove = (e: PointerEvent) => {
      rawX.set((e.clientX / window.innerWidth) * 2 - 1);
      rawY.set((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduce, rawX, rawY]);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(
        "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
        () => {
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: "[data-hero]",
              start: "top top",
              end: "+=70%",
              scrub: 0.8,
              pin: true,
            },
          });
          CARDS.forEach((c) => {
            tl.to(`[data-fan="${c.id}"]`, { ...c.fan, ease: "none" }, 0);
          });
          tl.to("[data-orb]", { scale: 1.14, ease: "none" }, 0);
          tl.to("[data-copy]", { y: -24, opacity: 0.7, ease: "none" }, 0);
        },
      );
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <div ref={root} className={cn(font.className, "min-h-screen bg-white")}>
      <section
        data-hero
        className="relative overflow-hidden bg-white antialiased md:h-[1000px] md:max-h-none"
      >
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE }}
          className="relative z-30 mx-auto flex h-[76px] max-w-[1264px] items-center justify-between px-4 sm:px-10"
        >
          <a href="#" className="flex items-center gap-2 text-neutral-950">
            <BuzinaMark className="size-[26px] transition-transform duration-500 hover:rotate-90" />
            <span className="text-[25px] font-medium tracking-[-0.04em]">buzina</span>
          </a>
          <nav className="absolute left-1/2 hidden -translate-x-1/2 gap-8 md:flex">
            {NAV.map((n) => (
              <a
                key={n}
                href="#"
                className="relative text-[15px] tracking-tight text-neutral-500 transition-colors after:absolute after:inset-x-0 after:-bottom-1 after:h-px after:origin-left after:scale-x-0 after:bg-neutral-900 after:transition-transform hover:text-neutral-950 hover:after:scale-x-100"
              >
                {n}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <a
              href="#"
              className="grid h-10 place-items-center rounded-xl border border-neutral-200 px-4 text-[15px] font-medium tracking-tight text-neutral-950 transition-colors hover:bg-neutral-50 sm:h-[46px] sm:px-[18px] sm:text-[16px]"
            >
              Sign in
            </a>
            <a
              href="#"
              className="grid h-10 place-items-center rounded-xl bg-neutral-950 px-4 text-[15px] font-medium tracking-tight text-white transition-colors hover:bg-neutral-800 sm:h-[46px] sm:px-[18px] sm:text-[16px]"
            >
              Sign up
            </a>
          </div>
        </motion.header>
        <div className="relative z-30 mx-auto h-px max-w-[1360px] bg-neutral-100" />

        {/* Copy */}
        <div
          data-copy
          className="relative z-20 mx-auto max-w-[1200px] px-4 pt-14 text-center sm:pt-[74px]"
        >
          <Headline />
          <Rise delay={0.55}>
            <p className="mx-auto mt-5 max-w-xl text-[16px] tracking-tight text-neutral-500 sm:text-[17px]">
              Cultivate focus, reduce stress, and drive results through team meditation
            </p>
          </Rise>
          <Rise delay={0.7}>
            <EmailForm />
          </Rise>
        </div>

        {/* Desktop / tablet stage */}
        <div className="relative z-10 mt-[41px] hidden h-[292px] md:block lg:h-[391px] xl:h-[490px] min-[1440px]:h-[550px]">
          <div
            className="absolute top-0 left-1/2 origin-top -translate-x-1/2 scale-[.53] lg:scale-[.71] xl:scale-[.89] min-[1440px]:scale-100"
            style={{ width: STAGE.w, height: STAGE.h }}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute rounded-full opacity-70 blur-[90px]"
              style={{
                left: STAGE.orbX - 520,
                top: STAGE.orbY - 260,
                width: 1040,
                height: 620,
                background:
                  "radial-gradient(closest-side at 35% 50%, rgba(186,214,252,.55), transparent), radial-gradient(closest-side at 65% 55%, rgba(246,205,240,.5), transparent)",
              }}
            />
            <Rings />

            <motion.div
              className="absolute z-[5]"
              style={{
                left: STAGE.orbX - STAGE.orbBox / 2,
                top: STAGE.orbY - STAGE.orbBox / 2,
              }}
              initial={reduce ? false : { opacity: 0, scale: 0.6, filter: "blur(20px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              transition={{ duration: 1.6, delay: 0.35, ease: EASE }}
            >
              <div data-orb>
                <Orb size={STAGE.orbBox} webgl={isMd === true && !reduce} />
              </div>
            </motion.div>

            {CARDS.map((c, i) => {
              const cx = c.left + c.w / 2;
              const cy = c.top + (c.h ?? 240) / 2;
              return (
                <div
                  key={c.id}
                  className="absolute"
                  style={{
                    left: c.left,
                    top: c.top,
                    width: c.w,
                    height: c.h,
                    zIndex: c.z,
                    rotate: `${c.rotate}deg`,
                  }}
                >
                  <div data-fan={c.id} className="h-full">
                    <motion.div
                      className="h-full"
                      initial={
                        reduce
                          ? false
                          : {
                              opacity: 0,
                              x: STAGE.orbX - cx,
                              y: STAGE.orbY - cy,
                              scale: 0.3,
                              rotate: -c.rotate * 3,
                            }
                      }
                      animate={{ opacity: 1, x: 0, y: 0, scale: 1, rotate: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 70,
                        damping: 14,
                        mass: 0.9,
                        delay: 0.9 + i * 0.12,
                      }}
                    >
                      <Parallax mx={mx} my={my} depth={reduce ? 0 : c.depth}>
                        <Tilt disabled={reduce}>
                          <c.Comp />
                        </Tilt>
                      </Parallax>
                    </motion.div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile: orb + swipeable cards */}
        <div className="relative z-10 pb-12 md:hidden">
          <div className="relative mx-auto mt-6 grid h-[330px] place-items-center">
            <Rise delay={0.5}>
              <Orb size={320} webgl={isMd === false && !reduce} />
            </Rise>
          </div>
          <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-[9vw] pt-2 pb-6 [scrollbar-width:none]">
            {CARDS.map((c, i) => (
              <motion.div
                key={c.id}
                initial={reduce ? false : { opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.8 + i * 0.08, ease: EASE }}
                className="w-[82vw] max-w-[340px] shrink-0 snap-center"
                style={{ height: c.h }}
              >
                <c.Comp />
              </motion.div>
            ))}
          </div>
          <p className="text-center text-[12px] text-neutral-400">Swipe to explore →</p>
        </div>
      </section>
    </div>
  );
}
