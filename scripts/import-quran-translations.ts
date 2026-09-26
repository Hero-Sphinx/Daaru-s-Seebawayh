import "dotenv/config";
import pg from "pg";
import { CHAPTERS } from "../src/helpers/quran/chapters";

/**
 * Fills tokens.translation_en — the word-by-word English meaning of every
 * Qur'an word — from the Quran.com API (v4, word-by-word translation).
 *
 *   npm run quran:import-translations
 *
 * Re-runnable: it simply overwrites the column. Words are matched on
 * chapter:verse:position against the word-level token rows (segments keep
 * NULL). A verse is only written when Quran.com and the Quranic Corpus agree
 * on its word count, so a disagreement can never shift meanings onto the
 * wrong words — such verses are listed at the end instead.
 */

const API = "https://api.quran.com/api/v4/verses/by_chapter";
const PER_PAGE = 50;

interface ApiWord {
  position: number;
  char_type_name: string;
  translation?: { text?: string | null } | null;
}
interface ApiVerse {
  verse_number: number;
  words: ApiWord[];
}

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });

async function fetchJson(url: string, attempt = 1): Promise<{ verses: ApiVerse[]; pagination: { next_page: number | null } }> {
  const res = await fetch(url);
  if (res.ok) return res.json();
  if (attempt < 4 && (res.status === 429 || res.status >= 500)) {
    await new Promise((r) => setTimeout(r, 1000 * attempt));
    return fetchJson(url, attempt + 1);
  }
  throw new Error(`${res.status} ${res.statusText} for ${url}`);
}

async function fetchChapter(chapter: number): Promise<ApiVerse[]> {
  const verses: ApiVerse[] = [];
  let page: number | null = 1;
  while (page) {
    const data = await fetchJson(`${API}/${chapter}?words=true&per_page=${PER_PAGE}&page=${page}&word_fields=location&language=en`);
    verses.push(...data.verses);
    page = data.pagination.next_page;
  }
  return verses;
}

async function main() {
  await client.connect();
  const counts = new Map<string, number>(
    (
      await client.query(
        `SELECT v.chapter_id, v.verse_number, COUNT(*)::int AS n
         FROM tokens t JOIN quran_verses v ON v.id = t.quran_verse_id
         WHERE t.parent_segment_token_id IS NULL
         GROUP BY v.chapter_id, v.verse_number`
      )
    ).rows.map((r) => [`${r.chapter_id}:${r.verse_number}`, r.n])
  );
  if (counts.size === 0) throw new Error("No Qur'an tokens found — run `npm run quran:import` first.");

  let written = 0;
  const mismatched: string[] = [];
  for (const { id: number } of CHAPTERS) {
    const verses = await fetchChapter(number);
    const c: number[] = [], v: number[] = [], p: number[] = [], text: string[] = [];
    for (const verse of verses) {
      const words = verse.words.filter((w) => w.char_type_name === "word");
      const key = `${number}:${verse.verse_number}`;
      if (counts.get(key) !== words.length) {
        mismatched.push(`${key} (corpus ${counts.get(key) ?? 0}, Quran.com ${words.length})`);
        continue;
      }
      words.forEach((w, i) => {
        const t = w.translation?.text?.trim();
        if (!t) return;
        c.push(number);
        v.push(verse.verse_number);
        p.push(i + 1);
        text.push(t);
      });
    }
    const res = await client.query(
      `UPDATE tokens t SET translation_en = x.tr
       FROM UNNEST($1::int[], $2::int[], $3::int[], $4::text[]) AS x(c, v, p, tr)
       JOIN quran_verses qv ON qv.chapter_id = x.c AND qv.verse_number = x.v
       WHERE t.quran_verse_id = qv.id AND t.position_in_unit = x.p AND t.parent_segment_token_id IS NULL`,
      [c, v, p, text]
    );
    written += res.rowCount ?? 0;
    process.stdout.write(`\r  chapter ${number}/114 — ${written} words`);
  }

  console.log(`\nDone: ${written} words now have a meaning.`);
  if (mismatched.length) console.log(`Skipped ${mismatched.length} verse(s) whose word count differs:\n  ${mismatched.join("\n  ")}`);
  await client.end();
}

main().catch(async (err) => {
  console.error(err);
  await client.end().catch(() => {});
  process.exit(1);
});
