"use client";

import { useState } from "react";
import type { ComponentType } from "react";
import { BookIcon, DiagramIcon, type IconProps, LightbulbIcon, type PlayableQuestion, PlayIcon, QuizIcon, QuizPlayer, ScrollIcon, SlidersIcon } from "@/components";
import { generateQuizQuestions, type QuizQuestion } from "@/helpers";

type Topic = "vocab" | "vocab_sarf" | "irab" | "sarf" | "mixed" | "meaning";
type Difficulty = "beginner" | "intermediate" | "advanced";

interface CenterQuestion extends PlayableQuestion {
  /** Template it was generated from (session questions) — attempts are logged against it. */
  templateCode?: string;
  /** Fallback for questions without a template (meaning-matching). */
  topic: string;
}

function logAttempt(q: CenterQuestion, difficulty: Difficulty, isCorrect: boolean, userAnswer: string, responseTimeMs: number) {
  fetch("/api/quiz/attempt", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ templateCode: q.templateCode, topic: q.topic, difficulty, isCorrect, userAnswer, responseTimeMs }),
  }).catch(() => {
    // Best-effort logging — a failed write here shouldn't interrupt the quiz.
  });
}

const TOPICS: {
  value: Topic;
  label: string;
  hint: string;
  icon: ComponentType<IconProps>;
  tint: string;
  /** Draws on Qur'anic words, so the difficulty level applies. */
  usesQuran: boolean;
  sticky?: string;
}[] = [
  { value: "vocab", label: "My vocabulary", hint: "Only the words you've added in Vocabulary", icon: BookIcon, tint: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300", usesQuran: false },
  {
    value: "vocab_sarf",
    label: "Vocabulary + ṣarf",
    hint: "Your words, plus roots, verb forms & tenses from the Qur'an",
    icon: LightbulbIcon,
    tint: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
    usesQuran: true,
    sticky: "Enrich the vocab you already know",
  },
  { value: "irab", label: "I'rab", hint: "Case & parts of speech (Qur'an)", icon: DiagramIcon, tint: "bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300", usesQuran: true },
  { value: "sarf", label: "Ṣarf", hint: "Roots, verb forms & tenses (Qur'an)", icon: ScrollIcon, tint: "bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300", usesQuran: true },
  { value: "mixed", label: "Mixed", hint: "A bit of everything", icon: QuizIcon, tint: "bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300", usesQuran: true },
  { value: "meaning", label: "Sentence meaning", hint: "Match sentences to their meaning", icon: SlidersIcon, tint: "bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300", usesQuran: false },
];

const DIFFICULTIES: { value: Difficulty; label: string; hint: string }[] = [
  { value: "beginner", label: "Beginner", hint: "~300 most frequent Qur'anic words" },
  { value: "intermediate", label: "Intermediate", hint: "~1,500 most frequent" },
  { value: "advanced", label: "Advanced", hint: "Any word in the Qur'an" },
];

const COUNT_OPTIONS = [5, 10, 15];

async function fetchMeaningQuestions(count: number): Promise<CenterQuestion[]> {
  // Fresh Gemini-generated sentence+meaning pairs (labelled AI-generated),
  // falling back to the curated, human-verified sample sentences.
  let generated: QuizQuestion[] = [];
  try {
    const res = await fetch("/api/quiz/meaning", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ count }),
    });
    generated = ((await res.json()).questions ?? []) as QuizQuestion[];
  } catch {
    generated = [];
  }
  if (generated.length < 2) generated = generateQuizQuestions("meaning", count, []);
  return generated.map((q) => ({ ...q, badge: "meaning", topic: "meaning" }));
}

