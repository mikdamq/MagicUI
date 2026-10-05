"use client";

import { AnimatePresence, motion, useMotionValue, useSpring } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { GarmentArt, type Product } from "./garment";

export const PRODUCTS: Product[] = [
  { id: "bascarsija", name: "Baščaršija Tee", kind: "tee", color: "#f3f1ea", colorName: "Off-white", ink: "#1d1d1f", price: 49 },
  { id: "miljacka", name: "Miljacka Hoodie", kind: "hoodie", color: "#2f3361", colorName: "Indigo", ink: "#efe6d4", price: 99 },
  { id: "sebilj", name: "Sebilj Tee", kind: "tee", color: "#1e1e20", colorName: "Black", ink: "#efe6d4", price: 49 },
  { id: "trebevic", name: "Trebević Hoodie", kind: "hoodie", color: "#e7dcc6", colorName: "Cream", ink: "#2a2622", price: 99 },
  { id: "vrelo", name: "Vrelo Bosne Tee", kind: "tee", color: "#efc7c3", colorName: "Blush", ink: "#5a2b2b", price: 49 },
  { id: "igman", name: "Igman Hoodie", kind: "hoodie", color: "#2e4a3b", colorName: "Forest", ink: "#efe6d4", price: 99 },
  { id: "vijecnica", name: "Vijećnica Tee", kind: "tee", color: "#4a3d6d", colorName: "Plum", ink: "#f1e8d8", price: 49 },
  { id: "bjelasnica", name: "Bjelašnica Hoodie", kind: "hoodie", color: "#4a4b50", colorName: "Charcoal", ink: "#f1ece2", price: 99 },
  { id: "kovaci", name: "Kovači Tee", kind: "tee", color: "#e5d9c2", colorName: "Sand", ink: "#2a2622", price: 49 },
  { id: "ferhadija", name: "Ferhadija Hoodie", kind: "hoodie", color: "#1c1c1e", colorName: "Black", ink: "#e9805a", price: 99 },
  { id: "bistrik", name: "Bistrik Tee", kind: "tee", color: "#2b2f5c", colorName: "Deep indigo", ink: "#f1e8d8", price: 49 },
  { id: "marindvor", name: "Marindvor Hoodie", kind: "hoodie", color: "#f2efe8", colorName: "White", ink: "#c65a2e", price: 99 },
];

/* Rail geometry, in the 1440-wide design stage. */
export const RAIL = { y: 96, left: 56, right: 1384, slot: 104, w: 186, h: 279 };
const HOOK = { x: 112 / 200, y: 6 / 300 }; // hook tip inside the garment box
const ZOOM = 1.45;

const center = (i: number) => 720 + (i - (PRODUCTS.length - 1) / 2) * RAIL.slot;

/** How far a neighbour slides away from the hovered garment. */
function push(d: number) {
  const a = Math.abs(d);
  const amount = a === 1 ? 66 : a === 2 ? 42 : a === 3 ? 24 : 10;
  return Math.sign(d) * amount;
}

function RailItem({
  product,
  index,
  hovered,
  setHovered,
  onOpen,
  reduce,
}: {
  product: Product;
  index: number;
  hovered: number | null;
  setHovered: (i: number | null) => void;
  onOpen: (p: Product) => void;
  reduce: boolean;
}) {
  const active = hovered === index;
  const d = hovered === null ? 0 : index - hovered;
  const last = PRODUCTS.length - 1;
  // Zoomed edge garments step inward so they stay on screen.
  const edge = index === 0 ? 46 : index === last ? -46 : 0;
  const x = hovered === null ? 0 : active ? edge : push(d);
  const scale = active ? ZOOM : hovered === null ? 1 : 0.95;
  const tilt = hovered === null || active ? 0 : Math.sign(d) * Math.max(0, 3 - Math.abs(d)) * 1.1;

  // "Hover to turn": horizontal pointer movement spins the garment on its hook.
  const turn = useMotionValue(0);
  const rotateY = useSpring(turn, { stiffness: 120, damping: 18 });
  const lastX = useRef<number | null>(null);
  const idle = useRef<ReturnType<typeof setTimeout> | null>(null);

  const settle = () => {
    lastX.current = null;
    if (idle.current) clearTimeout(idle.current);
    // Spring back to the nearest front-facing turn.
    turn.set(Math.round(turn.get() / 360) * 360);
  };

  return (
    <motion.button
      type="button"
      aria-label={`${product.name}, ${product.colorName}. Click to explore`}
      className="absolute cursor-pointer outline-none"
      style={{
        left: center(index) - RAIL.w * HOOK.x,
        top: RAIL.y - RAIL.h * HOOK.y - 1,
        width: RAIL.w,
        height: RAIL.h,
        transformOrigin: `${HOOK.x * 100}% ${HOOK.y * 100}%`,
        zIndex: active ? 50 : 10 + index,
        perspective: 900,
      }}
      initial={reduce ? false : { y: -60, opacity: 0, rotate: -8 }}
      animate={{ x, scale, rotate: tilt, y: 0, opacity: 1 }}
      transition={{
        x: { type: "spring", stiffness: 220, damping: 24 },
        scale: { type: "spring", stiffness: 240, damping: 22 },
        rotate: { type: "spring", stiffness: 120, damping: 8 },
        y: { type: "spring", stiffness: 140, damping: 12, delay: reduce ? 0 : 0.25 + index * 0.06 },
        opacity: { duration: 0.4, delay: reduce ? 0 : 0.25 + index * 0.06 },
      }}
      onPointerEnter={() => setHovered(index)}
      onPointerLeave={() => {
        setHovered(null);
        settle();
      }}
      onPointerMove={(e) => {
        if (reduce || !active) return;
        if (lastX.current !== null) turn.set(turn.get() + (e.clientX - lastX.current) * 1.6);
        lastX.current = e.clientX;
        // When the pointer rests, finish the turn on the nearest face (never edge-on).
        if (idle.current) clearTimeout(idle.current);
        idle.current = setTimeout(() => turn.set(Math.round(turn.get() / 180) * 180), 220);
      }}
      onFocus={() => setHovered(index)}
      onBlur={() => setHovered(null)}
      onClick={() => onOpen(product)}
    >
      <span
        className={reduce ? "block size-full" : "block size-full animate-[mo-sway_6s_ease-in-out_infinite]"}
        style={{
          transformOrigin: `${HOOK.x * 100}% ${HOOK.y * 100}%`,
          animationDelay: `${-index * 0.7}s`,
        }}
      >
        <motion.span
          className="relative block size-full"
          style={{ rotateY, transformStyle: "preserve-3d", transformOrigin: `${HOOK.x * 100}% 50%` }}
        >
          <span className="absolute inset-0 [backface-visibility:hidden]">
            <GarmentArt product={product} />
          </span>
          <span className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]">
            <GarmentArt product={product} back />
          </span>
        </motion.span>
      </span>
    </motion.button>
  );
}

