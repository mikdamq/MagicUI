"use client";

import {
  ChevronDownIcon,
  ChevronRightIcon,
  CodeIcon,
  CommentDiscussionIcon,
  EyeIcon,
  GitPullRequestIcon,
  GraphIcon,
  IssueOpenedIcon,
  MarkGithubIcon,
  PlayIcon,
  RepoForkedIcon,
  SearchIcon,
  ShieldIcon,
  StarIcon,
  TriangleDownIcon,
} from "@primer/octicons-react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import { Mona_Sans } from "next/font/google";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { avatar, CENTER, CounterPill, emoji, LINKS, NODES, NodeView, RINGS } from "./nodes";

const mona = Mona_Sans({ subsets: ["latin"], weight: "variable", axes: ["wdth"] });

const EASE = [0.22, 1, 0.36, 1] as const;
const STAGE = { w: 1440, h: 990 };

const NAV: { label: string; menu?: boolean }[] = [
  { label: "Why GitHub?", menu: true },
  { label: "Team" },
  { label: "Enterprise" },
  { label: "Explore", menu: true },
  { label: "Marketplace" },
  { label: "Pricing", menu: true },
];

const TABS = [
  { label: "Code", Icon: CodeIcon },
  { label: "Issues", Icon: IssueOpenedIcon },
  { label: "Pull requests", Icon: GitPullRequestIcon },
  { label: "Discussions", Icon: CommentDiscussionIcon, active: true },
  { label: "Actions", Icon: PlayIcon },
  { label: "Security", Icon: ShieldIcon },
  { label: "Insights", Icon: GraphIcon },
];

/* ------------------------------------------------------------------ */

function Header() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: EASE }}
      className="relative z-30 mx-auto flex h-[72px] w-full max-w-[1150px] items-center justify-between px-5 md:h-[80px] md:px-6"
    >
      <div className="flex items-center gap-4">
        <a href="#" aria-label="GitHub" className="text-[#24292f] transition-transform hover:scale-105">
          <MarkGithubIcon size={32} />
        </a>
        <nav className="hidden items-center gap-[16px] lg:flex">
          {NAV.map((n) => (
            <a
              key={n.label}
              href="#"
              className="group flex items-center gap-0.5 text-[15px] text-[#24292f] transition-colors hover:text-[#57606a]"
            >
              {n.label}
              {n.menu && <ChevronDownIcon size={16} className="transition-transform group-hover:translate-y-0.5" />}
            </a>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-3">
        <label className="hidden h-[32px] w-[216px] items-center gap-2 rounded-[6px] border border-[#d0d7de] bg-[#f6f8fa] px-2.5 text-[#57606a] transition focus-within:border-[#0969da] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#0969da]/30 md:flex">
          <SearchIcon size={16} />
          <input
            placeholder="Search GitHub"
            aria-label="Search GitHub"
            className="min-w-0 flex-1 bg-transparent text-[14.5px] text-[#24292f] outline-none placeholder:text-[#57606a]"
          />
          <kbd className="grid h-[18px] w-[16px] place-items-center rounded-[4px] border border-[#d0d7de] font-sans text-[10px] text-[#8c959f]">
            /
          </kbd>
        </label>
        <a href="#" className="hidden text-[15px] text-[#24292f] hover:text-[#57606a] sm:block">
          Sign in
        </a>
        <a
          href="#"
          className="grid h-[32px] place-items-center rounded-[6px] border border-[#d0d7de] bg-white px-3 text-[15px] text-[#24292f] transition-colors hover:bg-[#f6f8fa]"
        >
          Sign up
        </a>
      </div>
    </motion.header>
  );
}

function Copy() {
  return (
    <>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.1, ease: EASE }}
        className="text-[18px] font-semibold tracking-[-0.01em] text-[#bf3989]"
      >
        GitHub Discussions
      </motion.p>
      <h1 className="mt-[52px] text-[71px] leading-[64px] font-[820] tracking-[-0.045em] text-[#24292f]">
        {["The home", "for developer", "communities"].map((line, i) => (
          <motion.span
            key={line}
            className="block"
            initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.9, delay: 0.18 + i * 0.1, ease: EASE }}
          >
            {line}
          </motion.span>
        ))}
      </h1>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5, ease: EASE }}
        className="mx-auto mt-[44px] max-w-[540px] text-[18.5px] leading-[25.5px] text-[#57606a]"
      >
        Ask questions, share ideas, and build connections with each other – all right next to your code. GitHub
        Discussions enables healthy and productive software collaboration.
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.62, ease: EASE }}
        className="mt-[41px] flex flex-col items-center"
      >
        <a
          href="#"
          className="group flex h-[50px] items-center gap-2 rounded-[6px] bg-[#24292f] px-[24px] text-[17px] font-semibold text-white shadow-[0_6px_16px_-6px_rgba(31,35,40,.5)] transition-colors hover:bg-black"
        >
          Enable discussions
          <ChevronRightIcon size={16} className="transition-transform group-hover:translate-x-1" />
        </a>
        <a
          href="#"
          className="group mt-[28px] flex items-center gap-1.5 text-[16.5px] font-semibold text-[#24292f]"
        >
          Watch video
          <ChevronRightIcon size={16} className="transition-transform group-hover:translate-x-1" />
        </a>
      </motion.div>
    </>
  );
}

