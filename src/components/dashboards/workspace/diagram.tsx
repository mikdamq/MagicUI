"use client";

import {
  animate,
  AnimatePresence,
  motion,
  motionValue,
  useMotionTemplate,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
  type MotionValue,
} from "motion/react";
import {
  Copy,
  LayoutDashboard,
  LayoutTemplate,
  LocateFixed,
  MoreHorizontal,
  PanelsTopLeft,
  Rocket,
  TrendingUp,
} from "lucide-react";
import {
  createContext,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";
import { AvatarStack } from "./parts";

export type View = "diagram" | "flow" | "map";

/** Stage scale, so pointer deltas map to canvas units. */
export const ScaleContext = createContext(1);

type NodeId =
  | "mobile"
  | "pipeline"
  | "process"
  | "rinko"
  | "product"
  | "upper"
  | "landing"
  | "client"
  | "release";
type Pos = { x: number; y: number };

const LAYOUTS: Record<View, Record<NodeId, Pos>> = {
  diagram: {
    mobile: { x: 0, y: -54 },
    pipeline: { x: 18, y: 38 },
    process: { x: 63, y: 202 },
    rinko: { x: 303, y: 72 },
    product: { x: 258, y: 117 },
    upper: { x: 606, y: -34 },
    landing: { x: 0, y: 322 },
    client: { x: 548, y: 322 },
    release: { x: 290, y: 440 },
  },
  flow: {
    pipeline: { x: 18, y: 24 },
    process: { x: 64, y: 34 },
    mobile: { x: 64, y: 110 },
    rinko: { x: 320, y: 16 },
    product: { x: 304, y: 56 },
    upper: { x: 640, y: 20 },
    client: { x: 640, y: 150 },
    landing: { x: 64, y: 250 },
    release: { x: 340, y: 250 },
  },
  map: {
    pipeline: { x: 18, y: 30 },
    rinko: { x: 302, y: 20 },
    product: { x: 258, y: 112 },
    process: { x: 120, y: 60 },
    mobile: { x: 70, y: 140 },
    upper: { x: 600, y: 40 },
    client: { x: 590, y: 200 },
    landing: { x: 90, y: 280 },
    release: { x: 300, y: 300 },
  },
};

const SIZE: Record<NodeId, { w: number; h: number }> = {
  mobile: { w: 218, h: 108 },
  pipeline: { w: 30, h: 330 },
  process: { w: 108, h: 56 },
  rinko: { w: 218, h: 28 },
  product: { w: 305, h: 143 },
  upper: { w: 262, h: 100 },
  landing: { w: 274, h: 82 },
  client: { w: 280, h: 82 },
  release: { w: 240, h: 74 },
};

type NodeMV = { x: MotionValue<number>; y: MotionValue<number> };

/* ------------------------------ Node shell ------------------------------ */

function DraggableNode({
  mv,
  size,
  children,
  z = 1,
}: {
  mv: NodeMV;
  size: { w: number; h: number };
  children: ReactNode;
  z?: number;
}) {
  const scale = useContext(ScaleContext);
  const [dragging, setDragging] = useState(false);
  return (
    <motion.div
      className={cn(
        "absolute touch-none select-none",
        dragging ? "cursor-grabbing" : "cursor-grab",
      )}
      style={{
        x: mv.x,
        y: mv.y,
        width: size.w,
        height: size.h,
        zIndex: dragging ? 30 : z,
      }}
      animate={{
        scale: dragging ? 1.02 : 1,
        filter: dragging
          ? "drop-shadow(0 14px 18px rgba(60,40,120,.18))"
          : "drop-shadow(0 0 0 rgba(0,0,0,0))",
      }}
      onPointerDown={(e) => {
        e.stopPropagation();
        e.currentTarget.setPointerCapture(e.pointerId);
        setDragging(true);
      }}
      onPointerMove={(e) => {
        if (!dragging) return;
        mv.x.set(mv.x.get() + e.movementX / scale);
        mv.y.set(mv.y.get() + e.movementY / scale);
      }}
      onPointerUp={() => setDragging(false)}
      onPointerCancel={() => setDragging(false)}
    >
      {children}
    </motion.div>
  );
}

function Trend({ value, days }: { value: string; days: string }) {
  return (
    <span className="inline-flex h-[18px] shrink-0 items-center gap-1 rounded-full whitespace-nowrap border border-[#ececf0] bg-white px-1.5 text-[9.5px] text-neutral-800">
      <TrendingUp className="size-[11px] text-[#22c55e]" strokeWidth={2} />
      {value} <span className="text-neutral-300">{days}</span>
    </span>
  );
}

function Meta({
  assign,
  deadline,
  priority,
  tone,
}: {
  assign?: string[];
  deadline: string;
  priority: string;
  tone: "high" | "low";
}) {
  return (
    <div className="flex items-end gap-[14px] rounded-[10px] bg-white px-[10px] pt-[6px] pb-[8px]">
      {assign && (
        <div>
          <p className="text-[8.5px] text-neutral-300">Assign</p>
          <div className="mt-[4px]">
            <AvatarStack names={assign} size={17} more={1} />
          </div>
        </div>
      )}
      <div>
        <p className="text-[8.5px] text-neutral-300">Deadline</p>
        <p className="mt-[5px] text-[11px] whitespace-nowrap text-neutral-900">
          {deadline}
        </p>
      </div>
      <div>
        <p className="text-[8.5px] text-neutral-300">Priority</p>
        <p
          className={cn(
            "mt-[5px] text-[11px] whitespace-nowrap",
            tone === "high" ? "text-[#ef4444]" : "text-[#fdba74]",
          )}
        >
          {priority}
        </p>
      </div>
    </div>
  );
}

function ProjectCard({
  Icon,
  title,
  trend,
  days,
  by,
  updated,
  children,
  className,
}: {
  Icon: typeof Copy;
  title: string;
  trend: string;
  days: string;
  by: string;
  updated: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "h-full rounded-[14px] border border-[#ececf0] bg-[#fbfbfc] p-[8px] transition-colors hover:border-[#d9cff5]",
        className,
      )}
    >
      <div className="flex items-center gap-[10px] px-[4px] pt-[3px]">
        <span className="grid size-[31px] place-items-center rounded-[9px] border border-[#ececf0] bg-white text-neutral-700">
          <Icon className="size-[15px]" strokeWidth={1.6} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-[13px] font-medium text-neutral-950">
              {title}
            </p>
            <Trend value={trend} days={days} />
          </div>
          <p className="mt-[3px] truncate text-[8.5px] text-neutral-300">
            By <span className="text-neutral-600">{by}</span>{" "}
            <span className="mx-0.5">|</span> Last update{" "}
            <span className="text-neutral-600">{updated}</span>
          </p>
        </div>
      </div>
      {children && <div className="mt-[10px]">{children}</div>}
    </div>
  );
}

