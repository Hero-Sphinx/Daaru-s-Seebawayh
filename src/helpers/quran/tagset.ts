import { waznExamples } from "@/constants";

/**
 * Reference data for the Quranic Arabic Corpus import: its part-of-speech
 * tagset (https://corpus.quran.com/documentation/tagset.jsp) and verb forms.
 * Seeded into pos_tags (tagset = 'qadt') and verb_forms by
 * scripts/import-quran.ts.
 */

export type PosCategory = "noun" | "verb" | "particle";

export interface QadtPosTag {
  code: string;
  nameEn: string;
  nameAr: string;
  category: PosCategory;
}

export const QADT_POS_TAGS: QadtPosTag[] = [
  // Nominals
  { code: "N", nameEn: "Noun", nameAr: "اسم", category: "noun" },
  { code: "PN", nameEn: "Proper noun", nameAr: "اسم علم", category: "noun" },
  { code: "ADJ", nameEn: "Adjective", nameAr: "صفة", category: "noun" },
  { code: "IMPN", nameEn: "Imperative verbal noun", nameAr: "اسم فعل أمر", category: "noun" },
  { code: "PRON", nameEn: "Personal pronoun", nameAr: "ضمير", category: "noun" },
  { code: "DEM", nameEn: "Demonstrative pronoun", nameAr: "اسم إشارة", category: "noun" },
  { code: "REL", nameEn: "Relative pronoun", nameAr: "اسم موصول", category: "noun" },
  { code: "T", nameEn: "Time adverb", nameAr: "ظرف زمان", category: "noun" },
  { code: "LOC", nameEn: "Location adverb", nameAr: "ظرف مكان", category: "noun" },
  // Verbs
  { code: "V", nameEn: "Verb", nameAr: "فعل", category: "verb" },
  // Particles and prefixes
  { code: "DET", nameEn: "Determiner (al-)", nameAr: "أداة تعريف", category: "particle" },
  { code: "P", nameEn: "Preposition", nameAr: "حرف جر", category: "particle" },
  { code: "EMPH", nameEn: "Emphatic lām", nameAr: "لام التوكيد", category: "particle" },
  { code: "IMPV", nameEn: "Imperative lām", nameAr: "لام الأمر", category: "particle" },
  { code: "PRP", nameEn: "Purpose lām", nameAr: "لام التعليل", category: "particle" },
  { code: "CONJ", nameEn: "Coordinating conjunction", nameAr: "حرف عطف", category: "particle" },
  { code: "SUB", nameEn: "Subordinating conjunction", nameAr: "حرف مصدري", category: "particle" },
  { code: "ACC", nameEn: "Accusative particle", nameAr: "حرف نصب", category: "particle" },
  { code: "AMD", nameEn: "Amendment particle", nameAr: "حرف استدراك", category: "particle" },
  { code: "ANS", nameEn: "Answer particle", nameAr: "حرف جواب", category: "particle" },
  { code: "AVR", nameEn: "Aversion particle", nameAr: "حرف ردع", category: "particle" },
  { code: "CAUS", nameEn: "Particle of cause", nameAr: "حرف سببية", category: "particle" },
  { code: "CERT", nameEn: "Particle of certainty", nameAr: "حرف تحقيق", category: "particle" },
  { code: "CIRC", nameEn: "Circumstantial particle", nameAr: "حرف حال", category: "particle" },
  { code: "COM", nameEn: "Comitative particle", nameAr: "واو المعية", category: "particle" },
  { code: "COND", nameEn: "Conditional particle", nameAr: "حرف شرط", category: "particle" },
  { code: "EQ", nameEn: "Equalization particle", nameAr: "حرف تسوية", category: "particle" },
  { code: "EXH", nameEn: "Exhortation particle", nameAr: "حرف تحضيض", category: "particle" },
  { code: "EXL", nameEn: "Explanation particle", nameAr: "حرف تفصيل", category: "particle" },
  { code: "EXP", nameEn: "Exceptive particle", nameAr: "أداة استثناء", category: "particle" },
  { code: "FUT", nameEn: "Future particle", nameAr: "حرف استقبال", category: "particle" },
  { code: "INC", nameEn: "Inceptive particle", nameAr: "حرف ابتداء", category: "particle" },
  { code: "INT", nameEn: "Particle of interpretation", nameAr: "حرف تفسير", category: "particle" },
  { code: "INTG", nameEn: "Interrogative particle", nameAr: "حرف استفهام", category: "particle" },
  { code: "NEG", nameEn: "Negative particle", nameAr: "حرف نفي", category: "particle" },
  { code: "PREV", nameEn: "Preventive particle", nameAr: "حرف كاف", category: "particle" },
  { code: "PRO", nameEn: "Prohibition particle", nameAr: "حرف نهي", category: "particle" },
  { code: "REM", nameEn: "Resumption particle", nameAr: "حرف استئنافية", category: "particle" },
  { code: "RES", nameEn: "Restriction particle", nameAr: "أداة حصر", category: "particle" },
  { code: "RET", nameEn: "Retraction particle", nameAr: "حرف إضراب", category: "particle" },
  { code: "RSLT", nameEn: "Result particle", nameAr: "حرف واقع في جواب الشرط", category: "particle" },
  { code: "SUP", nameEn: "Supplemental particle", nameAr: "حرف زائد", category: "particle" },
  { code: "SUR", nameEn: "Surprise particle", nameAr: "حرف فجاءة", category: "particle" },
  { code: "VOC", nameEn: "Vocative particle", nameAr: "حرف نداء", category: "particle" },
  { code: "INL", nameEn: "Qur'anic initials", nameAr: "حروف مقطعة", category: "particle" },
];

export interface VerbFormMeta {
  formNumber: number;
  roman: string;
  waznPattern: string;
}

const ROMANS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
const EXTRA_PATTERNS: Record<string, string> = {
  IX: "اِفْعَلَّ",
  X: "اِسْتَفْعَلَ",
  XI: "اِفْعَالَّ",
  XII: "اِفْعَوْعَلَ",
};

/** Forms I-VIII reuse src/constants/data/wazn.ts's patterns (single source of truth); IX-XII added here. */
export const VERB_FORMS: VerbFormMeta[] = ROMANS.map((roman, i) => {
  const pattern = waznExamples.find((w) => w.form === roman)?.patternAr ?? EXTRA_PATTERNS[roman];
  if (!pattern) throw new Error(`No wazn pattern for form ${roman}`);
  return { formNumber: i + 1, roman, waznPattern: pattern };
});
