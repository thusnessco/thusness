"use client";

import { useActionState } from "react";

import { loginAction } from "@/app/admin/login/actions";

type Props = { nextPath: string };

const label =
  "text-[10px] uppercase tracking-[0.2em] text-[var(--thusness-muted)]";
const field =
  "w-full border border-[var(--thusness-rule)] bg-[var(--thusness-bg)] px-3 py-2 text-sm text-[var(--thusness-ink)] outline-none focus:border-[var(--thusness-ink)]";

export function LoginForm({ nextPath }: Props) {
  const [state, formAction, pending] = useActionState(loginAction, undefined);

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="next" value={nextPath} />
      <label className="block space-y-1.5">
        <span className={label}>Email</span>
        <input
          name="email"
          type="email"
          autoComplete="username"
          required
          className={field}
        />
      </label>
      <label className="block space-y-1.5">
        <span className={label}>Password</span>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={field}
        />
      </label>
      {state?.error ? (
        <p className="text-sm italic text-[var(--thusness-ink-soft)]" role="alert">
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="w-full border border-[var(--thusness-ink)] py-2.5 text-xs uppercase tracking-[0.2em] text-[var(--thusness-ink)] transition-opacity hover:opacity-70 disabled:opacity-40"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
