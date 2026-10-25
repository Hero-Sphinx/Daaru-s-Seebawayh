import type { BilingualText, Flashcard, FlashcardBook } from "@/types";
import { PIK_EDITION } from "./sources";

/**
 * al-Qawāʿid al-Arbaʿ (القَوَاعِدُ الأَرْبَعُ) by Shaykh Muḥammad ibn ʿAbd al-Wahhāb —
 * one deck for the introduction and one per rule.
 *
 * The Arabic is the text of the Mutūn Ṭālib al-ʿIlm edition (al-Madrasah
 * ar-Raḥmāniyyah's PIK programme), quoted as printed; āyāt are in the
 * Uthmani script, as the edition prints them, taken from the Qur'an table.
 * The edition has no English, so the English is our own translation — flagged
 * on the book page. `page` is the page number printed in the edition.
 */

const t = (en: string, ar: string): BilingualText => ({ en, ar });

const LABELS: BilingualText[] = [
  t("Introduction", "المُقَدِّمَةُ"),
  t("The First Rule", "القَاعِدَةُ الأُولَى"),
  t("The Second Rule", "القَاعِدَةُ الثَّانِيَةُ"),
  t("The Third Rule", "القَاعِدَةُ الثَّالِثَةُ"),
  t("The Fourth Rule", "القَاعِدَةُ الرَّابِعَةُ"),
];

const TITLES: BilingualText[] = [
  t("Al-Ḥanīfiyyah, and why the four rules must be known", "الحَنِيفِيَّةُ، وَالحَاجَةُ إِلَى مَعْرِفَةِ القَوَاعِدِ الأَرْبَعِ"),
  t("Affirming Allah's lordship did not make them Muslims", "إِقْرَارُ الكُفَّارِ بِالرُّبُوبِيَّةِ لَمْ يُدْخِلْهُمْ فِي الإِسْلَامِ"),
  t("They claimed they only sought nearness and intercession", "دَعْوَاهُمْ أَنَّهُمْ يَطْلُبُونَ القُرْبَةَ وَالشَّفَاعَةَ"),
  t("They differed in what they worshipped, yet he fought them all alike", "تَفَرُّقُهُمْ فِي عِبَادَاتِهِمْ، وَقِتَالُهُمْ جَمِيعًا"),
  t("The shirk of our time is graver than that of the first idolaters", "مُشْرِكُو زَمَانِنَا أَغْلَظُ شِرْكًا مِنَ الأَوَّلِينَ"),
];

/** First and last printed page of each part. */
const PAGES: [number, number][] = [
  [59, 60],
  [61, 61],
  [62, 64],
  [65, 68],
  [69, 69],
];

const opening = (i: number, page: number, front: BilingualText): Flashcard => ({ kind: "principle", page, front, back: TITLES[i] });

