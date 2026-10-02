import Link from "next/link";
import type { ShowcaseItem } from "@/registry";

export function ShowcaseCard({ item }: { item: ShowcaseItem }) {
  return (
    <Link
      href={`/showcase/${item.slug}`}
      className="group relative flex flex-col justify-between gap-10 overflow-hidden rounded-2xl border border-border bg-surface p-6 transition-colors hover:border-accent/50"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(400px circle at 50% 0%, color-mix(in oklab, var(--accent) 14%, transparent), transparent 70%)",
        }}
      />
      <div className="relative">
        <h3 className="font-display text-3xl leading-tight">{item.title}</h3>
        <p className="mt-2 text-sm text-muted">{item.description}</p>
      </div>
      <div className="relative flex items-center justify-between">
        <ul className="flex flex-wrap gap-1.5">
          {item.tech.map((t) => (
            <li
              key={t}
              className="rounded-full border border-border px-2.5 py-0.5 font-mono text-[11px] uppercase tracking-wider text-muted"
            >
              {t}
            </li>
          ))}
        </ul>
        <span
          aria-hidden
          className="text-muted transition-transform duration-300 group-hover:translate-x-1 group-hover:text-accent"
        >
          →
        </span>
      </div>
    </Link>
  );
}
