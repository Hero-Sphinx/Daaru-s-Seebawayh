import { describe, expect, it } from "vitest";
import { isDeckOpen, openDeckCount } from "@/helpers";

const sections = [1, 2, 3].map((number) => ({ number, label: { en: "", ar: "" }, title: { en: "", ar: "" }, pages: [1, 1] as [number, number], cards: [] }));

describe("isDeckOpen", () => {
  it("opens every deck of a book not taught in a class", () => {
    expect(isDeckOpen({}, 3, [])).toBe(true);
    expect(isDeckOpen({ releasedWithClass: false }, 3, [])).toBe(true);
  });

  it("opens a class book's deck only once it's unlocked", () => {
    expect(isDeckOpen({ releasedWithClass: true }, 2, [1])).toBe(false);
    expect(isDeckOpen({ releasedWithClass: true }, 2, [1, 2])).toBe(true);
  });

  it("does not assume the unlocked decks are consecutive", () => {
    // Taught out of order, or one locked again: only the listed ones are open.
    expect(openDeckCount({ releasedWithClass: true, sections }, [1, 3])).toBe(2);
    expect(openDeckCount({ releasedWithClass: false, sections }, [])).toBe(3);
  });
});
