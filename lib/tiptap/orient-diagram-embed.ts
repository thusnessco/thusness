import { mergeAttributes, Node } from "@tiptap/core";
import type { JSONContent } from "@tiptap/core";

export const thusnessOrientDiagramName = "thusnessOrientDiagram" as const;

export const ORIENT_DIAGRAM_IDS = [
  "giant",
  "stages",
  "recognition",
  "pillars",
  "movement",
  "themes",
  "nihilism",
] as const;

export type OrientDiagramId = (typeof ORIENT_DIAGRAM_IDS)[number];

export function isOrientDiagramId(s: string): s is OrientDiagramId {
  return (ORIENT_DIAGRAM_IDS as readonly string[]).includes(s);
}

export const ORIENT_DIAGRAM_CHOICES: { id: OrientDiagramId; label: string }[] = [
  { id: "giant", label: "Giant master map" },
  { id: "stages", label: "Stages of peace" },
  { id: "recognition", label: "Recognition" },
  { id: "pillars", label: "Pillars of success" },
  { id: "movement", label: "Movement & progression" },
  { id: "themes", label: "Themes" },
  { id: "nihilism", label: "Nihilism / dependent view" },
];

function coerceDiagram(raw: unknown): OrientDiagramId {
  return typeof raw === "string" && isOrientDiagramId(raw) ? raw : "stages";
}

/** Insertable fragment for the orientation note body. */
export function makeOrientDiagramFragment(id: OrientDiagramId): JSONContent {
  return {
    type: thusnessOrientDiagramName,
    attrs: { diagram: id },
  };
}

/** Whether the doc contains at least one embedded Orient diagram block. */
export function docHasOrientDiagramEmbeds(doc: JSONContent | null | undefined): boolean {
  if (!doc || doc.type !== "doc" || !Array.isArray(doc.content)) return false;
  return walkDocContent(doc.content);
}

function walkDocContent(nodes: JSONContent[]): boolean {
  for (const n of nodes) {
    if (n.type === thusnessOrientDiagramName) return true;
    if (Array.isArray(n.content) && walkDocContent(n.content)) return true;
  }
  return false;
}

export const ThusnessOrientDiagram = Node.create({
  name: thusnessOrientDiagramName,
  group: "block",
  atom: true,
  selectable: true,
  draggable: true,
  addAttributes() {
    return {
      diagram: {
        default: "stages",
        parseHTML: (element) => {
          const v = element.getAttribute("data-thusness-orient-diagram");
          return coerceDiagram(v);
        },
        renderHTML: (attrs) => ({
          "data-thusness-orient-diagram": coerceDiagram(attrs.diagram),
        }),
      },
    };
  },
  parseHTML() {
    return [
      {
        tag: `figure[data-thusness-node="${thusnessOrientDiagramName}"]`,
      },
      {
        tag: "figure[data-thusness-orient-diagram]",
        getAttrs: (el) => ({
          diagram: coerceDiagram((el as HTMLElement).getAttribute("data-thusness-orient-diagram")),
        }),
      },
    ];
  },
  renderHTML({ HTMLAttributes, node }) {
    const diagram = coerceDiagram(node.attrs.diagram);
    return [
      "figure",
      mergeAttributes(HTMLAttributes, {
        "data-thusness-node": thusnessOrientDiagramName,
        "data-thusness-orient-diagram": diagram,
        class: "orient-diagram-embed-slot tiptap-thusness-orient-diagram",
      }),
    ];
  },
});
