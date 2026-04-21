"use client";

import { useActionState } from "react";

import { loginAction } from "@/app/admin/login/actions";

type Props = { nextPath: string };

export function LoginForm({ nextPath }: Props) {
  const [state, formAction, pending] = useActionState(loginAction, undefined);

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="next" value={nextPath} />
      <label className="block space-y-1.5">
        <span className="text-[10px] uppercase tracking-[0.2em] text-gray-500">
          Email
        </span>
        <input
          name="email"
          type="email"
          autoComplete="username"
          required
          className="w-full rounded-md border border-white/15 bg-black px-3 py-2 text-sm text-white outline-none focus:border-white/35"
        />
      </label>
      <label className="block space-y-1.5">
        <span className="text-[10px] uppercase tracking-[0.2em] text-gray-500">
          Password
        </span>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="w-full rounded-md border border-white/15 bg-black px-3 py-2 text-sm text-white outline-none focus:border-white/35"
        />
      </label>
      {state?.error ? (
        <p className="text-sm text-red-400/90" role="alert">
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md border border-white/25 py-2.5 text-xs font-medium uppercase tracking-[0.2em] text-white transition-colors hover:bg-white/10 disabled:opacity-40"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
