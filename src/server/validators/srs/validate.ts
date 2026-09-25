import { z } from "zod";

export const reviewBodySchema = z.object({
  cardId: z.number({ error: "cardId must be a number" }).int().positive(),
  quality: z.number({ error: "quality must be a number" }).int().min(0, "quality must be 0-5").max(5, "quality must be 0-5"),
});
