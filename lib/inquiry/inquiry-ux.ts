/** Normalize for comparing short free-text replies (not for meaning extraction). */
function compactReply(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[…]+/g, "...")
    .replace(/[.?!]+$/g, "")
    .replace(/\s+/g, " ");
}

/**
 * Very short or deflecting replies — we still allow Continue; this only drives a soft hint.
 * Keeps tone invitational (no “invalid answer”).
 */
export function isVagueResponse(text: string): boolean {
  const raw = text.trim();
  if (raw.length === 0) return false;
  const t = compactReply(raw);
  if (t.length > 72) return false;

  const exact = new Set([
    "?",
    "??",
    "???",
    "…",
    "...",
    "huh",
    "what",
    "what?",
    "what do you mean",
    "what do you mean?",
    "wdym",
    "idk",
    "i dont know",
    "i don't know",
    "dunno",
    "no idea",
    "not sure",
    "unsure",
    "nothing",
    "n/a",
    "na",
    "same",
    "whatever",
    "ok",
    "okay",
    "k",
    "sure",
    "fine",
    "maybe",
    "i guess",
    "guess",
    "skip",
    "pass",
    "next",
  ]);
  if (exact.has(t)) return true;

  // Starts with deflection phrase (allows trailing punctuation)
  if (/^(what do you mean|i don'?t know|not sure|no idea)\b/i.test(raw.trim())) {
    return t.length <= 48;
  }

  // Only punctuation / emoji-ish / very few letters
  const letters = raw.replace(/[^a-zA-Z]/g, "").length;
  if (raw.length <= 6 && letters <= 2) return true;

  return false;
}

const DEFAULT_SUMMARY_DISPLAY_MAX = 168;

/** Sidebar display: keep lines readable; full string in title when trimmed. */
export function truncateInquirySummaryLine(
  line: string,
  max = DEFAULT_SUMMARY_DISPLAY_MAX
): { display: string; title?: string } {
  if (line.length <= max) return { display: line };
  let cut = line.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  if (lastSpace > Math.floor(max * 0.5)) {
    cut = cut.slice(0, lastSpace);
  }
  const display = `${cut.trimEnd()}…`;
  return { display, title: line };
}
