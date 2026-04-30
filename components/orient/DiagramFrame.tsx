"use client";

import { useLayoutEffect, useRef, useState } from "react";

type Props = {
  designWidth: number;
  /** Optional hint for first paint before measure (reduces layout jump). */
  designHeight?: number;
  children: React.ReactNode;
};

/**
 * Scales fixed-width diagram content to the container width. Height follows
 * intrinsic content (no letterboxed aspect-ratio slot).
 */
export function DiagramFrame({ designWidth, designHeight = 480, children }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [scaledH, setScaledH] = useState<number | null>(null);

  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    const inner = innerRef.current;
    if (!wrap || !inner) return;

    const measure = () => {
      const w = wrap.clientWidth;
      if (w <= 0) return;
      const s = w / designWidth;
      setScale(s);
      const h = inner.offsetHeight;
      if (h > 0) {
        setScaledH(h * s);
      }
    };

    measure();
    const ro = new ResizeObserver(() => {
      requestAnimationFrame(measure);
    });
    ro.observe(wrap);
    ro.observe(inner);
    return () => ro.disconnect();
  }, [designWidth]);

  const fallbackH = designHeight * scale;

  return (
    <div
      ref={wrapRef}
      className="orient-diagram-frame w-full max-w-[1280px] min-w-0 overflow-hidden"
      style={{
        width: "100%",
        height: scaledH != null && scaledH > 0 ? scaledH : fallbackH,
      }}
    >
      <div
        ref={innerRef}
        style={{
          width: designWidth,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        {children}
      </div>
    </div>
  );
}
