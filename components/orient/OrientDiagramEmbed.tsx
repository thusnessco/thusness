"use client";

import { applyOrientDiagramPatch } from "@/lib/orient-infographics/merge-orient-diagram-patch";
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
  patch,
}: {
  diagram: OrientDiagramId;
  content: OrientContent;
  /** Optional per-embed overrides from the orientation note (TipTap `patch` attr). */
  patch?: Record<string, unknown> | null;
}) {
  const merged = applyOrientDiagramPatch(content, diagram, patch ?? null);
  switch (diagram) {
    case "giant":
      return <GiantMaster content={merged} />;
    case "pillars":
      return <PillarsDiagram content={merged.pillars} />;
    case "stages":
      return <StagesOfPeace content={merged.stages} />;
    case "recognition":
      return <RecognitionDiagram content={merged.recognition} />;
    case "movement":
      return <MovementDiagram content={merged.movement} />;
    case "themes":
      return <ThemesDiagram content={merged.themes} />;
    case "nihilism":
      return <NihilismDiagram content={merged.nihilism} />;
    default:
      return null;
  }
}
