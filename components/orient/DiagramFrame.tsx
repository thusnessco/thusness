"use client";

import { useLayoutEffect, useRef, useState } from "react";

type Props = {
  designWidth: number;
  designHeight: number;
  children: React.ReactNode;
};

/** Scales fixed-layout diagram SVG/HTML to the container width (no reflow). */
export function DiagramFrame({
  designWidth,
  designHeight,
  children,
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const measure = () => {
      const w = el.clientWidth;
      if (w <= 0) return;
      setScale(w / designWidth);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [designWidth]);

  const ar = `${designWidth} / ${designHeight}`;

  return (
    <div
      ref={wrapRef}
      className="orient-diagram-frame w-full max-w-[1280px] overflow-hidden"
      style={{ aspectRatio: ar }}
    >
      <div
        style={{
          width: designWidth,
          height: designHeight,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        {children}
      </div>
    </div>
  );
}
