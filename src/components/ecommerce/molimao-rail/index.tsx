"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowUpRight, Check, Menu, RotateCw, X } from "lucide-react";
import { Inter } from "next/font/google";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { GarmentArt, GarmentDefs, type Product } from "./garment";
import { PRODUCTS, Rail } from "./rail";

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });

const EASE = [0.22, 1, 0.36, 1] as const;
const STAGE = { w: 1440, h: 680 };
const TICKER = ["From Sarajevo, with love", "Designed & produced in BiH", "Molimao Sarajevo"];
const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

function Logo() {
  return (
    <a href="#" className="flex items-center gap-2.5 text-neutral-950" aria-label="Molimao home">
      <svg viewBox="0 0 12 40" className="h-[26px] w-[8px]" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden>
        <ellipse cx="6" cy="8" rx="2" ry="4" />
        <path d="M6 13 L6 37" />
        <path d="M4.6 2.6 L6 0.8 L7.4 2.6" />
      </svg>
      <span className="text-[19px] font-extrabold tracking-[0.34em]">MOLIMAO</span>
    </a>
  );
}

function Header({ bag }: { bag: number }) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: EASE }}
      className="relative z-30 grid h-[84px] grid-cols-3 items-center px-6 md:px-12"
    >
      <button type="button" className="flex items-center gap-2.5 justify-self-start text-[13px] font-semibold tracking-[0.16em] text-neutral-900 uppercase">
        <Menu className="size-[18px]" strokeWidth={1.8} />
        Menu
      </button>
      <div className="justify-self-center">
        <Logo />
      </div>
      <a href="#" className="group flex items-center gap-1 justify-self-end text-[13px] font-semibold tracking-[0.16em] text-neutral-900 uppercase">
        Shop
        <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={1.8} />
        <AnimatePresence>
          {bag > 0 && (
            <motion.span
              key={bag}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="ml-1 grid size-[18px] place-items-center rounded-full bg-[#c65a2e] text-[10px] font-bold tracking-normal text-white"
            >
              {bag}
            </motion.span>
          )}
        </AnimatePresence>
      </a>
    </motion.header>
  );
}

function Breadcrumb() {
  return (
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.15 }}
      className="text-center text-[11.5px] font-medium tracking-[0.22em] text-neutral-500 uppercase"
    >
      On the rail <span className="mx-3 text-neutral-300">|</span> Molimao / Sarajevo
    </motion.p>
  );
}

function Ticker({ reduce }: { reduce: boolean }) {
  const row = (
    <span className="flex shrink-0 items-center">
      {[...TICKER, ...TICKER].map((t, i) => (
        <span key={i} className="flex items-center">
          <span className="px-6">{t}</span>
          <span aria-hidden>+</span>
        </span>
      ))}
    </span>
  );
  return (
    <div className="relative z-30 flex h-[40px] items-center overflow-hidden bg-[#c65a2e] text-[12px] font-semibold tracking-[0.18em] whitespace-nowrap text-[#fbefe6] uppercase">
      <div className={cn("flex", !reduce && "animate-[mo-marquee_32s_linear_infinite]")}>
        {row}
        {row}
      </div>
    </div>
  );
}

