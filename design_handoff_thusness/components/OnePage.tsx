// Thusness — reference single-page layout, ported from the HTML prototype.
// All design decisions (spacing, rules, type, glyph usage) are encoded here.
// Content is hardcoded — wire to your MDX / CMS / data source in production.
//
// This component assumes `tokens.css` is loaded globally so
// var(--thusness-*) resolve. Falls back to literal values otherwise.

import React from 'react';
import Wordmark from './Wordmark';
import SectionMark from './SectionMark';
import RedDot from './RedDot';

const helv = 'Helvetica, "Helvetica Neue", Arial, sans-serif';
const c = {
  bg: 'var(--thusness-bg, #efece1)',
  ink: 'var(--thusness-ink, #1a1915)',
  inkSoft: 'var(--thusness-ink-soft, #3d3a2f)',
  muted: 'var(--thusness-muted, #8a8672)',
  rule: 'var(--thusness-rule, #c7c2b0)',
};

type WeekData = {
  dateLabel: string;     // e.g. "Week of April 24, 2026"
  themeIndex: string;    // e.g. "Theme XVII"
  question: string;
  themeTitle: string;    // e.g. "Noticing Effort"
  prose: React.ReactNode;
  pullQuote: React.ReactNode;
  benefits: string[];
  itinerary: string[];
  pillar: string;        // e.g. "Gentle curiosity."
  zoomUrl: string;       // e.g. "https://thusness.as.me/"
  zoomLabel: string;     // e.g. "thusness.as.me"
};

const defaultWeek: WeekData = {
  dateLabel: 'Week of April 24, 2026',
  themeIndex: 'Theme XVII',
  question: 'Is any effort necessary for experience to be?',
  themeTitle: 'Noticing Effort',
  prose: (
    <>
      <p style={{ margin: '0 0 1.3em 0' }}>
        Previously we explored <em>resistance</em> — a sense of <em>no</em>{' '}
        regarding what&apos;s happening. Effort is a little more subtle, and
        might show up as a sense that something needs to be done: adjusting,
        reaching, trying to get it right, <em>I need to</em>, or holding
        things in place. A subtle doing, or a sense of something added onto
        what&apos;s here. Striving and trying are its amplified versions.
      </p>
      <p style={{ margin: '0 0 1.3em 0' }}>
        Qualities of effort may appear in the body, the mind, or both.
        If effort isn&apos;t present, what&apos;s left over may be
        relaxation, ease, openness, or a feeling that nothing needs to change.
      </p>
    </>
  ),
  pullQuote: (
    <>
      What happens as we become more curious
      <br />
      and aware of effort in each moment?
    </>
  ),
  benefits: [
    'Practice noticing experience as it is',
    'Increase sensitivity to the details of effort',
    'Effort becomes more visible and optional',
  ],
  itinerary: [
    'Notice where attention goes',
    'Noticing gentle curiosity',
    'Introductory exploration of effort',
    'Notice any aspects of experience and how effort might relate',
    'Integration exercise',
    'Home integration instructions',
    'Group sharing',
  ],
  pillar: 'Gentle curiosity.',
  zoomUrl: 'https://thusness.as.me/',
  zoomLabel: 'thusness.as.me',
};

