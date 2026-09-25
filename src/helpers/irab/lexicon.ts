/**
 * Small closed lexical lists the grammar needs and CAMeL doesn't provide:
 * which nouns are adverbs of place/time (ظروف), and which common verbs are
 * intransitive or take two objects. Keys are bare lemmas (no diacritics,
 * hamza seats folded to ا) — compare with `lexKey(lemma)`.
 *
 * The lists only ever *enable* an analysis the form alone can't decide; a
 * verb missing from them is treated exactly as before (never guessed).
 */

export function lexKey(lemma: string | null): string {
  return (lemma ?? "")
    .replace(/[^ء-\u0652ٱ]/g, "")
    .replace(/[\u064B-\u0652]/g, "")
    .replace(/[أإآٱ]/g, "ا");
}

/** ظروف مكان — plus قبل/بعد, which are adverbs in every use. Never direct objects. */
const PLACE_ADVERBS = new Set(["امام", "خلف", "وراء", "فوق", "تحت", "عند", "لدى", "بين", "حول", "قرب", "وسط", "مع", "يمين", "يسار", "شمال", "جانب", "ازاء", "تجاه", "دون", "قبل", "بعد"]);

/** ظروف زمان — these *can* also be objects (قَضَيْتُ يَوْمًا جَمِيلًا), so they need context. */
const TIME_ADVERBS = new Set(["يوم", "ليلة", "صباح", "مساء", "ساعة", "شهر", "سنة", "عام", "اسبوع", "وقت", "حين", "ظهر", "عصر", "فجر", "ضحى", "غداة", "لحظة", "دقيقة"]);

/** ظروف غير متصرفة: only ever adverbs (or genitive after مِنْ) — never a subject, object or predicate noun. */
const FIXED_ADVERBS = new Set(["عند", "لدى", "مع", "قبل", "بعد", "فوق", "تحت", "امام", "خلف", "وراء", "بين", "حول", "دون", "تجاه", "ازاء"]);

export function isFixedAdverb(lemma: string | null): boolean {
  return FIXED_ADVERBS.has(lexKey(lemma));
}

export type AdverbKind = "place" | "time";

export function adverbKind(lemma: string | null): AdverbKind | null {
  const k = lexKey(lemma);
  return PLACE_ADVERBS.has(k) ? "place" : TIME_ADVERBS.has(k) ? "time" : null;
}

/** Common intransitive Form I verbs (لازم): an accusative after them can't be a direct object. */
const INTRANSITIVE = new Set([
  "جلس", "نام", "ذهب", "رجع", "خرج", "قام", "مشى", "سافر", "وقف", "ضحك", "بكى", "فرح", "حزن", "نجح", "رسب",
  "غضب", "صبر", "ظفر", "فاز", "سكت", "مات", "عاش", "طار", "سقط", "نزل", "جرى", "ركض", "سار", "هرب",
  "بقي", "غاب", "كبر", "صغر", "مرض", "تعب", "اجتهد", "انطلق", "انكسر", "تقدم", "تأخر", "استيقظ",
]);

export function isIntransitive(lemma: string | null): boolean {
  return INTRANSITIVE.has(lexKey(lemma));
}

/** Verbs taking two objects: ظنّ and its sisters, and أعطى and its sisters. */
const DOUBLE_OBJECT = new Set(["ظن", "حسب", "خال", "زعم", "جعل", "صير", "اتخذ", "اعطى", "منح", "كسا", "البس", "سال", "منع", "وهب", "علم"]);

export function takesTwoObjects(lemma: string | null): boolean {
  return DOUBLE_OBJECT.has(lexKey(lemma));
}
