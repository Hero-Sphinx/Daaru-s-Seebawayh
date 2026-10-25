import { describe, expect, it } from "vitest";
import { cleanTafsirText, isSameAyahText, quranLetters, withQuranBrackets } from "@/helpers";

describe("cleanTafsirText", () => {
  it("drops the āyah number QuranEnc puts before each English entry", () => {
    expect(cleanTafsirText("1. I begin by calling on Allah")).toBe("I begin by calling on Allah");
    expect(cleanTafsirText("286. Allah does not burden")).toBe("Allah does not burden");
  });

  it("keeps numbers that are part of the text", () => {
    expect(cleanTafsirText("Seven heavens. 2. is not a prefix here")).toBe("Seven heavens. 2. is not a prefix here");
  });

  it("collapses whitespace and leaves Arabic wording alone", () => {
    expect(cleanTafsirText("  ذلك القرآن\n هو   الكتاب ")).toBe("ذلك القرآن هو الكتاب");
  });

  it("treats a missing entry as empty", () => {
    expect(cleanTafsirText(null)).toBe("");
    expect(cleanTafsirText(undefined)).toBe("");
  });
});

describe("withQuranBrackets", () => {
  it("shows āyāt quoted in braces inside ﴿ ﴾", () => {
    expect(withQuranBrackets("وهي قوله تعالى: {رَبَّنَا ظَلَمْنَا أَنْفُسَنَا} فتاب الله عليه")).toBe(
      "وهي قوله تعالى: ﴿رَبَّنَا ظَلَمْنَا أَنْفُسَنَا﴾ فتاب الله عليه",
    );
  });

  it("leaves text without braces unchanged", () => {
    expect(withQuranBrackets("الحمد لله")).toBe("الحمد لله");
  });
});

describe("isSameAyahText", () => {
  // Our text (Quranic Arabic Corpus) and QuranEnc's spell some āyāt slightly differently.
  const ours = (text: string) => quranLetters(text);

  it("matches the same āyah across marks and the yāʾ / alif maqṣūrah spelling", () => {
    expect(isSameAyahText("ٱلَّذِي يُوَسۡوِسُ فِي صُدُورِ ٱلنَّاسِ", ours("ٱلَّذِى يُوَسْوِسُ فِى صُدُورِ ٱلنَّاسِ"))).toBe(true);
  });

  it("matches hamza + alif written as madda", () => {
    expect(isSameAyahText("وَبِٱلۡأٓخِرَةِ هُمۡ يُوقِنُونَ", ours("وَبِٱلْءَاخِرَةِ هُمْ يُوقِنُونَ"))).toBe(true);
  });

  it("tolerates a hamza on a different seat", () => {
    expect(isSameAyahText("كَأَمۡثَٰلِ ٱللُّؤۡلُوِٕ ٱلۡمَكۡنُونِ", ours("كَأَمْثَٰلِ ٱللُّؤْلُؤِ ٱلْمَكْنُونِ"))).toBe(true);
  });

  it("rejects a different āyah, even a short neighbour", () => {
    expect(isSameAyahText("قُلۡ أَعُوذُ بِرَبِّ ٱلنَّاسِ", ours("مَلِكِ ٱلنَّاسِ"))).toBe(false);
    expect(isSameAyahText("ٱللَّهُ ٱلصَّمَدُ", ours("قُلْ هُوَ ٱللَّهُ أَحَدٌ"))).toBe(false);
  });
});
