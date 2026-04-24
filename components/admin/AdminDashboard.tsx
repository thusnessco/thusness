"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import type { JSONContent } from "@tiptap/core";
import { useRouter } from "next/navigation";

import { createNote, deleteNote, saveNote, signOut } from "@/app/admin/actions";
import type { NoteRow } from "@/lib/supabase/public-server";

import { jsonContentEqual } from "@/lib/tiptap/json-content-equal";

import {
  TiptapEditorField,
  type TiptapEditorFieldHandle,
} from "./TiptapEditorField";

type Props = {
  notes: NoteRow[];
};

/** Client copy of last successful save until RSC props catch the same `updated_at`. */
type NoteBodyOverride = { doc: JSONContent; key: string };

const fieldLabel =
  "text-[10px] uppercase tracking-[0.2em] text-[var(--thusness-muted)]";
const fieldInput =
  "w-full border border-[var(--thusness-rule)] bg-[var(--thusness-bg)] px-3 py-2 text-sm text-[var(--thusness-ink)] outline-none focus:border-[var(--thusness-ink)]";
const btnPrimary =
  "border border-[var(--thusness-ink)] px-4 py-2 text-xs tracking-wide text-[var(--thusness-ink)] transition-opacity hover:opacity-70 disabled:opacity-40";
const btnSmall =
  "self-start border border-[var(--thusness-rule)] px-3 py-1.5 text-xs tracking-wide text-[var(--thusness-ink)] transition-opacity hover:border-[var(--thusness-ink)] disabled:opacity-40";
const sectionHeading =
  "text-[11px] uppercase tracking-[2.4px] text-[var(--thusness-muted)]";

