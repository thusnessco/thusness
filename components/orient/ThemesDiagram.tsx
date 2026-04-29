import type { OrientContent } from "@/lib/orient-infographics/types";

import { DiagramFrame } from "./DiagramFrame";
import { OrientSheet } from "./Sheet";

const W = 1280;
const H = 900;

/** Even spread on a soft ellipse; max 8 labels. */
const POSITIONS: { x: number; y: number }[] = [
  { x: 520, y: 70 },
  { x: 720, y: 110 },
  { x: 820, y: 220 },
  { x: 700, y: 300 },
  { x: 520, y: 320 },
  { x: 320, y: 300 },
  { x: 220, y: 220 },
  { x: 320, y: 110 },
];

type Props = { content: OrientContent["themes"]; dateline?: string };

export function ThemesDiagram({
  content,
  dateline = "Orient · 06 of 07",
}: Props) {
  const { kicker, title, sub, list, footer } = content;
  const labels = list.slice(0, 8);
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
          width={960}
          height={360}
          viewBox="0 0 960 360"
          className="mx-auto block"
          aria-hidden
        >
          <ellipse
            cx={520}
            cy={195}
            rx={280}
            ry={120}
            fill="none"
            stroke="var(--thusness-rule, #c7c2b0)"
            strokeWidth={1}
            opacity={0.7}
          />
          {labels.map((label, i) => {
            const p = POSITIONS[i] ?? POSITIONS[0];
            return (
              <g key={`${label}-${i}`} transform={`translate(${p.x}, ${p.y})`}>
                <circle
                  r={5}
                  fill="var(--thusness-muted, #8a8672)"
                  opacity={0.9}
                />
                <text
                  x={0}
                  y={-14}
                  textAnchor="middle"
                  fill="var(--thusness-ink, #1a1915)"
                  fontSize={13}
                  fontWeight={500}
                >
                  {label}
                </text>
              </g>
            );
          })}
        </svg>
        <p className="mx-auto mt-4 max-w-[560px] text-center text-[11px] italic text-[var(--thusness-muted)]">
          {footer}
        </p>
      </OrientSheet>
    </DiagramFrame>
  );
}
