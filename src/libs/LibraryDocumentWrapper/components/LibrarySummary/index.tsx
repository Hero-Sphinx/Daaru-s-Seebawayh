"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LightbulbIcon } from "@/components";
import type { FawaidDTO as Fawaid } from "@/types";

/** Each kind of benefit has its own colour, so a page of fawā'id reads at a glance. */
const CATEGORIES: Record<string, { label: string; labelAr: string; card: string; chip: string; accent: string }> = {
  vocabulary: {
    label: "Vocabulary",
    labelAr: "مُفْرَدَةٌ",
    card: "border-emerald-200 bg-emerald-50/70 dark:border-emerald-900/60 dark:bg-emerald-950/30",
    chip: "bg-emerald-600 text-white",
    accent: "bg-emerald-500",
  },
  balaghah: {
    label: "Balāghah",
    labelAr: "بَلَاغَةٌ",
    card: "border-violet-200 bg-violet-50/70 dark:border-violet-900/60 dark:bg-violet-950/30",
    chip: "bg-violet-600 text-white",
    accent: "bg-violet-500",
  },
  idiom: {
    label: "Idiom",
    labelAr: "تَعْبِيرٌ",
    card: "border-amber-200 bg-amber-50/70 dark:border-amber-900/60 dark:bg-amber-950/30",
    chip: "bg-amber-500 text-white",
    accent: "bg-amber-400",
  },
  grammar_note: {
    label: "Grammar note",
    labelAr: "فَائِدَةٌ نَحْوِيَّةٌ",
    card: "border-sky-200 bg-sky-50/70 dark:border-sky-900/60 dark:bg-sky-950/30",
    chip: "bg-sky-600 text-white",
    accent: "bg-sky-500",
  },
};
const OTHER_CATEGORY = {
  label: "Benefit",
  labelAr: "فَائِدَةٌ",
  card: "border-border bg-surface",
  chip: "bg-stone-500 text-white",
  accent: "bg-stone-400",
};

function AiBadge() {
  return (
    <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-purple-700 dark:bg-purple-950 dark:text-purple-300">
      AI-generated, unverified
    </span>
  );
}

export default function LibrarySummary({
  documentId,
  summaryEn,
  summaryAr,
  fawaid,
  canGenerate = true,
}: {
  documentId: string;
  summaryEn: string | null;
  summaryAr: string | null;
  fawaid: Fawaid[];
  /** Only the owner may generate (it spends their Gemini quota) — see /api/library/[id]/summarize. */
  canGenerate?: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/library/${documentId}/summarize`, { method: "POST" });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Summarization failed");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Summarization failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-sky-200 bg-surface shadow-sm dark:border-sky-900/60">
        <div className="flex items-center justify-between bg-gradient-to-r from-sky-50 to-indigo-50 px-5 py-3 dark:from-sky-950/50 dark:to-indigo-950/30">
          <h3 className="flex items-baseline gap-2 font-semibold text-sky-900 dark:text-sky-200">
            Summary <span className="font-arabic text-sm font-normal text-sky-700/80 dark:text-sky-300/80">المُلَخَّصُ</span>
          </h3>
          {summaryEn && <AiBadge />}
        </div>
        <div className="p-5">
          {summaryEn ? (
            <div className="space-y-3 text-sm leading-relaxed">
              <p className="text-foreground">{summaryEn}</p>
              {summaryAr && (
                <p dir="rtl" className="border-t border-border pt-3 font-arabic text-base text-muted">
                  {summaryAr}
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-3 text-center">
              <p className="text-sm text-muted">
                No summary yet.{!canGenerate && " Only the document's owner can generate one."}
              </p>
              {canGenerate && (
                <button
                  onClick={handleGenerate}
                  disabled={busy}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-sky-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:opacity-90 disabled:opacity-50"
                >
                  <LightbulbIcon className="h-4 w-4" />
                  {busy ? "Reading the text…" : "Generate summary & fawā'id"}
                </button>
              )}
              {canGenerate && !busy && <p className="text-[11px] text-muted">Uses the AI service once — it may take up to a minute.</p>}
              {error && <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>}
            </div>
          )}
        </div>
      </div>

      {fawaid.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-semibold text-amber-800 dark:text-amber-300">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500 text-white shadow-sm">
                <LightbulbIcon className="h-4 w-4" />
              </span>
              Fawā&apos;id <span className="font-arabic text-base font-normal">فَوَائِدُ</span>
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-300">{fawaid.length}</span>
            </h3>
            <AiBadge />
          </div>
          <div className="grid gap-3">
            {fawaid.map((f) => {
              const cat = CATEGORIES[f.category] ?? OTHER_CATEGORY;
              return (
                <article key={f.id} className={`relative overflow-hidden rounded-xl border p-4 pl-5 text-sm shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${cat.card}`}>
                  <span aria-hidden className={`absolute inset-y-0 left-0 w-1.5 ${cat.accent}`} />
                  <div className="mb-2 flex items-center justify-between gap-2 text-xs">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-medium ${cat.chip}`}>
                      {cat.label}
                      <span className="font-arabic text-[13px] opacity-90">{cat.labelAr}</span>
                    </span>
                    {f.pageNumber && <span className="rounded-full bg-white/70 px-2 py-0.5 text-muted dark:bg-black/20">page {f.pageNumber}</span>}
                  </div>
                  <p dir="rtl" lang="ar" className="mb-1.5 font-arabic text-lg font-bold leading-relaxed text-foreground">
                    {f.title}
                  </p>
                  {f.bodyAr && (
                    <p dir="rtl" lang="ar" className="mb-1.5 font-arabic text-base leading-relaxed text-foreground/80">
                      {f.bodyAr}
                    </p>
                  )}
                  {f.bodyEn && <p className="leading-relaxed text-muted">{f.bodyEn}</p>}
                </article>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
