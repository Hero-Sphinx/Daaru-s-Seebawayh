import type { CaseSign } from "@/types/irab";
import { finalMark } from "./case-ending";
import type { Reading } from "./morph";
import { BUILT_ON, stripDiacritics, type BuiltOn } from "./particles";

/**
 * The i'rab of a verb: past and imperative are mabni (with the vowel they're
 * built on and why); the present (mudari') is mu'rab, and its mood is read
 * from the ending the learner typed and checked against whatever particle
 * governs it (لم / لن / لا الناهية …). A mismatch returns an error instead
 * of an analysis — the parser never states a mood the text contradicts.
 *
 * The verb's *subject* is described here too, because in traditional i'rab
 * it's stated as part of the verb's entry when it's attached (كَتَبْتُ: the
 * تُ) or implied (ضمير مستتر). An explicit subject noun is its own token.
 */

export type Governor = "jazm" | "nasb" | null;

export interface SubjectRoleName {
  ar: string; // "فاعل" | "نائب فاعل" | "اسم كان" ...
  en: string;
}

export interface VerbAnalysis {
  kindAr: string;
  kindEn: string;
  /** Present tense: the mood as a case sign (rafa/nasb/jazm + sign + reason). */
  moodSign: CaseSign | null;
  /** Past/imperative (and nun-niswa present): what it's built on. */
  builtOn: BuiltOn | null;
  /** Suffix-driven detail appended to the entry (subject pronoun, ta' al-ta'nith, alif farika...). */
  noteAr: string | null;
  noteEn: string | null;
  /** True when the subject is attached to the verb or implied — no separate subject noun may follow. */
  subjectInVerb: boolean;
}

export type VerbResult = { ok: true; value: VerbAnalysis } | { ok: false; error: string };

const WEAK_LETTERS = new Set(["\u0627", "\u0649", "\u0648", "\u064A"]);

function lastBare(text: string): string {
  const bare = stripDiacritics(text);
  return bare[bare.length - 1] ?? "";
}

function lemmaIsWeakFinal(r: Reading): boolean {
  return r.lemma !== null && WEAK_LETTERS.has(lastBare(r.lemma));
}

/** "PVSUFF_SUBJ:3MS" → "3MS"; "IVSUFF_SUBJ:MP_MOOD:I" → "MP"; imperfect person comes from the prefix. */
function subjCode(r: Reading): string {
  return (r.subjSuffix ?? "").toUpperCase();
}

// Attached subject pronouns of the past tense (ضمائر الرفع المتحركة) and their own fixed endings.
const MOVING_SUBJECT: Record<string, { ar: string; en: string; builtOn: BuiltOn }> = {
  "1S": { ar: "التاءُ", en: "the ta'", builtOn: BUILT_ON.damm },
  "2MS": { ar: "التاءُ", en: "the ta'", builtOn: BUILT_ON.fath },
  "2FS": { ar: "التاءُ", en: "the ta'", builtOn: BUILT_ON.kasr },
  "1P": { ar: "نا", en: "the na", builtOn: BUILT_ON.sukun },
  "2MP": { ar: "التاءُ والميمُ", en: "the -tum", builtOn: BUILT_ON.sukun },
  "2FP": { ar: "التاءُ والنونُ", en: "the -tunna", builtOn: BUILT_ON.fath },
  "2D": { ar: "التاءُ والميمُ والألفُ", en: "the -tuma", builtOn: BUILT_ON.sukun },
  "3FP": { ar: "نونُ النسوةِ", en: "the nun of the feminine plural", builtOn: BUILT_ON.fath },
};

function pronounNote(pronAr: string, pronEn: string, builtOn: BuiltOn, role: SubjectRoleName) {
  return {
    ar: `وَ${pronAr} ضَمِيرٌ مُتَّصِلٌ مَبْنِيٌّ عَلَى ${builtOn.ar} فِي مَحَلِّ رَفْعِ ${role.ar}`,
    en: `${pronEn} is an attached pronoun, indeclinable on ${builtOn.en}, in the position of the nominative (${role.en})`,
  };
}

