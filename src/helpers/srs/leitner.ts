/**
 * Leitner box system — the alternative to SM-2 a learner can choose
 * (users.srs_algorithm, ROADMAP.md Phase 5). Pure, like sm2.ts.
 *
 * Five boxes with fixed review intervals. A card you recall moves up one
 * box; a card you miss goes back to box 1. Simpler and more predictable
 * than SM-2 (no per-card easiness factor), at the cost of adapting less to
 * individually hard words.
 */

export const LEITNER_BOX_COUNT = 5;
/** Days until the next review for a card sitting in box N (index N-1). */
export const LEITNER_INTERVALS_DAYS = [1, 3, 7, 14, 30] as const;

export interface LeitnerResult {
  box: number;
  intervalDays: number;
  dueAt: Date;
  /** Whether the answer counted as recalled (quality >= 3) — lets callers keep SM-2's repetition count in step. */
  recalled: boolean;
}

/**
 * quality uses the same 0-5 scale as SM-2 so the review API stays one
 * shape: 0-2 = missed, 3-5 = recalled (Leitner doesn't distinguish how easily).
 */
export function reviewLeitner(box: number, quality: number, now: Date = new Date()): LeitnerResult {
  if (!Number.isInteger(quality) || quality < 0 || quality > 5) {
    throw new RangeError(`quality must be an integer in [0, 5], got ${quality}`);
  }
  const current = clampBox(box);
  const recalled = quality >= 3;
  const nextBox = recalled ? Math.min(current + 1, LEITNER_BOX_COUNT) : 1;
  const intervalDays = LEITNER_INTERVALS_DAYS[nextBox - 1];
  const dueAt = new Date(now);
  dueAt.setDate(dueAt.getDate() + intervalDays);
  return { box: nextBox, intervalDays, dueAt, recalled };
}

/**
 * Box a card should start in when a learner switches from SM-2: the box
 * whose interval is the closest one not exceeding the card's current SM-2
 * interval — so a well-known word isn't dumped back into daily review.
 */
export function boxForInterval(intervalDays: number): number {
  let box = 1;
  LEITNER_INTERVALS_DAYS.forEach((days, i) => {
    if (intervalDays >= days) box = i + 1;
  });
  return box;
}

function clampBox(box: number): number {
  return Number.isInteger(box) ? Math.min(Math.max(box, 1), LEITNER_BOX_COUNT) : 1;
}
