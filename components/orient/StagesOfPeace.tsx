"use client";

import { useId } from "react";

import type { OrientContent } from "@/lib/orient-infographics/types";

import { DiagramFrame } from "./DiagramFrame";
import { ORIENT_HELV, orientColors as O } from "./orient-diagram-styles";

const W = 1000;
const H = 220;
const FRAME_W = 1280;

type Props = { content: OrientContent["stages"] };

export function StagesOfPeace({ content }: Props) {
  const mid = useId().replace(/:/g, "");
  const markerId = `arr-sp-${mid}`;
  const stages = content.items.slice(0, 3).map((it, i) => ({
    num: String(i + 1).padStart(2, "0"),
    scope: it.scope,
    name: it.name,
    gloss: it.gloss,
  }));

  const discR = 56;
  const cxs = [W * 0.18, W * 0.5, W * 0.82];
  const cy = H * 0.46;

  const sunflowerDots = (
    count: number,
    R: number,
    opts: {
      startIndex?: number;
      baseR?: number;
      jitterR?: number;
      baseOp?: number;
      opVar?: number;
      seedSalt?: number;
    } = {}
  ) => {
    const {
      startIndex = 1,
      baseR = 0.9,
      jitterR = 0.7,
      baseOp = 0.55,
      opVar = 0.35,
      seedSalt = 0,
    } = opts;
    const phi = Math.PI * (3 - Math.sqrt(5));
    const seed = (n: number) => {
      const x = Math.sin((n + seedSalt) * 12.9898) * 43758.5453;
      return x - Math.floor(x);
    };
    const dots: { x: number; y: number; r: number; o: number }[] = [];
    for (let i = 0; i < count; i++) {
      const idx = i + startIndex;
      const r = R * Math.sqrt(idx / (count + startIndex)) * 0.96;
      const theta = idx * phi;
      const x = Math.cos(theta) * r;
      const y = Math.sin(theta) * r;
      dots.push({
        x,
        y,
        r: baseR + seed(idx) * jitterR,
        o: baseOp + seed(idx + 9999) * opVar,
      });
    }
    return dots;
  };

  const stage1 = (cx: number) => (
    <g>
      <circle cx={cx} cy={cy} r="3.6" fill={O.ink} />
    </g>
  );

  const stage2 = (cx: number) => (
    <g>
      <circle
        cx={cx}
        cy={cy}
        r={discR + 6}
        fill="none"
        stroke={O.muted}
        strokeWidth="1"
        opacity="0.4"
      />
      <circle cx={cx} cy={cy} r={discR * 0.55} fill={O.ink} opacity="0.12" />
      <circle
        cx={cx}
        cy={cy}
        r={discR * 0.55}
        fill="none"
        stroke={O.muted}
        strokeWidth="1"
        opacity="0.45"
      />
    </g>
  );

  const stage3 = (cx: number) => {
    const dots = sunflowerDots(260, discR, {
      baseR: 0.75,
      jitterR: 0.55,
      baseOp: 0.5,
      opVar: 0.4,
      seedSalt: 1,
    });
    return (
      <g>
        <circle
          cx={cx}
          cy={cy}
          r={discR + 0.5}
          fill="none"
          stroke={O.rule}
          strokeWidth="1"
          opacity="0.7"
        />
        {dots.map((d, i) => (
          <circle
            key={`s3${i}`}
            cx={cx + d.x}
            cy={cy + d.y}
            r={d.r}
            fill={O.ink}
            opacity={d.o}
          />
        ))}
      </g>
    );
  };

  const arrow = (x1: number, x2: number) => {
    const inset = discR + 10;
    const sx = x1 + inset;
    const ex = x2 - inset;
    const head = 6;
    return (
      <g stroke={O.muted} strokeWidth="1" opacity="0.7" markerEnd={`url(#${markerId})`}>
        <line x1={sx} y1={cy} x2={ex - 1} y2={cy} />
        <polyline
          fill="none"
          points={`${ex - head},${cy - head / 2} ${ex},${cy} ${ex - head},${cy + head / 2}`}
        />
      </g>
    );
  };

  return (
    <DiagramFrame designWidth={FRAME_W} designHeight={520}>
      <div
        className="box-border bg-[var(--thusness-bg)] text-[var(--thusness-ink)] antialiased"
        style={{
          fontFamily: ORIENT_HELV,
          width: FRAME_W,
          padding: "20px 40px 28px",
        }}
      >
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "8px 0 0" }}>
          <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block", margin: "0 auto" }}>
            <defs>
              <marker
                id={markerId}
                viewBox="0 0 10 10"
                refX={9}
                refY={5}
                markerWidth={10}
                markerHeight={10}
                orient="auto"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill={O.muted} />
              </marker>
            </defs>
            {arrow(cxs[0], cxs[1])}
            {arrow(cxs[1], cxs[2])}
            {stage1(cxs[0])}
            {stage2(cxs[1])}
            {stage3(cxs[2])}
          </svg>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 24,
              marginTop: 8,
            }}
          >
            {stages.map((st, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontFamily: ORIENT_HELV,
                    fontStyle: "italic",
                    fontSize: 12,
                    color: O.muted,
                    letterSpacing: 1.4,
                    marginBottom: 10,
                  }}
                >
                  {st.num} · {st.scope}
                </div>
                <div
                  style={{
                    fontSize: 26,
                    fontWeight: 500,
                    letterSpacing: -0.4,
                    color: O.ink,
                    lineHeight: 1.1,
                    marginBottom: 12,
                  }}
                >
                  {st.name}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: O.inkSoft,
                    fontStyle: "italic",
                    lineHeight: 1.5,
                    maxWidth: 240,
                    margin: "0 auto",
                  }}
                >
                  {st.gloss}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DiagramFrame>
  );
}
