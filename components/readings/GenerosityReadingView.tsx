import type { GenerosityEssayBlock, GenerosityEssayContent } from "@/lib/readings/generosity-essay";

function SectionMark({ label }: { label: string }) {
  return (
    <div className="resistance-section-mark">
      <span className="resistance-section-mark-rule" aria-hidden />
      <span>{label}</span>
      <span className="resistance-section-mark-rule" aria-hidden />
    </div>
  );
}

function EssayBlock({ block }: { block: GenerosityEssayBlock }) {
  switch (block.type) {
    case "section":
      return <SectionMark label={block.label} />;
    case "h2":
      return <h2 className="reading-essay-h2">{block.text}</h2>;
    case "pull":
      return (
        <p className="resistance-pull" style={{ whiteSpace: "pre-line" }}>
          {block.text}
        </p>
      );
    case "dialogue":
      return (
        <div className="reading-dialogue">
          {block.lines.map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
      );
    case "p":
      return (
        <p className="resistance-p" style={{ whiteSpace: "pre-line" }}>
          {block.text}
        </p>
      );
    default:
      return null;
  }
}

export function GenerosityReadingView({ content }: { content: GenerosityEssayContent }) {
  return (
    <article className="resistance-page reading-essay">
      <header className="resistance-hero">
        <p className="resistance-kicker">{content.kicker}</p>
        <h1 className="resistance-title">{content.title}</h1>
        {content.sub.trim() ? <p className="resistance-sub">{content.sub}</p> : null}
      </header>

      <div className="resistance-prose reading-essay-body">
        {content.blocks.map((block, i) => (
          <EssayBlock key={`${block.type}-${i}`} block={block} />
        ))}
      </div>
    </article>
  );
}
