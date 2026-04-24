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

export type TiptapEditorFieldHandle = {
  getJSON: () => JSONContent | null;
};

function Toolbar({
  editor,
  imageUploadScope,
  onImageUploadMessage,
}: {
  editor: Editor | null;
  imageUploadScope?: string;
  onImageUploadMessage?: (msg: string) => void;
}) {
  const linkDefault =
    imageUploadScope?.startsWith("site/") === true ||
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
    "rounded px-2.5 py-1 text-xs tracking-wide transition-colors border border-transparent";
  const active = "bg-white/10 text-white border-white/15";
  const idle = "text-gray-400 hover:text-gray-200 hover:border-white/10";

  return (
    <div
      className="mb-3 flex flex-wrap gap-1 rounded-md border border-white/10 bg-zinc-950/80 p-2"
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
      <span className="mx-1 w-px self-stretch bg-white/10" aria-hidden />
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
      <span className="mx-1 w-px self-stretch bg-white/10" aria-hidden />
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
      <span className="mx-1 w-px self-stretch bg-white/10" aria-hidden />
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
          <span className="mx-1 w-px self-stretch bg-white/10" aria-hidden />
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
        <div className="text-xs tracking-[0.2em] uppercase text-gray-500">
          {label}
        </div>
        <Toolbar
          editor={editor}
          imageUploadScope={imageUploadScope}
          onImageUploadMessage={onImageUploadMessage}
        />
        {imageUploadScope ? (
          <p className="text-[10px] leading-relaxed text-gray-600">
            Point to a note with either tool:{" "}
            <span className="text-gray-400">Image link</span> (select the image
            first) or <span className="text-gray-400">Link</span> (select text
            first). Use paths like{" "}
            <code className="rounded bg-white/5 px-1 text-gray-400">
              /notes/your-slug
            </code>
            .
          </p>
        ) : null}
        <div className="rounded-md border border-white/10 bg-black px-4 py-3 min-h-[12rem] focus-within:border-white/20 transition-colors">
          <EditorContent
            editor={editor}
            className="tiptap-editor prose-invert min-h-[10rem] text-base md:text-lg text-gray-200 outline-none [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[10rem] [&_.ProseMirror_img]:max-h-[min(70vh,36rem)] [&_.ProseMirror_img]:max-w-full [&_.ProseMirror_img]:w-auto [&_.ProseMirror_img]:object-contain [&_.ProseMirror_img]:rounded-md [&_.ProseMirror_a.tiptap-image-link]:max-w-full"
          />
        </div>
      </div>
    );
  }
);

TiptapEditorField.displayName = "TiptapEditorField";
