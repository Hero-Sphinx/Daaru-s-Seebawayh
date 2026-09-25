"use client";

import { useEffect, useRef, useState } from "react";
import { nowMs } from "@/helpers";
import { CheckIcon, XIcon } from "../Icons";

export interface PlayableQuestion {
  id: string | number;
  badge: string;
  promptEn: string;
  promptAr?: string;
  options: string[];
  correctIndex: number;
  ruleReference?: string;
  /** Shown once answered — why the right answer is right. */
  explanation?: string;
  /** True for questions Gemini generated/translated (e.g. book comprehension, AI-generated meaning-matching) — shown during play, not just on the setup screen, since that's when it matters most. */
  aiGenerated?: boolean;
}

/**
 * Shared "play a multiple-choice quiz session" UI — used by both the
 * general Quiz Center (src/libs/QuizzesWrapper/index.tsx) and book quizzes
 * (src/libs/BookQuizWrapper/components/BookQuizPlayer/index.tsx), which source their questions very
 * differently (client-generated vs. server-cached) but play identically.
 */
export default function QuizPlayer<T extends PlayableQuestion>({
  questions,
  onAnswer,
  onRestart,
}: {
  questions: T[];
  onAnswer?: (question: T, isCorrect: boolean, chosenText: string, responseTimeMs: number) => void;
  onRestart: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  // A ref, not state: timing data that must reset per-question but should
  // never itself trigger a render — avoids needing a setState-in-effect
  // just to reset it when `index` changes.
  const questionStartedAtRef = useRef(0);

  useEffect(() => {
    questionStartedAtRef.current = nowMs();
  }, [index]);

  function chooseAnswer(optionIndex: number) {
    if (selected !== null) return;
    setSelected(optionIndex);
    const question = questions[index];
    const isCorrect = optionIndex === question.correctIndex;
    if (isCorrect) setScore((s) => s + 1);
    onAnswer?.(question, isCorrect, question.options[optionIndex], nowMs() - questionStartedAtRef.current);
  }

  function next() {
    if (index + 1 >= questions.length) {
      setDone(true);
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
  }

  if (done) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 rounded-lg border border-stone-200 bg-white p-6 text-center dark:border-stone-700/60 dark:bg-parchment-800">
        <h3 className="text-lg font-bold">Quiz complete</h3>
        <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-400">
          {score} / {questions.length}
        </p>
        <p className="text-sm text-muted">{Math.round((score / questions.length) * 100)}% correct</p>
        <button
          onClick={onRestart}
          className="mt-2 rounded-md bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600"
        >
          Configure another quiz
        </button>
      </div>
    );
  }

  const question = questions[index];

  return (
    <div className="mx-auto max-w-2xl space-y-5 rounded-lg border border-stone-200 bg-white p-6 dark:border-stone-700/60 dark:bg-parchment-800">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
          Question {index + 1} of {questions.length}
        </span>
        <span className="rounded-full bg-stone-100 px-2.5 py-1 font-mono capitalize dark:bg-stone-700">{question.badge}</span>
      </div>

      <div className="space-y-2">
        {question.promptAr && (
          <p dir="rtl" className="font-arabic text-2xl text-emerald-900 dark:text-amber-200">
            {question.promptAr}
          </p>
        )}
        <p className="text-base font-medium">{question.promptEn}</p>
        {question.aiGenerated && <p className="text-xs text-purple-600 dark:text-purple-400">AI-generated — unverified</p>}
      </div>

      <div className="space-y-2">
        {question.options.map((option, i) => {
          const isCorrect = i === question.correctIndex;
          const isChosen = i === selected;
          const revealed = selected !== null;
          return (
            <button
              key={option}
              onClick={() => chooseAnswer(i)}
              disabled={revealed}
              className={`flex w-full items-center justify-between rounded-md border px-4 py-3 text-left text-sm transition ${
                revealed && isCorrect
                  ? "border-emerald-500 bg-emerald-50 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200"
                  : revealed && isChosen
                    ? "border-rose-400 bg-rose-50 text-rose-900 dark:bg-rose-950 dark:text-rose-200"
                    : "border-stone-200 hover:border-emerald-400 dark:border-stone-700"
              }`}
            >
              <span>{option}</span>
              {revealed && isCorrect && <CheckIcon className="h-4 w-4 shrink-0" />}
              {revealed && isChosen && !isCorrect && <XIcon className="h-4 w-4 shrink-0" />}
            </button>
          );
        })}
      </div>

      {selected !== null && question.explanation && (
        <p className="rounded-lg bg-stone-50 px-3 py-2 text-sm text-stone-700 dark:bg-parchment-900 dark:text-stone-300">{question.explanation}</p>
      )}

      {selected !== null && question.ruleReference && (
        <p className="text-xs text-muted">Rule reference: {question.ruleReference}</p>
      )}

      {selected !== null && (
        <button onClick={next} className="w-full rounded-md bg-emerald-700 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600">
          {index + 1 >= questions.length ? "See results" : "Next question"}
        </button>
      )}
    </div>
  );
}
