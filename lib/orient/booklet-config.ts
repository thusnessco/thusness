export const ORIENT_BOOKLET_CONFIG_KEY = "orient_booklet_config";

export const ORIENT_BOOKLET_SLUGS = [
  "pillars",
  "stages",
  "recognition",
  "movement",
  "themes",
  "nihilism",
] as const;

export type OrientBookletSlug = (typeof ORIENT_BOOKLET_SLUGS)[number];

export type OrientBookletConfig = {
  pagesVisible: Record<OrientBookletSlug, boolean>;
  copy: {
    indexKicker: string;
    indexTitle: string;
    indexIntro: string;
    mapPillarsKicker: string;
    mapPillarsHint: string;
    tocSequenceLabel: string;
    tocAsideLabel: string;
    sectionSheetIndexPrefix: string;
    sectionContextPrefix: string;
    sectionContextLinkLabel: string;
    prevKicker: string;
    nextKicker: string;
    backToMapLabel: string;
    diagramFooterLabel: string;
    signatureLabel: string;
    proseOverrides: Record<OrientBookletSlug, string>;
  };
};

function defaultPagesVisible(): Record<OrientBookletSlug, boolean> {
  return {
    pillars: true,
    stages: true,
    recognition: true,
    movement: true,
    themes: true,
    nihilism: true,
  };
}

export function defaultOrientBookletConfig(): OrientBookletConfig {
  return {
    pagesVisible: defaultPagesVisible(),
    copy: {
      indexKicker: "~ Orientation",
      indexTitle: "A map of the practice.",
      indexIntro:
        "Three pillars first-what you bring-then stages of peace and the rest of the map. Read in order, or out of it.",
      mapPillarsKicker: "~ Three pillars · welcome throughout",
      mapPillarsHint: "when these are welcome, the rest comes easily",
      tocSequenceLabel: "In sequence",
      tocAsideLabel: "Aside",
      sectionSheetIndexPrefix: "Orient",
      sectionContextPrefix: "part of",
      sectionContextLinkLabel: "the orientation",
      prevKicker: "previous",
      nextKicker: "next",
      backToMapLabel: "back to the map",
      diagramFooterLabel: "thusness.co",
      signatureLabel: "thusness.co",
      proseOverrides: {
        pillars: "",
        stages: "",
        recognition: "",
        movement: "",
        themes: "",
        nihilism: "",
      },
    },
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
  const copyRaw =
    o.copy && typeof o.copy === "object" && !Array.isArray(o.copy)
      ? (o.copy as Record<string, unknown>)
      : {};
  const copy = {
    indexKicker:
      typeof copyRaw.indexKicker === "string"
        ? copyRaw.indexKicker
        : d.copy.indexKicker,
    indexTitle:
      typeof copyRaw.indexTitle === "string"
        ? copyRaw.indexTitle
        : d.copy.indexTitle,
    indexIntro:
      typeof copyRaw.indexIntro === "string"
        ? copyRaw.indexIntro
        : d.copy.indexIntro,
    mapPillarsKicker:
      typeof copyRaw.mapPillarsKicker === "string"
        ? copyRaw.mapPillarsKicker
        : d.copy.mapPillarsKicker,
    mapPillarsHint:
      typeof copyRaw.mapPillarsHint === "string"
        ? copyRaw.mapPillarsHint
        : d.copy.mapPillarsHint,
    tocSequenceLabel:
      typeof copyRaw.tocSequenceLabel === "string"
        ? copyRaw.tocSequenceLabel
        : d.copy.tocSequenceLabel,
    tocAsideLabel:
      typeof copyRaw.tocAsideLabel === "string"
        ? copyRaw.tocAsideLabel
        : d.copy.tocAsideLabel,
    sectionSheetIndexPrefix:
      typeof copyRaw.sectionSheetIndexPrefix === "string"
        ? copyRaw.sectionSheetIndexPrefix
        : d.copy.sectionSheetIndexPrefix,
    sectionContextPrefix:
      typeof copyRaw.sectionContextPrefix === "string"
        ? copyRaw.sectionContextPrefix
        : d.copy.sectionContextPrefix,
    sectionContextLinkLabel:
      typeof copyRaw.sectionContextLinkLabel === "string"
        ? copyRaw.sectionContextLinkLabel
        : d.copy.sectionContextLinkLabel,
    prevKicker:
      typeof copyRaw.prevKicker === "string"
        ? copyRaw.prevKicker
        : d.copy.prevKicker,
    nextKicker:
      typeof copyRaw.nextKicker === "string"
        ? copyRaw.nextKicker
        : d.copy.nextKicker,
    backToMapLabel:
      typeof copyRaw.backToMapLabel === "string"
        ? copyRaw.backToMapLabel
        : d.copy.backToMapLabel,
    diagramFooterLabel: (() => {
      if (typeof copyRaw.diagramFooterLabel !== "string") return d.copy.diagramFooterLabel;
      const s = copyRaw.diagramFooterLabel.trim();
      if (/^thusness\.co\s*·\s*orient$/i.test(s)) return d.copy.diagramFooterLabel;
      return copyRaw.diagramFooterLabel as string;
    })(),
    signatureLabel:
      typeof copyRaw.signatureLabel === "string"
        ? copyRaw.signatureLabel
        : d.copy.signatureLabel,
    proseOverrides: {
      pillars:
        typeof (copyRaw.proseOverrides as Record<string, unknown> | undefined)?.pillars ===
        "string"
          ? ((copyRaw.proseOverrides as Record<string, unknown>).pillars as string)
          : d.copy.proseOverrides.pillars,
      stages:
        typeof (copyRaw.proseOverrides as Record<string, unknown> | undefined)?.stages ===
        "string"
          ? ((copyRaw.proseOverrides as Record<string, unknown>).stages as string)
          : d.copy.proseOverrides.stages,
      recognition:
        typeof (copyRaw.proseOverrides as Record<string, unknown> | undefined)
          ?.recognition === "string"
          ? ((copyRaw.proseOverrides as Record<string, unknown>).recognition as string)
          : d.copy.proseOverrides.recognition,
      movement:
        typeof (copyRaw.proseOverrides as Record<string, unknown> | undefined)?.movement ===
        "string"
          ? ((copyRaw.proseOverrides as Record<string, unknown>).movement as string)
          : d.copy.proseOverrides.movement,
      themes:
        typeof (copyRaw.proseOverrides as Record<string, unknown> | undefined)?.themes ===
        "string"
          ? ((copyRaw.proseOverrides as Record<string, unknown>).themes as string)
          : d.copy.proseOverrides.themes,
      nihilism:
        typeof (copyRaw.proseOverrides as Record<string, unknown> | undefined)?.nihilism ===
        "string"
          ? ((copyRaw.proseOverrides as Record<string, unknown>).nihilism as string)
          : d.copy.proseOverrides.nihilism,
    },
  };

  return {
    pagesVisible,
    copy,
  };
}
