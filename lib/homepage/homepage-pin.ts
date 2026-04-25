import type {
  FullDescriptionFields,
  SimpleContemplationFields,
  SiteTemplateId,
} from "@/lib/homepage/site-templates";
import { normalizeSiteTemplateFields } from "@/lib/homepage/site-templates";

export type { SiteTemplateId } from "@/lib/homepage/site-templates";
export type { FullDescriptionFields, SimpleContemplationFields } from "@/lib/homepage/site-templates";

export type HomepagePin =
  | { source: "week" }
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

export function parseHomepagePin(raw: unknown): HomepagePin {
  if (!raw || typeof raw !== "object") return { source: "week" };
  const o = raw as Record<string, unknown>;
  if (o.source === "note" && typeof o.slug === "string") {
    const slug = o.slug.trim();
    if (slug) return { source: "note", slug };
  }
  if (o.source === "site_template" && isSiteTemplateId(o.template)) {
    if (o.template === "simple_contemplation") {
      const fields = normalizeSiteTemplateFields(
        "simple_contemplation",
        o.fields
      ) as SimpleContemplationFields;
      return { source: "site_template", template: "simple_contemplation", fields };
    }
    const fields = normalizeSiteTemplateFields(
      "full_description",
      o.fields
    ) as FullDescriptionFields;
    return { source: "site_template", template: "full_description", fields };
  }
  return { source: "week" };
}
