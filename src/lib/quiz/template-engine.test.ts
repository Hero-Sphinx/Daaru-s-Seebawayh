import { describe, expect, it } from "vitest";
import { mulberry32 } from "./primitives";
import { rootSimilarity, similarRoots } from "./distractors";
import { generateFromTemplates, itemFitsTemplate, renderQuestion, type DistractorContext } from "./template-engine";
import { parseTemplateBody, type LoadedTemplate, type QuizItem } from "./template-types";
import { QUIZ_TEMPLATES } from "./templates";
import { ASPECT_LABELS, CASE_LABELS } from "./answer-labels";

const ROOTS = ["ك ت ب", "ك ت م", "ك س ب", "ق ت ل", "ع ل م", "ح ك م", "ر ح م", "د ر س", "د ر ك", "غ ر س"];

const ctx: DistractorContext = {
  roots: ROOTS,
  lemmasByRoot: new Map([
    ["ك ت ب", ["كِتَٰب", "كَتَبَ"]],
    ["ك ت م", ["كَتَمَ"]],
    ["ك س ب", ["كَسَبَ"]],
    ["ق ت ل", ["قَتَلَ"]],
    ["ع ل م", ["عِلْم"]],
  ]),
  posLabelsByCategory: new Map([["noun", ["Noun — اسم", "Proper noun — اسم علم", "Adjective — صفة", "Relative pronoun — اسم موصول"]]]),
};

function loaded(code: string): LoadedTemplate {
  const t = QUIZ_TEMPLATES.find((x) => x.code === code)!;
  return { id: code, code, quizType: t.quizType, ruleReference: t.ruleReference, body: t.body };
}

const caseItem: QuizItem = {
  key: "1:7:1",
  surface: "صِرَٰطَ",
  context: "صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ",
  contextRef: "1:7",
  lemma: "صِرَٰط",
  root: "ص ر ط",
  caseLabel: CASE_LABELS.accusative,
  posLabel: "Noun — اسم",
  posCategory: "noun",
};

describe("authored templates", () => {
  it("all pass validation and have unique codes", () => {
    for (const t of QUIZ_TEMPLATES) {
      const parsed = parseTemplateBody(t.body);
      expect(parsed.ok, `${t.code}: ${!parsed.ok ? parsed.errors.join("; ") : ""}`).toBe(true);
    }
    expect(new Set(QUIZ_TEMPLATES.map((t) => t.code)).size).toBe(QUIZ_TEMPLATES.length);
  });

  it("list exactly the labels the loaders produce as fixed options", () => {
    const caseT = QUIZ_TEMPLATES.find((t) => t.code === "quran.case")!;
    const aspectT = QUIZ_TEMPLATES.find((t) => t.code === "quran.verb_aspect")!;
    expect(caseT.body.distractors).toEqual({ strategy: "fixed", values: Object.values(CASE_LABELS) });
    expect(aspectT.body.distractors).toEqual({ strategy: "fixed", values: Object.values(ASPECT_LABELS) });
  });
});

describe("parseTemplateBody", () => {
  it("rejects malformed bodies with specific errors", () => {
    const bad = parseTemplateBody({ version: 2, topic: "x", source: "nowhere", prompt: {}, answerField: "nope", distractors: { strategy: "magic" } });
    expect(bad.ok).toBe(false);
    if (!bad.ok) expect(bad.errors.length).toBeGreaterThanOrEqual(5);
    expect(parseTemplateBody(null).ok).toBe(false);
  });
});

describe("root distractors", () => {
  it("scores shared radicals in place above shared radicals out of place", () => {
    expect(rootSimilarity("ك ت ب", "ك ت م")).toBe(4);
    expect(rootSimilarity("ك ت ب", "ب ك ت")).toBe(3);
    expect(rootSimilarity("ك ت ب", "ع ل م")).toBe(0);
  });

  it("picks look-alike roots, never the answer, never unrelated ones when close ones exist", () => {
    const picks = similarRoots("ك ت ب", ROOTS, 3, mulberry32(1));
    expect(picks).not.toContain("ك ت ب");
    expect(picks).toHaveLength(3);
    for (const p of picks) expect(rootSimilarity("ك ت ب", p)).toBeGreaterThan(0);
    expect(picks).toContain("ك ت م");
  });
});

