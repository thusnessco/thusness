import type { OrientContent } from "@/lib/orient-infographics/types";
import type { OrientDiagramId } from "@/lib/tiptap/orient-diagram-embed";

/** Kicker / title / sub for a diagram sheet (prototype `OSheet` hero), excluding giant. */
export function infographicHeadForDiagram(
  diagram: OrientDiagramId,
  content: OrientContent
): { kicker: string; title: string; sub: string } | null {
  if (diagram === "giant") return null;
  switch (diagram) {
    case "stages":
      return {
        kicker: content.stages.kicker,
        title: content.stages.title,
        sub: content.stages.sub,
      };
    case "recognition":
      return {
        kicker: content.recognition.kicker,
        title: content.recognition.title,
        sub: content.recognition.sub,
      };
    case "pillars":
      return {
        kicker: content.pillars.kicker,
        title: content.pillars.title,
        sub: content.pillars.sub,
      };
    case "movement":
      return {
        kicker: content.movement.kicker,
        title: content.movement.title,
        sub: content.movement.sub,
      };
    case "themes":
      return {
        kicker: content.themes.kicker,
        title: content.themes.title,
        sub: content.themes.sub,
      };
    case "nihilism":
      return {
        kicker: content.nihilism.kicker,
        title: content.nihilism.title,
        sub: content.nihilism.sub,
      };
    default:
      return null;
  }
}
