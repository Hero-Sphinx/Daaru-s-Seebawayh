import { ASPECT_LABELS, CASE_LABELS, verbFormLabel } from "./answer-labels";
import { VERB_FORMS } from "@/lib/quran/tagset";
import type { TemplateBody } from "./template-types";

/**
 * Authored quiz templates — the data prisma/seed.ts upserts into
 * quiz_templates (by `code`). The engine (template-engine.ts) reads them
 * back from the DB, so they can also be edited there; this file is just
 * their version-controlled source of truth, like grammatical-roles.ts.
 *
 * Rule references cite the chapter (bāb) a learner would look the rule up
 * in, in the same style as src/lib/data/grammatical-roles.ts — never an
 * invented page or verse number.
 */

export interface AuthoredTemplate {
  code: string;
  quizType: string;
  difficultyTier: "beginner" | "intermediate" | "advanced" | "classical";
  ruleReference: string | null;
  body: TemplateBody;
}

// Forms I-X only as options: XI/XII are vanishingly rare and would just be
// free eliminations.
const COMMON_FORM_LABELS = VERB_FORMS.filter((f) => f.formNumber <= 10).map((f) => verbFormLabel(f.formNumber, f.waznPattern));

export const QUIZ_TEMPLATES: AuthoredTemplate[] = [
  // --- Vocabulary (the learner's own bank) ---------------------------------
  {
    code: "vocab.meaning",
    quizType: "vocab_recall",
    difficultyTier: "beginner",
    ruleReference: null,
    body: {
      version: 1,
      topic: "vocab",
      source: "vocabulary",
      prompt: { en: "What does “{surface}” mean?", ar: "{surface}" },
      answerField: "meaningEn",
      distractors: { strategy: "pool" },
      explanation: "{surface} means “{answer}”.",
    },
  },
  {
    code: "vocab.root",
    quizType: "root_matching",
    difficultyTier: "beginner",
    ruleReference: "Sarf — al-Mīzān al-Ṣarfī (root and pattern)",
    body: {
      version: 1,
      topic: "vocab",
      source: "vocabulary",
      prompt: { en: "What is the root (jadhr) of “{surface}”?", ar: "{surface}" },
      answerField: "root",
      // Look-alike roots (shared radicals), not random ones from the bank.
      distractors: { strategy: "similar_root" },
      explanation: "{surface} is built on the root {answer}.",
    },
  },

  // --- I'rab from the Qur'an (QADT annotation) ----------------------------------
  {
    code: "quran.case",
    quizType: "case_identification",
    difficultyTier: "beginner",
    ruleReference: "Ajurrumiyyah, Bab Ma'rifat 'Alamat al-I'rab",
    body: {
      version: 1,
      topic: "irab",
      source: "quran_word",
      where: { posCategory: "noun" },
      prompt: { en: "In {contextRef}, what is the i'rab state (case) of “{surface}”?", ar: "{context}" },
      answerField: "caseLabel",
      distractors: { strategy: "fixed", values: Object.values(CASE_LABELS) },
      explanation: "“{surface}” ({contextRef}) is {answer}, per the Quranic Arabic Corpus annotation.",
    },
  },
  {
    code: "quran.pos",
    quizType: "pos_selection",
    difficultyTier: "intermediate",
    ruleReference: "Ajurrumiyyah, Bab al-Kalam",
    body: {
      version: 1,
      topic: "irab",
      source: "quran_word",
      where: { posCategory: "noun" },
      prompt: { en: "In {contextRef}, what kind of noun (ism) is “{surface}”?", ar: "{context}" },
      answerField: "posLabel",
      // Other *noun* kinds only — "is it a verb?" would be a giveaway here.
      distractors: { strategy: "pos_same_category" },
      explanation: "“{surface}” is a {answer} ({contextRef}).",
    },
  },
  {
    code: "quran.particle",
    quizType: "pos_selection",
    difficultyTier: "intermediate",
    ruleReference: "Ajurrumiyyah, Bab al-Kalam",
    body: {
      version: 1,
      topic: "irab",
      source: "quran_word",
      where: { posCategory: "particle" },
      prompt: { en: "In {contextRef}, what kind of particle (ḥarf) is “{surface}”?", ar: "{context}" },
      answerField: "posLabel",
      distractors: { strategy: "pos_same_category" },
      explanation: "“{surface}” is a {answer} ({contextRef}).",
    },
  },

  // --- Sarf from the Qur'an --------------------------------------------------------
  {
    code: "quran.verb_aspect",
    quizType: "wazn_identification",
    difficultyTier: "beginner",
    ruleReference: "Ajurrumiyyah, Bab al-Af'al",
    body: {
      version: 1,
      topic: "sarf",
      source: "quran_word",
      where: { posCategory: "verb" },
      prompt: { en: "In {contextRef}, which kind of verb is “{surface}”?", ar: "{context}" },
      answerField: "aspectLabel",
      distractors: { strategy: "fixed", values: Object.values(ASPECT_LABELS) },
      explanation: "“{surface}” is {answer}.",
    },
  },
  {
    code: "quran.verb_form",
    quizType: "wazn_identification",
    difficultyTier: "intermediate",
    ruleReference: "Sarf — al-Af'al al-Mazidah (augmented verb forms)",
    body: {
      version: 1,
      topic: "sarf",
      source: "quran_word",
      where: { posCategory: "verb" },
      prompt: { en: "Which verb form (wazn) is the verb “{lemma}” (as in “{surface}”, {contextRef})?", ar: "{lemma}" },
      answerField: "verbFormLabel",
      distractors: { strategy: "fixed", values: COMMON_FORM_LABELS },
      explanation: "{lemma} is {answer}.",
    },
  },
  {
    code: "quran.root",
    quizType: "root_matching",
    difficultyTier: "beginner",
    ruleReference: "Sarf — al-Mīzān al-Ṣarfī (root and pattern)",
    body: {
      version: 1,
      topic: "sarf",
      source: "quran_word",
      prompt: { en: "What is the root of “{surface}” ({contextRef})?", ar: "{surface}" },
      answerField: "root",
      distractors: { strategy: "similar_root" },
      explanation: "“{surface}” comes from the root {answer} (lemma {lemma}).",
    },
  },
  {
    code: "quran.root_family",
    quizType: "root_matching",
    difficultyTier: "intermediate",
    ruleReference: "Sarf — al-Mīzān al-Ṣarfī (root and pattern)",
    body: {
      version: 1,
      topic: "sarf",
      source: "quran_word",
      where: { require: ["root"] },
      prompt: { en: "Which of these words comes from the root {root}?", ar: "{root}" },
      answerField: "lemma",
      // Words from look-alike roots — tests the radicals, not a guess.
      distractors: { strategy: "lemmas_from_similar_roots" },
      explanation: "{answer} is from {root}; the others come from similar-looking roots.",
    },
  },
];
