/** Mirrors the shape of `tokens` + `dependency_edges` in db/schema.sql. */

export type CaseType = "rafa" | "nasb" | "jarr" | "jazm" | "mabni";

export interface CaseSign {
  caseType: CaseType;
  signAr: string;
  signEn: string;
}

export type RoleCode = "FIL" | "FAAIL" | "MAFUL_BIH" | "MUBTADA" | "KHABAR" | "HARF_JARR" | "MAJROOR";

export interface GrammaticalRole {
  code: RoleCode;
  nameAr: string;
  nameEn: string;
  category: "verbal" | "nominal" | "particle";
  ruleReference?: string;
}

export interface IrabToken {
  id: number;
  positionInUnit: number;
  surfaceForm: string; // with tashkeel
  lemma: string;
  root: string;
  posNameAr: string;
  posNameEn: string;
  caseSign?: CaseSign;
  analysisSource: "qadt" | "farasa" | "camel" | "manual";
}

export interface DependencyEdge {
  tokenId: number;
  headTokenId: number | null; // null = sentence root
  role: GrammaticalRole;
}

export interface SentenceAnalysis {
  id: string;
  sourceLabel: string; // e.g. "Al-Ajurrumiyyah, example sentence" or "Quran 1:1"
  tokens: IrabToken[];
  edges: DependencyEdge[];
}
