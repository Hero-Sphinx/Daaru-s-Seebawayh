import type { CaseSign, CaseType } from "@/types";
import { stripDiacritics } from "./particles";

/**
 * What the ending the learner actually typed says about case — the check
 * the parser applies before placing a word in any slot. Confirmed live why
 * this can't be skipped: without it, "إِنَّ الحَقَّ وَاضِحٌ" put الحَقَّ
 * (visibly ending in a fatha) in the fa'il slot and claimed "marfu', sign:
 * damma". A word only fills a slot whose case its ending allows; when the
 * ending can't be verified (no final vowel, a maqsur/manqus word with an
 * implied case, a diptote), null is returned and the slot is refused —
 * never guessed.
 */

const DAMMA = "\u064F";
const DAMMATAN = "\u064C";
const FATHA = "\u064E";
const FATHATAN = "\u064B";
const KASRA = "\u0650";
const KASRATAN = "\u064D";
const SHADDA = "\u0651";
const MARKS_RE = /[\u064B-\u0652\u0670]/;

export type EndingKind =
  | "vowel"
  | "sound_masc_plural"
  | "dual"
  | "sound_fem_plural"
  | "five_nouns"
  /** عِشْرُونَ … تِسْعُونَ: declined like a sound masculine plural (مُلْحَقٌ بِهِ). */
  | "tens"
  /** ممنوع من الصرف: a fatha for the genitive (no ال, not mudaf). */
  | "diptote"
  /** Case not visible — implied (مقدّر). */
  | "implied_maqsur"
  | "implied_manqus"
  | "implied_manqus_elided"
  | "implied_mutakallim";

export interface EndingInfo {
  kind: EndingKind;
  /** Cases this ending is compatible with. */
  cases: CaseType[];
  /** Why a diptote is one (للعلمية والتأنيث …). */
  diptote?: { ar: string; en: string };
}

/**
 * Why a noun is a diptote (ممنوع من الصرف), for the cases that can be told
 * from its form and CAMeL's tags — null when it isn't one or can't be told
 * (feminine names without ة, foreign names… are left out rather than guessed).
 */
export function diptoteReason(r: { proper: boolean; lemma: string | null; rawPos: string; pgn: { number: string | null }; nounSuffix: unknown }, core: string): { ar: string; en: string } | null {
  const bare = stripDiacritics(core).replace(/[أإآ]/g, "ا");
  const n = [...bare];
  if (r.proper && bare.endsWith("ة")) return { ar: "لِلْعَلَمِيَّةِ وَالتَّأْنِيثِ", en: "a feminine proper noun" };
  if (r.proper && n.length >= 5 && bare.endsWith("ان")) return { ar: "لِلْعَلَمِيَّةِ وَزِيَادَةِ الأَلِفِ وَالنُّونِ", en: "a proper noun ending in -ān" };
  if (r.pgn.number === "p" && !r.nounSuffix) {
    // صيغة منتهى الجموع: مَفَاعِل (مَسَاجِد، دَرَاهِم) and مَفَاعِيل (مَصَابِيح).
    if ((n.length === 5 && n[2] === "ا") || (n.length === 6 && n[2] === "ا" && n[4] === "ي")) {
      return { ar: "لِأَنَّهُ عَلَى صِيغَةِ مُنْتَهَى الجُمُوعِ", en: "a plural of the 'furthest plural' pattern" };
    }
    // Plurals ending in alif mamduda: أَصْدِقَاء، عُلَمَاء — not أَفْعَال plurals whose hamza is a root letter (أَسْمَاء، أَبْنَاء).
    if (bare.endsWith("اء") && !(n.length === 5 && n[0] === "ا" && n[3] === "ا")) return { ar: "لِأَنَّهُ مُنْتَهٍ بِأَلِفِ التَّأْنِيثِ المَمْدُودَةِ", en: "it ends in the feminine alif mamduda" };
  }
  // Adjectives on the pattern أَفْعَل (أَكْبَر، أَحْمَر).
  if (r.rawPos.startsWith("adj") && /^أَ[ء-ي]\u0652[ء-ي]\u064E[ء-ي]$/.test((r.lemma ?? "").normalize("NFC"))) {
    return { ar: "لِلْوَصْفِيَّةِ وَوَزْنِ الفِعْلِ", en: "an adjective on the verb pattern af'al" };
  }
  return null;
}

