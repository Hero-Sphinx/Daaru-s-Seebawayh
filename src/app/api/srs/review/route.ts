import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getApiUserId, unauthorizedResponse } from "@/lib/auth";
import { reviewLeitner } from "@/lib/srs/leitner";
import { reviewSm2 } from "@/lib/srs/sm2";

interface ReviewBody {
  cardId: number;
  quality: number;
}

export async function POST(request: Request) {
  const userId = await getApiUserId();
  if (!userId) return unauthorizedResponse();

  const body = (await request.json()) as ReviewBody;
  if (!Number.isInteger(body.cardId) || !Number.isInteger(body.quality) || body.quality < 0 || body.quality > 5) {
    return NextResponse.json({ error: "cardId must be an integer and quality an integer in [0, 5]" }, { status: 400 });
  }

  const [card, user] = await Promise.all([
    db.srs_cards.findFirst({ where: { id: BigInt(body.cardId), user_id: userId } }),
    db.users.findUniqueOrThrow({ where: { id: userId }, select: { srs_algorithm: true } }),
  ]);
  if (!card) {
    return NextResponse.json({ error: "Card not found" }, { status: 404 });
  }

  // Next state under the learner's chosen scheduler. Under Leitner, the
  // SM-2 interval/repetitions are kept in step (EF untouched) so switching
  // back to SM-2 later continues from a sensible point instead of resetting.
  const previousEf = Number(card.easiness_factor);
  let next: { easinessFactor: number; intervalDays: number; repetitions: number; leitnerBox: number; dueAt: Date };
  if (user.srs_algorithm === "leitner") {
    const r = reviewLeitner(card.leitner_box, body.quality);
    next = {
      easinessFactor: previousEf,
      intervalDays: r.intervalDays,
      repetitions: r.recalled ? card.repetitions + 1 : 0,
      leitnerBox: r.box,
      dueAt: r.dueAt,
    };
  } else {
    const r = reviewSm2({ easinessFactor: previousEf, intervalDays: card.interval_days, repetitions: card.repetitions }, body.quality);
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
        quality_rating: body.quality,
        previous_interval: card.interval_days,
        new_interval: next.intervalDays,
        previous_ef: card.easiness_factor,
        new_ef: next.easinessFactor,
        reviewed_at: now,
      },
    }),
  ]);

  return NextResponse.json({
    cardId: Number(card.id),
    algorithm: user.srs_algorithm,
    easinessFactor: next.easinessFactor,
    intervalDays: next.intervalDays,
    repetitions: next.repetitions,
    leitnerBox: next.leitnerBox,
    dueAt: next.dueAt,
  });
}
