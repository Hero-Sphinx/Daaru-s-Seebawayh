import { NextResponse } from "next/server";
import db from "@/server/databases/db";
import { getApiUserId, unauthorizedResponse } from "@/server/lib/auth";
import { toVocabularyCardDTO, VOCAB_QUERY_INCLUDE } from "@/server/services/vocabulary/dto";
import { SM2_DEFAULTS } from "@/helpers/srs/sm2";
import { getLemmaIndex } from "@/server/services/quran/queries";
import { matchLemma } from "@/helpers/quran/lemmaMatch";

export async function GET() {
  const userId = await getApiUserId();
  if (!userId) return unauthorizedResponse();
  const items = await db.vocabulary_items.findMany({
    where: { user_id: userId },
    include: VOCAB_QUERY_INCLUDE,
    orderBy: { created_at: "desc" },
  });
  return NextResponse.json(items.map((item) => toVocabularyCardDTO(item)));
}

interface CreateVocabularyBody {
  items: { wordAr: string; meaningEn: string; root?: string; transliteration?: string; exampleAr?: string }[];
}

export async function POST(request: Request) {
  const body = (await request.json()) as CreateVocabularyBody;
  if (!Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json({ error: "items must be a non-empty array" }, { status: 400 });
  }
  for (const item of body.items) {
    if (!item.wordAr?.trim() || !item.meaningEn?.trim()) {
      return NextResponse.json({ error: "Every item needs wordAr and meaningEn" }, { status: 400 });
    }
  }

  const userId = await getApiUserId();

  if (!userId) return unauthorizedResponse();
  const now = new Date();
  // Link to the Qur'an dictionary when the word unambiguously matches one
  // lemma (root family, frequency, same-root quiz distractors). Purely
  // additive — what the user typed is still what's displayed.
  const lemmaIndex = await getLemmaIndex();

  const created = await db.$transaction(
    body.items.map((item) =>
      db.vocabulary_items.create({
        data: {
          user_id: userId,
          lemma_id: toLemmaId(matchLemma(lemmaIndex, item.wordAr.trim(), item.root)),
          custom_word_ar: item.wordAr.trim(),
          custom_meaning_en: item.meaningEn.trim(),
          custom_root: item.root?.trim() || null,
          custom_transliteration: item.transliteration?.trim() || null,
          example_sentence_ar: item.exampleAr?.trim() || null,
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
      })
    )
  );

  return NextResponse.json(created.map((item) => toVocabularyCardDTO(item)), { status: 201 });
}

function toLemmaId(match: { id: string } | null): bigint | null {
  return match ? BigInt(match.id) : null;
}