function ProductDrawer({
  product,
  onClose,
  onAdd,
}: {
  product: Product | null;
  onClose: () => void;
  onAdd: () => void;
}) {
  const [back, setBack] = useState(false);
  const [size, setSize] = useState("M");
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!product) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [product, onClose]);

  return (
    <AnimatePresence
      onExitComplete={() => {
        setBack(false);
        setAdded(false);
      }}
    >
      {product && (
        <motion.div className="fixed inset-0 z-[80]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-[#2a2018]/25 backdrop-blur-[2px]" onClick={onClose} />
          <motion.aside
            role="dialog"
            aria-modal
            aria-label={product.name}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
            className="absolute inset-y-0 right-0 flex w-full max-w-[460px] flex-col overflow-y-auto bg-[#faf8f3] px-8 pt-6 pb-8 shadow-[-30px_0_60px_-20px_rgba(60,40,20,.25)]"
          >
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-medium tracking-[0.22em] text-neutral-500 uppercase">On the rail</p>
              <button type="button" onClick={onClose} aria-label="Close" className="grid size-9 place-items-center rounded-full hover:bg-neutral-200/60">
                <X className="size-5" />
              </button>
            </div>
            <div className="relative mx-auto mt-2 h-[380px] w-[260px] [perspective:1000px]">
              <motion.div
                className="relative size-full"
                style={{ transformStyle: "preserve-3d" }}
                animate={{ rotateY: back ? 180 : 0 }}
                transition={{ type: "spring", stiffness: 90, damping: 16 }}
              >
                <span className="absolute inset-0 [backface-visibility:hidden]">
                  <GarmentArt product={product} />
                </span>
                <span className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]">
                  <GarmentArt product={product} back />
                </span>
              </motion.div>
            </div>
            <button
              type="button"
              onClick={() => setBack((b) => !b)}
              className="mx-auto mt-1 flex items-center gap-1.5 text-[12px] font-medium text-neutral-600 hover:text-neutral-950"
            >
              <RotateCw className="size-3.5" /> Turn to {back ? "front" : "back"}
            </button>
            <div className="mt-6 flex items-baseline justify-between">
              <h2 className="text-[24px] font-semibold tracking-[-0.02em]">{product.name}</h2>
              <p className="text-[18px] font-medium">{product.price} KM</p>
            </div>
            <p className="mt-1 flex items-center gap-2 text-[13px] text-neutral-500">
              <span className="size-3 rounded-full ring-1 ring-black/10" style={{ background: product.color }} />
              {product.colorName} · Organic cotton · Designed & produced in BiH
            </p>
            <p className="mt-6 text-[11px] font-medium tracking-[0.2em] text-neutral-500 uppercase">Size</p>
            <div className="mt-2 grid grid-cols-6 gap-2">
              {SIZES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSize(s)}
                  className={cn(
                    "h-10 rounded-full border text-[12.5px] font-medium transition-colors",
                    s === size ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-300 bg-white hover:border-neutral-500",
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => {
                setAdded(true);
                onAdd();
              }}
              className="mt-6 flex h-12 items-center justify-center gap-2 rounded-full bg-neutral-950 text-[14px] font-semibold text-white transition-colors hover:bg-[#c65a2e]"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={String(added)}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="flex items-center gap-2"
                >
                  {added ? (
                    <>
                      <Check className="size-4" /> Added · size {size}
                    </>
                  ) : (
                    <>Add to bag · {product.price} KM</>
                  )}
                </motion.span>
              </AnimatePresence>
            </button>
            <p className="mt-4 text-center text-[12px] text-neutral-500">Free shipping across BiH · Returns within 30 days</p>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function MolimaoRail() {
  const reduce = useReducedMotion() ?? false;
  const [open, setOpen] = useState<Product | null>(null);
  const [bag, setBag] = useState(0);
  const stageBox = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState<{ scale: number; top: number } | null>(null);

  useEffect(() => {
    const el = stageBox.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const { clientWidth: w, clientHeight: h } = el;
      if (!w || !h) return;
      const scale = Math.min(1.15, w / STAGE.w, h / STAGE.h);
      setFit({ scale, top: Math.max(0, (h - STAGE.h * scale) / 2) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div className={cn(inter.className, "min-h-screen bg-[#f7f5f0] text-neutral-950 antialiased")}>
      <style>{`
        @keyframes mo-sway { 0%,100% { transform: rotate(-0.7deg); } 50% { transform: rotate(0.7deg); } }
        @keyframes mo-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
      `}</style>
      <GarmentDefs />

      <section className="relative flex min-h-svh flex-col overflow-clip md:h-svh md:min-h-[620px]">
        <Header bag={bag} />
        <Breadcrumb />

        {/* Desktop / tablet: the rail, scaled to fit */}
        <div ref={stageBox} className="relative hidden min-h-0 flex-1 md:block">
          <div
            className="absolute left-1/2 origin-top"
            style={{
              width: STAGE.w,
              height: STAGE.h,
              top: fit?.top ?? 0,
              transform: `translateX(-50%) scale(${fit?.scale ?? 1})`,
              visibility: fit === null ? "hidden" : "visible",
            }}
          >
            <Rail onOpen={setOpen} reduce={reduce} />
          </div>
        </div>

        {/* Mobile: swipe along the rail, tap to explore */}
        <div className="flex flex-1 flex-col justify-center md:hidden">
          <div className="relative">
            <div className="absolute inset-x-0 top-[6px] h-[6px] rounded-full bg-gradient-to-b from-[#e8e8e6] via-[#a9abad] to-[#6d6f72]" />
            <div className="flex snap-x snap-mandatory gap-1 overflow-x-auto px-[calc(50%-80px)] pb-4 [scrollbar-width:none]">
              {PRODUCTS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setOpen(p)}
                  className="relative h-[240px] w-[160px] shrink-0 snap-center"
                  aria-label={`${p.name}, ${p.colorName}`}
                >
                  <GarmentArt product={p} />
                </button>
              ))}
            </div>
          </div>
          <div className="mt-6 px-6 text-center">
            <p className="text-[22px] font-medium tracking-[-0.02em]">From Sarajevo, with love.</p>
            <p className="mt-1.5 text-[13px] text-neutral-500">Swipe the rail. Tap to explore</p>
            <button
              type="button"
              onClick={() => setOpen(PRODUCTS[0])}
              className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-neutral-300 bg-white px-5 py-2 text-[12.5px] font-medium text-neutral-800 shadow-sm"
            >
              Explore Molimao <ArrowUpRight className="size-3.5" />
            </button>
          </div>
          <div className="h-10" />
        </div>

        <Ticker reduce={reduce} />
      </section>

      <ProductDrawer product={open} onClose={() => setOpen(null)} onAdd={() => setBag((b) => b + 1)} />
    </div>
  );
}
