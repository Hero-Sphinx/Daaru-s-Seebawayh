import { describe, expect, it } from "vitest";
import { describeWord, wordTone } from "@/helpers/quran/labels";
import type { QuranWordDTO } from "@/types/quran";

const base: QuranWordDTO = {
  id: "1",
  position: 1,
  surface: "",
  lemma: null,
  root: null,
  pos: null,
  grammaticalCase: null,
  gender: null,
  grammaticalNumber: null,
  person: null,
  definiteness: null,
  verbAspect: null,
  verbMood: null,
  verbVoice: null,
  verbForm: null,
  derivation: null,
  segments: [],
};

describe("describeWord", () => {
  it("labels a verb with traditional terms, in a stable order", () => {
    const labels = describeWord({ ...base, verbAspect: "imperfect", verbMood: "jussive", verbVoice: "active", verbForm: 4, person: 2, gender: "m", grammaticalNumber: "singular" });
    expect(labels.map((l) => l.label)).toEqual(["Tense", "Mood", "Voice", "Verb form", "Person", "Gender", "Number"]);
    expect(labels.find((l) => l.label === "Mood")?.ar).toBe("مَجْزُوم");
    expect(labels.find((l) => l.label === "Verb form")?.en).toBe("Form IV");
    expect(labels.find((l) => l.label === "Verb form")?.ar).toBe("أَفْعَلَ");
  });

  it("omits anything the corpus didn't annotate", () => {
    expect(describeWord(base)).toEqual([]);
    expect(describeWord({ ...base, grammaticalCase: "genitive" })).toEqual([{ label: "Case", en: "Genitive", ar: "مَجْرُور" }]);
  });
});

describe("wordTone", () => {
  it("colours by case first, then verb, else neutral", () => {
    expect(wordTone({ grammaticalCase: "accusative", pos: null })).toBe("accusative");
    expect(wordTone({ grammaticalCase: null, pos: { code: "V", nameEn: "Verb", nameAr: "فعل", category: "verb" } })).toBe("verb");
    expect(wordTone({ grammaticalCase: null, pos: { code: "P", nameEn: "Preposition", nameAr: "حرف جر", category: "particle" } })).toBe("other");
  });
});
