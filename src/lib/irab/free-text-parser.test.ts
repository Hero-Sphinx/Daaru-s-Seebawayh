import { describe, expect, it } from "vitest";
import { parseFreeText, toSentenceAnalysis, type RawCandidate } from "./free-text-parser";
import { buildIrabSentence } from "./irab-sentence";
import { tokenizeSentence } from "./tokenize";
import camelFixtures from "./__fixtures__/camel-candidates.json";

/**
 * Every test runs on REAL CAMeL Tools analyses, recorded into
 * __fixtures__/camel-candidates.json (npm run irab:record-fixtures), so the
 * grammar is tested against the morphology it will actually see.
 */
const FIXTURES = camelFixtures as Record<string, RawCandidate[]>;

function parse(text: string) {
  const words = tokenizeSentence(text);
  for (const w of words) if (!(w in FIXTURES)) throw new Error(`No fixture for "${w}" — add the sentence to __fixtures__/sentences.ts and re-record`);
  return parseFreeText(words.map((w) => ({ surface: w, candidates: FIXTURES[w] })));
}

/** [surface, role code, head surface] per piece, plus each piece's full i'rab. */
function view(text: string) {
  const result = parse(text);
  const a = toSentenceAnalysis(result, "test");
  const rows = a.tokens.map((t) => {
    const e = a.edges.find((x) => x.tokenId === t.id);
    const head = e?.headTokenId ? a.tokens.find((x) => x.id === e.headTokenId)!.surfaceForm : null;
    return { surface: t.surfaceForm, role: e?.role.code ?? null, roleName: e?.role.nameAr ?? null, head, irab: buildIrabSentence(t, e?.role)?.ar ?? null };
  });
  return { result, rows, roles: rows.map((r) => r.role), irab: (surface: string) => rows.find((r) => r.surface === surface)?.irab ?? "" };
}

