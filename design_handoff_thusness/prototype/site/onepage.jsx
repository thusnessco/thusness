// Thusness — single-page site.
// System: Helvetica italic wordmark, warm cream ground, near-black ink,
// muted tan, hairline rules as structural rhythm, tilde as the glyph,
// one red dot as signature.

const T = {
  bg: '#efece1',
  ink: '#1a1915',
  inkSoft: '#3d3a2f',
  muted: '#8a8672',
  rule: '#c7c2b0',
  red: '#c23a2a',
  helv: 'Helvetica, "Helvetica Neue", Arial, sans-serif',
};

// ─── Mark ───
const Wordmark = ({ size = 20 }) => {
  const s = {
    root: { display: 'inline-block', lineHeight: 1 },
    word: {
      fontFamily: T.helv, fontStyle: 'italic', fontSize: size,
      letterSpacing: size * 0.2, fontWeight: 400, color: T.ink, marginBottom: 4,
    },
    rule: { width: size * 3.8, height: 1, background: T.muted, opacity: 0.6,
      margin: '2px 0 6px', border: 'none' },
    tag: { fontFamily: T.helv, fontSize: Math.max(10, size * 0.52),
      letterSpacing: 2, color: T.muted },
  };
  return (
    <div style={s.root}>
      <div style={s.word}>T&nbsp;h&nbsp;u&nbsp;s&nbsp;n&nbsp;e&nbsp;s&nbsp;s</div>
      <hr style={s.rule} />
      <div style={s.tag}>~ as it is</div>
    </div>
  );
};

const RedDot = ({ size = 12 }) => (
  <span style={{ display: 'inline-block', width: size, height: size,
    borderRadius: '50%', background: T.red, position: 'relative',
    verticalAlign: 'middle' }}>
    <span style={{ position: 'absolute', top: '50%', left: '50%',
      transform: 'translate(-50%,-50%)',
      width: size * 0.33, height: size * 0.33,
      borderRadius: '50%', background: T.bg }}></span>
  </span>
);

// Section mark with flanking hairlines
const SectionMark = ({ label }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 20,
    fontFamily: T.helv, fontSize: 11, letterSpacing: 2.4,
    textTransform: 'uppercase', color: T.muted, margin: '0 auto 48px',
    maxWidth: 820 }}>
    <span style={{ flex: 1, height: 1, background: T.rule }}></span>
    <span>{label}</span>
    <span style={{ flex: 1, height: 1, background: T.rule }}></span>
  </div>
);

