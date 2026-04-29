"use client";

import type { OrientContent } from "@/lib/orient-infographics/types";

import { DiagramFrame } from "./DiagramFrame";
import { OrientSheet } from "./Sheet";

const W = 1280;
const H = 1280;

type Props = { content: OrientContent; dateline?: string };

export function GiantMaster({
  content,
  dateline = "Orient · 01 of 07",
}: Props) {
  const { giant, stages, movement, pillars, themes } = content;
  const themeDots = themes.list.slice(0, 8);
  return (
    <DiagramFrame designWidth={W} designHeight={H}>
      <OrientSheet
        boardWidth={W}
        boardHeight={H}
        kicker={giant.kicker}
        title={giant.title}
        sub={giant.sub}
        dateline={dateline}
        sheetFooter={giant.footer}
      >
        <div className="mx-auto flex w-full max-w-[1080px] flex-col gap-5">
          <svg
            width={1080}
            height={520}
            viewBox="0 0 1080 520"
            className="mx-auto block"
            aria-hidden
          >
            <line
              x1={100}
              y1={280}
              x2={980}
              y2={280}
              stroke="var(--thusness-rule, #c7c2b0)"
              strokeWidth={1}
            />
            {[240, 540, 840].map((cx, i) => (
              <circle
                key={i}
                cx={cx}
                cy={280}
                r={36}
                fill="none"
                stroke="var(--thusness-rule, #c7c2b0)"
                strokeWidth={1}
              />
            ))}
            {stages.items.map((s, i) => {
              const cx = [240, 540, 840][i] ?? 240;
              return (
                <text
                  key={i}
                  x={cx}
                  y={340}
                  textAnchor="middle"
                  fill="var(--thusness-ink, #1a1915)"
                  fontSize={12}
                  fontWeight={500}
                >
                  {s.name}
                </text>
              );
            })}
            <path
              d="M 140 420 Q 520 200 940 420"
              fill="none"
              stroke="var(--thusness-muted, #8a8672)"
              strokeWidth={0.9}
              opacity={0.65}
            />
            {movement.items.map((m, i) => {
              const x = [200, 520, 840][i] ?? 200;
              return (
                <text
                  key={`mv-${i}`}
                  x={x}
                  y={460}
                  textAnchor="middle"
                  fill="var(--thusness-ink-soft)"
                  fontSize={11}
                  fontStyle="italic"
                >
                  {m.name}
                </text>
              );
            })}
            <text
              x={540}
              y={120}
              textAnchor="middle"
              fill="var(--thusness-muted, #8a8672)"
              fontSize={10}
              letterSpacing={2}
              style={{ textTransform: "uppercase" }}
            >
              {giant.transition}
            </text>
            {themeDots.map((t, i) => {
              const angle = (i / themeDots.length) * Math.PI * 2 - Math.PI / 2;
              const cx = 540 + Math.cos(angle) * 200;
              const cy = 160 + Math.sin(angle) * 70;
              return (
                <g key={t}>
                  <circle
                    cx={cx}
                    cy={cy}
                    r={4}
                    fill="var(--thusness-muted, #8a8672)"
                    opacity={0.85}
                  />
                  <text
                    x={cx}
                    y={cy - 12}
                    textAnchor="middle"
                    fill="var(--thusness-ink, #1a1915)"
                    fontSize={9}
                  >
                    {t.length > 12 ? `${t.slice(0, 10)}…` : t}
                  </text>
                </g>
              );
            })}
            <text
              x={540}
              y={500}
              textAnchor="middle"
              fill="var(--thusness-ink-soft)"
              fontSize={10}
              fontStyle="italic"
            >
              {pillars.items.map((p) => p.name).join(" · ")}
            </text>
          </svg>
          <p className="text-center text-[11px] italic leading-relaxed text-[var(--thusness-muted)]">
            {giant.tagline}
          </p>
        </div>
      </OrientSheet>
    </DiagramFrame>
  );
}