describe("verbal sentences", () => {
  it("verb + fa'il + maf'ul bihi, and verb + fa'il + prepositional phrase", () => {
    const v = view("كَتَبَ الطَّالِبُ الدَّرْسَ");
    expect(v.roles).toEqual(["FIL", "FAAIL", "MAFUL_BIH"]);
    expect(v.irab("كَتَبَ")).toBe("فِعْلٌ مَاضٍ مَبْنِيٌّ عَلَى الفَتْحِ.");
    expect(v.irab("الدَّرْسَ")).toBe("مفعول به مَنْصُوبٌ، وَعَلامَةُ نَصْبِهِ الفَتْحَةُ الظّاهِرَةُ عَلى آخِرِهِ.");

    const pp = view("ذَهَبَ الطَّالِبُ إِلَى المَدْرَسَةِ");
    expect(pp.roles).toEqual(["FIL", "FAAIL", "HARF_JARR", "MAJROOR"]);
    expect(pp.rows[2].head).toBe("ذَهَبَ");
    expect(pp.irab("إِلَى")).toBe("حَرْفُ جَرٍّ مَبْنِيٌّ عَلَى السُّكُونِ.");
  });

  it("verb + object + subject order, and an object pronoun attached to the verb", () => {
    expect(view("كَتَبَ الدَّرْسَ الطَّالِبُ").roles).toEqual(["FIL", "MAFUL_BIH", "FAAIL"]);
    const v = view("كَتَبَهُ الطَّالِبُ");
    expect(v.rows.map((r) => r.surface)).toEqual(["كَتَبَ", "هُ", "الطَّالِبُ"]);
    expect(v.irab("هُ")).toBe("مفعول به، ضَمِيرٌ مُتَّصِلٌ مَبْنِيٌّ عَلَى الضَّمِّ فِي مَحَلِّ نَصْبٍ.");
  });

  it("an object with the subject implied — not a mis-cased subject", () => {
    const v = view("كَتَبَ الطَّالِبَ");
    expect(v.roles).toEqual(["FIL", "MAFUL_BIH"]);
    expect(v.irab("كَتَبَ")).toContain("وَالفاعلُ ضَمِيرٌ مُسْتَتِرٌ جَوَازًا تَقْدِيرُهُ هُوَ");
  });

  it("passive verb takes a na'ib fa'il", () => {
    const v = view("كُتِبَ الدَّرْسُ");
    expect(v.roles).toEqual(["FIL", "NAIB_FAAIL"]);
    expect(v.irab("كُتِبَ")).toContain("مَبْنِيٌّ لِلْمَجْهُولِ");
  });

  it("attached subject pronouns, ta' al-ta'nith, and the plural waw", () => {
    expect(view("كَتَبْتُ بِالقَلَمِ").irab("كَتَبْتُ")).toBe(
      "فِعْلٌ مَاضٍ مَبْنِيٌّ عَلَى السُّكُونِ لِاتِّصَالِهِ بِضَمِيرِ رَفْعٍ مُتَحَرِّكٍ، وَالتاءُ ضَمِيرٌ مُتَّصِلٌ مَبْنِيٌّ عَلَى الضَّمِّ فِي مَحَلِّ رَفْعِ فاعلٍ."
    );
    expect(view("ذَهَبَتْ الطَّالِبَةُ").irab("ذَهَبَتْ")).toContain("وَالتَّاءُ تَاءُ التَّأْنِيثِ السَّاكِنَةُ");
    expect(view("الطُّلَّابُ كَتَبُوا الدَّرْسَ").irab("كَتَبُوا")).toContain("مَبْنِيٌّ عَلَى الضَّمِّ لِاتِّصَالِهِ بِوَاوِ الجَمَاعَةِ");
  });

  it("an attached preposition and a preposition with a pronoun split into their pieces", () => {
    const b = view("كَتَبْتُ بِالقَلَمِ");
    expect(b.rows.map((r) => [r.surface, r.role])).toEqual([
      ["كَتَبْتُ", "FIL"],
      ["بِ", "HARF_JARR"],
      ["القَلَمِ", "MAJROOR"],
    ]);
    expect(b.irab("بِ")).toBe("حَرْفُ جَرٍّ مَبْنِيٌّ عَلَى الكَسْرِ.");
    const a = view("سَلَّمْتُ عَلَيْهِ");
    expect(a.irab("هِ")).toBe("اسم مجرور، ضَمِيرٌ مُتَّصِلٌ مَبْنِيٌّ عَلَى الكَسْرِ فِي مَحَلِّ جَرٍّ.");
  });

  it("imperatives (which CAMeL can't analyse directly) are rebuilt from the jussive", () => {
    expect(view("اُكْتُبْ الدَّرْسَ").irab("اُكْتُبْ")).toBe("فِعْلُ أَمْرٍ مَبْنِيٌّ عَلَى السُّكُونِ، وَالفاعلُ ضَمِيرٌ مُسْتَتِرٌ وُجُوبًا تَقْدِيرُهُ أَنْتَ.");
    expect(view("اُكْتُبُوا الدَّرْسَ").irab("اُكْتُبُوا")).toContain("مَبْنِيٌّ عَلَى حَذْفِ النُّونِ");
  });

  it("weak verbs: implied damma, implied fatha", () => {
    expect(view("يَدْعُو الرَّجُلُ").irab("يَدْعُو")).toContain("الضَّمَّةُ المُقَدَّرَةُ عَلَى الوَاوِ مَنَعَ مِنْ ظُهُورِهَا الثِّقَلُ");
    expect(view("دَعَا الرَّجُلُ").irab("دَعَا")).toContain("الفَتْحِ المُقَدَّرِ عَلَى الأَلِفِ");
  });

  it("'atf with an attached waw, and a sentence-opening waw", () => {
    const v = view("جَاءَ الطَّالِبُ وَالمُعَلِّمُ");
    expect(v.roles).toEqual(["FIL", "FAAIL", "HARF", "MATUF"]);
    expect(v.rows[3].head).toBe("الطَّالِبُ");
    expect(view("وَذَهَبَ الوَلَدُ").irab("وَ")).toBe("حَرْفُ اسْتِئْنَافٍ مَبْنِيٌّ عَلَى الفَتْحِ.");
  });
});

