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
