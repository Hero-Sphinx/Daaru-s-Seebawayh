import { describe, expect, it } from "vitest";
import { buildIrabSentence } from "./irab-sentence";
import { GRAMMATICAL_ROLES, CASE_SIGNS } from "@/lib/data/grammatical-roles";
import type { IrabToken } from "@/types/irab";

describe("buildIrabSentence", () => {
  it("renders the traditional formula for a rafa/damma subject (Fa'il)", () => {
    const token: IrabToken = {
      id: 1,
      positionInUnit: 0,
      surfaceForm: "مُحَمَّدٌ",
      lemma: "مُحَمَّد",
      root: "ح م د",
      posNameAr: "اسم",
      posNameEn: "Noun",
      caseSign: CASE_SIGNS.rafa,
      analysisSource: "camel",
    };
    const result = buildIrabSentence(token, GRAMMATICAL_ROLES.FAAIL);
    expect(result).not.toBeNull();
    expect(result!.ar).toBe("فاعل مَرْفُوعٌ، وَعَلامَةُ رَفْعِهِ الضَّمَّةُ الظّاهِرَةُ عَلى آخِرِهِ.");
    expect(result!.transliteration).toBe("Subject (fa'il), marfū‘un, wa ‘alāmatu raf‘ihi ad-dammatu ẓāhiratun ‘alā ākhirihi.");
    expect(result!.en).toBe(
      "Subject (fa'il), in the nominative case; the sign of its nominative case is the damma, visible at the end of the word."
    );
  });

  it("skips the redundant case adjective for majroor (already stated in the role name)", () => {
    const token: IrabToken = {
      id: 4,
      positionInUnit: 3,
      surfaceForm: "الكُرْسِيِّ",
      lemma: "كُرْسِيّ",
      root: "ك ر س",
      posNameAr: "اسم",
      posNameEn: "Noun",
      caseSign: CASE_SIGNS.jarr,
      analysisSource: "camel",
    };
    const result = buildIrabSentence(token, GRAMMATICAL_ROLES.MAJROOR);
    expect(result!.ar).toBe("اسم مجرور، وَعَلامَةُ جَرِّهِ الكَسْرَةُ الظّاهِرَةُ عَلى آخِرِهِ.");
  });

  it("states mabni plainly without guessing a specific binaa' vowel", () => {
    const token: IrabToken = {
      id: 1,
      positionInUnit: 0,
      surfaceForm: "جَلَسَ",
      lemma: "جَلَس",
      root: "ج ل س",
      posNameAr: "فعل",
      posNameEn: "Verb",
      caseSign: CASE_SIGNS.mabni,
      analysisSource: "camel",
    };
    const result = buildIrabSentence(token, GRAMMATICAL_ROLES.FIL);
    expect(result!.ar).toBe("فعل مَبْنِيٌّ.");
  });

  it("returns null for a token with no resolved role or case sign", () => {
    const token: IrabToken = {
      id: 2,
      positionInUnit: 1,
      surfaceForm: "شَيْءٌ",
      lemma: "",
      root: "",
      posNameAr: "غير محدد",
      posNameEn: "Not determined",
      analysisSource: "camel",
    };
    expect(buildIrabSentence(token, undefined)).toBeNull();
  });
});

describe("buildIrabSentence — mabni words and substitute signs", async () => {
  const { buildIrabSentence } = await import("./irab-sentence");
  const { GRAMMATICAL_ROLES } = await import("@/lib/data/grammatical-roles");
  const base = { id: 1, positionInUnit: 0, surfaceForm: "", lemma: "", root: "", analysisSource: "camel" as const };
  const mabni = { caseType: "mabni" as const, signAr: "مبني", signEn: "Indeclinable (mabni)" };

  it("states a pronoun's fixed ending and its position", () => {
    const s = buildIrabSentence(
      { ...base, posNameAr: "ضَمِيرٌ مُنْفَصِلٌ", posNameEn: "Detached pronoun", caseSign: mabni, builtOn: { ar: "الفَتْحِ", en: "the fatha" }, mahall: "rafa" },
      GRAMMATICAL_ROLES.MUBTADA
    )!;
    expect(s.ar).toBe("مبتدأ، ضَمِيرٌ مُنْفَصِلٌ مَبْنِيٌّ عَلَى الفَتْحِ فِي مَحَلِّ رَفْعٍ.");
  });

  it("describes inna by its own kind", () => {
    const s = buildIrabSentence(
      { ...base, posNameAr: "حَرْفُ تَوْكِيدٍ وَنَصْبٍ", posNameEn: "Particle of emphasis (inna)", caseSign: mabni, builtOn: { ar: "الفَتْحِ", en: "the fatha" } },
      GRAMMATICAL_ROLES.INNA
    )!;
    expect(s.ar).toBe("حَرْفُ تَوْكِيدٍ وَنَصْبٍ مَبْنِيٌّ عَلَى الفَتْحِ.");
  });

  it("gives the reason for a letter sign instead of 'visible at the end'", () => {
    const s = buildIrabSentence(
      {
        ...base,
        posNameAr: "اسم",
        posNameEn: "Noun",
        caseSign: { caseType: "rafa", signAr: "الواو", signEn: "Waw", reasonAr: "لِأَنَّهُ جَمْعُ مُذَكَّرٍ سَالِمٌ", reasonEn: "because it is a sound masculine plural" },
      },
      GRAMMATICAL_ROLES.FAAIL
    )!;
    expect(s.ar).toBe("فاعل مَرْفُوعٌ، وَعَلامَةُ رَفْعِهِ الوَاوُ لِأَنَّهُ جَمْعُ مُذَكَّرٍ سَالِمٌ.");
    expect(s.ar).not.toContain("الظّاهِرَةُ");
  });
});
