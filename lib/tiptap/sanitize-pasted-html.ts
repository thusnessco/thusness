/**
 * Strip Word/Google/etc. cruft before TipTap parses pasted HTML.
 * Browser-only (DOMParser); safe no-op string on SSR.
 */
export function stripPastedHtml(html: string): string {
  if (typeof DOMParser === "undefined") return html;
  const strippedComments = html.replace(/<!--[\s\S]*?-->/g, "");
  let doc: Document;
  try {
    doc = new DOMParser().parseFromString(strippedComments, "text/html");
  } catch {
    return html;
  }

  doc
    .querySelectorAll("script, style, meta, link, title, xml")
    .forEach((el) => el.remove());

  doc.querySelectorAll("*").forEach((el) => {
    const tag = el.tagName;
    for (const attr of [...el.attributes]) {
      const name = attr.name.toLowerCase();
      if (name.startsWith("on")) {
        el.removeAttribute(attr.name);
        continue;
      }
      if (tag === "A" && name === "href") continue;
      if (tag === "A" && (name === "target" || name === "rel")) continue;
      if (tag === "IMG" && (name === "src" || name === "alt")) continue;
      el.removeAttribute(attr.name);
    }
  });

  let guard = 0;
  while (guard++ < 8000) {
    const span = doc.querySelector("span");
    if (!span || span.attributes.length > 0) break;
    const parent = span.parentNode;
    if (!parent) break;
    while (span.firstChild) parent.insertBefore(span.firstChild, span);
    span.remove();
  }

  return doc.body.innerHTML;
}
