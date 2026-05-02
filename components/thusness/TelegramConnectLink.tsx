/** Invite link for the Thusness Telegram group (public join). */
export const TELEGRAM_GROUP_INVITE_URL =
  "https://t.me/+ri7F4mD2sTNjOThh" as const;

const defaultClass =
  "text-[11px] uppercase tracking-[2px] text-[var(--thusness-muted)] no-underline transition-opacity hover:opacity-70";

/**
 * External link styled for quiet footers (~ connect).
 * Use `bare` with orient `site-footer-link` so CSS file utilities are not doubled.
 */
export function TelegramConnectLink({
  className,
  bare = false,
}: {
  className?: string;
  bare?: boolean;
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
      ~ connect
    </a>
  );
}
