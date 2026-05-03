import RedDot from "@/components/thusness/RedDot";

/** Hairline + lineage label + red dot — matches prototype `OrientSheet` footer below diagram art. */
export function OrientDiagramSheetFooter({
  label = "thusness.co",
}: {
  label?: string;
}) {
  return (
    <div className="orient-diagram-sheet-footer">
      <span className="orient-diagram-sheet-footer-label">{label}</span>
      <RedDot size={11} />
    </div>
  );
}
