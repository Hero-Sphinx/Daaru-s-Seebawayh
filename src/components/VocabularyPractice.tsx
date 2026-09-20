"use client";

import { useState } from "react";
import { reviewSm2 } from "@/lib/srs/sm2";
import type { VocabularyCard } from "@/lib/data/mock-vocabulary";

interface ReviewOutcome {
  cardId: number;
  wordAr: string;
  quality: number;
  dueAt: Date;
}

const QUALITY_BUTTONS: { label: string; quality: number; className: string }[] = [
  { label: "Again", quality: 0, className: "bg-rose-100 text-rose-800 hover:bg-rose-200 dark:bg-rose-950 dark:text-rose-200" },
  { label: "Hard", quality: 2, className: "bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-950 dark:text-amber-200" },
  { label: "Good", quality: 4, className: "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-950 dark:text-emerald-200" },
  { label: "Easy", quality: 5, className: "bg-sky-100 text-sky-800 hover:bg-sky-200 dark:bg-sky-950 dark:text-sky-200" },
];

export default function VocabularyPractice({ initialQueue }: { initialQueue: VocabularyCard[] }) {
  const [queue] = useState(initialQueue);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [outcomes, setOutcomes] = useState<ReviewOutcome[]>([]);

  const current = queue[index];
  const sessionDone = index >= queue.length;

  function grade(quality: number) {
    if (!current) return;
    const result = reviewSm2(current.sm2, quality);
    setOutcomes((prev) => [...prev, { cardId: current.id, wordAr: current.wordAr, quality, dueAt: result.dueAt }]);
    setRevealed(false);
    setIndex((i) => i + 1);
  }

  if (sessionDone) {
    return (
      <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-6">
        <h3 className="mb-4 text-lg font-medium">Session complete</h3>
        <ul className="space-y-2 text-sm">
          {outcomes.map((o) => (
            <li key={o.cardId} className="flex justify-between">
              <span dir="rtl" className="font-arabic text-lg">
                {o.wordAr}
              </span>
              <span className="text-neutral-500">
                next review {o.dueAt.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
              </span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-8 text-center">
      <p className="mb-6 text-sm text-neutral-500">
        Card {index + 1} of {queue.length}
      </p>
      <div dir="rtl" className="font-arabic text-5xl mb-2">
        {current.wordAr}
      </div>
      <p className="text-sm text-neutral-500 mb-6">{current.transliteration}</p>

      {revealed ? (
        <>
          <div className="mb-6 space-y-1">
            <p className="text-lg">{current.meaningEn}</p>
            <p dir="rtl" className="font-arabic text-neutral-500">
              الجذر: {current.root}
            </p>
            <p dir="rtl" className="font-arabic text-neutral-500">
              {current.exampleAr}
            </p>
          </div>
          <div className="flex justify-center gap-3">
            {QUALITY_BUTTONS.map((btn) => (
              <button
                key={btn.quality}
                onClick={() => grade(btn.quality)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${btn.className}`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </>
      ) : (
        <button
          onClick={() => setRevealed(true)}
          className="rounded-lg bg-neutral-900 px-5 py-2 text-sm font-medium text-white hover:bg-neutral-700 dark:bg-neutral-100 dark:text-neutral-900"
        >
          Show answer
        </button>
      )}
    </div>
  );
}
