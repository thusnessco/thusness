import type { JSONContent } from "@tiptap/core";

import {
  DEFAULT_PUBLIC_JOIN_URL,
  makeThusnessSessionCard,
  paragraphWithHttpLink,
} from "@/lib/tiptap/thusness-blocks";

export type SiteTemplateId = "simple_contemplation" | "full_description";

function tx(s: string): JSONContent {
  return { type: "text", text: s };
}

function p(...c: JSONContent[]): JSONContent {
  return { type: "paragraph", content: c.length ? c : undefined };
}

const H = "thusnessHero";
const SM = "thusnessSectionMark";
const PQ = "thusnessPullQuote";
const RL = "thusnessRuleList";
const RLI = "thusnessRuleListItem";
const PL = "thusnessPillar";
const SG = "thusnessSessionGrid";
const ZB = "thusnessZoomBlock";

export type SessionSlotFields = {
  kicker: string;
  day: string;
  time: string;
  zone: string;
};

export type SimpleContemplationFields = {
  heroQuestion: string;
  heroSubtitle: string;
  session1: SessionSlotFields;
  session2: SessionSlotFields;
  zoomUrl: string;
  zoomClosing: string;
};

export type FullDescriptionFields = {
  heroQuestion: string;
  heroSubtitle: string;
  sectionTheme: string;
  introParagraph: string;
  pullQuote: string;
  benefitsTitle: string;
  benefitLines: string[];
  itineraryTitle: string;
  itineraryLines: string[];
  pillarLine: string;
  sectionSitTogether: string;
  sitTogetherIntro: string;
  session1: SessionSlotFields;
  session2: SessionSlotFields;
  zoomUrl: string;
  zoomClosing: string;
};

export const DEFAULT_SESSION_SLOT: SessionSlotFields = {
  kicker: "~ I",
  day: "Wednesday",
  time: "09:00 — 10:00",
  zone: "Pacific Time",
};

export const DEFAULT_SESSION_SLOT_B: SessionSlotFields = {
  kicker: "~ II",
  day: "Friday",
  time: "09:00 — 10:00",
  zone: "Pacific Time",
};

export const DEFAULT_SIMPLE_FIELDS: SimpleContemplationFields = {
  heroQuestion: "What if we deepen into what's truly wanted?",
  heroSubtitle: "— a question to sit with —",
  session1: { ...DEFAULT_SESSION_SLOT },
  session2: { ...DEFAULT_SESSION_SLOT_B },
  zoomUrl: DEFAULT_PUBLIC_JOIN_URL,
  zoomClosing: "All are welcome.",
};

export const DEFAULT_FULL_FIELDS: FullDescriptionFields = {
  heroQuestion: "Is any effort necessary for experience to be?",
  heroSubtitle: "— a question to sit with —",
  sectionTheme: "~ Theme · Noticing Effort",
  introParagraph:
    "Previously we explored resistance — a sense of no regarding what's happening. Effort is a little more subtle, and might show up as a sense that something needs to be done.",
  pullQuote:
    "What happens as we become more curious and aware of effort in each moment?",
  benefitsTitle: "~ Benefits & Goals",
  benefitLines: [
    "Practice noticing experience as it is",
    "Increase sensitivity to the details of effort",
    "Effort becomes more visible and optional",
  ],
  itineraryTitle: "~ Itinerary",
  itineraryLines: [
    "Notice where attention goes",
    "Noticing gentle curiosity",
    "Introductory exploration of effort",
    "Notice any aspects of experience and how effort might relate",
    "Integration exercise",
    "Home integration instructions",
    "Group sharing",
  ],
  pillarLine: "Gentle curiosity.",
  sectionSitTogether: "~ Sit together",
  sitTogetherIntro:
    "A quiet hour of guided noticing, with space for sharing. Held on Zoom.",
  session1: { ...DEFAULT_SESSION_SLOT },
  session2: { ...DEFAULT_SESSION_SLOT_B },
  zoomUrl: DEFAULT_PUBLIC_JOIN_URL,
  zoomClosing: "All are welcome.",
};

function pickStr(v: unknown, fallback: string): string {
  return typeof v === "string" ? v : fallback;
}

function pickSession(v: unknown, def: SessionSlotFields): SessionSlotFields {
  if (!v || typeof v !== "object") return { ...def };
  const o = v as Record<string, unknown>;
  return {
    kicker: pickStr(o.kicker, def.kicker),
    day: pickStr(o.day, def.day),
    time: pickStr(o.time, def.time),
    zone: pickStr(o.zone, def.zone),
  };
}

function pickLines(v: unknown, fallback: string[]): string[] {
  if (!Array.isArray(v)) return [...fallback];
  const out = v.filter((x) => typeof x === "string") as string[];
  return out.length ? out : [...fallback];
}

