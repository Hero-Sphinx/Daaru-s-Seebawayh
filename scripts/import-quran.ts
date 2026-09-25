import "dotenv/config";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import pg from "pg";
import { toArabic, toSimpleArabic } from "../src/helpers/quran/buckwalter";
import { CHAPTERS } from "../src/helpers/quran/chapters";
import { parseCorpus, type CorpusWord } from "../src/helpers/quran/corpusParser";
import { buildLemmaIndex, matchLemma } from "../src/helpers/quran/lemmaMatch";
import { QADT_POS_TAGS, VERB_FORMS } from "../src/helpers/quran/tagset";

/**
 * One-time (re-runnable) import of the Quranic Arabic Corpus morphology
 * into quran_chapters / quran_verses / roots / lemmas / pos_tags /
 * verb_forms / tokens (ROADMAP.md Phase 2).
 *
 *   npm run quran:import            # idempotent; skips tokens if already complete
 *   npm run quran:import -- --force # reload all Qur'an tokens
 *
 * Everything runs in ONE transaction: a failure part-way leaves the DB as
 * it was, never half-imported. Reference rows (roots, lemmas, chapters,
 * verses, tags) are upserted on natural keys, so re-running never
 * duplicates them or changes their ids (vocabulary_items.lemma_id and
 * friends stay valid).
 *
 * Token model: one word-level row per corpus word (parent_segment_token_id
 * NULL, carries the stem's lemma/root/POS and the word's features), plus
 * one child row per segment (prefix/stem/suffix) pointing at it.
 */

const CORPUS_FILE = join(__dirname, "..", "data", "quranic-corpus", "quranic-corpus-morphology-0.4.txt");
const BATCH_SIZE = 5000;

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });

function chunks<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

function lemmaKey(lemma: string, root: string | null, tag: string) {
  return `${lemma}\u0000${root ?? ""}\u0000${tag}`;
}