// ─── The page ───
const OnePage = () => {
  const s = {
    root: { minHeight: '100vh', background: T.bg, color: T.ink,
      fontFamily: T.helv, WebkitFontSmoothing: 'antialiased' },
    shell: { maxWidth: 880, margin: '0 auto', padding: '48px 40px 96px' },

    // Header
    top: { display: 'flex', justifyContent: 'space-between',
      alignItems: 'flex-start', marginBottom: 72 },
    date: { fontFamily: T.helv, fontSize: 11, letterSpacing: 2.4,
      textTransform: 'uppercase', color: T.muted, textAlign: 'right', lineHeight: 1.6 },

    // Hero
    hero: { minHeight: 360, display: 'flex', alignItems: 'center',
      justifyContent: 'center', position: 'relative', margin: '0 -20px 72px' },
    heroInner: { position: 'relative', zIndex: 1, textAlign: 'center',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28,
      padding: '0 24px' },
    question: { fontSize: 54, fontWeight: 500, lineHeight: 1.1,
      letterSpacing: -0.8, color: T.ink, margin: 0, maxWidth: '20ch' },
    subLabel: { fontStyle: 'italic', fontSize: 14, color: T.muted,
      letterSpacing: 0.4 },

    // Prose
    prose: { maxWidth: 620, margin: '0 auto', fontSize: 17, lineHeight: 1.7,
      color: T.inkSoft },
    p: { margin: '0 0 1.3em 0' },
    em: { fontStyle: 'italic', color: T.ink },

    pull: { textAlign: 'center', fontStyle: 'italic', fontSize: 22,
      color: T.ink, margin: '56px auto', maxWidth: '34ch', lineHeight: 1.4,
      padding: '28px 0', borderTop: `1px solid ${T.rule}`,
      borderBottom: `1px solid ${T.rule}` },

    // Lists
    listWrap: { maxWidth: 620, margin: '0 auto 72px' },
    listH: { fontSize: 11, letterSpacing: 2.4, textTransform: 'uppercase',
      color: T.muted, marginBottom: 20 },
    ol: { listStyle: 'none', margin: 0, padding: 0 },
    li: { display: 'flex', gap: 20, padding: '14px 0',
      borderTop: `1px solid ${T.rule}`, fontSize: 16, lineHeight: 1.5,
      color: T.ink },
    liLast: { borderBottom: `1px solid ${T.rule}` },
    liNum: { fontFamily: T.helv, fontStyle: 'italic', fontSize: 13,
      color: T.muted, minWidth: 26, paddingTop: 3 },

    // Sessions
    sessWrap: { margin: '0 auto', maxWidth: 760 },
    sessSub: { textAlign: 'center', fontStyle: 'italic', fontSize: 16,
      color: T.inkSoft, margin: '0 auto 48px', maxWidth: '40ch' },
    cards: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24,
      marginBottom: 48 },
    card: { border: `1px solid ${T.rule}`, padding: '36px 32px',
      display: 'flex', flexDirection: 'column', gap: 10, minHeight: 180 },
    cardLabel: { fontSize: 11, letterSpacing: 2, textTransform: 'uppercase',
      color: T.muted },
    cardDay: { fontSize: 34, fontWeight: 500, letterSpacing: -0.6, lineHeight: 1 },
    cardTime: { fontSize: 17, color: T.inkSoft },
    cardTz: { fontSize: 11, letterSpacing: 1.6, textTransform: 'uppercase',
      color: T.muted },

    join: { textAlign: 'center', padding: '44px 0',
      borderTop: `1px solid ${T.rule}`, borderBottom: `1px solid ${T.rule}` },
    zoomLink: { display: 'inline-flex', alignItems: 'center', gap: 14,
      fontSize: 22, fontWeight: 500, color: T.ink, textDecoration: 'none',
      borderBottom: `1px solid ${T.ink}`, paddingBottom: 4 },
    welcome: { marginTop: 22, fontStyle: 'italic', fontSize: 15,
      color: T.muted },

    // Footer
    foot: { marginTop: 80, paddingTop: 24, borderTop: `1px solid ${T.rule}`,
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      fontSize: 11, letterSpacing: 2, color: T.muted, textTransform: 'uppercase' },
  };

  const itinerary = [
    'Notice where attention goes',
    'Noticing gentle curiosity',
    'Introductory exploration of effort',
    'Notice any aspects of experience and how effort might relate',
    'Integration exercise',
    'Home integration instructions',
    'Group sharing',
  ];

  const benefits = [
    'Practice noticing experience as it is',
    'Increase sensitivity to the details of effort',
    'Effort becomes more visible and optional',
  ];

  return (
    <div style={s.root}>
      <div style={s.shell}>

        {/* Header */}
        <div style={s.top}>
          <Wordmark size={20} />
          <div style={s.date}>
            Week of April 24, 2026<br/>
            Theme XVII
          </div>
        </div>

        {/* Hero question */}
        <div style={s.hero}>
          <div style={s.heroInner}>
            <h1 style={s.question}>Is any effort necessary for experience to be?</h1>
            <div style={s.subLabel}>— a question to sit with —</div>
          </div>
        </div>

        {/* Theme */}
        <SectionMark label="~ Theme · Noticing Effort" />

        <div style={s.prose}>
          <p style={s.p}>
            Previously we explored <span style={s.em}>resistance</span> —
            a sense of <span style={s.em}>no</span> regarding what's happening.
            Effort is a little more subtle, and might show up as a sense that
            something needs to be done: adjusting, reaching, trying to get it
            right, <span style={s.em}>I need to</span>, or holding things in
            place. A subtle doing, or a sense of something added onto what's
            here. Striving and trying are its amplified versions.
          </p>
          <p style={s.p}>
            Qualities of effort may appear in the body, the mind, or both.
            If effort isn't present, what's left over may be relaxation,
            ease, openness, or a feeling that nothing needs to change.
          </p>
        </div>

        <blockquote style={s.pull}>
          What happens as we become more curious<br/>
          and aware of effort in each moment?
        </blockquote>

        <div style={s.listWrap}>
          <div style={s.listH}>~ Benefits &amp; Goals</div>
          <ol style={s.ol}>
            {benefits.map((t, i, arr) => (
              <li key={i} style={{ ...s.li, ...(i === arr.length - 1 ? s.liLast : {}) }}>
                <span style={s.liNum}>{String(i + 1).padStart(2, '0')}</span>
                <span>{t}</span>
              </li>
            ))}
          </ol>
        </div>

        <div style={s.listWrap}>
          <div style={s.listH}>~ Itinerary</div>
          <ol style={s.ol}>
            {itinerary.map((t, i, arr) => (
              <li key={i} style={{ ...s.li, ...(i === arr.length - 1 ? s.liLast : {}) }}>
                <span style={s.liNum}>{String(i + 1).padStart(2, '0')}</span>
                <span>{t}</span>
              </li>
            ))}
          </ol>
        </div>

        <div style={{ ...s.listWrap, textAlign: 'center' }}>
          <div style={{ fontFamily: T.helv, fontStyle: 'italic',
            fontSize: 34, color: T.muted, lineHeight: 1, marginBottom: 16 }}>
            ~
          </div>
          <div style={s.listH}>Pillar of success</div>
          <div style={{ fontSize: 28, fontStyle: 'italic', color: T.ink,
            letterSpacing: -0.2 }}>
            Gentle curiosity.
          </div>
        </div>

        {/* Sessions */}
        <div style={{ marginTop: 40 }}>
          <SectionMark label="~ Sit together" />

          <div style={s.sessWrap}>
            <p style={s.sessSub}>
              A quiet hour of guided noticing, with space for sharing.
              Held on Zoom.
            </p>

            <div style={s.cards}>
              <div style={s.card}>
                <div style={s.cardLabel}>~ I</div>
                <div style={s.cardDay}>Wednesday</div>
                <div style={s.cardTime}>09:00 — 10:00</div>
                <div style={s.cardTz}>Pacific Time</div>
              </div>
              <div style={s.card}>
                <div style={s.cardLabel}>~ II</div>
                <div style={s.cardDay}>Friday</div>
                <div style={s.cardTime}>09:00 — 10:00</div>
                <div style={s.cardTz}>Pacific Time</div>
              </div>
            </div>

            <div style={s.join}>
              <a href="https://zoom.us/j/97461285343" style={s.zoomLink}>
                zoom.us/j/97461285343
                <span style={{ fontStyle: 'italic', fontSize: 18 }}>→</span>
              </a>
              <div style={s.welcome}>All are welcome.</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={s.foot}>
          <span>thusness.co</span>
          <RedDot />
        </div>

      </div>
    </div>
  );
};

Object.assign(window, { OnePage });
