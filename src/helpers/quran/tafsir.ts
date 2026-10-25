import { normalizeArabicForSearch } from "../arabic/normalize";

/**
 * Tafsīr text from QuranEnc.com, tidied without touching the wording:
 * the English entries begin with their āyah number ("12. "), which the reader
 * already shows, and stray whitespace is collapsed. Used by the import script.
 */
export function cleanTafsirText(raw: string | null | undefined): string {
  return (raw ?? "")
    .replace(/^\s*\d{1,3}\.\s*/, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** al-Muyassar quotes āyāt in {curly braces}; show them in Qur'anic brackets ﴿ ﴾ instead. */
export function withQuranBrackets(text: string): string {
  return text.replace(/\{([^{}]*)\}/g, "﴿$1﴾");
}

/**
 * An āyah's letters only — ٱ and the other alif forms folded, every mark and
 * space dropped — with two spelling differences between Uthmani texts folded:
 * alif maqṣūrah into yāʾ (الذى / الذي) and hamza + alif into alif
 * (ٱلْءَاخِرَةِ / ٱلۡأٓخِرَةِ).
 */
export function quranLetters(text: string): string {
  return normalizeArabicForSearch(text.normalize("NFC"))
    .replace(/[^ء-ي]/g, "")
    .replace(/ى/g, "ي")
    .replace(/ءا/g, "ا");
}

function editDistance(a: string, b: string): number {
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = cur;
  }
  return prev[b.length];
}

/**
 * Is another source's text of an āyah the same āyah as ours (`oursLetters` from
 * quranLetters)? Identical letters, or at most two letters apart — a hamza
 * written on a different seat (لُؤْلُؤ / لُؤۡلُوٕ). Any other āyah differs by far
 * more, so a numbering slip can't pass. Used before importing tafsīr.
 */
export function isSameAyahText(theirs: string, oursLetters: string): boolean {
  const t = quranLetters(theirs);
  return t === oursLetters || editDistance(t, oursLetters) <= 2;
}
