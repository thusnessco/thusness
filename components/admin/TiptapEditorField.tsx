"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import type { JSONContent } from "@tiptap/core";

import { tiptapContentLayoutClassName } from "@/lib/tiptap/content-layout-classes";
import { getTiptapExtensions } from "@/lib/tiptap/extensions";

export type TiptapEditorFieldHandle = {
  getJSON: () => JSONContent | null;
};

function Toolbar({ editor }: { editor: Editor | null }) {
  const [, tick] = useState(0);
  useEffect(() => {
    if (!editor) return;
    const fn = () => tick((n) => n + 1);
    editor.on("transaction", fn);
    return () => {
      editor.off("transaction", fn);
    };
  }, [editor]);

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
      <button
        type="button"
        className={`${btn} ${editor.isActive("link") ? active : idle}`}
        onClick={() => {
          const prev = editor.getAttributes("link").href as string | undefined;
          const url = window.prompt("Link URL", prev ?? "https://");
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
  initialDoc: JSONContent;
};

export const TiptapEditorField = forwardRef<TiptapEditorFieldHandle, Props>(
  function TiptapEditorField({ label, initialDoc }, ref) {
    const editor = useEditor({
      extensions: getTiptapExtensions(),
      content: initialDoc,
      immediatelyRender: false,
    });

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
        <Toolbar editor={editor} />
        <div className="rounded-md border border-white/10 bg-black px-4 py-3 min-h-[12rem] focus-within:border-white/20 transition-colors">
          <EditorContent
            editor={editor}
            className={`tiptap-editor prose-invert min-h-[10rem] text-sm text-gray-200 outline-none [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[10rem] ${tiptapContentLayoutClassName}`}
          />
        </div>
      </div>
    );
  }
);

TiptapEditorField.displayName = "TiptapEditorField";