function Pipeline() {
  const steps = [
    {
      label: "Fix",
      h: 50,
      bg: "bg-white text-neutral-400 ring-1 ring-[#e5e5ea]",
    },
    {
      label: "Solve",
      h: 56,
      bg: "bg-gradient-to-b from-[#fbd34d] to-[#f59e0b] text-white",
    },
    {
      label: "Process",
      h: 68,
      bg: "bg-gradient-to-b from-[#c084fc] to-[#9333ea] text-white",
    },
    {
      label: "Start",
      h: 58,
      bg: "bg-gradient-to-b from-[#fb7185] to-[#e11d48] text-white",
    },
  ];
  return (
    <div className="relative flex h-full flex-col items-center gap-[34px]">
      <span className="absolute top-[40px] bottom-[60px] w-[3px] rounded-full bg-gradient-to-b from-[#e5e5ea] via-[#c084fc] to-[#fb7185]" />
      {steps.map((s) => (
        <span
          key={s.label}
          className={cn(
            "relative grid w-[24px] place-items-center rounded-full shadow-[0_6px_12px_-6px_rgba(0,0,0,.25)]",
            s.bg,
          )}
          style={{ height: s.h }}
        >
          <span className="-rotate-90 text-[9px] font-medium whitespace-nowrap">
            {s.label}
          </span>
        </span>
      ))}
    </div>
  );
}

/* ------------------------------- Edges ------------------------------- */

