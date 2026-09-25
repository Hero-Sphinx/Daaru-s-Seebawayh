import { NextResponse } from "next/server";
import { isArabicWord } from "@/lib/arabic-script";
import { analyzeWord, CamelServiceUnavailableError, type CamelCandidate } from "@/lib/camel-client";
import { generateStructured, GeminiNotConfiguredError, GeminiQuotaExhaustedError } from "@/lib/gemini-client";
import { buildWordLookupPrompt, WORD_LOOKUP_SCHEMA, type WordLookupResult } from "@/lib/vocabulary-lookup";

interface LookupBody {
  input: string;
  /**
   * false: CAMeL only — no Gemini call (a meaning already in the cache is
   * still returned, since it costs nothing). The Library reader sends false
   * on every click and asks for the meaning only when the learner does.
   */
  withMeaning?: boolean;
}

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
 * spelling + meaning + transliteration (Gemini — see vocabulary-lookup.ts
 * for why), plus root/lemma/POS candidates for that spelling (CAMeL Tools,
 * deterministic, same as /api/vocabulary/enrich). If Gemini isn't
 * configured, falls back to CAMeL-only enrichment of already-Arabic input
 * (no meaning/transliteration auto-fill, no transliteration-input support)
 * rather than failing outright.
 */
export async function POST(request: Request) {
  const body = (await request.json()) as LookupBody;
  const input = body.input?.trim();
  if (!input) {
    return NextResponse.json({ error: "input is required" }, { status: 400 });
  }

  const cacheKey = input.normalize("NFC");
  let lookup: WordLookupResult | null = lookupCache.get(cacheKey) ?? null;
  const withMeaning = body.withMeaning !== false;
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
      const message =
        err instanceof GeminiNotConfiguredError
          ? "Looking up a word by transliteration needs Gemini configured (GEMINI_API_KEY) — or type the word in Arabic script instead."
          : "Word lookup failed — try typing the word in Arabic script instead.";
      return NextResponse.json({ error: message }, { status: err instanceof GeminiNotConfiguredError ? 503 : 502 });
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

  return NextResponse.json({
    arabicWord,
    meaningEn: lookup?.meaningEn ?? null,
    transliteration: lookup?.transliteration ?? null,
    aiAssisted: lookup !== null,
    camelCandidates,
  });
}
