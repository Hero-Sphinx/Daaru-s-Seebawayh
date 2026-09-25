import { describe, expect, it } from "vitest";
import { rangesOverlap, resolveAnnotationRange } from "@/helpers";

const TEXT = "قال رسول الله: إنما الأعمال بالنيات";

describe("resolveAnnotationRange", () => {
  it("returns the exact quote for a valid selection", () => {
    const start = TEXT.indexOf("إنما");
    const r = resolveAnnotationRange(TEXT, start, TEXT.length);
    expect(r).toEqual({ ok: true, start, end: TEXT.length, quote: "إنما الأعمال بالنيات" });
  });

  it("trims whitespace grabbed at the edges of a drag", () => {
    const start = TEXT.indexOf(" إنما");
    const r = resolveAnnotationRange(TEXT, start, start + 6);
    expect(r.ok && r.quote).toBe("إنما");
  });

  it("rejects out-of-range, empty, inverted and non-integer selections", () => {
    expect(resolveAnnotationRange(TEXT, -1, 3).ok).toBe(false);
    expect(resolveAnnotationRange(TEXT, 0, TEXT.length + 1).ok).toBe(false);
    expect(resolveAnnotationRange(TEXT, 5, 5).ok).toBe(false);
    expect(resolveAnnotationRange(TEXT, 6, 2).ok).toBe(false);
    expect(resolveAnnotationRange(TEXT, 1.5, 3).ok).toBe(false);
    expect(resolveAnnotationRange(TEXT, "0", 3).ok).toBe(false);
    expect(resolveAnnotationRange("a   b", 1, 4).ok).toBe(false);
  });

  it("refuses to split a surrogate pair", () => {
    const withEmoji = "ab😀cd";
    expect(resolveAnnotationRange(withEmoji, 3, 5).ok).toBe(false);
    expect(resolveAnnotationRange(withEmoji, 2, 4).ok).toBe(true);
  });
});

describe("rangesOverlap", () => {
  it("treats ranges as half-open", () => {
    expect(rangesOverlap(0, 5, 4, 8)).toBe(true);
    expect(rangesOverlap(0, 5, 5, 8)).toBe(false);
    expect(rangesOverlap(3, 4, 0, 10)).toBe(true);
  });
});
