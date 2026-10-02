<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project conventions

This repo is a showcase gallery of creative heroes, sections, components and landing pages. See `README.md` for structure.

- Every piece lives in `src/components/{heroes,sections,landing-pages,ui}` and is registered in `src/registry/index.ts`. Nothing else is needed for it to show up.
- One piece = one default export that renders full-bleed. Each piece owns its own palette and fonts; the gallery tokens in `globals.css` are only for the gallery chrome.
- Pieces must be self-contained: no imports from other pieces, only from `ui/` and `lib/`.
- Motion: `motion/react` for UI and spring interactions, GSAP (`useGSAP` from `@gsap/react`) for scroll timelines, React Three Fiber for 3D. Respect `prefers-reduced-motion`.
- Must be responsive down to 360px wide, with no horizontal scroll.
- Run `pnpm lint` and `pnpm build` before committing.
