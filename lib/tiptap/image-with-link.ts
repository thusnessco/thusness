import Image from "@tiptap/extension-image";
import { mergeAttributes } from "@tiptap/core";

export type SetImageWithLinkOptions = {
  src: string;
  alt?: string;
  title?: string;
  width?: number;
  height?: number;
  /** When set, the image is wrapped in `<a href="...">` on the public site */
  href?: string | null;
};

/**
 * Image node with optional `href` for wrapping the image in a link (e.g. to a note).
 */
export const ImageWithLink = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      href: {
        default: null,
      },
    };
  },

  parseHTML() {
    const allowData = this.options.allowBase64;
    const imgTag = allowData ? "img[src]" : 'img[src]:not([src^="data:"])';
    return [
      {
        tag: imgTag,
        getAttrs: (el: HTMLElement) => {
          if (!(el instanceof HTMLImageElement)) return false;
          const parent = el.parentElement;
          const href =
            parent?.tagName === "A" ? parent.getAttribute("href") : null;
          return {
            src: el.getAttribute("src"),
            alt: el.getAttribute("alt"),
            title: el.getAttribute("title"),
            width: el.getAttribute("width"),
            height: el.getAttribute("height"),
            href,
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const href = HTMLAttributes.href as string | null | undefined;
    const { href: _h, ...rest } = HTMLAttributes;
    const img = [
      "img",
      mergeAttributes(this.options.HTMLAttributes, rest),
    ] as [string, Record<string, unknown>, ...unknown[]];
    if (href) {
      return [
        "a",
        {
          href,
          class: "tiptap-image-link",
          rel: "noopener noreferrer",
        },
        img,
      ];
    }
    return img;
  },

  addCommands() {
    const parent = this.parent?.();
    return {
      ...parent,
      setImage:
        (options: SetImageWithLinkOptions) =>
        ({ commands }) => {
          const { href, ...attrs } = options;
          return commands.insertContent({
            type: this.name,
            attrs: { ...attrs, href: href ?? null },
          });
        },
    };
  },
});
