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
      <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6 py-16 text-gray-300">
        <p className="text-sm">Supabase environment variables are not configured.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6 py-16">
      <p className="text-center text-xs tracking-[0.3em] uppercase text-gray-500">
        Thusness
      </p>
      <h1 className="mt-4 text-center text-xl font-light text-white">Admin sign in</h1>
      <div className="mt-10 rounded-lg border border-white/10 bg-zinc-950/40 p-8">
        <LoginForm nextPath={nextPath} />
      </div>
      <Link
        href="/"
        className="mt-10 block text-center text-xs text-gray-600 transition-colors hover:text-gray-400"
      >
        Back to site
      </Link>
    </div>
  );
}
