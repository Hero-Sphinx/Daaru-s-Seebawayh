/**
 * Book quiz question generation (FR-3.1, FR-3.2). Two of the three subtypes
 * are fully deterministic, reusing data already collected elsewhere — only
 * "comprehension" needs an LLM (src/lib/library/quiz-comprehension.ts), and
 * that's built separately so this module stays testable without a network
 * call. See README.md's AI usage policy.
 */

import type { RoleCode } from "@/types/irab";
import { GRAMMATICAL_ROLES } from "@/lib/data/grammatical-roles";
import { buildOptions } from "@/lib/quiz/primitives";
import { tokenizeSentence } from "@/lib/irab/tokenize";
import { isHarfJarr } from "@/lib/irab/particles";
import { isArabicWord, isMostlyArabic } from "@/lib/arabic-script";
import { parseFreeText, type RawCandidate, type TokenInput } from "@/lib/irab/free-text-parser";

export interface BookQuizQuestion {
  subtype: "fawaid_recall" | "irab_excerpt";
  promptEn: string;
  promptAr: string;
  options: string[];
  correctIndex: number;
  pageNumber?: number;
  ruleReference?: string;
}

export interface FawaidPoolItem {
  id: number;
  title: string;
  bodyEn: string | null;
  pageNumber: number | null;
}

/**
 * MCQs grounded in already-extracted Fawā'id (FR-3.2 "Linguistic Gem
 * Identification"). The Fawā'id themselves came from Gemini (see
 * library/summarize.ts) so these questions inherit that "AI-generated,
 * unverified" status — this function itself does no AI, it just reformats
 * existing rows into quiz form, same pattern as the vocab quiz.
 */
export function buildFawaidQuestions(items: FawaidPoolItem[], rng: () => number): BookQuizQuestion[] {
  const withBody = items.filter((f): f is FawaidPoolItem & { bodyEn: string } => !!f.bodyEn?.trim());
  if (withBody.length < 2) return [];

  const bodies = withBody.map((f) => f.bodyEn);
  return withBody.map((f) => {
    const built = buildOptions(f.bodyEn, bodies, rng);
    return {
      subtype: "fawaid_recall" as const,
      promptAr: f.title,
      promptEn: `What does the fawā'id "${f.title}" refer to?`,
      options: built.options,
      correctIndex: built.correctIndex,
      pageNumber: f.pageNumber ?? undefined,
    };
  });
}

export interface ExcerptTextUnit {
  pageNumber: number | null;
  text: string;
}

const MIN_SENTENCE_WORDS = 2;
const MAX_SENTENCE_WORDS = 8;

/** Splits page text into sentence-like chunks: one per line, or on sentence-final punctuation. */
export function splitIntoSentences(text: string): string[] {
  return text
    .split(/[\n.!?؟]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export interface SelectedSentence {
  text: string;
  pageNumber?: number;
}

/**
 * Picks a handful of real, reasonably-sized Arabic sentences from the book
 * — same filtering as buildIrabExcerptQuestions (mostly-Arabic pages only,
 * word-count bounds so a "sentence" isn't a stray fragment or a whole
 * paragraph), but without needing a CAMeL call per word, since meaning
 * matching only needs the sentence text itself, not its grammar. Used by
 * the sentence_meaning_match book quiz subtype (src/lib/library/quiz-meaning-match.ts).
 */
export function selectSentencesForMeaningMatch(
  textUnits: ExcerptTextUnit[],
  maxUnits = 4,
  maxSentencesPerUnit = 2
): SelectedSentence[] {
  const selected: SelectedSentence[] = [];
  const arabicUnits = textUnits.filter((u) => isMostlyArabic(u.text));

  for (const unit of arabicUnits.slice(0, maxUnits)) {
    const sentences = splitIntoSentences(unit.text)
      .filter((s) => isMostlyArabic(s))
      .filter((s) => {
        const wordCount = tokenizeSentence(s).length;
        return wordCount >= MIN_SENTENCE_WORDS && wordCount <= MAX_SENTENCE_WORDS;
      })
      .slice(0, maxSentencesPerUnit);
    for (const text of sentences) selected.push({ text, pageNumber: unit.pageNumber ?? undefined });
  }
  return selected;
}

/**
 * MCQs excerpting real sentences from the book and asking for a word's
 * syntactic role (FR-3.2 "In-Context I'rab Drills") — reuses the same
 * deterministic free-text I'rab parser the I'rab Workspace uses
 * (src/lib/irab/free-text-parser.ts), so a question is only produced when
 * the excerpt fully resolves (no unparsed tokens) under that parser's
 * normal rules. Since most extracted book text lacks full tashkeel (see
 * ROADMAP.md Phase 3), this will often find nothing to ask — that's the
 * parser correctly declining to guess, not a bug here.
 *
 * Pages/sentences that aren't (mostly) Arabic are filtered out before any
 * CAMeL Tools call is made — for a mixed-language book (front matter,
 * translations, footnotes in English), sending non-Arabic text to an
 * Arabic morphological analyzer only ever wastes a network round trip for
 * a result that was always going to be empty; found this the slow way
 * against a real mixed-language upload, see ROADMAP.md.
 */
export async function buildIrabExcerptQuestions(
  textUnits: ExcerptTextUnit[],
  fetchCandidates: (word: string) => Promise<RawCandidate[]>,
  rng: () => number,
  maxUnits = 3,
  maxSentencesPerUnit = 2
): Promise<BookQuizQuestion[]> {
  const roleNames = Object.values(GRAMMATICAL_ROLES).map((r) => r.nameEn);
  const questions: BookQuizQuestion[] = [];

  const arabicUnits = textUnits.filter((u) => isMostlyArabic(u.text));

  for (const unit of arabicUnits.slice(0, maxUnits)) {
    const sentences = splitIntoSentences(unit.text)
      .filter((s) => isMostlyArabic(s))
      .slice(0, maxSentencesPerUnit);

    for (const sentence of sentences) {
      const words = tokenizeSentence(sentence);
      if (words.length < MIN_SENTENCE_WORDS || words.length > MAX_SENTENCE_WORDS) continue;

      const tokenInputs: TokenInput[] = await Promise.all(
        words.map(async (w) => ({
          surface: w,
          candidates: isHarfJarr(w) || !isArabicWord(w) ? [] : await fetchCandidates(w),
        }))
      );
      const result = parseFreeText(tokenInputs);
      if (result.patternMatched === "none") continue;
      if (result.tokens.some((t) => t.role === null)) continue; // require every word resolved — no partial guesses

      for (const t of result.tokens) {
        if (!t.role) continue;
        const role = GRAMMATICAL_ROLES[t.role as RoleCode];
        const built = buildOptions(role.nameEn, roleNames, rng);
        questions.push({
          subtype: "irab_excerpt",
          promptAr: sentence,
          promptEn: `In "${sentence}", what is the grammatical role of "${t.surface}"?`,
          options: built.options,
          correctIndex: built.correctIndex,
          pageNumber: unit.pageNumber ?? undefined,
          ruleReference: role.ruleReference,
        });
      }
    }
  }
  return questions;
}
