"use client";

import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

const ASSET = "/showcase/workspace-dashboard";
export const img = (name: string) => `${ASSET}/${name}.png`;

export const TEAM = ["p1", "p2", "p3", "p4", "p5", "p7", "p8"];

export function Avatar({ name, size = 26, className }: { name: string; size?: number; className?: string }) {
  return (
    <span
      className={cn("inline-grid shrink-0 place-items-center overflow-hidden rounded-full bg-[#f1eefb] ring-2 ring-white", className)}
      style={{ width: size, height: size }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={img(name)} alt="" className="size-[86%] translate-y-[6%]" />
    </span>
  );
}

export function AvatarStack({ names, size = 24, more }: { names: string[]; size?: number; more?: number }) {
  return (
    <span className="flex items-center">
      {names.map((n, i) => (
        <motion.span
          key={n}
          className={i ? "-ml-[7px]" : ""}
          whileHover={{ y: -3, zIndex: 10 }}
          style={{ position: "relative" }}
        >
          <Avatar name={n} size={size} />
        </motion.span>
      ))}
      {more ? (
        <span
          className="-ml-[7px] grid shrink-0 place-items-center rounded-full bg-white font-medium tracking-tight whitespace-nowrap text-neutral-700 ring-2 ring-white"
          style={{
            width: size,
            height: size,
            fontSize: size < 20 ? 7.5 : 10,
            boxShadow: "inset 0 0 0 1px #ececf0",
          }}
        >
          +{more}
        </span>
      ) : null}
    </span>
  );
}

export function CountUp({
  value,
  decimals = 0,
  delay = 0,
  format,
}: {
  value: number;
  decimals?: number;
  delay?: number;
  format?: (v: number) => string;
}) {
  const mv = useMotionValue(0);
  const text = useTransform(mv, (v) => (format ? format(v) : v.toFixed(decimals)));
  useEffect(() => {
    const c = animate(mv, value, { duration: 1.4, delay, ease: [0.22, 1, 0.36, 1] });
    return () => c.stop();
  }, [mv, value, delay]);
  return <motion.span>{text}</motion.span>;
}

/** Octagon brand mark. */
export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden>
      <path d="M13 3 H27 L37 13 V27 L27 37 H13 L3 27 V13 Z" fill="#0d0d12" />
      <path d="M15 9 H25 L31 15 V25 L25 31 H15 L9 25 V15 Z" fill="#fff" />
      <path d="M17 13 H23 L27 17 V23 L23 27 H17 L13 23 V17 Z" fill="#0d0d12" />
    </svg>
  );
}

/* Glossy app icons for the left rail. */
export function RailGlyph({ kind }: { kind: "orange" | "red" | "teal" | "green" }) {
  const g = {
    orange: ["#ffcf6b", "#ff9a1f"],
    red: ["#ff8a7a", "#ef4136"],
    teal: ["#7cf0e6", "#26b4c6"],
    green: ["#9be98f", "#2fae54"],
  }[kind];
  const id = `wd-${kind}`;
  return (
    <svg viewBox="0 0 32 32" className="size-[26px] drop-shadow-[0_3px_4px_rgba(0,0,0,.12)]" aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={g[0]} />
          <stop offset="1" stopColor={g[1]} />
        </linearGradient>
      </defs>
      {kind === "orange" && (
        <g fill={`url(#${id})`}>
          <rect x="3" y="3" width="12" height="12" rx="4" />
          <rect x="17" y="3" width="12" height="12" rx="4" />
          <rect x="3" y="17" width="12" height="12" rx="4" />
          <rect x="17" y="17" width="12" height="12" rx="4" />
          <rect x="9" y="9" width="14" height="14" rx="3" />
        </g>
      )}
      {kind === "red" && (
        <g fill={`url(#${id})`}>
          <circle cx="10" cy="10" r="7" />
          <circle cx="22" cy="10" r="7" />
          <circle cx="10" cy="22" r="7" />
          <circle cx="22" cy="22" r="7" />
          <circle cx="16" cy="16" r="6" />
        </g>
      )}
      {kind === "teal" && (
        <path
          fill={`url(#${id})`}
          d="M16 2 C19 2 20 5 22.5 6 C25 7 28.5 6 29.5 9 C30.5 12 27.5 14 27.5 16 C27.5 18 30.5 20 29.5 23 C28.5 26 25 25 22.5 26 C20 27 19 30 16 30 C13 30 12 27 9.5 26 C7 25 3.5 26 2.5 23 C1.5 20 4.5 18 4.5 16 C4.5 14 1.5 12 2.5 9 C3.5 6 7 7 9.5 6 C12 5 13 2 16 2Z"
        />
      )}
      {kind === "green" && (
        <path
          fill={`url(#${id})`}
          d="M16 1.5 L19.6 7.3 L26.3 5.7 L24.7 12.4 L30.5 16 L24.7 19.6 L26.3 26.3 L19.6 24.7 L16 30.5 L12.4 24.7 L5.7 26.3 L7.3 19.6 L1.5 16 L7.3 12.4 L5.7 5.7 L12.4 7.3 Z"
          strokeLinejoin="round"
          stroke={`url(#${id})`}
          strokeWidth="2"
        />
      )}
      <ellipse cx="12" cy="9" rx="6" ry="3" fill="#fff" opacity=".35" />
    </svg>
  );
}

/** Purple app tile with column glyph (current workspace). */
export function WorkspaceTile() {
  return (
    <span className="grid size-[50px] place-items-center rounded-[14px] bg-gradient-to-br from-[#c27cf6] to-[#8b3fe0] shadow-[0_6px_14px_-4px_rgba(139,63,224,.55),inset_0_1px_0_rgba(255,255,255,.4)]">
      <svg viewBox="0 0 24 24" className="size-[26px]" fill="none" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" aria-hidden>
        <path d="M4 5h16M4 19h16M8 8v8M12 8v8M16 8v8" />
      </svg>
    </span>
  );
}
