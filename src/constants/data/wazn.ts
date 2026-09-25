/**
 * Curated verb-pattern (wazn) examples for Sarf quizzes — standard Form
 * I-VIII examples as taught in most Arabic grammar primers (e.g. Al-Kitaab,
 * Madina Books). One unambiguous, well-known verb per form.
 */

export interface WaznExample {
  verbAr: string;
  transliteration: string;
  meaningEn: string;
  form: "I" | "II" | "III" | "IV" | "V" | "VI" | "VII" | "VIII";
  patternAr: string;
}

export const waznExamples: WaznExample[] = [
  { verbAr: "كَتَبَ", transliteration: "kataba", meaningEn: "he wrote", form: "I", patternAr: "فَعَلَ" },
  { verbAr: "عَلَّمَ", transliteration: "ʿallama", meaningEn: "he taught", form: "II", patternAr: "فَعَّلَ" },
  { verbAr: "قَاتَلَ", transliteration: "qātala", meaningEn: "he fought", form: "III", patternAr: "فَاعَلَ" },
  { verbAr: "أَكْرَمَ", transliteration: "akrama", meaningEn: "he honored", form: "IV", patternAr: "أَفْعَلَ" },
  { verbAr: "تَعَلَّمَ", transliteration: "taʿallama", meaningEn: "he learned", form: "V", patternAr: "تَفَعَّلَ" },
  { verbAr: "تَقَاتَلَ", transliteration: "taqātala", meaningEn: "they fought each other", form: "VI", patternAr: "تَفَاعَلَ" },
  { verbAr: "اِنْكَسَرَ", transliteration: "inkasara", meaningEn: "it broke (intransitive)", form: "VII", patternAr: "اِنْفَعَلَ" },
  { verbAr: "اِجْتَمَعَ", transliteration: "ijtamaʿa", meaningEn: "he gathered", form: "VIII", patternAr: "اِفْتَعَلَ" },
];
