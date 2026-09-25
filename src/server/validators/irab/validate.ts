import { z } from "zod";

export const parseBodySchema = z.object({
  text: z.string({ error: "text is required" }).trim().min(1, "text is required").max(500, "That's too long for one sentence."),
  /**
   * Default true (the I'rab Workspace wants it). Callers that only need
   * role/case — e.g. the library reader's word-click lookup — pass false to
   * skip the Gemini call entirely, so a click never costs quota.
   */
  includeTranslation: z.boolean().default(true),
});
