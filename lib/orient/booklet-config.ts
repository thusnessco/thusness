export const ORIENT_BOOKLET_CONFIG_KEY = "orient_booklet_config";

export const ORIENT_BOOKLET_SLUGS = [
  "stages",
  "recognition",
  "pillars",
  "movement",
  "themes",
  "nihilism",
] as const;

export type OrientBookletSlug = (typeof ORIENT_BOOKLET_SLUGS)[number];

export type OrientBookletConfig = {
  pagesVisible: Record<OrientBookletSlug, boolean>;
  showFooterLinks: boolean;
  footerOrient: boolean;
  footerReadings: boolean;
  footerNotes: boolean;
};

function defaultPagesVisible(): Record<OrientBookletSlug, boolean> {
  return {
    stages: true,
    recognition: true,
    pillars: true,
    movement: true,
    themes: true,
    nihilism: true,
  };
}

export function defaultOrientBookletConfig(): OrientBookletConfig {
  return {
    pagesVisible: defaultPagesVisible(),
    showFooterLinks: true,
    footerOrient: true,
    footerReadings: true,
    footerNotes: true,
  };
}

export function parseOrientBookletConfig(raw: unknown): OrientBookletConfig {
  const d = defaultOrientBookletConfig();
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return d;
  const o = raw as Record<string, unknown>;
  const pvRaw =
    o.pagesVisible && typeof o.pagesVisible === "object" && !Array.isArray(o.pagesVisible)
      ? (o.pagesVisible as Record<string, unknown>)
      : {};
  const pagesVisible = { ...d.pagesVisible };
  for (const slug of ORIENT_BOOKLET_SLUGS) {
    if (typeof pvRaw[slug] === "boolean") {
      pagesVisible[slug] = pvRaw[slug] as boolean;
    }
  }
  return {
    pagesVisible,
    showFooterLinks:
      typeof o.showFooterLinks === "boolean" ? o.showFooterLinks : d.showFooterLinks,
    footerOrient: typeof o.footerOrient === "boolean" ? o.footerOrient : d.footerOrient,
    footerReadings:
      typeof o.footerReadings === "boolean" ? o.footerReadings : d.footerReadings,
    footerNotes: typeof o.footerNotes === "boolean" ? o.footerNotes : d.footerNotes,
  };
}
