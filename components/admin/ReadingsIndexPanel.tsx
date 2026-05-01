"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { saveReadingsIndex } from "@/app/admin/actions";
import {
  sanitizeReadingsExternalHref,
  type ReadingsIndexConfig,
} from "@/lib/readings/readings-index";
import type { NoteRow } from "@/lib/supabase/public-server";
import { NOTE_PAGES_BASE } from "@/lib/site/note-pages";

import {
  adminBtnGhost,
  adminBtnPrimary,
  adminBtnSmall,
  adminFieldInput,
  adminFieldLabel,
} from "./admin-ui";

export function ReadingsIndexPanel({
  initialConfig,
  readingsUpdatedAt,
  notes,
  isPending,
  startTransition,
  onMessage,
}: {
  initialConfig: ReadingsIndexConfig;
  readingsUpdatedAt: string | null;
  notes: NoteRow[];
  isPending: boolean;
  startTransition: (cb: () => void) => void;
  onMessage: (msg: string) => void;
}) {
  const router = useRouter();
  const [config, setConfig] = useState<ReadingsIndexConfig>(initialConfig);
  const [linkLabel, setLinkLabel] = useState("");
  const [linkHref, setLinkHref] = useState("");
  const [pickNoteId, setPickNoteId] = useState("");

  useEffect(() => {
    setConfig(initialConfig);
  }, [readingsUpdatedAt, initialConfig]);

  const notesById = useMemo(() => new Map(notes.map((n) => [n.id, n])), [notes]);

  const sortedPickNotes = useMemo(
    () =>
      [...notes].sort((a, b) =>
        (a.title || a.slug).localeCompare(b.title || b.slug, undefined, {
          sensitivity: "base",
        })
      ),
    [notes]
  );

  function moveItem(from: number, delta: -1 | 1) {
    setConfig((c) => {
      const to = from + delta;
      if (to < 0 || to >= c.items.length) return c;
      const items = [...c.items];
      const [row] = items.splice(from, 1);
      items.splice(to, 0, row);
      return { items };
    });
  }

  function removeAt(i: number) {
    setConfig((c) => ({ items: c.items.filter((_, j) => j !== i) }));
  }

  function addNoteFromPick() {
    const id = pickNoteId.trim();
    if (!id) return;
    setConfig((c) => {
      if (c.items.some((it) => it.type === "note" && it.note_id === id)) {
        return c;
      }
      return { items: [...c.items, { type: "note", note_id: id }] };
    });
    setPickNoteId("");
  }

  function addExternalLink() {
    const label = linkLabel.trim().slice(0, 200);
    const href = sanitizeReadingsExternalHref(linkHref);
    if (!label || !href) {
      onMessage(
        "Add a label and a valid URL (https://…) or an internal path starting with /."
      );
      return;
    }
    setConfig((c) => ({
      items: [...c.items, { type: "link", label, href }],
    }));
    setLinkLabel("");
    setLinkHref("");
  }

  return (
    <section className="space-y-5 border border-[var(--thusness-rule)] p-4">
      <header className="space-y-1">
        <h3 className="text-base text-[var(--thusness-ink)]">Readings (/readings)</h3>
        <p className="text-xs text-[var(--thusness-muted)]">
          Curate what appears on the public readings page: published notes (by
          reference) and external or internal links. Order here is the order on
          the site.
        </p>
        <p className="text-[11px] text-[var(--thusness-muted)]">
          You can also toggle{" "}
          <span className="text-[var(--thusness-ink-soft)]">
            Listed on /readings
          </span>{" "}
          on each note.{" "}
          <Link
            href="/readings"
            className="underline decoration-[var(--thusness-rule)] underline-offset-2 hover:opacity-70"
            target="_blank"
            rel="noreferrer"
          >
            Open /readings
          </Link>
        </p>
      </header>

      <div className="space-y-2 border-t border-[var(--thusness-rule)] pt-4">
        <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--thusness-muted)]">
          List ({config.items.length})
        </p>
        {config.items.length === 0 ? (
          <p className="text-sm italic text-[var(--thusness-muted)]">
            Nothing listed yet. Add a note or link below, or use the checkbox on a
            note.
          </p>
        ) : (
          <ul className="space-y-2">
            {config.items.map((it, i) => {
              if (it.type === "note") {
                const n = notesById.get(it.note_id);
                const title = n?.title?.trim() || n?.slug || "Unknown note";
                const draft = n && !n.published;
                return (
                  <li
                    key={`n-${it.note_id}-${i}`}
                    className="flex flex-wrap items-start gap-2 border border-[var(--thusness-rule)] bg-[var(--thusness-bg)] px-3 py-2 text-sm"
                  >
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] uppercase tracking-wider text-[var(--thusness-muted)]">
                        Note
                      </span>
                      <p className="truncate font-medium text-[var(--thusness-ink)]">
                        {title}
                      </p>
                      {draft ? (
                        <p className="mt-0.5 text-[11px] text-[var(--thusness-muted)]">
                          Draft — hidden on /readings until published.
                        </p>
                      ) : n ? (
                        <p className="mt-0.5 text-[11px] text-[var(--thusness-muted)]">
                          {`${NOTE_PAGES_BASE}/${n.slug}`}
                        </p>
                      ) : (
                        <p className="mt-0.5 text-[11px] text-[var(--thusness-red,#c23a2a)]">
                          Note not found — remove this row or fix the id.
                        </p>
                      )}
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-1">
                      <button
                        type="button"
                        disabled={isPending || i === 0}
                        className={adminBtnSmall}
                        onClick={() => moveItem(i, -1)}
                      >
                        Up
                      </button>
                      <button
                        type="button"
                        disabled={isPending || i >= config.items.length - 1}
                        className={adminBtnSmall}
                        onClick={() => moveItem(i, 1)}
                      >
                        Down
                      </button>
                      <button
                        type="button"
                        disabled={isPending}
                        className={adminBtnGhost}
                        onClick={() => removeAt(i)}
                      >
                        Remove
                      </button>
                    </div>
                  </li>
                );
              }
              return (
                <li
                  key={`l-${it.href}-${i}`}
                  className="flex flex-wrap items-start gap-2 border border-[var(--thusness-rule)] bg-[var(--thusness-bg)] px-3 py-2 text-sm"
                >
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] uppercase tracking-wider text-[var(--thusness-muted)]">
                      Link
                    </span>
                    <p className="font-medium text-[var(--thusness-ink)]">{it.label}</p>
                    <p className="mt-0.5 truncate text-[11px] text-[var(--thusness-muted)]">
                      {it.href}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-1">
                    <button
                      type="button"
                      disabled={isPending || i === 0}
                      className={adminBtnSmall}
                      onClick={() => moveItem(i, -1)}
                    >
                      Up
                    </button>
                    <button
                      type="button"
                      disabled={isPending || i >= config.items.length - 1}
                      className={adminBtnSmall}
                      onClick={() => moveItem(i, 1)}
                    >
                      Down
                    </button>
                    <button
                      type="button"
                      disabled={isPending}
                      className={adminBtnGhost}
                      onClick={() => removeAt(i)}
                    >
                      Remove
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="grid gap-4 border-t border-[var(--thusness-rule)] pt-4 sm:grid-cols-2">
        <div className="space-y-2">
          <span className={adminFieldLabel}>Add a note</span>
          <select
            className={`${adminFieldInput} w-full text-sm`}
            value={pickNoteId}
            disabled={isPending}
            onChange={(e) => setPickNoteId(e.target.value)}
          >
            <option value="">Choose note…</option>
            {sortedPickNotes.map((n) => (
              <option key={n.id} value={n.id}>
                {(n.title || "Untitled").slice(0, 80)}
                {!n.published ? " (draft)" : ""}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={isPending || !pickNoteId}
            className={adminBtnSmall}
            onClick={addNoteFromPick}
          >
            Add to list
          </button>
        </div>
        <div className="space-y-2">
          <span className={adminFieldLabel}>Add a link (not a note)</span>
          <input
            className={adminFieldInput}
            placeholder="Label"
            value={linkLabel}
            disabled={isPending}
            onChange={(e) => setLinkLabel(e.target.value)}
          />
          <input
            className={adminFieldInput}
            placeholder="https://… or /internal-path"
            value={linkHref}
            disabled={isPending}
            onChange={(e) => setLinkHref(e.target.value)}
          />
          <button
            type="button"
            disabled={isPending}
            className={adminBtnSmall}
            onClick={addExternalLink}
          >
            Add link
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-[var(--thusness-rule)] pt-4">
        <button
          type="button"
          disabled={isPending}
          className={adminBtnPrimary}
          onClick={() => {
            startTransition(async () => {
              const res = await saveReadingsIndex(config);
              if (!res.ok) onMessage(res.message);
              else {
                onMessage("Readings index saved.");
                router.refresh();
              }
            });
          }}
        >
          Save readings
        </button>
        {readingsUpdatedAt ? (
          <span className="text-[10px] text-[var(--thusness-muted)]">
            Last saved {new Date(readingsUpdatedAt).toLocaleString()}
          </span>
        ) : null}
      </div>
    </section>
  );
}
