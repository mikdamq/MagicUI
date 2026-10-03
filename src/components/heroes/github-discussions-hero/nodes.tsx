"use client";

import {
  ArrowUpIcon,
  CheckCircleFillIcon,
  CheckIcon,
  CommentDiscussionIcon,
  CommentIcon,
  WebhookIcon,
} from "@primer/octicons-react";
import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { useEffect, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const ASSET = "/showcase/github-discussions";
export const emoji = (name: string) => `${ASSET}/emoji/${name}.png`;
export const avatar = (n: number) => `${ASSET}/avatars/a${n}.svg`;

/** Ring centre in the 1440 × 990 design stage (behind the headline). */
export const CENTER = { x: 720, y: 438 };
export const RINGS = [360, 629, 900, 1180];

/* ------------------------------------------------------------------ */
/* Node data (design-stage coordinates = centre of each node)          */
/* ------------------------------------------------------------------ */

type Counter = { icon: "comment" | "up" | string; value: number };

export type Node =
  | { kind: "avatar"; x: number; y: number; n: number; size?: number }
  | { kind: "bubble"; x: number; y: number; emoji: string; counter: Counter; dx?: number; dy?: number }
  | { kind: "counter"; x: number; y: number; counter: Counter; plain?: boolean }
  | { kind: "answer"; x: number; y: number }
  | { kind: "check"; x: number; y: number }
  | { kind: "icon"; x: number; y: number; icon: "webhook" | "discussion" }
  | { kind: "emoji"; x: number; y: number; emoji: string; size: number };

export const NODES: Node[] = [
  // Left cluster
  { kind: "avatar", x: 282, y: 168, n: 1 },
  { kind: "counter", x: 265, y: 260, counter: { icon: "comment", value: 10 }, plain: true },
  { kind: "bubble", x: 108, y: 301, emoji: "grad", counter: { icon: "up", value: 4 }, dx: 22, dy: 29 },
  { kind: "avatar", x: 230, y: 356, n: 2 },
  { kind: "answer", x: 229, y: 447 },
  { kind: "icon", x: 168, y: 521, icon: "webhook" },
  { kind: "avatar", x: 117, y: 628, n: 3 },
  { kind: "emoji", x: 268, y: 630, emoji: "cat", size: 132 },
  { kind: "bubble", x: 160, y: 748, emoji: "megaphone", counter: { icon: "party", value: 4 }, dx: 29, dy: 32 },
  { kind: "counter", x: 414, y: 630, counter: { icon: "thumbs", value: 35 } },
  { kind: "avatar", x: 468, y: 698, n: 4 },
  // Right cluster
  { kind: "avatar", x: 971, y: 181, n: 5 },
  { kind: "counter", x: 1067, y: 328, counter: { icon: "comment", value: 32 }, plain: true },
  { kind: "bubble", x: 1282, y: 159, emoji: "speech", counter: { icon: "heart", value: 10 }, dx: 26, dy: 34 },
  { kind: "avatar", x: 1180, y: 257, n: 6 },
  { kind: "bubble", x: 1211, y: 371, emoji: "bulb", counter: { icon: "eyes", value: 4 }, dx: 0, dy: 40 },
  { kind: "counter", x: 1345, y: 351, counter: { icon: "up", value: 68 } },
  { kind: "avatar", x: 1206, y: 521, n: 7 },
  { kind: "avatar", x: 1327, y: 604, n: 8 },
  { kind: "avatar", x: 1176, y: 630, n: 9 },
  { kind: "check", x: 1116, y: 735 },
  { kind: "emoji", x: 1255, y: 767, emoji: "sparkles", size: 76 },
  { kind: "counter", x: 912, y: 741, counter: { icon: "up", value: 17 } },
  { kind: "icon", x: 720, y: 800, icon: "discussion" },
];

/** Thin connector lines between nodes. */
export const LINKS: string[] = [
  "M282 189 C272 236 256 296 238 336",
  "M230 376 L230 434",
  "M229 460 L229 492 C229 508 214 515 182 519",
  "M155 524 C112 534 104 566 112 608",
  "M122 648 C132 690 144 714 152 724",
  "M1290 193 C1310 248 1330 300 1342 340",
  "M1345 363 C1350 420 1349 470 1346 500 C1342 530 1336 562 1331 584",
  "M1211 420 L1211 470 C1211 482 1218 487 1232 489 L1326 501 C1340 503 1345 508 1346 514",
  "M1211 470 L1208 501",
  "M1204 541 C1200 574 1191 598 1183 610",
  "M1170 650 C1156 684 1136 709 1125 720",
  "M1320 624 C1302 676 1287 716 1275 742",
];

/* ------------------------------------------------------------------ */
/* Pieces                                                              */
/* ------------------------------------------------------------------ */

function CountUp({ value, delay }: { value: number; delay: number }) {
  const mv = useMotionValue(0);
  const text = useTransform(mv, (v) => Math.round(v).toString());
  useEffect(() => {
    const c = animate(mv, value, { duration: 1.2, delay, ease: [0.22, 1, 0.36, 1] });
    return () => c.stop();
  }, [mv, value, delay]);
  return <motion.span>{text}</motion.span>;
}

function CounterIcon({ icon }: { icon: string }) {
  if (icon === "comment") return <CommentIcon size={14} className="text-[#57606a]" />;
  if (icon === "up") return <ArrowUpIcon size={14} className="text-[#57606a]" />;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={emoji(icon)} alt="" className="size-[15px]" />;
}

export function CounterPill({ counter, plain, delay }: { counter: Counter; plain?: boolean; delay: number }) {
  return (
    <span
      className={cn(
        "inline-flex h-[24px] items-center gap-[5px] rounded-full px-[8px] text-[12.5px] font-medium whitespace-nowrap text-[#24292f]",
        plain ? "bg-white/90" : "border border-[#d8dee4] bg-white shadow-[0_1px_2px_rgba(31,35,40,.06)]",
      )}
    >
      <CounterIcon icon={counter.icon} />
      <CountUp value={counter.value} delay={delay} />
    </span>
  );
}

export function NodeView({ node, delay }: { node: Node; delay: number }) {
  let body: ReactNode = null;
  switch (node.kind) {
    case "avatar": {
      const size = node.size ?? 40;
      body = (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={avatar(node.n)}
          alt=""
          width={size}
          height={size}
          className="rounded-full bg-white shadow-[0_0_0_2px_#fff,0_2px_8px_rgba(31,35,40,.18)]"
        />
      );
      break;
    }
    case "bubble":
      body = (
        <span className="relative grid size-[66px] place-items-center rounded-full bg-[#eef0f3] shadow-[inset_0_-2px_6px_rgba(31,35,40,.05)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={emoji(node.emoji)} alt="" className="size-[38px] drop-shadow-sm" />
          <span className="absolute" style={{ left: `calc(50% + ${node.dx ?? 0}px)`, top: `calc(50% + ${node.dy ?? 0}px)`, transform: "translate(-50%,-50%)" }}>
            <CounterPill counter={node.counter} delay={delay + 0.3} />
          </span>
        </span>
      );
      break;
    case "counter":
      body = <CounterPill counter={node.counter} plain={node.plain} delay={delay + 0.2} />;
      break;
    case "answer":
      body = (
        <span className="inline-flex h-[26px] items-center gap-[6px] rounded-full border border-[#2da44e] bg-white px-[9px] text-[12.5px] font-medium whitespace-nowrap text-[#1a7f37]">
          <CheckCircleFillIcon size={14} className="text-[#1a7f37]" />
          Marked as answer
        </span>
      );
      break;
    case "check":
      body = (
        <span className="grid size-[50px] place-items-center rounded-full bg-white shadow-[0_0_0_2px_#aceebb,0_4px_14px_rgba(45,164,78,.25)]">
          <span className="grid size-[30px] place-items-center rounded-full bg-[#1f883d] text-white">
            <CheckIcon size={18} />
          </span>
        </span>
      );
      break;
    case "icon":
      body = (
        <span className="grid size-[26px] place-items-center rounded-full bg-white text-[#57606a]">
          {node.icon === "webhook" ? <WebhookIcon size={16} /> : <CommentDiscussionIcon size={16} />}
        </span>
      );
      break;
    case "emoji":
      body = (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={emoji(node.emoji)}
          alt=""
          width={node.size}
          height={node.size}
          className="drop-shadow-[0_10px_18px_rgba(110,60,170,.18)]"
        />
      );
      break;
  }

  return (
    <motion.div
      className="absolute"
      style={{ left: node.x, top: node.y, x: "-50%", y: "-50%" }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 18, delay }}
    >
      <motion.div
        whileHover={{ scale: node.kind === "emoji" ? 1.08 : 1.1, y: -2, rotate: node.kind === "emoji" ? -4 : 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 15 }}
        className="cursor-default"
      >
        {body}
      </motion.div>
    </motion.div>
  );
}
