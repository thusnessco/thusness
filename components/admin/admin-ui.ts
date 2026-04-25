/** Shared admin surface tokens — one place to tune density and borders. */

export const adminFieldLabel =
  "text-[10px] uppercase tracking-[0.2em] text-[var(--thusness-muted)]";

export const adminFieldInput =
  "w-full border border-[var(--thusness-rule)] bg-[var(--thusness-bg)] px-3 py-2 text-sm text-[var(--thusness-ink)] outline-none focus:border-[var(--thusness-ink)]";

export const adminBtnPrimary =
  "border border-[var(--thusness-ink)] px-4 py-2 text-xs tracking-wide text-[var(--thusness-ink)] transition-opacity hover:opacity-70 disabled:opacity-40";

export const adminBtnGhost =
  "border border-[var(--thusness-rule)] px-4 py-2 text-xs tracking-wide text-[var(--thusness-ink-soft)] transition-opacity hover:border-[var(--thusness-ink)] disabled:opacity-40";

export const adminBtnSmall =
  "self-start border border-[var(--thusness-rule)] px-3 py-1.5 text-xs tracking-wide text-[var(--thusness-ink)] transition-opacity hover:border-[var(--thusness-ink)] disabled:opacity-40";

export function adminNavBtn(active: boolean) {
  return `block w-full border px-2 py-2 text-left text-sm transition-colors ${
    active
      ? "border-[var(--thusness-ink)] text-[var(--thusness-ink)]"
      : "border-transparent text-[var(--thusness-muted)] hover:border-[var(--thusness-rule)] hover:text-[var(--thusness-ink)]"
  }`;
}

export function adminSegmentBtn(active: boolean) {
  return `border px-3 py-1.5 text-xs tracking-wide transition-colors ${
    active
      ? "border-[var(--thusness-ink)] text-[var(--thusness-ink)]"
      : "border-[var(--thusness-rule)] text-[var(--thusness-muted)] hover:border-[var(--thusness-ink)] hover:text-[var(--thusness-ink)]"
  }`;
}
