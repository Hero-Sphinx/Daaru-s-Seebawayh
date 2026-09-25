import { z } from "zod";
import { isArabicWord } from "@/helpers";

const MAX_LENGTH = 60;

export const speechTextSchema = z
  .string({ error: "Send a short Arabic word or phrase as ?text=" })
  .transform((t) => t.trim().normalize("NFC"))
  .refine((t) => t.length > 0 && t.length <= MAX_LENGTH && t.split(/\s+/).every(isArabicWord), {
    error: "Send a short Arabic word or phrase as ?text=",
  });