/** Final vowel mark actually typed: skips a tanween support alif and a trailing shadda. */
export function finalMark(surface: string): string | null {
  let s = surface.trim().normalize("NFC");
  // Support alif of the accusative tanween — also after a shadda (حَارًّا).
  if (s.endsWith("\u0627") && /(\u064b\u0651?|\u0651\u064b)$/.test(s.slice(0, -1))) s = s.slice(0, -1);
  let i = s.length - 1;
  if (s[i] === SHADDA) i--;
  // A mark can sit before the shadda (fatha+shadda in either order) — take the last mark in the final letter's cluster.
  while (i >= 0 && MARKS_RE.test(s[i]) && s[i] !== FATHA && s[i] !== DAMMA && s[i] !== KASRA && s[i] !== FATHATAN && s[i] !== DAMMATAN && s[i] !== KASRATAN) i--;
  const ch = s[i];
  return [FATHA, DAMMA, KASRA, FATHATAN, DAMMATAN, KASRATAN].includes(ch) ? ch : null;
}

/** Bare letters without the definite article — for comparing a surface to its lemma. */
function bareStem(text: string): string {
  const s = stripDiacritics(text).replace(/[\u0623\u0625\u0622\u0671]/g, "\u0627");
  return s.startsWith("ال") && s.length > 3 ? s.slice(2) : s;
}

/**
 * A regular (sound) plural/dual only if CAMeL says so AND the surface is
 * literally the lemma plus the suffix — so broken plurals that happen to end
 * in ـين (مَسَاكِينَ, lemma مِسْكِين) or singulars like الدِّينَ are never
 * mistaken for sound plurals.
 */
function soundSuffix(surface: string, lemma: string | null, number: string | null, suffix: string, lemmaDropTa = false): boolean {
  if (!lemma) return false;
  const stem = bareStem(surface);
  if (!stem.endsWith(suffix)) return false;
  let base = bareStem(lemma);
  if (lemmaDropTa && base.endsWith("\u0629")) base = base.slice(0, -1);
  return stem.slice(0, -suffix.length) === base && (number === null || number === "p" || number === "d");
}

export function endingInfo(surface: string, lemma: string | null, number: string | null): EndingInfo | null {
  const mark = finalMark(surface);

  if (number === "p" && soundSuffix(surface, lemma, number, "ون") && mark === FATHA) return { kind: "sound_masc_plural", cases: ["rafa"] };
  if (number === "p" && soundSuffix(surface, lemma, number, "ين") && mark === FATHA) return { kind: "sound_masc_plural", cases: ["nasb", "jarr"] };
  if (number === "d" && soundSuffix(surface, lemma, number, "ان") && mark === KASRA) return { kind: "dual", cases: ["rafa"] };
  if (number === "d" && soundSuffix(surface, lemma, number, "ين") && mark === KASRA) return { kind: "dual", cases: ["nasb", "jarr"] };
  if (number === "p" && soundSuffix(surface, lemma, number, "ات", true)) {
    if (mark === DAMMA || mark === DAMMATAN) return { kind: "sound_fem_plural", cases: ["rafa"] };
    if (mark === KASRA || mark === KASRATAN) return { kind: "sound_fem_plural", cases: ["nasb", "jarr"] };
    return null;
  }

  switch (mark) {
    case DAMMA:
    case DAMMATAN:
      return { kind: "vowel", cases: ["rafa"] };
    case KASRA:
    case KASRATAN:
      return { kind: "vowel", cases: ["jarr"] };
    case FATHA:
    case FATHATAN:
      // A fatha can also mark jarr on a diptote — offered only when the
      // grammar recognizes the diptote (diptoteReason), never from the vowel alone.
      return { kind: "vowel", cases: ["nasb"] };
    default:
      return null;
  }
}

const ALL_CASES: CaseType[] = ["rafa", "nasb", "jarr"];

function hasShaddaOnLast(text: string): boolean {
  return /\u0651[\u064B-\u0650\u0652]*$/.test(text.normalize("NFC"));
}

export interface NounFacts {
  lemma: string | null;
  number?: string | null;
  /** From CAMeL's morpheme tags (morph.ts) — authoritative when present. */
  nounSuffix?: { kind: "masc_pl" | "dual"; case: "nom" | "accgen" } | { kind: "fem_pl" } | null;
  /** An attached possessive ya' (كِتَابِي). */
  mutakallim?: boolean;
  /** Set by the grammar when the word is one of the five nouns in construct (أَبُو، أَخَا…). */
  fiveNounCase?: "rafa" | "nasb" | "jarr" | null;
}

