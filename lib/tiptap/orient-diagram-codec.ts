/** Base64 JSON for `data-thusness-orient-patch` (SSR-safe). */

export function encodeOrientPatch(patch: unknown): string {
  const json = JSON.stringify(patch ?? {});
  if (typeof Buffer !== "undefined") {
    return Buffer.from(json, "utf8").toString("base64");
  }
  return btoa(unescape(encodeURIComponent(json)));
}

export function decodeOrientPatch(raw: string | null): Record<string, unknown> | null {
  if (!raw?.trim()) return null;
  try {
    const json =
      typeof Buffer !== "undefined"
        ? Buffer.from(raw, "base64").toString("utf8")
        : decodeURIComponent(escape(atob(raw)));
    const p = JSON.parse(json) as unknown;
    if (!p || typeof p !== "object" || Array.isArray(p)) return null;
    return p as Record<string, unknown>;
  } catch {
    return null;
  }
}
