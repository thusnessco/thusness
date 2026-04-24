// Thusness wordmark — parametric React component.
// Renders the full lockup: italic wordmark + hairline + tagline.

import React from "react";

type Props = {
  size?: number;
  tagline?: string | null;
  color?: string;
  mutedColor?: string;
};

export default function Wordmark({
  size = 20,
  tagline = "~ as it is",
  color = "var(--thusness-ink, #1a1915)",
  mutedColor = "var(--thusness-muted, #8a8672)",
}: Props) {
  const rootStyle: React.CSSProperties = {
    display: "inline-block",
    lineHeight: 1,
  };
  const wordStyle: React.CSSProperties = {
    fontFamily: 'Helvetica, "Helvetica Neue", Arial, sans-serif',
    fontStyle: "italic",
    fontSize: size,
    letterSpacing: size * 0.2,
    fontWeight: 400,
    color,
    marginBottom: tagline ? 4 : 0,
  };
  const ruleStyle: React.CSSProperties = {
    width: size * 3.8,
    height: 1,
    background: mutedColor,
    opacity: 0.6,
    margin: "2px 0 6px",
    border: "none",
  };
  const tagStyle: React.CSSProperties = {
    fontFamily: "Helvetica, Arial, sans-serif",
    fontSize: Math.max(10, size * 0.52),
    letterSpacing: 2,
    color: mutedColor,
  };
  return (
    <div style={rootStyle} aria-label="Thusness">
      <div style={wordStyle}>T&nbsp;h&nbsp;u&nbsp;s&nbsp;n&nbsp;e&nbsp;s&nbsp;s</div>
      {tagline ? (
        <>
          <hr style={ruleStyle} />
          <div style={tagStyle}>{tagline}</div>
        </>
      ) : null}
    </div>
  );
}
