import type { GenerosityEssayContent } from "@/lib/readings/generosity-essay";

export function GenerosityReadingView({ content }: { content: GenerosityEssayContent }) {
  return (
    <article className="mt-8 max-w-[620px]">
      <h1 className="text-[22px] font-medium tracking-tight text-[var(--thusness-ink)]">
        {content.title}
      </h1>
      <div className="mt-8 whitespace-pre-line text-[17px] leading-[1.7] text-[var(--thusness-ink-soft)]">
        {content.body}
      </div>
    </article>
  );
}
