/**
 * Client-side quiz question generator. Pure and deterministic given an rng
 * and a vocabulary pool, mirroring the pattern in src/lib/srs/sm2.ts. This is
 * a stand-in for the templated `quiz_templates`/`quiz_questions` engine in
 * db/schema.sql (see ROADMAP.md Phase 4) — it draws real questions from the
 * user's actual vocabulary bank plus the app's I'rab/wazn data, so every
 * question is still backed by verified data, just generated in the browser.
 */

import { sampleSentences } from "@/lib/data/sample-sentence";
import { GRAMMATICAL_ROLES } from "@/lib/data/grammatical-roles";
import { waznExamples } from "@/lib/data/wazn";
import { buildOptions, mulberry32, shuffle } from "@/lib/quiz/primitives";

export { mulberry32 };

/** The minimal shape a vocab quiz needs — VocabularyCardDTO satisfies this. */
export interface VocabPoolItem {
  id: number;
  wordAr: string;
  transliteration: string;
  meaningEn: string;
  root: string;
}

export type QuizTopic = "mixed" | "vocab" | "irab" | "sarf" | "meaning";

export interface QuizQuestion {
  id: string;
  topic: "vocab" | "irab" | "sarf" | "meaning";
  promptEn: string;
  promptAr: string;
  options: string[];
  correctIndex: number;
  ruleReference?: string;
  aiGenerated?: boolean;
}

function vocabQuestions(rng: () => number, vocabulary: VocabPoolItem[]): QuizQuestion[] {
  // Need at least one distractor, so at least 2 distinct values, to ask a
  // meaningful multiple-choice question at all.
  if (vocabulary.length < 2) return [];

  const meanings = vocabulary.map((c) => c.meaningEn);
  const roots = vocabulary.map((c) => c.root).filter((r) => r.length > 0);
  const questions: QuizQuestion[] = [];

  for (const card of vocabulary) {
    const meaning = buildOptions(card.meaningEn, meanings, rng);
    questions.push({
      id: `vocab-meaning-${card.id}`,
      topic: "vocab",
      promptAr: card.wordAr,
      promptEn: `What does "${card.wordAr}"${card.transliteration ? ` (${card.transliteration})` : ""} mean?`,
      options: meaning.options,
      correctIndex: meaning.correctIndex,
    });

    if (card.root && roots.length >= 2) {
      const root = buildOptions(card.root, roots, rng);
      questions.push({
        id: `vocab-root-${card.id}`,
        topic: "vocab",
        promptAr: card.wordAr,
        promptEn: `What is the root (jadhr) of "${card.wordAr}"?`,
        options: root.options,
        correctIndex: root.correctIndex,
      });
    }
  }
  return questions;
}

function irabQuestions(rng: () => number): QuizQuestion[] {
  const roleNames = Object.values(GRAMMATICAL_ROLES).map((r) => r.nameEn);
  const questions: QuizQuestion[] = [];

  for (const sentence of sampleSentences) {
    const fullText = sentence.tokens
      .slice()
      .sort((a, b) => a.positionInUnit - b.positionInUnit)
      .map((t) => t.surfaceForm)
      .join(" ");

    for (const edge of sentence.edges) {
      const token = sentence.tokens.find((t) => t.id === edge.tokenId);
      if (!token) continue;
      const built = buildOptions(edge.role.nameEn, roleNames, rng);
      questions.push({
        id: `irab-${sentence.id}-${token.id}`,
        topic: "irab",
        promptAr: fullText,
        promptEn: `In "${fullText}", what is the grammatical role (mawqi') of "${token.surfaceForm}"?`,
        options: built.options,
        correctIndex: built.correctIndex,
        ruleReference: edge.role.ruleReference,
      });
    }
  }
  return questions;
}

function meaningQuestions(rng: () => number): QuizQuestion[] {
  // Only sampleSentences have a curated (human-verified) translation —
  // every entry currently does, but this stays defensive against a future
  // addition that doesn't, rather than quizzing on a missing translation.
  const withTranslation = sampleSentences.filter((s) => s.translationEn);
  if (withTranslation.length < 2) return [];

  const meanings = withTranslation.map((s) => s.translationEn!);
  return withTranslation.map((sentence) => {
    const fullText = sentence.tokens
      .slice()
      .sort((a, b) => a.positionInUnit - b.positionInUnit)
      .map((t) => t.surfaceForm)
      .join(" ");
    const built = buildOptions(sentence.translationEn!, meanings, rng);
    return {
      id: `meaning-${sentence.id}`,
      topic: "meaning" as const,
      promptAr: fullText,
      promptEn: `What does this sentence mean?`,
      options: built.options,
      correctIndex: built.correctIndex,
    };
  });
}

function sarfQuestions(rng: () => number): QuizQuestion[] {
  const formLabels = waznExamples.map((w) => `Form ${w.form} (${w.patternAr})`);
  return waznExamples.map((verb) => {
    const correct = `Form ${verb.form} (${verb.patternAr})`;
    const built = buildOptions(correct, formLabels, rng);
    return {
      id: `sarf-${verb.verbAr}`,
      topic: "sarf" as const,
      promptAr: verb.verbAr,
      promptEn: `Which verb form (wazn) is "${verb.verbAr}" (${verb.transliteration}, "${verb.meaningEn}")?`,
      options: built.options,
      correctIndex: built.correctIndex,
    };
  });
}

/**
 * Generates up to `count` questions for a topic, with no repeated question
 * within a session. If the underlying data bank has fewer unique questions
 * than requested, returns fewer rather than repeating any.
 */
export function generateQuizQuestions(
  topic: QuizTopic,
  count: number,
  vocabulary: VocabPoolItem[],
  rng: () => number = Math.random
): QuizQuestion[] {
  const pool =
    topic === "vocab"
      ? vocabQuestions(rng, vocabulary)
      : topic === "irab"
        ? irabQuestions(rng)
        : topic === "sarf"
          ? sarfQuestions(rng)
          : topic === "meaning"
            ? meaningQuestions(rng)
            : [...vocabQuestions(rng, vocabulary), ...irabQuestions(rng), ...sarfQuestions(rng), ...meaningQuestions(rng)];

  return shuffle(pool, rng).slice(0, count);
}
