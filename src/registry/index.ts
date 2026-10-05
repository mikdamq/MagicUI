import type { ComponentType } from "react";

export type ShowcaseCategory = "hero" | "section" | "component" | "landing-page" | "ecommerce";

export type ShowcaseTech = "motion" | "gsap" | "three" | "css" | "canvas";

export type ShowcaseItem = {
  /** URL segment: /showcase/<slug> */
  slug: string;
  title: string;
  description: string;
  category: ShowcaseCategory;
  tech: ShowcaseTech[];
  /** ISO date, used for sorting newest first. */
  createdAt: string;
  /** Lazy import so each piece only ships its own JS. */
  load: () => Promise<{ default: ComponentType }>;
};

export const CATEGORY_LABELS: Record<ShowcaseCategory, string> = {
  hero: "Hero Sections",
  section: "Website Sections",
  component: "Components",
  "landing-page": "Landing Pages",
  ecommerce: "E-commerce",
};

/**
 * Every hero, section, component and landing page is registered here.
 *
 * Example:
 * {
 *   slug: "aurora-hero",
 *   title: "Aurora Hero",
 *   description: "Shader-driven aurora with magnetic CTA.",
 *   category: "hero",
 *   tech: ["three", "motion"],
 *   createdAt: "2026-10-02",
 *   load: () => import("@/components/heroes/aurora-hero"),
 * },
 */
export const registry: ShowcaseItem[] = [
  {
    slug: "molimao-rail",
    title: "Molimao",
    description:
      "Virtual clothing rail: garments zoom off the rack, turn on hover and open into a product drawer.",
    category: "ecommerce",
    tech: ["motion", "css"],
    createdAt: "2026-10-05",
    load: () => import("@/components/ecommerce/molimao-rail"),
  },
  {
    slug: "github-discussions-hero",
    title: "GitHub Discussions",
    description:
      "Community hero with a living constellation of avatars, reactions and replies orbiting the headline.",
    category: "hero",
    tech: ["motion", "css"],
    createdAt: "2026-10-05",
    load: () => import("@/components/heroes/github-discussions-hero"),
  },
  {
    slug: "onesec-hero",
    title: "OneSec",
    description:
      "Web3 bridge hero with a working swap card and real-time 3D clay coins you can flick and spin.",
    category: "hero",
    tech: ["three", "motion"],
    createdAt: "2026-10-04",
    load: () => import("@/components/heroes/onesec-hero"),
  },
  {
    slug: "skyexplorer-hero",
    title: "SkyExplorer",
    description:
      "Flight-search hero above a living sea of WebGL clouds and procedural lavender mountains.",
    category: "hero",
    tech: ["three", "motion", "gsap"],
    createdAt: "2026-10-03",
    load: () => import("@/components/heroes/skyexplorer-hero"),
  },
  {
    slug: "buzina-hero",
    title: "Buzina",
    description:
      "Mindful-productivity hero with a living WebGL orb and interactive cards that fly out of it.",
    category: "hero",
    tech: ["three", "motion", "gsap"],
    createdAt: "2026-10-02",
    load: () => import("@/components/heroes/buzina-hero"),
  },
];

export function getItem(slug: string) {
  return registry.find((item) => item.slug === slug);
}

export function getItemsByCategory() {
  const sorted = [...registry].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
  return (Object.keys(CATEGORY_LABELS) as ShowcaseCategory[]).map(
    (category) => ({
      category,
      label: CATEGORY_LABELS[category],
      items: sorted.filter((item) => item.category === category),
    }),
  );
}
