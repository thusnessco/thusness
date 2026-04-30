import type { OrientDiagramId } from "@/lib/tiptap/orient-diagram-embed";

import type { OrientBookletSlug } from "./booklet-config";

export type OrientBookletPageMeta = {
  slug: OrientBookletSlug;
  noteSlug: string;
  index: number;
  label: string;
  diagram: OrientDiagramId;
};

/** Reading order after the giant map: pillars first (what you bring), then stages through themes; nihilism stays aside in the TOC. */
export const ORIENT_BOOKLET_PAGES: OrientBookletPageMeta[] = [
  {
    slug: "pillars",
    noteSlug: "orient-pillars",
    index: 1,
    label: "Three pillars",
    diagram: "pillars",
  },
  {
    slug: "stages",
    noteSlug: "orient-stages",
    index: 2,
    label: "Stages of peace",
    diagram: "stages",
  },
  {
    slug: "recognition",
    noteSlug: "orient-recognition",
    index: 3,
    label: "Two kinds of peace",
    diagram: "recognition",
  },
  {
    slug: "movement",
    noteSlug: "orient-movement",
    index: 4,
    label: "Movement & progression",
    diagram: "movement",
  },
  {
    slug: "themes",
    noteSlug: "orient-themes",
    index: 5,
    label: "Aspects of exploration",
    diagram: "themes",
  },
  {
    slug: "nihilism",
    noteSlug: "orient-nihilism",
    index: 6,
    label: "Emptiness ≠ non-existence",
    diagram: "nihilism",
  },
];

export function getBookletPage(slug: string): OrientBookletPageMeta | null {
  return ORIENT_BOOKLET_PAGES.find((p) => p.slug === slug) ?? null;
}
