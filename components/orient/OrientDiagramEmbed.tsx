"use client";

import type { OrientContent } from "@/lib/orient-infographics/types";
import type { OrientDiagramId } from "@/lib/tiptap/orient-diagram-embed";

import { GiantMaster } from "./GiantMaster";
import { MovementDiagram } from "./MovementDiagram";
import { NihilismDiagram } from "./NihilismDiagram";
import { PillarsDiagram } from "./PillarsDiagram";
import { RecognitionDiagram } from "./RecognitionDiagram";
import { StagesOfPeace } from "./StagesOfPeace";
import { ThemesDiagram } from "./ThemesDiagram";

export function OrientDiagramEmbed({
  diagram,
  content,
}: {
  diagram: OrientDiagramId;
  content: OrientContent;
}) {
  switch (diagram) {
    case "giant":
      return <GiantMaster content={content} />;
    case "stages":
      return <StagesOfPeace content={content.stages} />;
    case "recognition":
      return <RecognitionDiagram content={content.recognition} />;
    case "pillars":
      return <PillarsDiagram content={content.pillars} />;
    case "movement":
      return <MovementDiagram content={content.movement} />;
    case "themes":
      return <ThemesDiagram content={content.themes} />;
    case "nihilism":
      return <NihilismDiagram content={content.nihilism} />;
    default:
      return null;
  }
}
