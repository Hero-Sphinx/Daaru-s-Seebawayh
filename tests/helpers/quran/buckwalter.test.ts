import { describe, expect, it } from "vitest";
import { rootToArabic, toArabic, toArabicLexical, toSimpleArabic, UnknownBuckwalterCharError } from "@/helpers/quran/buckwalter";

describe("extended Buckwalter decoding", () => {
  it("decodes the basmalah's words exactly (NFC)", () => {
    expect(toArabic("bi") + toArabic("somi")).toBe("بِسْمِ".normalize("NFC"));
    expect(toArabic("{ll~ahi")).toBe("ٱللَّهِ".normalize("NFC"));
    expect(toArabic("{l") + toArabic("r~aHoma`ni")).toBe("ٱلرَّحْمَٰنِ".normalize("NFC"));
  });

  it("normalizes mark order regardless of source order", () => {
    // Source order shadda-then-fatha ("l~a") must equal typed fatha-then-shadda.
    expect(toArabic("l~a")).toBe("لَّ".normalize("NFC"));
    expect(toArabic("l~a")).toBe(toArabic("la~"));
  });

  it("keeps Uthmani marks in faithful mode and drops them in lexical mode", () => {
    // D~aA^l~iyna (1:7) carries a maddah (^) over the alif.
    // ض ّ َ ا + maddah-above (U+0653) ل ِّ ي ن َ
    expect(toArabic("D~aA^l~iyna")).toBe("ضَّآلِّينَ".normalize("NFC"));
    expect(toArabicLexical("D~aA^l~iyna")).not.toContain("ٓ");
    expect(toArabicLexical("D~aA^l~iyna")).toBe("ضَّالِّينَ".normalize("NFC"));
  });

  it("formats roots as space-separated letters, matching CAMeL Tools", () => {
    expect(rootToArabic("ktb")).toBe("ك ت ب");
    expect(rootToArabic("Hmd")).toBe("ح م د");
    expect(rootToArabic("n*r")).toBe("ن ذ ر");
  });

  it("throws on characters outside the scheme rather than passing them through", () => {
    expect(() => toArabic("ki?tab")).toThrow(UnknownBuckwalterCharError);
  });

  it("produces searchable simple text", () => {
    expect(toSimpleArabic(toArabic("{ll~ahi"))).toBe("الله");
    expect(toSimpleArabic(toArabic("r~aHoma`ni"))).toBe("رحمن");
  });
});
