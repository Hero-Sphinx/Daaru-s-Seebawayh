/**
 * Gemini-generated sentence-meaning-matching questions for the Quiz
 * Center's "meaning" topic — fresh sentences each time, not capped at the
 * 3 curated sample-sentence.ts entries (which the client-side generator in
 * generate.ts still uses as a fallback if Gemini isn't configured).
 *
 * This is generation, not just translation — Gemini authors both the
 * Arabic sentence and its English meaning together, so there's no
 * mismatch risk between them. Still not a grammar claim: no root, case, or
 * role is asserted about these sentences anywhere, so this stays within
 * the same AI usage policy line as summaries/translations (see
 * src/server/services/irab/translate.ts's header for that line). Every question this
 * produces is labeled AI-generated in the UI.
 */

import { generateStructured, GeminiNotConfiguredError } from "@/server/helpers/geminiClient";
import { buildOptions } from "@/helpers/quiz/primitives";
import type { QuizQuestion } from "@/helpers/quiz/generate";

const GENERATE_SCHEMA = {
  type: "object",
  properties: {
    sentences: {
      type: "array",
      items: {
        type: "object",
        properties: {
          arabicSentence: { type: "string" },
          translationEn: { type: "string" },
        },
        required: ["arabicSentence", "translationEn"],
      },
    },
  },
  required: ["sentences"],
};

function buildGeneratePrompt(count: number): string {
  return (
    `Write ${count} short, simple, fully-diacritized (complete tashkeel) Arabic sentences for a beginner-to-` +
    `intermediate Arabic grammar student, each with an accurate, natural English translation. Vary the sentence ` +
    `structures (verb-subject-object, topic-predicate, sentences with a prepositional phrase, sentences with an ` +
    `adjective) and vocabulary — no two sentences should be about the same topic or reuse the same main verb. Keep ` +
    `each sentence to 3-6 words. Return each as {arabicSentence, translationEn}.`
  );
}

/**
 * Best-effort: returns an empty array (never throws) if Gemini isn't
 * configured or the call fails, so callers can fall back to the curated
 * sentence bank instead of showing an error for what's meant to be a nice-
 * to-have variety boost.
 */
export async function generateAiMeaningQuestions(count: number, rng: () => number): Promise<QuizQuestion[]> {
  try {
    const result = await generateStructured<{ sentences: { arabicSentence: string; translationEn: string }[] }>(
      buildGeneratePrompt(count),
      GENERATE_SCHEMA
    );
    const sentences = (result.sentences ?? []).filter((s) => s.arabicSentence?.trim() && s.translationEn?.trim());
    if (sentences.length < 2) return [];

    const meanings = sentences.map((s) => s.translationEn);
    return sentences.map((s, i) => {
      const built = buildOptions(s.translationEn, meanings, rng);
      return {
        id: `meaning-ai-${i}-${s.arabicSentence}`,
        topic: "meaning" as const,
        promptAr: s.arabicSentence,
        promptEn: "What does this sentence mean?",
        options: built.options,
        correctIndex: built.correctIndex,
        aiGenerated: true,
      };
    });
  } catch (err) {
    if (!(err instanceof GeminiNotConfiguredError)) {
      console.error("AI meaning-quiz generation failed:", err);
    }
    return [];
  }
}