export default function QuizCenter() {
  const [topic, setTopic] = useState<Topic>("vocab");
  const topicInfo = TOPICS.find((t) => t.value === topic)!;
  const [difficulty, setDifficulty] = useState<Difficulty>("beginner");
  const [count, setCount] = useState(10);
  const [setupNote, setSetupNote] = useState<string | null>(null);
  const [questions, setQuestions] = useState<CenterQuestion[] | null>(null);
  const [generating, setGenerating] = useState(false);

  async function startQuiz() {
    setGenerating(true);
    setSetupNote(null);
    try {
      let generated: CenterQuestion[];
      let note: string | undefined;
      if (topic === "meaning") {
        generated = await fetchMeaningQuestions(count);
      } else {
        const res = await fetch("/api/quiz/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topic, count, difficulty }),
        });
        const body = await res.json();
        if (!res.ok) throw new Error(body.error ?? "Couldn't build a quiz");
        note = body.note;
        generated = (body.questions as (PlayableQuestion & { topic: string; templateCode: string })[]).map((q) => ({ ...q, badge: q.topic }));
      }

      if (generated.length === 0) {
        setSetupNote(note ?? "Couldn't generate any questions for that topic.");
        return;
      }
      if (note) setSetupNote(note);
      setQuestions(generated);
    } catch (e) {
      setSetupNote(e instanceof Error ? e.message : "Couldn't build a quiz");
    } finally {
      setGenerating(false);
    }
  }

  if (!questions) {
    return (
      <div className="mx-auto max-w-3xl space-y-6 rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <h3 className="flex items-center gap-2 border-b border-border pb-3 text-lg font-bold">
          <SlidersIcon className="h-5 w-5 text-rose-500" /> Set up your quiz
        </h3>

        <div>
          <span className="mb-2 block text-xs font-semibold text-muted">What do you want to practise?</span>
          <div role="radiogroup" aria-label="Quiz topic" className="grid gap-3 pt-2 sm:grid-cols-2">
            {TOPICS.map(({ value, label, hint, icon: Icon, tint, sticky }) => {
              const active = topic === value;
              return (
                <button
                  key={value}
                  role="radio"
                  aria-checked={active}
                  onClick={() => setTopic(value)}
                  className={`relative flex items-start gap-3 rounded-xl border p-3 text-left transition ${
                    active
                      ? "border-emerald-600 bg-emerald-50 shadow-md ring-1 ring-emerald-600 dark:bg-emerald-950/40"
                      : "border-border bg-background hover:-translate-y-0.5 hover:border-emerald-400 hover:shadow-sm"
                  }`}
                >
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${tint}`}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-foreground">{label}</span>
                    <span className="block text-xs text-muted">{hint}</span>
                  </span>
                  {sticky && (
                    // A small sticky note pinned to the card's corner.
                    <span className="absolute -right-2 -top-3 rotate-3 rounded-sm bg-yellow-200 px-2 py-1 text-[10px] font-semibold leading-tight text-yellow-900 shadow-md dark:bg-yellow-300">
                      {sticky}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {topicInfo.usesQuran && (
          <div>
            <span className="mb-1 block text-xs font-semibold text-muted">Difficulty:</span>
            <div className="grid grid-cols-3 gap-2">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d.value}
                  onClick={() => setDifficulty(d.value)}
                  title={d.hint}
                  className={`rounded-xl border px-2 py-2 text-sm font-semibold transition ${
                    difficulty === d.value
                      ? "border-emerald-600 bg-emerald-50 text-emerald-800 ring-1 ring-emerald-600 dark:bg-emerald-950 dark:text-emerald-300"
                      : "border-border text-muted hover:border-emerald-400"
                  }`}
                >
                  {d.label}
                  <span className="block text-[10px] font-normal text-stone-500">{d.hint}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <span className="mb-1 block text-xs font-semibold text-muted">Number of questions:</span>
          <div className="grid grid-cols-3 gap-2">
            {COUNT_OPTIONS.map((n) => (
              <button
                key={n}
                onClick={() => setCount(n)}
                className={`rounded-xl border py-2 text-sm font-semibold transition ${
                  count === n
                    ? "border-emerald-600 bg-emerald-50 text-emerald-800 ring-1 ring-emerald-600 dark:bg-emerald-950 dark:text-emerald-300"
                    : "border-border text-muted hover:border-emerald-400"
                }`}
              >
                {n} items
              </button>
            ))}
          </div>
        </div>

        {setupNote && <p className="text-sm text-amber-700 dark:text-amber-400">{setupNote}</p>}

        <button
          onClick={startQuiz}
          disabled={generating}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-700 py-3 text-base font-bold text-white shadow-md transition hover:opacity-90 disabled:opacity-50"
        >
          <PlayIcon className="h-4 w-4" /> {generating ? "Preparing questions…" : "Start quiz"}
        </button>
      </div>
    );
  }

  return (
    <QuizPlayer
      questions={questions}
      onAnswer={(q, isCorrect, chosenText, responseTimeMs) => logAttempt(q, difficulty, isCorrect, chosenText, responseTimeMs)}
      onRestart={() => {
        setQuestions(null);
        setSetupNote(null);
      }}
    />
  );
}
