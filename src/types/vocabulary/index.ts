import type { Sm2State } from "@/helpers";

/** One morphological reading of a word (CAMeL Tools; see services/camel/app.py). */
export interface MorphCandidate {
  root: string | null;
  lemma: string | null;
  pos: string | null;
  diac: string | null;
  gender: string | null;
  number: string | null;
  // Morphosyntactic features — present only for dedupe=false (the I'rab
  // parser). CAMeL's own codes; see services/camel/app.py's Candidate.
  person?: string | null;
  aspect?: string | null;
  mood?: string | null;
  case?: string | null;
  state?: string | null;
  voice?: string | null;
  prc0?: string | null;
  prc1?: string | null;
  prc2?: string | null;
  prc3?: string | null;
  enc0?: string | null;
  bw?: string | null;
}


/** Shape the vocabulary UI components consume, regardless of whether a row is lemma-linked or custom. */
export interface VocabularyCardDTO {
  id: number;
  /** srs_cards.id for the ar_to_en card — null if this vocabulary item has no SRS card yet. */
  cardId: number | null;
  wordAr: string;
  transliteration: string;
  meaningEn: string;
  root: string;
  exampleAr: string;
  source: "manual" | "library_extraction" | "quran";
  sm2: Sm2State;
  /** Leitner box 1-5 (src/helpers/srs/leitner.ts) — only meaningful when the learner uses Leitner. */
  leitnerBox: number;
  /** When the card is next due (ISO), or null without a card. */
  dueAt: string | null;
  /** Linked Qur'an lemma, if any (src/helpers/quran/lemmaMatch.ts). */
  lemmaId: string | null;
  /** A recited occurrence of the linked lemma — filled in by withQuranOccurrences(). */
  quranOccurrence: { chapter: number; verse: number; word: number; surface: string } | null;
}

/** POST /api/vocabulary/lookup response. */
export interface WordLookupResponse {
  arabicWord: string;
  meaningEn: string | null;
  transliteration: string | null;
  aiAssisted: boolean;
  camelCandidates: MorphCandidate[];
}

export interface VocabularyPageData {
  /** Every word in the bank, newest first. */
  allCards: VocabularyCardDTO[];
  /** Cards due now, most overdue first. */
  dueCards: VocabularyCardDTO[];
  algorithm: "sm2" | "leitner";
}