/**
 * Which cases a noun's typed ending allows, in the order the checks must
 * run: five nouns → ياء المتكلم → sound plural/dual (CAMeL's tags, then the
 * lemma-suffix fallback) → implied case of maqsur/manqus → the visible vowel.
 * `core` is the word without its conjunction/preposition/attached pronoun.
 */
export function nounEnding(core: string, f: NounFacts): EndingInfo | null {
  if (f.fiveNounCase) return { kind: "five_nouns", cases: [f.fiveNounCase] };
  if (f.mutakallim) return { kind: "implied_mutakallim", cases: ALL_CASES };

  const mark = finalMark(core);
  const tens = tensNumber(core);
  if (tens) return tens;
  if (f.nounSuffix) {
    if (f.nounSuffix.kind === "fem_pl") {
      if (mark === DAMMA || mark === DAMMATAN) return { kind: "sound_fem_plural", cases: ["rafa"] };
      if (mark === KASRA || mark === KASRATAN) return { kind: "sound_fem_plural", cases: ["nasb", "jarr"] };
      return null;
    }
    const kind = f.nounSuffix.kind === "masc_pl" ? "sound_masc_plural" : "dual";
    return { kind, cases: f.nounSuffix.case === "nom" ? ["rafa"] : ["nasb", "jarr"] };
  }

  const legacy = endingInfo(core, f.lemma, f.number ?? null);
  if (legacy && legacy.kind !== "vowel") return legacy;

  const lemmaBare = f.lemma ? stripDiacritics(f.lemma) : "";
  const coreBare = stripDiacritics(core);
  const lemmaLast = lemmaBare.slice(-1);
  const coreLast = coreBare.slice(-1);

  // Maqsur (مُوسَى، الهُدَى، العَصَا): case never visible on the final alif.
  if ((lemmaLast === "\u0649" || lemmaLast === "\u0627") && (coreLast === "\u0649" || coreLast === "\u0627") && !(coreLast === "\u0627" && mark === FATHATAN && lemmaLast !== "\u0627")) {
    return { kind: "implied_maqsur", cases: ALL_CASES };
  }
  // Manqus (القَاضِي، قَاضٍ): damma/kasra implied on the ya'; the fatha shows.
  if (lemmaLast === "\u064A" && f.lemma && !hasShaddaOnLast(f.lemma)) {
    if (coreLast === "\u064A") {
      if (mark === FATHA || mark === FATHATAN) return { kind: "vowel", cases: ["nasb"] };
      if (mark === null) return { kind: "implied_manqus", cases: ["rafa", "jarr"] };
    } else if (mark === KASRATAN && coreBare.replace(/^\u0627\u0644/, "") === lemmaBare.slice(0, -1)) {
      return { kind: "implied_manqus_elided", cases: ["rafa", "jarr"] };
    }
  }
  return legacy;
}

const TENS_RE = /^(?:ال)?(?:عشر|ثلاث|اربع|خمس|ست|سبع|ثمان|تسع)(ون|ين)$/;

/** The tens (عِشْرُونَ، ثَلَاثِينَ…) — only with the fatha on the final nun, as typed. */
export function tensNumber(core: string): EndingInfo | null {
  const m = stripDiacritics(core).replace(/[أإآ]/g, "ا").match(TENS_RE);
  if (!m || finalMark(core) !== FATHA) return null;
  return { kind: "tens", cases: m[1] === "ون" ? ["rafa"] : ["nasb", "jarr"] };
}

