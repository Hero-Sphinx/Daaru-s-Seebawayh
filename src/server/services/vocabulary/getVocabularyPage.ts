import db from "@/server/databases/db";
import { getLemmaOccurrences } from "@/server/services/quran/queries";
import type { VocabularyCardDTO, VocabularyPageData } from "@/types/vocabulary";
import { toVocabularyCardDTO, VOCAB_QUERY_INCLUDE } from "./dto";

export async function getVocabularyPage(userId: string): Promise<VocabularyPageData> {
  const [items, user] = await Promise.all([
    db.vocabulary_items.findMany({ where: { user_id: userId }, include: VOCAB_QUERY_INCLUDE, orderBy: { created_at: "desc" } }),
    db.users.findUniqueOrThrow({ where: { id: userId }, select: { srs_algorithm: true } }),
  ]);

  const occurrences = await getLemmaOccurrences([...new Set(items.map((i) => i.lemma_id).filter((id): id is bigint => id !== null))]);
  const allCards: VocabularyCardDTO[] = items.map((item) => {
    const card = toVocabularyCardDTO(item);
    return { ...card, quranOccurrence: card.lemmaId ? (occurrences.get(card.lemmaId) ?? null) : null };
  });

  const now = new Date().toISOString();
  const dueCards = allCards.filter((c) => c.cardId !== null && c.dueAt !== null && c.dueAt <= now).sort((a, b) => a.dueAt!.localeCompare(b.dueAt!));

  return { allCards, dueCards, algorithm: user.srs_algorithm === "leitner" ? "leitner" : "sm2" };
}
