// Client-safe DTOs for the Qur'an reader (no Prisma types, no BigInt).

export interface QuranChapterDTO {
  id: number;
  nameAr: string;
  nameEn: string;
  nameTransliteration: string | null;
  revelationPlace: "meccan" | "medinan" | null;
  verseCount: number;
}

export interface PosDTO {
  code: string;
  nameEn: string;
  nameAr: string;
  category: string | null;
}

export interface QuranSegmentDTO {
  surface: string;
  type: "prefix" | "stem" | "suffix";
  pos: PosDTO | null;
  /** Verbatim corpus feature string, e.g. "PREFIX|w:CONJ+" — shown for transparency. */
  features: string;
}

export interface QuranWordDTO {
  id: string;
  position: number;
  surface: string;
  /** Word-by-word English as it reads in this verse (Quran.com), e.g. "(of) the worlds". */
  translationEn: string | null;
  lemma: { id: string; ar: string } | null;
  root: { id: string; letters: string } | null;
  pos: PosDTO | null;
  grammaticalCase: "nominative" | "accusative" | "genitive" | null;
  gender: string | null;
  grammaticalNumber: string | null;
  person: number | null;
  definiteness: string | null;
  verbAspect: string | null;
  verbMood: string | null;
  verbVoice: string | null;
  verbForm: number | null;
  derivation: string | null;
  segments: QuranSegmentDTO[];
}

export interface QuranVerseDTO {
  number: number;
  text: string;
  words: QuranWordDTO[];
}

export interface RootFamilyDTO {
  root: { id: string; letters: string };
  /** Qur'an occurrences of words from this root. */
  occurrences: number;
  lemmas: RootFamilyLemmaDTO[];
}

export interface RootFamilyLemmaDTO {
  id: string;
  ar: string;
  pos: PosDTO | null;
  verbForm: number | null;
  occurrences: number;
  /** The lemma's most common rendering across the Qur'an, e.g. "Lord". */
  meaning: string | null;
  /** Other distinct renderings, most common first, e.g. ["Sustainer"]. */
  alternatives: string[];
}
