import Link from "next/link";

import RedDot from "./RedDot";
import { TelegramConnectLink } from "./TelegramConnectLink";

/** Quiet footer: domain + connect + signature dot (once per page), per brand guide. */
export function SiteFooter() {
  return (
    <footer className="relative mt-20 flex items-center justify-between border-t border-[var(--thusness-rule)] pt-6 text-[11px] uppercase tracking-[2px] text-[var(--thusness-muted)]">
      <Link
        href="/"
        className="text-[var(--thusness-muted)] transition-opacity hover:opacity-70"
      >
        thusness.co
      </Link>
      <TelegramConnectLink className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
      <RedDot />
    </footer>
  );
}
