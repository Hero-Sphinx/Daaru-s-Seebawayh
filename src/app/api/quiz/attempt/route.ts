import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getApiUserId, unauthorizedResponse } from "@/lib/auth";

const TOPIC_TO_QUIZ_TYPE: Record<string, string> = {
  vocab: "vocab_recall",
  irab: "irab_reconstruction",
  sarf: "wazn_identification",
  meaning: "sentence_meaning_match",
  // Book quiz subtypes (FR-3.x) — src/components/BookQuizPlayer.tsx passes
  // these directly, already matching real quiz_type values.
  fawaid_recall: "fawaid_recall",
  irab_reconstruction: "irab_reconstruction",
  book_comprehension: "book_comprehension",
};

const DIFFICULTY_TIERS = ["beginner", "intermediate", "advanced", "classical"];

interface AttemptBody {
  /**
   * Preferred: the exact template the question came from (Quiz Center
   * sessions, src/app/api/quiz/session). `topic` is the fallback for callers
   * that only know a quiz type (book quizzes, meaning-matching).
   */
  templateCode?: string;
  topic?: "vocab" | "irab" | "sarf" | "meaning" | "fawaid_recall" | "irab_reconstruction" | "book_comprehension";
  difficulty?: string;
  isCorrect: boolean;
  userAnswer: string;
  responseTimeMs?: number;
}

export async function POST(request: Request) {
  const userId = await getApiUserId();
  if (!userId) return unauthorizedResponse();

  const body = (await request.json()) as AttemptBody;
  if (typeof body.isCorrect !== "boolean") {
    return NextResponse.json({ error: "isCorrect must be a boolean" }, { status: 400 });
  }

  // Legacy per-type templates have code = quiz_type (migration 003).
  const code = body.templateCode ?? (body.topic ? TOPIC_TO_QUIZ_TYPE[body.topic] : undefined);
  if (!code) return NextResponse.json({ error: "templateCode or a valid topic is required" }, { status: 400 });
  const template = await db.quiz_templates.findUnique({ where: { code } });
  if (!template) {
    return NextResponse.json({ error: `No quiz_templates row with code ${code} — run prisma db seed` }, { status: 400 });
  }
  const quizType = template.quiz_type;
  // Stats are per (quiz type, difficulty the learner chose), not the
  // template's nominal tier — the same template serves every tier.
  const difficultyTier = DIFFICULTY_TIERS.includes(body.difficulty ?? "") ? body.difficulty! : template.difficulty_tier;

  const existingStats = await db.user_quiz_stats.findUnique({
    where: { user_id_quiz_type_difficulty_tier: { user_id: userId, quiz_type: quizType, difficulty_tier: difficultyTier } },
  });

  await db.$transaction([
    db.quiz_attempts.create({
      data: {
        user_id: userId,
        template_id: template.id,
        user_answer: { value: body.userAnswer },
        is_correct: body.isCorrect,
        response_time_ms: body.responseTimeMs,
      },
    }),
    db.user_quiz_stats.upsert({
      where: { user_id_quiz_type_difficulty_tier: { user_id: userId, quiz_type: quizType, difficulty_tier: difficultyTier } },
      update: {
        total_attempts: { increment: 1 },
        correct_attempts: body.isCorrect ? { increment: 1 } : undefined,
        current_streak: body.isCorrect ? (existingStats?.current_streak ?? 0) + 1 : 0,
        last_attempt_at: new Date(),
      },
      create: {
        user_id: userId,
        quiz_type: quizType,
        difficulty_tier: difficultyTier,
        total_attempts: 1,
        correct_attempts: body.isCorrect ? 1 : 0,
        current_streak: body.isCorrect ? 1 : 0,
        last_attempt_at: new Date(),
      },
    }),
  ]);

  return NextResponse.json({ ok: true }, { status: 201 });
}
