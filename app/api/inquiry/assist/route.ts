import { NextResponse, type NextRequest } from "next/server";

import { INQUIRY_LLM_SYSTEM_PROMPT } from "@/lib/inquiry/inquiry-llm-system-prompt";
import { inquiryLlmRuntimeConfig } from "@/lib/inquiry/inquiry-llm-config";

export const runtime = "nodejs";
export const maxDuration = 45;

const MAX_DRAFT = 2800;
const MAX_STEP_PROMPT = 2200;
const MAX_STEP_TITLE = 200;
const MAX_SUMMARY_LINE = 600;
const MAX_SUMMARIES = 24;

type Body = {
  stepTitle?: unknown;
  stepPrompt?: unknown;
  draft?: unknown;
  pastSummaries?: unknown;
};

function str(v: unknown, max: number): string {
  if (typeof v !== "string") return "";
  return v.slice(0, max).trim();
}

export async function POST(req: NextRequest) {
  const cfg = inquiryLlmRuntimeConfig();
  if (!cfg) {
    return NextResponse.json(
      { ok: false as const, error: "not_configured" },
      { status: 503 }
    );
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false as const, error: "invalid_json" }, { status: 400 });
  }

  const stepTitle = str(body.stepTitle, MAX_STEP_TITLE);
  const stepPrompt = str(body.stepPrompt, MAX_STEP_PROMPT);
  const draft = str(body.draft, MAX_DRAFT);
  const rawList = Array.isArray(body.pastSummaries) ? body.pastSummaries : [];
  const pastSummaries = rawList
    .filter((x): x is string => typeof x === "string")
    .map((s) => s.trim().slice(0, MAX_SUMMARY_LINE))
    .filter(Boolean)
    .slice(0, MAX_SUMMARIES);

  if (!stepPrompt) {
    return NextResponse.json({ ok: false as const, error: "missing_prompt" }, { status: 400 });
  }

  const userContent = [
    `Step title: ${stepTitle || "(untitled step)"}`,
    `Question: ${stepPrompt}`,
    `Their draft (may be short): ${draft || "(empty)"}`,
    pastSummaries.length
      ? `Earlier lines in “seen so far”:\n${pastSummaries.map((s, i) => `${i + 1}. ${s}`).join("\n")}`
      : "Earlier lines in “seen so far”: (none yet)",
    "Respond only with the paragraph for them to read — no title, no bullets, no markdown.",
  ].join("\n\n");

  const url = `${cfg.baseUrl}/chat/completions`;
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 38_000);

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cfg.apiKey}`,
      },
      body: JSON.stringify({
        model: cfg.model,
        temperature: 0.65,
        max_tokens: 380,
        messages: [
          { role: "system", content: INQUIRY_LLM_SYSTEM_PROMPT },
          { role: "user", content: userContent },
        ],
      }),
      signal: controller.signal,
    });
  } catch {
    clearTimeout(t);
    return NextResponse.json({ ok: false as const, error: "upstream_timeout" }, { status: 504 });
  } finally {
    clearTimeout(t);
  }

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    const short =
      errText.length > 280 ? `${errText.slice(0, 280)}…` : errText || res.statusText;
    return NextResponse.json(
      { ok: false as const, error: "upstream_error", detail: short },
      { status: 502 }
    );
  }

  let data: unknown;
  try {
    data = await res.json();
  } catch {
    return NextResponse.json({ ok: false as const, error: "bad_upstream_json" }, { status: 502 });
  }

  const o = data as Record<string, unknown>;
  const choice = Array.isArray(o.choices) ? (o.choices[0] as Record<string, unknown> | undefined) : undefined;
  const msg = choice?.message as Record<string, unknown> | undefined;
  const rawContent = msg?.content;
  let text = "";
  if (typeof rawContent === "string") {
    text = rawContent.trim();
  } else if (Array.isArray(rawContent)) {
    text = rawContent
      .map((part) =>
        typeof part === "object" && part && "text" in part
          ? String((part as { text?: unknown }).text ?? "")
          : ""
      )
      .join("")
      .trim();
  }
  if (!text) {
    return NextResponse.json({ ok: false as const, error: "empty_completion" }, { status: 502 });
  }

  return NextResponse.json({ ok: true as const, text: text.slice(0, 4000) });
}