type Anchor = (n: Pos) => Pos;
const mid = {
  left:
    (id: NodeId): Anchor =>
    (p) => ({ x: p.x, y: p.y + SIZE[id].h / 2 + (id === "product" ? -1 : 0) }),
  right:
    (id: NodeId): Anchor =>
    (p) => ({ x: p.x + SIZE[id].w, y: p.y + SIZE[id].h / 2 }),
  top:
    (id: NodeId, dx?: number): Anchor =>
    (p) => ({ x: p.x + (dx ?? SIZE[id].w / 2), y: p.y }),
  bottom:
    (id: NodeId, dx?: number): Anchor =>
    (p) => ({ x: p.x + (dx ?? SIZE[id].w / 2), y: p.y + SIZE[id].h }),
};

type EdgeDef = {
  from: NodeId;
  to: NodeId;
  a: Anchor;
  b: Anchor;
  route: "vh" | "hv" | "vhv";
};

const EDGES: EdgeDef[] = [
  {
    from: "mobile",
    to: "product",
    a: mid.bottom("mobile", 73),
    b: mid.left("product"),
    route: "vh",
  },
  {
    from: "product",
    to: "upper",
    a: mid.right("product"),
    b: mid.bottom("upper", 142),
    route: "hv",
  },
  {
    from: "product",
    to: "client",
    a: mid.right("product"),
    b: mid.top("client", 106),
    route: "hv",
  },
  {
    from: "product",
    to: "release",
    a: mid.bottom("product"),
    b: mid.top("release"),
    route: "vhv",
  },
];

