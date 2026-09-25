import { z } from "zod";
import { DIFFICULTIES } from "@/constants";

/** Quiz types a caller may name directly (book quizzes, meaning-matching) instead of a template code. */
export const ATTEMPT_TOPICS = [
  "vocab",
  "irab",
  "sarf",
  "meaning",
  "fawaid_recall",
  "irab_reconstruction",
  "book_comprehension",
  "sentence_meaning_match",
] as const;

export const attemptBodySchema = z
  .object({
    /**
     * Preferred: the exact template the question came from (Quiz Center
     * sessions). `topic` is the fallback for callers that only know a quiz
     * type (book quizzes, meaning-matching).
     */
    templateCode: z.string().trim().min(1).max(100).optional(),
    topic: z.enum(ATTEMPT_TOPICS).optional(),
    difficulty: z.string().max(40).optional(),
    isCorrect: z.boolean({ error: "isCorrect must be true or false" }),
    userAnswer: z.string().max(2000).default(""),
    responseTimeMs: z
      .number()
      .nonnegative()
      .transform((ms) => Math.min(Math.round(ms), 2_147_483_647))
      .optional(),
  })
  .refine((b) => b.templateCode || b.topic, { error: "templateCode or topic is required" });

export const SESSION_TOPICS = ["mixed", "vocab", "irab", "sarf", "vocab_sarf"] as const;
export const MAX_SESSION_QUESTIONS = 30;

export const sessionBodySchema = z.object({
  topic: z.enum(SESSION_TOPICS, { error: `topic must be one of: ${SESSION_TOPICS.join(", ")}` }).default("mixed"),
  count: z
    .number()
    .transform((n) => Math.min(Math.max(Math.trunc(n), 1), MAX_SESSION_QUESTIONS))
    .default(10),
  difficulty: z.enum(DIFFICULTIES).catch("beginner").default("beginner"),
});

export const meaningBodySchema = z.object({
  count: z
    .number()
    .transform((n) => Math.min(Math.max(Math.trunc(n), 2), 15))
    .default(8),
});
