import { SM2_DEFAULTS, type Sm2State } from "@/lib/srs/sm2";

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
  /** Leitner box 1-5 (src/lib/srs/leitner.ts) — only meaningful when the learner uses Leitner. */
  leitnerBox: number;
  /** Linked Qur'an lemma, if any (src/lib/quran/lemma-match.ts). */
  lemmaId: string | null;
  /** A recited occurrence of the linked lemma — filled in by withQuranOccurrences(). */
  quranOccurrence: { chapter: number; verse: number; word: number; surface: string } | null;
}

/** Minimal shape of a vocabulary_items row as returned by the Prisma queries in the API routes. */
export interface VocabularyItemRow {
  id: bigint;
  lemma_id?: bigint | null;
  source: string;
  custom_word_ar: string | null;
  custom_root: string | null;
  custom_meaning_en: string | null;
  custom_transliteration: string | null;
  example_sentence_ar: string | null;
  lemmas: { lemma_ar: string; lemma_transliteration: string | null; meaning_en: string | null; roots: { root_letters: string } | null } | null;
  srs_cards: { id: bigint; easiness_factor: unknown; interval_days: number; repetitions: number; leitner_box?: number }[];
}

export function toVocabularyCardDTO(row: VocabularyItemRow): VocabularyCardDTO {
  const card = row.srs_cards[0];
  return {
    id: Number(row.id),
    cardId: card ? Number(card.id) : null,
    // What the learner entered wins; the linked Qur'an lemma only fills
    // gaps (e.g. a root they didn't type). Its Uthmani spelling (كِتَٰب)
    // must not silently replace the word they're studying (كتاب).
    wordAr: row.custom_word_ar ?? row.lemmas?.lemma_ar ?? "",
    transliteration: row.custom_transliteration ?? row.lemmas?.lemma_transliteration ?? "",
    meaningEn: row.custom_meaning_en ?? row.lemmas?.meaning_en ?? "",
    root: row.custom_root ?? row.lemmas?.roots?.root_letters ?? "",
    exampleAr: row.example_sentence_ar ?? "",
    source: row.source as VocabularyCardDTO["source"],
    sm2: card
      ? { easinessFactor: Number(card.easiness_factor), intervalDays: card.interval_days, repetitions: card.repetitions }
      : SM2_DEFAULTS,
    leitnerBox: card?.leitner_box ?? 1,
    lemmaId: row.lemma_id ? row.lemma_id.toString() : null,
    quranOccurrence: null,
  };
}

export interface ParsedVocabularyRow {
  wordAr: string;
  meaningEn: string;
  root?: string;
  transliteration?: string;
  exampleAr?: string;
}

/**
 * Parses bulk vocabulary input (CSV or comma-separated paste): one word per
 * line, `arabic,meaning[,root[,transliteration[,example]]]`. Blank lines and
 * a header row starting with "arabic" (case-insensitive) are skipped.
 * Returns only rows with both an Arabic word and a meaning — the two
 * required fields (chk_vocab_has_word / vocabulary_items.custom_word_ar).
 */
export function parseBulkVocabularyText(text: string): ParsedVocabularyRow[] {
  const rows: ParsedVocabularyRow[] = [];
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;
    if (/^arabic\s*,/i.test(line)) continue; // header row

    const cols = line.split(",").map((c) => c.trim());
    const [wordAr, meaningEn, root, transliteration, exampleAr] = cols;
    if (!wordAr || !meaningEn) continue;

    rows.push({
      wordAr,
      meaningEn,
      root: root || undefined,
      transliteration: transliteration || undefined,
      exampleAr: exampleAr || undefined,
    });
  }
  return rows;
}
