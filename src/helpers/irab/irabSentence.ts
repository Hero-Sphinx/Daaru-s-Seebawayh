/**
 * Renders the traditional Arabic I'rab formula ("فاعل مرفوع، وعلامة رفعه
 * الضمة الظاهرة على آخره") plus a transliteration and an English gloss, for
 * a token the parser already assigned a role/case/sign to.
 *
 * This is pure templating over data the deterministic parser (CAMeL Tools +
 * the rule-based pattern matcher in free-text-parser.ts) already computed —
 * it never determines a root, case, or role itself, so it doesn't touch the
 * "no LLM for grammar" policy at all: there's no LLM involved anywhere here.
 * A token with no resolved role (the parser couldn't place it) gets `null`,
 * same as it gets no case-sign badge today — nothing is invented.
 */

import type { CaseType, GrammaticalRole, IrabToken } from "@/types/irab";

interface DeclensionPhrase {
  adjectiveAr: string;
  adjectiveTranslit: string;
  adjectiveEn: string;
  signOfPhraseAr: string;
  signOfPhraseTranslit: string;
  signOfPhraseEn: string;
}

// "وعلامة {رفعه}" etc. — the pronoun always refers back to "the word"
// (grammatically masculine), regardless of the noun's real-world gender.
const DECLENSION: Partial<Record<CaseType, DeclensionPhrase>> = {
  rafa: {
    adjectiveAr: "مَرْفُوعٌ",
    adjectiveTranslit: "marfū‘un",
    adjectiveEn: "in the nominative case",
    signOfPhraseAr: "رَفْعِهِ",
    signOfPhraseTranslit: "raf‘ihi",
    signOfPhraseEn: "its nominative case",
  },
  nasb: {
    adjectiveAr: "مَنْصُوبٌ",
    adjectiveTranslit: "manṣūbun",
    adjectiveEn: "in the accusative case",
    signOfPhraseAr: "نَصْبِهِ",
    signOfPhraseTranslit: "naṣbihi",
    signOfPhraseEn: "its accusative case",
  },
  jarr: {
    adjectiveAr: "مَجْرُورٌ",
    adjectiveTranslit: "majrūrun",
    adjectiveEn: "in the genitive case",
    signOfPhraseAr: "جَرِّهِ",
    signOfPhraseTranslit: "jarrihi",
    signOfPhraseEn: "its genitive case",
  },
  jazm: {
    adjectiveAr: "مَجْزُومٌ",
    adjectiveTranslit: "majzūmun",
    adjectiveEn: "in the jussive case",
    signOfPhraseAr: "جَزْمِهِ",
    signOfPhraseTranslit: "jazmihi",
    signOfPhraseEn: "its jussive case",
  },
};

interface SignPhrase {
  ar: string;
  // Sun-letter assimilation applied to the transliterated definite article,
  // matching real transliteration convention (ad-dammatu, not al-dammatu).
  translit: string;
  en: string;
}

const SIGN_PHRASE: Record<string, SignPhrase & { letter?: boolean }> = {
  "الضمة": { ar: "الضَّمَّةُ", translit: "ad-dammatu", en: "the damma" },
  "الفتحة": { ar: "الفَتْحَةُ", translit: "al-fatḥatu", en: "the fatha" },
  "الكسرة": { ar: "الكَسْرَةُ", translit: "al-kasratu", en: "the kasra" },
  // Masculine noun — "وعلامة جزمه السكونُ", never "…الظاهرةُ".
  "السكون": { ar: "السُّكُونُ", translit: "as-sukūnu", en: "the sukun", letter: true },
  // Letter signs (sound plurals, duals) — no "ظاهرة على آخره": the sign is a letter, not a vowel mark.
  "الواو": { ar: "الوَاوُ", translit: "al-wāwu", en: "the waw", letter: true },
  "الياء": { ar: "اليَاءُ", translit: "al-yā'u", en: "the ya'", letter: true },
  "الألف": { ar: "الأَلِفُ", translit: "al-alifu", en: "the alif", letter: true },
  // Verb mood signs that aren't vowels.
  "ثبوت النون": { ar: "ثُبُوتُ النُّونِ", translit: "thubūtu an-nūni", en: "the retained nun", letter: true },
  "حذف النون": { ar: "حَذْفُ النُّونِ", translit: "ḥadhfu an-nūni", en: "the deleted nun", letter: true },
  "حذف حرف العلة": { ar: "حَذْفُ حَرْفِ العِلَّةِ", translit: "ḥadhfu ḥarfi al-‘illati", en: "the deleted weak letter", letter: true },
};

const MAHALL: Partial<Record<CaseType, { ar: string; translit: string; en: string }>> = {
  rafa: { ar: "رَفْعٍ", translit: "raf‘in", en: "nominative" },
  nasb: { ar: "نَصْبٍ", translit: "naṣbin", en: "accusative" },
  jarr: { ar: "جَرٍّ", translit: "jarrin", en: "genitive" },
};

/** Verbs have moods, not cases — English wording for the same rafʿ/naṣb/jazm. */
const MOOD_EN: Partial<Record<CaseType, string>> = {
  rafa: "in the indicative mood",
  nasb: "in the subjunctive mood",
  jazm: "in the jussive mood",
};

