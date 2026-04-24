import type { Components } from "react-markdown";

import ReactMarkdown from "react-markdown";

const ink = "var(--thusness-ink, #1a1915)";
const inkSoft = "var(--thusness-ink-soft, #3d3a2f)";

const proseComponents: Components = {
  p: ({ children }) => (
    <p style={{ margin: "0 0 1.3em 0", color: inkSoft, fontSize: 17, lineHeight: 1.7 }}>
      {children}
    </p>
  ),
  em: ({ children }) => (
    <em style={{ fontStyle: "italic", color: ink }}>{children}</em>
  ),
  strong: ({ children }) => (
    <strong style={{ fontWeight: 500, fontStyle: "italic", color: ink }}>
      {children}
    </strong>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      style={{
        color: ink,
        textDecoration: "none",
        borderBottom: `1px solid ${ink}`,
        paddingBottom: 2,
      }}
    >
      {children}
    </a>
  ),
  ul: ({ children }) => (
    <ul style={{ margin: "0 0 1.3em 0", paddingLeft: "1.25rem", color: inkSoft }}>
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol style={{ margin: "0 0 1.3em 0", paddingLeft: "1.25rem", color: inkSoft }}>
      {children}
    </ol>
  ),
  li: ({ children }) => <li style={{ marginTop: "0.35rem" }}>{children}</li>,
};

export function WeekProse({ markdown }: { markdown: string }) {
  if (!markdown.trim()) return null;
  return <ReactMarkdown components={proseComponents}>{markdown}</ReactMarkdown>;
}
