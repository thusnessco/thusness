import type { ReactNode } from "react";

/** Invite link for the Thusness Telegram group (public join). */
export const TELEGRAM_GROUP_INVITE_URL =
  "https://t.me/+ri7F4mD2sTNjOThh" as const;

const defaultClass =
  "text-[11px] uppercase tracking-[2px] text-[var(--thusness-muted)] no-underline transition-opacity hover:opacity-70";

/**
 * External link to the Thusness Telegram group.
 * Use `bare` inside `.thusness-bottom-nav` so shared nav link styles apply.
 */
export function TelegramConnectLink({
  className,
  bare = false,
  children = "connect",
}: {
  className?: string;
  bare?: boolean;
  /** Link text (default matches bottom nav caps row). */
  children?: ReactNode;
}) {
  const classes = bare
    ? (className ?? "").trim() || undefined
    : [defaultClass, className].filter(Boolean).join(" ").trim();
  return (
    <a
      href={TELEGRAM_GROUP_INVITE_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={classes}
    >
      {children}
    </a>
  );
}
