import type { Metadata } from "next";
import Link from "next/link";

import { LoginForm } from "@/components/admin/LoginForm";
import { getSupabasePublicConfig } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

type Props = { searchParams: Promise<{ next?: string }> };

export default async function AdminLoginPage({ searchParams }: Props) {
  const { next } = await searchParams;
  const nextPath = next?.startsWith("/") ? next : "/admin";

  if (!getSupabasePublicConfig()) {
    return (
      <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6 py-16 text-[var(--thusness-ink-soft)]">
        <p className="text-sm leading-relaxed">
          Supabase environment variables are not configured.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6 py-16">
      <p className="text-center text-[11px] uppercase tracking-[2.4px] text-[var(--thusness-muted)]">
        Thusness
      </p>
      <h1 className="mt-4 text-center text-xl font-medium tracking-tight text-[var(--thusness-ink)]">
        Admin sign in
      </h1>
      <div className="mt-10 border border-[var(--thusness-rule)] bg-[var(--thusness-bg)] p-8">
        <LoginForm nextPath={nextPath} />
      </div>
      <Link
        href="/"
        className="mt-10 block text-center text-xs text-[var(--thusness-muted)] underline decoration-[var(--thusness-ink)] decoration-1 underline-offset-4 hover:opacity-70"
      >
        Back to site
      </Link>
    </div>
  );
}
