import Link from "next/link";

/**
 * Quiet caps links at the bottom of public pages (home, readings, orient, etc.).
 * Telegram stays on the SiteFooter stripe so it is not duplicated here.
 */
export function ThusnessSiteBottomNav({
  showOrientLink,
}: {
  showOrientLink: boolean;
}) {
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
      <Link href="/notes2">Notes</Link>
      <span className="thusness-bottom-nav-sep" aria-hidden>
        ·
      </span>
      <Link href="/sinkin">Notice</Link>
      {showOrientLink ? (
        <>
          <span className="thusness-bottom-nav-sep" aria-hidden>
            ·
          </span>
          <Link href="/orient">Orient</Link>
        </>
      ) : null}
      <span className="thusness-bottom-nav-sep" aria-hidden>
        ·
      </span>
      <Link href="/inquiry">Inquiry</Link>
    </nav>
  );
}
