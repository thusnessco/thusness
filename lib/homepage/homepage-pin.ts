import type {
  FullDescriptionFields,
  SimpleContemplationFields,
  SiteTemplateId,
} from "@/lib/homepage/site-templates";
import {
  DEFAULT_SIMPLE_FIELDS,
  normalizeSiteTemplateFields,
} from "@/lib/homepage/site-templates";

export type { SiteTemplateId } from "@/lib/homepage/site-templates";
export type { FullDescriptionFields, SimpleContemplationFields } from "@/lib/homepage/site-templates";

export type HomepagePin =
  | { source: "note"; slug: string }
  | {
      source: "site_template";
      template: "simple_contemplation";
      fields: SimpleContemplationFields;
    }
  | {
      source: "site_template";
      template: "full_description";
      fields: FullDescriptionFields;
    };

function isSiteTemplateId(v: unknown): v is SiteTemplateId {
  return v === "simple_contemplation" || v === "full_description";
}

/** Default root layout when nothing is pinned (replaces legacy `{ source: "week" }`). */
export function defaultHomepagePin(): {
  source: "site_template";
  template: "simple_contemplation";
  fields: SimpleContemplationFields;
} {
  const fields = normalizeSiteTemplateFields(
    "simple_contemplation",
    DEFAULT_SIMPLE_FIELDS
  ) as SimpleContemplationFields;
  return { source: "site_template", template: "simple_contemplation", fields };
}

function isLegacyWeekPin(o: Record<string, unknown>): boolean {
  return o.source === "week";
}

function isSiteTemplatePin(o: Record<string, unknown>): boolean {
  return o.source === "site_template" && isSiteTemplateId(o.template);
}

export function parseHomepagePin(raw: unknown): HomepagePin {
  if (!raw || typeof raw !== "object") return defaultHomepagePin();
  const o = raw as Record<string, unknown>;
  if (isLegacyWeekPin(o)) return defaultHomepagePin();
  if (o.source === "note" && typeof o.slug === "string") {
    const slug = o.slug.trim();
    if (slug) return { source: "note", slug };
  }
  if (isSiteTemplatePin(o) && o.template === "simple_contemplation") {
    const fields = normalizeSiteTemplateFields(
      "simple_contemplation",
      o.fields
    ) as SimpleContemplationFields;
    return { source: "site_template", template: "simple_contemplation", fields };
  }
  if (isSiteTemplatePin(o) && o.template === "full_description") {
    const fields = normalizeSiteTemplateFields(
      "full_description",
      o.fields
    ) as FullDescriptionFields;
    return { source: "site_template", template: "full_description", fields };
  }
  return defaultHomepagePin();
}
