import Link from "@tiptap/extension-link";
import StarterKit from "@tiptap/starter-kit";
import type { Extensions } from "@tiptap/core";

export function getTiptapExtensions(): Extensions {
  return [
    StarterKit.configure({
      heading: { levels: [2, 3] },
    }),
    Link.configure({
      openOnClick: false,
      autolink: true,
      linkOnPaste: true,
      HTMLAttributes: {
        class: "tiptap-link",
        rel: "noopener noreferrer",
      },
    }),
  ];
}