/** The case sign for a verified ending in a given case — including substitute signs. */
export function caseSignFor(caseType: Exclude<CaseType, "mabni" | "jazm">, info: EndingInfo): CaseSign {
  const vowelName = { rafa: ["الضمة", "Damma"], nasb: ["الفتحة", "Fatha"], jarr: ["الكسرة", "Kasra"] }[caseType];
  if (info.kind === "implied_maqsur") {
    return { caseType, signAr: vowelName[0], signEn: vowelName[1], reasonAr: "المُقَدَّرَةُ عَلَى الأَلِفِ مَنَعَ مِنْ ظُهُورِهَا التَّعَذُّرُ", reasonEn: "implied on the final alif (impossible to pronounce)" };
  }
  if (info.kind === "implied_manqus" || info.kind === "implied_manqus_elided") {
    const where = info.kind === "implied_manqus" ? "اليَاءِ" : "اليَاءِ المَحْذُوفَةِ";
    return { caseType, signAr: vowelName[0], signEn: vowelName[1], reasonAr: `المُقَدَّرَةُ عَلَى ${where} مَنَعَ مِنْ ظُهُورِهَا الثِّقَلُ`, reasonEn: `implied on the ${info.kind === "implied_manqus" ? "" : "elided "}ya' (too heavy to pronounce)` };
  }
  if (info.kind === "implied_mutakallim") {
    return {
      caseType,
      signAr: vowelName[0],
      signEn: vowelName[1],
      reasonAr: "المُقَدَّرَةُ عَلَى مَا قَبْلَ يَاءِ المُتَكَلِّمِ مَنَعَ مِنْ ظُهُورِهَا اشْتِغَالُ المَحَلِّ بِالحَرَكَةِ المُنَاسِبَةِ",
      reasonEn: "implied on the letter before the ya' of the speaker (occupied by the kasra that ya' requires)",
    };
  }
  if (info.kind === "five_nouns") {
    const letter = { rafa: ["الواو", "Waw"], nasb: ["الألف", "Alif"], jarr: ["الياء", "Ya'"] }[caseType];
    return { caseType, signAr: letter[0], signEn: letter[1], reasonAr: "لِأَنَّهُ مِنَ الأَسْمَاءِ الخَمْسَةِ", reasonEn: "because it is one of the five nouns" };
  }
  if (info.kind === "sound_masc_plural") {
    return caseType === "rafa"
      ? { caseType, signAr: "الواو", signEn: "Waw", reasonAr: "لِأَنَّهُ جَمْعُ مُذَكَّرٍ سَالِمٌ", reasonEn: "because it is a sound masculine plural" }
      : { caseType, signAr: "الياء", signEn: "Ya'", reasonAr: "لِأَنَّهُ جَمْعُ مُذَكَّرٍ سَالِمٌ", reasonEn: "because it is a sound masculine plural" };
  }
  if (info.kind === "diptote" && caseType === "jarr") {
    return {
      caseType,
      signAr: "الفتحة",
      signEn: "Fatha",
      reasonAr: `نِيَابَةً عَنِ الكَسْرَةِ لِأَنَّهُ مَمْنُوعٌ مِنَ الصَّرْفِ ${info.diptote?.ar ?? ""}`.trim(),
      reasonEn: `in place of the kasra, because it is a diptote (${info.diptote?.en ?? "mamnu' min al-sarf"})`,
    };
  }
  if (info.kind === "tens") {
    const reasonAr = "لِأَنَّهُ مُلْحَقٌ بِجَمْعِ المُذَكَّرِ السَّالِمِ";
    const reasonEn = "because it is declined like a sound masculine plural";
    return caseType === "rafa" ? { caseType, signAr: "الواو", signEn: "Waw", reasonAr, reasonEn } : { caseType, signAr: "الياء", signEn: "Ya'", reasonAr, reasonEn };
  }
  if (info.kind === "dual") {
    return caseType === "rafa"
      ? { caseType, signAr: "الألف", signEn: "Alif", reasonAr: "لِأَنَّهُ مُثَنًّى", reasonEn: "because it is dual" }
      : { caseType, signAr: "الياء", signEn: "Ya'", reasonAr: "لِأَنَّهُ مُثَنًّى", reasonEn: "because it is dual" };
  }
  if (info.kind === "sound_fem_plural" && caseType === "nasb") {
    return {
      caseType,
      signAr: "الكسرة",
      signEn: "Kasra",
      reasonAr: "نِيَابَةً عَنِ الفَتْحَةِ لِأَنَّهُ جَمْعُ مُؤَنَّثٍ سَالِمٌ",
      reasonEn: "in place of the fatha, because it is a sound feminine plural",
    };
  }
  const vowel = { rafa: ["الضمة", "Damma"], nasb: ["الفتحة", "Fatha"], jarr: ["الكسرة", "Kasra"] }[caseType];
  return { caseType, signAr: vowel[0], signEn: vowel[1] };
}

export type Definiteness = "al" | "tanween" | null;

/** ال-definite, tanween-indefinite, or not determinable from the form (proper nouns, idafa...). */
export function formDefiniteness(surface: string): Definiteness {
  const bare = stripDiacritics(surface).replace(/[\u0623\u0625\u0622\u0671]/g, "\u0627");
  if (bare.startsWith("ال") && bare.length > 3) return "al";
  const mark = finalMark(surface);
  if (mark === FATHATAN || mark === DAMMATAN || mark === KASRATAN) return "tanween";
  return null;
}
