import "server-only";
import type { Difficulty } from "@/constants";
import { ASPECT_LABELS, CASE_LABELS, posLabel, QADT_POS_TAGS, verbFormLabel } from "@/helpers";
import type { DistractorContext, QuizItem } from "@/helpers";
import { db } from "@/server/databases";

/**
 * Server-side loaders turning DB rows into template-engine QuizItems.
 * Everything here is verified data: Qur'an items come from the imported
 * QADT annotation, vocabulary items from the learner's own bank.
 */

/**
 * Difficulty = how common the word's lemma is in the Qur'an
 * (lemmas.frequency_rank, dense rank from the import). Beginner questions
 * stick to the ~300 most frequent lemmas a learner meets constantly.
 */
const FREQUENCY_CAP: Record<Difficulty, number | null> = { beginner: 300, intermediate: 1500, advanced: null };

/** Words of verse context shown each side of the target word. */
const CONTEXT_RADIUS = 5;

export function windowContext(verseText: string, position: number, radius = CONTEXT_RADIUS): string {
  const words = verseText.split(" ");
  const i = position - 1;
  const start = Math.max(0, i - radius);
  const end = Math.min(words.length, i + radius + 1);
  return `${start > 0 ? "… " : ""}${words.slice(start, end).join(" ")}${end < words.length ? " …" : ""}`;
}

interface QuranWordRow {
  token_id: bigint;
  position_in_unit: number;
  surface_form: string;
  grammatical_case: string | null;
  verb_aspect: string | null;
  lemma_ar: string | null;
  root_letters: string | null;
  pos_name_en: string | null;
  pos_name_ar: string | null;
  pos_category: string | null;
  form_number: number | null;
  wazn_pattern: string | null;
  chapter_id: number;
  verse_number: number;
  text_uthmani: string;
}

export async function loadQuranWordItems(difficulty: Difficulty, sampleSize: number): Promise<QuizItem[]> {
  const cap = FREQUENCY_CAP[difficulty];
  // ORDER BY random() over ~77k word rows is fine at this scale (and far
  // simpler than TABLESAMPLE, whose sample would then be filtered down).
  const rows = await db.$queryRaw<QuranWordRow[]>`
    SELECT t.id AS token_id, t.position_in_unit, t.surface_form, t.grammatical_case, t.verb_aspect,
           l.lemma_ar, r.root_letters, p.name_en AS pos_name_en, p.name_ar AS pos_name_ar, p.category AS pos_category,
           vf.form_number, vf.wazn_pattern, v.chapter_id, v.verse_number, v.text_uthmani
    FROM tokens t
    JOIN quran_verses v ON v.id = t.quran_verse_id
    LEFT JOIN lemmas l ON l.id = t.lemma_id
    LEFT JOIN roots r ON r.id = t.root_id
    LEFT JOIN pos_tags p ON p.id = t.pos_tag_id
    LEFT JOIN verb_forms vf ON vf.id = l.verb_form_id
    WHERE t.parent_segment_token_id IS NULL
      AND t.lemma_id IS NOT NULL
      AND (${cap}::int IS NULL OR l.frequency_rank <= ${cap}::int)
    ORDER BY random()
    LIMIT ${sampleSize}`;

  return rows.map((r) => ({
    key: `q${r.token_id}`,
    surface: r.surface_form,
    context: windowContext(r.text_uthmani, r.position_in_unit),
    contextRef: `${r.chapter_id}:${r.verse_number}`,
    lemma: r.lemma_ar ?? undefined,
    root: r.root_letters ?? undefined,
    caseLabel: r.grammatical_case ? CASE_LABELS[r.grammatical_case as keyof typeof CASE_LABELS] : undefined,
    posLabel: r.pos_name_en && r.pos_name_ar ? posLabel(r.pos_name_en, r.pos_name_ar) : undefined,
    posCategory: r.pos_category ?? undefined,
    aspectLabel: r.verb_aspect ? ASPECT_LABELS[r.verb_aspect as keyof typeof ASPECT_LABELS] : undefined,
    // Only verbs carry a form; only offer Forms I-X (the templates' option set).
    verbFormLabel: r.form_number && r.wazn_pattern && r.form_number <= 10 ? verbFormLabel(r.form_number, r.wazn_pattern) : undefined,
  }));
}

export async function loadVocabularyItems(userId: string): Promise<QuizItem[]> {
  const items = await db.vocabulary_items.findMany({
    where: { user_id: userId },
    include: { lemmas: { include: { roots: true } } },
  });
  return items.map((i) => ({
    key: `v${i.id}`,
    surface: i.custom_word_ar ?? i.lemmas?.lemma_ar ?? undefined,
    meaningEn: i.custom_meaning_en ?? i.lemmas?.meaning_en ?? undefined,
    root: i.custom_root?.trim() || i.lemmas?.roots?.root_letters || undefined,
    lemma: i.lemmas?.lemma_ar ?? undefined,
    transliteration: i.custom_transliteration ?? undefined,
  }));
}

let contextPromise: Promise<DistractorContext> | null = null;

/**
 * Reference pools for distractors, loaded once per server process (the
 * dictionary only changes on re-import). Keeps each root's 3 most frequent
 * lemmas — common words make fairer distractors than hapax legomena.
 */
export function getDistractorContext(): Promise<DistractorContext> {
  contextPromise ??= (async () => {
    const [roots, lemmas] = await Promise.all([
      db.roots.findMany({ select: { root_letters: true } }),
      db.lemmas.findMany({
        where: { root_id: { not: null } },
        select: { lemma_ar: true, roots: { select: { root_letters: true } } },
        orderBy: { frequency_rank: "asc" },
      }),
    ]);
    const lemmasByRoot = new Map<string, string[]>();
    for (const l of lemmas) {
      const key = l.roots!.root_letters;
      const list = lemmasByRoot.get(key) ?? [];
      if (list.length < 3 && !list.includes(l.lemma_ar)) list.push(l.lemma_ar);
      lemmasByRoot.set(key, list);
    }
    const posLabelsByCategory = new Map<string, string[]>();
    for (const t of QADT_POS_TAGS) {
      posLabelsByCategory.set(t.category, [...(posLabelsByCategory.get(t.category) ?? []), posLabel(t.nameEn, t.nameAr)]);
    }
    return { roots: roots.map((r) => r.root_letters), lemmasByRoot, posLabelsByCategory };
  })().catch((e) => {
    contextPromise = null;
    throw e;
  });
  return contextPromise;
}
