"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { DocumentRole } from "@/lib/library/access";

interface Share {
  userId: string;
  name: string;
  email: string;
  role: string;
}

const ROLE_LABEL: Record<string, string> = {
  viewer: "Can read",
  annotator: "Can read & add notes",
};

export default function LibrarySharePanel({
  documentId,
  role,
  shares,
  currentUserId,
}: {
  documentId: string;
  role: DocumentRole;
  shares: Share[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [shareRole, setShareRole] = useState<"viewer" | "annotator">("annotator");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  async function call(url: string, init: RequestInit, okText: string, after?: () => void) {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch(url, init);
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? "Something went wrong");
      setMessage({ kind: "ok", text: okText });
      after?.();
      router.refresh();
    } catch (e) {
      setMessage({ kind: "error", text: e instanceof Error ? e.message : "Something went wrong" });
    } finally {
      setBusy(false);
    }
  }

  if (role !== "owner") {
    return (
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-stone-200 bg-white p-4 text-sm dark:border-stone-700/60 dark:bg-parchment-800">
        <span className="text-muted">Shared with you · {ROLE_LABEL[role]}</span>
        <button
          type="button"
          disabled={busy}
          onClick={() =>
            call(`/api/library/${documentId}/shares/${currentUserId}`, { method: "DELETE" }, "You left this document.", () => router.push("/library"))
          }
          className="text-xs text-rose-600 hover:underline disabled:opacity-50"
        >
          Leave this document
        </button>
        {message?.kind === "error" && <p className="w-full text-xs text-rose-600">{message.text}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-lg border border-stone-200 bg-white p-5 dark:border-stone-700/60 dark:bg-parchment-800">
      <div>
        <h2 className="font-semibold">Share this document</h2>
        <p className="text-xs text-muted">
          People you share with can read it and see everyone&apos;s shared notes; &ldquo;add notes&rdquo; lets them annotate too.
          They need an account on this app already.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!email.trim()) return;
          call(
            `/api/library/${documentId}/shares`,
            { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, role: shareRole }) },
            `Shared with ${email.trim()}.`,
            () => setEmail("")
          );
        }}
        className="flex flex-wrap gap-2"
      >
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="their@email.com"
          className="min-w-0 flex-1 rounded-md border border-stone-300 bg-stone-50 px-3 py-2 text-sm dark:border-stone-600 dark:bg-parchment-900"
        />
        <select
          value={shareRole}
          onChange={(e) => setShareRole(e.target.value as "viewer" | "annotator")}
          className="rounded-md border border-stone-300 bg-stone-50 px-2 py-2 text-sm dark:border-stone-600 dark:bg-parchment-900"
        >
          <option value="annotator">{ROLE_LABEL.annotator}</option>
          <option value="viewer">{ROLE_LABEL.viewer}</option>
        </select>
        <button
          type="submit"
          disabled={busy}
          className="rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-600 disabled:opacity-60"
        >
          Share
        </button>
      </form>

      {message && <p className={`text-xs ${message.kind === "ok" ? "text-emerald-700 dark:text-emerald-400" : "text-rose-600"}`}>{message.text}</p>}

      {shares.length > 0 && (
        <ul className="divide-y divide-stone-200 text-sm dark:divide-stone-700">
          {shares.map((s) => (
            <li key={s.userId} className="flex items-center justify-between gap-2 py-2">
              <span>
                {s.name}
                {s.name !== s.email && <span className="text-xs text-stone-500"> · {s.email}</span>}
              </span>
              <span className="flex items-center gap-3 text-xs">
                <span className="text-stone-500">{ROLE_LABEL[s.role] ?? s.role}</span>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => call(`/api/library/${documentId}/shares/${s.userId}`, { method: "DELETE" }, `Removed ${s.name}.`)}
                  className="text-rose-600 hover:underline disabled:opacity-50"
                >
                  Remove
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
