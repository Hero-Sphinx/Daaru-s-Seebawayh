/**
 * Closed-class Arabic function words the parser recognizes itself, before
 * consulting CAMeL Tools. Closed classes are listed, not analysed: CAMeL
 * happily offers readings like the imperative verb إِنَّ ("moan!") for the
 * particle إِنَّ, and a sentence-initial verb slot would then take it —
 * confirmed live ("إِنَّ الحَقَّ وَاضِحٌ" parsed as verb + fa'il). A word in
 * one of these lists is never treated as anything else.
 *
 * Only free-standing words — ب/ل/ك/و/فـ attach to the next word with no
 * space and would need segmentation this parser doesn't do.
 */

export function stripDiacritics(text: string): string {
  // Arabic combining diacritics (harakat, tanween, shadda, sukun, dagger alif) + tatweel.
  return text.replace(/[\u064B-\u0652\u0670\u0640]/g, "");
}

/** Hamza-carrying alifs folded, for matching closed-class spellings typed with or without hamza. */
function key(text: string): string {
  return stripDiacritics(text).replace(/[\u0623\u0625\u0622\u0671]/g, "\u0627");
}

const SHADDA = "\u0651";

export const HURUF_JARR = ["في", "على", "إلى", "الى", "من", "عن", "حتى", "منذ", "مذ", "خلا", "عدا", "حاشا"];

export function isHarfJarr(token: string): boolean {
  // مَنْ (fatha: "who / whoever") is a noun, not the preposition مِنْ (kasra).
  if (stripDiacritics(token) === "من" && token.normalize("NFC")[1] === "\u064E") return false;
  return HURUF_JARR.includes(stripDiacritics(token));
}

/**
 * Hamzat al-wasl opens the next word (الـ، اِسْتَخْرَجَ، اُكْتُبْ…): a plain or
 * wasla alif. A word typed with أ/إ/آ starts with hamzat al-qat' instead.
 */
export function startsWithHamzatWasl(word: string | undefined): boolean {
  if (!word) return false;
  const first = word.normalize("NFC")[0];
  return first === "ا" || first === "ٱ";
}

/**
 * What each free preposition is built on — a fixed fact about the word,
 * not read off the typed vowel: مِنَ in مِنَ المَدْرَسَةِ is still built on the
 * sukun, only moved to a fatha to avoid two sukuns meeting.
 */
const PREPOSITION_BUILT_ON: Record<string, "fath" | "damm" | "sukun"> = {
  في: "sukun",
  على: "sukun",
  إلى: "sukun",
  الى: "sukun",
  من: "sukun",
  عن: "sukun",
  حتى: "sukun",
  مذ: "sukun",
  خلا: "sukun",
  عدا: "sukun",
  حاشا: "sukun",
  منذ: "damm",
};

export function prepositionBuiltOn(token: string): BuiltOn | null {
  const k = PREPOSITION_BUILT_ON[stripDiacritics(token)];
  return k ? BUILT_ON[k] : null;
}

/**
 * التقاء الساكنين: a word ending in a sukun that meets hamzat al-wasl takes a
 * helping vowel — usually a kasra (لَمْ يَكْتُبِ الطَّالِبُ، قَدِ انْتَصَرَ), a fatha
 * on مِنْ before الـ (مِنَ المَدْرَسَةِ), a damma on the plural mim (أَنْتُمُ الطُّلَّابُ).
 * Returns the note to state, or null when the typed ending isn't that case.
 */
export function iltiqaNote(typed: string, nextWord: string | undefined): { ar: string; en: string } | null {
  if (!startsWithHamzatWasl(nextWord)) return null;
  const last = typed.normalize("NFC").slice(-1);
  const vowel = last === "\u0650" ? ["بِالكَسْرِ", "a kasra"] : last === "\u064E" ? ["بِالفَتْحِ", "a fatha"] : last === "\u064F" ? ["بِالضَّمِّ", "a damma"] : null;
  if (!vowel) return null;
  return { ar: `وَحُرِّكَ ${vowel[0]} مَنْعًا لِالْتِقَاءِ السَّاكِنَيْنِ`, en: `moved to ${vowel[1]} to avoid two sukuns meeting (iltiqa' al-sakinayn)` };
}

/** Traditional description of a mabni word's fixed ending ("built on the fatha"). */
export interface BuiltOn {
  ar: string;
  en: string;
}

