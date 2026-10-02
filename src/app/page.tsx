import { ShowcaseCard } from "@/components/gallery/showcase-card";
import { getItemsByCategory, registry } from "@/registry";

export default function GalleryPage() {
  const groups = getItemsByCategory();

  return (
    <main className="relative mx-auto w-full max-w-6xl flex-1 px-4 py-20 sm:px-8 sm:py-28">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-96 opacity-60 blur-3xl"
        style={{
          background:
            "radial-gradient(50% 60% at 50% 0%, color-mix(in oklab, var(--accent) 22%, transparent), transparent)",
        }}
      />

      <header className="max-w-3xl">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted">
          MagicUI · {registry.length} {registry.length === 1 ? "piece" : "pieces"}
        </p>
        <h1 className="mt-6 font-display text-6xl leading-[0.95] tracking-tight sm:text-8xl">
          Interfaces with a little <em className="text-accent">magic</em>.
        </h1>
        <p className="mt-6 max-w-xl text-lg text-muted">
          A living gallery of hero sections, website sections, components and
          full landing pages, each crafted to feel alive.
        </p>
      </header>

      {registry.length === 0 ? (
        <section className="mt-24 rounded-2xl border border-dashed border-border p-12 text-center">
          <p className="font-display text-3xl">The canvas is empty.</p>
          <p className="mt-2 text-sm text-muted">
            Register a piece in{" "}
            <code className="font-mono text-foreground">src/registry/index.ts</code>{" "}
            and it will appear here.
          </p>
        </section>
      ) : (
        <div className="mt-24 space-y-20">
          {groups
            .filter((g) => g.items.length > 0)
            .map((group) => (
              <section key={group.category} id={group.category}>
                <div className="mb-6 flex items-baseline justify-between border-b border-border pb-3">
                  <h2 className="text-sm font-medium uppercase tracking-[0.2em]">
                    {group.label}
                  </h2>
                  <span className="font-mono text-xs text-muted">
                    {String(group.items.length).padStart(2, "0")}
                  </span>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {group.items.map((item) => (
                    <ShowcaseCard key={item.slug} item={item} />
                  ))}
                </div>
              </section>
            ))}
        </div>
      )}
    </main>
  );
}
