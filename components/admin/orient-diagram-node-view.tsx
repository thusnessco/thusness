"use client";

import { createContext, useContext, useMemo } from "react";
import type { ReactNodeViewProps } from "@tiptap/react";
import { NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react";

import { defaultOrientInfographics } from "@/lib/orient-infographics/default-content";
import { applyOrientDiagramPatch } from "@/lib/orient-infographics/merge-orient-diagram-patch";
import type { OrientContent } from "@/lib/orient-infographics/types";
import {
  isOrientDiagramId,
  ThusnessOrientDiagram,
  thusnessOrientDiagramName,
  type OrientDiagramId,
} from "@/lib/tiptap/orient-diagram-embed";

import { adminFieldInput, adminFieldLabel } from "./admin-ui";

const OrientSiteContext = createContext<OrientContent | null>(null);

export function OrientDiagramSiteProvider({
  value,
  children,
}: {
  value: OrientContent | null;
  children: React.ReactNode;
}) {
  return (
    <OrientSiteContext.Provider value={value}>{children}</OrientSiteContext.Provider>
  );
}

function useOrientSite(): OrientContent {
  return useContext(OrientSiteContext) ?? defaultOrientInfographics();
}

function Row({
  label,
  value,
  onChange,
  multiline,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  disabled?: boolean;
}) {
  const c = `${adminFieldInput} w-full text-[12px]`;
  return (
    <label className="block space-y-0.5">
      <span className={adminFieldLabel}>{label}</span>
      {multiline ? (
        <textarea
          className={`${c} min-h-[52px] resize-y`}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          type="text"
          className={c}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </label>
  );
}

function OrientDiagramNodeViewInner(props: ReactNodeViewProps) {
  const site = useOrientSite();
  const diagramRaw = props.node.attrs.diagram;
  const diagram: OrientDiagramId = isOrientDiagramId(String(diagramRaw))
    ? diagramRaw
    : "stages";
  const patch =
    props.node.attrs.patch && typeof props.node.attrs.patch === "object" && !Array.isArray(props.node.attrs.patch)
      ? (props.node.attrs.patch as Record<string, unknown>)
      : null;

  const merged = useMemo(
    () => applyOrientDiagramPatch(site, diagram, patch),
    [site, diagram, patch]
  );

  const basePatch = () => (patch ? { ...patch } : {});

  const up = (next: Record<string, unknown> | null) => {
    props.updateAttributes({
      patch: next && Object.keys(next).length > 0 ? next : null,
    });
  };

  const mergeBg = (delta: Record<string, unknown>) => {
    const b = basePatch().background;
    const prev =
      b && typeof b === "object" && !Array.isArray(b)
        ? { ...(b as Record<string, unknown>) }
        : {};
    up({ ...basePatch(), background: { ...prev, ...delta } });
  };
  const mergeFelt = (delta: Record<string, unknown>) => {
    const b = basePatch().felt;
    const prev =
      b && typeof b === "object" && !Array.isArray(b)
        ? { ...(b as Record<string, unknown>) }
        : {};
    up({ ...basePatch(), felt: { ...prev, ...delta } });
  };
  const mergeTrapDelta = (delta: Record<string, unknown>) => {
    const b = basePatch().trap;
    const prev =
      b && typeof b === "object" && !Array.isArray(b)
        ? { ...(b as Record<string, unknown>) }
        : {};
    up({ ...basePatch(), trap: { ...prev, ...delta } });
  };
  const mergeViewDelta = (delta: Record<string, unknown>) => {
    const b = basePatch().view;
    const prev =
      b && typeof b === "object" && !Array.isArray(b)
        ? { ...(b as Record<string, unknown>) }
        : {};
    up({ ...basePatch(), view: { ...prev, ...delta } });
  };
  const mergeGiantPart = (
    key: "stages" | "movement" | "pillars" | "themes",
    delta: Record<string, unknown>
  ) => {
    const b = basePatch()[key];
    const prev =
      b && typeof b === "object" && !Array.isArray(b)
        ? { ...(b as Record<string, unknown>) }
        : {};
    up({ ...basePatch(), [key]: { ...prev, ...delta } });
  };

  return (
    <NodeViewWrapper
      as="figure"
      data-thusness-node={thusnessOrientDiagramName}
      data-thusness-orient-diagram={diagram}
      className="orient-diagram-node-view-inner my-4 max-h-[min(70vh,720px)] overflow-y-auto rounded border border-[var(--thusness-rule)] bg-[var(--thusness-bg)] p-3 shadow-sm"
    >
      <div className="mb-2 flex items-center justify-between gap-2 border-b border-[var(--thusness-rule)] pb-2">
        <span className="text-[10px] uppercase tracking-[0.18em] text-[var(--thusness-muted)]">
          Orient diagram · {diagram}
        </span>
        <button
          type="button"
          className="text-[10px] uppercase tracking-wide text-[var(--thusness-muted)] underline decoration-[var(--thusness-rule)] underline-offset-2 hover:opacity-80"
          onClick={() => props.deleteNode()}
        >
          Remove block
        </button>
      </div>
      <p className="mb-3 text-[10px] leading-snug text-[var(--thusness-muted)]">
        Overrides copy for this placement only. Empty fields fall back to{" "}
        <span className="italic">Orient graphics</span> defaults.
      </p>

      {diagram === "stages" ? (
        <div className="grid gap-2">
          <Row
            label="Kicker"
            value={merged.stages.kicker}
            disabled={!props.editor.isEditable}
            onChange={(v) => up({ ...basePatch(), kicker: v })}
          />
          <Row
            label="Title"
            value={merged.stages.title}
            disabled={!props.editor.isEditable}
            onChange={(v) => up({ ...basePatch(), title: v })}
          />
          <Row
            label="Sub"
            value={merged.stages.sub}
            multiline
            disabled={!props.editor.isEditable}
            onChange={(v) => up({ ...basePatch(), sub: v })}
          />
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded bg-[color-mix(in_srgb,var(--thusness-rule)_12%,transparent)] p-2">
              <p className="mb-1 text-[9px] uppercase text-[var(--thusness-muted)]">Stage {i + 1}</p>
              <div className="grid gap-1.5 sm:grid-cols-3">
                <Row
                  label="Scope"
                  value={merged.stages.items[i]?.scope ?? ""}
                  disabled={!props.editor.isEditable}
                  onChange={(v) => {
                    const items = merged.stages.items.map((it, j) =>
                      j === i ? { ...it, scope: v } : it
                    );
                    up({ ...basePatch(), items });
                  }}
                />
                <Row
                  label="Name"
                  value={merged.stages.items[i]?.name ?? ""}
                  disabled={!props.editor.isEditable}
                  onChange={(v) => {
                    const items = merged.stages.items.map((it, j) =>
                      j === i ? { ...it, name: v } : it
                    );
                    up({ ...basePatch(), items });
                  }}
                />
                <Row
                  label="Gloss"
                  value={merged.stages.items[i]?.gloss ?? ""}
                  multiline
                  disabled={!props.editor.isEditable}
                  onChange={(v) => {
                    const items = merged.stages.items.map((it, j) =>
                      j === i ? { ...it, gloss: v } : it
                    );
                    up({ ...basePatch(), items });
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {diagram === "recognition" ? (
        <div className="grid gap-2">
          <Row label="Kicker" value={merged.recognition.kicker} disabled={!props.editor.isEditable} onChange={(v) => up({ ...basePatch(), kicker: v })} />
          <Row label="Title" value={merged.recognition.title} disabled={!props.editor.isEditable} onChange={(v) => up({ ...basePatch(), title: v })} />
          <Row label="Sub" value={merged.recognition.sub} multiline disabled={!props.editor.isEditable} onChange={(v) => up({ ...basePatch(), sub: v })} />
          <Row
            label="Background title"
            value={merged.recognition.background.title}
            disabled={!props.editor.isEditable}
            onChange={(v) => mergeBg({ title: v })}
          />
          {[0, 1, 2, 3].map((i) => (
            <Row
              key={`bg-${i}`}
              label={`Background point ${i + 1}`}
              value={merged.recognition.background.points[i] ?? ""}
              multiline
              disabled={!props.editor.isEditable}
              onChange={(v) => {
                const points = [...merged.recognition.background.points];
                points[i] = v;
                mergeBg({ points });
              }}
            />
          ))}
          <Row
            label="Felt title"
            value={merged.recognition.felt.title}
            disabled={!props.editor.isEditable}
            onChange={(v) => mergeFelt({ title: v })}
          />
          {[0, 1, 2, 3].map((i) => (
            <Row
              key={`ft-${i}`}
              label={`Felt point ${i + 1}`}
              value={merged.recognition.felt.points[i] ?? ""}
              multiline
              disabled={!props.editor.isEditable}
              onChange={(v) => {
                const points = [...merged.recognition.felt.points];
                points[i] = v;
                mergeFelt({ points });
              }}
            />
          ))}
          <Row label="Trap line" value={merged.recognition.trap} multiline disabled={!props.editor.isEditable} onChange={(v) => up({ ...basePatch(), trap: v })} />
        </div>
      ) : null}

      {diagram === "pillars" ? (
        <div className="grid gap-2">
          <Row label="Kicker" value={merged.pillars.kicker} disabled={!props.editor.isEditable} onChange={(v) => up({ ...basePatch(), kicker: v })} />
          <Row label="Title" value={merged.pillars.title} disabled={!props.editor.isEditable} onChange={(v) => up({ ...basePatch(), title: v })} />
          <Row label="Sub" value={merged.pillars.sub} multiline disabled={!props.editor.isEditable} onChange={(v) => up({ ...basePatch(), sub: v })} />
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded p-2 ring-1 ring-[var(--thusness-rule)]">
              <p className="mb-1 text-[9px] uppercase text-[var(--thusness-muted)]">Pillar {i + 1}</p>
              <div className="grid gap-1.5">
                <Row label="Name" value={merged.pillars.items[i]?.name ?? ""} disabled={!props.editor.isEditable} onChange={(v) => {
                  const items = merged.pillars.items.map((it, j) => (j === i ? { ...it, name: v } : it));
                  up({ ...basePatch(), items });
                }} />
                <Row label="Sub" value={merged.pillars.items[i]?.sub ?? ""} disabled={!props.editor.isEditable} onChange={(v) => {
                  const items = merged.pillars.items.map((it, j) => (j === i ? { ...it, sub: v } : it));
                  up({ ...basePatch(), items });
                }} />
                <Row label="Gloss" value={merged.pillars.items[i]?.gloss ?? ""} multiline disabled={!props.editor.isEditable} onChange={(v) => {
                  const items = merged.pillars.items.map((it, j) => (j === i ? { ...it, gloss: v } : it));
                  up({ ...basePatch(), items });
                }} />
              </div>
            </div>
          ))}
          <Row label="Footer" value={merged.pillars.footer} multiline disabled={!props.editor.isEditable} onChange={(v) => up({ ...basePatch(), footer: v })} />
        </div>
      ) : null}

      {diagram === "movement" ? (
        <div className="grid gap-2">
          <Row label="Kicker" value={merged.movement.kicker} disabled={!props.editor.isEditable} onChange={(v) => up({ ...basePatch(), kicker: v })} />
          <Row label="Title" value={merged.movement.title} disabled={!props.editor.isEditable} onChange={(v) => up({ ...basePatch(), title: v })} />
          <Row label="Sub" value={merged.movement.sub} multiline disabled={!props.editor.isEditable} onChange={(v) => up({ ...basePatch(), sub: v })} />
          {[0, 1, 2].map((i) => (
            <div key={i} className="grid gap-1.5 sm:grid-cols-2">
              <Row label={`Phase ${i + 1} name`} value={merged.movement.items[i]?.name ?? ""} disabled={!props.editor.isEditable} onChange={(v) => {
                const items = merged.movement.items.map((it, j) => (j === i ? { ...it, name: v } : it));
                up({ ...basePatch(), items });
              }} />
              <Row label={`Phase ${i + 1} gloss`} value={merged.movement.items[i]?.gloss ?? ""} multiline disabled={!props.editor.isEditable} onChange={(v) => {
                const items = merged.movement.items.map((it, j) => (j === i ? { ...it, gloss: v } : it));
                up({ ...basePatch(), items });
              }} />
            </div>
          ))}
          <Row label="Footer" value={merged.movement.footer} multiline disabled={!props.editor.isEditable} onChange={(v) => up({ ...basePatch(), footer: v })} />
        </div>
      ) : null}

      {diagram === "themes" ? (
        <div className="grid gap-2">
          <Row label="Kicker" value={merged.themes.kicker} disabled={!props.editor.isEditable} onChange={(v) => up({ ...basePatch(), kicker: v })} />
          <Row label="Title" value={merged.themes.title} disabled={!props.editor.isEditable} onChange={(v) => up({ ...basePatch(), title: v })} />
          <Row label="Sub" value={merged.themes.sub} multiline disabled={!props.editor.isEditable} onChange={(v) => up({ ...basePatch(), sub: v })} />
          <label className="block space-y-0.5">
            <span className={adminFieldLabel}>List (one per line, max 8)</span>
            <textarea
              className={`${adminFieldInput} min-h-[100px] w-full resize-y text-[12px]`}
              disabled={!props.editor.isEditable}
              value={merged.themes.list.join("\n")}
              onChange={(e) => {
                const list = e.target.value
                  .split("\n")
                  .map((s) => s.trim())
                  .filter(Boolean)
                  .slice(0, 8);
                up({ ...basePatch(), list });
              }}
            />
          </label>
          <Row label="Footer" value={merged.themes.footer} multiline disabled={!props.editor.isEditable} onChange={(v) => up({ ...basePatch(), footer: v })} />
        </div>
      ) : null}

      {diagram === "nihilism" ? (
        <div className="grid gap-2">
          <Row label="Kicker" value={merged.nihilism.kicker} disabled={!props.editor.isEditable} onChange={(v) => up({ ...basePatch(), kicker: v })} />
          <Row label="Title" value={merged.nihilism.title} disabled={!props.editor.isEditable} onChange={(v) => up({ ...basePatch(), title: v })} />
          <Row label="Sub" value={merged.nihilism.sub} multiline disabled={!props.editor.isEditable} onChange={(v) => up({ ...basePatch(), sub: v })} />
          <p className="text-[9px] uppercase text-[var(--thusness-muted)]">Trap</p>
          <Row label="Name" value={merged.nihilism.trap.name} disabled={!props.editor.isEditable} onChange={(v) => mergeTrapDelta({ name: v })} />
          <Row label="Quote" value={merged.nihilism.trap.quote} multiline disabled={!props.editor.isEditable} onChange={(v) => mergeTrapDelta({ quote: v })} />
          <Row label="Body" value={merged.nihilism.trap.body} multiline disabled={!props.editor.isEditable} onChange={(v) => mergeTrapDelta({ body: v })} />
          <p className="text-[9px] uppercase text-[var(--thusness-muted)]">View</p>
          <Row label="Name" value={merged.nihilism.view.name} disabled={!props.editor.isEditable} onChange={(v) => mergeViewDelta({ name: v })} />
          <Row label="Quote" value={merged.nihilism.view.quote} multiline disabled={!props.editor.isEditable} onChange={(v) => mergeViewDelta({ quote: v })} />
          <Row label="Body" value={merged.nihilism.view.body} multiline disabled={!props.editor.isEditable} onChange={(v) => mergeViewDelta({ body: v })} />
          <Row label="Footer" value={merged.nihilism.footer} multiline disabled={!props.editor.isEditable} onChange={(v) => up({ ...basePatch(), footer: v })} />
        </div>
      ) : null}

      {diagram === "giant" ? (
        <div className="grid gap-2">
          <p className="text-[10px] text-[var(--thusness-muted)]">
            Hero text below; optional overrides for labels used inside the map.
          </p>
          <Row label="Kicker" value={merged.giant.kicker} disabled={!props.editor.isEditable} onChange={(v) => up({ ...basePatch(), kicker: v })} />
          <Row label="Title" value={merged.giant.title} disabled={!props.editor.isEditable} onChange={(v) => up({ ...basePatch(), title: v })} />
          <Row label="Sub" value={merged.giant.sub} multiline disabled={!props.editor.isEditable} onChange={(v) => up({ ...basePatch(), sub: v })} />
          <Row label="Transition" value={merged.giant.transition} disabled={!props.editor.isEditable} onChange={(v) => up({ ...basePatch(), transition: v })} />
          <Row label="Tagline" value={merged.giant.tagline} multiline disabled={!props.editor.isEditable} onChange={(v) => up({ ...basePatch(), tagline: v })} />
          <Row label="Footer" value={merged.giant.footer} multiline disabled={!props.editor.isEditable} onChange={(v) => up({ ...basePatch(), footer: v })} />
          <p className="mt-2 text-[9px] uppercase text-[var(--thusness-muted)]">Spine names (stages)</p>
          {[0, 1, 2].map((i) => (
            <Row
              key={`g-st-${i}`}
              label={`Stage ${i + 1} name`}
              value={merged.stages.items[i]?.name ?? ""}
              disabled={!props.editor.isEditable}
              onChange={(v) => {
                const items = merged.stages.items.map((it, j) =>
                  j === i ? { ...it, name: v } : it
                );
                mergeGiantPart("stages", { items });
              }}
            />
          ))}
          <p className="mt-2 text-[9px] uppercase text-[var(--thusness-muted)]">Movement labels</p>
          {[0, 1, 2].map((i) => (
            <Row
              key={`g-mv-${i}`}
              label={`Movement ${i + 1}`}
              value={merged.movement.items[i]?.name ?? ""}
              disabled={!props.editor.isEditable}
              onChange={(v) => {
                const items = merged.movement.items.map((it, j) =>
                  j === i ? { ...it, name: v } : it
                );
                mergeGiantPart("movement", { items });
              }}
            />
          ))}
          <p className="mt-2 text-[9px] uppercase text-[var(--thusness-muted)]">Pillar names</p>
          {[0, 1, 2].map((i) => (
            <Row
              key={`g-pl-${i}`}
              label={`Pillar ${i + 1}`}
              value={merged.pillars.items[i]?.name ?? ""}
              disabled={!props.editor.isEditable}
              onChange={(v) => {
                const items = merged.pillars.items.map((it, j) =>
                  j === i ? { ...it, name: v } : it
                );
                mergeGiantPart("pillars", { items });
              }}
            />
          ))}
          <label className="mt-2 block space-y-0.5">
            <span className={adminFieldLabel}>Theme labels (one per line, max 8)</span>
            <textarea
              className={`${adminFieldInput} min-h-[72px] w-full resize-y text-[12px]`}
              disabled={!props.editor.isEditable}
              value={merged.themes.list.join("\n")}
              onChange={(e) => {
                const list = e.target.value
                  .split("\n")
                  .map((s) => s.trim())
                  .filter(Boolean)
                  .slice(0, 8);
                mergeGiantPart("themes", { list });
              }}
            />
          </label>
        </div>
      ) : null}
    </NodeViewWrapper>
  );
}

export function orientDiagramWithReactNodeView() {
  return ThusnessOrientDiagram.extend({
    addNodeView() {
      return ReactNodeViewRenderer(OrientDiagramNodeViewInner, {
        as: "figure",
        className: "tiptap-thusness-orient-diagram orient-diagram-embed-slot",
      });
    },
  });
}
