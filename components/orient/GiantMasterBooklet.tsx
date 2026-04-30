"use client";

import { useId } from "react";

import type { OrientContent } from "@/lib/orient-infographics/types";

import { ORIENT_HELV, orientColors as O } from "./orient-diagram-styles";

/** Giant orient map + pillars strip — matches `prototype/site/orient.jsx` `GiantMaster` inner (no OSheet). */
export function GiantMasterBooklet({ content }: { content: OrientContent }) {
  const t = content;
  const mid = useId().replace(/:/g, "");
  const markerId = `arr-gm-${mid}`;

  const pillars = t.pillars.items.slice(0, 3).map((p) => ({
    name: p.name,
    sub: p.sub,
  }));

  const stagesRows = t.stages.items.slice(0, 3).map((s, i) => ({
    x: [180, 500, 820][i] ?? 180,
    num: String(i + 1).padStart(2, "0"),
    scope: s.scope,
    name: s.name,
    gloss: s.gloss,
  }));

  const themesNames = t.themes.list.slice(0, 8);

  return (
    <div style={{ width: "100%", maxWidth: "100%", margin: "0 auto", position: "relative" }}>
      <div style={{ marginBottom: 24 }}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "baseline",
            justifyContent: "space-between",
            gap: "8px 20px",
            marginBottom: 10,
          }}
        >
          <div
            style={{
              fontFamily: ORIENT_HELV,
              fontSize: 12,
              letterSpacing: 2.6,
              color: O.muted,
              textTransform: "uppercase",
            }}
          >
            ~ Three pillars · welcome throughout
          </div>
          <div
            style={{
              fontFamily: ORIENT_HELV,
              fontSize: 11,
              fontStyle: "italic",
              color: O.muted,
              letterSpacing: 0.4,
              minWidth: 0,
              textAlign: "right",
            }}
          >
            when these are welcome, the rest comes easily
          </div>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: 0,
            border: `1px solid ${O.rule}`,
          }}
        >
          {pillars.map((p, i) => (
            <div
              key={i}
              style={{
                padding: "16px 16px 18px",
                minWidth: 0,
                borderLeft: i > 0 ? `1px solid ${O.rule}` : "none",
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              <div
                style={{
                  fontFamily: ORIENT_HELV,
                  fontStyle: "italic",
                  fontSize: 11,
                  letterSpacing: 2,
                  color: O.muted,
                  textTransform: "uppercase",
                }}
              >
                ~ Pillar 0{i + 1}
              </div>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 500,
                  letterSpacing: -0.3,
                  lineHeight: 1.15,
                  color: O.ink,
                  wordBreak: "break-word",
                }}
              >
                {p.name}
              </div>
              <div style={{ fontStyle: "italic", fontSize: 13, color: O.inkSoft, lineHeight: 1.4 }}>
                {p.sub}
              </div>
            </div>
          ))}
        </div>
      </div>

      <svg viewBox="0 0 1180 1080" width="100%" height="auto" aria-hidden>
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

        <text x="80" y="60" fontFamily={ORIENT_HELV} fontSize="13" letterSpacing="2.4" fill={O.muted}>
          ~ A · STAGES OF PEACE
        </text>
        <line x1="80" y1="76" x2="940" y2="76" stroke={O.rule} strokeWidth="1" />

        {[60].map((r, i) => (
          <circle key={i} cx="500" cy="220" r={r} fill="none" stroke={O.rule} strokeWidth="1" opacity={0.5} />
        ))}
        <line x1="170" y1="220" x2="830" y2="220" stroke={O.rule} strokeWidth="1" />
        <circle cx="180" cy="220" r="4.5" fill={O.ink} />
        <circle cx="500" cy="220" r="38" fill={O.ink} opacity="0.10" />
        <circle cx="500" cy="220" r="38" fill="none" stroke={O.muted} strokeWidth="1" opacity="0.6" />
        <circle cx="820" cy="220" r="60" fill="none" stroke={O.rule} strokeWidth="1" opacity="0.5" />
        {(() => {
          const seed = (n: number) => {
            const x = Math.sin(n * 12.9898) * 43758.5453;
            return x - Math.floor(x);
          };
          const dots: { x: number; y: number }[] = [];
          let n = 0;
          let placed = 0;
          const minDist = 3;
          while (placed < 280 && n < 40000) {
            const a = seed(++n) * Math.PI * 2;
            const r = Math.sqrt(seed(++n)) * 55;
            const px = 820 + Math.cos(a) * r;
            const py = 220 + Math.sin(a) * r;
            let ok = true;
            for (const d of dots) {
              const dx = d.x - px;
              const dy = d.y - py;
              if (dx * dx + dy * dy < minDist * minDist) {
                ok = false;
                break;
              }
            }
            if (ok) {
              dots.push({ x: px, y: py });
              placed++;
            }
          }
          return dots.map((d, i) => (
            <circle key={`int${i}`} cx={d.x} cy={d.y} r="1" fill={i % 3 === 0 ? O.muted : O.ink} />
          ));
        })()}

        {[
          [220, 460],
          [540, 780],
        ].map(([a, b], i) => (
          <line
            key={i}
            x1={a}
            y1="220"
            x2={b}
            y2="220"
            stroke={O.muted}
            strokeWidth="1"
            markerEnd={`url(#${markerId})`}
          />
        ))}

        {stagesRows.map((s, i) => (
          <g key={i}>
            <text
              x={s.x}
              y="298"
              textAnchor="middle"
              fontFamily={ORIENT_HELV}
              fontStyle="italic"
              fontSize="13"
              letterSpacing="1.4"
              fill={O.muted}
            >
              {s.num} · {s.scope}
            </text>
            <text
              x={s.x}
              y="328"
              textAnchor="middle"
              fontFamily={ORIENT_HELV}
              fontSize="22"
              fontWeight="500"
              letterSpacing="-0.3"
              fill={O.ink}
            >
              {s.name}
            </text>
            <text
              x={s.x}
              y="356"
              textAnchor="middle"
              fontFamily={ORIENT_HELV}
              fontSize="14"
              fontStyle="italic"
              fill={O.inkSoft}
            >
              {s.gloss}
            </text>
          </g>
        ))}

        <line x1="500" y1="380" x2="500" y2="450" stroke={O.muted} strokeWidth="1" strokeDasharray="3 5" markerEnd={`url(#${markerId})`} />
        <text x="520" y="420" fontFamily={ORIENT_HELV} fontStyle="italic" fontSize="15" fill={O.muted}>
          {t.giant.transition}
        </text>

        <text x="80" y="490" fontFamily={ORIENT_HELV} fontSize="13" letterSpacing="2.4" fill={O.muted}>
          ~ B · MOVEMENT &amp; PROGRESSION
        </text>
        <line x1="80" y1="506" x2="940" y2="506" stroke={O.rule} strokeWidth="1" />

        <g>
          {[
            [140, 560],
            [180, 548],
            [220, 562],
            [160, 590],
            [200, 588],
            [180, 618],
          ].map(([x, y], i) => (
            <circle key={`a${i}`} cx={x} cy={y} r="4" fill={O.ink} />
          ))}
          <rect x="120" y="535" width="120" height="100" fill="none" stroke={O.rule} strokeWidth="1" />
          <text x="180" y="660" textAnchor="middle" fontFamily={ORIENT_HELV} fontStyle="italic" fontSize="13" letterSpacing="1.6" fill={O.muted}>
            ~ assumed · solid
          </text>
        </g>

        <path d="M 270 580 Q 430 540, 590 580" fill="none" stroke={O.muted} strokeWidth="1" strokeDasharray="3 5" />
        <path d="M 590 580 l -8 -3 l 0 6 z" fill={O.muted} />
        <text x="430" y="528" textAnchor="middle" fontFamily={ORIENT_HELV} fontStyle="italic" fontSize="14" fill={O.muted}>
          ~ assumption doesn&apos;t hold when looked at closely
        </text>

        <g>
          {(() => {
            const pts = [
              [640, 548],
              [700, 565],
              [770, 545],
              [830, 575],
              [660, 615],
              [740, 632],
              [810, 610],
              [700, 665],
              [780, 672],
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
                    key={`gl${i}`}
                    x1={pts[a][0]}
                    y1={pts[a][1]}
                    x2={pts[b][0]}
                    y2={pts[b][1]}
                    stroke={O.rule}
                    strokeWidth="1"
                    opacity="0.85"
                  />
                ))}
                {pts.map(([x, y], i) => (
                  <circle key={`gp${i}`} cx={x} cy={y} r="3.5" fill={O.ink} />
                ))}
              </>
            );
          })()}
          <text x="730" y="700" textAnchor="middle" fontFamily={ORIENT_HELV} fontStyle="italic" fontSize="13" letterSpacing="1.6" fill={O.muted}>
            ~ dependent · conditioned
          </text>
        </g>

        <line x1="80" y1="730" x2="940" y2="730" stroke={O.rule} strokeWidth="1" />

        <text x="80" y="780" fontFamily={ORIENT_HELV} fontSize="13" letterSpacing="2.4" fill={O.muted}>
          ~ C · THEMES
        </text>
        <line x1="80" y1="796" x2="940" y2="796" stroke={O.rule} strokeWidth="1" />

        {(() => {
          const positions = [
            { x: 160, y: 870 },
            { x: 320, y: 840 },
            { x: 480, y: 870 },
            { x: 660, y: 840 },
            { x: 220, y: 970 },
            { x: 400, y: 990 },
            { x: 580, y: 970 },
            { x: 760, y: 990 },
          ];
          const themes = themesNames.map((name, i) => ({ name, ...positions[i] }));
          const links = [
            [0, 1],
            [1, 2],
            [2, 3],
            [4, 5],
            [5, 6],
            [6, 7],
            [0, 4],
            [1, 5],
            [2, 6],
            [3, 7],
            [0, 5],
            [3, 6],
          ].filter(([a, b]) => a < themes.length && b < themes.length);
          return (
            <g>
              {links.map(([a, b], i) => (
                <line
                  key={`l${i}`}
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
                <g key={`t${i}`}>
                  <circle cx={th.x} cy={th.y} r="3.5" fill={O.ink} />
                  <text
                    x={th.x}
                    y={th.y - 12}
                    textAnchor="middle"
                    fontFamily={ORIENT_HELV}
                    fontSize="15"
                    fontStyle="italic"
                    fill={O.ink}
                  >
                    {th.name}
                  </text>
                </g>
              ))}
            </g>
          );
        })()}

        <text x="80" y="1040" fontFamily={ORIENT_HELV} fontStyle="italic" fontSize="13" letterSpacing="0.4" fill={O.muted}>
          {t.giant.tagline}
        </text>
      </svg>
    </div>
  );
}
