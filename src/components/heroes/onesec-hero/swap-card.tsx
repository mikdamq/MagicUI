"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowLeftRight, ArrowRight, Check, ChevronDown, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { TOKEN_ORDER, TOKENS, TokenIcon, type TokenId } from "./tokens";

const EASE = [0.22, 1, 0.36, 1] as const;

export function fmt(n: number) {
  if (!isFinite(n) || n === 0) return "0";
  if (n >= 1000) return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
  if (n >= 1) return n.toLocaleString("en-US", { maximumFractionDigits: 2 });
  return n.toLocaleString("en-US", { maximumSignificantDigits: 3 });
}

/** Round black arrow-in-circle used on the CTAs. */
export function ArrowDot({ className }: { className?: string }) {
  return (
    <span className={cn("grid size-[19px] place-items-center rounded-full bg-white text-black", className)}>
      <ArrowRight className="size-3" strokeWidth={3} />
    </span>
  );
}

function TokenPicker({
  value,
  onPick,
  big,
}: {
  value: TokenId;
  onPick: (id: TokenId) => void;
  big?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const t = TOKENS[value];

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="group flex items-center gap-[23px] rounded-2xl text-left"
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={value}
            initial={{ rotateY: 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: -90, opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="inline-block"
          >
            <TokenIcon id={value} />
          </motion.span>
        </AnimatePresence>
        <span className="min-w-[100px]">
          <span className={cn("block leading-tight text-black", big ? "text-[26px]" : "text-[22px]")}>
            {t.name}
          </span>
          <span className="block text-[16px] leading-tight text-neutral-500">{t.chain}</span>
        </span>
        <ChevronDown
          className={cn("ml-1 size-5 text-black transition-transform group-hover:translate-y-0.5", open && "rotate-180")}
          strokeWidth={2.2}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            className="absolute top-full left-0 z-40 mt-2 w-[280px] rounded-2xl border border-neutral-100 bg-white p-1.5 shadow-[0_24px_50px_-16px_rgba(40,30,120,.35)]"
          >
            {TOKEN_ORDER.map((id) => (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => {
                    onPick(id);
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-colors hover:bg-[#f2f0ff]"
                >
                  <TokenIcon id={id} size={34} badge={false} />
                  <span className="flex-1">
                    <span className="block text-[15px] text-black">{TOKENS[id].name}</span>
                    <span className="block text-[12px] text-neutral-500">{TOKENS[id].chain}</span>
                  </span>
                  <span className="text-[12px] text-neutral-400 tabular-nums">${fmt(TOKENS[id].usd)}</span>
                  {id === value && <Check className="size-4 text-[#6b4ce6]" />}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

const WALLETS = [
  { name: "Browser extension", hint: "Detected", dot: "#f6851b" },
  { name: "Mobile wallet", hint: "Scan a QR code", dot: "#3b99fc" },
  { name: "Hardware wallet", hint: "USB or Bluetooth", dot: "#111" },
];

export function WalletModal({
  open,
  onClose,
  onConnected,
}: {
  open: boolean;
  onClose: () => void;
  onConnected: () => void;
}) {
  const [connecting, setConnecting] = useState<string | null>(null);

  const pick = (name: string) => {
    setConnecting(name);
    setTimeout(() => {
      setConnecting(null);
      onConnected();
    }, 1300);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[90] grid place-items-center bg-[#1b1b4d]/30 p-5 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal
            aria-label="Connect a wallet"
            onClick={(e) => e.stopPropagation()}
            initial={{ y: 30, scale: 0.94, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 20, scale: 0.96, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
            className="w-full max-w-[380px] rounded-[28px] bg-white p-6 shadow-[0_40px_80px_-20px_rgba(30,20,90,.45)]"
          >
            <div className="flex items-center justify-between">
              <p className="text-[22px] text-black">Connect wallet</p>
              <button type="button" onClick={onClose} className="text-[13px] text-neutral-400 hover:text-black">
                Close
              </button>
            </div>
            <p className="mt-1 text-[13px] text-neutral-500">Demo only — no real wallet is accessed.</p>
            <ul className="mt-5 space-y-2">
              {WALLETS.map((w, i) => (
                <motion.li
                  key={w.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 + i * 0.05 }}
                >
                  <button
                    type="button"
                    disabled={!!connecting}
                    onClick={() => pick(w.name)}
                    className="flex w-full items-center gap-3 rounded-2xl border border-neutral-100 bg-neutral-50 px-4 py-3.5 text-left transition hover:border-[#c9bdfc] hover:bg-[#f5f2ff] disabled:opacity-60"
                  >
                    <span className="size-8 rounded-xl" style={{ background: w.dot }} />
                    <span className="flex-1">
                      <span className="block text-[15px] text-black">{w.name}</span>
                      <span className="block text-[12px] text-neutral-500">{w.hint}</span>
                    </span>
                    {connecting === w.name ? (
                      <Loader2 className="size-4 animate-spin text-[#6b4ce6]" />
                    ) : (
                      <ArrowRight className="size-4 text-neutral-400" />
                    )}
                  </button>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function SwapCard({
  connected,
  onConnect,
  onPick,
}: {
  connected: boolean;
  onConnect: () => void;
  onPick: (id: TokenId) => void;
}) {
  const [pay, setPay] = useState<TokenId>("ETH");
  const [recv, setRecv] = useState<TokenId>("POL");
  const [amount, setAmount] = useState("0.1");
  const [flips, setFlips] = useState(0);
  const [status, setStatus] = useState<"idle" | "routing" | "done">("idle");

  const rate = TOKENS[pay].usd / TOKENS[recv].usd;
  const value = parseFloat(amount) || 0;
  const out = value * rate;

  const choose = (side: "pay" | "recv", id: TokenId) => {
    const other = side === "pay" ? recv : pay;
    if (id === other) {
      setPay(recv);
      setRecv(pay);
    } else if (side === "pay") setPay(id);
    else setRecv(id);
    setStatus("idle");
    onPick(id);
  };

  const flip = () => {
    setPay(recv);
    setRecv(pay);
    setFlips((f) => f + 1);
    setStatus("idle");
    onPick(recv);
  };

  const act = () => {
    if (!connected) return onConnect();
    if (status === "routing" || value <= 0) return;
    setStatus("routing");
    setTimeout(() => setStatus("done"), 1500);
  };

  return (
    <div className="relative w-full rounded-[25px] bg-white px-7 pt-9 pb-8 shadow-[0_30px_80px_-30px_rgba(30,30,110,.45)] sm:w-[528px] sm:px-[54px] sm:pt-[48px] sm:pb-[46px]">
      <h1 className="text-[36px] leading-[1] tracking-[0.005em] text-black sm:text-[43px]">
        Find the
        <br />
        best route
      </h1>
      <p className="mt-[18px] text-[15px] text-neutral-700 sm:text-[17px]">4x audited multi chain liquidity aggregator</p>

      <p className="mt-[34px] text-[17px] text-black">You pay</p>
      <div className="mt-3 flex items-center justify-between gap-3">
        <TokenPicker value={pay} onPick={(id) => choose("pay", id)} />
        <input
          value={amount}
          inputMode="decimal"
          aria-label="Amount to pay"
          onChange={(e) => {
            const v = e.target.value.replace(",", ".");
            if (/^\d*\.?\d{0,8}$/.test(v)) {
              setAmount(v);
              setStatus("idle");
            }
          }}
          className="w-full min-w-0 bg-transparent text-right text-[40px] leading-none tracking-[-0.01em] text-black tabular-nums outline-none placeholder:text-neutral-300 sm:text-[45px]"
          placeholder="0"
        />
      </div>

      <div className="mt-[28px] flex items-center gap-[23px]">
        <motion.button
          type="button"
          onClick={flip}
          aria-label="Flip pay and receive"
          animate={{ rotate: flips * 180 }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          transition={{ type: "spring", stiffness: 260, damping: 18 }}
          className="grid size-[59px] place-items-center rounded-full bg-[#f3f3f6] text-black transition-colors hover:bg-[#ebe8fb]"
        >
          <ArrowLeftRight className="size-6" strokeWidth={1.8} />
        </motion.button>
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={`${pay}-${recv}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="text-[16px] text-neutral-500 tabular-nums"
          >
            1{TOKENS[pay].id} = {fmt(rate)} {TOKENS[recv].name}
          </motion.p>
        </AnimatePresence>
      </div>

      <p className="mt-[34px] text-[17px] text-black">You receive</p>
      <div className="mt-3 flex items-center justify-between gap-3">
        <TokenPicker value={recv} onPick={(id) => choose("recv", id)} big />
        <motion.span
          key={`${out}`}
          initial={{ opacity: 0.3, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="truncate text-right text-[26px] leading-none text-neutral-400 tabular-nums"
        >
          ≈ {fmt(out)}
        </motion.span>
      </div>

      <motion.button
        type="button"
        onClick={act}
        whileTap={{ scale: 0.98 }}
        className="group relative mt-[50px] flex h-[71px] w-full items-center justify-center gap-3 overflow-hidden rounded-[14px] bg-black text-[20px] text-white shadow-[0_14px_30px_-12px_rgba(0,0,0,.5)]"
      >
        <span
          aria-hidden
          className="absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-[420%]"
        />
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={`${connected}-${status}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="relative flex items-center gap-3"
          >
            {!connected && (
              <>
                Connect wallet <ArrowDot />
              </>
            )}
            {connected && status === "idle" && (
              <>
                Bridge {fmt(value)} {TOKENS[pay].id} <ArrowDot />
              </>
            )}
            {connected && status === "routing" && (
              <>
                <Loader2 className="size-5 animate-spin" /> Finding the best route…
              </>
            )}
            {connected && status === "done" && (
              <>
                <Check className="size-5" /> Done in 1 sec
              </>
            )}
          </motion.span>
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {status === "done" && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden text-center text-[13px] text-neutral-500"
          >
            <span className="block pt-3">
              {fmt(out)} {TOKENS[recv].name} arrived on {TOKENS[recv].chain} (demo)
            </span>
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
