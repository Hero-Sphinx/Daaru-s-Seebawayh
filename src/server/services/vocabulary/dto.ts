import "server-only";
import { SM2_DEFAULTS } from "@/helpers";
import type { VocabularyCardDTO } from "@/types";

/** Prisma include every vocabulary query uses, so rows always fit toVocabularyCardDTO. */
export const VOCAB_QUERY_INCLUDE = {
  lemmas: { include: { roots: true } },
  srs_cards: { where: { card_type: "ar_to_en" as const } },
};

/** Minimal shape of a vocabulary_items row as returned by the Prisma queries in the API routes. */
export interface VocabularyItemRow {
  id: bigint;
  lemma_id?: bigint | null;
  source: string;
  custom_word_ar: string | null;
  custom_root: string | null;
  custom_meaning_en: string | null;
  custom_transliteration: string | null;
  example_sentence_ar: string | null;
  lemmas: { lemma_ar: string; lemma_transliteration: string | null; meaning_en: string | null; roots: { root_letters: string } | null } | null;
  srs_cards: { id: bigint; easiness_factor: unknown; interval_days: number; repetitions: number; leitner_box?: number; due_at?: Date }[];
}

export function toVocabularyCardDTO(row: VocabularyItemRow): VocabularyCardDTO {
  const card = row.srs_cards[0];
  return {
    id: Number(row.id),
    cardId: card ? Number(card.id) : null,
    // What the learner entered wins; the linked Qur'an lemma only fills
    // gaps (e.g. a root they didn't type). Its Uthmani spelling (كِتَٰب)
    // must not silently replace the word they're studying (كتاب).
    wordAr: row.custom_word_ar ?? row.lemmas?.lemma_ar ?? "",
    transliteration: row.custom_transliteration ?? row.lemmas?.lemma_transliteration ?? "",
    meaningEn: row.custom_meaning_en ?? row.lemmas?.meaning_en ?? "",
    root: row.custom_root ?? row.lemmas?.roots?.root_letters ?? "",
    exampleAr: row.example_sentence_ar ?? "",
    source: row.source as VocabularyCardDTO["source"],
    sm2: card
      ? { easinessFactor: Number(card.easiness_factor), intervalDays: card.interval_days, repetitions: card.repetitions }
      : SM2_DEFAULTS,
    leitnerBox: card?.leitner_box ?? 1,
    dueAt: card?.due_at ? card.due_at.toISOString() : null,
    lemmaId: row.lemma_id ? row.lemma_id.toString() : null,
    quranOccurrence: null,
  };
}
