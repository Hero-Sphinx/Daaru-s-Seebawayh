import { describe, expect, it } from "vitest";
import camelFixtures from "./__fixtures__/camel-candidates.json";
import { GOLD } from "./__fixtures__/gold";
import { scoreParse } from "./accuracy";
import { parseFreeText, type RawCandidate } from "./free-text-parser";
import { tokenizeSentence } from "./tokenize";

const FIXTURES = camelFixtures as Record<string, RawCandidate[]>;

function score(sentence: string, gold: string) {
  const words = tokenizeSentence(sentence);
  return scoreParse(parseFreeText(words.map((w) => ({ surface: w, candidates: FIXTURES[w] ?? [] }))), gold);
}

describe("accuracy against the gold set", () => {
  it("is never wrong: every sentence is either analysed correctly or declined", () => {
    const wrong = GOLD.map(([s, g]) => ({ s, ...score(s, g) })).filter((r) => r.verdict === "wrong");
    expect(wrong.map((r) => `${r.s}: ${r.issues.join("; ")}`)).toEqual([]);
  });

  it("analyses most of it (guards against coverage regressions)", () => {
    const correct = GOLD.filter(([s, g]) => score(s, g).verdict === "correct").length;
    expect(correct / GOLD.length).toBeGreaterThanOrEqual(0.9);
  });
});

describe("scoreParse", () => {
  it("tells wrong from refused", () => {
    expect(score("كَتَبَ الطَّالِبُ الدَّرْسَ", "FIL FAAIL MAFUL_BIH").verdict).toBe("correct");
    expect(score("كَتَبَ الطَّالِبُ الدَّرْسَ", "FIL MAFUL_BIH MAFUL_BIH").verdict).toBe("wrong");
    expect(score("كَتَبَ الطَّالِبُ كِتَابًا", "FIL FAAIL MAFUL_BIH").verdict).toBe("refused");
  });
});
