import db from "@/server/databases/db";
import { Prisma } from "@/generated/prisma/client";
import { normalizeArabicForSearch } from "@/helpers/arabic/normalize";
import { matchLemma } from "@/helpers/quran/lemmaMatch";
import { getLemmaIndex } from "@/server/services/quran/queries";
import { buildRootFormIndex, parseRootInput, peelPrefixes, type RootFormIndex } from "./rootSearch";

/** DB side of root-aware search: resolving input to roots, and loading a root's attested forms. */

export interface ResolvedRoot {
  id: bigint;
  letters: string;
}

/**
 * Roots the input could belong to: an explicit root (ك ت ب), a dictionary
 * headword (via the same lemma matcher vocabulary linking uses), or an
 * inflected form found verbatim in the Qur'an (يكتبون). Several roots are
 * possible for a genuinely ambiguous word; all are returned.
 */
export async function resolveRoots(input: string): Promise<ResolvedRoot[]> {
  const explicit = parseRootInput(input);
  if (explicit) {
    const root = await db.roots.findUnique({ where: { root_letters: explicit } });
    return root ? [{ id: root.id, letters: root.root_letters }] : [];
  }

  const found = new Map<string, string>(); // root letters -> id
  const index = await getLemmaIndex();
  const lemma = matchLemma(index, input);
  if (lemma?.rootLetters) found.set(lemma.rootLetters, "");

  // Inflected forms: compare against the Qur'an's word forms, with and
  // without attached prefixes (so وكتابه-style input still resolves).
  const candidates = peelPrefixes(normalizeArabicForSearch(input.trim()));
  const rows = await db.$queryRaw<{ id: bigint; root_letters: string }[]>`
    SELECT DISTINCT r.id, r.root_letters
    FROM tokens t JOIN roots r ON r.id = t.root_id
    WHERE t.quran_verse_id IS NOT NULL AND t.parent_segment_token_id IS NULL
      AND translate(t.surface_form_bare, chr(1571) || chr(1573) || chr(1570), repeat(chr(1575), 3)) = ANY(${candidates}::text[])
    LIMIT 5`;
  for (const r of rows) found.set(r.root_letters, r.id.toString());

  if (found.size === 0) return [];
  const roots = await db.roots.findMany({ where: { root_letters: { in: [...found.keys()] } } });
  return roots.map((r) => ({ id: r.id, letters: r.root_letters }));
}

/**
 * "Did you mean" lemmas for input that resolved to nothing — pg_trgm
 * similarity against diacritic-stripped headwords (~5k rows, so a scan is
 * cheap; the trigram *index* is used by the library text search itself).
 */
export async function suggestLemmas(input: string): Promise<{ lemma: string; root: string }[]> {
  const q = normalizeArabicForSearch(input.trim());
  if (!q) return [];
  // Headword in learner spelling: dagger alif written out as a full alif
  // (كِتَٰب -> كتاب; dropped after alif maqsura, عَلَىٰ -> على), then marks
  // stripped and hamza/wasla alifs folded. Stripping the dagger instead
  // (-> كتب) was confirmed live to sink the obvious suggestion below the cutoff.
  const headword = Prisma.sql`translate(
    regexp_replace(
      replace(replace(l.lemma_ar, chr(1609) || chr(1648), chr(1609)), chr(1648), chr(1575)),
      '[' || chr(1611) || '-' || chr(1631) || chr(1750) || '-' || chr(1773) || chr(1600) || ']', '', 'g'),
    chr(1571) || chr(1573) || chr(1570) || chr(1649), repeat(chr(1575), 4))`;
  const rows = await db.$queryRaw<{ lemma_ar: string; root_letters: string }[]>`
    SELECT l.lemma_ar, r.root_letters
    FROM lemmas l JOIN roots r ON r.id = l.root_id
    WHERE similarity(${headword}, ${q}) > 0.3
    ORDER BY similarity(${headword}, ${q}) DESC, l.frequency_rank
    LIMIT 5`;
  return rows.map((r) => ({ lemma: r.lemma_ar, root: r.root_letters }));
}

/** Every Qur'an-attested word form and stem of a root, as a match index. */
export async function loadRootFormIndex(rootId: bigint): Promise<RootFormIndex> {
  const [words, stems] = await Promise.all([
    db.$queryRaw<{ surface_form: string }[]>`
      SELECT DISTINCT surface_form FROM tokens
      WHERE root_id = ${rootId} AND quran_verse_id IS NOT NULL AND parent_segment_token_id IS NULL`,
    db.$queryRaw<{ surface_form: string }[]>`
      SELECT DISTINCT s.surface_form FROM tokens s JOIN tokens w ON w.id = s.parent_segment_token_id
      WHERE w.root_id = ${rootId} AND s.segment_type = 'stem'`,
  ]);
  return buildRootFormIndex(
    words.map((w) => w.surface_form),
    stems.map((s) => s.surface_form)
  );
}
