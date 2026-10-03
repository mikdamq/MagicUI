"use client";

import { motion, useAnimationControls, useReducedMotion } from "motion/react";

function Plane({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <defs>
        <linearGradient id="sx-fuse" x1="0" x2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#d9dde6" />
        </linearGradient>
        <linearGradient id="sx-wing" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#f4f6fa" />
          <stop offset="1" stopColor="#c4cad6" />
        </linearGradient>
      </defs>
      {/* wings */}
      <path d="M24 19 L45 30 L45 33 L24 27 L3 33 L3 30 Z" fill="url(#sx-wing)" />
      {/* engines */}
      <rect x="12" y="27" width="3.2" height="6" rx="1.6" fill="#aeb5c3" />
      <rect x="32.8" y="27" width="3.2" height="6" rx="1.6" fill="#aeb5c3" />
      {/* tail */}
      <path d="M24 37 L32 42 L32 44 L24 42 L16 44 L16 42 Z" fill="url(#sx-wing)" />
      {/* fuselage */}
      <rect x="21" y="3" width="6" height="41" rx="3" fill="url(#sx-fuse)" />
      <path d="M22.4 7.5 h3.2 l-0.6 2.4 h-2 z" fill="#36506f" opacity=".8" />
    </svg>
  );
}

/** Glassy app-icon badge sitting inline in the headline. Hover makes the plane take off. */
export function PlaneBadge() {
  const controls = useAnimationControls();
  const reduce = useReducedMotion();

  const takeOff = async () => {
    if (reduce) return;
    await controls.start({
      x: 70,
      y: -70,
      scale: 0.6,
      opacity: 0,
      transition: { duration: 0.45, ease: [0.5, 0, 0.75, 0] },
    });
    controls.set({ x: -60, y: 60, scale: 0.7, opacity: 0 });
    await controls.start({
      x: 0,
      y: 0,
      scale: 1,
      opacity: 1,
      transition: { type: "spring", stiffness: 180, damping: 16 },
    });
  };

  return (
    <motion.span
      onHoverStart={takeOff}
      onTap={takeOff}
      initial={{ rotate: -14, scale: 0.4, opacity: 0, y: 30 }}
      animate={{ rotate: -5, scale: 1, opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 120, damping: 12, delay: 0.55 }}
      whileHover={{ rotate: 3, scale: 1.06 }}
      className="relative mx-[0.12em] inline-grid size-[0.86em] cursor-pointer place-items-center rounded-[0.24em] align-[-0.1em]"
      style={{
        background: "linear-gradient(160deg, #ffffff 0%, #eef0f5 45%, #d9dce5 100%)",
        boxShadow:
          "0 0.12em 0.3em -0.06em rgba(40,40,80,.28), 0 0.02em 0.04em rgba(40,40,80,.2), inset 0 0.02em 0 #fff, inset 0 -0.03em 0.05em rgba(120,120,150,.25)",
      }}
    >
      <span
        className="relative block size-[0.72em] overflow-hidden rounded-[0.18em]"
        style={{
          background:
            "radial-gradient(120% 80% at 70% 110%, #ffffff 0%, rgba(255,255,255,0) 55%), linear-gradient(180deg, #8fbde8 0%, #b7d5f2 55%, #e2eefa 100%)",
          boxShadow: "inset 0 0.02em 0.06em rgba(30,60,110,.35)",
        }}
      >
        <motion.span
          animate={controls}
          className="absolute inset-0 grid place-items-center"
        >
          <motion.span
            className="block"
            animate={reduce ? undefined : { y: [0, -1.5, 0], rotate: [38, 41, 38] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
            style={{ rotate: 38 }}
          >
            <Plane className="size-[0.62em] drop-shadow-[0_0.04em_0.04em_rgba(20,40,80,.35)]" />
          </motion.span>
        </motion.span>
        {/* glass sheen */}
        <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/50 to-transparent" />
      </span>
    </motion.span>
  );
}