function impliedSubject(r: Reading, role: SubjectRoleName, ambiguousTaqdir: string | null): { ar: string; en: string } {
  const { person, gender, number } = r.pgn;
  let taqdir: { ar: string; en: string; must: boolean } | null = null;
  if (person === 1 && number === "s") taqdir = { ar: "أَنَا", en: "I", must: true };
  else if (person === 1) taqdir = { ar: "نَحْنُ", en: "we", must: true };
  else if (person === 2 && gender === "m" && number === "s") taqdir = { ar: "أَنْتَ", en: "you", must: true };
  else if (person === 3 && gender === "m" && number === "s") taqdir = { ar: "هُوَ", en: "he", must: false };
  else if (person === 3 && gender === "f" && number === "s") taqdir = { ar: "هِيَ", en: "she", must: false };
  if (ambiguousTaqdir) {
    return {
      ar: `وَ${role.ar} ضَمِيرٌ مُسْتَتِرٌ تَقْدِيرُهُ ${ambiguousTaqdir} بِحَسَبِ السِّيَاقِ`,
      en: `the ${role.en} is an implied pronoun (${ambiguousTaqdir}, depending on context)`,
    };
  }
  if (!taqdir) return { ar: `وَ${role.ar} ضَمِيرٌ مُسْتَتِرٌ`, en: `the ${role.en} is an implied pronoun` };
  return {
    ar: `وَ${role.ar} ضَمِيرٌ مُسْتَتِرٌ ${taqdir.must ? "وُجُوبًا" : "جَوَازًا"} تَقْدِيرُهُ ${taqdir.ar}`,
    en: `the ${role.en} is an implied pronoun (${taqdir.must ? "obligatorily" : "optionally"} hidden), understood as "${taqdir.en}"`,
  };
}

export interface VerbContext {
  /** The typed verb core (without an attached object pronoun). */
  surface: string;
  governor: Governor;
  /** Subject role as it reads after "في محل رفع": فاعلٍ / نائبِ فاعلٍ / اسمِ كان … */
  subjectRole: SubjectRoleName;
  /** Subject role as the head of its own clause: الفاعلُ / نائبُ الفاعلِ / اسمُ كان … (implied subjects). */
  impliedRole: SubjectRoleName;
  /** An explicit subject noun follows (only allowed when the subject isn't in the verb). */
  explicitSubject: boolean;
  /** "ناقص" for kana and its sisters. */
  naqis: boolean;
  /** Present tense 2ms/3fs share a form (تَكْتُبُ) — when no subject noun disambiguates. */
  ambiguousTaqdir?: string | null;
  /** The next word opens with hamzat al-wasl — a final sukun may then be typed as a helping kasra. */
  beforeWasl?: boolean;
}

const ILTIQA = {
  ar: "وَحُرِّكَ بِالكَسْرِ مَنْعًا لِالْتِقَاءِ السَّاكِنَيْنِ",
  en: "moved to a kasra to avoid two sukuns meeting (iltiqa' al-sakinayn)",
};

function withNote(v: VerbAnalysis, ar: string, en: string, first = false): VerbAnalysis {
  const joinAr = (a: string | null, b: string) => (a ? (first ? `${b}، ${a}` : `${a}، ${b}`) : b);
  const joinEn = (a: string | null, b: string) => (a ? (first ? `${b}; ${a}` : `${a}; ${b}`) : b);
  return { ...v, noteAr: joinAr(v.noteAr, ar), noteEn: joinEn(v.noteEn, en) };
}

export function analyzeVerb(r: Reading, ctx: VerbContext): VerbResult {
  // التقاء الساكنين: a sukun-final verb before hamzat al-wasl is pronounced with a kasra
  // (لَمْ يَكْتُبِ الطَّالِبُ، اُكْتُبِ الدَّرْسَ، ذَهَبَتِ الطَّالِبَةُ). Analyse the sukun
  // form it stands for, then say why the kasra is there.
  if (ctx.beforeWasl && finalMark(ctx.surface) === "\u0650") {
    const sukunForm = ctx.surface.normalize("NFC").replace(/\u0650$/, "\u0652");
    const res = analyzeVerbCore(r, { ...ctx, surface: sukunForm });
    if (!res.ok) return res;
    const v = res.value;
    const sukunEnding = v.moodSign?.signAr === "السكون" || v.builtOn === BUILT_ON.sukun || (r.aspect === "p" && subjCode(r) === "3FS");
    if (!sukunEnding) return { ok: false, error: "only a word ending in a sukun takes a helping kasra before hamzat al-wasl" };
    if (r.aspect === "p") {
      // The sukun belongs to the ta' al-ta'nith, not the verb itself.
      const ta = "حَرْفٌ لَا مَحَلَّ لَهُ مِنَ الإِعْرَابِ";
      return { ok: true, value: { ...v, noteAr: v.noteAr!.replace(ta, `${ta}، وَحُرِّكَتْ بِالكَسْرِ مَنْعًا لِالْتِقَاءِ السَّاكِنَيْنِ`), noteEn: `${v.noteEn}; the ta' is moved to a kasra to avoid two sukuns meeting` } };
    }
    return { ok: true, value: withNote(v, ILTIQA.ar, ILTIQA.en, true) };
  }
  return analyzeVerbCore(r, ctx);
}

