import { describe, expect, it } from "vitest";
import { normalizeArabicForSearch, normalizeWithMap, snippetAround } from "@/helpers/arabic/normalize";

describe("normalizeArabicForSearch", () => {
  it("strips harakat, shadda, dagger alif, Qur'anic marks and tatweel", () => {
    expect(normalizeArabicForSearch("كِتَابٌ")).toBe("كتاب");
    expect(normalizeArabicForSearch("ٱلرَّحْمَٰنِ")).toBe("الرحمن");
    expect(normalizeArabicForSearch("كتـــاب")).toBe("كتاب");
    expect(normalizeArabicForSearch("لَهُۥٓ")).toBe("له");
  });

  it("folds hamza-carrying and wasla alifs, leaves other hamzas alone", () => {
    expect(normalizeArabicForSearch("أَحْمَد إِسْلَام آمَنَ ٱسْم")).toBe("احمد اسلام امن اسم");
    expect(normalizeArabicForSearch("سُؤَال شَيْء")).toBe("سؤال شيء");
  });

  it("agrees with normalizeWithMap", () => {
    const s = "وَٱلْكِتَٰبُ أَحْسَنُ";
    expect(normalizeWithMap(s).normalized).toBe(normalizeArabicForSearch(s));
  });
});

describe("snippetAround", () => {
  it("maps a normalized match back to the original, keeping its diacritics", () => {
    const text = "قَرَأْتُ الْكِتَابَ أَمْسِ";
    const m = normalizeWithMap(text);
    const start = m.normalized.indexOf("الكتاب");
    const { snippet, matchStart, matchEnd } = snippetAround(text, m, start, start + "الكتاب".length, 100);
    expect(snippet.slice(matchStart, matchEnd).trim()).toBe("الْكِتَابَ");
  });
});
