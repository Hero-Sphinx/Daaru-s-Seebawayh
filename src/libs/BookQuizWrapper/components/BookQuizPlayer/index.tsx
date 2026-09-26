"use client";

import { useState } from "react";
import { type PlayableQuestion, PlayIcon, QuizPlayer, SlidersIcon } from "@/components";
import { shuffle } from "@/helpers";
import type { PlayableBookQuizQuestion } from "@/types";
import { fetcher, logQuizAttempt } from "@/constants";

const SUBTYPE_LABELS: Record<string, string> = {
  fawaid_recall: "Fawā'id recall",
  irab_reconstruction: "In-context I'rab",
  book_comprehension: "Comprehension",
  sentence_meaning_match: "Sentence meaning",
};

async function fetchBank(documentId: string): Promise<PlayableBookQuizQuestion[]> {
  return (await fetcher<{ questions: PlayableBookQuizQuestion[] }>(`/api/library/${documentId}/quiz`)).questions;
}

export default function BookQuizPlayer({
  documentId,
  initialBank,
  canRegenerate,
}: {
  documentId: string;
  /** Loaded on the server with the page, so there's no loading flash. */
  initialBank: PlayableBookQuizQuestion[];
  /** Owners may throw the bank away and build a fresh one. */
  canRegenerate: boolean;
}) {
  const [bank, setBank] = useState(initialBank);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [subtype, setSubtype] = useState<string>("all");
  const [count, setCount] = useState(5);
  const [playing, setPlaying] = useState<(PlayableBookQuizQuestion & PlayableQuestion)[] | null>(null);

  async function handleGenerate(regenerate = false) {
    setGenerating(true);
    setError(null);
    setNotice(null);
    try {
      await fetcher(`/api/library/${documentId}/quiz`, {
        method: "POST",
        json: { regenerate },
        // Generation calls the word-analysis service per Arabic word and, for
        // comprehension questions, Gemini with retries — worst case is
        // genuinely slow. Cap the wait client-side too so it never looks like
        // an infinite hang; questions already written stay cached.
        signal: AbortSignal.timeout(180_000),
      });
      const freshBank = await fetchBank(documentId);
      setBank(freshBank);
      setSubtype("all");
      if (freshBank.length === 0) {
        setNotice(
          "No questions could be made from this book yet. They come from its fawā'id (generate a summary first), from sentences the grammar parser can analyse, and — when the AI service is available — from comprehension questions. Try again later."
        );
      }
    } catch (err) {
      setError(
        err instanceof DOMException && err.name === "TimeoutError"
          ? "This is taking longer than expected — the analysis services may be busy. Please try again in a few minutes."
          : err instanceof Error
            ? err.message
            : "Generation failed"
      );
    } finally {
      setGenerating(false);
    }
  }

  function startQuiz() {
    const pool = subtype === "all" ? bank : bank.filter((q) => q.subtype === subtype);
    setPlaying(shuffle(pool, Math.random).slice(0, count).map((q) => ({ ...q, badge: SUBTYPE_LABELS[q.subtype] ?? q.subtype })));
  }

  if (playing) {
    return (
      <QuizPlayer
        questions={playing}
        onAnswer={(q, isCorrect, chosenText, responseTimeMs) => logQuizAttempt({ topic: q.subtype, isCorrect, userAnswer: chosenText, responseTimeMs })}
        onRestart={() => setPlaying(null)}
      />
    );
  }

  if (bank.length === 0) {
    return (
      <div className="space-y-3 rounded-lg border border-stone-200 bg-white p-5 text-center dark:border-stone-700/60 dark:bg-parchment-800">
        <p className="text-sm text-muted">
          No quiz questions generated yet for this book. Fawā&apos;id-recall and in-context I&apos;rab questions are built
          deterministically from what&apos;s already extracted; comprehension questions need Gemini (skipped if not
          configured).
        </p>
        <button
          onClick={() => handleGenerate()}
          disabled={generating}
          className="rounded-md bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-600 disabled:opacity-50"
        >
          {generating ? "Generating…" : "Generate book quiz"}
        </button>
        {generating && (
          <p className="text-xs text-stone-400">
            This can take up to a couple of minutes — it&apos;s analyzing real sentences and, if configured, asking Gemini
            comprehension questions. Not frozen.
          </p>
        )}
        {error && <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>}
        {notice && <p className="text-sm text-amber-700 dark:text-amber-400">{notice}</p>}
      </div>
    );
  }

  const counts = {
    fawaid_recall: bank.filter((q) => q.subtype === "fawaid_recall").length,
    irab_reconstruction: bank.filter((q) => q.subtype === "irab_reconstruction").length,
    book_comprehension: bank.filter((q) => q.subtype === "book_comprehension").length,
    sentence_meaning_match: bank.filter((q) => q.subtype === "sentence_meaning_match").length,
  };

  return (
    <div className="mx-auto max-w-2xl space-y-5 rounded-lg border border-stone-200 bg-white p-6 dark:border-stone-700/60 dark:bg-parchment-800">
      <h3 className="flex items-center gap-2 border-b border-stone-200 pb-2 text-lg font-bold dark:border-stone-700">
        <SlidersIcon className="h-5 w-5 text-amber-500" /> Book quiz configuration
      </h3>

      <div>
        <label htmlFor="book-quiz-subtype" className="mb-1 block text-xs font-semibold text-muted">
          Question type:
        </label>
        <select
          id="book-quiz-subtype"
          value={subtype}
          onChange={(e) => setSubtype(e.target.value)}
          className="w-full rounded-md border border-stone-300 bg-stone-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 dark:border-stone-600 dark:bg-parchment-900"
        >
          <option value="all">All ({bank.length})</option>
          <option value="fawaid_recall" disabled={counts.fawaid_recall === 0}>
            Fawā&apos;id recall ({counts.fawaid_recall})
          </option>
          <option value="irab_reconstruction" disabled={counts.irab_reconstruction === 0}>
            In-context I&apos;rab ({counts.irab_reconstruction})
          </option>
          <option value="book_comprehension" disabled={counts.book_comprehension === 0}>
            Comprehension ({counts.book_comprehension})
          </option>
          <option value="sentence_meaning_match" disabled={counts.sentence_meaning_match === 0}>
            Sentence meaning ({counts.sentence_meaning_match})
          </option>
        </select>
      </div>

      <div>
        <span className="mb-1 block text-xs font-semibold text-muted">Number of questions:</span>
        <div className="grid grid-cols-3 gap-2">
          {[5, 10, 15].map((n) => (
            <button
              key={n}
              onClick={() => setCount(n)}
              className={`rounded-md border py-2 text-sm font-semibold transition ${
                count === n
                  ? "border-teal-600 bg-teal-50 text-teal-800 dark:bg-teal-950 dark:text-teal-300"
                  : "border-stone-300 text-stone-600 dark:border-stone-700 dark:text-stone-300"
              }`}
            >
              {n} items
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={startQuiz}
        className="mt-2 flex w-full items-center justify-center gap-2 rounded-md bg-teal-700 py-3 text-base font-bold text-white transition hover:bg-teal-600"
      >
        <PlayIcon className="h-4 w-4" /> Start book quiz
      </button>

      {canRegenerate && (
        <div className="space-y-1 text-center text-xs text-muted">
          <button type="button" onClick={() => handleGenerate(true)} disabled={generating} className="underline-offset-2 hover:text-foreground hover:underline disabled:opacity-60">
            {generating ? "Rebuilding the questions…" : "Rebuild the questions (e.g. after generating new fawā'id)"}
          </button>
          {error && <p className="text-rose-600 dark:text-rose-400">{error}</p>}
        </div>
      )}
    </div>
  );
}
