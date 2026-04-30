"use client";

import type { OrientContent } from "@/lib/orient-infographics/types";

import { DiagramFrame } from "./DiagramFrame";
import { ORIENT_HELV, orientColors as O } from "./orient-diagram-styles";

const FRAME_W = 1280;

type Props = { content: OrientContent["themes"] };

export function ThemesDiagram({ content }: Props) {
  const { list, footer } = content;
  const names = list.slice(0, 8);
  const positions = [
    { x: 180, y: 110 },
    { x: 360, y: 70 },
    { x: 560, y: 100 },
    { x: 760, y: 60 },
    { x: 240, y: 240 },
    { x: 460, y: 220 },
    { x: 660, y: 260 },
    { x: 840, y: 220 },
  ];
  const themes = names.map((name, i) => ({ name, ...positions[i] }));
  const links = [[0, 1], [1, 2], [2, 3], [4, 5], [5, 6], [6, 7], [0, 4], [1, 5], [2, 6], [3, 7]].filter(
    ([a, b]) => a < themes.length && b < themes.length
  );

  return (
    <DiagramFrame designWidth={FRAME_W} designHeight={400}>
      <div
        className="box-border bg-[var(--thusness-bg)] text-[var(--thusness-ink)] antialiased"
        style={{
          fontFamily: ORIENT_HELV,
          width: FRAME_W,
          padding: "20px 40px 28px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
        }}
      >
        <div style={{ maxWidth: 980, margin: "0 auto" }}>
          <svg viewBox="0 0 980 320" width="100%" height={320} aria-hidden>
            {links.map(([a, b], i) => (
              <line
                key={i}
                x1={themes[a].x}
                y1={themes[a].y}
                x2={themes[b].x}
                y2={themes[b].y}
                stroke={O.rule}
                strokeWidth="1"
                strokeDasharray="2 5"
                opacity="0.7"
              />
            ))}
            {themes.map((th, i) => (
              <g key={i}>
                <circle cx={th.x} cy={th.y} r="3.5" fill={O.ink} />
                <text
                  x={th.x}
                  y={th.y - 14}
                  textAnchor="middle"
                  fontFamily={ORIENT_HELV}
                  fontSize="16"
                  fontStyle="italic"
                  fill={O.ink}
                >
                  {th.name}
                </text>
              </g>
            ))}
          </svg>
        </div>
        <div
          style={{
            textAlign: "center",
            maxWidth: 640,
            margin: "12px auto 0",
            fontSize: 14,
            fontStyle: "italic",
            color: O.muted,
            lineHeight: 1.6,
          }}
        >
          {footer}
        </div>
      </div>
    </DiagramFrame>
  );
}
