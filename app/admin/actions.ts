"use server";

import { randomUUID } from "node:crypto";

import type { JSONContent } from "@tiptap/core";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { parseHomepagePin } from "@/lib/homepage/homepage-pin";
import type {
  FullDescriptionFields,
  SimpleContemplationFields,
  SiteTemplateId,
} from "@/lib/homepage/site-templates";
import {
  buildSiteTemplateDoc,
  normalizeSiteTemplateFields,
} from "@/lib/homepage/site-templates";
import { createServerSupabase } from "@/lib/supabase/server";
import { countTiptapImages } from "@/lib/tiptap/count-tiptap-images";
import { emptyDoc } from "@/lib/tiptap/empty-doc";

const UPLOAD_ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

function extForUpload(file: File): string {
  const name = file.name.toLowerCase();
  if (name.endsWith(".png")) return "png";
  if (name.endsWith(".jpg") || name.endsWith(".jpeg")) return "jpg";
  if (name.endsWith(".webp")) return "webp";
  if (name.endsWith(".gif")) return "gif";
  if (file.type === "image/jpeg") return "jpg";
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  if (file.type === "image/gif") return "gif";
  return "img";
}

function sanitizeUploadScope(raw: string): string {
  const s = raw.trim().replace(/[^a-zA-Z0-9/_-]+/g, "").replace(/^\/+|\/+$/g, "");
  return s.slice(0, 120) || "misc";
}

/** Upload an image for TipTap / cover (authenticated). Requires `editor-assets` bucket (see migrations). */
export async function uploadEditorImage(formData: FormData): Promise<
  { ok: true; publicUrl: string } | { ok: false; message: string }
