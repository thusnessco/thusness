"use client";

import type { OrientContent } from "@/lib/orient-infographics/types";

import { DiagramFrame } from "./DiagramFrame";
import { ORIENT_HELV, orientColors as O } from "./orient-diagram-styles";

const FRAME_W = 1280;
const FRAME_H = 900;

type Props = { content: OrientContent["recognition"] };

function Cell({
  label,
  title,
  points,
  italicTitle,
}: {
  label: string;
  title: string;
  points: string[];
  italicTitle: boolean;
}) {
  return (
    <div
      style={{
        border: `1px solid ${O.rule}`,
        padding: "28px 28px 30px",
        fontFamily: ORIENT_HELV,
      }}
    >
      <div
        style={{
          fontSize: 12,
          letterSpacing: 2.6,
          textTransform: "uppercase",
          color: O.muted,
          marginBottom: 18,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 24,
          fontWeight: 500,
          color: O.ink,
          letterSpacing: -0.3,
          lineHeight: 1.2,
          marginBottom: 18,
          fontStyle: italicTitle ? "italic" : "normal",
        }}
      >
        {title}
      </div>
      <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {points.map((p, i) => (
          <li
            key={i}
            style={{
              display: "flex",
              gap: 14,
              padding: "12px 0",
              borderTop: `1px solid ${O.rule}`,
              fontSize: 15,
              lineHeight: 1.55,
              color: O.inkSoft,
            }}
          >
            <span
              style={{
                color: O.muted,
                fontStyle: "italic",
                fontSize: 13,
                minWidth: 18,
              }}
            >
              ~
            </span>
            <span>{p}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function RecognitionDiagram({ content }: Props) {
  const { background, felt, trap } = content;
  return (
    <DiagramFrame designWidth={FRAME_W} designHeight={FRAME_H}>
      <div
        className="box-border bg-[var(--thusness-bg)] text-[var(--thusness-ink)] antialiased"
        style={{
          fontFamily: ORIENT_HELV,
          width: FRAME_W,
          height: FRAME_H,
          padding: "24px 40px 32px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 20,
            maxWidth: 940,
            margin: "0 auto 24px",
          }}
        >
          <Cell
            label="~ Background sense"
            title={background.title}
            points={background.points}
            italicTitle
          />
          <Cell label="~ Felt peace" title={felt.title} points={felt.points} italicTitle={false} />
        </div>
        <div
          style={{
            textAlign: "center",
            maxWidth: 700,
            margin: "0 auto",
            padding: "24px 0",
            borderTop: `1px solid ${O.rule}`,
            borderBottom: `1px solid ${O.rule}`,
          }}
        >
          <div
            style={{
              fontSize: 11,
              letterSpacing: 2.4,
              textTransform: "uppercase",
              color: O.muted,
              marginBottom: 12,
            }}
          >
            ~ The trap
          </div>
          <div
            style={{
              fontSize: 18,
              fontStyle: "italic",
              color: O.ink,
              lineHeight: 1.5,
              whiteSpace: "pre-line",
            }}
          >
            {trap}
          </div>
        </div>
      </div>
    </DiagramFrame>
  );
}
