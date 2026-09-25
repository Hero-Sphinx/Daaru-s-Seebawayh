"use client";

import { useActionState } from "react";
import { updateDisplayName, type SettingsState } from "@/app/settings/actions";

export default function ProfileForm({ displayName, email }: { displayName: string | null; email: string }) {
  const [state, formAction, pending] = useActionState<SettingsState, FormData>(updateDisplayName, {});
  return (
    <form action={formAction} className="space-y-3 rounded-2xl border border-border bg-surface p-6 shadow-sm">
      <div>
        <h2 className="font-semibold">Your name</h2>
        <p className="text-xs text-muted">Used to greet you on the dashboard and in emails. Signed in as {email}.</p>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          name="displayName"
          defaultValue={displayName ?? ""}
          maxLength={60}
          autoComplete="name"
          placeholder="e.g. Aminah or Yusuf"
          className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
        />
        <button type="submit" disabled={pending} className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-brand-contrast transition hover:opacity-90 disabled:opacity-60">
          {pending ? "Saving…" : "Save name"}
        </button>
      </div>
      {state.message && <p className="text-sm text-emerald-700 dark:text-emerald-400">{state.message}</p>}
      {state.error && <p className="text-sm text-rose-600">{state.error}</p>}
    </form>
  );
}
