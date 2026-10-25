import type { BilingualText, Flashcard, FlashcardBook } from "@/types";
import { PIK_EDITION } from "./sources";

/**
 * al-Muqaddimah al-Ājurrūmiyyah (المُقَدِّمَةُ الآجُرُّومِيَّةُ) by Ibn Ājurrūm — one deck
 * per bāb (the signs of iʿrāb split into three, the two short objects joined).
 *
 * Arabic: the Mutūn Ṭālib al-ʿIlm edition as printed. English: our translation,
 * with the usual transliterated terms (rafʿ, naṣb, khafḍ, jazm …) — the edition
 * has none. `page` is the edition's printed page number.
 */

const t = (en: string, ar: string): BilingualText => ({ en, ar });

const LABELS: BilingualText[] = [
  t("Speech (al-Kalām)", "الكَلَامُ"),
  t("Iʿrāb", "بَابُ الإِعْرَابِ"),
  t("Signs of Rafʿ", "عَلَامَاتُ الرَّفْعِ"),
  t("Signs of Naṣb", "عَلَامَاتُ النَّصْبِ"),
  t("Signs of Khafḍ and Jazm", "عَلَامَاتُ الخَفْضِ وَالجَزْمِ"),
  t("The Inflected Words", "فَصْلٌ: المُعْرَبَاتُ"),
  t("The Verbs", "بَابُ الأَفْعَالِ"),
  t("The Raised Nouns", "بَابُ مَرْفُوعَاتِ الأَسْمَاءِ"),
  t("The Doer (al-Fāʿil)", "بَابُ الفَاعِلِ"),
  t("The Deputy of the Doer", "بَابُ المَفْعُولِ الَّذِي لَمْ يُسَمَّ فَاعِلُهُ"),
  t("The Subject and Predicate", "بَابُ المُبْتَدَأِ وَالخَبَرِ"),
  t("Words that Enter on the Subject and Predicate", "بَابُ العَوَامِلِ الدَّاخِلَةِ عَلَى المُبْتَدَأِ وَالخَبَرِ"),
  t("The Adjective (an-Naʿt)", "بَابُ النَّعْتِ"),
  t("Conjunction (al-ʿAṭf)", "بَابُ العَطْفِ"),
  t("Emphasis (at-Tawkīd)", "بَابُ التَّوْكِيدِ"),
  t("Substitution (al-Badal)", "بَابُ البَدَلِ"),
  t("The Nouns in Naṣb", "بَابُ مَنْصُوبَاتِ الأَسْمَاءِ"),
  t("The Direct Object", "بَابُ المَفْعُولِ بِهِ"),
  t("The Verbal Noun (al-Maṣdar)", "بَابُ المَصْدَرِ"),
  t("Adverbs of Time and Place", "بَابُ ظَرْفِ الزَّمَانِ وَظَرْفِ المَكَانِ"),
  t("The Circumstantial (al-Ḥāl)", "بَابُ الحَالِ"),
  t("The Specifier (at-Tamyīz)", "بَابُ التَّمْيِيزِ"),
  t("Exception (al-Istithnāʾ)", "بَابُ الاسْتِثْنَاءِ"),
  t("The Lā of Negation", "بَابُ لَا"),
  t("The Vocative (al-Munādā)", "بَابُ المُنَادَى"),
  t("The Objects of Reason and Accompaniment", "المَفْعُولُ مِنْ أَجْلِهِ، وَالمَفْعُولُ مَعَهُ"),
  t("The Nouns in Khafḍ", "بَابُ مَخْفُوضَاتِ الأَسْمَاءِ"),
];

const TITLES: BilingualText[] = [
  t("Speech, its three parts, and the signs of each", "الكَلَامُ وَأَقْسَامُهُ، وَعَلَامَاتُ الاسْمِ وَالفِعْلِ وَالحَرْفِ"),
  t("What iʿrāb is, and its four kinds", "تَعْرِيفُ الإِعْرَابِ، وَأَقْسَامُهُ الأَرْبَعَةُ"),
  t("The four signs of rafʿ and where each is found", "عَلَامَاتُ الرَّفْعِ الأَرْبَعُ وَمَوَاضِعُهَا"),
  t("The five signs of naṣb and where each is found", "عَلَامَاتُ النَّصْبِ الخَمْسُ وَمَوَاضِعُهَا"),
  t("The signs of khafḍ and of jazm, and where each is found", "عَلَامَاتُ الخَفْضِ وَالجَزْمِ وَمَوَاضِعُهَا"),
  t("Words inflected with vowels, and words inflected with letters", "مَا يُعْرَبُ بِالحَرَكَاتِ، وَمَا يُعْرَبُ بِالحُرُوفِ"),
  t("Past, present and command; what puts the present verb in naṣb and jazm", "المَاضِي وَالمُضَارِعُ وَالأَمْرُ، وَنَوَاصِبُ المُضَارِعِ وَجَوَازِمُهُ"),
  t("The seven nouns in rafʿ", "المَرْفُوعَاتُ السَّبْعَةُ"),
  t("The fāʿil — explicit and pronoun", "الفَاعِلُ: الظَّاهِرُ وَالمُضْمَرُ"),
  t("The object whose doer is not named", "المَفْعُولُ الَّذِي لَمْ يُسَمَّ فَاعِلُهُ"),
  t("The mubtadaʾ and the khabar, and their kinds", "المُبْتَدَأُ وَالخَبَرُ وَأَقْسَامُهُمَا"),
  t("Kāna, inna and ẓanantu, and their sisters", "كَانَ وَأَخَوَاتُهَا، وَإِنَّ وَأَخَوَاتُهَا، وَظَنَنْتُ وَأَخَوَاتُهَا"),
  t("The adjective; definite and indefinite nouns", "النَّعْتُ، وَالمَعْرِفَةُ وَالنَّكِرَةُ"),
  t("The ten particles of conjunction", "حُرُوفُ العَطْفِ العَشَرَةُ"),
  t("Emphasis and its known words", "التَّوْكِيدُ وَأَلْفَاظُهُ"),
  t("Substitution and its four kinds", "البَدَلُ وَأَقْسَامُهُ الأَرْبَعَةُ"),
  t("The fourteen nouns in naṣb", "المَنْصُوبَاتُ الأَرْبَعَةَ عَشَرَ"),
  t("The mafʿūl bihi — explicit and pronoun", "المَفْعُولُ بِهِ: الظَّاهِرُ وَالمُضْمَرُ"),
  t("The maṣdar, verbal and in meaning", "المَصْدَرُ: اللَّفْظِيُّ وَالمَعْنَوِيُّ"),
  t("Nouns of time and place in naṣb", "ظَرْفُ الزَّمَانِ وَظَرْفُ المَكَانِ"),
  t("The ḥāl and its conditions", "الحَالُ وَشُرُوطُهُ"),
  t("The tamyīz and its conditions", "التَّمْيِيزُ وَشُرُوطُهُ"),
  t("The particles of exception and the case of what follows them", "أَدَوَاتُ الاسْتِثْنَاءِ وَحُكْمُ المُسْتَثْنَى"),
  t("When lā puts the indefinite noun in naṣb", "مَتَى تَنْصِبُ «لَا» النَّكِرَةَ"),
  t("The five kinds of vocative", "أَنْوَاعُ المُنَادَى الخَمْسَةُ"),
  t("The object for whose sake, and the object in whose company", "المَفْعُولُ مِنْ أَجْلِهِ، وَالمَفْعُولُ مَعَهُ"),
  t("The three nouns in khafḍ", "المَخْفُوضَاتُ الثَّلَاثَةُ"),
];

/** First and last printed page of each deck. */
const PAGES: [number, number][] = [
  [65, 66],
  [67, 67],
  [68, 69],
  [70, 71],
  [72, 73],
  [74, 75],
  [76, 77],
  [78, 78],
  [79, 80],
  [81, 82],
  [83, 84],
  [85, 87],
  [88, 89],
  [90, 90],
  [91, 91],
  [92, 92],
  [93, 93],
  [94, 95],
  [96, 96],
  [97, 98],
  [99, 99],
  [100, 100],
  [101, 102],
  [103, 103],
  [104, 104],
  [105, 107],
  [108, 109],
];

const opening = (i: number, page: number, front: BilingualText): Flashcard => ({ kind: "principle", page, front, back: TITLES[i] });

