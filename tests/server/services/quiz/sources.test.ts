import { describe, expect, it, vi } from "vitest";

// sources.ts imports the Prisma singleton; windowContext itself is pure.
vi.mock("@/server/databases/db", () => ({ default: {} }));
const { windowContext } = await import("@/server/services/quiz/sources");

describe("windowContext", () => {
  const verse = "a b c d e f g h i j k l m";

  it("returns the whole verse when it's short enough", () => {
    expect(windowContext("a b c", 2)).toBe("a b c");
  });

  it("windows around the target word with ellipses on cut sides", () => {
    expect(windowContext(verse, 7, 2)).toBe("… e f g h i …");
    expect(windowContext(verse, 1, 2)).toBe("a b c …");
    expect(windowContext(verse, 13, 2)).toBe("… k l m");
  });
});
