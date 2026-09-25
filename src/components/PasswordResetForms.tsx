"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { ResetPasswordState, ResetRequestState } from "@/app/(auth)/actions";
import { MIN_PASSWORD_LENGTH } from "@/lib/password-policy";

export const AUTH_CARD = "mx-auto w-full max-w-sm space-y-4 rounded-lg border border-border bg-surface p-6";
export const AUTH_INPUT =
  "w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand/40";
export const AUTH_BUTTON = "w-full rounded-md bg-brand px-4 py-2 text-sm font-medium text-brand-contrast transition hover:opacity-90 disabled:opacity-60";

function ErrorNote({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
      {message}
    </p>
  );
}

export function ForgotPasswordForm({ action }: { action: (prev: ResetRequestState, formData: FormData) => Promise<ResetRequestState> }) {
  const [state, formAction, pending] = useActionState(action, {});
  if (state.sent) {
    return (
      <div className={AUTH_CARD}>
        <h1 className="text-xl font-semibold text-foreground">Check your email</h1>
        <p className="text-sm text-muted">
          If an account exists for <span className="font-medium text-foreground">{state.email}</span>, a link to choose a new password is on its way. It works once, for one hour.
        </p>
        <Link href="/login" className="block text-center text-sm font-medium text-brand hover:underline">
          Back to sign in
        </Link>
      </div>
    );
  }
  return (
    <form action={formAction} className={AUTH_CARD}>
      <div>
        <h1 className="text-xl font-semibold text-foreground">Reset your password</h1>
        <p className="mt-1 text-xs text-muted">Enter your account&apos;s email and we&apos;ll send you a link to choose a new password.</p>
      </div>
      <label className="block space-y-1 text-sm">
        <span className="font-medium">Email</span>
        <input name="email" type="email" required autoComplete="email" defaultValue={state.email} className={AUTH_INPUT} />
      </label>
      <ErrorNote message={state.error} />
      <button type="submit" disabled={pending} className={AUTH_BUTTON}>
        {pending ? "Sending…" : "Send reset link"}
      </button>
      <p className="text-center text-xs text-muted">
        <Link href="/login" className="font-medium text-brand hover:underline">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}

export function ResetPasswordForm({ token, action }: { token: string; action: (prev: ResetPasswordState, formData: FormData) => Promise<ResetPasswordState> }) {
  const [state, formAction, pending] = useActionState(action, {});
  return (
    <form action={formAction} className={AUTH_CARD}>
      <div>
        <h1 className="text-xl font-semibold text-foreground">Choose a new password</h1>
        <p className="mt-1 text-xs text-muted">You&apos;ll be signed out on every other device.</p>
      </div>
      <input type="hidden" name="token" value={token} />
      <label className="block space-y-1 text-sm">
        <span className="font-medium">New password</span>
        <input name="password" type="password" required minLength={MIN_PASSWORD_LENGTH} autoComplete="new-password" className={AUTH_INPUT} />
        <span className="text-xs text-muted">At least {MIN_PASSWORD_LENGTH} characters.</span>
      </label>
      <label className="block space-y-1 text-sm">
        <span className="font-medium">Confirm new password</span>
        <input name="confirm" type="password" required minLength={MIN_PASSWORD_LENGTH} autoComplete="new-password" className={AUTH_INPUT} />
      </label>
      <ErrorNote message={state.error} />
      <button type="submit" disabled={pending} className={AUTH_BUTTON}>
        {pending ? "Saving…" : "Save new password"}
      </button>
    </form>
  );
}
