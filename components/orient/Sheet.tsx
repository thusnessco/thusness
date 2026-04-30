"use client";

import Wordmark from "@/components/thusness/Wordmark";
import RedDot from "@/components/thusness/RedDot";

type Props = {
  boardWidth: number;
  boardHeight: number;
  kicker?: string;
  title?: string;
  sub?: string;
  /** Optional top-right line (e.g. sheet index). Omit for no right header. */
  dateline?: string;
  sheetFooter?: string;
  children: React.ReactNode;
};

export function OrientSheet({
  boardWidth,
  boardHeight,
  kicker,
  title,
  sub,
  dateline,
  sheetFooter = "thusness.co · orient",
  children,
}: Props) {
  return (
    <div
      className="orient-sheet box-border flex min-h-0 flex-col bg-[var(--thusness-bg)] px-10 pb-8 pt-9 text-[var(--thusness-ink)] antialiased"
      style={{
        fontFamily: 'Helvetica, "Helvetica Neue", Arial, sans-serif',
        width: boardWidth,
        height: boardHeight,
      }}
    >
      <header className="mb-6 flex shrink-0 items-start justify-between gap-6">
        <Wordmark size={16} tagline="~ as it is" />
        {dateline?.trim() ? (
          <div
            className="max-w-[220px] text-right text-[10px] uppercase leading-relaxed tracking-[2.2px] text-[var(--thusness-muted)]"
            style={{ fontFamily: 'Helvetica, "Helvetica Neue", Arial, sans-serif' }}
          >
            {dateline}
          </div>
        ) : null}
      </header>
      <div className="mx-auto mb-6 w-full max-w-[720px] shrink-0 text-center">
        {kicker ? (
          <div className="mb-3 text-[11px] uppercase tracking-[2.2px] text-[var(--thusness-muted)]">
            {kicker}
          </div>
        ) : null}
        {title ? (
          <h2 className="mx-auto max-w-[22ch] text-[34px] font-medium leading-[1.08] tracking-[-0.5px]">
            {title}
          </h2>
        ) : null}
        {sub ? (
          <div className="mx-auto mt-3 max-w-[52ch] text-[14px] italic leading-snug tracking-[0.35px] text-[var(--thusness-muted)]">
            {sub}
          </div>
        ) : null}
      </div>
      <div className="flex min-h-0 flex-1 flex-col justify-center">{children}</div>
      <footer className="mt-6 flex shrink-0 items-center justify-between border-t border-[var(--thusness-rule)] pt-4 text-[10px] uppercase tracking-[1.8px] text-[var(--thusness-muted)]">
        <span className="max-w-[min(90%,720px)] leading-snug">{sheetFooter}</span>
        <RedDot size={11} />
      </footer>
    </div>
  );
}