const CARDS: Flashcard[][] = [
  // ───────────── 1 · al-Kalām ─────────────
  [
    opening(0, 65, t("What does the first chapter cover?", "مَاذَا يَتَنَاوَلُ البَابُ الأَوَّلُ؟")),
    {
      kind: "term",
      page: 65,
      front: t("What is speech (al-kalām)?", "مَا الكَلَامُ؟"),
      back: t("The utterance that is compound and gives meaning, by (Arabic) convention.", "«هُوَ اللَّفْظُ، المُرَكَّبُ، المُفِيدُ بِالوَضْعِ»"),
    },
    {
      kind: "cloze",
      page: 65,
      front: t("“Speech is the utterance, ______, giving meaning, by convention.”", "«الكَلَامُ: هُوَ اللَّفْظُ، ______، المُفِيدُ بِالوَضْعِ»"),
      back: t("compound", "المُرَكَّبُ"),
    },
    {
      kind: "list",
      page: 65,
      front: t("What are the three parts of speech?", "مَا أَقْسَامُ الكَلَامِ الثَّلَاثَةُ؟"),
      back: t("A noun (ism), a verb (fiʿl), and a particle that has come for a meaning (ḥarf).", "«اسْمٌ، وَفِعْلٌ، وَحَرْفٌ جَاءَ لِمَعْنًى»"),
    },
    {
      kind: "list",
      page: 65,
      front: t("By what is the noun recognised?", "بِمَ يُعْرَفُ الاسْمُ؟"),
      back: t(
        "By khafḍ, by tanwīn, by the alif and lām entering it, and by the particles of khafḍ and of oath.",
        "«بِالخَفْضِ، وَالتَّنْوِينِ، وَدُخُولِ الأَلِفِ وَاللَّامِ عَلَيْهِ. وَحُرُوفِ الخَفْضِ … وَحُرُوفِ القَسَمِ»",
      ),
    },
    {
      kind: "list",
      page: 65,
      front: t("What are the particles of khafḍ the author lists here?", "مَا حُرُوفُ الخَفْضِ الَّتِي ذَكَرَهَا هُنَا؟"),
      back: t("min, ilā, ʿan, ʿalā, fī, rubba; and the bāʾ, the kāf and the lām.", "«مِنْ، وَإِلَى، وَعَنْ، وَعَلَى، وَفِي، وَرُبَّ. وَالبَاءُ، وَالكَافُ، وَاللَّامُ»"),
    },
    {
      kind: "list",
      page: 65,
      front: t("What are the particles of oath (qasam)?", "مَا حُرُوفُ القَسَمِ؟"),
      back: t("The wāw, the bāʾ and the tāʾ.", "«الوَاوُ، وَالبَاءُ، وَالتَّاءُ»"),
    },
    {
      kind: "list",
      page: 66,
      front: t("By what is the verb recognised?", "بِمَ يُعْرَفُ الفِعْلُ؟"),
      back: t("By qad, the sīn, sawfa, and the silent tāʾ of the feminine.", "«بِقَدْ، وَالسِّينِ، وَسَوْفَ، وَتَاءِ التَّأْنِيثِ السَّاكِنَةِ»"),
    },
    {
      kind: "cloze",
      page: 66,
      front: t("The verb is known by qad, the sīn, sawfa, and the ______ tāʾ of the feminine.", "يُعْرَفُ الفِعْلُ بِقَدْ، وَالسِّينِ، وَسَوْفَ، وَتَاءِ التَّأْنِيثِ ______"),
      back: t("silent (sākinah)", "السَّاكِنَةِ"),
    },
    {
      kind: "term",
      page: 66,
      front: t("What is the particle (ḥarf)?", "مَا الحَرْفُ؟"),
      back: t("That with which neither the sign of the noun nor the sign of the verb is fitting.", "«مَا لَا يَصْلُحُ مَعَهُ دَلِيلُ الاسْمِ، وَلَا دَلِيلُ الفِعْلِ»"),
    },
  ],

  // ───────────── 2 · Iʿrāb ─────────────
  [
    opening(1, 67, t("What does the chapter of iʿrāb cover?", "مَاذَا يَتَنَاوَلُ بَابُ الإِعْرَابِ؟")),
    {
      kind: "term",
      page: 67,
      front: t("What is iʿrāb?", "مَا الإِعْرَابُ؟"),
      back: t(
        "Changing the endings of words because of the different governing words (ʿawāmil) that enter upon them — pronounced or understood.",
        "«هُوَ تَغْيِيرُ أَوَاخِرِ الكَلِمِ؛ لِاخْتِلَافِ العَوَامِلِ الدَّاخِلَةِ عَلَيْهَا؛ لَفْظًا أَوْ تَقْدِيرًا»",
      ),
    },
    {
      kind: "cloze",
      page: 67,
      front: t("“…because of the different governing words entering upon them — pronounced or ______.”", "«لِاخْتِلَافِ العَوَامِلِ الدَّاخِلَةِ عَلَيْهَا؛ لَفْظًا أَوْ ______»"),
      back: t("understood (taqdīran)", "تَقْدِيرًا"),
    },
    {
      kind: "point",
      page: 67,
      front: t("What causes the ending of a word to change?", "مَا سَبَبُ تَغَيُّرِ آخِرِ الكَلِمَةِ؟"),
      back: t("The different governing words (ʿawāmil) that enter upon it.", "«لِاخْتِلَافِ العَوَامِلِ الدَّاخِلَةِ عَلَيْهَا»"),
    },
    {
      kind: "list",
      page: 67,
      front: t("What are the four kinds of iʿrāb?", "مَا أَقْسَامُ الإِعْرَابِ الأَرْبَعَةُ؟"),
      back: t("Rafʿ, naṣb, khafḍ and jazm.", "«رَفْعٌ، وَنَصْبٌ، وَخَفْضٌ، وَجَزْمٌ»"),
    },
    {
      kind: "list",
      page: 67,
      front: t("Which kinds of iʿrāb belong to nouns?", "مَا الَّذِي لِلْأَسْمَاءِ مِنْ أَقْسَامِ الإِعْرَابِ؟"),
      back: t("Rafʿ, naṣb and khafḍ — there is no jazm in nouns.", "«الرَّفْعُ، وَالنَّصْبُ، وَالخَفْضُ، وَلَا جَزْمَ فِيهَا»"),
    },
    {
      kind: "list",
      page: 67,
      front: t("Which kinds of iʿrāb belong to verbs?", "مَا الَّذِي لِلْأَفْعَالِ مِنْ أَقْسَامِ الإِعْرَابِ؟"),
      back: t("Rafʿ, naṣb and jazm — there is no khafḍ in verbs.", "«الرَّفْعُ، وَالنَّصْبُ، وَالجَزْمُ، وَلَا خَفْضَ فِيهَا»"),
    },
    {
      kind: "point",
      page: 67,
      front: t("Which kind of iʿrāb is found only in nouns, and which only in verbs?", "أَيُّ أَقْسَامِ الإِعْرَابِ يَخْتَصُّ بِالأَسْمَاءِ، وَأَيُّهَا يَخْتَصُّ بِالأَفْعَالِ؟"),
      back: t("Khafḍ is only in nouns; jazm is only in verbs.", "الخَفْضُ خَاصٌّ بِالأَسْمَاءِ، وَالجَزْمُ خَاصٌّ بِالأَفْعَالِ."),
    },
  ],

  // ───────────── 3 · Signs of rafʿ ─────────────
  [
    opening(2, 68, t("What does this part of “knowing the signs of iʿrāb” cover (1)?", "مَاذَا يَتَنَاوَلُ هَذَا القِسْمُ مِنْ بَابِ مَعْرِفَةِ عَلَامَاتِ الإِعْرَابِ (١)؟")),
    {
      kind: "list",
      page: 68,
      front: t("What are the four signs of rafʿ?", "مَا عَلَامَاتُ الرَّفْعِ الأَرْبَعُ؟"),
      back: t("The ḍammah, the wāw, the alif and the nūn.", "«الضَّمَّةُ، وَالوَاوُ، وَالأَلِفُ، وَالنُّونُ»"),
    },
    {
      kind: "list",
      page: 68,
      front: t("In which four places is the ḍammah the sign of rafʿ?", "فِي أَيِّ أَرْبَعَةِ مَوَاضِعَ تَكُونُ الضَّمَّةُ عَلَامَةً لِلرَّفْعِ؟"),
      back: t(
        "The singular noun, the broken plural, the sound feminine plural, and the present verb with nothing attached to its end.",
        "«فِي الاسْمِ المُفْرَدِ، وَجَمْعِ التَّكْسِيرِ، وَجَمْعِ المُؤَنَّثِ السَّالِمِ، وَالفِعْلِ المُضَارِعِ الَّذِي لَمْ يَتَّصِلْ بِآخِرِهِ شَيْءٌ»",
      ),
    },
    {
      kind: "list",
      page: 68,
      front: t("In which two places is the wāw the sign of rafʿ?", "فِي أَيِّ مَوْضِعَيْنِ تَكُونُ الوَاوُ عَلَامَةً لِلرَّفْعِ؟"),
      back: t("The sound masculine plural, and the five nouns.", "«فِي جَمْعِ المُذَكَّرِ السَّالِمِ، وَفِي الأَسْمَاءِ الخَمْسَةِ»"),
    },
    {
      kind: "list",
      page: 68,
      front: t("What are the five nouns?", "مَا الأَسْمَاءُ الخَمْسَةُ؟"),
      back: t("Abūka, akhūka, ḥamūki, fūka, and dhū māl.", "«أَبُوكَ، وَأَخُوكَ، وَحَمُوكِ، وَفُوكَ، وَذُو مَالٍ»"),
    },
    {
      kind: "point",
      page: 69,
      front: t("Where is the alif the sign of rafʿ?", "أَيْنَ تَكُونُ الأَلِفُ عَلَامَةً لِلرَّفْعِ؟"),
      back: t("In the dual of nouns only.", "«فِي: تَثْنِيَةِ الأَسْمَاءِ خَاصَّةً»"),
    },
    {
      kind: "cloze",
      page: 69,
      front: t("“The alif is a sign of rafʿ in the dual of nouns ______.”", "«وَأَمَّا الأَلِفُ؛ فَتَكُونُ عَلَامَةً لِلرَّفْعِ فِي: تَثْنِيَةِ الأَسْمَاءِ ______»"),
      back: t("only", "خَاصَّةً"),
    },
    {
      kind: "point",
      page: 69,
      front: t("Where is the nūn the sign of rafʿ?", "أَيْنَ تَكُونُ النُّونُ عَلَامَةً لِلرَّفْعِ؟"),
      back: t(
        "In the present verb when a dual pronoun, a plural pronoun, or the pronoun of the addressed female is attached to it.",
        "«فِي: الفِعْلِ المُضَارِعِ إِذَا اتَّصَلَ بِهِ ضَمِيرُ تَثْنِيَةٍ، أَوْ ضَمِيرُ جَمْعٍ، أَوْ ضَمِيرُ المُؤَنَّثَةِ المُخَاطَبَةِ»",
      ),
    },
  ],

  // ───────────── 4 · Signs of naṣb ─────────────
  [
    opening(3, 70, t("What does this part of “knowing the signs of iʿrāb” cover (2)?", "مَاذَا يَتَنَاوَلُ هَذَا القِسْمُ مِنْ بَابِ مَعْرِفَةِ عَلَامَاتِ الإِعْرَابِ (٢)؟")),
    {
      kind: "list",
      page: 70,
      front: t("What are the five signs of naṣb?", "مَا عَلَامَاتُ النَّصْبِ الخَمْسُ؟"),
      back: t("The fatḥah, the alif, the kasrah, the yāʾ, and dropping the nūn.", "«الفَتْحَةُ، وَالأَلِفُ، وَالكَسْرَةُ، وَاليَاءُ، وَحَذْفُ النُّونِ»"),
    },
    {
      kind: "list",
      page: 70,
      front: t("In which three places is the fatḥah the sign of naṣb?", "فِي أَيِّ ثَلَاثَةِ مَوَاضِعَ تَكُونُ الفَتْحَةُ عَلَامَةً لِلنَّصْبِ؟"),
      back: t(
        "The singular noun, the broken plural, and the present verb when a nāṣib enters on it and nothing is attached to its end.",
        "«فِي الاسْمِ المُفْرَدِ، وَجَمْعِ التَّكْسِيرِ، وَالفِعْلِ المُضَارِعِ إِذَا دَخَلَ عَلَيْهِ نَاصِبٌ وَلَمْ يَتَّصِلْ بِآخِرِهِ شَيْءٌ»",
      ),
    },
    {
      kind: "example",
      page: 70,
      front: t("Where is the alif the sign of naṣb — and what is the author's example?", "أَيْنَ تَكُونُ الأَلِفُ عَلَامَةً لِلنَّصْبِ؟ وَمَا مِثَالُ المُؤَلِّفِ؟"),
      back: t("In the five nouns — e.g. “raʾaytu abāka wa-akhāka” (I saw your father and your brother).", "«فِي: الأَسْمَاءِ الخَمْسَةِ؛ نَحْوُ: رَأَيْتُ أَبَاكَ وَأَخَاكَ»"),
    },
    {
      kind: "point",
      page: 70,
      front: t("Where is the kasrah the sign of naṣb?", "أَيْنَ تَكُونُ الكَسْرَةُ عَلَامَةً لِلنَّصْبِ؟"),
      back: t("In the sound feminine plural.", "«فِي: جَمْعِ المُؤَنَّثِ السَّالِمِ»"),
    },
    {
      kind: "point",
      page: 70,
      front: t("Where is the yāʾ the sign of naṣb?", "أَيْنَ تَكُونُ اليَاءُ عَلَامَةً لِلنَّصْبِ؟"),
      back: t("In the dual and the (sound masculine) plural.", "«فِي: التَّثْنِيَةِ، وَالجَمْعِ»"),
    },
    {
      kind: "point",
      page: 71,
      front: t("Where is dropping the nūn the sign of naṣb?", "أَيْنَ يَكُونُ حَذْفُ النُّونِ عَلَامَةً لِلنَّصْبِ؟"),
      back: t("In the five verbs whose rafʿ is by keeping the nūn.", "«فِي الأَفْعَالِ الخَمْسَةِ الَّتِي رَفْعُهَا بِثَبَاتِ النُّونِ»"),
    },
  ],

  // ───────────── 5 · Signs of khafḍ and jazm ─────────────
  [
    opening(4, 72, t("What does this part of “knowing the signs of iʿrāb” cover (3)?", "مَاذَا يَتَنَاوَلُ هَذَا القِسْمُ مِنْ بَابِ مَعْرِفَةِ عَلَامَاتِ الإِعْرَابِ (٣)؟")),
    {
      kind: "list",
      page: 72,
      front: t("What are the three signs of khafḍ?", "مَا عَلَامَاتُ الخَفْضِ الثَّلَاثُ؟"),
      back: t("The kasrah, the yāʾ and the fatḥah.", "«الكَسْرَةُ، وَاليَاءُ، وَالفَتْحَةُ»"),
    },
    {
      kind: "list",
      page: 72,
      front: t("In which three places is the kasrah the sign of khafḍ?", "فِي أَيِّ ثَلَاثَةِ مَوَاضِعَ تَكُونُ الكَسْرَةُ عَلَامَةً لِلْخَفْضِ؟"),
      back: t(
        "The fully declinable (munṣarif) singular noun, the fully declinable broken plural, and the sound feminine plural.",
        "«فِي الاسْمِ المُفْرَدِ المُنْصَرِفِ، وَجَمْعِ التَّكْسِيرِ المُنْصَرِفِ، وَجَمْعِ المُؤَنَّثِ السَّالِمِ»",
      ),
    },
    {
      kind: "list",
      page: 72,
      front: t("In which three places is the yāʾ the sign of khafḍ?", "فِي أَيِّ ثَلَاثَةِ مَوَاضِعَ تَكُونُ اليَاءُ عَلَامَةً لِلْخَفْضِ؟"),
      back: t("The five nouns, the dual, and the (sound masculine) plural.", "«فِي الأَسْمَاءِ الخَمْسَةِ، وَفِي التَّثْنِيَةِ، وَالجَمْعِ»"),
    },
    {
      kind: "point",
      page: 72,
      front: t("Where is the fatḥah the sign of khafḍ?", "أَيْنَ تَكُونُ الفَتْحَةُ عَلَامَةً لِلْخَفْضِ؟"),
      back: t("In the noun that is not fully declinable (lā yanṣarif).", "«فِي: الاسْمِ الَّذِي لَا يَنْصَرِفُ»"),
    },
    {
      kind: "list",
      page: 73,
      front: t("What are the two signs of jazm?", "مَا عَلَامَتَا الجَزْمِ؟"),
      back: t("The sukūn and dropping (al-ḥadhf).", "«السُّكُونُ، وَالحَذْفُ»"),
    },
    {
      kind: "point",
      page: 73,
      front: t("Where is the sukūn the sign of jazm?", "أَيْنَ يَكُونُ السُّكُونُ عَلَامَةً لِلْجَزْمِ؟"),
      back: t("In the present verb with a sound (non-weak) final letter.", "«فِي: الفِعْلِ المُضَارِعِ الصَّحِيحِ الآخِرِ»"),
    },
    {
      kind: "point",
      page: 73,
      front: t("Where is dropping the sign of jazm?", "أَيْنَ يَكُونُ الحَذْفُ عَلَامَةً لِلْجَزْمِ؟"),
      back: t(
        "In the present verb with a weak final letter, and in the verbs whose rafʿ is by keeping the nūn.",
        "«فِي: الفِعْلِ المُضَارِعِ المُعْتَلِّ الآخِرِ، وَفِي الأَفْعَالِ الَّتِي رَفْعُهَا بِثَبَاتِ النُّونِ»",
      ),
    },
  ],

  // ───────────── 6 · The inflected words ─────────────
  [
    opening(5, 74, t("What does the section on inflected words (al-muʿrabāt) cover?", "مَاذَا يَتَنَاوَلُ فَصْلُ المُعْرَبَاتِ؟")),
    {
      kind: "list",
      page: 74,
      front: t("Into which two divisions do the inflected words fall?", "مَا قِسْمَا المُعْرَبَاتِ؟"),
      back: t("Those inflected with vowels (ḥarakāt), and those inflected with letters (ḥurūf).", "«قِسْمٌ يُعْرَبُ بِالحَرَكَاتِ، وَقِسْمٌ يُعْرَبُ بِالحُرُوفِ»"),
    },
    {
      kind: "list",
      page: 74,
      front: t("What are the four kinds inflected with vowels?", "مَا الأَنْوَاعُ الأَرْبَعَةُ الَّتِي تُعْرَبُ بِالحَرَكَاتِ؟"),
      back: t(
        "The singular noun, the broken plural, the sound feminine plural, and the present verb with nothing attached to its end.",
        "«الاسْمُ المُفْرَدُ، وَجَمْعُ التَّكْسِيرِ، وَجَمْعُ المُؤَنَّثِ السَّالِمُ، وَالفِعْلُ المُضَارِعُ الَّذِي لَمْ يَتَّصِلْ بِآخِرِهِ شَيْءٌ»",
      ),
    },
    {
      kind: "point",
      page: 74,
      front: t("What is the rule for all of those inflected with vowels?", "مَا حُكْمُ مَا يُعْرَبُ بِالحَرَكَاتِ؟"),
      back: t("Rafʿ with the ḍammah, naṣb with the fatḥah, khafḍ with the kasrah, and jazm with the sukūn.", "«تُرْفَعُ بِالضَّمَّةِ، وَتُنْصَبُ بِالفَتْحَةِ، وَتُخْفَضُ بِالكَسْرَةِ، وَتُجْزَمُ بِالسُّكُونِ»"),
    },
    {
      kind: "list",
      page: 74,
      front: t("Which three things are exceptions to that rule?", "مَا الأَشْيَاءُ الثَّلَاثَةُ الخَارِجَةُ عَنْ ذَلِكَ؟"),
      back: t(
        "The sound feminine plural takes naṣb with the kasrah; the noun that is not fully declinable takes khafḍ with the fatḥah; the present verb with a weak ending takes jazm by dropping its last letter.",
        "«جَمْعُ المُؤَنَّثِ السَّالِمُ؛ يُنْصَبُ بِالكَسْرَةِ، وَالاسْمُ الَّذِي لَا يَنْصَرِفُ؛ يُخْفَضُ بِالفَتْحَةِ، وَالفِعْلُ المُضَارِعُ المُعْتَلُّ الآخِرِ؛ يُجْزَمُ بِحَذْفِ آخِرِهِ»",
      ),
    },
    {
      kind: "list",
      page: 75,
      front: t("What are the four kinds inflected with letters?", "مَا الأَنْوَاعُ الأَرْبَعَةُ الَّتِي تُعْرَبُ بِالحُرُوفِ؟"),
      back: t("The dual, the sound masculine plural, the five nouns, and the five verbs.", "«التَّثْنِيَةُ، وَجَمْعُ المُذَكَّرِ السَّالِمُ، وَالأَسْمَاءُ الخَمْسَةُ، وَالأَفْعَالُ الخَمْسَةُ»"),
    },
    {
      kind: "list",
      page: 75,
      front: t("What are the five verbs?", "مَا الأَفْعَالُ الخَمْسَةُ؟"),
      back: t("Yafʿalāni, tafʿalāni, yafʿalūna, tafʿalūna and tafʿalīna.", "«يَفْعَلَانِ، وَتَفْعَلَانِ، وَيَفْعَلُونَ، وَتَفْعَلُونَ، وَتَفْعَلِينَ»"),
    },
    {
      kind: "point",
      page: 75,
      front: t("How is the dual inflected?", "كَيْفَ تُعْرَبُ التَّثْنِيَةُ؟"),
      back: t("Rafʿ with the alif; naṣb and khafḍ with the yāʾ.", "«فَتُرْفَعُ بِالأَلِفِ، وَتُنْصَبُ وَتُخْفَضُ بِاليَاءِ»"),
    },
    {
      kind: "point",
      page: 75,
      front: t("How is the sound masculine plural inflected?", "كَيْفَ يُعْرَبُ جَمْعُ المُذَكَّرِ السَّالِمُ؟"),
      back: t("Rafʿ with the wāw; naṣb and khafḍ with the yāʾ.", "«فَيُرْفَعُ بِالوَاوِ، وَيُنْصَبُ وَيُخْفَضُ بِاليَاءِ»"),
    },
    {
      kind: "point",
      page: 75,
      front: t("How are the five nouns inflected?", "كَيْفَ تُعْرَبُ الأَسْمَاءُ الخَمْسَةُ؟"),
      back: t("Rafʿ with the wāw, naṣb with the alif, and khafḍ with the yāʾ.", "«فَتُرْفَعُ بِالوَاوِ، وَتُنْصَبُ بِالأَلِفِ، وَتُخْفَضُ بِاليَاءِ»"),
    },
    {
      kind: "point",
      page: 75,
      front: t("How are the five verbs inflected?", "كَيْفَ تُعْرَبُ الأَفْعَالُ الخَمْسَةُ؟"),
      back: t("Rafʿ with the nūn; naṣb and jazm by dropping it.", "«فَتُرْفَعُ بِالنُّونِ، وَتُنْصَبُ وَتُجْزَمُ بِحَذْفِهَا»"),
    },
  ],

  // ───────────── 7 · The verbs ─────────────
  [
    opening(6, 76, t("What does the chapter of the verbs cover?", "مَاذَا يَتَنَاوَلُ بَابُ الأَفْعَالِ؟")),
    {
      kind: "list",
      page: 76,
      front: t("What are the three verbs, with the author's example?", "مَا الأَفْعَالُ الثَّلَاثَةُ؟ وَمَا مِثَالُهَا؟"),
      back: t("Past, present and command — e.g. ḍaraba, yaḍribu, iḍrib.", "«مَاضٍ، وَمُضَارِعٌ، وَأَمْرٌ؛ نَحْوُ: ضَرَبَ، وَيَضْرِبُ، وَاضْرِبْ»"),
    },
    {
      kind: "point",
      page: 76,
      front: t("What is the rule for the past verb's ending?", "مَا حُكْمُ آخِرِ الفِعْلِ المَاضِي؟"),
      back: t("Always with a fatḥah on its end.", "«فَالمَاضِي: مَفْتُوحُ الآخِرِ أَبَدًا»"),
    },
    {
      kind: "point",
      page: 76,
      front: t("What is the rule for the command verb?", "مَا حُكْمُ فِعْلِ الأَمْرِ؟"),
      back: t("Always majzūm.", "«وَالأَمْرُ: مَجْزُومٌ أَبَدًا»"),
    },
    {
      kind: "term",
      page: 76,
      front: t("What is the present verb (al-muḍāriʿ)?", "مَا الفِعْلُ المُضَارِعُ؟"),
      back: t("That which begins with one of the four added letters gathered in the word “anaytu”.", "«مَا كَانَ فِي أَوَّلِهِ إِحْدَى الزَّوَائِدِ الأَرْبَعِ؛ يَجْمَعُهَا قَوْلُكَ: أَنَيْتُ»"),
    },
    {
      kind: "point",
      page: 76,
      front: t("What is the present verb's case — and until when?", "مَا حُكْمُ المُضَارِعِ؟ وَإِلَى مَتَى؟"),
      back: t("Always marfūʿ, until a nāṣib or a jāzim enters on it.", "«وَهُوَ مَرْفُوعٌ أَبَدًا، حَتَّى يَدْخُلَ عَلَيْهِ نَاصِبٌ أَوْ جَازِمٌ»"),
    },
    {
      kind: "list",
      page: 77,
      front: t("What are the ten particles that put the present verb in naṣb (an-nawāṣib)?", "مَا نَوَاصِبُ المُضَارِعِ العَشَرَةُ؟"),
      back: t(
        "An, lan, idhan; kay, the lām of kay, the lām of denial (juḥūd), ḥattā; and the answer with the fāʾ, the wāw and aw.",
        "«أَنْ، وَلَنْ، وَإِذَنْ. وَكَيْ، وَلَامُ كَيْ، وَلَامُ الجُحُودِ، وَحَتَّى. وَالجَوَابُ بِالفَاءِ، وَالوَاوِ، وَأَوْ»",
      ),
    },
    {
      kind: "point",
      page: 77,
      front: t("How many are the particles of jazm (al-jawāzim)?", "كَمْ عَدَدُ الجَوَازِمِ؟"),
      back: t("Eighteen.", "«وَالجَوَازِمُ ثَمَانِيَةَ عَشَرَ»"),
    },
    {
      kind: "list",
      page: 77,
      front: t("What are the eighteen jawāzim?", "مَا الجَوَازِمُ الثَّمَانِيَةَ عَشَرَ؟"),
      back: t(
        "Lam, lammā, alam, alammā; the lām of command and supplication; lā in prohibition and supplication; in, mā, man, mahmā, idhmā; ayy, matā, ayyāna, ayna, annā; ḥaythumā, kayfamā, and idhā in poetry only.",
        "«لَمْ، وَلَمَّا، وَأَلَمْ، وَأَلَمَّا. وَلَامُ الأَمْرِ وَالدُّعَاءِ، وَ“لَا” فِي النَّهْيِ وَالدُّعَاءِ. وَإِنْ، وَمَا، وَمَنْ، وَمَهْمَا، وَإِذْمَا. وَأَيٌّ، وَمَتَى، وَأَيَّانَ، وَأَيْنَ، وَأَنَّى. وَحَيْثُمَا، وَكَيْفَمَا، وَ“إِذَا” فِي الشِّعْرِ خَاصَّةً»",
      ),
    },
    {
      kind: "cloze",
      page: 77,
      front: t("“…ḥaythumā, kayfamā, and idhā ______.”", "«وَحَيْثُمَا، وَكَيْفَمَا، وَ“إِذَا” ______»"),
      back: t("in poetry only", "فِي الشِّعْرِ خَاصَّةً"),
    },
    {
      kind: "cloze",
      page: 77,
      front: t("“…the lām of the command and ______, and lā in prohibition and ______.”", "«وَلَامُ الأَمْرِ وَ______، وَ“لَا” فِي النَّهْيِ وَ______»"),
      back: t("supplication · supplication", "الدُّعَاءِ · الدُّعَاءِ"),
    },
  ],

  // ───────────── 8 · The raised nouns ─────────────
  [
    opening(7, 78, t("What does the chapter of the raised nouns cover?", "مَاذَا يَتَنَاوَلُ بَابُ مَرْفُوعَاتِ الأَسْمَاءِ؟")),
    {
      kind: "point",
      page: 78,
      front: t("How many are the nouns in rafʿ?", "كَمْ عَدَدُ المَرْفُوعَاتِ؟"),
      back: t("Seven.", "«المَرْفُوعَاتُ سَبْعَةٌ»"),
    },
    {
      kind: "list",
      page: 78,
      front: t("What are the seven nouns in rafʿ?", "مَا المَرْفُوعَاتُ السَّبْعَةُ؟"),
      back: t(
        "The fāʿil; the object whose doer is not named; the mubtadaʾ and its khabar; the ism of kāna and its sisters; the khabar of inna and its sisters; and what follows a raised noun.",
        "«الفَاعِلُ، وَالمَفْعُولُ الَّذِي لَمْ يُسَمَّ فَاعِلُهُ. وَالمُبْتَدَأُ، وَخَبَرُهُ. وَاسْمُ “كَانَ” وَأَخَوَاتِهَا. وَخَبَرُ “إِنَّ” وَأَخَوَاتِهَا. وَالتَّابِعُ لِلْمَرْفُوعِ»",
      ),
    },
    {
      kind: "list",
      page: 78,
      front: t("The follower (tābiʿ) of a raised noun is four things — what are they?", "التَّابِعُ لِلْمَرْفُوعِ أَرْبَعَةُ أَشْيَاءَ؛ فَمَا هِيَ؟"),
      back: t("The adjective (naʿt), the conjunction (ʿaṭf), the emphasis (tawkīd) and the substitute (badal).", "«النَّعْتُ، وَالعَطْفُ، وَالتَّوْكِيدُ، وَالبَدَلُ»"),
    },
    {
      kind: "cloze",
      page: 78,
      front: t("Among the raised nouns: “the ism of kāna and its sisters, and the ______ of inna and its sisters.”", "مِنَ المَرْفُوعَاتِ: «وَاسْمُ “كَانَ” وَأَخَوَاتِهَا. وَ______ “إِنَّ” وَأَخَوَاتِهَا»"),
      back: t("khabar", "خَبَرُ"),
    },
    {
      kind: "point",
      page: 78,
      front: t("Of kāna and inna, which one's ism is raised, and which one's khabar?", "أَيُّهُمَا يُرْفَعُ اسْمُهُ: «كَانَ» أَمْ «إِنَّ»؟ وَأَيُّهُمَا يُرْفَعُ خَبَرُهُ؟"),
      back: t("The ism of kāna is raised; the khabar of inna is raised.", "يُرْفَعُ اسْمُ «كَانَ»، وَيُرْفَعُ خَبَرُ «إِنَّ»."),
    },
  ],

  // ───────────── 9 · The fāʿil ─────────────
  [
    opening(8, 79, t("What does the chapter of the fāʿil cover?", "مَاذَا يَتَنَاوَلُ بَابُ الفَاعِلِ؟")),
    {
      kind: "term",
      page: 79,
      front: t("What is the fāʿil?", "مَا الفَاعِلُ؟"),
      back: t("The noun in rafʿ whose verb is mentioned before it.", "«هُوَ الاسْمُ المَرْفُوعُ المَذْكُورُ قَبْلَهُ فِعْلُهُ»"),
    },
    {
      kind: "cloze",
      page: 79,
      front: t("“The fāʿil is the noun in rafʿ whose verb is mentioned ______ it.”", "«الفَاعِلُ: هُوَ الاسْمُ المَرْفُوعُ المَذْكُورُ ______ فِعْلُهُ»"),
      back: t("before", "قَبْلَهُ"),
    },
    {
      kind: "list",
      page: 79,
      front: t("Into which two kinds is the fāʿil divided?", "عَلَى كَمْ قِسْمٍ الفَاعِلُ؟"),
      back: t("Explicit (ẓāhir) and pronoun (muḍmar).", "«ظَاهِرٍ، وَمُضْمَرٍ»"),
    },
    {
      kind: "example",
      page: 79,
      front: t("Give the author's examples of the explicit fāʿil.", "اذْكُرْ أَمْثِلَةَ المُؤَلِّفِ لِلْفَاعِلِ الظَّاهِرِ."),
      back: t(
        "Qāma Zaydun, yaqūmu Zaydun; qāma az-Zaydāni, yaqūmu az-Zaydāni; qāma az-Zaydūna, yaqūmu az-Zaydūna; qāma akhūka, yaqūmu akhūka.",
        "«قَامَ زَيْدٌ، وَيَقُومُ زَيْدٌ. وَقَامَ الزَّيْدَانِ، وَيَقُومُ الزَّيْدَانِ. وَقَامَ الزَّيْدُونَ، وَيَقُومُ الزَّيْدُونَ. وَقَامَ أَخُوكَ، وَيَقُومُ أَخُوكَ»",
      ),
    },
    {
      kind: "list",
      page: 80,
      front: t("How many are the pronoun fāʿils, and what are they (with ḍaraba)?", "كَمْ عَدَدُ الفَاعِلِ المُضْمَرِ؟ وَمَا هِيَ مَعَ «ضَرَبَ»؟"),
      back: t(
        "Twelve: ḍarabtu, ḍarabnā; ḍarabta, ḍarabti, ḍarabtumā, ḍarabtum, ḍarabtunna; ḍaraba, ḍarabat, ḍarabā, ḍarabū, ḍarabna.",
        "اثْنَا عَشَرَ: «ضَرَبْتُ، وَضَرَبْنَا. وَضَرَبْتَ، وَضَرَبْتِ، وَضَرَبْتُمَا، وَضَرَبْتُمْ، وَضَرَبْتُنَّ. وَضَرَبَ، وَضَرَبَتْ، وَضَرَبَا، وَضَرَبُوا، وَضَرَبْنَ»",
      ),
    },
  ],

  // ───────────── 10 · The object whose doer is not named ─────────────
  [
    opening(9, 81, t("What does the chapter of the object whose doer is not named cover?", "مَاذَا يَتَنَاوَلُ بَابُ المَفْعُولِ الَّذِي لَمْ يُسَمَّ فَاعِلُهُ؟")),
    {
      kind: "term",
      page: 81,
      front: t("What is the object whose doer is not named?", "مَا المَفْعُولُ الَّذِي لَمْ يُسَمَّ فَاعِلُهُ؟"),
      back: t("The noun in rafʿ with which its doer is not mentioned.", "«هُوَ الاسْمُ المَرْفُوعُ الَّذِي لَمْ يُذْكَرْ مَعَهُ فَاعِلُهُ»"),
    },
    {
      kind: "point",
      page: 81,
      front: t("If the verb is past, how is it changed?", "إِذَا كَانَ الفِعْلُ مَاضِيًا، كَيْفَ يُغَيَّرُ؟"),
      back: t("Its first letter takes a ḍammah, and the letter before its last takes a kasrah.", "«ضُمَّ أَوَّلُهُ وَكُسِرَ مَا قَبْلَ آخِرِهِ»"),
    },
    {
      kind: "point",
      page: 81,
      front: t("If the verb is present, how is it changed?", "إِذَا كَانَ الفِعْلُ مُضَارِعًا، كَيْفَ يُغَيَّرُ؟"),
      back: t("Its first letter takes a ḍammah, and the letter before its last takes a fatḥah.", "«ضُمَّ أَوَّلُهُ وَفُتِحَ مَا قَبْلَ آخِرِهِ»"),
    },
    {
      kind: "list",
      page: 81,
      front: t("Into which two kinds is it divided?", "عَلَى كَمْ قِسْمٍ هُوَ؟"),
      back: t("Explicit (ẓāhir) and pronoun (muḍmar).", "«ظَاهِرٍ، وَمُضْمَرٍ»"),
    },
    {
      kind: "example",
      page: 81,
      front: t("Give the author's examples of the explicit one.", "اذْكُرْ أَمْثِلَةَ المُؤَلِّفِ لِلظَّاهِرِ مِنْهُ."),
      back: t("Ḍuriba Zaydun, yuḍrabu Zaydun, ukrima ʿAmrun, yukramu ʿAmrun.", "«ضُرِبَ زَيْدٌ، وَيُضْرَبُ زَيْدٌ، وَأُكْرِمَ عَمْرٌو، وَيُكْرَمُ عَمْرٌو»"),
    },
    {
      kind: "list",
      page: 82,
      front: t("What are its twelve pronoun forms (with ḍuriba)?", "مَا صُوَرُهُ المُضْمَرَةُ الاثْنَتَا عَشْرَةَ مَعَ «ضُرِبَ»؟"),
      back: t(
        "Ḍuribtu, ḍuribnā; ḍuribta, ḍuribti, ḍuribtumā, ḍuribtum, ḍuribtunna; ḍuriba, ḍuribat, ḍuribā, ḍuribū, ḍuribna.",
        "«ضُرِبْتُ، وَضُرِبْنَا. وَضُرِبْتَ، وَضُرِبْتِ، وَضُرِبْتُمَا، وَضُرِبْتُمْ، وَضُرِبْتُنَّ. وَضُرِبَ، وَضُرِبَتْ، وَضُرِبَا، وَضُرِبُوا، وَضُرِبْنَ»",
      ),
    },
  ],

  // ───────────── 11 · Mubtadaʾ and khabar ─────────────
  [
    opening(10, 83, t("What does the chapter of the mubtadaʾ and khabar cover?", "مَاذَا يَتَنَاوَلُ بَابُ المُبْتَدَأِ وَالخَبَرِ؟")),
    {
      kind: "term",
      page: 83,
      front: t("What is the mubtadaʾ?", "مَا المُبْتَدَأُ؟"),
      back: t("The noun in rafʿ that is free of any pronounced governing word.", "«هُوَ الاسْمُ المَرْفُوعُ العَارِي عَنِ العَوَامِلِ اللَّفْظِيَّةِ»"),
    },
    {
      kind: "term",
      page: 83,
      front: t("What is the khabar?", "مَا الخَبَرُ؟"),
      back: t("The noun in rafʿ that is predicated of it (the mubtadaʾ).", "«هُوَ الاسْمُ المَرْفُوعُ المُسْنَدُ إِلَيْهِ»"),
    },
    {
      kind: "cloze",
      page: 83,
      front: t("“The mubtadaʾ is the noun in rafʿ ______ any pronounced governing word.”", "«المُبْتَدَأُ: هُوَ الاسْمُ المَرْفُوعُ ______ العَوَامِلِ اللَّفْظِيَّةِ»"),
      back: t("free of", "العَارِي عَنِ"),
    },
    {
      kind: "example",
      page: 83,
      front: t("Give the author's examples of a mubtadaʾ and khabar.", "اذْكُرْ أَمْثِلَةَ المُؤَلِّفِ لِلْمُبْتَدَأِ وَالخَبَرِ."),
      back: t("Zaydun qāʾimun; az-Zaydāni qāʾimāni; az-Zaydūna qāʾimūna.", "«زَيْدٌ قَائِمٌ، وَالزَّيْدَانِ قَائِمَانِ، وَالزَّيْدُونَ قَائِمُونَ»"),
    },
    {
      kind: "list",
      page: 83,
      front: t("Into which two kinds is the mubtadaʾ divided — and what is the explicit one?", "مَا قِسْمَا المُبْتَدَأِ؟ وَمَا الظَّاهِرُ مِنْهُمَا؟"),
      back: t("Explicit and pronoun; the explicit is what has already been mentioned.", "«ظَاهِرٌ، وَمُضْمَرٌ. فَالظَّاهِرُ؛ مَا تَقَدَّمَ ذِكْرُهُ»"),
    },
    {
      kind: "list",
      page: 83,
      front: t("What are the twelve pronoun mubtadaʾs?", "مَا المُبْتَدَأُ المُضْمَرُ الاثْنَا عَشَرَ؟"),
      back: t(
        "Anā, naḥnu; anta, anti, antumā, antum, antunna; huwa, hiya, humā, hum, hunna.",
        "«أَنَا، وَنَحْنُ. وَأَنْتَ، وَأَنْتِ، وَأَنْتُمَا، وَأَنْتُمْ، وَأَنْتُنَّ. وَهُوَ، وَهِيَ، وَهُمَا، وَهُمْ، وَهُنَّ»",
      ),
    },
    {
      kind: "example",
      page: 83,
      front: t("Give the author's example of a pronoun mubtadaʾ.", "اذْكُرْ مِثَالَ المُؤَلِّفِ لِلْمُبْتَدَأِ المُضْمَرِ."),
      back: t("Anā qāʾimun; naḥnu qāʾimūna.", "«أَنَا قَائِمٌ، وَنَحْنُ قَائِمُونَ»"),
    },
    {
      kind: "list",
      page: 84,
      front: t("Into which two kinds is the khabar divided?", "مَا قِسْمَا الخَبَرِ؟"),
      back: t("Single (mufrad) and non-single — e.g. the single: Zaydun qāʾimun.", "«مُفْرَدٌ، وَغَيْرُ مُفْرَدٍ. فَالمُفْرَدُ؛ نَحْوُ قَوْلِكَ: زَيْدٌ قَائِمٌ»"),
    },
    {
      kind: "list",
      page: 84,
      front: t("The non-single khabar is four things — what are they?", "غَيْرُ المُفْرَدِ أَرْبَعَةُ أَشْيَاءَ؛ فَمَا هِيَ؟"),
      back: t(
        "The preposition with its noun; the adverb (ẓarf); the verb with its fāʿil; and a mubtadaʾ with its khabar.",
        "«الجَارُّ وَالمَجْرُورُ، وَالظَّرْفُ، وَالفِعْلُ مَعَ فَاعِلِهِ، وَالمُبْتَدَأُ مَعَ خَبَرِهِ»",
      ),
    },
    {
      kind: "example",
      page: 84,
      front: t("Give the author's four examples of the non-single khabar.", "اذْكُرْ أَمْثِلَةَ المُؤَلِّفِ الأَرْبَعَةَ لِلْخَبَرِ غَيْرِ المُفْرَدِ."),
      back: t(
        "Zaydun fī ad-dār; Zaydun ʿindaka; Zaydun qāma abūhu; Zaydun jāriyatuhu dhāhibatun.",
        "«زَيْدٌ فِي الدَّارِ، وَزَيْدٌ عِنْدَكَ، وَزَيْدٌ قَامَ أَبُوهُ، وَزَيْدٌ جَارِيَتُهُ ذَاهِبَةٌ»",
      ),
    },
  ],

  // ───────────── 12 · Kāna, inna, ẓanantu ─────────────
  [
    opening(11, 85, t("What does the chapter of the words entering on the mubtadaʾ and khabar cover?", "مَاذَا يَتَنَاوَلُ بَابُ العَوَامِلِ الدَّاخِلَةِ عَلَى المُبْتَدَأِ وَالخَبَرِ؟")),
    {
      kind: "list",
      page: 85,
      front: t("What are the three things that enter on the mubtadaʾ and khabar?", "مَا الأَشْيَاءُ الثَّلَاثَةُ الدَّاخِلَةُ عَلَى المُبْتَدَأِ وَالخَبَرِ؟"),
      back: t("Kāna and its sisters, inna and its sisters, and ẓanantu and its sisters.", "«كَانَ وَأَخَوَاتُهَا، وَإِنَّ وَأَخَوَاتُهَا، وَظَنَنْتُ وَأَخَوَاتُهَا»"),
    },
    {
      kind: "point",
      page: 85,
      front: t("What do kāna and its sisters do?", "مَاذَا تَعْمَلُ كَانَ وَأَخَوَاتُهَا؟"),
      back: t("They raise the ism and put the khabar in naṣb.", "«فَإِنَّهَا تَرْفَعُ الاسْمَ، وَتَنْصِبُ الخَبَرَ»"),
    },
    {
      kind: "list",
      page: 85,
      front: t("What are kāna and its sisters?", "مَا كَانَ وَأَخَوَاتُهَا؟"),
      back: t(
        "Kāna, amsā, aṣbaḥa, aḍḥā; ẓalla, bāta, ṣāra, laysa; mā zāla, mā infakka, mā fatiʾa, mā bariḥa, mā dāma.",
        "«كَانَ، وَأَمْسَى، وَأَصْبَحَ، وَأَضْحَى. وَظَلَّ، وَبَاتَ، وَصَارَ، وَلَيْسَ. وَمَا زَالَ، وَمَا انْفَكَّ، وَمَا فَتِئَ، وَمَا بَرِحَ، وَمَا دَامَ»",
      ),
    },
    {
      kind: "example",
      page: 85,
      front: t("Do the conjugated forms of kāna and its sisters work the same way? Give the author's examples.", "هَلْ يَعْمَلُ مَا تَصَرَّفَ مِنْ كَانَ وَأَخَوَاتِهَا العَمَلَ نَفْسَهُ؟ وَمَا أَمْثِلَتُهُ؟"),
      back: t("Yes — e.g. kāna, yakūnu, kun; aṣbaḥa, yuṣbiḥu, aṣbiḥ.", "نَعَمْ؛ «وَمَا تَصَرَّفَ مِنْهَا؛ نَحْوُ: كَانَ وَيَكُونُ وَكُنْ، وَأَصْبَحَ وَيُصْبِحُ وَأَصْبِحْ»"),
    },
    {
      kind: "example",
      page: 85,
      front: t("Give the author's examples for kāna and laysa.", "اذْكُرْ مِثَالَيِ المُؤَلِّفِ لِـ«كَانَ» وَ«لَيْسَ»."),
      back: t("Kāna Zaydun qāʾiman; laysa ʿAmrun shākhiṣan.", "«كَانَ زَيْدٌ قَائِمًا، وَلَيْسَ عَمْرٌو شَاخِصًا»"),
    },
    {
      kind: "point",
      page: 86,
      front: t("What do inna and its sisters do?", "مَاذَا تَعْمَلُ إِنَّ وَأَخَوَاتُهَا؟"),
      back: t("They put the ism in naṣb and raise the khabar.", "«فَإِنَّهَا تَنْصِبُ الاسْمَ وَتَرْفَعُ الخَبَرَ»"),
    },
    {
      kind: "list",
      page: 86,
      front: t("What are inna and its sisters?", "مَا إِنَّ وَأَخَوَاتُهَا؟"),
      back: t("Inna, anna, lākinna, kaʾanna, layta and laʿalla.", "«إِنَّ، وَأَنَّ، وَلَكِنَّ، وَكَأَنَّ، وَلَيْتَ، وَلَعَلَّ»"),
    },
    {
      kind: "example",
      page: 86,
      front: t("Give the author's examples for inna and layta.", "اذْكُرْ مِثَالَيِ المُؤَلِّفِ لِـ«إِنَّ» وَ«لَيْتَ»."),
      back: t("Inna Zaydan qāʾimun; layta ʿAmran shākhiṣun.", "«إِنَّ زَيْدًا قَائِمٌ، وَلَيْتَ عَمْرًا شَاخِصٌ»"),
    },
    {
      kind: "list",
      page: 86,
      front: t("What does each of inna's sisters mean?", "مَا مَعَانِي إِنَّ وَأَخَوَاتِهَا؟"),
      back: t(
        "Inna and anna: emphasis. Lākinna: correcting an impression (istidrāk). Kaʾanna: likening. Layta: wishing. Laʿalla: hoping and expecting.",
        "«إِنَّ وَأَنَّ: لِلتَّوْكِيدِ. وَلَكِنَّ: لِلِاسْتِدْرَاكِ، وَكَأَنَّ: لِلتَّشْبِيهِ. وَلَيْتَ: لِلتَّمَنِّي، وَلَعَلَّ: لِلتَّرَجِّي وَالتَّوَقُّعِ»",
      ),
    },
    {
      kind: "cloze",
      page: 86,
      front: t("“Layta is for ______, and laʿalla is for hoping and expecting.”", "«وَلَيْتَ: لِـ______، وَلَعَلَّ: لِلتَّرَجِّي وَالتَّوَقُّعِ»"),
      back: t("wishing", "لِلتَّمَنِّي"),
    },
    {
      kind: "point",
      page: 87,
      front: t("What do ẓanantu and its sisters do?", "مَاذَا تَعْمَلُ ظَنَنْتُ وَأَخَوَاتُهَا؟"),
      back: t("They put both the mubtadaʾ and the khabar in naṣb, as their two objects.", "«فَإِنَّهَا تَنْصِبُ المُبْتَدَأَ وَالخَبَرَ عَلَى أَنَّهُمَا مَفْعُولَانِ لَهَا»"),
    },
    {
      kind: "list",
      page: 87,
      front: t("What are ẓanantu and its sisters?", "مَا ظَنَنْتُ وَأَخَوَاتُهَا؟"),
      back: t(
        "Ẓanantu, ḥasibtu, khiltu, zaʿamtu; raʾaytu, ʿalimtu, wajadtu; ittakhadhtu, jaʿaltu, samiʿtu.",
        "«ظَنَنْتُ، وَحَسِبْتُ، وَخِلْتُ، وَزَعَمْتُ. وَرَأَيْتُ، وَعَلِمْتُ، وَوَجَدْتُ. وَاتَّخَذْتُ، وَجَعَلْتُ، وَسَمِعْتُ»",
      ),
    },
    {
      kind: "example",
      page: 87,
      front: t("Give the author's examples for ẓanantu and khiltu.", "اذْكُرْ مِثَالَيِ المُؤَلِّفِ لِـ«ظَنَنْتُ» وَ«خِلْتُ»."),
      back: t("Ẓanantu Zaydan munṭaliqan; khiltu ʿAmran shākhiṣan.", "«ظَنَنْتُ زَيْدًا مُنْطَلِقًا، وَخِلْتُ عَمْرًا شَاخِصًا»"),
    },
  ],

  // ───────────── 13 · The adjective ─────────────
  [
    opening(12, 88, t("What does the chapter of the adjective cover?", "مَاذَا يَتَنَاوَلُ بَابُ النَّعْتِ؟")),
    {
      kind: "term",
      page: 88,
      front: t("What is the adjective (naʿt)?", "مَا النَّعْتُ؟"),
      back: t(
        "A follower of the described noun in its rafʿ, naṣb and khafḍ, and in its being definite or indefinite.",
        "«تَابِعٌ لِلْمَنْعُوتِ فِي رَفْعِهِ، وَنَصْبِهِ، وَخَفْضِهِ، وَتَعْرِيفِهِ وَتَنْكِيرِهِ»",
      ),
    },
    {
      kind: "example",
      page: 88,
      front: t("Give the author's examples of the adjective.", "اذْكُرْ أَمْثِلَةَ المُؤَلِّفِ لِلنَّعْتِ."),
      back: t("Qāma Zaydun al-ʿāqilu; raʾaytu Zaydan al-ʿāqila; marartu bi-Zaydin al-ʿāqili.", "«قَامَ زَيْدٌ العَاقِلُ، وَرَأَيْتُ زَيْدًا العَاقِلَ، وَمَرَرْتُ بِزَيْدٍ العَاقِلِ»"),
    },
    {
      kind: "list",
      page: 88,
      front: t("What are the five kinds of definite noun (maʿrifah)?", "مَا المَعْرِفَةُ الخَمْسَةُ؟"),
      back: t(
        "The pronoun (anā, anta); the proper name (Zayd, Makkah); the vague noun (hādhā, hādhihi, hāʾulāʾi); the noun with alif and lām (ar-rajul, al-ghulām); and what is joined in iḍāfah to one of these four.",
        "«الاسْمُ المُضْمَرُ؛ نَحْوُ: أَنَا، وَأَنْتَ. وَالاسْمُ العَلَمُ؛ نَحْوُ: زَيْدٍ، وَمَكَّةَ. وَالاسْمُ المُبْهَمُ؛ نَحْوُ: هَذَا، وَهَذِهِ، وَهَؤُلَاءِ. وَالاسْمُ الَّذِي فِيهِ الأَلِفُ وَاللَّامُ؛ نَحْوُ: الرَّجُلِ، وَالغُلَامِ. وَمَا أُضِيفَ إِلَى وَاحِدٍ مِنْ هَذِهِ الأَرْبَعَةِ»",
      ),
    },
    {
      kind: "point",
      page: 88,
      front: t("What does the author call words like hādhā, hādhihi and hāʾulāʾi?", "بِمَ سَمَّى المُؤَلِّفُ نَحْوَ: هَذَا، وَهَذِهِ، وَهَؤُلَاءِ؟"),
      back: t("The vague noun (al-ism al-mubham).", "«الاسْمُ المُبْهَمُ»"),
    },
    {
      kind: "term",
      page: 89,
      front: t("What is the indefinite noun (nakirah)?", "مَا النَّكِرَةُ؟"),
      back: t("Every noun common to its whole kind, not particular to one rather than another.", "«كُلُّ اسْمٍ شَائِعٍ فِي جِنْسِهِ، لَا يَخْتَصُّ بِهِ وَاحِدٌ دُونَ آخَرَ»"),
    },
    {
      kind: "point",
      page: 89,
      front: t("What is the easy test for an indefinite noun?", "مَا تَقْرِيبُ النَّكِرَةِ؟"),
      back: t("Any word on which alif and lām can properly enter — e.g. ar-rajul, al-faras.", "«كُلُّ مَا صَلَحَ دُخُولُ الأَلِفِ وَاللَّامِ عَلَيْهِ؛ نَحْوُ: الرَّجُلِ، وَالفَرَسِ»"),
    },
  ],

  // ───────────── 14 · Conjunction ─────────────
  [
    opening(13, 90, t("What does the chapter of conjunction cover?", "مَاذَا يَتَنَاوَلُ بَابُ العَطْفِ؟")),
    {
      kind: "list",
      page: 90,
      front: t("What are the ten particles of conjunction?", "مَا حُرُوفُ العَطْفِ العَشَرَةُ؟"),
      back: t("Wa, fa, thumma; aw, am, immā, bal; lā, lākin, and ḥattā in some places.", "«الوَاوُ، وَالفَاءُ، وَثُمَّ. وَأَوْ، وَأَمْ، وَإِمَّا، وَبَلْ. وَلَا، وَلَكِنْ، وَحَتَّى فِي بَعْضِ المَوَاضِعِ»"),
    },
    {
      kind: "cloze",
      page: 90,
      front: t("“…lā, lākin, and ḥattā ______.”", "«وَلَا، وَلَكِنْ، وَحَتَّى ______»"),
      back: t("in some places", "فِي بَعْضِ المَوَاضِعِ"),
    },
    {
      kind: "point",
      page: 90,
      front: t("What is the rule for the word joined by these particles?", "مَا حُكْمُ المَعْطُوفِ بِهَذِهِ الحُرُوفِ؟"),
      back: t(
        "It follows: joined to a raised word you raise, to a word in naṣb you put naṣb, to one in khafḍ you put khafḍ, to one in jazm you put jazm.",
        "«فَإِنْ عَطَفْتَ بِهَا عَلَى مَرْفُوعٍ: رَفَعْتَ، أَوْ عَلَى مَنْصُوبٍ: نَصَبْتَ، أَوْ عَلَى مَخْفُوضٍ: خَفَضْتَ، أَوْ عَلَى مَجْزُومٍ: جَزَمْتَ»",
      ),
    },
    {
      kind: "example",
      page: 90,
      front: t("Give the author's four examples of conjunction.", "اذْكُرْ أَمْثِلَةَ المُؤَلِّفِ الأَرْبَعَةَ لِلْعَطْفِ."),
      back: t(
        "Qāma Zaydun wa-ʿAmrun; raʾaytu Zaydan wa-ʿAmran; marartu bi-Zaydin wa-ʿAmrin; Zaydun lam yaqum wa-lam yaqʿud.",
        "«قَامَ زَيْدٌ وَعَمْرٌو، وَرَأَيْتُ زَيْدًا وَعَمْرًا، وَمَرَرْتُ بِزَيْدٍ وَعَمْرٍو، وَزَيْدٌ لَمْ يَقُمْ وَلَمْ يَقْعُدْ»",
      ),
    },
    {
      kind: "point",
      page: 90,
      front: t("Which of the author's examples is conjunction of a verb in jazm?", "أَيُّ أَمْثِلَةِ المُؤَلِّفِ فِيهِ عَطْفٌ عَلَى مَجْزُومٍ؟"),
      back: t("Zaydun lam yaqum wa-lam yaqʿud.", "«زَيْدٌ لَمْ يَقُمْ وَلَمْ يَقْعُدْ»"),
    },
  ],

  // ───────────── 15 · Emphasis ─────────────
  [
    opening(14, 91, t("What does the chapter of emphasis cover?", "مَاذَا يَتَنَاوَلُ بَابُ التَّوْكِيدِ؟")),
    {
      kind: "term",
      page: 91,
      front: t("What is emphasis (tawkīd)?", "مَا التَّوْكِيدُ؟"),
      back: t("A follower of the emphasised word in its rafʿ, naṣb, khafḍ and definiteness.", "«تَابِعٌ لِلْمُؤَكَّدِ فِي رَفْعِهِ، وَنَصْبِهِ، وَخَفْضِهِ، وَتَعْرِيفِهِ»"),
    },
    {
      kind: "list",
      page: 91,
      front: t("With which known words is emphasis made?", "بِأَيِّ الأَلْفَاظِ المَعْلُومَةِ يَكُونُ التَّوْكِيدُ؟"),
      back: t("An-nafs, al-ʿayn, kull, ajmaʿ, and the followers of ajmaʿ.", "«النَّفْسُ، وَالعَيْنُ، وَكُلٌّ، وَأَجْمَعُ، وَتَوَابِعُ أَجْمَعَ»"),
    },
    {
      kind: "list",
      page: 91,
      front: t("What are the followers of ajmaʿ?", "مَا تَوَابِعُ أَجْمَعَ؟"),
      back: t("Aktaʿ, abtaʿ and abṣaʿ.", "«أَكْتَعُ، وَأَبْتَعُ، وَأَبْصَعُ»"),
    },
    {
      kind: "example",
      page: 91,
      front: t("Give the author's examples of emphasis.", "اذْكُرْ أَمْثِلَةَ المُؤَلِّفِ لِلتَّوْكِيدِ."),
      back: t("Qāma Zaydun nafsuhu; raʾaytu al-qawma kullahum; marartu bil-qawmi ajmaʿīna.", "«قَامَ زَيْدٌ نَفْسُهُ، وَرَأَيْتُ القَوْمَ كُلَّهُمْ، وَمَرَرْتُ بِالقَوْمِ أَجْمَعِينَ»"),
    },
  ],

  // ───────────── 16 · Substitution ─────────────
  [
    opening(15, 92, t("What does the chapter of substitution cover?", "مَاذَا يَتَنَاوَلُ بَابُ البَدَلِ؟")),
    {
      kind: "point",
      page: 92,
      front: t("When a noun is substituted for a noun, or a verb for a verb, what is the rule?", "إِذَا أُبْدِلَ اسْمٌ مِنِ اسْمٍ، أَوْ فِعْلٌ مِنْ فِعْلٍ، فَمَا حُكْمُهُ؟"),
      back: t("It follows it in all of its iʿrāb.", "«تَبِعَهُ فِي جَمِيعِ إِعْرَابِهِ»"),
    },
    {
      kind: "list",
      page: 92,
      front: t("What are the four kinds of badal?", "مَا أَقْسَامُ البَدَلِ الأَرْبَعَةُ؟"),
      back: t(
        "The thing for the thing; the part for the whole; inclusion (ishtimāl); and mistake (ghalaṭ).",
        "«بَدَلِ الشَّيْءِ مِنَ الشَّيْءِ، وَبَدَلِ البَعْضِ مِنَ الكُلِّ، وَبَدَلِ الاشْتِمَالِ، وَبَدَلِ الغَلَطِ»",
      ),
    },
    {
      kind: "example",
      page: 92,
      front: t("“Qāma Zaydun akhūka” — which kind of badal is it?", "«قَامَ زَيْدٌ أَخُوكَ» — أَيُّ أَنْوَاعِ البَدَلِ هُوَ؟"),
      back: t("The thing for the thing.", "بَدَلُ الشَّيْءِ مِنَ الشَّيْءِ."),
    },
    {
      kind: "example",
      page: 92,
      front: t("“Akaltu ar-raghīfa thuluthahu” — which kind of badal is it?", "«أَكَلْتُ الرَّغِيفَ ثُلُثَهُ» — أَيُّ أَنْوَاعِ البَدَلِ هُوَ؟"),
      back: t("The part for the whole.", "بَدَلُ البَعْضِ مِنَ الكُلِّ."),
    },
    {
      kind: "example",
      page: 92,
      front: t("“Nafaʿanī Zaydun ʿilmuhu” — which kind of badal is it?", "«نَفَعَنِي زَيْدٌ عِلْمُهُ» — أَيُّ أَنْوَاعِ البَدَلِ هُوَ؟"),
      back: t("Inclusion (ishtimāl).", "بَدَلُ الاشْتِمَالِ."),
    },
    {
      kind: "example",
      page: 92,
      front: t("“Raʾaytu Zaydan al-farasa” — which kind of badal is it, and why?", "«رَأَيْتُ زَيْدًا الفَرَسَ» — أَيُّ أَنْوَاعِ البَدَلِ هُوَ؟ وَلِمَاذَا؟"),
      back: t(
        "Mistake (ghalaṭ): you meant to say al-faras, made a mistake, and replaced Zayd with it.",
        "بَدَلُ الغَلَطِ: «أَرَدْتَ أَنْ تَقُولَ: الفَرَسَ؛ فَغَلِطْتَ، فَأَبْدَلْتَ زَيْدًا مِنْهُ»",
      ),
    },
  ],

  // ───────────── 17 · The nouns in naṣb ─────────────
  [
    opening(16, 93, t("What does the chapter of the nouns in naṣb cover?", "مَاذَا يَتَنَاوَلُ بَابُ مَنْصُوبَاتِ الأَسْمَاءِ؟")),
    {
      kind: "point",
      page: 93,
      front: t("How many are the nouns in naṣb?", "كَمْ عَدَدُ المَنْصُوبَاتِ؟"),
      back: t("Fourteen.", "«المَنْصُوبَاتُ أَرْبَعَةَ عَشَرَ»"),
    },
    {
      kind: "list",
      page: 93,
      front: t("What are the fourteen nouns in naṣb?", "مَا المَنْصُوبَاتُ الأَرْبَعَةَ عَشَرَ؟"),
      back: t(
        "The mafʿūl bihi, the maṣdar, the adverb of time, the adverb of place, the ḥāl, the tamyīz, the mustathnā, the ism of lā, the munādā, the mafʿūl min ajlih, the mafʿūl maʿahu, the khabar of kāna and its sisters, the ism of inna and its sisters, and the follower of a word in naṣb.",
        "«المَفْعُولُ بِهِ، وَالمَصْدَرُ. وَظَرْفُ الزَّمَانِ، وَظَرْفُ المَكَانِ. وَالحَالُ، وَالتَّمْيِيزُ، وَالمُسْتَثْنَى. وَاسْمُ “لَا”، وَالمُنَادَى. وَالمَفْعُولُ مِنْ أَجْلِهِ، وَالمَفْعُولُ مَعَهُ. وَخَبَرُ “كَانَ” وَأَخَوَاتِهَا، وَاسْمُ “إِنَّ” وَأَخَوَاتِهَا. وَالتَّابِعُ لِلْمَنْصُوبِ»",
      ),
    },
    {
      kind: "list",
      page: 93,
      front: t("The follower of a word in naṣb is four things — what are they?", "التَّابِعُ لِلْمَنْصُوبِ أَرْبَعَةُ أَشْيَاءَ؛ فَمَا هِيَ؟"),
      back: t("The naʿt, the ʿaṭf, the tawkīd and the badal.", "«النَّعْتُ، وَالعَطْفُ، وَالتَّوْكِيدُ، وَالبَدَلُ»"),
    },
    {
      kind: "cloze",
      page: 93,
      front: t("Among the nouns in naṣb: “the ______ of kāna and its sisters, and the ______ of inna and its sisters.”", "مِنَ المَنْصُوبَاتِ: «وَ______ “كَانَ” وَأَخَوَاتِهَا، وَ______ “إِنَّ” وَأَخَوَاتِهَا»"),
      back: t("khabar · ism", "خَبَرُ · اسْمُ"),
    },
    {
      kind: "list",
      page: 93,
      front: t("Which of the nouns in naṣb are called mafʿūl (object)?", "مَا المَفَاعِيلُ مِنْ بَيْنِ المَنْصُوبَاتِ؟"),
      back: t("The mafʿūl bihi, the mafʿūl min ajlih and the mafʿūl maʿahu.", "المَفْعُولُ بِهِ، وَالمَفْعُولُ مِنْ أَجْلِهِ، وَالمَفْعُولُ مَعَهُ."),
    },
  ],

  // ───────────── 18 · The mafʿūl bihi ─────────────
  [
    opening(17, 94, t("What does the chapter of the mafʿūl bihi cover?", "مَاذَا يَتَنَاوَلُ بَابُ المَفْعُولِ بِهِ؟")),
    {
      kind: "term",
      page: 94,
      front: t("What is the mafʿūl bihi?", "مَا المَفْعُولُ بِهِ؟"),
      back: t("The noun in naṣb on which the action falls.", "«هُوَ الاسْمُ المَنْصُوبُ الَّذِي يَقَعُ بِهِ الفِعْلُ»"),
    },
    {
      kind: "example",
      page: 94,
      front: t("Give the author's examples of the mafʿūl bihi.", "اذْكُرْ مِثَالَيِ المُؤَلِّفِ لِلْمَفْعُولِ بِهِ."),
      back: t("Ḍarabtu Zaydan; rakibtu al-farasa.", "«ضَرَبْتُ زَيْدًا، وَرَكِبْتُ الفَرَسَ»"),
    },
    {
      kind: "list",
      page: 94,
      front: t("What are the kinds of mafʿūl bihi?", "مَا أَقْسَامُ المَفْعُولِ بِهِ؟"),
      back: t("Explicit and pronoun — and the pronoun is attached (muttaṣil) or separate (munfaṣil).", "«ظَاهِرٌ، وَمُضْمَرٌ … وَالمُضْمَرُ قِسْمَانِ: مُتَّصِلٌ، وَمُنْفَصِلٌ»"),
    },
    {
      kind: "list",
      page: 94,
      front: t("What are the twelve attached pronouns (with ḍaraba)?", "مَا المُتَّصِلُ الاثْنَا عَشَرَ مَعَ «ضَرَبَ»؟"),
      back: t(
        "Ḍarabanī, ḍarabanā; ḍarabaka, ḍarabaki, ḍarabakumā, ḍarabakum, ḍarabakunna; ḍarabahu, ḍarabahā, ḍarabahumā, ḍarabahum, ḍarabahunna.",
        "«ضَرَبَنِي، وَضَرَبَنَا. وَضَرَبَكَ، وَضَرَبَكِ، وَضَرَبَكُمَا، وَضَرَبَكُمْ، وَضَرَبَكُنَّ. وَضَرَبَهُ، وَضَرَبَهَا، وَضَرَبَهُمَا، وَضَرَبَهُمْ، وَضَرَبَهُنَّ»",
      ),
    },
    {
      kind: "list",
      page: 95,
      front: t("What are the twelve separate pronouns?", "مَا المُنْفَصِلُ الاثْنَا عَشَرَ؟"),
      back: t(
        "Iyyāya, iyyānā; iyyāka, iyyāki, iyyākumā, iyyākum, iyyākunna; iyyāhu, iyyāhā, iyyāhumā, iyyāhum, iyyāhunna.",
        "«إِيَّايَ، وَإِيَّانَا. وَإِيَّاكَ، وَإِيَّاكِ، وَإِيَّاكُمَا، وَإِيَّاكُمْ، وَإِيَّاكُنَّ. وَإِيَّاهُ، وَإِيَّاهَا، وَإِيَّاهُمَا، وَإِيَّاهُمْ، وَإِيَّاهُنَّ»",
      ),
    },
    {
      kind: "point",
      page: 94,
      front: t("What is the explicit mafʿūl bihi?", "مَا المَفْعُولُ بِهِ الظَّاهِرُ؟"),
      back: t("What has already been mentioned (as in ḍarabtu Zaydan).", "«فَالظَّاهِرُ؛ مَا تَقَدَّمَ ذِكْرُهُ»"),
    },
  ],

  // ───────────── 19 · The maṣdar ─────────────
  [
    opening(18, 96, t("What does the chapter of the maṣdar cover?", "مَاذَا يَتَنَاوَلُ بَابُ المَصْدَرِ؟")),
    {
      kind: "term",
      page: 96,
      front: t("What is the maṣdar?", "مَا المَصْدَرُ؟"),
      back: t("The noun in naṣb that comes third in conjugating the verb — e.g. ḍaraba yaḍribu ḍarban.", "«هُوَ الاسْمُ المَنْصُوبُ الَّذِي يَجِيءُ ثَالِثًا فِي تَصْرِيفِ الفِعْلِ. نَحْوُ: ضَرَبَ يَضْرِبُ ضَرْبًا»"),
    },
    {
      kind: "cloze",
      page: 96,
      front: t("“The maṣdar is the noun in naṣb that comes ______ in conjugating the verb.”", "«المَصْدَرُ: هُوَ الاسْمُ المَنْصُوبُ الَّذِي يَجِيءُ ______ فِي تَصْرِيفِ الفِعْلِ»"),
      back: t("third", "ثَالِثًا"),
    },
    {
      kind: "list",
      page: 96,
      front: t("What are the two kinds of maṣdar?", "مَا قِسْمَا المَصْدَرِ؟"),
      back: t("Verbal-form (lafẓī) and in-meaning (maʿnawī).", "«لَفْظِيٌّ، وَمَعْنَوِيٌّ»"),
    },
    {
      kind: "term",
      page: 96,
      front: t("When is the maṣdar lafẓī? Give the example.", "مَتَى يَكُونُ المَصْدَرُ لَفْظِيًّا؟ وَمَا مِثَالُهُ؟"),
      back: t("When its wording matches the wording of its verb — e.g. qataltuhu qatlan.", "«فَإِنْ وَافَقَ لَفْظُهُ لَفْظَ فِعْلِهِ: فَهُوَ لَفْظِيٌّ؛ نَحْوُ: قَتَلْتُهُ قَتْلًا»"),
    },
    {
      kind: "term",
      page: 96,
      front: t("When is the maṣdar maʿnawī? Give the examples.", "مَتَى يَكُونُ المَصْدَرُ مَعْنَوِيًّا؟ وَمَا مِثَالُهُ؟"),
      back: t(
        "When it matches the meaning of its verb but not its wording — e.g. jalastu quʿūdan, qumtu wuqūfan.",
        "«وَإِنْ وَافَقَ مَعْنَى فِعْلِهِ دُونَ لَفْظِهِ: فَهُوَ مَعْنَوِيٌّ؛ نَحْوُ قَوْلِكَ: جَلَسْتُ قُعُودًا، وَقُمْتُ وُقُوفًا»",
      ),
    },
  ],

  // ───────────── 20 · Adverbs of time and place ─────────────
  [
    opening(19, 97, t("What does the chapter of the adverbs of time and place cover?", "مَاذَا يَتَنَاوَلُ بَابُ ظَرْفِ الزَّمَانِ وَظَرْفِ المَكَانِ؟")),
    {
      kind: "term",
      page: 97,
      front: t("What is the adverb of time (ẓarf az-zamān)?", "مَا ظَرْفُ الزَّمَانِ؟"),
      back: t("A noun of time in naṣb with “fī” (in) understood.", "«هُوَ اسْمُ الزَّمَانِ المَنْصُوبُ بِتَقْدِيرِ “فِي”»"),
    },
    {
      kind: "list",
      page: 97,
      front: t("Give the author's examples of adverbs of time.", "اذْكُرْ أَمْثِلَةَ المُؤَلِّفِ لِظَرْفِ الزَّمَانِ."),
      back: t(
        "Al-yawma, al-laylata, ghudwatan, bukratan, saḥaran, ghadan, ʿatamatan, ṣabāḥan, masāʾan, abadan, amadan, ḥīnan — and the like.",
        "«اليَوْمَ، وَاللَّيْلَةَ، وَغُدْوَةً، وَبُكْرَةً. وَسَحَرًا، وَغَدًا، وَعَتَمَةً، وَصَبَاحًا، وَمَسَاءً. وَأَبَدًا، وَأَمَدًا، وَحِينًا، وَمَا أَشْبَهَ ذَلِكَ»",
      ),
    },
    {
      kind: "term",
      page: 98,
      front: t("What is the adverb of place (ẓarf al-makān)?", "مَا ظَرْفُ المَكَانِ؟"),
      back: t("A noun of place in naṣb with “fī” (in) understood.", "«هُوَ اسْمُ المَكَانِ المَنْصُوبُ بِتَقْدِيرِ “فِي”»"),
    },
    {
      kind: "list",
      page: 98,
      front: t("Give the author's examples of adverbs of place.", "اذْكُرْ أَمْثِلَةَ المُؤَلِّفِ لِظَرْفِ المَكَانِ."),
      back: t(
        "Amāma, khalfa, quddāma, warāʾa, fawqa, taḥta; ʿinda, maʿa, izāʾa, ḥidhāʾa, tilqāʾa; hunā, thamma — and the like.",
        "«أَمَامَ، وَخَلْفَ، وَقُدَّامَ، وَوَرَاءَ، وَفَوْقَ، وَتَحْتَ. وَعِنْدَ، وَمَعَ، وَإِزَاءَ، وَحِذَاءَ، وَتِلْقَاءَ. وَهُنَا، وَثَمَّ. وَمَا أَشْبَهَ ذَلِكَ»",
      ),
    },
    {
      kind: "cloze",
      page: 97,
      front: t("Both adverbs are in naṣb with ______ understood.", "كِلَا الظَّرْفَيْنِ مَنْصُوبٌ بِتَقْدِيرِ ______"),
      back: t("“fī” (in)", "«فِي»"),
    },
  ],

  // ───────────── 21 · The ḥāl ─────────────
  [
    opening(20, 99, t("What does the chapter of the ḥāl cover?", "مَاذَا يَتَنَاوَلُ بَابُ الحَالِ؟")),
    {
      kind: "term",
      page: 99,
      front: t("What is the ḥāl?", "مَا الحَالُ؟"),
      back: t("The noun in naṣb that explains what is unclear of states (hayʾāt).", "«هُوَ الاسْمُ المَنْصُوبُ المُفَسِّرُ لِمَا انْبَهَمَ مِنَ الهَيْئَاتِ»"),
    },
    {
      kind: "cloze",
      page: 99,
      front: t("“The ḥāl is the noun in naṣb explaining what is unclear of ______.”", "«الحَالُ: هُوَ الاسْمُ المَنْصُوبُ المُفَسِّرُ لِمَا انْبَهَمَ مِنَ ______»"),
      back: t("states (al-hayʾāt)", "الهَيْئَاتِ"),
    },
    {
      kind: "example",
      page: 99,
      front: t("Give the author's examples of the ḥāl.", "اذْكُرْ أَمْثِلَةَ المُؤَلِّفِ لِلْحَالِ."),
      back: t("Jāʾa Zaydun rākiban; rakibtu al-farasa musrajan; laqītu ʿAbdallāhi rākiban.", "«جَاءَ زَيْدٌ رَاكِبًا، وَرَكِبْتُ الفَرَسَ مُسْرَجًا، وَلَقِيتُ عَبْدَ اللَّهِ رَاكِبًا»"),
    },
    {
      kind: "list",
      page: 99,
      front: t("What are the three conditions of the ḥāl?", "مَا شُرُوطُ الحَالِ الثَّلَاثَةُ؟"),
      back: t(
        "It is only indefinite; it comes only after the sentence is complete; and the one it describes (ṣāḥibuhā) is only definite.",
        "«وَلَا يَكُونُ الحَالُ إِلَّا نَكِرَةً، وَلَا يَكُونُ إِلَّا بَعْدَ تَمَامِ الكَلَامِ. وَلَا يَكُونُ صَاحِبُهَا إِلَّا مَعْرِفَةً»",
      ),
    },
    {
      kind: "point",
      page: 99,
      front: t("Must the one the ḥāl describes be definite or indefinite?", "هَلْ يَكُونُ صَاحِبُ الحَالِ مَعْرِفَةً أَمْ نَكِرَةً؟"),
      back: t("Definite.", "«وَلَا يَكُونُ صَاحِبُهَا إِلَّا مَعْرِفَةً»"),
    },
  ],

  // ───────────── 22 · The tamyīz ─────────────
  [
    opening(21, 100, t("What does the chapter of the tamyīz cover?", "مَاذَا يَتَنَاوَلُ بَابُ التَّمْيِيزِ؟")),
    {
      kind: "term",
      page: 100,
      front: t("What is the tamyīz?", "مَا التَّمْيِيزُ؟"),
      back: t("The noun in naṣb that explains what is unclear of entities (dhawāt).", "«هُوَ الاسْمُ المَنْصُوبُ المُفَسِّرُ لِمَا انْبَهَمَ مِنَ الذَّوَاتِ»"),
    },
    {
      kind: "point",
      page: 100,
      front: t("The ḥāl explains states — what does the tamyīz explain?", "الحَالُ يُفَسِّرُ الهَيْئَاتِ؛ فَمَاذَا يُفَسِّرُ التَّمْيِيزُ؟"),
      back: t("Entities (adh-dhawāt).", "«الذَّوَاتِ»"),
    },
    {
      kind: "example",
      page: 100,
      front: t("Give the author's examples of the tamyīz.", "اذْكُرْ أَمْثِلَةَ المُؤَلِّفِ لِلتَّمْيِيزِ."),
      back: t(
        "Taṣabbaba Zaydun ʿaraqan; tafaqqaʾa Bakrun shaḥman; ṭāba Muḥammadun nafsan; ishtaraytu ʿishrīna ghulāman; malaktu tisʿīna naʿjatan; Zaydun akramu minka aban, wa-ajmalu minka wajhan.",
        "«تَصَبَّبَ زَيْدٌ عَرَقًا، وَتَفَقَّأَ بَكْرٌ شَحْمًا، وَطَابَ مُحَمَّدٌ نَفْسًا، وَاشْتَرَيْتُ عِشْرِينَ غُلَامًا، وَمَلَكْتُ تِسْعِينَ نَعْجَةً، وَزَيْدٌ أَكْرَمُ مِنْكَ أَبًا، وَأَجْمَلُ مِنْكَ وَجْهًا»",
      ),
    },
    {
      kind: "list",
      page: 100,
      front: t("What are the two conditions of the tamyīz?", "مَا شَرْطَا التَّمْيِيزِ؟"),
      back: t("It is only indefinite, and it comes only after the sentence is complete.", "«وَلَا يَكُونُ إِلَّا نَكِرَةً، وَلَا يَكُونُ إِلَّا بَعْدَ تَمَامِ الكَلَامِ»"),
    },
    {
      kind: "example",
      page: 100,
      front: t("In “ishtaraytu ʿishrīna ghulāman”, which word is the tamyīz?", "فِي «اشْتَرَيْتُ عِشْرِينَ غُلَامًا»: مَا التَّمْيِيزُ؟"),
      back: t("Ghulāman — it explains what the twenty are.", "«غُلَامًا»؛ فَهُوَ يُفَسِّرُ المُبْهَمَ مِنْ «عِشْرِينَ»."),
    },
  ],

  // ───────────── 23 · Exception ─────────────
  [
    opening(22, 101, t("What does the chapter of exception cover?", "مَاذَا يَتَنَاوَلُ بَابُ الاسْتِثْنَاءِ؟")),
    {
      kind: "list",
      page: 101,
      front: t("What are the eight particles of exception?", "مَا حُرُوفُ الاسْتِثْنَاءِ الثَّمَانِيَةُ؟"),
      back: t("Illā, ghayr, siwan, suwan, sawāʾ, khalā, ʿadā and ḥāshā.", "«إِلَّا، وَغَيْرُ، وَسِوًى، وَسُوًى، وَسَوَاءٌ، وَخَلَا، وَعَدَا، وَحَاشَا»"),
    },
    {
      kind: "point",
      page: 101,
      front: t("When is the word excepted by illā put in naṣb? Give the examples.", "مَتَى يُنْصَبُ المُسْتَثْنَى بِإِلَّا؟ وَمَا مِثَالُهُ؟"),
      back: t(
        "When the sentence is complete and affirmative — e.g. qāma al-qawmu illā Zaydan; kharaja an-nāsu illā ʿAmran.",
        "«يُنْصَبُ إِذَا كَانَ الكَلَامُ تَامًّا مُوجَبًا. نَحْوُ: قَامَ القَوْمُ إِلَّا زَيْدًا، وَخَرَجَ النَّاسُ إِلَّا عَمْرًا»",
      ),
    },
    {
      kind: "point",
      page: 101,
      front: t("If the sentence is negative and complete, what is allowed? Give the example.", "إِذَا كَانَ الكَلَامُ مَنْفِيًّا تَامًّا، فَمَا الَّذِي يَجُوزُ؟ وَمَا مِثَالُهُ؟"),
      back: t(
        "Either badal, or naṣb as an exception — e.g. mā qāma al-qawmu illā Zaydun / illā Zaydan.",
        "«جَازَ فِيهِ البَدَلُ، وَالنَّصْبُ عَلَى الاسْتِثْنَاءِ. نَحْوُ قَوْلِكَ: مَا قَامَ القَوْمُ إِلَّا زَيْدٌ وَ: إِلَّا زَيْدًا»",
      ),
    },
    {
      kind: "point",
      page: 102,
      front: t("If the sentence is incomplete (nāqiṣ), what is the rule? Give the examples.", "إِذَا كَانَ الكَلَامُ نَاقِصًا، فَمَا حُكْمُهُ؟ وَمَا أَمْثِلَتُهُ؟"),
      back: t(
        "It follows the governing words — e.g. mā qāma illā Zaydun; mā ḍarabtu illā Zaydan; mā marartu illā bi-Zaydin.",
        "«كَانَ عَلَى حَسَبِ العَوَامِلِ. نَحْوُ قَوْلِكَ: مَا قَامَ إِلَّا زَيْدٌ، وَمَا ضَرَبْتُ إِلَّا زَيْدًا، وَمَا مَرَرْتُ إِلَّا بِزَيْدٍ»",
      ),
    },
    {
      kind: "point",
      page: 102,
      front: t("What is the case of the word excepted by ghayr, siwan, suwan and sawāʾ?", "مَا حُكْمُ المُسْتَثْنَى بِغَيْرٍ، وَسِوًى، وَسُوًى، وَسَوَاءٍ؟"),
      back: t("Majrūr — nothing else.", "«مَجْرُورٌ لَا غَيْرُ»"),
    },
    {
      kind: "point",
      page: 102,
      front: t("What is the case of the word excepted by khalā, ʿadā and ḥāshā? Give the examples.", "مَا حُكْمُ المُسْتَثْنَى بِخَلَا، وَعَدَا، وَحَاشَا؟ وَمَا أَمْثِلَتُهُ؟"),
      back: t(
        "Both naṣb and jarr are allowed — e.g. qāma al-qawmu khalā Zaydan / Zaydin, ʿadā ʿAmran / ʿAmrin, ḥāshā Bakran / Bakrin.",
        "«يَجُوزُ نَصْبُهُ وَجَرُّهُ. نَحْوُ قَوْلِكَ: قَامَ القَوْمُ خَلَا زَيْدًا وَزَيْدٍ، وَعَدَا عَمْرًا وَعَمْرٍو، وَحَاشَا بَكْرًا وَبَكْرٍ»",
      ),
    },
    {
      kind: "cloze",
      page: 101,
      front: t("“The word excepted by illā is in naṣb if the sentence is ______ and ______.”", "«فَالمُسْتَثْنَى بِإِلَّا: يُنْصَبُ إِذَا كَانَ الكَلَامُ ______ ______»"),
      back: t("complete · affirmative", "تَامًّا · مُوجَبًا"),
    },
  ],

  // ───────────── 24 · The lā of negation ─────────────
  [
    opening(23, 103, t("What does the chapter of lā cover?", "مَاذَا يَتَنَاوَلُ بَابُ لَا؟")),
    {
      kind: "point",
      page: 103,
      front: t("What does lā do to indefinite nouns, and on what two conditions?", "مَاذَا تَعْمَلُ «لَا» فِي النَّكِرَاتِ؟ وَبِأَيِّ شَرْطَيْنِ؟"),
      back: t(
        "It puts them in naṣb without tanwīn — when it is directly followed by the indefinite noun, and lā is not repeated. E.g. lā rajula fī ad-dār.",
        "«تَنْصِبُ النَّكِرَاتِ بِغَيْرِ تَنْوِينٍ: إِذَا بَاشَرَتِ النَّكِرَةَ، وَلَمْ تَتَكَرَّرْ “لَا”. نَحْوُ: لَا رَجُلَ فِي الدَّارِ»",
      ),
    },
    {
      kind: "point",
      page: 103,
      front: t("If lā is not directly followed by the noun, what becomes necessary? Give the example.", "إِذَا لَمْ تُبَاشِرْ «لَا» النَّكِرَةَ، فَمَاذَا يَجِبُ؟ وَمَا مِثَالُهُ؟"),
      back: t(
        "Rafʿ becomes necessary, and repeating lā becomes necessary — e.g. lā fī ad-dāri rajulun wa-lā imraʾatun.",
        "«وَجَبَ الرَّفْعُ وَوَجَبَ تَكْرَارُ “لَا”. نَحْوُ: لَا فِي الدَّارِ رَجُلٌ وَلَا امْرَأَةٌ»",
      ),
    },
    {
      kind: "point",
      page: 103,
      front: t("If lā is repeated, what is allowed?", "إِذَا تَكَرَّرَتْ «لَا»، فَمَا الَّذِي يَجُوزُ؟"),
      back: t("Either making it work or cancelling it.", "«جَازَ إِعْمَالُهَا وَإِلْغَاؤُهَا»"),
    },
    {
      kind: "example",
      page: 103,
      front: t("Give the two ways of saying “no man in the house, nor woman” when lā is repeated.", "اذْكُرِ الوَجْهَيْنِ فِي «لَا رَجُلَ فِي الدَّارِ وَلَا امْرَأَةَ» عِنْدَ تَكَرُّرِ «لَا»."),
      back: t(
        "Lā rajula fī ad-dāri wa-lā imraʾata (working), or lā rajulun fī ad-dāri wa-lā imraʾatun (cancelled).",
        "«فَإِنْ شِئْتَ قُلْتَ: لَا رَجُلَ فِي الدَّارِ وَلَا امْرَأَةَ. وَإِنْ شِئْتَ قُلْتَ: لَا رَجُلٌ فِي الدَّارِ وَلَا امْرَأَةٌ»",
      ),
    },
    {
      kind: "cloze",
      page: 103,
      front: t("“Lā puts indefinite nouns in naṣb ______ tanwīn.”", "«اعْلَمْ أَنَّ “لَا” تَنْصِبُ النَّكِرَاتِ ______ تَنْوِينٍ»"),
      back: t("without", "بِغَيْرِ"),
    },
  ],

  // ───────────── 25 · The vocative ─────────────
  [
    opening(24, 104, t("What does the chapter of the vocative cover?", "مَاذَا يَتَنَاوَلُ بَابُ المُنَادَى؟")),
    {
      kind: "list",
      page: 104,
      front: t("What are the five kinds of munādā?", "مَا أَنْوَاعُ المُنَادَى الخَمْسَةُ؟"),
      back: t(
        "The single proper name; the intended indefinite; the unintended indefinite; the muḍāf; and that which resembles the muḍāf.",
        "«المُفْرَدُ العَلَمُ، وَالنَّكِرَةُ المَقْصُودَةُ، وَالنَّكِرَةُ غَيْرُ المَقْصُودَةِ، وَالمُضَافُ، وَالمُشَبَّهُ بِالمُضَافِ»",
      ),
    },
    {
      kind: "point",
      page: 104,
      front: t("How are the single proper name and the intended indefinite treated? Give the examples.", "مَا حُكْمُ المُفْرَدِ العَلَمِ وَالنَّكِرَةِ المَقْصُودَةِ؟ وَمَا مِثَالُهُمَا؟"),
      back: t("They are built on the ḍammah, without tanwīn — e.g. yā Zaydu, yā rajulu.", "«فَيُبْنَيَانِ عَلَى الضَّمِّ مِنْ غَيْرِ تَنْوِينٍ. نَحْوُ: يَا زَيْدُ، وَيَا رَجُلُ»"),
    },
    {
      kind: "point",
      page: 104,
      front: t("How are the remaining three treated? Give the examples.", "مَا حُكْمُ الثَّلَاثَةِ البَاقِيَةِ؟ وَمَا أَمْثِلَتُهَا؟"),
      back: t("In naṣb, nothing else — e.g. yā rajulan, yā ʿAbdallāhi, yā ṭāliʿan jabalan.", "«مَنْصُوبَةٌ لَا غَيْرُ. نَحْوُ: يَا رَجُلًا، وَيَا عَبْدَ اللَّهِ، وَيَا طَالِعًا جَبَلًا»"),
    },
    {
      kind: "example",
      page: 104,
      front: t("“Yā ṭāliʿan jabalan” is an example of which kind of munādā?", "«يَا طَالِعًا جَبَلًا» مِثَالٌ لِأَيِّ أَنْوَاعِ المُنَادَى؟"),
      back: t("That which resembles the muḍāf.", "المُشَبَّهُ بِالمُضَافِ."),
    },
    {
      kind: "example",
      page: 104,
      front: t("“Yā rajulu” and “yā rajulan” — which kinds are they?", "«يَا رَجُلُ» وَ«يَا رَجُلًا» — أَيُّ نَوْعَيْنِ هُمَا؟"),
      back: t("Yā rajulu: the intended indefinite. Yā rajulan: the unintended indefinite.", "«يَا رَجُلُ»: النَّكِرَةُ المَقْصُودَةُ. «يَا رَجُلًا»: النَّكِرَةُ غَيْرُ المَقْصُودَةِ."),
    },
  ],

  // ───────────── 26 · The objects of reason and accompaniment ─────────────
  [
    opening(25, 105, t("What do the chapters of the mafʿūl min ajlih and mafʿūl maʿahu cover?", "مَاذَا يَتَنَاوَلُ بَابَا المَفْعُولِ مِنْ أَجْلِهِ وَالمَفْعُولِ مَعَهُ؟")),
    {
      kind: "term",
      page: 105,
      front: t("What is the mafʿūl min ajlih (object of reason)?", "مَا المَفْعُولُ مِنْ أَجْلِهِ؟"),
      back: t("The noun in naṣb mentioned to explain the reason the action happened.", "«هُوَ الاسْمُ المَنْصُوبُ الَّذِي يُذْكَرُ بَيَانًا لِسَبَبِ وُقُوعِ الفِعْلِ»"),
    },
    {
      kind: "example",
      page: 105,
      front: t("Give the author's examples of the mafʿūl min ajlih.", "اذْكُرْ مِثَالَيِ المُؤَلِّفِ لِلْمَفْعُولِ مِنْ أَجْلِهِ."),
      back: t("Qāma Zaydun ijlālan li-ʿAmrin; qaṣadtuka ibtighāʾa maʿrūfika.", "«قَامَ زَيْدٌ إِجْلَالًا لِعَمْرٍو، وَقَصَدْتُكَ ابْتِغَاءَ مَعْرُوفِكَ»"),
    },
    {
      kind: "term",
      page: 106,
      front: t("What is the mafʿūl maʿahu (object of accompaniment)?", "مَا المَفْعُولُ مَعَهُ؟"),
      back: t("The noun in naṣb mentioned to explain with whom the action was done.", "«هُوَ الاسْمُ المَنْصُوبُ الَّذِي يُذْكَرُ لِبَيَانِ مَنْ فُعِلَ مَعَهُ الفِعْلُ»"),
    },
    {
      kind: "example",
      page: 106,
      front: t("Give the author's examples of the mafʿūl maʿahu.", "اذْكُرْ مِثَالَيِ المُؤَلِّفِ لِلْمَفْعُولِ مَعَهُ."),
      back: t("Jāʾa al-amīru wal-jaysha; istawā al-māʾu wal-khashabata.", "«جَاءَ الأَمِيرُ وَالجَيْشَ، وَاسْتَوَى المَاءُ وَالخَشَبَةَ»"),
    },
    {
      kind: "point",
      page: 105,
      front: t("What is the difference between the two in what they explain?", "مَا الفَرْقُ بَيْنَهُمَا فِيمَا يُبَيِّنَانِهِ؟"),
      back: t("The mafʿūl min ajlih explains why the action happened; the mafʿūl maʿahu explains with whom it was done.", "المَفْعُولُ مِنْ أَجْلِهِ: «بَيَانًا لِسَبَبِ وُقُوعِ الفِعْلِ»، وَالمَفْعُولُ مَعَهُ: «لِبَيَانِ مَنْ فُعِلَ مَعَهُ الفِعْلُ»."),
    },
    {
      kind: "point",
      page: 107,
      front: t("Why does the author not explain the khabar of kāna, the ism of inna, or the followers among the nouns in naṣb?", "لِمَاذَا لَمْ يَشْرَحِ المُؤَلِّفُ خَبَرَ كَانَ، وَاسْمَ إِنَّ، وَالتَّوَابِعَ فِي المَنْصُوبَاتِ؟"),
      back: t("Because they were already covered under the raised nouns (al-marfūʿāt).", "«فَقَدْ تَقَدَّمَ ذِكْرُهُمَا فِي “المَرْفُوعَاتِ”. وَكَذَلِكَ التَّوَابِعُ: فَقَدْ تَقَدَّمَتْ هُنَاكَ»"),
    },
  ],

  // ───────────── 27 · The nouns in khafḍ ─────────────
  [
    opening(26, 108, t("What does the chapter of the nouns in khafḍ cover?", "مَاذَا يَتَنَاوَلُ بَابُ مَخْفُوضَاتِ الأَسْمَاءِ؟")),
    {
      kind: "list",
      page: 108,
      front: t("What are the three nouns in khafḍ?", "مَا المَخْفُوضَاتُ الثَّلَاثَةُ؟"),
      back: t("In khafḍ by a particle, in khafḍ by iḍāfah, and the follower of a word in khafḍ.", "«مَخْفُوضٌ بِالحَرْفِ، وَمَخْفُوضٌ بِالإِضَافَةِ، وَتَابِعٌ لِلْمَخْفُوضِ»"),
    },
    {
      kind: "list",
      page: 108,
      front: t("Which particles put a noun in khafḍ?", "مَا الحُرُوفُ الَّتِي يُخْفَضُ بِهَا الاسْمُ؟"),
      back: t(
        "Min, ilā, ʿan, ʿalā, fī, rubba; the bāʾ, kāf and lām; the particles of oath (wāw, bāʾ, tāʾ); the wāw of rubba; mudh and mundhu.",
        "«مِنْ، وَإِلَى، وَعَنْ، وَعَلَى، وَفِي، وَرُبَّ. وَالبَاءِ، وَالكَافِ، وَاللَّامِ. وَبِحُرُوفِ القَسَمِ؛ وَهِيَ: الوَاوُ، وَالبَاءُ، وَالتَّاءُ. وَبِوَاوِ رُبَّ، وَبِمُذْ، وَمُنْذُ»",
      ),
    },
    {
      kind: "point",
      page: 108,
      front: t("Which particles of khafḍ are added here that were not listed in the first chapter?", "مَا حُرُوفُ الخَفْضِ الَّتِي زِيدَتْ هُنَا عَلَى مَا فِي البَابِ الأَوَّلِ؟"),
      back: t("The wāw of rubba, mudh and mundhu.", "«وَبِوَاوِ رُبَّ، وَبِمُذْ، وَمُنْذُ»"),
    },
    {
      kind: "example",
      page: 109,
      front: t("Give the author's example of a noun in khafḍ by iḍāfah.", "اذْكُرْ مِثَالَ المُؤَلِّفِ لِلْمَخْفُوضِ بِالإِضَافَةِ."),
      back: t("Ghulāmu Zaydin.", "«غُلَامُ زَيْدٍ»"),
    },
    {
      kind: "list",
      page: 109,
      front: t("Into which two kinds is iḍāfah divided?", "عَلَى كَمْ قِسْمٍ الإِضَافَةُ؟"),
      back: t("That which is understood with lām, and that which is understood with min.", "«مَا يُقَدَّرُ بِاللَّامِ، وَمَا يُقَدَّرُ بِمِنْ»"),
    },
    {
      kind: "example",
      page: 109,
      front: t("Give the example of iḍāfah understood with lām.", "مَا مِثَالُ الإِضَافَةِ الَّتِي تُقَدَّرُ بِاللَّامِ؟"),
      back: t("Ghulāmu Zaydin (a servant belonging to Zayd).", "«غُلَامُ زَيْدٍ»"),
    },
    {
      kind: "example",
      page: 109,
      front: t("Give the examples of iḍāfah understood with min.", "مَا أَمْثِلَةُ الإِضَافَةِ الَّتِي تُقَدَّرُ بِمِنْ؟"),
      back: t("Thawbu khazzin, bābu sājin, khātamu ḥadīdin (a garment of silk, a door of teak, a ring of iron).", "«ثَوْبُ خَزٍّ، وَبَابُ سَاجٍ، وَخَاتَمُ حَدِيدٍ»"),
    },
  ],
];

export const AJURRUMIYYAH: FlashcardBook = {
  slug: "al-ajurrumiyyah",
  title: t("al-Muqaddimah al-Ājurrūmiyyah", "المُقَدِّمَةُ الآجُرُّومِيَّةُ"),
  shortTitle: "al-Ājurrūmiyyah",
  author: t("Abū ʿAbdillāh Muḥammad ibn Dāwūd aṣ-Ṣanhājī — Ibn Ājurrūm", "أَبُو عَبْدِ اللَّهِ مُحَمَّدُ بْنُ دَاوُدَ الصَّنْهَاجِيُّ، ابْنُ آجُرُّومَ"),
  chapters: t("chapters", "الأَبْوَابُ"),
  subject: "Arabic grammar (naḥw)",
  blurb: "The classic first text in naḥw — definitions, lists and the author's own examples, one deck per bāb.",
  source: PIK_EDITION,
  sections: CARDS.map((cards, i) => ({ number: i + 1, label: LABELS[i], title: TITLES[i], pages: PAGES[i], cards })),
};
