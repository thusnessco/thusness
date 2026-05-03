import Link from "next/link";

import RedDot from "./RedDot";
import { ThusnessSiteBottomNav } from "./ThusnessSiteBottomNav";

/** Quiet footer: site nav (includes ~ connect), wordmark stripe + signature dot. */
export function SiteFooter() {
  return (
    <footer className="thusness-site-footer mt-20 text-[11px] uppercase tracking-[2px] text-[var(--thusness-muted)]">
      <ThusnessSiteBottomNav />
      <div className="thusness-site-footer__stripe flex items-center justify-between pt-5">
        <Link
          href="/"
          className="text-[var(--thusness-muted)] transition-opacity hover:opacity-70"
        >
          thusness.co
        </Link>
        <RedDot />
      </div>
    </footer>
  );
}
