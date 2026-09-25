"use client";

import { Suspense, use, useState } from "react";
import QuizPlayer, { type PlayableQuestion } from "@/components/QuizPlayer";
import { PlayIcon, SlidersIcon } from "@/components/icons";

interface BookQuizQuestionDTO {
  id: number;
  subtype: "fawaid_recall" | "irab_reconstruction" | "book_comprehension" | "sentence_meaning_match";
  promptEn: string;
  promptAr?: string;
  options: string[];
  correctIndex: number;
  pageNumber?: number;
  ruleReference?: string;
}

const SUBTYPE_LABELS: Record<string, string> = {
  fawaid_recall: "Fawā'id recall",
  irab_reconstruction: "In-context I'rab",
  book_comprehension: "Comprehension",
  sentence_meaning_match: "Sentence meaning",
};

function logAttempt(subtype: string, isCorrect: boolean, userAnswer: string, responseTimeMs: number) {
  fetch("/api/quiz/attempt", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic: subtype, isCorrect, userAnswer, responseTimeMs }),
  }).catch(() => {});
}

async function fetchBank(documentId: string): Promise<BookQuizQuestionDTO[]> {
  const res = await fetch(`/api/library/${documentId}/quiz`);
  if (!res.ok) return [];
  const body = await res.json();
  return body.questions ?? [];
}

// Module-scoped, keyed by documentId — not created inside the component.
// `use()` requires the promise it reads to stay stable across re-renders;
// a promise stored in a component's own `useState` still gets recreated
// (and refetched) every time the component remounts, and Suspense-bound
// client components can remount for reasons outside our control (dev-mode
// Fast Refresh, Suspense internals). Caching by documentId here means a
// remount reuses the same in-flight/resolved promise instead of firing a
// fresh request.
const bankPromiseCache = new Map<string, Promise<BookQuizQuestionDTO[]>>();

function loadBank(documentId: string): Promise<BookQuizQuestionDTO[]> {
  let cached = bankPromiseCache.get(documentId);
  if (!cached) {
    cached = fetchBank(documentId);
    // Don't cache a failure — let the next mount/retry try again instead of
    // replaying the same rejection forever.
    cached.catch(() => bankPromiseCache.delete(documentId));
    bankPromiseCache.set(documentId, cached);
  }
  return cached;
}

export default function BookQuizPlayer({ documentId }: { documentId: string }) {
  return (
    <Suspense fallback={<p className="text-sm text-muted">Loading quiz bank…</p>}>
      <BookQuizPlayerInner documentId={documentId} />
    </Suspense>
  );
}

function BookQuizPlayerInner({ documentId }: { documentId: string }) {
  const initialBank = use(loadBank(documentId));

  const [bank, setBank] = useState<BookQuizQuestionDTO[]>(initialBank);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subtype, setSubtype] = useState<string>("all");
  const [count, setCount] = useState(5);
  const [playing, setPlaying] = useState<(BookQuizQuestionDTO & PlayableQuestion)[] | null>(null);

  async function handleGenerate() {
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch(`/api/library/${documentId}/quiz`, {
        method: "POST",
        // Generation calls CAMeL per Arabic word and, for comprehension
        // questions, Gemini with retries — worst case is genuinely slow,
        // not just this request. Cap the wait client-side too so it never
        // looks like an infinite hang; the server-side work isn't wasted
        // even if this times out (already-written questions stay cached).
        signal: AbortSignal.timeout(120_000),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Generation failed");
      const freshBank = await fetchBank(documentId);
      bankPromiseCache.set(documentId, Promise.resolve(freshBank));
      setBank(freshBank);
    } catch (err) {
      if (err instanceof DOMException && err.name === "TimeoutError") {
        setError("This is taking longer than expected. Check that the CAMeL Tools service is running, then try again.");
      } else {
        setError(err instanceof Error ? err.message : "Generation failed");
      }
    } finally {
      setGenerating(false);
    }
  }

  function startQuiz() {
    const pool = subtype === "all" ? bank : bank.filter((q) => q.subtype === subtype);
    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, count);
    setPlaying(shuffled.map((q) => ({ ...q, badge: SUBTYPE_LABELS[q.subtype] ?? q.subtype })));
  }

  if (playing) {
    return (
      <QuizPlayer
        questions={playing}
        onAnswer={(q, isCorrect, chosenText, responseTimeMs) => logAttempt(q.subtype, isCorrect, chosenText, responseTimeMs)}
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
          onClick={handleGenerate}
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
    </div>
  );
}
