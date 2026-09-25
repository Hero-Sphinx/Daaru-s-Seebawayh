import { describe, expect, it } from "vitest";
import { reviewSm2, SM2_DEFAULTS } from "@/helpers/srs/sm2";

describe("reviewSm2", () => {
  it("schedules a brand-new card 1 day out on first success", () => {
    const result = reviewSm2(SM2_DEFAULTS, 4, new Date("2026-01-01T00:00:00Z"));
    expect(result.repetitions).toBe(1);
    expect(result.intervalDays).toBe(1);
    expect(result.dueAt.toISOString()).toBe("2026-01-02T00:00:00.000Z");
  });

  it("schedules the second consecutive success 6 days out", () => {
    const afterFirst = reviewSm2(SM2_DEFAULTS, 4, new Date("2026-01-01T00:00:00Z"));
    const afterSecond = reviewSm2(afterFirst, 4, new Date("2026-01-02T00:00:00Z"));
    expect(afterSecond.repetitions).toBe(2);
    expect(afterSecond.intervalDays).toBe(6);
  });

  it("grows the interval by the easiness factor from the third review on", () => {
    let state = reviewSm2(SM2_DEFAULTS, 5, new Date("2026-01-01T00:00:00Z"));
    state = reviewSm2(state, 5, new Date("2026-01-02T00:00:00Z"));
    const third = reviewSm2(state, 5, new Date("2026-01-08T00:00:00Z"));
    expect(third.repetitions).toBe(3);
    expect(third.intervalDays).toBe(Math.round(6 * state.easinessFactor));
  });

  it("resets repetitions and drops to a 1-day interval on failed recall", () => {
    let state = reviewSm2(SM2_DEFAULTS, 5, new Date("2026-01-01T00:00:00Z"));
    state = reviewSm2(state, 5, new Date("2026-01-02T00:00:00Z"));
    const failed = reviewSm2(state, 1, new Date("2026-01-08T00:00:00Z"));
    expect(failed.repetitions).toBe(0);
    expect(failed.intervalDays).toBe(1);
  });

  it("never lets the easiness factor drop below 1.3", () => {
    let state = SM2_DEFAULTS;
    for (let i = 0; i < 20; i++) {
      state = reviewSm2(state, 0, new Date("2026-01-01T00:00:00Z"));
    }
    expect(state.easinessFactor).toBeGreaterThanOrEqual(1.3);
  });

  it("rejects out-of-range quality grades", () => {
    expect(() => reviewSm2(SM2_DEFAULTS, 6)).toThrow(RangeError);
    expect(() => reviewSm2(SM2_DEFAULTS, -1)).toThrow(RangeError);
    expect(() => reviewSm2(SM2_DEFAULTS, 2.5)).toThrow(RangeError);
  });
});
