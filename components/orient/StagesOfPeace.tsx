import type { OrientContent } from "@/lib/orient-infographics/types";

import { DiagramFrame } from "./DiagramFrame";
import { OrientSheet } from "./Sheet";

const W = 1280;
const H = 900;

type Props = { content: OrientContent["stages"]; dateline?: string };

export function StagesOfPeace({
  content,
  dateline = "Orient · 02 of 07",
}: Props) {
  const { kicker, title, sub, items } = content;
  const [a, b, c] = items;
  return (
    <DiagramFrame designWidth={W} designHeight={H}>
      <OrientSheet
        boardWidth={W}
        boardHeight={H}
        kicker={kicker}
        title={title}
        sub={sub}
        dateline={dateline}
      >
        <svg
          width={1080}
          height={280}
          viewBox="0 0 1080 280"
          className="mx-auto block"
          aria-hidden
        >
          <line
            x1={80}
            y1={120}
            x2={1000}
            y2={120}
            stroke="var(--thusness-rule, #c7c2b0)"
            strokeWidth={1}
          />
          {[220, 540, 860].map((cx, i) => (
            <g key={i}>
              <circle
                cx={cx}
                cy={120}
                r={44}
                fill="none"
                stroke="var(--thusness-rule, #c7c2b0)"
                strokeWidth={1}
              />
              <circle
                cx={cx}
                cy={120}
                r={i === 1 ? 72 : 52}
                fill="none"
                stroke="var(--thusness-muted, #8a8672)"
                strokeWidth={0.6}
                opacity={0.45}
              />
            </g>
          ))}
          <text
            x={220}
            y={210}
            textAnchor="middle"
            fill="var(--thusness-muted, #8a8672)"
            fontSize={10}
            letterSpacing={3}
            style={{ textTransform: "uppercase" }}
          >
            {a?.scope}
          </text>
          <text
            x={220}
            y={238}
            textAnchor="middle"
            fill="var(--thusness-ink, #1a1915)"
            fontSize={15}
            fontWeight={500}
          >
            {a?.name}
          </text>
          <text
            x={540}
            y={210}
            textAnchor="middle"
            fill="var(--thusness-muted, #8a8672)"
            fontSize={10}
            letterSpacing={3}
            style={{ textTransform: "uppercase" }}
          >
            {b?.scope}
          </text>
          <text
            x={540}
            y={238}
            textAnchor="middle"
            fill="var(--thusness-ink, #1a1915)"
            fontSize={15}
            fontWeight={500}
          >
            {b?.name}
          </text>
          <text
            x={860}
            y={210}
            textAnchor="middle"
            fill="var(--thusness-muted, #8a8672)"
            fontSize={10}
            letterSpacing={3}
            style={{ textTransform: "uppercase" }}
          >
            {c?.scope}
          </text>
          <text
            x={860}
            y={238}
            textAnchor="middle"
            fill="var(--thusness-ink, #1a1915)"
            fontSize={15}
            fontWeight={500}
          >
            {c?.name}
          </text>
        </svg>
        <div className="mx-auto mt-2 grid max-w-[1000px] grid-cols-3 gap-6 px-4 text-center text-[11px] leading-snug text-[var(--thusness-ink-soft)]">
          <p className="italic">{a?.gloss}</p>
          <p className="italic">{b?.gloss}</p>
          <p className="italic">{c?.gloss}</p>
        </div>
      </OrientSheet>
    </DiagramFrame>
  );
}
