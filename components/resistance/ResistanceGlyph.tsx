import type { ResistanceGlyphKey } from "@/lib/resistance/resistance-page";

const stroke = "var(--thusness-muted, #8a8672)";
const ink = "var(--thusness-ink, #1a1915)";
const sw = 1;

export function ResistanceGlyph({
  kind,
  wide = false,
}: {
  kind: ResistanceGlyphKey;
  wide?: boolean;
}) {
  const size = wide ? 160 : 88;

  if (kind === "include") {
    return (
      <svg width={size} height={size} viewBox="0 0 88 88" fill="none" aria-hidden>
        <circle cx="44" cy="44" r="34" stroke={stroke} strokeWidth={sw} />
        <circle cx="44" cy="44" r="5" fill={ink} />
      </svg>
    );
  }
  if (kind === "widen") {
    return (
      <svg width={size} height={size} viewBox="0 0 88 88" fill="none" aria-hidden>
        <circle cx="44" cy="44" r="4" fill={ink} />
        <circle cx="44" cy="44" r="14" stroke={stroke} strokeWidth={sw} opacity="0.85" />
        <circle cx="44" cy="44" r="24" stroke={stroke} strokeWidth={sw} opacity="0.6" />
        <circle cx="44" cy="44" r="34" stroke={stroke} strokeWidth={sw} opacity="0.35" />
      </svg>
    );
  }
  if (kind === "appreciation") {
    return (
      <svg width={size} height={size} viewBox="0 0 88 88" fill="none" aria-hidden>
        <circle cx="44" cy="44" r="3" fill={ink} />
        <circle cx="44" cy="44" r="14" stroke={stroke} strokeWidth={sw} strokeDasharray="2 4" opacity="0.7" />
        <circle cx="44" cy="44" r="26" stroke={stroke} strokeWidth={sw} strokeDasharray="1 5" opacity="0.4" />
      </svg>
    );
  }
  if (kind === "turning") {
    return (
      <svg width={size} height={size} viewBox="0 0 88 88" fill="none" aria-hidden>
        <circle cx="20" cy="44" r="6" stroke={ink} strokeWidth={sw * 1.4} />
        <circle cx="68" cy="44" r="3" fill={ink} />
        <path d="M 26 44 L 63 44" stroke={ink} strokeWidth={sw * 1.4} strokeLinecap="round" />
        <path d="M 31 39 L 26 44 L 31 49" stroke={ink} strokeWidth={sw * 1.4} fill="none" strokeLinecap="round" />
        <path d="M 57 39 L 63 44 L 57 49" stroke={ink} strokeWidth={sw * 1.4} fill="none" strokeLinecap="round" />
      </svg>
    );
  }
  if (kind === "pair") {
    if (wide) {
      return (
        <svg width={size} height={size * 0.55} viewBox="0 0 160 88" fill="none" aria-hidden>
          <path d="M 24 28 V 18 H 136 V 28" stroke={stroke} strokeWidth={sw} fill="none" strokeLinejoin="miter" />
          <line x1="80" y1="18" x2="80" y2="10" stroke={stroke} strokeWidth={sw} />
          <circle cx="24" cy="50" r="6" fill={ink} />
          <circle cx="136" cy="50" r="6" stroke={ink} strokeWidth={sw * 1.4} fill="none" />
          <path
            d="M 36 70 Q 58 80, 80 70 T 124 70"
            stroke={stroke}
            strokeWidth={sw}
            fill="none"
            strokeLinecap="round"
            opacity="0.7"
          />
        </svg>
      );
    }
    return (
      <svg width={size} height={size} viewBox="0 0 88 88" fill="none" aria-hidden>
        <path d="M 22 30 V 22 H 66 V 30" stroke={stroke} strokeWidth={sw} fill="none" strokeLinejoin="miter" />
        <line x1="44" y1="22" x2="44" y2="16" stroke={stroke} strokeWidth={sw} />
        <circle cx="22" cy="54" r="5" fill={ink} />
        <circle cx="66" cy="54" r="5" stroke={ink} strokeWidth={sw * 1.4} fill="none" />
      </svg>
    );
  }
  return null;
}
