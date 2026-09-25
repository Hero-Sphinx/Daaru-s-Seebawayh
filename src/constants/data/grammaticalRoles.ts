/**
 * Single source of truth for role/case labels, mirroring the `grammatical_roles`
 * and `case_signs` lookup tables in db/schema.sql (one row per code, referenced
 * by id from `dependency_edges` / `tokens`). Sample sentences, the I'rab
 * workspace's color key, and the quiz generator all read from here so a role's
 * name never drifts between the places it's displayed.
 */

import type { CaseSign, CaseType, GrammaticalRole, RoleCode } from "@/types";

export const GRAMMATICAL_ROLES: Record<RoleCode, GrammaticalRole> = {
  FIL: {
    code: "FIL",
    nameAr: "فعل",
    nameEn: "Verb (predicate)",
    category: "verbal",
    ruleReference: "Ajurrumiyyah, Bab al-Fi'l",
  },
  FAAIL: {
    code: "FAAIL",
    nameAr: "فاعل",
    nameEn: "Subject (fa'il)",
    category: "nominal",
    ruleReference: "Ajurrumiyyah, Bab al-Fa'il",
  },
  MAFUL_BIH: {
    code: "MAFUL_BIH",
    nameAr: "مفعول به",
    nameEn: "Direct object",
    category: "nominal",
    ruleReference: "Ajurrumiyyah, Bab al-Maf'ulat",
  },
  MUBTADA: {
    code: "MUBTADA",
    nameAr: "مبتدأ",
    nameEn: "Topic (mubtada')",
    category: "nominal",
    ruleReference: "Ajurrumiyyah, Bab al-Mubtada wa-l-Khabar",
  },
  KHABAR: {
    code: "KHABAR",
    nameAr: "خبر",
    nameEn: "Predicate (khabar)",
    category: "nominal",
    ruleReference: "Ajurrumiyyah, Bab al-Mubtada wa-l-Khabar",
  },
  HARF_JARR: {
    code: "HARF_JARR",
    nameAr: "حرف جر",
    nameEn: "Preposition (particle)",
    category: "particle",
    ruleReference: "Ajurrumiyyah, Bab Huruf al-Khafd",
  },
  MAJROOR: {
    code: "MAJROOR",
    nameAr: "اسم مجرور",
    nameEn: "Object of preposition",
    category: "nominal",
    ruleReference: "Ajurrumiyyah, Bab Huruf al-Khafd",
  },
  NAAT: {
    code: "NAAT",
    nameAr: "نعت",
    nameEn: "Adjective (na't)",
    category: "nominal",
    ruleReference: "Ajurrumiyyah, Bab al-Tawabi' (al-Na't)",
  },
  INNA: {
    code: "INNA",
    nameAr: "حرف ناسخ",
    nameEn: "Inna or one of its sisters",
    category: "particle",
    ruleReference: "Ajurrumiyyah, Bab Inna wa-Akhawatuha",
  },
  ISM_INNA: {
    code: "ISM_INNA",
    nameAr: "اسم إنّ",
    nameEn: "Noun of inna (ism inna)",
    category: "nominal",
    ruleReference: "Ajurrumiyyah, Bab Inna wa-Akhawatuha",
  },
  KHABAR_INNA: {
    code: "KHABAR_INNA",
    nameAr: "خبر إنّ",
    nameEn: "Predicate of inna (khabar inna)",
    category: "nominal",
    ruleReference: "Ajurrumiyyah, Bab Inna wa-Akhawatuha",
  },
  KANA: {
    code: "KANA",
    nameAr: "فعل ناسخ",
    nameEn: "Kana or one of its sisters",
    category: "verbal",
    ruleReference: "Ajurrumiyyah, Bab Kana wa-Akhawatuha",
  },
  ISM_KANA: {
    code: "ISM_KANA",
    nameAr: "اسم كان",
    nameEn: "Noun of kana (ism kana)",
    category: "nominal",
    ruleReference: "Ajurrumiyyah, Bab Kana wa-Akhawatuha",
  },
  KHABAR_KANA: {
    code: "KHABAR_KANA",
    nameAr: "خبر كان",
    nameEn: "Predicate of kana (khabar kana)",
    category: "nominal",
    ruleReference: "Ajurrumiyyah, Bab Kana wa-Akhawatuha",
  },
  ISM_LA: {
    code: "ISM_LA",
    nameAr: "اسم لا",
    nameEn: "Noun of la (negating the genus)",
    category: "nominal",
    ruleReference: "Nahw — La al-Nafiya li-l-Jins",
  },
  KHABAR_LA: {
    code: "KHABAR_LA",
    nameAr: "خبر لا",
    nameEn: "Predicate of la (negating the genus)",
    category: "nominal",
    ruleReference: "Nahw — La al-Nafiya li-l-Jins",
  },
  NAIB_FAAIL: {
    code: "NAIB_FAAIL",
    nameAr: "نائب فاعل",
    nameEn: "Deputy subject (na'ib fa'il)",
    category: "nominal",
    ruleReference: "Ajurrumiyyah, Bab al-Maf'ul alladhi lam yusamma Fa'iluhu",
  },
  MUDAF_ILAYH: {
    code: "MUDAF_ILAYH",
    nameAr: "مضاف إليه",
    nameEn: "Second term of a construct (mudaf ilayh)",
    category: "nominal",
    ruleReference: "Ajurrumiyyah, Bab Makhfudat al-Asma'",
  },
  MATUF: {
    code: "MATUF",
    nameAr: "معطوف",
    nameEn: "Coordinated noun (ma'tuf)",
    category: "nominal",
    ruleReference: "Ajurrumiyyah, Bab al-'Atf",
  },
  BADAL: {
    code: "BADAL",
    nameAr: "بدل",
    nameEn: "Apposition (badal)",
    category: "nominal",
    ruleReference: "Ajurrumiyyah, Bab al-Badal",
  },
  MAFUL_MUTLAQ: {
    code: "MAFUL_MUTLAQ",
    nameAr: "مفعول مطلق",
    nameEn: "Absolute object (maf'ul mutlaq)",
    category: "nominal",
    ruleReference: "Ajurrumiyyah, Bab al-Masdar",
  },
  HAL: {
    code: "HAL",
    nameAr: "حال",
    nameEn: "Circumstantial accusative (hal)",
    category: "nominal",
    ruleReference: "Ajurrumiyyah, Bab al-Hal",
  },
  TAMYIZ: {
    code: "TAMYIZ",
    nameAr: "تمييز",
    nameEn: "Specification (tamyiz)",
    category: "nominal",
    ruleReference: "Ajurrumiyyah, Bab al-Tamyiz",
  },
  MAFUL_FIH: {
    code: "MAFUL_FIH",
    nameAr: "مفعول فيه",
    nameEn: "Adverb of time or place (maf'ul fih / zarf)",
    category: "nominal",
    ruleReference: "Ajurrumiyyah, Bab al-Zarf",
  },
  HARF: {
    code: "HARF",
    nameAr: "حرف",
    nameEn: "Particle",
    category: "particle",
  },
};

export const ROLE_CODES = Object.keys(GRAMMATICAL_ROLES) as RoleCode[];

export const CASE_SIGNS: Record<CaseType, CaseSign> = {
  rafa: { caseType: "rafa", signAr: "الضمة", signEn: "Damma" },
  nasb: { caseType: "nasb", signAr: "الفتحة", signEn: "Fatha" },
  jarr: { caseType: "jarr", signAr: "الكسرة", signEn: "Kasra" },
  jazm: { caseType: "jazm", signAr: "السكون", signEn: "Sukun" },
  mabni: { caseType: "mabni", signAr: "مبني", signEn: "Indeclinable (mabni)" },
};
