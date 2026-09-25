import { coarsePos, type CoarsePos } from "./classify";
import { stripDiacritics } from "./particles";

/**
 * Structured morphology for one reading of one typed word, built from a
 * CAMeL Tools analysis (services/camel/app.py passes its features through
 * verbatim). The grammar (grammar.ts) reasons over these facts; nothing
 * here decides a grammatical role.
 *
 * CAMeL's `bw` field is the tagged morpheme segmentation, e.g.
 *   "بِ/PREP+ال/DET+قَلَم/NOUN+ِ/CASE_DEF_GEN"
 *   "كَتَب/PV+ُوا/PVSUFF_SUBJ:3MP"
 *   "كِتاب/NOUN+ُ/CASE_DEF_NOM+هُ/POSS_PRON_3MS"
 * which is what lets attached prepositions, conjunctions and pronouns be
 * split off and given their own i'rab.
 */

export type AnalysisSourceTag = "camel" | "quranic_corpus";

/** A candidate as it arrives from CAMeL (or a fallback source). Feature fields are CAMeL's codes. */
export interface RawCandidate {
  root: string | null;
  lemma: string | null;
  pos: string | null;
  diac: string | null;
  number?: string | null;
  gender?: string | null;
  person?: string | null;
  aspect?: string | null;
  mood?: string | null;
  case?: string | null;
  state?: string | null;
  voice?: string | null;
  prc0?: string | null;
  prc1?: string | null;
  prc2?: string | null;
  prc3?: string | null;
  enc0?: string | null;
  bw?: string | null;
  /** Defaults to "camel" when omitted. */
  source?: AnalysisSourceTag;
}

export interface Morpheme {
  form: string;
  tag: string;
}

export type Pgn = { person: 1 | 2 | 3 | null; gender: "m" | "f" | null; number: "s" | "d" | "p" | null };

export type NounSuffix =
  | { kind: "masc_pl"; case: "nom" | "accgen"; construct: boolean }
  | { kind: "dual"; case: "nom" | "accgen"; construct: boolean }
  | { kind: "fem_pl" };

export interface Enclitic {
  /** Pronoun person/gender/number, e.g. 3ms → {3, m, s}. */
  pgn: Pgn;
  /** poss: on a noun (mudaf ilayh); dobj: object of a verb; pron: after a particle/preposition. */
  kind: "poss" | "dobj" | "pron";
  /** Bare letter count of the pronoun as written (ـه = 1, ـها = 2, ـني = 2...). */
  letters: number;
}

export interface Reading {
  root: string | null;
  lemma: string | null;
  pos: CoarsePos;
  rawPos: string;
  proper: boolean;
  source: AnalysisSourceTag;
  /** false for fallback sources that carry no features — only the ending the user typed can be used then. */
  hasFeatures: boolean;
  aspect: "p" | "i" | "c" | null;
  voice: "a" | "p" | null;
  pgn: Pgn;
  /** CAMeL's state: d(efinite) / i(ndefinite) / c(onstruct). */
  state: "d" | "i" | "c" | null;
  conj: "w" | "f" | null;
  prep: "bi" | "li" | "ka" | null;
  det: boolean;
  future: boolean;
  enclitic: Enclitic | null;
  nounSuffix: NounSuffix | null;
  /** Verb subject suffix code from PVSUFF_SUBJ / IVSUFF_SUBJ / CVSUFF_SUBJ, e.g. "3MS", "1S", "MP". */
  subjSuffix: string | null;
  morphemes: Morpheme[];
}

export function parseBw(bw: string | null | undefined): Morpheme[] {
  if (!bw) return [];
  return bw.split("+").map((part) => {
    const slash = part.lastIndexOf("/");
    const form = slash === -1 ? part : part.slice(0, slash);
    return { form: form === "(null)" ? "" : form, tag: slash === -1 ? "" : part.slice(slash + 1) };
  });
}

function pgnFromCode(code: string): Pgn {
  // "3ms", "1s", "2fp", "3d"...
  const m = /^([123])?([mf])?([sdp])?/i.exec(code.toLowerCase());
  return {
    person: m?.[1] ? (Number(m[1]) as 1 | 2 | 3) : null,
    gender: (m?.[2] as "m" | "f" | undefined) ?? null,
    number: (m?.[3] as "s" | "d" | "p" | undefined) ?? null,
  };
}

function bareLetters(form: string): number {
  return [...stripDiacritics(form)].length;
}

