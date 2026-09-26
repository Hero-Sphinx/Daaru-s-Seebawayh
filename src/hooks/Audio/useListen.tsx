"use client";

import { useCallback, useState } from "react";
import { listenArabic, playClip, wordAudioUrl } from "@/helpers";

type QuranOccurrence = { chapter: number; verse: number; word: number } | null | undefined;

/**
 * Pronunciation for a vocabulary word, with the one error message to show
 * when nothing could play. Shared by the word bank and the flashcards.
 */
export default function useListen() {
  const [speechError, setSpeechError] = useState<string | null>(null);

  const listen = useCallback(async (wordAr: string, quran?: QuranOccurrence) => {
    setSpeechError(null);
    const result = await listenArabic(wordAr, quran);
    if (!result.ok) setSpeechError(result.message ?? "Couldn't play the pronunciation.");
  }, []);

  /** The word as recited in the Qur'an (audio: Quran.com). */
  const playRecitation = useCallback((o: { chapter: number; verse: number; word: number }) => {
    setSpeechError(null);
    playClip(wordAudioUrl(o.chapter, o.verse, o.word)).catch(() => setSpeechError("Couldn't load the recitation — check your connection."));
  }, []);

  const dismissSpeechError = useCallback(() => setSpeechError(null), []);

  return { listen, playRecitation, speechError, dismissSpeechError };
}
