"use client";

import type { OrientContent } from "@/lib/orient-infographics/types";

import { DiagramFrame } from "./DiagramFrame";
import { OrientSheet } from "./Sheet";

const W = 1280;
const H = 900;

type Props = { content: OrientContent["movement"]; dateline?: string };

export function MovementDiagram({
  content,
  dateline = "Orient · 05 of 07",
}: Props) {
  const { kicker, title, sub, items, footer } = content;
  const pts = [
    { x: 160, y: 200 },
    { x: 520, y: 120 },
    { x: 880, y: 200 },
  ];
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
          width={1040}
          height={260}
          viewBox="0 0 1040 260"
          className="mx-auto block"
          aria-hidden
        >
          <path
            d="M 120 200 Q 380 40 520 120 T 920 200"
            fill="none"
            stroke="var(--thusness-rule, #c7c2b0)"
            strokeWidth={1.2}
          />
          {items.map((it, i) => {
            const p = pts[i] ?? pts[0];
            return (
              <g key={i} transform={`translate(${p.x}, ${p.y})`}>
                <circle
                  r={8}
                  fill="var(--thusness-ink, #1a1915)"
                  opacity={0.85}
                />
                <text
                  x={0}
                  y={-18}
                  textAnchor="middle"
                  fill="var(--thusness-ink, #1a1915)"
                  fontSize={14}
                  fontWeight={500}
                >
                  {it.name}
                </text>
                <text
                  x={0}
                  y={36}
                  textAnchor="middle"
                  fill="var(--thusness-ink-soft)"
                  fontSize={11}
                  fontStyle="italic"
                >
                  {it.gloss.length > 40 ? `${it.gloss.slice(0, 38)}…` : it.gloss}
                </text>
              </g>
            );
          })}
        </svg>
        <p className="mx-auto mt-6 max-w-[720px] text-center text-[11px] italic leading-relaxed text-[var(--thusness-muted)]">
          {footer}
        </p>
      </OrientSheet>
    </DiagramFrame>
  );
}