export interface IrabSentence {
  ar: string;
  transliteration: string;
  en: string;
}

export function buildIrabSentence(token: IrabToken, role: GrammaticalRole | undefined): IrabSentence | null {
  if (!role || !token.caseSign) return null;
  const { caseType, signAr } = token.caseSign;
  // The piece's extra clauses (subject, "وهو مضاف", a clause's position…), appended before the full stop.
  const noteAr = token.noteAr ? `، ${token.noteAr}` : "";
  const noteEn = token.noteEn ? `; ${token.noteEn}` : "";

  // Indeclinable (verbs, particles, pronouns, demonstratives). The fixed
  // ending is stated only when it's known for this exact word (closed-class
  // lists in particles.ts) — never guessed; and a mabni word standing in a
  // declinable slot says which case that slot is ("في محل رفع").
  if (caseType === "mabni") {
    const built = token.builtOn;
    const mahall = token.mahall ? MAHALL[token.mahall] : undefined;
    // Particles and verbs: the word's own description *is* its i'rab
    // ("حَرْفُ تَوْكِيدٍ وَنَصْبٍ مَبْنِيٌّ عَلَى الفَتْحِ") — use the specific kind
    // when the parser supplied one, else the role name. Pronouns and
    // demonstratives: "role، kind مبني … في محل …".
    const isRoleItself = role.category === "particle" || role.code === "FIL" || role.code === "KANA";
    const hasSpecificKind = token.posNameAr !== "حرف" && token.posNameAr !== "فعل";
    const kindAr = isRoleItself && !hasSpecificKind ? role.nameAr : token.posNameAr;
    const kindEn = isRoleItself && !hasSpecificKind ? role.nameEn : token.posNameEn;
    const builtAr = built ? ` عَلَى ${built.ar}` : "";
    const builtEn = built ? ` on ${built.en}` : "";
    const mahallAr = mahall ? ` فِي مَحَلِّ ${mahall.ar}` : "";
    const mahallEn = mahall ? `, in the position of the ${mahall.en} case` : "";
    const prefixAr = isRoleItself ? "" : `${role.nameAr}، `;
    const prefixEn = isRoleItself ? "" : `${role.nameEn}: `;
    return {
      ar: `${prefixAr}${kindAr} مَبْنِيٌّ${builtAr}${mahallAr}${noteAr}.`,
      transliteration: `${prefixEn}${kindEn} — mabniyyun${built ? ` ‘alā ${built.en}` : ""}${mahall ? ` fī maḥalli ${mahall.translit}` : ""}.`,
      en: `${prefixEn}${kindEn}, indeclinable (mabni)${builtEn}${mahallEn}${mahall || isRoleItself ? "" : " — it doesn't take a case ending"}${noteEn}.`,
    };
  }

  const decl = DECLENSION[caseType];
  const sign = SIGN_PHRASE[signAr];
  if (!decl || !sign) return null;
  const reasonAr = token.caseSign.reasonAr;
  const reasonEn = token.caseSign.reasonEn;
  // Vowel signs are "visible at the end of the word"; letter signs and
  // substitute signs state their reason instead.
  const tailAr = reasonAr ? ` ${reasonAr}` : sign.letter ? "" : " الظّاهِرَةُ عَلى آخِرِهِ";
  const tailTranslit = reasonAr ? "" : sign.letter ? "" : " ẓāhiratun ‘alā ākhirihi";
  const tailEn = reasonEn ? `, ${reasonEn}` : sign.letter ? "" : ", visible at the end of the word";

  // "اسم مجرور" already states the case in the role name itself — stating
  // "مجرور مجرور" would be redundant, so skip the separate case adjective.
  const skipAdjective = token.posNameAr === "اسم" && role.code === "MAJROOR";
  // A present-tense verb is named by its kind: "فِعْلٌ مُضَارِعٌ مَرْفُوعٌ…".
  const isVerb = role.code === "FIL" || role.code === "KANA";
  const headAr = isVerb ? token.posNameAr : role.nameAr;
  const headEn = isVerb ? token.posNameEn : role.nameEn;

  const ar = skipAdjective
    ? `${headAr}، وَعَلامَةُ ${decl.signOfPhraseAr} ${sign.ar}${tailAr}${noteAr}.`
    : `${headAr} ${decl.adjectiveAr}، وَعَلامَةُ ${decl.signOfPhraseAr} ${sign.ar}${tailAr}${noteAr}.`;

  const transliteration = skipAdjective
    ? `${headEn}, wa ‘alāmatu ${decl.signOfPhraseTranslit} ${sign.translit}${tailTranslit}.`
    : `${headEn}, ${decl.adjectiveTranslit}, wa ‘alāmatu ${decl.signOfPhraseTranslit} ${sign.translit}${tailTranslit}.`;

  const en = skipAdjective
    ? `${headEn} — the sign of ${decl.signOfPhraseEn} is ${sign.en}${tailEn}${noteEn}.`
    : `${headEn}, ${isVerb ? MOOD_EN[caseType] ?? decl.adjectiveEn : decl.adjectiveEn}; the sign of ${decl.signOfPhraseEn} is ${sign.en}${tailEn}${noteEn}.`;

  return { ar, transliteration, en };
}
