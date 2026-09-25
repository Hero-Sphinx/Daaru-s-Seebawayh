import { describe, expect, it } from "vitest";
import { buildDocumentText } from "@/server/services";

describe("buildDocumentText", () => {
  it("includes all pages when under the char budget", () => {
    const { text, truncated } = buildDocumentText([
      { pageNumber: 1, text: "أول صفحة" },
      { pageNumber: 2, text: "ثاني صفحة" },
    ]);
    expect(truncated).toBe(false);
    expect(text).toContain("--- Page 1 ---");
    expect(text).toContain("--- Page 2 ---");
    expect(text).toContain("أول صفحة");
    expect(text).toContain("ثاني صفحة");
  });

  it("truncates and reports truncation once the char budget is exceeded", () => {
    const pages = Array.from({ length: 5 }, (_, i) => ({ pageNumber: i + 1, text: "x".repeat(50) }));
    const { text, truncated } = buildDocumentText(pages, 120);
    expect(truncated).toBe(true);
    expect(text.length).toBeLessThanOrEqual(120);
  });

  it("handles an empty page list", () => {
    const { text, truncated } = buildDocumentText([]);
    expect(text).toBe("");
    expect(truncated).toBe(false);
  });
});