const CARDS: Flashcard[][] = [
  // ───────────── Introduction ─────────────
  [
    opening(0, 59, t("What does the introduction establish?", "مَاذَا تُقَرِّرُ المُقَدِّمَةُ؟")),
    {
      kind: "point",
      page: 59,
      front: t("What does the author first ask Allah to grant the reader?", "مَاذَا سَأَلَ المُؤَلِّفُ اللَّهَ لِلْقَارِئِ فِي أَوَّلِ كَلَامِهِ؟"),
      back: t(
        "That He takes you as His ally in this world and the Hereafter, and makes you blessed wherever you are.",
        "«أَنْ يَتَوَلَّاكَ فِي الدُّنْيَا وَالآخِرَةِ، وَأَنْ يَجْعَلَكَ مُبَارَكًا أَيْنَمَا كُنْتَ»",
      ),
    },
    {
      kind: "list",
      page: 59,
      front: t("Which three traits does the author call the sign of happiness?", "مَا الخِصَالُ الثَّلَاثُ الَّتِي جَعَلَهَا المُؤَلِّفُ عُنْوَانَ السَّعَادَةِ؟"),
      back: t(
        "Being grateful when given, patient when tested, and seeking forgiveness after a sin.",
        "«إِذَا أُعْطِيَ شَكَرَ، وَإِذَا ابْتُلِيَ صَبَرَ، وَإِذَا أَذْنَبَ اسْتَغْفَرَ»",
      ),
    },
    {
      kind: "cloze",
      page: 59,
      front: t("“For these three are the ______ of happiness.”", "«فَإِنَّ هَؤُلَاءِ الثَّلَاثَ ______ السَّعَادَةِ»"),
      back: t("heading (the sign)", "عُنْوَانُ"),
    },
    {
      kind: "term",
      page: 59,
      front: t("What is al-ḥanīfiyyah, the religion of Ibrāhīm?", "مَا الحَنِيفِيَّةُ مِلَّةُ إِبْرَاهِيمَ؟"),
      back: t("That you worship Allah alone, making the religion sincerely His.", "«أَنْ تَعْبُدَ اللَّهَ وَحْدَهُ مُخْلِصًا لَهُ الدِّينَ»"),
    },
    {
      kind: "point",
      page: 59,
      front: t("What did Allah command all people with, and create them for?", "بِمَ أَمَرَ اللَّهُ جَمِيعَ النَّاسِ، وَلِمَ خَلَقَهُمْ؟"),
      back: t("Al-ḥanīfiyyah: He commanded all people with it and created them for it.", "بِالحَنِيفِيَّةِ: «وَبِذَلِكَ أَمَرَ اللَّهُ جَمِيعَ النَّاسِ، وَخَلَقَهُمْ لَهَا»"),
    },
    {
      kind: "evidence",
      page: 59,
      front: t("Which āyah shows that Allah created people to worship Him?", "مَا الآيَةُ الدَّالَّةُ عَلَى أَنَّ اللَّهَ خَلَقَ الخَلْقَ لِعِبَادَتِهِ؟"),
      back: t(
        "“And I did not create the jinn and mankind except to worship Me.” [adh-Dhāriyāt: 56]",
        "﴿وَمَا خَلَقْتُ ٱلْجِنَّ وَٱلْإِنسَ إِلَّا لِيَعْبُدُونِ﴾ [الذَّارِيَات: ٥٦]",
      ),
    },
    {
      kind: "example",
      page: 60,
      front: t("To what does the author liken worship without tawḥīd?", "بِمَ شَبَّهَ المُؤَلِّفُ العِبَادَةَ بِلَا تَوْحِيدٍ؟"),
      back: t(
        "Prayer without purification: worship is not called worship except with tawḥīd, just as prayer is not called prayer except with purification.",
        "«أَنَّ العِبَادَةَ لَا تُسَمَّى عِبَادَةً إِلَّا مَعَ التَّوْحِيدِ، كَمَا أَنَّ الصَّلَاةَ لَا تُسَمَّى صَلَاةً إِلَّا مَعَ الطَّهَارَةِ»",
      ),
    },
    {
      kind: "example",
      page: 60,
      front: t("What happens to worship when shirk enters it — and what is that like?", "مَا حَالُ العِبَادَةِ إِذَا دَخَلَهَا الشِّرْكُ؟ وَبِمَ شَبَّهَهُ؟"),
      back: t("It is ruined — like ritual impurity (ḥadath) entering purification.", "«فَإِذَا دَخَلَ الشِّرْكُ فِي العِبَادَةِ: فَسَدَتْ؛ كَالحَدَثِ إِذَا دَخَلَ فِي الطَّهَارَةِ»"),
    },
    {
      kind: "evidence",
      page: 60,
      front: t("Which āyah does he cite for shirk nullifying deeds?", "مَا الآيَةُ الَّتِي اسْتَدَلَّ بِهَا عَلَى أَنَّ الشِّرْكَ يُحْبِطُ العَمَلَ؟"),
      back: t(
        "“It is not for the polytheists to maintain the mosques of Allah while bearing witness against themselves to disbelief. Those — their deeds have become worthless, and in the Fire they will abide forever.” [at-Tawbah: 17]",
        "﴿مَا كَانَ لِلْمُشْرِكِينَ أَن يَعْمُرُوا۟ مَسَٰجِدَ ٱللَّهِ شَٰهِدِينَ عَلَىٰٓ أَنفُسِهِم بِٱلْكُفْرِ أُو۟لَٰٓئِكَ حَبِطَتْ أَعْمَٰلُهُمْ وَفِى ٱلنَّارِ هُمْ خَٰلِدُونَ﴾ [التَّوْبَة: ١٧]",
      ),
    },
    {
      kind: "list",
      page: 60,
      front: t("When shirk mixes with worship, what three things follow?", "إِذَا خَالَطَ الشِّرْكُ العِبَادَةَ، فَمَا الَّذِي يَتَرَتَّبُ عَلَيْهِ؟"),
      back: t(
        "It ruins the worship, nullifies the deed, and its doer becomes one of those abiding forever in the Fire.",
        "«أَفْسَدَهَا، وَأَحْبَطَ العَمَلَ، وَصَارَ صَاحِبُهُ مِنَ الخَالِدِينَ فِي النَّارِ»",
      ),
    },
    {
      kind: "point",
      page: 60,
      front: t("So what is the most important thing upon you, and why?", "مَا أَهَمُّ مَا عَلَيْكَ؟ وَلِمَاذَا؟"),
      back: t(
        "Knowing that — perhaps Allah will free you from this net, which is associating partners with Allah.",
        "«مَعْرِفَةُ ذَلِكَ؛ لَعَلَّ اللَّهَ أَنْ يُخَلِّصَكَ مِنْ هَذِهِ الشَّبَكَةِ؛ وَهِيَ: الشِّرْكُ بِاللَّهِ»",
      ),
    },
    {
      kind: "point",
      page: 60,
      front: t("How is one freed from this net?", "بِمَ يَكُونُ الخَلَاصُ مِنْ هَذِهِ الشَّبَكَةِ؟"),
      back: t("By knowing four rules that Allah mentioned in His Book.", "«بِمَعْرِفَةِ أَرْبَعِ قَوَاعِدَ ذَكَرَهَا اللَّهُ تَعَالَى فِي كِتَابِهِ»"),
    },
  ],

  // ───────────── The First Rule ─────────────
  [
    opening(1, 61, t("What is the first rule about?", "عَلَامَ تَدُورُ القَاعِدَةُ الأُولَى؟")),
    {
      kind: "point",
      page: 61,
      front: t("State the first rule.", "اذْكُرِ القَاعِدَةَ الأُولَى."),
      back: t(
        "That you know the disbelievers whom the Messenger of Allah ﷺ fought affirmed that Allah is the Creator, the Provider, the Giver of life and death, the Disposer of all affairs — and that did not enter them into Islam.",
        "«أَنْ تَعْلَمَ: أَنَّ الكُفَّارَ الَّذِينَ قَاتَلَهُمْ رَسُولُ اللَّهِ ﷺ مُقِرُّونَ أَنَّ اللَّهَ هُوَ الخَالِقُ الرَّازِقُ، المُحْيِي المُمِيتُ، المُدَبِّرُ لِجَمِيعِ الأُمُورِ، وَلَمْ يُدْخِلْهُمْ ذَلِكَ فِي الإِسْلَامِ»",
      ),
    },
    {
      kind: "list",
      page: 61,
      front: t("What did the disbelievers the Prophet ﷺ fought affirm about Allah?", "بِمَ كَانَ يُقِرُّ الكُفَّارُ الَّذِينَ قَاتَلَهُمُ النَّبِيُّ ﷺ؟"),
      back: t(
        "That He is the Creator, the Provider, the Giver of life, the Causer of death, and the Disposer of all affairs.",
        "أَنَّ اللَّهَ هُوَ الخَالِقُ، الرَّازِقُ، المُحْيِي، المُمِيتُ، المُدَبِّرُ لِجَمِيعِ الأُمُورِ.",
      ),
    },
    {
      kind: "point",
      page: 61,
      front: t("Did that affirmation make them Muslims?", "هَلْ أَدْخَلَهُمْ هَذَا الإِقْرَارُ فِي الإِسْلَامِ؟"),
      back: t("No. It did not enter them into Islam — and the Messenger of Allah ﷺ fought them.", "لَا؛ «وَلَمْ يُدْخِلْهُمْ ذَلِكَ فِي الإِسْلَامِ»، وَقَاتَلَهُمْ رَسُولُ اللَّهِ ﷺ."),
    },
    {
      kind: "cloze",
      page: 61,
      front: t("“…the Disposer of all affairs — and that did not ______ them into Islam.”", "«المُدَبِّرُ لِجَمِيعِ الأُمُورِ، وَلَمْ ______ ذَلِكَ فِي الإِسْلَامِ»"),
      back: t("enter", "يُدْخِلْهُمْ"),
    },
    {
      kind: "evidence",
      page: 61,
      front: t("What is the evidence for the first rule?", "مَا الدَّلِيلُ عَلَى القَاعِدَةِ الأُولَى؟"),
      back: t(
        "“Say: Who provides for you from the heaven and the earth? Or who controls hearing and sight, and who brings the living out of the dead and brings the dead out of the living, and who disposes the affair? They will say: Allah. So say: Will you not then fear Him?” [Yūnus: 31]",
        "﴿قُلْ مَن يَرْزُقُكُم مِّنَ ٱلسَّمَآءِ وَٱلْأَرْضِ أَمَّن يَمْلِكُ ٱلسَّمْعَ وَٱلْأَبْصَٰرَ وَمَن يُخْرِجُ ٱلْحَىَّ مِنَ ٱلْمَيِّتِ وَيُخْرِجُ ٱلْمَيِّتَ مِنَ ٱلْحَىِّ وَمَن يُدَبِّرُ ٱلْأَمْرَ فَسَيَقُولُونَ ٱللَّهُ فَقُلْ أَفَلَا تَتَّقُونَ﴾ [يُونُس: ٣١]",
      ),
    },
    {
      kind: "point",
      page: 61,
      front: t("In that āyah, what is their answer when asked who provides and disposes the affair?", "فِي هَذِهِ الآيَةِ: مَا جَوَابُهُمْ إِذَا سُئِلُوا عَمَّنْ يَرْزُقُ وَيُدَبِّرُ الأَمْرَ؟"),
      back: t("“They will say: Allah” — they affirmed His lordship.", "﴿فَسَيَقُولُونَ ٱللَّهُ﴾ — فَهُمْ مُقِرُّونَ بِرُبُوبِيَّتِهِ."),
    },
    {
      kind: "cloze",
      page: 61,
      front: t("“…and who disposes the affair? They will say: Allah. So say: ______”", "﴿وَمَن يُدَبِّرُ ٱلْأَمْرَ فَسَيَقُولُونَ ٱللَّهُ فَقُلْ﴾ ______"),
      back: t("“Will you not then fear Him?”", "﴿أَفَلَا تَتَّقُونَ﴾"),
    },
  ],

  // ───────────── The Second Rule ─────────────
  [
    opening(2, 62, t("What is the second rule about?", "عَلَامَ تَدُورُ القَاعِدَةُ الثَّانِيَةُ؟")),
    {
      kind: "point",
      page: 62,
      front: t("State the second rule.", "اذْكُرِ القَاعِدَةَ الثَّانِيَةَ."),
      back: t(
        "That they say: we only called upon them and turned to them seeking nearness and intercession.",
        "«أَنَّهُمْ يَقُولُونَ: مَا دَعَوْنَاهُمْ وَتَوَجَّهْنَا إِلَيْهِمْ، إِلَّا لِطَلَبِ القُرْبَةِ وَالشَّفَاعَةِ»",
      ),
    },
    {
      kind: "list",
      page: 62,
      front: t("Which two things did they claim to be seeking by calling on others?", "مَا الأَمْرَانِ اللَّذَانِ زَعَمُوا أَنَّهُمْ يَطْلُبُونَهُمَا بِدُعَاءِ غَيْرِ اللَّهِ؟"),
      back: t("Nearness (al-qurbah) and intercession (ash-shafāʿah).", "القُرْبَةُ، وَالشَّفَاعَةُ."),
    },
    {
      kind: "evidence",
      page: 62,
      front: t("What is the evidence that they sought nearness?", "مَا دَلِيلُ القُرْبَةِ؟"),
      back: t(
        "“And those who take allies besides Him (say): ‘We only worship them that they may bring us nearer to Allah.’ Indeed, Allah will judge between them concerning that over which they differ. Indeed, Allah does not guide one who is a liar and a disbeliever.” [az-Zumar: 3]",
        "﴿وَٱلَّذِينَ ٱتَّخَذُوا۟ مِن دُونِهِۦٓ أَوْلِيَآءَ مَا نَعْبُدُهُمْ إِلَّا لِيُقَرِّبُونَآ إِلَى ٱللَّهِ زُلْفَىٰٓ إِنَّ ٱللَّهَ يَحْكُمُ بَيْنَهُمْ فِى مَا هُمْ فِيهِ يَخْتَلِفُونَ إِنَّ ٱللَّهَ لَا يَهْدِى مَنْ هُوَ كَٰذِبٌ كَفَّارٌ﴾ [الزُّمَر: ٣]",
      ),
    },
    {
      kind: "evidence",
      page: 62,
      front: t("What is the evidence that they sought intercession?", "مَا دَلِيلُ الشَّفَاعَةِ؟"),
      back: t(
        "“And they worship besides Allah that which neither harms them nor benefits them, and they say: ‘These are our intercessors with Allah.’ Say: Do you inform Allah of something He does not know in the heavens or on the earth? Exalted is He and high above what they associate with Him.” [Yūnus: 18]",
        "﴿وَيَعْبُدُونَ مِن دُونِ ٱللَّهِ مَا لَا يَضُرُّهُمْ وَلَا يَنفَعُهُمْ وَيَقُولُونَ هَٰٓؤُلَآءِ شُفَعَٰٓؤُنَا عِندَ ٱللَّهِ قُلْ أَتُنَبِّـُٔونَ ٱللَّهَ بِمَا لَا يَعْلَمُ فِى ٱلسَّمَٰوَٰتِ وَلَا فِى ٱلْأَرْضِ سُبْحَٰنَهُۥ وَتَعَٰلَىٰ عَمَّا يُشْرِكُونَ﴾ [يُونُس: ١٨]",
      ),
    },
    {
      kind: "list",
      page: 63,
      front: t("Intercession is of two kinds — what are they?", "الشَّفَاعَةُ شَفَاعَتَانِ؛ فَمَا هُمَا؟"),
      back: t("Negated intercession and affirmed intercession.", "«شَفَاعَةٌ مَنْفِيَّةٌ، وَشَفَاعَةٌ مُثْبَتَةٌ»"),
    },
    {
      kind: "term",
      page: 63,
      front: t("What is the negated intercession?", "مَا الشَّفَاعَةُ المَنْفِيَّةُ؟"),
      back: t("That which is sought from other than Allah, in what none but Allah is able to do.", "«مَا كَانَتْ تُطْلَبُ مِنْ غَيْرِ اللَّهِ فِيمَا لَا يَقْدِرُ عَلَيْهِ إِلَّا اللَّهُ»"),
    },
    {
      kind: "evidence",
      page: 63,
      front: t("What is the evidence for the negated intercession?", "مَا دَلِيلُ الشَّفَاعَةِ المَنْفِيَّةِ؟"),
      back: t(
        "“O you who believe, spend from what We have provided you before a Day comes in which there is no trade, no friendship and no intercession. And the disbelievers — they are the wrongdoers.” [al-Baqarah: 254]",
        "﴿يَٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوٓا۟ أَنفِقُوا۟ مِمَّا رَزَقْنَٰكُم مِّن قَبْلِ أَن يَأْتِىَ يَوْمٌ لَّا بَيْعٌ فِيهِ وَلَا خُلَّةٌ وَلَا شَفَٰعَةٌ وَٱلْكَٰفِرُونَ هُمُ ٱلظَّٰلِمُونَ﴾ [البَقَرَة: ٢٥٤]",
      ),
    },
    {
      kind: "term",
      page: 63,
      front: t("What is the affirmed intercession?", "مَا الشَّفَاعَةُ المُثْبَتَةُ؟"),
      back: t("That which is sought from Allah.", "«هِيَ الَّتِي تُطْلَبُ مِنَ اللَّهِ»"),
    },
    {
      kind: "point",
      page: 63,
      front: t("How does the author describe the intercessor?", "كَيْفَ وَصَفَ المُؤَلِّفُ الشَّافِعَ؟"),
      back: t("The intercessor is honoured with the intercession.", "«وَالشَّافِعُ مُكْرَمٌ بِالشَّفَاعَةِ»"),
    },
    {
      kind: "term",
      page: 64,
      front: t("Who is the one interceded for?", "مَنِ المَشْفُوعُ لَهُ؟"),
      back: t("Whoever Allah is pleased with in word and deed — after (His) permission.", "«مَنْ رَضِيَ اللَّهُ قَوْلَهُ وَعَمَلَهُ بَعْدَ الإِذْنِ»"),
    },
    {
      kind: "evidence",
      page: 64,
      front: t("Which āyah shows that intercession is only by Allah's permission?", "مَا الآيَةُ الدَّالَّةُ عَلَى أَنَّ الشَّفَاعَةَ لَا تَكُونُ إِلَّا بِإِذْنِ اللَّهِ؟"),
      back: t("“Who is it that can intercede with Him except by His permission?” [al-Baqarah: 255]", "﴿مَن ذَا ٱلَّذِى يَشْفَعُ عِندَهُۥٓ إِلَّا بِإِذْنِهِۦ﴾ [البَقَرَة: ٢٥٥]"),
    },
  ],

  // ───────────── The Third Rule ─────────────
  [
    opening(3, 65, t("What is the third rule about?", "عَلَامَ تَدُورُ القَاعِدَةُ الثَّالِثَةُ؟")),
    {
      kind: "point",
      page: 65,
      front: t("State the third rule.", "اذْكُرِ القَاعِدَةَ الثَّالِثَةَ."),
      back: t("That the Prophet ﷺ appeared among people who differed in what they worshipped.", "«أَنَّ النَّبِيَّ ﷺ ظَهَرَ عَلَى أُنَاسٍ مُتَفَرِّقِينَ فِي عِبَادَاتِهِمْ»"),
    },
    {
      kind: "list",
      page: 65,
      front: t("What did those people worship?", "مَاذَا كَانَ يَعْبُدُ أُولَئِكَ النَّاسُ؟"),
      back: t(
        "Some worshipped the sun and moon; some the angels; some the prophets and the righteous; some trees and stones.",
        "«مِنْهُمْ: مَنْ يَعْبُدُ الشَّمْسَ وَالقَمَرَ. وَمِنْهُمْ: مَنْ يَعْبُدُ المَلَائِكَةَ. وَمِنْهُمْ: مَنْ يَعْبُدُ الأَنْبِيَاءَ وَالصَّالِحِينَ. وَمِنْهُمْ: مَنْ يَعْبُدُ الأَشْجَارَ وَالأَحْجَارَ»",
      ),
    },
    {
      kind: "point",
      page: 65,
      front: t("Did the Messenger ﷺ treat them differently because of what they worshipped?", "هَلْ فَرَّقَ رَسُولُ اللَّهِ ﷺ بَيْنَهُمْ بِحَسَبِ مَعْبُودَاتِهِمْ؟"),
      back: t("No — he fought them, and did not differentiate between them.", "لَا؛ «وَقَاتَلَهُمْ رَسُولُ اللَّهِ ﷺ، وَلَمْ يُفَرِّقْ بَيْنَهُمْ»"),
    },
    {
      kind: "evidence",
      page: 65,
      front: t("What is the evidence that he fought them all without distinction?", "مَا الدَّلِيلُ عَلَى قِتَالِهِمْ جَمِيعًا دُونَ تَفْرِيقٍ؟"),
      back: t(
        "“And fight them until there is no fitnah and the religion, all of it, is for Allah.” [al-Anfāl: 39]",
        "﴿وَقَٰتِلُوهُمْ حَتَّىٰ لَا تَكُونَ فِتْنَةٌ وَيَكُونَ ٱلدِّينُ كُلُّهُۥ لِلَّهِ﴾ [الأَنْفَال: ٣٩]",
      ),
    },
    {
      kind: "evidence",
      page: 66,
      front: t("What is the evidence that some worshipped the sun and moon?", "مَا دَلِيلُ عِبَادَةِ الشَّمْسِ وَالقَمَرِ؟"),
      back: t(
        "“And of His signs are the night and the day, and the sun and the moon. Do not prostrate to the sun nor to the moon, but prostrate to Allah who created them, if it is Him you worship.” [Fuṣṣilat: 37]",
        "﴿وَمِنْ ءَايَٰتِهِ ٱلَّيْلُ وَٱلنَّهَارُ وَٱلشَّمْسُ وَٱلْقَمَرُ لَا تَسْجُدُوا۟ لِلشَّمْسِ وَلَا لِلْقَمَرِ وَٱسْجُدُوا۟ لِلَّهِ ٱلَّذِى خَلَقَهُنَّ إِن كُنتُمْ إِيَّاهُ تَعْبُدُونَ﴾ [فُصِّلَت: ٣٧]",
      ),
    },
    {
      kind: "evidence",
      page: 66,
      front: t("What is the evidence that some worshipped the angels?", "مَا دَلِيلُ عِبَادَةِ المَلَائِكَةِ؟"),
      back: t(
        "“And the Day He will gather them all, then say to the angels: ‘Was it you these used to worship?’” [Sabaʾ: 40]",
        "﴿وَيَوْمَ يَحْشُرُهُمْ جَمِيعًا ثُمَّ يَقُولُ لِلْمَلَٰٓئِكَةِ أَهَٰٓؤُلَآءِ إِيَّاكُمْ كَانُوا۟ يَعْبُدُونَ﴾ [سَبَأ: ٤٠]",
      ),
      note: t("The author continues with the next āyah (Sabaʾ: 41).", "وَسَاقَ المُؤَلِّفُ الآيَةَ الَّتِي بَعْدَهَا أَيْضًا (سَبَأ: ٤١)."),
    },
    {
      kind: "evidence",
      page: 66,
      front: t("What is the evidence that some worshipped the prophets?", "مَا دَلِيلُ عِبَادَةِ الأَنْبِيَاءِ؟"),
      back: t(
        "“And when Allah will say: O ʿĪsā, son of Maryam, did you say to the people: ‘Take me and my mother as gods besides Allah’?” [al-Māʾidah: 116]",
        "﴿وَإِذْ قَالَ ٱللَّهُ يَٰعِيسَى ٱبْنَ مَرْيَمَ ءَأَنتَ قُلْتَ لِلنَّاسِ ٱتَّخِذُونِى وَأُمِّىَ إِلَٰهَيْنِ مِن دُونِ ٱللَّهِ﴾ [المَائِدَة: ١١٦]",
      ),
    },
    {
      kind: "evidence",
      page: 67,
      front: t("What is the evidence that some worshipped the righteous?", "مَا دَلِيلُ عِبَادَةِ الصَّالِحِينَ؟"),
      back: t(
        "“Those whom they call upon themselves seek the means of nearness to their Lord, whichever of them is nearest, and they hope for His mercy and fear His punishment.” [al-Isrāʾ: 57]",
        "﴿أُو۟لَٰٓئِكَ ٱلَّذِينَ يَدْعُونَ يَبْتَغُونَ إِلَىٰ رَبِّهِمُ ٱلْوَسِيلَةَ أَيُّهُمْ أَقْرَبُ وَيَرْجُونَ رَحْمَتَهُۥ وَيَخَافُونَ عَذَابَهُۥٓ﴾ [الإِسْرَاء: ٥٧]",
      ),
      note: t("The author quotes al-Isrāʾ 56–57; this is the heart of it.", "سَاقَ المُؤَلِّفُ الآيَتَيْنِ (الإِسْرَاء: ٥٦–٥٧)، وَهَذَا مَوْضِعُ الشَّاهِدِ."),
    },
    {
      kind: "evidence",
      page: 67,
      front: t("What is the evidence that some worshipped trees and stones?", "مَا دَلِيلُ عِبَادَةِ الأَشْجَارِ وَالأَحْجَارِ؟"),
      back: t(
        "“Have you considered al-Lāt and al-ʿUzzā, and Manāt, the third, the other?” [an-Najm: 19–20] — and the ḥadīth of Abū Wāqid al-Laythī.",
        "﴿أَفَرَءَيْتُمُ ٱللَّٰتَ وَٱلْعُزَّىٰ * وَمَنَوٰةَ ٱلثَّالِثَةَ ٱلْأُخْرَىٰٓ﴾ [النَّجْم: ١٩–٢٠]، وَحَدِيثُ أَبِي وَاقِدٍ اللَّيْثِيِّ.",
      ),
    },
    {
      kind: "hadith",
      page: 67,
      front: t("How does Abū Wāqid al-Laythī describe the Companions as they set out for Ḥunayn?", "كَيْفَ وَصَفَ أَبُو وَاقِدٍ اللَّيْثِيُّ حَالَهُمْ حِينَ خَرَجُوا إِلَى حُنَيْنٍ؟"),
      back: t("“We were new to Islam, having recently left disbelief.”", "«وَنَحْنُ حُدَثَاءُ عَهْدٍ بِكُفْرٍ»"),
    },
    {
      kind: "hadith",
      page: 67,
      front: t("What was Dhāt Anwāṭ?", "مَا ذَاتُ أَنْوَاطٍ؟"),
      back: t("A lote tree of the idolaters, at which they stayed devoted and on which they hung their weapons.", "«سِدْرَةٌ يَعْكُفُونَ عِنْدَهَا وَيَنُوطُونَ بِهَا أَسْلِحَتَهُمْ»"),
    },
    {
      kind: "hadith",
      page: 67,
      front: t("When they passed another lote tree, what did they ask for?", "لَمَّا مَرُّوا بِسِدْرَةٍ، مَاذَا طَلَبُوا؟"),
      back: t("“O Messenger of Allah, make for us a Dhāt Anwāṭ just as they have a Dhāt Anwāṭ.”", "«يَا رَسُولَ اللَّهِ، اجْعَلْ لَنَا ذَاتَ أَنْوَاطٍ كَمَا لَهُمْ ذَاتُ أَنْوَاطٍ»"),
    },
    {
      kind: "hadith",
      page: 68,
      front: t("What did the Messenger of Allah ﷺ reply?", "بِمَ أَجَابَهُمْ رَسُولُ اللَّهِ ﷺ؟"),
      back: t(
        "“Allāhu akbar! These are the ways (of those before you). By the One in whose hand is my soul, you have said just what the Children of Israel said to Mūsā: ‘Make for us a god just as they have gods.’”",
        "«اللَّهُ أَكْبَرُ! إِنَّهَا السُّنَنُ؛ قُلْتُمْ وَالَّذِي نَفْسِي بِيَدِهِ كَمَا قَالَتْ بَنُو إِسْرَائِيلَ لِمُوسَى: ﴿ٱجْعَل لَّنَآ إِلَٰهًا كَمَا لَهُمْ ءَالِهَةٌ﴾»",
      ),
    },
  ],

  // ───────────── The Fourth Rule ─────────────
  [
    opening(4, 69, t("What is the fourth rule about?", "عَلَامَ تَدُورُ القَاعِدَةُ الرَّابِعَةُ؟")),
    {
      kind: "point",
      page: 69,
      front: t("State the fourth rule.", "اذْكُرِ القَاعِدَةَ الرَّابِعَةَ."),
      back: t(
        "That the idolaters of our time are graver in shirk than the first ones: the first ones committed shirk in ease and were sincere in hardship, while the idolaters of our time are constant in their shirk, in ease and in hardship.",
        "«أَنَّ مُشْرِكِي زَمَانِنَا أَغْلَظُ شِرْكًا مِنَ الأَوَّلِينَ؛ لِأَنَّ الأَوَّلِينَ يُشْرِكُونَ فِي الرَّخَاءِ وَيُخْلِصُونَ فِي الشِّدَّةِ، وَمُشْرِكِي زَمَانِنَا شِرْكُهُمْ دَائِمٌ فِي الرَّخَاءِ وَالشِّدَّةِ»",
      ),
    },
    {
      kind: "cloze",
      page: 69,
      front: t("“The idolaters of our time are ______ in shirk than the first ones.”", "«أَنَّ مُشْرِكِي زَمَانِنَا ______ شِرْكًا مِنَ الأَوَّلِينَ»"),
      back: t("graver", "أَغْلَظُ"),
    },
    {
      kind: "point",
      page: 69,
      front: t("When did the first idolaters commit shirk, and when were they sincere?", "مَتَى كَانَ الأَوَّلُونَ يُشْرِكُونَ؟ وَمَتَى كَانُوا يُخْلِصُونَ؟"),
      back: t("They committed shirk in times of ease, and were sincere in times of hardship.", "«يُشْرِكُونَ فِي الرَّخَاءِ وَيُخْلِصُونَ فِي الشِّدَّةِ»"),
    },
    {
      kind: "point",
      page: 69,
      front: t("What is the shirk of the idolaters of our time like?", "مَا حَالُ شِرْكِ مُشْرِكِي زَمَانِنَا؟"),
      back: t("It is constant, in ease and in hardship alike.", "«شِرْكُهُمْ دَائِمٌ فِي الرَّخَاءِ وَالشِّدَّةِ»"),
    },
    {
      kind: "evidence",
      page: 69,
      front: t("What is the evidence for the fourth rule?", "مَا الدَّلِيلُ عَلَى القَاعِدَةِ الرَّابِعَةِ؟"),
      back: t(
        "“And when they board a ship, they call upon Allah, making the religion sincerely His; but when He delivers them to land, at once they associate partners with Him.” [al-ʿAnkabūt: 65]",
        "﴿فَإِذَا رَكِبُوا۟ فِى ٱلْفُلْكِ دَعَوُا۟ ٱللَّهَ مُخْلِصِينَ لَهُ ٱلدِّينَ فَلَمَّا نَجَّىٰهُمْ إِلَى ٱلْبَرِّ إِذَا هُمْ يُشْرِكُونَ﴾ [العَنْكَبُوت: ٦٥]",
      ),
    },
    {
      kind: "point",
      page: 69,
      front: t("In that āyah, what do they do at sea, and what once delivered to land?", "فِي هَذِهِ الآيَةِ: مَاذَا يَفْعَلُونَ فِي البَحْرِ؟ وَمَاذَا إِذَا نَجَوْا إِلَى البَرِّ؟"),
      back: t(
        "At sea they call upon Allah sincerely; once delivered to land, they associate partners again.",
        "فِي الفُلْكِ: ﴿دَعَوُا۟ ٱللَّهَ مُخْلِصِينَ لَهُ ٱلدِّينَ﴾، وَفِي البَرِّ: ﴿إِذَا هُمْ يُشْرِكُونَ﴾.",
      ),
    },
  ],
];

export const QAWAID_ARBAA: FlashcardBook = {
  slug: "al-qawaid-al-arba",
  title: t("al-Qawāʿid al-Arbaʿ — The Four Rules", "القَوَاعِدُ الأَرْبَعُ"),
  shortTitle: "al-Qawāʿid al-Arbaʿ",
  author: t("Shaykh Muḥammad ibn ʿAbd al-Wahhāb", "الشَّيْخُ مُحَمَّدُ بْنُ عَبْدِ الوَهَّابِ"),
  chapters: t("parts", "الأَقْسَامُ"),
  subject: "ʿAqīdah and Tawḥīd",
  blurb: "The four rules that tell tawḥīd apart from shirk — the introduction and one deck per rule.",
  source: PIK_EDITION,
  sections: CARDS.map((cards, i) => ({ number: i + 1, label: LABELS[i], title: TITLES[i], pages: PAGES[i], cards })),
};

