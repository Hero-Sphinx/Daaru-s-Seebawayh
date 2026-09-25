import { z } from "zod";
import { MAX_NOTE_LENGTH } from "@/helpers";

export const shareBodySchema = z.object({
  email: z.string({ error: "Enter an email address" }).trim().toLowerCase().pipe(z.email({ error: "Enter a valid email address" })),
  role: z.enum(["viewer", "annotator"], { error: "role must be viewer or annotator" }),
});

const note = z.string().trim().max(MAX_NOTE_LENGTH, `Notes are limited to ${MAX_NOTE_LENGTH} characters`);
const visibility = z.enum(["private", "shared"]);

export const createAnnotationBodySchema = z.object({
  textUnitId: z.number({ error: "textUnitId is required" }).int().positive(),
  // Range checks against the page text happen in resolveAnnotationRange.
  start: z.unknown(),
  end: z.unknown(),
  note: note.optional(),
  visibility: visibility.default("shared"),
});

export const updateAnnotationBodySchema = z.object({
  note: note.optional(),
  visibility: visibility.optional(),
});

export const searchQuerySchema = z.object({
  q: z.string({ error: "q is required" }).trim().min(1, "q is required").max(100, "Search for a word or short phrase"),
  mode: z.enum(["text", "root"]).catch("text"),
});

export const generateQuizBodySchema = z.object({
  /** Throw away the cached bank and build a fresh one. */
  regenerate: z.boolean().default(false),
});
