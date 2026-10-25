import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { QuranReader, TAFSIR_ATTRIBUTION, TafsirPanel } from "@/libs/QuranChapterWrapper/components";
import type { QuranTafsirDTO, QuranVerseDTO } from "@/types";

/** Smoke tests: the tafsīr button in the reader, and the panel in each state. */
const tafsir: QuranTafsirDTO = {
  chapter: 2,
  verse: 37,
  muyassarAr: "فتلقى آدمُ بالقبول كلماتٍ، وهي قوله تعالى: {رَبَّنَا ظَلَمْنَا أَنْفُسَنَا} فتاب الله عليه",
  mukhtasarEn: "Adam received words of repentance from his Lord.",
};

const render = (props: Parameters<typeof TafsirPanel>[0]) => renderToStaticMarkup(createElement(TafsirPanel, props));
const noop = () => {};

describe("tafsīr panel", () => {
  it("shows both tafsīrs by default, with āyāt in Qur'anic brackets and the source", () => {
    const html = render({ state: { status: "ready", tafsir }, language: "both", onLanguage: noop });
    expect(html).toContain("﴿رَبَّنَا ظَلَمْنَا أَنْفُسَنَا﴾");
    expect(html).not.toContain("{");
    expect(html).toContain(tafsir.mukhtasarEn);
    expect(html).toContain("QuranEnc.com");
    expect(html).toContain(TAFSIR_ATTRIBUTION.slice(0, 40));
  });

  it("shows only the chosen language", () => {
    const ar = render({ state: { status: "ready", tafsir }, language: "ar", onLanguage: noop });
    expect(ar).toContain("فتلقى");
    expect(ar).not.toContain(tafsir.mukhtasarEn);
    const en = render({ state: { status: "ready", tafsir }, language: "en", onLanguage: noop });
    expect(en).toContain(tafsir.mukhtasarEn);
    expect(en).not.toContain("فتلقى");
  });

  it("says when it is loading or failed", () => {
    expect(render({ state: { status: "loading" }, language: "both", onLanguage: noop })).toContain("Loading the tafsīr");
    expect(render({ state: { status: "error", message: "Couldn't load the tafsīr." }, language: "both", onLanguage: noop })).toContain("Couldn&#x27;t load");
  });
});

describe("Qur'an reader", () => {
  it("offers a closed tafsīr button under every āyah", () => {
    const verses: QuranVerseDTO[] = [1, 2].map((n) => ({ number: n, text: "", words: [] }));
    const html = renderToStaticMarkup(createElement(QuranReader, { chapterId: 1, verses }));
    expect(html.match(/aria-expanded="false"/g)).toHaveLength(2);
    expect(html).toContain("Tafsīr");
    expect(html).not.toContain(TAFSIR_ATTRIBUTION.slice(0, 40));
  });
});
