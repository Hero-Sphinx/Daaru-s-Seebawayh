import "server-only";
import { isArabicWord } from "@/helpers";
import { ApiError, unavailable } from "@/server/constants";
import { analyzeWord, type CamelCandidate, CamelServiceUnavailableError, GeminiNotConfiguredError, GeminiQuotaExhaustedError, generateStructured } from "@/server/helpers";
import type { WordLookupResponse } from "@/types";
import { buildWordLookupPrompt, WORD_LOOKUP_SCHEMA, type WordLookupResult } from "./lookupPrompt";

/**
 * Successful Gemini lookups, keyed by input. A word's meaning doesn't change,
 * and the Library reader looks up the same common words over and over — on
 * the free tier (20 requests) every repeat click used to burn quota. Bounded,
 * oldest-first eviction (Map keeps insertion order); per server process.
 */
const LOOKUP_CACHE_MAX = 2000;
const lookupCache = new Map<string, WordLookupResult>();

function cacheLookup(key: string, value: WordLookupResult) {
  if (lookupCache.size >= LOOKUP_CACHE_MAX) lookupCache.delete(lookupCache.keys().next().value!);
  lookupCache.set(key, value);
}

/**
 * Resolves an Arabic word OR a transliteration guess into: an Arabic
 * spelling + meaning + transliteration (Gemini — see lookupPrompt.ts for
 * why), plus root/lemma/POS candidates for that spelling (CAMeL Tools,
 * deterministic). If Gemini isn't available, falls back to CAMeL-only
 * enrichment of already-Arabic input rather than failing outright.
 *
 * withMeaning=false skips Gemini entirely (a meaning already cached is still
 * returned, since it costs nothing) — the Library reader sends that on every
 * click and asks for the meaning only when the learner does.
 */
export async function lookupWord(input: string, withMeaning = true): Promise<WordLookupResponse> {
  const cacheKey = input.normalize("NFC");
  let lookup: WordLookupResult | null = lookupCache.get(cacheKey) ?? null;
  try {
    if (!lookup && withMeaning) {
      lookup = await generateStructured<WordLookupResult>(buildWordLookupPrompt(input), WORD_LOOKUP_SCHEMA);
      cacheLookup(cacheKey, lookup);
    }
  } catch (err) {
    if (err instanceof GeminiQuotaExhaustedError) {
      // Expected on the free tier — one line, not a stack trace per click.
      console.warn(`Vocabulary lookup: ${err.message.split(":")[0]} — serving CAMeL-only result`);
    } else if (!(err instanceof GeminiNotConfiguredError)) {
      console.error("Vocabulary word lookup (Gemini) failed:", err);
    }
    if (!isArabicWord(input)) {
      // Can't resolve a transliteration without Gemini — nothing useful to fall back to.
      throw err instanceof GeminiNotConfiguredError
        ? unavailable("Looking up a word by transliteration needs the AI service, which isn't configured — type the word in Arabic script instead.")
        : new ApiError(502, "Word lookup failed — try typing the word in Arabic script instead.");
    }
    // Already Arabic script — degrade to CAMeL-only (root/lemma/POS, no meaning/transliteration).
  }

  const arabicWord = lookup?.arabicWord ?? input;
  let camelCandidates: CamelCandidate[] = [];
  try {
    camelCandidates = await analyzeWord(arabicWord, true);
  } catch (err) {
    if (!(err instanceof CamelServiceUnavailableError)) throw err;
    // CAMeL unreachable — still return whatever Gemini gave us.
  }

  return {
    arabicWord,
    meaningEn: lookup?.meaningEn ?? null,
    transliteration: lookup?.transliteration ?? null,
    aiAssisted: lookup !== null,
    camelCandidates,
  };
}
