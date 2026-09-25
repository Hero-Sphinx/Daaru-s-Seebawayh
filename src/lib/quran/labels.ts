import { VERB_FORMS } from "./tagset";
import type { QuranWordDTO } from "./types";

/**
 * Traditional Arabic grammar terms for the corpus's morphological
 * features, for the reader's word card. Pure lookups — no inference.
 */

export interface FeatureLabel {
  label: string;
  en: string;
  ar: string;
}

const CASE: Record<string, [string, string]> = {
  nominative: ["Nominative", "مَرْفُوع"],
  accusative: ["Accusative", "مَنْصُوب"],
  genitive: ["Genitive", "مَجْرُور"],
};
const MOOD: Record<string, [string, string]> = {
  indicative: ["Indicative", "مَرْفُوع"],
  subjunctive: ["Subjunctive", "مَنْصُوب"],
  jussive: ["Jussive", "مَجْزُوم"],
};
const ASPECT: Record<string, [string, string]> = {
  perfect: ["Perfect (past)", "فِعْل مَاضٍ"],
  imperfect: ["Imperfect (present)", "فِعْل مُضَارِع"],
  imperative: ["Imperative", "فِعْل أَمْر"],
};
const VOICE: Record<string, [string, string]> = {
  active: ["Active", "مَبْنِيّ لِلْمَعْلُوم"],
  passive: ["Passive", "مَبْنِيّ لِلْمَجْهُول"],
};
const GENDER: Record<string, [string, string]> = { m: ["Masculine", "مُذَكَّر"], f: ["Feminine", "مُؤَنَّث"] };
const NUMBER: Record<string, [string, string]> = {
  singular: ["Singular", "مُفْرَد"],
  dual: ["Dual", "مُثَنًّى"],
  plural: ["Plural", "جَمْع"],
};
const PERSON: Record<number, [string, string]> = {
  1: ["1st person", "مُتَكَلِّم"],
  2: ["2nd person", "مُخَاطَب"],
  3: ["3rd person", "غَائِب"],
};
const DEFINITENESS: Record<string, [string, string]> = { definite: ["Definite", "مَعْرِفَة"], indefinite: ["Indefinite", "نَكِرَة"] };
const DERIVATION: Record<string, [string, string]> = {
  active_participle: ["Active participle", "اِسْم فَاعِل"],
  passive_participle: ["Passive participle", "اِسْم مَفْعُول"],
  verbal_noun: ["Verbal noun", "مَصْدَر"],
};
const ROMAN = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

function push(out: FeatureLabel[], label: string, table: Record<string | number, [string, string]>, value: string | number | null) {
  if (value === null) return;
  const entry = table[value];
  if (entry) out.push({ label, en: entry[0], ar: entry[1] });
}

export function describeWord(w: QuranWordDTO): FeatureLabel[] {
  const out: FeatureLabel[] = [];
  push(out, "Case", CASE, w.grammaticalCase);
  push(out, "Tense", ASPECT, w.verbAspect);
  push(out, "Mood", MOOD, w.verbMood);
  push(out, "Voice", VOICE, w.verbVoice);
  if (w.verbForm) {
    // Show the actual wazn (اِسْتَفْعَلَ), not a Roman numeral dressed in Arabic.
    const pattern = VERB_FORMS.find((f) => f.formNumber === w.verbForm)?.waznPattern ?? "";
    out.push({ label: "Verb form", en: `Form ${ROMAN[w.verbForm]}`, ar: pattern });
  }
  push(out, "Derivation", DERIVATION, w.derivation);
  push(out, "Person", PERSON, w.person);
  push(out, "Gender", GENDER, w.gender);
  push(out, "Number", NUMBER, w.grammaticalNumber);
  push(out, "Definiteness", DEFINITENESS, w.definiteness);
  return out;
}

/** Colour bucket for the reader: nominal case, verb, or neither. */
export function wordTone(w: Pick<QuranWordDTO, "grammaticalCase" | "pos">): "nominative" | "accusative" | "genitive" | "verb" | "other" {
  if (w.grammaticalCase) return w.grammaticalCase;
  if (w.pos?.category === "verb") return "verb";
  return "other";
}
