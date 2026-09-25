import { rootToArabic, toArabic, toArabicLexical } from "./buckwalter";

/**
 * Parser for the Quranic Arabic Corpus morphology file
 * (data/quranic-corpus/quranic-corpus-morphology-0.4.txt): one line per
 * *segment* — a word like وَبِٱلْكِتَٰبِ is several segments (conjunction
 * prefix, preposition prefix, determiner prefix, stem). Pure and
 * network-free so it's unit-testable; scripts/import-quran.ts does the DB
 * writes.
 *
 * Everything here is read off the corpus's own annotation — no inference.
 * Where the corpus says nothing (e.g. definiteness of a proper noun), the
 * field stays null rather than being guessed.
 */

export type SegmentType = "prefix" | "stem" | "suffix";
export type GrammaticalCase = "nominative" | "accusative" | "genitive";

export interface CorpusSegment {
  chapter: number;
  verse: number;
  word: number;
  segment: number;
  formBuckwalter: string;
  tag: string;
  type: SegmentType;
  /** Verbatim feature column, kept for audit (tokens.raw_features). */
  rawFeatures: string;
  lemmaBuckwalter: string | null;
  rootBuckwalter: string | null;
  features: Set<string>;
}

export interface WordFeatures {
  grammaticalCase: GrammaticalCase | null;
  gender: "m" | "f" | null;
  grammaticalNumber: "singular" | "dual" | "plural" | null;
  person: 1 | 2 | 3 | null;
  definiteness: "definite" | "indefinite" | null;
  verbAspect: "perfect" | "imperfect" | "imperative" | null;
  verbMood: "indicative" | "subjunctive" | "jussive" | null;
  verbVoice: "active" | "passive" | null;
  /** Roman numeral form I..XII — verbs only; the corpus leaves form I unmarked. */
  verbForm: number | null;
  /** Derived-noun type, e.g. "active participle" (ACT|PCPL) or "verbal noun" (VN). */
  derivation: "active_participle" | "passive_participle" | "verbal_noun" | null;
}

export interface CorpusWord {
  chapter: number;
  verse: number;
  word: number;
  /** Faithful Uthmani Arabic (all recitation marks kept). */
  surface: string;
  segments: CorpusSegment[];
  /** The segment carrying the word's lemma/root/POS — null only for the rare stemless word. */
  stem: CorpusSegment | null;
  lemma: string | null;
  root: string | null;
  features: WordFeatures;
}

const LOCATION_RE = /^\((\d+):(\d+):(\d+):(\d+)\)$/;
const PGN_RE = /^([123])?([MF])?([SDP])?$/;
const VERB_FORM_RE = /^\((I|II|III|IV|V|VI|VII|VIII|IX|X|XI|XII)\)$/;
const ROMAN: Record<string, number> = { I: 1, II: 2, III: 3, IV: 4, V: 5, VI: 6, VII: 7, VIII: 8, IX: 9, X: 10, XI: 11, XII: 12 };

/** Returns null for comments, the header row, blank or malformed lines. */
export function parseCorpusLine(line: string): CorpusSegment | null {
  if (!line || line.startsWith("#") || line.startsWith("LOCATION")) return null;
  const columns = line.replace(/\r$/, "").split("\t");
  if (columns.length !== 4) return null;
  const [location, formBuckwalter, tag, rawFeatures] = columns;
  const m = LOCATION_RE.exec(location);
  if (!m) return null;

  const parts = rawFeatures.split("|");
  const kind = parts[0];
  const type: SegmentType | null = kind === "PREFIX" ? "prefix" : kind === "STEM" ? "stem" : kind === "SUFFIX" ? "suffix" : null;
  if (!type) return null;

  let lemmaBuckwalter: string | null = null;
  let rootBuckwalter: string | null = null;
  const features = new Set<string>();
  for (const part of parts.slice(1)) {
    if (part.startsWith("LEM:")) lemmaBuckwalter = part.slice(4);
    else if (part.startsWith("ROOT:")) rootBuckwalter = part.slice(5);
    else features.add(part);
  }

  return {
    chapter: Number(m[1]),
    verse: Number(m[2]),
    word: Number(m[3]),
    segment: Number(m[4]),
    formBuckwalter,
    tag,
    type,
    rawFeatures,
    lemmaBuckwalter,
    rootBuckwalter,
    features,
  };
}

