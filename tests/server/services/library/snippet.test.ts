import { describe, expect, it } from "vitest";
import { extractSnippet } from "@/server/services";

describe("extractSnippet", () => {
  it("returns null when the query isn't found", () => {
    expect(extractSnippet("كَتَبَ الطَّالِبُ", "غَائِب")).toBeNull();
  });

  it("returns the whole text with no ellipsis when it fits within the context window", () => {
    expect(extractSnippet("كَتَبَ الطَّالِبُ", "الطَّالِبُ", 60)).toBe("كَتَبَ الطَّالِبُ");
  });

  it("truncates with a leading ellipsis when the match is far into a long text", () => {
    const text = "س".repeat(200) + "درس" + "ص".repeat(200);
    const snippet = extractSnippet(text, "درس", 10);
    expect(snippet?.startsWith("…")).toBe(true);
    expect(snippet?.endsWith("…")).toBe(true);
    expect(snippet).toContain("درس");
  });
});
