"use client";

import type { OrientContent } from "@/lib/orient-infographics/types";

import { GiantMaster } from "./GiantMaster";
import { MovementDiagram } from "./MovementDiagram";
import { NihilismDiagram } from "./NihilismDiagram";
import { PillarsDiagram } from "./PillarsDiagram";
import { RecognitionDiagram } from "./RecognitionDiagram";
import { StagesOfPeace } from "./StagesOfPeace";
import { ThemesDiagram } from "./ThemesDiagram";

type Props = { content: OrientContent };

/**
 * Full suite of Orient diagrams. Pass `content` from `getOrientInfographicsBundle()`
 * on any route; edit copy in Admin → Orient infographics.
 */
export function OrientDiagramsSection({ content }: Props) {
  return (
    <section
      className="orient-diagrams-root border-t border-[var(--thusness-rule)] bg-[var(--thusness-bg)] px-4 py-16 sm:px-8"
      aria-label="Orient diagrams"
    >
      <div className="mx-auto flex max-w-[1280px] flex-col gap-20">
        <GiantMaster content={content} />
        <PillarsDiagram content={content.pillars} />
        <StagesOfPeace content={content.stages} />
        <RecognitionDiagram content={content.recognition} />
        <MovementDiagram content={content.movement} />
        <ThemesDiagram content={content.themes} />
        <NihilismDiagram content={content.nihilism} />
      </div>
    </section>
  );
}
