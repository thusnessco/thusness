"use server";

import { randomUUID } from "node:crypto";

import type { JSONContent } from "@tiptap/core";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  defaultHomepagePin,
  parseHomepagePin,
} from "@/lib/homepage/homepage-pin";
import type {
  FullDescriptionFields,
  SimpleContemplationFields,
  SiteTemplateId,
} from "@/lib/homepage/site-templates";
import {
  buildSiteTemplateDoc,
  normalizeSiteTemplateFields,
} from "@/lib/homepage/site-templates";
import type { NoteCategory } from "@/lib/notes/category";
import { createServerSupabase } from "@/lib/supabase/server";
import type { NoteRow } from "@/lib/supabase/public-server";
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

/** PostgREST when a migration added a column the remote DB does not have yet. */
function noteUpdateMissingOptionalColumn(
  err: { message?: string } | null,
  column: string
): boolean {
  const m = (err?.message ?? "").toLowerCase();
  const c = column.toLowerCase();
  if (!m.includes(c)) return false;
  return (
    m.includes("does not exist") ||
    m.includes("schema cache") ||
    m.includes("unknown column")
  );
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
  show_background_circle: boolean;
  is_template: boolean;
  category: NoteCategory | null;
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
    show_background_circle: input.show_background_circle,
    is_template: input.is_template,
    category: input.category,
  };

  if (input.published) {
    patch.published_at = new Date().toISOString();
  }

  type NoteUpdateRow = {
    content_json: JSONContent;
    updated_at: string;
    show_background_circle?: boolean;
    is_template?: boolean;
    category?: NoteCategory | null;
  };
  let data: NoteUpdateRow | null = null;
  let error: { message: string } | null = null;

  const attemptPatch: Record<string, unknown> = { ...patch };
  for (let i = 0; i < 6; i++) {
    const res = await supabase
      .from("notes")
      .update(attemptPatch)
      .eq("id", input.id)
      .select("*")
      .maybeSingle();
    data = (res.data as NoteUpdateRow | null) ?? null;
    error = res.error;
    if (!error) break;
    if (noteUpdateMissingOptionalColumn(error, "show_background_circle")) {
      delete attemptPatch.show_background_circle;
      continue;
    }
    if (noteUpdateMissingOptionalColumn(error, "is_template")) {
      delete attemptPatch.is_template;
      continue;
    }
    if (noteUpdateMissingOptionalColumn(error, "category")) {
      delete attemptPatch.category;
      continue;
    }
    break;
  }

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
      const d = defaultHomepagePin();
      await upsertHomepagePinJson(supabase, {
        source: d.source,
        template: d.template,
        fields: d.fields,
      });
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

  revalidatePath("/");
  revalidatePath("/notes");
  revalidatePath("/admin");
  revalidatePath(`/notes/${newSlug}`);
  return {
    ok: true as const,
    content_json: stored,
    updated_at: data.updated_at as string,
    show_background_circle: Boolean(
      (data as { show_background_circle?: boolean }).show_background_circle
    ),
    is_template: Boolean((data as { is_template?: boolean }).is_template),
    category: (data as { category?: NoteCategory | null }).category ?? null,
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

/** Restore the public home to the default Simple layout (replaces legacy “scheduled week”). */
export async function resetHomepagePinToDefaultLayout(): Promise<
  { ok: true } | { ok: false; message: string }
> {
  const supabase = await createServerSupabase();
  const d = defaultHomepagePin();
  const msg = await upsertHomepagePinJson(supabase, {
    source: d.source,
    template: d.template,
    fields: d.fields,
  });
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
  { ok: true; note: NoteRow } | { ok: false; message: string }
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
    .select("*")
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
  return { ok: true as const, note: data as NoteRow };
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
    const d = defaultHomepagePin();
    await upsertHomepagePinJson(supabase, {
      source: d.source,
      template: d.template,
      fields: d.fields,
    });
    revalidatePath("/");
  }

  revalidatePath("/notes");
  revalidatePath("/admin");
  revalidatePath(`/notes/${input.slug.trim()}`);
  return { ok: true as const };
}

export async function createNote(): Promise<
  { ok: true; note: NoteRow } | { ok: false; message: string }
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
    .select("*")
    .single();

  if (error) return { ok: false, message: error.message };
  if (!data?.id) return { ok: false, message: "Insert did not return the new note." };
  revalidatePath("/admin");
  revalidatePath("/notes");
  return { ok: true, note: data as NoteRow };
}

/** New draft whose body is a copy of a note marked `is_template`. */
export async function createNoteFromTemplate(input: {
  sourceId: string;
}): Promise<{ ok: true; note: NoteRow } | { ok: false; message: string }> {
  const supabase = await createServerSupabase();
  const id = input.sourceId.trim();
  if (!id) {
    return { ok: false as const, message: "Choose a template note." };
  }

  const { data: src, error: srcErr } = await supabase
    .from("notes")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (srcErr) return { ok: false as const, message: srcErr.message };
  if (!src) {
    return { ok: false as const, message: "That note was not found." };
  }
  const row = src as NoteRow & { is_template?: boolean };
  if (row.is_template !== true) {
    return {
      ok: false as const,
      message:
        "That note is not marked as a reusable template. Turn on “Reusable template” and save first.",
    };
  }

  const slug = `draft-${randomUUID().slice(0, 8)}`;
  const payload = JSON.parse(
    JSON.stringify(row.content_json)
  ) as JSONContent;

  const { data, error } = await supabase
    .from("notes")
    .insert({
      slug,
      title: "Untitled",
      excerpt: null,
      content_json: payload,
      published: false,
    })
    .select("*")
    .single();

  if (error) return { ok: false as const, message: error.message };
  if (!data?.id) {
    return { ok: false as const, message: "Insert did not return the new note." };
  }
  revalidatePath("/admin");
  revalidatePath("/notes");
  return { ok: true as const, note: data as NoteRow };
}

export async function signOut() {
  const supabase = await createServerSupabase();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
