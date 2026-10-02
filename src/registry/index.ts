import type { ComponentType } from "react";

export type ShowcaseCategory = "hero" | "section" | "component" | "landing-page";

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
export const registry: ShowcaseItem[] = [];

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
