"use client";

import { AnimatePresence, motion } from "motion/react";
import {
  Bell,
  ChevronDown,
  ClipboardCopy,
  CloudUpload,
  Globe,
  Info,
  LayoutGrid,
  ListChecks,
  Lock,
  Map as MapIcon,
  Megaphone,
  MoreHorizontal,
  PlusCircle,
  Send,
  Settings,
  SquareKanban,
  Workflow,
} from "lucide-react";
import { Inter } from "next/font/google";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";
import { DiagramCanvas, newExtra, ScaleContext, useDiagram, type Extra, type View } from "./diagram";
import { LatestTaskCard, MailsCard, SprintCard, TimeCard } from "./kpis";
import { Avatar, AvatarStack, Logo } from "./parts";
import { Collapsible, IconRail, Sidebar } from "./sidebar";

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600"] });
const EASE = [0.22, 1, 0.36, 1] as const;
const STAGE = { w: 1316, h: 936 };

type Tab = "overview" | "board" | "list";

const TASKS = [
  { title: "Token Design System", status: "In Progress", due: "Dec 19 - Dec 24", priority: "High", people: ["p1", "p2", "p7"] },
  { title: "Product Page", status: "In Progress", due: "Dec 19 - Dec 24", priority: "High", people: ["p4", "p5"] },
  { title: "Landing Page", status: "To do", due: "Dec 26 - Dec 30", priority: "Medium", people: ["emie"] },
  { title: "Client Dashboard", status: "Review", due: "Jan 02 - Jan 08", priority: "Medium", people: ["p8", "p3"] },
  { title: "Mobile App", status: "To do", due: "Sep 02 - Sep 09", priority: "Low", people: ["p8"] },
  { title: "Release v2.0", status: "Done", due: "Jan 12 - Jan 21", priority: "Low", people: ["sarah", "p2"] },
];

/* ------------------------------ Top bar ------------------------------ */

