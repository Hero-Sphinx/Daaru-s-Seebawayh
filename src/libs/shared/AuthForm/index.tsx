"use client";

import Link from "next/link";
import { useActionState } from "react";
import { MIN_PASSWORD_LENGTH } from "@/constants";
import type { AuthFormState } from "@/types";
import { AUTH_BUTTON, AUTH_CARD, AUTH_INPUT } from "../authStyles";

type AuthFormProps = {
  mode: "login" | "signup";
  action: (prev: AuthFormState, formData: FormData) => Promise<AuthFormState>;
  next: string;
  /** Email reset available (else the form says to ask whoever invited you). */
  canResetByEmail?: boolean;
};

export default function AuthForm({ mode, action, next, canResetByEmail = true }: AuthFormProps) {
  const [state, formAction, pending] = useActionState(action, {});
  const isSignup = mode === "signup";
  const nextQuery = next !== "/" ? `?next=${encodeURIComponent(next)}` : "";

  return (
    <form action={formAction} className={AUTH_CARD}>
      <div>
        <h1 className="text-xl font-semibold text-foreground">{isSignup ? "Create your account" : "Sign in"}</h1>
        <p className="mt-1 text-xs text-muted">
          {isSignup
            ? "Your vocabulary, reviews, library and quiz history are kept private to your account."
            : "Welcome back — pick up where you left off."}
        </p>
      </div>

      <input type="hidden" name="next" value={next} />

      {isSignup && (
        <label className="block space-y-1 text-sm">
          <span className="font-medium">Display name <span className="font-normal text-muted">(optional)</span></span>
          <input name="displayName" autoComplete="nickname" defaultValue={state.displayName} className={AUTH_INPUT} />
        </label>
      )}

      <label className="block space-y-1 text-sm">
        <span className="font-medium">Email</span>
        <input name="email" type="email" required autoComplete="email" defaultValue={state.email} className={AUTH_INPUT} />
      </label>

      <label className="block space-y-1 text-sm">
        <span className="flex items-center justify-between">
          <span className="font-medium">Password</span>
          {!isSignup && canResetByEmail && (
            <Link href="/forgot-password" className="text-xs font-normal text-brand hover:underline">
              Forgot password?
            </Link>
          )}
        </span>
        <input
          name="password"
          type="password"
          required
          minLength={isSignup ? MIN_PASSWORD_LENGTH : undefined}
          autoComplete={isSignup ? "new-password" : "current-password"}
          className={AUTH_INPUT}
        />
        {isSignup && <span className="text-xs text-muted">At least {MIN_PASSWORD_LENGTH} characters.</span>}
        {!isSignup && !canResetByEmail && <span className="text-xs text-muted">Forgot your password? Message the person who invited you and they&apos;ll reset it.</span>}
      </label>

      {state.error && (
        <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending} className={AUTH_BUTTON}>
        {pending ? (isSignup ? "Creating account…" : "Signing in…") : isSignup ? "Create account" : "Sign in"}
      </button>

      <p className="text-center text-xs text-muted">
        {isSignup ? "Already have an account? " : "New here? "}
        <Link href={`${isSignup ? "/login" : "/signup"}${nextQuery}`} className="font-medium text-brand hover:underline">
          {isSignup ? "Sign in" : "Create an account"}
        </Link>
      </p>
    </form>
  );
}