export default function OnePage({ week = defaultWeek }: { week?: WeekData }) {
  const listItem: React.CSSProperties = {
    display: 'flex',
    gap: 20,
    padding: '14px 0',
    borderTop: `1px solid ${c.rule}`,
    fontSize: 16,
    lineHeight: 1.5,
    color: c.ink,
  };
  const listNum: React.CSSProperties = {
    fontFamily: helv,
    fontStyle: 'italic',
    fontSize: 13,
    color: c.muted,
    minWidth: 26,
    paddingTop: 3,
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: c.bg,
        color: c.ink,
        fontFamily: helv,
        WebkitFontSmoothing: 'antialiased',
      }}
    >
      <div style={{ maxWidth: 880, margin: '0 auto', padding: '48px 40px 96px' }}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 72,
          }}
        >
          <Wordmark size={20} />
          <div
            style={{
              fontFamily: helv,
              fontSize: 11,
              letterSpacing: 2.4,
              textTransform: 'uppercase',
              color: c.muted,
              textAlign: 'right',
              lineHeight: 1.6,
            }}
          >
            {week.dateLabel}
            <br />
            {week.themeIndex}
          </div>
        </div>

        {/* Hero question */}
        <div
          style={{
            minHeight: 360,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 -20px 72px',
          }}
        >
          <div style={{ textAlign: 'center', padding: '0 24px' }}>
            <h1
              style={{
                fontSize: 54,
                fontWeight: 500,
                lineHeight: 1.1,
                letterSpacing: -0.8,
                color: c.ink,
                margin: '0 auto 28px',
                maxWidth: '20ch',
              }}
            >
              {week.question}
            </h1>
            <div
              style={{
                fontStyle: 'italic',
                fontSize: 14,
                color: c.muted,
                letterSpacing: 0.4,
              }}
            >
              — a question to sit with —
            </div>
          </div>
        </div>

        {/* Theme */}
        <SectionMark label={`~ Theme · ${week.themeTitle}`} />
        <div
          style={{
            maxWidth: 620,
            margin: '0 auto',
            fontSize: 17,
            lineHeight: 1.7,
            color: c.inkSoft,
          }}
        >
          {week.prose}
        </div>

        <blockquote
          style={{
            textAlign: 'center',
            fontStyle: 'italic',
            fontSize: 22,
            color: c.ink,
            margin: '56px auto',
            maxWidth: '34ch',
            lineHeight: 1.4,
            padding: '28px 0',
            borderTop: `1px solid ${c.rule}`,
            borderBottom: `1px solid ${c.rule}`,
          }}
        >
          {week.pullQuote}
        </blockquote>

        {/* Benefits */}
        <div style={{ maxWidth: 620, margin: '0 auto 72px' }}>
          <div
            style={{
              fontSize: 11,
              letterSpacing: 2.4,
              textTransform: 'uppercase',
              color: c.muted,
              marginBottom: 20,
            }}
          >
            ~ Benefits &amp; Goals
          </div>
          <ol style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {week.benefits.map((t, i, arr) => (
              <li
                key={i}
                style={{
                  ...listItem,
                  ...(i === arr.length - 1
                    ? { borderBottom: `1px solid ${c.rule}` }
                    : {}),
                }}
              >
                <span style={listNum}>{String(i + 1).padStart(2, '0')}</span>
                <span>{t}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Itinerary */}
        <div style={{ maxWidth: 620, margin: '0 auto 72px' }}>
          <div
            style={{
              fontSize: 11,
              letterSpacing: 2.4,
              textTransform: 'uppercase',
              color: c.muted,
              marginBottom: 20,
            }}
          >
            ~ Itinerary
          </div>
          <ol style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {week.itinerary.map((t, i, arr) => (
              <li
                key={i}
                style={{
                  ...listItem,
                  ...(i === arr.length - 1
                    ? { borderBottom: `1px solid ${c.rule}` }
                    : {}),
                }}
              >
                <span style={listNum}>{String(i + 1).padStart(2, '0')}</span>
                <span>{t}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Pillar */}
        <div style={{ maxWidth: 620, margin: '0 auto 72px', textAlign: 'center' }}>
          <div
            style={{
              fontFamily: helv,
              fontStyle: 'italic',
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
              textTransform: 'uppercase',
              color: c.muted,
              marginBottom: 20,
            }}
          >
            Pillar of Success
          </div>
          <div
            style={{
              fontSize: 28,
              fontStyle: 'italic',
              color: c.ink,
              letterSpacing: -0.2,
            }}
          >
            {week.pillar}
          </div>
        </div>

        {/* Sessions */}
        <div style={{ marginTop: 40 }}>
          <SectionMark label="~ Sit together" />

          <div style={{ margin: '0 auto', maxWidth: 760 }}>
            <p
              style={{
                textAlign: 'center',
                fontStyle: 'italic',
                fontSize: 16,
                color: c.inkSoft,
                margin: '0 auto 48px',
                maxWidth: '40ch',
              }}
            >
              A quiet hour of guided noticing, with space for sharing. Held on Zoom.
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 24,
                marginBottom: 48,
              }}
            >
              {[
                { label: '~ I', day: 'Wednesday' },
                { label: '~ II', day: 'Friday' },
              ].map((card) => (
                <div
                  key={card.label}
                  style={{
                    border: `1px solid ${c.rule}`,
                    padding: '36px 32px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                    minHeight: 180,
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      letterSpacing: 2,
                      textTransform: 'uppercase',
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
                      textTransform: 'uppercase',
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
                textAlign: 'center',
                padding: '44px 0',
                borderTop: `1px solid ${c.rule}`,
                borderBottom: `1px solid ${c.rule}`,
              }}
            >
              <a
                href={week.zoomUrl}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 14,
                  fontSize: 22,
                  fontWeight: 500,
                  color: c.ink,
                  textDecoration: 'none',
                  borderBottom: `1px solid ${c.ink}`,
                  paddingBottom: 4,
                }}
              >
                {week.zoomLabel}
                <span style={{ fontStyle: 'italic', fontSize: 18 }}>→</span>
              </a>
              <div
                style={{
                  marginTop: 22,
                  fontStyle: 'italic',
                  fontSize: 15,
                  color: c.muted,
                }}
              >
                All are welcome.
              </div>
            </div>
          </div>
        </div>

        {/* Footer — red dot appears EXACTLY ONCE per page here */}
        <div
          style={{
            marginTop: 80,
            paddingTop: 24,
            borderTop: `1px solid ${c.rule}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 11,
            letterSpacing: 2,
            color: c.muted,
            textTransform: 'uppercase',
          }}
        >
          <span>thusness.co</span>
          <RedDot />
        </div>
      </div>
    </div>
  );
}
