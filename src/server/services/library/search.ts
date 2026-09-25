import "server-only";
import { normalizeArabicForSearch, normalizeWithMap, snippetAround } from "@/helpers";
import { db } from "@/server/databases";
import { accessibleDocumentsSql, accessibleDocumentsWhere } from "./access";
import { findRootMatches } from "./rootSearch";
import { loadRootFormIndex, resolveRoots, suggestLemmas } from "./rootSearchDb";

/**
 * FR-2.5 library search, two modes:
 * - text (default): diacritic-insensitive substring match — "كتاب" finds
 *   "كِتَابٌ" — over library_text_units.raw_text_normalized (pg_trgm GIN index).
 * - root: every word from the same root, using the forms of that root
 *   attested in the Qur'an (src/server/services/library/rootSearch.ts).
 */

const MAX_RESULTS = 40;
/** Pages scanned precisely after the SQL pre-filter, in root mode. */
const MAX_ROOT_CANDIDATE_UNITS = 300;
const MAX_ROOTS = 3;

export interface SearchResult {
  documentId: string;
  documentTitle: string;
  pageNumber: number | null;
  snippet: string;
  matchStart: number;
  matchEnd: number;
  matchCount: number;
  matchedWords?: string[];
  root?: string;
}

export async function searchText(userId: string, q: string) {
  const needle = normalizeArabicForSearch(q);
  const results: SearchResult[] = [];
  if (!needle) return { mode: "text" as const, query: q, results };

  const units = await db.library_text_units.findMany({
    where: { raw_text_normalized: { contains: needle }, library_documents: accessibleDocumentsWhere(userId) },
    include: { library_documents: { select: { id: true, title: true } } },
    orderBy: [{ document_id: "asc" }, { sequence_in_doc: "asc" }],
    take: MAX_RESULTS,
  });
  for (const u of units) {
    const mapped = normalizeWithMap(u.raw_text);
    const first = mapped.normalized.indexOf(needle);
    if (first === -1) continue;
    results.push({
      documentId: u.library_documents.id,
      documentTitle: u.library_documents.title,
      pageNumber: u.page_number,
      ...snippetAround(u.raw_text, mapped, first, first + needle.length),
      matchCount: mapped.normalized.split(needle).length - 1,
    });
  }
  return { mode: "text" as const, query: q, results };
}

export async function searchRoot(userId: string, q: string) {
  const roots = (await resolveRoots(q)).slice(0, MAX_ROOTS);
  if (roots.length === 0) {
    return { mode: "root" as const, query: q, roots: [] as string[], results: [] as SearchResult[], suggestions: await suggestLemmas(q) };
  }

  const results: SearchResult[] = [];
  for (const root of roots) {
    const index = await loadRootFormIndex(root.id);
    // SQL pre-filter: pages containing any *stem* as a substring (trigram-
    // indexed regex). Stems suffice — every whole form contains its stem —
    // and keep the alternation small even for prolific roots like ق و ل.
    // Stems are Arabic letters only, so no regex escaping is needed.
    const needles = [...(index.stems.size > 0 ? index.stems : index.wholeForms)].filter((s) => s.length >= 2);
    if (needles.length === 0) continue;
    // Access is applied inside the SQL, so the candidate cap only ever
    // counts pages this user may see.
    const candidateIds = await db.$queryRaw<{ id: bigint }[]>`
      SELECT u.id FROM library_text_units u JOIN library_documents d ON d.id = u.document_id
      WHERE ${accessibleDocumentsSql(userId)} AND u.raw_text_normalized ~ ${needles.join("|")}
      ORDER BY u.document_id, u.sequence_in_doc
      LIMIT ${MAX_ROOT_CANDIDATE_UNITS}`;
    const candidates = await db.library_text_units.findMany({
      where: { id: { in: candidateIds.map((r) => r.id) } },
      include: { library_documents: { select: { id: true, title: true } } },
      orderBy: [{ document_id: "asc" }, { sequence_in_doc: "asc" }],
    });

    for (const u of candidates) {
      const { matches, mapped } = findRootMatches(u.raw_text, index);
      if (matches.length === 0) continue;
      results.push({
        documentId: u.library_documents.id,
        documentTitle: u.library_documents.title,
        pageNumber: u.page_number,
        ...snippetAround(u.raw_text, mapped, matches[0].start, matches[0].end),
        matchCount: matches.length,
        matchedWords: [...new Set(matches.map((m) => m.word))],
        root: root.letters,
      });
      if (results.length >= MAX_RESULTS) break;
    }
    if (results.length >= MAX_RESULTS) break;
  }

  return { mode: "root" as const, query: q, roots: roots.map((r) => r.letters), results };
}
