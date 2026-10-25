import "dotenv/config";
import pg from "pg";
import { CHAPTERS } from "../src/helpers/quran/chapters";
import { cleanTafsirText, isSameAyahText, quranLetters } from "../src/helpers/quran/tafsir";

/**
 * Fills quran_verses.tafsir_muyassar_ar and .tafsir_mukhtasar_en — a brief
 * tafsīr of every āyah — from QuranEnc.com (free, shareable editions):
 *   arabic_moyassar   at-Tafsīr al-Muyassar (King Fahd Complex)
 *   english_mokhtasar al-Mukhtaṣar fī Tafsīr al-Qurʾān (Tafsir Center for Quranic Studies)
 *
 *   npm run quran:import-tafsir           # import (re-runnable: overwrites)
 *   npm run quran:import-tafsir -- check  # fetch and compare only, write nothing
 *
 * An āyah is only written when QuranEnc's Arabic text of it matches ours
 * (letters only, marks ignored) and both texts are non-empty, so a numbering
 * difference can never put one āyah's tafsīr under another. Anything skipped
 * is listed at the end. Each chapter is written in one transaction.
 */

const API = "https://quranenc.com/api/v1/translation/sura";
const SOURCES = { ar: "arabic_moyassar", en: "english_mokhtasar" } as const;

interface ApiAyah {
  aya: string;
  arabic_text: string;
  translation: string;
}

const checkOnly = process.argv[2] === "check";
const client = new pg.Client({ connectionString: process.env.DATABASE_URL });

async function fetchChapter(key: string, chapter: number, attempt = 1): Promise<ApiAyah[]> {
  const res = await fetch(`${API}/${key}/${chapter}`);
  if (res.ok) return ((await res.json()) as { result: ApiAyah[] }).result;
  if (attempt < 5 && (res.status === 429 || res.status >= 500)) {
    await new Promise((r) => setTimeout(r, 1500 * attempt));
    return fetchChapter(key, chapter, attempt + 1);
  }
  throw new Error(`${res.status} ${res.statusText} for ${key}/${chapter}`);
}

async function main() {
  await client.connect();
  const ours = new Map<string, string>(
    (await client.query("SELECT chapter_id, verse_number, text_uthmani FROM quran_verses")).rows.map((r) => [
      `${r.chapter_id}:${r.verse_number}`,
      quranLetters(r.text_uthmani),
    ])
  );
  if (ours.size === 0) throw new Error("No Qur'an verses found — run `npm run quran:import` first.");

  let written = 0;
  const skipped: string[] = [];
  for (const { id: chapter } of CHAPTERS) {
    const [ar, en] = await Promise.all([fetchChapter(SOURCES.ar, chapter), fetchChapter(SOURCES.en, chapter)]);
    const enByAyah = new Map(en.map((a) => [Number(a.aya), a]));
    const v: number[] = [], muyassar: string[] = [], mukhtasar: string[] = [];

    for (const a of ar) {
      const n = Number(a.aya);
      const key = `${chapter}:${n}`;
      const e = enByAyah.get(n);
      const arText = cleanTafsirText(a.translation);
      const enText = e ? cleanTafsirText(e.translation) : "";
      if (!ours.has(key)) skipped.push(`${key}: not in our Qur'an table`);
      else if (!isSameAyahText(a.arabic_text, ours.get(key)!) || (e && !isSameAyahText(e.arabic_text, ours.get(key)!))) skipped.push(`${key}: āyah text differs`);
      else if (!arText || !enText) skipped.push(`${key}: empty tafsīr (${!arText ? "Arabic" : "English"})`);
      else {
        v.push(n);
        muyassar.push(arText);
        mukhtasar.push(enText);
      }
    }
    const expected = [...ours.keys()].filter((k) => k.startsWith(`${chapter}:`)).length;
    if (ar.length !== expected) skipped.push(`chapter ${chapter}: QuranEnc has ${ar.length} āyāt, we have ${expected}`);

    if (!checkOnly && v.length) {
      await client.query("BEGIN");
      const res = await client.query(
        `UPDATE quran_verses q SET tafsir_muyassar_ar = x.ar, tafsir_mukhtasar_en = x.en
         FROM UNNEST($2::int[], $3::text[], $4::text[]) AS x(v, ar, en)
         WHERE q.chapter_id = $1 AND q.verse_number = x.v`,
        [chapter, v, muyassar, mukhtasar]
      );
      await client.query("COMMIT");
      written += res.rowCount ?? 0;
    } else written += v.length;
    process.stdout.write(`\r  chapter ${chapter}/114 — ${written} āyāt ${checkOnly ? "ready" : "written"}`);
  }

  console.log(`\nDone: ${written} āyāt ${checkOnly ? "would be written (check only — nothing changed)" : "now have a tafsīr"}.`);
  if (skipped.length) console.log(`Skipped ${skipped.length}:\n  ${skipped.join("\n  ")}`);
  await client.end();
}

main().catch(async (err) => {
  console.error(err);
  await client.query("ROLLBACK").catch(() => {});
  await client.end().catch(() => {});
  process.exit(1);
});
