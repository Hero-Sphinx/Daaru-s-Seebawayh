import { describe, expect, it } from "vitest";
import { CHAPTERS } from "@/helpers";

describe("chapter metadata", () => {
  it("has exactly 114 surahs numbered 1..114 with no duplicate names", () => {
    expect(CHAPTERS).toHaveLength(114);
    expect(CHAPTERS.map((c) => c.id)).toEqual(Array.from({ length: 114 }, (_, i) => i + 1));
    expect(new Set(CHAPTERS.map((c) => c.nameAr)).size).toBe(114);
  });

  it("spot-checks well-known surahs", () => {
    expect(CHAPTERS[0]).toMatchObject({ nameAr: "الفاتحة", revelationPlace: "meccan" });
    expect(CHAPTERS[1]).toMatchObject({ nameAr: "البقرة", revelationPlace: "medinan" });
    expect(CHAPTERS[35]).toMatchObject({ nameAr: "يس" });
    expect(CHAPTERS[111]).toMatchObject({ nameAr: "الإخلاص", revelationPlace: "meccan" });
    expect(CHAPTERS[113]).toMatchObject({ nameAr: "الناس" });
  });

  it("has Tanzil's 28 Medinan surahs", () => {
    expect(CHAPTERS.filter((c) => c.revelationPlace === "medinan")).toHaveLength(28);
  });
});
