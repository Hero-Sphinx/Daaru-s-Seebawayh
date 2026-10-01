import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { STORIES } from "@/constants";
import { paragraphWords } from "@/helpers";
import { StoriesWrapper, StoryWrapper } from "@/libs";
import WordPopup from "@/libs/StoryWrapper/components/WordPopup";

/** Smoke tests: the story pages render on the server, with every word tappable. */
describe("story pages", () => {
  it("lists every story", () => {
    const html = renderToStaticMarkup(createElement(StoriesWrapper));
    for (const s of STORIES) expect(html).toContain(`/stories/${s.slug}`);
  });

  it.each(STORIES.map((s) => [s.slug, s] as const))("renders %s with one button per word", (_slug, story) => {
    const html = renderToStaticMarkup(createElement(StoryWrapper, { story, knownWordKeys: [] }));
    const words = story.paragraphs.flatMap(paragraphWords);
    const wordButtons = html.match(/<button[^>]*type="button"[^>]*class="rounded-lg px-0\.5/g) ?? [];
    expect(wordButtons.length).toBe(words.length);
    expect(html).toContain(story.questions[0].questionAr);
  });
});

describe("word pop-up", () => {
  const base = {
    selected: { word: "قِطَّةٌ", key: "قطة", gloss: STORIES[0].glossary["قِطَّةٌ"], sentence: "هَذِهِ قِطَّةٌ صَغِيرَةٌ." },
    skipNudge: false,
    onSkipNudgeChange: () => {},
    inBank: false,
    added: false,
    onAdd: async () => {},
    onListen: () => {},
    listenError: null,
    onReveal: () => {},
    onFigured: () => {},
    onClose: () => {},
  };
  const render = (props: Partial<Parameters<typeof WordPopup>[0]>) => renderToStaticMarkup(createElement(WordPopup, { ...base, startRevealed: false, ...props }));

  it("asks the reader to think first, without giving the meaning away", () => {
    const html = render({});
    expect(html).toContain("got it!");
    expect(html).toContain("Give me a hint");
    expect(html).toContain("Show me");
    expect(html).not.toContain(base.selected.gloss!.meaning);
  });

  it("opens straight on the meaning when asked to", () => {
    const html = render({ startRevealed: true });
    expect(html).toContain(base.selected.gloss!.meaning);
    expect(html).toContain("Add to my vocabulary");
  });

  it("says when the word is already in the bank", () => {
    expect(render({ startRevealed: true, inBank: true })).toContain("Already in your vocabulary");
  });

  it("has no hint button for a word without a hint or root", () => {
    const html = render({ selected: { ...base.selected, gloss: { meaning: "in" } } });
    expect(html).not.toContain("Give me a hint");
  });
});
