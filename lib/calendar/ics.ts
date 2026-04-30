/** Minimal iCalendar VEVENT (RFC 5545) for one-off downloads. */

function icsEscapeText(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,");
}

function utcStamp(isoUtc: string): string | null {
  const d = new Date(isoUtc);
  if (Number.isNaN(d.getTime())) return null;
  const y = d.getUTCFullYear();
  const mo = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  const h = String(d.getUTCHours()).padStart(2, "0");
  const mi = String(d.getUTCMinutes()).padStart(2, "0");
  const s = String(d.getUTCSeconds()).padStart(2, "0");
  return `${y}${mo}${day}T${h}${mi}${s}Z`;
}

function formatUtcProperty(isoUtc: string, prop: "DTSTART" | "DTEND"): string | null {
  const z = utcStamp(isoUtc);
  if (!z) return null;
  return `${prop}:${z}`;
}

function icsUid(): string {
  try {
    const c = globalThis.crypto;
    if (c?.randomUUID) return c.randomUUID();
  } catch {
    /* ignore */
  }
  return `thus-${Date.now()}-${Math.random().toString(36).slice(2, 11)}@thusness.co`;
}

export function buildVcalendarForSession(input: {
  dtStartUtc: string;
  dtEndUtc: string;
  summary: string;
  location?: string | null;
  description?: string | null;
}): string | null {
  const start = formatUtcProperty(input.dtStartUtc, "DTSTART");
  const end = formatUtcProperty(input.dtEndUtc, "DTEND");
  if (!start || !end) return null;
  const ds = new Date(input.dtStartUtc);
  const de = new Date(input.dtEndUtc);
  if (Number.isNaN(ds.getTime()) || Number.isNaN(de.getTime()) || de.getTime() <= ds.getTime()) {
    return null;
  }

  const uid = icsUid();
  const stampZ = utcStamp(new Date().toISOString());
  if (!stampZ) return null;

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Thusness//Session card//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${stampZ}`,
    start,
    end,
    `SUMMARY:${icsEscapeText(input.summary.trim().slice(0, 200) || "Thusness session")}`,
  ];
  const loc = input.location?.trim();
  if (loc) lines.push(`LOCATION:${icsEscapeText(loc.slice(0, 500))}`);
  const desc = input.description?.trim();
  if (desc) lines.push(`DESCRIPTION:${icsEscapeText(desc.slice(0, 2000))}`);
  lines.push("END:VEVENT", "END:VCALENDAR");
  return lines.join("\r\n") + "\r\n";
}

export function buildSessionCardIcsDataHref(input: {
  icsStart: string;
  icsEnd: string;
  icsLocation: string | null;
  summary: string;
}): { href: string; filename: string } | null {
  const body = buildVcalendarForSession({
    dtStartUtc: input.icsStart,
    dtEndUtc: input.icsEnd,
    summary: input.summary,
    location: input.icsLocation,
  });
  if (!body) return null;
  const href = `data:text/calendar;charset=utf-8,${encodeURIComponent(body)}`;
  const filename = `thusness-${Date.now().toString(36)}.ics`;
  return { href, filename };
}
