import type { ReactNode } from "react";

/**
 * Renders *italic* and [avoid]…[/avoid] (red italic) from resistance copy strings.
 */
export function ResistanceFormattedText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  return <span className={className}>{parseToNodes(text)}</span>;
}

function parseToNodes(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  let i = 0;
  let key = 0;

  const pushText = (s: string) => {
    if (!s) return;
    out.push(s);
  };

  while (i < text.length) {
    const avoidOpen = text.indexOf("[avoid]", i);
    const star = text.indexOf("*", i);

    let next = -1;
    let kind: "avoid" | "star" | "end" = "end";
    if (avoidOpen >= 0 && (star < 0 || avoidOpen <= star)) {
      next = avoidOpen;
      kind = "avoid";
    } else if (star >= 0) {
      next = star;
      kind = "star";
    }

    if (kind === "end") {
      pushText(text.slice(i));
      break;
    }

    pushText(text.slice(i, next));
    if (kind === "avoid") {
      const close = text.indexOf("[/avoid]", next + 7);
      if (close < 0) {
        pushText(text.slice(next));
        break;
      }
      const inner = text.slice(next + 7, close);
      out.push(
        <span key={`a-${key++}`} className="resistance-avoid">
          {inner}
        </span>
      );
      i = close + 8;
      continue;
    }

    const closeStar = text.indexOf("*", next + 1);
    if (closeStar < 0) {
      pushText(text.slice(next));
      break;
    }
    const inner = text.slice(next + 1, closeStar);
    out.push(
      <em key={`e-${key++}`} className="resistance-em">
        {inner}
      </em>
    );
    i = closeStar + 1;
  }

  return out;
}
