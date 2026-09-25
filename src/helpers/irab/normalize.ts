/**
 * Normalizes fully-diacritized Arabic text for comparison, so the free-text
 * parser's exact-match-against-user-input strategy isn't defeated by
 * legitimate tashkeel convention differences between the user's input and
 * CAMeL Tools' own diacritization output. Each step here is a well-defined
 * orthographic rule, not a guess:
 *
 * 1. Explicit sukun (\u0652) marks "no vowel" — the same thing a bare consonant
 *    (no diacritic at all) means. Different tools/typists mark it
 *    differently for the same word; stripping it makes both equivalent.
 * 2. The shadda marking sun-letter assimilation after the definite article
 *    ("الطَّالِبُ" vs "الطالِبُ", "الدَّرْسَ" vs "الدَرْسَ") is always redundant —
 *    it never changes the word, only whether the reader's own knowledge
 *    that ط/د/س/… are sun letters is spelled out, and CAMeL Tools is
 *    inconsistent about marking it at all. Only the *shadda* is stripped
 *    there, never the letter's own vowel: a real case found live —
 *    "الزَّهْرَةَ" ("the flower", root ز ه ر, lemma زَهْر) vs a *different* word
 *    "الزُّهْرَةَ"/"الزُهْرَةَ" ("Venus"/another sense, same root, lemma زُهْرَة) —
 *    is genuinely disambiguated by that vowel (damma vs fatha) alone, so an
 *    earlier version of this rule that dropped the vowel too was creating a
 *    false "ambiguous — 2 roots" match between two words that don't
 *    actually share a spelling once the assimilation shadda is set aside.
 * 3. A short vowel immediately before its matching long-vowel letter is
 *    redundant (matres lectionis: فَتْحَة before ا, كَسْرَة before ي, ضَمَّة
 *    before و already implies that letter's sound) — "كِتَاب" vs "كِتاب" is
 *    the same word. This is a standard, well-established convention, not a
 *    heuristic.
 * 4. Diacritic *order* on a single letter (e.g. shadda-then-fatha vs
 *    fatha-then-shadda) is a typing-convention difference, not a meaning
 *    difference — sorted per letter so order doesn't affect comparison.
 * 5. Accusative indefinite tanwin's silent "support alif" ("كِتَابًا") can
 *    carry the fathatan mark on either side of itself — CAMeL's own diac
 *    puts it ON the alif ("كِتاباً": bare ب, fathatan on ا), while standard
 *    typing puts it on the preceding consonant ("كِتَابًا": fathatan on ب,
 *    bare ا) — confirmed live, same word, both real. Canonicalized onto the
 *    alif (CAMeL's own convention) so both forms compare equal; only fires
 *    at the very end of the string, since tanwin is always a word-final
 *    grammatical marker.
 *
 * This does NOT strip shadda elsewhere (e.g. "دَرَّسَ" taught vs "دَرَسَ"
 * studied stay distinct) — only the specific sun-letter-assimilation case.
 */

const SUKUN = "\u0652";
const SHADDA = "\u0651";
const SUN_LETTERS = "تثدذرزسشصضطظلن";
const DIACRITIC_RANGE = /[\u064B-\u0652\u0670]/;
const REDUNDANT_SHORT_VOWEL_RE = /(\u064E(?=ا)|\u0650(?=ي)|\u064F(?=و))/g;
// A shadda may sit between them on a doubled final letter (حَارًّا، سِنًّا).
const FATHATAN_BEFORE_SUPPORT_ALIF_RE = /\u064B(\u0651?)(ا)$/;

// CAMeL's diac is inconsistent about marking the sun-letter position at all
// — sometimes bare, sometimes shadda-only, sometimes vowel-only — e.g.
// "الطَّالِبُ" -> "الطالِبُ" (bare) but "الدَّرْسَ" -> "الدَرْسَ" (vowel, no
// shadda). Captures the sun letter's own diacritic run so only the shadda
// within it can be dropped (see rule 2 above) — the vowel itself stays, and
// still gets a chance to be caught separately by the matres-lectionis rule
// below when applicable (e.g. "الطَّا..." -> "الطَا..." -> "الطا..." for the
// ط+ا case, same end result as before for that example).
// Optional attached proclitics before the article: a conjunction (و/ف) and/or
// a preposition (ب/ك/ل), each with its own vowel — "وَالطَّالِبُ", "بِالطَّالِبِ",
// "لِلطَّالِبِ" (لِ + الـ contracts to لِلـ). Confirmed live that anchoring at the
// start of the word made every such word fail to match CAMeL at all.
const SUN_LETTER_RE = new RegExp(`^((?:[وف][\u064B-\u0652]*)?(?:[بكل][\u064B-\u0652]*)?)(ا?ل)([${SUN_LETTERS}])([\u064B-\u0652]*)`);

interface LetterGroup {
  base: string;
  marks: string[]; // sorted
}

function splitIntoLetterGroups(text: string): LetterGroup[] {
  const groups: LetterGroup[] = [];
  let i = 0;
  while (i < text.length) {
    const base = text[i];
    i++;
    const marks: string[] = [];
    while (i < text.length && DIACRITIC_RANGE.test(text[i])) {
      marks.push(text[i]);
      i++;
    }
    marks.sort();
    groups.push({ base, marks });
  }
  return groups;
}