export function toReading(c: RawCandidate): Reading | null {
  if (!c.pos) return null;
  const morphemes = parseBw(c.bw);
  const hasFeatures = c.aspect !== undefined && c.aspect !== null;
  const val = (v: string | null | undefined) => (v && v !== "na" && v !== "0" ? v : null);

  let enclitic: Enclitic | null = null;
  const enc = val(c.enc0);
  if (enc) {
    const [code, kind] = enc.split("_");
    const pronMorpheme = [...morphemes].reverse().find((m) => /PRON|PVSUFF_DO|IVSUFF_DO|CVSUFF_DO/.test(m.tag));
    enclitic = {
      pgn: pgnFromCode(code),
      kind: kind === "poss" ? "poss" : kind === "dobj" ? "dobj" : "pron",
      letters: pronMorpheme ? bareLetters(pronMorpheme.form) : 0,
    };
  }

  let nounSuffix: NounSuffix | null = null;
  for (const m of morphemes) {
    const plDu = /^NSUFF_(MASC|FEM)_(PL|DU)_(NOM|ACCGEN|ACC|GEN)(_POSS)?$/.exec(m.tag);
    if (plDu) {
      const kind = plDu[2] === "DU" ? "dual" : "masc_pl";
      // Feminine *dual* declines like any dual; feminine plural (ات) is handled below.
      nounSuffix = { kind, case: plDu[3] === "NOM" ? "nom" : "accgen", construct: Boolean(plDu[4]) } as NounSuffix;
    } else if (m.tag === "NSUFF_FEM_PL") {
      nounSuffix = { kind: "fem_pl" };
    }
  }

  const subj = morphemes.find((m) => /^(PV|IV|CV)SUFF_SUBJ:/.test(m.tag));
  const subjSuffix = subj ? subj.tag.split(":")[1].split("_")[0] : null;

  const prc2 = val(c.prc2);
  const prc1 = val(c.prc1);
  return {
    root: c.root,
    lemma: c.lemma,
    pos: coarsePos(c.pos),
    rawPos: c.pos,
    proper: c.pos.startsWith("noun_prop"),
    source: c.source ?? "camel",
    hasFeatures,
    aspect: (val(c.aspect) as Reading["aspect"]) ?? null,
    voice: (val(c.voice) as Reading["voice"]) ?? null,
    pgn: {
      person: val(c.person) && /^[123]$/.test(c.person!) ? (Number(c.person) as 1 | 2 | 3) : null,
      gender: c.gender === "m" || c.gender === "f" ? c.gender : null,
      number: c.number === "s" || c.number === "d" || c.number === "p" ? c.number : null,
    },
    state: c.state === "d" || c.state === "i" || c.state === "c" ? c.state : null,
    // CAMeL's codes: wa_conj / wa_part / wa_sub, fa_conj / fa_sub … (confirmed live).
    conj: prc2?.startsWith("wa_") || prc2?.startsWith("w_") ? "w" : prc2?.startsWith("fa_") || prc2?.startsWith("f_") ? "f" : null,
    prep: prc1 === "bi_prep" ? "bi" : prc1 === "li_prep" ? "li" : prc1 === "ka_prep" ? "ka" : null,
    det: val(c.prc0) === "Al_det",
    future: prc1 === "sa_fut",
    enclitic,
    nounSuffix,
    subjSuffix,
    morphemes,
  };
}

/** Letter groups (base letter + its marks) of a typed word. */
function letterGroups(text: string): string[] {
  const groups: string[] = [];
  for (const ch of text) {
    if (/[\u064B-\u0652\u0670\u0640]/.test(ch) && groups.length > 0) groups[groups.length - 1] += ch;
    else groups.push(ch);
  }
  return groups;
}

export interface TypedParts {
  conj: string | null;
  prep: string | null;
  core: string;
  enclitic: string | null;
}

/**
 * Splits the word *as the learner typed it* into the pieces a reading
 * identifies, so each piece is shown with the learner's own diacritics.
 * "لِلطَّالِبِ" (li + al- contracted) gets its article's alif restored in
 * the core for display: "الطَّالِبِ".
 */
export function splitTyped(surface: string, r: Reading): TypedParts {
  const groups = letterGroups(surface);
  let start = 0;
  let end = groups.length;
  const take = (from: number, n: number) => groups.slice(from, from + n).join("");
  const conj = r.conj ? take(start, 1) : null;
  if (r.conj) start += 1;
  const prep = r.prep ? take(start, 1) : null;
  if (r.prep) start += 1;
  const enclitic = r.enclitic && r.enclitic.letters > 0 && end - r.enclitic.letters > start ? groups.slice(end - r.enclitic.letters).join("") : null;
  if (enclitic) end -= r.enclitic!.letters;
  let core = groups.slice(start, end).join("");
  if (r.prep === "li" && r.det && core.startsWith("\u0644")) core = "\u0627" + core;
  return { conj, prep, core, enclitic };
}
