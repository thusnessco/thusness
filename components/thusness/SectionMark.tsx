// Thusness section mark — centered small-caps label with flanking hairlines.

import React from "react";

export default function SectionMark({ label }: { label: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 20,
        fontFamily: 'Helvetica, "Helvetica Neue", Arial, sans-serif',
        fontSize: 11,
        letterSpacing: 2.4,
        textTransform: "uppercase",
        color: "var(--thusness-muted, #8a8672)",
        margin: "0 auto 48px",
        maxWidth: 820,
      }}
    >
      <span style={{ flex: 1, height: 1, background: "var(--thusness-rule, #c7c2b0)" }} />
      <span>{label}</span>
      <span style={{ flex: 1, height: 1, background: "var(--thusness-rule, #c7c2b0)" }} />
    </div>
  );
}
