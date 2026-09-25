import "server-only";
import { reviewLeitner, reviewSm2 } from "@/helpers";
import { notFound } from "@/server/constants";
import { db } from "@/server/databases";

export interface ReviewResult {
  cardId: number;
  algorithm: string;
  easinessFactor: number;
  intervalDays: number;
  repetitions: number;
  leitnerBox: number;
  dueAt: Date;
}

/** Grades one card under the learner's chosen scheduler and logs the review. */
export async function reviewCard(userId: string, cardId: number, quality: number): Promise<ReviewResult> {
  const [card, user] = await Promise.all([
    db.srs_cards.findFirst({ where: { id: BigInt(cardId), user_id: userId } }),
    db.users.findUniqueOrThrow({ where: { id: userId }, select: { srs_algorithm: true } }),
  ]);
  if (!card) throw notFound("Card not found");

  // Under Leitner, the SM-2 interval/repetitions are kept in step (EF
  // untouched) so switching back to SM-2 later continues from a sensible
  // point instead of resetting.
  const previousEf = Number(card.easiness_factor);
  let next: Omit<ReviewResult, "cardId" | "algorithm">;
  if (user.srs_algorithm === "leitner") {
    const r = reviewLeitner(card.leitner_box, quality);
    next = {
      easinessFactor: previousEf,
      intervalDays: r.intervalDays,
      repetitions: r.recalled ? card.repetitions + 1 : 0,
      leitnerBox: r.box,
      dueAt: r.dueAt,
    };
  } else {
    const r = reviewSm2({ easinessFactor: previousEf, intervalDays: card.interval_days, repetitions: card.repetitions }, quality);
    next = { ...r, leitnerBox: card.leitner_box };
  }

  const now = new Date();
  await db.$transaction([
    db.srs_cards.update({
      where: { id: card.id },
      data: {
        easiness_factor: next.easinessFactor,
        interval_days: next.intervalDays,
        repetitions: next.repetitions,
        leitner_box: next.leitnerBox,
        due_at: next.dueAt,
        last_reviewed_at: now,
      },
    }),
    db.srs_review_log.create({
      data: {
        card_id: card.id,
        user_id: userId,
        quality_rating: quality,
        previous_interval: card.interval_days,
        new_interval: next.intervalDays,
        previous_ef: card.easiness_factor,
        new_ef: next.easinessFactor,
        reviewed_at: now,
      },
    }),
  ]);

  return { cardId, algorithm: user.srs_algorithm, ...next };
}
