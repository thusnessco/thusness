import Link from "next/link";

import RedDot from "./RedDot";
import { TelegramConnectLink } from "./TelegramConnectLink";
import { ThusnessSiteBottomNav } from "./ThusnessSiteBottomNav";

/** Quiet footer: site nav, domain + connect + signature dot (once per page), per brand guide. */
export function SiteFooter({
  showOrientLink = false,
}: {
  showOrientLink?: boolean;
}) {
  return (
    <footer className="mt-20 text-[11px] uppercase tracking-[2px] text-[var(--thusness-muted)]">
      <ThusnessSiteBottomNav showOrientLink={showOrientLink} />
      <div className="relative flex items-center justify-between border-t border-[var(--thusness-rule)] pt-6">
      <Link
        href="/"
        className="text-[var(--thusness-muted)] transition-opacity hover:opacity-70"
      >
        thusness.co
      </Link>
      <TelegramConnectLink className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
      <RedDot />
      </div>
    </footer>
  );
}
