import { describe, expect, it } from "vitest";
import { loginPathFor, safeNextPath } from "@/constants";

describe("loginPathFor", () => {
  it("returns to the page the learner asked for, query string included", () => {
    expect(loginPathFor("/vocabulary")).toBe("/login?next=%2Fvocabulary");
    expect(loginPathFor("/library/abc?page=3")).toBe("/login?next=%2Flibrary%2Fabc%3Fpage%3D3");
  });

  it("round-trips through the login page's safeNextPath", () => {
    const next = new URL(loginPathFor("/quran/2?verse=255"), "http://x").searchParams.get("next");
    expect(safeNextPath(next)).toBe("/quran/2?verse=255");
  });

  it("falls back to a bare /login for the dashboard or a missing or unsafe path", () => {
    for (const path of ["/", "", null, undefined, "//evil.com", "https://evil.com"]) {
      expect(loginPathFor(path)).toBe("/login");
    }
  });
});