function analyzeVerbCore(r: Reading, ctx: VerbContext): VerbResult {
  const code = subjCode(r);
  const passive = r.voice === "p";
  const suffixAr = `${ctx.naqis ? " نَاقِصٌ" : ""}${passive ? " مَبْنِيٌّ لِلْمَجْهُولِ" : ""}`;
  const suffixEn = `${ctx.naqis ? " (incomplete, of kana's family)" : ""}${passive ? " in the passive voice" : ""}`;
  const mark = finalMark(ctx.surface);
  const last = lastBare(ctx.surface);

  // ---------- past ----------
  if (r.aspect === "p") {
    const kindAr = `فِعْلٌ مَاضٍ${suffixAr}`;
    const kindEn = `Past-tense verb${suffixEn}`;
    if (ctx.governor) return { ok: false, error: "a past-tense verb can't take a jussive/subjunctive particle here" };
    const moving = MOVING_SUBJECT[code];
    if (moving) {
      const n = pronounNote(moving.ar, moving.en, moving.builtOn, ctx.subjectRole);
      return {
        ok: true,
        value: {
          kindAr,
          kindEn,
          moodSign: null,
          builtOn: { ar: `${BUILT_ON.sukun.ar} لِاتِّصَالِهِ بِضَمِيرِ رَفْعٍ مُتَحَرِّكٍ`, en: `${BUILT_ON.sukun.en}, because a moving subject pronoun is attached` },
          noteAr: n.ar,
          noteEn: n.en,
          subjectInVerb: true,
        },
      };
    }
    if (code === "3MP") {
      const n = pronounNote("الوَاوُ", "the waw", BUILT_ON.sukun, ctx.subjectRole);
      return {
        ok: true,
        value: {
          kindAr,
          kindEn,
          moodSign: null,
          // Weak-final verbs (دَعَوْا، سَعَوْا، رَضُوا) are analysed differently by different books — the vowel isn't claimed.
          builtOn: lemmaIsWeakFinal(r) ? null : { ar: `${BUILT_ON.damm.ar} لِاتِّصَالِهِ بِوَاوِ الجَمَاعَةِ`, en: `${BUILT_ON.damm.en}, because the waw of the plural is attached` },
          noteAr: `${n.ar}، وَالأَلِفُ فَارِقَةٌ`,
          noteEn: `${n.en}; the final alif is orthographic (alif farika)`,
          subjectInVerb: true,
        },
      };
    }
    if (code === "3MD" || code === "3FD") {
      const n = pronounNote("الأَلِفُ", "the alif (of the dual)", BUILT_ON.sukun, ctx.subjectRole);
      const taNote = code === "3FD" ? "وَالتَّاءُ لِلتَّأْنِيثِ، " : "";
      return {
        ok: true,
        value: {
          kindAr,
          kindEn,
          moodSign: null,
          builtOn: lemmaIsWeakFinal(r) ? null : BUILT_ON.fath,
          noteAr: `${taNote}${n.ar}`,
          noteEn: `${code === "3FD" ? "the ta' marks the feminine; " : ""}${n.en}`,
          subjectInVerb: true,
        },
      };
    }
    // 3ms / 3fs: subject is an explicit noun or an implied pronoun.
    const isFem = code === "3FS";
    let builtOn: BuiltOn | null;
    if (!isFem && (last === "\u0627" || last === "\u0649")) {
      builtOn = { ar: `الفَتْحِ المُقَدَّرِ عَلَى الأَلِفِ مَنَعَ مِنْ ظُهُورِهِ التَّعَذُّرُ`, en: "an implied fatha on the alif (it can't be pronounced)" };
    } else if (isFem && lemmaIsWeakFinal(r) && !WEAK_LETTERS.has(stripDiacritics(ctx.surface).slice(-2, -1))) {
      builtOn = null; // دَعَتْ / سَعَتْ: weak letter elided — not claimed
    } else {
      builtOn = BUILT_ON.fath;
    }
    const subj = ctx.explicitSubject ? null : impliedSubject(r, ctx.impliedRole, null);
    const taAr = isFem ? "وَالتَّاءُ تَاءُ التَّأْنِيثِ السَّاكِنَةُ حَرْفٌ لَا مَحَلَّ لَهُ مِنَ الإِعْرَابِ" : null;
    const taEn = isFem ? "the ta' marks the feminine (a particle with no case role)" : null;
    return {
      ok: true,
      value: {
        kindAr,
        kindEn,
        moodSign: null,
        builtOn,
        noteAr: [taAr, subj?.ar].filter(Boolean).join("، ") || null,
        noteEn: [taEn, subj?.en].filter(Boolean).join("; ") || null,
        subjectInVerb: !ctx.explicitSubject,
      },
    };
  }

  // ---------- imperative ----------
  if (r.aspect === "c") {
    const kindAr = "فِعْلُ أَمْرٍ";
    const kindEn = "Imperative verb";
    const { gender, number } = r.pgn;
    if (number === "p" && gender === "f") {
      const n = pronounNote("نُونُ النِّسْوَةِ", "the nun of the feminine plural", BUILT_ON.fath, ctx.subjectRole);
      return { ok: true, value: { kindAr, kindEn, moodSign: null, builtOn: { ar: `${BUILT_ON.sukun.ar} لِاتِّصَالِهِ بِنُونِ النِّسْوَةِ`, en: `${BUILT_ON.sukun.en} (nun of the feminine plural attached)` }, noteAr: n.ar, noteEn: n.en, subjectInVerb: true } };
    }
    if (number === "p" || number === "d" || (gender === "f" && number === "s")) {
      const pron = number === "p" ? ["وَاوُ الجَمَاعَةِ", "the waw of the plural"] : number === "d" ? ["أَلِفُ الاثْنَيْنِ", "the alif of the dual"] : ["يَاءُ المُخَاطَبَةِ", "the ya' of the feminine addressee"];
      const n = pronounNote(pron[0], pron[1], BUILT_ON.sukun, ctx.subjectRole);
      return { ok: true, value: { kindAr, kindEn, moodSign: null, builtOn: { ar: "حَذْفِ النُّونِ", en: "the deletion of the nun" }, noteAr: n.ar, noteEn: n.en, subjectInVerb: true } };
    }
    const subj = impliedSubject({ ...r, pgn: { person: 2, gender: "m", number: "s" } }, ctx.impliedRole, null);
    let builtOn: BuiltOn | null;
    if (mark === null && lemmaIsWeakFinal(r) && !WEAK_LETTERS.has(last)) builtOn = null;
    else if (lemmaIsWeakFinal(r) && !WEAK_LETTERS.has(last)) builtOn = { ar: "حَذْفِ حَرْفِ العِلَّةِ", en: "the deletion of the weak letter" };
    else if (mark === null) builtOn = BUILT_ON.sukun;
    else return { ok: false, error: "an imperative ends in a sukun (or drops its weak letter) — this ending doesn't fit" };
    return { ok: true, value: { kindAr, kindEn, moodSign: null, builtOn, noteAr: subj.ar, noteEn: subj.en, subjectInVerb: true } };
  }

  // ---------- present (mudari') ----------
  if (r.aspect !== "i") return { ok: false, error: "the verb's tense couldn't be determined" };
  const kindAr = `فِعْلٌ مُضَارِعٌ${suffixAr}`;
  const kindEn = `Present-tense verb${suffixEn}`;
  const { person, gender, number } = r.pgn;

  // Nun of the feminine plural: mabni.
  if (number === "p" && gender === "f") {
    const n = pronounNote("نُونُ النِّسْوَةِ", "the nun of the feminine plural", BUILT_ON.fath, ctx.subjectRole);
    return {
      ok: true,
      value: { kindAr, kindEn, moodSign: null, builtOn: { ar: `${BUILT_ON.sukun.ar} لِاتِّصَالِهِ بِنُونِ النِّسْوَةِ`, en: `${BUILT_ON.sukun.en} (nun of the feminine plural attached)` }, noteAr: n.ar, noteEn: n.en, subjectInVerb: true },
    };
  }

  // The five verbs (الأفعال الخمسة): mood by the presence of the final nun.
  // (1st person plural نَفْعَلُ is an ordinary verb — its subject is implied, it has no suffix.)
  const fiveVerbPron =
    person === 1
      ? null
      : number === "p"
        ? (["وَاوُ الجَمَاعَةِ", "the waw of the plural"] as const)
        : number === "d"
          ? (["أَلِفُ الاثْنَيْنِ", "the alif of the dual"] as const)
          : person === 2 && gender === "f" && number === "s"
            ? (["يَاءُ المُخَاطَبَةِ", "the ya' of the feminine addressee"] as const)
            : null;
  if (fiveVerbPron) {
    const hasNun = last === "\u0646";
    const n = pronounNote(fiveVerbPron[0], fiveVerbPron[1], BUILT_ON.sukun, ctx.subjectRole);
    let moodSign: CaseSign;
    if (hasNun) {
      if (ctx.governor) return { ok: false, error: `this particle requires the verb to drop its final nun (${ctx.governor === "jazm" ? "jussive" : "subjunctive"})` };
      moodSign = { caseType: "rafa", signAr: "ثبوت النون", signEn: "The retained nun", reasonAr: "لِأَنَّهُ مِنَ الأَفْعَالِ الخَمْسَةِ", reasonEn: "because it is one of the five verbs" };
    } else {
      if (!ctx.governor) return { ok: false, error: "a present verb without its final nun needs a jussive or subjunctive particle before it" };
      moodSign = {
        caseType: ctx.governor,
        signAr: "حذف النون",
        signEn: "The deleted nun",
        reasonAr: "لِأَنَّهُ مِنَ الأَفْعَالِ الخَمْسَةِ",
        reasonEn: "because it is one of the five verbs",
      };
    }
    return { ok: true, value: { kindAr, kindEn, moodSign, builtOn: null, noteAr: n.ar, noteEn: n.en, subjectInVerb: true } };
  }

  // Ordinary present: mood from the typed ending, checked against the governor.
  let moodSign: CaseSign | null = null;
  const weak = lemmaIsWeakFinal(r);
  if (weak && (last === "\u0648" || last === "\u064A") && (mark === null || mark === "\u0652")) {
    if (ctx.governor) return { ok: false, error: "this particle changes the verb's ending (fatha after لن, the weak letter dropped after لم) — the typed form doesn't show it" };
    moodSign = { caseType: "rafa", signAr: "الضمة", signEn: "Damma", reasonAr: `المُقَدَّرَةُ عَلَى ${last === "\u0648" ? "الوَاوِ" : "اليَاءِ"} مَنَعَ مِنْ ظُهُورِهَا الثِّقَلُ`, reasonEn: `implied on the ${last === "\u0648" ? "waw" : "ya'"} (too heavy to pronounce)` };
  } else if (weak && (last === "\u0649" || last === "\u0627")) {
    if (ctx.governor === "jazm") return { ok: false, error: "after a jussive particle the final alif is dropped (لَمْ يَسْعَ)" };
    const caseType = ctx.governor === "nasb" ? "nasb" : "rafa";
    moodSign = {
      caseType,
      signAr: caseType === "nasb" ? "الفتحة" : "الضمة",
      signEn: caseType === "nasb" ? "Fatha" : "Damma",
      reasonAr: "المُقَدَّرَةُ عَلَى الأَلِفِ مَنَعَ مِنْ ظُهُورِهَا التَّعَذُّرُ",
      reasonEn: "implied on the alif (impossible to pronounce)",
    };
  } else if (weak && !WEAK_LETTERS.has(last)) {
    // لَمْ يَدْعُ / لَمْ يَرْمِ / لَمْ يَسْعَ — the weak letter is dropped for jazm.
    if (ctx.governor !== "jazm") return { ok: false, error: "the weak final letter is missing, which only happens in the jussive" };
    moodSign = { caseType: "jazm", signAr: "حذف حرف العلة", signEn: "The deleted weak letter" };
  } else if (mark === "\u064F") {
    if (ctx.governor) return { ok: false, error: `a verb after this particle must be ${ctx.governor === "jazm" ? "jussive (sukun)" : "subjunctive (fatha)"}, but it ends in a damma` };
    moodSign = { caseType: "rafa", signAr: "الضمة", signEn: "Damma" };
  } else if (mark === "\u064E") {
    if (ctx.governor !== "nasb") return { ok: false, error: "a present verb ending in a fatha must follow a subjunctive particle (لن، أن، كي…)" };
    moodSign = { caseType: "nasb", signAr: "الفتحة", signEn: "Fatha" };
  } else if (mark === null && /\u0652$/.test(ctx.surface.trim())) {
    if (ctx.governor !== "jazm") return { ok: false, error: "a present verb ending in a sukun must follow a jussive particle (لم، لا الناهية…)" };
    moodSign = { caseType: "jazm", signAr: "السكون", signEn: "Sukun" };
  } else {
    return { ok: false, error: "the verb's final vowel wasn't typed, so its mood can't be checked" };
  }

  // 2ms and 3fs share the same present form (تَكْتُبُ) — say so rather than pick.
  const ambiguous = ctx.ambiguousTaqdir ?? null;
  const subj = ctx.explicitSubject ? null : impliedSubject(r, ctx.impliedRole, ambiguous);
  return {
    ok: true,
    value: { kindAr, kindEn, moodSign, builtOn: null, noteAr: subj?.ar ?? null, noteEn: subj?.en ?? null, subjectInVerb: !ctx.explicitSubject },
  };
}
