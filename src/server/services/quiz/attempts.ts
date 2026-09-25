import "server-only";
import type { z } from "zod";
import { badRequest } from "@/server/constants";
import { db } from "@/server/databases";
import type { attemptBodySchema } from "@/server/validators/quiz/validate";

type Attempt = z.infer<typeof attemptBodySchema>;

/**
 * Topic -> the legacy per-type template it's logged under (code = quiz_type,
 * migration 003). Book-quiz subtypes are already real quiz_type values.
 */
const TOPIC_TO_TEMPLATE_CODE: Record<NonNullable<Attempt["topic"]>, string> = {
  vocab: "vocab_recall",
  irab: "irab_reconstruction",
  sarf: "wazn_identification",
  meaning: "sentence_meaning_match",
  fawaid_recall: "fawaid_recall",
  irab_reconstruction: "irab_reconstruction",
  book_comprehension: "book_comprehension",
  sentence_meaning_match: "sentence_meaning_match",
};

const DIFFICULTY_TIERS = ["beginner", "intermediate", "advanced", "classical"];

/** Logs one answered question and folds it into the learner's per-type stats. */
export async function recordAttempt(userId: string, attempt: Attempt): Promise<void> {
  const code = attempt.templateCode ?? TOPIC_TO_TEMPLATE_CODE[attempt.topic!];
  const template = await db.quiz_templates.findUnique({ where: { code } });
  if (!template) throw badRequest(`No quiz template "${code}" — run \`npx prisma db seed\`.`);

  // Stats are per (quiz type, difficulty the learner chose), not the
  // template's nominal tier — the same template serves every tier.
  const difficultyTier = DIFFICULTY_TIERS.includes(attempt.difficulty ?? "") ? attempt.difficulty! : template.difficulty_tier;
  const key = { user_id: userId, quiz_type: template.quiz_type, difficulty_tier: difficultyTier };
  const now = new Date();

  // Interactive transaction: the streak is read and written together, so two
  // answers landing at once can't both build on the same old value.
  await db.$transaction(async (tx) => {
    const existing = await tx.user_quiz_stats.findUnique({ where: { user_id_quiz_type_difficulty_tier: key } });
    await tx.quiz_attempts.create({
      data: {
        user_id: userId,
        template_id: template.id,
        user_answer: { value: attempt.userAnswer },
        is_correct: attempt.isCorrect,
        response_time_ms: attempt.responseTimeMs,
      },
    });
    await tx.user_quiz_stats.upsert({
      where: { user_id_quiz_type_difficulty_tier: key },
      update: {
        total_attempts: { increment: 1 },
        correct_attempts: attempt.isCorrect ? { increment: 1 } : undefined,
        current_streak: attempt.isCorrect ? (existing?.current_streak ?? 0) + 1 : 0,
        last_attempt_at: now,
      },
      create: {
        ...key,
        total_attempts: 1,
        correct_attempts: attempt.isCorrect ? 1 : 0,
        current_streak: attempt.isCorrect ? 1 : 0,
        last_attempt_at: now,
      },
    });
  });
}