function TopBar({ tab, setTab }: { tab: Tab; setTab: (t: Tab) => void }) {
  const tabs: { id: Tab; label: string; Icon: typeof LayoutGrid }[] = [
    { id: "overview", label: "Overview", Icon: LayoutGrid },
    { id: "board", label: "Board", Icon: SquareKanban },
    { id: "list", label: "List", Icon: ListChecks },
  ];
  return (
    <div className="flex h-[85px] items-center justify-between pr-[22px] pl-[40px]">
      <div className="flex items-center gap-[31px]">
        <Logo className="size-[36px]" />
        <div className="flex items-center gap-[15px]">
          {tabs.map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={cn(
                "relative flex h-[35px] items-center gap-[7px] rounded-full px-[15px] text-[13.5px] text-neutral-900 transition-colors",
                tab === id ? "" : "border border-[#e9eaee] hover:bg-[#f6f7f9]",
              )}
            >
              {tab === id && (
                <motion.span layoutId="wd-tab" className="absolute inset-0 rounded-full bg-[#f1f2f5]" transition={{ type: "spring", stiffness: 380, damping: 32 }} />
              )}
              <Icon className="relative size-[16px]" strokeWidth={1.6} />
              <span className="relative">{label}</span>
            </button>
          ))}
          <button type="button" aria-label="More views" className="grid size-[35px] place-items-center rounded-full border border-[#e9eaee] hover:bg-[#f6f7f9]">
            <MoreHorizontal className="size-4" />
          </button>
        </div>
      </div>
      <div className="flex items-center gap-[17px]">
        <button type="button" className="flex h-[35px] items-center gap-[7px] rounded-full border border-[#e9eaee] px-[15px] text-[13.5px] hover:bg-[#f6f7f9]">
          <Megaphone className="size-[16px] -scale-x-100" strokeWidth={1.6} /> Share
        </button>
        <div className="flex h-[35px] items-center rounded-full border border-[#e9eaee] px-[6px] text-neutral-800">
          {[ClipboardCopy, CloudUpload, Bell].map((I, i) => (
            <span key={i} className="flex items-center">
              {i > 0 && <span className="h-[14px] w-px bg-[#e9eaee]" />}
              <button type="button" className="relative grid size-[28px] place-items-center rounded-full hover:bg-[#f3f4f6]">
                <I className="size-[15px]" strokeWidth={1.6} />
                {I === Bell && <span className="absolute top-[6px] right-[7px] size-[5px] rounded-full bg-[#ef4444]" />}
              </button>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------- Overview body ---------------------------- */

function ViewBar({
  view,
  setView,
  onAdd,
}: {
  view: View;
  setView: (v: View) => void;
  onAdd: () => void;
}) {
  const [isPublic, setPublic] = useState(true);
  const [members, setMembers] = useState(false);
  const views: { id: View; label: string; Icon: typeof LayoutGrid }[] = [
    { id: "diagram", label: "Diagram", Icon: LayoutGrid },
    { id: "flow", label: "Flow Chart", Icon: Workflow },
    { id: "map", label: "Map", Icon: MapIcon },
  ];
  return (
    <div className="flex items-center justify-between">
      <div className="flex h-[35px] items-center gap-1 rounded-[10px] bg-[#f3f4f6] p-[3px]">
        {views.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setView(id)}
            className="relative flex h-full items-center gap-[7px] rounded-[8px] px-[12px] text-[13px] text-neutral-800"
          >
            {view === id && (
              <motion.span layoutId="wd-view" className="absolute inset-0 rounded-[8px] bg-white shadow-[0_1px_2px_rgba(16,24,40,.08)]" transition={{ type: "spring", stiffness: 380, damping: 32 }} />
            )}
            <Icon className="relative size-[15px]" strokeWidth={1.6} />
            <span className="relative">{label}</span>
          </button>
        ))}
      </div>
      <div className="flex items-center gap-[16px] text-[13px] text-neutral-900">
        <button type="button" onClick={() => setPublic((p) => !p)} className="flex items-center gap-1.5 hover:text-[#7c3aed]">
          {isPublic ? <Globe className="size-[15px]" strokeWidth={1.6} /> : <Lock className="size-[15px]" strokeWidth={1.6} />}
          {isPublic ? "Public" : "Private"}
        </button>
        <span className="h-[16px] w-px bg-[#e5e7eb]" />
        <div className="relative">
          <button type="button" onClick={() => setMembers((m) => !m)} className="flex items-center gap-1.5">
            4 Member <ChevronDown className={cn("size-4 text-neutral-400 transition-transform", members && "rotate-180")} />
          </button>
          <AnimatePresence>
            {members && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                className="absolute top-full right-0 z-50 mt-2 w-[210px] rounded-[14px] border border-[#ececf0] bg-white p-2 shadow-[0_20px_40px_-18px_rgba(16,24,40,.3)]"
              >
                {[
                  ["p1", "Lamar", "Owner"],
                  ["emie", "Emmie", "Editor"],
                  ["p8", "Mike", "Editor"],
                  ["sarah", "Sarah Wiliam", "You"],
                ].map(([a, n, r]) => (
                  <div key={n} className="flex items-center gap-2 rounded-[10px] px-2 py-1.5 hover:bg-[#f6f7f9]">
                    <Avatar name={a} size={24} />
                    <span className="flex-1 text-[12.5px]">{n}</span>
                    <span className="text-[11px] text-neutral-400">{r}</span>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <span className="h-[16px] w-px bg-[#e5e7eb]" />
        <button type="button" onClick={onAdd} className="flex items-center gap-1.5 hover:text-[#7c3aed]">
          <PlusCircle className="size-[16px]" strokeWidth={1.6} /> Add New
        </button>
        <span className="h-[16px] w-px bg-[#e5e7eb]" />
        <Info className="size-[16px]" strokeWidth={1.6} />
        <Settings className="size-[16px]" strokeWidth={1.6} />
        <MoreHorizontal className="size-[16px]" />
      </div>
    </div>
  );
}

function Activity() {
  const [text, setText] = useState("");
  const [posted, setPosted] = useState<string[]>([]);
  const submit = () => {
    if (!text.trim()) return;
    setPosted((p) => [text.trim(), ...p]);
    setText("");
  };
  return (
    <div>
      <div className="flex h-[22px] items-center gap-3">
        <p className="text-[14.5px] font-medium text-neutral-950">Activity</p>
        <AnimatePresence mode="popLayout">
          {posted[0] && (
            <motion.p
              key={posted.length}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="flex min-w-0 items-center gap-1.5 text-[12px] text-neutral-500"
            >
              <Avatar name="sarah" size={18} className="ring-0" />
              <span className="font-medium text-neutral-800">Sarah</span>
              <span className="truncate">“{posted[0]}”</span>
              <span className="text-neutral-300">· just now</span>
              {posted.length > 1 && <span className="rounded-full bg-[#f3e8ff] px-1.5 text-[10.5px] text-[#7c3aed]">+{posted.length - 1}</span>}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
      <label className="mt-[12px] flex h-[43px] items-center gap-2 rounded-[14px] border border-[#e3e5ea] pr-[6px] pl-[13px] transition focus-within:border-[#c9b6f4] focus-within:ring-4 focus-within:ring-[#ede5ff]">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="Leave a Comment..."
          aria-label="Leave a comment"
          className="min-w-0 flex-1 bg-transparent text-[13.5px] outline-none placeholder:text-neutral-400 placeholder:italic"
        />
        <AnimatePresence>
          {text.trim() && (
            <motion.button
              type="button"
              onClick={submit}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="grid size-[31px] place-items-center rounded-[10px] bg-[#8b3fe0] text-white"
              aria-label="Post comment"
            >
              <Send className="size-[14px]" />
            </motion.button>
          )}
        </AnimatePresence>
      </label>
    </div>
  );
}

function Overview() {
  const diagram = useDiagram();
  const [view, setViewState] = useState<View>("diagram");
  const [extras, setExtras] = useState<Extra[]>([]);
  return (
    <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex h-full flex-col">
      <div className="grid grid-cols-4 gap-[23px]">
        <MailsCard delay={0.1} />
        <LatestTaskCard delay={0.18} />
        <SprintCard delay={0.26} />
        <TimeCard delay={0.34} />
      </div>
      <div className="mt-[24px]">
        <ViewBar
          view={view}
          setView={(v) => {
            setViewState(v);
            diagram.setView(v);
          }}
          onAdd={() => setExtras((x) => [...x, newExtra(x.length + 1, diagram.panX.get(), diagram.panY.get())])}
        />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4, ease: EASE }}
        className="mt-[14px] min-h-0 flex-1"
      >
        <DiagramCanvas diagram={diagram} extras={extras} className="h-full" />
      </motion.div>
      <div className="mt-[28px]">
        <Activity />
      </div>
    </motion.div>
  );
}

/* ----------------------------- Board / List ----------------------------- */

const STATUS = ["To do", "In Progress", "Review", "Done"];
const PRIORITY: Record<string, string> = { High: "text-[#ef4444]", Medium: "text-[#f59e0b]", Low: "text-[#fdba74]" };

function Board() {
  return (
    <motion.div key="board" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="grid h-full grid-cols-4 gap-4">
      {STATUS.map((s) => (
        <div key={s} className="rounded-[18px] bg-[#f5f6f8] p-3">
          <p className="flex items-center justify-between px-1 text-[13px] font-medium">
            {s} <span className="text-[11.5px] text-neutral-400">{TASKS.filter((t) => t.status === s).length}</span>
          </p>
          <div className="mt-3 space-y-2.5">
            {TASKS.filter((t) => t.status === s).map((t, i) => (
              <motion.div
                key={t.title}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -2 }}
                className="rounded-[12px] border border-[#ececf0] bg-white p-3"
              >
                <p className="text-[13px] font-medium">{t.title}</p>
                <p className="mt-1 text-[11px] text-neutral-500">{t.due}</p>
                <div className="mt-3 flex items-center justify-between">
                  <AvatarStack names={t.people} size={20} />
                  <span className={cn("text-[11px]", PRIORITY[t.priority])}>{t.priority}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ))}
    </motion.div>
  );
}

function List() {
  return (
    <motion.div key="list" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="rounded-[18px] border border-[#ececf0]">
      <div className="grid grid-cols-[2fr_1fr_1.2fr_1fr_1fr] border-b border-[#ececf0] px-5 py-3 text-[11.5px] text-neutral-400">
        <span>Task</span>
        <span>Status</span>
        <span>Deadline</span>
        <span>Priority</span>
        <span>Assign</span>
      </div>
      {TASKS.map((t, i) => (
        <motion.label
          key={t.title}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.04 }}
          className="grid cursor-pointer grid-cols-[2fr_1fr_1.2fr_1fr_1fr] items-center border-b border-[#f1f1f4] px-5 py-3 text-[13px] last:border-0 hover:bg-[#fafafb]"
        >
          <span className="flex items-center gap-2.5">
            <input type="checkbox" defaultChecked={t.status === "Done"} className="peer size-4 accent-[#8b3fe0]" />
            <span className="peer-checked:text-neutral-400 peer-checked:line-through">{t.title}</span>
          </span>
          <span className="text-neutral-600">{t.status}</span>
          <span className="text-neutral-600">{t.due}</span>
          <span className={PRIORITY[t.priority]}>{t.priority}</span>
          <AvatarStack names={t.people} size={20} />
        </motion.label>
      ))}
    </motion.div>
  );
}

/* --------------------------------- App --------------------------------- */

function Workspace() {
  const [tab, setTab] = useState<Tab>("overview");
  const [nav, setNav] = useState("goals");
  const [sidebar, setSidebar] = useState(true);
  return (
    <div className="flex h-full flex-col rounded-[36px] bg-white shadow-[0_30px_80px_-40px_rgba(16,24,40,.35)]">
      <TopBar tab={tab} setTab={setTab} />
      <div className="mx-[22px] mb-[22px] flex min-h-0 flex-1 rounded-[28px] bg-[#f4f5f7]">
        <IconRail collapsed={!sidebar} onToggleSidebar={() => setSidebar((s) => !s)} />
        <Collapsible open={sidebar}>
          <Sidebar active={nav} onSelect={setNav} />
        </Collapsible>
        <div className="min-w-0 flex-1 p-[22px]">
          <div className="h-full rounded-[24px] bg-white p-[22px]">
            <AnimatePresence mode="wait">
              {tab === "overview" && <Overview key="o" />}
              {tab === "board" && <Board key="b" />}
              {tab === "list" && <List key="l" />}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

function subscribeMobile(cb: () => void) {
  const mq = window.matchMedia("(max-width: 767px)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

/** Phones get a stacked layout of the same live components. */
function MobileWorkspace() {
  const diagram = useDiagram();
  const [view, setView] = useState<View>("diagram");
  return (
    <div className="min-h-svh bg-[#f4f5f7] px-4 pt-4 pb-8">
      <div className="flex items-center justify-between rounded-[20px] bg-white px-4 py-3">
        <Logo className="size-[30px]" />
        <div className="flex items-center gap-2">
          <Avatar name="sarah" size={30} />
          <Bell className="size-[18px]" strokeWidth={1.6} />
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <MailsCard />
        <LatestTaskCard delay={0.06} />
        <SprintCard delay={0.12} />
        <TimeCard delay={0.18} />
      </div>
      <div className="mt-4 flex gap-1 rounded-[10px] bg-[#e9eaee] p-[3px] text-[12.5px]">
        {(["diagram", "flow", "map"] as View[]).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => {
              setView(v);
              diagram.setView(v);
            }}
            className={cn("flex-1 rounded-[8px] py-1.5 capitalize", view === v && "bg-white shadow-sm")}
          >
            {v === "flow" ? "Flow Chart" : v}
          </button>
        ))}
      </div>
      <DiagramCanvas diagram={diagram} extras={[]} className="mt-3 h-[420px] bg-white" />
      <div className="mt-6 rounded-[20px] bg-white p-4">
        <Activity />
      </div>
    </div>
  );
}

export default function WorkspaceDashboard() {
  const mobile = useSyncExternalStore(
    subscribeMobile,
    () => window.matchMedia("(max-width: 767px)").matches,
    () => false,
  );
  if (mobile) {
    return (
      <div className={cn(inter.className, "text-neutral-900 antialiased")}>
        <MobileWorkspace />
      </div>
    );
  }
  return <DesktopWorkspace />;
}

function DesktopWorkspace() {
  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number | null>(null);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const { clientWidth: w, clientHeight: h } = el;
      if (w && h) setScale(Math.min(1.1, (w - 40) / STAGE.w, (h - 40) / STAGE.h));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={box}
      className={cn(inter.className, "relative h-svh min-h-[560px] overflow-auto text-neutral-900 antialiased")}
      style={{
        background:
          "linear-gradient(120deg, transparent 58%, rgba(255,255,255,.45) 58% 72%, transparent 72%), linear-gradient(200deg, transparent 70%, rgba(255,255,255,.35) 70%), #e4e6ea",
      }}
    >
      <ScaleContext.Provider value={scale ?? 1}>
        <motion.div
          className="absolute top-1/2 left-1/2"
          style={{
            width: STAGE.w,
            height: STAGE.h,
            x: "-50%",
            y: "-50%",
            scale: scale ?? 1,
            visibility: scale === null ? "hidden" : "visible",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <Workspace />
        </motion.div>
      </ScaleContext.Provider>
    </div>
  );
}
