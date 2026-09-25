import Link from "next/link";
import { BookIcon } from "@/components/Icons";
import PageBanner from "@/layouts/PageBanner";
import type { VocabularyPageData } from "@/types/vocabulary";
import VocabularyManager from "./components/VocabularyManager";
import VocabularyPractice from "./components/VocabularyPractice";

function BannerStat({ value, label }: { value: number; label: string }) {
  return (
    <div className="min-w-20 rounded-xl border border-emerald-200 bg-white/80 px-4 py-2 text-center shadow-sm dark:border-emerald-900/60 dark:bg-parchment-900/60">
      <div className="text-2xl font-bold tabular-nums text-emerald-700 dark:text-emerald-300">{value}</div>
      <div className="text-[11px] uppercase tracking-wide text-muted">{label}</div>
    </div>
  );
}

export default function VocabularyWrapper({ allCards, dueCards, algorithm }: VocabularyPageData) {
  return (
    <div className="space-y-10">
      <PageBanner
        tone="emerald"
        icon={BookIcon}
        titleAr="المُفْرَدَاتُ"
        title="Vocabulary"
        description={
          <>
            Build your word bank, then review it with {algorithm === "leitner" ? "Leitner boxes" : "SM-2 spaced repetition"}.{" "}
            <Link href="/settings" className="font-medium text-emerald-700 underline-offset-2 hover:underline dark:text-emerald-300">
              Change method
            </Link>
          </>
        }
      >
        <BannerStat value={dueCards.length} label="due today" />
        <BannerStat value={allCards.length} label="words" />
      </PageBanner>

      <div className="mx-auto max-w-md">
        <h2 className="mb-3 flex items-center justify-center gap-2 text-sm font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
          <span className="h-px w-8 bg-emerald-300 dark:bg-emerald-800" />
          Review queue — {dueCards.length} due
          <span className="h-px w-8 bg-emerald-300 dark:bg-emerald-800" />
        </h2>
        <VocabularyPractice initialQueue={dueCards} allCards={allCards} algorithm={algorithm} />
      </div>

      <VocabularyManager items={allCards} />
    </div>
  );
}