function Edge({ def, nodes }: { def: EdgeDef; nodes: Record<NodeId, NodeMV> }) {
  const f = nodes[def.from];
  const t = nodes[def.to];
  const d = useTransform([f.x, f.y, t.x, t.y], ([fx, fy, tx, ty]: number[]) => {
    const a = def.a({ x: fx, y: fy });
    const b = def.b({ x: tx, y: ty });
    if (def.route === "vh") return `M${a.x} ${a.y} V${b.y} H${b.x}`;
    if (def.route === "hv") return `M${a.x} ${a.y} H${b.x} V${b.y}`;
    const my = (a.y + b.y) / 2;
    return `M${a.x} ${a.y} V${my} H${b.x} V${b.y}`;
  });
  const ax = useTransform([f.x, f.y], ([x, y]: number[]) => def.a({ x, y }).x);
  const ay = useTransform([f.x, f.y], ([x, y]: number[]) => def.a({ x, y }).y);
  const bx = useTransform([t.x, t.y], ([x, y]: number[]) => def.b({ x, y }).x);
  const by = useTransform([t.x, t.y], ([x, y]: number[]) => def.b({ x, y }).y);
  return (
    <g>
      <motion.path
        d={d}
        fill="none"
        stroke="#a59bd2"
        strokeWidth={1.3}
        strokeDasharray="5 5"
        animate={{ strokeDashoffset: [0, -20] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
      />
      <motion.circle cx={ax} cy={ay} r={3} fill="#9d8ad9" />
      <motion.circle cx={bx} cy={by} r={3} fill="#9d8ad9" />
    </g>
  );
}

/* ------------------------------- Canvas ------------------------------- */

export type Extra = { id: string; title: string; mv: NodeMV };

export function useDiagram() {
  const [nodes] = useState<Record<NodeId, NodeMV>>(() => {
    const base = LAYOUTS.diagram;
    return Object.fromEntries(
      (Object.keys(base) as NodeId[]).map((id) => [
        id,
        { x: motionValue(base[id].x), y: motionValue(base[id].y) },
      ]),
    ) as Record<NodeId, NodeMV>;
  });
  const panX = useMotionValue(0);
  const panY = useMotionValue(0);

  const setView = (v: View) => {
    const target = LAYOUTS[v];
    (Object.keys(target) as NodeId[]).forEach((id, i) => {
      const opts = {
        type: "spring" as const,
        stiffness: 140,
        damping: 20,
        delay: i * 0.03,
      };
      animate(nodes[id].x, target[id].x, opts);
      animate(nodes[id].y, target[id].y, opts);
    });
    animate(panX, 0, { type: "spring", stiffness: 140, damping: 22 });
    animate(panY, 0, { type: "spring", stiffness: 140, damping: 22 });
  };

  return { nodes, panX, panY, setView };
}

export function DiagramCanvas({
  diagram,
  extras,
  className,
}: {
  diagram: ReturnType<typeof useDiagram>;
  extras: Extra[];
  className?: string;
}) {
  const { nodes, panX, panY } = diagram;
  const scale = useContext(ScaleContext);
  const panning = useRef(false);
  const [grabbing, setGrabbing] = useState(false);
  const [offCenter, setOffCenter] = useState(false);
  const checkPan = () =>
    setOffCenter(Math.abs(panX.get()) > 4 || Math.abs(panY.get()) > 4);
  useMotionValueEvent(panX, "change", checkPan);
  useMotionValueEvent(panY, "change", checkPan);
  const bgPos = useMotionTemplate`${panX}px ${panY}px`;
  const n = nodes;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[18px] border border-[#ececf0] bg-[#fafafb]",
        grabbing ? "cursor-grabbing" : "cursor-grab",
        className,
      )}
      onPointerDown={(e) => {
        panning.current = true;
        setGrabbing(true);
        e.currentTarget.setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        if (!panning.current) return;
        panX.set(panX.get() + e.movementX / scale);
        panY.set(panY.get() + e.movementY / scale);
      }}
      onPointerUp={() => {
        panning.current = false;
        setGrabbing(false);
      }}
      onPointerCancel={() => {
        panning.current = false;
        setGrabbing(false);
      }}
    >
      <motion.div
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(#dcdce3 1px, transparent 1.2px)",
          backgroundSize: "14px 14px",
          backgroundPosition: bgPos,
        }}
      />
      <motion.div className="absolute inset-0" style={{ x: panX, y: panY }}>
        <svg
          className="pointer-events-none absolute top-0 left-0 overflow-visible"
          width="1"
          height="1"
          aria-hidden
        >
          {EDGES.map((e) => (
            <Edge key={`${e.from}-${e.to}`} def={e} nodes={n} />
          ))}
        </svg>

        <DraggableNode mv={n.mobile} size={SIZE.mobile}>
          <div className="flex h-full flex-col justify-between rounded-[14px] border border-[#ececf0] bg-[#fbfbfc] p-[8px]">
            <div className="flex items-center gap-2 px-1 pt-1">
              <span className="grid size-[24px] place-items-center rounded-[7px] border border-[#ececf0] bg-white">
                <PanelsTopLeft className="size-[13px]" strokeWidth={1.6} />
              </span>
              <p className="text-[12px] font-medium">Mobile App</p>
            </div>
            <div className="flex items-end gap-[14px] px-1 pb-[2px]">
              <AvatarStack names={["p8"]} size={16} more={1} />
              <div>
                <p className="text-[8.5px] text-neutral-300">Deadline</p>
                <p className="mt-[3px] text-[11px] whitespace-nowrap text-neutral-900">
                  Sep 02 - Sep 09
                </p>
              </div>
              <div>
                <p className="text-[8.5px] text-neutral-300">Priority</p>
                <p className="mt-[3px] text-[11px] whitespace-nowrap text-[#fdba74]">
                  Low Priority
                </p>
              </div>
            </div>
          </div>
        </DraggableNode>

        <DraggableNode mv={n.pipeline} size={SIZE.pipeline} z={4}>
          <Pipeline />
        </DraggableNode>

        <DraggableNode mv={n.process} size={SIZE.process} z={5}>
          <div className="h-full rounded-[10px] bg-white px-[10px] py-[7px] shadow-[0_8px_18px_-10px_rgba(60,40,120,.3)]">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-[9.5px] text-[#9333ea]">
                <span className="size-[9px] rounded-full border-[1.5px] border-[#9333ea]" />{" "}
                Process
              </span>
              <span className="grid size-[12px] place-items-center rounded-[3px] bg-[#a855f7] text-[8px] text-white">
                ✓
              </span>
            </div>
            <p className="mt-[5px] text-[8.5px] text-neutral-500">
              ▢ &nbsp;Dec 19 - Dec 24
            </p>
            <p className="mt-[3px] text-[8.5px] text-neutral-400">5 Days</p>
          </div>
        </DraggableNode>

        <DraggableNode mv={n.rinko} size={SIZE.rinko}>
          <div className="flex h-full items-center justify-between rounded-[8px] bg-[#f1f1f4] px-[8px] text-[12.5px] text-neutral-800">
            <span className="flex items-center gap-1.5">
              <svg
                viewBox="0 0 24 24"
                className="size-[14px]"
                fill="none"
                stroke="#9333ea"
                strokeWidth="1.8"
                aria-hidden
              >
                <path d="M4 5h16M4 19h16M8 8v8M12 8v8M16 8v8" />
              </svg>
              Rinko Project
            </span>
            <MoreHorizontal className="size-4 text-neutral-400" />
          </div>
        </DraggableNode>

        <DraggableNode mv={n.product} size={SIZE.product} z={3}>
          <div className="h-full rounded-[16px] border border-[#e6e3f2] bg-white/70 p-[6px] shadow-[0_10px_30px_-18px_rgba(60,40,120,.35)]">
            <ProjectCard
              Icon={Copy}
              title="Product Page"
              trend="%24"
              days="In 3 Days"
              by="Lamar"
              updated="Yesterday, 04:32 PM"
              className="bg-[#f6f6f8]"
            >
              <Meta
                assign={["p1", "p2", "p4", "p7"]}
                deadline="Dec 19 - Dec 24"
                priority="High Priority"
                tone="high"
              />
            </ProjectCard>
          </div>
        </DraggableNode>

        <DraggableNode mv={n.upper} size={SIZE.upper}>
          <div className="flex h-full flex-col justify-between rounded-[14px] border border-[#ececf0] bg-[#fbfbfc] p-[8px]">
            <div className="flex items-center gap-2 px-1">
              <span className="grid size-[24px] place-items-center rounded-[7px] border border-[#ececf0] bg-white">
                <LayoutTemplate className="size-[13px]" strokeWidth={1.6} />
              </span>
              <div>
                <p className="text-[12px] font-medium">Design System</p>
                <p className="text-[8.5px] text-neutral-300">
                  By <span className="text-neutral-600">Lamar</span> | Last
                  update{" "}
                  <span className="text-neutral-600">Yesterday, 04:32</span>
                </p>
              </div>
            </div>
            <Meta
              assign={["p3", "p5", "p8", "p2"]}
              deadline="May 11 - May 21"
              priority="Low"
              tone="low"
            />
          </div>
        </DraggableNode>

        <DraggableNode mv={n.landing} size={SIZE.landing}>
          <ProjectCard
            Icon={LayoutDashboard}
            title="Landing Page"
            trend="%14"
            days="In 1 Days"
            by="Emmie"
            updated="Today, 23:56 PM"
          />
        </DraggableNode>

        <DraggableNode mv={n.client} size={SIZE.client}>
          <ProjectCard
            Icon={LayoutDashboard}
            title="Client Dashboard"
            trend="%564"
            days="In 6 Days"
            by="Mike"
            updated="Today, 15:42 PM"
          />
        </DraggableNode>

        <DraggableNode mv={n.release} size={SIZE.release}>
          <ProjectCard
            Icon={Rocket}
            title="Release v2.0"
            trend="%8"
            days="In 9 Days"
            by="Sarah"
            updated="Today, 09:10 AM"
          />
        </DraggableNode>

        <AnimatePresence>
          {extras.map((x) => (
            <motion.div
              key={x.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <DraggableNode mv={x.mv} size={{ w: 210, h: 60 }} z={6}>
                <div className="flex h-full items-center gap-2 rounded-[12px] border border-dashed border-[#c4b5fd] bg-white px-3 shadow-[0_10px_24px_-14px_rgba(124,58,237,.5)]">
                  <span className="grid size-[26px] place-items-center rounded-[8px] bg-[#f3e8ff] text-[#9333ea]">
                    +
                  </span>
                  <div>
                    <p className="text-[12px] font-medium">{x.title}</p>
                    <p className="text-[8.5px] text-neutral-400">
                      Drag me anywhere
                    </p>
                  </div>
                </div>
              </DraggableNode>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {offCenter && (
          <motion.button
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => {
              animate(panX, 0, { type: "spring", stiffness: 140, damping: 22 });
              animate(panY, 0, { type: "spring", stiffness: 140, damping: 22 });
            }}
            className="absolute right-3 bottom-3 z-40 flex items-center gap-1 rounded-full border border-[#ececf0] bg-white/90 px-2.5 py-1 text-[10.5px] text-neutral-600 backdrop-blur transition-colors hover:text-neutral-950"
          >
            <LocateFixed className="size-3" /> Recenter
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

export function newExtra(count: number, panX: number, panY: number): Extra {
  return {
    id: `extra-${count}`,
    title: `New task ${count}`,
    mv: {
      x: motionValue(300 - panX + count * 14),
      y: motionValue(150 - panY + count * 12),
    },
  };
}
