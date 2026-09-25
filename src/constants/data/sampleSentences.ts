import type { SentenceAnalysis } from "@/types/irab";
import { CASE_SIGNS, GRAMMATICAL_ROLES } from "@/constants/data/grammaticalRoles";

/**
 * Curated worked examples for the I'rab Workspace's sentence picker. Each one
 * is a standard example from Arabic grammar primers (Al-Ajurrumiyyah-level),
 * chosen so every token's case/role is unambiguous — the whole point of this
 * app is that every claim here is verifiable against a named rule reference,
 * not generated. Keep new entries to the same standard.
 */
export const sampleSentences: SentenceAnalysis[] = [
  {
    id: "demo-1",
    sourceLabel: "Al-Ajurrumiyyah — worked example",
    translationEn: "The student wrote the lesson.",
    translationSource: "curated",
    tokens: [
      {
        id: 1,
        positionInUnit: 0,
        surfaceForm: "كَتَبَ",
        lemma: "كَتَبَ",
        root: "ك ت ب",
        posNameAr: "فعل ماضٍ",
        posNameEn: "Past-tense verb",
        caseSign: CASE_SIGNS.mabni,
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
        caseSign: CASE_SIGNS.rafa,
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
        caseSign: CASE_SIGNS.nasb,
        analysisSource: "manual",
      },
    ],
    edges: [
      { tokenId: 1, headTokenId: null, role: GRAMMATICAL_ROLES.FIL },
      { tokenId: 2, headTokenId: 1, role: GRAMMATICAL_ROLES.FAAIL },
      { tokenId: 3, headTokenId: 1, role: GRAMMATICAL_ROLES.MAFUL_BIH },
    ],
  },
  {
    id: "demo-2",
    sourceLabel: "Classical proverb — mubtada' wa-khabar",
    translationEn: "Knowledge is light.",
    translationSource: "curated",
    tokens: [
      {
        id: 4,
        positionInUnit: 0,
        surfaceForm: "الْعِلْمُ",
        lemma: "عِلْم",
        root: "ع ل م",
        posNameAr: "اسم",
        posNameEn: "Noun",
        caseSign: CASE_SIGNS.rafa,
        analysisSource: "manual",
      },
      {
        id: 5,
        positionInUnit: 1,
        surfaceForm: "نُورٌ",
        lemma: "نُور",
        root: "ن و ر",
        posNameAr: "اسم",
        posNameEn: "Noun",
        caseSign: CASE_SIGNS.rafa,
        analysisSource: "manual",
      },
    ],
    edges: [
      { tokenId: 4, headTokenId: null, role: GRAMMATICAL_ROLES.MUBTADA },
      { tokenId: 5, headTokenId: 4, role: GRAMMATICAL_ROLES.KHABAR },
    ],
  },
  {
    id: "demo-3",
    sourceLabel: "Al-Ajurrumiyyah — worked example, huruf al-khafd",
    translationEn: "The student went to school.",
    translationSource: "curated",
    tokens: [
      {
        id: 6,
        positionInUnit: 0,
        surfaceForm: "ذَهَبَ",
        lemma: "ذَهَبَ",
        root: "ذ ه ب",
        posNameAr: "فعل ماضٍ",
        posNameEn: "Past-tense verb",
        caseSign: CASE_SIGNS.mabni,
        analysisSource: "manual",
      },
      {
        id: 7,
        positionInUnit: 1,
        surfaceForm: "الطَّالِبُ",
        lemma: "طَالِب",
        root: "ط ل ب",
        posNameAr: "اسم",
        posNameEn: "Noun",
        caseSign: CASE_SIGNS.rafa,
        analysisSource: "manual",
      },
      {
        id: 8,
        positionInUnit: 2,
        surfaceForm: "إِلَى",
        lemma: "إِلَى",
        root: "",
        posNameAr: "حرف جر",
        posNameEn: "Preposition (particle)",
        caseSign: CASE_SIGNS.mabni,
        analysisSource: "manual",
      },
      {
        id: 9,
        positionInUnit: 3,
        surfaceForm: "الْمَدْرَسَةِ",
        lemma: "مَدْرَسَة",
        root: "د ر س",
        posNameAr: "اسم",
        posNameEn: "Noun",
        caseSign: CASE_SIGNS.jarr,
        analysisSource: "manual",
      },
    ],
    edges: [
      { tokenId: 6, headTokenId: null, role: GRAMMATICAL_ROLES.FIL },
      { tokenId: 7, headTokenId: 6, role: GRAMMATICAL_ROLES.FAAIL },
      { tokenId: 8, headTokenId: 6, role: GRAMMATICAL_ROLES.HARF_JARR },
      { tokenId: 9, headTokenId: 8, role: GRAMMATICAL_ROLES.MAJROOR },
    ],
  },
];

/** Default sentence for entry points that don't offer a picker. */
export const sampleSentence: SentenceAnalysis = sampleSentences[0];
