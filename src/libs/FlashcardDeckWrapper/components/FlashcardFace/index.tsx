import type { BilingualText } from "@/types";

export type CardLanguage = "both" | "ar" | "en";

/** One side of a card: the Arabic large and right-to-left, the English beneath it (or either alone). */
export default function FlashcardFace({ text, language, size = "lg" }: { text: BilingualText; language: CardLanguage; size?: "lg" | "sm" }) {
  const arabicSize = size === "lg" ? "text-[1.6rem] leading-[2.1] sm:text-3xl sm:leading-[2.2]" : "text-xl leading-loose";
  const englishSize = size === "lg" ? "text-base sm:text-lg" : "text-sm";
  return (
    <div className="space-y-2">
      {language !== "en" && (
        <p dir="rtl" lang="ar" className={`whitespace-pre-line font-arabic text-emerald-950 dark:text-amber-100 ${arabicSize}`}>
          {text.ar}
        </p>
      )}
      {language !== "ar" && <p className={`whitespace-pre-line leading-relaxed ${language === "both" ? "text-muted" : "text-foreground"} ${englishSize}`}>{text.en}</p>}
    </div>
  );
}
