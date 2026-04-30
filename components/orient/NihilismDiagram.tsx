"use client";

import type { OrientContent } from "@/lib/orient-infographics/types";

import RedDot from "@/components/thusness/RedDot";

import { DiagramFrame } from "./DiagramFrame";
import { ORIENT_HELV, orientColors as O } from "./orient-diagram-styles";

const FRAME_W = 1280;
const FRAME_H = 900;

type Props = { content: OrientContent["nihilism"] };

export function NihilismDiagram({ content }: Props) {
  const { trap, view, footer } = content;
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
            maxWidth: 880,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 0,
          }}
        >
          <div
            style={{
              border: `1px solid ${O.rule}`,
              padding: "32px 30px",
              borderRight: "none",
              display: "flex",
              flexDirection: "column",
              gap: 14,
              minHeight: 320,
            }}
          >
            <div
              style={{
                fontSize: 12,
                letterSpacing: 2.6,
                textTransform: "uppercase",
                color: O.red,
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <RedDot size={9} />~ The trap
            </div>
            <div
              style={{
                fontSize: 24,
                fontWeight: 500,
                color: O.ink,
                letterSpacing: -0.3,
                lineHeight: 1.2,
              }}
            >
              {trap.name}
            </div>
            <div style={{ fontSize: 15, color: O.inkSoft, lineHeight: 1.6, fontStyle: "italic" }}>
              &ldquo;{trap.quote}&rdquo;
            </div>
            <div style={{ flex: 1 }} />
            <div
              style={{
                fontSize: 14,
                color: O.inkSoft,
                lineHeight: 1.55,
                borderTop: `1px solid ${O.rule}`,
                paddingTop: 12,
              }}
            >
              {trap.body}
            </div>
          </div>
          <div
            style={{
              border: `1px solid ${O.rule}`,
              padding: "32px 30px",
              display: "flex",
              flexDirection: "column",
              gap: 14,
              minHeight: 320,
            }}
          >
            <div
              style={{
                fontSize: 12,
                letterSpacing: 2.6,
                textTransform: "uppercase",
                color: O.muted,
              }}
            >
              ~ The dependent view
            </div>
            <div
              style={{
                fontSize: 24,
                fontWeight: 500,
                color: O.ink,
                letterSpacing: -0.3,
                lineHeight: 1.2,
              }}
            >
              {view.name}
            </div>
            <div style={{ fontSize: 15, color: O.inkSoft, lineHeight: 1.6, fontStyle: "italic" }}>
              {view.quote}
            </div>
            <div style={{ flex: 1 }} />
            <div
              style={{
                fontSize: 14,
                color: O.inkSoft,
                lineHeight: 1.55,
                borderTop: `1px solid ${O.rule}`,
                paddingTop: 12,
              }}
            >
              {view.body}
            </div>
          </div>
        </div>
        <div
          style={{
            textAlign: "center",
            maxWidth: 620,
            margin: "36px auto 0",
            fontSize: 16,
            fontStyle: "italic",
            color: O.ink,
            lineHeight: 1.55,
            padding: "22px 0",
            borderTop: `1px solid ${O.rule}`,
            borderBottom: `1px solid ${O.rule}`,
            whiteSpace: "pre-line",
          }}
        >
          {footer}
        </div>
      </div>
    </DiagramFrame>
  );
}
