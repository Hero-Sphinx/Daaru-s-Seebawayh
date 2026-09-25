import { describe, expect, it } from "vitest";
import { candidateMatchesSurface, diacriticsMatch } from "@/helpers";

describe("diacriticsMatch", () => {
  it("matches the sun-letter assimilation shadda against CAMeL's unmarked convention", () => {
    // Real case found testing against the live CAMeL service: CAMeL's own
    // diac for "طالب" never carries the optional shadda on the sun letter.
    expect(diacriticsMatch("الطَّالِبُ", "الطالِبُ")).toBe(true);
  });

  it("matches explicit sukun against a bare (undiacritized) consonant", () => {
    // Real case found live: CAMeL leaves the definite article's lam bare
    // before a moon letter instead of marking sukun explicitly.
    expect(diacriticsMatch("الْعِلْمُ", "العِلْمُ")).toBe(true);
  });

  it("is insensitive to diacritic input order on the same letter", () => {
    expect(diacriticsMatch("الطَّالِبُ", "الطّالِبُ")).toBe(true); // shadda-fatha vs fatha-shadda on ط
  });

  it("still treats a meaningful shadda (not sun-letter related) as significant", () => {
    // "دَرَسَ" (studied, Form I) vs "دَرَّسَ" (taught, Form II) must stay distinct.
    expect(diacriticsMatch("دَرَسَ", "دَرَّسَ")).toBe(false);
  });

  it("still treats genuinely different vowels as different", () => {
    expect(diacriticsMatch("كِتَابٌ", "كِتَابَ")).toBe(false);
  });

  it("still treats two different words sharing a sun-letter position as different, not just assimilation variants", () => {
    // Real case found live: "الزَّهْرَةَ" ("the flower", root ز ه ر, lemma
    // زَهْر — ز is a sun letter) got a false "ambiguous — 2 roots" match
    // against CAMeL's "الزُّهْرَةَ"/"الزُهْرَةَ" candidate (a different word,
    // lemma زُهْرَة, same root) because an earlier version of this rule
    // dropped the sun letter's own vowel along with the assimilation
    // shadda — only the shadda should ever be dropped there.
    expect(diacriticsMatch("الزَّهْرَةَ", "الزُّهْرَةَ")).toBe(false);
  });

  it("matches identical strings trivially", () => {
    expect(diacriticsMatch("نُورٌ", "نُورٌ")).toBe(true);
  });

  it("matches a short vowel against its omitted matres-lectionis form before a matching long vowel", () => {
    // Real case found live: CAMeL's diac for "كِتَاب" omits the fatha before
    // the alif ("كِتاب"), and moon-letter "لْـ" against bare "لـ".
    expect(diacriticsMatch("الْكِتَابَ", "الكِتابَ")).toBe(true);
    expect(diacriticsMatch("سَعِيد", "سَعيد")).toBe(true); // kasra before ya
    expect(diacriticsMatch("يَقُولُ", "يَقولُ")).toBe(true); // damma before waw
  });

  it("matches the accusative tanwin's support alif regardless of which side carries the fathatan", () => {
    // Real case found live: CAMeL's diac for "كتابا" puts the fathatan ON
    // the support alif ("كِتاباً"), while standard typing puts it on the
    // preceding consonant ("كِتَابًا") — same word, same ending, both real.
    expect(diacriticsMatch("كِتَابًا", "كِتاباً")).toBe(true);
    expect(diacriticsMatch("مُفِيدًا", "مُفِيداً")).toBe(true);
  });
});

