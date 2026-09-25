/**
 * "Wisdom of the day" — lines of naḥw verse, classical poetry and sayings
 * about knowledge and the Arabic language, each with its author and source.
 *
 * Attribution policy: only well-established lines are included. Where the
 * attribution is traditional rather than certain (much of the dīwān ascribed
 * to al-Shāfiʿī, lines circulated under al-Kisāʾī's or Abū al-Aswad's name),
 * `attribution` is "attributed" and the UI says so — the app never presents
 * a disputed ascription as fact. English renderings are meaning-based
 * translations, not literal glosses.
 */

export type WisdomKind = "nahw" | "poetry" | "saying" | "quran" | "hadith";

export interface Wisdom {
  id: string;
  kind: WisdomKind;
  /** One or more lines; for verse, each bayt as [ṣadr, ʿajuz]. */
  verses?: [string, string][];
  /** Prose text (sayings, Qur'an, hadith). */
  text?: string;
  meaningEn: string;
  authorAr: string;
  authorEn: string;
  /** Poem, book or chapter it comes from. */
  sourceAr: string;
  sourceEn: string;
  attribution: "established" | "attributed" | "reported";
}

export const WISDOM: Wisdom[] = [
  // ---------------------------------------------------------------- naḥw verse
  {
    id: "alfiyya-opening",
    kind: "nahw",
    verses: [["قَالَ مُحَمَّدٌ هُوَ ابْنُ مَالِكِ", "أَحْمَدُ رَبِّي اللهَ خَيْرَ مَالِكِ"]],
    meaningEn: "Muhammad — he is Ibn Mālik — says: I praise my Lord, God, the best of masters.",
    authorAr: "ابن مالك الأندلسي",
    authorEn: "Ibn Mālik al-Andalusī (d. 672 AH)",
    sourceAr: "الألفية، المقدمة",
    sourceEn: "al-Alfiyya, opening lines",
    attribution: "established",
  },
  {
    id: "alfiyya-kalam",
    kind: "nahw",
    verses: [["كَلَامُنَا لَفْظٌ مُفِيدٌ كَاسْتَقِمْ", "وَاسْمٌ وَفِعْلٌ ثُمَّ حَرْفٌ الْكَلِمْ"]],
    meaningEn: "Speech, as we define it, is a meaningful utterance — like 'istaqim!' (be upright). Its words are the noun, the verb and the particle.",
    authorAr: "ابن مالك الأندلسي",
    authorEn: "Ibn Mālik al-Andalusī",
    sourceAr: "الألفية، باب الكلام وما يتألف منه",
    sourceEn: "al-Alfiyya, chapter on speech and its parts",
    attribution: "established",
  },
  {
    id: "alfiyya-signs-of-noun",
    kind: "nahw",
    verses: [["بِالْجَرِّ وَالتَّنْوِينِ وَالنِّدَا وَأَلْ", "وَمُسْنَدٍ لِلِاسْمِ تَمْيِيزٌ حَصَلْ"]],
    meaningEn: "The noun is recognised by the genitive, by tanwīn, by being called in the vocative, by 'al-', and by having something predicated of it.",
    authorAr: "ابن مالك الأندلسي",
    authorEn: "Ibn Mālik al-Andalusī",
    sourceAr: "الألفية، باب الكلام وما يتألف منه",
    sourceEn: "al-Alfiyya, chapter on speech and its parts",
    attribution: "established",
  },
  {
    id: "alfiyya-murab-mabni",
    kind: "nahw",
    verses: [["وَالِاسْمُ مِنْهُ مُعْرَبٌ وَمَبْنِي", "لِشَبَهٍ مِنَ الْحُرُوفِ مُدْنِي"]],
    meaningEn: "Some nouns are declinable and some indeclinable — the latter because of a resemblance that brings them close to particles.",
    authorAr: "ابن مالك الأندلسي",
    authorEn: "Ibn Mālik al-Andalusī",
    sourceAr: "الألفية، باب المعرب والمبني",
    sourceEn: "al-Alfiyya, chapter on the declinable and the indeclinable",
    attribution: "established",
  },
  {
    id: "alfiyya-case-signs",
    kind: "nahw",
    verses: [["فَارْفَعْ بِضَمٍّ وَانْصِبَنْ فَتْحًا وَجُرّْ", "كَسْرًا كَذِكْرُ اللهِ عَبْدَهُ يَسُرّْ"]],
    meaningEn: "Mark the nominative with a ḍamma, the accusative with a fatḥa and the genitive with a kasra — as in 'dhikru-llāhi ʿabdahu yasurr' (remembering God gladdens His servant).",
    authorAr: "ابن مالك الأندلسي",
    authorEn: "Ibn Mālik al-Andalusī",
    sourceAr: "الألفية، باب المعرب والمبني",
    sourceEn: "al-Alfiyya, chapter on the declinable and the indeclinable",
    attribution: "established",
  },
  {
    id: "alfiyya-ibtida",
    kind: "nahw",
    verses: [["وَرَفَعُوا مُبْتَدَأً بِالِابْتِدَا", "كَذَاكَ رَفْعُ خَبَرٍ بِالْمُبْتَدَا"]],
    meaningEn: "They made the subject (mubtadaʾ) nominative by virtue of its being the start of the sentence; likewise the predicate is made nominative by the subject.",
    authorAr: "ابن مالك الأندلسي",
    authorEn: "Ibn Mālik al-Andalusī",
    sourceAr: "الألفية، باب الابتداء",
    sourceEn: "al-Alfiyya, chapter on the nominal sentence",
    attribution: "established",
  },
  {
    id: "imrita-nahw-first",
    kind: "nahw",
    verses: [["وَالنَّحْوُ أَوْلَى أَوَّلًا أَنْ يُعْلَمَا", "إِذِ الْكَلَامُ دُونَهُ لَنْ يُفْهَمَا"]],
    meaningEn: "Grammar is the first thing most deserving to be learned, for without it speech cannot be understood.",
    authorAr: "شرف الدين يحيى العمريطي",
    authorEn: "Sharaf al-Dīn Yaḥyā al-ʿImrīṭī",
    sourceAr: "الدرة البهية نظم الآجرومية (العمريطية)، المقدمة",
    sourceEn: "al-Durra al-Bahiyya (versification of al-Ājurrūmiyya), introduction",
    attribution: "established",
  },
  {
    id: "kisai-nahw-qiyas",
    kind: "nahw",
    verses: [["إِنَّمَا النَّحْوُ قِيَاسٌ يُتَّبَعْ", "وَبِهِ فِي كُلِّ أَمْرٍ يُنْتَفَعْ"]],
    meaningEn: "Grammar is analogy that is followed — and it is of benefit in every matter.",
    authorAr: "الكسائي",
    authorEn: "al-Kisāʾī (d. 189 AH)",
    sourceAr: "من شعره في النحو",
    sourceEn: "from his verse on grammar",
    attribution: "attributed",
  },
  // --------------------------------------------------------- on the language
  {
    id: "hafiz-bahr",
    kind: "poetry",
    verses: [["أَنَا الْبَحْرُ فِي أَحْشَائِهِ الدُّرُّ كَامِنٌ", "فَهَلْ سَأَلُوا الْغَوَّاصَ عَنْ صَدَفَاتِي"]],
    meaningEn: "(Arabic speaks:) I am the sea, with pearls hidden in its depths — so have they asked the diver about my shells?",
    authorAr: "حافظ إبراهيم",
    authorEn: "Ḥāfiẓ Ibrāhīm (d. 1932)",
    sourceAr: "قصيدة: اللغة العربية تنعى حظها بين أهلها",
    sourceEn: "\"The Arabic Language Laments Its Fate Among Its People\"",
    attribution: "established",
  },
  {
    id: "hafiz-wasitu",
    kind: "poetry",
    verses: [["وَسِعْتُ كِتَابَ اللهِ لَفْظًا وَغَايَةً", "وَمَا ضِقْتُ عَنْ آيٍ بِهِ وَعِظَاتِ"]],
    meaningEn: "(Arabic speaks:) I held the Book of God in its wording and its aims, and was never too narrow for its verses and admonitions.",
    authorAr: "حافظ إبراهيم",
    authorEn: "Ḥāfiẓ Ibrāhīm",
    sourceAr: "قصيدة: اللغة العربية تنعى حظها بين أهلها",
    sourceEn: "\"The Arabic Language Laments Its Fate Among Its People\"",
    attribution: "established",
  },
  {
    id: "hafiz-rajatu",
    kind: "poetry",
    verses: [["رَجَعْتُ لِنَفْسِي فَاتَّهَمْتُ حَصَاتِي", "وَنَادَيْتُ قَوْمِي فَاحْتَسَبْتُ حَيَاتِي"]],
    meaningEn: "(Arabic speaks:) I turned to myself and doubted my own judgement; I called out to my people — and resigned my life to God.",
    authorAr: "حافظ إبراهيم",
    authorEn: "Ḥāfiẓ Ibrāhīm",
    sourceAr: "قصيدة: اللغة العربية تنعى حظها بين أهلها (مطلعها)",
    sourceEn: "\"The Arabic Language Laments Its Fate Among Its People\" (opening line)",
    attribution: "established",
  },
  {
    id: "ibn-taymiyya-arabic",
    kind: "saying",
    text: "فَإِنَّ نَفْسَ اللُّغَةِ الْعَرَبِيَّةِ مِنَ الدِّينِ، وَمَعْرِفَتَهَا فَرْضٌ وَاجِبٌ؛ فَإِنَّ فَهْمَ الْكِتَابِ وَالسُّنَّةِ فَرْضٌ، وَلَا يُفْهَمُ إِلَّا بِفَهْمِ اللُّغَةِ الْعَرَبِيَّةِ.",
    meaningEn: "The Arabic language itself is part of the religion, and knowing it is an obligation: understanding the Qurʾān and Sunna is obligatory, and they cannot be understood without understanding Arabic.",
    authorAr: "ابن تيمية",
    authorEn: "Ibn Taymiyya (d. 728 AH)",
    sourceAr: "اقتضاء الصراط المستقيم",
    sourceEn: "Iqtiḍāʾ al-Ṣirāṭ al-Mustaqīm",
    attribution: "established",
  },
  {
    id: "umar-arabic",
    kind: "saying",
    text: "تَعَلَّمُوا الْعَرَبِيَّةَ فَإِنَّهَا مِنْ دِينِكُمْ.",
    meaningEn: "Learn Arabic, for it is part of your religion.",
    authorAr: "عمر بن الخطاب رضي الله عنه",
    authorEn: "ʿUmar ibn al-Khaṭṭāb",
    sourceAr: "أثر مروي عنه",
    sourceEn: "a report transmitted from him",
    attribution: "reported",
  },
  {
    id: "sibawayh-kitab",
    kind: "nahw",
    text: "هَذَا بَابُ عِلْمِ مَا الْكَلِمُ مِنَ الْعَرَبِيَّةِ",
    meaningEn: "This is the chapter on knowing what words are, in Arabic — the first line of the first great book of Arabic grammar.",
    authorAr: "سيبويه",
    authorEn: "Sībawayh (d. c. 180 AH)",
    sourceAr: "الكتاب، أول أبوابه",
    sourceEn: "al-Kitāb, its opening chapter",
    attribution: "established",
  },
  // ------------------------------------------------------------- on knowledge
  {
    id: "shafii-waki",
    kind: "poetry",
    verses: [
      ["شَكَوْتُ إِلَى وَكِيعٍ سُوءَ حِفْظِي", "فَأَرْشَدَنِي إِلَى تَرْكِ الْمَعَاصِي"],
      ["وَأَخْبَرَنِي بِأَنَّ الْعِلْمَ نُورٌ", "وَنُورُ اللهِ لَا يُهْدَى لِعَاصِي"],
    ],
    meaningEn: "I complained to Wakīʿ of my poor memory; he guided me to abandon sins, and told me that knowledge is light — and God's light is not given to the disobedient.",
    authorAr: "الإمام الشافعي",
    authorEn: "Imam al-Shāfiʿī (d. 204 AH)",
    sourceAr: "ديوان الشافعي",
    sourceEn: "Dīwān al-Shāfiʿī",
    attribution: "attributed",
  },
  {
    id: "shafii-sitta",
    kind: "poetry",
    verses: [
      ["أَخِي لَنْ تَنَالَ الْعِلْمَ إِلَّا بِسِتَّةٍ", "سَأُنْبِيكَ عَنْ تَفْصِيلِهَا بِبَيَانِ"],
      ["ذَكَاءٌ وَحِرْصٌ وَاجْتِهَادٌ وَبُلْغَةٌ", "وَصُحْبَةُ أُسْتَاذٍ وَطُولُ زَمَانِ"],
    ],
    meaningEn: "Brother, you will not attain knowledge except through six things, which I will set out clearly: intelligence, eagerness, effort, provision, the company of a teacher, and a long time.",
    authorAr: "الإمام الشافعي",
    authorEn: "Imam al-Shāfiʿī",
    sourceAr: "ديوان الشافعي",
    sourceEn: "Dīwān al-Shāfiʿī",
    attribution: "attributed",
  },
  {
    id: "shafii-taallam",
    kind: "poetry",
    verses: [["تَعَلَّمْ فَلَيْسَ الْمَرْءُ يُولَدُ عَالِمًا", "وَلَيْسَ أَخُو عِلْمٍ كَمَنْ هُوَ جَاهِلُ"]],
    meaningEn: "Learn — no one is born a scholar, and the one who has knowledge is not like the one who is ignorant.",
    authorAr: "الإمام الشافعي",
    authorEn: "Imam al-Shāfiʿī",
    sourceAr: "ديوان الشافعي",
    sourceEn: "Dīwān al-Shāfiʿī",
    attribution: "attributed",
  },
  {
    id: "shafii-ayyam",
    kind: "poetry",
    verses: [["دَعِ الْأَيَّامَ تَفْعَلُ مَا تَشَاءُ", "وَطِبْ نَفْسًا إِذَا حَكَمَ الْقَضَاءُ"]],
    meaningEn: "Let the days do as they will, and be content when the decree has been passed.",
    authorAr: "الإمام الشافعي",
    authorEn: "Imam al-Shāfiʿī",
    sourceAr: "ديوان الشافعي",
    sourceEn: "Dīwān al-Shāfiʿī",
    attribution: "attributed",
  },
  {
    id: "ibn-al-wardi-kasal",
    kind: "poetry",
    verses: [["اطْلُبِ الْعِلْمَ وَلَا تَكْسَلْ فَمَا", "أَبْعَدَ الْخَيْرَ عَلَى أَهْلِ الْكَسَلْ"]],
    meaningEn: "Seek knowledge and do not be lazy — how far good lies from the idle!",
    authorAr: "ابن الوردي",
    authorEn: "Ibn al-Wardī (d. 749 AH)",
    sourceAr: "لامية ابن الوردي (نصيحة الإخوان)",
    sourceEn: "Lāmiyyat Ibn al-Wardī",
    attribution: "established",
  },
  {
    id: "ibn-al-wardi-opening",
    kind: "poetry",
    verses: [["اعْتَزِلْ ذِكْرَ الْأَغَانِي وَالْغَزَلْ", "وَقُلِ الْفَصْلَ وَجَانِبْ مَنْ هَزَلْ"]],
    meaningEn: "Leave off talk of songs and love-poetry; speak what is decisive, and keep away from the frivolous.",
    authorAr: "ابن الوردي",
    authorEn: "Ibn al-Wardī",
    sourceAr: "لامية ابن الوردي (مطلعها)",
    sourceEn: "Lāmiyyat Ibn al-Wardī (opening line)",
    attribution: "established",
  },
  {
    id: "shawqi-muallim",
    kind: "poetry",
    verses: [["قُمْ لِلْمُعَلِّمِ وَفِّهِ التَّبْجِيلَا", "كَادَ الْمُعَلِّمُ أَنْ يَكُونَ رَسُولَا"]],
    meaningEn: "Stand for the teacher and give him full honour — the teacher is almost a messenger.",
    authorAr: "أحمد شوقي",
    authorEn: "Aḥmad Shawqī (d. 1932)",
    sourceAr: "قصيدة: العلم والتعليم",
    sourceEn: "\"Knowledge and Teaching\"",
    attribution: "established",
  },
  {
    id: "shawqi-akhlaq",
    kind: "poetry",
    verses: [["وَإِنَّمَا الْأُمَمُ الْأَخْلَاقُ مَا بَقِيَتْ", "فَإِنْ هُمُ ذَهَبَتْ أَخْلَاقُهُمْ ذَهَبُوا"]],
    meaningEn: "Nations are only their character, as long as it lasts — if their character goes, they go.",
    authorAr: "أحمد شوقي",
    authorEn: "Aḥmad Shawqī",
    sourceAr: "الشوقيات",
    sourceEn: "al-Shawqiyyāt",
    attribution: "established",
  },
  {
    id: "mutanabbi-khayl",
    kind: "poetry",
    verses: [["الْخَيْلُ وَاللَّيْلُ وَالْبَيْدَاءُ تَعْرِفُنِي", "وَالسَّيْفُ وَالرُّمْحُ وَالْقِرْطَاسُ وَالْقَلَمُ"]],
    meaningEn: "The horses, the night and the desert know me — and the sword, the spear, the page and the pen.",
    authorAr: "أبو الطيب المتنبي",
    authorEn: "Abū al-Ṭayyib al-Mutanabbī (d. 354 AH)",
    sourceAr: "قصيدة: وَا حَرَّ قَلْبَاهُ",
    sourceEn: "\"Wā ḥarra qalbāh\" (addressed to Sayf al-Dawla)",
    attribution: "established",
  },
  {
    id: "mutanabbi-adabi",
    kind: "poetry",
    verses: [["أَنَا الَّذِي نَظَرَ الْأَعْمَى إِلَى أَدَبِي", "وَأَسْمَعَتْ كَلِمَاتِي مَنْ بِهِ صَمَمُ"]],
    meaningEn: "I am the one whose art the blind have seen, and whose words have made the deaf hear.",
    authorAr: "أبو الطيب المتنبي",
    authorEn: "Abū al-Ṭayyib al-Mutanabbī",
    sourceAr: "قصيدة: وَا حَرَّ قَلْبَاهُ",
    sourceEn: "\"Wā ḥarra qalbāh\"",
    attribution: "established",
  },
  {
    id: "mutanabbi-kitab",
    kind: "poetry",
    verses: [["أَعَزُّ مَكَانٍ فِي الدُّنَى سَرْجُ سَابِحٍ", "وَخَيْرُ جَلِيسٍ فِي الزَّمَانِ كِتَابُ"]],
    meaningEn: "The most honoured seat in the world is the saddle of a swift horse, and the best companion in any age is a book.",
    authorAr: "أبو الطيب المتنبي",
    authorEn: "Abū al-Ṭayyib al-Mutanabbī",
    sourceAr: "ديوان المتنبي",
    sourceEn: "Dīwān al-Mutanabbī",
    attribution: "established",
  },
  {
    id: "mutanabbi-azm",
    kind: "poetry",
    verses: [["عَلَى قَدْرِ أَهْلِ الْعَزْمِ تَأْتِي الْعَزَائِمُ", "وَتَأْتِي عَلَى قَدْرِ الْكِرَامِ الْمَكَارِمُ"]],
    meaningEn: "Resolve comes in the measure of the resolute, and noble deeds in the measure of the noble.",
    authorAr: "أبو الطيب المتنبي",
    authorEn: "Abū al-Ṭayyib al-Mutanabbī",
    sourceAr: "قصيدة: عَلَى قَدْرِ أَهْلِ الْعَزْمِ (مطلعها)",
    sourceEn: "\"ʿAlā qadri ahli l-ʿazm\" (opening line)",
    attribution: "established",
  },
  {
    id: "mutanabbi-riyah",
    kind: "poetry",
    verses: [["مَا كُلُّ مَا يَتَمَنَّى الْمَرْءُ يُدْرِكُهُ", "تَجْرِي الرِّيَاحُ بِمَا لَا تَشْتَهِي السُّفُنُ"]],
    meaningEn: "Not everything a person wishes for is attained — the winds blow in ways the ships do not desire.",
    authorAr: "أبو الطيب المتنبي",
    authorEn: "Abū al-Ṭayyib al-Mutanabbī",
    sourceAr: "ديوان المتنبي",
    sourceEn: "Dīwān al-Mutanabbī",
    attribution: "established",
  },
  {
    id: "mutanabbi-nujum",
    kind: "poetry",
    verses: [["إِذَا غَامَرْتَ فِي شَرَفٍ مَرُومِ", "فَلَا تَقْنَعْ بِمَا دُونَ النُّجُومِ"]],
    meaningEn: "When you venture after a sought-for honour, do not be content with anything below the stars.",
    authorAr: "أبو الطيب المتنبي",
    authorEn: "Abū al-Ṭayyib al-Mutanabbī",
    sourceAr: "ديوان المتنبي",
    sourceEn: "Dīwān al-Mutanabbī",
    attribution: "established",
  },
  {
    id: "abu-tammam-sayf",
    kind: "poetry",
    verses: [["السَّيْفُ أَصْدَقُ إِنْبَاءً مِنَ الْكُتُبِ", "فِي حَدِّهِ الْحَدُّ بَيْنَ الْجِدِّ وَاللَّعِبِ"]],
    meaningEn: "The sword tells truer tidings than books; in its edge lies the line between earnest and play.",
    authorAr: "أبو تمام",
    authorEn: "Abū Tammām (d. 231 AH)",
    sourceAr: "قصيدة: فتح عمورية (مطلعها)",
    sourceEn: "\"The Conquest of Amorium\" (opening line)",
    attribution: "established",
  },
  {
    id: "maarri-awail",
    kind: "poetry",
    verses: [["وَإِنِّي وَإِنْ كُنْتُ الْأَخِيرَ زَمَانُهُ", "لَآتٍ بِمَا لَمْ تَسْتَطِعْهُ الْأَوَائِلُ"]],
    meaningEn: "Though I come last in time, I will bring what the ancients could not.",
    authorAr: "أبو العلاء المعري",
    authorEn: "Abū al-ʿAlāʾ al-Maʿarrī (d. 449 AH)",
    sourceAr: "سقط الزند",
    sourceEn: "Saqṭ al-Zand",
    attribution: "established",
  },
  {
    id: "zuhayr-khaliqa",
    kind: "poetry",
    verses: [["وَمَهْمَا تَكُنْ عِنْدَ امْرِئٍ مِنْ خَلِيقَةٍ", "وَإِنْ خَالَهَا تَخْفَى عَلَى النَّاسِ تُعْلَمِ"]],
    meaningEn: "Whatever trait a man has, even if he thinks it hidden from people, it will become known.",
    authorAr: "زهير بن أبي سلمى",
    authorEn: "Zuhayr ibn Abī Sulmā",
    sourceAr: "المعلقة",
    sourceEn: "his Muʿallaqa",
    attribution: "established",
  },
  {
    id: "tarafa-ayyam",
    kind: "poetry",
    verses: [["سَتُبْدِي لَكَ الْأَيَّامُ مَا كُنْتَ جَاهِلًا", "وَيَأْتِيكَ بِالْأَخْبَارِ مَنْ لَمْ تُزَوِّدِ"]],
    meaningEn: "The days will show you what you did not know, and news will be brought to you by someone you never provisioned.",
    authorAr: "طرفة بن العبد",
    authorEn: "Ṭarafa ibn al-ʿAbd",
    sourceAr: "المعلقة",
    sourceEn: "his Muʿallaqa",
    attribution: "established",
  },
  {
    id: "abu-al-aswad-khuluq",
    kind: "poetry",
    verses: [["لَا تَنْهَ عَنْ خُلُقٍ وَتَأْتِيَ مِثْلَهُ", "عَارٌ عَلَيْكَ إِذَا فَعَلْتَ عَظِيمُ"]],
    meaningEn: "Do not forbid a trait while doing the same yourself — if you do, the disgrace upon you is great.",
    authorAr: "أبو الأسود الدؤلي",
    authorEn: "Abū al-Aswad al-Duʾalī (d. 69 AH), to whom the founding of naḥw is traced",
    sourceAr: "يُنسب إليه، ويُنسب كذلك إلى المتوكل الليثي",
    sourceEn: "ascribed to him — and also to al-Mutawakkil al-Laythī",
    attribution: "attributed",
  },
  // ----------------------------------------------------- Qur'an and hadith
  {
    id: "quran-yusuf-2",
    kind: "quran",
    text: "إِنَّا أَنْزَلْنَاهُ قُرْآنًا عَرَبِيًّا لَعَلَّكُمْ تَعْقِلُونَ",
    meaningEn: "Indeed, We have sent it down as an Arabic Qurʾān so that you may understand.",
    authorAr: "القرآن الكريم",
    authorEn: "The Qurʾān",
    sourceAr: "سورة يوسف، الآية ٢",
    sourceEn: "Sūrat Yūsuf, 12:2",
    attribution: "established",
  },
  {
    id: "quran-shuara-195",
    kind: "quran",
    text: "بِلِسَانٍ عَرَبِيٍّ مُبِينٍ",
    meaningEn: "In a clear Arabic tongue.",
    authorAr: "القرآن الكريم",
    authorEn: "The Qurʾān",
    sourceAr: "سورة الشعراء، الآية ١٩٥",
    sourceEn: "Sūrat al-Shuʿarāʾ, 26:195",
    attribution: "established",
  },
  {
    id: "hadith-talab-al-ilm",
    kind: "hadith",
    text: "طَلَبُ الْعِلْمِ فَرِيضَةٌ عَلَى كُلِّ مُسْلِمٍ",
    meaningEn: "Seeking knowledge is an obligation upon every Muslim.",
    authorAr: "النبي ﷺ",
    authorEn: "The Prophet ﷺ",
    sourceAr: "سنن ابن ماجه (٢٢٤)",
    sourceEn: "Sunan Ibn Mājah, no. 224",
    attribution: "reported",
  },
];

/** The calendar day (days since 1970-01-01) that `date` falls on in `timeZone`; UTC if the zone is unknown. */
function localDayNumber(date: Date, timeZone: string): number {
  let ymd: string;
  try {
    // en-CA formats as YYYY-MM-DD.
    ymd = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
  } catch {
    ymd = date.toISOString().slice(0, 10);
  }
  const [y, m, d] = ymd.split("-").map(Number);
  return Date.UTC(y, m - 1, d) / 86_400_000;
}

/**
 * Today's entry for someone in `timeZone`: it changes at *their* midnight,
 * and cycles through the whole list before repeating.
 */
export function wisdomIndexForDate(date: Date, timeZone = "UTC"): number {
  const day = localDayNumber(date, timeZone);
  return ((day % WISDOM.length) + WISDOM.length) % WISDOM.length;
}
