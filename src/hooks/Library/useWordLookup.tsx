"use client";

import { useCallback, useRef, useState } from "react";
import type { MorphCandidate, WordLookupResponse } from "@/types";
import { fetcher } from "@/constants";

export interface WordLookupResult {
  arabicWord: string;
  meaningEn: string | null;
  aiAssisted: boolean;
  camelCandidates: MorphCandidate[];
  /**
   * From parsing the word's actual sentence — only set when the deterministic
   * parser could resolve it. Real book text is usually undiacritized, so this
   * is often absent, and that's correct, not a bug.
   */
  role?: { nameEn: string; nameAr: string; caseSignEn: string; caseSignAr: string };
}

interface ParsedSentence {
  tokens: { id: number; surfaceForm: string; caseSign?: { signEn: string; signAr: string } | null }[];
  edges: { tokenId: number; role: { nameEn: string; nameAr: string } }[];
}

const postJson = <T,>(url: string, json: unknown) => fetcher<T>(url, { method: "POST", json });

/**
 * Click-a-word lookup for the Library reader. Each click supersedes the one
 * before: a slow answer for an earlier word is dropped rather than
 * overwriting the word the learner is looking at now.
 */
export default function useWordLookup() {
  const [word, setWord] = useState<string | null>(null);
  const [result, setResult] = useState<WordLookupResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meaningLoading, setMeaningLoading] = useState(false);
  const latest = useRef(0);

  const lookUp = useCallback(async (clicked: string, sentence: string) => {
    if (!clicked) return;
    const ticket = ++latest.current;
    setWord(clicked);
    setResult(null);
    setError(null);
    setLoading(true);
    // Two independent lookups, in parallel:
    // 1. root/lemma/POS (CAMeL) with withMeaning:false — the AI meaning is
    //    fetched only when the learner asks (showMeaning), so reading a page
    //    doesn't spend the daily quota word by word.
    // 2. the deterministic I'rab parser on the word's sentence, without
    //    translation (no Gemini), for its grammatical role when it can
    //    determine one.
    const [lookup, parse] = await Promise.allSettled([
      postJson<WordLookupResponse>("/api/vocabulary/lookup", { input: clicked, withMeaning: false }),
      postJson<{ sentence: ParsedSentence }>("/api/irab/parse", { text: sentence, includeTranslation: false }),
    ]);
    if (ticket !== latest.current) return;

    if (lookup.status === "rejected") {
      setError(lookup.reason instanceof Error ? lookup.reason.message : "Lookup failed");
    } else {
      let role: WordLookupResult["role"];
      if (parse.status === "fulfilled") {
        const parsed = parse.value.sentence;
        const token = parsed?.tokens.find((t) => t.surfaceForm === clicked);
        const edge = token && parsed.edges.find((e) => e.tokenId === token.id);
        if (token?.caseSign && edge) {
          role = { nameEn: edge.role.nameEn, nameAr: edge.role.nameAr, caseSignEn: token.caseSign.signEn, caseSignAr: token.caseSign.signAr };
        }
      }
      setResult({
        arabicWord: lookup.value.arabicWord,
        meaningEn: lookup.value.meaningEn ?? null,
        aiAssisted: lookup.value.aiAssisted ?? false,
        camelCandidates: lookup.value.camelCandidates ?? [],
        role,
      });
    }
    setLoading(false);
  }, []);

  const showMeaning = useCallback(async () => {
    if (!word) return;
    const ticket = latest.current;
    setMeaningLoading(true);
    setError(null);
    try {
      const body = await postJson<WordLookupResponse>("/api/vocabulary/lookup", { input: word, withMeaning: true });
      if (ticket !== latest.current) return;
      if (!body.meaningEn) throw new Error("No meaning available right now (the AI service may be unavailable or out of quota).");
      setResult((r) => (r ? { ...r, meaningEn: body.meaningEn, aiAssisted: body.aiAssisted ?? true } : r));
    } catch (err) {
      if (ticket === latest.current) setError(err instanceof Error ? err.message : "Meaning lookup failed");
    } finally {
      if (ticket === latest.current) setMeaningLoading(false);
    }
  }, [word]);

  const close = useCallback(() => {
    latest.current++;
    setWord(null);
    setLoading(false);
    setMeaningLoading(false);
  }, []);

  return { word, result, loading, error, meaningLoading, lookUp, showMeaning, close };
}
