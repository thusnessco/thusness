export const READINGS_INDEX_SITE_KEY = "readings_index";

export type ReadingsIndexNoteItem = { type: "note"; note_id: string };

export type ReadingsIndexLinkItem = {
  type: "link";
  label: string;
  href: string;
};

export type ReadingsIndexItem = ReadingsIndexNoteItem | ReadingsIndexLinkItem;

export type ReadingsIndexConfig = {
  items: ReadingsIndexItem[];
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuidLike(s: string): boolean {
  return UUID_RE.test(s.trim());
}

export function defaultReadingsIndex(): ReadingsIndexConfig {
  return { items: [] };
}

/** Allow same-origin paths or http(s) URLs only. */
export function sanitizeReadingsExternalHref(raw: string): string | null {
  const s = raw.trim();
  if (!s) return null;
  if (s.startsWith("/") && !s.startsWith("//")) {
    if (s.includes("://")) return null;
    return s;
  }
  try {
    const u = new URL(s);
    if (u.protocol === "https:" || u.protocol === "http:") return u.href;
  } catch {
    /* ignore */
  }
  return null;
}

function parseItem(raw: unknown): ReadingsIndexItem | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = raw as Record<string, unknown>;
  if (o.type === "note" && typeof o.note_id === "string") {
    const id = o.note_id.trim();
    if (!isUuidLike(id)) return null;
    return { type: "note", note_id: id };
  }
  if (o.type === "link") {
    const label =
      typeof o.label === "string" ? o.label.trim().slice(0, 200) : "";
    const hrefRaw = typeof o.href === "string" ? o.href : "";
    const href = sanitizeReadingsExternalHref(hrefRaw);
    if (!label || !href) return null;
    return { type: "link", label, href };
  }
  return null;
}

export function parseReadingsIndex(raw: unknown): ReadingsIndexConfig {
  const d = defaultReadingsIndex();
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return d;
  const o = raw as Record<string, unknown>;
  const arr = o.items;
  if (!Array.isArray(arr)) return d;
  const items: ReadingsIndexItem[] = [];
  const seenNote = new Set<string>();
  for (const el of arr) {
    const it = parseItem(el);
    if (!it) continue;
    if (it.type === "note") {
      if (seenNote.has(it.note_id)) continue;
      seenNote.add(it.note_id);
    }
    items.push(it);
  }
  return { items };
}

export function noteOnReadingsList(
  cfg: ReadingsIndexConfig,
  noteId: string
): boolean {
  return cfg.items.some(
    (i) => i.type === "note" && i.note_id === noteId.trim()
  );
}

export function withNoteToggledOnReadings(
  cfg: ReadingsIndexConfig,
  noteId: string,
  on: boolean
): ReadingsIndexConfig {
  const id = noteId.trim();
  if (!isUuidLike(id)) return cfg;
  if (!on) {
    return {
      items: cfg.items.filter(
        (i) => !(i.type === "note" && i.note_id === id)
      ),
    };
  }
  if (cfg.items.some((i) => i.type === "note" && i.note_id === id)) {
    return cfg;
  }
  return { items: [...cfg.items, { type: "note", note_id: id }] };
}

export function withoutNoteOnReadings(
  cfg: ReadingsIndexConfig,
  noteId: string
): ReadingsIndexConfig {
  const id = noteId.trim();
  return {
    items: cfg.items.filter(
      (i) => !(i.type === "note" && i.note_id === id)
    ),
  };
}