function RepoPreview() {
  return (
    <div className="w-full overflow-hidden rounded-t-[6px] border border-b-0 border-[#d0d7de] bg-[#f6f8fa] shadow-[0_12px_40px_-12px_rgba(31,35,40,.25)]">
      <div className="flex items-center justify-between px-4 pt-3">
        <p className="text-[14px] text-[#0969da]">
          acme <span className="text-[#57606a]">/</span> <b className="font-semibold">octoinvaders</b>
        </p>
        <div className="hidden gap-1.5 sm:flex">
          {[
            { l: "Watch", I: EyeIcon },
            { l: "Fork", I: RepoForkedIcon },
            { l: "Star", I: StarIcon },
          ].map(({ l, I }) => (
            <span
              key={l}
              className="flex h-[22px] items-center gap-1 rounded-[5px] border border-[#d0d7de] bg-white px-1.5 text-[10.5px] text-[#57606a]"
            >
              <I size={12} /> {l}
              {l === "Star" && <TriangleDownIcon size={12} className="-mr-0.5 ml-0.5 border-l border-[#d0d7de] pl-0.5" />}
            </span>
          ))}
        </div>
      </div>
      <div className="mt-3 flex gap-1 overflow-x-auto px-3 [scrollbar-width:none]">
        {TABS.map(({ label, Icon, active }) => (
          <span
            key={label}
            className={cn(
              "relative flex shrink-0 items-center gap-1.5 px-2 pt-1 pb-3 text-[12.5px] whitespace-nowrap",
              active ? "font-semibold text-[#24292f]" : "text-[#8c959f]",
            )}
          >
            <Icon size={14} />
            {label}
            {active && <span className="absolute inset-x-0 bottom-0 h-[2px] rounded-full bg-[#fd8c73]" />}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

export default function GithubDiscussionsHero() {
  const reduce = useReducedMotion() ?? false;
  const stageBox = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number | null>(null);

  // Fit the 1440 × 990 design stage to the viewport.
  useEffect(() => {
    const el = stageBox.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const { clientWidth: w, clientHeight: h } = el;
      if (w && h) setScale(Math.min(1.12, w / STAGE.w, h / STAGE.h));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Small cursor parallax: rings drift less than the node network.
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 50, damping: 18 });
  const sy = useSpring(my, { stiffness: 50, damping: 18 });
  const nodeX = useTransform(sx, (v) => v * 10);
  const nodeY = useTransform(sy, (v) => v * 8);
  const ringX = useTransform(sx, (v) => v * 4);
  const ringY = useTransform(sy, (v) => v * 3);
  useEffect(() => {
    if (reduce) return;
    const onMove = (e: PointerEvent) => {
      mx.set((e.clientX / window.innerWidth) * 2 - 1);
      my.set((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduce, mx, my]);

  const delayFor = (x: number, y: number) => 0.55 + Math.hypot(x - CENTER.x, y - CENTER.y) / 900;

  return (
    <div className={cn(mona.className, "min-h-screen bg-white text-[#24292f] antialiased")}>
      <section className="relative overflow-clip bg-white md:h-svh md:min-h-[600px]">
        {/* Desktop / tablet: scaled design stage */}
        <div ref={stageBox} className="absolute inset-0 hidden md:block">
          <div
            className="absolute top-0 left-1/2 origin-top"
            style={{
              width: STAGE.w,
              height: STAGE.h,
              transform: `translateX(-50%) scale(${scale ?? 1})`,
              visibility: scale === null ? "hidden" : "visible",
            }}
          >
            {/* Concentric rings */}
            <motion.svg
              aria-hidden
              className="pointer-events-none absolute overflow-visible"
              style={{ left: 0, top: 0, x: ringX, y: ringY }}
              width={STAGE.w}
              height={STAGE.h}
            >
              {RINGS.map((r, i) => (
                <motion.circle
                  key={r}
                  cx={CENTER.x}
                  cy={CENTER.y}
                  r={r}
                  fill="none"
                  stroke={i < 2 ? "#e4e7eb" : "#eef0f2"}
                  strokeWidth={1.3}
                  initial={reduce ? false : { pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 1.8, delay: 0.1 + i * 0.15, ease: EASE }}
                  style={{ rotate: -90, transformOrigin: `${CENTER.x}px ${CENTER.y}px` }}
                />
              ))}
            </motion.svg>

            {/* Node network: connectors + nodes move together */}
            <motion.div className="absolute inset-0" style={{ x: nodeX, y: nodeY }}>
              <svg aria-hidden className="pointer-events-none absolute inset-0" width={STAGE.w} height={STAGE.h}>
                {LINKS.map((d, i) => (
                  <g key={d}>
                    <motion.path
                      d={d}
                      fill="none"
                      stroke="#d0d7de"
                      strokeWidth={1.6}
                      strokeLinecap="round"
                      initial={reduce ? false : { pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.9, delay: 0.9 + i * 0.07, ease: EASE }}
                    />
                    {!reduce && (
                      <motion.path
                        d={d}
                        fill="none"
                        stroke="#a371f7"
                        strokeWidth={2.2}
                        strokeLinecap="round"
                        pathLength={1}
                        strokeDasharray="0.16 1.4"
                        initial={{ strokeDashoffset: 0.16, opacity: 0 }}
                        animate={{ strokeDashoffset: [0.16, -1], opacity: [0, 1, 1, 0] }}
                        transition={{
                          duration: 1.6,
                          ease: "easeInOut",
                          delay: 2.6 + ((i * 1.7) % 7),
                          repeat: Infinity,
                          repeatDelay: 6 + (i % 4) * 1.5,
                        }}
                        style={{ filter: "drop-shadow(0 0 3px rgba(163,113,247,.7))" }}
                      />
                    )}
                  </g>
                ))}
              </svg>
              {NODES.map((n, i) => (
                <NodeView key={i} node={n} delay={reduce ? 0 : delayFor(n.x, n.y)} />
              ))}
            </motion.div>

            {/* Centre copy */}
            <div className="absolute inset-x-0 top-[178px] text-center">
              <Copy />
            </div>

            {/* Below the fold teaser */}
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 1, ease: EASE }}
              className="absolute inset-x-0 top-[838px] text-center text-[33px] font-[750] tracking-[-0.03em] text-[#24292f]"
            >
              Dedicated space for conversations.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.15, ease: EASE }}
              className="absolute top-[918px] left-[256px] w-[928px]"
            >
              <RepoPreview />
            </motion.div>
          </div>
        </div>

        {/* Header sits above the stage at real size */}
        <Header />

        {/* Mobile */}
        <div className="relative px-6 pt-10 pb-0 text-center md:hidden">
          <svg aria-hidden className="pointer-events-none absolute top-0 left-1/2 -z-0 -translate-x-1/2" width={760} height={760}>
            {[150, 260, 370].map((r) => (
              <circle key={r} cx={380} cy={330} r={r} fill="none" stroke="#eceef1" strokeWidth={1.2} />
            ))}
          </svg>
          <div className="relative">
            <p className="text-[15px] font-semibold text-[#bf3989]">GitHub Discussions</p>
            <h1 className="mt-5 text-[42px] leading-[42px] font-[820] tracking-[-0.045em]">
              The home for developer communities
            </h1>
            <p className="mt-5 text-[16px] leading-[24px] text-[#57606a]">
              Ask questions, share ideas, and build connections with each other – all right next to your code.
              GitHub Discussions enables healthy and productive software collaboration.
            </p>
            <a
              href="#"
              className="mx-auto mt-8 flex h-[48px] w-fit items-center gap-2 rounded-[6px] bg-[#24292f] px-6 text-[16px] font-semibold text-white"
            >
              Enable discussions <ChevronRightIcon size={16} />
            </a>
            <a href="#" className="mt-5 inline-flex items-center gap-1 text-[15px] font-semibold">
              Watch video <ChevronRightIcon size={16} />
            </a>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={emoji("cat")} alt="" className="size-[72px]" />
              {[1, 5, 7].map((n) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={n} src={avatar(n)} alt="" className="size-[38px] rounded-full shadow-[0_0_0_2px_#fff,0_2px_8px_rgba(31,35,40,.18)]" />
              ))}
              <CounterPill counter={{ icon: "thumbs", value: 35 }} delay={0.6} />
              <CounterPill counter={{ icon: "up", value: 68 }} delay={0.7} />
            </div>
            <p className="mt-12 text-[26px] leading-[30px] font-[750] tracking-[-0.03em]">
              Dedicated space for conversations.
            </p>
            <div className="mt-6">
              <RepoPreview />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
