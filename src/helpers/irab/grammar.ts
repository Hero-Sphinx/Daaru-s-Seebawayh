/**
 * Rule-based I'rab grammar (FR-1.1, FR-1.3) — deterministic, no LLM (see
 * README.md's AI usage policy). A small recursive-descent parser over the
 * words of a fully-diacritized sentence, using CAMeL Tools' morphology
 * (morph.ts) plus closed-class lists (particles.ts).
 *
 * COVERAGE
 *   Sentences  verbal (فعل + فاعل/نائب فاعل + مفعول به) · nominal (مبتدأ + خبر:
 *              a noun, a prepositional phrase, or a verbal clause) · fronted
 *              khabar (في الدارِ رجلٌ) · إنّ and its sisters · كان and its
 *              sisters (incl. ما زال…) · لا النافية للجنس · ما (نافية / حجازية) ·
 *              لم / لن / لا + present verb.
 *   Phrases    noun phrases with idafa (incl. attached pronouns and the five
 *              nouns), na't, 'atf (و، ف، ثم، أو) and badal after a
 *              demonstrative; prepositional phrases (free, attached ب/ل/ك,
 *              and preposition + pronoun: عَلَيْهِ).
 *   Words      verbs: built-on vowel or mood + sign, attached/implied subject;
 *              nouns: visible, substitute (و/ي/ا, five nouns) and implied
 *              (maqsur, manqus, ya' al-mutakallim) case signs.
 *
 * THE HARD RULES
 *   1. A word only fills a slot its *typed* ending allows (case-ending.ts,
 *      verb-irab.ts). The sign shown is derived from that ending.
 *   2. Ambiguity is reported, not resolved by preference: two different
 *      lexemes fitting the same slot → the word is left unplaced.
 *   3. Nothing is claimed that the data can't support (e.g. the built-on
 *      vowel of weak-final verbs in some persons, diptotes in jarr).
 */

import { CASE_SIGNS, GRAMMATICAL_ROLES } from "@/constants";
import type { CaseSign, CaseType, RoleCode } from "@/types";
import { caseSignFor, diptoteReason, finalMark, formDefiniteness, nounEnding, type EndingInfo } from "./caseEnding";
import { splitTyped, toReading, type RawCandidate, type Reading } from "./morph";
import { candidateMatchesSurface } from "./normalize";
import {
  BUILT_ON,
  demonstrative,
  detachedPronoun,
  fiveNoun,
  freeConjunction,
  iltiqaNote,
  innaSister,
  isHarfJarr,
  isMasdarAn,
  isUnsupportedParticle,
  kanaSister,
  NEGATION_DESCRIPTIONS,
  negationParticle,
  OPENER_DESCRIPTIONS,
  sentenceOpener,
  prepositionBuiltOn,
  PREVERBAL_DESCRIPTIONS,
  preverbalParticle,
  relativePronoun,
  shartWord,
  startsWithHamzatWasl,
  stripDiacritics,
  type BuiltOn,
  type ClosedClassWord,
  type NegationKind,
  type RelativePronoun,
  type ShartKind,
} from "./particles";
import { adverbKind, isFixedAdverb, isIntransitive, lexKey, takesTwoObjects } from "./lexicon";
import { analyzeVerb, type Governor, type SubjectRoleName } from "./verbIrab";

export interface TokenInput {
  surface: string;
  candidates: RawCandidate[];
}

type Part = "conj" | "prep" | "core" | "encl";
const PART_ORDER: Record<Part, number> = { conj: 0, prep: 1, core: 2, encl: 3 };
type CaseT = "rafa" | "nasb" | "jarr";
type Def = "def" | "indef" | null;

interface Ref {
  word: number;
  part: Part;
}

interface Label {
  ar: string;
  en: string;
}

export interface Seg {
  word: number;
  part: Part;
  surface: string;
  role: RoleCode;
  /** Role display override, e.g. "اسم كأنّ", "خبر مقدم". */
  roleName: Label | null;
  head: Ref | null;
  caseType: CaseType;
  caseSign: CaseSign | null;
  builtOn: BuiltOn | null;
  kind: Label | null;
  mahall: CaseType | null;
  note: Label | null;
  reading: Reading | null;
  resolutionNote: string | null;
}

interface Fragment {
  end: number; // index of the next unconsumed word
  segs: Seg[];
  head: Ref;
  def?: Def;
}

type ClosedKind = "harf_jarr" | "inna" | "pronoun" | "demonstrative" | "relative" | "shart" | "masdar_an" | "opener" | "negation" | "preverbal" | "free_conj" | "unsupported";

interface Word {
  index: number;
  surface: string;
  closed: { kind: ClosedKind; word: ClosedClassWord; negation?: NegationKind; relative?: RelativePronoun; shart?: ShartKind } | null;
  readings: Reading[];
}

/**
 * Masdar skeletons of a derived verb (forms II–X), from its lemma — the
 * patterns are regular, so a same-root noun matching one is certainly the
 * verb's masdar. Form I masdars aren't predictable (كِتَابَة، كِتَاب…), so none
 * are offered for it.
 */
function derivedMasdars(verbLemma: string | null): string[] {
  if (!verbLemma) return [];
  const diac = verbLemma.replace(/[^ء-\u0652ٱ]/g, "");
  const v = stripDiacritics(diac).replace(/[أإآٱ]/g, "ا");
  const n = [...v];
  const withAlifBeforeLast = n.slice(0, -1).join("") + "ا" + n[n.length - 1];
  if (n.length === 6 && v.startsWith("است")) return [withAlifBeforeLast]; // استفعل → استفعال
  if (n.length === 5 && n[0] === "ا") return [withAlifBeforeLast]; // انفعل / افتعل → انفعال / افتعال
  if (n.length === 4 && n[0] === "ا") return ["ا" + n[1] + n[2] + "ا" + n[3]]; // أفعل → إفعال
  if (n.length === 4 && n[0] === "ت") return [v]; // تفعّل / تفاعل → تفعّل / تفاعل
  if (n.length === 4 && n[1] === "ا") return ["م" + v + "ة", n[0] + n[2] + "ا" + n[3]]; // فاعل → مفاعلة / فعال
  if (n.length === 3 && /^.[\u064B-\u0652]*.[\u064B-\u0650]*\u0651/.test(diac.normalize("NFC"))) return ["ت" + n[0] + n[1] + "ي" + n[2]]; // فعّل → تفعيل
  return [];
}

function bareLemma(lemma: string | null): string {
  return stripDiacritics((lemma ?? "").replace(/[^ء-\u0652ٱ]/g, "")).replace(/[أإآٱ]/g, "ا");
}

const PLACE_ADVERB: Label = { ar: "ظرف مكان", en: "Adverb of place (maf'ul fih)" };
const TIME_ADVERB: Label = { ar: "ظرف زمان", en: "Adverb of time (maf'ul fih)" };

/** The أَفْعَل pattern (lemma): elatives, colours, and form IV verbs. */
const AF_AL_RE = /^أَ[ء-ي]\u0652[ء-ي]\u064E[ء-ي]$/;

const SILA_NOTE: Label ={ ar: "وَجُمْلَةُ الصِّلَةِ لَا مَحَلَّ لَهَا مِنَ الإِعْرَابِ", en: "the relative clause (sila) has no case position" };

// ---------------------------------------------------------------------------
// Words
// ---------------------------------------------------------------------------

function analyzeWords(inputs: TokenInput[]): Word[] {
  return inputs.map((input, index) => {
    const s = input.surface;
    const closedChecks: [ClosedKind, ClosedClassWord | null][] = [
      ["harf_jarr", isHarfJarr(s) ? { kindAr: "حَرْفُ جَرٍّ", kindEn: "Preposition", builtOn: null } : null],
      ["inna", innaSister(s)],
      ["pronoun", detachedPronoun(s)],
      ["demonstrative", demonstrative(s)],
      ["relative", relativePronoun(s)],
      ["shart", shartWord(s) === "in" ? { kindAr: "حَرْفُ شَرْطٍ جَازِمٌ", kindEn: "Conditional particle (jussive)", builtOn: BUILT_ON.sukun } : shartWord(s) === "man" ? { kindAr: "اسْمُ شَرْطٍ جَازِمٌ", kindEn: "Conditional noun (jussive)", builtOn: BUILT_ON.sukun } : shartWord(s) === "idha" ? { kindAr: "ظَرْفٌ لِمَا يُسْتَقْبَلُ مِنَ الزَّمَانِ مُتَضَمِّنٌ مَعْنَى الشَّرْطِ غَيْرُ جَازِمٍ", kindEn: "Adverb of future time with a conditional meaning (non-jussive)", builtOn: BUILT_ON.sukun } : null],
      ["opener", sentenceOpener(s) ? { kindAr: OPENER_DESCRIPTIONS[sentenceOpener(s)!].ar, kindEn: OPENER_DESCRIPTIONS[sentenceOpener(s)!].en, builtOn: BUILT_ON.sukun } : null],
      ["masdar_an", isMasdarAn(s) ? { kindAr: "حَرْفٌ مَصْدَرِيٌّ وَنَصْبٍ", kindEn: "Masdar particle (subjunctive)", builtOn: BUILT_ON.sukun } : null],
      ["negation", negationParticle(s) ? { kindAr: "حَرْفُ نَفْيٍ", kindEn: "Negation particle", builtOn: BUILT_ON.sukun } : null],
      ["preverbal", preverbalParticle(s) ? { kindAr: "حَرْفٌ", kindEn: "Preverbal particle", builtOn: null } : null],
      ["free_conj", freeConjunction(s) ? { kindAr: freeConjunction(s)!.ar, kindEn: freeConjunction(s)!.en, builtOn: null } : null],
      ["unsupported", isUnsupportedParticle(s) ? { kindAr: "حَرْفٌ", kindEn: "Particle", builtOn: null } : null],
    ];
    for (const [kind, word] of closedChecks) {
      if (word)
        return {
          index,
          surface: s,
          closed: { kind, word, negation: kind === "negation" ? negationParticle(s)! : undefined, relative: kind === "relative" ? (word as RelativePronoun) : undefined, shart: kind === "shart" ? shartWord(s)! : undefined },
          readings: [],
        };
    }
    const seen = new Set<string>();
    const readings: Reading[] = [];
    for (const c of input.candidates) {
      if (!c.diac || !candidateMatchesSurface(c.diac, s)) continue;
      const r = toReading(c);
      if (!r) continue;
      const key = [r.root, r.lemma, r.rawPos, r.aspect, r.voice, r.pgn.person, r.pgn.gender, r.pgn.number, r.conj, r.prep, r.det, r.enclitic?.kind, r.enclitic?.pgn.person, r.enclitic?.pgn.gender, r.enclitic?.pgn.number, r.subjSuffix, JSON.stringify(r.nounSuffix), r.state].join("|");
      if (seen.has(key)) continue;
      seen.add(key);
      readings.push(r);
    }
    // لفظ الجلالة is built rather than taken from CAMeL, whose readings of it often lack the attached preposition.
    const jalala = lafzAlJalala(s);
    if (jalala.length) return { index, surface: s, closed: null, readings: jalala };
    return { index, surface: s, closed: null, readings };
  });
}

