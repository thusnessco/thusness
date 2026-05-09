/** Parse admin themes list textarea: up to 8 lines; keep empty lines so users can retype a row. */
export function themesListFromTextareaValue(raw: string): string[] {
  return raw
    .split("\n")
    .slice(0, 8)
    .map((s) => s.trim());
}
