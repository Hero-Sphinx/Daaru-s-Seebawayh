import { describe, expect, it } from "vitest";
import { sampleSentences } from "@/constants";
import { gradeReconstruction, isComplete, isReconstructable, type TokenAnswer } from "@/helpers";

const sentence = sampleSentences.find(isReconstructable)!;

function perfectAnswers(): Record<number, TokenAnswer> {
  return Object.fromEntries(sentence.edges.map((e) => [e.tokenId, { role: e.role.code, headTokenId: e.headTokenId }]));
}

describe("isReconstructable", () => {
  it("accepts the curated bank (every word has a verified edge)", () => {
    expect(sampleSentences.every(isReconstructable)).toBe(true);
  });

  it("rejects a sentence with an unresolved word", () => {
    expect(isReconstructable({ ...sentence, edges: sentence.edges.slice(1) })).toBe(false);
  });
});

describe("gradeReconstruction", () => {
  it("gives full marks for the verified analysis", () => {
    const g = gradeReconstruction(sentence, perfectAnswers());
    expect(g.allCorrect).toBe(true);
    expect(g.points).toBe(sentence.tokens.length * 2);
  });

  it("scores role and head independently", () => {
    const answers = perfectAnswers();
    const [first] = sentence.edges;
    const wrongRole = first.role.code === "FIL" ? "MUBTADA" : "FIL";
    answers[first.tokenId] = { role: wrongRole, headTokenId: first.headTokenId };
    const g = gradeReconstruction(sentence, answers);
    const t = g.tokens.find((x) => x.tokenId === first.tokenId)!;
    expect(t).toMatchObject({ roleCorrect: false, headCorrect: true, expectedRole: first.role.code });
    expect(g.points).toBe(g.maxPoints - 1);
    expect(g.allCorrect).toBe(false);
  });

  it("distinguishes 'sentence root' (null) from 'not answered' (undefined)", () => {
    const root = sentence.edges.find((e) => e.headTokenId === null)!;
    const answers = perfectAnswers();
    answers[root.tokenId] = { role: root.role.code, headTokenId: undefined };
    expect(gradeReconstruction(sentence, answers).tokens.find((t) => t.tokenId === root.tokenId)!.headCorrect).toBe(false);
    expect(isComplete(sentence, answers)).toBe(false);
  });
});

describe("missingAnswers", async () => {
  const { missingAnswers } = await import("@/helpers/irab/reconstruction");
  it("lists exactly the unanswered role/head choices", () => {
    const answers = perfectAnswers();
    const [a, b] = sentence.edges;
    answers[a.tokenId] = { role: "", headTokenId: a.headTokenId };
    answers[b.tokenId] = { role: b.role.code, headTokenId: undefined };
    expect(missingAnswers(sentence, answers)).toEqual([
      { tokenId: a.tokenId, role: true, head: false },
      { tokenId: b.tokenId, role: false, head: true },
    ]);
    expect(missingAnswers(sentence, perfectAnswers())).toEqual([]);
  });
});
