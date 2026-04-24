// Thusness — week template: home (current week) or archive (/notes/[slug]).

import React from "react";

import type { Week } from "@/lib/weeks";

import RedDot from "./RedDot";
import SectionMark from "./SectionMark";
import Wordmark from "./Wordmark";
import { WeekProse } from "./WeekProse";

const helv = 'Helvetica, "Helvetica Neue", Arial, sans-serif';
const c = {
  bg: "var(--thusness-bg, #efece1)",
  ink: "var(--thusness-ink, #1a1915)",
  inkSoft: "var(--thusness-ink-soft, #3d3a2f)",
  muted: "var(--thusness-muted, #8a8672)",
  rule: "var(--thusness-rule, #c7c2b0)",
};

export type OnePageMode = "home" | "archive";

export type OnePageProps = {
  week: Week;
  mode: OnePageMode;
};

function PullQuote({ text }: { text: string }) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return null;
  return (
    <>
      {lines.map((line, i) => (
        <React.Fragment key={i}>
          {i > 0 ? <br /> : null}
          {line.trim()}
        </React.Fragment>
      ))}
    </>
  );
}

export default function OnePage({ week, mode }: OnePageProps) {
  const listItem: React.CSSProperties = {
    display: "flex",
    gap: 20,
    padding: "14px 0",
    borderTop: `1px solid ${c.rule}`,
    fontSize: 16,
    lineHeight: 1.5,
    color: c.ink,
  };
  const listNum: React.CSSProperties = {
    fontFamily: helv,
    fontStyle: "italic",
    fontSize: 13,
    color: c.muted,
    minWidth: 26,
    paddingTop: 3,
  };

  const showHeroCircle = week.hero?.kind === "circle";
  const showHeaderMeta = mode === "home";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: c.bg,
        color: c.ink,
        fontFamily: helv,
        WebkitFontSmoothing: "antialiased",
      }}
    >
      <div style={{ maxWidth: 880, margin: "0 auto", padding: "48px 40px 96px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 72,
          }}
        >
          <Wordmark size={20} />
          {showHeaderMeta ? (
            <div
              style={{
                fontFamily: helv,
                fontSize: 11,
                letterSpacing: 2.4,
                textTransform: "uppercase",
                color: c.muted,
                textAlign: "right",
                lineHeight: 1.6,
              }}
            >
              {week.dateLabel}
              {week.themeIndex ? (
                <>
                  <br />
                  {week.themeIndex}
                </>
              ) : null}
            </div>
          ) : null}
        </div>

        <div
          style={{
            minHeight: 360,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 -20px 72px",
            position: "relative",
          }}
        >
          {showHeroCircle ? (
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                width: 520,
                height: 520,
                borderRadius: "50%",
                border: `1px solid ${c.rule}`,
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                pointerEvents: "none",
              }}
            />
          ) : null}
          <div
            style={{
              textAlign: "center",
              padding: "0 24px",
              position: "relative",
              zIndex: 1,
            }}
          >
            <h1
              style={{
                fontSize: 54,
                fontWeight: 500,
                lineHeight: 1.1,
                letterSpacing: -0.8,
                color: c.ink,
                margin: "0 auto 28px",
                maxWidth: "20ch",
              }}
            >
              {week.question}
            </h1>
            <div
              style={{
                fontStyle: "italic",
                fontSize: 14,
                color: c.muted,
                letterSpacing: 0.4,
              }}
            >
              — a question to sit with —
            </div>
          </div>
        </div>

        <SectionMark label={`~ Theme · ${week.themeTitle}`} />
        <div
          style={{
            maxWidth: 620,
            margin: "0 auto",
            fontSize: 17,
            lineHeight: 1.7,
            color: c.inkSoft,
          }}
        >
          <WeekProse markdown={week.proseMarkdown} />
        </div>

        {week.pullQuote.trim() ? (
          <blockquote
            style={{
              textAlign: "center",
              fontStyle: "italic",
              fontSize: 22,
              color: c.ink,
              margin: "56px auto",
              maxWidth: "34ch",
              lineHeight: 1.4,
              padding: "28px 0",
              borderTop: `1px solid ${c.rule}`,
              borderBottom: `1px solid ${c.rule}`,
            }}
          >
            <PullQuote text={week.pullQuote} />
          </blockquote>
        ) : null}

        <div style={{ maxWidth: 620, margin: "0 auto 72px" }}>
          <div
            style={{
              fontSize: 11,
              letterSpacing: 2.4,
              textTransform: "uppercase",
              color: c.muted,
              marginBottom: 20,
            }}
          >
            ~ Benefits &amp; Goals
          </div>
          <ol style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {week.benefits.map((t, i, arr) => (
              <li
                key={i}
                style={{
                  ...listItem,
                  ...(i === arr.length - 1 ? { borderBottom: `1px solid ${c.rule}` } : {}),
                }}
              >
                <span style={listNum}>{String(i + 1).padStart(2, "0")}</span>
                <span>{t}</span>
              </li>
            ))}
          </ol>
        </div>

        <div style={{ maxWidth: 620, margin: "0 auto 72px" }}>
          <div
            style={{
              fontSize: 11,
              letterSpacing: 2.4,
              textTransform: "uppercase",
              color: c.muted,
              marginBottom: 20,
            }}
          >
            ~ Itinerary
          </div>
          <ol style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {week.itinerary.map((t, i, arr) => (
              <li
                key={i}
                style={{
                  ...listItem,
                  ...(i === arr.length - 1 ? { borderBottom: `1px solid ${c.rule}` } : {}),
                }}
              >
                <span style={listNum}>{String(i + 1).padStart(2, "0")}</span>
                <span>{t}</span>
              </li>
            ))}
          </ol>
        </div>

        <div style={{ maxWidth: 620, margin: "0 auto 72px", textAlign: "center" }}>
          <div
            style={{
              fontFamily: helv,
              fontStyle: "italic",
              fontSize: 34,
              color: c.muted,
              lineHeight: 1,
              marginBottom: 16,
            }}
          >
            ~
          </div>
          <div
            style={{
              fontSize: 11,
              letterSpacing: 2.4,
              textTransform: "uppercase",
              color: c.muted,
              marginBottom: 20,
            }}
          >
            Pillar of Success
          </div>
          <div
            style={{
              fontSize: 28,
              fontStyle: "italic",
              color: c.ink,
              letterSpacing: -0.2,
            }}
          >
            {week.pillar}
          </div>
        </div>

        <div style={{ marginTop: 40 }}>
          <SectionMark label="~ Sit together" />

          <div style={{ margin: "0 auto", maxWidth: 760 }}>
            <p
              style={{
                textAlign: "center",
                fontStyle: "italic",
                fontSize: 16,
                color: c.inkSoft,
                margin: "0 auto 48px",
                maxWidth: "40ch",
              }}
            >
              A quiet hour of guided noticing, with space for sharing. Held on Zoom.
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 24,
                marginBottom: 48,
              }}
            >
              {[
                { label: "~ I", day: "Wednesday" },
                { label: "~ II", day: "Friday" },
              ].map((card) => (
                <div
                  key={card.label}
                  style={{
                    border: `1px solid ${c.rule}`,
                    padding: "36px 32px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                    minHeight: 180,
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      letterSpacing: 2,
                      textTransform: "uppercase",
                      color: c.muted,
                    }}
                  >
                    {card.label}
                  </div>
                  <div
                    style={{
                      fontSize: 34,
                      fontWeight: 500,
                      letterSpacing: -0.6,
                      lineHeight: 1,
                    }}
                  >
                    {card.day}
                  </div>
                  <div style={{ fontSize: 17, color: c.inkSoft }}>09:00 — 10:00</div>
                  <div
                    style={{
                      fontSize: 11,
                      letterSpacing: 1.6,
                      textTransform: "uppercase",
                      color: c.muted,
                    }}
                  >
                    Pacific Time
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                textAlign: "center",
                padding: "44px 0",
                borderTop: `1px solid ${c.rule}`,
                borderBottom: `1px solid ${c.rule}`,
              }}
            >
              <a
                href={week.zoomUrl}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 14,
                  fontSize: 22,
                  fontWeight: 500,
                  color: c.ink,
                  textDecoration: "none",
                  borderBottom: `1px solid ${c.ink}`,
                  paddingBottom: 4,
                }}
              >
                {week.zoomLabel}
                <span style={{ fontStyle: "italic", fontSize: 18 }}>→</span>
              </a>
              <div
                style={{
                  marginTop: 22,
                  fontStyle: "italic",
                  fontSize: 15,
                  color: c.muted,
                }}
              >
                All are welcome.
              </div>
            </div>

          </div>
        </div>

        <div
          style={{
            marginTop: 80,
            paddingTop: 24,
            borderTop: `1px solid ${c.rule}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 11,
            letterSpacing: 2,
            color: c.muted,
            textTransform: "uppercase",
          }}
        >
          <span>thusness.co</span>
          <RedDot />
        </div>
      </div>
    </div>
  );
}