describe("nouns: idafa, attached pronouns, implied and substitute signs", () => {
  it("idafa chains, and a na't after idafa agreeing with the mudaf by its case", () => {
    const v = view("كِتَابُ الطَّالِبِ الجَدِيدُ مُفِيدٌ");
    expect(v.roles).toEqual(["MUBTADA", "MUDAF_ILAYH", "NAAT", "KHABAR"]);
    expect(v.rows[2].head).toBe("كِتَابُ"); // الجديدُ is marfu' — it describes the book, not the student
    expect(v.irab("كِتَابُ")).toContain("وَهُوَ مُضَافٌ");

    const chain = view("بَابُ بَيْتِ الرَّجُلِ مَفْتُوحٌ");
    expect(chain.roles).toEqual(["MUBTADA", "MUDAF_ILAYH", "MUDAF_ILAYH", "KHABAR"]);
    expect(chain.rows[2].head).toBe("بَيْتِ");
  });

  it("attached possessive pronoun and ya' al-mutakallim", () => {
    const v = view("كِتَابُهُ جَدِيدٌ");
    expect(v.irab("هُ")).toBe("مضاف إليه، ضَمِيرٌ مُتَّصِلٌ مَبْنِيٌّ عَلَى الضَّمِّ فِي مَحَلِّ جَرٍّ.");
    expect(view("كِتَابِي جَدِيدٌ").irab("كِتَابِ")).toContain("المُقَدَّرَةُ عَلَى مَا قَبْلَ يَاءِ المُتَكَلِّمِ");
  });

  it("the five nouns, sound plurals (incl. construct) and duals", () => {
    expect(view("جَاءَ أَبُوكَ").irab("أَبُو")).toContain("وَعَلامَةُ رَفْعِهِ الوَاوُ لِأَنَّهُ مِنَ الأَسْمَاءِ الخَمْسَةِ");
    expect(view("جَاءَ المُعَلِّمُونَ").irab("المُعَلِّمُونَ")).toContain("الوَاوُ لِأَنَّهُ جَمْعُ مُذَكَّرٍ سَالِمٌ");
    expect(view("جَاءَ مُعَلِّمُو المَدْرَسَةِ").irab("مُعَلِّمُو")).toContain("الوَاوُ لِأَنَّهُ جَمْعُ مُذَكَّرٍ سَالِمٌ، وَهُوَ مُضَافٌ");
  });

  it("maqsur and manqus: implied case, visible fatha on the manqus", () => {
    expect(view("جَاءَ مُوسَى").irab("مُوسَى")).toContain("المُقَدَّرَةُ عَلَى الأَلِفِ مَنَعَ مِنْ ظُهُورِهَا التَّعَذُّرُ");
    expect(view("هَذِهِ عَصًا").irab("عَصًا")).toContain("المُقَدَّرَةُ عَلَى الأَلِفِ");
    expect(view("جَاءَ القَاضِي").irab("القَاضِي")).toContain("المُقَدَّرَةُ عَلَى اليَاءِ مَنَعَ مِنْ ظُهُورِهَا الثِّقَلُ");
    expect(view("رَأَيْتُ القَاضِيَ").irab("القَاضِيَ")).toContain("الفَتْحَةُ الظّاهِرَةُ");
    expect(view("هَذَا قَاضٍ").irab("قَاضٍ")).toContain("اليَاءِ المَحْذُوفَةِ");
  });
});

describe("nominal sentences", () => {
  it("mubtada' + na't + khabar vs. mubtada' + khabar (by definiteness)", () => {
    expect(view("الوَلَدُ الصَّغِيرُ نَائِمٌ").roles).toEqual(["MUBTADA", "NAAT", "KHABAR"]);
    expect(view("الوَلَدُ صَغِيرٌ").roles).toEqual(["MUBTADA", "KHABAR"]);
  });

  it("pronoun and demonstrative mubtada' (mabni, in the position of raf')", () => {
    expect(view("هُوَ طَالِبٌ").irab("هُوَ")).toBe("مبتدأ، ضَمِيرٌ مُنْفَصِلٌ مَبْنِيٌّ عَلَى الفَتْحِ فِي مَحَلِّ رَفْعٍ.");
    expect(view("هُوَ الطَّالِبُ").roles).toEqual(["MUBTADA", "KHABAR"]);
    expect(view("هَذَا كِتَابٌ").irab("هَذَا")).toBe("مبتدأ، اسْمُ إِشَارَةٍ مَبْنِيٌّ عَلَى السُّكُونِ فِي مَحَلِّ رَفْعٍ.");
    expect(view("هَذَا الكِتَابُ جَدِيدٌ").roles).toEqual(["MUBTADA", "BADAL", "KHABAR"]);
  });

  it("khabar as a verbal clause, and as a fronted prepositional phrase", () => {
    const v = view("الطَّالِبُ يَكْتُبُ الدَّرْسَ");
    expect(v.roles).toEqual(["MUBTADA", "FIL", "MAFUL_BIH"]);
    expect(v.irab("يَكْتُبُ")).toContain("وَالجُمْلَةُ الفِعْلِيَّةُ فِي مَحَلِّ رَفْعِ خَبَرِ المُبْتَدَأِ");
    expect(view("الطُّلَّابُ يَكْتُبُونَ").irab("يَكْتُبُونَ")).toContain("ثُبُوتُ النُّونِ لِأَنَّهُ مِنَ الأَفْعَالِ الخَمْسَةِ");

    const f = view("فِي البَيْتِ رَجُلٌ");
    expect(f.rows.map((r) => r.roleName)).toEqual(["حرف جر", "اسم مجرور", "مبتدأ مؤخر"]);
    expect(f.irab("فِي")).toContain("خَبَرٌ مُقَدَّمٌ");
  });
});

