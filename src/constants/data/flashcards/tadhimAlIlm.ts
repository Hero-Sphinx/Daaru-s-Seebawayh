import type { BilingualText, Flashcard, FlashcardBook } from "@/types";

/**
 * Ta'ẓīm al-'Ilm (تَعْظِيمُ العِلْمِ) by Shaykh Ṣāliḥ al-'Uṣaymī — one deck per
 * principle (مَعْقِد), so a student who has only covered Principle 1 practises
 * only Principle 1.
 *
 * Every card comes from the book: the English is the translation printed in
 * al-Madrasah ar-Raḥmāniyyah's bilingual edition, the Arabic is the book's own
 * Arabic column with ḥarakāt added. Āyāt, aḥādīth and sayings are quoted as the
 * book gives them, never paraphrased. `page` is the page of that edition's PDF
 * (it has no printed page numbers). Where a principle quotes poetry, its lines
 * are cards too.
 *
 * Content drafted for review — tests/constants/data/flashcards.test.ts checks
 * the shape (pages, vowelling, poetry); a person checks the substance.
 */

const t = (en: string, ar: string): BilingualText => ({ en, ar });

/** A line of verse: the first half on the front, the second on the back. */
function verse(page: number, first: BilingualText, second: BilingualText, note?: BilingualText): Flashcard {
  return { kind: "poetry", page, front: t(`${first.en} …`, `${first.ar} …`), back: second, ...(note ? { note } : {}) };
}

/** The same line the other way round — for a principle that quotes a single line, so it is learnt both ways. */
function verseReversed(page: number, first: BilingualText, second: BilingualText, note?: BilingualText): Flashcard {
  return { kind: "poetry", page, front: t(`… ${second.en}`, `… ${second.ar}`), back: first, ...(note ? { note } : {}) };
}

const principle = (n: number, title: BilingualText, page: number): Flashcard => ({
  kind: "principle",
  page,
  front: t(`What is the ${ORDINALS[n - 1].en.replace("The ", "")}?`, `مَا ${ORDINALS[n - 1].ar} مِنْ مَعَاقِدِ تَعْظِيمِ العِلْمِ؟`),
  back: title,
});

const ORDINALS: BilingualText[] = [
  t("The First Principle", "المَعْقِدُ الأَوَّلُ"),
  t("The Second Principle", "المَعْقِدُ الثَّانِي"),
  t("The Third Principle", "المَعْقِدُ الثَّالِثُ"),
  t("The Fourth Principle", "المَعْقِدُ الرَّابِعُ"),
  t("The Fifth Principle", "المَعْقِدُ الخَامِسُ"),
  t("The Sixth Principle", "المَعْقِدُ السَّادِسُ"),
  t("The Seventh Principle", "المَعْقِدُ السَّابِعُ"),
  t("The Eighth Principle", "المَعْقِدُ الثَّامِنُ"),
  t("The Ninth Principle", "المَعْقِدُ التَّاسِعُ"),
  t("The Tenth Principle", "المَعْقِدُ العَاشِرُ"),
  t("The Eleventh Principle", "المَعْقِدُ الحَادِيَ عَشَرَ"),
  t("The Twelfth Principle", "المَعْقِدُ الثَّانِيَ عَشَرَ"),
  t("The Thirteenth Principle", "المَعْقِدُ الثَّالِثَ عَشَرَ"),
  t("The Fourteenth Principle", "المَعْقِدُ الرَّابِعَ عَشَرَ"),
  t("The Fifteenth Principle", "المَعْقِدُ الخَامِسَ عَشَرَ"),
  t("The Sixteenth Principle", "المَعْقِدُ السَّادِسَ عَشَرَ"),
  t("The Seventeenth Principle", "المَعْقِدُ السَّابِعَ عَشَرَ"),
  t("The Eighteenth Principle", "المَعْقِدُ الثَّامِنَ عَشَرَ"),
  t("The Nineteenth Principle", "المَعْقِدُ التَّاسِعَ عَشَرَ"),
  t("The Twentieth Principle", "المَعْقِدُ العِشْرُونَ"),
];

const TITLES: BilingualText[] = [
  t("Purifying the Vessel of Knowledge", "تَطْهِيرُ وِعَاءِ العِلْمِ"),
  t("Purity of Intention in Seeking Knowledge", "إِخْلَاصُ النِّيَّةِ فِيهِ"),
  t("Focusing All of Your Attention on Seeking Knowledge", "جَمْعُ هِمَّةِ النَّفْسِ عَلَيْهِ"),
  t("Focusing Your Attention on the Knowledge of the Qur'an and the Sunnah", "صَرْفُ الهِمَّةِ فِيهِ إِلَى عِلْمِ القُرْآنِ وَالسُّنَّةِ"),
  t("Taking the Proper Path Which Will Lead To It", "سُلُوكُ الجَادَّةِ المُوصِلَةِ إِلَيْهِ"),
  t(
    "Taking into Account the Different Sciences when Acquiring Knowledge, and Giving Precedence to Them in Order of Importance",
    "رِعَايَةُ فُنُونِهِ فِي الأَخْذِ، وَتَقْدِيمُ الأَهَمِّ فَالمُهِمِّ",
  ),
  t("Taking the Initiative to Attain Knowledge, and Taking Advantage of Childhood and Youth", "المُبَادَرَةُ إِلَى تَحْصِيلِهِ، وَاغْتِنَامُ سِنِّ الصِّبَا وَالشَّبَابِ"),
  t("Adhering to Being Unhurried in Seeking Knowledge and Leaving off Rushing", "لُزُومُ التَّأَنِّي فِي طَلَبِهِ، وَتَرْكُ العَجَلَةِ"),
  t("Patience in Knowledge – Both in Attaining It and Passing It On", "الصَّبْرُ فِي العِلْمِ تَحَمُّلًا وَأَدَاءً"),
  t("Adhering to the Etiquette of Seeking Knowledge", "مُلَازَمَةُ آدَابِ العِلْمِ"),
  t("Guarding Knowledge from the Things Which Detract From It", "صِيَانَةُ العِلْمِ عَمَّا يَشِينُ، مِمَّا يُخَالِفُ المُرُوءَةَ وَيَخْرِمُهَا"),
  t("Choosing Righteous Company for Seeking Knowledge", "انْتِخَابُ الصُّحْبَةِ الصَّالِحَةِ لَهُ"),
  t("Making an Effort in Memorisation, Revision, and Asking Questions", "بَذْلُ الجُهْدِ فِي تَحَفُّظِ العِلْمِ، وَالمُذَاكَرَةِ بِهِ، وَالسُّؤَالِ عَنْهُ"),
  t("Honouring and Respecting the People of Knowledge", "إِكْرَامُ أَهْلِ العِلْمِ وَتَوْقِيرُهُمْ"),
  t("Refer the Problematic Aspects of Knowledge to the People of Knowledge", "رَدُّ مُشْكِلِهِ إِلَى أَهْلِهِ"),
  t("Respecting the Gatherings of Knowledge, and Honouring Those Who Have It", "تَوْقِيرُ مَجَالِسِ العِلْمِ، وَإِجْلَالُ أَوْعِيَتِهِ"),
  t("Defending Knowledge and Preventing It From Attack", "الذَّبُّ عَنِ العِلْمِ، وَالذَّوْدُ عَنْ حِيَاضِهِ"),
  t("Showing Restraint When Asking the Scholars Questions", "التَّحَفُّظُ فِي مَسْأَلَةِ العَالِمِ"),
  t("Having a Passion for Knowledge and It Being Uppermost in Your Heart", "شَغَفُ القَلْبِ بِالعِلْمِ وَغَلَبَتُهُ عَلَيْهِ"),
  t("Making Good Use of Your Time in Seeking Knowledge", "حِفْظُ الوَقْتِ فِي العِلْمِ"),
];

/** First and last PDF page of each principle. */
const PAGES: [number, number][] = [
  [12, 16],
  [18, 22],
  [24, 32],
  [34, 36],
  [38, 42],
  [44, 48],
  [50, 54],
  [56, 60],
  [62, 66],
  [68, 72],
  [74, 76],
  [78, 82],
  [84, 88],
  [90, 96],
  [98, 100],
  [102, 104],
  [106, 110],
  [112, 118],
  [120, 126],
  [128, 134],
];