/**
 * لفظ الجلالة (اللهُ، لِلَّهِ، بِاللهِ، وَاللهِ…): CAMeL's analyses of it carry a
 * dagger alif/shadda spelling typists rarely use, so it often comes back
 * unmatched. It's a single, fixed, definite proper noun — built here.
 */
function lafzAlJalala(surface: string): Reading[] {
  const bare = stripDiacritics(surface).replace(/[أإآٱ]/g, "ا");
  // لِلَّهِ is لِ + (ا)لله with the article's alif dropped; اللهِ / بِاللهِ / وَاللهِ keep it.
  const withLi = /^([وف])?لله$/.exec(bare);
  const other = withLi ? null : /^([وف])?(ب)?الله$/.exec(bare);
  if (!withLi && !other) return [];
  const conj = (withLi ?? other)![1];
  const prep = withLi ? "ل" : other![2];
  return [
    {
      root: "ا ل ه",
      lemma: "اللّٰه",
      pos: "noun",
      rawPos: "noun_prop",
      proper: true,
      source: "camel",
      hasFeatures: true,
      aspect: null,
      voice: null,
      pgn: { person: null, gender: "m", number: "s" },
      state: "d",
      conj: conj === "و" ? "w" : conj === "ف" ? "f" : null,
      prep: prep === "ب" ? "bi" : prep === "ل" ? "li" : null,
      det: true,
      future: false,
      enclitic: null,
      nounSuffix: null,
      subjSuffix: null,
      morphemes: [],
    },
  ];
}

/** Keep readings that differ in lexeme only once each; >1 distinct lexeme = genuinely ambiguous. */
function distinctLexemes(rs: Reading[]): Reading[][] {
  const groups = new Map<string, Reading[]>();
  for (const r of rs) {
    const key = `${r.root}|${stripDiacritics(r.lemma ?? "")}`;
    groups.set(key, [...(groups.get(key) ?? []), r]);
  }
  return [...groups.values()];
}

/** Fixed ending of a mabni piece (attached pronoun, preposition), read off the ending the learner typed. */
function encliticBuiltOn(typed: string): BuiltOn | null {
  const t = typed.normalize("NFC");
  const last = t[t.length - 1];
  const bare = stripDiacritics(t);
  if (last === "\u064F") return BUILT_ON.damm;
  if (last === "\u0650") return BUILT_ON.kasr;
  if (last === "\u064E") return BUILT_ON.fath;
  if (last === "\u0652") return BUILT_ON.sukun;
  if (/[\u0627\u064A\u0648\u0649]$/.test(bare)) return BUILT_ON.sukun; // ـها، ـنا، ـي، ـهما … end in a long vowel
  return null;
}

const ATTACHED_PRONOUN: Label = { ar: "ضَمِيرٌ مُتَّصِلٌ", en: "Attached pronoun" };

function seg(p: Partial<Seg> & Pick<Seg, "word" | "part" | "surface" | "role">): Seg {
  return {
    roleName: null,
    head: null,
    caseType: "mabni",
    caseSign: null,
    builtOn: null,
    kind: null,
    mahall: null,
    note: null,
    reading: null,
    resolutionNote: null,
    ...p,
  };
}

function addNote(s: Seg, ar: string, en: string): Seg {
  return { ...s, note: s.note ? { ar: `${s.note.ar}، ${ar}`, en: `${s.note.en}; ${en}` } : { ar, en } };
}

// ---------------------------------------------------------------------------
// Parser
// ---------------------------------------------------------------------------

export interface ParseResult {
  segs: Seg[];
  pattern: string;
  errors: string[];
  words: Word[];
}