async function main() {
  const force = process.argv.includes("--force");
  const started = Date.now();

  console.log("Parsing corpus…");
  const { words, skippedLines } = parseCorpus(readFileSync(CORPUS_FILE, "utf8"));
  if (skippedLines.length > 0) {
    throw new Error(`${skippedLines.length} corpus lines failed to parse, e.g. ${JSON.stringify(skippedLines.slice(0, 3))}`);
  }
  const knownTags = new Set(QADT_POS_TAGS.map((t) => t.code));
  const unknownTags = new Set(words.flatMap((w) => w.segments.map((s) => s.tag)).filter((t) => !knownTags.has(t)));
  if (unknownTags.size > 0) throw new Error(`Corpus uses POS tags missing from QADT_POS_TAGS: ${[...unknownTags].join(", ")}`);

  const segmentCount = words.reduce((n, w) => n + w.segments.length, 0);
  console.log(`  ${words.length} words, ${segmentCount} segments`);

  await client.connect();
  await client.query("BEGIN");
  try {
    // --- pos_tags / verb_forms --------------------------------------------
    await client.query(
      `INSERT INTO pos_tags (tagset, code, name_en, name_ar, category)
       SELECT 'qadt', * FROM UNNEST($1::text[], $2::text[], $3::text[], $4::text[])
       ON CONFLICT (tagset, code) DO UPDATE SET name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, category = EXCLUDED.category`,
      [QADT_POS_TAGS.map((t) => t.code), QADT_POS_TAGS.map((t) => t.nameEn), QADT_POS_TAGS.map((t) => t.nameAr), QADT_POS_TAGS.map((t) => t.category)]
    );
    const posIds = new Map<string, number>(
      (await client.query("SELECT code, id FROM pos_tags WHERE tagset = 'qadt'")).rows.map((r) => [r.code, r.id])
    );

    await client.query(
      `INSERT INTO verb_forms (form_number, wazn_pattern, name_en)
       SELECT * FROM UNNEST($1::smallint[], $2::text[], $3::text[])
       ON CONFLICT (form_number) DO UPDATE SET wazn_pattern = EXCLUDED.wazn_pattern, name_en = EXCLUDED.name_en`,
      [VERB_FORMS.map((f) => f.formNumber), VERB_FORMS.map((f) => f.waznPattern), VERB_FORMS.map((f) => `Form ${f.roman}`)]
    );
    const verbFormIds = new Map<number, number>(
      (await client.query("SELECT form_number, id FROM verb_forms")).rows.map((r) => [r.form_number, r.id])
    );

    // --- roots ------------------------------------------------------------
    const roots = [...new Set(words.map((w) => w.root).filter((r): r is string => r !== null))];
    await client.query(
      `INSERT INTO roots (root_letters, letter_count)
       SELECT * FROM UNNEST($1::text[], $2::smallint[])
       ON CONFLICT (root_letters) DO NOTHING`,
      [roots, roots.map((r) => r.split(" ").length)]
    );
    const rootIds = new Map<string, string>(
      (await client.query("SELECT root_letters, id FROM roots WHERE root_letters = ANY($1)", [roots])).rows.map((r) => [r.root_letters, r.id])
    );
    console.log(`  roots: ${rootIds.size}`);

    // --- lemmas (with corpus frequency rank) --------------------------------
    const lemmaStats = new Map<string, { lemma: string; root: string | null; tag: string; count: number; verbForm: number | null }>();
    for (const w of words) {
      if (!w.lemma || !w.stem) continue;
      const key = lemmaKey(w.lemma, w.root, w.stem.tag);
      const entry = lemmaStats.get(key);
      if (entry) entry.count++;
      else lemmaStats.set(key, { lemma: w.lemma, root: w.root, tag: w.stem.tag, count: 1, verbForm: w.features.verbForm });
    }
    const lemmaList = [...lemmaStats.values()].sort((a, b) => b.count - a.count);
    // Dense rank: equally frequent lemmas share a rank.
    let rank = 0;
    let prevCount = -1;
    const ranks = lemmaList.map((l) => {
      if (l.count !== prevCount) {
        rank++;
        prevCount = l.count;
      }
      return rank;
    });
    await client.query(
      `INSERT INTO lemmas (lemma_ar, root_id, pos_tag_id, verb_form_id, frequency_rank)
       SELECT * FROM UNNEST($1::text[], $2::bigint[], $3::int[], $4::int[], $5::int[])
       ON CONFLICT (lemma_ar, root_id, pos_tag_id)
       DO UPDATE SET verb_form_id = EXCLUDED.verb_form_id, frequency_rank = EXCLUDED.frequency_rank`,
      [
        lemmaList.map((l) => l.lemma),
        lemmaList.map((l) => (l.root ? rootIds.get(l.root) : null)),
        lemmaList.map((l) => posIds.get(l.tag)),
        lemmaList.map((l) => (l.tag === "V" && l.verbForm ? verbFormIds.get(l.verbForm) : null)),
        ranks,
      ]
    );
    const lemmaIds = new Map<string, string>();
    const posCodeById = new Map([...posIds].map(([code, id]) => [id, code]));
    const rootById = new Map([...rootIds].map(([letters, id]) => [String(id), letters]));
    for (const r of (await client.query("SELECT id, lemma_ar, root_id, pos_tag_id FROM lemmas WHERE pos_tag_id = ANY($1)", [[...posIds.values()]])).rows) {
      lemmaIds.set(lemmaKey(r.lemma_ar, r.root_id ? rootById.get(String(r.root_id)) ?? null : null, posCodeById.get(r.pos_tag_id)!), r.id);
    }
    console.log(`  lemmas: ${lemmaList.length}`);

    // --- chapters / verses ----------------------------------------------------
    const versesByKey = new Map<string, CorpusWord[]>();
    for (const w of words) {
      const key = `${w.chapter}:${w.verse}`;
      const list = versesByKey.get(key);
      if (list) list.push(w);
      else versesByKey.set(key, [w]);
    }
    const verseCounts = new Map<number, number>();
    for (const w of words) verseCounts.set(w.chapter, Math.max(verseCounts.get(w.chapter) ?? 0, w.verse));
    if (verseCounts.size !== CHAPTERS.length) throw new Error(`Corpus has ${verseCounts.size} chapters, metadata has ${CHAPTERS.length}`);

    await client.query(
      `INSERT INTO quran_chapters (id, name_ar, name_en, name_transliteration, revelation_place, verse_count)
       SELECT * FROM UNNEST($1::smallint[], $2::text[], $3::text[], $4::text[], $5::text[], $6::smallint[])
       ON CONFLICT (id) DO UPDATE SET name_ar = EXCLUDED.name_ar, name_en = EXCLUDED.name_en,
         name_transliteration = EXCLUDED.name_transliteration, revelation_place = EXCLUDED.revelation_place,
         verse_count = EXCLUDED.verse_count`,
      [
        CHAPTERS.map((c) => c.id),
        CHAPTERS.map((c) => c.nameAr),
        CHAPTERS.map((c) => c.nameEn),
        CHAPTERS.map((c) => c.nameTransliteration),
        CHAPTERS.map((c) => c.revelationPlace),
        CHAPTERS.map((c) => verseCounts.get(c.id)!),
      ]
    );

    const verseRows = [...versesByKey.values()].map((ws) => {
      const text = ws.map((w) => w.surface).join(" ");
      return { chapter: ws[0].chapter, verse: ws[0].verse, text, simple: toSimpleArabic(text) };
    });
    await client.query(
      `INSERT INTO quran_verses (chapter_id, verse_number, text_uthmani, text_simple)
       SELECT * FROM UNNEST($1::smallint[], $2::smallint[], $3::text[], $4::text[])
       ON CONFLICT (chapter_id, verse_number) DO UPDATE SET text_uthmani = EXCLUDED.text_uthmani, text_simple = EXCLUDED.text_simple`,
      [verseRows.map((v) => v.chapter), verseRows.map((v) => v.verse), verseRows.map((v) => v.text), verseRows.map((v) => v.simple)]
    );
    const verseIds = new Map<string, string>(
      (await client.query("SELECT id, chapter_id, verse_number FROM quran_verses")).rows.map((r) => [`${r.chapter_id}:${r.verse_number}`, r.id])
    );
    console.log(`  chapters: ${CHAPTERS.length}, verses: ${verseRows.length}`);

    // --- tokens -----------------------------------------------------------------
    const existing = Number((await client.query("SELECT count(*) FROM tokens WHERE quran_verse_id IS NOT NULL")).rows[0].count);
    const expected = words.length + segmentCount;
    if (existing === expected && !force) {
      console.log(`  tokens: already complete (${existing}) — skipping (use --force to reload)`);
    } else {
      if (existing > 0) {
        const referenced = Number(
          (await client.query(
            "SELECT count(*) FROM quiz_questions q JOIN tokens t ON t.id = q.source_token_id WHERE t.quran_verse_id IS NOT NULL"
          )).rows[0].count
        );
        if (referenced > 0) {
          throw new Error(`${referenced} quiz_questions reference Qur'an tokens; delete them before reloading tokens.`);
        }
        await client.query("DELETE FROM tokens WHERE quran_verse_id IS NOT NULL");
        console.log(`  tokens: removed ${existing} stale rows`);
      }

      let insertedWords = 0;
      let insertedSegments = 0;
      for (const batch of chunks(words, BATCH_SIZE)) {
        const res = await client.query(
          `INSERT INTO tokens (quran_verse_id, position_in_unit, surface_form, surface_form_bare, lemma_id, root_id, pos_tag_id,
             gender, grammatical_number, person, definiteness, verb_aspect, verb_mood, verb_voice, grammatical_case,
             analysis_source, raw_features)
           SELECT v, p, s, sb, l, r, pt, g, gn, pe, d, va, vm, vv, gc, 'qadt', rf
           FROM UNNEST($1::bigint[], $2::int[], $3::text[], $4::text[], $5::bigint[], $6::bigint[], $7::int[],
             $8::text[], $9::text[], $10::smallint[], $11::text[], $12::text[], $13::text[], $14::text[], $15::text[], $16::jsonb[])
             AS u(v, p, s, sb, l, r, pt, g, gn, pe, d, va, vm, vv, gc, rf)
           RETURNING id, quran_verse_id, position_in_unit`,
          [
            batch.map((w) => verseIds.get(`${w.chapter}:${w.verse}`)),
            batch.map((w) => w.word),
            batch.map((w) => w.surface),
            batch.map((w) => toSimpleArabic(w.surface)),
            batch.map((w) => (w.lemma && w.stem ? lemmaIds.get(lemmaKey(w.lemma, w.root, w.stem.tag)) ?? null : null)),
            batch.map((w) => (w.root ? rootIds.get(w.root) : null)),
            batch.map((w) => (w.stem ? posIds.get(w.stem.tag) : null)),
            batch.map((w) => w.features.gender),
            batch.map((w) => w.features.grammaticalNumber),
            batch.map((w) => w.features.person),
            batch.map((w) => w.features.definiteness),
            batch.map((w) => w.features.verbAspect),
            batch.map((w) => w.features.verbMood),
            batch.map((w) => w.features.verbVoice),
            batch.map((w) => w.features.grammaticalCase),
            batch.map((w) =>
              JSON.stringify({
                location: `${w.chapter}:${w.verse}:${w.word}`,
                corpusLemma: w.stem?.lemmaBuckwalter ?? null,
                verbForm: w.features.verbForm,
                derivation: w.features.derivation,
              })
            ),
          ]
        );
        // Map back by natural key, not by RETURNING order (which SQL doesn't guarantee).
        const wordTokenIds = new Map<string, string>(res.rows.map((r) => [`${r.quran_verse_id}:${r.position_in_unit}`, r.id]));
        insertedWords += res.rowCount ?? 0;

        const segs = batch.flatMap((w) =>
          w.segments.map((s) => ({ w, s, parent: wordTokenIds.get(`${verseIds.get(`${w.chapter}:${w.verse}`)}:${w.word}`)! }))
        );
        const segRes = await client.query(
          `INSERT INTO tokens (quran_verse_id, position_in_unit, surface_form, surface_form_bare, pos_tag_id,
             parent_segment_token_id, segment_index, segment_type, analysis_source, raw_features)
           SELECT v, p, s, sb, pt, parent, si, st, 'qadt', rf
           FROM UNNEST($1::bigint[], $2::int[], $3::text[], $4::text[], $5::int[], $6::bigint[], $7::smallint[], $8::text[], $9::jsonb[])
             AS u(v, p, s, sb, pt, parent, si, st, rf)`,
          [
            segs.map(({ w }) => verseIds.get(`${w.chapter}:${w.verse}`)),
            segs.map(({ w }) => w.word),
            segs.map(({ s }) => toArabic(s.formBuckwalter)),
            segs.map(({ s }) => toSimpleArabic(toArabic(s.formBuckwalter))),
            segs.map(({ s }) => posIds.get(s.tag)),
            segs.map(({ parent }) => parent),
            segs.map(({ s }) => s.segment),
            segs.map(({ s }) => s.type),
            segs.map(({ s }) => JSON.stringify({ tag: s.tag, form: s.formBuckwalter, features: s.rawFeatures })),
          ]
        );
        insertedSegments += segRes.rowCount ?? 0;
        process.stdout.write(`\r  tokens: ${insertedWords}/${words.length} words, ${insertedSegments}/${segmentCount} segments`);
      }
      process.stdout.write("\n");
    }

    // --- link existing vocabulary to the dictionary ------------------------------
    // Same conservative matcher POST /api/vocabulary uses for new words.
    const index = buildLemmaIndex(
      (await client.query("SELECT l.id, l.lemma_ar, l.frequency_rank, r.root_letters FROM lemmas l LEFT JOIN roots r ON r.id = l.root_id")).rows.map((r) => ({
        id: String(r.id),
        lemmaAr: r.lemma_ar,
        rootLetters: r.root_letters,
        frequencyRank: r.frequency_rank,
      }))
    );
    const unlinked = (await client.query("SELECT id, custom_word_ar, custom_root FROM vocabulary_items WHERE lemma_id IS NULL AND custom_word_ar IS NOT NULL")).rows;
    let linked = 0;
    for (const item of unlinked) {
      const match = matchLemma(index, item.custom_word_ar, item.custom_root);
      if (!match) continue;
      await client.query("UPDATE vocabulary_items SET lemma_id = $1 WHERE id = $2", [match.id, item.id]);
      linked++;
    }
    console.log(`  vocabulary: linked ${linked}/${unlinked.length} unlinked items to a Qur'an lemma`);

    await client.query("COMMIT");
    console.log(`Done in ${((Date.now() - started) / 1000).toFixed(1)}s.`);
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
