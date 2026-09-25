import { describe, expect, it } from "vitest";
import { safeNextPath } from "@/constants";

describe("safeNextPath", () => {
  it("keeps same-origin paths, including query strings", () => {
    expect(safeNextPath("/vocabulary")).toBe("/vocabulary");
    expect(safeNextPath("/library/abc?page=3")).toBe("/library/abc?page=3");
  });

  it("rejects anything that could leave the site", () => {
    for (const bad of ["//evil.com", "/\\evil.com", "https://evil.com", "javascript:alert(1)", "evil.com", "/\tfoo", ""]) {
      expect(safeNextPath(bad)).toBe("/");
    }
  });

  it("falls back to / for missing or non-string values", () => {
    expect(safeNextPath(null)).toBe("/");
    expect(safeNextPath(undefined)).toBe("/");
  });
});
