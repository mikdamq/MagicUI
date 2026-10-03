"use client";

import { motion, useReducedMotion } from "motion/react";
import dynamic from "next/dynamic";
import { Lexend } from "next/font/google";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";
import { ArrowDot, SwapCard, WalletModal } from "./swap-card";
import { TOKEN_ORDER, type TokenId } from "./tokens";

const CoinsCanvas = dynamic(() => import("./coins-canvas"), { ssr: false });

const font = Lexend({ subsets: ["latin"], weight: ["300", "400", "500", "600"] });

const EASE = [0.22, 1, 0.36, 1] as const;
const NAV = ["Bridge", "Developers", "deExplorer", "Learn", "Analytics"];
const LEGAL = ["License", "Privacy Policy", "Terms of Use"];
const CARD_W = 528;

function subscribeMd(cb: () => void) {
  const mq = window.matchMedia("(min-width: 768px)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}
function useIsMd() {
  return useSyncExternalStore<boolean | null>(
    subscribeMd,
    () => window.matchMedia("(min-width: 768px)").matches,
    () => null,
  );
}

function Socials() {
  const cls =
    "grid size-[47px] place-items-center rounded-[11px] bg-black text-white transition-transform hover:-translate-y-0.5 hover:scale-105";
  return (
    <div className="flex gap-[13px]">
      <a href="#" aria-label="Telegram" className={cls}>
        <svg viewBox="0 0 24 24" className="size-[22px]" fill="currentColor" aria-hidden>
          <path d="M21.4 3.6 2.9 10.8c-1.2.5-1.2 1.3 0 1.6l4.7 1.5 1.8 5.6c.2.6.4.8.9.8.4 0 .6-.2.9-.5l2.3-2.2 4.7 3.5c.9.5 1.5.2 1.7-.8l3.1-14.6c.3-1.3-.5-1.9-1.6-1.4ZM9.9 14.7l-.4 4-1.6-5 9.5-6-7.5 7Z" />
        </svg>
      </a>
      <a href="#" aria-label="X" className={cls}>
        <svg viewBox="0 0 24 24" className="size-[19px]" fill="currentColor" aria-hidden>
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </a>
      <a href="#" aria-label="LinkedIn" className={cn(cls, "text-[22px] font-medium tracking-[-0.04em]")}>
        in
      </a>
    </div>
  );
}

export default function OneSecHero() {
  const reduce = useReducedMotion() ?? false;
  const isMd = useIsMd();
  const [connected, setConnected] = useState(false);
  const [modal, setModal] = useState(false);
  const [pulses, setPulses] = useState<Record<TokenId, number>>(
    () => Object.fromEntries(TOKEN_ORDER.map((t) => [t, 0])) as Record<TokenId, number>,
  );
  const [coinsReady, setCoinsReady] = useState(false);

  const pulse = (id: TokenId) => setPulses((p) => ({ ...p, [id]: p[id] + 1 }));
  const connect = () => (connected ? setConnected(false) : setModal(true));
  const onConnected = () => {
    setModal(false);
    setConnected(true);
    // Celebrate: every coin flips.
    setPulses((p) => Object.fromEntries(TOKEN_ORDER.map((t) => [t, p[t] + 1])) as Record<TokenId, number>);
  };

  // Scale the card to the height left between header and footer.
  const slot = useRef<HTMLDivElement>(null);
  const cardBox = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number | null>(null);
  useEffect(() => {
    const el = slot.current;
    const box = cardBox.current;
    if (!el || !box) return;
    const fit = () => {
      const { clientWidth: w, clientHeight: h } = el;
      const cardH = box.offsetHeight; // unaffected by the scale transform
      if (!w || !h || !cardH) return;
      // Capped below 1: the card reads best a touch smaller than the 1:1 design.
      setScale(Math.min(0.84, (h - 32) / cardH, (w * 0.42) / CARD_W));
    };
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    ro.observe(box);
    return () => ro.disconnect();
  }, []);

  const card = <SwapCard connected={connected} onConnect={() => setModal(true)} onPick={pulse} />;

  return (
    <div
      className={cn(font.className, "relative min-h-screen overflow-clip text-black antialiased")}
      style={{
        background:
          "radial-gradient(60% 50% at 85% 20%, rgba(120,180,255,.35), transparent 70%), linear-gradient(180deg, #3574e2 0%, #5b86e6 22%, #8d9be8 45%, #b5abed 65%, #dcc3f1 85%, #ecc9f0 100%)",
      }}
    >
      <section className="relative flex min-h-svh flex-col md:h-svh md:min-h-[640px]">
        {/* Coins (desktop: full hero, five coins resting along an invisible arc) */}
        <div
          className={cn(
            "pointer-events-auto absolute inset-0 z-[1] hidden transition-opacity duration-700 md:block",
            coinsReady ? "opacity-100" : "opacity-0",
          )}
        >
          {isMd === true && (
            <CoinsCanvas mobile={false} pulses={pulses} animate={!reduce} onReady={() => setCoinsReady(true)} />
          )}
        </div>

        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE }}
          className="pointer-events-none relative z-20 flex items-center justify-between px-5 pt-5 md:px-[61px] md:pt-[clamp(16px,2.6vh,28px)]"
        >
          <div className="pointer-events-auto flex items-center gap-[52px]">
            <a
              href="#"
              aria-label="1SEC home"
              className="grid size-[52px] place-items-center rounded-[14px] bg-black transition-transform hover:scale-105 md:size-[60px]"
            >
              <span className="text-[16px] leading-none font-semibold tracking-[-0.02em] whitespace-nowrap text-white md:text-[18px]">
                1SEC
              </span>
            </a>
            <nav className="hidden gap-[42px] lg:flex">
              {NAV.map((n, i) => (
                <a
                  key={n}
                  href="#"
                  className={cn(
                    "text-[17px] transition-colors",
                    i === 0 ? "text-[#1d2a6b]" : "text-[#2f45a3]/75 hover:text-[#1d2a6b]",
                  )}
                >
                  {n}
                </a>
              ))}
            </nav>
          </div>
          <button
            type="button"
            onClick={connect}
            className="pointer-events-auto flex h-[46px] items-center gap-3 rounded-[14px] bg-black px-4 text-[15px] text-white transition-transform hover:scale-[1.03] md:h-[51px] md:px-[16px] md:text-[17px]"
          >
            {connected ? (
              <>
                <span className="size-2 rounded-full bg-[#7cf0a8] shadow-[0_0_8px_#7cf0a8]" />
                0x7a3…f91c
              </>
            ) : (
              <>
                Connect wallet <ArrowDot />
              </>
            )}
          </button>
        </motion.header>

        {/* Mobile coins */}
        <div className="relative h-[300px] md:hidden">
          {isMd === false && <CoinsCanvas mobile pulses={pulses} animate={!reduce} />}
        </div>

        {/* Card */}
        <div ref={slot} className="pointer-events-none relative z-10 flex-1 px-5 md:min-h-0 md:px-0">
          <div
            ref={cardBox}
            className="pointer-events-auto md:absolute md:top-1/2 md:left-[68px] md:origin-left md:[transform:translateY(-50%)_scale(var(--card-scale))]"
            style={
              {
                "--card-scale": scale ?? 0.8,
                visibility: isMd && scale === null ? "hidden" : undefined,
              } as React.CSSProperties
            }
          >
            <motion.div
              initial={reduce ? false : { opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.2, ease: EASE }}
            >
              {card}
            </motion.div>
          </div>
        </div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="pointer-events-none relative z-20 flex flex-col items-center gap-5 px-5 pt-10 pb-8 md:flex-row md:justify-between md:px-[61px] md:pt-0 md:pb-[clamp(14px,2.4vh,26px)]"
        >
          <p className="text-[16px] text-black md:w-[300px]">
            <sup className="mr-1 text-[9px]">©</sup>2025 ONESEC
          </p>
          <nav className="pointer-events-auto flex gap-6 md:gap-[40px]">
            {LEGAL.map((l) => (
              <a key={l} href="#" className="text-[14px] text-[#5a5a8c] transition-colors hover:text-black md:text-[16px]">
                {l}
              </a>
            ))}
          </nav>
          <div className="pointer-events-auto flex md:w-[300px] md:justify-end">
            <Socials />
          </div>
        </motion.footer>
      </section>

      <WalletModal open={modal} onClose={() => setModal(false)} onConnected={onConnected} />
    </div>
  );
}
