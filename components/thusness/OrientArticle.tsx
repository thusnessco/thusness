"use client";

import { useEffect, useRef, useState } from "react";

import { TiptapHtml } from "@/components/TiptapHtml";

type HeadingLink = {
  id: string;
  text: string;
  level: 2 | 3;
};

function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/** TipTap line breaks inside headings are `<br>`; `textContent` omits them and smashes words together. */
function headingLabelFromElement(el: Element): string {
  const parts: string[] = [];
  const walk = (n: Node) => {
    if (n.nodeType === Node.TEXT_NODE) {
      parts.push(n.textContent ?? "");
      return;
    }
    if (n.nodeType !== Node.ELEMENT_NODE) return;
    const tag = (n as Element).tagName;
    if (tag === "BR") {
      parts.push(" ");
      return;
    }
    n.childNodes.forEach(walk);
  };
  el.childNodes.forEach(walk);
  return parts.join("").replace(/\s+/g, " ").trim();
}

export function OrientArticle({ html }: { html: string }) {
  const articleRef = useRef<HTMLDivElement | null>(null);
  const [headings, setHeadings] = useState<HeadingLink[]>([]);

  useEffect(() => {
    const root = articleRef.current;
    if (!root) return;

    const used = new Map<string, number>();
    const found: HeadingLink[] = [];
    const pushHeading = (node: Element, level: 2 | 3) => {
      const text = headingLabelFromElement(node);
      if (!text) return;
      const base = slugifyHeading(text) || `section-${found.length + 1}`;
      const n = (used.get(base) ?? 0) + 1;
      used.set(base, n);
      const id = n === 1 ? base : `${base}-${n}`;
      (node as HTMLElement).id = id;
      found.push({ id, text, level });
    };

    // Reset any previous auto heading classes/ids before recalculating.
    root
      .querySelectorAll(".orient-auto-heading")
      .forEach((n) => n.classList.remove("orient-auto-heading"));

    const headingNodes = root.querySelectorAll("h1, h2, h3");
    headingNodes.forEach((node) => {
      const tag = node.tagName;
      const level = tag === "H3" ? 3 : 2;
      pushHeading(node, level);
    });

    // Fallback: if content uses plain paragraphs as section labels, auto-promote.
    if (found.length === 0) {
      const paras = Array.from(root.querySelectorAll("p"));
      for (const p of paras) {
        const text = headingLabelFromElement(p);
        if (!text) continue;
        // Short standalone title-ish line, not a sentence ending in punctuation.
        if (text.length > 90) continue;
        if (/[.!?]$/.test(text)) continue;
        if (text.split(/\s+/).length > 12) continue;
        p.classList.add("orient-auto-heading");
        pushHeading(p, 2);
      }
    }

    setHeadings(found);
  }, [html]);

  return (
    <div className="mx-auto grid w-full max-w-[1080px] gap-8 px-6 pb-20 pt-10 lg:grid-cols-[minmax(0,240px)_minmax(0,1fr)] lg:gap-10 lg:px-10">
      <aside className="min-w-0">
        {headings.length ? (
          <nav
            aria-label="On this page"
            className="orient-toc border-l border-[var(--thusness-rule)] pl-4 text-[11px] uppercase tracking-[1px] text-[var(--thusness-muted)] lg:sticky lg:top-8"
            style={{
              fontFamily: 'Helvetica, "Helvetica Neue", Arial, sans-serif',
            }}
          >
            <p className="mb-3.5 leading-snug tracking-[1.5px]">On this page</p>
            <ol className="m-0 flex list-none flex-col gap-3 p-0">
              {headings.map((h) => (
                <li key={h.id} className="min-w-0">
                  <a
                    href={`#${h.id}`}
                    className={`block break-words leading-[1.45] transition-opacity hover:opacity-70 ${
                      h.level === 3 ? "pl-2.5 normal-case tracking-normal text-[10px] leading-[1.5]" : ""
                    }`}
                  >
                    {h.text}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        ) : null}
      </aside>

      <div ref={articleRef}>
        <TiptapHtml
          html={html}
          className="orient-article tiptap-html mx-auto max-w-[620px] text-[17px] leading-[1.7] text-[var(--thusness-ink-soft)]"
        />
      </div>
      <style jsx global>{`
        html {
          scroll-behavior: smooth;
        }
        .orient-article h2,
        .orient-article h3 {
          scroll-margin-top: 84px;
          font-family: Helvetica, "Helvetica Neue", Arial, sans-serif;
          color: var(--thusness-ink, #1a1915);
        }
        .orient-article h2 {
          margin-top: 3rem;
          padding-top: 0.2rem;
          font-size: 0.86rem;
          line-height: 1.25;
          letter-spacing: 1.9px;
          text-transform: uppercase;
          font-weight: 600;
          color: var(--thusness-muted, #8a8672);
        }
        .orient-article h3 {
          margin-top: 1.8rem;
          padding-left: 0.55rem;
          border-left: 1px solid rgba(138, 134, 114, 0.5);
          font-size: 0.96rem;
          line-height: 1.35;
          letter-spacing: 0.01em;
          font-weight: 500;
        }
        .orient-article .orient-auto-heading {
          margin-top: 3rem;
          margin-bottom: 0.9rem;
          padding-top: 0.2rem;
          font-family: Helvetica, "Helvetica Neue", Arial, sans-serif;
          font-size: 0.86rem;
          line-height: 1.25;
          letter-spacing: 1.9px;
          text-transform: uppercase;
          font-weight: 600;
          color: var(--thusness-muted, #8a8672);
          scroll-margin-top: 84px;
        }
      `}</style>
    </div>
  );
}
