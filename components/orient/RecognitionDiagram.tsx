import type { OrientContent } from "@/lib/orient-infographics/types";

import { DiagramFrame } from "./DiagramFrame";
import { OrientSheet } from "./Sheet";

const W = 1280;
const H = 900;

type Props = { content: OrientContent["recognition"]; dateline?: string };

function Column({
  label,
  title,
  points,
  x,
}: {
  label: string;
  title: string;
  points: string[];
  x: number;
}) {
  return (
    <g transform={`translate(${x}, 0)`}>
      <rect
        x={0}
        y={0}
        width={420}
        height={340}
        fill="none"
        stroke="var(--thusness-rule, #c7c2b0)"
        strokeWidth={1}
      />
      <text
        x={24}
        y={36}
        fill="var(--thusness-muted, #8a8672)"
        fontSize={10}
        letterSpacing={2.4}
        style={{ textTransform: "uppercase" }}
      >
        {label}
      </text>
      <text
        x={24}
        y={68}
        fill="var(--thusness-ink, #1a1915)"
        fontSize={16}
        fontWeight={500}
      >
        {title}
      </text>
      {points.slice(0, 4).map((p, i) => (
        <text
          key={i}
          x={24}
          y={104 + i * 44}
          fill="var(--thusness-ink-soft)"
          fontSize={12}
          style={{ fontStyle: "italic" }}
        >
          {p.length > 52 ? `${p.slice(0, 50)}…` : p}
        </text>
      ))}
    </g>
  );
}

export function RecognitionDiagram({
  content,
  dateline = "Orient · 03 of 07",
}: Props) {
  const { kicker, title, sub, background, felt, trap } = content;
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
          width={980}
          height={380}
          viewBox="0 0 980 380"
          className="mx-auto block"
          aria-hidden
        >
          <Column
            label="Background sense"
            title={background.title}
            points={background.points}
            x={20}
          />
          <Column
            label="Felt peace"
            title={felt.title}
            points={felt.points}
            x={520}
          />
        </svg>
        <p className="mx-auto mt-4 max-w-[720px] whitespace-pre-line text-center text-[12px] italic leading-relaxed text-[var(--thusness-muted)]">
          {trap}
        </p>
      </OrientSheet>
    </DiagramFrame>
  );
}
