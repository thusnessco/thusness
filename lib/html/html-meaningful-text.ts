/**
 * Whether HTML likely has visible text (empty paragraphs, br-only, etc. count as empty).
 */
export function htmlHasMeaningfulText(html: string): boolean {
  if (!html.trim()) return false;
  const condensed = html
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&#160;/g, " ")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  return condensed.length > 0;
}
