import Link from "next/link";
import { BookIcon } from "@/components/icons";
import PageBanner from "@/components/PageBanner";
import VocabularyPractice from "@/components/VocabularyPractice";
import VocabularyManager from "@/components/VocabularyManager";
import db from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { toVocabularyCardDTO, type VocabularyCardDTO, type VocabularyItemRow } from "@/lib/vocabulary";
import { getLemmaOccurrences } from "@/lib/quran/queries";

const VOCAB_QUERY_INCLUDE = {
  lemmas: { include: { roots: true } },
  srs_cards: { where: { card_type: "ar_to_en" as const } },
};

export const dynamic = "force-dynamic";

function BannerStat({ value, label }: { value: number; label: string }) {
  return (
    <div className="min-w-20 rounded-xl border border-emerald-200 bg-white/80 px-4 py-2 text-center shadow-sm dark:border-emerald-900/60 dark:bg-parchment-900/60">
      <div className="text-2xl font-bold tabular-nums text-emerald-700 dark:text-emerald-300">{value}</div>
      <div className="text-[11px] uppercase tracking-wide text-muted">{label}</div>
    </div>
  );
}

export default async function VocabularyPage() {
  const userId = await getCurrentUserId();

  const [allItems, dueItems, user] = await Promise.all([
    db.vocabulary_items.findMany({
      where: { user_id: userId },
      include: VOCAB_QUERY_INCLUDE,
      orderBy: { created_at: "desc" },
    }),
    db.vocabulary_items.findMany({
      where: { user_id: userId, srs_cards: { some: { card_type: "ar_to_en", due_at: { lte: new Date() } } } },
      include: VOCAB_QUERY_INCLUDE,
    }),
    db.users.findUniqueOrThrow({ where: { id: userId }, select: { srs_algorithm: true } }),
  ]);
  const algorithm = user.srs_algorithm === "leitner" ? "leitner" : "sm2";

  const occurrences = await getLemmaOccurrences(
    [...new Set(allItems.map((i) => i.lemma_id).filter((id): id is bigint => id !== null))]
  );
  const toCard = (item: (typeof allItems)[number]): VocabularyCardDTO => {
    const card = toVocabularyCardDTO(item as unknown as VocabularyItemRow);
    return { ...card, quranOccurrence: card.lemmaId ? (occurrences.get(card.lemmaId) ?? null) : null };
  };
  const allCards = allItems.map(toCard);
  const dueCards = dueItems.map(toCard);

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
        <VocabularyPractice initialQueue={dueCards} algorithm={algorithm} />
      </div>

      <VocabularyManager items={allCards} />
    </div>
  );
}
