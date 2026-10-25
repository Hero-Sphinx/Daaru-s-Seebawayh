import type { BilingualText, Flashcard, FlashcardBook } from "@/types";
import { PIK_EDITION } from "./sources";

/**
 * al-ʿAqīdah al-Wāsiṭiyyah (العَقِيدَةُ الوَاسِطِيَّةُ) by Shaykh al-Islām Ibn Taymiyyah,
 * in short decks that follow the book: the creed, the attributes (and the āyāt
 * and aḥādīth the Shaykh lists for each), the middle way of Ahl as-Sunnah, the
 * Last Day, the decree, īmān, the Companions, and the conduct of Ahl as-Sunnah.
 *
 * Arabic: the Mutūn Ṭālib al-ʿIlm edition as printed, āyāt in its Uthmani
 * script (taken from the Qur'an table). English: our translation — the edition
 * has none. `page` is the edition's printed page number.
 */

const t = (en: string, ar: string): BilingualText => ({ en, ar });

const LABELS: BilingualText[] = [
  t("The Creed of the Saved Sect", "اعْتِقَادُ الفِرْقَةِ النَّاجِيَةِ"),
  t("Belief in the Attributes", "الإِيمَانُ بِالصِّفَاتِ"),
  t("The Qur'an on the Attributes (1)", "الصِّفَاتُ فِي القُرْآنِ (١)"),
  t("The Qur'an on the Attributes (2)", "الصِّفَاتُ فِي القُرْآنِ (٢)"),
  t("The Qur'an on the Attributes (3)", "الصِّفَاتُ فِي القُرْآنِ (٣)"),
  t("The Qur'an on the Attributes (4)", "الصِّفَاتُ فِي القُرْآنِ (٤)"),
  t("The Sunnah on the Attributes", "الصِّفَاتُ فِي السُّنَّةِ"),
  t("The Middle Way", "الوَسَطِيَّةُ"),
  t("The Qur'an and the Seeing of Allah", "القُرْآنُ وَالرُّؤْيَةُ"),
  t("The Last Day", "اليَوْمُ الآخِرُ"),
  t("The Decree", "القَدَرُ"),
  t("Īmān and the Sinner", "الإِيمَانُ وَالفَاسِقُ"),
  t("The Companions", "الصَّحَابَةُ"),
  t("The Prophet's Family, Wives and Companions", "آلُ البَيْتِ وَالأَزْوَاجُ وَالصَّحَابَةُ"),
  t("Karāmāt and the Three Sources", "الكَرَامَاتُ وَالأُصُولُ الثَّلَاثَةُ"),
  t("The Conduct of Ahl as-Sunnah", "أَخْلَاقُ أَهْلِ السُّنَّةِ"),
];

const TITLES: BilingualText[] = [
  t("The creed of Ahl as-Sunnah wal-Jamāʿah — the six pillars", "اعْتِقَادُ أَهْلِ السُّنَّةِ وَالجَمَاعَةِ: أَرْكَانُ الإِيمَانِ"),
  t("Affirming what Allah described Himself with — without distorting, denying, asking how, or likening", "الإِيمَانُ بِالصِّفَاتِ مِنْ غَيْرِ تَحْرِيفٍ وَلَا تَعْطِيلٍ، وَمِنْ غَيْرِ تَكْيِيفٍ وَلَا تَمْثِيلٍ"),
  t("Negation and affirmation; al-Ikhlāṣ, Āyat al-Kursī, and His knowledge, strength, hearing and seeing", "النَّفْيُ وَالإِثْبَاتُ، وَسُورَةُ الإِخْلَاصِ، وَآيَةُ الكُرْسِيِّ، وَالعِلْمُ وَالقُوَّةُ وَالسَّمْعُ وَالبَصَرُ"),
  t("Will, love, mercy, pleasure and anger, coming, and the Face", "المَشِيئَةُ وَالإِرَادَةُ، وَالمَحَبَّةُ، وَالرَّحْمَةُ، وَالرِّضَا وَالغَضَبُ، وَالمَجِيءُ، وَالوَجْهُ"),
  t("The Hands and Eyes, hearing and seeing, plotting, pardon, might — and that He has no equal", "اليَدَانِ، وَالعَيْنَانِ، وَالسَّمْعُ وَالبَصَرُ، وَالمَكْرُ، وَالعَفْوُ، وَالعِزَّةُ، وَنَفْيُ النِّدِّ"),
  t("Rising over the Throne, highness, withness, speech, the Qur'an, and seeing Him", "الاسْتِوَاءُ، وَالعُلُوُّ، وَالمَعِيَّةُ، وَالكَلَامُ، وَالقُرْآنُ، وَالرُّؤْيَةُ"),
  t("What the Messenger ﷺ described his Lord with", "مَا وَصَفَ بِهِ الرَّسُولُ ﷺ رَبَّهُ"),
  t("Ahl as-Sunnah are the middle among the sects; highness, withness and nearness", "أَهْلُ السُّنَّةِ وَسَطٌ فِي الفِرَقِ، وَالعُلُوُّ وَالمَعِيَّةُ وَالقُرْبُ"),
  t("The Qur'an is the Speech of Allah; the believers will see Him", "القُرْآنُ كَلَامُ اللَّهِ، وَرُؤْيَةُ المُؤْمِنِينَ رَبَّهُمْ"),
  t("What comes after death — from the grave to Paradise and the Fire", "مَا يَكُونُ بَعْدَ المَوْتِ: مِنَ القَبْرِ إِلَى الجَنَّةِ وَالنَّارِ"),
  t("The two levels of belief in the decree", "دَرَجَتَا الإِيمَانِ بِالقَدَرِ"),
  t("The religion and īmān are word and deed; the sinner is not expelled from īmān", "الدِّينُ وَالإِيمَانُ قَوْلٌ وَعَمَلٌ، وَالفَاسِقُ المِلِّيُّ"),
  t("Sound hearts and tongues towards the Companions; their ranks", "سَلَامَةُ القُلُوبِ وَالأَلْسِنَةِ لِلصَّحَابَةِ، وَمَرَاتِبُهُمْ"),
  t("Loving the Prophet's family and wives; holding back over the Companions' disputes", "مَحَبَّةُ آلِ البَيْتِ وَالأَزْوَاجِ، وَالإِمْسَاكُ عَمَّا شَجَرَ بَيْنَ الصَّحَابَةِ"),
  t("Belief in the karāmāt of the awliyāʾ; following the Book, the Sunnah and the consensus", "التَّصْدِيقُ بِكَرَامَاتِ الأَوْلِيَاءِ، وَاتِّبَاعُ الكِتَابِ وَالسُّنَّةِ وَالإِجْمَاعِ"),
  t("Enjoining good, noble character, and who the saved sect are", "الأَمْرُ بِالمَعْرُوفِ، وَمَكَارِمُ الأَخْلَاقِ، وَصِفَةُ الفِرْقَةِ النَّاجِيَةِ"),
];

/** First and last printed page of each deck. */
const PAGES: [number, number][] = [
  [119, 119],
  [120, 121],
  [122, 125],
  [126, 131],
  [132, 140],
  [141, 148],
  [149, 158],
  [159, 162],
  [163, 164],
  [165, 176],
  [177, 182],
  [183, 185],
  [186, 191],
  [192, 198],
  [199, 202],
  [203, 210],
];

const opening = (i: number, page: number, front: BilingualText): Flashcard => ({ kind: "principle", page, front, back: TITLES[i] });

/** "Which attribute does this āyah affirm?" — the āyah on the front, the attribute on the back. */
function affirms(page: number, ayah: BilingualText, attribute: BilingualText): Flashcard {
  return {
    kind: "evidence",
    page,
    front: t(`Which attribute of Allah does this affirm? ${ayah.en}`, `أَيُّ صِفَةٍ لِلَّهِ تُثْبِتُهَا هَذِهِ الآيَةُ؟ ${ayah.ar}`),
    back: attribute,
  };
}