function NoteEditorPanel({
  note,
  noteBodyRef,
  isPending,
  startTransition,
  router,
  onMessage,
  onNoteBodySaved,
}: {
  note: NoteRow;
  noteBodyRef: React.RefObject<TiptapEditorFieldHandle | null>;
  isPending: boolean;
  startTransition: (cb: () => void) => void;
  router: ReturnType<typeof useRouter>;
  onMessage: (msg: string) => void;
  onNoteBodySaved?: (
    id: string,
    doc: JSONContent,
    updatedAt: string
  ) => void;
}) {
  const [slug, setSlug] = useState(note.slug);
  const [title, setTitle] = useState(note.title);
  const [excerpt, setExcerpt] = useState(note.excerpt ?? "");
  const [published, setPublished] = useState(note.published);

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-1.5">
          <span className={fieldLabel}>Title</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={fieldInput}
          />
        </label>
        <label className="block space-y-1.5">
          <span className={fieldLabel}>Slug (URL)</span>
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className={fieldInput}
          />
        </label>
      </div>
      <label className="block space-y-1.5">
        <span className={fieldLabel}>Excerpt (optional)</span>
        <textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          rows={2}
          className={`${fieldInput} resize-y`}
        />
      </label>
      <label className="block space-y-1.5">
        <span className="flex items-center gap-2 text-sm text-[var(--thusness-ink-soft)]">
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
            className="border-[var(--thusness-rule)] accent-[var(--thusness-ink)]"
          />
          Published
        </span>
        <span className="text-[10px] leading-relaxed text-[var(--thusness-muted)]">
          These records are not linked from the public navigation. The live site
          week archive is{" "}
          <code className="text-[var(--thusness-ink-soft)]">content/weeks/*.mdx</code>{" "}
          in the repo.
        </span>
      </label>

      <TiptapEditorField
        ref={noteBodyRef}
        label="Body"
        contentSyncKey={note.updated_at}
        initialDoc={note.content_json}
        imageUploadScope={`note/${note.id}`}
        onImageUploadMessage={onMessage}
        onEditorError={onMessage}
      />

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={isPending}
          onClick={() => {
            const json = noteBodyRef.current?.getJSON();
            if (!json) {
              onMessage(
                "Editor is not ready yet. Wait a second, then try Save note again."
              );
              return;
            }
            const bodySnapshot = structuredClone(json) as JSONContent;
            startTransition(async () => {
              const res = await saveNote({
                id: note.id,
                slug,
                title,
                excerpt: excerpt || null,
                content_json: bodySnapshot,
                published,
              });
              if (!res.ok) onMessage(res.message);
              else {
                onNoteBodySaved?.(note.id, res.content_json, res.updated_at);
                onMessage("Note saved.");
              }
            });
          }}
          className={btnPrimary}
        >
          Save note
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => {
            const label = title.trim() || slug || "this note";
            if (
              !window.confirm(
                `Delete “${label}” permanently? This cannot be undone.`
              )
            ) {
              return;
            }
            startTransition(async () => {
              const res = await deleteNote({ id: note.id, slug: note.slug });
              if (!res.ok) onMessage(res.message);
              else {
                onMessage("Note deleted.");
                router.refresh();
              }
            });
          }}
          className="border border-[var(--thusness-rule)] px-4 py-2 text-xs tracking-wide text-[var(--thusness-ink-soft)] italic transition-opacity hover:border-[var(--thusness-ink)] disabled:opacity-40"
        >
          Delete note
        </button>
      </div>
    </>
  );
}

export function AdminDashboard({ notes }: Props) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(
    notes[0]?.id ?? null
  );
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [noteBodyOverrides, setNoteBodyOverrides] = useState<
    Record<string, NoteBodyOverride>
  >({});

  useEffect(() => {
    if (!selectedId) return;
    setNoteBodyOverrides((prev) => {
      const o = prev[selectedId];
      if (!o) return prev;
      const srv = notes.find((n) => n.id === selectedId);
      if (!srv || o.key !== srv.updated_at) return prev;
      if (!jsonContentEqual(o.doc, srv.content_json)) return prev;
      const { [selectedId]: _, ...rest } = prev;
      return rest;
    });
  }, [notes, selectedId]);

  const noteBodyRef = useRef<TiptapEditorFieldHandle>(null);

  const selected = notes.find((n) => n.id === selectedId) ?? null;

  const selectedForEditor = useMemo(() => {
    if (!selected) return null;
    const o = noteBodyOverrides[selected.id];
    if (!o) return selected;
    return { ...selected, content_json: o.doc, updated_at: o.key };
  }, [selected, noteBodyOverrides]);

  useEffect(() => {
    if (selectedId != null && !notes.some((n) => n.id === selectedId)) {
      setSelectedId(notes[0]?.id ?? null);
    }
  }, [notes, selectedId]);

  function flash(msg: string) {
    setMessage(msg);
    setTimeout(() => setMessage(null), 3200);
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-14 md:py-20">
      <header className="mb-16 flex flex-col gap-6 border-b border-[var(--thusness-rule)] pb-10 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-medium tracking-tight text-[var(--thusness-ink)] md:text-3xl">
            Admin
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-[var(--thusness-ink-soft)]">
            The public home page and <code className="text-[var(--thusness-muted)]">/notes</code>{" "}
            archive come from <code className="text-[var(--thusness-muted)]">content/weeks</code>{" "}
            (MDX in git). Use this area for optional TipTap records (not shown on the
            public site).
          </p>
        </div>
        <form action={signOut}>
          <button
            type="submit"
            className="text-xs uppercase tracking-[2px] text-[var(--thusness-muted)] underline decoration-[var(--thusness-ink)] decoration-1 underline-offset-4 transition-opacity hover:opacity-70"
          >
            Sign out
          </button>
        </form>
      </header>

      {message ? (
        <p className="mb-8 text-sm text-[var(--thusness-ink-soft)]" role="status">
          {message}
        </p>
      ) : null}

      <section className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <h2 className={sectionHeading}>TipTap notes</h2>
          <button
            type="button"
            disabled={isPending}
            onClick={() => {
              startTransition(async () => {
                const res = await createNote();
                if (!res.ok) flash(res.message);
                else {
                  flash("Draft note created.");
                  setSelectedId(res.id);
                  router.refresh();
                }
              });
            }}
            className={btnSmall}
          >
            New note
          </button>
        </div>

        <div className="grid gap-10 md:grid-cols-[minmax(0,11rem)_minmax(0,1fr)]">
          <nav
            aria-label="Notes"
            className="space-y-1 border-b border-[var(--thusness-rule)] pb-8 md:border-b-0 md:border-r md:border-[var(--thusness-rule)] md:pb-0 md:pr-8"
          >
            {notes.map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => setSelectedId(n.id)}
                className={`block w-full border border-transparent px-2 py-2 text-left text-sm transition-colors ${
                  n.id === selectedId
                    ? "border-[var(--thusness-ink)] text-[var(--thusness-ink)]"
                    : "text-[var(--thusness-muted)] hover:border-[var(--thusness-rule)] hover:text-[var(--thusness-ink)]"
                }`}
              >
                <span className="block truncate">{n.title || "Untitled"}</span>
                {!n.published ? (
                  <span className="mt-0.5 block text-[10px] uppercase tracking-wider text-[var(--thusness-muted)]">
                    Draft
                  </span>
                ) : null}
              </button>
            ))}
          </nav>

          <div className="min-w-0 space-y-6">
            {selectedForEditor ? (
              <NoteEditorPanel
                key={selectedForEditor.id}
                note={selectedForEditor}
                noteBodyRef={noteBodyRef}
                isPending={isPending}
                startTransition={startTransition}
                router={router}
                onMessage={flash}
                onNoteBodySaved={(id, doc, updatedAt) => {
                  setNoteBodyOverrides((p) => ({
                    ...p,
                    [id]: { doc, key: updatedAt },
                  }));
                }}
              />
            ) : (
              <p className="text-sm text-[var(--thusness-muted)]">
                Create a note to begin.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
