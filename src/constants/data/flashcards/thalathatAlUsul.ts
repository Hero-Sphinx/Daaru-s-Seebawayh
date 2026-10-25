import type { BilingualText, Flashcard, FlashcardBook } from "@/types";
import { PIK_EDITION } from "./sources";

/**
 * Thalāthat al-Uṣūl (ثَلَاثَةُ الأُصُولِ) by Shaykh Muḥammad ibn ʿAbd al-Wahhāb.
 * The opening matters get a deck each, and each of the three foundations is
 * split into short decks, so a student practises only what has been covered.
 *
 * Arabic: the Mutūn Ṭālib al-ʿIlm edition as printed, āyāt in its Uthmani
 * script (taken from the Qur'an table). English: our translation — the edition
 * has none. `page` is the edition's printed page number.
 */

const t = (en: string, ar: string): BilingualText => ({ en, ar });

const LABELS: BilingualText[] = [
  t("The Four Matters", "المَسَائِلُ الأَرْبَعُ"),
  t("The Three Matters", "المَسَائِلُ الثَّلَاثُ"),
  t("Al-Ḥanīfiyyah", "الحَنِيفِيَّةُ"),
  t("The First Foundation (1)", "الأَصْلُ الأَوَّلُ (١)"),
  t("The First Foundation (2)", "الأَصْلُ الأَوَّلُ (٢)"),
  t("The Second Foundation (1)", "الأَصْلُ الثَّانِي (١)"),
  t("The Second Foundation (2)", "الأَصْلُ الثَّانِي (٢)"),
  t("The Second Foundation (3)", "الأَصْلُ الثَّانِي (٣)"),
  t("The Third Foundation (1)", "الأَصْلُ الثَّالِثُ (١)"),
  t("The Third Foundation (2)", "الأَصْلُ الثَّالِثُ (٢)"),
  t("The Third Foundation (3)", "الأَصْلُ الثَّالِثُ (٣)"),
  t("The Third Foundation (4)", "الأَصْلُ الثَّالِثُ (٤)"),
];

const TITLES: BilingualText[] = [
  t("Four matters every Muslim must learn", "أَرْبَعُ مَسَائِلَ يَجِبُ تَعَلُّمُهَا"),
  t("Three matters to learn and act upon", "ثَلَاثُ مَسَائِلَ يَجِبُ تَعَلُّمُهَا وَالعَمَلُ بِهِنَّ"),
  t("Al-Ḥanīfiyyah, tawḥīd and shirk — and the three foundations", "الحَنِيفِيَّةُ، وَالتَّوْحِيدُ وَالشِّرْكُ، وَالأُصُولُ الثَّلَاثَةُ"),
  t("Knowing your Lord — by His signs and His creations", "مَعْرِفَةُ الرَّبِّ بِآيَاتِهِ وَمَخْلُوقَاتِهِ"),
  t("The Lord is the One worshipped — the kinds of worship", "الرَّبُّ هُوَ المَعْبُودُ، وَأَنْوَاعُ العِبَادَةِ"),
  t("Knowing the religion — Islam and its five pillars", "مَعْرِفَةُ دِينِ الإِسْلَامِ، وَأَرْكَانُهُ الخَمْسَةُ"),
  t("Īmān and iḥsān", "الإِيمَانُ وَالإِحْسَانُ"),
  t("The ḥadīth of Jibrīl", "حَدِيثُ جِبْرِيلَ"),
  t("Knowing your Prophet ﷺ — his lineage and his call", "مَعْرِفَةُ النَّبِيِّ ﷺ: نَسَبُهُ وَبِعْثَتُهُ"),
  t("The hijrah, the laws of Madinah, and the completed religion", "الهِجْرَةُ، وَشَرَائِعُ المَدِينَةِ، وَكَمَالُ الدِّينِ"),
  t("Death, resurrection and recompense", "المَوْتُ، وَالبَعْثُ، وَالجَزَاءُ"),
  t("The messengers, and disbelieving in the ṭāghūt", "الرُّسُلُ، وَالكُفْرُ بِالطَّاغُوتِ"),
];

/** First and last printed page of each deck. */
const PAGES: [number, number][] = [
  [19, 20],
  [21, 22],
  [23, 24],
  [25, 26],
  [27, 31],
  [32, 35],
  [36, 37],
  [38, 40],
  [41, 42],
  [43, 45],
  [46, 46],
  [47, 49],
];

const opening = (i: number, page: number, front: BilingualText): Flashcard => ({ kind: "principle", page, front, back: TITLES[i] });