describe("renderQuestion", () => {
  it("builds a case question with the right answer, reference, and explanation", () => {
    const q = renderQuestion(loaded("quran.case"), caseItem, [caseItem], ctx, mulberry32(3))!;
    expect(q.options[q.correctIndex]).toBe(CASE_LABELS.accusative);
    expect(q.options).toHaveLength(3);
    expect(q.promptEn).toBe("In 1:7, what is the i'rab state (case) of “صِرَٰطَ”?");
    expect(q.promptAr).toBe(caseItem.context);
    expect(q.ruleReference).toContain("Ajurrumiyyah");
    expect(q.explanation).toContain(CASE_LABELS.accusative);
  });

  it("skips items missing a field the template reads", () => {
    const { caseLabel: _omit, ...noCase } = caseItem;
    void _omit;
    expect(itemFitsTemplate(loaded("quran.case").body, noCase)).toBe(false);
    expect(renderQuestion(loaded("quran.case"), noCase, [], ctx, mulberry32(1))).toBeNull();
  });

  it("respects the POS-category filter", () => {
    expect(itemFitsTemplate(loaded("quran.verb_aspect").body, caseItem)).toBe(false);
  });

  it("builds root-family questions whose distractors come from similar roots", () => {
    const item: QuizItem = { key: "x", surface: "كِتَٰبَ", root: "ك ت ب", lemma: "كِتَٰب", contextRef: "2:2" };
    const q = renderQuestion(loaded("quran.root_family"), item, [item], ctx, mulberry32(5))!;
    expect(q.options[q.correctIndex]).toBe("كِتَٰب");
    const wrong = q.options.filter((_, i) => i !== q.correctIndex);
    for (const w of wrong) expect(["كَتَمَ", "كَسَبَ", "قَتَلَ"]).toContain(w);
  });

  it("returns null rather than a one-option question when distractors run out", () => {
    const item: QuizItem = { key: "v1", surface: "كتاب", meaningEn: "book" };
    expect(renderQuestion(loaded("vocab.meaning"), item, [item], ctx, mulberry32(1))).toBeNull();
  });
});

describe("generateFromTemplates", () => {
  const vocab: QuizItem[] = [
    { key: "v1", surface: "كِتَاب", meaningEn: "book", root: "ك ت ب" },
    { key: "v2", surface: "عِلْم", meaningEn: "knowledge", root: "ع ل م" },
    { key: "v3", surface: "دَرْس", meaningEn: "lesson", root: "د ر س" },
    { key: "v4", surface: "حِكْمَة", meaningEn: "wisdom", root: "ح ك م" },
  ];

  it("never repeats a question, never exceeds the requested count, and uses the whole pool", () => {
    // 4 items x 2 templates = 8 distinct questions available.
    for (const seed of [1, 2, 3, 9, 42]) {
      const qs = generateFromTemplates([loaded("vocab.meaning"), loaded("vocab.root")], { vocabulary: vocab }, ctx, 20, mulberry32(seed));
      expect(new Set(qs.map((q) => q.id)).size).toBe(qs.length);
      expect(qs.length).toBe(8);
    }
    expect(generateFromTemplates([loaded("vocab.meaning")], { vocabulary: vocab }, ctx, 2, mulberry32(9))).toHaveLength(2);
  });

  it("interleaves templates and doesn't ask about the same item twice in a row", () => {
    const qs = generateFromTemplates([loaded("vocab.meaning"), loaded("vocab.root")], { vocabulary: vocab }, ctx, 8, mulberry32(4));
    expect(new Set(qs.map((q) => q.templateCode)).size).toBe(2);
    for (let i = 1; i < qs.length; i++) expect(qs[i].id.split(":")[1]).not.toBe(qs[i - 1].id.split(":")[1]);
  });

  it("is deterministic for a seed", () => {
    const a = generateFromTemplates([loaded("vocab.meaning")], { vocabulary: vocab }, ctx, 4, mulberry32(11));
    const b = generateFromTemplates([loaded("vocab.meaning")], { vocabulary: vocab }, ctx, 4, mulberry32(11));
    expect(a).toEqual(b);
  });
});
