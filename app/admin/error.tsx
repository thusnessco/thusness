"use client";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-lg px-6 py-24 font-sans text-[var(--thusness-ink-soft)]">
      <h1 className="text-lg font-medium tracking-tight text-[var(--thusness-ink)]">
        Admin couldn&apos;t load
      </h1>
      <p className="mt-4 text-sm leading-relaxed">
        Something went wrong while rendering this screen. You can try again, or
        reload the page.
      </p>
      {error.message ? (
        <pre className="mt-6 max-h-40 overflow-auto rounded border border-[var(--thusness-rule)] bg-[var(--thusness-bg)] p-3 text-[11px] leading-snug text-[var(--thusness-muted)]">
          {error.message}
        </pre>
      ) : null}
      <div className="mt-8 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="border border-[var(--thusness-ink)] px-4 py-2 text-xs tracking-wide text-[var(--thusness-ink)] transition-opacity hover:opacity-70"
        >
          Try again
        </button>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="border border-[var(--thusness-rule)] px-4 py-2 text-xs tracking-wide text-[var(--thusness-ink)] transition-opacity hover:border-[var(--thusness-ink)]"
        >
          Reload page
        </button>
      </div>
    </div>
  );
}
