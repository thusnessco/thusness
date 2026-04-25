// Thusness mark — thin ring + center dot. Use ONCE per page, in the footer.

import React from 'react';

const RED = 'var(--thusness-red, #c23a2a)';

export default function RedDot({ size = 12 }: { size?: number }) {
  const vb = 24;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${vb} ${vb}`}
      aria-hidden="true"
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
    >
      <circle
        cx={vb / 2}
        cy={vb / 2}
        r={8.75}
        fill="none"
        stroke={RED}
        strokeWidth={1.15}
      />
      <circle cx={vb / 2} cy={vb / 2} r={2.35} fill={RED} />
    </svg>
  );
}
