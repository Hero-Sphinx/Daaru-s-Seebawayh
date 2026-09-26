"use client";

import { useState } from "react";
import { VolumeIcon } from "@/components";
import { useKeyboardShortcuts, useListen } from "@/hooks";
import type { VocabularyCardDTO } from "@/types";
import { errorMessage, fetcher } from "@/constants";

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

// Leitner only distinguishes recalled vs. missed (src/helpers/srs/leitner.ts).
const LEITNER_BUTTONS: QualityButton[] = [
  { label: "Didn't know it", quality: 0, className: "bg-rose-100 text-rose-800 hover:bg-rose-200 dark:bg-rose-950 dark:text-rose-200" },
  { label: "Knew it", quality: 4, className: "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-950 dark:text-emerald-200" },
];

// Practice rounds (reloaded cards) aren't saved to the schedule — just known / missed.
const PRACTICE_BUTTONS: QualityButton[] = LEITNER_BUTTONS;

function shuffled<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function VocabularyPractice({
  initialQueue,
  allCards,
  algorithm,
}: {
  initialQueue: VocabularyCardDTO[];
  /** Every word in the bank — "Reload cards" practises these as often as the learner likes. */
  allCards: VocabularyCardDTO[];
  algorithm: "sm2" | "leitner";
}) {
  const [mode, setMode] = useState<"review" | "practice">("review");
  const buttons = mode === "practice" ? PRACTICE_BUTTONS : algorithm === "leitner" ? LEITNER_BUTTONS : SM2_BUTTONS;
  const [queue, setQueue] = useState(initialQueue);
  const [practice, setPractice] = useState({ known: 0, missed: 0, rounds: 0 });
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [outcomes, setOutcomes] = useState<ReviewOutcome[]>([]);
  const { listen, playRecitation, speechError, dismissSpeechError } = useListen();

  // Words added below (or due since the page loaded) join the review queue
  // when the page refreshes, instead of waiting for a full reload.
  const [seenQueue, setSeenQueue] = useState(initialQueue);
  if (initialQueue !== seenQueue) {
    setSeenQueue(initialQueue);
    if (mode === "review") setQueue((q) => [...q, ...initialQueue.filter((c) => !q.some((x) => x.id === c.id))]);
  }

  const current = queue[index];
  const sessionDone = index >= queue.length;

  // Space / Enter flips the card; once it's flipped, 1-4 grade it (left to right).
  useKeyboardShortcuts(
    {
      " ": () => setFlipped((f) => !f),
      Enter: () => setFlipped((f) => !f),
      ...Object.fromEntries(buttons.map((b, i) => [String(i + 1), () => flipped && grade(b.quality)])),
    },
    !sessionDone
  );


  /** A fresh, shuffled practice round over every word — as many times as the learner wants. Not saved to the schedule. */
  function reloadCards() {
    setQueue(shuffled(allCards));
    setIndex(0);
    setFlipped(false);
    setError(null);
    dismissSpeechError();
    setMode("practice");
    setPractice((p) => ({ known: 0, missed: 0, rounds: p.rounds + 1 }));
  }

  async function grade(quality: number) {
    if (!current || submitting) return;
    if (mode === "practice") {
      // A missed word comes back at the end of the round.
      if (quality === 0) setQueue((q) => [...q, current]);
      setPractice((p) => (quality === 0 ? { ...p, missed: p.missed + 1 } : { ...p, known: p.known + 1 }));
      setFlipped(false);
      setIndex((i) => i + 1);
      return;
    }
    if (current.cardId === null) return;
    setSubmitting(true);
    setError(null);
    try {
      const result = await fetcher<{ dueAt: string }>("/api/srs/review", { method: "POST", json: { cardId: current.cardId, quality } });
      setOutcomes((prev) => [...prev, { vocabItemId: current.id, wordAr: current.wordAr, quality, dueAt: result.dueAt }]);
      setFlipped(false);
      setIndex((i) => i + 1);
    } catch (err) {
      setError(errorMessage(err, "Couldn't save that review — please try again."));
    } finally {
      setSubmitting(false);
    }
  }

  const reloadButton = (big: boolean) =>
    allCards.length > 0 && (
      <button
        type="button"
        onClick={reloadCards}
        className={
          big
            ? "mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-700 px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:opacity-90"
            : "inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
        }
      >
        <span aria-hidden>↻</span> {big ? `Reload cards — practise all ${allCards.length} words` : "Reload cards"}
      </button>
    );

  if (sessionDone && mode === "practice") {
    const total = practice.known + practice.missed;
    return (
      <div className="rounded-2xl border border-emerald-200 bg-surface p-6 text-center shadow-sm dark:border-emerald-900/60">
        <p className="font-arabic text-2xl text-emerald-800 dark:text-amber-200" lang="ar" dir="rtl">
          أَحْسَنْتَ
        </p>
        <h3 className="mt-1 text-lg font-semibold">Practice round complete</h3>
        <p className="mt-2 text-sm text-muted">
          {practice.known} known{practice.missed > 0 && ` · ${practice.missed} to revisit (they came back until you got them)`} · {total} cards
        </p>
        <p className="mt-1 text-xs text-muted">Practice rounds don&apos;t change your review schedule.</p>
        {reloadButton(true)}
      </div>
    );
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
        {reloadButton(true)}
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-stone-200 bg-white p-6 dark:border-stone-700/60 dark:bg-parchment-800">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
          {mode === "practice" ? "Practice" : "Card"} {index + 1} of {queue.length}
        </span>
        <div className="flex items-center gap-2">
          {mode === "practice" ? (
            <span className="rounded-full bg-amber-100 px-2.5 py-1 font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-300" title="Practice rounds don't change your review schedule">
              practice · not scheduled
            </span>
          ) : (
            <span className="rounded-full bg-stone-100 px-2.5 py-1 font-mono dark:bg-stone-700">
              {algorithm === "leitner" ? `box ${current.leitnerBox} of 5` : current.source}
            </span>
          )}
          {reloadButton(false)}
        </div>
      </div>

      <div
        role="button"
        tabIndex={0}
        aria-pressed={flipped}
        aria-label={flipped ? "Show the Arabic side" : "Show the meaning"}
        className={`card-flip mx-auto h-64 w-full cursor-pointer ${flipped ? "flipped" : ""}`}
        onClick={() => setFlipped((f) => !f)}
      >
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
                  listen(current.wordAr, current.quranOccurrence);
                }}
                className="flex items-center gap-1.5 rounded-full p-2 text-sm text-emerald-600 transition hover:bg-emerald-50 hover:text-emerald-500 dark:hover:bg-emerald-900/30"
              >
                <VolumeIcon className="h-4 w-4" /> Listen
              </button>
              {current.quranOccurrence && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    playRecitation(current.quranOccurrence!);
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
                    dismissSpeechError();
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
            {current.root && (
              <p dir="rtl" className="mb-1 font-arabic text-sm text-muted">
                الجذر: {current.root}
              </p>
            )}
            {current.exampleAr && (
              <p dir="rtl" className="max-w-full overflow-hidden text-ellipsis rounded-lg border border-stone-200 bg-stone-100 p-2.5 font-arabic text-xs italic text-stone-700 dark:border-stone-700 dark:bg-parchment-900 dark:text-stone-200">
                {current.exampleAr}
              </p>
            )}
          </div>
        </div>
      </div>

      {error && <p className="mt-4 text-center text-sm text-rose-600 dark:text-rose-400">{error}</p>}

      {flipped ? (
        <div className="mt-6 flex justify-center gap-3">
          {buttons.map((btn, i) => (
            <button
              key={btn.quality}
              onClick={() => grade(btn.quality)}
              title={`Shortcut: ${i + 1}`}
              disabled={submitting}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition disabled:opacity-50 ${btn.className}`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      ) : (
        <p className="mt-6 text-center text-sm text-stone-400">Recall the meaning, then click the card (or press Space) to check yourself.</p>
      )}
    </div>
  );
}
