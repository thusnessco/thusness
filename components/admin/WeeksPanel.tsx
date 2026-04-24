"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import type { JSONContent } from "@tiptap/core";
import { useRouter } from "next/navigation";

import { createWeek, deleteWeek, saveWeek } from "@/app/admin/actions";
import type { WeekDocument } from "@/lib/data/weeks-types";

import {
  TiptapEditorField,
  type TiptapEditorFieldHandle,
} from "./TiptapEditorField";

const fieldLabel =
  "text-[10px] uppercase tracking-[0.2em] text-[var(--thusness-muted)]";
const fieldInput =
  "w-full border border-[var(--thusness-rule)] bg-[var(--thusness-bg)] px-3 py-2 text-sm text-[var(--thusness-ink)] outline-none focus:border-[var(--thusness-ink)]";
const btnPrimary =
  "border border-[var(--thusness-ink)] px-4 py-2 text-xs tracking-wide text-[var(--thusness-ink)] transition-opacity hover:opacity-70 disabled:opacity-40";
const btnSmall =
  "border border-[var(--thusness-rule)] px-3 py-1.5 text-xs tracking-wide text-[var(--thusness-ink)] transition-opacity hover:border-[var(--thusness-ink)] disabled:opacity-40";

type Props = {
  weeks: WeekDocument[];
  onMessage: (msg: string) => void;
};