const CARDS: Flashcard[][] = [
  // ───────────── 1 · The four matters ─────────────
  [
    opening(0, 19, t("What does the opening of the book teach?", "مَاذَا يُقَرِّرُ أَوَّلُ الكِتَابِ؟")),
    {
      kind: "list",
      page: 19,
      front: t("What four matters must we learn?", "مَا المَسَائِلُ الأَرْبَعُ الَّتِي يَجِبُ عَلَيْنَا تَعَلُّمُهَا؟"),
      back: t(
        "Knowledge; acting upon it; calling to it; and patience with the harm that comes in it.",
        "«الأُولَى: العِلْمُ … الثَّانِيَةُ: العَمَلُ بِهِ. الثَّالِثَةُ: الدَّعْوَةُ إِلَيْهِ. الرَّابِعَةُ: الصَّبْرُ عَلَى الأَذَى فِيهِ»",
      ),
    },
    {
      kind: "term",
      page: 19,
      front: t("What is the knowledge meant in the first matter?", "مَا العِلْمُ المُرَادُ فِي المَسْأَلَةِ الأُولَى؟"),
      back: t(
        "Knowing Allah, knowing His Prophet, and knowing the religion of Islam — with the evidences.",
        "«مَعْرِفَةُ اللَّهِ، وَمَعْرِفَةُ نَبِيِّهِ، وَمَعْرِفَةُ دِينِ الإِسْلَامِ بِالأَدِلَّةِ»",
      ),
    },
    {
      kind: "cloze",
      page: 19,
      front: t("“The second: ______. The third: calling to it.”", "«الثَّانِيَةُ: ______. الثَّالِثَةُ: الدَّعْوَةُ إِلَيْهِ»"),
      back: t("acting upon it", "العَمَلُ بِهِ"),
    },
    {
      kind: "cloze",
      page: 19,
      front: t("“The fourth: ______ upon the harm in it.”", "«الرَّابِعَةُ: ______ عَلَى الأَذَى فِيهِ»"),
      back: t("patience", "الصَّبْرُ"),
    },
    {
      kind: "evidence",
      page: 19,
      front: t("What is the evidence for the four matters?", "مَا الدَّلِيلُ عَلَى المَسَائِلِ الأَرْبَعِ؟"),
      back: t(
        "“By time. Indeed, mankind is in loss — except those who believe, do righteous deeds, urge one another to the truth, and urge one another to patience.” [al-ʿAṣr: 1–3]",
        "﴿وَٱلْعَصْرِ * إِنَّ ٱلْإِنسَٰنَ لَفِى خُسْرٍ * إِلَّا ٱلَّذِينَ ءَامَنُوا۟ وَعَمِلُوا۟ ٱلصَّٰلِحَٰتِ وَتَوَاصَوْا۟ بِٱلْحَقِّ وَتَوَاصَوْا۟ بِٱلصَّبْرِ﴾ [العَصْر: ١–٣]",
      ),
    },
    {
      kind: "quote",
      page: 20,
      front: t("What did ash-Shāfiʿī say about Sūrat al-ʿAṣr?", "مَاذَا قَالَ الشَّافِعِيُّ فِي سُورَةِ العَصْرِ؟"),
      back: t(
        "“Had Allah sent down no proof to His creation except this sūrah, it would have sufficed them.”",
        "«لَوْ مَا أَنْزَلَ اللَّهُ حُجَّةً عَلَى خَلْقِهِ إِلَّا هَذِهِ السُّورَةَ؛ لَكَفَتْهُمْ»",
      ),
    },
    {
      kind: "cloze",
      page: 20,
      front: t("ash-Shāfiʿī: “Had Allah sent down no proof to His creation except this sūrah, ______.”", "قَالَ الشَّافِعِيُّ: «لَوْ مَا أَنْزَلَ اللَّهُ حُجَّةً عَلَى خَلْقِهِ إِلَّا هَذِهِ السُّورَةَ؛ ______»"),
      back: t("it would have sufficed them", "لَكَفَتْهُمْ"),
    },
    {
      kind: "quote",
      page: 20,
      front: t("Which chapter heading of al-Bukhārī does the author quote?", "مَا تَرْجَمَةُ البُخَارِيِّ الَّتِي نَقَلَهَا المُؤَلِّفُ؟"),
      back: t("“Chapter: Knowledge comes before speech and action.”", "«بَابٌ: العِلْمُ قَبْلَ القَوْلِ وَالعَمَلِ»"),
    },
    {
      kind: "evidence",
      page: 20,
      front: t("What evidence did al-Bukhārī give that knowledge comes first?", "بِمَ اسْتَدَلَّ البُخَارِيُّ عَلَى تَقْدِيمِ العِلْمِ؟"),
      back: t("“So know that there is no god but Allah, and ask forgiveness for your sin.” [Muḥammad: 19]", "﴿فَٱعْلَمْ أَنَّهُۥ لَآ إِلَٰهَ إِلَّا ٱللَّهُ وَٱسْتَغْفِرْ لِذَنۢبِكَ﴾ [مُحَمَّد: ١٩]"),
      note: t("“So He began with knowledge” — before speech and action.", "«فَبَدَأَ بِالعِلْمِ» قَبْلَ القَوْلِ وَالعَمَلِ."),
    },
  ],

  // ───────────── 2 · The three matters ─────────────
  [
    opening(1, 21, t("What does this section teach?", "مَاذَا يُقَرِّرُ هَذَا الفَصْلُ؟")),
    {
      kind: "point",
      page: 21,
      front: t("Upon whom is it obligatory to learn these three matters?", "عَلَى مَنْ يَجِبُ تَعَلُّمُ هَذِهِ المَسَائِلِ الثَّلَاثِ؟"),
      back: t("Upon every Muslim man and woman — to learn them and to act upon them.", "«عَلَى كُلِّ مُسْلِمٍ وَمُسْلِمَةٍ تَعَلُّمُ ثَلَاثِ هَذِهِ المَسَائِلِ، وَالعَمَلُ بِهِنَّ»"),
    },
    {
      kind: "point",
      page: 21,
      front: t("What is the first of the three matters?", "مَا المَسْأَلَةُ الأُولَى مِنَ المَسَائِلِ الثَّلَاثِ؟"),
      back: t(
        "That Allah created us and provided for us, and did not leave us neglected; rather He sent us a messenger — whoever obeys him enters Paradise, and whoever disobeys him enters the Fire.",
        "«أَنَّ اللَّهَ خَلَقَنَا، وَرَزَقَنَا، وَلَمْ يَتْرُكْنَا هَمَلًا؛ بَلْ أَرْسَلَ إِلَيْنَا رَسُولًا، فَمَنْ أَطَاعَهُ دَخَلَ الجَنَّةَ، وَمَنْ عَصَاهُ دَخَلَ النَّارَ»",
      ),
    },
    {
      kind: "cloze",
      page: 21,
      front: t("“…and He did not leave us ______; rather He sent to us a messenger.”", "«وَلَمْ يَتْرُكْنَا ______؛ بَلْ أَرْسَلَ إِلَيْنَا رَسُولًا»"),
      back: t("neglected (without purpose)", "هَمَلًا"),
    },
    {
      kind: "evidence",
      page: 21,
      front: t("What is the evidence for the first matter?", "مَا دَلِيلُ المَسْأَلَةِ الأُولَى؟"),
      back: t(
        "“Indeed, We have sent to you a messenger as a witness over you, just as We sent to Pharaoh a messenger. But Pharaoh disobeyed the messenger, so We seized him with a ruinous seizure.” [al-Muzzammil: 15–16]",
        "﴿إِنَّآ أَرْسَلْنَآ إِلَيْكُمْ رَسُولًا شَٰهِدًا عَلَيْكُمْ كَمَآ أَرْسَلْنَآ إِلَىٰ فِرْعَوْنَ رَسُولًا * فَعَصَىٰ فِرْعَوْنُ ٱلرَّسُولَ فَأَخَذْنَٰهُ أَخْذًا وَبِيلًا﴾ [المُزَّمِّل: ١٥–١٦]",
      ),
    },
    {
      kind: "point",
      page: 21,
      front: t("What is the second of the three matters?", "مَا المَسْأَلَةُ الثَّانِيَةُ مِنَ المَسَائِلِ الثَّلَاثِ؟"),
      back: t(
        "That Allah is not pleased for anyone to be associated with Him in His worship — not a near angel, nor a prophet sent.",
        "«أَنَّ اللَّهَ لَا يَرْضَى أَنْ يُشْرَكَ مَعَهُ أَحَدٌ فِي عِبَادَتِهِ، لَا مَلَكٌ مُقَرَّبٌ، وَلَا نَبِيٌّ مُرْسَلٌ»",
      ),
    },
    {
      kind: "evidence",
      page: 22,
      front: t("What is the evidence for the second matter?", "مَا دَلِيلُ المَسْأَلَةِ الثَّانِيَةِ؟"),
      back: t("“And the mosques are for Allah, so do not call upon anyone along with Allah.” [al-Jinn: 18]", "﴿وَأَنَّ ٱلْمَسَٰجِدَ لِلَّهِ فَلَا تَدْعُوا۟ مَعَ ٱللَّهِ أَحَدًا﴾ [الجِنّ: ١٨]"),
    },
    {
      kind: "point",
      page: 22,
      front: t("What is the third of the three matters?", "مَا المَسْأَلَةُ الثَّالِثَةُ مِنَ المَسَائِلِ الثَّلَاثِ؟"),
      back: t(
        "That whoever obeys the Messenger and singles Allah out may not ally with those who oppose Allah and His Messenger, even if they are the closest of relatives.",
        "«أَنَّ مَنْ أَطَاعَ الرَّسُولَ وَوَحَّدَ اللَّهَ لَا يَجُوزُ لَهُ مُوَالَاةُ مَنْ حَادَّ اللَّهَ وَرَسُولَهُ، وَلَوْ كَانَ أَقْرَبَ قَرِيبٍ»",
      ),
    },
    {
      kind: "cloze",
      page: 22,
      front: t("“…may not ally with those who oppose Allah and His Messenger, even if they are ______.”", "«لَا يَجُوزُ لَهُ مُوَالَاةُ مَنْ حَادَّ اللَّهَ وَرَسُولَهُ، وَلَوْ كَانَ ______»"),
      back: t("the closest of relatives", "أَقْرَبَ قَرِيبٍ"),
    },
    {
      kind: "evidence",
      page: 22,
      front: t("What is the evidence for the third matter?", "مَا دَلِيلُ المَسْأَلَةِ الثَّالِثَةِ؟"),
      back: t(
        "“You will not find a people who believe in Allah and the Last Day having affection for those who oppose Allah and His Messenger, even if they were their fathers, their sons, their brothers or their kindred.” [al-Mujādilah: 22]",
        "﴿لَّا تَجِدُ قَوْمًا يُؤْمِنُونَ بِٱللَّهِ وَٱلْيَوْمِ ٱلْءَاخِرِ يُوَآدُّونَ مَنْ حَآدَّ ٱللَّهَ وَرَسُولَهُۥ وَلَوْ كَانُوٓا۟ ءَابَآءَهُمْ أَوْ أَبْنَآءَهُمْ أَوْ إِخْوَٰنَهُمْ أَوْ عَشِيرَتَهُمْ﴾ [المُجَادَلَة: ٢٢]",
      ),
      note: t("The author quotes the whole āyah.", "سَاقَ المُؤَلِّفُ الآيَةَ كَامِلَةً."),
    },
  ],

  // ───────────── 3 · Al-ḥanīfiyyah ─────────────
  [
    opening(2, 23, t("What does the section on al-ḥanīfiyyah teach?", "مَاذَا يُقَرِّرُ فَصْلُ الحَنِيفِيَّةِ؟")),
    {
      kind: "term",
      page: 23,
      front: t("What is al-ḥanīfiyyah, the religion of Ibrāhīm?", "مَا الحَنِيفِيَّةُ مِلَّةُ إِبْرَاهِيمَ؟"),
      back: t("That you worship Allah alone, making the religion sincerely His.", "«أَنْ تَعْبُدَ اللَّهَ وَحْدَهُ مُخْلِصًا لَهُ الدِّينَ»"),
    },
    {
      kind: "point",
      page: 23,
      front: t("What did Allah command all people with, and create them for?", "بِمَ أَمَرَ اللَّهُ جَمِيعَ النَّاسِ، وَلِمَ خَلَقَهُمْ؟"),
      back: t("Al-ḥanīfiyyah: He commanded all people with it and created them for it.", "بِالحَنِيفِيَّةِ: «وَبِذَلِكَ أَمَرَ اللَّهُ جَمِيعَ النَّاسِ وَخَلَقَهُمْ لَهَا»"),
    },
    {
      kind: "evidence",
      page: 23,
      front: t("Which āyah shows that Allah created people to worship Him?", "مَا الآيَةُ الدَّالَّةُ عَلَى أَنَّ اللَّهَ خَلَقَ الخَلْقَ لِعِبَادَتِهِ؟"),
      back: t(
        "“And I did not create the jinn and mankind except to worship Me.” [adh-Dhāriyāt: 56]",
        "﴿وَمَا خَلَقْتُ ٱلْجِنَّ وَٱلْإِنسَ إِلَّا لِيَعْبُدُونِ﴾ [الذَّارِيَات: ٥٦]",
      ),
    },
    {
      kind: "term",
      page: 23,
      front: t("In that āyah, what does “to worship Me” mean?", "مَا مَعْنَى ﴿لِيَعْبُدُونِ﴾ فِي هَذِهِ الآيَةِ؟"),
      back: t("To single Me out (in worship).", "«وَمَعْنَى ﴿يَعْبُدُونِ﴾: يُوَحِّدُونِ»"),
    },
    {
      kind: "term",
      page: 23,
      front: t("What is the greatest thing Allah commanded — and what is it?", "مَا أَعْظَمُ مَا أَمَرَ اللَّهُ بِهِ؟ وَمَا هُوَ؟"),
      back: t("Tawḥīd: singling Allah out with worship.", "«التَّوْحِيدُ، وَهُوَ: إِفْرَادُ اللَّهِ بِالعِبَادَةِ»"),
    },
    {
      kind: "cloze",
      page: 23,
      front: t("“Tawḥīd is ______ Allah with worship.”", "«التَّوْحِيدُ: ______ اللَّهِ بِالعِبَادَةِ»"),
      back: t("singling out", "إِفْرَادُ"),
    },
    {
      kind: "term",
      page: 23,
      front: t("What is the greatest thing Allah forbade — and what is it?", "مَا أَعْظَمُ مَا نَهَى اللَّهُ عَنْهُ؟ وَمَا هُوَ؟"),
      back: t("Shirk: calling upon another along with Him.", "«الشِّرْكُ، وَهُوَ: دَعْوَةُ غَيْرِهِ مَعَهُ»"),
    },
    {
      kind: "evidence",
      page: 23,
      front: t("What is the evidence for commanding tawḥīd and forbidding shirk?", "مَا الدَّلِيلُ عَلَى الأَمْرِ بِالتَّوْحِيدِ وَالنَّهْيِ عَنِ الشِّرْكِ؟"),
      back: t("“And worship Allah and do not associate anything with Him.” [an-Nisāʾ: 36]", "﴿وَٱعْبُدُوا۟ ٱللَّهَ وَلَا تُشْرِكُوا۟ بِهِۦ شَيْـًٔا﴾ [النِّسَاء: ٣٦]"),
    },
    {
      kind: "list",
      page: 24,
      front: t("If you are asked: what are the three foundations a person must know?", "فَإِذَا قِيلَ لَكَ: مَا الأُصُولُ الثَّلَاثَةُ الَّتِي يَجِبُ عَلَى الإِنْسَانِ مَعْرِفَتُهَا؟"),
      back: t("That the servant knows his Lord, his religion, and his Prophet Muḥammad ﷺ.", "«فَقُلْ: مَعْرِفَةُ العَبْدِ رَبَّهُ، وَدِينَهُ، وَنَبِيَّهُ مُحَمَّدًا ﷺ»"),
    },
  ],

  // ───────────── 4 · The first foundation: knowing your Lord ─────────────
  [
    opening(3, 25, t("What is the first foundation about (part 1)?", "عَلَامَ يَدُورُ الأَصْلُ الأَوَّلُ فِي أَوَّلِهِ؟")),
    {
      kind: "point",
      page: 25,
      front: t("If you are asked: who is your Lord?", "فَإِذَا قِيلَ لَكَ: مَنْ رَبُّكَ؟"),
      back: t(
        "My Lord is Allah, who nurtured me and nurtured all the worlds with His blessings. He is the One I worship; I have none worthy of worship besides Him.",
        "«فَقُلْ: رَبِّيَ اللَّهُ الَّذِي رَبَّانِي، وَرَبَّى جَمِيعَ العَالَمِينَ بِنِعَمِهِ، وَهُوَ مَعْبُودِي لَيْسَ لِي مَعْبُودٌ سِوَاهُ»",
      ),
    },
    {
      kind: "evidence",
      page: 25,
      front: t("What is the evidence that Allah is the Lord of the worlds?", "مَا الدَّلِيلُ عَلَى أَنَّ اللَّهَ رَبُّ العَالَمِينَ؟"),
      back: t("“All praise is for Allah, Lord of the worlds.” [al-Fātiḥah: 2]", "﴿ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ﴾ [الفَاتِحَة: ٢]"),
    },
    {
      kind: "term",
      page: 25,
      front: t("What is a ‘world’ (ʿālam)?", "مَا العَالَمُ؟"),
      back: t("Everything besides Allah is a world — and I am one of that world.", "«وَكُلُّ مَا سِوَى اللَّهِ عَالَمٌ، وَأَنَا وَاحِدٌ مِنْ ذَلِكَ العَالَمِ»"),
    },
    {
      kind: "point",
      page: 25,
      front: t("If you are asked: by what did you know your Lord?", "فَإِذَا قِيلَ لَكَ: بِمَ عَرَفْتَ رَبَّكَ؟"),
      back: t("By His signs and His creations.", "«فَقُلْ: بِآيَاتِهِ وَمَخْلُوقَاتِهِ»"),
    },
    {
      kind: "list",
      page: 25,
      front: t("Which four of His signs does the author name?", "مَا الآيَاتُ الأَرْبَعُ الَّتِي ذَكَرَهَا المُؤَلِّفُ؟"),
      back: t("The night, the day, the sun and the moon.", "«وَمِنْ آيَاتِهِ: اللَّيْلُ، وَالنَّهَارُ، وَالشَّمْسُ، وَالقَمَرُ»"),
    },
    {
      kind: "list",
      page: 26,
      front: t("Which of His creations does the author name?", "مَا المَخْلُوقَاتُ الَّتِي ذَكَرَهَا المُؤَلِّفُ؟"),
      back: t(
        "The seven heavens and whoever is in them, the seven earths and whoever is in them, and what is between them.",
        "«وَمِنْ مَخْلُوقَاتِهِ: السَّمَوَاتُ السَّبْعُ وَمَنْ فِيهِنَّ، وَالأَرَضُونَ السَّبْعُ وَمَنْ فِيهِنَّ، وَمَا بَيْنَهُمَا»",
      ),
    },
    {
      kind: "evidence",
      page: 26,
      front: t("What is the evidence for His signs?", "مَا الدَّلِيلُ عَلَى آيَاتِهِ؟"),
      back: t(
        "“And of His signs are the night and the day, and the sun and the moon. Do not prostrate to the sun nor to the moon, but prostrate to Allah who created them, if it is Him you worship.” [Fuṣṣilat: 37]",
        "﴿وَمِنْ ءَايَٰتِهِ ٱلَّيْلُ وَٱلنَّهَارُ وَٱلشَّمْسُ وَٱلْقَمَرُ لَا تَسْجُدُوا۟ لِلشَّمْسِ وَلَا لِلْقَمَرِ وَٱسْجُدُوا۟ لِلَّهِ ٱلَّذِى خَلَقَهُنَّ إِن كُنتُمْ إِيَّاهُ تَعْبُدُونَ﴾ [فُصِّلَت: ٣٧]",
      ),
    },
    {
      kind: "evidence",
      page: 26,
      front: t("What is the evidence for His creations?", "مَا الدَّلِيلُ عَلَى مَخْلُوقَاتِهِ؟"),
      back: t(
        "“Indeed, your Lord is Allah, who created the heavens and the earth in six days, then rose over the Throne. He covers the night with the day, which pursues it swiftly; and the sun, the moon and the stars, subjected by His command. Unquestionably, His are the creation and the command. Blessed is Allah, Lord of the worlds.” [al-Aʿrāf: 54]",
        "﴿إِنَّ رَبَّكُمُ ٱللَّهُ ٱلَّذِى خَلَقَ ٱلسَّمَٰوَٰتِ وَٱلْأَرْضَ فِى سِتَّةِ أَيَّامٍ ثُمَّ ٱسْتَوَىٰ عَلَى ٱلْعَرْشِ يُغْشِى ٱلَّيْلَ ٱلنَّهَارَ يَطْلُبُهُۥ حَثِيثًا وَٱلشَّمْسَ وَٱلْقَمَرَ وَٱلنُّجُومَ مُسَخَّرَٰتٍۭ بِأَمْرِهِۦٓ أَلَا لَهُ ٱلْخَلْقُ وَٱلْأَمْرُ تَبَارَكَ ٱللَّهُ رَبُّ ٱلْعَٰلَمِينَ﴾ [الأَعْرَاف: ٥٤]",
      ),
    },
  ],

  // ───────────── 5 · The Lord is the One worshipped; the kinds of worship ─────────────
  [
    opening(4, 27, t("What is the first foundation about (part 2)?", "عَلَامَ يَدُورُ الأَصْلُ الأَوَّلُ فِي تَتِمَّتِهِ؟")),
    {
      kind: "point",
      page: 27,
      front: t("Who is the Lord (ar-Rabb)?", "مَنِ الرَّبُّ؟"),
      back: t("The Lord is the One worshipped.", "«وَالرَّبُّ هُوَ المَعْبُودُ»"),
    },
    {
      kind: "evidence",
      page: 27,
      front: t("What is the evidence that the Lord is the One worshipped?", "مَا الدَّلِيلُ عَلَى أَنَّ الرَّبَّ هُوَ المَعْبُودُ؟"),
      back: t(
        "“O mankind, worship your Lord who created you and those before you, that you may become righteous — the One who made the earth a bed for you and the sky a ceiling, and sent down rain from the sky and brought forth by it fruits as provision for you. So do not set up rivals to Allah while you know.” [al-Baqarah: 21–22]",
        "﴿يَٰٓأَيُّهَا ٱلنَّاسُ ٱعْبُدُوا۟ رَبَّكُمُ ٱلَّذِى خَلَقَكُمْ وَٱلَّذِينَ مِن قَبْلِكُمْ لَعَلَّكُمْ تَتَّقُونَ * ٱلَّذِى جَعَلَ لَكُمُ ٱلْأَرْضَ فِرَٰشًا وَٱلسَّمَآءَ بِنَآءً وَأَنزَلَ مِنَ ٱلسَّمَآءِ مَآءً فَأَخْرَجَ بِهِۦ مِنَ ٱلثَّمَرَٰتِ رِزْقًا لَّكُمْ فَلَا تَجْعَلُوا۟ لِلَّهِ أَندَادًا وَأَنتُمْ تَعْلَمُونَ﴾ [البَقَرَة: ٢١–٢٢]",
      ),
    },
    {
      kind: "quote",
      page: 27,
      front: t("What did Ibn Kathīr say on these āyāt?", "مَاذَا قَالَ ابْنُ كَثِيرٍ فِي هَاتَيْنِ الآيَتَيْنِ؟"),
      back: t("“The Creator of these things is the One who deserves worship.”", "«الخَالِقُ لِهَذِهِ الأَشْيَاءِ هُوَ المُسْتَحِقُّ لِلْعِبَادَةِ»"),
    },
    {
      kind: "list",
      page: 27,
      front: t("Which kinds of worship that Allah commanded does the author list?", "مَا أَنْوَاعُ العِبَادَةِ الَّتِي أَمَرَ اللَّهُ بِهَا مِمَّا ذَكَرَهُ المُؤَلِّفُ؟"),
      back: t(
        "Islam, īmān and iḥsān; and among them: supplication, fear, hope, reliance, desire, dread, humility, awe, turning in repentance, seeking help, seeking refuge, seeking rescue, sacrifice and vows — and other kinds besides.",
        "«مِثْلُ: الإِسْلَامِ، وَالإِيمَانِ، وَالإِحْسَانِ؛ وَمِنْهَا: الدُّعَاءُ، وَالخَوْفُ، وَالرَّجَاءُ، وَالتَّوَكُّلُ، وَالرَّغْبَةُ، وَالرَّهْبَةُ، وَالخُشُوعُ، وَالخَشْيَةُ، وَالإِنَابَةُ، وَالاسْتِعَانَةُ، وَالاسْتِعَاذَةُ، وَالاسْتِغَاثَةُ، وَالذَّبْحُ، وَالنَّذْرُ، وَغَيْرُ ذَلِكَ»",
      ),
    },
    {
      kind: "point",
      page: 28,
      front: t("To whom do all these kinds of worship belong?", "لِمَنْ تَكُونُ هَذِهِ الأَنْوَاعُ مِنَ العِبَادَةِ؟"),
      back: t("All of them are for Allah, the Exalted.", "«كُلُّهَا لِلَّهِ تَعَالَى»"),
      note: t("Evidence: “And the mosques are for Allah, so do not call upon anyone along with Allah.” [al-Jinn: 18]", "وَالدَّلِيلُ: ﴿وَأَنَّ ٱلْمَسَٰجِدَ لِلَّهِ فَلَا تَدْعُوا۟ مَعَ ٱللَّهِ أَحَدًا﴾ [الجِنّ: ١٨]"),
    },
    {
      kind: "point",
      page: 28,
      front: t("What is the ruling on one who directs any of them to other than Allah?", "مَا حُكْمُ مَنْ صَرَفَ مِنْهَا شَيْئًا لِغَيْرِ اللَّهِ؟"),
      back: t("He is an idolater and a disbeliever.", "«فَهُوَ مُشْرِكٌ كَافِرٌ»"),
    },
    {
      kind: "evidence",
      page: 28,
      front: t("What is the evidence that directing worship to other than Allah is disbelief?", "مَا الدَّلِيلُ عَلَى كُفْرِ مَنْ صَرَفَ العِبَادَةَ لِغَيْرِ اللَّهِ؟"),
      back: t(
        "“And whoever calls upon another god along with Allah, for which he has no proof — his account is only with his Lord. Indeed, the disbelievers will not succeed.” [al-Muʾminūn: 117]",
        "﴿وَمَن يَدْعُ مَعَ ٱللَّهِ إِلَٰهًا ءَاخَرَ لَا بُرْهَٰنَ لَهُۥ بِهِۦ فَإِنَّمَا حِسَابُهُۥ عِندَ رَبِّهِۦٓ إِنَّهُۥ لَا يُفْلِحُ ٱلْكَٰفِرُونَ﴾ [المُؤْمِنُون: ١١٧]",
      ),
    },
    {
      kind: "hadith",
      page: 28,
      front: t("Which ḥadīth does the author quote about supplication?", "مَا الحَدِيثُ الَّذِي أَوْرَدَهُ المُؤَلِّفُ فِي الدُّعَاءِ؟"),
      back: t("“Supplication is the core of worship.”", "«الدُّعَاءُ مُخُّ العِبَادَةِ»"),
    },
    {
      kind: "evidence",
      page: 28,
      front: t("What is the evidence for supplication (duʿāʾ)?", "مَا دَلِيلُ الدُّعَاءِ؟"),
      back: t(
        "“And your Lord said: Call upon Me; I will respond to you. Indeed, those who are too proud to worship Me will enter Hell humiliated.” [Ghāfir: 60]",
        "﴿وَقَالَ رَبُّكُمُ ٱدْعُونِىٓ أَسْتَجِبْ لَكُمْ إِنَّ ٱلَّذِينَ يَسْتَكْبِرُونَ عَنْ عِبَادَتِى سَيَدْخُلُونَ جَهَنَّمَ دَاخِرِينَ﴾ [غَافِر: ٦٠]",
      ),
    },
    {
      kind: "evidence",
      page: 29,
      front: t("What is the evidence for fear (khawf)?", "مَا دَلِيلُ الخَوْفِ؟"),
      back: t("“So do not fear them, but fear Me, if you are believers.” [Āl ʿImrān: 175]", "﴿فَلَا تَخَافُوهُمْ وَخَافُونِ إِن كُنتُم مُّؤْمِنِينَ﴾ [آلِ عِمْرَان: ١٧٥]"),
    },
    {
      kind: "evidence",
      page: 29,
      front: t("What is the evidence for hope (rajāʾ)?", "مَا دَلِيلُ الرَّجَاءِ؟"),
      back: t(
        "“So whoever hopes to meet his Lord, let him do righteous deeds and not associate anyone in the worship of his Lord.” [al-Kahf: 110]",
        "﴿فَمَن كَانَ يَرْجُوا۟ لِقَآءَ رَبِّهِۦ فَلْيَعْمَلْ عَمَلًا صَٰلِحًا وَلَا يُشْرِكْ بِعِبَادَةِ رَبِّهِۦٓ أَحَدًۢا﴾ [الكَهْف: ١١٠]",
      ),
    },
    {
      kind: "evidence",
      page: 29,
      front: t("What is the evidence for reliance (tawakkul)?", "مَا دَلِيلُ التَّوَكُّلِ؟"),
      back: t(
        "“And upon Allah rely, if you are believers.” [al-Māʾidah: 23] — and: “And whoever relies upon Allah, He is sufficient for him.” [aṭ-Ṭalāq: 3]",
        "﴿وَعَلَى ٱللَّهِ فَتَوَكَّلُوٓا۟ إِن كُنتُم مُّؤْمِنِينَ﴾ [المَائِدَة: ٢٣]، وَقَوْلُهُ: ﴿وَمَن يَتَوَكَّلْ عَلَى ٱللَّهِ فَهُوَ حَسْبُهُۥٓ﴾ [الطَّلَاق: ٣]",
      ),
    },
    {
      kind: "evidence",
      page: 29,
      front: t("What is the evidence for desire, dread and humility (raghbah, rahbah, khushūʿ)?", "مَا دَلِيلُ الرَّغْبَةِ، وَالرَّهْبَةِ، وَالخُشُوعِ؟"),
      back: t(
        "“Indeed, they used to hasten to good deeds and call upon Us in desire and in dread, and they were humble before Us.” [al-Anbiyāʾ: 90]",
        "﴿إِنَّهُمْ كَانُوا۟ يُسَٰرِعُونَ فِى ٱلْخَيْرَٰتِ وَيَدْعُونَنَا رَغَبًا وَرَهَبًا وَكَانُوا۟ لَنَا خَٰشِعِينَ﴾ [الأَنْبِيَاء: ٩٠]",
      ),
    },
    {
      kind: "evidence",
      page: 29,
      front: t("Which three kinds of worship are proven by “…and call upon Us in desire and in dread, and they were humble before Us”?", "أَيُّ أَنْوَاعِ العِبَادَةِ يَدُلُّ عَلَيْهَا قَوْلُهُ: ﴿وَيَدْعُونَنَا رَغَبًا وَرَهَبًا وَكَانُوا۟ لَنَا خَٰشِعِينَ﴾؟"),
      back: t("Desire, dread and humility.", "الرَّغْبَةُ، وَالرَّهْبَةُ، وَالخُشُوعُ."),
    },
    {
      kind: "evidence",
      page: 30,
      front: t("What is the evidence for awe (khashyah)?", "مَا دَلِيلُ الخَشْيَةِ؟"),
      back: t("“So do not fear them, but fear Me.” [al-Baqarah: 150]", "﴿فَلَا تَخْشَوْهُمْ وَٱخْشَوْنِى﴾ [البَقَرَة: ١٥٠]"),
    },
    {
      kind: "evidence",
      page: 30,
      front: t("What is the evidence for turning in repentance (inābah)?", "مَا دَلِيلُ الإِنَابَةِ؟"),
      back: t("“And turn back to your Lord and submit to Him.” [az-Zumar: 54]", "﴿وَأَنِيبُوٓا۟ إِلَىٰ رَبِّكُمْ وَأَسْلِمُوا۟ لَهُۥ﴾ [الزُّمَر: ٥٤]"),
    },
    {
      kind: "evidence",
      page: 30,
      front: t("What is the evidence for seeking help (istiʿānah)?", "مَا دَلِيلُ الاسْتِعَانَةِ؟"),
      back: t(
        "“You alone we worship, and You alone we ask for help.” [al-Fātiḥah: 5] — and in the ḥadīth: “When you seek help, seek help from Allah.”",
        "﴿إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ﴾ [الفَاتِحَة: ٥]، وَفِي الحَدِيثِ: «إِذَا اسْتَعَنْتَ فَاسْتَعِنْ بِاللَّهِ»",
      ),
    },
    {
      kind: "evidence",
      page: 30,
      front: t("What is the evidence for seeking refuge (istiʿādhah)?", "مَا دَلِيلُ الاسْتِعَاذَةِ؟"),
      back: t("“Say: I seek refuge in the Lord of the daybreak” and “Say: I seek refuge in the Lord of mankind.”", "﴿قُلْ أَعُوذُ بِرَبِّ ٱلْفَلَقِ﴾، وَ﴿قُلْ أَعُوذُ بِرَبِّ ٱلنَّاسِ﴾"),
    },
    {
      kind: "evidence",
      page: 30,
      front: t("What is the evidence for seeking rescue (istighāthah)?", "مَا دَلِيلُ الاسْتِغَاثَةِ؟"),
      back: t("“When you sought rescue from your Lord, and He answered you.” [al-Anfāl: 9]", "﴿إِذْ تَسْتَغِيثُونَ رَبَّكُمْ فَٱسْتَجَابَ لَكُمْ﴾ [الأَنْفَال: ٩]"),
    },
    {
      kind: "evidence",
      page: 30,
      front: t("What is the evidence for sacrifice (dhabḥ)?", "مَا دَلِيلُ الذَّبْحِ؟"),
      back: t(
        "“Say: Indeed, my prayer, my sacrifice, my living and my dying are for Allah, Lord of the worlds. He has no partner.” [al-Anʿām: 162–163] — and from the Sunnah: “Allah has cursed whoever sacrifices for other than Allah.”",
        "﴿قُلْ إِنَّ صَلَاتِى وَنُسُكِى وَمَحْيَاىَ وَمَمَاتِى لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ * لَا شَرِيكَ لَهُۥ﴾ [الأَنْعَام: ١٦٢–١٦٣]، وَمِنَ السُّنَّةِ: «لَعَنَ اللَّهُ مَنْ ذَبَحَ لِغَيْرِ اللَّهِ»",
      ),
    },
    {
      kind: "evidence",
      page: 31,
      front: t("What is the evidence for vows (nadhr)?", "مَا دَلِيلُ النَّذْرِ؟"),
      back: t("“They fulfil their vows and fear a Day whose evil will be widespread.” [al-Insān: 7]", "﴿يُوفُونَ بِٱلنَّذْرِ وَيَخَافُونَ يَوْمًا كَانَ شَرُّهُۥ مُسْتَطِيرًا﴾ [الإِنْسَان: ٧]"),
    },
    {
      kind: "evidence",
      page: 30,
      front: t("Which kind of worship does “You alone we worship, and You alone we ask for help” prove?", "أَيُّ نَوْعٍ مِنَ العِبَادَةِ يَدُلُّ عَلَيْهِ قَوْلُهُ: ﴿وَإِيَّاكَ نَسْتَعِينُ﴾؟"),
      back: t("Seeking help (al-istiʿānah).", "الاسْتِعَانَةُ."),
    },
  ],

  // ───────────── 6 · The second foundation: Islam and its pillars ─────────────
  [
    opening(5, 32, t("What is the second foundation about (part 1)?", "عَلَامَ يَدُورُ الأَصْلُ الثَّانِي فِي أَوَّلِهِ؟")),
    {
      kind: "term",
      page: 32,
      front: t("What is the second foundation?", "مَا الأَصْلُ الثَّانِي؟"),
      back: t("Knowing the religion of Islam, with the evidences.", "«مَعْرِفَةُ دِينِ الإِسْلَامِ بِالأَدِلَّةِ»"),
    },
    {
      kind: "term",
      page: 32,
      front: t("What is Islam?", "مَا الإِسْلَامُ؟"),
      back: t(
        "Submitting to Allah with tawḥīd, yielding to Him with obedience, and freeing oneself from shirk and its people.",
        "«الاسْتِسْلَامُ لِلَّهِ بِالتَّوْحِيدِ، وَالانْقِيَادُ لَهُ بِالطَّاعَةِ، وَالبَرَاءَةُ مِنَ الشِّرْكِ وَأَهْلِهِ»",
      ),
    },
    {
      kind: "list",
      page: 32,
      front: t("What are the three levels of the religion?", "مَا مَرَاتِبُ الدِّينِ الثَّلَاثُ؟"),
      back: t("Islam, īmān and iḥsān — and each level has pillars.", "«الإِسْلَامُ، وَالإِيمَانُ، وَالإِحْسَانُ. وَكُلُّ مَرْتَبَةٍ لَهَا أَرْكَانٌ»"),
    },
    {
      kind: "list",
      page: 33,
      front: t("What are the five pillars of Islam?", "مَا أَرْكَانُ الإِسْلَامِ الخَمْسَةُ؟"),
      back: t(
        "Testifying that there is no god but Allah and that Muḥammad is the Messenger of Allah; establishing the prayer; giving zakāh; fasting Ramaḍān; and pilgrimage to the Sacred House of Allah.",
        "«شَهَادَةُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَأَنَّ مُحَمَّدًا رَسُولُ اللَّهِ، وَإِقَامُ الصَّلَاةِ، وَإِيتَاءُ الزَّكَاةِ، وَصَوْمُ رَمَضَانَ، وَحَجُّ بَيْتِ اللَّهِ الحَرَامِ»",
      ),
    },
    {
      kind: "evidence",
      page: 33,
      front: t("What is the evidence for the testimony (shahādah)?", "مَا دَلِيلُ الشَّهَادَةِ؟"),
      back: t(
        "“Allah bears witness that there is no god but Him, and so do the angels and those of knowledge, maintaining justice. There is no god but Him, the Almighty, the Wise.” [Āl ʿImrān: 18]",
        "﴿شَهِدَ ٱللَّهُ أَنَّهُۥ لَآ إِلَٰهَ إِلَّا هُوَ وَٱلْمَلَٰٓئِكَةُ وَأُو۟لُوا۟ ٱلْعِلْمِ قَآئِمًۢا بِٱلْقِسْطِ لَآ إِلَٰهَ إِلَّا هُوَ ٱلْعَزِيزُ ٱلْحَكِيمُ﴾ [آلِ عِمْرَان: ١٨]",
      ),
    },
    {
      kind: "term",
      page: 33,
      front: t("What does lā ilāha illā Allāh mean?", "مَا مَعْنَى «لَا إِلَهَ إِلَّا اللَّهُ»؟"),
      back: t("There is none worshipped in truth except Allah.", "«لَا مَعْبُودَ بِحَقٍّ إِلَّا اللَّهُ»"),
    },
    {
      kind: "point",
      page: 33,
      front: t("What does “lā ilāha” do, and what does “illā Allāh” do?", "مَا عَمَلُ «لَا إِلَهَ»، وَمَا عَمَلُ «إِلَّا اللَّهُ»؟"),
      back: t(
        "“Lā ilāha” negates everything worshipped besides Allah; “illā Allāh” affirms worship for Allah alone.",
        "«لَا إِلَهَ»: نَافِيًا جَمِيعَ مَا يُعْبَدُ مِنْ دُونِ اللَّهِ. «إِلَّا اللَّهُ»: مُثْبِتًا العِبَادَةَ لِلَّهِ وَحْدَهُ.",
      ),
    },
    {
      kind: "example",
      page: 33,
      front: t("He has no partner in His worship — just as what?", "لَا شَرِيكَ لَهُ فِي عِبَادَتِهِ؛ كَمَا أَنَّهُ …؟"),
      back: t("Just as He has no partner in His dominion.", "«كَمَا أَنَّهُ لَيْسَ لَهُ شَرِيكٌ فِي مُلْكِهِ»"),
    },
    {
      kind: "evidence",
      page: 34,
      front: t("Which āyah explains the testimony and makes it clear?", "مَا تَفْسِيرُ الشَّهَادَةِ الَّذِي يُوَضِّحُهَا؟"),
      back: t(
        "“And when Ibrāhīm said to his father and his people: Indeed, I am free of what you worship — except the One who created me.” [az-Zukhruf: 26–27]",
        "﴿وَإِذْ قَالَ إِبْرَٰهِيمُ لِأَبِيهِ وَقَوْمِهِۦٓ إِنَّنِى بَرَآءٌ مِّمَّا تَعْبُدُونَ * إِلَّا ٱلَّذِى فَطَرَنِى﴾ [الزُّخْرُف: ٢٦–٢٧]",
      ),
    },
    {
      kind: "evidence",
      page: 34,
      front: t("Which āyah addressed to the People of the Book also explains it?", "مَا الآيَةُ المُوَجَّهَةُ إِلَى أَهْلِ الكِتَابِ الَّتِي تُفَسِّرُهَا أَيْضًا؟"),
      back: t(
        "“Say: O People of the Book, come to a word equitable between us and you — that we worship none but Allah and associate nothing with Him, and that none of us takes others as lords besides Allah. But if they turn away, say: Bear witness that we are Muslims.” [Āl ʿImrān: 64]",
        "﴿قُلْ يَٰٓأَهْلَ ٱلْكِتَٰبِ تَعَالَوْا۟ إِلَىٰ كَلِمَةٍ سَوَآءٍۭ بَيْنَنَا وَبَيْنَكُمْ أَلَّا نَعْبُدَ إِلَّا ٱللَّهَ وَلَا نُشْرِكَ بِهِۦ شَيْـًٔا وَلَا يَتَّخِذَ بَعْضُنَا بَعْضًا أَرْبَابًا مِّن دُونِ ٱللَّهِ فَإِن تَوَلَّوْا۟ فَقُولُوا۟ ٱشْهَدُوا۟ بِأَنَّا مُسْلِمُونَ﴾ [آلِ عِمْرَان: ٦٤]",
      ),
    },
    {
      kind: "evidence",
      page: 34,
      front: t("What is the evidence for testifying that Muḥammad is the Messenger of Allah?", "مَا دَلِيلُ شَهَادَةِ أَنَّ مُحَمَّدًا رَسُولُ اللَّهِ؟"),
      back: t(
        "“There has certainly come to you a Messenger from among yourselves. Grievous to him is what you suffer; he is anxious over you, and to the believers he is kind and merciful.” [at-Tawbah: 128]",
        "﴿لَقَدْ جَآءَكُمْ رَسُولٌ مِّنْ أَنفُسِكُمْ عَزِيزٌ عَلَيْهِ مَا عَنِتُّمْ حَرِيصٌ عَلَيْكُم بِٱلْمُؤْمِنِينَ رَءُوفٌ رَّحِيمٌ﴾ [التَّوْبَة: ١٢٨]",
      ),
    },
    {
      kind: "list",
      page: 34,
      front: t("What does testifying that Muḥammad is the Messenger of Allah mean?", "مَا مَعْنَى شَهَادَةِ أَنَّ مُحَمَّدًا رَسُولُ اللَّهِ؟"),
      back: t(
        "Obeying him in what he commanded, believing him in what he informed of, avoiding what he forbade and warned against, and that Allah is worshipped only by what he legislated.",
        "«طَاعَتُهُ فِيمَا أَمَرَ، وَتَصْدِيقُهُ فِيمَا أَخْبَرَ، وَاجْتِنَابُ مَا عَنْهُ نَهَى وَزَجَرَ، وَأَنْ لَا يُعْبَدَ اللَّهُ إِلَّا بِمَا شَرَعَ»",
      ),
    },
    {
      kind: "evidence",
      page: 35,
      front: t("Which āyah is the evidence for prayer and zakāh, and the explanation of tawḥīd?", "مَا دَلِيلُ الصَّلَاةِ، وَالزَّكَاةِ، وَتَفْسِيرِ التَّوْحِيدِ؟"),
      back: t(
        "“And they were not commanded except to worship Allah, making the religion sincerely His, as ḥunafāʾ, and to establish the prayer and give the zakāh. And that is the upright religion.” [al-Bayyinah: 5]",
        "﴿وَمَآ أُمِرُوٓا۟ إِلَّا لِيَعْبُدُوا۟ ٱللَّهَ مُخْلِصِينَ لَهُ ٱلدِّينَ حُنَفَآءَ وَيُقِيمُوا۟ ٱلصَّلَوٰةَ وَيُؤْتُوا۟ ٱلزَّكَوٰةَ وَذَٰلِكَ دِينُ ٱلْقَيِّمَةِ﴾ [البَيِّنَة: ٥]",
      ),
    },
    {
      kind: "evidence",
      page: 35,
      front: t("What is the evidence for fasting?", "مَا دَلِيلُ الصِّيَامِ؟"),
      back: t(
        "“O you who believe, fasting has been prescribed for you as it was prescribed for those before you, that you may become righteous.” [al-Baqarah: 183]",
        "﴿يَٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا۟ كُتِبَ عَلَيْكُمُ ٱلصِّيَامُ كَمَا كُتِبَ عَلَى ٱلَّذِينَ مِن قَبْلِكُمْ لَعَلَّكُمْ تَتَّقُونَ﴾ [البَقَرَة: ١٨٣]",
      ),
    },
    {
      kind: "evidence",
      page: 35,
      front: t("What is the evidence for pilgrimage (ḥajj)?", "مَا دَلِيلُ الحَجِّ؟"),
      back: t(
        "“And due to Allah from the people is pilgrimage to the House — for whoever is able to find a way to it. And whoever disbelieves — then indeed, Allah is free of need of the worlds.” [Āl ʿImrān: 97]",
        "﴿وَلِلَّهِ عَلَى ٱلنَّاسِ حِجُّ ٱلْبَيْتِ مَنِ ٱسْتَطَاعَ إِلَيْهِ سَبِيلًا وَمَن كَفَرَ فَإِنَّ ٱللَّهَ غَنِىٌّ عَنِ ٱلْعَٰلَمِينَ﴾ [آلِ عِمْرَان: ٩٧]",
      ),
    },
  ],

  // ───────────── 7 · Īmān and iḥsān ─────────────
  [
    opening(6, 36, t("What is the second foundation about (part 2)?", "عَلَامَ يَدُورُ الأَصْلُ الثَّانِي فِي هَذَا المَوْضِعِ؟")),
    {
      kind: "term",
      page: 36,
      front: t("What is īmān, the second level?", "مَا الإِيمَانُ، المَرْتَبَةُ الثَّانِيَةُ؟"),
      back: t(
        "Seventy-some branches: the highest is saying lā ilāha illā Allāh, and the lowest is removing harm from the road.",
        "«بِضْعٌ وَسَبْعُونَ شُعْبَةً؛ أَعْلَاهَا: قَوْلُ: لَا إِلَهَ إِلَّا اللَّهُ. وَأَدْنَاهَا: إِمَاطَةُ الأَذَى عَنِ الطَّرِيقِ»",
      ),
    },
    {
      kind: "cloze",
      page: 36,
      front: t("“…and its lowest is ______ from the road.”", "«وَأَدْنَاهَا: ______ عَنِ الطَّرِيقِ»"),
      back: t("removing harm", "إِمَاطَةُ الأَذَى"),
    },
    {
      kind: "point",
      page: 36,
      front: t("Which branch of īmān does the author mention by name?", "أَيُّ شُعَبِ الإِيمَانِ نَصَّ عَلَيْهَا المُؤَلِّفُ؟"),
      back: t("Modesty: “And modesty is a branch of īmān.”", "«وَالحَيَاءُ شُعْبَةٌ مِنَ الإِيمَانِ»"),
    },
    {
      kind: "list",
      page: 36,
      front: t("What are the six pillars of īmān?", "مَا أَرْكَانُ الإِيمَانِ السِّتَّةُ؟"),
      back: t(
        "That you believe in Allah, His angels, His books, His messengers, the Last Day, and the decree — its good and its bad.",
        "«أَنْ تُؤْمِنَ بِاللَّهِ، وَمَلَائِكَتِهِ، وَكُتُبِهِ، وَرُسُلِهِ، وَاليَوْمِ الآخِرِ، وَالقَدَرِ خَيْرِهِ وَشَرِّهِ»",
      ),
    },
    {
      kind: "evidence",
      page: 36,
      front: t("What is the evidence for these six pillars?", "مَا الدَّلِيلُ عَلَى هَذِهِ الأَرْكَانِ السِّتَّةِ؟"),
      back: t(
        "“Righteousness is not that you turn your faces towards the east and the west; but righteousness is (in) one who believes in Allah, the Last Day, the angels, the Book and the prophets.” [al-Baqarah: 177]",
        "﴿لَّيْسَ ٱلْبِرَّ أَن تُوَلُّوا۟ وُجُوهَكُمْ قِبَلَ ٱلْمَشْرِقِ وَٱلْمَغْرِبِ وَلَٰكِنَّ ٱلْبِرَّ مَنْ ءَامَنَ بِٱللَّهِ وَٱلْيَوْمِ ٱلْءَاخِرِ وَٱلْمَلَٰٓئِكَةِ وَٱلْكِتَٰبِ وَٱلنَّبِيِّۦنَ﴾ [البَقَرَة: ١٧٧]",
      ),
    },
    {
      kind: "evidence",
      page: 36,
      front: t("What is the evidence for the decree (qadar)?", "مَا دَلِيلُ القَدَرِ؟"),
      back: t("“Indeed, We have created everything with a decree.” [al-Qamar: 49]", "﴿إِنَّا كُلَّ شَىْءٍ خَلَقْنَٰهُ بِقَدَرٍ﴾ [القَمَر: ٤٩]"),
    },
    {
      kind: "term",
      page: 37,
      front: t("What is iḥsān, the third level — and how many pillars has it?", "مَا الإِحْسَانُ، المَرْتَبَةُ الثَّالِثَةُ؟ وَكَمْ أَرْكَانُهُ؟"),
      back: t(
        "One pillar: that you worship Allah as though you see Him; and if you do not see Him, He surely sees you.",
        "رُكْنٌ وَاحِدٌ: «أَنْ تَعْبُدَ اللَّهَ كَأَنَّكَ تَرَاهُ، فَإِنْ لَمْ تَكُنْ تَرَاهُ فَإِنَّهُ يَرَاكَ»",
      ),
    },
    {
      kind: "cloze",
      page: 37,
      front: t("“That you worship Allah as though you ______; and if you do not see Him, He surely sees you.”", "«أَنْ تَعْبُدَ اللَّهَ كَأَنَّكَ ______، فَإِنْ لَمْ تَكُنْ تَرَاهُ فَإِنَّهُ يَرَاكَ»"),
      back: t("see Him", "تَرَاهُ"),
    },
    {
      kind: "evidence",
      page: 37,
      front: t("What is the first āyah given as evidence for iḥsān?", "مَا أَوَّلُ آيَةٍ اسْتَدَلَّ بِهَا عَلَى الإِحْسَانِ؟"),
      back: t("“Indeed, Allah is with those who fear Him and those who are doers of good.” [an-Naḥl: 128]", "﴿إِنَّ ٱللَّهَ مَعَ ٱلَّذِينَ ٱتَّقَوا۟ وَّٱلَّذِينَ هُم مُّحْسِنُونَ﴾ [النَّحْل: ١٢٨]"),
    },
    {
      kind: "evidence",
      page: 37,
      front: t("Which āyāt about Allah seeing you as you stand and prostrate does he give for iḥsān?", "مَا الآيَاتُ الَّتِي فِيهَا رُؤْيَةُ اللَّهِ لِعَبْدِهِ قَائِمًا وَسَاجِدًا مِمَّا اسْتَدَلَّ بِهِ عَلَى الإِحْسَانِ؟"),
      back: t(
        "“And rely upon the Almighty, the Merciful, who sees you when you stand, and your movement among those who prostrate.” [ash-Shuʿarāʾ: 217–219]",
        "﴿وَتَوَكَّلْ عَلَى ٱلْعَزِيزِ ٱلرَّحِيمِ * ٱلَّذِى يَرَىٰكَ حِينَ تَقُومُ * وَتَقَلُّبَكَ فِى ٱلسَّٰجِدِينَ﴾ [الشُّعَرَاء: ٢١٧–٢١٩]",
      ),
    },
    {
      kind: "evidence",
      page: 37,
      front: t("Which āyah tells that Allah witnesses whatever deed we do?", "مَا الآيَةُ الَّتِي فِيهَا أَنَّ اللَّهَ شَهِيدٌ عَلَى كُلِّ عَمَلٍ نَعْمَلُهُ؟"),
      back: t(
        "“And you are not in any matter, nor do you recite any of the Qur'an, nor do you do any deed, except that We are witness over you when you are engaged in it.” [Yūnus: 61]",
        "﴿وَمَا تَكُونُ فِى شَأْنٍ وَمَا تَتْلُوا۟ مِنْهُ مِن قُرْءَانٍ وَلَا تَعْمَلُونَ مِنْ عَمَلٍ إِلَّا كُنَّا عَلَيْكُمْ شُهُودًا إِذْ تُفِيضُونَ فِيهِ﴾ [يُونُس: ٦١]",
      ),
    },
    {
      kind: "point",
      page: 37,
      front: t("What is the evidence from the Sunnah for these levels?", "مَا الدَّلِيلُ مِنَ السُّنَّةِ عَلَى هَذِهِ المَرَاتِبِ؟"),
      back: t("The well-known ḥadīth of Jibrīl, from ʿUmar (may Allah be pleased with him).", "«حَدِيثُ جِبْرِيلَ المَشْهُورُ، عَنْ عُمَرَ رَضِيَ اللَّهُ عَنْهُ»"),
    },
  ],

  // ───────────── 8 · The ḥadīth of Jibrīl ─────────────
  [
    opening(7, 38, t("Which ḥadīth does this deck cover?", "أَيُّ حَدِيثٍ يَتَنَاوَلُهُ هَذَا القِسْمُ؟")),
    {
      kind: "hadith",
      page: 38,
      front: t("How is the man who appeared described?", "كَيْفَ وُصِفَ الرَّجُلُ الَّذِي طَلَعَ عَلَيْهِمْ؟"),
      back: t(
        "His clothes were intensely white and his hair intensely black; no trace of travel was seen on him, and none of us knew him.",
        "«شَدِيدُ بَيَاضِ الثِّيَابِ، شَدِيدُ سَوَادِ الشَّعَرِ، لَا يُرَى عَلَيْهِ أَثَرُ السَّفَرِ، وَلَا يَعْرِفُهُ مِنَّا أَحَدٌ»",
      ),
    },
    {
      kind: "hadith",
      page: 38,
      front: t("How did he sit before the Prophet ﷺ?", "كَيْفَ جَلَسَ إِلَى النَّبِيِّ ﷺ؟"),
      back: t("He rested his knees against his knees and placed his palms on his thighs.", "«فَأَسْنَدَ رُكْبَتَيْهِ إِلَى رُكْبَتَيْهِ، وَوَضَعَ كَفَّيْهِ عَلَى فَخِذَيْهِ»"),
    },
    {
      kind: "hadith",
      page: 38,
      front: t("In the ḥadīth of Jibrīl, what is Islam?", "مَا الإِسْلَامُ فِي حَدِيثِ جِبْرِيلَ؟"),
      back: t(
        "That you testify that there is no god but Allah and that Muḥammad is the Messenger of Allah, establish the prayer, give the zakāh, fast Ramaḍān, and make pilgrimage to the House if you are able to find a way to it.",
        "«أَنْ تَشْهَدَ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَأَنَّ مُحَمَّدًا رَسُولُ اللَّهِ، وَتُقِيمَ الصَّلَاةَ، وَتُؤْتِيَ الزَّكَاةَ، وَتَصُومَ رَمَضَانَ، وَتَحُجَّ البَيْتَ إِنِ اسْتَطَعْتَ إِلَيْهِ سَبِيلًا»",
      ),
    },
    {
      kind: "hadith",
      page: 38,
      front: t("Why were the Companions amazed at him?", "لِمَ عَجِبَ الصَّحَابَةُ مِنْهُ؟"),
      back: t("He asked the Prophet ﷺ and then confirmed his answer: “You have spoken the truth.”", "«قَالَ: صَدَقْتَ - فَعَجِبْنَا لَهُ؛ يَسْأَلُهُ وَيُصَدِّقُهُ -»"),
    },
    {
      kind: "hadith",
      page: 38,
      front: t("In the ḥadīth of Jibrīl, what is īmān?", "مَا الإِيمَانُ فِي حَدِيثِ جِبْرِيلَ؟"),
      back: t(
        "That you believe in Allah, His angels, His books, His messengers and the Last Day, and that you believe in the decree — its good and its bad.",
        "«أَنْ تُؤْمِنَ بِاللَّهِ، وَمَلَائِكَتِهِ، وَكُتُبِهِ، وَرُسُلِهِ، وَاليَوْمِ الآخِرِ، وَتُؤْمِنَ بِالقَدَرِ خَيْرِهِ وَشَرِّهِ»",
      ),
    },
    {
      kind: "hadith",
      page: 39,
      front: t("In the ḥadīth of Jibrīl, what is iḥsān?", "مَا الإِحْسَانُ فِي حَدِيثِ جِبْرِيلَ؟"),
      back: t("That you worship Allah as though you see Him; and if you do not see Him, He surely sees you.", "«أَنْ تَعْبُدَ اللَّهَ كَأَنَّكَ تَرَاهُ، فَإِنْ لَمْ تَكُنْ تَرَاهُ فَإِنَّهُ يَرَاكَ»"),
    },
    {
      kind: "hadith",
      page: 39,
      front: t("What was the answer about the Hour?", "بِمَ أَجَابَ عَنِ السَّاعَةِ؟"),
      back: t("“The one asked about it knows no more than the one asking.”", "«مَا المَسْؤُولُ عَنْهَا بِأَعْلَمَ مِنَ السَّائِلِ»"),
    },
    {
      kind: "hadith",
      page: 39,
      front: t("What are the signs of the Hour given in the ḥadīth?", "مَا أَمَارَاتُ السَّاعَةِ المَذْكُورَةُ فِي الحَدِيثِ؟"),
      back: t(
        "That the slave-woman gives birth to her mistress, and that you see the barefoot, naked, destitute shepherds competing in constructing tall buildings.",
        "«أَنْ تَلِدَ الأَمَةُ رَبَّتَهَا، وَأَنْ تَرَى الحُفَاةَ العُرَاةَ العَالَةَ رِعَاءَ الشَّاءِ، يَتَطَاوَلُونَ فِي البُنْيَانِ»",
      ),
    },
    {
      kind: "hadith",
      page: 40,
      front: t("When asked who the questioner was, what did ʿUmar say?", "لَمَّا سُئِلَ عُمَرُ عَنِ السَّائِلِ، مَاذَا قَالَ؟"),
      back: t("“Allah and His Messenger know best.”", "«اللَّهُ وَرَسُولُهُ أَعْلَمُ»"),
    },
    {
      kind: "hadith",
      page: 40,
      front: t("Who was the questioner, and why had he come?", "مَنِ السَّائِلُ؟ وَلِمَ جَاءَ؟"),
      back: t("“That was Jibrīl; he came to you to teach you your religion.”", "«فَإِنَّهُ جِبْرِيلُ؛ أَتَاكُمْ يُعَلِّمُكُمْ دِينَكُمْ»"),
    },
  ],

  // ───────────── 9 · The third foundation: the Prophet ﷺ ─────────────
  [
    opening(8, 41, t("What is the third foundation about (part 1)?", "عَلَامَ يَدُورُ الأَصْلُ الثَّالِثُ فِي أَوَّلِهِ؟")),
    {
      kind: "list",
      page: 41,
      front: t("What is the Prophet's ﷺ lineage as the author gives it?", "مَا نَسَبُ النَّبِيِّ ﷺ كَمَا ذَكَرَهُ المُؤَلِّفُ؟"),
      back: t(
        "Muḥammad ibn ʿAbdillāh ibn ʿAbd al-Muṭṭalib ibn Hāshim. Hāshim is from Quraysh, Quraysh are from the Arabs, and the Arabs are from the descendants of Ismāʿīl, son of Ibrāhīm al-Khalīl.",
        "«مُحَمَّدُ بْنُ عَبْدِ اللَّهِ بْنِ عَبْدِ المُطَّلِبِ بْنِ هَاشِمٍ، وَهَاشِمٌ مِنْ قُرَيْشٍ، وَقُرَيْشٌ مِنَ العَرَبِ، وَالعَرَبُ مِنْ ذُرِّيَّةِ إِسْمَاعِيلَ بْنِ إِبْرَاهِيمَ الخَلِيلِ»",
      ),
    },
    {
      kind: "point",
      page: 41,
      front: t("How long did he live ﷺ, and how was it divided?", "كَمْ عُمُرُهُ ﷺ؟ وَكَيْفَ كَانَ؟"),
      back: t("Sixty-three years: forty before prophethood, and twenty-three as a prophet and messenger.", "«ثَلَاثٌ وَسِتُّونَ سَنَةً؛ مِنْهَا أَرْبَعُونَ قَبْلَ النُّبُوَّةِ، وَثَلَاثٌ وَعِشْرُونَ نَبِيًّا رَسُولًا»"),
    },
    {
      kind: "point",
      page: 41,
      front: t("By what was he made a prophet, and by what sent as a messenger?", "بِمَ نُبِّئَ؟ وَبِمَ أُرْسِلَ؟"),
      back: t("He was made a prophet by “Iqraʾ”, and sent as a messenger by “al-Muddaththir”.", "نُبِّئَ بِـ«اقْرَأْ»، وَأُرْسِلَ بِـ«المُدَّثِّرِ»."),
    },
    {
      kind: "point",
      page: 41,
      front: t("What was his city?", "مَا بَلَدُهُ ﷺ؟"),
      back: t("Makkah.", "«وَبَلَدُهُ مَكَّةُ»"),
    },
    {
      kind: "point",
      page: 42,
      front: t("For what did Allah send him?", "بِمَ بَعَثَهُ اللَّهُ؟"),
      back: t("To warn against shirk and to call to tawḥīd.", "«بَعَثَهُ اللَّهُ بِالنِّذَارَةِ عَنِ الشِّرْكِ، وَيَدْعُو إِلَى التَّوْحِيدِ»"),
    },
    {
      kind: "evidence",
      page: 42,
      front: t("What is the evidence that he was sent to warn against shirk and call to tawḥīd?", "مَا الدَّلِيلُ عَلَى أَنَّهُ بُعِثَ بِالنِّذَارَةِ عَنِ الشِّرْكِ وَالدَّعْوَةِ إِلَى التَّوْحِيدِ؟"),
      back: t(
        "“O you who covers himself, arise and warn; and your Lord, magnify; and your garments, purify; and uncleanliness, forsake; and do not confer favour to seek more; and for your Lord, be patient.” [al-Muddaththir: 1–7]",
        "﴿يَٰٓأَيُّهَا ٱلْمُدَّثِّرُ * قُمْ فَأَنذِرْ * وَرَبَّكَ فَكَبِّرْ * وَثِيَابَكَ فَطَهِّرْ * وَٱلرُّجْزَ فَٱهْجُرْ * وَلَا تَمْنُن تَسْتَكْثِرُ * وَلِرَبِّكَ فَٱصْبِرْ﴾ [المُدَّثِّر: ١–٧]",
      ),
    },
    {
      kind: "term",
      page: 42,
      front: t("What does “Arise and warn” mean?", "مَا مَعْنَى ﴿قُمْ فَأَنذِرْ﴾؟"),
      back: t("He warns against shirk and calls to tawḥīd.", "«يُنْذِرُ عَنِ الشِّرْكِ، وَيَدْعُو إِلَى التَّوْحِيدِ»"),
    },
    {
      kind: "term",
      page: 42,
      front: t("What does “And your Lord, magnify” mean?", "مَا مَعْنَى ﴿وَرَبَّكَ فَكَبِّرْ﴾؟"),
      back: t("Magnify Him with tawḥīd.", "«أَيْ: عَظِّمْهُ بِالتَّوْحِيدِ»"),
    },
    {
      kind: "term",
      page: 42,
      front: t("What does “And your garments, purify” mean?", "مَا مَعْنَى ﴿وَثِيَابَكَ فَطَهِّرْ﴾؟"),
      back: t("Purify your deeds from shirk.", "«أَيْ: طَهِّرْ أَعْمَالَكَ عَنِ الشِّرْكِ»"),
    },
    {
      kind: "term",
      page: 42,
      front: t("“And ar-rujz, forsake” — what is ar-rujz, and what is forsaking it?", "﴿وَٱلرُّجْزَ فَٱهْجُرْ﴾: مَا الرُّجْزُ؟ وَمَا هَجْرُهُ؟"),
      back: t("Ar-rujz is the idols; forsaking them is leaving them, and freeing oneself from them and their people.", "«الرُّجْزُ: الأَصْنَامُ، وَهَجْرُهَا: تَرْكُهَا، وَالبَرَاءَةُ مِنْهَا وَأَهْلِهَا»"),
    },
    {
      kind: "point",
      page: 42,
      front: t("How long did he spend calling to tawḥīd (before the Ascension)?", "كَمْ مَكَثَ ﷺ يَدْعُو إِلَى التَّوْحِيدِ قَبْلَ العُرُوجِ؟"),
      back: t("Ten years.", "«أَخَذَ عَلَى هَذَا عَشْرَ سِنِينَ يَدْعُو إِلَى التَّوْحِيدِ»"),
    },
  ],

  // ───────────── 10 · The hijrah, the laws of Madinah, the completed religion ─────────────
  [
    opening(9, 43, t("What is the third foundation about (part 2)?", "عَلَامَ يَدُورُ الأَصْلُ الثَّالِثُ فِي هَذَا المَوْضِعِ؟")),
    {
      kind: "point",
      page: 43,
      front: t("What happened after the ten years in Makkah?", "مَاذَا كَانَ بَعْدَ العَشْرِ سِنِينَ؟"),
      back: t("He was taken up to the heaven, and the five prayers were made obligatory upon him.", "«عُرِجَ بِهِ إِلَى السَّمَاءِ، وَفُرِضَتْ عَلَيْهِ الصَّلَوَاتُ الخَمْسُ»"),
    },
    {
      kind: "point",
      page: 43,
      front: t("How long did he pray in Makkah, and what was he then commanded?", "كَمْ صَلَّى فِي مَكَّةَ؟ وَبِمَ أُمِرَ بَعْدَهَا؟"),
      back: t("Three years; after that he was commanded to emigrate to Madinah.", "«وَصَلَّى فِي مَكَّةَ ثَلَاثَ سِنِينَ، وَبَعْدَهَا أُمِرَ بِالهِجْرَةِ إِلَى المَدِينَةِ»"),
    },
    {
      kind: "term",
      page: 43,
      front: t("What is hijrah?", "مَا الهِجْرَةُ؟"),
      back: t("Moving from the land of shirk to the land of Islam.", "«الانْتِقَالُ مِنْ بَلَدِ الشِّرْكِ إِلَى بَلَدِ الإِسْلَامِ»"),
    },
    {
      kind: "point",
      page: 43,
      front: t("Until when does hijrah remain?", "إِلَى مَتَى تَبْقَى الهِجْرَةُ؟"),
      back: t("Until the Hour is established.", "«وَهِيَ بَاقِيَةٌ إِلَى أَنْ تَقُومَ السَّاعَةُ»"),
    },
    {
      kind: "evidence",
      page: 43,
      front: t("What is the first āyah given as evidence for hijrah?", "مَا أَوَّلُ آيَةٍ اسْتَدَلَّ بِهَا عَلَى الهِجْرَةِ؟"),
      back: t(
        "“Indeed, those whom the angels take in death while wronging themselves — (the angels) will say: ‘In what condition were you?’ They will say: ‘We were oppressed in the land.’ (The angels) will say: ‘Was not the earth of Allah spacious enough for you to emigrate in it?’ For those, their refuge is Hell — and evil it is as a destination.” [an-Nisāʾ: 97]",
        "﴿إِنَّ ٱلَّذِينَ تَوَفَّىٰهُمُ ٱلْمَلَٰٓئِكَةُ ظَالِمِىٓ أَنفُسِهِمْ قَالُوا۟ فِيمَ كُنتُمْ قَالُوا۟ كُنَّا مُسْتَضْعَفِينَ فِى ٱلْأَرْضِ قَالُوٓا۟ أَلَمْ تَكُنْ أَرْضُ ٱللَّهِ وَٰسِعَةً فَتُهَاجِرُوا۟ فِيهَا فَأُو۟لَٰٓئِكَ مَأْوَىٰهُمْ جَهَنَّمُ وَسَآءَتْ مَصِيرًا﴾ [النِّسَاء: ٩٧]",
      ),
      note: t("The author continues to the end of āyah 99.", "وَسَاقَ المُؤَلِّفُ الآيَاتِ إِلَى آخِرِ الآيَةِ (٩٩)."),
    },
    {
      kind: "evidence",
      page: 44,
      front: t("What is the second āyah given as evidence for hijrah?", "مَا الآيَةُ الثَّانِيَةُ الَّتِي اسْتَدَلَّ بِهَا عَلَى الهِجْرَةِ؟"),
      back: t("“O My servants who believe, indeed My earth is spacious, so worship Me alone.” [al-ʿAnkabūt: 56]", "﴿يَٰعِبَادِىَ ٱلَّذِينَ ءَامَنُوٓا۟ إِنَّ أَرْضِى وَٰسِعَةٌ فَإِيَّٰىَ فَٱعْبُدُونِ﴾ [العَنْكَبُوت: ٥٦]"),
    },
    {
      kind: "quote",
      page: 44,
      front: t("What did al-Baghawī say was the reason this āyah was revealed?", "مَا سَبَبُ نُزُولِ هَذِهِ الآيَةِ كَمَا قَالَ البَغَوِيُّ؟"),
      back: t(
        "“It was revealed about the Muslims in Makkah who had not emigrated — Allah called them by the name of īmān.”",
        "«سَبَبُ نُزُولِ هَذِهِ الآيَةِ: فِي المُسْلِمِينَ الَّذِينَ بِمَكَّةَ لَمْ يُهَاجِرُوا، نَادَاهُمُ اللَّهُ بِاسْمِ الإِيمَانِ»",
      ),
    },
    {
      kind: "hadith",
      page: 44,
      front: t("What is the evidence for hijrah from the Sunnah?", "مَا الدَّلِيلُ عَلَى الهِجْرَةِ مِنَ السُّنَّةِ؟"),
      back: t(
        "“Hijrah will not cease until repentance ceases, and repentance will not cease until the sun rises from where it sets.”",
        "«لَا تَنْقَطِعُ الهِجْرَةُ حَتَّى تَنْقَطِعَ التَّوْبَةُ، وَلَا تَنْقَطِعُ التَّوْبَةُ حَتَّى تَطْلُعَ الشَّمْسُ مِنْ مَغْرِبِهَا»",
      ),
    },
    {
      kind: "list",
      page: 44,
      front: t("Once settled in Madinah, which remaining laws was he commanded with — and for how long?", "لَمَّا اسْتَقَرَّ بِالمَدِينَةِ، بِمَ أُمِرَ؟ وَكَمْ مَكَثَ عَلَى ذَلِكَ؟"),
      back: t(
        "The rest of the laws of Islam — such as zakāh, fasting, ḥajj, the adhān, jihād, and enjoining good and forbidding evil. He spent ten years on this.",
        "«أُمِرَ بِبَقِيَّةِ شَرَائِعِ الإِسْلَامِ - مِثْلُ: الزَّكَاةِ، وَالصَّوْمِ، وَالحَجِّ، وَالأَذَانِ، وَالجِهَادِ، وَالأَمْرِ بِالمَعْرُوفِ وَالنَّهْيِ عَنِ المُنْكَرِ -، أَخَذَ عَلَى هَذَا عَشْرَ سِنِينَ»",
      ),
    },
    {
      kind: "point",
      page: 45,
      front: t("In what state did he pass away ﷺ?", "عَلَى أَيِّ حَالٍ تُوُفِّيَ ﷺ؟"),
      back: t(
        "His religion remains: there is no good except he guided the ummah to it, and no evil except he warned it against it.",
        "«وَتُوُفِّيَ ﷺ وَدِينُهُ بَاقٍ، وَهَذَا دِينُهُ، لَا خَيْرَ إِلَّا دَلَّ الأُمَّةَ عَلَيْهِ، وَلَا شَرَّ إِلَّا حَذَّرَهَا مِنْهُ»",
      ),
    },
    {
      kind: "term",
      page: 45,
      front: t("What is the good he guided to, and the evil he warned against?", "مَا الخَيْرُ الَّذِي دَلَّ عَلَيْهِ، وَالشَّرُّ الَّذِي حَذَّرَ مِنْهُ؟"),
      back: t(
        "The good: tawḥīd, and all that Allah loves and is pleased with. The evil: shirk, and all that Allah hates and refuses.",
        "«وَالخَيْرُ الَّذِي دَلَّهَا عَلَيْهِ: التَّوْحِيدُ، وَجَمِيعُ مَا يُحِبُّهُ اللَّهُ وَيَرْضَاهُ. وَالشَّرُّ الَّذِي حَذَّرَهَا مِنْهُ: الشِّرْكُ، وَجَمِيعُ مَا يَكْرَهُهُ اللَّهُ وَيَأْبَاهُ»",
      ),
    },
    {
      kind: "point",
      page: 45,
      front: t("To whom did Allah send him, and upon whom is obeying him obligatory?", "إِلَى مَنْ بَعَثَهُ اللَّهُ؟ وَعَلَى مَنِ افْتَرَضَ طَاعَتَهُ؟"),
      back: t(
        "To all people. Allah made obeying him obligatory upon both weighty creations — the jinn and mankind.",
        "«بَعَثَهُ اللَّهُ إِلَى النَّاسِ كَافَّةً، وَافْتَرَضَ اللَّهُ طَاعَتَهُ عَلَى جَمِيعِ الثَّقَلَيْنِ - الجِنِّ وَالإِنْسِ -»",
      ),
    },
    {
      kind: "evidence",
      page: 45,
      front: t("What is the evidence that he was sent to all people?", "مَا الدَّلِيلُ عَلَى أَنَّهُ بُعِثَ إِلَى النَّاسِ كَافَّةً؟"),
      back: t("“Say: O mankind, I am the Messenger of Allah to you all.” [al-Aʿrāf: 158]", "﴿قُلْ يَٰٓأَيُّهَا ٱلنَّاسُ إِنِّى رَسُولُ ٱللَّهِ إِلَيْكُمْ جَمِيعًا﴾ [الأَعْرَاف: ١٥٨]"),
    },
    {
      kind: "evidence",
      page: 45,
      front: t("What is the evidence that Allah completed the religion through him?", "مَا الدَّلِيلُ عَلَى أَنَّ اللَّهَ أَكْمَلَ بِهِ الدِّينَ؟"),
      back: t(
        "“This day I have perfected for you your religion, completed My favour upon you, and approved for you Islam as religion.” [al-Māʾidah: 3]",
        "﴿ٱلْيَوْمَ أَكْمَلْتُ لَكُمْ دِينَكُمْ وَأَتْمَمْتُ عَلَيْكُمْ نِعْمَتِى وَرَضِيتُ لَكُمُ ٱلْإِسْلَٰمَ دِينًا﴾ [المَائِدَة: ٣]",
      ),
    },
  ],

  // ───────────── 11 · Death, resurrection and recompense ─────────────
  [
    opening(10, 46, t("What is the third foundation about (part 3)?", "عَلَامَ يَدُورُ الأَصْلُ الثَّالِثُ بَعْدَ ذَلِكَ؟")),
    {
      kind: "evidence",
      page: 46,
      front: t("What is the evidence for his death ﷺ?", "مَا الدَّلِيلُ عَلَى مَوْتِهِ ﷺ؟"),
      back: t(
        "“Indeed, you will die and indeed they will die. Then indeed you, on the Day of Resurrection, before your Lord, will dispute.” [az-Zumar: 30–31]",
        "﴿إِنَّكَ مَيِّتٌ وَإِنَّهُم مَّيِّتُونَ * ثُمَّ إِنَّكُمْ يَوْمَ ٱلْقِيَٰمَةِ عِندَ رَبِّكُمْ تَخْتَصِمُونَ﴾ [الزُّمَر: ٣٠–٣١]",
      ),
    },
    {
      kind: "point",
      page: 46,
      front: t("What happens to people after they die?", "مَاذَا يَكُونُ لِلنَّاسِ إِذَا مَاتُوا؟"),
      back: t("They are resurrected.", "«وَالنَّاسُ إِذَا مَاتُوا يُبْعَثُونَ»"),
    },
    {
      kind: "evidence",
      page: 46,
      front: t("What is the first evidence for the resurrection?", "مَا أَوَّلُ دَلِيلٍ عَلَى البَعْثِ؟"),
      back: t("“From it We created you, into it We return you, and from it We will bring you out another time.” [Ṭā Hā: 55]", "﴿مِنْهَا خَلَقْنَٰكُمْ وَفِيهَا نُعِيدُكُمْ وَمِنْهَا نُخْرِجُكُمْ تَارَةً أُخْرَىٰ﴾ [طٰهٰ: ٥٥]"),
    },
    {
      kind: "evidence",
      page: 46,
      front: t("What is the second evidence for the resurrection?", "مَا الدَّلِيلُ الثَّانِي عَلَى البَعْثِ؟"),
      back: t(
        "“And Allah has caused you to grow from the earth a (gradual) growth. Then He will return you into it and bring you out (again) — a (new) bringing out.” [Nūḥ: 17–18]",
        "﴿وَٱللَّهُ أَنۢبَتَكُم مِّنَ ٱلْأَرْضِ نَبَاتًا * ثُمَّ يُعِيدُكُمْ فِيهَا وَيُخْرِجُكُمْ إِخْرَاجًا﴾ [نُوح: ١٧–١٨]",
      ),
    },
    {
      kind: "point",
      page: 46,
      front: t("What happens after the resurrection?", "مَاذَا يَكُونُ بَعْدَ البَعْثِ؟"),
      back: t("They are taken to account and recompensed for their deeds.", "«وَبَعْدَ البَعْثِ مُحَاسَبُونَ وَمَجْزِيُّونَ بِأَعْمَالِهِمْ»"),
    },
    {
      kind: "evidence",
      page: 46,
      front: t("What is the evidence for the recompense?", "مَا الدَّلِيلُ عَلَى الجَزَاءِ؟"),
      back: t(
        "“That He may recompense those who do evil with what they did, and recompense those who do good with the best.” [an-Najm: 31]",
        "﴿لِيَجْزِىَ ٱلَّذِينَ أَسَٰٓـُٔوا۟ بِمَا عَمِلُوا۟ وَيَجْزِىَ ٱلَّذِينَ أَحْسَنُوا۟ بِٱلْحُسْنَى﴾ [النَّجْم: ٣١]",
      ),
    },
    {
      kind: "point",
      page: 46,
      front: t("What is the ruling on one who denies the resurrection?", "مَا حُكْمُ مَنْ كَذَّبَ بِالبَعْثِ؟"),
      back: t("He has disbelieved.", "«وَمَنْ كَذَّبَ بِالبَعْثِ كَفَرَ»"),
    },
    {
      kind: "evidence",
      page: 46,
      front: t("What is the evidence that denying the resurrection is disbelief?", "مَا الدَّلِيلُ عَلَى كُفْرِ مَنْ كَذَّبَ بِالبَعْثِ؟"),
      back: t(
        "“Those who disbelieve claim that they will never be resurrected. Say: Yes, by my Lord, you will surely be resurrected; then you will surely be informed of what you did. And that, for Allah, is easy.” [at-Taghābun: 7]",
        "﴿زَعَمَ ٱلَّذِينَ كَفَرُوٓا۟ أَن لَّن يُبْعَثُوا۟ قُلْ بَلَىٰ وَرَبِّى لَتُبْعَثُنَّ ثُمَّ لَتُنَبَّؤُنَّ بِمَا عَمِلْتُمْ وَذَٰلِكَ عَلَى ٱللَّهِ يَسِيرٌ﴾ [التَّغَابُن: ٧]",
      ),
    },
  ],

  // ───────────── 12 · The messengers, and disbelieving in the ṭāghūt ─────────────
  [
    opening(11, 47, t("What is the third foundation about (part 4)?", "عَلَامَ يَدُورُ الأَصْلُ الثَّالِثُ فِي آخِرِهِ؟")),
    {
      kind: "point",
      page: 47,
      front: t("As what did Allah send all the messengers?", "بِأَيِّ وَصْفٍ أَرْسَلَ اللَّهُ جَمِيعَ الرُّسُلِ؟"),
      back: t("As bringers of glad tidings and as warners.", "«وَأَرْسَلَ اللَّهُ جَمِيعَ الرُّسُلِ مُبَشِّرِينَ وَمُنْذِرِينَ»"),
    },
    {
      kind: "evidence",
      page: 47,
      front: t("What is the evidence that the messengers were bringers of glad tidings and warners?", "مَا الدَّلِيلُ عَلَى أَنَّ الرُّسُلَ مُبَشِّرُونَ وَمُنْذِرُونَ؟"),
      back: t(
        "“Messengers as bringers of glad tidings and warners, so that mankind will have no argument against Allah after the messengers.” [an-Nisāʾ: 165]",
        "﴿رُّسُلًا مُّبَشِّرِينَ وَمُنذِرِينَ لِئَلَّا يَكُونَ لِلنَّاسِ عَلَى ٱللَّهِ حُجَّةٌۢ بَعْدَ ٱلرُّسُلِ﴾ [النِّسَاء: ١٦٥]",
      ),
    },
    {
      kind: "point",
      page: 47,
      front: t("Who was the first of the messengers, and who the last?", "مَنْ أَوَّلُ الرُّسُلِ؟ وَمَنْ آخِرُهُمْ؟"),
      back: t(
        "The first was Nūḥ ʿalayhis-salām; the last is Muḥammad ﷺ — the seal of the prophets, with no prophet after him.",
        "«وَأَوَّلُهُمْ: نُوحٌ عَلَيْهِ السَّلَامُ. وَآخِرُهُمْ: مُحَمَّدٌ ﷺ، وَهُوَ خَاتَمُ النَّبِيِّينَ لَا نَبِيَّ بَعْدَهُ»",
      ),
    },
    {
      kind: "evidence",
      page: 47,
      front: t("What is the evidence that Muḥammad ﷺ is the seal of the prophets?", "مَا الدَّلِيلُ عَلَى أَنَّ مُحَمَّدًا ﷺ خَاتَمُ النَّبِيِّينَ؟"),
      back: t(
        "“Muḥammad is not the father of any of your men, but (he is) the Messenger of Allah and the seal of the prophets.” [al-Aḥzāb: 40]",
        "﴿مَّا كَانَ مُحَمَّدٌ أَبَآ أَحَدٍ مِّن رِّجَالِكُمْ وَلَٰكِن رَّسُولَ ٱللَّهِ وَخَاتَمَ ٱلنَّبِيِّۦنَ﴾ [الأَحْزَاب: ٤٠]",
      ),
    },
    {
      kind: "evidence",
      page: 47,
      front: t("What is the evidence that the first of them was Nūḥ?", "مَا الدَّلِيلُ عَلَى أَنَّ أَوَّلَهُمْ نُوحٌ؟"),
      back: t("“Indeed, We have revealed to you as We revealed to Nūḥ and the prophets after him.” [an-Nisāʾ: 163]", "﴿إِنَّآ أَوْحَيْنَآ إِلَيْكَ كَمَآ أَوْحَيْنَآ إِلَىٰ نُوحٍ وَٱلنَّبِيِّۦنَ مِنۢ بَعْدِهِۦ﴾ [النِّسَاء: ١٦٣]"),
    },
    {
      kind: "point",
      page: 47,
      front: t("With what did every messenger come to his nation, from Nūḥ to Muḥammad?", "بِمَ جَاءَ كُلُّ رَسُولٍ أُمَّتَهُ مِنْ نُوحٍ إِلَى مُحَمَّدٍ؟"),
      back: t("Commanding them to worship Allah alone, and forbidding them from worshipping the ṭāghūt.", "«يَأْمُرُهُمْ بِعِبَادَةِ اللَّهِ وَحْدَهُ، وَيَنْهَاهُمْ عَنْ عِبَادَةِ الطَّاغُوتِ»"),
    },
    {
      kind: "evidence",
      page: 48,
      front: t("What is the evidence that every nation was sent a messenger with that call?", "مَا الدَّلِيلُ عَلَى أَنَّ كُلَّ أُمَّةٍ بُعِثَ إِلَيْهَا رَسُولٌ بِهَذِهِ الدَّعْوَةِ؟"),
      back: t(
        "“And We certainly sent into every nation a messenger, (saying): Worship Allah and avoid the ṭāghūt.” [an-Naḥl: 36]",
        "﴿وَلَقَدْ بَعَثْنَا فِى كُلِّ أُمَّةٍ رَّسُولًا أَنِ ٱعْبُدُوا۟ ٱللَّهَ وَٱجْتَنِبُوا۟ ٱلطَّٰغُوتَ﴾ [النَّحْل: ٣٦]",
      ),
    },
    {
      kind: "point",
      page: 48,
      front: t("What did Allah make obligatory upon all His servants?", "مَا الَّذِي افْتَرَضَهُ اللَّهُ عَلَى جَمِيعِ العِبَادِ؟"),
      back: t("Disbelieving in the ṭāghūt and believing in Allah.", "«الكُفْرَ بِالطَّاغُوتِ، وَالإِيمَانَ بِاللَّهِ»"),
    },
    {
      kind: "quote",
      page: 48,
      front: t("How did Ibn al-Qayyim define the ṭāghūt?", "كَيْفَ عَرَّفَ ابْنُ القَيِّمِ الطَّاغُوتَ؟"),
      back: t(
        "“Whatever the servant exceeds his bounds with — whether something worshipped, followed or obeyed.”",
        "«مَعْنَى الطَّاغُوتِ: مَا تَجَاوَزَ بِهِ العَبْدُ حَدَّهُ - مِنْ مَعْبُودٍ، أَوْ مَتْبُوعٍ، أَوْ مُطَاعٍ -»",
      ),
    },
    {
      kind: "list",
      page: 48,
      front: t("The ṭawāghīt are many — who are their five heads?", "الطَّوَاغِيتُ كَثِيرَةٌ؛ فَمَنْ رُؤُوسُهُمُ الخَمْسَةُ؟"),
      back: t(
        "Iblīs (may Allah curse him); whoever is worshipped while being pleased with it; whoever calls people to worship himself; whoever claims anything of the knowledge of the unseen; and whoever judges by other than what Allah revealed.",
        "«إِبْلِيسُ - لَعَنَهُ اللَّهُ -. وَمَنْ عُبِدَ وَهُوَ رَاضٍ. وَمَنْ دَعَا النَّاسَ إِلَى عِبَادَةِ نَفْسِهِ. وَمَنِ ادَّعَى شَيْئًا مِنْ عِلْمِ الغَيْبِ. وَمَنْ حَكَمَ بِغَيْرِ مَا أَنْزَلَ اللَّهُ»",
      ),
    },
    {
      kind: "evidence",
      page: 49,
      front: t("What is the evidence for disbelieving in the ṭāghūt?", "مَا الدَّلِيلُ عَلَى الكُفْرِ بِالطَّاغُوتِ؟"),
      back: t(
        "“There is no compulsion in religion. The right way has become distinct from error. So whoever disbelieves in the ṭāghūt and believes in Allah has grasped the most trustworthy handhold, with no break in it. And Allah is All-Hearing, All-Knowing.” [al-Baqarah: 256]",
        "﴿لَآ إِكْرَاهَ فِى ٱلدِّينِ قَد تَّبَيَّنَ ٱلرُّشْدُ مِنَ ٱلْغَىِّ فَمَن يَكْفُرْ بِٱلطَّٰغُوتِ وَيُؤْمِنۢ بِٱللَّهِ فَقَدِ ٱسْتَمْسَكَ بِٱلْعُرْوَةِ ٱلْوُثْقَىٰ لَا ٱنفِصَامَ لَهَا وَٱللَّهُ سَمِيعٌ عَلِيمٌ﴾ [البَقَرَة: ٢٥٦]",
      ),
    },
    {
      kind: "point",
      page: 49,
      front: t("Of what is that āyah the meaning, according to the author?", "هَذِهِ الآيَةُ مَعْنَى أَيِّ كَلِمَةٍ عِنْدَ المُؤَلِّفِ؟"),
      back: t("This is the meaning of lā ilāha illā Allāh.", "«وَهَذَا مَعْنَى: لَا إِلَهَ إِلَّا اللَّهُ»"),
    },
    {
      kind: "hadith",
      page: 49,
      front: t("Which ḥadīth closes the book?", "مَا الحَدِيثُ الَّذِي خُتِمَ بِهِ الكِتَابُ؟"),
      back: t(
        "“The head of the matter is Islam; its pillar is the prayer; and the peak of its hump is jihād in the path of Allah.”",
        "«رَأْسُ الأَمْرِ: الإِسْلَامُ، وَعَمُودُهُ: الصَّلَاةُ، وَذِرْوَةُ سَنَامِهِ: الجِهَادُ فِي سَبِيلِ اللَّهِ»",
      ),
    },
    {
      kind: "cloze",
      page: 49,
      front: t("“The head of the matter is Islam; its pillar is ______; and the peak of its hump is jihād in the path of Allah.”", "«رَأْسُ الأَمْرِ: الإِسْلَامُ، وَعَمُودُهُ: ______، وَذِرْوَةُ سَنَامِهِ: الجِهَادُ فِي سَبِيلِ اللَّهِ»"),
      back: t("the prayer", "الصَّلَاةُ"),
    },
  ],
];

export const THALATHAT_AL_USUL: FlashcardBook = {
  slug: "thalathat-al-usul",
  title: t("Thalāthat al-Uṣūl — The Three Foundations", "ثَلَاثَةُ الأُصُولِ"),
  shortTitle: "Thalāthat al-Uṣūl",
  author: t("Shaykh Muḥammad ibn ʿAbd al-Wahhāb", "الشَّيْخُ مُحَمَّدُ بْنُ عَبْدِ الوَهَّابِ"),
  chapters: t("sections", "الفُصُولُ"),
  subject: "ʿAqīdah and Tawḥīd",
  blurb: "Knowing your Lord, your religion and your Prophet ﷺ — with their evidences, in short decks.",
  source: PIK_EDITION,
  sections: CARDS.map((cards, i) => ({ number: i + 1, label: LABELS[i], title: TITLES[i], pages: PAGES[i], cards })),
};
