/**
 * Free-text I'rab parser — public API used by /api/irab/parse, the library
 * reader, book quizzes and the reconstruction exercise. The grammar itself
 * lives in grammar.ts (coverage, rules and limitations are documented
 * there); this module adapts its output to the shapes the rest of the app
 * uses, one token per *piece*: a word like بِالقَلَمِ becomes two tokens
 * (the preposition بِ and its object القَلَمِ), كِتَابُهُ becomes كِتَابُ + ـهُ.
 */

import type { CaseSign, CaseType, RoleCode, SentenceAnalysis } from "@/types/irab";
import { CASE_SIGNS, GRAMMATICAL_ROLES } from "@/lib/data/grammatical-roles";
import type { CoarsePos } from "@/lib/irab/classify";
import { parseSentence, type Seg, type TokenInput } from "./grammar";
import type { AnalysisSourceTag, RawCandidate } from "./morph";

export type { AnalysisSourceTag, RawCandidate, TokenInput };

export interface ParsedToken {
  surface: string;
  /** Which typed word this piece belongs to (several pieces can share one). */
  wordIndex: number;
  part: "conj" | "prep" | "core" | "encl";
  root: string | null;
  lemma: string | null;
  pos: CoarsePos | null;
  role: RoleCode | null;
  /** Display override for the role ("اسم كأنّ", "خبر مقدم"…). */
  roleName: { ar: string; en: string } | null;
  caseType: CaseType | null;
  caseSign: CaseSign | null;
  builtOn: { ar: string; en: string } | null;
  kind: { ar: string; en: string } | null;
  mahall: CaseType | null;
  /** Extra clauses of this piece's i'rab (attached/implied subject, "وهو مضاف", a clause's position…). */
  note: { ar: string; en: string } | null;
  resolutionNote: string | null;
  source: AnalysisSourceTag | null;
  /** Index (in `tokens`) of the piece this one depends on; null for the sentence's root(s). */
  headIndex: number | null;
  /** For NAAT tokens, same as headIndex (kept for existing callers). */
  naatHeadIndex: number | null;
}

export interface FreeTextParseResult {
  tokens: ParsedToken[];
  warnings: string[];
  patternMatched: "vso" | "nominal" | "inna" | "negated" | "preverbal" | "fronted_khabar" | "conditional" | "none";
}

const PATTERN_NAMES: Record<string, FreeTextParseResult["patternMatched"]> = {
  verbal: "vso",
  nominal: "nominal",
  inna: "inna",
  negated: "negated",
  preverbal: "preverbal",
  fronted_khabar: "fronted_khabar",
  conditional: "conditional",
};