export const BUILT_ON: Record<"fath" | "damm" | "kasr" | "sukun", BuiltOn> = {
  fath: { ar: "الفَتْحِ", en: "the fatha" },
  damm: { ar: "الضَّمِّ", en: "the damma" },
  kasr: { ar: "الكَسْرِ", en: "the kasra" },
  sukun: { ar: "السُّكُونِ", en: "the sukun" },
};

export interface ClosedClassWord {
  /** e.g. "حَرْفُ تَوْكِيدٍ وَنَصْبٍ" / "Particle of emphasis (takes nasb)" */
  kindAr: string;
  kindEn: string;
  /** Fixed ending, when the grammar books agree on it; null when they don't (never guessed). */
  builtOn: BuiltOn | null;
}

// --- إنّ and its sisters (الحروف الناسخة): all mabni on the fatha.
// The shadda is required for إنّ/أنّ/كأنّ/لكنّ — without it, إنْ is the
// conditional/negative particle and أنْ the subjunctive one, which are
// entirely different words.
const INNA_SISTERS: { key: string; needsShadda: boolean; kindAr: string; kindEn: string }[] = [
  { key: "ان", needsShadda: true, kindAr: "حَرْفُ تَوْكِيدٍ وَنَصْبٍ", kindEn: "Particle of emphasis (inna)" },
  { key: "كان", needsShadda: true, kindAr: "حَرْفُ تَشْبِيهٍ وَنَصْبٍ", kindEn: "Particle of comparison (ka'anna)" },
  { key: "لكن", needsShadda: true, kindAr: "حَرْفُ اسْتِدْرَاكٍ وَنَصْبٍ", kindEn: "Particle of rectification (lakinna)" },
  { key: "ليت", needsShadda: false, kindAr: "حَرْفُ تَمَنٍّ وَنَصْبٍ", kindEn: "Particle of wishing (layta)" },
  { key: "لعل", needsShadda: false, kindAr: "حَرْفُ تَرَجٍّ وَنَصْبٍ", kindEn: "Particle of hope (la'alla)" },
];

export function innaSister(token: string): ClosedClassWord | null {
  const k = key(token);
  // كأنّ keys to "كان" once hamza is folded — only accept it WITH the shadda,
  // so the verb كَانَ is never mistaken for it.
  const hit = INNA_SISTERS.find((s) => s.key === k && (!s.needsShadda || token.includes(SHADDA)));
  return hit ? { kindAr: hit.kindAr, kindEn: hit.kindEn, builtOn: BUILT_ON.fath } : null;
}

// --- Detached (nominative) pronouns: mabni; each one's fixed ending is standard.
// أنتَ/أنتِ differ only by the final vowel, so they must be typed with it.
const PRONOUNS: { diacKey: string | null; key: string; builtOn: BuiltOn }[] = [
  { key: "هو", diacKey: null, builtOn: BUILT_ON.fath },
  { key: "هي", diacKey: null, builtOn: BUILT_ON.fath },
  { key: "هما", diacKey: null, builtOn: BUILT_ON.sukun },
  { key: "هم", diacKey: null, builtOn: BUILT_ON.sukun },
  { key: "هن", diacKey: null, builtOn: BUILT_ON.fath },
  { key: "انا", diacKey: null, builtOn: BUILT_ON.sukun },
  { key: "نحن", diacKey: null, builtOn: BUILT_ON.damm },
  { key: "انت", diacKey: "\u064E", builtOn: BUILT_ON.fath }, // أنتَ
  { key: "انت", diacKey: "\u0650", builtOn: BUILT_ON.kasr }, // أنتِ
  { key: "انتما", diacKey: null, builtOn: BUILT_ON.sukun },
  { key: "انتم", diacKey: null, builtOn: BUILT_ON.sukun },
  { key: "انتن", diacKey: null, builtOn: BUILT_ON.fath },
];

export function detachedPronoun(token: string): ClosedClassWord | null {
  const k = key(token);
  const lastMark = token.replace(/[^\u064B-\u0652]/g, "").slice(-1);
  const hit = PRONOUNS.find((p) => p.key === k && (p.diacKey === null || p.diacKey === lastMark));
  return hit ? { kindAr: "ضَمِيرٌ مُنْفَصِلٌ", kindEn: "Detached pronoun", builtOn: hit.builtOn } : null;
}

