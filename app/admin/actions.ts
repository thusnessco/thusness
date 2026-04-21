"use server";

import { randomUUID } from "node:crypto";

import type { JSONContent } from "@tiptap/core";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createServerSupabase } from "@/lib/supabase/server";
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
  revalidatePath("/");
  revalidatePath("/admin");
  return {
    ok: true as const,
    content_json: data.content_json as JSONContent,
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

  const patch: Record<string, unknown> = {
    slug: input.slug.trim(),
    title: input.title.trim(),
    excerpt: input.excerpt?.trim() || null,
    content_json: input.content_json,
    published: input.published,
  };

  if (input.published) {
    patch.published_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from("notes")
    .update(patch)
    .eq("id", input.id)
    .select("id")
    .maybeSingle();

  if (error) return { ok: false as const, message: error.message };
  if (!data) {
    return {
      ok: false as const,
      message:
        "Could not update this note (no matching row). Try refreshing the page or signing in again.",
    };
  }

  revalidatePath("/notes");
  revalidatePath("/admin");
  revalidatePath(`/notes/${input.slug.trim()}`);
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
