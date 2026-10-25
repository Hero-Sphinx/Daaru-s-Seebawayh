"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { errorMessage, fetcher } from "@/constants";

/** Unlock (or lock again) one class deck, then refresh the page so every count updates. */
export default function ReleaseToggle({ book, section, released, label }: { book: string; section: number; released: boolean; label: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggle() {
    setBusy(true);
    setError(null);
    try {
      await fetcher("/api/flashcards/releases", { method: "POST", json: { book, section, released: !released } });
      router.refresh();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex shrink-0 flex-col items-end gap-1">
      <button
        type="button"
        onClick={toggle}
        disabled={busy}
        aria-label={`${released ? "Lock" : "Unlock"} ${label}`}
        className={`min-w-24 rounded-xl px-4 py-2 text-sm font-semibold transition disabled:opacity-50 ${
          released
            ? "border border-border text-muted hover:border-rose-300 hover:text-rose-700 dark:hover:text-rose-300"
            : "bg-emerald-600 text-white shadow-sm hover:bg-emerald-700"
        }`}
      >
        {busy ? "…" : released ? "Lock" : "Unlock"}
      </button>
      {error && <p className="max-w-48 text-right text-xs text-rose-600">{error}</p>}
    </div>
  );
}