export function Rod() {
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute"
      style={{ left: 0, top: RAIL.y - 80, width: 1440, height: 100 }}
      viewBox={`0 ${RAIL.y - 80} 1440 100`}
    >
      <defs>
        <linearGradient id="mo-rod" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#f4f4f2" />
          <stop offset=".35" stopColor="#b9bbbd" />
          <stop offset=".7" stopColor="#8a8c8f" />
          <stop offset="1" stopColor="#5e6063" />
        </linearGradient>
      </defs>
      {/* ceiling brackets */}
      {[RAIL.left + 18, RAIL.right - 18].map((x) => (
        <g key={x}>
          <rect x={x - 2.5} y={RAIL.y - 80} width="5" height="80" fill="url(#mo-rod)" />
          <rect x={x - 11} y={RAIL.y - 80} width="22" height="5" rx="1.5" fill="#6f7174" />
          <circle cx={x} cy={RAIL.y + 3} r="7" fill="url(#mo-rod)" />
        </g>
      ))}
      <rect x={RAIL.left} y={RAIL.y - 1} width={RAIL.right - RAIL.left} height="8" rx="4" fill="url(#mo-rod)" />
      <rect x={RAIL.left - 4} y={RAIL.y - 3} width="9" height="12" rx="3" fill="#5e6063" />
      <rect x={RAIL.right - 5} y={RAIL.y - 3} width="9" height="12" rx="3" fill="#5e6063" />
    </svg>
  );
}

export function Rail({ onOpen, reduce }: { onOpen: (p: Product) => void; reduce: boolean }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const p = hovered === null ? null : PRODUCTS[hovered];
  const cardX = useSpring(720, { stiffness: 160, damping: 24 });
  useEffect(() => {
    cardX.set(hovered === null ? 720 : Math.min(1120, Math.max(320, center(hovered))));
  }, [hovered, cardX]);

  return (
    <>
      <Rod />
      {PRODUCTS.map((product, i) => (
        <RailItem
          key={product.id}
          product={product}
          index={i}
          hovered={hovered}
          setHovered={setHovered}
          onOpen={onOpen}
          reduce={reduce}
        />
      ))}

      {/* Details card: centred at rest, glides under the hovered garment */}
      <motion.div
        className="absolute top-[520px] w-[360px] text-center"
        style={{ left: cardX, x: "-50%" }}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: reduce ? 0 : 1.1, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="h-[22px]">
          <AnimatePresence mode="wait">
            {p && (
              <motion.p
                key={p.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="text-[12px] tracking-[0.12em] text-neutral-500 uppercase"
              >
                {p.name} <span className="mx-1 text-neutral-300">·</span> {p.colorName}
                <span className="mx-1 text-neutral-300">·</span> {p.price} KM
              </motion.p>
            )}
          </AnimatePresence>
        </div>
        <p className="mt-1 text-[24px] font-medium tracking-[-0.02em] text-neutral-900">From Sarajevo, with love.</p>
        <p className="mt-1.5 text-[13px] text-neutral-500">Hover to turn. Click to explore</p>
        <button
          type="button"
          onClick={() => onOpen(p ?? PRODUCTS[0])}
          className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-neutral-300 bg-white px-5 py-2 text-[12.5px] font-medium text-neutral-800 shadow-sm transition-colors hover:bg-neutral-50"
        >
          Explore Molimao <ArrowUpRight className="size-3.5" />
        </button>
      </motion.div>
    </>
  );
}
