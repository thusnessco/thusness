import type { ReactNode } from "react";

import { ResistanceFormattedText } from "@/components/resistance/format-resistance-markup";
import { ResistanceGlyph } from "@/components/resistance/ResistanceGlyph";
import type { ResistancePageContent, ResistanceTool } from "@/lib/resistance/resistance-page";

function SectionMark({ label }: { label: string }) {
  return (
    <div className="resistance-section-mark">
      <span className="resistance-section-mark-rule" aria-hidden />
      <span>{label}</span>
      <span className="resistance-section-mark-rule" aria-hidden />
    </div>
  );
}

function ToolCard({ tool }: { tool: ResistanceTool }) {
  const wide = tool.wide === true;
  if (wide) {
    return (
      <div className="resistance-tool resistance-tool--wide">
        <div className="resistance-tool-wide-grid">
          <div className="resistance-tool-wide-left">
            <div className="resistance-tool-glyph">
              <ResistanceGlyph kind={tool.glyph} wide />
            </div>
            <span className="resistance-tool-num">{tool.num}</span>
            <span className="resistance-tool-name-wide">{tool.name}</span>
            {tool.when?.trim() ? (
              <div className="resistance-tool-when">
                <span className="resistance-tool-when-label">~ When</span>
                <p className="resistance-tool-when-text">{tool.when}</p>
              </div>
            ) : null}
          </div>
          <div className="resistance-tool-wide-right">
            <div>
              <div className="resistance-tool-block-label">~ Language</div>
              <p className="resistance-tool-script" style={{ whiteSpace: "pre-line" }}>
                <ResistanceFormattedText text={tool.script} />
              </p>
            </div>
            <div>
              <div className="resistance-tool-block-label">~ Why it works</div>
              <p className="resistance-tool-why" style={{ whiteSpace: "pre-line" }}>
                <ResistanceFormattedText text={tool.why} />
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="resistance-tool">
      <div className="resistance-tool-head">
        <div className="resistance-tool-glyph">
          <ResistanceGlyph kind={tool.glyph} />
        </div>
        <div className="resistance-tool-head-text">
          <span className="resistance-tool-num">{tool.num}</span>
          <span className="resistance-tool-name">{tool.name}</span>
          {tool.when?.trim() ? (
            <div className="resistance-tool-when">
              <span className="resistance-tool-when-label">~ When</span>
              <p className="resistance-tool-when-text">{tool.when}</p>
            </div>
          ) : null}
        </div>
      </div>
      <div>
        <div className="resistance-tool-block-label">~ Language</div>
        <p className="resistance-tool-script" style={{ whiteSpace: "pre-line" }}>
          <ResistanceFormattedText text={tool.script} />
        </p>
      </div>
      <div>
        <div className="resistance-tool-block-label">~ Why it works</div>
        <p className="resistance-tool-why" style={{ whiteSpace: "pre-line" }}>
          <ResistanceFormattedText text={tool.why} />
        </p>
      </div>
    </div>
  );
}

export function ResistancePageView({ content }: { content: ResistancePageContent }) {
  const toolBlocks: ReactNode[] = [];
  let pairBuffer: ResistanceTool[] = [];
  const flushPair = () => {
    if (pairBuffer.length === 0) return;
    toolBlocks.push(
      <div key={`row-${toolBlocks.length}`} className="resistance-strategy-grid">
        {pairBuffer.map((t) => (
          <ToolCard key={`${t.num}-${t.name}`} tool={t} />
        ))}
      </div>
    );
    pairBuffer = [];
  };
  for (const t of content.tools) {
    if (t.wide === true) {
      flushPair();
      toolBlocks.push(
        <div key={`wide-${t.num}`} className="resistance-tool-wide-wrap">
          <ToolCard tool={t} />
        </div>
      );
    } else {
      pairBuffer.push(t);
      if (pairBuffer.length >= 2) flushPair();
    }
  }
  flushPair();

  return (
    <article className="resistance-page">
      <header className="resistance-hero">
        <p className="resistance-kicker">{content.kicker}</p>
        <h1 className="resistance-title">{content.title}</h1>
        <p className="resistance-sub">{content.sub}</p>
      </header>

      <SectionMark label={content.premise.label} />
      <div className="resistance-prose">
        {content.premise.paragraphs.map((p, i) => (
          <p key={i} className="resistance-p">
            <ResistanceFormattedText text={p} />
          </p>
        ))}
      </div>
      {content.premise.pull.trim() ? (
        <p className="resistance-pull" style={{ whiteSpace: "pre-line" }}>
          <ResistanceFormattedText text={content.premise.pull} />
        </p>
      ) : null}

      <SectionMark label={content.rules.label} />
      <div className="resistance-rules">
        {content.rules.rows.map((row, i) => (
          <div
            key={i}
            className={
              i === content.rules.rows.length - 1
                ? "resistance-rule-row resistance-rule-row--last"
                : "resistance-rule-row"
            }
          >
            <div className="resistance-rule-label">{row.label}</div>
            <div className="resistance-rule-body">
              <ResistanceFormattedText text={row.body} />
            </div>
          </div>
        ))}
      </div>

      <div className="resistance-tools-spacer" aria-hidden />

      <SectionMark label={content.toolsLabel} />

      <div className="resistance-strategies">{toolBlocks}</div>
    </article>
  );
}