describe("inna, kana and their sisters", () => {
  it("إِنَّ الحَقَّ وَاضِحٌ — particle (not a verb), ism with the fatha, khabar with the damma", () => {
    const v = view("إِنَّ الحَقَّ وَاضِحٌ");
    expect(v.roles).toEqual(["INNA", "ISM_INNA", "KHABAR_INNA"]);
    expect(v.irab("إِنَّ")).toBe("حَرْفُ تَوْكِيدٍ وَنَصْبٍ مَبْنِيٌّ عَلَى الفَتْحِ.");
    expect(v.irab("الحَقَّ")).toBe("اسم إنّ مَنْصُوبٌ، وَعَلامَةُ نَصْبِهِ الفَتْحَةُ الظّاهِرَةُ عَلى آخِرِهِ.");
  });

  it("inna + attached pronoun, inna + verbal khabar, and a sister named correctly", () => {
    expect(view("إِنَّهُ طَالِبٌ").irab("هُ")).toBe("اسم إنّ، ضَمِيرٌ مُتَّصِلٌ مَبْنِيٌّ عَلَى الضَّمِّ فِي مَحَلِّ نَصْبٍ.");
    expect(view("إِنَّ الطَّالِبَ يَكْتُبُ").irab("يَكْتُبُ")).toContain("فِي مَحَلِّ رَفْعِ خَبَرِ إنّ");
    expect(view("كَأَنَّ الطَّالِبَ أَسَدٌ").rows.map((r) => r.roleName)).toEqual(["حرف ناسخ", "اسم كأنّ", "خبر كأنّ"]);
  });

  it("kana: ism marfu', khabar mansub; attached ism; laysa; ma zala; prepositional khabar", () => {
    const v = view("كَانَ الجَوُّ جَمِيلًا");
    expect(v.roles).toEqual(["KANA", "ISM_KANA", "KHABAR_KANA"]);
    expect(v.irab("كَانَ")).toBe("فِعْلٌ مَاضٍ نَاقِصٌ مَبْنِيٌّ عَلَى الفَتْحِ.");
    expect(view("كُنْتُ طَالِبًا").irab("كُنْتُ")).toContain("فِي مَحَلِّ رَفْعِ اسمِ كان");
    expect(view("لَيْسَ الطَّالِبُ كَسُولًا").rows.map((r) => r.roleName)).toEqual(["فعل ناسخ (ليس)", "اسم ليس", "خبر ليس"]);
    expect(view("مَا زَالَ الجَوُّ بَارِدًا").roles).toEqual(["HARF", "KANA", "ISM_KANA", "KHABAR_KANA"]);
    expect(view("كَانَ الطَّالِبُ فِي البَيْتِ").irab("فِي")).toContain("فِي مَحَلِّ نَصْبِ خَبَرِ كان");
  });
});

