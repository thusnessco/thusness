import Link from "next/link";

import { TelegramConnectLink } from "./TelegramConnectLink";

/** Quiet caps links at the bottom of public pages. */
export function ThusnessSiteBottomNav() {
  return (
    <nav className="thusness-bottom-nav" aria-label="Site sections">
      <Link href="/sinkin">Notice</Link>
      <span className="thusness-bottom-nav-sep" aria-hidden>
        ·
      </span>
      <Link href="/orient">Orient</Link>
      <span className="thusness-bottom-nav-sep" aria-hidden>
        ·
      </span>
      <Link href="/readings">Readings</Link>
      <span className="thusness-bottom-nav-sep" aria-hidden>
        ·
      </span>
      <TelegramConnectLink bare />
    </nav>
  );
}
