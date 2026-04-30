"use client";

import type { OrientContent } from "@/lib/orient-infographics/types";

import { DiagramFrame } from "./DiagramFrame";
import { ORIENT_HELV, orientColors as O } from "./orient-diagram-styles";

const FRAME_W = 1280;

type Props = { content: OrientContent["movement"] };

const OBS_LABELS = ["~ observation i", "~ observation ii", "~ observation iii"] as const;

export function MovementDiagram({ content }: Props) {
  const { items, footer } = content;
  const m0 = items[0] ?? { name: "", gloss: "" };
  const m1 = items[1] ?? { name: "", gloss: "" };
  const m2 = items[2] ?? { name: "", gloss: "" };
  const cols = [
    { x: 200, name: m0.name, gloss: m0.gloss },
    { x: 490, name: m1.name, gloss: m1.gloss },
    { x: 780, name: m2.name, gloss: m2.gloss },
  ];

  return (
    <DiagramFrame designWidth={FRAME_W} designHeight={420}>
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
            <text
              x="160"
              y="40"
              textAnchor="middle"
              fontFamily={ORIENT_HELV}
              fontStyle="italic"
              fontSize="13"
              letterSpacing="2.2"
              fill={O.muted}
            >
              ~ ASSUMED · SOLID
            </text>
            <g>
              {[
                [120, 90],
                [160, 80],
                [200, 95],
                [140, 120],
                [180, 118],
                [160, 150],
                [125, 140],
                [195, 140],
              ].map(([x, y], i) => (
                <circle key={`a${i}`} cx={x} cy={y} r="4" fill={O.ink} />
              ))}
              <rect x="100" y="65" width="120" height="105" fill="none" stroke={O.rule} strokeWidth="1" />
            </g>

            <path
              d="M 240 120 Q 400 80, 560 120"
              fill="none"
              stroke={O.muted}
              strokeWidth="1"
              strokeDasharray="3 5"
            />
            <path d="M 560 120 l -8 -3 l 0 6 z" fill={O.muted} />
            <text
              x="400"
              y="68"
              textAnchor="middle"
              fontFamily={ORIENT_HELV}
              fontStyle="italic"
              fontSize="13"
              fill={O.muted}
            >
              ~ assumption doesn&apos;t hold when looked at closely
            </text>

            <text
              x="730"
              y="40"
              textAnchor="middle"
              fontFamily={ORIENT_HELV}
              fontStyle="italic"
              fontSize="13"
              letterSpacing="2.2"
              fill={O.muted}
            >
              ~ DEPENDENT · CONDITIONED
            </text>
            <g>
              {(() => {
                const pts = [
                  [640, 80],
                  [700, 100],
                  [770, 75],
                  [830, 105],
                  [660, 150],
                  [740, 170],
                  [810, 145],
                  [700, 200],
                  [780, 210],
                ];
                const links = [
                  [0, 1],
                  [1, 2],
                  [2, 3],
                  [1, 4],
                  [1, 5],
                  [4, 5],
                  [5, 6],
                  [2, 6],
                  [4, 7],
                  [5, 7],
                  [5, 8],
                  [6, 8],
                  [7, 8],
                  [0, 4],
                  [3, 6],
                ];
                return (
                  <>
                    {links.map(([a, b], i) => (
                      <line
                        key={`l${i}`}
                        x1={pts[a][0]}
                        y1={pts[a][1]}
                        x2={pts[b][0]}
                        y2={pts[b][1]}
                        stroke={O.rule}
                        strokeWidth="1"
                        opacity="0.8"
                      />
                    ))}
                    {pts.map(([x, y], i) => (
                      <circle key={`p${i}`} cx={x} cy={y} r="3.5" fill={O.ink} />
                    ))}
                  </>
                );
              })()}
            </g>

            <line x1="60" y1="250" x2="920" y2="250" stroke={O.rule} strokeWidth="1" />

            {cols.map((p, i) => (
              <g key={i}>
                <text
                  x={p.x}
                  y="278"
                  textAnchor="middle"
                  fontFamily={ORIENT_HELV}
                  fontStyle="italic"
                  fontSize="13"
                  letterSpacing="1.6"
                  fill={O.muted}
                >
                  {OBS_LABELS[i]}
                </text>
                <text
                  x={p.x}
                  y="300"
                  textAnchor="middle"
                  fontFamily={ORIENT_HELV}
                  fontSize="18"
                  fontWeight="500"
                  letterSpacing="-0.2"
                  fill={O.ink}
                >
                  {p.name}
                </text>
                <text
                  x={p.x}
                  y="318"
                  textAnchor="middle"
                  fontFamily={ORIENT_HELV}
                  fontSize="13"
                  fontStyle="italic"
                  fill={O.inkSoft}
                >
                  {p.gloss.length > 52 ? `${p.gloss.slice(0, 50)}…` : p.gloss}
                </text>
              </g>
            ))}
          </svg>
        </div>
        <div
          style={{
            textAlign: "center",
            maxWidth: 640,
            margin: "24px auto 0",
            fontSize: 15,
            fontStyle: "italic",
            color: O.inkSoft,
            lineHeight: 1.6,
          }}
        >
          {footer}
        </div>
      </div>
    </DiagramFrame>
  );
}