export function normalizeSimpleFields(raw: unknown): SimpleContemplationFields {
  const d = DEFAULT_SIMPLE_FIELDS;
  if (!raw || typeof raw !== "object") return { ...d };
  const o = raw as Record<string, unknown>;
  return {
    heroQuestion: pickStr(o.heroQuestion, d.heroQuestion),
    heroSubtitle: pickStr(o.heroSubtitle, d.heroSubtitle),
    session1: pickSession(o.session1, d.session1),
    session2: pickSession(o.session2, d.session2),
    zoomUrl: pickStr(o.zoomUrl, d.zoomUrl),
    zoomClosing: pickStr(o.zoomClosing, d.zoomClosing),
  };
}

export function normalizeFullFields(raw: unknown): FullDescriptionFields {
  const d = DEFAULT_FULL_FIELDS;
  if (!raw || typeof raw !== "object") return { ...d };
  const o = raw as Record<string, unknown>;
  return {
    heroQuestion: pickStr(o.heroQuestion, d.heroQuestion),
    heroSubtitle: pickStr(o.heroSubtitle, d.heroSubtitle),
    sectionTheme: pickStr(o.sectionTheme, d.sectionTheme),
    introParagraph: pickStr(o.introParagraph, d.introParagraph),
    pullQuote: pickStr(o.pullQuote, d.pullQuote),
    benefitsTitle: pickStr(o.benefitsTitle, d.benefitsTitle),
    benefitLines: pickLines(o.benefitLines, d.benefitLines),
    itineraryTitle: pickStr(o.itineraryTitle, d.itineraryTitle),
    itineraryLines: pickLines(o.itineraryLines, d.itineraryLines),
    pillarLine: pickStr(o.pillarLine, d.pillarLine),
    sectionSitTogether: pickStr(o.sectionSitTogether, d.sectionSitTogether),
    sitTogetherIntro: pickStr(o.sitTogetherIntro, d.sitTogetherIntro),
    session1: pickSession(o.session1, d.session1),
    session2: pickSession(o.session2, d.session2),
    zoomUrl: pickStr(o.zoomUrl, d.zoomUrl),
    zoomClosing: pickStr(o.zoomClosing, d.zoomClosing),
  };
}

export function normalizeSiteTemplateFields(
  template: SiteTemplateId,
  raw: unknown
): SimpleContemplationFields | FullDescriptionFields {
  return template === "simple_contemplation"
    ? normalizeSimpleFields(raw)
    : normalizeFullFields(raw);
}

function ruleListFromLines(title: string, lines: string[]): JSONContent {
  const items = lines.map((s) => s.trim()).filter(Boolean);
  const rows = items.length > 0 ? items : ["—"];
  return {
    type: RL,
    content: [
      p(tx(title)),
      ...rows.map((line) => ({
        type: RLI,
        content: [p(tx(line))],
      })),
    ],
  };
}

export function buildSimpleContemplationDoc(
  f: SimpleContemplationFields
): JSONContent {
  return {
    type: "doc",
    content: [
      {
        type: H,
        content: [p(tx(f.heroQuestion)), p(tx(f.heroSubtitle))],
      },
      {
        type: SG,
        content: [
          makeThusnessSessionCard(
            f.session1.kicker,
            f.session1.day,
            f.session1.time,
            f.session1.zone
          ),
          makeThusnessSessionCard(
            f.session2.kicker,
            f.session2.day,
            f.session2.time,
            f.session2.zone
          ),
        ],
      },
      {
        type: ZB,
        content: [paragraphWithHttpLink(f.zoomUrl), p(tx(f.zoomClosing))],
      },
    ],
  };
}

export function buildFullDescriptionDoc(f: FullDescriptionFields): JSONContent {
  const benefits = f.benefitLines.filter((s) => s.trim());
  const itinerary = f.itineraryLines.filter((s) => s.trim());
  return {
    type: "doc",
    content: [
      {
        type: H,
        content: [p(tx(f.heroQuestion)), p(tx(f.heroSubtitle))],
      },
      { type: SM, content: [p(tx(f.sectionTheme))] },
      p(tx(f.introParagraph)),
      { type: PQ, content: [p(tx(f.pullQuote))] },
      ruleListFromLines(f.benefitsTitle, benefits.length ? benefits : [""]),
      ruleListFromLines(
        f.itineraryTitle,
        itinerary.length ? itinerary : [""]
      ),
      { type: PL, content: [p(tx(f.pillarLine))] },
      { type: SM, content: [p(tx(f.sectionSitTogether))] },
      p(tx(f.sitTogetherIntro)),
      {
        type: SG,
        content: [
          makeThusnessSessionCard(
            f.session1.kicker,
            f.session1.day,
            f.session1.time,
            f.session1.zone
          ),
          makeThusnessSessionCard(
            f.session2.kicker,
            f.session2.day,
            f.session2.time,
            f.session2.zone
          ),
        ],
      },
      {
        type: ZB,
        content: [paragraphWithHttpLink(f.zoomUrl), p(tx(f.zoomClosing))],
      },
    ],
  };
}

export function buildSiteTemplateDoc(
  template: SiteTemplateId,
  fields: SimpleContemplationFields | FullDescriptionFields
): JSONContent {
  if (template === "simple_contemplation") {
    return buildSimpleContemplationDoc(fields as SimpleContemplationFields);
  }
  return buildFullDescriptionDoc(fields as FullDescriptionFields);
}