// --- Demonstratives. Fixed endings are given only where the books agree
// (ذلك/تلك/أولئك are analysed differently by different grammarians — the
// ل and ك are split off as particles — so no ending is claimed for them).
const DEMONSTRATIVES: { key: string; builtOn: BuiltOn | null }[] = [
  { key: "هذا", builtOn: BUILT_ON.sukun },
  { key: "هذه", builtOn: BUILT_ON.kasr },
  { key: "هولاء", builtOn: BUILT_ON.kasr },
  { key: "هؤلاء", builtOn: BUILT_ON.kasr },
  { key: "ذلك", builtOn: null },
  { key: "تلك", builtOn: null },
  { key: "اولئك", builtOn: null },
  { key: "أولئك", builtOn: null },
];

export function demonstrative(token: string): ClosedClassWord | null {
  const k = key(token);
  const hit = DEMONSTRATIVES.find((d) => key(d.key) === k);
  return hit ? { kindAr: "اسْمُ إِشَارَةٍ", kindEn: "Demonstrative", builtOn: hit.builtOn } : null;
}

// --- Negation / governing particles that open a sentence.
export type NegationKind = "lam" | "lan" | "la" | "ma";

const NEGATIONS: Record<string, NegationKind> = { لم: "lam", لن: "lan", لا: "la", ما: "ma" };

export function negationParticle(token: string): NegationKind | null {
  return NEGATIONS[key(token)] ?? null;
}

/** Fixed descriptions; "la" and "ma" depend on what follows, so they're chosen by the grammar. */
export const NEGATION_DESCRIPTIONS = {
  lam: { ar: "حَرْفُ نَفْيٍ وَجَزْمٍ وَقَلْبٍ", en: "Particle of negation (jussive, past meaning)" },
  lan: { ar: "حَرْفُ نَفْيٍ وَنَصْبٍ وَاسْتِقْبَالٍ", en: "Particle of future negation (subjunctive)" },
  la_nafiya: { ar: "حَرْفُ نَفْيٍ", en: "Particle of negation (no effect)" },
  la_nahiya: { ar: "حَرْفُ نَهْيٍ وَجَزْمٍ", en: "Particle of prohibition (jussive)" },
  la_jins: { ar: "حَرْفُ نَفْيٍ لِلْجِنْسِ يَعْمَلُ عَمَلَ إِنَّ", en: "Particle negating the whole genus (works like inna)" },
  ma_nafiya: { ar: "حَرْفُ نَفْيٍ", en: "Particle of negation" },
  ma_hijaziyya: { ar: "حَرْفُ نَفْيٍ يَعْمَلُ عَمَلَ لَيْسَ", en: "Particle of negation working like laysa (ma al-hijaziyya)" },
} as const;

// --- Kana and its sisters, identified by the verb's lemma (any conjugation: كانت، يكون، أصبحوا…).
// زال/برح/فتئ/انفك are only "sisters of kana" after a negation (ما زال…).
const KANA_SISTERS = ["كان", "أصبح", "اصبح", "أضحى", "اضحى", "أمسى", "امسى", "ظل", "بات", "صار", "ليس"];
const KANA_AFTER_NEGATION = ["زال", "برح", "فتئ", "انفك"];

export function kanaSister(lemma: string | null, afterNegation: boolean): boolean {
  if (!lemma) return false;
  const k = stripDiacritics(lemma);
  return KANA_SISTERS.includes(k) || (afterNegation && KANA_AFTER_NEGATION.includes(k));
}

// --- The five nouns (الأسماء الخمسة) in their construct forms: و for rafʿ, ا for naṣb, ي for jarr.
// ذو/ذا/ذي are left out: ذا and ذي collide with the demonstratives.
const FIVE_NOUNS: Record<string, { lemma: string; case: "rafa" | "nasb" | "jarr" }> = {
  ابو: { lemma: "أَب", case: "rafa" },
  ابا: { lemma: "أَب", case: "nasb" },
  ابي: { lemma: "أَب", case: "jarr" },
  اخو: { lemma: "أَخ", case: "rafa" },
  اخا: { lemma: "أَخ", case: "nasb" },
  اخي: { lemma: "أَخ", case: "jarr" },
  حمو: { lemma: "حَم", case: "rafa" },
  حما: { lemma: "حَم", case: "nasb" },
  حمي: { lemma: "حَم", case: "jarr" },
};

/** A five-noun construct form, given the word's core with any attached pronoun already removed. */
export function fiveNoun(core: string): { lemma: string; case: "rafa" | "nasb" | "jarr" } | null {
  return FIVE_NOUNS[key(core)] ?? null;
}

// --- Relative pronouns (الأسماء الموصولة). Only the forms that are mabni in
// every position; the duals اللذان/اللتان are declined and left out.
export interface RelativePronoun extends ClosedClassWord {
  gender: "m" | "f";
  number: "s" | "p";
}

