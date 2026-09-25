import db from "@/server/databases/db";
import { buildLemmaIndex, type LemmaCandidate } from "@/helpers/quran/lemmaMatch";
import type { PosDTO, QuranChapterDTO, QuranVerseDTO, QuranWordDTO, RootFamilyDTO } from "@/types/quran";

/** Verses per reader page — keeps long surahs (al-Baqarah: 286 verses, ~6k words) to a sane payload. */
export const VERSES_PER_PAGE = 30;

type PosRow = { code: string; name_en: string; name_ar: string; category: string | null } | null;

function toPos(p: PosRow): PosDTO | null {
  return p ? { code: p.code, nameEn: p.name_en, nameAr: p.name_ar, category: p.category } : null;
}

function toChapter(c: {
  id: number;
  name_ar: string;
  name_en: string;
  name_transliteration: string | null;
  revelation_place: string | null;
  verse_count: number;
}): QuranChapterDTO {
  return {
    id: c.id,
    nameAr: c.name_ar,
    nameEn: c.name_en,
    nameTransliteration: c.name_transliteration,
    revelationPlace: c.revelation_place === "meccan" || c.revelation_place === "medinan" ? c.revelation_place : null,
    verseCount: c.verse_count,
  };
}

export async function listChapters(): Promise<QuranChapterDTO[]> {
  const rows = await db.quran_chapters.findMany({ orderBy: { id: "asc" } });
  return rows.map(toChapter);
}

export async function getChapter(id: number): Promise<QuranChapterDTO | null> {
  const row = await db.quran_chapters.findUnique({ where: { id } });
  return row ? toChapter(row) : null;
}

/** Word-by-word morphology for verses [fromVerse, toVerse] of one surah. */
export async function getVerses(chapterId: number, fromVerse: number, toVerse: number): Promise<QuranVerseDTO[]> {
  const verses = await db.quran_verses.findMany({
    where: { chapter_id: chapterId, verse_number: { gte: fromVerse, lte: toVerse } },
    orderBy: { verse_number: "asc" },
    include: {
      tokens: {
        where: { parent_segment_token_id: null },
        orderBy: { position_in_unit: "asc" },
        include: {
          lemmas: { select: { id: true, lemma_ar: true } },
          roots: { select: { id: true, root_letters: true } },
          pos_tags: true,
          other_tokens: { orderBy: { segment_index: "asc" }, include: { pos_tags: true } },
        },
      },
    },
  });

  return verses.map((v) => ({
    number: v.verse_number,
    text: v.text_uthmani,
    words: v.tokens.map((t): QuranWordDTO => {
      const raw = (t.raw_features ?? {}) as { verbForm?: number | null; derivation?: string | null };
      return {
        id: t.id.toString(),
        position: t.position_in_unit,
        surface: t.surface_form,
        lemma: t.lemmas ? { id: t.lemmas.id.toString(), ar: t.lemmas.lemma_ar } : null,
        root: t.roots ? { id: t.roots.id.toString(), letters: t.roots.root_letters } : null,
        pos: toPos(t.pos_tags),
        grammaticalCase: (t.grammatical_case as QuranWordDTO["grammaticalCase"]) ?? null,
        gender: t.gender,
        grammaticalNumber: t.grammatical_number,
        person: t.person,
        definiteness: t.definiteness,
        verbAspect: t.verb_aspect,
        verbMood: t.verb_mood,
        verbVoice: t.verb_voice,
        verbForm: raw.verbForm ?? null,
        derivation: raw.derivation ?? null,
        segments: t.other_tokens.map((s) => ({
          surface: s.surface_form,
          type: (s.segment_type ?? "stem") as "prefix" | "stem" | "suffix",
          pos: toPos(s.pos_tags),
          features: ((s.raw_features ?? {}) as { features?: string }).features ?? "",
        })),
      };
    }),
  }));
}

