"use client";

import type { OrientContent } from "@/lib/orient-infographics/types";

import { DiagramFrame } from "./DiagramFrame";
import { OrientSheet } from "./Sheet";

const W = 1280;
const H = 900;

type Props = { content: OrientContent["nihilism"]; dateline?: string };

export function NihilismDiagram({
  content,
  dateline = "Orient · 07 of 07",
}: Props) {
  const { kicker, title, sub, trap, view, footer } = content;
  return (
    <DiagramFrame designWidth={W} designHeight={H}>
      <OrientSheet
        boardWidth={W}
        boardHeight={H}
        kicker={kicker}
        title={title}
        sub={sub}
        dateline={dateline}
      >
        <div className="mx-auto grid max-w-[1040px] grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="border border-[var(--thusness-rule)] px-6 py-5">
            <p className="text-[13px] font-medium text-[var(--thusness-ink)]">
              {trap.name}
            </p>
            <p className="mt-2 text-[12px] italic leading-relaxed text-[var(--thusness-ink-soft)]">
              “{trap.quote}”
            </p>
            <p className="mt-3 text-[11px] leading-relaxed text-[var(--thusness-muted)]">
              {trap.body}
            </p>
          </div>
          <div className="border border-[var(--thusness-rule)] px-6 py-5">
            <p className="text-[13px] font-medium text-[var(--thusness-ink)]">
              {view.name}
            </p>
            <p className="mt-2 text-[12px] italic leading-relaxed text-[var(--thusness-ink-soft)]">
              “{view.quote}”
            </p>
            <p className="mt-3 text-[11px] leading-relaxed text-[var(--thusness-muted)]">
              {view.body}
            </p>
          </div>
        </div>
        <p className="mx-auto mt-8 max-w-[560px] whitespace-pre-line text-center text-[11px] italic text-[var(--thusness-muted)]">
          {footer}
        </p>
      </OrientSheet>
    </DiagramFrame>
  );
}
