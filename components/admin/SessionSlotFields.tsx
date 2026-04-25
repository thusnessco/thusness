import type { SessionSlotFields } from "@/lib/homepage/site-templates";

import { adminFieldInput, adminFieldLabel } from "./admin-ui";

export function SessionSlotFieldsEditor({
  label,
  value,
  onChange,
}: {
  label: string;
  value: SessionSlotFields;
  onChange: (next: SessionSlotFields) => void;
}) {
  const row = (k: keyof SessionSlotFields, sub: string) => (
    <label key={k} className="block space-y-1">
      <span className={adminFieldLabel}>{sub}</span>
      <input
        className={adminFieldInput}
        value={value[k]}
        onChange={(e) => onChange({ ...value, [k]: e.target.value })}
      />
    </label>
  );
  return (
    <fieldset className="space-y-2 border border-[var(--thusness-rule)] px-3 py-3">
      <legend className={`px-1 ${adminFieldLabel}`}>{label}</legend>
      <div className="grid gap-2 sm:grid-cols-2">
        {row("kicker", "Kicker")}
        {row("day", "Day")}
        {row("time", "Time")}
        {row("zone", "Zone")}
      </div>
    </fieldset>
  );
}
