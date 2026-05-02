import {
  defaultInquiryContent,
  parseInquiryContent,
  INQUIRY_SITE_KEY,
  type InquiryContent,
} from "@/lib/inquiry/inquiry-content";
import { createPublicSupabase } from "@/lib/supabase/public-server";

export type InquiryConfigBundle = {
  content: InquiryContent;
  updatedAt: string | null;
};

export async function getInquiryConfigBundle(): Promise<InquiryConfigBundle> {
  const fallback: InquiryConfigBundle = {
    content: defaultInquiryContent(),
    updatedAt: null,
  };
  try {
    const supabase = createPublicSupabase();
    if (!supabase) return fallback;

    const { data, error } = await supabase
      .from("site_content")
      .select("content_json, updated_at")
      .eq("key", INQUIRY_SITE_KEY)
      .maybeSingle();

    if (error || !data?.content_json) return fallback;

    const parsed = parseInquiryContent(data.content_json);
    return {
      content: parsed ?? defaultInquiryContent(),
      updatedAt: (data.updated_at as string | null) ?? null,
    };
  } catch {
    return fallback;
  }
}
