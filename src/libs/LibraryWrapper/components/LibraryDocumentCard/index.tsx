"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { LibraryDocumentDTO } from "@/types/library";
import { ScrollIcon, TrashIcon } from "@/components/Icons";

const STATUS: Record<string, { label: string; pill: string; dot: string }> = {
  completed: { label: "Ready", pill: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200", dot: "bg-emerald-500" },
  processing: { label: "Reading pages…", pill: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200", dot: "bg-amber-500 animate-pulse" },
  failed: { label: "Failed", pill: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200", dot: "bg-rose-500" },
  pending: { label: "Waiting", pill: "bg-stone-100 text-stone-600 dark:bg-stone-700 dark:text-stone-300", dot: "bg-stone-400" },
};

/** A stable spine colour per book, so a shelf of cards isn't one colour. */
const SPINES = ["from-sky-500 to-indigo-500", "from-emerald-500 to-teal-500", "from-amber-400 to-orange-500", "from-rose-400 to-pink-500", "from-violet-500 to-purple-500"];
function spineFor(id: string): string {
  let h = 0;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return SPINES[h % SPINES.length];
}

/** `sharedBy` is set for documents someone else shared with this user — those can't be deleted from here. */
export default function LibraryDocumentCard({ doc, sharedBy }: { doc: LibraryDocumentDTO; sharedBy?: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirming) {
      setConfirming(true);
      return;
    }
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/library/${doc.id}`, { method: "DELETE" });
      if (!res.ok && res.status !== 404) throw new Error("Failed to delete");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
      setDeleting(false);
      setConfirming(false);
    }
  }

  return (
    <Link
      href={`/library/${doc.id}`}
      className="group relative overflow-hidden rounded-2xl border border-border bg-surface p-5 pl-6 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-md dark:hover:border-sky-800"
    >
      <span aria-hidden className={`absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b ${spineFor(doc.id)}`} />
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300">
            <ScrollIcon className="h-4 w-4" />
          </span>
          <h3 className="min-w-0 break-words font-semibold leading-snug text-foreground group-hover:text-sky-800 dark:group-hover:text-sky-300">{doc.title}</h3>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs ${(STATUS[doc.processingStatus] ?? STATUS.pending).pill}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${(STATUS[doc.processingStatus] ?? STATUS.pending).dot}`} />
            {(STATUS[doc.processingStatus] ?? STATUS.pending).label}
          </span>
          {!sharedBy && <button
            onClick={handleDelete}
            onBlur={() => setConfirming(false)}
            disabled={deleting}
            aria-label={confirming ? `Confirm delete ${doc.title}` : `Delete ${doc.title}`}
            title={confirming ? "Click again to permanently delete" : "Delete this book"}
            className={`rounded-full p-1.5 transition disabled:opacity-50 ${
              confirming
                ? "bg-rose-600 text-white hover:bg-rose-500"
                : "text-stone-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950"
            }`}
          >
            <TrashIcon className="h-3.5 w-3.5" />
          </button>}
        </div>
      </div>
      <p className="pl-12 text-sm text-muted">
        {doc.pageCount ? `${doc.pageCount} pages` : "—"}
        {sharedBy && ` · shared by ${sharedBy}`}
      </p>
      {confirming && !deleting && (
        <p className="mt-2 text-xs font-medium text-rose-600 dark:text-rose-400">Click the trash icon again to permanently delete this book.</p>
      )}
      {error && <p className="mt-2 text-xs text-rose-600 dark:text-rose-400">{error}</p>}
    </Link>
  );
}
