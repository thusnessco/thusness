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

export function OrientArticle({ html }: { html: string }) {
  const articleRef = useRef<HTMLDivElement | null>(null);
  const [headings, setHeadings] = useState<HeadingLink[]>([]);

  useEffect(() => {
    const root = articleRef.current;
    if (!root) return;

    const used = new Map<string, number>();
    const found: HeadingLink[] = [];
    const nodes = root.querySelectorAll("h2, h3");
    nodes.forEach((node) => {
      const level = node.tagName === "H2" ? 2 : 3;
      const text = node.textContent?.trim() ?? "";
      if (!text) return;
      const base = slugifyHeading(text) || `section-${found.length + 1}`;
      const n = (used.get(base) ?? 0) + 1;
      used.set(base, n);
      const id = n === 1 ? base : `${base}-${n}`;
      node.id = id;
      found.push({ id, text, level });
    });
    setHeadings(found);
  }, [html]);

  return (
    <div className="mx-auto grid w-full max-w-[1080px] gap-8 px-6 pb-20 pt-10 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-10 lg:px-10">
      <aside className="hidden lg:block">
        {headings.length ? (
          <nav
            aria-label="On this page"
            className="sticky top-8 border-l border-[var(--thusness-rule)] pl-4 text-[11px] uppercase tracking-[2px] text-[var(--thusness-muted)]"
          >
            <p className="mb-3">On this page</p>
            <ol className="space-y-2">
              {headings.map((h) => (
                <li key={h.id}>
                  <a
                    href={`#${h.id}`}
                    className={`block transition-opacity hover:opacity-70 ${
                      h.level === 3 ? "pl-3 normal-case tracking-[0.2px] text-[10px]" : ""
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
        }
        .orient-article h2 {
          margin-top: 2.7rem;
          font-size: 1.25rem;
          line-height: 1.25;
          letter-spacing: 0.01em;
          color: var(--thusness-ink, #1a1915);
        }
        .orient-article h3 {
          margin-top: 2rem;
          font-size: 1rem;
          line-height: 1.35;
          color: var(--thusness-ink, #1a1915);
        }
      `}</style>
    </div>
  );
}
