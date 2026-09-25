import { describe, expect, it } from "vitest";
import { normalizePdfText } from "@/server/services/library/extractPdf";

describe("normalizePdfText", () => {
  it("converts Arabic Presentation Forms back to logical Unicode", () => {
    // "كتب الطالب" pre-shaped into presentation-form glyphs — confirmed live
    // against a real generated PDF (see ROADMAP.md) that some PDF generators
    // embed exactly this, which CAMeL Tools can't read without this fix.
    const shaped = "ﻛﺘﺐ ﺍﻟﻄﺎﻟﺐ";
    expect(normalizePdfText(shaped)).toBe("كتب الطالب");
  });

  it("leaves already-logical Arabic text unchanged", () => {
    expect(normalizePdfText("كَتَبَ الطَّالِبُ الدَّرْسَ")).toBe("كَتَبَ الطَّالِبُ الدَّرْسَ");
  });

  it("trims surrounding whitespace", () => {
    expect(normalizePdfText("  نُورٌ  \n")).toBe("نُورٌ");
  });
});

describe("ocrPages", async () => {
  const { ocrPages, OCR_BATCH_SIZE } = await import("@/server/services/library/extractPdf");
  const { GeminiQuotaExhaustedError } = await import("@/server/helpers/geminiClient");
  const timeout = () => Object.assign(new Error("The operation was aborted due to timeout"), { name: "TimeoutError" });
  const pages = (n: number) => Array.from({ length: n }, (_, i) => i + 1);
  const echo = async (_b: string, nums: number[]) => new Map(nums.map((n) => [n, `page ${n}`]));

  it("batches pages and saves each batch as it completes", async () => {
    const calls: number[][] = [];
    const saved: number[][] = [];
    const r = await ocrPages("pdf", pages(14), async (p) => void saved.push(p.map((x) => x.pageNumber)), async (b, nums) => {
      calls.push(nums);
      return echo(b, nums);
    });
    expect(calls.map((c) => c.length)).toEqual([OCR_BATCH_SIZE, OCR_BATCH_SIZE, 14 - 2 * OCR_BATCH_SIZE]);
    expect(saved.flat()).toEqual(pages(14));
    expect(r).toMatchObject({ recovered: 14, failedPages: [], quotaExhausted: false });
  });

  it("splits a timed-out batch and retries the halves, down to single pages", async () => {
    // Any request containing page 3 alongside others times out; page 3 alone always times out.
    const r = await ocrPages("pdf", pages(6), async () => {}, async (b, nums) => {
      if (nums.includes(3)) throw timeout();
      return echo(b, nums);
    });
    expect(r.recovered).toBe(5);
    expect(r.failedPages).toEqual([3]);
  });

  it("stops everything once the quota is exhausted", async () => {
    let n = 0;
    const r = await ocrPages("pdf", pages(18), async () => {}, async (b, nums) => {
      if (++n === 2) throw new GeminiQuotaExhaustedError("quota");
      return echo(b, nums);
    });
    expect(n).toBe(2);
    expect(r.quotaExhausted).toBe(true);
    expect(r.recovered).toBe(OCR_BATCH_SIZE);
    expect(r.failedPages).toHaveLength(18 - OCR_BATCH_SIZE);
  });

  it("treats an empty transcription as a blank page, not a failure", async () => {
    const r = await ocrPages("pdf", [1, 2], async () => {}, async () => new Map([[1, "text"], [2, ""]]));
    expect(r).toMatchObject({ recovered: 1, failedPages: [] });
  });
});
