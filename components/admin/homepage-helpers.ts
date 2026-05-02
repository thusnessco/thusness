import type { HomepagePin } from "@/lib/homepage/homepage-pin";
import { NOTE_PAGES_BASE } from "@/lib/site/note-pages";
import type { NoteRow } from "@/lib/supabase/public-server";

export type ContentKey =
  | `n:${string}`
  | "tpl:simple"
  | "tpl:full"
  | "sinkin"
  | "inquiry"
  | "orient_graphics"
  | "orient_booklet"
  | "readings";

function slugMatchesPin(noteSlug: string, pinSlug: string): boolean {
  return noteSlug.trim().toLowerCase() === pinSlug.trim().toLowerCase();
}

export function parseNoteId(pk: ContentKey): string | null {
  return pk.startsWith("n:") ? pk.slice(2) : null;
}

export function initialContentKey(
  pin: HomepagePin,
  notes: NoteRow[]
): ContentKey {
  if (pin.source === "site_template") {
    return pin.template === "simple_contemplation" ? "tpl:simple" : "tpl:full";
  }
  if (pin.source === "note") {
    const n = notes.find((x) => slugMatchesPin(x.slug, pin.slug));
    if (n) return `n:${n.id}`;
  }
  return notes[0] ? `n:${notes[0].id}` : "tpl:simple";
}

/** Whether the given nav key is exactly what drives `/` right now. */
export function isLiveAtRoot(
  hp: HomepagePin,
  key: ContentKey,
  notes: NoteRow[]
): boolean {
  if (key === "tpl:simple") {
    return hp.source === "site_template" && hp.template === "simple_contemplation";
  }
  if (key === "tpl:full") {
    return hp.source === "site_template" && hp.template === "full_description";
  }
  const id = parseNoteId(key);
  if (!id || hp.source !== "note") return false;
  const n = notes.find((x) => x.id === id);
  return Boolean(n && slugMatchesPin(n.slug, hp.slug));
}

export function noteDrivesRoot(hp: HomepagePin, note: NoteRow): boolean {
  return hp.source === "note" && slugMatchesPin(note.slug, hp.slug);
}

/** One-line description for the root status strip. */
export function describeLiveHomepage(hp: HomepagePin, notes: NoteRow[]): string {
  if (hp.source === "note") {
    const n = notes.find((x) => slugMatchesPin(x.slug, hp.slug));
    if (n) {
      const t = (n.title || "").trim() || n.slug;
      return `“${t}” · ${NOTE_PAGES_BASE}/${n.slug}`;
    }
    return `Published note · ${NOTE_PAGES_BASE}/${hp.slug}`;
  }
  if (hp.source === "site_template") {
    return hp.template === "simple_contemplation"
      ? "Built-in Simple layout"
      : "Built-in Full layout";
  }
  return "Default";
}

export function templateMatchesEditor(
  hp: HomepagePin,
  key: "tpl:simple" | "tpl:full"
): boolean {
  if (hp.source !== "site_template") return false;
  if (key === "tpl:simple") return hp.template === "simple_contemplation";
  return hp.template === "full_description";
}