// 6. Hamzat al-wasl: the vowel on a word-initial plain alif (اِجْتَهَدَ، اُكْتُبْ) is
//    only heard when the word starts speech; CAMeL writes it, typists usually
//    don't. It never distinguishes two words, so it's dropped (and ٱ → ا).
const WASL_RE = /^((?:[وف][\u064B-\u0652]*)?(?:[بكل][\u064B-\u0652]*)?)[اٱ][\u064B-\u0652]*/;

export function normalizeForMatch(text: string): string {
  let result = text.normalize("NFC").replace(WASL_RE, "$1ا");
  result = result.replaceAll(SUKUN, "");
  result = result.replace(SUN_LETTER_RE, (_m, proclitics, article, letter, marks) => proclitics + article + letter + marks.replaceAll(SHADDA, ""));
  result = result.replace(REDUNDANT_SHORT_VOWEL_RE, "");
  result = result.replace(FATHATAN_BEFORE_SUPPORT_ALIF_RE, "$1$2\u064B");
  return splitIntoLetterGroups(result)
    .map((g) => g.base + g.marks.join(""))
    .join("");
}

export function diacriticsMatch(a: string, b: string): boolean {
  return normalizeForMatch(a) === normalizeForMatch(b);
}

/**
 * True on an exact `diacriticsMatch`, or if `candidateDiac` is missing some
 * marks `surface` has — never the reverse, and never a genuinely *different*
 * mark — in one of two well-defined, narrow positions:
 *
 * 1. The final letter: CAMeL Tools' morphological DB is inconsistent about
 *    generating the full case/tanwin-inflected paradigm for proper nouns
 *    (pos "noun_prop") — common nouns/adjectives reliably get all
 *    case-ending forms, but names like "زَيْد", "مُحَمَّد", "بَكْر" (as a name —
 *    the *adjective* بِكْر gets the full paradigm) only have the bare
 *    citation form, so a fully-diacritized "مُحَمَّدٌ" would never get an
 *    exact match otherwise. Also handles the accusative indefinite tanwin's
 *    silent "support alif" ("كِتَابًا", not "كِتَابٌ" + bare fathatan) as its
 *    own letter position.
 * 2. Any letter carrying a shadda: CAMeL's diac is inconsistent about
 *    marking the short vowel that accompanies a shadda at all — e.g.
 *    "تُفَّاحَةً" (apple) comes back as "تُفّاحَةً", shadda with no fatha on the
 *    doubled ف — same underlying DB-entry inconsistency already documented
 *    for the sun-letter-after-"ال" case above, just not limited to that one
 *    position. Missing a *specific* vowel next to a shadda elsewhere would
 *    be a real difference (Form II "دَرَّسَ" taught vs a hypothetical passive
 *    "دُرِّسَ" were taught) — this only tolerates a shadda with *no* vowel at
 *    all standing in for one with a vowel, never one vowel swapped for
 *    another.
 *
 * This never invents anything the case ending or vowel would mean: the
 * free-text parser always assigns caseType from the token's structural
 * position in the sentence (see caseType in free-text-parser.ts), never
 * from a candidate's diac — so tolerating a missing mark here only recovers
 * a root/lemma/POS CAMeL already knows, never a grammatical claim CAMeL
 * didn't make.
 */
const TANWIN_FATH = "\u064B";
const SHORT_VOWELS = new Set(["\u064E", "\u064F", "\u0650"]); // fatha, damma, kasra — not tanwin, not shadda/sukun

// Canonical form after normalizeForMatch's rule 5 (fathatan lives on the
// support alif itself: "...اً", alif then fathatan).
const SUPPORT_ALIF_SUFFIX = "ا" + TANWIN_FATH;

function stripTanwinSupportAlif(surface: string, candidate: string): string {
  // Only strip the trailing "اً" when the candidate doesn't already have it
  // — otherwise this would wrongly shorten a surface that's genuinely
  // matched letter-for-letter (including its own tanwin ending) already.
  if (surface.endsWith(SUPPORT_ALIF_SUFFIX) && !candidate.endsWith(SUPPORT_ALIF_SUFFIX)) {
    return surface.slice(0, -2);
  }
  return surface;
}

export function candidateMatchesSurface(candidateDiac: string, surface: string): boolean {
  const normCandidate = normalizeForMatch(candidateDiac);
  const normSurfaceFull = normalizeForMatch(surface);
  if (normCandidate === normSurfaceFull) return true;

  const normSurface = stripTanwinSupportAlif(normSurfaceFull, normCandidate);
  const candidateLetters = splitIntoLetterGroups(normCandidate);
  const surfaceLetters = splitIntoLetterGroups(normSurface);
  if (candidateLetters.length !== surfaceLetters.length) return false;

  return candidateLetters.every((c, i) => {
    const s = surfaceLetters[i];
    if (c.base !== s.base) return false;
    if (c.marks.join("") === s.marks.join("")) return true;
    if (!c.marks.every((m) => s.marks.includes(m))) return false; // candidate must never have a mark surface lacks
    const missing = s.marks.filter((m) => !c.marks.includes(m));
    const isLastLetter = i === candidateLetters.length - 1;
    if (isLastLetter) return true; // any missing trailing mark(s) tolerated
    return s.marks.includes(SHADDA) && missing.length === 1 && SHORT_VOWELS.has(missing[0]);
  });
}