describe("negation and other particles", () => {
  it("lam (jussive), lan (subjunctive), la al-nahiya, ma + past", () => {
    const lam = view("لَمْ يَكْتُبْ الطَّالِبُ الدَّرْسَ");
    expect(lam.irab("لَمْ")).toBe("حَرْفُ نَفْيٍ وَجَزْمٍ وَقَلْبٍ مَبْنِيٌّ عَلَى السُّكُونِ.");
    expect(lam.irab("يَكْتُبْ")).toBe("فِعْلٌ مُضَارِعٌ مَجْزُومٌ، وَعَلامَةُ جَزْمِهِ السُّكُونُ.");
    expect(view("لَمْ يَكْتُبُوا").irab("يَكْتُبُوا")).toContain("حَذْفُ النُّونِ لِأَنَّهُ مِنَ الأَفْعَالِ الخَمْسَةِ");
    expect(view("لَمْ يَدْعُ الرَّجُلُ").irab("يَدْعُ")).toContain("حَذْفُ حَرْفِ العِلَّةِ");
    expect(view("لَنْ يَذْهَبَ الوَلَدُ").irab("يَذْهَبَ")).toContain("مَنْصُوبٌ، وَعَلامَةُ نَصْبِهِ الفَتْحَةُ");
    expect(view("لَا تَكْذِبْ").irab("لَا")).toBe("حَرْفُ نَهْيٍ وَجَزْمٍ مَبْنِيٌّ عَلَى السُّكُونِ.");
    expect(view("مَا ذَهَبَ الطَّالِبُ").roles).toEqual(["HARF", "FIL", "FAAIL"]);
  });

  it("ma al-hijaziyya and la negating the genus", () => {
    expect(view("مَا الطَّالِبُ كَسُولًا").rows.map((r) => r.roleName)).toEqual(["حرف", "اسم ما", "خبر ما"]);
    const la = view("لَا رَجُلَ فِي البَيْتِ");
    expect(la.irab("رَجُلَ")).toBe("اسم لا، اسْمٌ مَبْنِيٌّ عَلَى الفَتْحِ فِي مَحَلِّ نَصْبٍ.");
  });

  it("qad before a past verb", () => {
    expect(view("قَدْ ذَهَبَ الطَّالِبُ").irab("قَدْ")).toBe("حَرْفُ تَحْقِيقٍ مَبْنِيٌّ عَلَى السُّكُونِ.");
  });

  it("refuses a mood the governing particle contradicts, and says why", () => {
    const r = parse("لَمْ يَذْهَبُ الوَلَدُ");
    expect(r.tokens.every((t) => t.role === null)).toBe(true);
    expect(r.warnings.some((w) => w.includes("must be jussive"))).toBe(true);
  });
});

describe("التقاء الساكنين — a helping vowel before hamzat al-wasl", () => {
  it("a jussive verb, an imperative and ta' al-ta'nith typed with a kasra", () => {
    expect(view("لَمْ يَكْتُبِ الطَّالِبُ الدَّرْسَ").irab("يَكْتُبِ")).toBe(
      "فِعْلٌ مُضَارِعٌ مَجْزُومٌ، وَعَلامَةُ جَزْمِهِ السُّكُونُ، وَحُرِّكَ بِالكَسْرِ مَنْعًا لِالْتِقَاءِ السَّاكِنَيْنِ."
    );
    expect(view("اُكْتُبِ الدَّرْسَ").irab("اُكْتُبِ")).toContain("مَبْنِيٌّ عَلَى السُّكُونِ، وَحُرِّكَ بِالكَسْرِ");
    expect(view("ذَهَبَتِ الطَّالِبَةُ إِلَى المَدْرَسَةِ").irab("ذَهَبَتِ")).toContain("تَاءُ التَّأْنِيثِ السَّاكِنَةُ حَرْفٌ لَا مَحَلَّ لَهُ مِنَ الإِعْرَابِ، وَحُرِّكَتْ بِالكَسْرِ");
  });

  it("prepositions keep their fixed built-on vowel (مِنَ is still built on the sukun)", () => {
    expect(view("خَرَجْتُ مِنَ المَسْجِدِ").irab("مِنَ")).toBe("حَرْفُ جَرٍّ مَبْنِيٌّ عَلَى السُّكُونِ، وَحُرِّكَ بِالفَتْحِ مَنْعًا لِالْتِقَاءِ السَّاكِنَيْنِ.");
    expect(view("سَأَلْتُ عَنِ الدَّرْسِ").irab("عَنِ")).toContain("وَحُرِّكَ بِالكَسْرِ");
    expect(view("قَدِ اجْتَهَدَ الطَّالِبُ").irab("قَدِ")).toContain("حَرْفُ تَحْقِيقٍ مَبْنِيٌّ عَلَى السُّكُونِ، وَحُرِّكَ بِالكَسْرِ");
  });
});

