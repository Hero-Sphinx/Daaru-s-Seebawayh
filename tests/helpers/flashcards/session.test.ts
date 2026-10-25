import { describe, expect, it } from "vitest";
import { answerCard, firstTryCount, isSessionDone, shuffledIndices, startSession } from "@/helpers";

describe("flashcard session", () => {
  it("starts with every card queued, in the given order", () => {
    const s = startSession([0, 1, 2]);
    expect(s).toEqual({ queue: [0, 1, 2], total: 3, learnt: 0, missed: [] });
    expect(isSessionDone(s)).toBe(false);
  });

  it("takes a card out of the round when it's known", () => {
    const s = answerCard(startSession([0, 1, 2]), true);
    expect(s.queue).toEqual([1, 2]);
    expect(s.learnt).toBe(1);
  });

  it("sends a missed card to the back and remembers it once", () => {
    let s = answerCard(startSession([0, 1]), false);
    expect(s.queue).toEqual([1, 0]);
    s = answerCard(s, true); // 1
    s = answerCard(s, false); // 0 again
    expect(s.queue).toEqual([0]);
    expect(s.missed).toEqual([0]);
  });

  it("ends only once every card has been answered right", () => {
    let s = startSession([0, 1]);
    s = answerCard(s, false);
    s = answerCard(s, true);
    s = answerCard(s, true);
    expect(isSessionDone(s)).toBe(true);
    expect(s.learnt).toBe(2);
    expect(firstTryCount(s)).toBe(1);
  });

  it("ignores answers once the round is over", () => {
    const done = answerCard(startSession([0]), true);
    expect(answerCard(done, true)).toBe(done);
  });

  it("can start a round with just some of the cards (the missed ones)", () => {
    const s = startSession([2, 5]);
    expect(s.total).toBe(2);
    expect(s.queue).toEqual([2, 5]);
  });
});

describe("shuffledIndices", () => {
  it("returns every index exactly once", () => {
    const order = shuffledIndices(20);
    expect([...order].sort((a, b) => a - b)).toEqual(Array.from({ length: 20 }, (_, i) => i));
  });

  it("uses the random source it is given", () => {
    // random() = 0 always swaps the current slot with the first one.
    expect(shuffledIndices(4, () => 0)).toEqual([1, 2, 3, 0]);
    expect(shuffledIndices(0)).toEqual([]);
  });
});
