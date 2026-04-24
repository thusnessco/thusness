// Thusness red dot — the signature. Use ONCE per page, in the footer.

import React from "react";

export default function RedDot({ size = 12 }: { size?: number }) {
  return (
    <span
      aria-hidden="true"
      style={{
        display: "inline-block",
        width: size,
        height: size,
        borderRadius: "50%",
        background: "var(--thusness-red, #c23a2a)",
        position: "relative",
        verticalAlign: "middle",
      }}
    >
      <span
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%)",
          width: size * 0.33,
          height: size * 0.33,
          borderRadius: "50%",
          background: "var(--thusness-bg, #efece1)",
        }}
      />
    </span>
  );
}
