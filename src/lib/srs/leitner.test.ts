import { describe, expect, it } from "vitest";
import { boxForInterval, LEITNER_INTERVALS_DAYS, reviewLeitner } from "./leitner";

const NOW = new Date("2026-09-23T10:00:00Z");

describe("reviewLeitner", () => {
  it("moves a recalled card up one box with that box's interval", () => {
    const r = reviewLeitner(2, 4, NOW);
    expect(r).toMatchObject({ box: 3, intervalDays: 7, recalled: true });
    expect(r.dueAt.toISOString()).toBe("2026-09-30T10:00:00.000Z");
  });

  it("sends a missed card back to box 1 from anywhere", () => {
    expect(reviewLeitner(5, 0, NOW)).toMatchObject({ box: 1, intervalDays: 1, recalled: false });
    expect(reviewLeitner(3, 2, NOW)).toMatchObject({ box: 1, recalled: false });
  });

  it("keeps a recalled card in the top box", () => {
    expect(reviewLeitner(5, 5, NOW)).toMatchObject({ box: 5, intervalDays: 30 });
  });

  it("treats 3 as recalled (same threshold as SM-2)", () => {
    expect(reviewLeitner(1, 3, NOW).recalled).toBe(true);
  });

  it("clamps out-of-range boxes and rejects invalid quality", () => {
    expect(reviewLeitner(0, 4, NOW).box).toBe(2);
    expect(reviewLeitner(99, 4, NOW).box).toBe(5);
    expect(() => reviewLeitner(1, 6, NOW)).toThrow(RangeError);
    expect(() => reviewLeitner(1, 2.5, NOW)).toThrow(RangeError);
  });
});

describe("boxForInterval", () => {
  it("maps SM-2 intervals onto the nearest box not exceeding them", () => {
    expect(boxForInterval(0)).toBe(1);
    expect(boxForInterval(1)).toBe(1);
    expect(boxForInterval(6)).toBe(2);
    expect(boxForInterval(7)).toBe(3);
    expect(boxForInterval(20)).toBe(4);
    expect(boxForInterval(365)).toBe(5);
  });

  it("round-trips every box's own interval", () => {
    LEITNER_INTERVALS_DAYS.forEach((days, i) => expect(boxForInterval(days)).toBe(i + 1));
  });
});
