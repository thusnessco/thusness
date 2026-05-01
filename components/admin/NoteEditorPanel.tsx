"use client";

import { useEffect, useMemo, useState, type RefObject } from "react";
import type { JSONContent } from "@tiptap/core";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import Link from "next/link";

import {
  deleteNote,
  resetHomepagePinToDefaultLayout,
  restoreResistanceNoteFromSeed,
  saveNote,
  setHomepagePinToNoteSlug,
  toggleNoteOnReadingsIndex,
} from "@/app/admin/actions";
import type { HomepagePin } from "@/lib/homepage/homepage-pin";
import {
  NOTE_CATEGORIES,
  NOTE_CATEGORY_LABELS,
  parseNoteCategory,
  type NoteCategory,
} from "@/lib/notes/category";
import type { OrientContent } from "@/lib/orient-infographics/types";
import resistanceSeedDoc from "@/lib/notes/resistance-seed-doc.json";
import type { NoteRow } from "@/lib/supabase/public-server";
import { emptyDoc } from "@/lib/tiptap/empty-doc";
import { jsonContentEqual } from "@/lib/tiptap/json-content-equal";
import { tiptapDocHasNonWhitespaceText } from "@/lib/tiptap/tiptap-doc-text";
import { NOTE_PAGES_BASE, notePageHref } from "@/lib/site/note-pages";

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

const RESISTANCE_NOTE_SLUG = "working-with-resistance";

function looksLikeBlankResistanceBody(doc: JSONContent): boolean {
  if (!doc || doc.type !== "doc") return true;
  if (jsonContentEqual(doc, emptyDoc())) return true;
  const blocks = doc.content;
  if (!blocks?.length) return true;
  const onlyEmptyParagraph = (node: JSONContent): boolean => {
    if (node.type !== "paragraph") return false;
    const inner = node.content;
    if (!inner?.length) return true;
    return inner.every(
      (n) =>
        n.type === "text" &&
        String((n as { text?: string }).text ?? "").trim().length === 0
    );
  };
  if (blocks.length === 1 && onlyEmptyParagraph(blocks[0]!)) return true;
  return false;
}

/** DB body is empty, invalid, or whitespace-only — load packaged TipTap JSON in Admin. */
function shouldUseResistanceSeedPackagedBody(doc: JSONContent): boolean {
  if (looksLikeBlankResistanceBody(doc)) return true;
  return !tiptapDocHasNonWhitespaceText(doc);
}

