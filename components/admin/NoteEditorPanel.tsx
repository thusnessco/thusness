"use client";

import { useState, type RefObject } from "react";
import type { JSONContent } from "@tiptap/core";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { deleteNote, saveNote, setHomepagePinToNoteSlug } from "@/app/admin/actions";
import type { HomepagePin } from "@/lib/homepage/homepage-pin";
import type { NoteRow } from "@/lib/supabase/public-server";

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
  "self-start border border-[var(--thusness-rule)] px-3 py-1.5 text-xs tracking-wide text-[var(--thusness-ink)] transition-opacity hover:border-[var(--thusness-ink)] disabled:opacity-40";

export function NoteEditorPanel({
  note,
  homepagePin,
  noteBodyRef,
  isPending,
  startTransition,
  router,
  onMessage,
  onNoteBodySaved,
}: {
  note: NoteRow;
  homepagePin: HomepagePin;
  noteBodyRef: RefObject<TiptapEditorFieldHandle | null>;
  isPending: boolean;
  startTransition: (cb: () => void) => void;
  router: AppRouterInstance;
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
          Published notes appear on the public{" "}
          <code className="text-[var(--thusness-ink-soft)]">/notes</code> index and
          at <code className="text-[var(--thusness-ink-soft)]">/notes/your-slug</code>
          .
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

      <div className="mt-10 space-y-4 border-t border-[var(--thusness-rule)] pt-8">
        <p className={fieldLabel}>Note actions</p>
        {homepagePin.source === "note" && homepagePin.slug === note.slug ? (
          <p className="text-sm italic text-[var(--thusness-ink-soft)]">
            This published note is the live homepage at{" "}
            <span className="not-italic">/</span>.
          </p>
        ) : (
          <p className="max-w-2xl text-[13px] leading-relaxed text-[var(--thusness-muted)]">
            <span className="font-medium text-[var(--thusness-ink)]">
              Save to homepage
            </span>{" "}
            pins this note for visitors at <span className="italic">/</span>. It
            must be published and the slug field must match what you last saved.
          </p>
        )}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={isPending}
            onClick={() => {
              const json = noteBodyRef.current?.getJSON();
              if (!json) {
                onMessage(
                  "Editor is not ready yet. Wait a moment, then try Save again."
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
            Save
          </button>
          <button
            type="button"
            disabled={
              isPending ||
              !note.published ||
              slug.trim() !== note.slug ||
              slug.trim().length === 0
            }
            className={btnSmall}
            title={
              !note.published
                ? "Publish this note first."
                : slug.trim() !== note.slug
                  ? "Save the note so the slug matches before pinning."
                  : undefined
            }
            onClick={() => {
              startTransition(async () => {
                const res = await setHomepagePinToNoteSlug(note.slug);
                if (!res.ok) onMessage(res.message);
                else {
                  onMessage("Homepage now uses this note.");
                  router.refresh();
                }
              });
            }}
          >
            Save to homepage
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
            Delete
          </button>
        </div>
      </div>
    </>
  );
}
