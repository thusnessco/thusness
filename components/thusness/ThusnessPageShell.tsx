import Link from "next/link";

import Wordmark from "./Wordmark";

type Props = {
  children: React.ReactNode;
  /** Right side of the header row (e.g. caps nav link). */
  headerAside?: React.ReactNode;
};

/**
 * Shared page frame: 880px column, padding, Helvetica (notes / archive index).
 */
export function ThusnessPageShell({ children, headerAside }: Props) {
  return (
    <div
      className="mx-auto max-w-[880px] px-6 pb-24 pt-12 text-[var(--thusness-ink)] sm:px-10"
      style={{
        fontFamily: 'Helvetica, "Helvetica Neue", Arial, sans-serif',
        WebkitFontSmoothing: "antialiased",
      }}
    >
      <header className="mb-16 flex items-start justify-between gap-8">
        <Link
          href="/"
          className="inline-block transition-opacity hover:opacity-70"
          aria-label="Thusness home"
        >
          <Wordmark size={20} />
        </Link>
        {headerAside ? (
          <div className="text-right text-[11px] uppercase leading-relaxed tracking-[2.4px] text-[var(--thusness-muted)]">
            {headerAside}
          </div>
        ) : null}
      </header>
      {children}
    </div>
  );
}