export function deriveWordFeatures(segments: CorpusSegment[], stem: CorpusSegment | null): WordFeatures {
  const f = stem?.features ?? new Set<string>();
  const isVerb = stem?.tag === "V";

  let grammaticalCase: GrammaticalCase | null = null;
  if (f.has("NOM")) grammaticalCase = "nominative";
  else if (f.has("ACC")) grammaticalCase = "accusative";
  else if (f.has("GEN")) grammaticalCase = "genitive";

  let gender: WordFeatures["gender"] = null;
  let grammaticalNumber: WordFeatures["grammaticalNumber"] = null;
  let person: WordFeatures["person"] = null;
  for (const feat of f) {
    const pgn = PGN_RE.exec(feat);
    if (!pgn || feat === "") continue;
    if (pgn[1]) person = Number(pgn[1]) as 1 | 2 | 3;
    if (pgn[2]) gender = pgn[2] === "M" ? "m" : "f";
    if (pgn[3]) grammaticalNumber = pgn[3] === "S" ? "singular" : pgn[3] === "D" ? "dual" : "plural";
  }

  let verbAspect: WordFeatures["verbAspect"] = null;
  let verbMood: WordFeatures["verbMood"] = null;
  let verbVoice: WordFeatures["verbVoice"] = null;
  let verbForm: number | null = null;
  if (isVerb) {
    if (f.has("PERF")) verbAspect = "perfect";
    else if (f.has("IMPF")) verbAspect = "imperfect";
    else if (f.has("IMPV")) verbAspect = "imperative";
    // The corpus tags only the marked moods; an imperfect verb with no MOOD
    // feature is indicative (its documented default — no MOOD:IND exists in the file).
    if (f.has("MOOD:SUBJ")) verbMood = "subjunctive";
    else if (f.has("MOOD:JUS")) verbMood = "jussive";
    else if (verbAspect === "imperfect") verbMood = "indicative";
    verbVoice = f.has("PASS") ? "passive" : "active";
    verbForm = 1;
    for (const feat of f) {
      const vf = VERB_FORM_RE.exec(feat);
      if (vf) verbForm = ROMAN[vf[1]];
    }
  }

  let derivation: WordFeatures["derivation"] = null;
  if (f.has("PCPL")) derivation = f.has("PASS") ? "passive_participle" : "active_participle";
  else if (f.has("VN")) derivation = "verbal_noun";

  let definiteness: WordFeatures["definiteness"] = null;
  if (segments.some((s) => s.type === "prefix" && s.features.has("Al+"))) definiteness = "definite";
  else if (f.has("INDEF")) definiteness = "indefinite";

  return { grammaticalCase, gender, grammaticalNumber, person, definiteness, verbAspect, verbMood, verbVoice, verbForm, derivation };
}

/**
 * The corpus numbers homonymous lemmas ("maE" location adverb vs "maE2"
 * preposition) — 15 such lemmas in the whole file. The number isn't part
 * of the Arabic headword, so it's dropped here; homonyms that also differ
 * in root or POS stay distinct lemmas anyway (lemmas' natural key), and
 * the verbatim corpus lemma id survives in each token's raw_features.
 */
export function stripHomonymNumber(lemmaBuckwalter: string): string {
  return lemmaBuckwalter.replace(/\d+$/, "");
}

/** Groups segments (in file order) into words, preserving corpus order. */
export function groupWords(segments: Iterable<CorpusSegment>): CorpusWord[] {
  const words: CorpusWord[] = [];
  let current: CorpusSegment[] = [];

  const flush = () => {
    if (current.length === 0) return;
    const segs = [...current].sort((a, b) => a.segment - b.segment);
    const stem = segs.find((s) => s.type === "stem") ?? null;
    words.push({
      chapter: segs[0].chapter,
      verse: segs[0].verse,
      word: segs[0].word,
      surface: segs.map((s) => toArabic(s.formBuckwalter)).join(""),
      segments: segs,
      stem,
      lemma: stem?.lemmaBuckwalter ? toArabicLexical(stripHomonymNumber(stem.lemmaBuckwalter)) : null,
      root: stem?.rootBuckwalter ? rootToArabic(stem.rootBuckwalter) : null,
      features: deriveWordFeatures(segs, stem),
    });
    current = [];
  };

  for (const seg of segments) {
    const prev = current[0];
    if (prev && (prev.chapter !== seg.chapter || prev.verse !== seg.verse || prev.word !== seg.word)) flush();
    current.push(seg);
  }
  flush();
  return words;
}

export interface CorpusParseResult {
  words: CorpusWord[];
  /** Non-comment lines that didn't parse — reported, never silently dropped. */
  skippedLines: string[];
}

export function parseCorpus(text: string): CorpusParseResult {
  const segments: CorpusSegment[] = [];
  const skippedLines: string[] = [];
  for (const line of text.split("\n")) {
    const trimmed = line.replace(/\r$/, "");
    if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith("LOCATION")) continue;
    const seg = parseCorpusLine(trimmed);
    if (seg) segments.push(seg);
    else skippedLines.push(trimmed);
  }
  return { words: groupWords(segments), skippedLines };
}
