/**
 * SM-2 spaced repetition algorithm (SuperMemo-2, Piotr Wozniak, 1987).
 * Pure, deterministic, no external state — mirrors the fields stored on
 * `srs_cards` in db/schema.sql so callers can pass a row straight in.
 */

export interface Sm2State {
  easinessFactor: number; // EF, starts at 2.5, floor 1.3
  intervalDays: number; // days until the previous due date
  repetitions: number; // consecutive successful (quality >= 3) reviews
}

export interface Sm2Result extends Sm2State {
  dueAt: Date;
}

export const SM2_DEFAULTS: Sm2State = {
  easinessFactor: 2.5,
  intervalDays: 0,
  repetitions: 0,
};

const MIN_EASINESS_FACTOR = 1.3;

/**
 * quality: the learner's recall grade on SuperMemo's 0-5 scale.
 *   0-2 = failed recall (card resets), 3-5 = successful recall (graded by ease).
 */
export function reviewSm2(state: Sm2State, quality: number, now: Date = new Date()): Sm2Result {
  if (!Number.isInteger(quality) || quality < 0 || quality > 5) {
    throw new RangeError(`quality must be an integer in [0, 5], got ${quality}`);
  }

  const nextEf = Math.max(
    MIN_EASINESS_FACTOR,
    state.easinessFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  );

  if (quality < 3) {
    // Failed recall: restart the learning sequence but keep the (decayed) EF.
    return {
      easinessFactor: nextEf,
      intervalDays: 1,
      repetitions: 0,
      dueAt: addDays(now, 1),
    };
  }

  let nextInterval: number;
  if (state.repetitions === 0) {
    nextInterval = 1;
  } else if (state.repetitions === 1) {
    nextInterval = 6;
  } else {
    // Canonical SM-2 multiplies by the *pre-update* easiness factor.
    nextInterval = Math.round(state.intervalDays * state.easinessFactor);
  }

  return {
    easinessFactor: nextEf,
    intervalDays: nextInterval,
    repetitions: state.repetitions + 1,
    dueAt: addDays(now, nextInterval),
  };
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
