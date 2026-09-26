import fetcher from "./fetcher";

export interface QuizAttemptLog {
  /** The template the question came from (Quiz Center), or… */
  templateCode?: string;
  /** …the quiz type, for questions without one (book quizzes, meaning-matching). */
  topic?: string;
  difficulty?: string;
  isCorrect: boolean;
  userAnswer: string;
  responseTimeMs?: number;
}

/**
 * Records one answered question for the learner's stats. Best-effort: a
 * failed write must never interrupt a quiz, but it's reported in the
 * console rather than swallowed, so a rejected attempt can't go unnoticed.
 */
export function logQuizAttempt(attempt: QuizAttemptLog): void {
  fetcher("/api/quiz/attempt", { method: "POST", json: attempt }).catch((err) => console.warn("Quiz attempt wasn't saved:", err));
}