/** Every lemma sharing a root, most frequent first, with Qur'an occurrence counts. */
export async function getRootFamily(rootId: bigint): Promise<RootFamilyDTO | null> {
  const root = await db.roots.findUnique({ where: { id: rootId } });
  if (!root) return null;

  const [lemmas, counts] = await Promise.all([
    db.lemmas.findMany({
      where: { root_id: rootId },
      include: { pos_tags: true, verb_forms: { select: { form_number: true } } },
      orderBy: { frequency_rank: "asc" },
    }),
    db.tokens.groupBy({
      by: ["lemma_id"],
      where: { root_id: rootId, quran_verse_id: { not: null }, parent_segment_token_id: null },
      _count: { _all: true },
    }),
  ]);
  const countByLemma = new Map(counts.map((c) => [c.lemma_id?.toString(), c._count._all]));

  return {
    root: { id: root.id.toString(), letters: root.root_letters },
    occurrences: counts.reduce((n, c) => n + c._count._all, 0),
    lemmas: lemmas.map((l) => ({
      id: l.id.toString(),
      ar: l.lemma_ar,
      pos: toPos(l.pos_tags),
      verbForm: l.verb_forms?.form_number ?? null,
      occurrences: countByLemma.get(l.id.toString()) ?? 0,
    })),
  };
}

let lemmaIndexPromise: Promise<Map<string, LemmaCandidate[]>> | null = null;

/**
 * In-memory index of every Qur'an lemma (~5k rows), built once per server
 * process — the dictionary only changes when scripts/import-quran.ts runs.
 * A failed load isn't cached, so the next call retries.
 */
export function getLemmaIndex(): Promise<Map<string, LemmaCandidate[]>> {
  lemmaIndexPromise ??= db.lemmas
    .findMany({ select: { id: true, lemma_ar: true, frequency_rank: true, roots: { select: { root_letters: true } } } })
    .then((rows) =>
      buildLemmaIndex(
        rows.map((r) => ({ id: r.id.toString(), lemmaAr: r.lemma_ar, rootLetters: r.roots?.root_letters ?? null, frequencyRank: r.frequency_rank }))
      )
    )
    .catch((e) => {
      lemmaIndexPromise = null;
      throw e;
    });
  return lemmaIndexPromise;
}

export interface LemmaOccurrence {
  chapter: number;
  verse: number;
  word: number;
  surface: string;
}

/**
 * One representative Qur'an occurrence per lemma, for "hear it recited" on
 * vocabulary cards. Prefers an occurrence spelled like the headword itself
 * (bare forms equal — no clitics or case endings added), else the first in
 * mushaf order.
 */
export async function getLemmaOccurrences(lemmaIds: bigint[]): Promise<Map<string, LemmaOccurrence>> {
  if (lemmaIds.length === 0) return new Map();
  const rows = await db.$queryRaw<{ lemma_id: bigint; chapter_id: number; verse_number: number; position_in_unit: number; surface_form: string }[]>`
    SELECT DISTINCT ON (t.lemma_id) t.lemma_id, v.chapter_id, v.verse_number, t.position_in_unit, t.surface_form
    FROM tokens t
    JOIN quran_verses v ON v.id = t.quran_verse_id
    JOIN lemmas l ON l.id = t.lemma_id
    WHERE t.lemma_id = ANY(${lemmaIds}::bigint[]) AND t.parent_segment_token_id IS NULL
    ORDER BY t.lemma_id,
             (t.surface_form_bare = regexp_replace(l.lemma_ar, '[' || chr(1611) || '-' || chr(1631) || chr(1648) || chr(1750) || '-' || chr(1773) || chr(1600) || ']', '', 'g')) DESC,
             v.chapter_id, v.verse_number, t.position_in_unit`;
  return new Map(
    rows.map((r) => [
      r.lemma_id.toString(),
      { chapter: r.chapter_id, verse: r.verse_number, word: r.position_in_unit, surface: r.surface_form },
    ])
  );
}
