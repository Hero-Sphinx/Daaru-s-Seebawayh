import { FULL_NAME_AR, FULL_NAME_EN } from "@/constants";

export default function Footer() {
  return (
    <footer className="site-chrome border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-5 text-xs text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>
          <span dir="rtl" lang="ar" className="font-arabic text-sm text-foreground/80">
            {FULL_NAME_AR}
          </span>
          <span className="sr-only"> — {FULL_NAME_EN}</span>
        </p>
        <p>
          Qur&apos;anic morphology: <a className="underline hover:text-foreground" href="https://corpus.quran.com" target="_blank" rel="noreferrer">Quranic Arabic Corpus</a> ·
          Recitation audio: <a className="underline hover:text-foreground" href="https://quran.com" target="_blank" rel="noreferrer">Quran.com</a> ·
          Morphological analysis: CAMeL Tools
        </p>
      </div>
    </footer>
  );
}
