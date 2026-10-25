import "server-only";
import { z } from "zod";

/** POST /api/flashcards/releases — unlock (or lock again) one class deck. */
export const releaseBodySchema = z.object({
  book: z.string({ error: "book must be a string" }).trim().min(1, "book is required").max(100),
  section: z.number({ error: "section must be a whole number from 1 to 1000" }).int().positive().max(1000),
  released: z.boolean({ error: "released must be true or false" }),
});
