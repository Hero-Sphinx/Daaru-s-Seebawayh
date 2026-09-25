"use client";

import { useState } from "react";
import type { VocabularyCardDTO } from "@/lib/vocabulary";
import { VolumeIcon } from "@/components/icons";
import { speakArabic } from "@/lib/speech";
import { playClip } from "@/lib/audio-player";
import { wordAudioUrl } from "@/lib/quran/audio";

interface ReviewOutcome {
  vocabItemId: number;
  wordAr: string;
  quality: number;
  dueAt: string;
}

type QualityButton = { label: string; quality: number; className: string };

const SM2_BUTTONS: QualityButton[] = [
  { label: "Again", quality: 0, className: "bg-rose-100 text-rose-800 hover:bg-rose-200 dark:bg-rose-950 dark:text-rose-200" },
  { label: "Hard", quality: 2, className: "bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-950 dark:text-amber-200" },
  { label: "Good", quality: 4, className: "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-950 dark:text-emerald-200" },
  { label: "Easy", quality: 5, className: "bg-sky-100 text-sky-800 hover:bg-sky-200 dark:bg-sky-950 dark:text-sky-200" },
];

// Leitner only distinguishes recalled vs. missed (src/lib/srs/leitner.ts).
const LEITNER_BUTTONS: QualityButton[] = [
  { label: "Didn't know it", quality: 0, className: "bg-rose-100 text-rose-800 hover:bg-rose-200 dark:bg-rose-950 dark:text-rose-200" },
  { label: "Knew it", quality: 4, className: "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-950 dark:text-emerald-200" },
];

export default function VocabularyPractice({
  initialQueue,
  algorithm,
}: {
  initialQueue: VocabularyCardDTO[];
  algorithm: "sm2" | "leitner";
}) {
  const buttons = algorithm === "leitner" ? LEITNER_BUTTONS : SM2_BUTTONS;
  const [queue] = useState(initialQueue);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [outcomes, setOutcomes] = useState<ReviewOutcome[]>([]);
  const [speechError, setSpeechError] = useState<string | null>(null);

  const current = queue[index];
  const sessionDone = index >= queue.length;

  async function handleSpeak(wordAr: string) {
    const result = await speakArabic(wordAr);
    if (!result.spoke) {
      setSpeechError(
        result.reason === "no-arabic-voice"
          ? "No Arabic voice is installed on this device, so it can't be read aloud. On Windows, add one under Settings → Time & Language → Speech; Microsoft Edge also ships with more voices by default than some other browsers."
          : "Your browser doesn't support text-to-speech."
      );
    }
  }

  async function grade(quality: number) {
    if (!current || current.cardId === null || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/srs/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardId: current.cardId, quality }),
      });
      if (!res.ok) throw new Error("Review failed to save");
      const result: { dueAt: string } = await res.json();
      setOutcomes((prev) => [...prev, { vocabItemId: current.id, wordAr: current.wordAr, quality, dueAt: result.dueAt }]);
      setFlipped(false);
      setIndex((i) => i + 1);
    } catch {
      setError("Couldn't save that review — check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (sessionDone) {
    return (
      <div className="rounded-lg border border-stone-200 bg-white p-6 dark:border-stone-700/60 dark:bg-parchment-800">
        <h3 className="mb-4 text-lg font-medium">Session complete</h3>
        {outcomes.length === 0 ? (
          <p className="text-sm text-muted">No cards were due for review.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {outcomes.map((o) => (
              <li key={o.vocabItemId} className="flex justify-between">
                <span dir="rtl" className="font-arabic text-lg">
                  {o.wordAr}
                </span>
                <span className="text-muted">
                  next review {new Date(o.dueAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-stone-200 bg-white p-6 dark:border-stone-700/60 dark:bg-parchment-800">
      <div className="mb-4 flex items-center justify-between text-xs">
        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
          Card {index + 1} of {queue.length}
        </span>
        <span className="rounded-full bg-stone-100 px-2.5 py-1 font-mono dark:bg-stone-700">
          {algorithm === "leitner" ? `box ${current.leitnerBox} of 5` : current.source}
        </span>
      </div>

      <div className={`card-flip mx-auto h-64 w-full cursor-pointer ${flipped ? "flipped" : ""}`} onClick={() => setFlipped((f) => !f)}>
        <div className="card-inner relative h-full w-full rounded-md border-2 border-emerald-600/30 bg-parchment-50 dark:border-emerald-500/40 dark:bg-parchment-900">
          <div className="card-front absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            <span className="mb-2 text-xs text-stone-400">Arabic word · click card to flip</span>
            <div dir="rtl" className="arabic-display mb-3 font-arabic font-bold text-emerald-900 dark:text-amber-200">
              {current.wordAr}
            </div>
            <p className="mb-2 text-sm text-muted">{current.transliteration}</p>
            <div className="flex flex-wrap justify-center gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSpeak(current.wordAr);
                }}
                className="flex items-center gap-1.5 rounded-full p-2 text-sm text-emerald-600 transition hover:bg-emerald-50 hover:text-emerald-500 dark:hover:bg-emerald-900/30"
              >
                <VolumeIcon className="h-4 w-4" /> Listen
              </button>
              {current.quranOccurrence && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const o = current.quranOccurrence!;
                    setSpeechError(null);
                    playClip(wordAudioUrl(o.chapter, o.verse, o.word)).catch(() =>
                      setSpeechError("Couldn't load the recitation — check your connection.")
                    );
                  }}
                  title={`Recited as ${current.quranOccurrence.surface} in ${current.quranOccurrence.chapter}:${current.quranOccurrence.verse} (audio: Quran.com)`}
                  className="flex items-center gap-1.5 rounded-full p-2 text-sm text-amber-700 transition hover:bg-amber-50 dark:text-amber-300 dark:hover:bg-amber-900/30"
                >
                  <VolumeIcon className="h-4 w-4" /> In the Qur&apos;an ({current.quranOccurrence.chapter}:{current.quranOccurrence.verse})
                </button>
              )}
            </div>
            {speechError && (
              <p className="mt-1 max-w-xs text-[11px] text-amber-700 dark:text-amber-400">
                {speechError}{" "}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSpeechError(null);
                  }}
                  className="underline"
                >
                  Dismiss
                </button>
              </p>
            )}
          </div>

          <div className="card-back absolute inset-0 flex flex-col items-center justify-center rounded-md bg-stone-50 p-6 text-center dark:bg-parchment-800">
            <h3 className="mb-3 text-2xl font-bold">{current.meaningEn}</h3>
            <p dir="rtl" className="mb-1 font-arabic text-sm text-muted">
              الجذر: {current.root}
            </p>
            <p dir="rtl" className="max-w-full overflow-hidden text-ellipsis rounded-lg border border-stone-200 bg-stone-100 p-2.5 font-arabic text-xs italic text-stone-700 dark:border-stone-700 dark:bg-parchment-900 dark:text-stone-200">
              {current.exampleAr}
            </p>
          </div>
        </div>
      </div>

      {error && <p className="mt-4 text-center text-sm text-rose-600 dark:text-rose-400">{error}</p>}

      {flipped ? (
        <div className="mt-6 flex justify-center gap-3">
          {buttons.map((btn) => (
            <button
              key={btn.quality}
              onClick={() => grade(btn.quality)}
              disabled={submitting}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition disabled:opacity-50 ${btn.className}`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      ) : (
        <p className="mt-6 text-center text-sm text-stone-400">Recall the meaning, then click the card to check yourself.</p>
      )}
    </div>
  );
}
