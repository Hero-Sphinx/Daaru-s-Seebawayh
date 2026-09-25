/**
 * Book quiz subtype: sentence-to-meaning matching (an Arabic sentence from
 * the book, pick its correct English translation from 4 options). Which
 * sentences to use is picked deterministically (see
 * selectSentencesForMeaningMatch in src/helpers/quiz/bookGenerate.ts); only
 * the translation text itself comes from Gemini — translation isn't a
 * grammar claim, same line drawn for src/server/services/irab/translate.ts and
 * src/server/services/vocabulary/lookupPrompt.ts. Every question this produces must be
 * labeled "AI-generated, unverified" same as book_comprehension.
 *
 * Translates every selected sentence in ONE request (not one per sentence)
 * — same reasoning as the PDF OCR fix in src/server/services/library/extractPdf.ts:
 * Gemini handles a batch fine, and N sequential round-trips only adds
 * latency and quota pressure for no benefit.
 */

import { generateStructured, GeminiNotConfiguredError } from "@/server/helpers/geminiClient";
import { buildOptions } from "@/helpers/quiz/primitives";
import type { SelectedSentence } from "@/helpers/quiz/bookGenerate";

export interface MeaningMatchQuestion {
  promptAr: string;
  promptEn: string;
  options: string[];
  correctIndex: number;
  pageNumber?: number;
}

const TRANSLATE_BATCH_SCHEMA = {
  type: "object",
  properties: {
    translations: {
      type: "array",
      items: {
        type: "object",
        properties: { index: { type: "integer" }, translationEn: { type: "string" } },
        required: ["index", "translationEn"],
      },
    },
  },
  required: ["translations"],
};

function buildTranslateBatchPrompt(sentences: SelectedSentence[]): string {
  const numbered = sentences.map((s, i) => `${i}. ${s.text}`).join("\n");
  return (
    `Translate each of these ${sentences.length} Arabic sentences into natural, idiomatic English. ` +
    `Return one entry per sentence in the "translations" array, with "index" matching its number below exactly:\n\n${numbered}`
  );
}

export async function buildMeaningMatchQuestions(sentences: SelectedSentence[], rng: () => number): Promise<MeaningMatchQuestion[]> {
  if (sentences.length < 2) return [];

  let translationByIndex: Map<number, string>;
  try {
    const result = await generateStructured<{ translations: { index: number; translationEn: string }[] }>(
      buildTranslateBatchPrompt(sentences),
      TRANSLATE_BATCH_SCHEMA
    );
    translationByIndex = new Map(
      result.translations
        .map((t): [number, string] => [t.index, t.translationEn?.trim() ?? ""])
        .filter((entry): entry is [number, string] => entry[1].length > 0)
    );
  } catch (err) {
    if (!(err instanceof GeminiNotConfiguredError)) {
      console.error("Meaning-match quiz generation failed:", err);
    }
    return [];
  }

  const withTranslation = sentences
    .map((s, i) => ({ ...s, translationEn: translationByIndex.get(i) }))
    .filter((s): s is SelectedSentence & { translationEn: string } => !!s.translationEn);
  if (withTranslation.length < 2) return [];

  const meanings = withTranslation.map((s) => s.translationEn);
  return withTranslation.map((s) => {
    const built = buildOptions(s.translationEn, meanings, rng);
    return {
      promptAr: s.text,
      promptEn: "What does this sentence mean?",
      options: built.options,
      correctIndex: built.correctIndex,
      pageNumber: s.pageNumber,
    };
  });
}
