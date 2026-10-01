"use client";

import { useState } from "react";
import type { StoryQuestion } from "@/types";

/** A few comprehension questions after the story — answered on the page, nothing is recorded. */
export default function StoryQuiz({ questions }: { questions: StoryQuestion[] }) {
  const [answers, setAnswers] = useState<(number | null)[]>(() => questions.map(() => null));
  const answered = answers.filter((a) => a !== null).length;
  const correct = answers.filter((a, i) => a === questions[i].answer).length;

  return (
    <section aria-labelledby="story-questions" className="space-y-4">
      <h2 id="story-questions" className="text-lg font-semibold">
        Did you understand? <span className="font-arabic text-muted">هَلْ فَهِمْتَ؟</span>
      </h2>
      <ol className="space-y-4">
        {questions.map((q, qi) => {
          const chosen = answers[qi];
          return (
            <li key={qi} className="rounded-2xl border border-border bg-surface p-4">
              <p dir="rtl" className="font-arabic text-2xl leading-loose">
                {q.questionAr}
              </p>
              <p className="mb-3 text-sm text-muted">{q.questionEn}</p>
              <div dir="rtl" className="flex flex-wrap gap-2">
                {q.choices.map((choice, ci) => {
                  const isChosen = chosen === ci;
                  const isAnswer = ci === q.answer;
                  const state =
                    chosen === null
                      ? "border-border hover:border-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                      : isAnswer
                        ? "border-emerald-500 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-100"
                        : isChosen
                          ? "border-rose-400 bg-rose-50 text-rose-900 dark:bg-rose-950/40 dark:text-rose-100"
                          : "border-border opacity-60";
                  return (
                    <button
                      key={ci}
                      type="button"
                      disabled={chosen !== null}
                      onClick={() => setAnswers((a) => a.map((v, i) => (i === qi ? ci : v)))}
                      className={`rounded-xl border px-4 py-1.5 font-arabic text-xl leading-loose transition ${state}`}
                    >
                      {choice}
                    </button>
                  );
                })}
              </div>
              {chosen !== null && (
                <p className="mt-2 text-sm font-medium">{chosen === q.answer ? "✅ Correct — أَحْسَنْتَ!" : "Not quite — the right answer is highlighted in green."}</p>
              )}
            </li>
          );
        })}
      </ol>
      {answered === questions.length && (
        <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100">
          {correct === questions.length ? `All ${correct} right — مَا شَاءَ اللهُ! 🌟` : `${correct} of ${questions.length} right. Read the story once more and try again tomorrow 💪`}
        </p>
      )}
    </section>
  );
}
