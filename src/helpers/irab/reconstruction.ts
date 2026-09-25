import type { RoleCode, SentenceAnalysis } from "@/types";

/**
 * Grading for the I'rab reconstruction exercise (ROADMAP.md Phase 5): the
 * learner assigns each word a grammatical role and the word it depends on
 * (its head, or none for the sentence root), and this compares that to the
 * verified analysis. Pure — the answer key is the SentenceAnalysis itself.
 */

export interface TokenAnswer {
  role: RoleCode | "";
  /** Head token id, or null for "no head (sentence root)"; undefined = not answered yet. */
  headTokenId: number | null | undefined;
}

export interface TokenGrade {
  tokenId: number;
  roleCorrect: boolean;
  headCorrect: boolean;
  expectedRole: RoleCode;
  expectedHeadTokenId: number | null;
}

export interface ReconstructionGrade {
  tokens: TokenGrade[];
  /** Role + head judgements that were right, out of 2 per word. */
  points: number;
  maxPoints: number;
  allCorrect: boolean;
}

/**
 * Only sentences where every word has a verified edge can be exercises —
 * a partial answer key would mark correct answers wrong.
 */
export function isReconstructable(sentence: SentenceAnalysis): boolean {
  return sentence.tokens.length >= 2 && sentence.tokens.every((t) => sentence.edges.some((e) => e.tokenId === t.id));
}

export function gradeReconstruction(sentence: SentenceAnalysis, answers: Record<number, TokenAnswer>): ReconstructionGrade {
  const tokens = sentence.tokens.map((t): TokenGrade => {
    const edge = sentence.edges.find((e) => e.tokenId === t.id);
    if (!edge) throw new Error(`Token ${t.id} has no edge — check isReconstructable() first`);
    const answer = answers[t.id];
    return {
      tokenId: t.id,
      roleCorrect: answer?.role === edge.role.code,
      headCorrect: answer !== undefined && answer.headTokenId !== undefined && answer.headTokenId === edge.headTokenId,
      expectedRole: edge.role.code,
      expectedHeadTokenId: edge.headTokenId,
    };
  });
  const points = tokens.reduce((n, g) => n + (g.roleCorrect ? 1 : 0) + (g.headCorrect ? 1 : 0), 0);
  return { tokens, points, maxPoints: tokens.length * 2, allCorrect: points === tokens.length * 2 };
}

/** True once every word has both a role and a head choice — the Check button's enable rule. */
export function isComplete(sentence: SentenceAnalysis, answers: Record<number, TokenAnswer>): boolean {
  return sentence.tokens.every((t) => answers[t.id]?.role && answers[t.id]?.headTokenId !== undefined);
}

/** What's still unanswered, per word — drives the "still to choose" message instead of a silently disabled button. */
export function missingAnswers(sentence: SentenceAnalysis, answers: Record<number, TokenAnswer>): { tokenId: number; role: boolean; head: boolean }[] {
  return sentence.tokens
    .map((t) => ({ tokenId: t.id, role: !answers[t.id]?.role, head: answers[t.id]?.headTokenId === undefined }))
    .filter((m) => m.role || m.head);
}
