import Link from "next/link";
import type { ReactNode } from "react";

const CARD = "rounded-2xl border border-border bg-surface p-6 shadow-sm";

function Ar({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span className={`font-arabic ${className}`} lang="ar" dir="rtl">
      {children}
    </span>
  );
}

const AIMS: { titleAr: string; title: string; body: string; tint: string }[] = [
  {
    titleAr: "الفَهْمُ",
    title: "Understanding",
    body: "To help every learner read the Qur'an, the Sunnah and the books of the scholars with understanding — not just recitation.",
    tint: "border-emerald-200 bg-emerald-50/70 dark:border-emerald-900/60 dark:bg-emerald-950/30",
  },
  {
    titleAr: "الإِتْقَانُ",
    title: "Mastery",
    body: "To make naḥw and ṣarf something you practise every day, sentence by sentence, the way the classical teachers taught it — clearly, correctly, and with the reasons.",
    tint: "border-amber-200 bg-amber-50/70 dark:border-amber-900/60 dark:bg-amber-950/30",
  },
  {
    titleAr: "الأَمَانَةُ",
    title: "Trustworthiness",
    body: "Grammar here is never guessed. Every i'rab comes from fixed rules and verified data, and when the tool isn't sure, it says so.",
    tint: "border-sky-200 bg-sky-50/70 dark:border-sky-900/60 dark:bg-sky-950/30",
  },
  {
    titleAr: "المَجَّانِيَّةُ",
    title: "Free for all",
    body: "Knowledge of the language of the Qur'an should be open to everyone, wherever they are and whatever they can afford.",
    tint: "border-rose-200 bg-rose-50/70 dark:border-rose-900/60 dark:bg-rose-950/30",
  },
];

