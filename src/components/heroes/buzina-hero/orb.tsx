"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { BuzinaMark } from "./logo";

const OrbCanvas = dynamic(() => import("./orb-canvas"), { ssr: false });

/**
 * The glowing centerpiece. `size` is the canvas box; the sphere fills 80% of it.
 * The CSS sphere renders first (and stays for reduced motion); the WebGL
 * shader fades in over it once the context is ready.
 */
export function Orb({
  size,
  webgl,
  className,
}: {
  size: number;
  webgl: boolean;
  className?: string;
}) {
  const [ready, setReady] = useState(false);
  const sphere = size * 0.8;

  return (
    <div
      className={cn("relative grid place-items-center", className)}
      style={{ width: size, height: size }}
    >
      {/* Ambient halo */}
      <div
        aria-hidden
        className="absolute rounded-full blur-3xl"
        style={{
          width: sphere * 1.35,
          height: sphere * 1.35,
          background:
            "radial-gradient(circle at 40% 35%, rgba(150,190,250,.45), rgba(205,170,245,.35) 45%, rgba(250,190,235,.25) 65%, transparent 75%)",
        }}
      />

      {/* Rotating dashed orbit */}
      <svg
        aria-hidden
        className="absolute animate-[spin_90s_linear_infinite] overflow-visible"
        width={sphere * 1.19}
        height={sphere * 1.19}
        viewBox="0 0 100 100"
      >
        <circle
          cx="50"
          cy="50"
          r="49.8"
          fill="none"
          stroke="#cfd2e4"
          strokeWidth="0.22"
          strokeDasharray="0.9 1.1"
        />
      </svg>

      {/* CSS sphere fallback */}
      <div
        aria-hidden
        className={cn(
          "absolute rounded-full transition-opacity duration-1000",
          ready && "opacity-0",
        )}
        style={{
          width: sphere,
          height: sphere,
          background:
            "radial-gradient(circle at 30% 25%, #8fbaf9 0%, #a9a9f7 35%, #d1aaf5 60%, #f8c3ec 85%, #fbe6f6 100%)",
          boxShadow:
            "inset -20px -30px 60px rgba(255,255,255,.55), inset 10px 15px 40px rgba(120,160,240,.3)",
          filter: "blur(1.5px)",
        }}
      />

      {webgl && (
        <div
          className={cn(
            "absolute inset-0 transition-opacity duration-1000",
            ready ? "opacity-100" : "opacity-0",
          )}
        >
          <OrbCanvas onReady={() => setReady(true)} />
        </div>
      )}

      <BuzinaMark
        outline
        className="pointer-events-none absolute text-white/60 mix-blend-soft-light"
        style={{ width: sphere * 0.29, height: sphere * 0.29 }}
      />
      <BuzinaMark
        outline
        className="pointer-events-none absolute text-white/35"
        style={{ width: sphere * 0.29, height: sphere * 0.29 }}
      />
    </div>
  );
}