export function parseFreeText(inputs: TokenInput[]): FreeTextParseResult {
  const { segs, pattern, errors, words } = parseSentence(inputs);

  // One token per placed piece; one (unplaced) token per word nothing covered.
  const covered = new Set(segs.map((s) => s.word));
  const ordered: (Seg | { unplaced: number })[] = [];
  for (let w = 0; w < words.length; w++) {
    if (covered.has(w)) ordered.push(...segs.filter((s) => s.word === w));
    else ordered.push({ unplaced: w });
  }
  const indexOf = (word: number, part: string) => ordered.findIndex((x) => "word" in x && x.word === word && x.part === part);

  const tokens: ParsedToken[] = ordered.map((x) => {
    if ("unplaced" in x) {
      return {
        surface: words[x.unplaced].surface,
        wordIndex: x.unplaced,
        part: "core",
        root: null,
        lemma: null,
        pos: null,
        role: null,
        roleName: null,
        caseType: null,
        caseSign: null,
        builtOn: null,
        kind: null,
        mahall: null,
        note: null,
        resolutionNote: null,
        source: null,
        headIndex: null,
        naatHeadIndex: null,
      };
    }
    const headIndex = x.head ? indexOf(x.head.word, x.head.part) : null;
    const pos: CoarsePos | null = x.reading ? x.reading.pos : x.role === "HARF" || x.role === "HARF_JARR" || x.role === "INNA" ? "particle" : x.kind ? "noun" : null;
    return {
      surface: x.surface,
      wordIndex: x.word,
      part: x.part,
      root: x.reading?.root ?? null,
      lemma: x.reading?.lemma ?? null,
      pos,
      role: x.role,
      roleName: x.roleName,
      caseType: x.caseType,
      caseSign: x.caseSign,
      builtOn: x.builtOn,
      kind: x.kind,
      mahall: x.mahall,
      note: x.note,
      resolutionNote: x.resolutionNote,
      source: x.reading?.source ?? null,
      headIndex: headIndex !== null && headIndex >= 0 ? headIndex : null,
      naatHeadIndex: x.role === "NAAT" && headIndex !== null && headIndex >= 0 ? headIndex : null,
    };
  });

  const patternMatched = PATTERN_NAMES[pattern] ?? "none";
  const warnings: string[] = [];
  if (patternMatched === "none") {
    warnings.push(
      "This sentence structure isn't covered by the parser — supported: verbal sentences, mubtada'-khabar (incl. a fronted khabar), inna and kana with their sisters, la negating the genus, ma/lam/lan/la/qad + verb, and conditionals (in/man); with idafa, na't, 'atf, relative clauses, hal, tamyiz, maf'ul mutlaq, an + verb and prepositional phrases."
    );
  }
  for (let w = 0; w < words.length; w++) {
    if (covered.has(w)) continue;
    const word = words[w];
    const specific = errors.find((e) => e.startsWith(`"${word.surface}"`));
    if (specific) warnings.push(specific);
    else if (word.closed?.kind === "unsupported") warnings.push(`"${word.surface}": this particle's construction isn't supported by the parser yet.`);
    else if (word.closed) warnings.push(`"${word.surface}": recognized (${word.closed.word.kindEn.toLowerCase()}), but it doesn't fit the sentence at this position.`);
    else if (word.readings.length === 0) warnings.push(`"${word.surface}": no exact match for these diacritics — check the tashkeel, or this word may not be in the dictionary.`);
    else warnings.push(`"${word.surface}": recognized, but its ending or position doesn't fit the sentence structure found (check the case ending you typed).`);
  }
  return { tokens, warnings, patternMatched };
}

const POS_DISPLAY_NAMES: Record<CoarsePos, { ar: string; en: string }> = {
  verb: { ar: "فعل", en: "Verb" },
  noun: { ar: "اسم", en: "Noun" },
  particle: { ar: "حرف", en: "Particle" },
  other: { ar: "غير محدد", en: "Not determined" },
};

/**
 * Converts a parse result into the SentenceAnalysis shape the curated bank
 * uses, so IrabWorkspace renders free-text input identically. Unplaced
 * tokens get no DependencyEdge ("position not determined" in the UI).
 */
export function toSentenceAnalysis(result: FreeTextParseResult, sourceLabel: string): SentenceAnalysis {
  const tokens = result.tokens.map((t, i) => {
    const displayPos = t.kind ?? (t.pos ? POS_DISPLAY_NAMES[t.pos] : POS_DISPLAY_NAMES.other);
    return {
      id: i + 1,
      positionInUnit: i,
      surfaceForm: t.surface,
      lemma: t.lemma ?? "",
      root: t.root ?? "",
      posNameAr: displayPos.ar,
      posNameEn: displayPos.en,
      caseSign: t.caseSign ?? (t.caseType === "mabni" ? CASE_SIGNS.mabni : undefined),
      builtOn: t.builtOn ?? undefined,
      mahall: t.mahall ?? undefined,
      noteAr: t.note?.ar,
      noteEn: t.note?.en,
      analysisSource: t.source ?? "camel",
    };
  });

  const edges = result.tokens.flatMap((t, i) => {
    if (!t.role) return [];
    const base = GRAMMATICAL_ROLES[t.role];
    const role = t.roleName ? { ...base, nameAr: t.roleName.ar, nameEn: t.roleName.en } : base;
    return [{ tokenId: tokens[i].id, headTokenId: t.headIndex !== null ? tokens[t.headIndex].id : null, role }];
  });

  return { id: "free-text-result", sourceLabel, tokens, edges };
}
