/** Single bucket per note — used in Admin and optional /notes filtering. */

export const NOTE_CATEGORIES = [
  "session_helpers",
  "session_itinerary",
  "short_quotes",
  "long_posts",
] as const;

export type NoteCategory = (typeof NOTE_CATEGORIES)[number];

export const NOTE_CATEGORY_LABELS: Record<NoteCategory, string> = {
  session_helpers: "Session Helpers",
  session_itinerary: "Session Itinerary",
  short_quotes: "Short Quotes",
  long_posts: "Long Posts",
};

/** Shorter label for admin nav chips. */
export const NOTE_CATEGORY_SHORT: Record<NoteCategory, string> = {
  session_helpers: "Helpers",
  session_itinerary: "Itinerary",
  short_quotes: "Quotes",
  long_posts: "Posts",
};

export function isNoteCategory(v: string): v is NoteCategory {
  return (NOTE_CATEGORIES as readonly string[]).includes(v);
}

export function parseNoteCategory(raw: unknown): NoteCategory | null {
  if (typeof raw !== "string" || !raw.trim()) return null;
  const s = raw.trim();
  return isNoteCategory(s) ? s : null;
}