export function WeeksPanel({ weeks: initialWeeks, onMessage }: Props) {
  const router = useRouter();
  const [weeks, setWeeks] = useState(initialWeeks);
  const [selectedId, setSelectedId] = useState<string | null>(
    initialWeeks[0]?.id ?? null
  );
  const [draft, setDraft] = useState({
    slug: "",
    weekOf: "",
    themeTitle: "",
    question: "",
  });
  const previousSlugRef = useRef("");
  const editorRef = useRef<TiptapEditorFieldHandle>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setWeeks(initialWeeks);
  }, [initialWeeks]);

  const selected = useMemo(
    () => weeks.find((w) => w.id === selectedId) ?? null,
    [weeks, selectedId]
  );

  useEffect(() => {
    if (!selected) {
      setDraft({ slug: "", weekOf: "", themeTitle: "", question: "" });
      previousSlugRef.current = "";
      return;
    }
    setDraft({
      slug: selected.slug,
      weekOf: selected.weekOf,
      themeTitle: selected.themeTitle,
      question: selected.question,
    });
    previousSlugRef.current = selected.slug;
  }, [selected?.id, selected?.updatedAt]);

  useEffect(() => {
    if (selectedId != null && !weeks.some((w) => w.id === selectedId)) {
      setSelectedId(weeks[0]?.id ?? null);
    }
  }, [weeks, selectedId]);

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-[11px] uppercase tracking-[2.4px] text-[var(--thusness-muted)]">
            Weeks (home + /notes)
          </h2>
          <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-[var(--thusness-muted)]">
            Each week is one TipTap document. The week with the latest{" "}
            <span className="italic">week of</span> date on or before today is the
            public home page. Older weeks show on{" "}
            <code className="text-[var(--thusness-ink-soft)]">/notes</code>. In the
            editor toolbar, use{" "}
            <span className="text-[var(--thusness-ink-soft)]">Sample week page</span>{" "}
            for the full design-handoff layout (hero, pull quote, ruled lists, session
            cards, Zoom row), or{" "}
            <span className="text-[var(--thusness-ink-soft)]">+ Layout block</span> to
            insert pieces one at a time.
          </p>
        </div>
        <button
          type="button"
          disabled={isPending}
          className={btnSmall}
          onClick={() => {
            startTransition(async () => {
              const res = await createWeek();
              if (!res.ok) onMessage(res.message);
              else {
                onMessage("New week created.");
                setSelectedId(res.id);
                router.refresh();
              }
            });
          }}
        >
          New week
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,14rem)_minmax(0,1fr)]">
        <nav aria-label="Weeks" className="space-y-1 border-b border-[var(--thusness-rule)] pb-6 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-6">
          {weeks.map((w) => (
            <button
              key={w.id}
              type="button"
              onClick={() => setSelectedId(w.id)}
              className={`block w-full border border-transparent px-2 py-2 text-left text-sm transition-colors ${
                w.id === selectedId
                  ? "border-[var(--thusness-ink)] text-[var(--thusness-ink)]"
                  : "text-[var(--thusness-muted)] hover:border-[var(--thusness-rule)] hover:text-[var(--thusness-ink)]"
              }`}
            >
              <span className="block truncate font-medium">{w.themeTitle || w.slug}</span>
              <span className="mt-0.5 block text-[10px] uppercase tracking-wider text-[var(--thusness-muted)]">
                {w.weekOf}
              </span>
            </button>
          ))}
        </nav>

        <div className="min-w-0 space-y-6">
          {selected ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block space-y-1.5">
                  <span className={fieldLabel}>Slug (URL)</span>
                  <input
                    value={draft.slug}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, slug: e.target.value }))
                    }
                    className={fieldInput}
                  />
                </label>
                <label className="block space-y-1.5">
                  <span className={fieldLabel}>Week of</span>
                  <input
                    type="date"
                    value={draft.weekOf}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, weekOf: e.target.value }))
                    }
                    className={fieldInput}
                  />
                </label>
              </div>
              <label className="block space-y-1.5">
                <span className={fieldLabel}>Theme title (archive list)</span>
                <input
                  value={draft.themeTitle}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, themeTitle: e.target.value }))
                  }
                  className={fieldInput}
                />
              </label>
              <label className="block space-y-1.5">
                <span className={fieldLabel}>Question (archive subtitle)</span>
                <input
                  value={draft.question}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, question: e.target.value }))
                  }
                  className={fieldInput}
                />
              </label>

              <TiptapEditorField
                key={selected.id}
                ref={editorRef}
                label="Page body (published as-is on the site)"
                contentSyncKey={selected.updatedAt}
                initialDoc={selected.bodyJson}
                imageUploadScope={`week/${selected.id}`}
                onImageUploadMessage={onMessage}
                onEditorError={onMessage}
                onTemplateNotice={onMessage}
                variant="page"
              />

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  disabled={isPending}
                  className={btnPrimary}
                  onClick={() => {
                    const json = editorRef.current?.getJSON();
                    if (!json) {
                      onMessage("Editor is not ready yet. Try Save again.");
                      return;
                    }
                    startTransition(async () => {
                      const res = await saveWeek({
                        id: selected.id,
                        slug: draft.slug,
                        weekOf: draft.weekOf,
                        themeTitle: draft.themeTitle,
                        question: draft.question,
                        bodyJson: structuredClone(json) as JSONContent,
                        previousSlug: previousSlugRef.current,
                      });
                      if (!res.ok) onMessage(res.message);
                      else {
                        previousSlugRef.current = draft.slug.trim();
                        onMessage("Week saved.");
                        router.refresh();
                      }
                    });
                  }}
                >
                  Save week
                </button>
                <button
                  type="button"
                  disabled={isPending}
                  className="border border-[var(--thusness-rule)] px-4 py-2 text-xs tracking-wide text-[var(--thusness-ink-soft)] italic transition-opacity hover:border-[var(--thusness-ink)] disabled:opacity-40"
                  onClick={() => {
                    if (
                      !window.confirm(
                        "Delete this week from the database? This cannot be undone."
                      )
                    ) {
                      return;
                    }
                    startTransition(async () => {
                      const res = await deleteWeek({
                        id: selected.id,
                        slug: selected.slug,
                      });
                      if (!res.ok) onMessage(res.message);
                      else {
                        onMessage("Week deleted.");
                        setSelectedId(null);
                        router.refresh();
                      }
                    });
                  }}
                >
                  Delete week
                </button>
              </div>
            </>
          ) : (
            <p className="text-sm text-[var(--thusness-muted)]">
              No weeks yet. Click &ldquo;New week&rdquo; to create one.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
