import { describe, expect, it } from "vitest";
import { parseCorpus, parseCorpusLine } from "@/helpers";

// Verbatim lines from quranic-corpus-morphology-0.4.txt.
const FATIHA_7_EXCERPT = [
  "(1:7:1:1)\tSira`Ta\tN\tSTEM|POS:N|LEM:Sira`T|ROOT:SrT|M|ACC",
  "(1:7:3:1)\t>anoEamo\tV\tSTEM|POS:V|PERF|(IV)|LEM:>anoEama|ROOT:nEm|2MS",
  "(1:7:3:2)\tta\tPRON\tSUFFIX|PRON:2MS",
  "(1:7:6:1)\t{lo\tDET\tPREFIX|Al+",
  "(1:7:6:2)\tmagoDuwbi\tN\tSTEM|POS:N|PASS|PCPL|LEM:magoDuwb|ROOT:gDb|M|GEN",
  "(1:7:8:1)\twa\tCONJ\tPREFIX|w:CONJ+",
  "(1:7:8:2)\tlaA\tNEG\tSTEM|POS:NEG|LEM:laA",
].join("\n");

describe("parseCorpusLine", () => {
  it("parses location, form, tag, lemma, root and features", () => {
    const seg = parseCorpusLine("(1:7:1:1)\tSira`Ta\tN\tSTEM|POS:N|LEM:Sira`T|ROOT:SrT|M|ACC")!;
    expect(seg).toMatchObject({ chapter: 1, verse: 7, word: 1, segment: 1, tag: "N", type: "stem", lemmaBuckwalter: "Sira`T", rootBuckwalter: "SrT" });
    expect([...seg.features]).toEqual(["POS:N", "M", "ACC"]);
  });

  it("returns null for comments, headers and malformed lines", () => {
    expect(parseCorpusLine("# copyright")).toBeNull();
    expect(parseCorpusLine("LOCATION\tFORM\tTAG\tFEATURES")).toBeNull();
    expect(parseCorpusLine("(1:7)\tx\tN\tSTEM")).toBeNull();
    expect(parseCorpusLine("(1:7:1:1)\tx\tN")).toBeNull();
  });
});

describe("parseCorpus", () => {
  const { words, skippedLines } = parseCorpus(FATIHA_7_EXCERPT);

  it("groups segments into words and builds the full surface form", () => {
    expect(skippedLines).toEqual([]);
    expect(words.map((w) => w.word)).toEqual([1, 3, 6, 8]);
    expect(words[1].surface).toBe("أَنْعَمْتَ");
    expect(words[1].segments.map((s) => s.type)).toEqual(["stem", "suffix"]);
  });

  it("reads case, gender and definiteness for nouns", () => {
    expect(words[0].features).toMatchObject({ grammaticalCase: "accusative", gender: "m", definiteness: null });
    expect(words[0].root).toBe("ص ر ط");
    expect(words[2].features).toMatchObject({ grammaticalCase: "genitive", definiteness: "definite", derivation: "passive_participle" });
  });

  it("reads aspect, form, person, voice for verbs — without case", () => {
    expect(words[1].features).toMatchObject({
      verbAspect: "perfect",
      verbForm: 4,
      verbVoice: "active",
      person: 2,
      gender: "m",
      grammaticalNumber: "singular",
      grammaticalCase: null,
      verbMood: null,
    });
  });

  it("defaults unmarked imperfect verbs to indicative, and form I when no form is tagged", () => {
    const { words: [w] } = parseCorpus("(2:3:1:1)\tyu&ominu\tV\tSTEM|POS:V|IMPF|LEM:|ROOT:Amn|3MP");
    expect(w.features).toMatchObject({ verbAspect: "imperfect", verbMood: "indicative", verbForm: 1, person: 3, grammaticalNumber: "plural" });
    const { words: [j] } = parseCorpus("(2:6:9:1)\ttun*iro\tV\tSTEM|POS:V|IMPF|(IV)|LEM:>an*ara|ROOT:n*r|2MS|MOOD:JUS");
    expect(j.features).toMatchObject({ verbMood: "jussive", verbForm: 4 });
  });

  it("reports unparseable lines instead of dropping them silently", () => {
    expect(parseCorpus("garbage line\n(1:1:1:1)\tbi\tP\tPREFIX|bi+").skippedLines).toEqual(["garbage line"]);
  });
});