describe("hal, maf'ul mutlaq, tamyiz", () => {
  it("an indefinite accusative adjective after a complete clause is a hal, not an object", () => {
    expect(view("جَاءَ الطَّالِبُ ضَاحِكًا").roles).toEqual(["FIL", "FAAIL", "HAL"]);
    expect(view("رَأَيْتُ الطِّفْلَ نَائِمًا").roles).toEqual(["FIL", "MAFUL_BIH", "HAL"]);
    expect(view("ذَهَبَ الوَلَدُ إِلَى المَدْرَسَةِ مَسْرُورًا").roles).toEqual(["FIL", "FAAIL", "HARF_JARR", "MAJROOR", "HAL"]);
  });

  it("maf'ul mutlaq: a derived verb's regular masdar, or a same-root noun after the object", () => {
    expect(view("اجْتَهَدَ الطَّالِبُ اجْتِهَادًا").roles).toEqual(["FIL", "FAAIL", "MAFUL_MUTLAQ"]);
    expect(view("عَلَّمَ المُعَلِّمُ الطُّلَّابَ تَعْلِيمًا").roles).toEqual(["FIL", "FAAIL", "MAFUL_BIH", "MAFUL_MUTLAQ"]);
    const d = view("ضَرَبَ الرَّجُلُ اللِّصَّ ضَرْبًا شَدِيدًا");
    expect(d.roles).toEqual(["FIL", "FAAIL", "MAFUL_BIH", "MAFUL_MUTLAQ", "NAAT"]);
  });

  it("a form-I same-root noun with no object is reported as undecidable, not guessed", () => {
    const v = view("كَتَبَ الطَّالِبُ كِتَابًا");
    expect(v.roles).toEqual(["FIL", "FAAIL", null]);
    expect(v.result.warnings.some((w) => w.includes("maf'ul mutlaq"))).toBe(true);
  });

  it("tamyiz after an elative and after a tens number (declined like a sound plural)", () => {
    expect(view("مُحَمَّدٌ أَكْثَرُ عِلْمًا").roles).toEqual(["MUBTADA", "KHABAR", "TAMYIZ"]);
    expect(view("الطَّالِبُ أَحْسَنُ أَدَبًا").rows[2].head).toBe("أَحْسَنُ");
    const n = view("جَاءَ عِشْرُونَ طَالِبًا");
    expect(n.roles).toEqual(["FIL", "FAAIL", "TAMYIZ"]);
    expect(n.irab("عِشْرُونَ")).toContain("الوَاوُ لِأَنَّهُ مُلْحَقٌ بِجَمْعِ المُذَكَّرِ السَّالِمِ");
    expect(view("اشْتَرَيْتُ ثَلَاثِينَ كِتَابًا").irab("ثَلَاثِينَ")).toContain("اليَاءُ لِأَنَّهُ مُلْحَقٌ");
  });
});