export function parseSentence(inputs: TokenInput[]): ParseResult {
  const words = analyzeWords(inputs);
  const errors = new Set<string>();
  // Words at or past `limit` are invisible — lets a clause be re-parsed with a shorter reach.
  let limit = Infinity;
  const W = (i: number): Word | undefined => (i < limit ? words[i] : undefined);

  interface NPOpts {
    role: RoleCode;
    roleName?: Label | null;
    head: Ref | null;
    allowPronoun?: boolean;
    allowDemonstrative?: boolean;
    /** The first word carries a conjunction proclitic, emitted as its own HARF segment. */
    conjKind?: Label;
    /** Only for sentence-initial و/ف (استئنافية). */
    leadingConj?: boolean;
    /** Skip the five-noun reading (أَخِي as "my brother"). */
    noFive?: boolean;
    /** Don't take a following adjective as na't (it's the predicate: كُلُّ طَالِبٍ مُجْتَهِدٌ). */
    noNaat?: boolean;
  }

  function nounReadings(w: Word, wantPrep: boolean, withConj: boolean): Reading[] {
    return w.readings.filter(
      (r) => r.pos === "noun" && (r.prep !== null) === wantPrep && (r.conj !== null) === withConj && r.enclitic?.kind !== "dobj"
    );
  }

  function conjSeg(i: number, typed: string, kind: Label, head: Ref | null): Seg {
    return seg({ word: i, part: "conj", surface: typed, role: "HARF", kind, builtOn: BUILT_ON.fath, head });
  }

  /** Synthetic reading for the five nouns, which CAMeL doesn't segment (أَبُوكَ). */
  function fiveNounReading(w: Word): { r: Reading; core: string; encl: string | null; five: CaseT } | null {
    const suffixes = ["هما", "كما", "هم", "هن", "كم", "كن", "نا", "ها", "\u0647", "\u0643"];
    const bare = stripDiacritics(w.surface);
    for (const sfx of ["", ...suffixes]) {
      if (sfx && !bare.endsWith(sfx)) continue;
      const coreBare = sfx ? bare.slice(0, -sfx.length) : bare;
      const f = fiveNoun(coreBare);
      if (!f) continue;
      // Split the typed word at the same letter boundary.
      const groups: string[] = [];
      for (const ch of w.surface) {
        if (/[\u064B-\u0652\u0670]/.test(ch) && groups.length) groups[groups.length - 1] += ch;
        else groups.push(ch);
      }
      const coreLen = [...coreBare].length;
      const r: Reading = {
        root: null,
        lemma: f.lemma,
        pos: "noun",
        rawPos: "noun",
        proper: false,
        source: "camel",
        hasFeatures: false,
        aspect: null,
        voice: null,
        pgn: { person: null, gender: "m", number: "s" },
        state: "c",
        conj: null,
        prep: null,
        det: false,
        future: false,
        enclitic: sfx ? { pgn: { person: null, gender: null, number: null }, kind: "poss", letters: [...sfx].length } : null,
        nounSuffix: null,
        subjSuffix: null,
        morphemes: [],
      };
      return { r, core: groups.slice(0, coreLen).join(""), encl: sfx ? groups.slice(coreLen).join("") : null, five: f.case };
    }
    return null;
  }

  function parseNP(i: number, c: CaseT, o: NPOpts): Fragment | null {
    const w = W(i);
    if (!w) return null;
    const withConj = Boolean(o.conjKind || o.leadingConj);

    // --- relative pronoun + its clause (الَّذِي نَجَحَ): the pronoun fills the slot, mabni, in the slot's position
    if (w.closed?.kind === "relative" && !withConj) {
      const relRef: Ref = { word: i, part: "core" };
      const relSeg = seg({ word: i, part: "core", surface: w.surface, role: o.role, roleName: o.roleName ?? null, head: o.head, builtOn: w.closed.word.builtOn, kind: { ar: w.closed.word.kindAr, en: w.closed.word.kindEn }, mahall: c });
      const sila = parseSila(i + 1, relRef, w.closed.relative!);
      if (!sila) return null;
      return { end: sila.end, segs: [relSeg, ...sila.segs], head: relRef, def: "def" };
    }

    // --- mabni nouns: demonstratives and detached pronouns
    if (w.closed && !withConj) {
      const k = w.closed.kind;
      if ((k === "demonstrative" && o.allowDemonstrative) || (k === "pronoun" && o.allowPronoun)) {
        const headRef: Ref = { word: i, part: "core" };
        const segs: Seg[] = [
          seg({ word: i, part: "core", surface: w.surface, role: o.role, roleName: o.roleName ?? null, head: o.head, builtOn: w.closed.word.builtOn, kind: { ar: w.closed.word.kindAr, en: w.closed.word.kindEn }, mahall: c }),
        ];
        let end = i + 1;
        // Badal / 'atf bayan after a demonstrative: هَذَا الكِتَابُ …
        if (k === "demonstrative") {
          const next = W(end);
          if (next && !next.closed && nounReadings(next, false, false).some((r) => r.det)) {
            const b = parseNP(end, c, { role: "BADAL", roleName: { ar: "بدل (أو عطف بيان)", en: "Apposition (badal / 'atf bayan)" }, head: headRef });
            if (b && b.def === "def") {
              segs.push(...b.segs);
              end = b.end;
            }
          }
        }
        return { end, segs, head: headRef, def: "def" };
      }
      return null;
    }
    if (w.closed) return null;

    // --- ordinary nouns
    type Cand = { r: Reading; core: string; encl: string | null; conj: string | null; ending: EndingInfo };
    const cands: Cand[] = [];
    // أَخِي is either the five-noun genitive (أَخِي زَيْدٍ) or "my brother" — try the five-noun form first, then the rest.
    const five = !withConj && !o.noFive ? fiveNounReading(w) : null;
    if (five) {
      const ending = nounEnding(five.core, { lemma: five.r.lemma, fiveNounCase: five.five });
      if (ending && ending.cases.includes(c)) cands.push({ r: five.r, core: five.core, encl: five.encl, conj: null, ending });
      if (cands.length === 0) return parseNP(i, c, { ...o, noFive: true });
    } else {
      for (const r of nounReadings(w, false, withConj)) {
        // عِنْدَ، قَبْلَ، مَعَ… are only adverbs (or genitive after a preposition).
        if (isFixedAdverb(r.lemma) && o.role !== "MAFUL_FIH" && c !== "jarr") continue;
        const parts = splitTyped(w.surface, r);
        // (CAMeL tags the pronoun on adverb nouns — عِنْدِي، عِنْدَكَ — as "pron", not "poss": same thing here.)
        const mutakallim = !!r.enclitic && r.enclitic.kind !== "dobj" && r.enclitic.pgn.person === 1 && r.enclitic.pgn.number === "s";
        let ending = nounEnding(parts.core, { lemma: r.lemma, number: r.pgn.number, nounSuffix: r.nounSuffix, mutakallim });
        // A diptote (ممنوع من الصرف) takes a fatha for the genitive when it has no ال and isn't mudaf.
        const dip = !r.det && !parts.enclitic && finalMark(parts.core) === "\u064E" ? diptoteReason(r, parts.core) : null;
        if (dip && ending?.kind === "vowel") ending = { kind: "diptote", cases: ["nasb", "jarr"], diptote: dip };
        if (!ending || !ending.cases.includes(c)) continue;
        cands.push({ r, core: parts.core, encl: parts.enclitic, conj: parts.conj, ending });
      }
    }
    const groups = distinctLexemes(cands.map((x) => x.r));
    if (groups.length === 0) return null;
    // Several dictionary words with this spelling (طَالِعَة / طَالِع, قِطَار / قَطْر): when all of them
    // take this slot with the same ending, the i'rab doesn't depend on which one is meant.
    let homographNote: string | null = null;
    if (groups.length > 1) {
      const c0 = cands[0];
      const definite = (x: Cand) => x.r.det || x.r.proper || x.encl !== null;
      const sameIrab = cands.every((x) => x.ending.kind === c0.ending.kind && definite(x) === definite(c0) && (x.encl === null) === (c0.encl === null) && x.core === c0.core);
      if (!sameIrab) {
        errors.add(`"${w.surface}": ambiguous — ${groups.length} different words fit here (${groups.map((g) => g[0].lemma).join("، ")}).`);
        return null;
      }
      homographNote = `Several dictionary words share this spelling (${groups.map((g) => g[0].lemma).join("، ")}); the i'rab is the same for each.`;
    }
    // Same lexeme, several analyses (e.g. with/without a construct reading): take the first.
    // CAMeL lists many common words as names too (جَمِيل، الشَّبَاب): the common reading is taken when there is one.
    const pick = cands.find((x) => groups[0].includes(x.r) && !x.r.proper) ?? cands.find((x) => x.r === groups[0][0])!;
    const r = pick.r;
    const headRef: Ref = { word: i, part: "core" };
    const segs: Seg[] = [];
    if (pick.conj !== null && o.conjKind) segs.push(conjSeg(i, pick.conj, o.conjKind, headRef));
    if (pick.conj !== null && o.leadingConj) segs.push(conjSeg(i, pick.conj, { ar: "حَرْفُ اسْتِئْنَافٍ", en: "Resumptive particle" }, null));

    let core = seg({
      word: i,
      part: "core",
      surface: pick.core,
      role: o.role,
      roleName: o.roleName ?? null,
      head: o.head,
      caseType: c,
      caseSign: caseSignFor(c, pick.ending),
      reading: r,
      resolutionNote: homographNote,
    });

    let end = i + 1;
    let def: Def = r.det || r.proper ? "def" : formDefiniteness(pick.core) === "tanween" || pick.ending.kind === "tens" || pick.ending.kind === "diptote" ? "indef" : null;

    // --- idafa
    let isMudaf = false;
    if (pick.encl !== null && r.enclitic && r.enclitic.kind !== "dobj") {
      core = addNote(core, "وَهُوَ مُضَافٌ", "it is the first term of a construct (mudaf)");
      segs.push(
        seg({ word: i, part: "encl", surface: pick.encl, role: "MUDAF_ILAYH", head: headRef, builtOn: encliticBuiltOn(pick.encl), kind: ATTACHED_PRONOUN, mahall: "jarr" })
      );
      def = "def";
      isMudaf = true;
    } else if (!r.det && formDefiniteness(pick.core) !== "tanween" && (cands.some((x) => x.r.state === "c" || !x.r.hasFeatures) || five)) {
      const child = parseNP(end, "jarr", { role: "MUDAF_ILAYH", head: headRef, allowDemonstrative: true });
      if (child) {
        core = addNote(core, "وَهُوَ مُضَافٌ", "it is the first term of a construct (mudaf)");
        segs.push(...child.segs);
        end = child.end;
        def = child.def ?? null;
        isMudaf = true;
      } else if (five) {
        return parseNP(i, c, { ...o, noFive: true }); // a five-noun form only exists in construct
      }
    }
    // A mudaf diptote takes the kasra again — a typed fatha then isn't a genitive.
    if (isMudaf && pick.ending.kind === "diptote" && c === "jarr") return null;
    segs.push(core);

    // --- tamyiz after an elative (أَكْثَرُ عِلْمًا) or a tens number (عِشْرُونَ طَالِبًا):
    // an indefinite singular accusative noun (not an adjective) right after it.
    // CAMeL tags elatives as adj or noun, so they're recognized by the أَفْعَلُ pattern of the lemma.
    const elative = r.rawPos === "adj_comp" || AF_AL_RE.test((r.lemma ?? "").normalize("NFC"));
    if (!isMudaf && (elative || pick.ending.kind === "tens") && W(end) && !W(end)!.closed) {
      const t = parseNP(end, "nasb", { role: "TAMYIZ", head: headRef });
      const tr = t?.segs.find((s) => s.word === end && s.part === "core")?.reading;
      if (t && t.def === "indef" && tr && tr.rawPos === "noun" && (pick.ending.kind !== "tens" || tr.pgn.number === "s")) {
        segs.push(...t.segs);
        end = t.end;
      }
    }

    // --- na't
    while (def && !o.noNaat) {
      const w2 = W(end);
      if (!w2) break;
      // A relative clause describing a definite noun: جَاءَ الطَّالِبُ الَّذِي نَجَحَ
      if (w2.closed?.kind === "relative" && def === "def") {
        const rel = w2.closed.relative!;
        if (r.pgn.number === "s" && rel.number === "s" && r.pgn.gender && r.pgn.gender !== rel.gender) break;
        const relFrag = parseNP(end, c, { role: "NAAT", head: headRef });
        if (relFrag) {
          segs.push(...relFrag.segs);
          end = relFrag.end;
        }
        break;
      }
      if (w2.closed) break;
      const rs = nounReadings(w2, false, false).filter((x) => !x.proper && (def === "def" ? x.det : !x.det));
      const fits = rs.filter((x) => {
        const e = nounEnding(splitTyped(w2.surface, x).core, { lemma: x.lemma, number: x.pgn.number, nounSuffix: x.nounSuffix });
        return e && e.cases.includes(c);
      });
      const g = distinctLexemes(fits);
      const kinds = new Set(fits.map((x) => nounEnding(splitTyped(w2.surface, x).core, { lemma: x.lemma, number: x.pgn.number, nounSuffix: x.nounSuffix })!.kind));
      if (g.length === 0 || kinds.size > 1) break;
      const x = g[0][0];
      const xCore = splitTyped(w2.surface, x).core;
      const e = nounEnding(xCore, { lemma: x.lemma, number: x.pgn.number, nounSuffix: x.nounSuffix })!;
      segs.push(seg({ word: end, part: "core", surface: xCore, role: "NAAT", head: headRef, caseType: c, caseSign: caseSignFor(c, e), reading: x }));
      end++;
    }

    // --- 'atf (و/ف attached, or ثم/أو)
    for (;;) {
      const w3 = W(end);
      if (!w3) break;
      if (w3.closed?.kind === "free_conj") {
        const m = parseNP(end + 1, c, { role: "MATUF", head: headRef });
        if (!m) break;
        segs.push(seg({ word: end, part: "core", surface: w3.surface, role: "HARF", kind: { ar: w3.closed.word.kindAr, en: w3.closed.word.kindEn }, builtOn: null, head: m.head }));
        segs.push(...m.segs);
        end = m.end;
        continue;
      }
      if (!w3.closed && w3.readings.some((x) => x.conj)) {
        const m = parseNP(end, c, { role: "MATUF", head: headRef, conjKind: { ar: "حَرْفُ عَطْفٍ", en: "Coordinating conjunction" } });
        if (!m) break;
        segs.push(...m.segs);
        end = m.end;
        continue;
      }
      break;
    }
    return { end, segs, head: headRef, def };
  }

  /** Preposition + its object: free (فِي البَيْتِ), attached (بِالقَلَمِ), or with a pronoun (عَلَيْهِ). */
  function parsePP(i: number, head: Ref | null): Fragment | null {
    const w = W(i);
    if (!w) return null;
    if (w.closed?.kind === "harf_jarr") {
      const harfRef: Ref = { word: i, part: "core" };
      const obj = parseNP(i + 1, "jarr", { role: "MAJROOR", head: harfRef, allowDemonstrative: true });
      if (!obj) return null;
      const builtOn = prepositionBuiltOn(w.surface) ?? encliticBuiltOn(w.surface);
      let harf = seg({ word: i, part: "core", surface: w.surface, role: "HARF_JARR", kind: { ar: "حَرْفُ جَرٍّ", en: "Preposition" }, builtOn, head });
      const moved = builtOn === BUILT_ON.sukun ? iltiqaNote(w.surface, W(i + 1)?.surface) : null;
      if (moved) harf = addNote(harf, moved.ar, moved.en);
      return { end: obj.end, segs: [harf, ...obj.segs], head: harfRef };
    }
    if (w.closed) return null;
    // Preposition + attached pronoun
    // (CAMeL also tags adverbs like عِنْدَهُ، أَمَامَكَ as "prep" — they're nouns, handled by parseAdverb.)
    const pronReadings = w.readings.filter((r) => r.rawPos === "prep" && r.enclitic && !adverbKind(r.lemma));
    if (pronReadings.length > 0 && distinctLexemes(pronReadings).length === 1) {
      const r = pronReadings[0];
      const parts = splitTyped(w.surface, r);
      if (parts.enclitic) {
        const harfRef: Ref = { word: i, part: "core" };
        return {
          end: i + 1,
          head: harfRef,
          segs: [
            seg({ word: i, part: "core", surface: parts.core, role: "HARF_JARR", kind: { ar: "حَرْفُ جَرٍّ", en: "Preposition" }, builtOn: encliticBuiltOn(parts.core), head, reading: r }),
            seg({ word: i, part: "encl", surface: parts.enclitic, role: "MAJROOR", head: harfRef, builtOn: encliticBuiltOn(parts.enclitic), kind: ATTACHED_PRONOUN, mahall: "jarr" }),
          ],
        };
      }
    }
    // Attached preposition on a noun: بِ / لِ / كَ
    const attached = w.readings.filter((r) => r.pos === "noun" && r.prep && !r.conj);
    if (attached.length > 0) {
      const r0 = attached[0];
      const typedPrep = splitTyped(w.surface, r0).prep ?? "";
      const harfRef: Ref = { word: i, part: "prep" };
      // Parse the noun itself (its prep-bearing readings) as a genitive NP.
      // لِ + الـ contracts to لِلـ — restore the article's alif for display.
      const rest = w.surface.slice(typedPrep.length);
      const sub: Word = { ...w, readings: attached.map((r) => ({ ...r, prep: null, conj: null })), surface: r0.prep === "li" && r0.det && rest.startsWith("ل") ? "ا" + rest : rest };
      const saved = words[i];
      words[i] = sub;
      const obj = parseNP(i, "jarr", { role: "MAJROOR", head: harfRef, allowDemonstrative: false });
      words[i] = saved;
      if (!obj) return null;
      return {
        end: obj.end,
        head: harfRef,
        segs: [seg({ word: i, part: "prep", surface: typedPrep, role: "HARF_JARR", kind: { ar: "حَرْفُ جَرٍّ", en: "Preposition" }, builtOn: encliticBuiltOn(typedPrep), head }), ...obj.segs],
      };
    }
    return null;
  }

  /**
   * A ظرف (مفعول فيه): أَمَامَ المُعَلِّمِ، عِنْدِي، قَبْلَ الظُّهْرِ — an accusative
   * adverb noun, usually mudaf. Place adverbs (and قبل/بعد) are never objects;
   * time nouns can be (قَضَيْتُ يَوْمًا), so `time` says when they're accepted:
   * "always" (no object reading possible here), "construct" (يَوْمَ الخَمِيسِ), "never".
   */
  function parseAdverb(i: number, head: Ref | null, time: "always" | "construct" | "never"): Fragment | null {
    const w = W(i);
    if (!w || w.closed) return null;
    const ak = w.readings.map((r) => adverbKind(r.lemma)).find(Boolean) ?? null;
    if (!ak || (ak === "time" && time === "never")) return null;
    // CAMeL tags some of these (قَبْلَ، بَعْدَ، أَمَامَ) as adverbs or prepositions — they're nouns in i'rab.
    const saved = words[i];
    // …and they're construct forms unless a pronoun is attached (أَمَامَ المُعَلِّمِ، قَبْلَ الظُّهْرِ).
    words[i] = { ...w, readings: w.readings.map((r) => (adverbKind(r.lemma) && r.pos !== "verb" ? { ...r, pos: "noun", state: r.enclitic ? r.state : "c" } : r)) };
    const f = parseNP(i, "nasb", { role: "MAFUL_FIH", roleName: ak === "place" ? PLACE_ADVERB : TIME_ADVERB, head });
    words[i] = saved;
    const h = f?.segs.find((s) => s.word === i && s.part === "core")?.reading;
    if (!f || !h || adverbKind(h.lemma) !== ak) return null;
    if (ak === "time" && time === "construct" && !f.segs.some((s) => s.role === "MUDAF_ILAYH" && s.head?.word === i)) return null;
    return f;
  }

  /** The seg a fragment's head points at (for notes on a phrase as a whole). */
  function headSegIndex(f: Fragment): number {
    return f.segs.findIndex((s) => s.word === f.head.word && s.part === f.head.part);
  }

  function noteOnHead(f: Fragment, ar: string, en: string): Fragment {
    const k = headSegIndex(f);
    return { ...f, segs: f.segs.map((s, idx) => (idx === k ? addNote(s, ar, en) : s)) };
  }

  function parsePPs(i: number, head: Ref | null): Fragment {
    const segs: Seg[] = [];
    let end = i;
    for (;;) {
      const pp = parsePP(end, head);
      if (!pp) break;
      segs.push(...pp.segs);
      end = pp.end;
    }
    return { end, segs, head: head ?? { word: i, part: "core" } };
  }

  const KANA_NAMES: Record<string, string> = { كان: "كان", اصبح: "أصبح", أصبح: "أصبح", اضحى: "أضحى", أضحى: "أضحى", امسى: "أمسى", أمسى: "أمسى", ظل: "ظلّ", بات: "بات", صار: "صار", ليس: "ليس", زال: "زال", برح: "برح", فتئ: "فتئ", انفك: "انفكّ" };

  interface ClauseOpts {
    governor: Governor;
    head: Ref | null;
    afterNegation: boolean;
    /** Appended to the verb's entry when the clause fills a slot: "والجملة الفعلية في محل رفع خبر …". */
    clauseNote?: Label;
    leadingConj?: boolean;
    /**
     * The subject must be the implied/attached pronoun (a relative clause's
     * or a conditional noun's verb: its subject *is* the returning pronoun).
     */
    noSubjectNoun?: boolean;
    /** That implied subject must agree with this (3rd person). */
    agree?: { gender: "m" | "f"; number: "s" | "p" };
  }

  /** A verb-initial clause (ordinary verb, or kana and its sisters). */
  function parseVerbal(i: number, o: ClauseOpts): Fragment | null {
    const w = W(i);
    if (!w || w.closed) return null;
    const verbs = w.readings.filter(
      (r) =>
        r.pos === "verb" &&
        r.rawPos !== "verb_pseudo" &&
        !r.prep &&
        (o.leadingConj ? r.conj !== null : r.conj === null) &&
        r.enclitic?.kind !== "poss" &&
        // A jussive/subjunctive particle only governs a present verb (أَنْ أَذْهَبَ is never the past أَذْهَبَ).
        (!o.governor || r.aspect === "i")
    );
    const groups = distinctLexemes(verbs);
    if (groups.length !== 1) {
      if (groups.length > 1) errors.add(`"${w.surface}": ambiguous verb — ${groups.map((g) => g[0].lemma).join("، ")}.`);
      return null;
    }
    let variants = groups[0];
    if (o.agree) {
      const { gender, number } = o.agree;
      variants = variants.filter((v) => v.pgn.person === 3 && (v.pgn.gender === null || v.pgn.gender === gender) && v.pgn.number === number);
      if (variants.length === 0) return null;
    }
    const lemma = variants[0].lemma;
    const isKana = kanaSister(lemma, o.afterNegation);
    const verbRef: Ref = { word: i, part: "core" };
    const parts = splitTyped(w.surface, variants[0]);
    const lemmaKey = stripDiacritics(lemma ?? "");
    const kanaName = KANA_NAMES[lemmaKey] ?? lemmaKey;
    const passive = variants.every((v) => v.voice === "p");

    const subjectRole: SubjectRoleName = isKana
      ? { ar: `اسمِ ${kanaName}`, en: `the noun of ${kanaName}` }
      : passive
        ? { ar: "نائبِ فاعلٍ", en: "deputy subject" }
        : { ar: "فاعلٍ", en: "subject" };
    const subjectNameForImplied: SubjectRoleName = isKana ? { ar: `اسمُ ${kanaName}`, en: `the noun of ${kanaName}` } : passive ? { ar: "نائبُ الفاعلِ", en: "deputy subject" } : { ar: "الفاعلُ", en: "subject" };

    const segs: Seg[] = [];
    let end = i + 1;
    // Object pronoun attached to the verb (كَتَبَهُ)
    const withObj = variants.find((v) => v.enclitic?.kind === "dobj");
    if (withObj && parts.enclitic) {
      segs.push(seg({ word: i, part: "encl", surface: parts.enclitic, role: "MAFUL_BIH", head: verbRef, builtOn: encliticBuiltOn(parts.enclitic), kind: ATTACHED_PRONOUN, mahall: "nasb" }));
    }

    // Can a separate subject noun follow? Only when the verb's own suffix doesn't already carry it.
    const canTakeNoun = variants.some((v) => {
      const code = (v.subjSuffix ?? "").toUpperCase();
      return (v.aspect === "p" && (code === "3MS" || code === "3FS")) || (v.aspect === "i" && v.pgn.person === 3 && v.pgn.number === "s");
    });
    const subjRoleCode: RoleCode = isKana ? "ISM_KANA" : passive ? "NAIB_FAAIL" : "FAAIL";
    const subjLabel = isKana ? { ar: `اسم ${kanaName}`, en: `Noun of ${kanaName}` } : null;

    const subjectAllowed = canTakeNoun && !o.noSubjectNoun;
    let subject: Fragment | null = null;
    let object: Fragment | null = null;
    if (subjectAllowed) subject = parseNP(end, "rafa", { role: subjRoleCode, roleName: subjLabel, head: verbRef, allowDemonstrative: isKana });
    if (subject) end = subject.end;
    const verbRoot = variants[0].root;
    const masdars = derivedMasdars(lemma);
    const intransitive = !passive && isIntransitive(lemma);
    const twoObjects = !passive && takesTwoObjects(lemma);

    /**
     * What an accusative noun after the verb (or after its object) is: object,
     * maf'ul mutlaq, hal — "ambiguous" when the form can't decide (reported),
     * "unknown" when it's certainly not an object but its role isn't one of ours.
     */
    const classifyAccusative = (frag: Fragment, objectTaken: boolean): "object" | "mutlaq" | "hal" | "ambiguous" | "unknown" => {
      const h = frag.segs.find((s) => s.word === frag.head.word && s.part === "core")?.reading;
      if (!h) return "object";
      if (verbRoot && h.root === verbRoot && h.pos === "noun") {
        if (masdars.includes(bareLemma(h.lemma))) return "mutlaq";
        if (objectTaken) return "mutlaq";
        // A derived verb's masdar is regular, so any other same-root noun is an object (أَرْسَلْتُ رِسَالَةً).
        if (masdars.length > 0 || frag.def === "def") return "object";
        return intransitive ? "mutlaq" : "ambiguous";
      }
      // An indefinite adjective after a complete clause describes the state of the doer/object (حال);
      // after an intransitive verb, so does an indefinite descriptive noun (جَلَسَ الرَّجُلُ حَزِينًا).
      const hw = W(frag.head.word)!;
      const nounish = hw.readings.filter((x) => x.pos === "noun" && !x.prep && !x.conj);
      if (frag.def === "indef" && nounish.length > 0 && (nounish.every((x) => x.rawPos === "adj") || (intransitive && !objectTaken))) return "hal";
      return intransitive && !objectTaken ? "unknown" : "object";
    };
    const relabel = (frag: Fragment, role: RoleCode, roleName: Label | null = null): Fragment => ({
      ...frag,
      segs: frag.segs.map((s) => (s.word === frag.head.word && s.part === frag.head.part ? { ...s, role, roleName: roleName ?? s.roleName } : s)),
    });
    /** Time nouns are adverbs after an intransitive verb, or in construct (يَوْمَ الخَمِيسِ); otherwise they could be objects. */
    const timeMode = intransitive ? "always" : "construct";
    const extras: Seg[] = [];

    let khabar: Fragment | null = null;
    if (isKana) {
      const kLabel = { ar: `خبر ${kanaName}`, en: `Predicate of ${kanaName}` };
      khabar = parseNP(end, "nasb", { role: "KHABAR_KANA", roleName: kLabel, head: verbRef });
      if (!khabar) {
        const pp = parsePP(end, verbRef) ?? parseAdverb(end, verbRef, "always");
        if (pp) khabar = noteOnHead(pp, `وَشِبْهُ الجُمْلَةِ فِي مَحَلِّ نَصْبِ خَبَرِ ${kanaName}`, `the phrase stands in the position of ${kanaName}'s predicate (accusative)`);
      }
      // A verbal predicate: كَانَ الوَلَدُ يَلْعَبُ
      if (!khabar && (subject || !canTakeNoun)) {
        khabar = parseVerbal(end, {
          governor: null,
          head: verbRef,
          afterNegation: false,
          clauseNote: { ar: `وَالجُمْلَةُ الفِعْلِيَّةُ فِي مَحَلِّ نَصْبِ خَبَرِ ${kanaName}`, en: `the verbal clause stands in the position of ${kanaName}'s predicate (accusative)` },
        });
      }
      if (!khabar) return null; // kana's family needs a predicate
      end = khabar.end;
    } else if (!passive && !withObj) {
      const adv = parseAdverb(end, verbRef, timeMode);
      const timeWord = !adv && W(end)?.readings.some((r) => adverbKind(r.lemma) === "time");
      const acc = adv || timeWord ? null : parseNP(end, "nasb", { role: "MAFUL_BIH", head: verbRef });
      const kind = acc ? classifyAccusative(acc, false) : null;
      if (adv) {
        extras.push(...adv.segs);
        end = adv.end;
      } else if (timeWord && parseNP(end, "nasb", { role: "MAFUL_FIH", head: verbRef })) {
        errors.add(`"${W(end)!.surface}": a time noun here could be an adverb (ظرف زمان) or the object — not decidable from the form.`);
      } else if (acc && kind === "object") {
        object = acc;
        end = acc.end;
      } else if (acc && kind === "mutlaq") {
        extras.push(...relabel(acc, "MAFUL_MUTLAQ").segs);
        end = acc.end;
      } else if (acc && kind === "ambiguous") {
        errors.add(`"${W(acc.head.word)!.surface}": shares its root with the verb — it could be the object or a maf'ul mutlaq, which the form alone can't decide.`);
      } else if (acc && kind === "unknown") {
        errors.add(`"${W(acc.head.word)!.surface}": the verb is intransitive, so this accusative isn't an object — its role isn't one the parser can determine.`);
      }
      // قَالَ + a quoted sentence (مقول القول), which stands in the object's position.
      if (!acc && !adv && lexKey(lemma) === "قال") {
        const quoted = innaClause(end) ?? nominal(end, false);
        if (quoted && quoted.segs.some((s) => s.role === "KHABAR_INNA" || s.role === "KHABAR")) {
          const first = quoted.segs.findIndex((s) => s.word === end);
          extras.push(...quoted.segs.map((s, k) => (k === first ? addNote({ ...s, head: verbRef }, "وَالجُمْلَةُ فِي مَحَلِّ نَصْبٍ مَقُولُ القَوْلِ", "the sentence stands in the position of the object (what was said)") : s)));
          end = quoted.end;
        }
      }
      // hal is picked up by the trailing loop below (it may also follow the subject or a prepositional phrase).
      // أَنْ + verb as the object (أُرِيدُ أَنْ أَذْهَبَ). With a 3rd-person verb and no subject noun, the
      // masdar could equally be the subject (يَجِبُ أَنْ…) — only taken when the subject is already accounted for.
      if (!acc && W(end)?.closed?.kind === "masdar_an") {
        if (subject || !canTakeNoun) {
          const an = anClause(end, verbRef, "نَصْبِ مَفْعُولٍ بِهِ", "the object (accusative)");
          if (an) {
            extras.push(...an.segs);
            end = an.end;
          }
        } else {
          errors.add(`"${W(end)!.surface}": the أَنْ-clause could be the subject or the object of the verb — not decidable without knowing the verb's transitivity.`);
        }
      }
      // Verb + object + subject order (كَتَبَ الدَّرْسَ الطَّالِبُ)
      if (!subject && object && subjectAllowed) {
        subject = parseNP(end, "rafa", { role: subjRoleCode, head: verbRef });
        if (subject) end = subject.end;
      }
    } else if (withObj && !subject && subjectAllowed) {
      subject = parseNP(end, "rafa", { role: subjRoleCode, head: verbRef });
      if (subject) end = subject.end;
    }

    // 2ms vs 3fs present (تَكْتُبُ): an explicit subject means 3rd person.
    let chosen = variants;
    if (variants.length > 1 && subject) chosen = variants.filter((v) => v.pgn.person === 3);
    const persons = new Set(chosen.map((v) => `${v.pgn.person}${v.pgn.gender}${v.pgn.number}`));
    const reading = chosen[0];
    const ambiguousTaqdir = persons.size > 1 ? "أَنْتَ أَوْ هِيَ" : null;

    const va = analyzeVerb(reading, {
      surface: parts.core,
      governor: o.governor,
      subjectRole,
      impliedRole: subjectNameForImplied,
      explicitSubject: Boolean(subject),
      naqis: isKana,
      ambiguousTaqdir,
      beforeWasl: !parts.enclitic && startsWithHamzatWasl(W(i + 1)?.surface),
    });
    if (!va.ok) {
      errors.add(`"${w.surface}": ${va.error}.`);
      return null;
    }
    // Attached/implied subject pronoun notes are phrased "…في محل رفع فاعل" — fix the role wording.
    const v = va.value;
    let verbSeg = seg({
      word: i,
      part: "core",
      surface: parts.core,
      role: isKana ? "KANA" : "FIL",
      roleName: isKana ? { ar: `فعل ناسخ (${kanaName})`, en: `Verb of kana's family (${kanaName})` } : null,
      head: o.head,
      caseType: v.moodSign ? v.moodSign.caseType : "mabni",
      caseSign: v.moodSign,
      builtOn: v.builtOn,
      kind: { ar: v.kindAr, en: v.kindEn },
      reading,
      note: v.noteAr ? { ar: v.noteAr, en: v.noteEn ?? "" } : null,
      resolutionNote: reading.pos === "verb" && w.readings.some((x) => x.pos !== "verb") ? "Resolved as a verb from its position — this spelling is also a valid noun." : null,
    });
    if (reading.future) verbSeg = addNote(verbSeg, "وَالسِّينُ حَرْفُ اسْتِقْبَالٍ مَبْنِيٌّ عَلَى الفَتْحِ", "the prefixed sa- is a future particle (indeclinable on the fatha)");
    if (o.clauseNote) verbSeg = addNote(verbSeg, o.clauseNote.ar, o.clauseNote.en);
    if (parts.conj && o.leadingConj) segs.push(conjSeg(i, parts.conj, { ar: "حَرْفُ اسْتِئْنَافٍ", en: "Resumptive particle" }, null));
    segs.push(verbSeg);
    if (subject) segs.push(...subject.segs);
    if (object) segs.push(...object.segs);
    if (khabar) segs.push(...khabar.segs);
    segs.push(...extras);

    // Trailing complements, in any order: prepositional phrases, adverbs, a second object, maf'ul mutlaq, hal.
    let objects = object || withObj ? 1 : 0;
    for (;;) {
      const pp = parsePP(end, verbRef) ?? parseAdverb(end, verbRef, timeMode);
      if (pp) {
        segs.push(...pp.segs);
        end = pp.end;
        continue;
      }
      const w2 = W(end);
      if (isKana || !w2 || w2.closed) break;
      const acc = parseNP(end, "nasb", { role: "HAL", head: verbRef });
      if (!acc) break;
      const kind = classifyAccusative(acc, objects > 0);
      if (kind === "mutlaq") segs.push(...relabel(acc, "MAFUL_MUTLAQ").segs);
      else if (twoObjects && objects === 1 && kind !== "ambiguous") {
        // ظَنَنْتُ الطَّالِبَ مُجْتَهِدًا / أَعْطَيْتُ الفَقِيرَ دِرْهَمًا
        const firstObj = segs.findIndex((s) => s.role === "MAFUL_BIH" && s.head?.word === i && s.word !== i);
        if (firstObj >= 0) segs[firstObj] = { ...segs[firstObj], roleName: { ar: "مفعول به أول", en: "First object" } };
        segs.push(...relabel(acc, "MAFUL_BIH", { ar: "مفعول به ثانٍ", en: "Second object" }).segs);
        objects++;
      } else if (kind === "hal") segs.push(...acc.segs);
      else break;
      end = acc.end;
    }
    return { end, segs, head: verbRef };
  }

  /** The relative clause (صلة الموصول) after الذي/التي/الذين…: a verbal clause whose subject is the returning pronoun, or a prepositional phrase. */
  function parseSila(i: number, relRef: Ref, rel: RelativePronoun): Fragment | null {
    const v = parseVerbal(i, { governor: null, head: relRef, afterNegation: false, noSubjectNoun: true, agree: { gender: rel.gender, number: rel.number }, clauseNote: SILA_NOTE });
    if (v) return v;
    const pp = parsePP(i, relRef);
    if (pp) {
      pp.segs[0] = addNote(pp.segs[0], "وَالجَارُّ وَالمَجْرُورُ مُتَعَلِّقَانِ بِمَحْذُوفٍ صِلَةُ المَوْصُولِ لَا مَحَلَّ لَهَا مِنَ الإِعْرَابِ", "the prepositional phrase attaches to an omitted word forming the relative clause (no case position)");
      return pp;
    }
    return null;
  }

  /** أَنْ + subjunctive verb: the particle, and a masdar mu'awwal standing in a case position. */
  function anClause(i: number, head: Ref, positionAr: string, positionEn: string): Fragment | null {
    const w = W(i);
    if (w?.closed?.kind !== "masdar_an") return null;
    const anRef: Ref = { word: i, part: "core" };
    const verb = parseVerbal(i + 1, { governor: "nasb", head: anRef, afterNegation: false });
    if (!verb) return null;
    const particle = seg({
      word: i,
      part: "core",
      surface: w.surface,
      role: "HARF",
      kind: { ar: w.closed.word.kindAr, en: w.closed.word.kindEn },
      builtOn: BUILT_ON.sukun,
      head,
      note: { ar: `وَالمَصْدَرُ المُؤَوَّلُ مِنْ أَنْ وَالفِعْلِ فِي مَحَلِّ ${positionAr}`, en: `an + the verb form an implied masdar in the position of ${positionEn}` },
    });
    return { end: verb.end, segs: [particle, ...verb.segs], head: anRef };
  }

  /** Predicate of a nominal-type clause: noun, prepositional phrase, or verbal clause. */
  function parsePredicate(i: number, c: CaseT, role: RoleCode, roleName: Label | null, head: Ref, allowDefinite: boolean, positionAr: string, positionEn: string): Fragment | null {
    const np = parseNP(i, c, { role, roleName, head });
    if (np && (allowDefinite || np.def !== "def" || !W(i)?.readings.some((r) => r.det))) return np;
    const pp = parsePP(i, head);
    if (pp) {
      pp.segs[0] = addNote(pp.segs[0], `وَالجَارُّ وَالمَجْرُورُ مُتَعَلِّقَانِ بِمَحْذُوفٍ فِي مَحَلِّ ${positionAr}`, `the prepositional phrase attaches to an omitted word in the position of ${positionEn}`);
      return pp;
    }
    // An adverb phrase as the predicate: الكِتَابُ فَوْقَ المَكْتَبِ
    const adv = parseAdverb(i, head, "always");
    if (adv) return noteOnHead(adv, `وَشِبْهُ الجُمْلَةِ مُتَعَلِّقٌ بِمَحْذُوفٍ فِي مَحَلِّ ${positionAr}`, `the adverb phrase attaches to an omitted word in the position of ${positionEn}`);
    if (c === "rafa") {
      const clause = parseVerbal(i, { governor: null, head, afterNegation: false, clauseNote: { ar: `وَالجُمْلَةُ الفِعْلِيَّةُ فِي مَحَلِّ ${positionAr}`, en: `the verbal clause stands in the position of ${positionEn}` } });
      if (clause) return clause;
    }
    return null;
  }

  // ---- sentence patterns ----------------------------------------------------

  function nominal(i: number, leadingConj: boolean): Fragment | null {
    let m = parseNP(i, "rafa", { role: "MUBTADA", head: null, allowPronoun: true, allowDemonstrative: true, leadingConj });
    // A mubtada' is definite, or an indefinite made specific by idafa (كُلُّ طَالِبٍ).
    if (!m) return null;
    const headWord = m.head.word;
    const specific = m.segs.some((s) => s.role === "MUDAF_ILAYH" && s.head?.word === headWord);
    if (m.def !== "def" && !specific) return null;
    const pronounMubtada = W(i)?.closed?.kind === "pronoun";
    const predicateAfter = (mb: Fragment) => parsePredicate(mb.end, "rafa", "KHABAR", null, mb.head, pronounMubtada, "رَفْعِ خَبَرِ المُبْتَدَأِ", "the predicate (nominative)");
    let k = predicateAfter(m);
    // No predicate left because a na't took it: the adjective is the predicate instead.
    if (!k && m.segs.some((s) => s.role === "NAAT")) {
      const m2 = parseNP(i, "rafa", { role: "MUBTADA", head: null, allowPronoun: true, allowDemonstrative: true, leadingConj, noNaat: true });
      const k2 = m2 ? predicateAfter(m2) : null;
      if (m2 && k2) {
        m = m2;
        k = k2;
      }
    }
    if (!k) return { ...m }; // mubtada' without an identifiable khabar: partial
    const pps = parsePPs(k.end, k.head);
    return { end: pps.end, segs: [...m.segs, ...k.segs, ...pps.segs], head: m.head };
  }

  /** في الدَّارِ رَجُلٌ / عِنْدِي سَيَّارَةٌ — fronted prepositional or adverb khabar, delayed indefinite mubtada'. */
  function frontedKhabar(i: number): Fragment | null {
    const pp = parsePP(i, null);
    const fk = pp ?? parseAdverb(i, null, "always");
    if (!fk) return null;
    const m = parseNP(fk.end, "rafa", { role: "MUBTADA", roleName: { ar: "مبتدأ مؤخر", en: "Delayed subject (mubtada' mu'akhkhar)" }, head: null });
    if (!m || m.def !== "indef") return null;
    const [ar, en] = pp
      ? ["وَالجَارُّ وَالمَجْرُورُ مُتَعَلِّقَانِ بِمَحْذُوفٍ خَبَرٌ مُقَدَّمٌ", "the prepositional phrase attaches to an omitted fronted predicate (khabar muqaddam)"]
      : ["وَشِبْهُ الجُمْلَةِ مُتَعَلِّقٌ بِمَحْذُوفٍ خَبَرٌ مُقَدَّمٌ", "the adverb phrase attaches to an omitted fronted predicate (khabar muqaddam)"];
    const k = headSegIndex(fk);
    const segs = fk.segs.map((s, idx) => (idx === k ? addNote({ ...s, head: m.head }, ar, en) : s));
    return { end: m.end, segs: [...segs, ...m.segs], head: m.head };
  }

  function innaClause(i: number): Fragment | null {
    const w = W(i);
    if (!w) return null;
    let particleSeg: Seg | null = null;
    let ismPron: Seg | null = null;
    const particleRef: Ref = { word: i, part: "core" };
    let sisterName = "إنّ";
    if (w.closed?.kind === "inna") {
      particleSeg = seg({ word: i, part: "core", surface: w.surface, role: "INNA", kind: { ar: w.closed.word.kindAr, en: w.closed.word.kindEn }, builtOn: BUILT_ON.fath });
      sisterName = sisterDisplay(w.surface);
    } else if (!w.closed) {
      // إِنَّهُ / لَعَلَّكَ: CAMeL's pseudo-verb + attached pronoun.
      const pv = w.readings.filter((r) => r.rawPos === "verb_pseudo" && r.enclitic);
      if (pv.length === 0) return null;
      const parts = splitTyped(w.surface, pv[0]);
      const sister = innaSister(parts.core);
      if (!sister || !parts.enclitic) return null;
      sisterName = sisterDisplay(parts.core);
      particleSeg = seg({ word: i, part: "core", surface: parts.core, role: "INNA", kind: { ar: sister.kindAr, en: sister.kindEn }, builtOn: BUILT_ON.fath });
      ismPron = seg({ word: i, part: "encl", surface: parts.enclitic, role: "ISM_INNA", roleName: { ar: `اسم ${sisterName}`, en: `Noun of ${sisterName}` }, head: particleRef, builtOn: encliticBuiltOn(parts.enclitic), kind: ATTACHED_PRONOUN, mahall: "nasb" });
    } else return null;

    const segs: Seg[] = [particleSeg];
    let end = i + 1;
    if (ismPron) segs.push(ismPron);
    else {
      const ism = parseNP(end, "nasb", { role: "ISM_INNA", roleName: { ar: `اسم ${sisterName}`, en: `Noun of ${sisterName}` }, head: particleRef, allowDemonstrative: true });
      if (!ism) {
        // Fronted khabar, delayed ism: إِنَّ فِي البَيْتِ رَجُلًا
        const fk = parsePP(end, particleRef) ?? parseAdverb(end, particleRef, "always");
        const late = fk ? parseNP(fk.end, "nasb", { role: "ISM_INNA", roleName: { ar: `اسم ${sisterName} مؤخر`, en: `Delayed noun of ${sisterName}` }, head: particleRef }) : null;
        if (fk && late) {
          const noted = noteOnHead(fk, `وَشِبْهُ الجُمْلَةِ مُتَعَلِّقٌ بِمَحْذُوفٍ فِي مَحَلِّ رَفْعِ خَبَرِ ${sisterName} مُقَدَّمٌ`, `the phrase attaches to an omitted fronted predicate of ${sisterName}`);
          return { end: late.end, segs: [particleSeg, ...noted.segs, ...late.segs], head: particleRef };
        }
        return { end, segs, head: particleRef };
      }
      segs.push(...ism.segs);
      end = ism.end;
    }
    const k = parsePredicate(end, "rafa", "KHABAR_INNA", { ar: `خبر ${sisterName}`, en: `Predicate of ${sisterName}` }, particleRef, Boolean(ismPron), `رَفْعِ خَبَرِ ${sisterName}`, `the predicate of ${sisterName} (nominative)`);
    if (k) {
      segs.push(...k.segs);
      end = k.end;
      const pps = parsePPs(end, k.head);
      segs.push(...pps.segs);
      end = pps.end;
    }
    return { end, segs, head: particleRef };
  }

  function negated(i: number): Fragment | null {
    const w = W(i);
    if (!w || w.closed?.kind !== "negation") return null;
    const neg = w.closed.negation!;
    const particleRef: Ref = { word: i, part: "core" };
    const particle = (d: { ar: string; en: string }) => seg({ word: i, part: "core", surface: w.surface, role: "HARF", kind: d, builtOn: BUILT_ON.sukun });

    if (neg === "lam" || neg === "lan") {
      const clause = parseVerbal(i + 1, { governor: neg === "lam" ? "jazm" : "nasb", head: null, afterNegation: true });
      if (!clause) return null;
      return { end: clause.end, segs: [particle(NEGATION_DESCRIPTIONS[neg]), ...clause.segs.map((s) => (s.word === i + 1 && s.part === "core" ? s : s))], head: clause.head };
    }
    if (neg === "la") {
      // لا + present verb: prohibition (jussive) or plain negation.
      const nahiya = parseVerbal(i + 1, { governor: "jazm", head: null, afterNegation: true });
      if (nahiya) return { end: nahiya.end, segs: [particle(NEGATION_DESCRIPTIONS.la_nahiya), ...nahiya.segs], head: nahiya.head };
      const nafiya = parseVerbal(i + 1, { governor: null, head: null, afterNegation: true });
      if (nafiya && W(i + 1)?.readings.some((r) => r.aspect === "i")) return { end: nafiya.end, segs: [particle(NEGATION_DESCRIPTIONS.la_nafiya), ...nafiya.segs], head: nafiya.head };
      // لا النافية للجنس: لا رَجُلَ فِي الدَّارِ
      const laJins = laNafiyaLilJins(i);
      if (laJins) return laJins;
      return null;
    }
    // ما
    const past = parseVerbal(i + 1, { governor: null, head: null, afterNegation: true });
    if (past && W(i + 1)?.readings.some((r) => r.aspect === "p")) {
      // مَا أَجْمَلَ السَّمَاءَ: ما + أَفْعَلَ + an accusative, with no subject noun, reads as an
      // exclamation (ما التعجبية) as easily as a negation — the form can't decide.
      const v = past.segs.find((s) => s.word === i + 1 && s.part === "core");
      const exclamation = AF_AL_RE.test((v?.reading?.lemma ?? "").normalize("NFC")) && !past.segs.some((s) => s.role === "FAAIL") && past.segs.some((s) => s.role === "MAFUL_BIH");
      if (exclamation) {
        errors.add(`"${w.surface} ${W(i + 1)!.surface}": could be an exclamation (مَا التَّعَجُّبِيَّةُ, "how … !") or a negation — the form alone can't decide.`);
        return null;
      }
      return { end: past.end, segs: [particle(NEGATION_DESCRIPTIONS.ma_nafiya), ...past.segs], head: past.head };
    }
    // ما + nominal: khabar marfu' → ما مهملة; khabar mansub → ما الحجازية
    const m = parseNP(i + 1, "rafa", { role: "MUBTADA", head: null, allowPronoun: true, allowDemonstrative: true });
    if (!m) return null;
    const kR = parsePredicate(m.end, "rafa", "KHABAR", null, m.head, false, "رَفْعِ خَبَرِ المُبْتَدَأِ", "the predicate (nominative)");
    if (kR) return { end: kR.end, segs: [particle(NEGATION_DESCRIPTIONS.ma_nafiya), ...m.segs, ...kR.segs], head: m.head };
    const kN = parseNP(m.end, "nasb", { role: "KHABAR_KANA", roleName: { ar: "خبر ما", en: "Predicate of ma" }, head: particleRef });
    if (!kN) return null;
    const ismSegs = m.segs.map((s) => (s.word === m.head.word && s.part === m.head.part ? { ...s, role: "ISM_KANA" as RoleCode, roleName: { ar: "اسم ما", en: "Noun of ma" }, head: particleRef } : s));
    return { end: kN.end, segs: [particle(NEGATION_DESCRIPTIONS.ma_hijaziyya), ...ismSegs, ...kN.segs], head: particleRef };
  }

  /** قَدْ / سَوْفَ + verb (no effect on the verb's mood). */
  function preverbal(i: number): Fragment | null {
    const w = W(i);
    if (!w || w.closed?.kind !== "preverbal") return null;
    const clause = parseVerbal(i + 1, { governor: null, head: null, afterNegation: false });
    if (!clause) return null;
    const verb = clause.segs.find((s) => s.word === i + 1 && s.part === "core")?.reading;
    const kind = preverbalParticle(w.surface) === "sawfa" ? "sawfa" : verb?.aspect === "p" ? "qad_past" : "qad_present";
    if (kind === "sawfa" && verb?.aspect !== "i") return null;
    const d = PREVERBAL_DESCRIPTIONS[kind];
    let particle = seg({ word: i, part: "core", surface: w.surface, role: "HARF", kind: { ar: d.ar, en: d.en }, builtOn: d.builtOn });
    const moved = d.builtOn === BUILT_ON.sukun ? iltiqaNote(w.surface, W(i + 1)?.surface) : null; // قَدِ اجْتَهَدَ
    if (moved) particle = addNote(particle, moved.ar, moved.en);
    return { end: clause.end, segs: [particle, ...clause.segs], head: clause.head };
  }

  function laNafiyaLilJins(i: number): Fragment | null {
    const w = W(i + 1);
    if (!w || w.closed) return null;
    const particleRef: Ref = { word: i, part: "core" };
    const rs = nounReadings(w, false, false).filter((r) => !r.det && !r.proper);
    const groups = distinctLexemes(rs);
    if (groups.length !== 1) return null;
    const r = groups[0][0];
    const core = splitTyped(w.surface, r).core;
    const mark = core.normalize("NFC").slice(-1);
    if (mark !== "\u064E") return null; // single noun: fatha, no tanween
    const segs: Seg[] = [seg({ word: i, part: "core", surface: W(i)!.surface, role: "HARF", kind: NEGATION_DESCRIPTIONS.la_jins, builtOn: BUILT_ON.sukun })];
    const ismRef: Ref = { word: i + 1, part: "core" };
    let end = i + 2;
    const mudafIlayh = parseNP(end, "jarr", { role: "MUDAF_ILAYH", head: ismRef });
    if (mudafIlayh) {
      // مضاف: mu'rab, mansub with the fatha
      segs.push(addNote(seg({ word: i + 1, part: "core", surface: core, role: "ISM_LA", head: particleRef, caseType: "nasb", caseSign: CASE_SIGNS.nasb, reading: r }), "وَهُوَ مُضَافٌ", "it is the first term of a construct"));
      segs.push(...mudafIlayh.segs);
      end = mudafIlayh.end;
    } else {
      segs.push(seg({ word: i + 1, part: "core", surface: core, role: "ISM_LA", head: particleRef, builtOn: BUILT_ON.fath, mahall: "nasb", kind: { ar: "اسْمٌ", en: "Noun" }, reading: r }));
    }
    const k = parsePredicate(end, "rafa", "KHABAR_LA", null, particleRef, false, "رَفْعِ خَبَرِ لَا", "the predicate of la (nominative)");
    if (k) {
      segs.push(...k.segs);
      end = k.end;
    }
    return { end, segs, head: particleRef };
  }

  /**
   * إِنْ / مَنْ + فعل الشرط + جواب الشرط. A present verb in either slot is
   * jussive; a past verb is mabni "in the position of jazm". The answer may
   * also be a nominal sentence joined by فَـ (إِنْ تَجْتَهِدْ فَالنَّجَاحُ قَرِيبٌ).
   */
  function conditional(i: number): Fragment | null {
    const w = W(i);
    if (w?.closed?.kind !== "shart") return null;
    const ref: Ref = { word: i, part: "core" };
    const isMan = w.closed.shart === "man";
    // إِذَا: an adverb of future time with conditional meaning, which doesn't make its verbs jussive.
    const isIdha = w.closed.shart === "idha";
    const kind = { ar: w.closed.word.kindAr, en: w.closed.word.kindEn };
    let head = isMan
      ? seg({ word: i, part: "core", surface: w.surface, role: "MUBTADA", kind, builtOn: BUILT_ON.sukun, mahall: "rafa" })
      : isIdha
        ? seg({ word: i, part: "core", surface: w.surface, role: "MAFUL_FIH", roleName: TIME_ADVERB, kind, builtOn: BUILT_ON.sukun, mahall: "nasb" })
        : seg({ word: i, part: "core", surface: w.surface, role: "HARF", kind, builtOn: BUILT_ON.sukun });
    const moved = iltiqaNote(w.surface, W(i + 1)?.surface);
    if (moved) head = addNote(head, moved.ar, moved.en);

    const slotVerb = (j: number, which: "shart" | "jawab"): Fragment | null => {
      const label = which === "shart" ? { ar: "فِعْلُ الشَّرْطِ", en: "the verb of the condition" } : { ar: "جَوَابُ الشَّرْطِ", en: "the answer of the condition" };
      // مَنْ is the subject of its own verb: that verb's subject is the implied pronoun referring to it.
      const own = isMan && which === "shart" ? { noSubjectNoun: true, agree: { gender: "m" as const, number: "s" as const } } : {};
      const verbSegOf = (f: Fragment) => f.segs.find((s) => s.word === j && s.part === "core")!;
      if (isIdha) {
        const clause = parseVerbal(j, { governor: null, head: ref, afterNegation: false });
        if (!clause) return null;
        const note =
          which === "shart"
            ? { ar: "وَجُمْلَةُ فِعْلِ الشَّرْطِ فِي مَحَلِّ جَرٍّ بِالإِضَافَةِ", en: "the condition clause is in the genitive position, as mudaf ilayh of idha" }
            : { ar: "وَجُمْلَةُ جَوَابِ الشَّرْطِ لَا مَحَلَّ لَهَا مِنَ الإِعْرَابِ", en: "the answer clause has no case position" };
        return { ...clause, segs: clause.segs.map((s) => (s === verbSegOf(clause) ? addNote(s, note.ar, note.en) : s)) };
      }
      const present = parseVerbal(j, { governor: "jazm", head: ref, afterNegation: false, ...own });
      if (present && verbSegOf(present).reading?.aspect === "i") {
        return { ...present, segs: present.segs.map((s) => (s === verbSegOf(present) ? addNote(s, `وَهُوَ ${label.ar}`, `it is ${label.en}`) : s)) };
      }
      const past = parseVerbal(j, { governor: null, head: ref, afterNegation: false, ...own });
      if (past && verbSegOf(past).reading?.aspect === "p") {
        return { ...past, segs: past.segs.map((s) => (s === verbSegOf(past) ? addNote(s, `وَهُوَ فِي مَحَلِّ جَزْمٍ ${label.ar}`, `it is in the position of jazm as ${label.en}`) : s)) };
      }
      return null;
    };

    const jawabAt = (j: number): Fragment | null => {
      const v = slotVerb(j, "jawab");
      if (v || !W(j)?.readings.some((r) => r.conj === "f")) return v;
      const nom = nominal(j, true);
      if (!nom || !nom.segs.some((s) => s.role === "KHABAR")) return null;
      return {
        ...nom,
        segs: nom.segs.map((s) =>
          s.word === j && s.part === "conj"
            ? { ...s, head: ref, kind: { ar: "الفَاءُ رَابِطَةٌ لِجَوَابِ الشَّرْطِ", en: "Fa' linking the answer of the condition" }, note: { ar: "وَالجُمْلَةُ الاسْمِيَّةُ بَعْدَهَا فِي مَحَلِّ جَزْمٍ جَوَابُ الشَّرْطِ", en: "the nominal sentence after it is in the position of jazm as the answer of the condition" } }
            : s
        ),
      };
    };

    let shart = slotVerb(i + 1, "shart");
    if (!shart) return null;
    let jawab = jawabAt(shart.end);
    // The condition's verb may have swallowed the answer as its object (مَنْ صَبَرَ ظَفِرَ: ظَفِر is also a noun) —
    // retry with the condition clause cut shorter, and keep the first split whose answer parses.
    for (let cut = shart.end - 1; !jawab && cut > i + 1; cut--) {
      const saved = limit;
      limit = cut;
      const s2 = slotVerb(i + 1, "shart");
      limit = saved;
      const j2 = s2 && s2.end === cut ? jawabAt(cut) : null;
      if (s2 && j2) {
        shart = s2;
        jawab = j2;
      }
    }
    if (!jawab) return { end: shart.end, segs: [head, ...shart.segs], head: ref };
    return { end: jawab.end, segs: [head, ...shart.segs, ...jawab.segs], head: ref };
  }

  // ---- try every pattern; keep the one that explains the most words --------
  function sentenceAt(start: number): { name: string; frag: Fragment } | null {
    const first = W(start);
    if (!first) return null;
    const leadingConj = !first.closed && first.readings.length > 0 && first.readings.every((r) => r.conj !== null);
    const candidates: { name: string; frag: Fragment | null }[] = [
      { name: "negated", frag: negated(start) },
      { name: "preverbal", frag: preverbal(start) },
      { name: "conditional", frag: conditional(start) },
      { name: "inna", frag: innaClause(start) },
      { name: "verbal", frag: parseVerbal(start, { governor: null, head: null, afterNegation: false, leadingConj }) },
      { name: "nominal", frag: nominal(start, leadingConj) },
      { name: "fronted_khabar", frag: frontedKhabar(start) },
    ];
    const found = candidates.filter((x): x is { name: string; frag: Fragment } => x.frag !== null);
    return found.sort((a, b) => b.frag.end - a.frag.end || coverage(b.frag) - coverage(a.frag))[0] ?? null;
  }

  // هَلْ / لَقَدْ open a sentence without changing it: the particle, then any sentence after it
  // (لَقَدْ only before a past verb).
  let best: { name: string; frag: Fragment } | null;
  const opener = W(0)?.closed?.kind === "opener" ? sentenceOpener(W(0)!.surface) : null;
  if (opener) {
    const rest = sentenceAt(1);
    const verbAfter = rest?.frag.segs.find((s) => s.word === 1 && s.part === "core")?.reading;
    if (rest && (opener === "hal" || (rest.name === "verbal" && verbAfter?.aspect === "p"))) {
      let particle = seg({ word: 0, part: "core", surface: W(0)!.surface, role: "HARF", kind: OPENER_DESCRIPTIONS[opener], builtOn: BUILT_ON.sukun });
      const moved = iltiqaNote(W(0)!.surface, W(1)?.surface); // هَلِ انْتَهَيْتَ
      if (moved) particle = addNote(particle, moved.ar, moved.en);
      best = { name: rest.name, frag: { ...rest.frag, segs: [particle, ...rest.frag.segs] } };
    } else best = null;
  } else best = sentenceAt(0);
  if (best) best = { ...best, frag: coordinatedClauses(best.frag) };
  const segs = best ? best.frag.segs : [];

  /**
   * و / ف / ثُمَّ + another verbal clause after a complete sentence:
   * قَرَأَ الطَّالِبُ الكِتَابَ وَفَهِمَهُ — the second clause is coordinated with the
   * first, and like the first (a sentence opening the speech) has no case position.
   */
  function coordinatedClauses(first: Fragment): Fragment {
    let out = first;
    for (;;) {
      const j = out.end;
      const w = W(j);
      if (!w) break;
      const ATF = { ar: "حَرْفُ عَطْفٍ", en: "Coordinating conjunction" };
      let clause: Fragment | null = null;
      let conj: Seg | null = null;
      if (w.closed?.kind === "free_conj") {
        clause = parseVerbal(j + 1, { governor: null, head: first.head, afterNegation: false });
        if (clause) conj = seg({ word: j, part: "core", surface: w.surface, role: "HARF", kind: { ar: w.closed.word.kindAr, en: w.closed.word.kindEn }, head: clause.head });
      } else if (!w.closed && w.readings.some((r) => r.conj && r.pos === "verb")) {
        clause = parseVerbal(j, { governor: null, head: first.head, afterNegation: false, leadingConj: true });
      }
      if (!clause) break;
      const segsOut = clause.segs.map((s) => {
        if (s.word === j && s.part === "conj") return { ...s, kind: ATF, head: clause!.head };
        if (s.word === clause!.head.word && s.part === clause!.head.part)
          return addNote(s, "وَالجُمْلَةُ الفِعْلِيَّةُ مَعْطُوفَةٌ عَلَى الجُمْلَةِ قَبْلَهَا لَا مَحَلَّ لَهَا مِنَ الإِعْرَابِ", "the verbal clause is coordinated with the one before it and has no case position");
        return s;
      });
      out = { ...out, end: clause.end, segs: [...out.segs, ...(conj ? [conj] : []), ...segsOut] };
    }
    return out;
  }
  return { segs: segs.sort((a, b) => a.word - b.word || PART_ORDER[a.part] - PART_ORDER[b.part]), pattern: best?.name ?? "none", errors: [...errors], words };
}

function coverage(f: Fragment): number {
  return new Set(f.segs.map((s) => s.word)).size;
}

function sisterDisplay(surface: string): string {
  const bare = stripDiacritics(surface);
  return /^(\u0625\u0646|\u0623\u0646|\u0627\u0646|\u0643\u0623\u0646|\u0643\u0627\u0646|\u0644\u0643\u0646)$/.test(bare) ? `${bare}\u0651` : bare;
}

export { GRAMMATICAL_ROLES };