const CARDS: Flashcard[][] = [
  // ───────────── 1 · The creed of the saved sect ─────────────
  [
    opening(0, 119, t("What does the book open with?", "بِمَ افْتُتِحَ الكِتَابُ؟")),
    {
      kind: "point",
      page: 119,
      front: t("With what did Allah send His Messenger, according to the opening praise?", "بِمَ أَرْسَلَ اللَّهُ رَسُولَهُ كَمَا فِي خُطْبَةِ الكِتَابِ؟"),
      back: t(
        "With guidance and the religion of truth, to make it prevail over all religion — and sufficient is Allah as a witness.",
        "«الحَمْدُ لِلَّهِ الَّذِي أَرْسَلَ رَسُولَهُ بِالهُدَى وَدِينِ الحَقِّ لِيُظْهِرَهُ عَلَى الدِّينِ كُلِّهِ، وَكَفَى بِاللَّهِ شَهِيدًا»",
      ),
    },
    {
      kind: "cloze",
      page: 119,
      front: t("“I bear witness that there is no god but Allah alone, without partner — ______.”", "«وَأَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، ______»"),
      back: t("affirming Him and singling Him out", "إِقْرَارًا بِهِ وَتَوْحِيدًا"),
    },
    {
      kind: "term",
      page: 119,
      front: t("How does the author describe the people whose creed this is?", "بِمَ وَصَفَ المُؤَلِّفُ أَصْحَابَ هَذَا الاعْتِقَادِ؟"),
      back: t(
        "The saved, victorious sect until the Hour is established — Ahl as-Sunnah wal-Jamāʿah.",
        "«الفِرْقَةِ النَّاجِيَةِ المَنْصُورَةِ إِلَى قِيَامِ السَّاعَةِ - أَهْلِ السُّنَّةِ وَالجَمَاعَةِ -»",
      ),
    },
    {
      kind: "list",
      page: 119,
      front: t("What is the creed of the saved sect?", "مَا اعْتِقَادُ الفِرْقَةِ النَّاجِيَةِ؟"),
      back: t(
        "Belief in Allah, His angels, His books, His messengers, the resurrection after death, and belief in the decree — its good and its bad.",
        "«الإِيمَانُ بِاللَّهِ، وَمَلَائِكَتِهِ، وَكُتُبِهِ، وَرُسُلِهِ، وَالبَعْثِ بَعْدَ المَوْتِ، وَالإِيمَانُ بِالقَدَرِ خَيْرِهِ وَشَرِّهِ»",
      ),
    },
    {
      kind: "cloze",
      page: 119,
      front: t("“…the saved, ______ sect until the Hour is established.”", "«اعْتِقَادُ الفِرْقَةِ النَّاجِيَةِ ______ إِلَى قِيَامِ السَّاعَةِ»"),
      back: t("victorious (aided)", "المَنْصُورَةِ"),
    },
  ],

  // ───────────── 2 · Belief in the attributes ─────────────
  [
    opening(1, 120, t("What principle of belief in Allah does this section lay down?", "مَا الأَصْلُ الَّذِي يُقَرِّرُهُ هَذَا الفَصْلُ فِي الإِيمَانِ بِاللَّهِ؟")),
    {
      kind: "point",
      page: 120,
      front: t("What is part of belief in Allah?", "مَا الَّذِي يَدْخُلُ فِي الإِيمَانِ بِاللَّهِ؟"),
      back: t(
        "Believing in what He described Himself with in His Book, and what His Messenger ﷺ described Him with.",
        "«الإِيمَانُ بِمَا وَصَفَ بِهِ نَفْسَهُ فِي كِتَابِهِ، وَبِمَا وَصَفَهُ بِهِ رَسُولُهُ ﷺ»",
      ),
    },
    {
      kind: "list",
      page: 120,
      front: t("Without which four things do they believe in His attributes?", "مِنْ غَيْرِ أَيِّ أَرْبَعَةِ أُمُورٍ يُؤْمِنُونَ بِالصِّفَاتِ؟"),
      back: t("Without distortion (taḥrīf) or denial (taʿṭīl), and without asking how (takyīf) or likening (tamthīl).", "«مِنْ غَيْرِ تَحْرِيفٍ وَلَا تَعْطِيلٍ، وَمِنْ غَيْرِ تَكْيِيفٍ وَلَا تَمْثِيلٍ»"),
    },
    {
      kind: "evidence",
      page: 120,
      front: t("Which āyah sums up their belief about Allah?", "مَا الآيَةُ الَّتِي يُؤْمِنُونَ بِهَا جَامِعَةً لِهَذَا الأَصْلِ؟"),
      back: t("“There is nothing like Him, and He is the All-Hearing, the All-Seeing.” [ash-Shūrā: 11]", "﴿لَيْسَ كَمِثْلِهِۦ شَىْءٌ وَهُوَ ٱلسَّمِيعُ ٱلْبَصِيرُ﴾ [الشُّورَى: ١١]"),
    },
    {
      kind: "list",
      page: 120,
      front: t("What do Ahl as-Sunnah not do with the attributes?", "مَاذَا لَا يَفْعَلُ أَهْلُ السُّنَّةِ فِي الصِّفَاتِ؟"),
      back: t(
        "They do not negate from Him what He described Himself with; they do not distort words from their places; they do not deviate regarding the names and verses of Allah; and they do not ask how, nor liken His attributes to those of His creation.",
        "«فَلَا يَنْفُونَ عَنْهُ مَا وَصَفَ بِهِ نَفْسَهُ. وَلَا يُحَرِّفُونَ الكَلِمَ عَنْ مَوَاضِعِهِ. وَلَا يُلْحِدُونَ فِي أَسْمَاءِ اللَّهِ وَآيَاتِهِ. وَلَا يُكَيِّفُونَ، وَلَا يُمَثِّلُونَ صِفَاتِهِ بِصِفَاتِ خَلْقِهِ»",
      ),
    },
    {
      kind: "list",
      page: 120,
      front: t("Why do they not liken Him to His creation?", "لِمَاذَا لَا يُمَثِّلُونَ صِفَاتِهِ بِصِفَاتِ خَلْقِهِ؟"),
      back: t(
        "Because He has no namesake, no equal and no rival, and He is not compared with His creation.",
        "«لِأَنَّهُ سُبْحَانَهُ لَا سَمِيَّ لَهُ، وَلَا كُفْءَ لَهُ، وَلَا نِدَّ لَهُ، وَلَا يُقَاسُ بِخَلْقِهِ»",
      ),
    },
    {
      kind: "point",
      page: 120,
      front: t("Why is what Allah says about Himself to be accepted?", "لِمَاذَا يُقْبَلُ مَا وَصَفَ اللَّهُ بِهِ نَفْسَهُ؟"),
      back: t(
        "Because He knows best about Himself and about others, and is the most truthful in speech and the best in words of all His creation.",
        "«فَإِنَّهُ سُبْحَانَهُ أَعْلَمُ بِنَفْسِهِ وَبِغَيْرِهِ، وَأَصْدَقُ قِيلًا، وَأَحْسَنُ حَدِيثًا مِنْ خَلْقِهِ»",
      ),
    },
    {
      kind: "point",
      page: 121,
      front: t("How does the author describe His messengers, and whom does he contrast them with?", "كَيْفَ وَصَفَ رُسُلَهُ؟ وَبِمَنْ قَابَلَهُمْ؟"),
      back: t(
        "They are truthful and believed — unlike those who say about Him what they do not know.",
        "«ثُمَّ رُسُلُهُ صَادِقُونَ مُصَدَّقُونَ، بِخِلَافِ الَّذِينَ يَقُولُونَ عَلَيْهِ مَا لَا يَعْلَمُونَ»",
      ),
    },
    {
      kind: "evidence",
      page: 121,
      front: t("Which āyāt does he cite for this?", "مَا الآيَاتُ الَّتِي اسْتَشْهَدَ بِهَا لِذَلِكَ؟"),
      back: t(
        "“Exalted is your Lord, the Lord of might, above what they describe. And peace be upon the messengers. And all praise is for Allah, Lord of the worlds.” [aṣ-Ṣāffāt: 180–182]",
        "﴿سُبْحَٰنَ رَبِّكَ رَبِّ ٱلْعِزَّةِ عَمَّا يَصِفُونَ * وَسَلَٰمٌ عَلَى ٱلْمُرْسَلِينَ * وَٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ﴾ [الصَّافَّات: ١٨٠–١٨٢]",
      ),
    },
    {
      kind: "point",
      page: 121,
      front: t("Why did Allah glorify Himself and send peace upon the messengers in those āyāt?", "لِمَ سَبَّحَ اللَّهُ نَفْسَهُ وَسَلَّمَ عَلَى المُرْسَلِينَ فِي هَذِهِ الآيَاتِ؟"),
      back: t(
        "He glorified Himself above what those who oppose the messengers describe Him with, and sent peace on the messengers because what they said is free of deficiency and fault.",
        "«فَسَبَّحَ نَفْسَهُ عَمَّا وَصَفَهُ بِهِ المُخَالِفُونَ لِلرُّسُلِ، وَسَلَّمَ عَلَى المُرْسَلِينَ؛ لِسَلَامَةِ مَا قَالُوهُ مِنَ النَّقْصِ وَالعَيْبِ»",
      ),
    },
  ],

  // ───────────── 3 · Negation and affirmation; al-Ikhlāṣ and Āyat al-Kursī ─────────────
  [
    opening(2, 122, t("What does this part of the Qur'anic evidences cover (1)?", "مَا الَّذِي يَتَنَاوَلُهُ هَذَا القِسْمُ مِنَ الأَدِلَّةِ القُرْآنِيَّةِ (١)؟")),
    {
      kind: "point",
      page: 122,
      front: t("What has Allah combined in what He described Himself with?", "بَيْنَ أَيِّ أَمْرَيْنِ جَمَعَ اللَّهُ فِيمَا وَصَفَ بِهِ نَفْسَهُ؟"),
      back: t("Negation and affirmation.", "«بَيْنَ النَّفْيِ وَالإِثْبَاتِ»"),
    },
    {
      kind: "point",
      page: 122,
      front: t("Why do Ahl as-Sunnah never turn away from what the messengers brought?", "لِمَاذَا لَا يَعْدِلُ أَهْلُ السُّنَّةِ عَمَّا جَاءَتْ بِهِ المُرْسَلُونَ؟"),
      back: t(
        "Because it is the straight path — the path of those Allah has blessed: the prophets, the truthful, the martyrs and the righteous.",
        "«فَإِنَّهُ الصِّرَاطُ المُسْتَقِيمُ، صِرَاطُ الَّذِينَ أَنْعَمَ اللَّهُ عَلَيْهِمْ مِنَ النَّبِيِّينَ وَالصِّدِّيقِينَ وَالشُّهَدَاءِ وَالصَّالِحِينَ»",
      ),
    },
    {
      kind: "point",
      page: 122,
      front: t("Which sūrah is equal to a third of the Qur'an?", "أَيُّ سُورَةٍ تَعْدِلُ ثُلُثَ القُرْآنِ؟"),
      back: t("Sūrat al-Ikhlāṣ.", "«سُورَةُ الإِخْلَاصِ، الَّتِي تَعْدِلُ ثُلُثَ القُرْآنِ»"),
    },
    {
      kind: "evidence",
      page: 122,
      front: t("What did Allah describe Himself with in Sūrat al-Ikhlāṣ?", "مَا الَّذِي وَصَفَ اللَّهُ بِهِ نَفْسَهُ فِي سُورَةِ الإِخْلَاصِ؟"),
      back: t(
        "“Say: He is Allah, the One. Allah, the Self-Sufficient Master. He neither begets nor is born, and there is none equal to Him.” [al-Ikhlāṣ: 1–4]",
        "﴿قُلْ هُوَ ٱللَّهُ أَحَدٌ * ٱللَّهُ ٱلصَّمَدُ * لَمْ يَلِدْ وَلَمْ يُولَدْ * وَلَمْ يَكُن لَّهُۥ كُفُوًا أَحَدٌۢ﴾ [الإِخْلَاص: ١–٤]",
      ),
    },
    {
      kind: "point",
      page: 123,
      front: t("Which is the greatest āyah in His Book?", "مَا أَعْظَمُ آيَةٍ فِي كِتَابِ اللَّهِ؟"),
      back: t("Āyat al-Kursī: “Allah — there is no god but Him, the Ever-Living, the Sustainer of all…” [al-Baqarah: 255]", "آيَةُ الكُرْسِيِّ: ﴿ٱللَّهُ لَآ إِلَٰهَ إِلَّا هُوَ ٱلْحَىُّ ٱلْقَيُّومُ﴾ [البَقَرَة: ٢٥٥]"),
    },
    {
      kind: "point",
      page: 123,
      front: t("What is the virtue of reciting Āyat al-Kursī at night?", "مَا فَضْلُ قِرَاءَةِ آيَةِ الكُرْسِيِّ فِي اللَّيْلَةِ؟"),
      back: t(
        "Whoever recites it in a night, a guardian from Allah remains over him, and no devil comes near him until morning.",
        "«مَنْ قَرَأَ هَذِهِ الآيَةَ فِي لَيْلَةٍ؛ لَمْ يَزَلْ عَلَيْهِ مِنَ اللَّهِ حَافِظٌ، وَلَا يَقْرَبُهُ شَيْطَانٌ حَتَّى يُصْبِحَ»",
      ),
    },
    affirms(
      123,
      t("“And rely upon the Ever-Living who does not die.” [al-Furqān: 58]", "﴿وَتَوَكَّلْ عَلَى ٱلْحَىِّ ٱلَّذِى لَا يَمُوتُ﴾ [الفُرْقَان: ٥٨]"),
      t("Life — He is the Ever-Living, who does not die.", "الحَيَاةُ؛ فَهُوَ الحَيُّ الَّذِي لَا يَمُوتُ."),
    ),
    {
      kind: "evidence",
      page: 124,
      front: t("Which four names of Allah come together in al-Ḥadīd: 3?", "مَا الأَسْمَاءُ الأَرْبَعَةُ المُجْتَمِعَةُ فِي سُورَةِ الحَدِيدِ: ٣؟"),
      back: t(
        "“He is the First and the Last, the Manifest and the Hidden, and He has knowledge of all things.” [al-Ḥadīd: 3]",
        "﴿هُوَ ٱلْأَوَّلُ وَٱلْءَاخِرُ وَٱلظَّٰهِرُ وَٱلْبَاطِنُ وَهُوَ بِكُلِّ شَىْءٍ عَلِيمٌ﴾ [الحَدِيد: ٣]",
      ),
    },
    affirms(
      124,
      t(
        "“He knows what penetrates into the earth and what emerges from it, and what descends from the heaven and what ascends into it.” [Sabaʾ: 2]",
        "﴿يَعْلَمُ مَا يَلِجُ فِى ٱلْأَرْضِ وَمَا يَخْرُجُ مِنْهَا وَمَا يَنزِلُ مِنَ ٱلسَّمَآءِ وَمَا يَعْرُجُ فِيهَا﴾ [سَبَأ: ٢]",
      ),
      t("Knowledge — encompassing all things.", "العِلْمُ المُحِيطُ بِكُلِّ شَيْءٍ."),
    ),
    {
      kind: "evidence",
      page: 124,
      front: t("Which āyah tells that the keys of the unseen are with Allah alone?", "مَا الآيَةُ الَّتِي فِيهَا أَنَّ مَفَاتِحَ الغَيْبِ عِنْدَ اللَّهِ وَحْدَهُ؟"),
      back: t(
        "“And with Him are the keys of the unseen; none knows them except Him. He knows what is on land and in the sea. Not a leaf falls but He knows it, nor a grain in the darkness of the earth, nor anything moist or dry, but that it is in a clear record.” [al-Anʿām: 59]",
        "﴿وَعِندَهُۥ مَفَاتِحُ ٱلْغَيْبِ لَا يَعْلَمُهَآ إِلَّا هُوَ وَيَعْلَمُ مَا فِى ٱلْبَرِّ وَٱلْبَحْرِ وَمَا تَسْقُطُ مِن وَرَقَةٍ إِلَّا يَعْلَمُهَا وَلَا حَبَّةٍ فِى ظُلُمَٰتِ ٱلْأَرْضِ وَلَا رَطْبٍ وَلَا يَابِسٍ إِلَّا فِى كِتَٰبٍ مُّبِينٍ﴾ [الأَنْعَام: ٥٩]",
      ),
    },
    affirms(
      124,
      t("“And no female conceives nor gives birth except with His knowledge.” [Fāṭir: 11]", "﴿وَمَا تَحْمِلُ مِنْ أُنثَىٰ وَلَا تَضَعُ إِلَّا بِعِلْمِهِۦ﴾ [فَاطِر: ١١]"),
      t("Knowledge.", "العِلْمُ."),
    ),
    {
      kind: "evidence",
      page: 124,
      front: t("Which āyah joins His power over all things with His knowledge encompassing all things?", "مَا الآيَةُ الَّتِي جَمَعَتْ بَيْنَ قُدْرَتِهِ عَلَى كُلِّ شَيْءٍ وَإِحَاطَةِ عِلْمِهِ بِكُلِّ شَيْءٍ؟"),
      back: t(
        "“That you may know that Allah is over all things competent, and that Allah has encompassed all things in knowledge.” [aṭ-Ṭalāq: 12]",
        "﴿لِتَعْلَمُوٓا۟ أَنَّ ٱللَّهَ عَلَىٰ كُلِّ شَىْءٍ قَدِيرٌ وَأَنَّ ٱللَّهَ قَدْ أَحَاطَ بِكُلِّ شَىْءٍ عِلْمًۢا﴾ [الطَّلَاق: ١٢]",
      ),
    },
    affirms(
      125,
      t("“Indeed, it is Allah who is the Provider, the Possessor of strength, the Firm.” [adh-Dhāriyāt: 58]", "﴿إِنَّ ٱللَّهَ هُوَ ٱلرَّزَّاقُ ذُو ٱلْقُوَّةِ ٱلْمَتِينُ﴾ [الذَّارِيَات: ٥٨]"),
      t("Strength (al-quwwah) — and providing.", "القُوَّةُ، وَالرِّزْقُ."),
    ),
    affirms(
      125,
      t("“Excellent is that which Allah instructs you with. Indeed, Allah is ever Hearing and Seeing.” [an-Nisāʾ: 58]", "﴿إِنَّ ٱللَّهَ نِعِمَّا يَعِظُكُم بِهِۦٓ إِنَّ ٱللَّهَ كَانَ سَمِيعًۢا بَصِيرًا﴾ [النِّسَاء: ٥٨]"),
      t("Hearing and seeing.", "السَّمْعُ وَالبَصَرُ."),
    ),
  ],

  // ───────────── 4 · Will, love, mercy, pleasure and anger, coming, the Face ─────────────
  [
    opening(3, 126, t("What does this part of the Qur'anic evidences cover (2)?", "مَا الَّذِي يَتَنَاوَلُهُ هَذَا القِسْمُ مِنَ الأَدِلَّةِ القُرْآنِيَّةِ (٢)؟")),
    affirms(
      126,
      t("“And why did you not say, when you entered your garden: What Allah wills; there is no power except in Allah?” [al-Kahf: 39]", "﴿وَلَوْلَآ إِذْ دَخَلْتَ جَنَّتَكَ قُلْتَ مَا شَآءَ ٱللَّهُ لَا قُوَّةَ إِلَّا بِٱللَّهِ﴾ [الكَهْف: ٣٩]"),
      t("His will (al-mashīʾah).", "المَشِيئَةُ."),
    ),
    affirms(
      126,
      t("“Indeed, Allah ordains what He intends.” [al-Māʾidah: 1]", "﴿إِنَّ ٱللَّهَ يَحْكُمُ مَا يُرِيدُ﴾ [المَائِدَة: ١]"),
      t("His intent (al-irādah).", "الإِرَادَةُ."),
    ),
    {
      kind: "evidence",
      page: 126,
      front: t("Which āyah links guidance and misguidance to Allah's intent?", "مَا الآيَةُ الَّتِي فِيهَا إِرَادَةُ اللَّهِ الهِدَايَةَ وَالإِضْلَالَ؟"),
      back: t(
        "“So whoever Allah intends to guide — He expands his breast to Islam; and whoever He intends to misguide — He makes his breast tight and constricted, as though he were climbing into the sky.” [al-Anʿām: 125]",
        "﴿فَمَن يُرِدِ ٱللَّهُ أَن يَهْدِيَهُۥ يَشْرَحْ صَدْرَهُۥ لِلْإِسْلَٰمِ وَمَن يُرِدْ أَن يُضِلَّهُۥ يَجْعَلْ صَدْرَهُۥ ضَيِّقًا حَرَجًا كَأَنَّمَا يَصَّعَّدُ فِى ٱلسَّمَآءِ﴾ [الأَنْعَام: ١٢٥]",
      ),
    },
    affirms(
      127,
      t("“And do good; indeed, Allah loves the doers of good.” [al-Baqarah: 195]", "﴿وَأَحْسِنُوٓا۟ إِنَّ ٱللَّهَ يُحِبُّ ٱلْمُحْسِنِينَ﴾ [البَقَرَة: ١٩٥]"),
      t("Love (al-maḥabbah) — He loves the doers of good.", "المَحَبَّةُ؛ فَهُوَ يُحِبُّ المُحْسِنِينَ."),
    ),
    {
      kind: "list",
      page: 127,
      front: t("According to the āyāt the author lists, whom does Allah love?", "مَنِ الَّذِينَ يُحِبُّهُمُ اللَّهُ فِي الآيَاتِ الَّتِي سَاقَهَا المُؤَلِّفُ؟"),
      back: t(
        "The doers of good, the just, the God-fearing, those who repent, those who purify themselves, and those who fight in His path in a row.",
        "المُحْسِنُونَ، وَالمُقْسِطُونَ، وَالمُتَّقُونَ، وَالتَّوَّابُونَ، وَالمُتَطَهِّرُونَ، وَالَّذِينَ يُقَاتِلُونَ فِي سَبِيلِهِ صَفًّا.",
      ),
    },
    {
      kind: "evidence",
      page: 127,
      front: t("Which āyah describes a people whom Allah loves and who love Him?", "مَا الآيَةُ الَّتِي فِيهَا قَوْمٌ يُحِبُّهُمُ اللَّهُ وَيُحِبُّونَهُ؟"),
      back: t("“Allah will bring forth a people He will love and who will love Him.” [al-Māʾidah: 54]", "﴿فَسَوْفَ يَأْتِى ٱللَّهُ بِقَوْمٍ يُحِبُّهُمْ وَيُحِبُّونَهُۥٓ﴾ [المَائِدَة: ٥٤]"),
    },
    {
      kind: "evidence",
      page: 127,
      front: t("Which āyah makes following the Prophet ﷺ the way to Allah's love?", "مَا الآيَةُ الَّتِي جَعَلَتِ اتِّبَاعَ النَّبِيِّ ﷺ سَبِيلًا إِلَى مَحَبَّةِ اللَّهِ؟"),
      back: t(
        "“Say: If you love Allah, then follow me — Allah will love you and forgive you your sins.” [Āl ʿImrān: 31]",
        "﴿قُلْ إِن كُنتُمْ تُحِبُّونَ ٱللَّهَ فَٱتَّبِعُونِى يُحْبِبْكُمُ ٱللَّهُ وَيَغْفِرْ لَكُمْ ذُنُوبَكُمْ﴾ [آلِ عِمْرَان: ٣١]",
      ),
    },
    affirms(
      128,
      t("“Our Lord, You have encompassed all things in mercy and knowledge.” [Ghāfir: 7]", "﴿رَبَّنَا وَسِعْتَ كُلَّ شَىْءٍ رَّحْمَةً وَعِلْمًا﴾ [غَافِر: ٧]"),
      t("Mercy (and knowledge).", "الرَّحْمَةُ (وَالعِلْمُ)."),
    ),
    {
      kind: "list",
      page: 128,
      front: t("Name the āyāt the author lists for Allah's mercy.", "اذْكُرِ الآيَاتِ الَّتِي سَاقَهَا المُؤَلِّفُ فِي صِفَةِ الرَّحْمَةِ."),
      back: t(
        "The basmalah; “Our Lord, You have encompassed all things in mercy and knowledge”; “And He is ever Merciful to the believers”; “Your Lord has decreed mercy upon Himself”; “And He is the Forgiving, the Merciful”; “Allah is the best guardian, and He is the most merciful of the merciful.”",
        "﴿بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ﴾، ﴿رَبَّنَا وَسِعْتَ كُلَّ شَىْءٍ رَّحْمَةً وَعِلْمًا﴾، ﴿وَكَانَ بِٱلْمُؤْمِنِينَ رَحِيمًا﴾، ﴿كَتَبَ رَبُّكُمْ عَلَىٰ نَفْسِهِ ٱلرَّحْمَةَ﴾، ﴿وَهُوَ ٱلْغَفُورُ ٱلرَّحِيمُ﴾، ﴿فَٱللَّهُ خَيْرٌ حَٰفِظًا وَهُوَ أَرْحَمُ ٱلرَّٰحِمِينَ﴾",
      ),
    },
    affirms(
      127,
      t("“Allah is pleased with them, and they are pleased with Him.” [al-Bayyinah: 8]", "﴿رَّضِىَ ٱللَّهُ عَنْهُمْ وَرَضُوا۟ عَنْهُ﴾ [البَيِّنَة: ٨]"),
      t("Pleasure (ar-riḍā).", "الرِّضَا."),
    ),
    affirms(
      129,
      t(
        "“And whoever kills a believer intentionally — his recompense is Hell, abiding in it; and Allah is angry with him and has cursed him.” [an-Nisāʾ: 93]",
        "﴿وَمَن يَقْتُلْ مُؤْمِنًا مُّتَعَمِّدًا فَجَزَآؤُهُۥ جَهَنَّمُ خَٰلِدًا فِيهَا وَغَضِبَ ٱللَّهُ عَلَيْهِ وَلَعَنَهُۥ﴾ [النِّسَاء: ٩٣]",
      ),
      t("Anger (al-ghaḍab) and cursing (al-laʿn).", "الغَضَبُ، وَاللَّعْنُ."),
    ),
    affirms(
      129,
      t("“That is because they followed what angered Allah and disliked His pleasure, so He made their deeds worthless.” [Muḥammad: 28]", "﴿ذَٰلِكَ بِأَنَّهُمُ ٱتَّبَعُوا۟ مَآ أَسْخَطَ ٱللَّهَ وَكَرِهُوا۟ رِضْوَٰنَهُۥ فَأَحْبَطَ أَعْمَٰلَهُمْ﴾ [مُحَمَّد: ٢٨]"),
      t("Displeasure (as-sakhaṭ) — and His pleasure (riḍwān).", "السَّخَطُ، وَالرِّضْوَانُ."),
    ),
    affirms(
      129,
      t("“And when they angered Us, We took retribution from them.” [az-Zukhruf: 55]", "﴿فَلَمَّآ ءَاسَفُونَا ٱنتَقَمْنَا مِنْهُمْ﴾ [الزُّخْرُف: ٥٥]"),
      t("Anger (al-asaf) and retribution (al-intiqām).", "الأَسَفُ (الغَضَبُ)، وَالانْتِقَامُ."),
    ),
    affirms(
      129,
      t("“But Allah disliked their being sent forth, so He held them back.” [at-Tawbah: 46]", "﴿وَلَٰكِن كَرِهَ ٱللَّهُ ٱنۢبِعَاثَهُمْ فَثَبَّطَهُمْ﴾ [التَّوْبَة: ٤٦]"),
      t("Dislike (al-karāhah).", "الكَرَاهَةُ."),
    ),
    affirms(
      129,
      t("“Great is the hatred in the sight of Allah that you say what you do not do.” [aṣ-Ṣaff: 3]", "﴿كَبُرَ مَقْتًا عِندَ ٱللَّهِ أَن تَقُولُوا۟ مَا لَا تَفْعَلُونَ﴾ [الصَّفّ: ٣]"),
      t("Intense hatred (al-maqt).", "المَقْتُ."),
    ),
    affirms(
      130,
      t(
        "“Do they await anything except that Allah should come to them in shadows of clouds, and the angels, and the matter be decided?” [al-Baqarah: 210]",
        "﴿هَلْ يَنظُرُونَ إِلَّآ أَن يَأْتِيَهُمُ ٱللَّهُ فِى ظُلَلٍ مِّنَ ٱلْغَمَامِ وَٱلْمَلَٰٓئِكَةُ وَقُضِىَ ٱلْأَمْرُ﴾ [البَقَرَة: ٢١٠]",
      ),
      t("Coming (al-ityān) — on the Day of Judgement.", "الإِتْيَانُ (المَجِيءُ) يَوْمَ القِيَامَةِ."),
    ),
    affirms(
      130,
      t("“No! When the earth is pounded to dust, and your Lord comes, with the angels in rows upon rows.” [al-Fajr: 21–22]", "﴿كَلَّآ إِذَا دُكَّتِ ٱلْأَرْضُ دَكًّا دَكًّا * وَجَآءَ رَبُّكَ وَٱلْمَلَكُ صَفًّا صَفًّا﴾ [الفَجْر: ٢١–٢٢]"),
      t("Coming (al-majīʾ).", "المَجِيءُ."),
    ),
    affirms(
      131,
      t("“And there will remain the Face of your Lord, Owner of majesty and honour.” [ar-Raḥmān: 27]", "﴿وَيَبْقَىٰ وَجْهُ رَبِّكَ ذُو ٱلْجَلَٰلِ وَٱلْإِكْرَامِ﴾ [الرَّحْمَن: ٢٧]"),
      t("The Face (al-wajh).", "الوَجْهُ."),
    ),
    affirms(
      131,
      t("“Everything will perish except His Face.” [al-Qaṣaṣ: 88]", "﴿كُلُّ شَىْءٍ هَالِكٌ إِلَّا وَجْهَهُۥ﴾ [القَصَص: ٨٨]"),
      t("The Face — which remains.", "الوَجْهُ البَاقِي."),
    ),
  ],

  // ───────────── 5 · Hands, eyes, hearing and seeing, plotting, pardon, might, no equal ─────────────
  [
    opening(4, 132, t("What does this part of the Qur'anic evidences cover (3)?", "مَا الَّذِي يَتَنَاوَلُهُ هَذَا القِسْمُ مِنَ الأَدِلَّةِ القُرْآنِيَّةِ (٣)؟")),
    affirms(
      132,
      t("“What prevented you from prostrating to that which I created with My two Hands?” [Ṣād: 75]", "﴿مَا مَنَعَكَ أَن تَسْجُدَ لِمَا خَلَقْتُ بِيَدَىَّ﴾ [ص: ٧٥]"),
      t("The two Hands (al-yadān).", "اليَدَانِ."),
    ),
    {
      kind: "evidence",
      page: 132,
      front: t("Which āyah answers the Jews who said Allah's hand is chained?", "مَا الآيَةُ الَّتِي رَدَّتْ عَلَى اليَهُودِ قَوْلَهُمْ: يَدُ اللَّهِ مَغْلُولَةٌ؟"),
      back: t(
        "“And the Jews say: The hand of Allah is chained. Chained are their hands, and they are cursed for what they say. Rather, both His Hands are extended; He spends however He wills.” [al-Māʾidah: 64]",
        "﴿وَقَالَتِ ٱلْيَهُودُ يَدُ ٱللَّهِ مَغْلُولَةٌ غُلَّتْ أَيْدِيهِمْ وَلُعِنُوا۟ بِمَا قَالُوا۟ بَلْ يَدَاهُ مَبْسُوطَتَانِ يُنفِقُ كَيْفَ يَشَآءُ﴾ [المَائِدَة: ٦٤]",
      ),
    },
    affirms(
      133,
      t("“And be patient for the decision of your Lord, for indeed, you are in Our Eyes.” [aṭ-Ṭūr: 48]", "﴿وَٱصْبِرْ لِحُكْمِ رَبِّكَ فَإِنَّكَ بِأَعْيُنِنَا﴾ [الطُّور: ٤٨]"),
      t("The Eyes (al-aʿyun).", "العَيْنَانِ."),
    ),
    {
      kind: "list",
      page: 133,
      front: t("Name the three āyāt the author gives for Allah's Eyes.", "اذْكُرِ الآيَاتِ الثَّلَاثَ الَّتِي سَاقَهَا المُؤَلِّفُ فِي إِثْبَاتِ العَيْنَيْنِ."),
      back: t(
        "“…for indeed, you are in Our Eyes”; “sailing under Our Eyes, as recompense for him who had been denied”; “and that you would be brought up under My Eye.”",
        "﴿فَإِنَّكَ بِأَعْيُنِنَا﴾، ﴿تَجْرِى بِأَعْيُنِنَا جَزَآءً لِّمَن كَانَ كُفِرَ﴾، ﴿وَلِتُصْنَعَ عَلَىٰ عَيْنِىٓ﴾",
      ),
    },
    affirms(
      134,
      t(
        "“Allah has heard the speech of the one who argues with you concerning her husband and complains to Allah, and Allah hears your dialogue.” [al-Mujādilah: 1]",
        "﴿قَدْ سَمِعَ ٱللَّهُ قَوْلَ ٱلَّتِى تُجَٰدِلُكَ فِى زَوْجِهَا وَتَشْتَكِىٓ إِلَى ٱللَّهِ وَٱللَّهُ يَسْمَعُ تَحَاوُرَكُمَآ﴾ [المُجَادَلَة: ١]",
      ),
      t("Hearing (as-samʿ).", "السَّمْعُ."),
    ),
    affirms(
      134,
      t("“Or do they think that We hear not their secrets and their private conversations? Yes — and Our messengers with them record.” [az-Zukhruf: 80]", "﴿أَمْ يَحْسَبُونَ أَنَّا لَا نَسْمَعُ سِرَّهُمْ وَنَجْوَىٰهُم بَلَىٰ وَرُسُلُنَا لَدَيْهِمْ يَكْتُبُونَ﴾ [الزُّخْرُف: ٨٠]"),
      t("Hearing — even secrets and private talk.", "السَّمْعُ، حَتَّى لِلسِّرِّ وَالنَّجْوَى."),
    ),
    affirms(
      134,
      t("“Indeed, I am with you both; I hear and I see.” [Ṭā Hā: 46]", "﴿إِنَّنِى مَعَكُمَآ أَسْمَعُ وَأَرَىٰ﴾ [طٰهٰ: ٤٦]"),
      t("Hearing and seeing — and His being with (maʿiyyah) Mūsā and Hārūn.", "السَّمْعُ وَالرُّؤْيَةُ، وَالمَعِيَّةُ."),
    ),
    affirms(
      135,
      t("“Does he not know that Allah sees?” [al-ʿAlaq: 14]", "﴿أَلَمْ يَعْلَم بِأَنَّ ٱللَّهَ يَرَىٰ﴾ [العَلَق: ١٤]"),
      t("Seeing (ar-ruʾyah).", "الرُّؤْيَةُ."),
    ),
    affirms(
      135,
      t("“And say: Work, for Allah will see your deeds, and so will His Messenger and the believers.” [at-Tawbah: 105]", "﴿وَقُلِ ٱعْمَلُوا۟ فَسَيَرَى ٱللَّهُ عَمَلَكُمْ وَرَسُولُهُۥ وَٱلْمُؤْمِنُونَ﴾ [التَّوْبَة: ١٠٥]"),
      t("Seeing.", "الرُّؤْيَةُ."),
    ),
    affirms(
      136,
      t("“And they plotted, and Allah plotted; and Allah is the best of plotters.” [Āl ʿImrān: 54]", "﴿وَمَكَرُوا۟ وَمَكَرَ ٱللَّهُ وَٱللَّهُ خَيْرُ ٱلْمَٰكِرِينَ﴾ [آلِ عِمْرَان: ٥٤]"),
      t("Plotting (al-makr) — against those who plot, as a fitting recompense.", "المَكْرُ بِمَنْ يَمْكُرُ."),
    ),
    {
      kind: "list",
      page: 136,
      front: t("Which āyāt does the author give for plotting and scheming?", "مَا الآيَاتُ الَّتِي سَاقَهَا المُؤَلِّفُ فِي المَكْرِ وَالكَيْدِ؟"),
      back: t(
        "“And He is severe in power”; “and they plotted, and Allah plotted…”; “and they plotted a plot, and We plotted a plot while they did not perceive”; “indeed, they are planning a plan, and I am planning a plan.”",
        "﴿وَهُوَ شَدِيدُ ٱلْمِحَالِ﴾، ﴿وَمَكَرُوا۟ وَمَكَرَ ٱللَّهُ وَٱللَّهُ خَيْرُ ٱلْمَٰكِرِينَ﴾، ﴿وَمَكَرُوا۟ مَكْرًا وَمَكَرْنَا مَكْرًا وَهُمْ لَا يَشْعُرُونَ﴾، ﴿إِنَّهُمْ يَكِيدُونَ كَيْدًا * وَأَكِيدُ كَيْدًا﴾",
      ),
    },
    affirms(
      137,
      t("“If you show good or conceal it or pardon an offence — indeed, Allah is ever Pardoning and Competent.” [an-Nisāʾ: 149]", "﴿إِن تُبْدُوا۟ خَيْرًا أَوْ تُخْفُوهُ أَوْ تَعْفُوا۟ عَن سُوٓءٍ فَإِنَّ ٱللَّهَ كَانَ عَفُوًّا قَدِيرًا﴾ [النِّسَاء: ١٤٩]"),
      t("Pardon (al-ʿafw) and power (al-qudrah).", "العَفْوُ، وَالقُدْرَةُ."),
    ),
    affirms(
      137,
      t("“And let them pardon and overlook. Would you not like that Allah should forgive you? And Allah is Forgiving and Merciful.” [an-Nūr: 22]", "﴿وَلْيَعْفُوا۟ وَلْيَصْفَحُوٓا۟ أَلَا تُحِبُّونَ أَن يَغْفِرَ ٱللَّهُ لَكُمْ وَٱللَّهُ غَفُورٌ رَّحِيمٌ﴾ [النُّور: ٢٢]"),
      t("Forgiveness and mercy.", "المَغْفِرَةُ، وَالرَّحْمَةُ."),
    ),
    affirms(
      138,
      t("“And to Allah belongs all might, and to His Messenger.” [al-Munāfiqūn: 8]", "﴿وَلِلَّهِ ٱلْعِزَّةُ وَلِرَسُولِهِۦ﴾ [المُنَافِقُون: ٨]"),
      t("Might (al-ʿizzah).", "العِزَّةُ."),
    ),
    {
      kind: "evidence",
      page: 138,
      front: t("Which āyah has Iblīs swearing by Allah's might?", "مَا الآيَةُ الَّتِي أَقْسَمَ فِيهَا إِبْلِيسُ بِعِزَّةِ اللَّهِ؟"),
      back: t("“By Your might, I will surely mislead them all.” [Ṣād: 82]", "﴿فَبِعِزَّتِكَ لَأُغْوِيَنَّهُمْ أَجْمَعِينَ﴾ [ص: ٨٢]"),
    },
    {
      kind: "evidence",
      page: 139,
      front: t("Which āyah tells that Allah has no namesake?", "مَا الآيَةُ الَّتِي فِيهَا نَفْيُ السَّمِيِّ عَنِ اللَّهِ؟"),
      back: t("“So worship Him and be patient in His worship. Do you know of any namesake to Him?” [Maryam: 65]", "﴿فَٱعْبُدْهُ وَٱصْطَبِرْ لِعِبَٰدَتِهِۦ هَلْ تَعْلَمُ لَهُۥ سَمِيًّا﴾ [مَرْيَم: ٦٥]"),
    },
    {
      kind: "evidence",
      page: 139,
      front: t("Which āyah forbids setting up rivals to Allah?", "مَا الآيَةُ الَّتِي فِيهَا النَّهْيُ عَنِ اتِّخَاذِ الأَنْدَادِ لِلَّهِ؟"),
      back: t("“So do not set up rivals to Allah while you know.” [al-Baqarah: 22]", "﴿فَلَا تَجْعَلُوا۟ لِلَّهِ أَندَادًا وَأَنتُمْ تَعْلَمُونَ﴾ [البَقَرَة: ٢٢]"),
    },
    {
      kind: "evidence",
      page: 139,
      front: t("Which āyah condemns loving rivals as Allah is loved?", "مَا الآيَةُ الَّتِي ذَمَّتْ مَنْ يُحِبُّ الأَنْدَادَ كَحُبِّ اللَّهِ؟"),
      back: t("“And among the people are those who take rivals besides Allah, loving them as they love Allah.” [al-Baqarah: 165]", "﴿وَمِنَ ٱلنَّاسِ مَن يَتَّخِذُ مِن دُونِ ٱللَّهِ أَندَادًا يُحِبُّونَهُمْ كَحُبِّ ٱللَّهِ﴾ [البَقَرَة: ١٦٥]"),
    },
    {
      kind: "evidence",
      page: 139,
      front: t("Which āyah praises Allah for having no son, no partner in dominion, and no protector out of weakness?", "مَا الآيَةُ الَّتِي فِيهَا حَمْدُ اللَّهِ عَلَى نَفْيِ الوَلَدِ وَالشَّرِيكِ وَالوَلِيِّ مِنَ الذُّلِّ؟"),
      back: t(
        "“And say: Praise be to Allah, who has not taken a son, and has had no partner in dominion, and has no protector out of weakness; and glorify Him with great glorification.” [al-Isrāʾ: 111]",
        "﴿وَقُلِ ٱلْحَمْدُ لِلَّهِ ٱلَّذِى لَمْ يَتَّخِذْ وَلَدًا وَلَمْ يَكُن لَّهُۥ شَرِيكٌ فِى ٱلْمُلْكِ وَلَمْ يَكُن لَّهُۥ وَلِىٌّ مِّنَ ٱلذُّلِّ وَكَبِّرْهُ تَكْبِيرًۢا﴾ [الإِسْرَاء: ١١١]",
      ),
    },
    {
      kind: "evidence",
      page: 140,
      front: t("Which āyah forbids striking likenesses for Allah?", "مَا الآيَةُ الَّتِي فِيهَا النَّهْيُ عَنْ ضَرْبِ الأَمْثَالِ لِلَّهِ؟"),
      back: t("“So do not strike likenesses for Allah. Indeed, Allah knows and you do not know.” [an-Naḥl: 74]", "﴿فَلَا تَضْرِبُوا۟ لِلَّهِ ٱلْأَمْثَالَ إِنَّ ٱللَّهَ يَعْلَمُ وَأَنتُمْ لَا تَعْلَمُونَ﴾ [النَّحْل: ٧٤]"),
    },
    {
      kind: "evidence",
      page: 140,
      front: t("Which āyah forbids saying about Allah what one does not know?", "مَا الآيَةُ الَّتِي فِيهَا تَحْرِيمُ القَوْلِ عَلَى اللَّهِ بِلَا عِلْمٍ؟"),
      back: t(
        "“Say: My Lord has only forbidden immoralities, what is apparent of them and what is concealed, sin, oppression without right, that you associate with Allah that for which He sent down no authority, and that you say about Allah what you do not know.” [al-Aʿrāf: 33]",
        "﴿قُلْ إِنَّمَا حَرَّمَ رَبِّىَ ٱلْفَوَٰحِشَ مَا ظَهَرَ مِنْهَا وَمَا بَطَنَ وَٱلْإِثْمَ وَٱلْبَغْىَ بِغَيْرِ ٱلْحَقِّ وَأَن تُشْرِكُوا۟ بِٱللَّهِ مَا لَمْ يُنَزِّلْ بِهِۦ سُلْطَٰنًا وَأَن تَقُولُوا۟ عَلَى ٱللَّهِ مَا لَا تَعْلَمُونَ﴾ [الأَعْرَاف: ٣٣]",
      ),
    },
  ],

  // ───────────── 6 · Istiwāʾ, highness, withness, speech, the Qur'an, seeing ─────────────
  [
    opening(5, 141, t("What does this part of the Qur'anic evidences cover (4)?", "مَا الَّذِي يَتَنَاوَلُهُ هَذَا القِسْمُ مِنَ الأَدِلَّةِ القُرْآنِيَّةِ (٤)؟")),
    affirms(
      141,
      t("“The Most Merciful rose over the Throne.” [Ṭā Hā: 5]", "﴿ٱلرَّحْمَٰنُ عَلَى ٱلْعَرْشِ ٱسْتَوَىٰ﴾ [طٰهٰ: ٥]"),
      t("Rising over the Throne (al-istiwāʾ).", "الاسْتِوَاءُ عَلَى العَرْشِ."),
    ),
    {
      kind: "point",
      page: 141,
      front: t("In how many places does “then He rose over the Throne” come in the Qur'an?", "فِي كَمْ مَوْضِعٍ جَاءَ ﴿ثُمَّ ٱسْتَوَىٰ عَلَى ٱلْعَرْشِ﴾؟"),
      back: t("In six places.", "«فِي سِتَّةِ مَوَاضِعَ»"),
    },
    {
      kind: "list",
      page: 142,
      front: t("Which āyāt does the author give for Allah's highness (al-ʿuluww)?", "مَا الآيَاتُ الَّتِي سَاقَهَا المُؤَلِّفُ فِي عُلُوِّ اللَّهِ؟"),
      back: t(
        "“O ʿĪsā, I will take you and raise you to Myself”; “rather, Allah raised him to Himself”; “to Him ascends good speech”; Pharaoh's “O Hāmān, build for me a tower…”; and “Do you feel secure from He who is above the heaven…”",
        "﴿يَٰعِيسَىٰٓ إِنِّى مُتَوَفِّيكَ وَرَافِعُكَ إِلَىَّ﴾، ﴿بَل رَّفَعَهُ ٱللَّهُ إِلَيْهِ﴾، ﴿إِلَيْهِ يَصْعَدُ ٱلْكَلِمُ ٱلطَّيِّبُ﴾، ﴿يَٰهَٰمَٰنُ ٱبْنِ لِى صَرْحًا﴾، ﴿ءَأَمِنتُم مَّن فِى ٱلسَّمَآءِ﴾",
      ),
    },
    affirms(
      142,
      t("“To Him ascends good speech, and righteous work raises it.” [Fāṭir: 10]", "﴿إِلَيْهِ يَصْعَدُ ٱلْكَلِمُ ٱلطَّيِّبُ وَٱلْعَمَلُ ٱلصَّٰلِحُ يَرْفَعُهُۥ﴾ [فَاطِر: ١٠]"),
      t("Highness (al-ʿuluww).", "العُلُوُّ."),
    ),
    affirms(
      142,
      t(
        "“Do you feel secure that He who is above the heaven would not cause the earth to swallow you?” [al-Mulk: 16]",
        "﴿ءَأَمِنتُم مَّن فِى ٱلسَّمَآءِ أَن يَخْسِفَ بِكُمُ ٱلْأَرْضَ فَإِذَا هِىَ تَمُورُ﴾ [المُلْك: ١٦]",
      ),
      t("Highness — He is above the heaven.", "العُلُوُّ؛ فَهُوَ فِي السَّمَاءِ."),
    ),
    {
      kind: "evidence",
      page: 142,
      front: t("What did Pharaoh say to Hāmān, which shows Mūsā had told him his God is above?", "مَاذَا قَالَ فِرْعَوْنُ لِهَامَانَ مِمَّا يَدُلُّ عَلَى أَنَّ مُوسَى أَخْبَرَهُ بِعُلُوِّ إِلَهِهِ؟"),
      back: t(
        "“O Hāmān, build for me a tower that I might reach the ways — the ways into the heavens — so that I may look at the God of Mūsā; but indeed, I think he is a liar.” [Ghāfir: 36–37]",
        "﴿يَٰهَٰمَٰنُ ٱبْنِ لِى صَرْحًا لَّعَلِّىٓ أَبْلُغُ ٱلْأَسْبَٰبَ * أَسْبَٰبَ ٱلسَّمَٰوَٰتِ فَأَطَّلِعَ إِلَىٰٓ إِلَٰهِ مُوسَىٰ وَإِنِّى لَأَظُنُّهُۥ كَٰذِبًا﴾ [غَافِر: ٣٦–٣٧]",
      ),
    },
    {
      kind: "evidence",
      page: 143,
      front: t("Which single āyah combines His rising over the Throne with His being with us?", "مَا الآيَةُ الَّتِي جَمَعَتْ بَيْنَ الاسْتِوَاءِ عَلَى العَرْشِ وَالمَعِيَّةِ؟"),
      back: t(
        "“It is He who created the heavens and the earth in six days, then rose over the Throne… And He is with you wherever you are; and Allah sees what you do.” [al-Ḥadīd: 4]",
        "﴿هُوَ ٱلَّذِى خَلَقَ ٱلسَّمَٰوَٰتِ وَٱلْأَرْضَ فِى سِتَّةِ أَيَّامٍ ثُمَّ ٱسْتَوَىٰ عَلَى ٱلْعَرْشِ﴾ … ﴿وَهُوَ مَعَكُمْ أَيْنَ مَا كُنتُمْ وَٱللَّهُ بِمَا تَعْمَلُونَ بَصِيرٌ﴾ [الحَدِيد: ٤]",
      ),
    },
    affirms(
      143,
      t("“There is no private conversation of three but that He is the fourth of them, nor of five but that He is the sixth of them.” [al-Mujādilah: 7]", "﴿مَا يَكُونُ مِن نَّجْوَىٰ ثَلَٰثَةٍ إِلَّا هُوَ رَابِعُهُمْ وَلَا خَمْسَةٍ إِلَّا هُوَ سَادِسُهُمْ﴾ [المُجَادَلَة: ٧]"),
      t("His being with them (al-maʿiyyah) — by His knowledge.", "المَعِيَّةُ."),
    ),
    affirms(
      144,
      t("“Do not grieve; indeed, Allah is with us.” [at-Tawbah: 40]", "﴿لَا تَحْزَنْ إِنَّ ٱللَّهَ مَعَنَا﴾ [التَّوْبَة: ٤٠]"),
      t("His special withness — with support and protection.", "المَعِيَّةُ الخَاصَّةُ بِالنَّصْرِ وَالتَّأْيِيدِ."),
    ),
    {
      kind: "list",
      page: 144,
      front: t("With whom, according to the āyāt the author lists, is Allah?", "مَعَ مَنْ يَكُونُ اللَّهُ فِي الآيَاتِ الَّتِي سَاقَهَا المُؤَلِّفُ؟"),
      back: t(
        "With the Prophet ﷺ and Abū Bakr in the cave; with Mūsā and Hārūn; with those who fear Him and do good; and with the patient.",
        "مَعَ النَّبِيِّ ﷺ وَصَاحِبِهِ فِي الغَارِ، وَمَعَ مُوسَى وَهَارُونَ، وَمَعَ ﴿ٱلَّذِينَ ٱتَّقَوا۟ وَّٱلَّذِينَ هُم مُّحْسِنُونَ﴾، وَمَعَ ﴿ٱلصَّٰبِرِينَ﴾.",
      ),
    },
    {
      kind: "evidence",
      page: 144,
      front: t("Which āyah says a small company overcame a large one, with Allah being with the patient?", "مَا الآيَةُ الَّتِي فِيهَا أَنَّ الفِئَةَ القَلِيلَةَ غَلَبَتِ الكَثِيرَةَ، وَأَنَّ اللَّهَ مَعَ الصَّابِرِينَ؟"),
      back: t(
        "“How many a small company has overcome a large company by permission of Allah. And Allah is with the patient.” [al-Baqarah: 249]",
        "﴿كَم مِّن فِئَةٍ قَلِيلَةٍ غَلَبَتْ فِئَةً كَثِيرَةًۢ بِإِذْنِ ٱللَّهِ وَٱللَّهُ مَعَ ٱلصَّٰبِرِينَ﴾ [البَقَرَة: ٢٤٩]",
      ),
    },
    affirms(
      145,
      t("“And who is more truthful than Allah in speech?” [an-Nisāʾ: 87]", "﴿وَمَنْ أَصْدَقُ مِنَ ٱللَّهِ حَدِيثًا﴾ [النِّسَاء: ٨٧]"),
      t("Speech (al-kalām) — and that His speech is the most truthful.", "الكَلَامُ، وَأَنَّ كَلَامَهُ أَصْدَقُ الكَلَامِ."),
    ),
    affirms(
      145,
      t("“And Allah spoke to Mūsā with (real) speech.” [an-Nisāʾ: 164]", "﴿وَكَلَّمَ ٱللَّهُ مُوسَىٰ تَكْلِيمًا﴾ [النِّسَاء: ١٦٤]"),
      t("Speech — real speech, to Mūsā.", "الكَلَامُ حَقِيقَةً."),
    ),
    {
      kind: "evidence",
      page: 145,
      front: t("Which āyah says Allah's words are complete in truth and justice?", "مَا الآيَةُ الَّتِي فِيهَا تَمَامُ كَلِمَاتِ اللَّهِ صِدْقًا وَعَدْلًا؟"),
      back: t("“And the word of your Lord has been fulfilled in truth and in justice.” [al-Anʿām: 115]", "﴿وَتَمَّتْ كَلِمَتُ رَبِّكَ صِدْقًا وَعَدْلًا﴾ [الأَنْعَام: ١١٥]"),
    },
    affirms(
      145,
      t("“And We called him from the right side of the mount and brought him near, confiding.” [Maryam: 52]", "﴿وَنَٰدَيْنَٰهُ مِن جَانِبِ ٱلطُّورِ ٱلْأَيْمَنِ وَقَرَّبْنَٰهُ نَجِيًّا﴾ [مَرْيَم: ٥٢]"),
      t("Calling (an-nidāʾ) and confiding (al-munājāh) — speech heard aloud and spoken privately.", "النِّدَاءُ، وَالمُنَاجَاةُ."),
    ),
    {
      kind: "evidence",
      page: 145,
      front: t("Which two āyāt tell of Allah calling the idolaters on the Day of Judgement?", "مَا الآيَتَانِ اللَّتَانِ فِيهِمَا نِدَاءُ اللَّهِ لِلْمُشْرِكِينَ يَوْمَ القِيَامَةِ؟"),
      back: t(
        "“And the Day He will call them and say: Where are My ‘partners’ whom you used to claim?” and “…and say: What did you answer the messengers?” [al-Qaṣaṣ: 62, 65]",
        "﴿وَيَوْمَ يُنَادِيهِمْ فَيَقُولُ أَيْنَ شُرَكَآءِىَ ٱلَّذِينَ كُنتُمْ تَزْعُمُونَ﴾، ﴿وَيَوْمَ يُنَادِيهِمْ فَيَقُولُ مَاذَآ أَجَبْتُمُ ٱلْمُرْسَلِينَ﴾ [القَصَص: ٦٢، ٦٥]",
      ),
    },
    {
      kind: "evidence",
      page: 146,
      front: t("Which āyah calls the Qur'an “the speech of Allah”, heard by the idolater given protection?", "مَا الآيَةُ الَّتِي سَمَّتِ القُرْآنَ كَلَامَ اللَّهِ يَسْمَعُهُ المُشْرِكُ المُسْتَجِيرُ؟"),
      back: t(
        "“And if any one of the idolaters seeks your protection, grant him protection so that he may hear the speech of Allah.” [at-Tawbah: 6]",
        "﴿وَإِنْ أَحَدٌ مِّنَ ٱلْمُشْرِكِينَ ٱسْتَجَارَكَ فَأَجِرْهُ حَتَّىٰ يَسْمَعَ كَلَٰمَ ٱللَّهِ﴾ [التَّوْبَة: ٦]",
      ),
    },
    {
      kind: "evidence",
      page: 146,
      front: t("Which āyah tells of a party who heard Allah's speech and then distorted it knowingly?", "مَا الآيَةُ الَّتِي فِيهَا فَرِيقٌ سَمِعُوا كَلَامَ اللَّهِ ثُمَّ حَرَّفُوهُ؟"),
      back: t(
        "“…while a party of them used to hear the speech of Allah and then distort it after they had understood it, while they knew.” [al-Baqarah: 75]",
        "﴿وَقَدْ كَانَ فَرِيقٌ مِّنْهُمْ يَسْمَعُونَ كَلَٰمَ ٱللَّهِ ثُمَّ يُحَرِّفُونَهُۥ مِنۢ بَعْدِ مَا عَقَلُوهُ وَهُمْ يَعْلَمُونَ﴾ [البَقَرَة: ٧٥]",
      ),
    },
    {
      kind: "evidence",
      page: 147,
      front: t("Which āyah says that had the Qur'an been sent down on a mountain, it would have humbled and split apart?", "مَا الآيَةُ الَّتِي فِيهَا أَنَّ القُرْآنَ لَوْ أُنْزِلَ عَلَى جَبَلٍ لَخَشَعَ وَتَصَدَّعَ؟"),
      back: t(
        "“If We had sent down this Qur'an upon a mountain, you would have seen it humbled and splitting apart from fear of Allah.” [al-Ḥashr: 21]",
        "﴿لَوْ أَنزَلْنَا هَٰذَا ٱلْقُرْءَانَ عَلَىٰ جَبَلٍ لَّرَأَيْتَهُۥ خَٰشِعًا مُّتَصَدِّعًا مِّنْ خَشْيَةِ ٱللَّهِ﴾ [الحَشْر: ٢١]",
      ),
    },
    {
      kind: "evidence",
      page: 147,
      front: t("Which āyah tells that the Holy Spirit brought the Qur'an down from Allah?", "مَا الآيَةُ الَّتِي فِيهَا أَنَّ رُوحَ القُدُسِ نَزَّلَ القُرْآنَ مِنْ رَبِّكَ؟"),
      back: t(
        "“Say: The Holy Spirit has brought it down from your Lord in truth, to make firm those who believe, and as guidance and good tidings for the Muslims.” [an-Naḥl: 102]",
        "﴿قُلْ نَزَّلَهُۥ رُوحُ ٱلْقُدُسِ مِن رَّبِّكَ بِٱلْحَقِّ لِيُثَبِّتَ ٱلَّذِينَ ءَامَنُوا۟ وَهُدًى وَبُشْرَىٰ لِلْمُسْلِمِينَ﴾ [النَّحْل: ١٠٢]",
      ),
      note: t("The author quotes an-Naḥl 101–103.", "سَاقَ المُؤَلِّفُ الآيَاتِ (النَّحْل: ١٠١–١٠٣)."),
    },
    affirms(
      148,
      t("“Faces that Day will be radiant, looking at their Lord.” [al-Qiyāmah: 22–23]", "﴿وُجُوهٌ يَوْمَئِذٍ نَّاضِرَةٌ * إِلَىٰ رَبِّهَا نَاظِرَةٌ﴾ [القِيَامَة: ٢٢–٢٣]"),
      t("That the believers will see their Lord (ar-ruʾyah).", "رُؤْيَةُ المُؤْمِنِينَ رَبَّهُمْ."),
    ),
    {
      kind: "list",
      page: 148,
      front: t("Which āyāt does the author give for the believers seeing their Lord?", "مَا الآيَاتُ الَّتِي سَاقَهَا المُؤَلِّفُ فِي رُؤْيَةِ المُؤْمِنِينَ رَبَّهُمْ؟"),
      back: t(
        "“Faces that Day will be radiant, looking at their Lord”; “on adorned couches, looking”; “for those who did good is the best — and more”; “they will have whatever they wish therein, and with Us is more.”",
        "﴿وُجُوهٌ يَوْمَئِذٍ نَّاضِرَةٌ * إِلَىٰ رَبِّهَا نَاظِرَةٌ﴾، ﴿عَلَى ٱلْأَرَآئِكِ يَنظُرُونَ﴾، ﴿لِّلَّذِينَ أَحْسَنُوا۟ ٱلْحُسْنَىٰ وَزِيَادَةٌ﴾، ﴿لَهُم مَّا يَشَآءُونَ فِيهَا وَلَدَيْنَا مَزِيدٌ﴾",
      ),
    },
    {
      kind: "point",
      page: 148,
      front: t("How does the author close the Qur'anic evidences?", "بِمَ خَتَمَ المُؤَلِّفُ الأَدِلَّةَ القُرْآنِيَّةَ؟"),
      back: t(
        "“This chapter in the Book of Allah is vast: whoever reflects on the Qur'an seeking guidance from it, the path of truth becomes clear to him.”",
        "«وَهَذَا البَابُ فِي كِتَابِ اللَّهِ كَثِيرٌ؛ مَنْ تَدَبَّرَ القُرْآنَ طَالِبًا لِلْهُدَى مِنْهُ؛ تَبَيَّنَ لَهُ طَرِيقُ الحَقِّ»",
      ),
    },
  ],

  // ───────────── 7 · The Sunnah on the attributes ─────────────
  [
    opening(6, 149, t("What does this section turn to?", "إِلَامَ يَنْتَقِلُ هَذَا الفَصْلُ؟")),
    {
      kind: "list",
      page: 149,
      front: t("What four things does the Sunnah do for the Qur'an?", "مَا الأُمُورُ الأَرْبَعَةُ الَّتِي تَقُومُ بِهَا السُّنَّةُ لِلْقُرْآنِ؟"),
      back: t("It explains the Qur'an, clarifies it, points to it, and expresses it.", "«تُفَسِّرُ القُرْآنَ، وَتُبَيِّنُهُ، وَتَدُلُّ عَلَيْهِ، وَتُعَبِّرُ عَنْهُ»"),
    },
    {
      kind: "point",
      page: 149,
      front: t("Which aḥādīth about Allah's attributes must be believed in?", "مَا الأَحَادِيثُ الَّتِي يَجِبُ الإِيمَانُ بِمَا فِيهَا مِنَ الصِّفَاتِ؟"),
      back: t(
        "What the Messenger described his Lord with in the authentic aḥādīth that the people of knowledge received with acceptance.",
        "«مَا وَصَفَ الرَّسُولُ بِهِ رَبَّهُ - مِنَ الأَحَادِيثِ الصِّحَاحِ الَّتِي تَلَقَّاهَا أَهْلُ المَعْرِفَةِ بِالقَبُولِ -: وَجَبَ الإِيمَانُ بِهَا كَذَلِكَ»",
      ),
    },
    {
      kind: "hadith",
      page: 149,
      front: t("What is the ḥadīth of the descent (nuzūl)?", "مَا حَدِيثُ النُّزُولِ؟"),
      back: t(
        "“Our Lord descends every night to the lowest heaven when the last third of the night remains, and says: Who will call upon Me, that I may answer him? Who will ask of Me, that I may give him? Who will seek My forgiveness, that I may forgive him?” (agreed upon)",
        "«يَنْزِلُ رَبُّنَا كُلَّ لَيْلَةٍ إِلَى السَّمَاءِ الدُّنْيَا حِينَ يَبْقَى ثُلُثُ اللَّيْلِ الآخِرُ، فَيَقُولُ: مَنْ يَدْعُونِي فَأَسْتَجِيبَ لَهُ؟ مَنْ يَسْأَلُنِي فَأُعْطِيَهُ؟ مَنْ يَسْتَغْفِرُنِي فَأَغْفِرَ لَهُ؟» مُتَّفَقٌ عَلَيْهِ.",
      ),
    },
    {
      kind: "hadith",
      page: 150,
      front: t("Which ḥadīth affirms Allah's joy (faraḥ)?", "مَا الحَدِيثُ الَّذِي فِيهِ إِثْبَاتُ الفَرَحِ لِلَّهِ؟"),
      back: t("“Allah is more joyful at the repentance of His servant than one of you with his riding camel…” (agreed upon)", "«لَلَّهُ أَشَدُّ فَرَحًا بِتَوْبَةِ عَبْدِهِ، مِنْ أَحَدِكُمْ بِرَاحِلَتِهِ…» مُتَّفَقٌ عَلَيْهِ."),
    },
    {
      kind: "hadith",
      page: 150,
      front: t("Which ḥadīth affirms Allah's laughing (aḍ-ḍaḥik)?", "مَا الحَدِيثُ الَّذِي فِيهِ إِثْبَاتُ الضَّحِكِ لِلَّهِ؟"),
      back: t("“Allah laughs at two men, one of whom kills the other — both of them enter Paradise.” (agreed upon)", "«يَضْحَكُ اللَّهُ إِلَى رَجُلَيْنِ يَقْتُلُ أَحَدُهُمَا الآخَرَ، كِلَاهُمَا يَدْخُلُ الجَنَّةَ» مُتَّفَقٌ عَلَيْهِ."),
    },
    {
      kind: "hadith",
      page: 150,
      front: t("Which ḥadīth affirms Allah's wonder (al-ʿajab)?", "مَا الحَدِيثُ الَّذِي فِيهِ إِثْبَاتُ العَجَبِ لِلَّهِ؟"),
      back: t(
        "“Our Lord wonders at the despair of His servants while His changing (of their state) is near. He looks at you in hardship and despair, and keeps laughing, knowing that your relief is near.” (ḥasan)",
        "«عَجِبَ رَبُّنَا مِنْ قُنُوطِ عِبَادِهِ وَقُرْبِ غِيَرِهِ، يَنْظُرُ إِلَيْكُمْ أَزِلِينَ قَنِطِينَ، فَيَظَلُّ يَضْحَكُ؛ يَعْلَمُ أَنَّ فَرَجَكُمْ قَرِيبٌ» حَدِيثٌ حَسَنٌ.",
      ),
    },
    {
      kind: "hadith",
      page: 151,
      front: t("Which ḥadīth affirms the Foot (al-qadam)?", "مَا الحَدِيثُ الَّذِي فِيهِ إِثْبَاتُ القَدَمِ لِلَّهِ؟"),
      back: t(
        "“Hell will keep having (people) cast into it while it says: Are there any more? — until the Lord of might places His Foot in it, and its parts draw together, and it says: Enough, enough.” (agreed upon)",
        "«لَا تَزَالُ جَهَنَّمُ يُلْقَى فِيهَا، وَتَقُولُ: هَلْ مِنْ مَزِيدٍ؟ حَتَّى يَضَعَ رَبُّ العِزَّةِ فِيهَا قَدَمَهُ … فَيَنْزَوِي بَعْضُهَا إِلَى بَعْضٍ، فَتَقُولُ: قَطْ، قَطْ» مُتَّفَقٌ عَلَيْهِ.",
      ),
    },
    {
      kind: "hadith",
      page: 152,
      front: t("Which ḥadīth affirms Allah's calling with a voice?", "مَا الحَدِيثُ الَّذِي فِيهِ إِثْبَاتُ النِّدَاءِ بِالصَّوْتِ؟"),
      back: t(
        "“Allah will say: O Ādam. He will say: Here I am, at Your service. Then He will call out with a voice: Allah commands you to bring out from your offspring a contingent for the Fire.” (agreed upon)",
        "«يَقُولُ اللَّهُ: يَا آدَمُ. فَيَقُولُ: لَبَّيْكَ وَسَعْدَيْكَ. فَيُنَادِي بِصَوْتٍ: إِنَّ اللَّهَ يَأْمُرُكَ أَنْ تُخْرِجَ مِنْ ذُرِّيَّتِكَ بَعْثًا إِلَى النَّارِ» مُتَّفَقٌ عَلَيْهِ.",
      ),
    },
    {
      kind: "hadith",
      page: 152,
      front: t("Which ḥadīth tells that Allah will speak to every one of us without an interpreter?", "مَا الحَدِيثُ الَّذِي فِيهِ أَنَّ اللَّهَ سَيُكَلِّمُ كُلَّ أَحَدٍ بِلَا تُرْجُمَانٍ؟"),
      back: t(
        "“There is none of you except that his Lord will speak to him, with no veil and no interpreter between them.”",
        "«مَا مِنْكُمْ مِنْ أَحَدٍ إِلَّا سَيُكَلِّمُهُ رَبُّهُ، لَيْسَ بَيْنَهُ وَبَيْنَهُ حَاجِبٌ وَلَا تُرْجُمَانٌ»",
      ),
    },
    {
      kind: "hadith",
      page: 153,
      front: t("How does the ruqyah for the sick, which the author quotes, begin?", "بِمَ تَبْدَأُ رُقْيَةُ المَرِيضِ الَّتِي أَوْرَدَهَا المُؤَلِّفُ؟"),
      back: t(
        "“Our Lord is Allah, who is above the heaven; hallowed be Your name; Your command is in the heaven and the earth.” (Abū Dāwūd)",
        "«رَبُّنَا اللَّهُ الَّذِي فِي السَّمَاءِ، تَقَدَّسَ اسْمُكَ، أَمْرُكَ فِي السَّمَاءِ وَالأَرْضِ» رَوَاهُ أَبُو دَاوُدَ.",
      ),
    },
    {
      kind: "hadith",
      page: 153,
      front: t("What did the Prophet ﷺ say: “Do you not trust me, when I am …?”", "مَا تَمَامُ قَوْلِهِ ﷺ: «أَلَا تَأْمَنُونِي وَأَنَا …؟»"),
      back: t("“…the trusted one of Him who is above the heaven?” (al-Bukhārī and others)", "«أَلَا تَأْمَنُونِي وَأَنَا أَمِينُ مَنْ فِي السَّمَاءِ؟!» رَوَاهُ البُخَارِيُّ، وَغَيْرُهُ."),
    },
    {
      kind: "hadith",
      page: 153,
      front: t("Which ḥadīth states that Allah is above His Throne, knowing our state?", "مَا الحَدِيثُ الَّذِي فِيهِ أَنَّ اللَّهَ فَوْقَ عَرْشِهِ وَيَعْلَمُ مَا نَحْنُ عَلَيْهِ؟"),
      back: t(
        "“And the Throne is above that, and Allah is above His Throne, and He knows what you are upon.” (Abū Dāwūd, at-Tirmidhī and others)",
        "«وَالعَرْشُ فَوْقَ ذَلِكَ، وَاللَّهُ فَوْقَ عَرْشِهِ، وَهُوَ يَعْلَمُ مَا أَنْتُمْ عَلَيْهِ» رَوَاهُ أَبُو دَاوُدَ وَالتِّرْمِذِيُّ، وَغَيْرُهُمَا.",
      ),
    },
    {
      kind: "hadith",
      page: 154,
      front: t("What did the Prophet ﷺ ask the slave-girl, and what was the outcome?", "مَاذَا سَأَلَ النَّبِيُّ ﷺ الجَارِيَةَ؟ وَمَا كَانَتِ النَّتِيجَةُ؟"),
      back: t(
        "“Where is Allah?” She said: Above the heaven. “Who am I?” She said: You are the Messenger of Allah. He said: “Free her, for she is a believer.” (Muslim)",
        "«أَيْنَ اللَّهُ؟ قَالَتْ: فِي السَّمَاءِ. قَالَ: مَنْ أَنَا؟ قَالَتْ: أَنْتَ رَسُولُ اللَّهِ. قَالَ: أَعْتِقْهَا؛ فَإِنَّهَا مُؤْمِنَةٌ» رَوَاهُ مُسْلِمٌ.",
      ),
    },
    {
      kind: "hadith",
      page: 155,
      front: t("What is the best īmān, according to the ḥadīth the author quotes?", "مَا أَفْضَلُ الإِيمَانِ كَمَا فِي الحَدِيثِ الَّذِي أَوْرَدَهُ المُؤَلِّفُ؟"),
      back: t("“That you know that Allah is with you wherever you are.” (ḥasan)", "«أَفْضَلُ الإِيمَانِ: أَنْ تَعْلَمَ أَنَّ اللَّهَ مَعَكَ حَيْثُمَا كُنْتَ» حَدِيثٌ حَسَنٌ."),
    },
    {
      kind: "hadith",
      page: 155,
      front: t("When one stands to pray, where is Allah — and where may he spit?", "إِذَا قَامَ أَحَدُكُمْ إِلَى الصَّلَاةِ، فَأَيْنَ يَكُونُ اللَّهُ؟ وَأَيْنَ يَبْصُقُ؟"),
      back: t(
        "“Allah is in front of his face; so let him not spit in front of his face or to his right, but to his left or under his foot.” (agreed upon)",
        "«فَإِنَّ اللَّهَ قِبَلَ وَجْهِهِ. فَلَا يَبْصُقَنَّ قِبَلَ وَجْهِهِ، وَلَا عَنْ يَمِينِهِ، وَلَكِنْ عَنْ يَسَارِهِ، أَوْ تَحْتَ قَدَمِهِ» مُتَّفَقٌ عَلَيْهِ.",
      ),
    },
    {
      kind: "hadith",
      page: 156,
      front: t("Complete the supplication: “O Allah, You are the First…”", "أَكْمِلِ الدُّعَاءَ: «اللَّهُمَّ أَنْتَ الأَوَّلُ …»"),
      back: t(
        "“…so there is nothing before You; You are the Last, so there is nothing after You; You are the Manifest, so there is nothing above You; You are the Hidden, so there is nothing beyond You. Settle my debt, and free me from poverty.” (Muslim)",
        "«… فَلَيْسَ قَبْلَكَ شَيْءٌ. وَأَنْتَ الآخِرُ فَلَيْسَ بَعْدَكَ شَيْءٌ. وَأَنْتَ الظَّاهِرُ فَلَيْسَ فَوْقَكَ شَيْءٌ. وَأَنْتَ البَاطِنُ فَلَيْسَ دُونَكَ شَيْءٌ. اقْضِ عَنِّي الدَّيْنَ، وَأَغْنِنِي مِنَ الفَقْرِ» رَوَاهُ مُسْلِمٌ.",
      ),
    },
    {
      kind: "hadith",
      page: 156,
      front: t("What did he ﷺ say when his Companions raised their voices in dhikr?", "مَاذَا قَالَ ﷺ لَمَّا رَفَعَ أَصْحَابُهُ أَصْوَاتَهُمْ بِالذِّكْرِ؟"),
      back: t(
        "“O people, go easy on yourselves; you are not calling upon one who is deaf or absent. You are calling upon One All-Hearing and near. The One you call upon is nearer to one of you than the neck of his riding animal.” (agreed upon)",
        "«أَيُّهَا النَّاسُ، ارْبَعُوا عَلَى أَنْفُسِكُمْ؛ فَإِنَّكُمْ لَا تَدْعُونَ أَصَمَّ وَلَا غَائِبًا. إِنَّمَا تَدْعُونَ سَمِيعًا قَرِيبًا. إِنَّ الَّذِي تَدْعُونَهُ أَقْرَبُ إِلَى أَحَدِكُمْ مِنْ عُنُقِ رَاحِلَتِهِ» مُتَّفَقٌ عَلَيْهِ.",
      ),
    },
    {
      kind: "hadith",
      page: 157,
      front: t("Which ḥadīth tells that the believers will see their Lord like the full moon?", "مَا الحَدِيثُ الَّذِي فِيهِ رُؤْيَةُ المُؤْمِنِينَ رَبَّهُمْ كَالقَمَرِ لَيْلَةَ البَدْرِ؟"),
      back: t(
        "“You will see your Lord as you see the moon on the night it is full, not crowding one another to see it. So if you are able not to be overcome (in missing) a prayer before sunrise and before sunset, then do so.” (agreed upon)",
        "«إِنَّكُمْ سَتَرَوْنَ رَبَّكُمْ كَمَا تَرَوْنَ القَمَرَ لَيْلَةَ البَدْرِ، لَا تُضَامُونَ فِي رُؤْيَتِهِ. فَإِنِ اسْتَطَعْتُمْ أَلَّا تُغْلَبُوا عَلَى صَلَاةٍ قَبْلَ طُلُوعِ الشَّمْسِ وَقَبْلَ غُرُوبِهَا؛ فَافْعَلُوا» مُتَّفَقٌ عَلَيْهِ.",
      ),
    },
    {
      kind: "point",
      page: 158,
      front: t("How does the saved sect believe in these aḥādīth?", "كَيْفَ تُؤْمِنُ الفِرْقَةُ النَّاجِيَةُ بِهَذِهِ الأَحَادِيثِ؟"),
      back: t(
        "Just as they believe in what Allah told in His Book — without distortion or denial, and without asking how or likening.",
        "«كَمَا يُؤْمِنُونَ بِمَا أَخْبَرَ اللَّهُ بِهِ فِي كِتَابِهِ، مِنْ غَيْرِ تَحْرِيفٍ وَلَا تَعْطِيلٍ، وَمِنْ غَيْرِ تَكْيِيفٍ وَلَا تَمْثِيلٍ»",
      ),
    },
  ],

  // ───────────── 8 · The middle way; highness, withness and nearness ─────────────
  [
    opening(7, 159, t("What does this section establish?", "مَاذَا يُقَرِّرُ هَذَا الفَصْلُ؟")),
    {
      kind: "example",
      page: 159,
      front: t("Ahl as-Sunnah are the middle among the sects of the ummah — just as what?", "أَهْلُ السُّنَّةِ وَسَطٌ فِي فِرَقِ الأُمَّةِ؛ كَمَا أَنَّ …؟"),
      back: t("Just as the ummah is the middle among the nations.", "«كَمَا أَنَّ الأُمَّةَ هِيَ الوَسَطُ فِي الأُمَمِ»"),
    },
    {
      kind: "point",
      page: 159,
      front: t("In the chapter of Allah's attributes, between whom are Ahl as-Sunnah the middle?", "فِي بَابِ صِفَاتِ اللَّهِ: بَيْنَ مَنْ وَمَنْ يَكُونُ أَهْلُ السُّنَّةِ وَسَطًا؟"),
      back: t("Between the people of denial, the Jahmiyyah, and the people of likening, the Mushabbihah.", "«بَيْنَ أَهْلِ التَّعْطِيلِ الجَهْمِيَّةِ، وَبَيْنَ أَهْلِ التَّمْثِيلِ المُشَبِّهَةِ»"),
    },
    {
      kind: "point",
      page: 159,
      front: t("In the chapter of Allah's actions, between whom are they the middle?", "فِي بَابِ أَفْعَالِ اللَّهِ: بَيْنَ مَنْ يَكُونُونَ وَسَطًا؟"),
      back: t("Between the Qadariyyah and the Jabriyyah.", "«بَيْنَ القَدَرِيَّةِ وَالجَبْرِيَّةِ»"),
    },
    {
      kind: "point",
      page: 159,
      front: t("In the chapter of Allah's threat (al-waʿīd), between whom are they the middle?", "فِي بَابِ وَعِيدِ اللَّهِ: بَيْنَ مَنْ يَكُونُونَ وَسَطًا؟"),
      back: t("Between the Murjiʾah and the Waʿīdiyyah — of the Qadariyyah and others.", "«بَيْنَ المُرْجِئَةِ، وَبَيْنَ الوَعِيدِيَّةِ - مِنَ القَدَرِيَّةِ وَغَيْرِهِمْ -»"),
    },
    {
      kind: "point",
      page: 159,
      front: t("In the chapter of īmān and the religion, between whom are they the middle?", "فِي بَابِ الإِيمَانِ وَالدِّينِ: بَيْنَ مَنْ يَكُونُونَ وَسَطًا؟"),
      back: t("Between the Ḥarūriyyah and the Muʿtazilah, and the Murjiʾah and the Jahmiyyah.", "«بَيْنَ الحَرُورِيَّةِ وَالمُعْتَزِلَةِ، وَبَيْنَ المُرْجِئَةِ وَالجَهْمِيَّةِ»"),
    },
    {
      kind: "point",
      page: 159,
      front: t("Regarding the Companions of the Messenger ﷺ, between whom are they the middle?", "فِي أَصْحَابِ رَسُولِ اللَّهِ ﷺ: بَيْنَ مَنْ يَكُونُونَ وَسَطًا؟"),
      back: t("Between the Rawāfiḍ and the Khawārij.", "«بَيْنَ الرَّوَافِضِ، وَبَيْنَ الخَوَارِجِ»"),
    },
    {
      kind: "point",
      page: 160,
      front: t("What, of belief in Allah, did Allah tell in His Book, the Messenger ﷺ relate by tawātur, and the Salaf agree upon?", "مَا الَّذِي أَخْبَرَ اللَّهُ بِهِ فِي كِتَابِهِ، وَتَوَاتَرَ عَنْ رَسُولِهِ ﷺ، وَأَجْمَعَ عَلَيْهِ السَّلَفُ مِنَ الإِيمَانِ بِاللَّهِ؟"),
      back: t(
        "That He is above His heavens, over His Throne, high above His creation — and He is with them wherever they are, knowing what they do.",
        "«أَنَّهُ سُبْحَانَهُ فَوْقَ سَمَوَاتِهِ عَلَى عَرْشِهِ، عَلِيٌّ عَلَى خَلْقِهِ، وَهُوَ سُبْحَانَهُ مَعَهُمْ أَيْنَمَا كَانُوا، يَعْلَمُ مَا هُمْ عَامِلُونَ»",
      ),
    },
    {
      kind: "point",
      page: 160,
      front: t("Does “And He is with you” mean that He is mixed with the creation?", "هَلْ مَعْنَى ﴿وَهُوَ مَعَكُمْ﴾ أَنَّهُ مُخْتَلِطٌ بِالخَلْقِ؟"),
      back: t(
        "No: the language does not require that; it is against the consensus of the Salaf and against the natural disposition Allah created people upon.",
        "لَا؛ «فَإِنَّ هَذَا لَا تُوجِبُهُ اللُّغَةُ. وَهُوَ خِلَافُ مَا أَجْمَعَ عَلَيْهِ سَلَفُ الأُمَّةِ. وَخِلَافُ مَا فَطَرَ اللَّهُ عَلَيْهِ الخَلْقَ»",
      ),
    },
    {
      kind: "example",
      page: 161,
      front: t("What example does the author give of something above us that is still “with” the traveller?", "مَا المِثَالُ الَّذِي ضَرَبَهُ المُؤَلِّفُ لِشَيْءٍ فِي العُلُوِّ وَهُوَ مَعَ المُسَافِرِ؟"),
      back: t(
        "The moon — one of the smallest of His creations: it is placed in the sky, and it is with the traveller wherever he is.",
        "«بَلِ القَمَرُ آيَةٌ مِنْ آيَاتِ اللَّهِ مِنْ أَصْغَرِ مَخْلُوقَاتِهِ، هُوَ مَوْضُوعٌ فِي السَّمَاءِ، وَهُوَ مَعَ المُسَافِرِ أَيْنَمَا كَانَ»",
      ),
    },
    {
      kind: "list",
      page: 161,
      front: t("Above the Throne, how is Allah with His creation?", "كَيْفَ هُوَ سُبْحَانَهُ مَعَ خَلْقِهِ وَهُوَ فَوْقَ العَرْشِ؟"),
      back: t(
        "Watching over His creation, dominant over them, seeing them — and other meanings of lordship.",
        "«رَقِيبٌ عَلَى خَلْقِهِ، مُهَيْمِنٌ عَلَيْهِمْ، مُطَّلِعٌ إِلَيْهِمْ، إِلَى غَيْرِ ذَلِكَ مِنْ مَعَانِي الرُّبُوبِيَّةِ»",
      ),
    },
    {
      kind: "point",
      page: 161,
      front: t("How are “He is above the Throne” and “He is with us” to be taken?", "كَيْفَ يُؤْخَذُ كَوْنُهُ فَوْقَ العَرْشِ وَكَوْنُهُ مَعَنَا؟"),
      back: t("Both are true on their real meaning; they need no distortion, but are kept safe from false suppositions.", "«حَقٌّ عَلَى حَقِيقَتِهِ، لَا يَحْتَاجُ إِلَى تَحْرِيفٍ، وَلَكِنْ يُصَانُ عَنِ الظُّنُونِ الكَاذِبَةِ»"),
    },
    {
      kind: "evidence",
      page: 162,
      front: t("Which āyah does he cite for Allah being near to His creation?", "مَا الآيَةُ الَّتِي اسْتَدَلَّ بِهَا عَلَى قُرْبِ اللَّهِ مِنْ خَلْقِهِ؟"),
      back: t(
        "“And when My servants ask you about Me — indeed I am near. I respond to the call of the caller when he calls upon Me.” [al-Baqarah: 186]",
        "﴿وَإِذَا سَأَلَكَ عِبَادِى عَنِّى فَإِنِّى قَرِيبٌ أُجِيبُ دَعْوَةَ ٱلدَّاعِ إِذَا دَعَانِ﴾ [البَقَرَة: ١٨٦]",
      ),
    },
    {
      kind: "point",
      page: 162,
      front: t("Does His nearness and withness contradict His highness and being above?", "هَلْ يُنَافِي قُرْبُهُ وَمَعِيَّتُهُ عُلُوَّهُ وَفَوْقِيَّتَهُ؟"),
      back: t(
        "No: there is nothing like Him in any of His descriptions — He is high in His nearness, and near in His highness.",
        "لَا؛ «فَإِنَّهُ سُبْحَانَهُ لَيْسَ كَمِثْلِهِ شَيْءٌ فِي جَمِيعِ نُعُوتِهِ؛ وَهُوَ عَلِيٌّ فِي دُنُوِّهِ، قَرِيبٌ فِي عُلُوِّهِ»",
      ),
    },
    {
      kind: "cloze",
      page: 162,
      front: t("“He is ______ in His nearness, ______ in His highness.”", "«وَهُوَ ______ فِي دُنُوِّهِ، ______ فِي عُلُوِّهِ»"),
      back: t("high · near", "عَلِيٌّ · قَرِيبٌ"),
    },
  ],

  // ───────────── 9 · The Qur'an; seeing Allah ─────────────
  [
    opening(8, 163, t("What does the section on the Qur'an and the seeing of Allah establish?", "مَاذَا يُقَرِّرُ هَذَا الفَصْلُ مِنَ الإِيمَانِ بِالكُتُبِ وَالرُّؤْيَةِ؟")),
    {
      kind: "list",
      page: 163,
      front: t("What is part of believing in Allah and His Books, about the Qur'an?", "مَا الَّذِي يَدْخُلُ فِي الإِيمَانِ بِهِ وَبِكُتُبِهِ فِي شَأْنِ القُرْآنِ؟"),
      back: t(
        "That the Qur'an is the Speech of Allah, sent down, not created; from Him it began and to Him it returns; and that Allah spoke it in reality.",
        "«الإِيمَانُ بِأَنَّ القُرْآنَ كَلَامُ اللَّهِ، مُنَزَّلٌ، غَيْرُ مَخْلُوقٍ، مِنْهُ بَدَأَ، وَإِلَيْهِ يَعُودُ، وَأَنَّ اللَّهَ تَكَلَّمَ بِهِ حَقِيقَةً»",
      ),
    },
    {
      kind: "cloze",
      page: 163,
      front: t("“…the Speech of Allah, sent down, ______; from Him it began, and to Him it returns.”", "«كَلَامُ اللَّهِ، مُنَزَّلٌ، ______، مِنْهُ بَدَأَ، وَإِلَيْهِ يَعُودُ»"),
      back: t("not created", "غَيْرُ مَخْلُوقٍ"),
    },
    {
      kind: "point",
      page: 163,
      front: t("Is it permitted to say the Qur'an is a ‘report’ (ḥikāyah) or an ‘expression’ (ʿibārah) of Allah's speech?", "هَلْ يَجُوزُ القَوْلُ بِأَنَّ القُرْآنَ حِكَايَةٌ عَنْ كَلَامِ اللَّهِ أَوْ عِبَارَةٌ عَنْهُ؟"),
      back: t("It is not permitted to say so unqualifiedly.", "«وَلَا يَجُوزُ إِطْلَاقُ القَوْلِ بِأَنَّهُ حِكَايَةٌ عَنْ كَلَامِ اللَّهِ، أَوْ عِبَارَةٌ عَنْهُ»"),
    },
    {
      kind: "point",
      page: 163,
      front: t("When people recite it or write it in the muṣḥafs, does it stop being Allah's Speech?", "إِذَا قَرَأَهُ النَّاسُ أَوْ كَتَبُوهُ فِي المَصَاحِفِ، هَلْ يَخْرُجُ عَنْ كَوْنِهِ كَلَامَ اللَّهِ؟"),
      back: t("No — it remains the Speech of Allah in reality.", "«لَمْ يَخْرُجْ بِذَلِكَ عَنْ أَنْ يَكُونَ كَلَامَ اللَّهِ حَقِيقَةً»"),
    },
    {
      kind: "point",
      page: 163,
      front: t("To whom is speech really attributed?", "إِلَى مَنْ يُضَافُ الكَلَامُ حَقِيقَةً؟"),
      back: t("To the one who said it first, not to the one who conveyed and delivered it.", "«فَإِنَّ الكَلَامَ إِنَّمَا يُضَافُ حَقِيقَةً إِلَى مَنْ قَالَهُ مُبْتَدِئًا، لَا إِلَى مَنْ قَالَهُ مُبَلِّغًا مُؤَدِّيًا»"),
    },
    {
      kind: "point",
      page: 164,
      front: t("How will the believers see Allah on the Day of Judgement?", "كَيْفَ يَرَى المُؤْمِنُونَ رَبَّهُمْ يَوْمَ القِيَامَةِ؟"),
      back: t(
        "Openly, with their eyes — as they see the sun on a clear day with no cloud before it, and as they see the moon on the night it is full, without crowding one another to see it.",
        "«عِيَانًا بِأَبْصَارِهِمْ؛ كَمَا يَرَوْنَ الشَّمْسَ صَحْوًا لَيْسَ دُونَهَا سَحَابٌ، وَكَمَا يَرَوْنَ القَمَرَ لَيْلَةَ البَدْرِ لَا يُضَامُونَ فِي رُؤْيَتِهِ»",
      ),
    },
    {
      kind: "list",
      page: 164,
      front: t("Where will the believers see Him?", "أَيْنَ يَرَاهُ المُؤْمِنُونَ؟"),
      back: t("In the plains of the Day of Judgement, and then after entering Paradise — as Allah wills.", "«يَرَوْنَهُ سُبْحَانَهُ وَهُمْ فِي عَرَصَاتِ القِيَامَةِ. ثُمَّ يَرَوْنَهُ بَعْدَ دُخُولِ الجَنَّةِ. كَمَا يَشَاءُ اللَّهُ»"),
    },
  ],

  // ───────────── 10 · The Last Day ─────────────
  [
    opening(9, 165, t("What does the section on the Last Day cover?", "مَا الَّذِي يَتَنَاوَلُهُ فَصْلُ اليَوْمِ الآخِرِ؟")),
    {
      kind: "point",
      page: 165,
      front: t("What is part of belief in the Last Day?", "مَا الَّذِي يَدْخُلُ فِي الإِيمَانِ بِاليَوْمِ الآخِرِ؟"),
      back: t(
        "Believing everything the Prophet ﷺ told of what will happen after death — so they believe in the trial of the grave, and its punishment and bliss.",
        "«الإِيمَانُ بِكُلِّ مَا أَخْبَرَ بِهِ النَّبِيُّ ﷺ مِمَّا يَكُونُ بَعْدَ المَوْتِ. فَيُؤْمِنُونَ بِفِتْنَةِ القَبْرِ، وَبِعَذَابِ القَبْرِ وَنَعِيمِهِ»",
      ),
    },
    {
      kind: "list",
      page: 165,
      front: t("What three questions are asked in the grave?", "مَا الأَسْئِلَةُ الثَّلَاثَةُ فِي القَبْرِ؟"),
      back: t("Who is your Lord? What is your religion? Who is your Prophet?", "«مَنْ رَبُّكَ؟ وَمَا دِينُكَ؟ وَمَنْ نَبِيُّكَ؟»"),
    },
    {
      kind: "point",
      page: 165,
      front: t("What does the believer answer in the grave?", "بِمَ يُجِيبُ المُؤْمِنُ فِي قَبْرِهِ؟"),
      back: t("“Allah is my Lord, Islam is my religion, and Muḥammad is my Prophet.”", "«اللَّهُ رَبِّي، وَالإِسْلَامُ دِينِي، وَمُحَمَّدٌ نَبِيِّي»"),
    },
    {
      kind: "point",
      page: 165,
      front: t("What does the doubter say in the grave?", "مَاذَا يَقُولُ المُرْتَابُ فِي قَبْرِهِ؟"),
      back: t("“Ah, ah — I don't know. I heard people saying something, so I said it.”", "«آهْ آهْ، لَا أَدْرِي، سَمِعْتُ النَّاسَ يَقُولُونَ شَيْئًا فَقُلْتُهُ»"),
    },
    {
      kind: "point",
      page: 166,
      front: t("What happens to the doubter then?", "مَاذَا يَكُونُ لِلْمُرْتَابِ بَعْدَ ذَلِكَ؟"),
      back: t(
        "He is struck with an iron hammer and screams a scream heard by everything except man — had man heard it, he would have fallen unconscious.",
        "«فَيُضْرَبُ بِمِرْزَبَّةٍ مِنْ حَدِيدٍ، فَيَصِيحُ صَيْحَةً يَسْمَعُهَا كُلُّ شَيْءٍ إِلَّا الإِنْسَانَ، وَلَوْ سَمِعَهَا الإِنْسَانُ لَصَعِقَ»",
      ),
    },
    {
      kind: "point",
      page: 166,
      front: t("What comes after the trial of the grave?", "مَاذَا يَكُونُ بَعْدَ فِتْنَةِ القَبْرِ؟"),
      back: t("Either bliss or punishment, until the Greater Resurrection; then the souls are returned to the bodies.", "«إِمَّا نَعِيمٌ وَإِمَّا عَذَابٌ إِلَى يَوْمِ القِيَامَةِ الكُبْرَى. فَتُعَادُ الأَرْوَاحُ إِلَى الأَجْسَادِ»"),
    },
    {
      kind: "point",
      page: 167,
      front: t("How do people rise from their graves for the Lord of the worlds?", "عَلَى أَيِّ حَالٍ يَقُومُ النَّاسُ مِنْ قُبُورِهِمْ لِرَبِّ العَالَمِينَ؟"),
      back: t("Barefoot, naked and uncircumcised; the sun draws near them, and sweat reaches up to their mouths.", "«حُفَاةً عُرَاةً غُرْلًا، وَتَدْنُو مِنْهُمُ الشَّمْسُ، وَيُلْجِمُهُمُ العَرَقُ»"),
    },
    {
      kind: "evidence",
      page: 168,
      front: t("What is weighed on the Scales — and what is the evidence?", "مَا الَّذِي يُوزَنُ فِي المَوَازِينِ؟ وَمَا الدَّلِيلُ؟"),
      back: t(
        "The deeds of the servants: “So those whose scales are heavy — it is they who are successful; and those whose scales are light — they are the ones who have lost themselves, abiding in Hell forever.” [al-Muʾminūn: 102–103]",
        "«فَتُوزَنُ فِيهَا أَعْمَالُ العِبَادِ» ﴿فَمَن ثَقُلَتْ مَوَٰزِينُهُۥ فَأُو۟لَٰٓئِكَ هُمُ ٱلْمُفْلِحُونَ * وَمَنْ خَفَّتْ مَوَٰزِينُهُۥ فَأُو۟لَٰٓئِكَ ٱلَّذِينَ خَسِرُوٓا۟ أَنفُسَهُمْ فِى جَهَنَّمَ خَٰلِدُونَ﴾ [المُؤْمِنُون: ١٠٢–١٠٣]",
      ),
    },
    {
      kind: "term",
      page: 169,
      front: t("What are the dawāwīn that will be spread open, and how are they taken?", "مَا الدَّوَاوِينُ الَّتِي تُنْشَرُ؟ وَكَيْفَ تُؤْخَذُ؟"),
      back: t(
        "The records of deeds: one takes his book in his right hand, and another in his left hand, or from behind his back.",
        "«وَهِيَ صَحَائِفُ الأَعْمَالِ -؛ فَآخِذٌ كِتَابَهُ بِيَمِينِهِ، وَآخِذٌ كِتَابَهُ بِشِمَالِهِ، أَوْ مِنْ وَرَاءِ ظَهْرِهِ»",
      ),
    },
    {
      kind: "evidence",
      page: 169,
      front: t("What is the evidence for the records of deeds?", "مَا الدَّلِيلُ عَلَى نَشْرِ صَحَائِفِ الأَعْمَالِ؟"),
      back: t(
        "“And every person — We have fastened his fate to his neck, and We will produce for him on the Day of Resurrection a record which he will find spread open. Read your record; sufficient is yourself today as accountant against you.” [al-Isrāʾ: 13–14]",
        "﴿وَكُلَّ إِنسَٰنٍ أَلْزَمْنَٰهُ طَٰٓئِرَهُۥ فِى عُنُقِهِۦ وَنُخْرِجُ لَهُۥ يَوْمَ ٱلْقِيَٰمَةِ كِتَٰبًا يَلْقَىٰهُ مَنشُورًا * ٱقْرَأْ كِتَٰبَكَ كَفَىٰ بِنَفْسِكَ ٱلْيَوْمَ عَلَيْكَ حَسِيبًا﴾ [الإِسْرَاء: ١٣–١٤]",
      ),
    },
    {
      kind: "point",
      page: 170,
      front: t("How does Allah take His believing servant to account?", "كَيْفَ يُحَاسِبُ اللَّهُ عَبْدَهُ المُؤْمِنَ؟"),
      back: t("He is alone with him, and makes him admit his sins.", "«وَيَخْلُو بِعَبْدِهِ المُؤْمِنِ؛ فَيُقَرِّرُهُ بِذُنُوبِهِ»"),
    },
    {
      kind: "point",
      page: 170,
      front: t("How are the disbelievers taken to account?", "كَيْفَ يُحَاسَبُ الكُفَّارُ؟"),
      back: t(
        "Not the reckoning of one whose good and bad deeds are weighed, for they have no good deeds; rather their deeds are counted and enumerated, they are made to stand before them, admit them, and are recompensed for them.",
        "«فَلَا يُحَاسَبُونَ مُحَاسَبَةَ مَنْ تُوزَنُ حَسَنَاتُهُ وَسَيِّئَاتُهُ؛ فَإِنَّهُمْ لَا حَسَنَاتِ لَهُمْ، وَلَكِنْ تُعَدُّ أَعْمَالُهُمْ وَتُحْصَى، فَيُوقَفُونَ عَلَيْهَا، وَيُقَرَّرُونَ بِهَا، وَيُجْزَوْنَ بِهَا»",
      ),
    },
    {
      kind: "list",
      page: 171,
      front: t("Describe the Ḥawḍ (Basin) of Muḥammad ﷺ.", "صِفْ حَوْضَ مُحَمَّدٍ ﷺ."),
      back: t(
        "Its water is whiter than milk and sweeter than honey; its length is a month and its width a month; its vessels are as many as the stars of the sky; whoever drinks from it once will never be thirsty after.",
        "«مَاؤُهُ أَشَدُّ بَيَاضًا مِنَ اللَّبَنِ، وَأَحْلَى مِنَ العَسَلِ. طُولُهُ شَهْرٌ، وَعَرْضُهُ شَهْرٌ. آنِيَتُهُ عَدَدُ نُجُومِ السَّمَاءِ. مَنْ شَرِبَ مِنْهُ شَرْبَةً لَمْ يَظْمَأْ بَعْدَهَا أَبَدًا»",
      ),
    },
    {
      kind: "term",
      page: 172,
      front: t("What is the Ṣirāṭ?", "مَا الصِّرَاطُ؟"),
      back: t(
        "It is set over Hell — the bridge between Paradise and the Fire; people pass over it according to their deeds.",
        "«وَالصِّرَاطُ مَنْصُوبٌ عَلَى مَتْنِ جَهَنَّمَ، وَهُوَ الجِسْرُ الَّذِي بَيْنَ الجَنَّةِ وَالنَّارِ، يَمُرُّ النَّاسُ عَلَيْهِ عَلَى قَدْرِ أَعْمَالِهِمْ»",
      ),
    },
    {
      kind: "list",
      page: 172,
      front: t("How do people pass over the Ṣirāṭ?", "كَيْفَ يَمُرُّ النَّاسُ عَلَى الصِّرَاطِ؟"),
      back: t(
        "Some like the blink of an eye, some like lightning, some like the wind, some like a swift horse, some like riding camels; some run, some walk, some crawl; and some are snatched and thrown into Hell.",
        "«فَمِنْهُمْ مَنْ يَمُرُّ كَلَمْحِ البَصَرِ، وَمِنْهُمْ مَنْ يَمُرُّ كَالبَرْقِ، وَمِنْهُمْ مَنْ يَمُرُّ كَالرِّيحِ. وَمِنْهُمْ مَنْ يَمُرُّ كَالفَرَسِ الجَوَادِ، وَمِنْهُمْ مَنْ يَمُرُّ كَرِكَابِ الإِبِلِ. وَمِنْهُمْ مَنْ يَعْدُو عَدْوًا، وَمِنْهُمْ مَنْ يَمْشِي مَشْيًا، وَمِنْهُمْ مَنْ يَزْحَفُ زَحْفًا. وَمِنْهُمْ مَنْ يُخْطَفُ فَيُلْقَى فِي جَهَنَّمَ»",
      ),
    },
    {
      kind: "point",
      page: 172,
      front: t("What is on the bridge that snatches people?", "مَا الَّذِي عَلَى الجِسْرِ يَخْطَفُ النَّاسَ؟"),
      back: t("Hooks that snatch people according to their deeds.", "«فَإِنَّ الجِسْرَ عَلَيْهِ كَلَالِيبُ، تَخْطَفُ النَّاسَ بِأَعْمَالِهِمْ»"),
    },
    {
      kind: "point",
      page: 173,
      front: t("What happens once they have crossed the Ṣirāṭ?", "مَاذَا يَكُونُ إِذَا عَبَرُوا الصِّرَاطَ؟"),
      back: t(
        "They stop at a bridge between Paradise and the Fire, where some are given retribution from others; once purified and cleansed, they are permitted to enter Paradise.",
        "«وُقِفُوا عَلَى قَنْطَرَةٍ بَيْنَ الجَنَّةِ وَالنَّارِ، فَيُقْتَصُّ لِبَعْضِهِمْ مِنْ بَعْضٍ. فَإِذَا هُذِّبُوا وَنُقُّوا: أُذِنَ لَهُمْ فِي دُخُولِ الجَنَّةِ»",
      ),
    },
    {
      kind: "point",
      page: 173,
      front: t("Who is first to ask for Paradise's gate to be opened, and which nation enters first?", "مَنْ أَوَّلُ مَنْ يَسْتَفْتِحُ بَابَ الجَنَّةِ؟ وَأَيُّ الأُمَمِ تَدْخُلُهَا أَوَّلًا؟"),
      back: t("Muḥammad ﷺ is first to ask it opened, and his ummah is the first nation to enter.", "«وَأَوَّلُ مَنْ يَسْتَفْتِحُ بَابَ الجَنَّةِ: مُحَمَّدٌ ﷺ. وَأَوَّلُ مَنْ يَدْخُلُ الجَنَّةَ مِنَ الأُمَمِ: أُمَّتُهُ ﷺ»"),
    },
    {
      kind: "list",
      page: 174,
      front: t("What are the Prophet's ﷺ three intercessions on the Day of Judgement?", "مَا شَفَاعَاتُ النَّبِيِّ ﷺ الثَّلَاثُ يَوْمَ القِيَامَةِ؟"),
      back: t(
        "1) For the people of the standing, that they be judged — after Ādam, Nūḥ, Ibrāhīm, Mūsā and ʿĪsā each decline; 2) for the people of Paradise, that they enter it; 3) for those who deserve the Fire — that they not enter it, and that those who entered leave it.",
        "الأُولَى: «فَيَشْفَعُ فِي أَهْلِ المَوْقِفِ؛ حَتَّى يُقْضَى بَيْنَهُمْ». الثَّانِيَةُ: «فَيَشْفَعُ فِي أَهْلِ الجَنَّةِ أَنْ يَدْخُلُوا الجَنَّةَ». الثَّالِثَةُ: «فِيمَنِ اسْتَحَقَّ النَّارَ أَنْ لَا يَدْخُلَهَا، … وَفِيمَنْ دَخَلَهَا أَنْ يَخْرُجَ مِنْهَا»",
      ),
    },
    {
      kind: "point",
      page: 174,
      front: t("Which of the intercessions are his alone, and which does he share?", "أَيُّ الشَّفَاعَاتِ خَاصَّةٌ بِهِ ﷺ؟ وَأَيُّهَا يُشَارِكُهُ فِيهَا غَيْرُهُ؟"),
      back: t(
        "The first two are his alone; the third is for him and for the rest of the prophets, the truthful and others.",
        "«وَهَاتَانِ الشَّفَاعَتَانِ خَاصَّتَانِ لَهُ». وَالثَّالِثَةُ «لَهُ وَلِسَائِرِ النَّبِيِّينَ وَالصِّدِّيقِينَ وَغَيْرِهِمْ»",
      ),
    },
    {
      kind: "point",
      page: 175,
      front: t("Does Allah bring people out of the Fire without anyone's intercession?", "هَلْ يُخْرِجُ اللَّهُ مِنَ النَّارِ أَحَدًا بِغَيْرِ شَفَاعَةٍ؟"),
      back: t("Yes — Allah brings out peoples from the Fire without intercession, by His favour and mercy.", "«وَيُخْرِجُ اللَّهُ مِنَ النَّارِ أَقْوَامًا بِغَيْرِ شَفَاعَةٍ؛ بَلْ بِفَضْلِهِ وَرَحْمَتِهِ»"),
    },
    {
      kind: "point",
      page: 175,
      front: t("What happens to the space left over in Paradise?", "مَا شَأْنُ الفَضْلِ البَاقِي فِي الجَنَّةِ؟"),
      back: t(
        "Room remains in Paradise beyond those of the world who enter it, so Allah creates peoples for it and enters them into Paradise.",
        "«وَيَبْقَى فِي الجَنَّةِ فَضْلٌ عَمَّنْ دَخَلَهَا مِنْ أَهْلِ الدُّنْيَا، فَيُنْشِئُ اللَّهُ لَهَا أَقْوَامًا، فَيُدْخِلُهُمُ الجَنَّةَ»",
      ),
    },
    {
      kind: "point",
      page: 176,
      front: t("Where are the details of the Hereafter found?", "أَيْنَ تُوجَدُ تَفَاصِيلُ الدَّارِ الآخِرَةِ؟"),
      back: t(
        "In the books sent down from the heaven and in the knowledge handed down from the prophets; and in the knowledge inherited from Muḥammad ﷺ there is what suffices and heals — whoever seeks it finds it.",
        "«مَذْكُورَةٌ فِي الكُتُبِ المُنَزَّلَةِ مِنَ السَّمَاءِ، وَالآثَارَةِ مِنَ العِلْمِ المَأْثُورَةِ عَنِ الأَنْبِيَاءِ. وَفِي العِلْمِ المَوْرُوثِ عَنْ مُحَمَّدٍ ﷺ مِنْ ذَلِكَ مَا يَشْفِي وَيَكْفِي، فَمَنِ ابْتَغَاهُ وَجَدَهُ»",
      ),
    },
  ],

  // ───────────── 11 · The decree ─────────────
  [
    opening(10, 177, t("What does the section on the decree establish?", "مَاذَا يُقَرِّرُ فَصْلُ القَدَرِ؟")),
    {
      kind: "point",
      page: 177,
      front: t("On how many levels is belief in the decree, and what does each contain?", "عَلَى كَمْ دَرَجَةٍ يَكُونُ الإِيمَانُ بِالقَدَرِ؟ وَمَاذَا تَتَضَمَّنُ كُلُّ دَرَجَةٍ؟"),
      back: t("Two levels, each containing two things.", "«عَلَى دَرَجَتَيْنِ، كُلُّ دَرَجَةٍ تَتَضَمَّنُ شَيْئَيْنِ»"),
    },
    {
      kind: "list",
      page: 177,
      front: t("What two things does the first level contain?", "مَا الشَّيْئَانِ اللَّذَانِ تَتَضَمَّنُهُمَا الدَّرَجَةُ الأُولَى؟"),
      back: t(
        "That Allah knew what the creation would do by His eternal knowledge — all their states of obedience and disobedience, provisions and lifespans; then Allah wrote the measures of all creation in the Preserved Tablet.",
        "عِلْمُهُ: «أَنَّ اللَّهَ تَعَالَى عَلِمَ مَا الخَلْقُ عَامِلُونَ بِعِلْمِهِ القَدِيمِ … وَعَلِمَ جَمِيعَ أَحْوَالِهِمْ». وَالكِتَابَةُ: «ثُمَّ كَتَبَ اللَّهُ فِي اللَّوْحِ المَحْفُوظِ مَقَادِيرَ الخَلَائِقِ»",
      ),
    },
    {
      kind: "point",
      page: 177,
      front: t("What did Allah create first, and what did He say to it?", "مَا أَوَّلُ مَا خَلَقَ اللَّهُ؟ وَمَاذَا قَالَ لَهُ؟"),
      back: t("The Pen. He said to it: Write. It said: What shall I write? He said: Write what will be until the Day of Judgement.", "«القَلَمَ؛ قَالَ لَهُ: اكْتُبْ. قَالَ: مَا أَكْتُبُ؟ قَالَ: اكْتُبْ مَا هُوَ كَائِنٌ إِلَى يَوْمِ القِيَامَةِ»"),
    },
    {
      kind: "point",
      page: 178,
      front: t("What follows from this, for what befalls a person?", "مَا الَّذِي يَتَرَتَّبُ عَلَى ذَلِكَ فِيمَا يُصِيبُ الإِنْسَانَ؟"),
      back: t(
        "What befell a person was never going to miss him, and what missed him was never going to befall him. The pens have dried and the scrolls are folded.",
        "«فَمَا أَصَابَ الإِنْسَانَ لَمْ يَكُنْ لِيُخْطِئَهُ، وَمَا أَخْطَأَهُ لَمْ يَكُنْ لِيُصِيبَهُ. جَفَّتِ الأَقْلَامُ، وَطُوِيَتِ الصُّحُفُ»",
      ),
    },
    {
      kind: "evidence",
      page: 178,
      front: t("Which āyah links Allah's knowledge with its being written in a record?", "مَا الآيَةُ الَّتِي قَرَنَتْ بَيْنَ عِلْمِ اللَّهِ وَكِتَابَتِهِ؟"),
      back: t(
        "“Do you not know that Allah knows what is in the heaven and earth? Indeed, that is in a record. Indeed, that is easy for Allah.” [al-Ḥajj: 70]",
        "﴿أَلَمْ تَعْلَمْ أَنَّ ٱللَّهَ يَعْلَمُ مَا فِى ٱلسَّمَآءِ وَٱلْأَرْضِ إِنَّ ذَٰلِكَ فِى كِتَٰبٍ إِنَّ ذَٰلِكَ عَلَى ٱللَّهِ يَسِيرٌ﴾ [الحَجّ: ٧٠]",
      ),
    },
    {
      kind: "evidence",
      page: 178,
      front: t("Which āyah tells that no calamity strikes except it is in a record before it is brought into being?", "مَا الآيَةُ الَّتِي فِيهَا أَنَّهُ مَا أَصَابَ مِنْ مُصِيبَةٍ إِلَّا فِي كِتَابٍ؟"),
      back: t(
        "“No calamity strikes on earth or among yourselves except that it is in a record before We bring it into being. Indeed, that is easy for Allah.” [al-Ḥadīd: 22]",
        "﴿مَآ أَصَابَ مِن مُّصِيبَةٍ فِى ٱلْأَرْضِ وَلَا فِىٓ أَنفُسِكُمْ إِلَّا فِى كِتَٰبٍ مِّن قَبْلِ أَن نَّبْرَأَهَآ إِنَّ ذَٰلِكَ عَلَى ٱللَّهِ يَسِيرٌ﴾ [الحَدِيد: ٢٢]",
      ),
    },
    {
      kind: "list",
      page: 179,
      front: t("When the angel is sent to the foetus, which four things is it commanded to write?", "إِذَا بُعِثَ المَلَكُ إِلَى الجَنِينِ، بِأَيِّ أَرْبَعِ كَلِمَاتٍ يُؤْمَرُ؟"),
      back: t("His provision, his lifespan, his deeds, and whether he will be wretched or happy.", "«بِكَتْبِ رِزْقِهِ، وَأَجَلِهِ، وَعَمَلِهِ، وَشَقِيٌّ أَوْ سَعِيدٌ»"),
    },
    {
      kind: "point",
      page: 179,
      front: t("Who denied this level of the decree?", "مَنْ أَنْكَرَ هَذِهِ الدَّرَجَةَ مِنَ القَدَرِ؟"),
      back: t("The extremists of the Qadariyyah, in early times; those who deny it today are few.", "«فَهَذَا القَدَرُ قَدْ كَانَ يُنْكِرُهُ غُلَاةُ القَدَرِيَّةِ قَدِيمًا؛ وَمُنْكِرُوهُ اليَوْمَ قَلِيلٌ»"),
    },
    {
      kind: "term",
      page: 180,
      front: t("What is the second level of the decree?", "مَا الدَّرَجَةُ الثَّانِيَةُ مِنَ القَدَرِ؟"),
      back: t(
        "Allah's will that is always carried out and His all-encompassing power: that whatever Allah wills happens, and whatever He does not will does not happen.",
        "«فَهِيَ مَشِيئَةُ اللَّهِ النَّافِذَةُ، وَقُدْرَتُهُ الشَّامِلَةُ، وَهُوَ: الإِيمَانُ بِأَنَّ مَا شَاءَ اللَّهُ كَانَ، وَمَا لَمْ يَشَأْ لَمْ يَكُنْ»",
      ),
    },
    {
      kind: "point",
      page: 180,
      front: t("Is there any movement or stillness in the heavens or earth outside Allah's will?", "هَلْ فِي السَّمَوَاتِ وَالأَرْضِ حَرَكَةٌ أَوْ سُكُونٌ خَارِجٌ عَنْ مَشِيئَةِ اللَّهِ؟"),
      back: t(
        "No — nothing moves or stays still except by His will; nothing is in His dominion except what He intends; He is able to do all things; and there is no created thing except Allah is its Creator.",
        "لَا؛ «مَا فِي السَّمَوَاتِ وَلَا فِي الأَرْضِ مِنْ حَرَكَةٍ وَلَا سُكُونٍ إِلَّا بِمَشِيئَةِ اللَّهِ سُبْحَانَهُ، لَا يَكُونُ فِي مُلْكِهِ إِلَّا مَا يُرِيدُ»",
      ),
    },
    {
      kind: "list",
      page: 181,
      front: t("With His will over everything, what has Allah commanded and loved — and what does He not love?", "مَعَ عُمُومِ مَشِيئَتِهِ: بِمَ أَمَرَ اللَّهُ؟ وَمَاذَا يُحِبُّ؟ وَمَاذَا لَا يُحِبُّ؟"),
      back: t(
        "He commanded obedience to Him and His messengers and forbade disobedience. He loves the God-fearing, the doers of good and the just, and is pleased with those who believe and do good; He does not love the disbelievers, is not pleased with the defiantly disobedient, does not command immorality, is not pleased with disbelief for His servants, and does not love corruption.",
        "«فَقَدْ أَمَرَ العِبَادَ بِطَاعَتِهِ وَطَاعَةِ رُسُلِهِ، وَنَهَاهُمْ عَنْ مَعْصِيَتِهِ. وَهُوَ سُبْحَانَهُ يُحِبُّ المُتَّقِينَ وَالمُحْسِنِينَ وَالمُقْسِطِينَ … وَلَا يُحِبُّ الكَافِرِينَ … وَلَا يَرْضَى لِعِبَادِهِ الكُفْرَ، وَلَا يُحِبُّ الفَسَادَ»",
      ),
    },
    {
      kind: "point",
      page: 182,
      front: t("Are the servants really the doers of their actions?", "هَلِ العِبَادُ فَاعِلُونَ لِأَفْعَالِهِمْ حَقِيقَةً؟"),
      back: t(
        "Yes: the servants are doers in reality, and Allah is the Creator of their actions. They have ability and will, and Allah created them, their ability and their will.",
        "«وَالعِبَادُ فَاعِلُونَ حَقِيقَةً، وَاللَّهُ خَالِقُ أَفْعَالِهِمْ … وَلِلْعِبَادِ قُدْرَةٌ عَلَى أَعْمَالِهِمْ، وَلَهُمْ إِرَادَةٌ، وَاللَّهُ خَالِقُهُمْ وَخَالِقُ قُدْرَتِهِمْ وَإِرَادَتِهِمْ»",
      ),
    },
    {
      kind: "evidence",
      page: 182,
      front: t("Which āyah affirms a will for the servant beneath the will of Allah?", "مَا الآيَةُ الَّتِي أَثْبَتَتْ لِلْعَبْدِ مَشِيئَةً تَابِعَةً لِمَشِيئَةِ اللَّهِ؟"),
      back: t(
        "“For whoever wills among you to take a right course. And you do not will except that Allah wills, the Lord of the worlds.” [at-Takwīr: 28–29]",
        "﴿لِمَن شَآءَ مِنكُمْ أَن يَسْتَقِيمَ * وَمَا تَشَآءُونَ إِلَّآ أَن يَشَآءَ ٱللَّهُ رَبُّ ٱلْعَٰلَمِينَ﴾ [التَّكْوِير: ٢٨–٢٩]",
      ),
    },
    {
      kind: "point",
      page: 182,
      front: t("Who denies this second level, and what did the Salaf call them?", "مَنْ يُكَذِّبُ بِهَذِهِ الدَّرَجَةِ؟ وَبِمَ سَمَّاهُمُ السَّلَفُ؟"),
      back: t("Most of the Qadariyyah — whom the Salaf called the Magians of this ummah.", "«يُكَذِّبُ بِهَا عَامَّةُ القَدَرِيَّةِ، الَّذِينَ سَمَّاهُمُ السَّلَفُ مَجُوسَ هَذِهِ الأُمَّةِ»"),
    },
    {
      kind: "point",
      page: 182,
      front: t("Who goes to extremes in this level from the other side?", "مَنْ يَغْلُو فِي هَذِهِ الدَّرَجَةِ مِنَ الجِهَةِ الأُخْرَى؟"),
      back: t(
        "A group of those who affirm (the decree), until they strip the servant of his ability and choice, and empty Allah's actions and rulings of their wisdom and benefits.",
        "«وَيَغْلُو فِيهَا قَوْمٌ مِنْ أَهْلِ الإِثْبَاتِ؛ حَتَّى يَسْلُبُوا العَبْدَ قُدْرَتَهُ وَاخْتِيَارَهُ، وَيُخْرِجُونَ عَنْ أَفْعَالِ اللَّهِ وَأَحْكَامِهِ؛ حِكَمَهَا وَمَصَالِحَهَا»",
      ),
    },
  ],

  // ───────────── 12 · Īmān and the sinner ─────────────
  [
    opening(11, 183, t("What does the section on īmān establish?", "مَاذَا يُقَرِّرُ فَصْلُ الإِيمَانِ؟")),
    {
      kind: "term",
      page: 183,
      front: t("What are the religion and īmān, according to the saved sect?", "مَا الدِّينُ وَالإِيمَانُ عِنْدَ الفِرْقَةِ النَّاجِيَةِ؟"),
      back: t(
        "Word and deed: the word of the heart and the tongue, and the deed of the heart, the tongue and the limbs.",
        "«قَوْلٌ وَعَمَلٌ؛ قَوْلُ القَلْبِ وَاللِّسَانِ، وَعَمَلُ القَلْبِ وَاللِّسَانِ وَالجَوَارِحِ»",
      ),
    },
    {
      kind: "point",
      page: 183,
      front: t("Does īmān increase and decrease?", "هَلْ يَزِيدُ الإِيمَانُ وَيَنْقُصُ؟"),
      back: t("Yes: it increases with obedience and decreases with disobedience.", "«وَأَنَّ الإِيمَانَ يَزِيدُ بِالطَّاعَةِ، وَيَنْقُصُ بِالمَعْصِيَةِ»"),
    },
    {
      kind: "point",
      page: 183,
      front: t("Do they declare the people of the qiblah disbelievers for sins and major sins?", "هَلْ يُكَفِّرُونَ أَهْلَ القِبْلَةِ بِالمَعَاصِي وَالكَبَائِرِ؟"),
      back: t("No — not for sins and major sins as such, as the Khawārij do.", "«لَا يُكَفِّرُونَ أَهْلَ القِبْلَةِ بِمُطْلَقِ المَعَاصِي وَالكَبَائِرِ - كَمَا يَفْعَلُهُ الخَوَارِجُ -»"),
    },
    {
      kind: "evidence",
      page: 183,
      front: t("Which āyah of retribution shows that the brotherhood of īmān remains despite sins?", "مَا آيَةُ القِصَاصِ الدَّالَّةُ عَلَى بَقَاءِ الأُخُوَّةِ الإِيمَانِيَّةِ مَعَ المَعَاصِي؟"),
      back: t("“But whoever is pardoned by his brother for anything, then let there be a suitable follow-up.” [al-Baqarah: 178]", "﴿فَمَنْ عُفِىَ لَهُۥ مِنْ أَخِيهِ شَىْءٌ فَٱتِّبَاعٌۢ بِٱلْمَعْرُوفِ﴾ [البَقَرَة: ١٧٨]"),
      note: t("The killer is still called the brother of the one killed.", "فَسَمَّى القَاتِلَ أَخًا لِلْمَقْتُولِ."),
    },
    {
      kind: "evidence",
      page: 183,
      front: t("Which āyāt call two fighting parties believers, and brothers?", "مَا الآيَتَانِ اللَّتَانِ سَمَّتَا الطَّائِفَتَيْنِ المُقْتَتِلَتَيْنِ مُؤْمِنِينَ وَإِخْوَةً؟"),
      back: t(
        "“And if two parties of the believers fight, make peace between them…” to “The believers are but brothers, so make peace between your brothers.” [al-Ḥujurāt: 9–10]",
        "﴿وَإِن طَآئِفَتَانِ مِنَ ٱلْمُؤْمِنِينَ ٱقْتَتَلُوا۟ فَأَصْلِحُوا۟ بَيْنَهُمَا﴾ … ﴿إِنَّمَا ٱلْمُؤْمِنُونَ إِخْوَةٌ فَأَصْلِحُوا۟ بَيْنَ أَخَوَيْكُمْ﴾ [الحُجُرَات: ٩–١٠]",
      ),
    },
    {
      kind: "point",
      page: 184,
      front: t("What do Ahl as-Sunnah not do with the sinful Muslim, unlike the Muʿtazilah?", "مَاذَا لَا يَفْعَلُ أَهْلُ السُّنَّةِ بِالفَاسِقِ المِلِّيِّ، بِخِلَافِ المُعْتَزِلَةِ؟"),
      back: t("They do not strip him of the name of īmān altogether, nor do they make him abide forever in the Fire.", "«وَلَا يَسْلُبُونَ الفَاسِقَ المِلِّيَّ اسْمَ الإِيمَانِ بِالكُلِّيَّةِ، وَلَا يُخَلِّدُونَهُ فِي النَّارِ - كَمَا تَقُولُهُ المُعْتَزِلَةُ -»"),
    },
    {
      kind: "evidence",
      page: 184,
      front: t("Which āyah shows the sinner is included in the name ‘believer’?", "مَا الآيَةُ الدَّالَّةُ عَلَى دُخُولِ الفَاسِقِ فِي اسْمِ الإِيمَانِ؟"),
      back: t("“…then the freeing of a believing slave.” [an-Nisāʾ: 92]", "﴿فَتَحْرِيرُ رَقَبَةٍ مُّؤْمِنَةٍ﴾ [النِّسَاء: ٩٢]"),
      note: t("A sinful believing slave suffices here.", "فَيُجْزِئُ فِيهَا عِتْقُ المُؤْمِنِ وَإِنْ كَانَ فَاسِقًا."),
    },
    {
      kind: "evidence",
      page: 184,
      front: t("Which āyah shows the sinner may be excluded from the full, unqualified name of īmān?", "مَا الآيَةُ الدَّالَّةُ عَلَى أَنَّ الفَاسِقَ قَدْ لَا يَدْخُلُ فِي اسْمِ الإِيمَانِ المُطْلَقِ؟"),
      back: t("“The believers are only those who, when Allah is mentioned, their hearts become fearful.” [al-Anfāl: 2]", "﴿إِنَّمَا ٱلْمُؤْمِنُونَ ٱلَّذِينَ إِذَا ذُكِرَ ٱللَّهُ وَجِلَتْ قُلُوبُهُمْ﴾ [الأَنْفَال: ٢]"),
    },
    {
      kind: "hadith",
      page: 184,
      front: t("Which ḥadīth negates īmān from the adulterer, the thief and the drinker at the moment of the sin?", "مَا الحَدِيثُ الَّذِي نَفَى الإِيمَانَ عَنِ الزَّانِي وَالسَّارِقِ وَشَارِبِ الخَمْرِ حِينَ فِعْلِهِمْ؟"),
      back: t(
        "“The adulterer does not commit adultery while he is a believer; the thief does not steal while he is a believer; one does not drink wine while he is a believer; and one does not plunder a valuable spoil that people raise their eyes to while he is a believer.”",
        "«لَا يَزْنِي الزَّانِي حِينَ يَزْنِي وَهُوَ مُؤْمِنٌ. وَلَا يَسْرِقُ السَّارِقُ حِينَ يَسْرِقُ وَهُوَ مُؤْمِنٌ. وَلَا يَشْرَبُ الخَمْرَ حِينَ يَشْرَبُهَا وَهُوَ مُؤْمِنٌ. وَلَا يَنْتَهِبُ نُهْبَةً ذَاتَ شَرَفٍ يَرْفَعُ النَّاسُ إِلَيْهِ فِيهَا أَبْصَارَهُمْ حِينَ يَنْتَهِبُهَا وَهُوَ مُؤْمِنٌ»",
      ),
    },
    {
      kind: "point",
      page: 185,
      front: t("What do Ahl as-Sunnah say about the sinful believer?", "مَاذَا يَقُولُ أَهْلُ السُّنَّةِ فِي المُؤْمِنِ الفَاسِقِ؟"),
      back: t(
        "He is a believer deficient in īmān — or a believer by his īmān, a sinner by his major sin. He is not given the unqualified name, nor stripped of the name altogether.",
        "«هُوَ مُؤْمِنٌ نَاقِصُ الإِيمَانِ، أَوْ مُؤْمِنٌ بِإِيمَانِهِ فَاسِقٌ بِكَبِيرَتِهِ. فَلَا يُعْطَى الاسْمَ المُطْلَقَ، وَلَا يُسْلَبُ مُطْلَقَ الاسْمِ»",
      ),
    },
    {
      kind: "cloze",
      page: 185,
      front: t("“He is not given ______, nor is he stripped of ______.”", "«فَلَا يُعْطَى ______، وَلَا يُسْلَبُ ______»"),
      back: t("the unqualified name · the name altogether", "الاسْمَ المُطْلَقَ · مُطْلَقَ الاسْمِ"),
    },
  ],

  // ───────────── 13 · The Companions ─────────────
  [
    opening(12, 186, t("What principle about the Companions does this section lay down?", "مَا الأَصْلُ الَّذِي يُقَرِّرُهُ هَذَا الفَصْلُ فِي الصَّحَابَةِ؟")),
    {
      kind: "point",
      page: 186,
      front: t("What is one of the foundations of Ahl as-Sunnah regarding the Companions?", "مَا مِنْ أُصُولِ أَهْلِ السُّنَّةِ فِي أَصْحَابِ مُحَمَّدٍ ﷺ؟"),
      back: t("That their hearts and tongues are sound towards the Companions of Muḥammad ﷺ.", "«سَلَامَةُ قُلُوبِهِمْ وَأَلْسِنَتِهِمْ لِأَصْحَابِ مُحَمَّدٍ ﷺ»"),
    },
    {
      kind: "evidence",
      page: 186,
      front: t("With which āyah did Allah describe them in this?", "بِأَيِّ آيَةٍ وَصَفَهُمُ اللَّهُ بِذَلِكَ؟"),
      back: t(
        "“And those who came after them say: Our Lord, forgive us and our brothers who preceded us in faith, and put not in our hearts any resentment towards those who believed. Our Lord, indeed You are Kind and Merciful.” [al-Ḥashr: 10]",
        "﴿وَٱلَّذِينَ جَآءُو مِنۢ بَعْدِهِمْ يَقُولُونَ رَبَّنَا ٱغْفِرْ لَنَا وَلِإِخْوَٰنِنَا ٱلَّذِينَ سَبَقُونَا بِٱلْإِيمَٰنِ وَلَا تَجْعَلْ فِى قُلُوبِنَا غِلًّا لِّلَّذِينَ ءَامَنُوا۟ رَبَّنَآ إِنَّكَ رَءُوفٌ رَّحِيمٌ﴾ [الحَشْر: ١٠]",
      ),
    },
    {
      kind: "hadith",
      page: 186,
      front: t("Which command of the Prophet ﷺ about his Companions do they obey?", "مَا الأَمْرُ النَّبَوِيُّ فِي الصَّحَابَةِ الَّذِي يُطِيعُونَهُ؟"),
      back: t(
        "“Do not revile my Companions. By the One in whose hand is my soul, if one of you spent the like of Uḥud in gold, it would not reach the mudd of one of them, nor half of it.”",
        "«لَا تَسُبُّوا أَصْحَابِي؛ فَوَالَّذِي نَفْسِي بِيَدِهِ، لَوْ أَنَّ أَحَدَكُمْ أَنْفَقَ مِثْلَ أُحُدٍ ذَهَبًا مَا بَلَغَ مُدَّ أَحَدِهِمْ وَلَا نَصِيفَهُ»",
      ),
    },
    {
      kind: "point",
      page: 187,
      front: t("Whom do they rank higher: those who spent and fought before the Opening, or after?", "مَنْ يُفَضِّلُونَ: مَنْ أَنْفَقَ وَقَاتَلَ قَبْلَ الفَتْحِ، أَمْ بَعْدَهُ؟ وَمَا الفَتْحُ؟"),
      back: t("Those who spent and fought before the Opening — the Treaty of al-Ḥudaybiyah — over those after it.", "«فَيُفَضِّلُونَ مَنْ أَنْفَقَ مِنْ قَبْلِ الفَتْحِ - وَهُوَ صُلْحُ الحُدَيْبِيَةِ - وَقَاتَلَ، عَلَى مَنْ أَنْفَقَ مِنْ بَعْدِهِ وَقَاتَلَ»"),
    },
    {
      kind: "point",
      page: 187,
      front: t("Whom do they put first — the Muhājirūn or the Anṣār?", "مَنْ يُقَدِّمُونَ: المُهَاجِرِينَ أَمِ الأَنْصَارَ؟"),
      back: t("The Muhājirūn, over the Anṣār.", "«وَيُقَدِّمُونَ المُهَاجِرِينَ عَلَى الأَنْصَارِ»"),
    },
    {
      kind: "point",
      page: 187,
      front: t("What did Allah say to the people of Badr — and how many were they?", "مَاذَا قَالَ اللَّهُ لِأَهْلِ بَدْرٍ؟ وَكَمْ كَانُوا؟"),
      back: t("“Do what you will, for I have forgiven you.” They were three hundred and ten-odd.", "«اعْمَلُوا مَا شِئْتُمْ؛ فَقَدْ غَفَرْتُ لَكُمْ» — «وَكَانُوا ثَلَاثَ مِئَةٍ وَبِضْعَةَ عَشَرَ»"),
    },
    {
      kind: "point",
      page: 188,
      front: t("What do they believe about those who pledged allegiance under the tree — and how many were they?", "مَاذَا يَعْتَقِدُونَ فِي أَهْلِ بَيْعَةِ الشَّجَرَةِ؟ وَكَمْ كَانُوا؟"),
      back: t(
        "None who pledged under the tree will enter the Fire; Allah is pleased with them and they with Him. They were more than one thousand four hundred.",
        "«لَا يَدْخُلُ النَّارَ أَحَدٌ بَايَعَ تَحْتَ الشَّجَرَةِ … بَلْ قَدْ رَضِيَ اللَّهُ عَنْهُمْ وَرَضُوا عَنْهُ، وَكَانُوا أَكْثَرَ مِنْ أَلْفٍ وَأَرْبَعِ مِئَةٍ»",
      ),
    },
    {
      kind: "point",
      page: 189,
      front: t("For whom do they bear witness of Paradise?", "لِمَنْ يَشْهَدُونَ بِالجَنَّةِ؟"),
      back: t("For whoever the Messenger ﷺ bore witness for — like the ten, Thābit ibn Qays ibn Shammās, and others of the Companions.", "«لِمَنْ شَهِدَ لَهُ رَسُولُ اللَّهِ ﷺ - كَالعَشَرَةِ، وَكَثَابِتِ بْنِ قَيْسِ بْنِ شَمَّاسٍ، وَغَيْرِهِمْ مِنَ الصَّحَابَةِ -»"),
    },
    {
      kind: "list",
      page: 190,
      front: t("Who are the best of this ummah after its Prophet, in order?", "مَنْ خَيْرُ هَذِهِ الأُمَّةِ بَعْدَ نَبِيِّهَا عَلَى التَّرْتِيبِ؟"),
      back: t("Abū Bakr, then ʿUmar, then ʿUthmān as third, then ʿAlī as fourth.", "«أَبُو بَكْرٍ، ثُمَّ عُمَرُ، وَيُثَلِّثُونَ بِعُثْمَانَ، وَيُرَبِّعُونَ بِعَلِيٍّ»"),
    },
    {
      kind: "point",
      page: 190,
      front: t("Some of Ahl as-Sunnah differed over ʿUthmān and ʿAlī — what were the views?", "اخْتَلَفَ بَعْضُ أَهْلِ السُّنَّةِ فِي عُثْمَانَ وَعَلِيٍّ؛ فَمَا أَقْوَالُهُمْ؟"),
      back: t(
        "Some put ʿUthmān first and stopped, or put ʿAlī fourth; some put ʿAlī first; and some withheld judgement.",
        "«فَقَدَّمَ قَوْمٌ: عُثْمَانَ وَسَكَتُوا، أَوْ رَبَّعُوا بِعَلِيٍّ. وَقَدَّمَ قَوْمٌ: عَلِيًّا. وَقَوْمٌ: تَوَقَّفُوا»",
      ),
    },
    {
      kind: "point",
      page: 191,
      front: t("On what did the matter of Ahl as-Sunnah settle?", "عَلَامَ اسْتَقَرَّ أَمْرُ أَهْلِ السُّنَّةِ؟"),
      back: t("On putting ʿUthmān first, then ʿAlī.", "«عَلَى تَقْدِيمِ عُثْمَانَ ثُمَّ عَلِيٍّ»"),
    },
    {
      kind: "point",
      page: 191,
      front: t("Is one who differs over ʿUthmān and ʿAlī's ranking called misguided — and which matter is it where he is?", "هَلْ يُضَلَّلُ المُخَالِفُ فِي تَفْضِيلِ عُثْمَانَ وَعَلِيٍّ؟ وَفِي أَيِّ مَسْأَلَةٍ يُضَلَّلُ؟"),
      back: t(
        "Not according to most of Ahl as-Sunnah. The matter where the one who differs is called misguided is the caliphate: Abū Bakr, then ʿUmar, then ʿUthmān, then ʿAlī. Whoever attacks the caliphate of any of them is more astray than his family's donkey.",
        "«لَيْسَتْ مِنَ الأُصُولِ الَّتِي يُضَلَّلُ المُخَالِفُ فِيهَا عِنْدَ جُمْهُورِ أَهْلِ السُّنَّةِ. لَكِنَّ المَسْأَلَةَ الَّتِي يُضَلَّلُ المُخَالِفُ فِيهَا: مَسْأَلَةُ الخِلَافَةِ … وَمَنْ طَعَنَ فِي خِلَافَةِ أَحَدٍ مِنْ هَؤُلَاءِ؛ فَهُوَ أَضَلُّ مِنْ حِمَارِ أَهْلِهِ»",
      ),
    },
  ],

  // ───────────── 14 · The Prophet's family and wives; the Companions' disputes ─────────────
  [
    opening(13, 192, t("What does this section establish about the Prophet's family and Companions?", "مَاذَا يُقَرِّرُ هَذَا الفَصْلُ فِي آلِ البَيْتِ وَالصَّحَابَةِ؟")),
    {
      kind: "point",
      page: 192,
      front: t("What is the stance of Ahl as-Sunnah towards the family of the Messenger ﷺ?", "مَا مَوْقِفُ أَهْلِ السُّنَّةِ مِنْ أَهْلِ بَيْتِ رَسُولِ اللَّهِ ﷺ؟"),
      back: t("They love them, ally with them, and keep the Messenger's ﷺ instruction concerning them.", "«وَيُحِبُّونَ أَهْلَ بَيْتِ رَسُولِ اللَّهِ ﷺ، وَيَتَوَلَّوْنَهُمْ، وَيَحْفَظُونَ فِيهِمْ وَصِيَّةَ رَسُولِ اللَّهِ ﷺ»"),
    },
    {
      kind: "hadith",
      page: 192,
      front: t("What did the Prophet ﷺ say on the day of Ghadīr Khumm?", "مَاذَا قَالَ النَّبِيُّ ﷺ يَوْمَ غَدِيرِ خُمٍّ؟"),
      back: t("“I remind you of Allah regarding the people of my house; I remind you of Allah regarding the people of my house.”", "«أُذَكِّرُكُمُ اللَّهَ فِي أَهْلِ بَيْتِي، أُذَكِّرُكُمُ اللَّهَ فِي أَهْلِ بَيْتِي»"),
    },
    {
      kind: "hadith",
      page: 192,
      front: t("What did he ﷺ say to al-ʿAbbās when he complained that some of Quraysh were harsh to Banū Hāshim?", "مَاذَا قَالَ ﷺ لِلْعَبَّاسِ لَمَّا شَكَا إِلَيْهِ جَفَاءَ بَعْضِ قُرَيْشٍ لِبَنِي هَاشِمٍ؟"),
      back: t("“By the One in whose hand is my soul, they will not believe until they love you for Allah and for my kinship.”", "«وَالَّذِي نَفْسِي بِيَدِهِ، لَا يُؤْمِنُونَ حَتَّى يُحِبُّوكُمْ لِلَّهِ وَلِقَرَابَتِي»"),
    },
    {
      kind: "hadith",
      page: 192,
      front: t("Complete: “Allah chose the children of Ismāʿīl …”", "أَكْمِلْ: «إِنَّ اللَّهَ اصْطَفَى بَنِي إِسْمَاعِيلَ …»"),
      back: t(
        "“…and chose Kinānah from the children of Ismāʿīl, chose Quraysh from Kinānah, chose Banū Hāshim from Quraysh, and chose me from Banū Hāshim.”",
        "«وَاصْطَفَى مِنْ بَنِي إِسْمَاعِيلَ كِنَانَةَ، وَاصْطَفَى مِنْ كِنَانَةَ قُرَيْشًا، وَاصْطَفَى مِنْ قُرَيْشٍ بَنِي هَاشِمٍ، وَاصْطَفَانِي مِنْ بَنِي هَاشِمٍ»",
      ),
    },
    {
      kind: "point",
      page: 193,
      front: t("What do they hold about the wives of the Messenger ﷺ?", "مَاذَا يَعْتَقِدُونَ فِي أَزْوَاجِ رَسُولِ اللَّهِ ﷺ؟"),
      back: t("They ally with them — the Mothers of the Believers — and affirm that they are his wives in the Hereafter.", "«وَيَتَوَلَّوْنَ أَزْوَاجَ رَسُولِ اللَّهِ ﷺ - أُمَّهَاتِ المُؤْمِنِينَ -، وَيُقِرُّونَ بِأَنَّهُنَّ أَزْوَاجُهُ فِي الآخِرَةِ»"),
    },
    {
      kind: "list",
      page: 193,
      front: t("What does the author mention of Khadījah's merits?", "مَا الَّذِي ذَكَرَهُ المُؤَلِّفُ مِنْ فَضَائِلِ خَدِيجَةَ؟"),
      back: t(
        "The mother of most of his children, the first to believe in him and support him in his mission; she had a high standing with him.",
        "«أُمَّ أَكْثَرِ أَوْلَادِهِ، وَأَوَّلَ مَنْ آمَنَ بِهِ وَعَاضَدَهُ عَلَى أَمْرِهِ، وَكَانَ لَهَا مِنْهُ المَنْزِلَةُ العَالِيَةُ»",
      ),
    },
    {
      kind: "hadith",
      page: 193,
      front: t("What did the Prophet ﷺ say about the excellence of ʿĀʾishah?", "مَاذَا قَالَ النَّبِيُّ ﷺ فِي فَضْلِ عَائِشَةَ؟"),
      back: t("“The excellence of ʿĀʾishah over women is like the excellence of tharīd over all other food.”", "«فَضْلُ عَائِشَةَ عَلَى النِّسَاءِ، كَفَضْلِ الثَّرِيدِ عَلَى سَائِرِ الطَّعَامِ»"),
    },
    {
      kind: "list",
      page: 194,
      front: t("From which two ways do they free themselves?", "مِنْ أَيِّ طَرِيقَتَيْنِ يَتَبَرَّؤُونَ؟"),
      back: t(
        "The way of the Rawāfiḍ, who hate and revile the Companions; and the way of the Nawāṣib, who harm the Prophet's family by word or deed.",
        "«مِنْ طَرِيقَةِ الرَّوَافِضِ الَّذِينَ يُبْغِضُونَ الصَّحَابَةَ وَيَسُبُّونَهُمْ. وَطَرِيقَةِ النَّوَاصِبِ الَّذِينَ يُؤْذُونَ أَهْلَ البَيْتِ بِقَوْلٍ أَوْ عَمَلٍ»",
      ),
    },
    {
      kind: "point",
      page: 195,
      front: t("What is their stance on what occurred between the Companions?", "مَا مَوْقِفُهُمْ مِمَّا شَجَرَ بَيْنَ الصَّحَابَةِ؟"),
      back: t("They hold back from it.", "«وَيُمْسِكُونَ عَمَّا شَجَرَ بَيْنَ الصَّحَابَةِ»"),
    },
    {
      kind: "list",
      page: 195,
      front: t("What do they say about the reports of the Companions' faults?", "مَاذَا يَقُولُونَ فِي الآثَارِ المَرْوِيَّةِ فِي مَسَاوِيهِمْ؟"),
      back: t(
        "Some are lies; some have had things added, removed and changed; and in most of what is authentic they are excused — either striving and correct, or striving and mistaken.",
        "«مِنْهَا مَا هُوَ كَذِبٌ. وَمِنْهَا مَا قَدْ زِيدَ فِيهِ وَنُقِّصَ وَغُيِّرَ عَنْ وَجْهِهِ. وَعَامَّةُ الصَّحِيحِ مِنْهُ: هُمْ فِيهِ مَعْذُورُونَ: إِمَّا مُجْتَهِدُونَ مُصِيبُونَ. وَإِمَّا مُجْتَهِدُونَ مُخْطِئُونَ»",
      ),
    },
    {
      kind: "point",
      page: 195,
      front: t("Do they believe each Companion was protected from sin?", "هَلْ يَعْتَقِدُونَ أَنَّ كُلَّ وَاحِدٍ مِنَ الصَّحَابَةِ مَعْصُومٌ؟"),
      back: t("No — sins, in general, could occur from them.", "لَا؛ «بَلْ تَجُوزُ عَلَيْهِمُ الذُّنُوبُ فِي الجُمْلَةِ»"),
    },
    {
      kind: "point",
      page: 196,
      front: t("Why may they be forgiven what would not be forgiven those after them?", "لِمَاذَا يُغْفَرُ لَهُمْ مَا لَا يُغْفَرُ لِمَنْ بَعْدَهُمْ؟"),
      back: t(
        "Because they have precedence and virtues that bring forgiveness, and good deeds that wipe out bad ones such as those after them do not have.",
        "«لِأَنَّ لَهُمْ مِنَ الحَسَنَاتِ الَّتِي تَمْحُو السَّيِّئَاتِ مَا لَيْسَ لِمَنْ بَعْدَهُمْ»",
      ),
    },
    {
      kind: "list",
      page: 196,
      front: t("If one of them did commit a sin, what are the five possibilities the author gives?", "إِذَا صَدَرَ عَنْ أَحَدِهِمْ ذَنْبٌ، فَمَا الاحْتِمَالَاتُ الخَمْسَةُ الَّتِي ذَكَرَهَا المُؤَلِّفُ؟"),
      back: t(
        "He repented from it; or did good deeds that wiped it out; or was forgiven by virtue of his precedence; or by the intercession of Muḥammad ﷺ, of which they are the most deserving; or was tested with an affliction in this world that expiated it.",
        "«فَيَكُونُ قَدْ تَابَ مِنْهُ. أَوْ أَتَى بِحَسَنَاتٍ تَمْحُوهُ. أَوْ غُفِرَ لَهُ بِفَضْلِ سَابِقَتِهِ. أَوْ بِشَفَاعَةِ مُحَمَّدٍ ﷺ … أَوِ ابْتُلِيَ بِبَلَاءٍ فِي الدُّنْيَا كُفِّرَ بِهِ عَنْهُ»",
      ),
    },
    {
      kind: "point",
      page: 197,
      front: t("And what of matters where they strove to find the right answer (ijtihād)?", "فَكَيْفَ بِالأُمُورِ الَّتِي كَانُوا فِيهَا مُجْتَهِدِينَ؟"),
      back: t("If they were right, they have two rewards; if they erred, they have one reward, and the error is forgiven.", "«إِنْ أَصَابُوا فَلَهُمْ أَجْرَانِ، وَإِنْ أَخْطَؤُوا فَلَهُمْ أَجْرٌ وَاحِدٌ وَالخَطَأُ مَغْفُورٌ»"),
    },
    {
      kind: "point",
      page: 197,
      front: t("How much of what some of them did is objectionable, compared with their virtues?", "مَا قَدْرُ مَا يُنْكَرُ مِنْ فِعْلِ بَعْضِهِمْ بِالنِّسْبَةِ إِلَى فَضَائِلِهِمْ؟"),
      back: t(
        "Very little — drowned beside their virtues: īmān in Allah and His Messenger, jihād in His path, hijrah, support, beneficial knowledge and righteous action.",
        "«قَلِيلٌ نَزْرٌ، مَغْمُورٌ فِي جَنْبِ فَضَائِلِ القَوْمِ وَمَحَاسِنِهِمْ - مِنَ الإِيمَانِ بِاللَّهِ وَرَسُولِهِ، وَالجِهَادِ فِي سَبِيلِهِ، وَالهِجْرَةِ، وَالنُّصْرَةِ، وَالعِلْمِ النَّافِعِ، وَالعَمَلِ الصَّالِحِ -»",
      ),
    },
    {
      kind: "point",
      page: 198,
      front: t("What will whoever looks into their lives with knowledge and fairness know for certain?", "مَاذَا يَعْلَمُ يَقِينًا مَنْ نَظَرَ فِي سِيرَتِهِمْ بِعِلْمٍ وَعَدْلٍ؟"),
      back: t(
        "That they are the best of creation after the prophets — there never was and never will be the like of them — and the elite of the generations of this ummah, the best and most honoured of nations before Allah.",
        "«أَنَّهُمْ خَيْرُ الخَلْقِ بَعْدَ الأَنْبِيَاءِ، لَا كَانَ وَلَا يَكُونُ مِثْلُهُمْ. وَأَنَّهُمْ هُمُ الصَّفْوَةُ مِنْ قُرُونِ هَذِهِ الأُمَّةِ الَّتِي هِيَ خَيْرُ الأُمَمِ وَأَكْرَمُهَا عَلَى اللَّهِ»",
      ),
    },
  ],

  // ───────────── 15 · Karāmāt; the three sources ─────────────
  [
    opening(14, 199, t("What does the section on karāmāt and the sources establish?", "مَاذَا يُقَرِّرُ فَصْلُ الكَرَامَاتِ وَالمَنْهَجِ؟")),
    {
      kind: "point",
      page: 199,
      front: t("What do Ahl as-Sunnah believe about the karāmāt of the awliyāʾ?", "مَاذَا يَعْتَقِدُ أَهْلُ السُّنَّةِ فِي كَرَامَاتِ الأَوْلِيَاءِ؟"),
      back: t(
        "They affirm them: the extraordinary things Allah brings about at their hands, in kinds of knowledge and unveilings, and kinds of power and effect.",
        "«التَّصْدِيقُ بِكَرَامَاتِ الأَوْلِيَاءِ، وَمَا يُجْرِي اللَّهُ عَلَى أَيْدِيهِمْ مِنْ خَوَارِقِ العَادَاتِ فِي أَنْوَاعِ العُلُومِ وَالمُكَاشَفَاتِ، وَأَنْوَاعِ القُدْرَةِ وَالتَّأْثِيرَاتِ»",
      ),
    },
    {
      kind: "point",
      page: 199,
      front: t("Where are such karāmāt reported, and until when will they exist?", "أَيْنَ نُقِلَتْ هَذِهِ الكَرَامَاتُ؟ وَإِلَى مَتَى تَبْقَى؟"),
      back: t(
        "As reported of earlier nations in Sūrat al-Kahf and elsewhere, and from the first of this ummah — the Companions, the Successors and the rest of its generations; they exist in it until the Day of Judgement.",
        "«كَالمَأْثُورِ عَنْ سَالِفِ الأُمَمِ فِي سُورَةِ الكَهْفِ وَغَيْرِهَا، وَعَنْ صَدْرِ هَذِهِ الأُمَّةِ مِنَ الصَّحَابَةِ وَالتَّابِعِينَ وَسَائِرِ قُرُونِ الأُمَّةِ. وَهِيَ مَوْجُودَةٌ فِيهَا إِلَى يَوْمِ القِيَامَةِ»",
      ),
    },
    {
      kind: "list",
      page: 200,
      front: t("What three things do they follow, as part of their way?", "مَا الأُمُورُ الثَّلَاثَةُ الَّتِي يَتَّبِعُونَهَا مِنْ طَرِيقَتِهِمْ؟"),
      back: t(
        "The narrations of the Messenger ﷺ inwardly and outwardly; the path of the first forerunners of the Muhājirūn and Anṣār; and the Messenger's instruction ﷺ.",
        "«اتِّبَاعُ آثَارِ رَسُولِ اللَّهِ ﷺ بَاطِنًا وَظَاهِرًا. وَاتِّبَاعُ سَبِيلِ السَّابِقِينَ الأَوَّلِينَ مِنَ المُهَاجِرِينَ وَالأَنْصَارِ. وَاتِّبَاعُ وَصِيَّةِ رَسُولِ اللَّهِ ﷺ»",
      ),
    },
    {
      kind: "hadith",
      page: 200,
      front: t("What is the Messenger's instruction ﷺ that they follow?", "مَا وَصِيَّةُ رَسُولِ اللَّهِ ﷺ الَّتِي يَتَّبِعُونَهَا؟"),
      back: t(
        "“Hold to my Sunnah and the Sunnah of the rightly guided caliphs after me; cling to it and bite onto it with your molars. Beware of newly invented matters, for every new invention is an innovation, and every innovation is misguidance.”",
        "«عَلَيْكُمْ بِسُنَّتِي وَسُنَّةِ الخُلَفَاءِ الرَّاشِدِينَ المَهْدِيِّينَ مِنْ بَعْدِي، تَمَسَّكُوا بِهَا، وَعَضُّوا عَلَيْهَا بِالنَّوَاجِذِ. وَإِيَّاكُمْ وَمُحْدَثَاتِ الأُمُورِ؛ فَإِنَّ كُلَّ مُحْدَثَةٍ بِدْعَةٌ، وَكُلَّ بِدْعَةٍ ضَلَالَةٌ»",
      ),
    },
    {
      kind: "point",
      page: 200,
      front: t("What do they know about the truest speech and the best guidance?", "مَاذَا يَعْلَمُونَ فِي أَصْدَقِ الكَلَامِ وَخَيْرِ الهَدْيِ؟"),
      back: t(
        "That the truest speech is the Speech of Allah, and the best guidance is the guidance of Muḥammad ﷺ — so they give it precedence over everyone's.",
        "«أَنَّ أَصْدَقَ الكَلَامِ كَلَامُ اللَّهِ، وَخَيْرَ الهَدْيِ هَدْيُ مُحَمَّدٍ ﷺ» — فَيُؤْثِرُونَهُ وَيُقَدِّمُونَهُ عَلَى كُلِّ أَحَدٍ.",
      ),
    },
    {
      kind: "point",
      page: 201,
      front: t("Why are they called “the people of the Book and the Sunnah” and “the people of the Jamāʿah”?", "لِمَ سُمُّوا «أَهْلَ الكِتَابِ وَالسُّنَّةِ» وَ«أَهْلَ الجَمَاعَةِ»؟"),
      back: t(
        "Because they give the Speech of Allah and the guidance of Muḥammad ﷺ precedence; and the Jamāʿah means coming together (ijtimāʿ), whose opposite is division — though the word has come to name the gathered people themselves.",
        "لِتَقْدِيمِهِمْ كَلَامَ اللَّهِ وَهَدْيَ مُحَمَّدٍ ﷺ؛ «وَسُمُّوا: أَهْلَ الجَمَاعَةِ؛ لِأَنَّ الجَمَاعَةَ هِيَ الاجْتِمَاعُ، وَضِدُّهَا الفُرْقَةُ»",
      ),
    },
    {
      kind: "list",
      page: 201,
      front: t("What are the three foundations by which they weigh everything people say and do in the religion?", "مَا الأُصُولُ الثَّلَاثَةُ الَّتِي يَزِنُونَ بِهَا جَمِيعَ مَا عَلَيْهِ النَّاسُ؟"),
      back: t("The Book, the Sunnah, and the consensus (ijmāʿ) — the third foundation relied upon in knowledge and religion.", "الكِتَابُ، وَالسُّنَّةُ، وَ«الإِجْمَاعُ: هُوَ الأَصْلُ الثَّالِثُ الَّذِي يُعْتَمَدُ فِي العِلْمِ وَالدِّينِ»"),
    },
    {
      kind: "point",
      page: 202,
      front: t("Which consensus can be pinned down, and why?", "مَا الإِجْمَاعُ الَّذِي يَنْضَبِطُ؟ وَلِمَاذَا؟"),
      back: t(
        "What the righteous Salaf were upon — since after them disagreement increased and the ummah spread out.",
        "«هُوَ مَا كَانَ عَلَيْهِ السَّلَفُ الصَّالِحُ؛ إِذْ بَعْدَهُمْ كَثُرَ الاخْتِلَافُ، وَانْتَشَرَتِ الأُمَّةُ»",
      ),
    },
  ],

  // ───────────── 16 · The conduct of Ahl as-Sunnah; the saved sect ─────────────
  [
    opening(15, 203, t("What does the closing section describe?", "مَاذَا يَصِفُ الفَصْلُ الأَخِيرُ؟")),
    {
      kind: "point",
      page: 203,
      front: t("Along with these foundations, what do they enjoin?", "مَعَ هَذِهِ الأُصُولِ، بِمَ يَأْمُرُونَ؟"),
      back: t("They enjoin good and forbid evil, as the Sharīʿah requires.", "«يَأْمُرُونَ بِالمَعْرُوفِ، وَيَنْهَوْنَ عَنِ المُنْكَرِ؛ عَلَى مَا تُوجِبُهُ الشَّرِيعَةُ»"),
    },
    {
      kind: "point",
      page: 203,
      front: t("What do they hold about ḥajj, jihād, Jumuʿah and the ʿĪds with the rulers?", "مَا رَأْيُهُمْ فِي إِقَامَةِ الحَجِّ وَالجِهَادِ وَالجُمَعِ وَالأَعْيَادِ مَعَ الأُمَرَاءِ؟"),
      back: t("They establish them with the rulers, whether righteous or wicked; and they keep to the congregational prayers.", "«وَيَرَوْنَ إِقَامَةَ الحَجِّ وَالجِهَادِ، وَالجُمَعِ وَالأَعْيَادِ، مَعَ الأُمَرَاءِ - أَبْرَارًا كَانُوا أَوْ فُجَّارًا -. وَيُحَافِظُونَ عَلَى الجَمَاعَاتِ»"),
    },
    {
      kind: "hadith",
      page: 204,
      front: t("Which ḥadīth likens believers to a building?", "مَا الحَدِيثُ الَّذِي شَبَّهَ المُؤْمِنِينَ بِالبُنْيَانِ؟"),
      back: t("“The believer to the believer is like a building, each part strengthening the other” — and he interlaced his fingers.", "«المُؤْمِنُ لِلْمُؤْمِنِ كَالبُنْيَانِ، يَشُدُّ بَعْضُهُ بَعْضًا - وَشَبَّكَ بَيْنَ أَصَابِعِهِ -»"),
    },
    {
      kind: "hadith",
      page: 204,
      front: t("Which ḥadīth likens believers to one body?", "مَا الحَدِيثُ الَّذِي شَبَّهَ المُؤْمِنِينَ بِالجَسَدِ؟"),
      back: t(
        "“The likeness of the believers in their mutual love, mercy and compassion is that of the body: when a limb of it complains, the rest of the body responds to it with sleeplessness and fever.”",
        "«مَثَلُ المُؤْمِنِينَ فِي تَوَادِّهِمْ وَتَرَاحُمِهِمْ وَتَعَاطُفِهِمْ؛ مَثَلُ الجَسَدِ، إِذَا اشْتَكَى مِنْهُ عُضْوٌ؛ تَدَاعَى لَهُ سَائِرُ الجَسَدِ بِالسَّهَرِ وَالحُمَّى»",
      ),
    },
    {
      kind: "list",
      page: 205,
      front: t("What three things do they enjoin regarding trials, ease and the decree?", "بِمَ يَأْمُرُونَ عِنْدَ البَلَاءِ وَالرَّخَاءِ وَالقَضَاءِ؟"),
      back: t("Patience in trial, gratitude in ease, and contentment with the bitterness of the decree.", "«بِالصَّبْرِ عَلَى البَلَاءِ، وَالشُّكْرِ عِنْدَ الرَّخَاءِ، وَالرِّضَا بِمُرِّ القَضَاءِ»"),
    },
    {
      kind: "hadith",
      page: 205,
      front: t("Which ḥadīth about character do they hold the meaning of?", "مَا الحَدِيثُ الَّذِي يَعْتَقِدُونَ مَعْنَاهُ فِي حُسْنِ الخُلُقِ؟"),
      back: t("“The most complete of the believers in īmān are the best of them in character.”", "«أَكْمَلُ المُؤْمِنِينَ إِيمَانًا: أَحْسَنُهُمْ خُلُقًا»"),
    },
    {
      kind: "list",
      page: 206,
      front: t("What three things do they encourage towards those who wrong you?", "إِلَامَ يَنْدُبُونَ فِي مُعَامَلَةِ مَنْ أَسَاءَ إِلَيْكَ؟"),
      back: t("That you join whoever cuts you off, give to whoever withholds from you, and pardon whoever wrongs you.", "«أَنْ تَصِلَ مَنْ قَطَعَكَ، وَتُعْطِيَ مَنْ حَرَمَكَ، وَتَعْفُوَ عَمَّنْ ظَلَمَكَ»"),
    },
    {
      kind: "list",
      page: 206,
      front: t("What do they enjoin towards parents, relatives, neighbours and others?", "بِمَ يَأْمُرُونَ فِي حَقِّ الوَالِدَيْنِ وَالأَرْحَامِ وَالجِيرَانِ وَغَيْرِهِمْ؟"),
      back: t(
        "Dutifulness to parents, joining the ties of kinship, good neighbourliness, kindness to orphans, the poor and the wayfarer, and gentleness with those one owns.",
        "«بِبِرِّ الوَالِدَيْنِ، وَصِلَةِ الأَرْحَامِ، وَحُسْنِ الجِوَارِ، وَالإِحْسَانِ إِلَى اليَتَامَى وَالمَسَاكِينِ وَابْنِ السَّبِيلِ، وَالرِّفْقِ بِالمَمْلُوكِ»",
      ),
    },
    {
      kind: "list",
      page: 207,
      front: t("What do they forbid?", "عَمَّ يَنْهَوْنَ؟"),
      back: t(
        "Boasting, arrogance, oppression, and lording it over people — rightly or wrongly; and they enjoin lofty manners and forbid base ones.",
        "«وَيَنْهَوْنَ عَنِ الفَخْرِ، وَالخُيَلَاءِ، وَالبَغْيِ، وَالاسْتِطَالَةِ عَلَى الخَلْقِ؛ بِحَقٍّ أَوْ بِغَيْرِ حَقٍّ. وَيَأْمُرُونَ بِمَعَالِي الأَخْلَاقِ، وَيَنْهَوْنَ عَنْ سَفْسَافِهَا»",
      ),
    },
    {
      kind: "point",
      page: 207,
      front: t("In all they say and do of this, what are they following?", "فِي كُلِّ مَا يَقُولُونَهُ أَوْ يَفْعَلُونَهُ مِنْ هَذَا، مَاذَا يَتَّبِعُونَ؟"),
      back: t("The Book and the Sunnah.", "«فَإِنَّمَا هُمْ فِيهِ مُتَّبِعُونَ الكِتَابَ وَالسُّنَّةَ»"),
    },
    {
      kind: "hadith",
      page: 208,
      front: t("Into how many sects did the Prophet ﷺ say his ummah would split — and which one is saved?", "عَلَى كَمْ فِرْقَةٍ أَخْبَرَ النَّبِيُّ ﷺ أَنَّ أُمَّتَهُ سَتَفْتَرِقُ؟ وَمَا النَّاجِيَةُ؟"),
      back: t(
        "Seventy-three sects, all in the Fire except one — the Jamāʿah; and in a ḥadīth: “Those who are upon what I and my Companions are upon today.”",
        "«عَلَى ثَلَاثٍ وَسَبْعِينَ فِرْقَةً، كُلُّهَا فِي النَّارِ إِلَّا وَاحِدَةً - وَهِيَ الجَمَاعَةُ -»، وَفِي حَدِيثٍ: «هُمْ مَنْ كَانَ عَلَى مَا أَنَا عَلَيْهِ اليَوْمَ وَأَصْحَابِي»",
      ),
    },
    {
      kind: "point",
      page: 208,
      front: t("So who became ‘Ahl as-Sunnah wal-Jamāʿah’?", "فَمَنْ صَارَ «أَهْلَ السُّنَّةِ وَالجَمَاعَةِ»؟"),
      back: t("Those holding firmly to pure Islam, free of any admixture.", "«صَارَ المُتَمَسِّكُونَ بِالإِسْلَامِ المَحْضِ الخَالِصِ عَنِ الشَّوْبِ، هُمْ أَهْلُ السُّنَّةِ وَالجَمَاعَةِ»"),
    },
    {
      kind: "list",
      page: 209,
      front: t("Who are among them?", "مَنْ فِيهِمْ؟"),
      back: t(
        "The truthful, the martyrs and the righteous; the landmarks of guidance and lamps in the darkness, of well-known merits and virtues; the abdāl; and the imāms of the religion whose guidance and understanding the Muslims agree upon.",
        "«الصِّدِّيقُونَ، وَالشُّهَدَاءُ، وَالصَّالِحُونَ. وَفِيهِمْ: أَعْلَامُ الهُدَى، وَمَصَابِيحُ الدُّجَى … وَفِيهِمُ: الأَبْدَالُ. وَفِيهِمْ: أَئِمَّةُ الدِّينِ؛ الَّذِينَ أَجْمَعَ المُسْلِمُونَ عَلَى هِدَايَتِهِمْ، وَدِرَايَتِهِمْ»",
      ),
    },
    {
      kind: "hadith",
      page: 209,
      front: t("What did the Prophet ﷺ say of the victorious group?", "مَاذَا قَالَ النَّبِيُّ ﷺ فِي الطَّائِفَةِ المَنْصُورَةِ؟"),
      back: t(
        "“A group of my ummah will remain manifest upon the truth, unharmed by those who oppose them or those who forsake them, until the Hour is established.”",
        "«لَا تَزَالُ طَائِفَةٌ مِنْ أُمَّتِي ظَاهِرِينَ عَلَى الحَقِّ، لَا يَضُرُّهُمْ مَنْ خَالَفَهُمْ، وَلَا مَنْ خَذَلَهُمْ، حَتَّى تَقُومَ السَّاعَةُ»",
      ),
    },
    {
      kind: "point",
      page: 210,
      front: t("With what supplication does the book end?", "بِأَيِّ دُعَاءٍ خُتِمَ الكِتَابُ؟"),
      back: t(
        "“We ask Allah the Mighty to make us among them, not to let our hearts deviate after He has guided us, and to grant us mercy from Himself — indeed He is the Bestower.”",
        "«فَنَسْأَلُ اللَّهَ العَظِيمَ أَنْ يَجْعَلَنَا مِنْهُمْ. وَأَنْ لَا يُزِيغَ قُلُوبَنَا بَعْدَ إِذْ هَدَانَا. وَيَهَبَ لَنَا مِنْ لَدُنْهُ رَحْمَةً، إِنَّهُ هُوَ الوَهَّابُ»",
      ),
    },
  ],
];

export const AQIDAH_WASITIYYAH: FlashcardBook = {
  slug: "al-aqidah-al-wasitiyyah",
  title: t("al-ʿAqīdah al-Wāsiṭiyyah", "العَقِيدَةُ الوَاسِطِيَّةُ"),
  shortTitle: "al-ʿAqīdah al-Wāsiṭiyyah",
  author: t("Shaykh al-Islām Aḥmad ibn ʿAbd al-Ḥalīm Ibn Taymiyyah", "شَيْخُ الإِسْلَامِ أَحْمَدُ بْنُ عَبْدِ الحَلِيمِ ابْنُ تَيْمِيَّةَ"),
  chapters: t("sections", "الفُصُولُ"),
  subject: "ʿAqīdah and Tawḥīd",
  blurb: "The creed of Ahl as-Sunnah — the attributes with their āyāt and aḥādīth, the Last Day, the decree, īmān and the Companions.",
  source: PIK_EDITION,
  sections: CARDS.map((cards, i) => ({ number: i + 1, label: LABELS[i], title: TITLES[i], pages: PAGES[i], cards })),
};
