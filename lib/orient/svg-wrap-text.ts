/** Word-wrap for single-line SVG <text> / <tspan> columns. */
export function wrapTextLines(text: string, maxChars: number): string[] {
  const t = text.replace(/\s+/g, " ").trim();
  if (!t) return [""];
  const words = t.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxChars && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}
