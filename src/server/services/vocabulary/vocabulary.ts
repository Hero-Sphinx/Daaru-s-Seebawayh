import "server-only";
import { matchLemma, SM2_DEFAULTS } from "@/helpers";
import { notFound } from "@/server/constants";
import { db } from "@/server/databases";
import type { VocabularyItemInput } from "@/server/validators/vocabulary/validate";
import type { VocabularyCardDTO } from "@/types";
import { getLemmaIndex } from "../quran/queries";
import { toVocabularyCardDTO, VOCAB_QUERY_INCLUDE } from "./dto";

export async function listVocabulary(userId: string): Promise<VocabularyCardDTO[]> {
  const items = await db.vocabulary_items.findMany({ where: { user_id: userId }, include: VOCAB_QUERY_INCLUDE, orderBy: { created_at: "desc" } });
  return items.map(toVocabularyCardDTO);
}

/** Adds words to the learner's bank, each with an SRS card due now. */
export async function createVocabulary(userId: string, items: VocabularyItemInput[]): Promise<VocabularyCardDTO[]> {
  const now = new Date();
  // Link to the Qur'an dictionary when the word unambiguously matches one
  // lemma (root family, frequency, same-root quiz distractors). Purely
  // additive — what the user typed is still what's displayed.
  const lemmaIndex = await getLemmaIndex();

  const created = await db.$transaction(
    items.map((item) => {
      const lemma = matchLemma(lemmaIndex, item.wordAr, item.root);
      return db.vocabulary_items.create({
        data: {
          user_id: userId,
          lemma_id: lemma ? BigInt(lemma.id) : null,
          custom_word_ar: item.wordAr,
          custom_meaning_en: item.meaningEn,
          custom_root: item.root ?? null,
          custom_transliteration: item.transliteration ?? null,
          example_sentence_ar: item.exampleAr ?? null,
          source: "manual",
          srs_cards: {
            create: {
              user_id: userId,
              card_type: "ar_to_en",
              easiness_factor: SM2_DEFAULTS.easinessFactor,
              interval_days: SM2_DEFAULTS.intervalDays,
              repetitions: SM2_DEFAULTS.repetitions,
              due_at: now,
            },
          },
        },
        include: VOCAB_QUERY_INCLUDE,
      });
    })
  );
  return created.map(toVocabularyCardDTO);
}

export async function deleteVocabulary(userId: string, id: bigint): Promise<void> {
  const result = await db.vocabulary_items.deleteMany({ where: { id, user_id: userId } });
  if (result.count === 0) throw notFound("That word isn't in your bank.");
}
