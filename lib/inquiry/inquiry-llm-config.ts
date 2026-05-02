/**
 * Optional LLM for /inquiry “gentle wording” assist.
 * OpenAI-compatible POST …/chat/completions (OpenAI, Moonshot / Kimi, Groq, etc.).
 *
 * Server-only env — never expose keys to the client.
 */
export function isInquiryLlmConfigured(): boolean {
  return Boolean(process.env.INQUIRY_LLM_API_KEY?.trim());
}

export function inquiryLlmRuntimeConfig(): {
  apiKey: string;
  baseUrl: string;
  model: string;
} | null {
  const apiKey = process.env.INQUIRY_LLM_API_KEY?.trim();
  if (!apiKey) return null;
  const baseUrl = (
    process.env.INQUIRY_LLM_BASE_URL?.trim() || "https://api.openai.com/v1"
  ).replace(/\/$/, "");
  const model = process.env.INQUIRY_LLM_MODEL?.trim() || "gpt-4o-mini";
  return { apiKey, baseUrl, model };
}