export function NoteEditorPanel({
  note,
  homepagePin,
  noteBodyRef,
  isPending,
  startTransition,
  router,
  onMessage,
  onNoteBodySaved,
  orientSiteDefaults,
  onReadingsList = false,
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
  /** Site Orient infographics (merged with per-embed patches in the orientation note editor). */
  orientSiteDefaults?: OrientContent;
  /** Whether this note id appears on the curated /readings list. */
  onReadingsList?: boolean;
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

  const resistanceUsesPackagedSeed = useMemo(() => {
    if (note.slug !== RESISTANCE_NOTE_SLUG) return false;
    const raw = (note.content_json ?? emptyDoc()) as JSONContent;
    return shouldUseResistanceSeedPackagedBody(raw);
  }, [note.id, note.slug, note.updated_at, note.content_json]);

  const editorInitialDoc = useMemo(() => {
    const raw = (note.content_json ?? emptyDoc()) as JSONContent;
    if (note.slug !== RESISTANCE_NOTE_SLUG) return raw;
    if (shouldUseResistanceSeedPackagedBody(raw)) {
      return resistanceSeedDoc as JSONContent;
    }
    return raw;
  }, [note.id, note.slug, note.updated_at, note.content_json]);

  const noteBodyEditorKey =
    note.slug === RESISTANCE_NOTE_SLUG
      ? `${note.id}-${note.updated_at}-${resistanceUsesPackagedSeed ? "seed" : "stored"}`
      : `${note.id}-${note.updated_at}`;

  return (
    <>
      {liveOnRoot ? (
        <div
          className="border border-[var(--thusness-red,#c23a2a)] bg-[var(--thusness-bg)] px-4 py-3 text-sm text-[var(--thusness-ink)]"
          role="status"
        >
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--thusness-red,#c23a2a)]">
            Live homepage
          </p>
          <p className="mt-1 leading-relaxed">
            This note is what visitors see at{" "}
            <span className="font-medium">/</span>. Uncheck{" "}
            <span className="italic">Same note at /</span> below to return the root
            to the default Simple layout.
          </p>
        </div>
      ) : null}

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
              Listed on {NOTE_PAGES_BASE}
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
                ? `Publish first (listed on ${NOTE_PAGES_BASE}).`
                : slugDirty
                  ? "Save slug changes before changing the homepage."
                  : undefined
            }
            onChange={(e) => {
              const on = e.target.checked;
              if (on) {
                startTransition(async () => {
                  const res = await setHomepagePinToNoteSlug(slug.trim());
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
              Same note at / (homepage)
            </span>
            <span className={`mt-1 block ${checkHint}`}>
              When on, <span className="italic">/</span> shows this note&apos;s body.
              Requires published and saved slug. Turn off to restore the default
              Simple layout at <span className="italic">/</span>.
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
              listed on the public <span className="italic">{NOTE_PAGES_BASE}</span> index
              (you can still pin one to <span className="italic">/</span>). Save to
              apply.
            </span>
          </span>
        </label>
      </fieldset>

      <fieldset className="space-y-4 border border-[var(--thusness-rule)] px-4 py-4">
        <legend className={`px-1 ${adminFieldLabel}`}>Readings</legend>
        <label className={checkRow}>
          <input
            type="checkbox"
            className="mt-1 border-[var(--thusness-rule)] accent-[var(--thusness-ink)]"
            checked={onReadingsList}
            disabled={isPending}
            onChange={(e) => {
              const on = e.target.checked;
              startTransition(async () => {
                const res = await toggleNoteOnReadingsIndex({
                  noteId: note.id,
                  on,
                });
                if (!res.ok) onMessage(res.message);
                else {
                  onMessage(
                    on
                      ? "This note is on /readings (order in Admin → Readings)."
                      : "Removed from /readings."
                  );
                  router.refresh();
                }
              });
            }}
          />
          <span>
            <span className="font-medium text-[var(--thusness-ink)]">
              Listed on /readings
            </span>
            <span className={`mt-1 block ${checkHint}`}>
              Curated list on the public readings page. Reorder or add links under{" "}
              <span className="font-medium text-[var(--thusness-ink-soft)]">
                Hidden pages → Readings
              </span>
              . Only published notes appear to visitors.
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
          <span className="italic">{NOTE_PAGES_BASE}</span>. Save to apply.
        </span>
      </label>

      {note.slug === "orientation" ? (
        <p className="mb-3 max-w-2xl text-[11px] leading-relaxed text-[var(--thusness-muted)]">
          Use <span className="text-[var(--thusness-ink-soft)]">+ Orient diagram…</span>{" "}
          in the toolbar to place diagrams (drag the handle to reorder). Edit titles
          and labels in each block; those overrides apply only to that placement. For
          site-wide defaults, use{" "}
          <span className="font-medium text-[var(--thusness-ink)]">Hidden pages → Orient graphics</span>.
        </p>
      ) : null}
      {note.slug === RESISTANCE_NOTE_SLUG ? (
        <div className="mb-3 max-w-2xl space-y-2 rounded border border-[var(--thusness-rule)] bg-[var(--thusness-bg)] px-3 py-2.5 text-[11px] leading-relaxed text-[var(--thusness-muted)]">
          {!note.published ? (
            <p className="rounded border border-amber-700/40 bg-amber-950/20 px-2 py-1.5 text-[var(--thusness-ink)]">
              <span className="font-medium text-amber-200/95">Not published on the server yet.</span>{" "}
              The public link returns 404 until{" "}
              <span className="font-medium text-[var(--thusness-ink-soft)]">
                Listed on {NOTE_PAGES_BASE}
              </span>{" "}
              is checked and you click <span className="font-medium">Save note</span>{" "}
              (saved state, not just the checkbox).
            </p>
          ) : null}
          <p>
            <Link
              href={notePageHref(RESISTANCE_NOTE_SLUG)}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-[var(--thusness-ink)] underline decoration-[var(--thusness-rule)] underline-offset-2 hover:decoration-[var(--thusness-ink-soft)]"
            >
              Open public page
            </Link>
            <span className="text-[var(--thusness-muted)]"> — </span>
            <code className="rounded bg-[color-mix(in_srgb,var(--thusness-rule)_35%,transparent)] px-1 py-0.5 text-[10px] text-[var(--thusness-ink-soft)]">
              {NOTE_PAGES_BASE}/working-with-resistance
            </code>
            . Template notes are omitted from the public{" "}
            <span className="italic">{NOTE_PAGES_BASE}</span> list;
            add this note to <span className="italic">/readings</span> in Admin if you want it linked there.
          </p>
          <p>
            If the saved body in the database is empty or invalid, the editor loads
            the packaged <span className="text-[var(--thusness-ink-soft)]">
              Working with resistance
            </span>{" "}
            copy so you can edit it. Choose <span className="font-medium text-[var(--thusness-ink)]">Save note</span>{" "}
            to persist what you see, or restore the on-disk seed into the row (overwrites
            the body).
          </p>
          <button
            type="button"
            disabled={isPending}
            className={adminBtnGhost}
            onClick={() => {
              if (
                !window.confirm(
                  "Replace this note’s body in the database with the packaged resistance guide? Unsaved editor changes will be lost after refresh."
                )
              ) {
                return;
              }
              startTransition(async () => {
                const res = await restoreResistanceNoteFromSeed(note.id);
                if (!res.ok) onMessage(res.message);
                else {
                  onMessage("Resistance body restored from seed.");
                  router.refresh();
                }
              });
            }}
          >
            Restore packaged body to database
          </button>
        </div>
      ) : null}
      <TiptapEditorField
        key={noteBodyEditorKey}
        ref={noteBodyRef}
        label="Body"
        contentSyncKey={note.updated_at}
        initialDoc={editorInitialDoc}
        imageUploadScope={`note/${note.id}`}
        onImageUploadMessage={onMessage}
        onEditorError={onMessage}
        variant="page"
        onTemplateNotice={onMessage}
        orientDiagramControls={note.slug === "orientation"}
        orientDiagramSiteDefaults={
          note.slug === "orientation" ? orientSiteDefaults : undefined
        }
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
