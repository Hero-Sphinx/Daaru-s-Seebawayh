import { SM2_DEFAULTS, type Sm2State } from "@/lib/srs/sm2";

export interface VocabularyCard {
  id: number;
  wordAr: string;
  transliteration: string;
  meaningEn: string;
  root: string;
  exampleAr: string;
  source: "manual" | "library_extraction" | "quran";
  sm2: Sm2State;
}

export const mockVocabularyQueue: VocabularyCard[] = [
  {
    id: 1,
    wordAr: "كِتَاب",
    transliteration: "kitāb",
    meaningEn: "book",
    root: "ك ت ب",
    exampleAr: "قَرَأْتُ الكِتَابَ",
    source: "manual",
    sm2: SM2_DEFAULTS,
  },
  {
    id: 2,
    wordAr: "عِلْم",
    transliteration: "ʿilm",
    meaningEn: "knowledge",
    root: "ع ل م",
    exampleAr: "طَلَبُ العِلْمِ فَرِيضَةٌ",
    source: "quran",
    sm2: { easinessFactor: 2.6, intervalDays: 6, repetitions: 2 },
  },
  {
    id: 3,
    wordAr: "دَرْس",
    transliteration: "dars",
    meaningEn: "lesson",
    root: "د ر س",
    exampleAr: "كَتَبَ الطَّالِبُ الدَّرْسَ",
    source: "library_extraction",
    sm2: SM2_DEFAULTS,
  },
  {
    id: 4,
    wordAr: "حِكْمَة",
    transliteration: "ḥikmah",
    meaningEn: "wisdom",
    root: "ح ك م",
    exampleAr: "الحِكْمَةُ ضَالَّةُ المُؤْمِنِ",
    source: "library_extraction",
    sm2: { easinessFactor: 2.3, intervalDays: 1, repetitions: 0 },
  },
];