> {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Not signed in." };

  const scope = sanitizeUploadScope(String(formData.get("scope") ?? ""));
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: "Choose an image file." };
  }
  if (file.size > 5 * 1024 * 1024) {
    return { ok: false, message: "Image must be 5MB or smaller." };
  }
  if (!UPLOAD_ALLOWED_TYPES.has(file.type)) {
    return { ok: false, message: "Use JPEG, PNG, WebP, or GIF." };
  }

  const ext = extForUpload(file);
  const path = `${scope}/${randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from("editor-assets").upload(path, file, {
    contentType: file.type,
    upsert: false,
  });

  if (error) return { ok: false, message: error.message };

  const {
    data: { publicUrl },
  } = supabase.storage.from("editor-assets").getPublicUrl(path);
  return { ok: true, publicUrl };
}

export async function saveSiteContent(key: string, content_json: JSONContent) {
  const supabase = await createServerSupabase();
  const payload = JSON.parse(JSON.stringify(content_json)) as JSONContent;

  const { data, error } = await supabase
    .from("site_content")
    .upsert(
      {
        key,
        title: null,
        content_json: payload,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "key" }
    )
    .select("content_json, updated_at")
    .single();

  if (error) return { ok: false as const, message: error.message };
  if (!data?.content_json || !data.updated_at) {
    return {
      ok: false as const,
      message: "Save did not return the updated row. Try again or refresh.",
    };
  }
  const stored = data.content_json as JSONContent;
  const inImages = countTiptapImages(payload);
  const outImages = countTiptapImages(stored);
  if (inImages > outImages) {
    return {
      ok: false as const,
      message: `Save lost ${inImages - outImages} image(s) in storage (sent ${inImages}, got ${outImages}). Copy your text, refresh the page, and try again; if it persists, check Supabase RLS and the site_content row.`,
    };
  }
  revalidatePath("/");
  revalidatePath("/admin");
  return {
    ok: true as const,
    content_json: stored,
    updated_at: data.updated_at as string,
  };
}

export async function saveNote(input: {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content_json: JSONContent;
  published: boolean;
}) {
  const supabase = await createServerSupabase();

  const { data: before } = await supabase
    .from("notes")
    .select("slug, published")
    .eq("id", input.id)
    .maybeSingle();

  const contentNormalized = JSON.parse(
    JSON.stringify(input.content_json)
  ) as JSONContent;

  const patch: Record<string, unknown> = {
    slug: input.slug.trim(),
    title: input.title.trim(),
    excerpt: input.excerpt?.trim() || null,
    content_json: contentNormalized,
    published: input.published,
  };

  if (input.published) {
    patch.published_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from("notes")
    .update(patch)
    .eq("id", input.id)
    .select("id, content_json, updated_at")
    .maybeSingle();

  if (error) return { ok: false as const, message: error.message };
  if (!data?.content_json || !data.updated_at) {
    return {
      ok: false as const,
      message:
        "Could not update this note (no matching row). Try refreshing the page or signing in again.",
    };
  }

  const stored = data.content_json as JSONContent;
  const inImages = countTiptapImages(contentNormalized);
  const outImages = countTiptapImages(stored);
  if (inImages > outImages) {
    return {
      ok: false as const,
      message: `Save lost ${inImages - outImages} image(s) in storage (sent ${inImages}, got ${outImages}). Refresh and try again; if it persists, check Supabase RLS on notes.`,
    };
  }

  const newSlug = input.slug.trim();
  const prevSlug = before?.slug?.trim() ?? "";

  const { data: pinRow } = await supabase
    .from("site_content")
    .select("content_json")
    .eq("key", HOMEPAGE_PIN_KEY)
    .maybeSingle();
  const pin = parseHomepagePin(pinRow?.content_json);

  if (pin.source === "note") {
    if (!input.published && pin.slug === prevSlug) {
      await upsertHomepagePinJson(supabase, { source: "week" });
      revalidatePath("/");
    } else if (pin.slug === prevSlug && newSlug !== prevSlug) {
      await upsertHomepagePinJson(supabase, {
        source: "note",
        slug: newSlug,
      });
      revalidatePath("/");
      revalidatePath(`/notes/${prevSlug}`);
    }
  }

  revalidatePath("/notes");
  revalidatePath("/admin");
  revalidatePath(`/notes/${newSlug}`);
  return {
    ok: true as const,
    content_json: stored,
    updated_at: data.updated_at as string,
  };
}

const HOMEPAGE_PIN_KEY = "homepage_pin";

async function upsertHomepagePinJson(
  supabase: Awaited<ReturnType<typeof createServerSupabase>>,
  contentJson: Record<string, unknown>
) {
  const { error } = await supabase.from("site_content").upsert(
    {
      key: HOMEPAGE_PIN_KEY,
      title: null,
      content_json: contentJson,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "key" }
  );
  return error?.message ?? null;
}

export async function setHomepagePinToNoteSlug(
  slug: string
): Promise<{ ok: true } | { ok: false; message: string }> {
  const trimmed = slug.trim();
  if (!trimmed) {
    return { ok: false as const, message: "Slug is empty." };
  }
  const supabase = await createServerSupabase();
  const { data: note, error: nErr } = await supabase
    .from("notes")
    .select("id")
    .eq("slug", trimmed)
    .eq("published", true)
    .maybeSingle();

  if (nErr) return { ok: false as const, message: nErr.message };
  if (!note) {
    return {
      ok: false as const,
      message:
        "No published note with that slug. Publish the note and save, then try again.",
    };
  }

  const msg = await upsertHomepagePinJson(supabase, {
    source: "note",
    slug: trimmed,
  });
  if (msg) return { ok: false as const, message: msg };

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/notes");
  revalidatePath(`/notes/${trimmed}`);
  return { ok: true as const };
}

export async function clearHomepagePinToWeek(): Promise<
  { ok: true } | { ok: false; message: string }
> {
  const supabase = await createServerSupabase();
  const msg = await upsertHomepagePinJson(supabase, { source: "week" });
  if (msg) return { ok: false as const, message: msg };

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/notes");
  return { ok: true as const };
}

/** Pin the public home to a built-in template (fill-in-the-blanks), replacing week/note. */
/** Create an unpublished note whose body matches the current template fields (TipTap). */
export async function createDraftNoteFromHomepageTemplate(input: {
  template: SiteTemplateId;
  fields: unknown;
}): Promise<
  { ok: true; id: string; slug: string } | { ok: false; message: string }
> {
  const supabase = await createServerSupabase();
  const normalized = normalizeSiteTemplateFields(input.template, input.fields);
  const doc = buildSiteTemplateDoc(input.template, normalized);
  const slug = `from-home-${randomUUID().slice(0, 8)}`;
  const hero =
    input.template === "simple_contemplation"
      ? (normalized as SimpleContemplationFields).heroQuestion
      : (normalized as FullDescriptionFields).heroQuestion;
  const title =
    hero.trim().replace(/\s+/g, " ").slice(0, 120) || "From homepage template";

  const payload = JSON.parse(JSON.stringify(doc)) as JSONContent;
  const { data, error } = await supabase
    .from("notes")
    .insert({
      slug,
      title,
      excerpt: null,
      content_json: payload,
      published: false,
    })
    .select("id, slug")
    .single();

  if (error) return { ok: false as const, message: error.message };
  if (!data?.id || !data.slug) {
    return {
      ok: false as const,
      message: "Insert did not return the new note. Try again.",
    };
  }
  revalidatePath("/admin");
  revalidatePath("/notes");
  return { ok: true as const, id: data.id, slug: data.slug };
}

export async function saveHomepageSiteTemplate(
  template: SiteTemplateId,
  fields: unknown
): Promise<{ ok: true } | { ok: false; message: string }> {
  const supabase = await createServerSupabase();
  const normalized = normalizeSiteTemplateFields(template, fields);
  const msg = await upsertHomepagePinJson(supabase, {
    source: "site_template",
    template,
    fields: normalized,
  });
  if (msg) return { ok: false as const, message: msg };

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/notes");
  return { ok: true as const };
}

export async function deleteNote(input: {
  id: string;
  slug: string;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("notes")
    .delete()
    .eq("id", input.id)
    .select("id")
    .maybeSingle();

  if (error) return { ok: false as const, message: error.message };
  if (!data) {
    return {
      ok: false as const,
      message: "Could not delete this note. Refresh and try again.",
    };
  }

  const { data: pinRow } = await supabase
    .from("site_content")
    .select("content_json")
    .eq("key", HOMEPAGE_PIN_KEY)
    .maybeSingle();
  const pin = parseHomepagePin(pinRow?.content_json);
  if (pin.source === "note" && pin.slug === input.slug.trim()) {
    await upsertHomepagePinJson(supabase, { source: "week" });
    revalidatePath("/");
  }

  revalidatePath("/notes");
  revalidatePath("/admin");
  revalidatePath(`/notes/${input.slug.trim()}`);
  return { ok: true as const };
}

function isoDateUtc(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export async function createWeek(): Promise<
  { ok: true; id: string } | { ok: false; message: string }
> {
  const supabase = await createServerSupabase();
  const slug = `week-${randomUUID().slice(0, 8)}`;
  const { data, error } = await supabase
    .from("weeks")
    .insert({
      slug,
      week_of: isoDateUtc(new Date()),
      theme_title: "New week",
      question: "Add a question for the archive list.",
      body_json: emptyDoc(),
    })
    .select("id")
    .single();

  if (error) return { ok: false, message: error.message };
  revalidatePath("/");
  revalidatePath("/notes");
  revalidatePath("/admin");
  return { ok: true, id: data.id };
}

export async function saveWeek(input: {
  id: string;
  slug: string;
  weekOf: string;
  themeTitle: string;
  question: string;
  bodyJson: JSONContent;
  previousSlug: string;
}): Promise<
  | { ok: true; body_json: JSONContent; updated_at: string }
  | { ok: false; message: string }
> {
  const supabase = await createServerSupabase();
  const bodyNormalized = JSON.parse(
    JSON.stringify(input.bodyJson)
  ) as JSONContent;

  const { data, error } = await supabase
    .from("weeks")
    .update({
      slug: input.slug.trim(),
      week_of: input.weekOf.trim(),
      theme_title: input.themeTitle.trim(),
      question: input.question.trim(),
      body_json: bodyNormalized,
    })
    .eq("id", input.id)
    .select("body_json, updated_at")
    .maybeSingle();

  if (error) return { ok: false as const, message: error.message };
  if (!data?.body_json || !data.updated_at) {
    return {
      ok: false as const,
      message: "Save did not return the updated row. Try again or refresh.",
    };
  }
  const stored = data.body_json as JSONContent;
  const inImages = countTiptapImages(bodyNormalized);
  const outImages = countTiptapImages(stored);
  if (inImages > outImages) {
    return {
      ok: false as const,
      message: `Save lost ${inImages - outImages} image(s). Refresh and try again.`,
    };
  }

  revalidatePath("/");
  revalidatePath("/notes");
  revalidatePath("/admin");
  revalidatePath(`/notes/${input.previousSlug.trim()}`);
  if (input.previousSlug.trim() !== input.slug.trim()) {
    revalidatePath(`/notes/${input.slug.trim()}`);
  }
  return {
    ok: true as const,
    body_json: stored,
    updated_at: data.updated_at as string,
  };
}

export async function deleteWeek(input: {
  id: string;
  slug: string;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("weeks")
    .delete()
    .eq("id", input.id)
    .select("id")
    .maybeSingle();

  if (error) return { ok: false as const, message: error.message };
  if (!data) {
    return {
      ok: false as const,
      message: "Could not delete this week. Refresh and try again.",
    };
  }

  revalidatePath("/");
  revalidatePath("/notes");
  revalidatePath("/admin");
  revalidatePath(`/notes/${input.slug.trim()}`);
  return { ok: true as const };
}

export async function createNote(): Promise<
  { ok: true; id: string } | { ok: false; message: string }
> {
  const supabase = await createServerSupabase();
  const slug = `draft-${randomUUID().slice(0, 8)}`;
  const { data, error } = await supabase
    .from("notes")
    .insert({
      slug,
      title: "Untitled",
      excerpt: null,
      content_json: emptyDoc(),
      published: false,
    })
    .select("id")
    .single();

  if (error) return { ok: false, message: error.message };
  revalidatePath("/admin");
  revalidatePath("/notes");
  return { ok: true, id: data.id };
}

export async function signOut() {
  const supabase = await createServerSupabase();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
