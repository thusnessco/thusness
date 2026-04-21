import Link from "@tiptap/extension-link";
import StarterKit from "@tiptap/starter-kit";
import type { Extensions } from "@tiptap/core";

import { ImageWithLink } from "./image-with-link";

export function getTiptapExtensions(): Extensions {
  return [
    StarterKit.configure({
      heading: { levels: [2, 3] },
    }),
    ImageWithLink.configure({
      allowBase64: false,
      HTMLAttributes: {
        class: "tiptap-image",
      },
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
