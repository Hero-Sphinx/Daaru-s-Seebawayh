import type { SentenceAnalysis } from "@/types/irab";

/**
 * Classic Ajurrumiyyah-style demonstration sentence:
 * كَتَبَ الطَّالِبُ الدَّرْسَ  ("The student wrote the lesson.")
 * Fi'l (verb) + Fa'il (subject, marfu') + Maf'ul bihi (object, mansub) —
 * enough structure to exercise every part of the I'rab workspace UI.
 */
export const sampleSentence: SentenceAnalysis = {
  id: "demo-1",
  sourceLabel: "Al-Ajurrumiyyah — worked example",
  tokens: [
    {
      id: 1,
      positionInUnit: 0,
      surfaceForm: "كَتَبَ",
      lemma: "كَتَبَ",
      root: "ك ت ب",
      posNameAr: "فعل ماضٍ",
      posNameEn: "Past-tense verb",
      caseSign: { caseType: "mabni", signAr: "مبني على الفتح", signEn: "Built on fatha" },
      analysisSource: "manual",
    },
    {
      id: 2,
      positionInUnit: 1,
      surfaceForm: "الطَّالِبُ",
      lemma: "طَالِب",
      root: "ط ل ب",
      posNameAr: "اسم",
      posNameEn: "Noun",
      caseSign: { caseType: "rafa", signAr: "الضمة", signEn: "Damma" },
      analysisSource: "manual",
    },
    {
      id: 3,
      positionInUnit: 2,
      surfaceForm: "الدَّرْسَ",
      lemma: "دَرْس",
      root: "د ر س",
      posNameAr: "اسم",
      posNameEn: "Noun",
      caseSign: { caseType: "nasb", signAr: "الفتحة", signEn: "Fatha" },
      analysisSource: "manual",
    },
  ],
  edges: [
    {
      tokenId: 1,
      headTokenId: null,
      role: { code: "FIL", nameAr: "فعل", nameEn: "Verb (predicate)", category: "verbal" },
    },
    {
      tokenId: 2,
      headTokenId: 1,
      role: {
        code: "FAAIL",
        nameAr: "فاعل",
        nameEn: "Subject",
        category: "nominal",
        ruleReference: "Ajurrumiyyah, Bab al-Fa'il",
      },
    },
    {
      tokenId: 3,
      headTokenId: 1,
      role: {
        code: "MAFUL_BIH",
        nameAr: "مفعول به",
        nameEn: "Direct object",
        category: "nominal",
        ruleReference: "Ajurrumiyyah, Bab al-Maf'ulat",
      },
    },
  ],
};
