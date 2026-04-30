/** Matches prototype `orient.jsx` / `O` — use CSS variables for theme. */
export const ORIENT_HELV = 'Helvetica, "Helvetica Neue", Arial, sans-serif' as const;

export const orientColors = {
  ink: "var(--thusness-ink, #1a1915)",
  inkSoft: "var(--thusness-ink-soft, #3d3a2f)",
  muted: "var(--thusness-muted, #8a8672)",
  rule: "var(--thusness-rule, #c7c2b0)",
  red: "var(--thusness-red, #c23a2a)",
} as const;
