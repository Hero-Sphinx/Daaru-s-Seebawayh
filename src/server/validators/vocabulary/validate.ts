import { z } from "zod";

const required = (label: string, max: number) =>
  z.string({ error: `${label} is required` }).trim().min(1, `${label} is required`).max(max, `${label} is too long (max ${max} characters)`);
const optional = (label: string, max: number) =>
  z
    .string()
    .trim()
    .max(max, `${label} is too long (max ${max} characters)`)
    .optional()
    .transform((v) => v || undefined);

export const vocabularyItemSchema = z.object({
  wordAr: required("The Arabic word", 100),
  meaningEn: required("The meaning", 300),
  root: optional("The root", 30),
  transliteration: optional("The transliteration", 100),
  exampleAr: optional("The example sentence", 500),
});
export type VocabularyItemInput = z.infer<typeof vocabularyItemSchema>;

export const MAX_VOCABULARY_IMPORT = 500;

export const createVocabularyBodySchema = z.object({
  items: z
    .array(vocabularyItemSchema, { error: "items must be a list of words" })
    .min(1, "Add at least one word")
    .max(MAX_VOCABULARY_IMPORT, `Import at most ${MAX_VOCABULARY_IMPORT} words at a time`),
});

export const enrichBodySchema = z.object({ word: required("word", 100) });

export const lookupBodySchema = z.object({
  input: required("input", 100),
  /** false: CAMeL only, no Gemini call (a cached meaning is still returned). */
  withMeaning: z.boolean().optional(),
});

export const vocabularyIdSchema = z.string().regex(/^\d+$/, "Invalid id").transform((v) => BigInt(v));
