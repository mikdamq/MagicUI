"use client";

import {
  Archive,
  CalendarRange,
  ChevronDown,
  ClipboardList,
  Clock,
  FileText,
  Files,
  Home,
  Inbox,
  LogOut,
  NotebookPen,
  Plus,
  Search,
  Shapes,
  Waypoints,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { ComponentType, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Avatar, img, RailGlyph, WorkspaceTile } from "./parts";

type Item = {
  id: string;
  label: string;
  Icon?: ComponentType<{ className?: string; strokeWidth?: number }>;
  right?: ReactNode;
  sub?: boolean;
};

const GENERAL: Item[] = [
  { id: "dashboard", label: "Dashboard", Icon: Home },
  { id: "inbox", label: "inbox", Icon: Inbox, right: <span className="text-[11.5px] text-[#f59e0b]">New Message</span> },
  { id: "files", label: "Files", Icon: Files, right: <span className="text-[11.5px] text-neutral-400">24</span> },
  { id: "whiteboards", label: "Whiteboards", Icon: Shapes },
];

const PRIVATE: Item[] = [
  { id: "tasks", label: "Tasks", Icon: ClipboardList, sub: true },
  { id: "notes", label: "Note's", Icon: NotebookPen, sub: true, right: <span className="text-[11.5px] text-neutral-400">19</span> },
  { id: "timesheet", label: "Time Sheet", Icon: Clock, sub: true },
];

const SHARED: Item[] = [
  { id: "unplaning", label: "Un planing", Icon: CalendarRange },
  { id: "backlog", label: "Product Backlog", Icon: Waypoints },
  { id: "archive", label: "Archive", Icon: Archive, right: <span className="text-[11.5px] text-[#ef4444]">Storage Full !</span> },
  { id: "brief", label: "Rinko Brief.pdf", Icon: FileText },
];

function Row({ item, active, onSelect }: { item: Item; active: boolean; onSelect: (id: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(item.id)}
      className={cn(
        "group relative flex h-[34px] w-full items-center gap-[9px] rounded-[10px] text-left text-[14px] text-neutral-900 transition-colors",
        item.sub ? "pl-[14px]" : "pl-[13px]",
        active ? "bg-white shadow-[0_1px_3px_rgba(16,24,40,.06)]" : "hover:bg-white/60",
      )}
    >
      {item.sub && <span className={cn("size-[5px] rounded-full", active ? "bg-[#8b3fe0]" : "bg-neutral-300")} />}
      {item.Icon && <item.Icon className="size-[18px] text-neutral-800" strokeWidth={1.6} />}
      <span className="flex-1 truncate">{item.label}</span>
      {item.right && <span className="pr-1">{item.right}</span>}
    </button>
  );
}

export function IconRail({ onToggleSidebar, collapsed }: { onToggleSidebar: () => void; collapsed: boolean }) {
  const card = "grid size-[50px] place-items-center rounded-[14px] bg-white shadow-[0_1px_2px_rgba(16,24,40,.06),0_6px_14px_-8px_rgba(16,24,40,.18)] transition-transform hover:-translate-y-0.5";
  return (
    <div className="flex h-full w-[95px] shrink-0 flex-col items-center border-r border-[#e9eaee] pt-[22px] pb-[20px]">
      <button type="button" aria-label="Workspace" className="transition-transform hover:-translate-y-0.5">
        <WorkspaceTile />
      </button>
      <button type="button" aria-label="New workspace" className={cn(card, "mt-[23px]")}>
        <Plus className="size-5 text-neutral-800" strokeWidth={1.6} />
      </button>
      <span className="my-[23px] h-px w-[50px] bg-[#e3e4e8]" />
      <div className="flex flex-col gap-[23px]">
        {(["orange", "red", "teal", "green"] as const).map((k) => (
          <button key={k} type="button" aria-label={`${k} workspace`} className={card}>
            <RailGlyph kind={k} />
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={onToggleSidebar}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="mt-auto grid size-9 place-items-center rounded-full text-neutral-800 transition-colors hover:bg-white"
      >
        <LogOut className={cn("size-[18px] transition-transform", collapsed ? "" : "rotate-180")} strokeWidth={1.6} />
      </button>
    </div>
  );
}

export function Sidebar({ active, onSelect }: { active: string; onSelect: (id: string) => void }) {
  return (
    <div className="flex w-[245px] shrink-0 flex-col pt-[22px]">
      <button type="button" className="flex items-center gap-[13px] rounded-[12px] text-left">
        <span className="relative">
          <span className="grid size-[46px] place-items-center overflow-hidden rounded-[13px] bg-gradient-to-br from-[#fde7c7] to-[#f8c99a]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img("sarah")} alt="" className="size-[40px] translate-y-[3px]" />
          </span>
          <span className="absolute -top-0.5 -right-0.5 size-[9px] rounded-full bg-[#22c55e] ring-2 ring-[#f4f5f7]" />
        </span>
        <span className="flex-1">
          <span className="block text-[15px] font-medium text-neutral-950">Sarah Wiliam</span>
          <span className="block text-[12px] text-neutral-400">Pro Member</span>
        </span>
        <ChevronDown className="mr-1 size-[18px] text-neutral-800" strokeWidth={1.8} />
      </button>

      <label className="mt-[25px] flex h-[36px] items-center gap-2 rounded-[12px] border border-[#e3e5ea] bg-[#eceef2] px-3 text-neutral-500 transition focus-within:border-[#c9b6f4] focus-within:bg-white">
        <Search className="size-4 text-neutral-700" strokeWidth={1.8} />
        <input placeholder="Search..." aria-label="Search" className="min-w-0 flex-1 bg-transparent text-[13.5px] text-neutral-900 outline-none placeholder:text-neutral-700" />
        <span className="text-[11.5px] text-neutral-400">⌘ S</span>
      </label>

      <p className="mt-[24px] mb-[6px] pl-[13px] text-[11.5px] text-neutral-400">General</p>
      <div className="space-y-[3px]">
        {GENERAL.map((i) => (
          <Row key={i.id} item={i} active={active === i.id} onSelect={onSelect} />
        ))}
      </div>

      <p className="mt-[20px] mb-[6px] pl-[13px] text-[11.5px] text-neutral-400">Private Space</p>
      <button
        type="button"
        onClick={() => onSelect("goals")}
        className={cn(
          "flex h-[36px] w-full items-center gap-[9px] rounded-[10px] pl-[10px] text-left text-[14px] font-medium transition-colors",
          active === "goals" ? "bg-white shadow-[0_1px_3px_rgba(16,24,40,.06)]" : "hover:bg-white/60",
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={img("star")} alt="" className="size-[20px]" />
        This Year Goals
      </button>
      <div className="mt-[3px] space-y-[1px]">
        {PRIVATE.slice(0, 2).map((i) => (
          <Row key={i.id} item={i} active={active === i.id} onSelect={onSelect} />
        ))}
        <div className="flex h-[30px] items-center gap-[9px] pl-[14px] text-[13.5px] text-neutral-400 italic">
          <span className="size-[5px] rounded-full bg-[#f59e0b]" />
          <Avatar name="emie" size={18} className="ring-0" />
          Emie is typing
          <span className="-ml-1.5 flex gap-[2px] not-italic">
            {[0, 1, 2].map((d) => (
              <motion.span
                key={d}
                className="size-[3px] rounded-full bg-neutral-400"
                animate={{ y: [0, -3, 0], opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 0.9, repeat: Infinity, delay: d * 0.15 }}
              />
            ))}
          </span>
        </div>
        <Row item={PRIVATE[2]} active={active === PRIVATE[2].id} onSelect={onSelect} />
      </div>

      <p className="mt-[20px] mb-[6px] pl-[13px] text-[11.5px] text-neutral-400">Shared with you</p>
      <div className="space-y-[3px]">
        {SHARED.map((i) => (
          <Row key={i.id} item={i} active={active === i.id} onSelect={onSelect} />
        ))}
        <button type="button" className="flex h-[34px] w-full items-center gap-[9px] rounded-[10px] pl-[13px] text-left text-[14px] hover:bg-white/60">
          <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
            <circle cx="12" cy="6" r="3" />
            <circle cx="6" cy="17" r="3" />
            <circle cx="18" cy="17" r="3" />
          </svg>
          <span className="flex-1">More</span>
          <Plus className="mr-1 size-[18px]" strokeWidth={1.6} />
        </button>
      </div>
    </div>
  );
}

export function Collapsible({ open, children }: { open: boolean; children: ReactNode }) {
  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 267, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 30 }}
          className="shrink-0 overflow-hidden pl-[22px]"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