describe("candidateMatchesSurface", () => {
  it("matches when CAMeL's proper-noun candidate is missing the tanwin case ending the user typed", () => {
    // Real case found live: CAMeL's calima-msa DB only has the bare
    // citation form for many noun_prop entries (زَيْد، مُحَمَّد، بَكْر-as-a-name),
    // unlike common nouns/adjectives which get the full case paradigm.
    expect(candidateMatchesSurface("مُحَمَّد", "مُحَمَّدٌ")).toBe(true);
    expect(candidateMatchesSurface("زَيْد", "زَيْدًا")).toBe(true);
    expect(candidateMatchesSurface("بَكْر", "بَكْرٍ")).toBe(true);
  });

  it("still matches identical strings and CAMeL's usual sun-letter/matres-lectionis conventions", () => {
    expect(candidateMatchesSurface("نُورٌ", "نُورٌ")).toBe(true);
    expect(candidateMatchesSurface("الطَّالِبُ", "الطالِبُ")).toBe(true);
  });

  it("does not match a candidate that's missing a whole extra letter, not just a trailing mark", () => {
    // "مُحَمَّد" is a real prefix of "مُحَمَّدِيّ" (a different word, "Muhammadi")
    // by letters, not just diacritics — must not be accepted.
    expect(candidateMatchesSurface("مُحَمَّد", "مُحَمَّدِيّ")).toBe(false);
  });

  it("does not match when the candidate has case marks the surface lacks (wrong direction)", () => {
    expect(candidateMatchesSurface("كِتَابٌ", "كِتَاب")).toBe(false);
  });

  it("still treats genuinely different vowels as different", () => {
    expect(candidateMatchesSurface("كِتَابٌ", "كِتَابَ")).toBe(false);
  });

  it("matches when CAMeL's candidate omits the vowel that accompanies an internal shadda", () => {
    // Real case found live: CAMeL's diac for "تفاحة" (apple) is "تُفّاحَةً"
    // — shadda on the doubled ف with no fatha — while the user correctly
    // typed "تُفَّاحَةً" (fatha + shadda). Not a sun-letter-after-"ال" position,
    // so the general shadda-vowel tolerance is what has to catch this.
    expect(candidateMatchesSurface("تُفّاحَةً", "تُفَّاحَةً")).toBe(true);
  });

  it("does not let the internal-shadda tolerance swap one specific vowel for a different one", () => {
    // "دَرَّسَ" (taught, Form II active) vs a hypothetical "دُرِّسَ" (were
    // taught, Form II passive) are genuinely different words — only a
    // *missing* vowel next to a shadda is tolerated, never a different one.
    expect(candidateMatchesSurface("دَرَّسَ", "دُرِّسَ")).toBe(false);
  });

  it("matches CAMeL's candidate when it puts the accusative tanwin's fathatan on the support alif", () => {
    // Real case found live: "قَرَأَ الطَّالِبُ كِتَابًا مُفِيدًا" (the student
    // read a useful book) — both كِتَابًا and مُفِيدًا failed to match CAMeL's
    // own candidates ("كِتاباً"، "مُفِيداً") purely because of which letter
    // carries the fathatan, not because CAMeL lacked the word at all.
    expect(candidateMatchesSurface("كِتاباً", "كِتَابًا")).toBe(true);
    expect(candidateMatchesSurface("مُفِيداً", "مُفِيدًا")).toBe(true);
  });

  it("resolves a sun-letter word to the one candidate whose own vowel actually matches, not both", () => {
    // Real case found live: CAMeL returns two "الزهرة" candidates sharing a
    // root but differing only in the sun letter's own vowel — "الزُهْرَةَ"
    // (lemma زُهْرَة) and "الزَهْرَةَ" (lemma زَهْر). The user's "الزَّهْرَةَ" must
    // match only the زَهْر one (same vowel once the assimilation shadda is
    // set aside), not both — that false "both match" is exactly what
    // produced the "ambiguous — 2 roots" bug.
    expect(candidateMatchesSurface("الزَهْرَةَ", "الزَّهْرَةَ")).toBe(true);
    expect(candidateMatchesSurface("الزُهْرَةَ", "الزَّهْرَةَ")).toBe(false);
  });
});

describe("sun-letter assimilation after attached proclitics", async () => {
  const { candidateMatchesSurface } = await import("@/helpers/irab/normalize");
  it("matches when a conjunction and/or preposition precedes the article", () => {
    // CAMeL's own diacs (confirmed live) vs. typical typed forms.
    expect(candidateMatchesSurface("وَالطالِبُ", "وَالطَّالِبُ")).toBe(true);
    expect(candidateMatchesSurface("فَالدَرْسُ", "فَالدَّرْسُ")).toBe(true);
    expect(candidateMatchesSurface("بِالطالِبِ", "بِالطَّالِبِ")).toBe(true);
    expect(candidateMatchesSurface("لِلطالِبِ", "لِلطَّالِبِ")).toBe(true);
  });
});
