"use client";

import { useEffect, useState, type RefObject } from "react";
import type { JSONContent } from "@tiptap/core";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

import {
  deleteNote,
  resetHomepagePinToDefaultLayout,
  saveNote,
  setHomepagePinToNoteSlug,
} from "@/app/admin/actions";
import type { HomepagePin } from "@/lib/homepage/homepage-pin";
import {
  NOTE_CATEGORIES,
  NOTE_CATEGORY_LABELS,
  parseNoteCategory,
  type NoteCategory,
} from "@/lib/notes/category";
import type { NoteRow } from "@/lib/supabase/public-server";

import {
  adminBtnGhost,
  adminBtnPrimary,
  adminFieldInput,
  adminFieldLabel,
} from "./admin-ui";
import { noteDrivesRoot } from "./homepage-helpers";
import {
  TiptapEditorField,
  type TiptapEditorFieldHandle,
} from "./TiptapEditorField";

const checkRow =
  "flex items-start gap-2 text-sm text-[var(--thusness-ink-soft)]";
const checkHint = "text-[10px] leading-relaxed text-[var(--thusness-muted)]";

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
  const [showBackgroundCircle, setShowBackgroundCircle] = useState(
    () => note.show_background_circle ?? false
  );
  const [isTemplate, setIsTemplate] = useState(() => note.is_template ?? false);
  const [category, setCategory] = useState<"" | NoteCategory>(
    () => parseNoteCategory(note.category) ?? ""
  );

  useEffect(() => {
    setPublished(note.published);
  }, [note.id, note.published, note.updated_at]);

  useEffect(() => {
    setShowBackgroundCircle(note.show_background_circle ?? false);
  }, [note.id, note.updated_at, note.show_background_circle]);

  useEffect(() => {
    setIsTemplate(note.is_template ?? false);
  }, [note.id, note.updated_at, note.is_template]);

  useEffect(() => {
    setCategory(parseNoteCategory(note.category) ?? "");
  }, [note.id, note.updated_at, note.category]);

  const slugDirty = slug.trim() !== note.slug;
  const liveOnRoot = noteDrivesRoot(homepagePin, note);
  const canPinToRoot = published && !slugDirty;

  return (
    <>
      <fieldset className="space-y-4 border border-[var(--thusness-rule)] px-4 py-4">
        <legend className={`px-1 ${adminFieldLabel}`}>Visibility</legend>

        <label className={checkRow}>
          <input
            type="checkbox"
            className="mt-1 border-[var(--thusness-rule)] accent-[var(--thusness-ink)]"
            checked={published}
            disabled={isPending}
            onChange={(e) => setPublished(e.target.checked)}
          />
          <span>
            <span className="font-medium text-[var(--thusness-ink)]">
              Listed on /notes
            </span>
            <span className={`mt-1 block ${checkHint}`}>
              Public index for this slug. Save the note to apply.
            </span>
          </span>
        </label>

        <label className={checkRow}>
          <input
            type="checkbox"
            className="mt-1 border-[var(--thusness-rule)] accent-[var(--thusness-ink)]"
            checked={liveOnRoot}
            disabled={isPending || (!liveOnRoot && !canPinToRoot)}
            title={
              !published
                ? "Publish first (listed on /notes)."
                : slugDirty
                  ? "Save slug changes before changing the homepage."
                  : undefined
            }
            onChange={(e) => {
              const on = e.target.checked;
              if (on) {
                startTransition(async () => {
                  const res = await setHomepagePinToNoteSlug(note.slug);
                  if (!res.ok) onMessage(res.message);
                  else {
                    onMessage("This note is now live at /.");
                    router.refresh();
                  }
                });
              } else if (liveOnRoot) {
                startTransition(async () => {
                  const res = await resetHomepagePinToDefaultLayout();
                  if (!res.ok) onMessage(res.message);
                  else {
                    onMessage("Homepage reset to default Simple layout.");
                    router.refresh();
                  }
                });
              }
            }}
          />
          <span>
            <span className="font-medium text-[var(--thusness-ink)]">
              Same note at /
            </span>
            <span className={`mt-1 block ${checkHint}`}>
              Same body as here — only the URL changes. Requires published + saved
              slug.
            </span>
          </span>
        </label>
      </fieldset>

      <fieldset className="space-y-4 border border-[var(--thusness-rule)] px-4 py-4">
        <legend className={`px-1 ${adminFieldLabel}`}>Public layout</legend>
        <label className={checkRow}>
          <input
            type="checkbox"
            className="mt-1 border-[var(--thusness-rule)] accent-[var(--thusness-ink)]"
            checked={showBackgroundCircle}
            disabled={isPending}
            onChange={(e) => setShowBackgroundCircle(e.target.checked)}
          />
          <span>
            <span className="font-medium text-[var(--thusness-ink)]">
              Decorative circle behind the body
            </span>
            <span className={`mt-1 block ${checkHint}`}>
              Thin ring framing the opening block on the public note page (and at{" "}
              <span className="italic">/</span> when this note is pinned). Save to
              apply.
            </span>
          </span>
        </label>
      </fieldset>

      <fieldset className="space-y-4 border border-[var(--thusness-rule)] px-4 py-4">
        <legend className={`px-1 ${adminFieldLabel}`}>Templates</legend>
        <label className={checkRow}>
          <input
            type="checkbox"
            className="mt-1 border-[var(--thusness-rule)] accent-[var(--thusness-ink)]"
            checked={isTemplate}
            disabled={isPending}
            onChange={(e) => setIsTemplate(e.target.checked)}
          />
          <span>
            <span className="font-medium text-[var(--thusness-ink)]">
              Reusable template
            </span>
            <span className={`mt-1 block ${checkHint}`}>
              This note appears in Admin under “New from template” so you can spawn
              drafts with the same TipTap layout. Template notes are{" "}
              <span className="font-medium text-[var(--thusness-ink-soft)]">
                not
              </span>{" "}
              listed on the public <span className="italic">/notes</span> index
              (you can still pin one to <span className="italic">/</span>). Save to
              apply.
            </span>
          </span>
        </label>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-1.5">
          <span className={adminFieldLabel}>Title</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={adminFieldInput}
          />
        </label>
        <label className="block space-y-1.5">
          <span className={adminFieldLabel}>Slug (URL)</span>
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className={adminFieldInput}
          />
        </label>
      </div>
      <label className="block space-y-1.5">
        <span className={adminFieldLabel}>Excerpt (optional)</span>
        <textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          rows={2}
          className={`${adminFieldInput} resize-y`}
        />
      </label>

      <label className="block max-w-md space-y-1.5">
        <span className={adminFieldLabel}>Category</span>
        <select
          value={category}
          disabled={isPending}
          onChange={(e) =>
            setCategory(
              (e.target.value as NoteCategory | "") === ""
                ? ""
                : (e.target.value as NoteCategory)
            )
          }
          className={adminFieldInput}
        >
          <option value="">Unsorted</option>
          {NOTE_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {NOTE_CATEGORY_LABELS[c]}
            </option>
          ))}
        </select>
        <span className={`block ${checkHint}`}>
          Filters the note list in Admin and optional views on{" "}
          <span className="italic">/notes</span>. Save to apply.
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
        variant="page"
        onTemplateNotice={onMessage}
      />

      <div className="mt-10 space-y-4 border-t border-[var(--thusness-rule)] pt-8">
        <p className={adminFieldLabel}>Save</p>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={isPending}
            onClick={() => {
              const json = noteBodyRef.current?.getJSON();
              if (!json) {
                onMessage(
                  "Editor is not ready yet. Wait a moment, then try again."
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
                  show_background_circle: showBackgroundCircle,
                  is_template: isTemplate,
                  category: parseNoteCategory(category || null),
                });
                if (!res.ok) onMessage(res.message);
                else {
                  onNoteBodySaved?.(note.id, res.content_json, res.updated_at);
                  onMessage("Saved.");
                  router.refresh();
                }
              });
            }}
            className={adminBtnPrimary}
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
            className={adminBtnGhost}
          >
            Delete
          </button>
        </div>
      </div>
    </>
  );
}
