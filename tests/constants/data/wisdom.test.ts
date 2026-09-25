import { describe, expect, it } from "vitest";
import { WISDOM, wisdomIndexForDate } from "@/constants/data/wisdom";

describe("wisdom of the day", () => {
  it("every entry has text, a translation, an author and a source", () => {
    for (const w of WISDOM) {
      expect(w.verses?.length || w.text, w.id).toBeTruthy();
      for (const [sadr, ajuz] of w.verses ?? []) expect(sadr && ajuz, w.id).toBeTruthy();
      expect(w.meaningEn && w.authorAr && w.authorEn && w.sourceAr && w.sourceEn, w.id).toBeTruthy();
    }
    expect(new Set(WISDOM.map((w) => w.id)).size).toBe(WISDOM.length);
  });

  it("changes every day and cycles through the whole list", () => {
    const day = (n: number) => new Date(Date.UTC(2026, 0, 1) + n * 86_400_000);
    expect(wisdomIndexForDate(day(0))).not.toBe(wisdomIndexForDate(day(1)));
    const seen = new Set(Array.from({ length: WISDOM.length }, (_, i) => wisdomIndexForDate(day(i))));
    expect(seen.size).toBe(WISDOM.length);
  });

  it("changes at the user's own midnight, not UTC's", () => {
    // 23:30 UTC on the 23rd is already the 24th in Lagos (UTC+1), still the 23rd in Los Angeles.
    const instant = new Date("2026-09-23T23:30:00Z");
    const lagos = wisdomIndexForDate(instant, "Africa/Lagos");
    expect(lagos).toBe(wisdomIndexForDate(new Date("2026-09-24T12:00:00Z")));
    expect(wisdomIndexForDate(instant, "America/Los_Angeles")).toBe(wisdomIndexForDate(new Date("2026-09-23T12:00:00Z")));
    expect(lagos).not.toBe(wisdomIndexForDate(instant, "America/Los_Angeles"));
    // An unknown zone falls back to UTC rather than failing.
    expect(wisdomIndexForDate(instant, "Not/AZone")).toBe(wisdomIndexForDate(instant));
  });

  it("is stable within a day", () => {
    expect(wisdomIndexForDate(new Date("2026-09-23T00:10:00Z"))).toBe(wisdomIndexForDate(new Date("2026-09-23T23:50:00Z")));
  });
});
