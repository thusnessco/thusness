/** Public note index + detail routes (not linked from site chrome). */
export const NOTE_PAGES_BASE = "/notes2" as const;

export function notePageHref(slug: string): string {
  return `${NOTE_PAGES_BASE}/${slug}`;
}
