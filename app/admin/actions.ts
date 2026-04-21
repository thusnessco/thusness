"use server";

import { randomUUID } from "node:crypto";

import type { JSONContent } from "@tiptap/core";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createServerSupabase } from "@/lib/supabase/server";
import { emptyDoc } from "@/lib/tiptap/empty-doc";

export async function saveSiteContent(key: string, content_json: JSONContent) {
  const supabase = await createServerSupabase();
  const { error } = await supabase.from("site_content").upsert(
    {
      key,
      title: null,
      content_json,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "key" }
  );

  if (error) return { ok: false as const, message: error.message };
  revalidatePath("/");
  revalidatePath("/admin");
  return { ok: true as const };
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

  const { error } = await supabase.from("notes").update(patch).eq("id", input.id);

  if (error) return { ok: false as const, message: error.message };
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
