"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import type { JSONContent } from "@tiptap/core";

import { uploadEditorImage } from "@/app/admin/actions";
import { countTiptapImages } from "@/lib/tiptap/count-tiptap-images";
import { getTiptapExtensions } from "@/lib/tiptap/extensions";
import { jsonContentEqual } from "@/lib/tiptap/json-content-equal";
import { stripPastedHtml } from "@/lib/tiptap/sanitize-pasted-html";
import {
  getThusnessSnippetFragment,
  getWeekPageTemplateDoc,
  THUSNESS_SNIPPET_OPTIONS,
  type ThusnessSnippetKey,
} from "@/lib/tiptap/thusness-blocks";

export type TiptapEditorFieldHandle = {
  getJSON: () => JSONContent | null;
};

function Toolbar({
  editor,
  imageUploadScope,
  onImageUploadMessage,
  variant,
  onTemplateNotice,
}: {
  editor: Editor | null;
  imageUploadScope?: string;
  onImageUploadMessage?: (msg: string) => void;
  variant?: "default" | "page";
  onTemplateNotice?: (msg: string) => void;
}) {
  const linkDefault =
    imageUploadScope?.startsWith("week/") === true
      ? "https://"
      : imageUploadScope?.startsWith("site/") === true ||
          imageUploadScope?.startsWith("note/") === true
        ? "/notes/"
        : "https://";
  const [, tick] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploadingImg, setUploadingImg] = useState(false);

  useEffect(() => {
    if (!editor) return;
    const fn = () => tick((n) => n + 1);
    editor.on("transaction", fn);
    return () => {
      editor.off("transaction", fn);
    };
  }, [editor]);

  async function onImageFile(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.target;
    const file = input.files?.[0];
    input.value = "";
    if (!file || !editor || !imageUploadScope) return;
    setUploadingImg(true);
    const fd = new FormData();
    fd.set("file", file);
    fd.set("scope", imageUploadScope);
    const res = await uploadEditorImage(fd);
    setUploadingImg(false);
    if (!res.ok) {
      onImageUploadMessage?.(res.message);
      return;
    }
    editor.chain().focus().setImage({ src: res.publicUrl }).run();
  }

  if (!editor) return null;

  const btn =
    "rounded-sm px-2.5 py-1 text-xs tracking-wide transition-opacity border border-transparent";
  const active =
    "border-[var(--thusness-rule)] bg-[color-mix(in_srgb,var(--thusness-rule)_25%,transparent)] text-[var(--thusness-ink)]";
  const idle =
    "text-[var(--thusness-muted)] hover:opacity-80 hover:border-[var(--thusness-rule)]";

  return (
    <div
      className="mb-3 flex flex-wrap gap-1 border border-[var(--thusness-rule)] bg-[var(--thusness-bg)] p-2"
      role="toolbar"
      aria-label="Formatting"
    >
      <button
        type="button"
        className={`${btn} ${editor.isActive("bold") ? active : idle}`}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        Bold
      </button>
      <button
        type="button"
        className={`${btn} ${editor.isActive("italic") ? active : idle}`}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        Italic
      </button>
      <span className="mx-1 w-px self-stretch bg-[var(--thusness-rule)]" aria-hidden />
      <button
        type="button"
        className={`${btn} ${editor.isActive("heading", { level: 2 }) ? active : idle}`}
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 2 }).run()
        }
      >
        H2
      </button>
      <button
        type="button"
        className={`${btn} ${editor.isActive("heading", { level: 3 }) ? active : idle}`}
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 3 }).run()
        }
      >
        H3
      </button>
      <span className="mx-1 w-px self-stretch bg-[var(--thusness-rule)]" aria-hidden />
      <button
        type="button"
        className={`${btn} ${editor.isActive("bulletList") ? active : idle}`}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        List
      </button>
      <button
        type="button"
        className={`${btn} ${editor.isActive("orderedList") ? active : idle}`}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        1. List
      </button>
      <span className="mx-1 w-px self-stretch bg-[var(--thusness-rule)]" aria-hidden />
      {imageUploadScope ? (
        <>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="sr-only"
            aria-hidden
            onChange={onImageFile}
          />
          <button
            type="button"
            disabled={uploadingImg}
            className={`${btn} ${idle} disabled:opacity-40`}
            onClick={() => fileRef.current?.click()}
          >
            {uploadingImg ? "…" : "Image"}
          </button>
          <button
            type="button"
            disabled={!editor.isActive("image")}
            className={`${btn} ${idle} disabled:opacity-40`}
            title="Select the image first, then set where it links (e.g. a note)"
            onClick={() => {
              const attrs = editor.getAttributes("image") as {
                href?: string | null;
              };
              const prev = attrs.href ?? "";
              const url = window.prompt(
                "Link when this image is clicked (e.g. /notes/your-slug). Leave empty to remove.",
                prev || "/notes/"
              );
              if (url === null) return;
              const trimmed = url.trim();
              editor
                .chain()
                .focus()
                .updateAttributes("image", { href: trimmed || null })
                .run();
            }}
          >
            Image link
          </button>
          <span className="mx-1 w-px self-stretch bg-[var(--thusness-rule)]" aria-hidden />
        </>
      ) : null}
      <button
        type="button"
        className={`${btn} ${editor.isActive("link") ? active : idle}`}
        onClick={() => {
          const prev = editor.getAttributes("link").href as string | undefined;
          const url = window.prompt(
            "Link URL — use for selected text (e.g. /notes/your-slug or https://…)",
            prev ?? linkDefault
          );
          if (url === null) return;
          if (url === "") {
            editor.chain().focus().extendMarkRange("link").unsetLink().run();
            return;
          }
          editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
        }}
      >
        Link
      </button>
      {variant === "page" ? (
        <>
          <span
            className="mx-1 w-px self-stretch bg-[var(--thusness-rule)]"
            aria-hidden
          />
          <label className="flex items-center gap-1.5 text-[var(--thusness-muted)]">
            <span className="sr-only">Insert layout block</span>
            <select
              className="max-w-[12rem] border border-[var(--thusness-rule)] bg-[var(--thusness-bg)] px-1.5 py-1 text-[11px] text-[var(--thusness-ink-soft)]"
              defaultValue=""
              onChange={(e) => {
                const raw = e.currentTarget.value;
                e.currentTarget.value = "";
                if (!raw) return;
                const key = raw as ThusnessSnippetKey;
                editor
                  .chain()
                  .focus()
                  .insertContent(getThusnessSnippetFragment(key))
                  .run();
                onTemplateNotice?.(
                  "Inserted layout block — edit text in place. Use Link on the Zoom line when ready."
                );
              }}
            >
              <option value="">+ Layout block…</option>
              {THUSNESS_SNIPPET_OPTIONS.map((o) => (
                <option key={o.key} value={o.key}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            className={`${btn} ${idle}`}
            onClick={() => {
              if (
                !window.confirm(
                  "Replace the entire page with the sample week layout (hero, ruled lists, session cards, Zoom row)? You will lose whatever is in the editor now."
                )
              ) {
                return;
              }
              editor.chain().focus().setContent(getWeekPageTemplateDoc()).run();
              onTemplateNotice?.(
                "Loaded sample week layout — matches the design package. Save when done."
              );
            }}
          >
            Sample week page
          </button>
        </>
      ) : null}
    </div>
  );
}

type Props = {
  label: string;
  /** Server snapshot id (e.g. `updated_at`). When this changes, editor body is replaced from `initialDoc`. */
  contentSyncKey: string;
  initialDoc: JSONContent;
  /** Folder prefix in Storage, e.g. `site/home_intro` or `note/<uuid>` */
  imageUploadScope?: string;
  onImageUploadMessage?: (msg: string) => void;
  /** TipTap could not apply JSON (e.g. invalid node); shown in admin. */
  onEditorError?: (msg: string) => void;
  /** Taller editor area for full-page home editing. */
  variant?: "default" | "page";
  /** Shown for week page template / snippet actions (e.g. pass the same handler as image upload toasts). */
  onTemplateNotice?: (msg: string) => void;
};

export const TiptapEditorField = forwardRef<TiptapEditorFieldHandle, Props>(
  function TiptapEditorField(
    {
      label,
      contentSyncKey,
      initialDoc,
      imageUploadScope,
      onImageUploadMessage,
      onEditorError,
      variant = "default",
      onTemplateNotice,
    },
    ref
  ) {
    // Stable reference: a fresh extensions[] every render makes TipTap's useEditor
    // think options changed and call setOptions(), which can merge props back onto
    // the live editor and wipe unsaved edits.
    const extensions = useMemo(() => getTiptapExtensions(), []);

    const editorProps = useMemo(
      () => ({
        transformPastedHTML(html: string) {
          return stripPastedHtml(html);
        },
      }),
      []
    );

    // Do not pass `content` into useEditor: TipTap's React manager compares options
    // on every render; `content` reference or internal drift after edits can trigger
    // setOptions() and reset the document to the last server snapshot (e.g. right
    // when Save runs under startTransition / flash re-renders).
    const onEditorErrorRef = useRef(onEditorError);
    onEditorErrorRef.current = onEditorError;

    const editor = useEditor({
      extensions,
      editorProps,
      immediatelyRender: false,
      emitContentError: true,
      onContentError: ({ error }) => {
        onEditorErrorRef.current?.(error.message);
      },
    });

    const initialDocRef = useRef(initialDoc);
    initialDocRef.current = initialDoc;

    /** Avoid setContent on unrelated re-renders. */
    const initialDocFingerprint = JSON.stringify(initialDoc);
    const lastAppliedRef = useRef<{
      editor: Editor | null;
      syncKey: string | null;
      fingerprint: string | null;
    }>({ editor: null, syncKey: null, fingerprint: null });

    useEffect(() => {
      if (!editor || editor.isDestroyed) return;
      const next = initialDocRef.current;
      const current = editor.getJSON();
      // Re-applying the same document can re-parse JSON and drop valid nodes
      // (e.g. image) in edge cases; skip when the editor already matches props.
      if (jsonContentEqual(current, next)) {
        lastAppliedRef.current = {
          editor,
          syncKey: contentSyncKey,
          fingerprint: initialDocFingerprint,
        };
        return;
      }
      // Stale RSC can send an older body with the same revision; never downgrade
      // away from images that are still in the live editor.
      if (countTiptapImages(next) < countTiptapImages(current)) {
        lastAppliedRef.current = {
          editor,
          syncKey: contentSyncKey,
          fingerprint: initialDocFingerprint,
        };
        return;
      }
      const prev = lastAppliedRef.current;
      if (
        prev.editor === editor &&
        prev.syncKey === contentSyncKey &&
        prev.fingerprint === initialDocFingerprint
      ) {
        return;
      }
      lastAppliedRef.current = {
        editor,
        syncKey: contentSyncKey,
        fingerprint: initialDocFingerprint,
      };
      editor.commands.setContent(next, { emitUpdate: false });
    }, [editor, contentSyncKey, initialDocFingerprint]);

    useImperativeHandle(
      ref,
      () => ({
        getJSON: () => editor?.getJSON() ?? null,
      }),
      [editor]
    );

    return (
      <div className="space-y-2">
        <div className="text-[11px] uppercase tracking-[2.4px] text-[var(--thusness-muted)]">
          {label}
        </div>
        <Toolbar
          editor={editor}
          imageUploadScope={imageUploadScope}
          onImageUploadMessage={onImageUploadMessage}
          variant={variant}
          onTemplateNotice={onTemplateNotice}
        />
        {imageUploadScope ? (
          <p className="text-[10px] leading-relaxed text-[var(--thusness-muted)]">
            Point to a note with either tool:{" "}
            <span className="text-[var(--thusness-ink-soft)]">Image link</span>{" "}
            (select the image first) or{" "}
            <span className="text-[var(--thusness-ink-soft)]">Link</span> (select
            text first). Use paths like{" "}
            <code className="border border-[var(--thusness-rule)] px-1 text-[var(--thusness-muted)]">
              /notes/your-slug
            </code>
            .
          </p>
        ) : null}
        <div
          className={
            variant === "page"
              ? "min-h-[28rem] border border-[var(--thusness-rule)] bg-[var(--thusness-bg)] px-4 py-3 transition-colors focus-within:border-[var(--thusness-ink)] sm:min-h-[32rem]"
              : "min-h-[12rem] border border-[var(--thusness-rule)] bg-[var(--thusness-bg)] px-4 py-3 transition-colors focus-within:border-[var(--thusness-ink)]"
          }
        >
          <EditorContent
            editor={editor}
            className={
              variant === "page"
                ? "tiptap-editor min-h-[24rem] text-base text-[var(--thusness-ink-soft)] outline-none md:min-h-[28rem] md:text-[17px] [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[24rem] md:[&_.ProseMirror]:min-h-[28rem] [&_.ProseMirror_img]:max-h-[min(70vh,36rem)] [&_.ProseMirror_img]:max-w-full [&_.ProseMirror_img]:w-auto [&_.ProseMirror_img]:object-contain [&_.ProseMirror_img]:rounded-none [&_.ProseMirror_a.tiptap-image-link]:max-w-full"
                : "tiptap-editor min-h-[10rem] text-base text-[var(--thusness-ink-soft)] outline-none md:text-[17px] [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[10rem] [&_.ProseMirror_img]:max-h-[min(70vh,36rem)] [&_.ProseMirror_img]:max-w-full [&_.ProseMirror_img]:w-auto [&_.ProseMirror_img]:object-contain [&_.ProseMirror_img]:rounded-none [&_.ProseMirror_a.tiptap-image-link]:max-w-full"
            }
          />
        </div>
      </div>
    );
  }
);

TiptapEditorField.displayName = "TiptapEditorField";