const RELATIVES: Record<string, { gender: "m" | "f"; number: "s" | "p"; builtOn: BuiltOn }> = {
  الذي: { gender: "m", number: "s", builtOn: BUILT_ON.sukun },
  التي: { gender: "f", number: "s", builtOn: BUILT_ON.sukun },
  الذين: { gender: "m", number: "p", builtOn: BUILT_ON.fath },
  اللاتي: { gender: "f", number: "p", builtOn: BUILT_ON.sukun },
  اللائي: { gender: "f", number: "p", builtOn: BUILT_ON.sukun },
};

export function relativePronoun(token: string): RelativePronoun | null {
  // الَّذِي is often typed with a single lam (الذي) — both are the same word.
  const hit = RELATIVES[key(token)];
  return hit ? { kindAr: "اسْمٌ مَوْصُولٌ", kindEn: "Relative pronoun", builtOn: hit.builtOn, gender: hit.gender, number: hit.number } : null;
}

// --- Conditionals and أنْ. The hamza's seat decides the word: إِنْ is the
// conditional particle, أَنْ the subjunctive/masdar particle. Typed without a
// hamza (ان) it could be either, so it stays unsupported.
export type ShartKind = "in" | "man" | "idha";

export function shartWord(token: string): ShartKind | null {
  const t = token.normalize("NFC");
  if (t.includes(SHADDA)) return null; // إِنَّ
  const bare = stripDiacritics(t);
  if (bare === "إن") return "in";
  if (bare === "من" && t[1] === "\u064E") return "man";
  if (bare === "إذا" || bare === "اذا") return "idha";
  return null;
}

export function isMasdarAn(token: string): boolean {
  const t = token.normalize("NFC");
  return !t.includes(SHADDA) && stripDiacritics(t) === "أن";
}

/**
 * Other function words whose constructions this parser doesn't cover —
 * reported as unsupported instead of being misread through some CAMeL
 * reading of the same spelling.
 */
const UNSUPPORTED_PARTICLES = ["ان", "كي", "لو", "لولا", "اما", "الا", "بل", "يا"];

// --- Particles that only precede a verb, with no effect on its mood.
export type PreverbalKind = "qad" | "sawfa";

export function preverbalParticle(token: string): PreverbalKind | null {
  const k = key(token);
  return k === "قد" ? "qad" : k === "سوف" ? "sawfa" : null;
}

export const PREVERBAL_DESCRIPTIONS = {
  qad_past: { ar: "حَرْفُ تَحْقِيقٍ", en: "Particle of certainty (qad + past)", builtOn: BUILT_ON.sukun },
  qad_present: { ar: "حَرْفُ تَقْلِيلٍ", en: "Particle of rarity (qad + present)", builtOn: BUILT_ON.sukun },
  sawfa: { ar: "حَرْفُ تَسْوِيفٍ وَاسْتِقْبَالٍ", en: "Particle of the (distant) future", builtOn: BUILT_ON.fath },
} as const;

export function isUnsupportedParticle(token: string): boolean {
  return UNSUPPORTED_PARTICLES.includes(key(token)) && !innaSister(token);
}

/** Free-standing coordinating conjunctions (و/ف attached to a word come from CAMeL instead). */
const FREE_CONJUNCTIONS: Record<string, { ar: string; en: string }> = {
  ثم: { ar: "حَرْفُ عَطْفٍ", en: "Coordinating conjunction (thumma)" },
  او: { ar: "حَرْفُ عَطْفٍ", en: "Coordinating conjunction (aw)" },
};

export function freeConjunction(token: string): { ar: string; en: string } | null {
  return FREE_CONJUNCTIONS[key(token)] ?? null;
}

/** Particles that open a sentence and leave it otherwise unchanged: هَلْ (question), لَقَدْ (oath answer + qad). */
export type OpenerKind = "hal" | "laqad";

export function sentenceOpener(token: string): OpenerKind | null {
  const k = key(token);
  return k === "هل" ? "hal" : k === "لقد" ? "laqad" : null;
}

export const OPENER_DESCRIPTIONS: Record<OpenerKind, { ar: string; en: string }> = {
  hal: { ar: "حَرْفُ اسْتِفْهَامٍ", en: "Interrogative particle" },
  laqad: { ar: "اللَّامُ وَاقِعَةٌ فِي جَوَابِ قَسَمٍ مُقَدَّرٍ، وَقَدْ حَرْفُ تَحْقِيقٍ", en: "la- (answering an implied oath) + qad (particle of certainty)" },
};
