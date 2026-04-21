/**
 * Vertical rhythm + heading scale for rendered TipTap HTML.
 * Keep admin `EditorContent` and public `TiptapHtml` in sync.
 */
export const tiptapContentLayoutClassName = [
  "leading-relaxed",
  "[&_p]:my-2",
  "[&_h2]:mt-4 [&_h2]:mb-2 [&_h2]:text-base [&_h2]:font-medium [&_h2]:text-white [&_h2]:tracking-[0.06em]",
  "[&_h3]:mt-3 [&_h3]:mb-1 [&_h3]:text-sm [&_h3]:font-medium [&_h3]:text-white",
  "[&_ul]:my-2 [&_ol]:my-2 [&_li]:my-0.5",
  "[&>h2:first-child]:mt-0 [&>h3:first-child]:mt-0",
  /* Admin: headings live inside .ProseMirror, not as direct children of the editor root */
  "[&_.ProseMirror>h2:first-child]:mt-0 [&_.ProseMirror>h3:first-child]:mt-0",
].join(" ");
