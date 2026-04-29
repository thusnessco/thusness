"use client";

import type { OrientContent } from "@/lib/orient-infographics/types";

import { DiagramFrame } from "./DiagramFrame";
import { OrientSheet } from "./Sheet";

const W = 1280;
const H = 900;

type Props = { content: OrientContent["pillars"]; dateline?: string };

export function PillarsDiagram({
  content,
  dateline = "Orient · 04 of 07",
}: Props) {
  const { kicker, title, sub, items, footer } = content;
  const cols = [140, 500, 860];
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
          height={320}
          viewBox="0 0 1080 320"
          className="mx-auto block"
          aria-hidden
        >
          {cols.map((cx) => (
            <line
              key={cx}
              x1={cx}
              y1={32}
              x2={cx}
              y2={300}
              stroke="var(--thusness-rule, #c7c2b0)"
              strokeWidth={1}
            />
          ))}
          {items.map((it, i) => {
            const cx = cols[i] ?? 140;
            return (
              <g key={i} transform={`translate(${cx - 120}, 0)`}>
                <text
                  x={120}
                  y={72}
                  textAnchor="middle"
                  fill="var(--thusness-ink, #1a1915)"
                  fontSize={15}
                  fontWeight={500}
                >
                  {it.name.length > 22 ? `${it.name.slice(0, 20)}…` : it.name}
                </text>
                <text
                  x={120}
                  y={100}
                  textAnchor="middle"
                  fill="var(--thusness-muted, #8a8672)"
                  fontSize={11}
                  fontStyle="italic"
                >
                  {it.sub.length > 34 ? `${it.sub.slice(0, 32)}…` : it.sub}
                </text>
                <text
                  x={120}
                  y={140}
                  textAnchor="middle"
                  fill="var(--thusness-ink-soft)"
                  fontSize={11}
                  style={{ fontStyle: "italic" }}
                >
                  {it.gloss.length > 56
                    ? `${it.gloss.slice(0, 54)}…`
                    : it.gloss}
                </text>
              </g>
            );
          })}
        </svg>
        <p className="mx-auto mt-3 max-w-[640px] text-center text-[11px] italic leading-relaxed text-[var(--thusness-muted)]">
          {footer}
        </p>
      </OrientSheet>
    </DiagramFrame>
  );
}
