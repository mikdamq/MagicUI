# MagicUI

A living gallery of creative **hero sections**, **website sections**, **components** and **landing pages**.

## Stack

- Next.js 16 (App Router) with TypeScript
- Tailwind CSS v4
- Motion (`motion/react`), GSAP + ScrollTrigger (`@gsap/react`), Three.js with React Three Fiber and Drei
- `cn()` helper (`clsx` + `tailwind-merge`) in `src/lib/utils.ts`

## Getting started

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm lint
pnpm build
```

## Structure

```
src/
  app/
    page.tsx                  Gallery index, grouped by category
    showcase/[slug]/page.tsx  Full-screen preview of a single piece
  components/
    heroes/                   Hero sections
    sections/                 Website sections (features, pricing, testimonials…)
    landing-pages/            Complete multi-section landing pages
    ui/                       Small reusable primitives (buttons, badges…)
    gallery/                  Gallery chrome only
  registry/index.ts           Single source of truth for everything shown
  lib/utils.ts                cn() and shared helpers
```

## Adding a new piece

1. Create the component, e.g. `src/components/heroes/aurora-hero.tsx`, with a default export.
   Add `"use client"` at the top if it uses animation, hooks or WebGL.
2. Register it in `src/registry/index.ts`:

   ```ts
   {
     slug: "aurora-hero",
     title: "Aurora Hero",
     description: "Shader-driven aurora with a magnetic CTA.",
     category: "hero",
     tech: ["three", "motion"],
     createdAt: "2026-10-02",
     load: () => import("@/components/heroes/aurora-hero"),
   }
   ```

3. It appears on the gallery and at `/showcase/aurora-hero`.

Bigger pieces can be a folder (`src/components/heroes/aurora-hero/index.tsx`) with their own sub-components, shaders and assets.
