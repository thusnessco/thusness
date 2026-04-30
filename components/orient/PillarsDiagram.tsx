"use client";

import type { OrientContent } from "@/lib/orient-infographics/types";

import { DiagramFrame } from "./DiagramFrame";
import { ORIENT_HELV, orientColors as O } from "./orient-diagram-styles";

const FRAME_W = 1280;
const FRAME_H = 900;

type Props = { content: OrientContent["pillars"] };

export function PillarsDiagram({ content }: Props) {
  const { items, footer } = content;
  const pillars = items.slice(0, 3);
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
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 0,
            maxWidth: 960,
            margin: "0 auto",
            position: "relative",
          }}
        >
          {pillars.map((p, i) => (
            <div
              key={i}
              style={{
                padding: "36px 32px 40px",
                borderLeft: i === 0 ? `1px solid ${O.rule}` : "none",
                borderRight: `1px solid ${O.rule}`,
                borderTop: `1px solid ${O.rule}`,
                borderBottom: `1px solid ${O.rule}`,
                display: "flex",
                flexDirection: "column",
                gap: 16,
                minHeight: 320,
              }}
            >
              <div
                style={{
                  fontFamily: ORIENT_HELV,
                  fontStyle: "italic",
                  fontSize: 13,
                  letterSpacing: 1.6,
                  color: O.muted,
                }}
              >
                ~ Pillar 0{i + 1}
              </div>
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 500,
                  color: O.ink,
                  letterSpacing: -0.4,
                  lineHeight: 1.1,
                }}
              >
                {p.name}
              </div>
              <div
                style={{
                  fontSize: 15,
                  fontStyle: "italic",
                  color: O.inkSoft,
                  marginTop: -4,
                  lineHeight: 1.45,
                }}
              >
                {p.sub}
              </div>
              <div style={{ fontSize: 14, color: O.inkSoft, lineHeight: 1.6, marginTop: 4 }}>
                {p.gloss}
              </div>
            </div>
          ))}
        </div>
        <div
          style={{
            textAlign: "center",
            marginTop: 28,
            fontSize: 13,
            fontStyle: "italic",
            color: O.muted,
          }}
        >
          {footer}
        </div>
      </div>
    </DiagramFrame>
  );
}
