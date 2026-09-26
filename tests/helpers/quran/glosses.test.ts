import { describe, expect, it } from "vitest";
import { normalizeGloss, summarizeGlosses } from "@/helpers";

describe("normalizeGloss", () => {
  it("drops parenthesised helpers and leading function words", () => {
    expect(normalizeGloss("(of) Allah")).toBe("allah");
    expect(normalizeGloss("In (the) name")).toBe("name");
    expect(normalizeGloss("and those who believe")).toBe("those who believe");
    expect(normalizeGloss("So indeed, they believed")).toBe("believed");
  });

  it("strips pronouns and helpers that come from clitics, and word-internal brackets", () => {
    expect(normalizeGloss("your Lord")).toBe("lord");
    expect(normalizeGloss("They said")).toBe("said");
    expect(normalizeGloss("have believed")).toBe("believed");
    expect(normalizeGloss("taught him")).toBe("taught");
    expect(normalizeGloss("have mercy on us")).toBe("mercy");
    expect(normalizeGloss("believe(d)")).toBe("believe");
    expect(normalizeGloss("Allah's")).toBe("allah");
  });

  it("keeps a lone function word rather than emptying it", () => {
    expect(normalizeGloss("the")).toBe("the");
    expect(normalizeGloss("(1)")).toBe("");
  });
});

describe("summarizeGlosses", () => {
  it("merges renderings that differ only in helpers and picks the most common as the meaning", () => {
    const summary = summarizeGlosses([
      { text: "(of) Allah", count: 900 },
      { text: "Allah", count: 1500 },
      { text: "by Allah", count: 10 },
    ]);
    expect(summary).toEqual({ meaning: "Allah", alternatives: [] });
  });

  it("lists other distinct renderings, most common first, capped", () => {
    const summary = summarizeGlosses([
      { text: "the Book", count: 200 },
      { text: "(of) the Book", count: 50 },
      { text: "a Scripture", count: 30 },
      { text: "the writing", count: 5 },
      { text: "the decree", count: 4 },
      { text: "a record", count: 3 },
    ]);
    expect(summary.meaning).toBe("Book");
    expect(summary.alternatives).toEqual(["Scripture", "writing", "decree"]);
  });

  it("drops alternatives that are just the meaning plus context", () => {
    const summary = summarizeGlosses([
      { text: "the heavens", count: 150 },
      { text: "the sky", count: 40 },
      { text: "seven heavens", count: 7 },
      { text: "Allah's heavens", count: 1 },
    ]);
    expect(summary).toEqual({ meaning: "heavens", alternatives: ["sky"] });
  });

  it("returns nothing usable for empty or blank input", () => {
    expect(summarizeGlosses([])).toEqual({ meaning: null, alternatives: [] });
    expect(summarizeGlosses([{ text: "(1)", count: 3 }])).toEqual({ meaning: null, alternatives: [] });
  });
});