const CARDS: Flashcard[][] = [
  // ───────────── 1 · Purifying the vessel of knowledge ─────────────
  [
    principle(1, TITLES[0], 12),
    {
      kind: "term",
      page: 12,
      front: t("What is the vessel of knowledge?", "مَا وِعَاءُ العِلْمِ؟"),
      back: t("The heart.", "القَلْبُ — «وَإِنَّ وِعَاءَ العِلْمِ القَلْبُ»"),
    },
    {
      kind: "point",
      page: 12,
      front: t("What does uncleanliness of the vessel do to what is in it?", "مَا أَثَرُ وَسَخِ الوِعَاءِ فِيمَا فِيهِ؟"),
      back: t("It muddies it and spoils what is in it.", "«وَوَسَخُ الوِعَاءِ يُعَكِّرُهُ وَيُغَيِّرُ مَا فِيهِ»"),
    },
    {
      kind: "example",
      page: 12,
      front: t("The author compares knowledge in the heart to what?", "بِمَ شَبَّهَ المُؤَلِّفُ العِلْمَ فِي القَلْبِ؟"),
      back: t(
        "A lamp: the cleanliness of the glass is what causes its light to spread, and if it is covered in dirt, its light will disappear.",
        "«وَمَثَلُ العِلْمِ فِي القَلْبِ كَنُورِ المِصْبَاحِ، إِنْ صَفَا زُجَاجُهُ شَعَّتْ أَنْوَارُهُ، وَإِنْ لَطَّخَتْهُ الأَوْسَاخُ كَسَفَتْ أَنْوَارُهُ»",
      ),
    },
    {
      kind: "cloze",
      page: 12,
      front: t(
        "“Knowledge is a delicate ______, and it is not appropriate for anything other than a clean heart.”",
        "«فَالعِلْمُ ______ لَطِيفٌ، لَا يَصْلُحُ إِلَّا لِلْقَلْبِ النَّظِيفِ»",
      ),
      back: t("jewel", "جَوْهَرٌ"),
    },
    {
      kind: "list",
      page: 12,
      front: t("The purity of the heart goes back to which two great principles?", "طَهَارَةُ القَلْبِ تَرْجِعُ إِلَى أَيِّ أَصْلَيْنِ عَظِيمَيْنِ؟"),
      back: t(
        "1. Purifying it from the impurity of false notions.\n2. Purifying it from the impurity of desires.",
        "١. طَهَارَتُهُ مِنْ نَجَاسَةِ الشُّبُهَاتِ.\n٢. طَهَارَتُهُ مِنْ نَجَاسَةِ الشَّهَوَاتِ.",
      ),
    },
    {
      kind: "evidence",
      page: 12,
      front: t(
        "Which āyah shows that the Prophet ﷺ was commanded to purify the heart from the very beginning of his call?",
        "مَا الآيَةُ الدَّالَّةُ عَلَى أَنَّ النَّبِيَّ ﷺ أُمِرَ بِطَهَارَةِ القَلْبِ فِي أَوَّلِ مَا أُمِرَ؟",
      ),
      back: t("Sūrah al-Muddaththir: “And purify your garments.”", "قَوْلُهُ تَعَالَى فِي سُورَةِ المُدَّثِّرِ: ﴿وَثِيَابَكَ فَطَهِّرْ﴾"),
    },
    {
      kind: "point",
      page: 14,
      front: t("On what interpretation does the author base using this āyah for the heart?", "عَلَى أَيِّ تَفْسِيرٍ بَنَى المُؤَلِّفُ الاسْتِدْلَالَ بِهَذِهِ الآيَةِ؟"),
      back: t(
        "On the interpretation of those who say that the meaning of garments is the inner-self — a good opinion, derived in a sound way.",
        "«فِي قَوْلِ مَنْ يُفَسِّرُ الثِّيَابَ بِالبَاطِنِ، وَهُوَ قَوْلٌ حَسَنٌ، لَهُ مَأْخَذٌ صَحِيحٌ»",
      ),
    },
    {
      kind: "point",
      page: 14,
      front: t(
        "“If you are shy that a created being like you should see your dirty clothes, then …”",
        "«وَإِذَا كُنْتَ تَسْتَحْيِي مِنْ نَظَرِ مَخْلُوقٍ مِثْلِكَ إِلَى وَسَخِ ثَوْبِكَ …»",
      ),
      back: t(
        "“… be shy of Allāh looking at your heart while there is rancour, afflictions, sins and faults in it.”",
        "«… فَاسْتَحْيِ مِنْ نَظَرِ اللهِ إِلَى قَلْبِكَ، وَفِيهِ إِحَنٌ وَبَلَايَا، وَذُنُوبٌ وَخَطَايَا»",
      ),
    },
    {
      kind: "hadith",
      page: 14,
      front: t("Complete the ḥadīth: “Indeed, Allāh does not look at your physical forms and your wealth …”", "أَكْمِلِ الحَدِيثَ: «إِنَّ اللهَ لَا يَنْظُرُ إِلَى صُوَرِكُمْ وَأَمْوَالِكُمْ …»"),
      back: t("“… rather, He looks at your hearts and your deeds.”", "«… وَلَكِنْ يَنْظُرُ إِلَى قُلُوبِكُمْ وَأَعْمَالِكُمْ»"),
      note: t("Narrated by Muslim, from Abū Hurayrah.", "رَوَاهُ مُسْلِمٌ عَنْ أَبِي هُرَيْرَةَ رَضِيَ اللهُ عَنْهُ."),
    },
    {
      kind: "cloze",
      page: 14,
      front: t(
        "“Whoever purifies his heart, knowledge ______; and whoever does not get rid of its impurities, knowledge will ______.”",
        "«مَنْ طَهَّرَ قَلْبَهُ فِيهِ العِلْمُ ______، وَمَنْ لَمْ يَرْفَعْ مِنْهُ نَجَاسَتَهُ ______ العِلْمُ ______»",
      ),
      back: t("settles within it · bid farewell to him and move on", "حَلَّ · وَدَّعَهُ … وَارْتَحَلَ"),
    },
    {
      kind: "point",
      page: 14,
      front: t("What obvious flaw does the author see in many students regarding this principle?", "مَا الخَلَلُ البَيِّنُ الَّذِي رَآهُ المُؤَلِّفُ فِي طَائِفَةٍ مِنَ الطُّلَّابِ فِي هَذَا المَعْقِدِ؟"),
      back: t(
        "They let false notions and desires enter their hearts morning and evening — so how can the reverence of knowledge exist in them?!",
        "«فَأَيْنَ تَعْظِيمُ العِلْمِ مِنَ امْرِئٍ تَغْدُو الشَّهَوَاتُ وَالشُّبُهَاتُ فِي قَلْبِهِ وَتَرُوحُ؟!»",
      ),
    },
    {
      kind: "quote",
      page: 16,
      front: t(
        "Who said: “It is forbidden for light to enter a heart when it has within it something which Allāh, Mighty and Majestic, hates”?",
        "مَنِ القَائِلُ: «حَرَامٌ عَلَى قَلْبٍ أَنْ يَدْخُلَهُ النُّورُ، وَفِيهِ شَيْءٌ مِمَّا يَكْرَهُ اللهُ ﷻ»؟",
      ),
      back: t("Sahl ibn ʿAbdillāh, may Allāh have mercy on him.", "سَهْلُ بْنُ عَبْدِ اللهِ رَحِمَهُ اللهُ."),
    },
    verse(
      14,
      t("Beware of the hidden things within yourself which;", "وَاحْذَرْ كَمَائِنَ نَفْسِكَ اللَّاتِي مَتَى"),
      t("whenever they come out about you, they break you with humiliation.", "خَرَجَتْ عَلَيْكَ كُسِرْتَ كَسْرَ مُهَانِ"),
    ),
    verseReversed(
      14,
      t("Beware of the hidden things within yourself which;", "وَاحْذَرْ كَمَائِنَ نَفْسِكَ اللَّاتِي مَتَى"),
      t("whenever they come out about you, they break you with humiliation.", "خَرَجَتْ عَلَيْكَ كُسِرْتَ كَسْرَ مُهَانِ"),
    ),
  ],

  // ───────────── 2 · Purity of intention ─────────────
  [
    principle(2, TITLES[1], 18),
    {
      kind: "cloze",
      page: 18,
      front: t("“Making actions sincere is the ______ of their acceptance, and the ______ to reach them.”", "«فَإِنَّ إِخْلَاصَ الأَعْمَالِ ______ قَبُولِهَا، وَ______ وُصُولِهَا»"),
      back: t("foundation · stairway", "أَسَاسُ · سُلَّمُ"),
    },
    {
      kind: "evidence",
      page: 18,
      front: t("Which āyah does the author cite for sincerity being the foundation of actions?", "مَا الآيَةُ الَّتِي اسْتَدَلَّ بِهَا المُؤَلِّفُ عَلَى أَنَّ الإِخْلَاصَ أَسَاسُ قَبُولِ الأَعْمَالِ؟"),
      back: t(
        "“And they were not commanded except to worship Allāh, making the religion sincerely for Him, as pure monotheists.” [al-Bayyinah: 5]",
        "﴿وَمَا أُمِرُوا إِلَّا لِيَعْبُدُوا اللَّهَ مُخْلِصِينَ لَهُ الدِّينَ حُنَفَاءَ﴾ [البَيِّنَة: ٥]",
      ),
    },
    {
      kind: "hadith",
      page: 18,
      front: t("Complete the ḥadīth of ʿUmar: “Actions are according to intention …”", "أَكْمِلْ حَدِيثَ عُمَرَ: «الأَعْمَالُ بِالنِّيَّةِ …»"),
      back: t("“… and every person will have what they intended.”", "«… وَلِكُلِّ امْرِئٍ مَا نَوَى»"),
      note: t("Al-Bukhārī and Muslim; the wording is al-Bukhārī's.", "رَوَاهُ البُخَارِيُّ وَمُسْلِمٌ، وَاللَّفْظُ لِلْبُخَارِيِّ."),
    },
    {
      kind: "quote",
      page: 18,
      front: t(
        "A man mentioned truthfulness and sincerity to Imām Aḥmad. What did he say?",
        "ذَكَرَ رَجُلٌ لِلْإِمَامِ أَحْمَدَ الصِّدْقَ وَالإِخْلَاصَ، فَمَاذَا قَالَ؟",
      ),
      back: t("“It is this that raised up these people.”", "«بِهَذَا ارْتَفَعَ القَوْمُ»"),
      note: t("Narrated by Abū Bakr al-Marrūdhī.", "رَوَاهُ أَبُو بَكْرٍ المَرُّوذِيُّ."),
    },
    {
      kind: "cloze",
      page: 18,
      front: t("“A person only achieves knowledge to the extent of his ______.”", "«وَإِنَّمَا يَنَالُ المَرْءُ العِلْمَ عَلَى قَدْرِ ______»"),
      back: t("sincerity", "إِخْلَاصِهِ"),
    },
    {
      kind: "list",
      page: 20,
      front: t("Sincerity in knowledge is built upon which four principles?", "الإِخْلَاصُ فِي العِلْمِ يَقُومُ عَلَى أَيِّ أُصُولٍ أَرْبَعَةٍ؟"),
      back: t(
        "1. Removing ignorance from himself.\n2. Removing ignorance from creation.\n3. Bringing knowledge to life and protecting it from being lost.\n4. Acting on that knowledge.",
        "١. رَفْعُ الجَهْلِ عَنْ نَفْسِهِ.\n٢. رَفْعُ الجَهْلِ عَنِ الخَلْقِ.\n٣. إِحْيَاءُ العِلْمِ، وَحِفْظُهُ مِنَ الضَّيَاعِ.\n٤. العَمَلُ بِالعِلْمِ.",
      ),
    },
    {
      kind: "point",
      page: 20,
      front: t("How does one remove ignorance from himself, the first of the four?", "كَيْفَ يَكُونُ رَفْعُ الجَهْلِ عَنْ نَفْسِهِ؟"),
      back: t(
        "By acquainting himself with the acts of servitude which he is obligated to do, and being aware of the objectives of the commands and prohibitions.",
        "«بِتَعْرِيفِهَا مَا عَلَيْهَا مِنَ العُبُودِيَّاتِ، وَإِيقَافِهَا عَلَى مَقَاصِدِ الأَمْرِ وَالنَّهْيِ»",
      ),
    },
    {
      kind: "example",
      page: 20,
      front: t("The author likens knowledge and action to what?", "بِمَ شَبَّهَ المُؤَلِّفُ العِلْمَ وَالعَمَلَ؟"),
      back: t(
        "Knowledge is a tree, and action is its fruit. Knowledge is only sought in order to act upon it.",
        "«فَالعِلْمُ شَجَرَةٌ، وَالعَمَلُ ثَمَرَةٌ، وَإِنَّمَا يُرَادُ العِلْمُ لِلْعَمَلِ»",
      ),
    },
    {
      kind: "point",
      page: 20,
      front: t("Why did the early generations refrain from claiming sincerity in their seeking?", "لِمَاذَا كَانَ السَّلَفُ يَتَوَرَّعُونَ عَنِ ادِّعَاءِ الإِخْلَاصِ فِي طَلَبِهِمُ العِلْمَ؟"),
      back: t(
        "They feared its loss — out of caution and piety, not because they did not really have it in their hearts.",
        "«يَخَافُونَ فَوَاتَ الإِخْلَاصِ فِي طَلَبِهِمُ العِلْمَ، فَيَتَوَرَّعُونَ عَنِ ادِّعَائِهِ، لَا أَنَّهُمْ لَمْ يُحَقِّقُوهُ فِي قُلُوبِهِمْ»",
      ),
    },
    {
      kind: "quote",
      page: 20,
      front: t(
        "Who said: “By Allāh, I cannot say that I went for even a single day to seek knowledge of ḥadīth, seeking thereby the face of Allāh”?",
        "مَنِ القَائِلُ: «وَاللهِ، مَا أَسْتَطِيعُ أَنْ أَقُولَ: إِنِّي ذَهَبْتُ يَوْمًا أَطْلُبُ الحَدِيثَ أُرِيدُ بِهِ وَجْهَ اللهِ ﷻ»؟",
      ),
      back: t("Hishām ad-Dastawāʾī, may Allāh have mercy on him.", "هِشَامٌ الدَّسْتُوَائِيُّ رَحِمَهُ اللهُ."),
    },
    {
      kind: "quote",
      page: 20,
      front: t("Imām Aḥmad was asked: “Did you seek knowledge for Allāh?” What did he answer?", "سُئِلَ الإِمَامُ أَحْمَدُ: هَلْ طَلَبْتَ العِلْمَ للهِ؟ فَمَاذَا قَالَ؟"),
      back: t("“For Allāh!? That is something hard! But it was something that was beloved to me, so I sought it.”", "«للهِ! عَزِيزٌ، وَلَكِنَّهُ شَيْءٌ حُبِّبَ إِلَيَّ فَطَلَبْتُهُ»"),
    },
    {
      kind: "cloze",
      page: 20,
      front: t("“Whoever loses sincerity, he loses ______ and an abundance of good.”", "«وَمَنْ ضَيَّعَ الإِخْلَاصَ فَاتَهُ ______، وَخَيْرٌ وَفِيرٌ»"),
      back: t("a great deal of knowledge", "عِلْمٌ كَثِيرٌ"),
    },
    {
      kind: "quote",
      page: 22,
      front: t(
        "Who said: “I never struggled to correct anything harder for me than my intention, because it turns on me”?",
        "مَنِ القَائِلُ: «مَا عَالَجْتُ شَيْئًا أَشَدَّ عَلَيَّ مِنْ نِيَّتِي؛ لِأَنَّهَا تَتَقَلَّبُ عَلَيَّ»؟",
      ),
      back: t("Sufyān ath-Thawrī, may Allāh have mercy on him.", "سُفْيَانُ الثَّوْرِيُّ رَحِمَهُ اللهُ."),
    },
    {
      kind: "quote",
      page: 22,
      front: t("Who said that a single ḥadīth he narrated could require multiple intentions?", "مَنِ القَائِلُ: «فَإِذَا الحَدِيثُ الوَاحِدُ يَحْتَاجُ إِلَى نِيَّاتٍ»؟"),
      back: t(
        "Sulaymān al-Hāshimī: “Perhaps I would narrate a single ḥadīth with a certain intention, and when I come to a certain part of it, my intention would change.”",
        "سُلَيْمَانُ الهَاشِمِيُّ: «رُبَّمَا أُحَدِّثُ بِحَدِيثٍ وَاحِدٍ وَلِي نِيَّةٌ، فَإِذَا أَتَيْتُ عَلَى بَعْضِهِ تَغَيَّرَتْ نِيَّتِي»",
      ),
    },
  ],

  // ───────────── 3 · Focusing all of your attention ─────────────
  [
    principle(3, TITLES[2], 24),
    {
      kind: "list",
      page: 24,
      front: t("Attention can only be focused on a goal by checking which three things?", "بِأَيِّ ثَلَاثَةِ أُمُورٍ تُجْمَعُ الهِمَّةُ عَلَى المَطْلُوبِ؟"),
      back: t(
        "1. A keenness for what benefits.\n2. Seeking the help of Allāh in achieving it.\n3. Not being impotent in reaching the desired goal of it.",
        "١. الحِرْصُ عَلَى مَا يَنْفَعُ.\n٢. الاسْتِعَانَةُ بِاللهِ ﷻ فِي تَحْصِيلِهِ.\n٣. عَدَمُ العَجْزِ عَنْ بُلُوغِ البُغْيَةِ مِنْهُ.",
      ),
    },
    {
      kind: "hadith",
      page: 26,
      front: t("Which ḥadīth gathers these three things together?", "مَا الحَدِيثُ الَّذِي جَمَعَ هَذِهِ الأُمُورَ الثَّلَاثَةَ؟"),
      back: t("“Be keen for what will benefit you, and seek the help of Allāh, and do not feel helpless.”", "«احْرِصْ عَلَى مَا يَنْفَعُكَ، وَاسْتَعِنْ بِاللهِ، وَلَا تَعْجَزْ»"),
      note: t("Narrated by Muslim, from Abū Hurayrah.", "رَوَاهُ مُسْلِمٌ عَنْ أَبِي هُرَيْرَةَ رَضِيَ اللهُ عَنْهُ."),
    },
    {
      kind: "quote",
      page: 26,
      front: t(
        "Who said: “Nobody seeks something with dedication and truthfulness except that he will achieve it; even if he doesn't achieve all of it, he will achieve some of it”?",
        "مَنِ القَائِلُ: «مَا طَلَبَ أَحَدٌ شَيْئًا بِجِدٍّ وَصِدْقٍ إِلَّا نَالَهُ، فَإِنْ لَمْ يَنَلْهُ كُلَّهُ نَالَ بَعْضَهُ»؟",
      ),
      back: t("Al-Junayd, may Allāh have mercy on him.", "الجُنَيْدُ رَحِمَهُ اللهُ."),
    },
    {
      kind: "quote",
      page: 26,
      front: t(
        "Complete Ibn al-Qayyim's words (al-Fawāʾid): “If the star of aspiration rises in the darkness of the night of idleness, and this is combined with the moon of dedication …”",
        "أَكْمِلْ قَوْلَ ابْنِ القَيِّمِ فِي «الفَوَائِدِ»: «إِذَا طَلَعَ نَجْمُ الهِمَّةِ فِي ظَلَامِ لَيْلِ البَطَالَةِ، وَرَدِفَهُ قَمَرُ العَزِيمَةِ …»",
      ),
      back: t("“… the earth will be lit up with the light of its Lord.”", "«… أَشْرَقَتِ الأَرْضُ بِنُورِ رَبِّهَا»"),
    },
    {
      kind: "point",
      page: 26,
      front: t("What happens to the one whose attention is attached to food, clothing, eating or drinking?", "مَا حَالُ مَنْ تَعَلَّقَتْ هِمَّتُهُ بِمَطْعَمٍ أَوْ مَلْبَسٍ أَوْ مَأْكَلٍ أَوْ مَشْرَبٍ؟"),
      back: t("He will not smell the fragrance of knowledge.", "«لَمْ يَشَمَّ رَائِحَةَ العِلْمِ»"),
    },
    {
      kind: "story",
      page: 28,
      front: t(
        "What would Imām Aḥmad's mother do when, as a child, he wanted to leave before Fajr for the circles of the scholars?",
        "مَاذَا كَانَتْ تَفْعَلُ أُمُّ الإِمَامِ أَحْمَدَ إِذَا أَرَادَ الخُرُوجَ قَبْلَ الفَجْرِ إِلَى حِلَقِ الشُّيُوخِ وَهُوَ فِي الصِّبَا؟",
      ),
      back: t(
        "She would hold on to his clothing, as a mercy to him, until the adhān was given or the morning came.",
        "«فَتَأْخُذُ أُمُّهُ بِثِيَابِهِ وَتَقُولُ - رَحْمَةً بِهِ -: حَتَّى يُؤَذِّنَ النَّاسُ أَوْ يُصْبِحُوا»",
      ),
    },
    {
      kind: "story",
      page: 28,
      front: t("In how many sittings did al-Khaṭīb al-Baghdādī read all of Ṣaḥīḥ al-Bukhārī to Ismāʿīl al-Ḥīrī?", "فِي كَمْ مَجْلِسٍ قَرَأَ الخَطِيبُ البَغْدَادِيُّ «صَحِيحَ البُخَارِيِّ» كُلَّهُ عَلَى إِسْمَاعِيلَ الحِيرِيِّ؟"),
      back: t("Three sittings — two of them through the night, from Maghrib until the break of dawn.", "فِي ثَلَاثَةِ مَجَالِسَ؛ اثْنَانِ مِنْهَا فِي لَيْلَتَيْنِ مِنْ وَقْتِ صَلَاةِ المَغْرِبِ إِلَى صَلَاةِ الفَجْرِ."),
      note: t("Adh-Dhahabī: “This is something that I do not know of anyone in our time who would be able to do it!”", "قَالَ الذَّهَبِيُّ: «وَهَذَا شَيْءٌ لَا أَعْلَمُ أَحَدًا فِي زَمَانِنَا يَسْتَطِيعُهُ»."),
    },
    {
      kind: "story",
      page: 30,
      front: t("When his mother stopped him reading at night, what did Ibn at-Tabbān do?", "لَمَّا نَهَتْهُ أُمُّهُ عَنِ القِرَاءَةِ بِاللَّيْلِ، مَاذَا كَانَ يَفْعَلُ ابْنُ التَّبَّانِ؟"),
      back: t(
        "He hid the lamp under a large vessel (jafnah) and pretended to sleep; when she fell asleep, he took out the lamp and studied.",
        "«فَكَانَ يَأْخُذُ المِصْبَاحَ وَيَجْعَلُهُ تَحْتَ الجَفْنَةِ، وَيَتَظَاهَرُ بِالنَّوْمِ، فَإِذَا رَقَدَتْ أَخْرَجَ المِصْبَاحَ وَأَقْبَلَ عَلَى الدَّرْسِ»",
      ),
    },
    {
      kind: "cloze",
      page: 30,
      front: t("“Do not be young in body but feeble in aspiration, for indeed the aspirations of the truthful person ______.”", "«وَلَا تَكُنْ شَابَّ البَدَنِ أَشْيَبَ الهِمَّةِ؛ فَإِنَّ هِمَّةَ الصَّادِقِ ______»"),
      back: t("never grow old", "لَا تَشِيبُ"),
    },
    verse(
      24,
      t("If there is no help from Allāh for a young man;", "إِذَا لَمْ يَكُنْ عَوْنٌ مِنَ اللهِ لِلْفَتَى"),
      t("the first thing that will transgress against him is his own judgement.", "فَأَوَّلُ مَا يَجْنِي عَلَيْهِ اجْتِهَادُهُ"),
    ),
    verse(
      26,
      t("Achievement comes from hard work, and failure comes from laziness;", "الجِدُّ بِالجِدِّ وَالحِرْمَانُ بِالكَسَلِ"),
      t("exert yourself and you will soon achieve the goal of your dreams.", "فَانْصَبْ تُصِبْ عَنْ قَرِيبٍ غَايَةَ الأَمَلِ"),
    ),
    verse(
      28,
      t("Know that knowledge will not be gained by he;", "وَاعْلَمْ بِأَنَّ العِلْمَ لَيْسَ يَنَالُهُ"),
      t("whose attention is to food and to clothing.", "مَنْ هَمُّهُ فِي مَطْعَمٍ أَوْ مَلْبَسِ"),
    ),
    verse(
      28,
      t("So be keen, so that you reach in knowledge, an abundant portion;", "فَاحْرِصْ لِتَبْلُغَ فِيهِ حَظًّا وَافِرًا"),
      t("and abandon for it beautiful sleep, and journey through the night.", "وَاهْجُرْ لَهُ طِيبَ المَنَامِ وَغَلِّسِ"),
    ),
    verse(
      32,
      t("Only my hair has changed when it is not dyed;", "وَإِنَّمَا اعْتَاضَ شَعْرِي غَيْرَ صِبْغَتِهِ"),
      t("and greyness in the hair is not like growing old in ambition.", "وَالشَّيْبُ فِي الشَّعْرِ غَيْرُ الشَّيْبِ فِي الهِمَمِ"),
      t("Recited by Abūl-Wafāʾ Ibn ʿAqīl in his eighties.", "أَنْشَدَهُ أَبُو الوَفَاءِ ابْنُ عَقِيلٍ وَهُوَ فِي الثَّمَانِينَ."),
    ),
  ],

  // ───────────── 4 · The Qur'an and the Sunnah ─────────────
  [
    principle(4, TITLES[3], 34),
    {
      kind: "point",
      page: 34,
      front: t("Every beneficial kind of knowledge goes back to what?", "كُلُّ عِلْمٍ نَافِعٍ مَرَدُّهُ إِلَى مَاذَا؟"),
      back: t("To the speech of Allāh and the speech of His Messenger ﷺ.", "«إِلَى كَلَامِ اللهِ وَكَلَامِ رَسُولِهِ ﷺ»"),
    },
    {
      kind: "list",
      page: 34,
      front: t("All other kinds of knowledge are one of which two kinds?", "بَاقِي العُلُومِ عَلَى أَيِّ قِسْمَيْنِ؟"),
      back: t(
        "1. There to serve those two — so you take enough of them to provide that service.\n2. Alien to them — so it will not harm to be ignorant of them.",
        "١. «إِمَّا خَادِمٌ لَهُمَا؛ فَيُؤْخَذُ مِنْهُ مَا تَتَحَقَّقُ بِهِ الخِدْمَةُ»\n٢. «أَوْ أَجْنَبِيٌّ عَنْهُمَا؛ فَلَا يَضُرُّ الجَهْلُ بِهِ»",
      ),
    },
    {
      kind: "evidence",
      page: 34,
      front: t("Which āyah shows the Prophet ﷺ was commanded to adhere to the Qur'an and the Sunnah?", "مَا الآيَةُ الدَّالَّةُ عَلَى أَنَّ النَّبِيَّ ﷺ أُمِرَ بِالقُرْآنِ وَالسُّنَّةِ؟"),
      back: t(
        "“So adhere to that which is revealed to you. Indeed, you are on a straight path.” [az-Zukhruf: 43]",
        "﴿فَاسْتَمْسِكْ بِالَّذِي أُوحِيَ إِلَيْكَ إِنَّكَ عَلَى صِرَاطٍ مُسْتَقِيمٍ﴾ [الزُّخْرُف: ٤٣]",
      ),
    },
    {
      kind: "point",
      page: 34,
      front: t("What does the one who makes his knowledge the Qur'an and the Sunnah become?", "مَنْ جَعَلَ عِلْمَهُ القُرْآنَ وَالسُّنَّةَ، فَمَا حَالُهُ؟"),
      back: t("A follower, not an innovator, and he will gain the most abundant of knowledge.", "«كَانَ مُتَّبِعًا غَيْرَ مُبْتَدِعٍ، وَنَالَ مِنَ العِلْمِ أَوْفَرَهُ»"),
    },
    {
      kind: "quote",
      page: 34,
      front: t("Complete Ibn Masʿūd's saying: “Whoever wants knowledge, let him examine the Qur'an …”", "أَكْمِلْ قَوْلَ ابْنِ مَسْعُودٍ: «مَنْ أَرَادَ العِلْمَ فَلْيُثَوِّرِ القُرْآنَ …»"),
      back: t("“… for it contains the knowledge of the early and latter people.”", "«… فَإِنَّ فِيهِ عِلْمَ الأَوَّلِينَ وَالآخِرِينَ»"),
    },
    {
      kind: "quote",
      page: 34,
      front: t(
        "Who said: “We did not ask the companions of Muḥammad ﷺ about anything except that the knowledge of it was found in the Qur'an, but our knowledge of it was deficient”?",
        "مَنِ القَائِلُ: «مَا نَسْأَلُ أَصْحَابَ مُحَمَّدٍ ﷺ عَنْ شَيْءٍ إِلَّا عِلْمُهُ فِي القُرْآنِ، إِلَّا أَنَّ عِلْمَنَا يَقْصُرُ عَنْهُ»؟",
      ),
      back: t("Masrūq, may Allāh have mercy on him.", "مَسْرُوقٌ رَحِمَهُ اللهُ."),
    },
    {
      kind: "quote",
      page: 36,
      front: t("According to Ibn al-Qayyim (al-Fawāʾid), what is the highest of aspirations in seeking knowledge?", "مَا أَعْلَى الهِمَمِ فِي طَلَبِ العِلْمِ كَمَا قَالَ ابْنُ القَيِّمِ فِي «الفَوَائِدِ»؟"),
      back: t(
        "“Seeking knowledge of the Book and the Sunnah, and understanding it the way that Allāh and His messenger intended, and the knowledge of the limits which have been sent down.”",
        "«طَلَبُ عِلْمِ الكِتَابِ وَالسُّنَّةِ، وَالفَهْمُ عَنِ اللهِ وَرَسُولِهِ نَفْسَ المُرَادِ، وَعِلْمُ حُدُودِ المُنَزَّلِ»",
      ),
    },
    {
      kind: "quote",
      page: 36,
      front: t(
        "Ḥammād ibn Zayd asked Ayyūb as-Sakhtiyānī: “Is knowledge today more, or was it more in the past?” What did he answer?",
        "سَأَلَ حَمَّادُ بْنُ زَيْدٍ أَيُّوبَ السَّخْتِيَانِيَّ: العِلْمُ اليَوْمَ أَكْثَرُ أَوْ فِيمَا تَقَدَّمَ؟ فَمَاذَا قَالَ؟",
      ),
      back: t("“Speech today is more, and knowledge was more in the past.”", "«الكَلَامُ اليَوْمَ أَكْثَرُ، وَالعِلْمُ فِيمَا تَقَدَّمَ أَكْثَرُ»"),
    },
    verse(
      36,
      t("All of knowledge is found in the Qur'an, however;", "جَمِيعُ العِلْمِ فِي القُرْآنِ لَكِنْ"),
      t("men are incapable of understanding it.", "تَقَاصَرَ عَنْهُ أَفْهَامُ الرِّجَالِ"),
      t("Attributed to Ibn ʿAbbās.", "يُنْسَبُ إِلَى ابْنِ عَبَّاسٍ رَضِيَ اللهُ عَنْهُمَا."),
    ),
    verse(
      36,
      t("Knowledge is found in two sources, none transgresses them;", "العِلْمُ فِي أَصْلَيْنِ لَا يَعْدُوهُمَا"),
      t("except the one misguided from the clear road.", "إِلَّا المُضِلُّ عَنِ الطَّرِيقِ اللَّاحِبِ"),
      t("ʿIyāḍ al-Yaḥṣubī, in al-Ilmāʿ.", "عِيَاضٌ اليَحْصُبِيُّ فِي «الإِلْمَاعِ»."),
    ),
    verse(
      36,
      t("Knowledge of the Book, and knowledge of the narrations which are;", "عِلْمُ الكِتَابِ وَعِلْمُ الآثَارِ الَّتِي"),
      t("attributed, from a follower, from a companion.", "قَدْ أُسْنِدَتْ عَنْ تَابِعٍ عَنْ صَاحِبِ"),
      t("ʿIyāḍ al-Yaḥṣubī, in al-Ilmāʿ.", "عِيَاضٌ اليَحْصُبِيُّ فِي «الإِلْمَاعِ»."),
    ),
  ],

  // ───────────── 5 · The proper path ─────────────
  [
    principle(5, TITLES[4], 38),
    {
      kind: "point",
      page: 38,
      front: t("What happens to the one who takes the wrong path in seeking knowledge?", "مَا حَالُ مَنْ أَخْطَأَ طَرِيقَ العِلْمِ؟"),
      back: t(
        "He will be misguided and will not achieve his target — and perhaps will get very little benefit for a great amount of effort.",
        "«ضَلَّ وَلَمْ يَنَلِ المَقْصُودَ، وَرُبَّمَا أَصَابَ فَائِدَةً قَلِيلَةً مَعَ تَعَبٍ كَثِيرٍ»",
      ),
    },
    {
      kind: "quote",
      page: 38,
      front: t(
        "Who said, in Taʿlīm al-Mutaʿallim: “Everyone who takes the wrong path will be misguided, and will not achieve his objective, whether a little or a lot”?",
        "مَنِ القَائِلُ فِي «تَعْلِيمِ المُتَعَلِّمِ»: «وَكُلُّ مَنْ أَخْطَأَ الطَّرِيقَ ضَلَّ، وَلَا يَنَالُ المَقْصُودَ قَلَّ أَوْ جَلَّ»؟",
      ),
      back: t("Az-Zarnūjī, may Allāh have mercy on him.", "الزَّرْنُوجِيُّ رَحِمَهُ اللهُ."),
    },
    {
      kind: "quote",
      page: 38,
      front: t("According to Ibn al-Qayyim, what does ignorance of the path, its hardships, and the objective necessitate?", "مَاذَا يُوجِبُ الجَهْلُ بِالطَّرِيقِ وَآفَاتِهَا وَالمَقْصُودِ، كَمَا قَالَ ابْنُ القَيِّمِ؟"),
      back: t("“A great deal of exertion for very little benefit.”", "«يُوجِبُ التَّعَبَ الكَثِيرَ مَعَ الفَائِدَةِ القَلِيلَةِ»"),
    },
    {
      kind: "list",
      page: 40,
      front: t("The road of knowledge is built upon which two things?", "طَرِيقُ العِلْمِ وَجَادَّتُهُ مَبْنِيَّةٌ عَلَى أَيِّ أَمْرَيْنِ؟"),
      back: t(
        "1. To memorise a text which gathers together that which is superior.\n2. To take that text from one who benefits and sincerely advises.",
        "١. حِفْظُ مَتْنٍ جَامِعٍ لِلرَّاجِحِ.\n٢. أَخْذُهُ عَلَى مُفِيدٍ نَاصِحٍ.",
      ),
    },
    {
      kind: "point",
      page: 40,
      front: t("What does the author say of the one who thinks he can gain knowledge without memorisation?", "مَاذَا قَالَ المُؤَلِّفُ فِيمَنْ ظَنَّ أَنَّهُ يَنَالُ العِلْمَ بِلَا حِفْظٍ؟"),
      back: t("Memorisation is a must; he is seeking something unattainable.", "«فَلَا بُدَّ مِنْ حِفْظٍ، وَمَنْ ظَنَّ أَنَّهُ يَنَالُ العِلْمَ بِلَا حِفْظٍ فَإِنَّهُ يَطْلُبُ مُحَالًا»"),
    },
    {
      kind: "example",
      page: 40,
      front: t("What example does the author give of memorising the obscure text and leaving the well-known one?", "مَا المِثَالُ الَّذِي ضَرَبَهُ المُؤَلِّفُ لِمَنْ يَحْفَظُ المَغْمُورَ فِي فَنٍّ وَيَتْرُكُ مَشْهُورَهُ؟"),
      back: t("The one who memorises Alfiyyat al-Āthārī in naḥw and leaves Alfiyyah Ibn Mālik.", "«كَمَنْ يَحْفَظُ أَلْفِيَّةَ الآثَارِيِّ فِي النَّحْوِ، وَيَتْرُكُ أَلْفِيَّةَ ابْنِ مَالِكٍ»"),
    },
    {
      kind: "term",
      page: 40,
      front: t("What does it mean that the shaykh is one who benefits (al-ifādah)?", "مَا مَعْنَى «الإِفَادَةِ» فِي الشَّيْخِ؟"),
      back: t(
        "He is qualified in this knowledge: known as one who sought it and took it from others until he gained it, and ended up with a strong aptitude in it.",
        "«وَهِيَ الأَهْلِيَّةُ فِي العِلْمِ، فَيَكُونُ مِمَّنْ عُرِفَ بِطَلَبِ العِلْمِ وَتَلَقِّيهِ حَتَّى أَدْرَكَ، فَصَارَتْ لَهُ مَلَكَةٌ قَوِيَّةٌ فِيهِ»",
      ),
    },
    {
      kind: "hadith",
      page: 42,
      front: t("What ḥadīth is the basis for taking knowledge from a teacher?", "مَا الحَدِيثُ الَّذِي هُوَ الأَصْلُ فِي أَخْذِ العِلْمِ عَنِ الشَّيْخِ؟"),
      back: t("“You will hear, and others will hear from you, and others will hear from those that heard from you.”", "«تَسْمَعُونَ، وَيُسْمَعُ مِنْكُمْ، وَيُسْمَعُ مِمَّنْ يَسْمَعُ مِنْكُمْ»"),
      note: t("Abū Dāwūd, from Ibn ʿAbbās; its chain is strong.", "رَوَاهُ أَبُو دَاوُدَ عَنِ ابْنِ عَبَّاسٍ، وَإِسْنَادُهُ قَوِيٌّ."),
    },
    {
      kind: "list",
      page: 42,
      front: t("The attribute of sincere advice (an-naṣīḥah) in the shaykh comprises which two meanings?", "وَصْفُ «النَّصِيحَةِ» فِي الشَّيْخِ يَجْمَعُ أَيَّ مَعْنَيَيْنِ؟"),
      back: t(
        "1. His suitability as an example to be followed — the student guided by his guidance, conduct and manners.\n2. His knowledge of the methods of teaching — knowing what is suitable for students and what will harm them.",
        "١. صَلَاحِيَةُ الشَّيْخِ لِلِاقْتِدَاءِ بِهِ، وَالِاهْتِدَاءِ بِهَدْيِهِ وَدَلِّهِ وَسَمْتِهِ.\n٢. مَعْرِفَتُهُ بِطَرَائِقِ التَّعْلِيمِ، بِحَيْثُ يُحْسِنُ تَعْلِيمَ المُتَعَلِّمِ، وَيَعْرِفُ مَا يَصْلُحُ لَهُ وَمَا يَضُرُّهُ.",
      ),
    },
    verse(
      38,
      t("The end [of seeking knowledge] cannot be attained in a thousand years;", "فَمَا حَوَى الغَايَةَ فِي أَلْفِ سَنَهْ"),
      t("by a person, so take from every science the best of it.", "شَخْصٌ فَخُذْ مِنْ كُلِّ فَنٍّ أَحْسَنَهْ"),
      t("Murtaḍā az-Zabīdī, author of Tāj al-ʿArūs, in Alfiyyat as-Sanad.", "مُرْتَضَى الزَّبِيدِيُّ، صَاحِبُ «تَاجِ العَرُوسِ»، فِي «أَلْفِيَّةِ السَّنَدِ»."),
    ),
    verse(
      40,
      t("By memorising a text which gathers together that which is superior;", "بِحِفْظِ مَتْنٍ جَامِعٍ لِلرَّاجِحِ"),
      t("taking it from one who benefits and sincerely advises.", "تَأْخُذُهُ عَلَى مُفِيدٍ نَاصِحِ"),
      t("Murtaḍā az-Zabīdī, in Alfiyyat as-Sanad.", "مُرْتَضَى الزَّبِيدِيُّ فِي «أَلْفِيَّةِ السَّنَدِ»."),
    ),
  ],

  // ───────────── 6 · The different sciences, most important first ─────────────
  [
    principle(6, TITLES[5], 44),
    {
      kind: "example",
      page: 44,
      front: t("To what does the author liken taking a share of every science?", "بِمَ شَبَّهَ المُؤَلِّفُ رِعَايَةَ فُنُونِ العِلْمِ فِي الأَخْذِ؟"),
      back: t(
        "A pleasant image, whose beauty grows the more of it the eye takes in. Whoever gains a share of each science, his skill in knowledge becomes complete.",
        "بِالصُّورَةِ المُسْتَحْسَنَةِ يَزِيدُ حُسْنُهَا بِتَمَتُّعِ البَصَرِ بِجَمِيعِ أَجْزَائِهَا؛ «مَنْ رَعَى فُنُونَهُ بِالأَخْذِ، وَأَصَابَ مِنْ كُلِّ فَنٍّ حَظًّا، كَمُلَتْ آلَتُهُ فِي العِلْمِ»",
      ),
    },
    {
      kind: "quote",
      page: 44,
      front: t("What did Ibn al-Jawzī say in Ṣayd al-Khāṭir about gathering different types of knowledge?", "مَاذَا قَالَ ابْنُ الجَوْزِيِّ فِي «صَيْدِ الخَاطِرِ» عَنْ جَمْعِ العُلُومِ؟"),
      back: t("“Gathering different types of knowledge is something praiseworthy.”", "«جَمْعُ العُلُومِ مَمْدُوحٌ»"),
    },
    {
      kind: "quote",
      page: 44,
      front: t("According to Ibn Māniʿ (Irshād aṭ-Ṭullāb), what kind of knowledge should a person of virtue not leave?", "أَيَّ عِلْمٍ لَا يَنْبَغِي لِلْفَاضِلِ أَنْ يَتْرُكَهُ، كَمَا قَالَ ابْنُ مَانِعٍ فِي «إِرْشَادِ الطُّلَّابِ»؟"),
      back: t(
        "A kind of beneficial knowledge which will help him understand the Book and the Sunnah, if he knows he has the strength to learn it.",
        "«عِلْمًا مِنَ العُلُومِ النَّافِعَةِ، الَّتِي تُعِينُ عَلَى فَهْمِ الكِتَابِ وَالسُّنَّةِ، إِذَا كَانَ يَعْلَمُ مِنْ نَفْسِهِ قُوَّةً عَلَى تَعَلُّمِهِ»",
      ),
    },
    {
      kind: "list",
      page: 46,
      front: t("Taking into account the different sciences only benefits when depending on which two fundamentals?", "رِعَايَةُ فُنُونِ العِلْمِ إِنَّمَا تَنْفَعُ بِاعْتِمَادِ أَيِّ أَصْلَيْنِ؟"),
      back: t(
        "1. Giving precedence to them in order of importance.\n2. Intending at the beginning to cover a summarised text in each science.",
        "١. تَقْدِيمُ الأَهَمِّ فَالمُهِمِّ.\n٢. أَنْ يَكُونَ قَصْدُهُ فِي أَوَّلِ طَلَبِهِ تَحْصِيلَ مُخْتَصَرٍ فِي كُلِّ فَنٍّ.",
      ),
    },
    {
      kind: "quote",
      page: 46,
      front: t("Mālik ibn Anas was asked about seeking knowledge. What did he say?", "سُئِلَ مَالِكُ بْنُ أَنَسٍ عَنْ طَلَبِ العِلْمِ، فَمَاذَا قَالَ؟"),
      back: t(
        "“Beautiful and good; however, look at what you will need to do from morning until evening, and stick [to learning] that.”",
        "«حَسَنٌ جَمِيلٌ، وَلَكِنِ انْظُرِ الَّذِي يَلْزَمُكَ مِنْ حِينِ تُصْبِحُ إِلَى حِينِ تُمْسِي فَالْزَمْهُ»",
      ),
    },
    {
      kind: "quote",
      page: 46,
      front: t("Who said: “Whoever busies himself with something unimportant, will be harmed by that which is important”?", "مَنِ القَائِلُ: «مَنْ شَغَلَ نَفْسَهُ بِغَيْرِ المُهِمِّ أَضَرَّ بِالمُهِمِّ»؟"),
      back: t("Abū ʿUbaydah, Maʿmar ibn al-Muthannā.", "أَبُو عُبَيْدَةَ مَعْمَرُ بْنُ المُثَنَّى رَحِمَهُ اللهُ."),
    },
    {
      kind: "point",
      page: 48,
      front: t("Studying one science at a time, or several at once — which suits most students?", "إِفْرَادُ الفُنُونِ أَمْ جَمْعُهَا: أَيُّهُمَا المُنَاسِبُ لِعُمُومِ الطَّلَبَةِ؟"),
      back: t(
        "One at a time. Whoever knows he can combine several at once may do so — his situation is an exception to the rule.",
        "«وَالإِفْرَادُ هُوَ المُنَاسِبُ لِعُمُومِ الطَّلَبَةِ»، وَمَنْ عَرَفَ مِنْ نَفْسِهِ قُدْرَةً عَلَى الجَمْعِ جَمَعَ.",
      ),
    },
    {
      kind: "quote",
      page: 48,
      front: t("Complete Mālik's saying: “The worst of knowledge is that which is odd …”", "أَكْمِلْ قَوْلَ مَالِكٍ: «شَرُّ العِلْمِ الغَرِيبُ …»"),
      back: t("“… and the best of knowledge is that which is manifest; that which the people have narrated.”", "«… وَخَيْرُ العِلْمِ الظَّاهِرُ الَّذِي قَدْ رَوَاهُ النَّاسُ»"),
    },
    verse(
      44,
      t("Take from every science, and do not be ignorant of it;", "مِنْ كُلِّ فَنٍّ خُذْ وَلَا تَجْهَلْ بِهِ"),
      t("for the free person is one who looks into the secrets [of different sciences].", "فَالحُرُّ مُطَّلِعٌ عَلَى الأَسْرَارِ"),
      t("Quoted by Ibn al-Jawzī in Ṣayd al-Khāṭir.", "أَوْرَدَهُ ابْنُ الجَوْزِيِّ فِي «صَيْدِ الخَاطِرِ»."),
    ),
    verse(
      46,
      t("Sciences that if [he] knew them, he would not have detested them;", "عُلُومًا لَوْ قَرَاهَا مَا قَلَاهَا"),
      t("but contentment with ignorance is sahl (easy).", "وَلَكِنَّ الرِّضَا بِالجَهْلِ سَهْلُ"),
      t("About “Sahl”, who censured sciences he did not know.", "فِي «سَهْلٍ» الَّذِي ذَمَّ عُلُومًا لَا يَعْرِفُهَا."),
    ),
    verse(
      46,
      t("Give precedence to the most important, for knowledge is copious;", "وَقَدِّمِ الأَهَمَّ إِنَّ العِلْمَ جَمّْ"),
      t("and life is but a brief apparition or a guest who pays a short visit.", "وَالعُمْرُ طَيْفٌ زَارَ أَوْ ضَيْفٌ أَلَمّْ"),
    ),
    verse(
      48,
      t("If you want to learn a science, complete it;", "وَإِنْ تُرِدْ تَحْصِيلَ فَنٍّ تَمِّمَهْ"),
      t("and as for others, before you finish [the first one], stop!", "وَعَنْ سِوَاهُ قَبْلَ الِانْتِهَاءِ مَهْ"),
      t("From the lines of Mauritanian poetry.", "مِنْ طَيَّارِ شِعْرِ الشَّنَاقِطَةِ."),
    ),
    verse(
      48,
      t("Prohibition has come for learning multiple sciences at once;", "وَفِي تَرَادُفِ العُلُومِ المَنْعُ جَا"),
      t("for if two twins try to leave [the womb] together, they will never come out!", "إِنْ تَوْأَمَانِ اسْتَبَقَا لَنْ يَخْرُجَا"),
      t("From the lines of Mauritanian poetry.", "مِنْ طَيَّارِ شِعْرِ الشَّنَاقِطَةِ."),
    ),
  ],

  // ───────────── 7 · Taking the initiative; youth ─────────────
  [
    principle(7, TITLES[6], 50),
    {
      kind: "example",
      page: 50,
      front: t("To what does the author liken life?", "بِمَ شَبَّهَ المُؤَلِّفُ العُمُرَ؟"),
      back: t(
        "A flower: either it will become a fruit, through seeking things of high value; or it will be expended.",
        "«فَإِنَّ العُمُرَ زَهْرَةٌ: إِمَّا أَنْ تَصِيرَ بِسُلُوكِ المَعَالِي ثَمَرَةً، وَإِمَّا أَنْ تَذْبُلَ»",
      ),
    },
    {
      kind: "evidence",
      page: 50,
      front: t("Which āyah commands racing towards all that is good?", "مَا الآيَةُ الَّتِي فِيهَا الأَمْرُ بِاسْتِبَاقِ الخَيْرَاتِ؟"),
      back: t("“So race towards all that is good.” [al-Baqarah: 148]", "﴿فَاسْتَبِقُوا الْخَيْرَاتِ﴾ [البَقَرَة: ١٤٨]"),
    },
    {
      kind: "quote",
      page: 50,
      front: t("To what did Imām Aḥmad compare youth?", "بِمَ شَبَّهَ الإِمَامُ أَحْمَدُ الشَّبَابَ؟"),
      back: t("“I would not compare youth to anything other than something that was in my sleeve and fell out.”", "«مَا شَبَّهْتُ الشَّبَابَ إِلَّا بِشَيْءٍ كَانَ فِي كُمِّي فَسَقَطَ»"),
    },
    {
      kind: "quote",
      page: 50,
      front: t("Complete al-Ḥasan al-Baṣrī's saying: “Knowledge at a young age is like …”", "أَكْمِلْ قَوْلَ الحَسَنِ البَصْرِيِّ: «العِلْمُ فِي الصِّغَرِ …»"),
      back: t("“… engraving on stone.”", "«… كَالنَّقْشِ فِي الحَجَرِ»"),
    },
    {
      kind: "point",
      page: 52,
      front: t("What is the most harmful thing to youth?", "مَا أَضَرُّ شَيْءٍ عَلَى الشَّبَابِ؟"),
      back: t("Procrastination and distant hopes.", "«التَّسْوِيفُ وَطُولُ الأَمَلِ»"),
    },
    {
      kind: "point",
      page: 52,
      front: t("What is the widely observed situation of whoever gets older?", "مَا الحَالُ المَنْظُورَةُ فِيمَنْ كَبِرَتْ سِنُّهُ؟"),
      back: t(
        "He becomes busier and his distractions become greater, along with weakness of the body and lack of strength.",
        "«أَنَّ مَنْ كَبِرَتْ سِنُّهُ كَثُرَتْ شَوَاغِلُهُ، وَعَظُمَتْ قَوَاطِعُهُ، مَعَ ضَعْفِ الجِسْمِ وَوَهَنِ القُوَى»",
      ),
    },
    {
      kind: "point",
      page: 52,
      front: t("Does this principle mean an older person cannot learn?", "هَلْ يُفْهَمُ مِنْ هَذَا المَعْقِدِ أَنَّ الكَبِيرَ لَا يَتَعَلَّمُ؟"),
      back: t(
        "No — the companions of the Messenger of Allāh ﷺ learnt as adults. The real difficulty, as al-Māwardī clarified, is the many things which busy a person and the distractions which overcome him.",
        "لَا؛ «بَلْ هَؤُلَاءِ أَصْحَابُ رَسُولِ اللهِ ﷺ تَعَلَّمُوا كِبَارًا»، «وَإِنَّمَا يَعْسُرُ التَّعَلُّمُ فِي الكِبَرِ لِكَثْرَةِ الشَّوَاغِلِ، وَغَلَبَةِ القَوَاطِعِ».",
      ),
    },
    {
      kind: "story",
      page: 54,
      front: t("Name a noble scholar the author mentions who sought knowledge as an adult and gained a great amount of it.", "اذْكُرْ عَالِمًا ذَكَرَهُ المُؤَلِّفُ طَلَبَ العِلْمَ كَبِيرًا فَأَدْرَكَ مِنْهُ قَدْرًا عَظِيمًا."),
      back: t("Al-Qaffāl ash-Shāfiʿī, may Allāh have mercy on him.", "القَفَّالُ الشَّافِعِيُّ رَحِمَهُ اللهُ."),
    },
    verse(
      50,
      t("The days of youth - take advantage of them;", "وَأَيَّامَ الحَدَاثَةِ فَاغْتَنِمْهَا"),
      t("indeed youth does not last forever.", "أَلَا إِنَّ الحَدَاثَةَ لَا تَدُومُ"),
    ),
    verse(
      52,
      t("Take advantage of the years of youth, O young man;", "اغْتَنِمْ سِنَّ الشَّبَابِ يَا فَتَى"),
      t("when you are old, the people will praise your capability.", "عِنْدَ المَشِيبِ يَحْمَدُ القَوْمُ السُّرَى"),
    ),
    verse(
      52,
      t("I cannot get back what has passed from me;", "وَلَسْتُ بِمُدْرِكٍ مَا فَاتَ مِنِّي"),
      t("with ‘I long for…’, nor with ‘I wish I…’ nor with ‘If only…’", "بِلَهْفَ وَلَا بِلَيْتَ وَلَا لَوَ انِّي"),
    ),
  ],

  // ───────────── 8 · Being unhurried ─────────────
  [
    principle(8, TITLES[7], 56),
    {
      kind: "point",
      page: 56,
      front: t("Why does the attainment of knowledge not happen in one go?", "لِمَاذَا لَا يَكُونُ تَحْصِيلُ العِلْمِ جُمْلَةً وَاحِدَةً؟"),
      back: t("Because the heart is too weak to bear that; knowledge is weighty like the weight of stone in the hand of the one who carries it.", "«إِذِ القَلْبُ يَضْعُفُ عَنْ ذَلِكَ؛ وَإِنَّ لِلْعِلْمِ فِيهِ ثِقَلًا كَثِقَلِ الحَجَرِ فِي يَدِ حَامِلِهِ»"),
    },
    {
      kind: "evidence",
      page: 56,
      front: t("Which āyah describes the Qur'an as weighty?", "مَا الآيَةُ الَّتِي وُصِفَ فِيهَا القُرْآنُ بِالثِّقَلِ؟"),
      back: t("“Indeed, we will cast upon you a heavy word.” [al-Muzzammil: 5]", "﴿إِنَّا سَنُلْقِي عَلَيْكَ قَوْلًا ثَقِيلًا﴾ [المُزَّمِّل: ٥]"),
    },
    {
      kind: "point",
      page: 56,
      front: t(
        "If the Qur'an — which Allāh made easy for remembrance [al-Qamar: 17] — is described as heavy, what does the author conclude?",
        "إِذَا كَانَ هَذَا وَصْفَ القُرْآنِ المُيَسَّرِ ﴿وَلَقَدْ يَسَّرْنَا الْقُرْآنَ لِلذِّكْرِ﴾، فَمَاذَا قَالَ المُؤَلِّفُ؟",
      ),
      back: t("Then what do you think of other forms of knowledge!?", "«فَمَا الظَّنُّ بِغَيْرِهِ مِنَ العُلُومِ؟!»"),
    },
    {
      kind: "evidence",
      page: 56,
      front: t("Which āyah is a proof for being unhurried and taking knowledge in stages?", "مَا الآيَةُ الَّتِي هِيَ حُجَّةٌ فِي لُزُومِ التَّأَنِّي وَالتَّدَرُّجِ فِي طَلَبِ العِلْمِ؟"),
      back: t(
        "“Those who disbelieve say, ‘If only the Qur'an were sent down to him all at once.’” [al-Furqān: 32]",
        "﴿وَقَالَ الَّذِينَ كَفَرُوا لَوْلَا نُزِّلَ عَلَيْهِ الْقُرْآنُ جُمْلَةً وَاحِدَةً كَذَلِكَ لِنُثَبِّتَ بِهِ فُؤَادَكَ وَرَتَّلْنَاهُ تَرْتِيلًا﴾ [الفُرْقَان: ٣٢]",
      ),
      note: t("As al-Khaṭīb al-Baghdādī and ar-Rāghib al-Aṣfahānī mentioned.", "كَمَا ذَكَرَهُ الخَطِيبُ البَغْدَادِيُّ وَالرَّاغِبُ الأَصْفَهَانِيُّ."),
    },
    {
      kind: "story",
      page: 58,
      front: t("How many times did Shuʿbah go back to ʿAmr ibn Dīnār, and how many ḥadīth did he hear?", "كَمْ مَرَّةً اخْتَلَفَ شُعْبَةُ إِلَى عَمْرِو بْنِ دِينَارٍ، وَكَمْ حَدِيثًا سَمِعَ مِنْهُ؟"),
      back: t("Five hundred times — and he heard only one hundred ḥadīth: in every five sittings, one ḥadīth.", "«خَمْسَمِائَةِ مَرَّةٍ، وَمَا سَمِعْتُ مِنْهُ إِلَّا مِائَةَ حَدِيثٍ، فِي كُلِّ خَمْسَةِ مَجَالِسَ حَدِيثٌ»"),
    },
    {
      kind: "quote",
      page: 58,
      front: t("What did Ḥammād ibn Abī Sulaymān tell a student of his to learn every day?", "مَاذَا قَالَ حَمَّادُ بْنُ أَبِي سُلَيْمَانَ لِتِلْمِيذِهِ؟"),
      back: t("“Every day, learn three matters, and do not add anything to that.”", "«تَعَلَّمْ كُلَّ يَوْمٍ ثَلَاثَ مَسَائِلَ، وَلَا تَزِدْ عَلَيْهَا شَيْئًا»"),
    },
    {
      kind: "point",
      page: 58,
      front: t("What does being unhurried and taking things in stages necessitate?", "مَا مُقْتَضَى لُزُومِ التَّأَنِّي وَالتَّدَرُّجِ؟"),
      back: t(
        "Beginning with the small texts in the different sciences, memorising them and seeking their explanation, and avoiding the larger works the student has not yet reached.",
        "«البَدَاءَةُ بِالمُتُونِ القِصَارِ المُصَنَّفَةِ فِي فُنُونِ العِلْمِ، حِفْظًا وَاسْتِشْرَاحًا، وَالمَيْلُ عَنْ مُطَالَعَةِ المُطَوَّلَاتِ الَّتِي لَمْ يَرْتَفِعِ الطَّالِبُ بَعْدُ إِلَيْهَا»",
      ),
    },
    {
      kind: "quote",
      page: 58,
      front: t("Complete the saying of ʿAbd al-Karīm ar-Rifāʿī: “The food of the old is …”", "أَكْمِلْ قَوْلَ عَبْدِ الكَرِيمِ الرِّفَاعِيِّ: «طَعَامُ الكِبَارِ …»"),
      back: t("“… the poison of the young.”", "«… سُمُّ الصِّغَارِ»"),
    },
    {
      kind: "example",
      page: 60,
      front: t("How does the author explain “the food of the old is the poison of the young”?", "كَيْفَ شَرَحَ المُؤَلِّفُ قَوْلَهُمْ: «طَعَامُ الكِبَارِ سُمُّ الصِّغَارِ»؟"),
      back: t(
        "A suckling baby who eats the food of adults, however tasty, is destroyed by it. Likewise the one who takes on complex issues from the larger works, exposing himself to the differing of the scholars.",
        "«فَإِنَّ الرَّضِيعَ إِذَا تَنَاوَلَ طَعَامَ الكِبَارِ، مَهْمَا لَذَّ وَطَابَ، أَهْلَكَهُ وَأَعْطَبَهُ، وَمِثْلُهُ مَنْ يَتَنَاوَلُ المَسَائِلَ الكِبَارَ مِنَ المُطَوَّلَاتِ»",
      ),
    },
    verse(
      58,
      t("Today is something and tomorrow is like it;", "اليَوْمَ شَيْءٌ وَغَدًا مِثْلُهُ"),
      t("for the choicest parts of knowledge which are gradually collected.", "مِنْ نُخَبِ العِلْمِ الَّتِي تُلْتَقَطْ"),
      t("Ibn an-Naḥḥās al-Ḥalabī.", "ابْنُ النَّحَّاسِ الحَلَبِيُّ رَحِمَهُ اللهُ."),
    ),
    verse(
      58,
      t("A person achieves with this a wisdom;", "يُحَصِّلُ المَرْءُ بِهَا حِكْمَةً"),
      t("for a torrent of water is nothing more than a gathering of drops.", "وَإِنَّمَا السَّيْلُ اجْتِمَاعُ النُّقَطْ"),
      t("Ibn an-Naḥḥās al-Ḥalabī.", "ابْنُ النَّحَّاسِ الحَلَبِيُّ رَحِمَهُ اللهُ."),
    ),
  ],

  // ───────────── 9 · Patience ─────────────
  [
    principle(9, TITLES[8], 62),
    {
      kind: "evidence",
      page: 62,
      front: t("Which āyah commands patience and perseverance?", "مَا الآيَةُ الَّتِي فِيهَا الأَمْرُ بِالصَّبْرِ وَالمُصَابَرَةِ؟"),
      back: t("“O you who believe, be patient and persevere.” [Āl ʿImrān: 200]", "﴿يَا أَيُّهَا الَّذِينَ آمَنُوا اصْبِرُوا وَصَابِرُوا﴾ [آلِ عِمْرَان: ٢٠٠]"),
    },
    {
      kind: "evidence",
      page: 62,
      front: t(
        "How did Yaḥyā ibn Abī Kathīr explain: “Keep yourself patient [by being] along with those who call upon their Lord in the morning and evening, seeking His face”? [al-Kahf: 28]",
        "بِمَ فَسَّرَ يَحْيَى بْنُ أَبِي كَثِيرٍ قَوْلَهُ تَعَالَى: ﴿وَاصْبِرْ نَفْسَكَ مَعَ الَّذِينَ يَدْعُونَ رَبَّهُمْ بِالْغَدَاةِ وَالْعَشِيِّ يُرِيدُونَ وَجْهَهُ﴾؟",
      ),
      back: t("“It is the gatherings of knowledge.”", "«هِيَ مَجَالِسُ الفِقْهِ»"),
    },
    {
      kind: "quote",
      page: 62,
      front: t("Complete the saying of Yaḥyā ibn Abī Kathīr: “Knowledge is not gained by …”", "أَكْمِلْ قَوْلَ يَحْيَى بْنِ أَبِي كَثِيرٍ: «لَا يُسْتَطَاعُ العِلْمُ …»"),
      back: t("“… resting the body.”", "«… بِرَاحَةِ الجِسْمِ»"),
    },
    {
      kind: "quote",
      page: 64,
      front: t("Complete al-Aṣmaʿī's saying: “Whoever cannot bear the lowliness of learning for a time …”", "أَكْمِلْ قَوْلَ الأَصْمَعِيِّ: «مَنْ لَمْ يَحْتَمِلْ ذُلَّ التَّعْلِيمِ سَاعَةً …»"),
      back: t("“… will have the lowliness of ignorance forever.”", "«… بَقِيَ فِي ذُلِّ الجَهْلِ أَبَدًا»"),
    },
    {
      kind: "quote",
      page: 64,
      front: t("Complete the saying of one of the salaf: “Whoever cannot bear the pain of learning …”", "أَكْمِلْ قَوْلَ بَعْضِ السَّلَفِ: «مَنْ لَمْ يَحْتَمِلْ أَلَمَ التَّعْلِيمِ …»"),
      back: t("“… cannot taste the pleasure of knowledge.”", "«… لَمْ يَذُقْ لَذَّةَ العِلْمِ»"),
    },
    {
      kind: "quote",
      page: 64,
      front: t("Complete what used to be said: “Whoever does not face difficulties …”", "أَكْمِلْ مَا كَانَ يُقَالُ: «مَنْ لَمْ يَرْكَبِ المَصَاعِبَ …»"),
      back: t("“… will not achieve their desires.”", "«… لَمْ يَنَلِ الرَّغَائِبَ»"),
    },
    {
      kind: "list",
      page: 64,
      front: t("Patience in knowledge is of which two types?", "صَبْرُ العِلْمِ عَلَى أَيِّ نَوْعَيْنِ؟"),
      back: t(
        "1. Patience in gaining and acquiring it — memorisation, understanding, attending its gatherings, and giving the shaykh his rights.\n2. Patience in delivering it — teaching students, helping them understand, and putting up with their floundering.",
        "١. صَبْرٌ فِي تَحَمُّلِهِ وَأَخْذِهِ: الحِفْظُ، وَالفَهْمُ، وَحُضُورُ مَجَالِسِ العِلْمِ، وَرِعَايَةُ حَقِّ الشَّيْخِ.\n٢. صَبْرٌ فِي أَدَائِهِ وَبَثِّهِ وَتَبْلِيغِهِ إِلَى أَهْلِهِ: الجُلُوسُ لِلْمُتَعَلِّمِينَ، وَإِفْهَامُهُمْ، وَاحْتِمَالُ زَلَّاتِهِمْ.",
      ),
    },
    {
      kind: "point",
      page: 64,
      front: t("What is above and beyond these two types of patience?", "مَا الَّذِي فَوْقَ هَذَيْنِ النَّوْعَيْنِ مِنْ صَبْرِ العِلْمِ؟"),
      back: t("Having patience with having patience in them, and remaining firm upon them.", "«الصَّبْرُ عَلَى الصَّبْرِ فِيهِمَا، وَالثَّبَاتُ عَلَيْهِمَا»"),
    },
    {
      kind: "cloze",
      page: 64,
      front: t("“Before reaching the honey, you must bear ______.”", "«وَلَا بُدَّ دُونَ الشَّهْدِ مِنْ ______»"),
      back: t("the sting of the bees", "سُمِّ لَسْعَةٍ"),
    },
    verse(
      64,
      t("For everyone there are goals of highness and determination;", "لِكُلٍّ إِلَى شَأْوِ العُلَا وَثَبَاتُ"),
      t("but rare among men is determination.", "وَلَكِنْ عَزِيزٌ فِي الرِّجَالِ ثَبَاتُ"),
    ),
    verse(
      66,
      t("I have indeed seen, and in the passage of days there is experience;", "إِنِّي رَأَيْتُ وَفِي الأَيَّامِ تَجْرِبَةٌ"),
      t("in patience there is an outcome with praiseworthy effects.", "لِلصَّبْرِ عَاقِبَةٌ مَحْمُودَةُ الأَثَرِ"),
      t("Abū Yaʿlā al-Mawṣilī, the scholar of ḥadīth.", "أَبُو يَعْلَى المَوْصِلِيُّ المُحَدِّثُ."),
    ),
    verse(
      66,
      t("Few are those who work hard in seeking this thing;", "وَقَلَّ مَنْ جَدَّ فِي أَمْرٍ تَطَلَّبَهُ"),
      t("taking patience along — they are those who triumph with success.", "وَاسْتَصْحَبَ الصَّبْرَ إِلَّا فَازَ بِالظَّفَرِ"),
      t("Abū Yaʿlā al-Mawṣilī, the scholar of ḥadīth.", "أَبُو يَعْلَى المَوْصِلِيُّ المُحَدِّثُ."),
    ),
  ],

  // ───────────── 10 · Etiquette ─────────────
  [
    principle(10, TITLES[9], 68),
    {
      kind: "quote",
      page: 68,
      front: t("Complete Ibn al-Qayyim's words (Madārij as-Sālikīn): “The manners of a person are the sign of their ultimate happiness and success …”", "أَكْمِلْ قَوْلَ ابْنِ القَيِّمِ فِي «مَدَارِجِ السَّالِكِينَ»: «أَدَبُ المَرْءِ عُنْوَانُ سَعَادَتِهِ وَفَلَاحِهِ …»"),
      back: t("“… and a lack of manners is a sign of their wretchedness and destruction.”", "«… وَقِلَّةُ أَدَبِهِ عُنْوَانُ شَقَاوَتِهِ وَبَوَارِهِ»"),
    },
    {
      kind: "point",
      page: 68,
      front: t("Who is the only one suitable for knowledge?", "مَنِ الَّذِي يَصْلُحُ لِلْعِلْمِ؟"),
      back: t(
        "The one who adheres to its etiquettes — in himself and his study, and with his teachers and companions.",
        "«وَإِنَّمَا يَصْلُحُ لِلْعِلْمِ مَنْ تَأَدَّبَ بِآدَابِهِ فِي نَفْسِهِ وَدَرْسِهِ، وَمَعَ شَيْخِهِ وَقَرِينِهِ»",
      ),
    },
    {
      kind: "quote",
      page: 68,
      front: t("Who said: “Through etiquettes knowledge is understood”?", "مَنِ القَائِلُ: «بِالأَدَبِ تَفْهَمُ العِلْمَ»؟"),
      back: t("Yūsuf ibn al-Ḥusayn.", "يُوسُفُ بْنُ الحُسَيْنِ."),
    },
    {
      kind: "story",
      page: 70,
      front: t("Why did al-Buqāʿī refuse to let a man read to him, and what did he say?", "لِمَاذَا امْتَنَعَ البُقَاعِيُّ مِنْ إِقْرَاءِ رَجُلٍ، وَمَاذَا قَالَ لَهُ؟"),
      back: t(
        "The man sat cross-legged. He said: “You are more in need of etiquettes than the knowledge which you came to seek.”",
        "جَلَسَ الرَّجُلُ مُتَرَبِّعًا، فَقَالَ: «أَنْتَ أَحْوَجُ إِلَى الأَدَبِ مِنْكَ إِلَى العِلْمِ الَّذِي جِئْتَ تَطْلُبُهُ»",
      ),
    },
    {
      kind: "quote",
      page: 70,
      front: t("Who said: “They used to learn the way of behaving, just as they used to learn knowledge”?", "مَنِ القَائِلُ: «كَانُوا يَتَعَلَّمُونَ الهَدْيَ كَمَا يَتَعَلَّمُونَ العِلْمَ»؟"),
      back: t("Ibn Sīrīn, may Allāh have mercy on him.", "ابْنُ سِيرِينَ رَحِمَهُ اللهُ."),
    },
    {
      kind: "quote",
      page: 70,
      front: t("What did Mālik ibn Anas say to a young man from Quraysh?", "مَاذَا قَالَ مَالِكُ بْنُ أَنَسٍ لِفَتًى مِنْ قُرَيْشٍ؟"),
      back: t("“O nephew, learn etiquette before you learn knowledge.”", "«يَا ابْنَ أَخِي، تَعَلَّمِ الأَدَبَ قَبْلَ أَنْ تَتَعَلَّمَ العِلْمَ»"),
    },
    {
      kind: "quote",
      page: 70,
      front: t("What did Makhlad ibn al-Ḥusayn say to Ibn al-Mubārak one day?", "مَاذَا قَالَ مَخْلَدُ بْنُ الحُسَيْنِ لِابْنِ المُبَارَكِ يَوْمًا؟"),
      back: t("“We are in greater need of a great deal of manners than a great deal of knowledge.”", "«نَحْنُ إِلَى كَثِيرٍ مِنَ الأَدَبِ أَحْوَجُ مِنَّا إِلَى كَثِيرٍ مِنَ العِلْمِ»"),
    },
    {
      kind: "story",
      page: 70,
      front: t("What would Mālik's mother say to him as she put on his turban?", "مَاذَا كَانَتْ تَقُولُ أُمُّ مَالِكٍ وَهِيَ تُعَمِّمُهُ؟"),
      back: t("“Go to Rabīʿah and learn his etiquettes before you learn his knowledge.”", "«اذْهَبْ إِلَى رَبِيعَةَ فَتَعَلَّمْ مِنْ أَدَبِهِ قَبْلَ عِلْمِهِ»"),
    },
    {
      kind: "point",
      page: 70,
      front: t("What has prevented many students of our time from gaining knowledge?", "بِمَ حُرِمَ كَثِيرٌ مِنْ طَلَبَةِ العَصْرِ العِلْمَ؟"),
      back: t(
        "They lost its etiquettes — reclining before their shaykh, stretching their legs out towards him, raising their voices, answering their phones.",
        "«بِتَضْيِيعِ الأَدَبِ»؛ فَتَرَى أَحَدَهُمْ مُتَّكِئًا بِحَضْرَةِ شَيْخِهِ، بَلْ يَمُدُّ إِلَيْهِ رِجْلَيْهِ، وَيَرْفَعُ صَوْتَهُ عِنْدَهُ.",
      ),
    },
    {
      kind: "quote",
      page: 72,
      front: t("What did al-Layth ibn Saʿd say to some people of ḥadīth when he saw something he disliked?", "مَاذَا قَالَ اللَّيْثُ بْنُ سَعْدٍ لَمَّا رَأَى مِنْ أَصْحَابِ الحَدِيثِ شَيْئًا كَرِهَهُ؟"),
      back: t("“What is this? You are more in need of a little manners than you are in need of a lot of knowledge.”", "«مَا هَذَا؟! أَنْتُمْ إِلَى يَسِيرٍ مِنَ الأَدَبِ، أَحْوَجُ مِنْكُمْ إِلَى كَثِيرٍ مِنَ العِلْمِ»"),
    },
    verse(
      68,
      t("A person cannot rise to nobility without manners;", "وَالمَرْءُ لَا يَسْمُو بِغَيْرِ الأَدَبِ"),
      t("even if he is one of noble ancestors and lineage.", "وَإِنْ يَكُنْ ذَا حَسَبٍ وَنَسَبِ"),
    ),
    verseReversed(
      68,
      t("A person cannot rise to nobility without manners;", "وَالمَرْءُ لَا يَسْمُو بِغَيْرِ الأَدَبِ"),
      t("even if he is one of noble ancestors and lineage.", "وَإِنْ يَكُنْ ذَا حَسَبٍ وَنَسَبِ"),
    ),
  ],

  // ───────────── 11 · Guarding knowledge (muroo'ah) ─────────────
  [
    principle(11, TITLES[10], 74),
    {
      kind: "cloze",
      page: 74,
      front: t("“Whoever does not guard knowledge, ______.”", "«فَمَنْ لَمْ يَصُنِ العِلْمَ ______»"),
      back: t("knowledge will not guard him", "لَمْ يَصُنْهُ العِلْمُ"),
      note: t("As ash-Shāfiʿī said.", "كَمَا قَالَ الشَّافِعِيُّ رَحِمَهُ اللهُ."),
    },
    {
      kind: "point",
      page: 74,
      front: t("What becomes of the one who falls short in muroo'ah by falling into what tarnishes it?", "مَا حَالُ مَنْ أَخَلَّ بِالمُرُوءَةِ بِالوُقُوعِ فِيمَا يَشِينُ؟"),
      back: t(
        "He has belittled knowledge and not revered it, and fallen into idleness — until the term ‘knowledge’ is no longer used for him.",
        "«فَقَدِ اسْتَخَفَّ بِالعِلْمِ، فَلَمْ يُعَظِّمْهُ، وَوَقَعَ فِي البَطَالَةِ، فَتُفْضِي بِهِ الحَالُ إِلَى زَوَالِ اسْمِ العِلْمِ عَنْهُ»",
      ),
    },
    {
      kind: "quote",
      page: 74,
      front: t("Who said: “The idle one cannot be one of the people of wisdom”?", "مَنِ القَائِلُ: «لَا يَكُونُ البَطَّالُ مِنَ الحُكَمَاءِ»؟"),
      back: t("Wahb ibn Munabbih, may Allāh have mercy on him.", "وَهْبُ بْنُ مُنَبِّهٍ رَحِمَهُ اللهُ."),
    },
    {
      kind: "term",
      page: 74,
      front: t("What is the comprehensive definition of muroo'ah given by the elder Ibn Taymiyyah in al-Muḥarrar?", "مَا جِمَاعُ المُرُوءَةِ كَمَا قَالَهُ ابْنُ تَيْمِيَّةَ الجَدُّ فِي «المُحَرَّرِ»؟"),
      back: t(
        "“Using that which beautifies a person and adorns him, and avoiding that which spoils and tarnishes him.”",
        "«اسْتِعْمَالُ مَا يُجَمِّلُهُ وَيَزِينُهُ، وَتَجَنُّبُ مَا يُدَنِّسُهُ وَيَشِينُهُ»",
      ),
    },
    {
      kind: "evidence",
      page: 76,
      front: t("Where did Sufyān ibn ʿUyaynah find muroo'ah in the Qur'an?", "أَيْنَ وَجَدَ سُفْيَانُ بْنُ عُيَيْنَةَ المُرُوءَةَ فِي القُرْآنِ؟"),
      back: t(
        "“Show forgiveness, enjoin what is good, and turn away from the foolish.” [al-Aʿrāf: 199] — it contains muroo'ah, good etiquettes, and noble manners.",
        "فِي قَوْلِهِ تَعَالَى: ﴿خُذِ الْعَفْوَ وَأْمُرْ بِالْعُرْفِ وَأَعْرِضْ عَنِ الْجَاهِلِينَ﴾ [الأَعْرَاف: ١٩٩]؛ «فَفِيهِ المُرُوءَةُ، وَحُسْنُ الأَدَبِ، وَمَكَارِمُ الأَخْلَاقِ»",
      ),
    },
    {
      kind: "list",
      page: 76,
      front: t("Name examples the scholars counted as breaking muroo'ah.", "اذْكُرْ أَمْثِلَةً عَدَّهَا العُلَمَاءُ مِنْ خَوَارِمِ المُرُوءَةِ."),
      back: t(
        "1. Shaving the beard.\n2. A lot of looking around while on a path.\n3. Stretching out your legs in a gathering of people without any need.\n4. Accompanying the vile, the defiantly disobedient, the impertinent and the idle.",
        "١. حَلْقُ اللِّحْيَةِ.\n٢. كَثْرَةُ الالْتِفَاتِ فِي الطَّرِيقِ.\n٣. مَدُّ الرِّجْلَيْنِ فِي مَجْمَعِ النَّاسِ مِنْ غَيْرِ حَاجَةٍ وَلَا ضَرُورَةٍ.\n٤. صُحْبَةُ الأَرَاذِلِ وَالفُسَّاقِ وَالمُجَّانِ وَالبَطَّالِينَ.",
      ),
    },
    {
      kind: "quote",
      page: 76,
      front: t("Which early scholars considered a lot of looking around while on a path to be poor conduct?", "مَنْ عَدَّ كَثْرَةَ الالْتِفَاتِ فِي الطَّرِيقِ مِنْ خَوَارِمِ المُرُوءَةِ مِنَ المُتَقَدِّمِينَ؟"),
      back: t("Ibn Shihāb az-Zuhrī and Ibrāhīm an-Nakhaʿī.", "ابْنُ شِهَابٍ الزُّهْرِيُّ، وَإِبْرَاهِيمُ النَّخَعِيُّ."),
    },
    {
      kind: "point",
      page: 76,
      front: t("What becomes of the one lacking muroo'ah who attributes himself to knowledge?", "مَا حَالُ مَنْ أَخَلَّ بِمُرُوءَتِهِ وَهُوَ يَنْتَسِبُ إِلَى العِلْمِ؟"),
      back: t(
        "He is exposed to both the experts and the general people, and achieves nothing from the honour of knowledge except ruins.",
        "«فَقَدِ افْتَضَحَ عِنْدَ الخَاصِّ وَالعَامِّ، وَلَمْ يَنَلْ مِنْ شَرَفِ العِلْمِ إِلَّا الحُطَامَ»",
      ),
    },
    verse(
      74,
      t("Knowledge will not be gained by the idle one nor the lazy one;", "لَا يُدْرِكُ العِلْمَ بَطَّالٌ وَلَا كَسِلٌ"),
      t("nor the weary one, nor the one who seeks to please people.", "وَلَا مَلُولٌ وَلَا مَنْ يَأْلَفُ البَشَرَا"),
    ),
    verseReversed(
      74,
      t("Knowledge will not be gained by the idle one nor the lazy one;", "لَا يُدْرِكُ العِلْمَ بَطَّالٌ وَلَا كَسِلٌ"),
      t("nor the weary one, nor the one who seeks to please people.", "وَلَا مَلُولٌ وَلَا مَنْ يَأْلَفُ البَشَرَا"),
    ),
  ],

  // ───────────── 12 · Righteous company ─────────────
  [
    principle(12, TITLES[11], 78),
    {
      kind: "point",
      page: 78,
      front: t("Why does the student of knowledge need companions?", "لِمَاذَا يَحْتَاجُ طَالِبُ العِلْمِ إِلَى مُعَاشَرَةِ غَيْرِهِ مِنَ الطُّلَّابِ؟"),
      back: t(
        "People are communal by nature; this accompanying supports him in gaining knowledge and working hard to seek it.",
        "«فَالإِنْسَانُ مَدَنِيٌّ بِالطَّبْعِ»؛ «لِتُعِينَهُ هَذِهِ المُعَاشَرَةُ عَلَى تَحْصِيلِ العِلْمِ وَالاجْتِهَادِ فِي طَلَبِهِ»",
      ),
    },
    {
      kind: "cloze",
      page: 78,
      front: t("“Having companions in knowledge, if it is free of ordeals, is ______ in arriving at the intended goal.”", "«وَالزَّمَالَةُ فِي العِلْمِ إِنْ سَلِمَتْ مِنَ الغَوَائِلِ ______ فِي الوُصُولِ إِلَى المَقْصُودِ»"),
      back: t("beneficial", "نَافِعَةٌ"),
    },
    {
      kind: "hadith",
      page: 78,
      front: t("Complete the ḥadīth: “A man is upon the religion of his close friend …”", "أَكْمِلِ الحَدِيثَ: «الرَّجُلُ عَلَى دِينِ خَلِيلِهِ …»"),
      back: t("“… so let each one of you look at who he takes as a close friend.”", "«… فَلْيَنْظُرْ أَحَدُكُمْ مَنْ يُخَالِلُ»"),
      note: t("Abū Dāwūd and at-Tirmidhī, from Abū Hurayrah; the wording is Abū Dāwūd's.", "رَوَاهُ أَبُو دَاوُدَ وَالتِّرْمِذِيُّ عَنْ أَبِي هُرَيْرَةَ، وَالسِّيَاقُ لِأَبِي دَاوُدَ."),
    },
    {
      kind: "quote",
      page: 78,
      front: t("According to ar-Rāghib al-Aṣfahānī, how does a companion influence his companion?", "كَيْفَ يُعْدِي الجَلِيسُ جَلِيسَهُ كَمَا قَالَ الرَّاغِبُ الأَصْفَهَانِيُّ؟"),
      back: t("“Not by statements and actions alone; rather, even by looking at him.”", "«لَيْسَ إِعْدَاءُ الجَلِيسِ لِجَلِيسِهِ بِمَقَالِهِ وَفِعَالِهِ فَقَطْ، بَلْ بِالنَّظَرِ إِلَيْهِ»"),
    },
    {
      kind: "term",
      page: 80,
      front: t("In the line “the effect of the idle person on al-jalīd”, what does al-jalīd mean?", "مَا مَعْنَى «الجَلِيدِ» فِي قَوْلِهِ: «عَدْوَى البَلِيدِ إِلَى الجَلِيدِ»؟"),
      back: t("The one who is earnest and determined.", "«وَالجَلِيدُ هُوَ الجَادُّ الحَازِمُ»"),
    },
    {
      kind: "list",
      page: 80,
      front: t("Associations are made for one of which three reasons — and which should the student choose?", "عَقْدُ المُعَاشَرَةِ يُبْرَمُ عَلَى أَيِّ المَطَالِبِ الثَّلَاثَةِ؟ وَأَيُّهَا يَخْتَارُ الطَّالِبُ؟"),
      back: t(
        "Virtue, benefit, or pleasure. He chooses the companion of virtue: “Choose the friend of virtue as a companion, for you will be known by him.”",
        "الفَضِيلَةُ، وَالمَنْفَعَةُ، وَاللَّذَّةُ. «فَانْتَخِبْ صَدِيقَ الفَضِيلَةِ زَمِيلًا؛ فَإِنَّكَ تُعْرَفُ بِهِ»",
      ),
      note: t("Muḥammad al-Khaḍir ibn Ḥusayn, in Rasāʾil al-Iṣlāḥ.", "مُحَمَّدٌ الخَضِرُ بْنُ حُسَيْنٍ فِي «رَسَائِلِ الإِصْلَاحِ»."),
    },
    {
      kind: "quote",
      page: 80,
      front: t("Complete Ibn Masʿūd's saying: “Judge a person by the one that he accompanies …”", "أَكْمِلْ قَوْلَ ابْنِ مَسْعُودٍ: «اعْتَبِرُوا الرَّجُلَ بِمَنْ يُصَاحِبُ …»"),
      back: t("“… for a man only accompanies one like him.”", "«… فَإِنَّمَا يُصَاحِبُ الرَّجُلُ مَنْ هُوَ مِثْلُهُ»"),
    },
    {
      kind: "quote",
      page: 82,
      front: t("Why did Sufyān ibn ʿUyaynah say he would withhold a rare ḥadīth from those sitting with him?", "لِمَاذَا قَالَ سُفْيَانُ بْنُ عُيَيْنَةَ إِنَّهُ يَحْرِمُ جُلَسَاءَهُ الحَدِيثَ الغَرِيبَ؟"),
      back: t("“Because there is a man among them who is indolent.”", "«إِنِّي لَأَحْرِمُ جُلَسَائِي الحَدِيثَ الغَرِيبَ لِمَوْضِعِ رَجُلٍ وَاحِدٍ ثَقِيلٍ»"),
    },
    {
      kind: "point",
      page: 82,
      front: t("What warning does the author close this principle with?", "بِمَ خَتَمَ المُؤَلِّفُ هَذَا المَعْقِدَ؟"),
      back: t(
        "A learner may be prevented from knowledge because of his companion — so beware of that person, even if they adorn themselves with knowledge; they corrupt you in a way you do not perceive.",
        "«فَقَدْ يُحْرَمُ المُتَعَلِّمُ العِلْمَ لِأَجْلِ صَاحِبِهِ، فَاحْذَرْ هَذَا الصِّنْفَ - وَإِنْ تَزَيَّا بِزِيِّ العِلْمِ - فَإِنَّهُ يُفْسِدُكَ مِنْ حَيْثُ لَا تُحِسُّ»",
      ),
    },
    verse(
      80,
      t("Do not accompany the lazy one in his condition;", "لَا تَصْحَبِ الكَسْلَانَ فِي حَالَاتِهِ"),
      t("for how many a pious man through the corruption of another became corrupt.", "كَمْ صَالِحٍ بِفَسَادِ آخَرَ يَفْسُدُ"),
    ),
    verse(
      80,
      t("The effect of the idle person on the resolute person is rapid;", "عَدْوَى البَلِيدِ إِلَى الجَلِيدِ سَرِيعَةٌ"),
      t("like a piece of blazing coal put on the ashes is extinguished.", "كَالجَمْرِ يُوضَعُ فِي الرَّمَادِ فَيَخْمُدُ"),
    ),
    verse(
      80,
      t("If you select for yourself a person let him be;", "إِذَا مَا اصْطَنَعْتَ امْرَأً فَلْيَكُنْ"),
      t("of honourable lineage and noble descent.", "شَرِيفَ النِّجَارِ زَكِيَّ الحَسَبْ"),
      t("Abūl-Fatḥ al-Bustī.", "أَبُو الفَتْحِ البُسْتِيُّ."),
    ),
    verse(
      80,
      t("For the ignoble among men is like the weed among plants;", "فَنَذْلُ الرِّجَالِ كَنَذْلِ النَّبَاتِ"),
      t("it bears no fruit, nor is it useable for firewood.", "فَلَا لِلثِّمَارِ وَلَا لِلْحَطَبْ"),
      t("Abūl-Fatḥ al-Bustī.", "أَبُو الفَتْحِ البُسْتِيُّ."),
    ),
  ],

  // ───────────── 13 · Memorisation, revision, questions ─────────────
  [
    principle(13, TITLES[12], 84),
    {
      kind: "list",
      page: 84,
      front: t("How does the author describe memorisation, revision, and asking questions?", "كَيْفَ وَصَفَ المُؤَلِّفُ الحِفْظَ وَالمُذَاكَرَةَ وَالسُّؤَالَ؟"),
      back: t(
        "Memorisation is private time with yourself, revision is sitting with your companion, and asking questions is engaging with the scholar.",
        "«فَالحِفْظُ خَلْوَةٌ بِالنَّفْسِ، وَالمُذَاكَرَةُ جُلُوسٌ إِلَى القَرِينِ، وَالسُّؤَالُ إِقْبَالٌ عَلَى العَالِمِ»",
      ),
    },
    {
      kind: "quote",
      page: 84,
      front: t("What did Ibn al-Jawzī say in Ṣayd al-Khāṭir about the luminary scholars and memorisation?", "مَاذَا قَالَ ابْنُ الجَوْزِيِّ فِي «صَيْدِ الخَاطِرِ» عَنِ العُلَمَاءِ الأَعْلَامِ وَالحِفْظِ؟"),
      back: t("“The luminary scholars do not cease to urge people to memorise, and to command people to do so.”", "«وَلَمْ يَزَلِ العُلَمَاءُ الأَعْلَامُ يَحُضُّونَ عَلَى الحِفْظِ وَيَأْمُرُونَ بِهِ»"),
    },
    {
      kind: "quote",
      page: 84,
      front: t("What did ʿUbaydullāh ibn al-Ḥasan find to be the most beneficial knowledge?", "مَا أَحْضَرُ العِلْمِ مَنْفَعَةً عِنْدَ عُبَيْدِ اللهِ بْنِ الحَسَنِ؟"),
      back: t("“That which my heart memorised and my tongue oft-repeated.”", "«مَا وَعَيْتُهُ بِقَلْبِي وَلُكْتُهُ بِلِسَانِي»"),
    },
    {
      kind: "quote",
      page: 84,
      front: t("What did the author hear his shaykh Ibn ʿUthaymīn say about memorising and reading?", "مَاذَا سَمِعَ المُؤَلِّفُ شَيْخَهُ ابْنَ عُثَيْمِينَ يَقُولُ عَنِ الحِفْظِ وَالقِرَاءَةِ؟"),
      back: t(
        "“We memorised a little and read a lot; yet we benefitted from what we memorised more than we benefitted from what we read.”",
        "«حَفِظْنَا قَلِيلًا وَقَرَأْنَا كَثِيرًا، فَانْتَفَعْنَا بِمَا حَفِظْنَا أَكْثَرَ مِنِ انْتِفَاعِنَا بِمَا قَرَأْنَا»",
      ),
    },
    {
      kind: "story",
      page: 86,
      front: t("What did Ibn Mālik, author of al-Alfiyyah, do on the day that he died?", "مَاذَا فَعَلَ ابْنُ مَالِكٍ صَاحِبُ «الأَلْفِيَّةِ» فِي يَوْمِ مَوْتِهِ؟"),
      back: t("He memorised five pieces of poetry.", "«فَإِنَّهُ حَفِظَ فِي يَوْمِ مَوْتِهِ خَمْسَةَ شَوَاهِدَ»"),
    },
    {
      kind: "term",
      page: 86,
      front: t("What is meant by revision (al-mudhākarah) here?", "مَا المُرَادُ بِالمُذَاكَرَةِ هُنَا؟"),
      back: t("To revise along with companions.", "«وَالمُرَادُ بِالمُذَاكَرَةِ مُدَارَسَةُ الأَقْرَانِ»"),
    },
    {
      kind: "hadith",
      page: 86,
      front: t("Complete the ḥadīth: “The example of the one who has memorised the Qur'an is like the example of the owner of a hobbled camel …”", "أَكْمِلِ الحَدِيثَ: «إِنَّمَا مَثَلُ صَاحِبِ القُرْآنِ كَمَثَلِ صَاحِبِ الإِبِلِ المُعَقَّلَةِ …»"),
      back: t("“… if he remains vigilant, he will retain it, and if he neglects it, it will go away.”", "«… إِنْ عَاهَدَ عَلَيْهَا أَمْسَكَهَا، وَإِنْ أَطْلَقَهَا ذَهَبَتْ»"),
      note: t("Al-Bukhārī, from Ibn ʿUmar; Muslim records it with a similar wording.", "رَوَاهُ البُخَارِيُّ عَنِ ابْنِ عُمَرَ، وَرَوَاهُ مُسْلِمٌ مِنْ حَدِيثِ مَالِكٍ بِهِ نَحْوَهُ."),
    },
    {
      kind: "quote",
      page: 88,
      front: t("According to az-Zuhrī, what really causes knowledge to go?", "مَا الَّذِي يُذْهِبُ العِلْمَ كَمَا قَالَ الزُّهْرِيُّ؟"),
      back: t("“Forgetfulness and abandoning revision.”", "«إِنَّمَا يُذْهِبُ العِلْمَ النِّسْيَانُ، وَتَرْكُ المُذَاكَرَةِ»"),
    },
    {
      kind: "quote",
      page: 88,
      front: t("Complete az-Zuhrī's saying: “This knowledge is actually a treasury …”", "أَكْمِلْ قَوْلَ الزُّهْرِيِّ: «إِنَّمَا هَذَا العِلْمُ خَزَائِنُ …»"),
      back: t("“… it is opened up by asking questions.”", "«… وَتَفْتَحُهَا المَسْأَلَةُ»"),
    },
    {
      kind: "cloze",
      page: 88,
      front: t("“Asking good questions is ______.”", "«وَحُسْنُ المَسْأَلَةِ ______»"),
      back: t("half of knowledge", "نِصْفُ العِلْمِ"),
    },
    {
      kind: "story",
      page: 88,
      front: t("Sufyān ath-Thawrī stayed three days in ʿAsqalān and no one asked him anything. What did he say?", "مَكَثَ سُفْيَانُ الثَّوْرِيُّ فِي عَسْقَلَانَ ثَلَاثًا لَا يَسْأَلُهُ إِنْسَانٌ عَنْ شَيْءٍ، فَمَاذَا قَالَ؟"),
      back: t("“Hire me [transport], I will leave this city. This is a city in which knowledge will die.”", "«اكْتَرِ لِي أَخْرُجْ مِنْ هَذَا البَلَدِ، هَذَا بَلَدٌ يَمُوتُ فِيهِ العِلْمُ»"),
    },
    {
      kind: "example",
      page: 88,
      front: t("To what does the author liken memorisation, revision, and asking questions?", "بِمَ شَبَّهَ المُؤَلِّفُ الحِفْظَ وَالمُذَاكَرَةَ وَالسُّؤَالَ؟"),
      back: t(
        "Planting a tree, watering it, and tending to it: memorisation is the planting of knowledge, revising is the watering of it, and asking about it is tending to it.",
        "«بِمَنْزِلَةِ الغَرْسِ لِلشَّجَرِ وَسَقْيِهِ وَتَنْمِيَتِهِ … فَالحِفْظُ غَرْسُ العِلْمِ، وَالمُذَاكَرَةُ سَقْيُهُ، وَالسُّؤَالُ عَنْهُ تَنْمِيَتُهُ»",
      ),
    },
    verse(
      86,
      t("Knowledge is not that which is preserved in books;", "لَيْسَ بِعِلْمٍ مَا حَوَى القِمَطْرُ"),
      t("knowledge is none but that which is contained in the chest.", "مَا العِلْمُ إِلَّا مَا حَوَاهُ الصَّدْرُ"),
    ),
    verseReversed(
      86,
      t("Knowledge is not that which is preserved in books;", "لَيْسَ بِعِلْمٍ مَا حَوَى القِمَطْرُ"),
      t("knowledge is none but that which is contained in the chest.", "مَا العِلْمُ إِلَّا مَا حَوَاهُ الصَّدْرُ"),
    ),
  ],

  // ───────────── 14 · Honouring the people of knowledge ─────────────
  [
    principle(14, TITLES[13], 90),
    {
      kind: "point",
      page: 90,
      front: t("Why does the author call the scholars “fathers to the soul”?", "لِمَاذَا سَمَّى المُؤَلِّفُ العُلَمَاءَ «آبَاءَ الرُّوحِ»؟"),
      back: t("The shaykh is the father to the soul, like the parent is the father to the body.", "«فَالشَّيْخُ أَبٌ لِلرُّوحِ كَمَا أَنَّ الوَالِدَ أَبٌ لِلْجَسَدِ»"),
    },
    {
      kind: "evidence",
      page: 90,
      front: t(
        "In the recitation of Ubayy ibn Kaʿb — “The Prophet is more worthy of the believers than their own selves; and he is a father to them” — what kind of fatherhood is meant?",
        "فِي قِرَاءَةِ أُبَيِّ بْنِ كَعْبٍ: «النَّبِيُّ أَوْلَى بِالمُؤْمِنِينَ مِنْ أَنْفُسِهِمْ وَهُوَ أَبٌ لَهُمْ»، مَا الأُبُوَّةُ المَذْكُورَةُ؟",
      ),
      back: t(
        "Not the fatherhood of lineage, by consensus — rather the fatherhood of the religion and soul.",
        "«لَيْسَتْ أُبُوَّةَ النَّسَبِ إِجْمَاعًا، وَإِنَّمَا هِيَ الأُبُوَّةُ الدِّينِيَّةُ الرُّوحِيَّةُ»",
      ),
    },
    {
      kind: "quote",
      page: 90,
      front: t("Who said: “I am [like] a slave to everyone that I heard a ḥadīth from”?", "مَنِ القَائِلُ: «كُلُّ مَنْ سَمِعْتُ مِنْهُ حَدِيثًا، فَأَنَا لَهُ عَبْدٌ»؟"),
      back: t("Shuʿbah ibn al-Ḥajjāj.", "شُعْبَةُ بْنُ الحَجَّاجِ رَحِمَهُ اللهُ."),
    },
    {
      kind: "evidence",
      page: 90,
      front: t("From which āyah did al-Udfuwī take the meaning that a student is like a servant to his teacher?", "مِنْ أَيِّ آيَةٍ اسْتَنْبَطَ الأُدْفُوِيُّ أَنَّ المُتَعَلِّمَ كَالعَبْدِ لِمُعَلِّمِهِ؟"),
      back: t(
        "“And when Mūsā said to his boy” [al-Kahf: 60] — Yūshaʿ ibn Nūn was not a slave Mūsā owned; he was learning from him and following him, so Allāh called him his ‘boy’.",
        "﴿وَإِذْ قَالَ مُوسَى لِفَتَاهُ﴾ [الكَهْف: ٦٠]؛ «وَهُوَ يُوشَعُ بْنُ نُونٍ، وَلَمْ يَكُنْ مَمْلُوكًا لَهُ، وَإِنَّمَا كَانَ مُتَلْمِذًا لَهُ، مُتَّبِعًا لَهُ، فَجَعَلَهُ اللهُ فَتَاهُ لِذَلِكَ»",
      ),
    },
    {
      kind: "hadith",
      page: 92,
      front: t("Complete the ḥadīth: “They are not from my nation, the one who does not …”", "أَكْمِلِ الحَدِيثَ: «لَيْسَ مِنْ أُمَّتِي مَنْ لَمْ …»"),
      back: t("“… honour our elders, have mercy on our young, and give our scholars their right.”", "«… يُجِلَّ كَبِيرَنَا، وَيَرْحَمْ صَغِيرَنَا، وَيَعْرِفْ لِعَالِمِنَا حَقَّهُ»"),
      note: t("Aḥmad in al-Musnad, from ʿUbādah ibn aṣ-Ṣāmit.", "رَوَاهُ أَحْمَدُ فِي «المُسْنَدِ» عَنْ عُبَادَةَ بْنِ الصَّامِتِ رَضِيَ اللهُ عَنْهُ."),
    },
    {
      kind: "story",
      page: 92,
      front: t("Ibn ʿAbbās took hold of the riding camel of Zayd ibn Thābit. When Zayd objected, what did Ibn ʿAbbās reply?", "أَمْسَكَ ابْنُ عَبَّاسٍ بِرِكَابِ زَيْدِ بْنِ ثَابِتٍ، فَلَمَّا أَنْكَرَ ذَلِكَ زَيْدٌ، مَاذَا قَالَ ابْنُ عَبَّاسٍ؟"),
      back: t("“This is how we behave towards the scholars.”", "«إِنَّا هَكَذَا نَصْنَعُ بِالعُلَمَاءِ»"),
    },
    {
      kind: "point",
      page: 92,
      front: t("How would the Companions sit in front of the Prophet ﷺ?", "كَيْفَ كَانَ أَصْحَابُ النَّبِيِّ ﷺ إِذَا جَلَسُوا إِلَيْهِ؟"),
      back: t("As though there were birds on their heads — they would not move about.", "«كَأَنَّمَا عَلَى رُؤُوسِهِمُ الطَّيْرُ لَا يَتَحَرَّكُونَ»"),
      note: t("Ibn Ḥazm reported scholarly consensus on honouring the scholars.", "وَنَقَلَ ابْنُ حَزْمٍ الإِجْمَاعَ عَلَى تَوْقِيرِ العُلَمَاءِ وَإِكْرَامِهِمْ."),
    },
    {
      kind: "list",
      page: 94,
      front: t("Name some of the essential manners a learner must have towards the shaykh.", "اذْكُرْ بَعْضَ الأَدَبِ اللَّازِمِ لِلشَّيْخِ عَلَى المُتَعَلِّمِ."),
      back: t(
        "Being humble towards him, engaging with him, not turning away from him, minding the etiquette of speaking to him, supplicating for him, and being subtle in informing him of his mistake.",
        "التَّوَاضُعُ لَهُ، وَالإِقْبَالُ عَلَيْهِ، وَعَدَمُ الالْتِفَاتِ عَنْهُ، وَمُرَاعَاةُ أَدَبِ الحَدِيثِ مَعَهُ، وَالدُّعَاءُ لَهُ، «وَلْيَتَلَطَّفْ فِي تَنْبِيهِهِ عَلَى خَطَئِهِ إِذَا وَقَعَتْ مِنْهُ زَلَّةٌ»",
      ),
    },
    {
      kind: "list",
      page: 94,
      front: t("What six things must be done regarding the error of a scholar?", "مَا الأُمُورُ السِّتَّةُ الوَاجِبَةُ إِزَاءَ زَلَّةِ العَالِمِ؟"),
      back: t(
        "1. Confirming the error was made by him.\n2. Confirming it is really an error.\n3. Not following him in it.\n4. Making an excuse for him with an appropriate interpretation.\n5. Advising him gently and privately — not aggressively, nor publicly.\n6. Preserving his status in the hearts of the Muslims.",
        "١. التَّثَبُّتُ فِي صُدُورِ الزَّلَّةِ مِنْهُ.\n٢. التَّثَبُّتُ فِي كَوْنِهَا خَطَأً.\n٣. تَرْكُ اتِّبَاعِهِ فِيهَا.\n٤. الْتِمَاسُ العُذْرِ لَهُ بِتَأْوِيلٍ سَائِغٍ.\n٥. بَذْلُ النُّصْحِ لَهُ بِلُطْفٍ وَسِرٍّ، لَا بِعُنْفٍ وَتَشْهِيرٍ.\n٦. حِفْظُ جَنَابِهِ، فَلَا تُهْدَرُ كَرَامَتُهُ فِي قُلُوبِ المُسْلِمِينَ.",
      ),
    },
    {
      kind: "point",
      page: 94,
      front: t("Whose responsibility is it to confirm that something a scholar said is really an error?", "مَنِ الَّذِي يُتَثَبَّتُ بِهِ مِنْ كَوْنِ زَلَّةِ العَالِمِ خَطَأً؟"),
      back: t("The scholars who are well-grounded in knowledge — they are the ones who should be asked about it.", "«وَهَذِهِ وَظِيفَةُ العُلَمَاءِ الرَّاسِخِينَ، فَيُسْأَلُونَ عَنْهَا»"),
    },
    {
      kind: "story",
      page: 96,
      front: t("What caused the death of Hushaym ibn Bashīr al-Wāsiṭī?", "مَا سَبَبُ مَوْتِ هُشَيْمِ بْنِ بَشِيرٍ الوَاسِطِيِّ؟"),
      back: t(
        "The students of ḥadīth crowded around him so much that they threw him from his donkey — a warning against “respect” that is really harm.",
        "«فَقَدِ ازْدَحَمَ أَصْحَابُ الحَدِيثِ عَلَيْهِ فَطَرَحُوهُ عَنْ حِمَارِهِ، فَكَانَ سَبَبَ مَوْتِهِ»",
      ),
    },
  ],

  // ───────────── 15 · Referring problems to the scholars ─────────────
  [
    principle(15, TITLES[14], 98),
    {
      kind: "point",
      page: 98,
      front: t("Why does the one who reveres knowledge not embark on what he cannot bear?", "لِمَاذَا لَا يُعَرِّضُ مُعَظِّمُ العِلْمِ نَفْسَهُ لِمَا لَا يُطِيقُ؟"),
      back: t("Out of fear that he will speak about Allāh without knowledge and invent a lie against the religion.", "«خَوْفًا مِنَ القَوْلِ عَلَى اللهِ بِلَا عِلْمٍ، وَالافْتِرَاءِ عَلَى الدِّينِ»"),
    },
    {
      kind: "cloze",
      page: 98,
      front: t("“He fears the anger of ______ before he fears the whip of ______.”", "«فَهُوَ يَخَافُ سَخَطَ ______ قَبْلَ أَنْ يَخَافَ سَوْطَ ______»"),
      back: t("the Most Merciful · the one in authority", "الرَّحْمَنِ · السُّلْطَانِ"),
    },
    {
      kind: "point",
      page: 98,
      front: t("What should the student do when the scholars speak about a problematic issue — and when they are silent?", "مَاذَا يَفْعَلُ الطَّالِبُ إِذَا تَكَلَّمَ العُلَمَاءُ فِي مُشْكِلٍ، وَإِذَا سَكَتُوا عَنْهُ؟"),
      back: t(
        "When they speak, speak with what they said; when they are silent, let yourself be sufficed with what sufficed them.",
        "«فَإِنْ تَكَلَّمُوا فِي مُشْكِلٍ فَتَكَلَّمْ بِكَلَامِهِمْ، وَإِنْ سَكَتُوا عَنْهُ فَلْيَسَعْكَ مَا وَسِعَهُمْ»",
      ),
    },
    {
      kind: "point",
      page: 98,
      front: t("What are among the greatest of complex issues?", "مَا مِنْ أَشَقِّ المُشْكِلَاتِ؟"),
      back: t("The tribulations which happen, and the new issues which become many with the passage of time.", "«الفِتَنُ الوَاقِعَةُ، وَالنَّوَازِلُ الحَادِثَةُ، الَّتِي تَتَكَاثَرُ مَعَ امْتِدَادِ الزَّمَنِ»"),
    },
    {
      kind: "list",
      page: 98,
      front: t("People are of two extremes regarding tribulations. Who are they?", "النَّاسُ فِي بَابِ الفِتَنِ وَالنَّوَازِلِ طَرَفَانِ؛ مَنْ هُمْ؟"),
      back: t(
        "1. Those who abandoned asking the scholars and turned to desires and opinions.\n2. Those who present matters to the scholars but are not content with their answer — as though they sought an answer agreeing with their desires.",
        "١. «قَوْمٌ أَعْرَضُوا عَنِ اسْتِفْتَاءِ العُلَمَاءِ فِيهَا، وَفَزِعُوا إِلَى الأَهْوَاءِ وَالآرَاءِ»\n٢. «وَقَوْمٌ يَعْرِضُونَهَا عَلَى العُلَمَاءِ، لَكِنَّهُمْ لَا يَرْتَضُونَ قَالَهُمْ، وَلَا يَرْضَوْنَ مَقَالَهُمْ»",
      ),
    },
    {
      kind: "point",
      page: 100,
      front: t("Who are those saved from the fire of tribulations?", "مَنِ النَّاجُونَ مِنْ نَارِ الفِتَنِ؟"),
      back: t("Those who turn towards the scholars and adhere to their answer.", "«هُمْ مَنْ فَزِعَ إِلَى العُلَمَاءِ وَلَزِمَ قَوْلَهُمْ»"),
    },
    {
      kind: "point",
      page: 100,
      front: t("If the scholars differ, whose opinion is adhered to?", "إِذَا اخْتَلَفَتْ أَقْوَالُ العُلَمَاءِ، فَقَوْلُ مَنْ يُلْزَمُ؟"),
      back: t(
        "The majority of them and the leaders among them — giving precedence to being safe, for there is no substitute for being safe.",
        "«لَزِمَ قَوْلَ جُمْهُورِهِمْ وَسَوَادِهِمْ؛ إِيثَارًا لِلسَّلَامَةِ؛ فَالسَّلَامَةُ لَا يَعْدِلُهَا شَيْءٌ»",
      ),
    },
    {
      kind: "point",
      page: 100,
      front: t("Who speaks about refuting the errors of scholars and the statements of the people of innovation?", "مَنِ الَّذِي يَتَكَلَّمُ فِي رَدِّ زَلَّاتِ العُلَمَاءِ وَالمَقَالَاتِ البَاطِلَةِ؟"),
      back: t(
        "Only the firmly-grounded scholars. When the youth and the masses embark on it, trials and tribulations result.",
        "«فَإِنَّمَا يَتَكَلَّمُ فِيهَا العُلَمَاءُ الرَّاسِخُونَ»، «وَإِذَا تَعَرَّضَتِ النَّاشِئَةُ وَالدَّهْمَاءُ لِلدُّخُولِ فِي هَذَا البَابِ تَوَلَّدَتْ فِتَنٌ وَبَلَايَا»",
      ),
      note: t("As ash-Shāṭibī clarified in al-Muwāfaqāt, and Ibn Rajab in Jāmiʿ al-ʿUlūm wal-Ḥikam.", "كَمَا بَيَّنَهُ الشَّاطِبِيُّ فِي «المُوَافَقَاتِ»، وَابْنُ رَجَبٍ فِي «جَامِعِ العُلُومِ وَالحِكَمِ»."),
    },
    verse(
      100,
      t("Obligatory in complex matters of understanding is;", "وَوَاجِبٌ فِي مُشْكِلَاتِ الفَهْمِ"),
      t("our thinking good of the people of knowledge.", "تَحْسِينُنَا الظَّنَّ بِأَهْلِ العِلْمِ"),
      t("Ibn ʿĀṣim, in Murtaqā al-Wuṣūl.", "ابْنُ عَاصِمٍ فِي «مُرْتَقَى الوُصُولِ»."),
    ),
    verseReversed(
      100,
      t("Obligatory in complex matters of understanding is;", "وَوَاجِبٌ فِي مُشْكِلَاتِ الفَهْمِ"),
      t("our thinking good of the people of knowledge.", "تَحْسِينُنَا الظَّنَّ بِأَهْلِ العِلْمِ"),
      t("Ibn ʿĀṣim, in Murtaqā al-Wuṣūl.", "ابْنُ عَاصِمٍ فِي «مُرْتَقَى الوُصُولِ»."),
    ),
  ],

  // ───────────── 16 · Gatherings of knowledge, and books ─────────────
  [
    principle(16, TITLES[15], 102),
    {
      kind: "cloze",
      page: 102,
      front: t("“The gatherings of the scholars are like the gatherings of ______.”", "«فَمَجَالِسُ العُلَمَاءِ كَمَجَالِسِ ______»"),
      back: t("the prophets", "الأَنْبِيَاءِ"),
    },
    {
      kind: "quote",
      page: 102,
      front: t("Complete Sahl ibn ʿAbdillāh's saying: “Whoever wants to look at the gatherings of the prophets …”", "أَكْمِلْ قَوْلَ سَهْلِ بْنِ عَبْدِ اللهِ: «مَنْ أَرَادَ أَنْ يَنْظُرَ إِلَى مَجَالِسِ الأَنْبِيَاءِ …»"),
      back: t("“… let him look at the gatherings of the scholars.”", "«… فَلْيَنْظُرْ إِلَى مَجَالِسِ العُلَمَاءِ»"),
    },
    {
      kind: "quote",
      page: 102,
      front: t("According to Mālik ibn Anas, what do the gatherings of the scholars foster?", "بِمَ تُحْتَضَنُ مَجَالِسُ العُلَمَاءِ كَمَا قَالَ مَالِكُ بْنُ أَنَسٍ؟"),
      back: t("Khushūʿ, tranquility, and calmness.", "«إِنَّ مَجَالِسَ العُلَمَاءِ تُحْتَضَنُ بِالخُشُوعِ وَالسَّكِينَةِ وَالوَقَارِ»"),
    },
    {
      kind: "story",
      page: 102,
      front: t("What would Mālik do when he wanted to narrate a ḥadīth?", "مَاذَا كَانَ يَفْعَلُ مَالِكٌ إِذَا أَرَادَ أَنْ يُحَدِّثَ؟"),
      back: t(
        "He would make wuḍūʾ, sit on the front part of his mat, comb his beard, and sit calmly and with dignity — then narrate.",
        "«تَوَضَّأَ وَجَلَسَ عَلَى صَدْرِ فِرَاشِهِ، وَسَرَّحَ لِحْيَتَهُ، وَتَمَكَّنَ مِنْ جُلُوسِهِ بِوَقَارٍ وَهَيْبَةٍ، ثُمَّ حَدَّثَ»",
      ),
    },
    {
      kind: "story",
      page: 104,
      front: t("What did ʿAbd ar-Raḥmān ibn Mahdī not allow in his gathering?", "مَاذَا كَانَ عَبْدُ الرَّحْمَنِ بْنُ مَهْدِيٍّ لَا يُجِيزُهُ فِي مَجْلِسِهِ؟"),
      back: t("Anyone talking, a pen scraping, or anyone smiling.", "«لَا يُتَحَدَّثُ فِي مَجْلِسِهِ، وَلَا يُبْرَى فِيهِ قَلَمٌ، وَلَا يَتَبَسَّمُ فِيهِ أَحَدٌ»"),
    },
    {
      kind: "cloze",
      page: 104,
      front: t("“Wakīʿ ibn al-Jarrāḥ used to be in his gathering, as though they were in ______.”", "«وَكَانَ وَكِيعُ بْنُ الجَرَّاحِ فِي مَجْلِسِهِ كَأَنَّهُمْ فِي ______»"),
      back: t("prayer", "صَلَاةٍ"),
    },
    {
      kind: "list",
      page: 104,
      front: t("How must a student sit in a gathering of knowledge?", "كَيْفَ يَجْلِسُ طَالِبُ العِلْمِ فِي مَجْلِسِ العِلْمِ؟"),
      back: t(
        "In a well-mannered way, giving the shaykh his full attention, looking at him, not turning away without necessity, not fiddling with his hands or feet, not reclining, and not speaking to the person next to him.",
        "«فَيَجْلِسُ فِيهَا جِلْسَةَ الأَدَبِ، وَيُصْغِي إِلَى الشَّيْخِ نَاظِرًا إِلَيْهِ، لَا يَلْتَفِتُ عَنْهُ مِنْ غَيْرِ ضَرُورَةٍ … وَلَا يَعْبَثُ بِيَدَيْهِ أَوْ رِجْلَيْهِ، وَلَا يَسْتَنِدُ بِحَضْرَةِ شَيْخِهِ … وَلَا يَتَكَلَّمُ مَعَ جَارِهِ»",
      ),
    },
    {
      kind: "point",
      page: 104,
      front: t("What should a student do if he sneezes or yawns in the gathering?", "مَاذَا يَفْعَلُ الطَّالِبُ إِذَا عَطَسَ أَوْ تَثَاءَبَ فِي المَجْلِسِ؟"),
      back: t("If he sneezes, he lessens the sound of it; if he yawns, he covers his mouth after trying to suppress it.", "«وَإِذَا عَطَسَ خَفَضَ صَوْتَهُ، وَإِذَا تَثَاءَبَ سَتَرَ فَمَهُ بَعْدَ رَدِّهِ جُهْدَهُ»"),
    },
    {
      kind: "term",
      page: 104,
      front: t("What are “the vessels of knowledge” that must be honoured?", "مَا «أَوْعِيَةُ العِلْمِ» الَّتِي يَجِبُ إِجْلَالُهَا؟"),
      back: t("Books — the vessels which preserve knowledge within them.", "الكُتُبُ — «إِجْلَالُ أَوْعِيَتِهِ الَّتِي يُحْفَظُ فِيهَا، وَعِمَادُهَا الكُتُبُ»"),
    },
    {
      kind: "list",
      page: 104,
      front: t("How should a student treat his book?", "كَيْفَ يُعَامِلُ طَالِبُ العِلْمِ كِتَابَهُ؟"),
      back: t(
        "Take care of it and honour it: not make it a place for storing things, not roll it into a tube, put it down gently, not lean on it or put it at his feet.",
        "«فَلَا يَجْعَلُهُ صُنْدُوقًا يَحْشُوهُ بِوَدَائِعِهِ، وَلَا يَجْعَلُهُ بُوقًا، وَإِذَا وَضَعَهُ وَضَعَهُ بِلُطْفٍ وَعِنَايَةٍ»، «وَلَا يَتَّكِئُ عَلَى الكِتَابِ، أَوْ يَضَعُهُ عِنْدَ قَدَمَيْهِ»",
      ),
    },
    {
      kind: "story",
      page: 104,
      front: t("Isḥāq ibn Rāhawayh threw down a book, and Imām Aḥmad saw him. What did Aḥmad say?", "رَمَى إِسْحَاقُ بْنُ رَاهَوَيْهِ كِتَابًا، فَرَآهُ الإِمَامُ أَحْمَدُ، فَمَاذَا قَالَ؟"),
      back: t("He became angry and said: “Is this what is done with the speech of the righteous!?”", "فَغَضِبَ وَقَالَ: «أَهَكَذَا يُفْعَلُ بِكَلَامِ الأَبْرَارِ؟!»"),
    },
  ],

  // ───────────── 17 · Defending knowledge ─────────────
  [
    principle(17, TITLES[16], 106),
    {
      kind: "point",
      page: 106,
      front: t("Why must knowledge be defended?", "لِمَاذَا يَجِبُ الانْتِصَارُ لِلْعِلْمِ؟"),
      back: t("Knowledge is sacred and opulent; it must be advocated for if its excellence is challenged in a way that is not appropriate.", "«فَإِنَّ لِلْعِلْمِ حُرْمَةً وَافِرَةً، تُوجِبُ الانْتِصَارَ لَهُ إِذَا تُعُرِّضَ لِجَنَابِهِ بِمَا لَا يَصْلُحُ»"),
    },
    {
      kind: "list",
      page: 106,
      front: t("Name the three forms of defending knowledge the author mentions.", "اذْكُرِ المَظَاهِرَ الثَّلَاثَةَ لِلِانْتِصَارِ لِلْعِلْمِ الَّتِي ذَكَرَهَا المُؤَلِّفُ."),
      back: t(
        "1. Refuting the one who is at variance with it.\n2. Forsaking the innovator about whom there is consensus.\n3. Rebuking the student who transgresses in his research, or shows severe dispute or a lack of manners.",
        "١. الرَّدُّ عَلَى المُخَالِفِ.\n٢. هَجْرُ المُبْتَدِعِ المُجْمَعِ عَلَيْهِ.\n٣. زَجْرُ المُتَعَلِّمِ إِذَا تَعَدَّى فِي بَحْثِهِ، أَوْ ظَهَرَ مِنْهُ لَدَدٌ أَوْ سُوءُ أَدَبٍ.",
      ),
    },
    {
      kind: "point",
      page: 106,
      front: t("Who are the ones appointed for refuting, and with what conditions?", "مَنِ المُرَشَّحُ لِلرَّدِّ عَلَى المُخَالِفِ، وَبِأَيِّ شَرْطٍ؟"),
      back: t("The scholars, not the multitudes — keeping to good manners and leaving off inequity and oppression.", "«لَكِنَّ المُرَشَّحَ لِذَلِكَ هُمُ العُلَمَاءُ لَا الدَّهْمَاءُ، مَعَ لُزُومِ الأَدَبِ وَتَرْكِ الجَوْرِ وَالظُّلْمِ»"),
    },
    {
      kind: "point",
      page: 106,
      front: t("Is knowledge taken from the people of innovation?", "هَلْ يُؤْخَذُ العِلْمُ عَنْ أَهْلِ البِدَعِ؟"),
      back: t("No — unless there is no choice, in which case there is no harm, as the scholars of ḥadīth narrated from some of them.", "«فَلَا يُؤْخَذُ العِلْمُ عَنْ أَهْلِ البِدَعِ، لَكِنْ إِذَا اضْطُرَّ إِلَيْهِ فَلَا بَأْسَ، كَمَا فِي الرِّوَايَةِ عَنْهُمْ لَدَى المُحَدِّثِينَ»"),
      note: t("As Abū Yaʿlā al-Farrāʾ mentioned.", "كَمَا ذَكَرَهُ أَبُو يَعْلَى الفَرَّاءُ."),
    },
    {
      kind: "quote",
      page: 108,
      front: t(
        "Ibn Taymiyyah: if certain obligations can only be established through one whose innovation is less harmful than leaving the obligation, what is better?",
        "قَالَ ابْنُ تَيْمِيَّةَ: إِذَا تَعَذَّرَ إِقَامَةُ الوَاجِبَاتِ إِلَّا بِمَنْ فِيهِ بِدْعَةٌ مَضَرَّتُهَا دُونَ مَضَرَّةِ تَرْكِ ذَلِكَ الوَاجِبِ، فَمَاذَا يَكُونُ؟",
      ),
      back: t(
        "Achieving the benefit of that obligation, despite the lesser harm, is better than the alternative.",
        "«كَانَ تَحْصِيلُ مَصْلَحَةِ الوَاجِبِ مَعَ مَفْسَدَةٍ مَرْجُوحَةٍ خَيْرًا مِنَ العَكْسِ»",
      ),
    },
    {
      kind: "story",
      page: 108,
      front: t("What would ʿAbd ar-Raḥmān ibn Mahdī do if someone talked in his gathering or a pen scratched?", "مَاذَا كَانَ يَفْعَلُ عَبْدُ الرَّحْمَنِ بْنُ مَهْدِيٍّ إِنْ تَحَدَّثَ أَحَدٌ فِي مَجْلِسِهِ أَوْ بُرِيَ قَلَمٌ؟"),
      back: t("He would speak out, put on his sandals, and enter [his home].", "«صَاحَ وَلَبِسَ نَعْلَيْهِ وَدَخَلَ»"),
    },
    {
      kind: "story",
      page: 108,
      front: t("For how long did one of the early generations study before sitting at the front, according to Sufyān ath-Thawrī?", "كَمْ سَنَةً كَانَ أَحَدُ السَّلَفِ يَطْلُبُ العِلْمَ قَبْلَ أَنْ يَجْلِسَ فِي الصَّدْرِ، كَمَا قَالَ سُفْيَانُ الثَّوْرِيُّ؟"),
      back: t(
        "Thirty years. Sufyān said it to a young man who presided over his gathering with arrogance, then told him to leave.",
        "«ثَلَاثِينَ سَنَةً»؛ قَالَهُ سُفْيَانُ لِشَابٍّ تَرَأَّسَ فِي مَجْلِسِهِ وَتَكَبَّرَ بِالعِلْمِ، ثُمَّ قَالَ: «قُمْ عَنِّي، وَلَا أَرَاكَ تَدْنُو مِنْ مَجْلِسِي»",
      ),
    },
    {
      kind: "quote",
      page: 110,
      front: t("Complete Sufyān ath-Thawrī's saying: “If you see a young person speaking in front of the scholars, even if he has reached a significant amount of knowledge …”", "أَكْمِلْ قَوْلَ سُفْيَانَ: «إِذَا رَأَيْتَ الشَّابَّ يَتَكَلَّمُ عِنْدَ المَشَايِخِ، وَإِنْ كَانَ قَدْ بَلَغَ مِنَ العِلْمِ مَبْلَغًا …»"),
      back: t("“… despair of good from him; for he has little shame.”", "«… فَآيِسْ مِنْ خَيْرِهِ؛ فَإِنَّهُ قَلِيلُ الحَيَاءِ»"),
    },
    {
      kind: "quote",
      page: 110,
      front: t("A student may be rebuked by not answering his question. Who said: “Silence is an answer”?", "قَدْ يُزْجَرُ المُتَعَلِّمُ بِتَرْكِ إِجَابَتِهِ؛ مَنِ القَائِلُ: «السُّكُوتُ جَوَابٌ»؟"),
      back: t("Al-Aʿmash.", "الأَعْمَشُ رَحِمَهُ اللهُ."),
    },
    {
      kind: "story",
      page: 110,
      front: t("What would Ibn Bāz do when someone asked him about something that does not benefit?", "مَاذَا كَانَ يَفْعَلُ ابْنُ بَازٍ إِذَا سَأَلَهُ سَائِلٌ عَمَّا لَا يَنْفَعُهُ؟"),
      back: t(
        "He would leave off answering and tell the reader to continue reading — or answer with something different to what the questioner intended.",
        "«فَتَرَكَ الشَّيْخُ إِجَابَتَهُ، وَأَمَرَ القَارِئَ أَنْ يُوَاصِلَ قِرَاءَتَهُ، أَوْ أَجَابَهُ بِخِلَافِ قَصْدِهِ»",
      ),
    },
  ],

  // ───────────── 18 · Restraint in asking ─────────────
  [
    principle(18, TITLES[17], 112),
    {
      kind: "point",
      page: 112,
      front: t("Why must one show restraint when asking the scholars questions?", "لِمَاذَا يَجِبُ التَّحَفُّظُ فِي مَسْأَلَةِ العَالِمِ؟"),
      back: t("To flee from the issues which cause an uproar, and to protect the dignity of the scholar.", "«فِرَارًا مِنْ مَسَائِلِ الشَّغَبِ، وَحِفْظًا لِهَيْبَةِ العَالِمِ»"),
    },
    {
      kind: "list",
      page: 112,
      front: t("Restraint in asking is only successful by acting upon which four principles?", "لَا يُفْلِحُ التَّحَفُّظُ فِي مَسْأَلَةِ العَالِمِ إِلَّا بِإِعْمَالِ أَيِّ أُصُولٍ أَرْبَعَةٍ؟"),
      back: t(
        "1. Thinking about why he is asking.\n2. Examining what he is asking about.\n3. Being aware of whether the shaykh is in a state to answer.\n4. Being aware of how he asks the question.",
        "١. الفِكْرُ فِي سُؤَالِهِ: لِمَاذَا يَسْأَلُ؟\n٢. التَّفَطُّنُ إِلَى مَا يَسْأَلُ عَنْهُ.\n٣. الانْتِبَاهُ إِلَى صَلَاحِيَةِ حَالِ الشَّيْخِ لِلْإِجَابَةِ.\n٤. تَفَطُّنُ السَّائِلِ إِلَى كَيْفِيَّةِ سُؤَالِهِ.",
      ),
    },
    {
      kind: "point",
      page: 112,
      front: t("What should the intention behind a question be — and what happens to one with a bad intention?", "مَا القَصْدُ الصَّحِيحُ مِنَ السُّؤَالِ؟ وَمَا جَزَاءُ مَنْ سَاءَ قَصْدُهُ فِيهِ؟"),
      back: t(
        "To gain knowledge and to learn, not to be stubborn and mock. The one with a bad intention is withheld from the blessing of knowledge and prohibited from its benefit.",
        "«فَيَكُونُ قَصْدُهُ مِنَ السُّؤَالِ التَّفَقُّهَ وَالتَّعَلُّمَ، لَا التَّعَنُّتَ وَالتَّهَكُّمَ؛ فَإِنَّ مَنْ سَاءَ قَصْدُهُ فِي سُؤَالِهِ يُحْرَمُ بَرَكَةَ العِلْمِ، وَيُمْنَعُ مَنْفَعَتَهُ»",
      ),
    },
    {
      kind: "story",
      page: 114,
      front: t("Al-Qarāfī was asked whether marriage in Cairo is permissible. What was the hidden intent, and his answer?", "سُئِلَ القَرَافِيُّ عَنْ عَقْدِ النِّكَاحِ بِالقَاهِرَةِ: هَلْ يَجُوزُ؟ فَمَا كَانَ قَصْدُ السَّائِلِ، وَبِمَ أَجَابَ؟"),
      back: t(
        "They had been prevented elsewhere because it was a sham marriage (istiḥlāl). He said: “This is not permissible, not in Cairo, and not anywhere else!”",
        "كَانَ نِكَاحَ تَحْلِيلٍ مُنِعُوا مِنْهُ خَارِجَ القَاهِرَةِ، فَقَالَ: «لَا يَجُوزُ، لَا بِالقَاهِرَةِ وَلَا بِغَيْرِهَا»",
      ),
    },
    {
      kind: "quote",
      page: 114,
      front: t("When a fatwā kept being brought back to Ibn Taymiyyah in different forms, what did he finally say?", "لَمَّا رُدَّتْ عَلَى ابْنِ تَيْمِيَّةَ فَتْوَى مِرَارًا فِي وُجُوهٍ مُخْتَلِفَةٍ، مَاذَا قَالَ آخِرَ مَرَّةٍ؟"),
      back: t("“It is this particular issue, even if it keeps on being presented in different moulds.”", "«هِيَ المَسْأَلَةُ المُعَيَّنَةُ، وَإِنْ خَرَجَتْ فِي عِدَّةِ قَوَالِبَ»"),
      note: t("Mentioned by Ibn al-Qayyim in Iʿlām al-Muwaqqiʿīn.", "ذَكَرَهُ ابْنُ القَيِّمِ فِي «إِعْلَامِ المُوَقِّعِينَ»."),
    },
    {
      kind: "story",
      page: 114,
      front: t("A man asked Aḥmad ibn Ḥanbal whether Yaʾjūj and Maʾjūj are Muslims. What did he reply?", "سَأَلَ رَجُلٌ أَحْمَدَ بْنَ حَنْبَلٍ عَنْ يَأْجُوجَ وَمَأْجُوجَ: أَمُسْلِمُونَ هُمْ؟ فَبِمَ أَجَابَهُ؟"),
      back: t("“You are so proficient in knowledge that you have reached the level of asking about this!?”", "«أَحْكَمْتَ العِلْمَ حَتَّى تَسْأَلَ عَنْ ذَا؟!»"),
    },
    {
      kind: "list",
      page: 116,
      front: t("Give examples of times a student should not ask the shaykh a question.", "اذْكُرْ أَحْوَالًا لَا يُسْأَلُ فِيهَا الشَّيْخُ."),
      back: t(
        "When he is anxious, in deep thought, walking along the road, or getting into his car — wait until he is ready and content to answer.",
        "«كَكَوْنِهِ مَهْمُومًا، أَوْ مُتَفَكِّرًا، أَوْ مَاشِيًا فِي طَرِيقٍ، أَوْ رَاكِبًا لِسَيَّارَتِهِ، بَلْ يَتَحَيَّنُ طِيبَ نَفْسِهِ»",
      ),
    },
    {
      kind: "quote",
      page: 116,
      front: t("Qatādah asked Abūṭ-Ṭufayl a question. What did he reply?", "سَأَلَ قَتَادَةُ أَبَا الطُّفَيْلِ مَسْأَلَةً، فَمَاذَا قَالَ؟"),
      back: t("“For every situation, there is appropriate speech.”", "«إِنَّ لِكُلِّ مَقَامٍ مَقَالًا»"),
    },
    {
      kind: "quote",
      page: 116,
      front: t("A man asked Ibn al-Mubārak about a ḥadīth while he was walking. What did he say?", "سَأَلَ رَجُلٌ ابْنَ المُبَارَكِ عَنْ حَدِيثٍ وَهُوَ يَمْشِي، فَمَاذَا قَالَ؟"),
      back: t("“This is not from respecting knowledge.”", "«لَيْسَ هَذَا مِنْ تَوْقِيرِ العِلْمِ»"),
    },
    {
      kind: "point",
      page: 116,
      front: t("How should the questioner form his question (the fourth principle)?", "كَيْفَ يُخْرِجُ السَّائِلُ سُؤَالَهُ فِي الأَصْلِ الرَّابِعِ؟"),
      back: t(
        "In a good, well-mannered way: precede it with a supplication for the shaykh and honour him in his address — not as one addresses people in the market.",
        "«بِإِخْرَاجِهِ فِي صُورَةٍ حَسَنَةٍ مُتَأَدِّبَةٍ، فَيُقَدِّمُ الدُّعَاءَ لِلشَّيْخِ وَيُبَجِّلُهُ فِي خِطَابِهِ، وَلَا تَكُونُ مُخَاطَبَتُهُ لَهُ كَمُخَاطَبَتِهِ أَهْلَ السُّوقِ وَأَخْلَاطَ العَوَامِّ»",
      ),
    },
    {
      kind: "story",
      page: 116,
      front: t("A man hurriedly asked Yaḥyā ibn Maʿīn: “Narrate to me something that I can remember you by.” What did Yaḥyā reply?", "قَالَ رَجُلٌ مُسْتَعْجِلٌ لِيَحْيَى بْنِ مَعِينٍ: حَدِّثْنِي بِشَيْءٍ أَذْكُرُكَ بِهِ. فَمَاذَا قَالَ؟"),
      back: t("“Remember me by the fact that you asked me to narrate to you and I didn't.”", "«اذْكُرْنِي أَنَّكَ سَأَلْتَنِي أَنْ أُحَدِّثَكَ فَلَمْ أَفْعَلْ!»"),
    },
    {
      kind: "quote",
      page: 118,
      front: t("A man asked Zayd ibn Aslam about something in a humorous manner. What did Zayd say?", "سَأَلَ رَجُلٌ زَيْدَ بْنَ أَسْلَمَ عَنْ شَيْءٍ فَخَلَّطَ عَلَيْهِ، فَمَاذَا قَالَ زَيْدٌ؟"),
      back: t("“Go and learn how to ask, then come and ask.”", "«اذْهَبْ فَتَعَلَّمْ كَيْفَ تَسْأَلُ، ثُمَّ تَعَالَ فَسَلْ»"),
    },
  ],

  // ───────────── 19 · Passion for knowledge ─────────────
  [
    principle(19, TITLES[18], 120),
    {
      kind: "point",
      page: 120,
      front: t("When does a person reach the level of knowledge?", "مَتَى يَنَالُ العَبْدُ دَرَجَةَ العِلْمِ؟"),
      back: t("When his greatest pleasure is found in it.", "«وَلَا يَنَالُ العَبْدُ دَرَجَةَ العِلْمِ حَتَّى تَكُونَ لَذَّتُهُ الكُبْرَى فِيهِ»"),
    },
    {
      kind: "quote",
      page: 120,
      front: t(
        "Complete Ibn al-Qayyim's words (Miftāḥ Dār as-Saʿādah): “Whoever does not allow the pleasure of gaining knowledge and the desire for it to overcome the pleasure of the body and the desires of the soul …”",
        "أَكْمِلْ قَوْلَ ابْنِ القَيِّمِ فِي «مِفْتَاحِ دَارِ السَّعَادَةِ»: «وَمَنْ لَمْ يُغَلِّبْ لَذَّةَ إِدْرَاكِهِ وَشَهْوَتَهُ عَلَى لَذَّةِ جِسْمِهِ وَشَهْوَةِ نَفْسِهِ …»",
      ),
      back: t("“… will never reach the level of knowledge.”", "«… لَمْ يَنَلْ دَرَجَةَ العِلْمِ أَبَدًا»"),
    },
    {
      kind: "list",
      page: 120,
      front: t("The pleasure of knowledge is only gained by which three things?", "بِأَيِّ ثَلَاثَةِ أُمُورٍ تُنَالُ لَذَّةُ العِلْمِ؟"),
      back: t(
        "1. Giving your best and utmost effort.\n2. Truthfulness in seeking it.\n3. The correctness of intention and sincerity.",
        "١. بَذْلُ الوُسْعِ وَالجُهْدِ.\n٢. صِدْقُ الطَّلَبِ.\n٣. صِحَّةُ النِّيَّةِ وَالإِخْلَاصِ.",
      ),
      note: t("These are only achieved by repelling from the heart everything that distracts from them.", "«وَلَا تَتِمُّ هَذِهِ الأُمُورُ الثَّلَاثَةُ إِلَّا مَعَ دَفْعِ كُلِّ مَا يُشْغِلُ عَنِ القَلْبِ»"),
    },
    {
      kind: "story",
      page: 122,
      front: t("Abū Jaʿfar an-Nasafī went to sleep anxious. A matter of fiqh came to him and amazed him. What did he do?", "بَاتَ أَبُو جَعْفَرٍ النَّسَفِيُّ مَهْمُومًا، فَوَقَعَ فِي خَاطِرِهِ فَرْعٌ مِنْ فُرُوعِ مَذْهَبِهِ فَأُعْجِبَ بِهِ؛ فَمَاذَا فَعَلَ؟"),
      back: t("He stood, dancing in his home, saying: “Where are the kings and the children of the kings!?”", "«فَقَامَ يَرْقُصُ فِي دَارِهِ، وَيَقُولُ: أَيْنَ المُلُوكُ وَأَبْنَاءُ المُلُوكِ؟!»"),
    },
    {
      kind: "story",
      page: 124,
      front: t("The caliph Abū Jaʿfar al-Manṣūr was asked whether any worldly pleasure remained that he had not achieved. What did he say?", "قِيلَ لِلْخَلِيفَةِ أَبِي جَعْفَرٍ المَنْصُورِ: هَلْ بَقِيَ مِنْ لَذَّاتِ الدُّنْيَا شَيْءٌ لَمْ تَنَلْهُ؟ فَمَاذَا قَالَ؟"),
      back: t(
        "Sitting on a seat, surrounded by the people of ḥadīth, with the scribe asking: “Who did you mention, may Allāh have mercy on you?”",
        "«بَقِيَتْ خَصْلَةٌ: أَنْ أَقْعُدَ عَلَى مِصْطَبَةٍ، وَحَوْلِي أَصْحَابُ الحَدِيثِ، فَيَقُولُ المُسْتَمْلِي: مَنْ ذَكَرْتَ رَحِمَكَ اللهُ؟»",
      ),
    },
    {
      kind: "quote",
      page: 124,
      front: t("Complete an-Naḍr ibn Shumayl's saying: “A person will not find the pleasure of knowledge until …”", "أَكْمِلْ قَوْلَ النَّضْرِ بْنِ شُمَيْلٍ: «لَا يَجِدُ المَرْءُ لَذَّةَ العِلْمِ حَتَّى …»"),
      back: t("“… he is hungry, but forgets his hunger.”", "«… يَجُوعَ وَيَنْسَى جُوعَهُ»"),
    },
    {
      kind: "quote",
      page: 126,
      front: t("According to Ibn al-Qayyim (Rawḍat al-Muḥibbīn), how great is the passion of those passionate about knowledge?", "كَيْفَ وَصَفَ ابْنُ القَيِّمِ فِي «رَوْضَةِ المُحِبِّينَ» عُشَّاقَ العِلْمِ؟"),
      back: t(
        "Greater than any passion that any passionate person has for anything — many of them could not be distracted from it by the most beautiful image of a person.",
        "«وَأَمَّا عُشَّاقُ العِلْمِ فَأَعْظَمُ شَغَفًا بِهِ وَعِشْقًا لَهُ مِنْ كُلِّ عَاشِقٍ بِمَعْشُوقِهِ، وَكَثِيرٌ مِنْهُمْ لَا يَشْغَلُهُ عَنْهُ أَجْمَلُ صُورَةٍ مِنَ البَشَرِ»",
      ),
    },
    verse(
      122,
      t("My pleasure is nothing but narrating a musnad;", "مَا لَذَّتِي إِلَّا رِوَايَةُ مُسْنَدٍ"),
      t("written with the most eloquent of words.", "قَدْ قُيِّدَتْ بِفَصَاحَةِ الأَلْفَاظِ"),
    ),
    verse(
      122,
      t("And a gathering in which tranquillity descends;", "وَمَجَالِسٌ فِيهَا تَحِلُّ سَكِينَةٌ"),
      t("and revising and accompanying those who memorise.", "وَمُذَاكَرَاتُ مَعَاشِرِ الحُفَّاظِ"),
    ),
    verse(
      122,
      t("If my mind embarks on the sea of thought;", "إِذَا خَاضَ فِي بَحْرِ التَّفَكُّرِ خَاطِرِي"),
      t("upon a pearl from the mysteries that I seek answers to;", "عَلَى دُرَّةٍ مِنْ مُعْضِلَاتِ المَطَالِبِ"),
    ),
    verse(
      122,
      t("I look down upon the kings of the earth getting what they have attained;", "حَقَرْتُ مُلُوكَ الأَرْضِ فِي نَيْلِ مَا حَوَوْا"),
      t("when I have attained my desire through books, not through armies.", "وَنِلْتُ المُنَى بِالكُتْبِ لَا بِالكَتَائِبِ"),
    ),
    verse(
      124,
      t("An inkwell that stays with me in my day;", "لَمِحْبَرَةٌ تُجَالِسُنِي نَهَارِي"),
      t("is more beloved to me than the affability of a friend.", "أَحَبُّ إِلَيَّ مِنْ أُنْسِ الصَّدِيقِ"),
      t("Muḥammad ibn Hārūn ad-Dimashqī.", "مُحَمَّدُ بْنُ هَارُونَ الدِّمَشْقِيُّ."),
    ),
    verse(
      126,
      t("And the blow to my cheek from a scholar;", "وَلَطْمَةُ عَالِمٍ فِي الخَدِّ مِنِّي"),
      t("is more pleasurable to me than the drinking of nectar.", "أَلَذُّ لَدَيَّ مِنْ شُرْبِ الرَّحِيقِ"),
      t("Muḥammad ibn Hārūn ad-Dimashqī.", "مُحَمَّدُ بْنُ هَارُونَ الدِّمَشْقِيُّ."),
    ),
  ],

  // ───────────── 20 · Time ─────────────
  [
    principle(20, TITLES[19], 128),
    {
      kind: "example",
      page: 128,
      front: t("If knowledge is the most honourable goal, to what does the author liken your life?", "إِذَا كَانَ العِلْمُ أَشْرَفَ مَطْلُوبٍ، فَبِمَ شَبَّهَ المُؤَلِّفُ العُمُرَ؟"),
      back: t("Ice that melts — so real intellect is making good use of your time in knowledge.", "«وَالعُمُرُ يُطْوَى كَجَلِيدٍ يَذُوبُ، فَعَيْنُ العَقْلِ حِفْظُ الوَقْتِ فِيهِ»"),
    },
    {
      kind: "quote",
      page: 128,
      front: t("Complete Ibn al-Jawzī's words (Ṣayd al-Khāṭir): “It is befitting for a person to know the honour of his lifespan and the value of his time …”", "أَكْمِلْ قَوْلَ ابْنِ الجَوْزِيِّ فِي «صَيْدِ الخَاطِرِ»: «يَنْبَغِي لِلْإِنْسَانِ أَنْ يَعْرِفَ شَرَفَ زَمَانِهِ، وَقَدْرَ وَقْتِهِ …»"),
      back: t(
        "“… so he does not waste even a moment of it without doing an act of worship, and he puts forward the best of speech and action.”",
        "«… فَلَا يُضَيِّعُ مِنْهُ لَحْظَةً فِي غَيْرِ قُرْبَةٍ، وَيُقَدِّمُ فِيهِ الأَفْضَلَ فَالأَفْضَلَ مِنَ القَوْلِ وَالعَمَلِ»",
      ),
    },
    {
      kind: "quote",
      page: 128,
      front: t("Who said: “I have not wasted even an hour of my time with amusement or play”?", "مَنِ القَائِلُ: «مَا ضَيَّعْتُ سَاعَةً مِنْ عُمُرِي فِي لَهْوٍ أَوْ لَعِبٍ»؟"),
      back: t("Muḥammad ibn ʿAbd al-Bāqī al-Bazzār.", "مُحَمَّدُ بْنُ عَبْدِ البَاقِي البَزَّازُ."),
    },
    {
      kind: "quote",
      page: 128,
      front: t("Which scholar, author of al-Funūn in eight hundred volumes, said: “It is not allowed for me to waste an hour of my life”?", "مَنْ صَاحِبُ كِتَابِ «الفُنُونِ» فِي ثَمَانِمِائَةِ مُجَلَّدٍ، القَائِلُ: «إِنِّي لَا يَحِلُّ لِي أَنْ أُضَيِّعَ سَاعَةً مِنْ عُمُرِي»؟"),
      back: t("Abūl-Wafāʾ Ibn ʿAqīl.", "أَبُو الوَفَاءِ ابْنُ عَقِيلٍ."),
    },
    {
      kind: "story",
      page: 130,
      front: t("What would Aḥmad ibn Sulaymān al-Balqāsī — who died at twenty-eight — have done while he ate?", "مَاذَا كَانَ يَصْنَعُ أَحْمَدُ بْنُ سُلَيْمَانَ البُلْقَاسِيُّ - المُتَوَفَّى عَنْ ثَمَانٍ وَعِشْرِينَ سَنَةً - حَالَ أَكْلِهِ؟"),
      back: t(
        "He had the different recitations of the Qur'an read to him, out of fear of wasting his time.",
        "«يُقْرِئُ القِرَاءَاتِ فِي حَالِ أَكْلِهِ؛ خَوْفًا مِنْ ضَيَاعِ وَقْتِهِ فِي غَيْرِهَا»",
      ),
    },
    {
      kind: "story",
      page: 130,
      front: t("What would the elder Ibn Taymiyyah say to those around him when he went to relieve himself?", "مَاذَا كَانَ يَقُولُ ابْنُ تَيْمِيَّةَ الجَدُّ لِمَنْ حَوْلَهُ إِذَا دَخَلَ الخَلَاءَ لِقَضَاءِ حَاجَةٍ؟"),
      back: t("“Read from this book and raise your voice.”", "«اقْرَأْ فِي هَذَا الكِتَابِ، وَارْفَعْ صَوْتَكَ»"),
    },
    {
      kind: "story",
      page: 130,
      front: t("How many lessons did an-Nawawī read to his teachers every day?", "كَمْ دَرْسًا كَانَ النَّوَوِيُّ يَقْرَأُ كُلَّ يَوْمٍ عَلَى مَشَايِخِهِ؟"),
      back: t("Twelve lessons.", "اثْنَيْ عَشَرَ دَرْسًا."),
    },
    {
      kind: "story",
      page: 130,
      front: t("How many lessons a day did Maḥmūd al-Ālūsī study, before tafsīr and fatāwā busied him?", "كَمْ دَرْسًا كَانَ يُدَرِّسُ مَحْمُودٌ الآلُوسِيُّ فِي اليَوْمِ قَبْلَ أَنْ يَشْتَغِلَ بِالتَّفْسِيرِ وَالإِفْتَاءِ؟"),
      back: t("Twenty-four — then he reduced it to thirteen.", "«أَرْبَعَةً وَعِشْرِينَ دَرْسًا، وَلَمَّا اشْتَغَلَ بِالتَّفْسِيرِ وَالإِفْتَاءِ نَقَصَتْ إِلَى ثَلَاثَةَ عَشَرَ دَرْسًا»"),
    },
    {
      kind: "story",
      page: 132,
      front: t("How many times did Ibn ʿAṭiyyah's father, Ghālib ibn ʿAbd ar-Raḥmān, go over Ṣaḥīḥ al-Bukhārī?", "كَمْ مَرَّةً كَرَّرَ غَالِبُ بْنُ عَبْدِ الرَّحْمَنِ - وَالِدُ ابْنِ عَطِيَّةَ - «صَحِيحَ البُخَارِيِّ»؟"),
      back: t("Seven hundred times.", "سَبْعَمِائَةِ مَرَّةٍ."),
    },
    {
      kind: "story",
      page: 132,
      front: t("How many volumes did Ibn al-Jawzī read while still a student?", "كَمْ مُجَلَّدًا طَالَعَ ابْنُ الجَوْزِيِّ وَهُوَ بَعْدُ فِي الطَّلَبِ؟"),
      back: t("Twenty thousand volumes.", "عِشْرِينَ أَلْفَ مُجَلَّدٍ."),
    },
    {
      kind: "story",
      page: 132,
      front: t("How many teachers is Abū Saʿd as-Samʿānī said to have had?", "كَمْ بَلَغَ عَدَدُ شُيُوخِ أَبِي سَعْدٍ السَّمْعَانِيِّ؟"),
      back: t("Seven thousand. Ibn an-Najjār said: “This is something that nobody else reached.”", "سَبْعَةَ آلَافِ شَيْخٍ؛ قَالَ ابْنُ النَّجَّارِ: «وَهَذَا شَيْءٌ لَمْ يَبْلُغْهُ أَحَدٌ»"),
    },
    verse(
      134,
      t("Time is the most precious of that which you guard;", "وَالوَقْتُ أَنْفَسُ مَا عُنِيتَ بِحِفْظِهِ"),
      t("and I see it as the easiest thing you can lose.", "وَأَرَاهُ أَسْهَلَ مَا عَلَيْكَ يَضِيعُ"),
      t("The minister Ibn Hubayrah.", "الوَزِيرُ ابْنُ هُبَيْرَةَ."),
    ),
    verseReversed(
      134,
      t("Time is the most precious of that which you guard;", "وَالوَقْتُ أَنْفَسُ مَا عُنِيتَ بِحِفْظِهِ"),
      t("and I see it as the easiest thing you can lose.", "وَأَرَاهُ أَسْهَلَ مَا عَلَيْكَ يَضِيعُ"),
      t("The minister Ibn Hubayrah.", "الوَزِيرُ ابْنُ هُبَيْرَةَ."),
    ),
  ],
];

export const TADHIM_AL_ILM: FlashcardBook = {
  slug: "tadhim-al-ilm",
  title: t("Taʿẓīm al-ʿIlm — Revering Knowledge", "تَعْظِيمُ العِلْمِ"),
  shortTitle: "Taʿẓīm al-ʿIlm",
  author: t("Shaykh Ṣāliḥ ibn ʿAbdillāh al-ʿUṣaymī", "الشَّيْخُ صَالِحُ بْنُ عَبْدِ اللهِ العُصَيْمِيُّ"),
  chapters: t("principles", "المَعَاقِدُ"),
  subject: "Manners of seeking knowledge",
  releasedWithClass: true,
  blurb: "Twenty principles (maʿāqid) for revering knowledge — one deck per principle.",
  source: { name: "al-Madrasah ar-Raḥmāniyyah (bilingual edition and English translation)", url: "https://www.rahmaniyyah.com", english: "edition" },
  sections: CARDS.map((cards, i) => ({ number: i + 1, label: ORDINALS[i], title: TITLES[i], pages: PAGES[i], cards })),
};
