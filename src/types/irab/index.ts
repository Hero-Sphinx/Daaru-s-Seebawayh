/** Mirrors the shape of `tokens` + `dependency_edges` in db/schema.sql. */

export type CaseType = "rafa" | "nasb" | "jarr" | "jazm" | "mabni";

export interface CaseSign {
  caseType: CaseType;
  signAr: string;
  signEn: string;
  /** Why a substitute sign applies, e.g. "لِأَنَّهُ جَمْعُ مُذَكَّرٍ سَالِمٌ" — absent for the ordinary vowels. */
  reasonAr?: string;
  reasonEn?: string;
}

export type RoleCode =
  | "FIL"
  | "FAAIL"
  | "MAFUL_BIH"
  | "MUBTADA"
  | "KHABAR"
  | "HARF_JARR"
  | "MAJROOR"
  | "NAAT"
  // إنّ and its sisters: the particle, its noun (manṣūb), its predicate (marfūʿ).
  | "INNA"
  | "ISM_INNA"
  | "KHABAR_INNA"
  // كان and its sisters: the verb, its noun (marfūʿ), its predicate (manṣūb).
  | "KANA"
  | "ISM_KANA"
  | "KHABAR_KANA"
  // لا النافية للجنس
  | "ISM_LA"
  | "KHABAR_LA"
  | "NAIB_FAAIL"
  | "MUDAF_ILAYH"
  | "MATUF"
  | "BADAL"
  | "MAFUL_MUTLAQ"
  | "HAL"
  | "TAMYIZ"
  /** ظرف زمان/مكان منصوب (أَمَامَ، عِنْدَ، قَبْلَ…). */
  | "MAFUL_FIH"
  /** A particle with no case slot of its own: negation, conjunction, resumption… (its kind says which). */
  | "HARF";

export interface GrammaticalRole {
  code: RoleCode;
  nameAr: string;
  nameEn: string;
  category: "verbal" | "nominal" | "particle";
  ruleReference?: string;
}

export interface IrabToken {
  id: number;
  positionInUnit: number;
  surfaceForm: string; // with tashkeel
  lemma: string;
  root: string;
  posNameAr: string;
  posNameEn: string;
  caseSign?: CaseSign;
  /** Mabni words (particles, pronouns, demonstratives): the fixed ending, when the books agree on it. */
  builtOn?: { ar: string; en: string };
  /** Mabni words standing in a declinable slot: the case of that position (فِي مَحَلِّ رَفْعٍ). */
  mahall?: CaseType;
  /** Extra clauses appended to this word's i'rab: its attached/implied subject, "وهو مضاف", a clause's position… */
  noteAr?: string;
  noteEn?: string;
  analysisSource: "qadt" | "farasa" | "camel" | "manual" | "quranic_corpus";
}

export interface DependencyEdge {
  tokenId: number;
  headTokenId: number | null; // null = sentence root
  role: GrammaticalRole;
}

export interface SentenceAnalysis {
  id: string;
  sourceLabel: string; // e.g. "Al-Ajurrumiyyah, example sentence" or "Quran 1:1"
  translationEn?: string;
  /** "curated" (hand-written, e.g. sample-sentence.ts) needs no disclaimer; "gemini" (free-text input) must be labeled AI-generated/unverified — translation isn't a grammar claim, so Gemini is allowed here, but it's still not verified. */
  translationSource?: "curated" | "gemini";
  tokens: IrabToken[];
  edges: DependencyEdge[];
}