export default function VisionWrapper() {
  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <header className="relative overflow-hidden rounded-2xl border border-emerald-700/40 bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 p-6 text-white shadow-xl md:p-10">
        <span aria-hidden className="site-chrome pointer-events-none absolute -bottom-10 -right-6 select-none text-[140px] font-bold leading-none text-amber-300 opacity-10 sm:text-[200px]">
          <span className="font-arabic">رُؤْيَتُنَا</span>
        </span>
        <div className="relative z-10 max-w-2xl">
          <span className="mb-3 inline-block rounded-full border border-amber-400/30 bg-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-300">
            Our vision · <Ar className="text-sm">رُؤْيَتُنَا</Ar>
          </span>
          <h1 className="mb-3 text-2xl font-bold tracking-tight sm:text-4xl">A home for the language of the Qur&apos;an.</h1>
          <p className="text-sm leading-relaxed text-emerald-100 sm:text-base">
            <Ar className="text-base text-amber-200">دَارُ سِيبَوَيْهِ</Ar> — the House of Sībawayh — is named after the imam of Arabic grammar, whose{" "}
            <em>al-Kitāb</em> has been the foundation of naḥw for more than twelve centuries. Our hope is to carry a little of that tradition forward: to
            make learning Arabic — its words, its grammar, and the Qur&apos;an itself — clear, practical and within everyone&apos;s reach.
          </p>
        </div>
      </header>

      <section className="space-y-3">
        <h2 className="flex items-baseline gap-3 text-xl font-bold">
          What we&apos;re aiming for <Ar className="text-base font-normal text-muted">غَايَاتُنَا</Ar>
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {AIMS.map((a) => (
            <div key={a.title} className={`rounded-2xl border p-5 shadow-sm ${a.tint}`}>
              <p className="font-arabic text-2xl font-bold text-foreground" lang="ar" dir="rtl">
                {a.titleAr}
              </p>
              <h3 className="mb-1 font-semibold text-foreground">{a.title}</h3>
              <p className="text-sm leading-relaxed text-muted">{a.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={`${CARD} space-y-4 border-amber-200 bg-amber-50 dark:border-amber-800/40 dark:bg-parchment-800/80`}>
        <h2 className="flex items-baseline gap-3 text-xl font-bold text-amber-900 dark:text-amber-200">
          A ṣadaqah jāriyah <Ar className="text-lg font-normal">صَدَقَةٌ جَارِيَةٌ</Ar>
        </h2>
        <p className="text-sm leading-relaxed text-foreground">
          This platform is offered freely, as ṣadaqah — and with the hope that it becomes a <strong>ṣadaqah jāriyah</strong>, a charity whose reward
          continues for as long as people benefit from it. The Prophet ﷺ said:
        </p>
        <figure className="rounded-xl border border-amber-200 bg-white/70 p-4 text-center dark:border-amber-800/40 dark:bg-black/20">
          <blockquote dir="rtl" lang="ar" className="font-arabic text-xl leading-loose text-emerald-900 dark:text-amber-200">
            إِذَا مَاتَ الإِنْسَانُ انْقَطَعَ عَنْهُ عَمَلُهُ إِلَّا مِنْ ثَلَاثَةٍ: إِلَّا مِنْ صَدَقَةٍ جَارِيَةٍ، أَوْ عِلْمٍ يُنْتَفَعُ بِهِ، أَوْ وَلَدٍ صَالِحٍ يَدْعُو لَهُ
          </blockquote>
          <figcaption className="mt-2 text-xs text-muted">
            “When a person dies, their deeds come to an end except for three: an ongoing charity, knowledge that is benefited from, or a righteous child
            who prays for them.” — Ṣaḥīḥ Muslim (1631)
          </figcaption>
        </figure>
        <div className="space-y-2 text-sm leading-relaxed text-foreground">
          <p>
            <strong>So please use it — and use it as much as you can.</strong> Review your words, analyse sentences, read with it, test yourself, and
            share it with anyone it could help: a student, a teacher, a friend, your family. Every person who learns through it adds to the good.
          </p>
          <p>
            <strong>And please remember us in your du&apos;ā&apos;</strong> — the one who built it, their parents and family, and everyone who helped
            along the way: that Allah accepts it, forgives our shortcomings, and makes it a light for us in this life and the next.
          </p>
        </div>
      </section>

      <section className={`${CARD} space-y-3`}>
        <h2 className="text-xl font-bold">How you can help</h2>
        <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-foreground">
          <li>Use it regularly — even ten minutes a day of vocabulary review makes a difference.</li>
          <li>Share it with others who are learning Arabic.</li>
          <li>
            Tell us when something is wrong or confusing — especially an i&apos;rab you disagree with. See{" "}
            <Link href="/guide#feedback" className="font-medium text-brand hover:underline">
              how to send feedback
            </Link>
            .
          </li>
          <li>Make du&apos;ā&apos; for everyone who benefits from it, and for those who made it.</li>
        </ul>
        <div className="flex flex-wrap gap-3 pt-2">
          <Link href="/guide" className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-brand-contrast shadow-sm transition hover:opacity-90">
            How to use the platform
          </Link>
          <Link href="/" className="rounded-xl border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition hover:border-brand/40">
            Start learning
          </Link>
        </div>
      </section>

      {/* Closing supplication — from al-Manẓūmah al-Shubrāwiyyah. */}
      <figure className="relative overflow-hidden rounded-2xl border border-emerald-700/40 bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 px-6 py-8 text-center text-white shadow-xl">
        <blockquote dir="rtl" lang="ar" className="font-arabic text-2xl leading-loose text-amber-200 sm:text-3xl">
          <div className="grid gap-x-10 sm:grid-cols-2">
            <span>يَا رَبِّ عَفْوًا عَنِ الجَانِي المُسِيءِ فَقَدْ</span>
            <span>ضَاقَتْ عَلَيْهِ بِطَاحُ السَّهْلِ وَالجَبَلِ</span>
          </div>
        </blockquote>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-emerald-100">
          “O my Lord, pardon the wrongdoer who has erred — for the wide plains and the mountains have become narrow for him.”
        </p>
        <figcaption className="mt-3 text-xs text-emerald-200/80">
          From <Ar className="text-sm text-emerald-100">المَنْظُومَةُ الشُّبْرَاوِيَّةُ</Ar> (al-Shubrāwiyyah)
        </figcaption>
      </figure>
    </div>
  );
}
