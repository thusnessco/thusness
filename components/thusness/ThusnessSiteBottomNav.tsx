import Link from "next/link";

/**
 * Quiet caps links at the bottom of public pages (home, readings, orient, etc.).
 * Notice and Orient live in readings / orient booklet UI; Telegram stays on the footer stripe.
 */
export function ThusnessSiteBottomNav() {
  return (
    <nav className="thusness-bottom-nav" aria-label="Site sections">
      <Link href="/">Home</Link>
      <span className="thusness-bottom-nav-sep" aria-hidden>
        ·
      </span>
      <Link href="/readings">Readings</Link>
      <span className="thusness-bottom-nav-sep" aria-hidden>
        ·
      </span>
      <Link href="/inquiry">Inquiry</Link>
    </nav>
  );
}
