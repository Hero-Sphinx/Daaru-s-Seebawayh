import { describe, expect, it } from "vitest";
import { parseRetryDelayMs } from "@/server/helpers/geminiClient";

describe("parseRetryDelayMs", () => {
  it("reads the human-readable hint from a real 429 body", () => {
    expect(parseRetryDelayMs("limit: 20, model: gemini-2.5-flash\nPlease retry in 27.086849746s.")).toBe(27087);
  });

  it("reads the structured RetryInfo delay", () => {
    expect(parseRetryDelayMs('{"@type": "type.googleapis.com/google.rpc.RetryInfo", "retryDelay": "41s"}')).toBe(41000);
  });

  it("returns null when there's no hint", () => {
    expect(parseRetryDelayMs("RESOURCE_EXHAUSTED")).toBeNull();
  });
});
