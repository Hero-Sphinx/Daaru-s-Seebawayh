/**
 * Word lookup for vocabulary entry — the user may type an Arabic word OR a
 * rough Latin transliteration (e.g. "kitab") if they don't know the script.
 * Resolves to an Arabic spelling, an English meaning, and a
 * transliteration. Uses Gemini, deliberately: unlike root/lemma/POS (always
 * CAMeL Tools, deterministic — see README.md's AI usage policy), meaning
 * and transliteration have no deterministic source in this app, and
 * "what does this word mean" / "how might this be spelled" is a dictionary-
 * lookup task, not a grammatical claim. The result is explicitly not
 * cross-checked, so the UI must label it accordingly.
 */

export interface WordLookupResult {
  arabicWord: string;
  meaningEn: string;
  transliteration: string;
}

export const WORD_LOOKUP_SCHEMA = {
  type: "object",
  properties: {
    arabicWord: { type: "string", description: "The word in Arabic script with full diacritics (tashkeel)" },
    meaningEn: { type: "string", description: "Concise English meaning/definition" },
    transliteration: { type: "string", description: "Standard Latin transliteration" },
  },
  required: ["arabicWord", "meaningEn", "transliteration"],
};

export function buildWordLookupPrompt(input: string): string {
  return `A learner is adding a word to their Arabic vocabulary flashcard app. They typed: "${input}"

This may already be Arabic script, or it may be a rough Latin-letter transliteration/approximation of how the word sounds (e.g. "kitab" for a word meaning book). Identify the single most likely word a learner would mean (if genuinely ambiguous, pick the most common everyday word) and return:
- arabicWord: the word in Arabic script with full diacritics (tashkeel)
- meaningEn: a concise English meaning
- transliteration: a standard Latin transliteration`;
}