describe("relative clauses", () => {
  it("a relative pronoun fills the slot (mabni, in its position) and its clause has no position", () => {
    const v = view("جَاءَ الَّذِي نَجَحَ");
    expect(v.roles).toEqual(["FIL", "FAAIL", "FIL"]);
    expect(v.irab("الَّذِي")).toBe("فاعل، اسْمٌ مَوْصُولٌ مَبْنِيٌّ عَلَى السُّكُونِ فِي مَحَلِّ رَفْعٍ.");
    expect(v.irab("نَجَحَ")).toContain("وَجُمْلَةُ الصِّلَةِ لَا مَحَلَّ لَهَا مِنَ الإِعْرَابِ");
    const m = view("الَّذِي يَجْتَهِدُ يَنْجَحُ");
    expect(m.roles).toEqual(["MUBTADA", "FIL", "FIL"]);
    expect(m.irab("يَنْجَحُ")).toContain("فِي مَحَلِّ رَفْعِ خَبَرِ المُبْتَدَأِ");
  });

  it("as na't of a definite noun, agreeing with it; الذين built on the fatha; a prepositional sila", () => {
    expect(view("جَاءَ الطَّالِبُ الَّذِي نَجَحَ").rows[2]).toMatchObject({ role: "NAAT", head: "الطَّالِبُ" });
    expect(view("رَأَيْتُ الطَّالِبَةَ الَّتِي نَجَحَتْ").irab("الَّتِي")).toContain("فِي مَحَلِّ نَصْبٍ");
    expect(view("نَجَحَ الطُّلَّابُ الَّذِينَ اجْتَهَدُوا").irab("الَّذِينَ")).toBe("نعت، اسْمٌ مَوْصُولٌ مَبْنِيٌّ عَلَى الفَتْحِ فِي مَحَلِّ رَفْعٍ.");
    const pp = view("الكِتَابُ الَّذِي فِي البَيْتِ جَدِيدٌ");
    expect(pp.roles).toEqual(["MUBTADA", "NAAT", "HARF_JARR", "MAJROOR", "KHABAR"]);
    expect(pp.irab("فِي")).toContain("صِلَةُ المَوْصُولِ");
  });
});

describe("conditionals and أَنْ + verb", () => {
  it("إِنْ with two jussive verbs, and with two past verbs in the position of jazm", () => {
    const v = view("إِنْ تَدْرُسْ تَنْجَحْ");
    expect(v.result.patternMatched).toBe("conditional");
    expect(v.irab("إِنْ")).toBe("حَرْفُ شَرْطٍ جَازِمٌ مَبْنِيٌّ عَلَى السُّكُونِ.");
    expect(v.irab("تَدْرُسْ")).toContain("وَهُوَ فِعْلُ الشَّرْطِ");
    expect(v.irab("تَنْجَحْ")).toContain("وَهُوَ جَوَابُ الشَّرْطِ");
    expect(view("إِنْ دَرَسْتَ نَجَحْتَ").irab("دَرَسْتَ")).toContain("وَهُوَ فِي مَحَلِّ جَزْمٍ فِعْلُ الشَّرْطِ");
  });

  it("مَنْ is a conditional noun and mubtada'; a nominal answer takes the linking fa'", () => {
    expect(view("مَنْ يَجْتَهِدْ يَنْجَحْ").irab("مَنْ")).toBe("مبتدأ، اسْمُ شَرْطٍ جَازِمٌ مَبْنِيٌّ عَلَى السُّكُونِ فِي مَحَلِّ رَفْعٍ.");
    const f = view("إِنْ تَجْتَهِدْ فَالنَّجَاحُ قَرِيبٌ");
    expect(f.irab("فَ")).toContain("رَابِطَةٌ لِجَوَابِ الشَّرْطِ");
    expect(f.roles).toEqual(["HARF", "FIL", "HARF", "MUBTADA", "KHABAR"]);
  });

  it("أَنْ + subjunctive verb as the object; refused when it could be the subject", () => {
    const v = view("أُرِيدُ أَنْ أَذْهَبَ");
    expect(v.roles).toEqual(["FIL", "HARF", "FIL"]);
    expect(v.irab("أَنْ")).toContain("وَالمَصْدَرُ المُؤَوَّلُ مِنْ أَنْ وَالفِعْلِ فِي مَحَلِّ نَصْبِ مَفْعُولٍ بِهِ");
    expect(v.irab("أَذْهَبَ")).toContain("مَنْصُوبٌ");
    expect(view("يُرِيدُ الطَّالِبُ أَنْ يَنْجَحَ").roles).toEqual(["FIL", "FAAIL", "HARF", "FIL"]);
    expect(view("يَجِبُ أَنْ تَدْرُسَ").result.warnings.some((w) => w.includes("subject or the object"))).toBe(true);
  });
});

describe("safety", () => {
  it("handles an empty token list", () => {
    expect(parseFreeText([])).toMatchObject({ tokens: [], patternMatched: "none" });
  });

  it("reports words with no exact analysis instead of guessing", () => {
    const r = parseFreeText([{ surface: "كتب", candidates: [] }]);
    expect(r.tokens[0].role).toBeNull();
    expect(r.warnings.some((w) => w.includes("no exact match"))).toBe(true);
  });
});
