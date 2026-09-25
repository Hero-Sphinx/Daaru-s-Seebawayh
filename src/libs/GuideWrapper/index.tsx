import Link from "next/link";
import type { ComponentType, ReactNode } from "react";
import { BookIcon, DiagramIcon, type IconProps, LightbulbIcon, MushafIcon, QuizIcon, ScrollIcon } from "@/components";

const CARD = "rounded-2xl border border-border bg-surface p-5 shadow-sm";

const FEEDBACK_EMAIL = "daarusseebawayh@gmail.com";
// Opens the tester's mail app with the subject and a short outline filled in.
const FEEDBACK_MAILTO = `mailto:${FEEDBACK_EMAIL}?subject=${encodeURIComponent("Daaru-s-Seebawayh feedback")}&body=${encodeURIComponent(
  "Assalamu 'alaykum,\n\nWhat I was doing:\n\nWhat happened (please attach a screenshot):\n\nThe sentence I typed (if any):\n"
)}`;

function Section({ id, title, titleAr, children }: { id: string; title: string; titleAr?: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-28 space-y-3">
      <h2 className="flex items-baseline gap-3 text-xl font-bold text-foreground">
        {title}
        {titleAr && (
          <span className="font-arabic text-base font-normal text-muted" lang="ar">
            {titleAr}
          </span>
        )}
      </h2>
      {children}
    </section>
  );
}

function Feature({
  icon: Icon,
  tint,
  title,
  titleAr,
  href,
  steps,
  children,
}: {
  icon: ComponentType<IconProps>;
  tint: string;
  title: string;
  titleAr: string;
  href: string;
  steps: ReactNode[];
  children: ReactNode;
}) {
  return (
    <div className={CARD}>
      <div className="mb-3 flex items-center gap-3">
        <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${tint}`}>
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <h3 className="font-semibold text-foreground">{title}</h3>
          <span className="font-arabic text-sm text-muted" lang="ar">
            {titleAr}
          </span>
        </div>
        <Link href={href} className="ml-auto text-xs font-medium text-brand hover:underline">
          Open →
        </Link>
      </div>
      <p className="mb-3 text-sm leading-relaxed text-muted">{children}</p>
      <ol className="list-decimal space-y-1.5 pl-5 text-sm leading-relaxed text-foreground marker:text-muted">
        {steps.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ol>
    </div>
  );
}

function Ar({ children }: { children: ReactNode }) {
  return (
    <span className="font-arabic text-base" lang="ar" dir="rtl">
      {children}
    </span>
  );
}

const KEYS: [string, string, string][] = [
  ["Fatha", "َ", "Shift + Q"],
  ["Damma", "ُ", "Shift + E"],
  ["Kasra", "ِ", "Shift + A"],
  ["Sukun", "ْ", "Shift + X"],
  ["Shadda", "ّ", "Shift + ~ (the ذ key)"],
  ["Tanween fath", "ً", "Shift + W"],
  ["Tanween damm", "ٌ", "Shift + R"],
  ["Tanween kasr", "ٍ", "Shift + S"],
];

export default function GuideWrapper({ signedIn }: { signedIn: boolean }) {

  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <header className="relative overflow-hidden rounded-2xl border border-emerald-700/40 bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 p-6 text-white shadow-xl md:p-8">
        <span aria-hidden className="site-chrome pointer-events-none absolute -bottom-8 -right-4 select-none text-[130px] font-bold leading-none text-amber-300 opacity-10 sm:text-[180px]">
          <span className="font-arabic">تَعَلَّمْ</span>
        </span>
        <div className="relative z-10 max-w-2xl">
          <span className="mb-3 inline-block rounded-full border border-amber-400/30 bg-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-300">
            How to use · <span className="font-arabic text-sm">دَلِيلُ الاسْتِخْدَامِ</span>
          </span>
          <h1 className="mb-2 text-2xl font-bold tracking-tight sm:text-3xl">Learn Arabic grammar by doing it.</h1>
          <p className="text-sm leading-relaxed text-emerald-100 sm:text-base">
            Daaru-s-Seebawayh is a place to build your vocabulary, practise <Ar>إِعْرَاب</Ar>, read the Qur&apos;an word by word, study your own books, and test
            yourself. This page explains each part in a few minutes.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href={signedIn ? "/" : "/signup"} className="rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-emerald-950 shadow-lg transition hover:bg-amber-400">
              {signedIn ? "Go to the dashboard" : "Create an account"}
            </Link>
            <Link href="/vision" className="rounded-xl border border-emerald-600 bg-emerald-950/40 px-5 py-2.5 text-sm font-medium text-emerald-50 transition hover:bg-emerald-700">
              Our vision
            </Link>
            {!signedIn && (
              <Link href="/login" className="rounded-xl border border-emerald-600 bg-emerald-950/40 px-5 py-2.5 text-sm font-medium text-emerald-50 transition hover:bg-emerald-700">
                Sign in
              </Link>
            )}
          </div>
        </div>
      </header>

      <nav aria-label="On this page" className="flex flex-wrap gap-2 text-sm">
        {[
          ["start", "Getting started"],
          ["features", "The five sections"],
          ["tashkeel", "Typing harakat"],
          ["irab", "How the i'rab checker thinks"],
          ["ai", "Where AI is used"],
          ["privacy", "Your data"],
          ["feedback", "Feedback"],
        ].map(([id, label]) => (
          <a key={id} href={`#${id}`} className="rounded-full border border-border bg-surface px-3 py-1 text-muted transition hover:border-brand/40 hover:text-foreground">
            {label}
          </a>
        ))}
      </nav>

      <Section id="start" title="Getting started" titleAr="البِدَايَةُ">
        <div className={`${CARD} space-y-2 text-sm leading-relaxed text-foreground`}>
          <p>
            <strong>1. Create an account</strong> with your email and a password (8+ characters). Everything you add — words, reviews, books, notes — is
            private to you.
          </p>
          <p>
            <strong>2. Make the Arabic comfortable to read.</strong> The <span className="rounded border border-border px-1.5 font-arabic">ع− / ع+</span>{" "}
            buttons at the top make all Arabic text smaller or larger; the sun/moon button switches light and dark mode. Both are remembered.
          </p>
          <p>
            <strong>3. Start from the dashboard.</strong> It shows how many flashcards are due today, your progress, and a line of wisdom — a verse of
            naḥw or poetry, with who said it — that changes every day.
          </p>
        </div>
      </Section>

      <Section id="features" title="The five sections" titleAr="الأَقْسَامُ">
        <div className="grid gap-4 md:grid-cols-2">
          <Feature
            icon={BookIcon}
            tint="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300"
            title="Vocabulary"
            titleAr="المُفْرَدَات"
            href="/vocabulary"
            steps={[
              "Add a word — type it in Arabic (or roughly in English letters) and press Auto-fill to get its root, meaning and part of speech.",
              "Review your cards when they're due: flip, then say how well you remembered.",
              "The app spaces the reviews out — words you know come back less often, hard ones sooner.",
            ]}
          >
            Your own word bank, reviewed with spaced repetition so words stay in long-term memory.
          </Feature>
          <Feature
            icon={DiagramIcon}
            tint="bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300"
            title="I'rab"
            titleAr="الإِعْرَاب"
            href="/irab"
            steps={[
              <>
                <strong>Curated examples</strong>: tap any word to see its role, case and sign, and the sentence&apos;s tree.
              </>,
              <>
                <strong>Type your own sentence</strong> — fully vowelled (see <a href="#tashkeel" className="text-brand hover:underline">typing harakat</a>) —
                and press Parse. Each word gets its full i&apos;rab, the way the books say it.
              </>,
              <>
                <strong>Build it yourself</strong>: you give the role of each word, and the app checks your answers.
              </>,
            ]}
          >
            Break sentences into their grammar: every word&apos;s role, case and sign, e.g.{" "}
            <Ar>فاعل مرفوع وعلامة رفعه الضمة الظاهرة على آخره</Ar>.
          </Feature>
          <Feature
            icon={MushafIcon}
            tint="bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300"
            title="Qur'an"
            titleAr="القُرْآن"
            href="/quran"
            steps={[
              "Choose a surah.",
              "Tap any word for its root, form and grammar from the Quranic Arabic Corpus, and to hear it recited.",
              "Tap a root to see where else it appears.",
            ]}
          >
            Read the Qur&apos;an word by word, with morphology and recitation.
          </Feature>
          <Feature
            icon={ScrollIcon}
            tint="bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300"
            title="Library"
            titleAr="المَكْتَبَة"
            href="/library"
            steps={[
              "Upload a PDF or text of a book or lesson. Scanned PDFs are read page by page in the background — you can keep using the app.",
              "Tap any word for its root and grammar; press “Show meaning” if you want an English meaning.",
              "Search your library by root, highlight passages and add notes, share a book with a friend, or generate a summary and benefits (فوائد).",
            ]}
          >
            Study your own texts with the same tools.
          </Feature>
          <Feature
            icon={QuizIcon}
            tint="bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300"
            title="Quizzes"
            titleAr="الاخْتِبَارَات"
            href="/quizzes"
            steps={[
              "Pick “My vocabulary” to be tested only on the words you've added — or “Vocabulary + ṣarf” to enrich them with roots, verb forms and tenses from the Qur'an.",
              "Or practise i'rab, ṣarf, a mix, or sentence meanings. Questions come from your words, the Quranic Arabic Corpus and checked examples.",
              "Your accuracy for the last 7 days shows on the dashboard.",
            ]}
          >
            Test yourself as often as you like.
          </Feature>
          <div className={`${CARD} flex gap-3 border-amber-200 bg-amber-50 dark:border-amber-800/40 dark:bg-parchment-800/80`}>
            <LightbulbIcon className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <p className="text-sm leading-relaxed text-foreground">
              <strong>Tip:</strong> the I&apos;rab section has a <em>cheat sheet</em> of the rules (cases, signs, the five nouns, kana and inna&apos;s sisters…)
              you can open any time.
            </p>
          </div>
        </div>
      </Section>

      <Section id="tashkeel" title="Typing harakat" titleAr="كِتَابَةُ الحَرَكَاتِ">
        <div className={`${CARD} space-y-4 text-sm leading-relaxed text-foreground`}>
          <p>
            The i&apos;rab checker needs <strong>full tashkeel</strong> — especially the <strong>last letter of every word</strong>, because that&apos;s
            where the case is. Without it a sentence is genuinely ambiguous, and the app will say so rather than guess.
          </p>
          <div>
            <p className="mb-2 font-medium">On a Windows computer (Arabic keyboard), hold Shift:</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {KEYS.map(([name, mark, keys]) => (
                <div key={name} className="rounded-lg border border-border bg-background px-3 py-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted">{name}</span>
                    <span className="font-arabic text-2xl leading-none" lang="ar">
                      ب{mark}
                    </span>
                  </div>
                  <div className="mt-1 text-xs font-medium">{keys}</div>
                </div>
              ))}
            </div>
          </div>
          <p>
            <strong>On a phone</strong>, most Arabic keyboards show the harakat when you press and hold a letter or on the symbols page. You can also
            copy a vowelled sentence from anywhere and paste it in.
          </p>
          <p className="text-muted">
            Example to try: <Ar>قَرَأَ الطَّالِبُ الكِتَابَ وَفَهِمَهُ</Ar>
          </p>
        </div>
      </Section>

      <Section id="irab" title="How the i'rab checker thinks" titleAr="كَيْفَ يُعْرِبُ">
        <div className={`${CARD} space-y-2 text-sm leading-relaxed text-foreground`}>
          <p>
            The grammar is worked out by <strong>fixed rules</strong> from the classical books — not by AI — using a morphological dictionary of Arabic.
            It follows the ending you typed: if you write <Ar>الطَّالِبَ</Ar> where a subject should be, it won&apos;t pretend it&apos;s marfū&apos;.
          </p>
          <p>It covers the sentences of a typical naḥw course:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>verbal and nominal sentences, kāna and inna with their sisters, lā of the genus, negation;</li>
            <li>idāfa, na&apos;t, &apos;aṭf, badal, relative clauses (الذي، التي…), joined sentences;</li>
            <li>ḥāl, tamyīz, maf&apos;ūl muṭlaq, ẓarf, two-object verbs, conditionals (إنْ، مَنْ، إذا), أنْ + verb;</li>
            <li>weak words, the five nouns, sound plurals and duals, diptotes, and التقاء الساكنين.</li>
          </ul>
          <p>
            When a sentence could honestly be read two ways, or uses something it doesn&apos;t cover yet (the vocative يا, questions with أين/مَن,
            exclamation…), it <strong>tells you which word it couldn&apos;t place and why</strong> instead of giving a wrong answer. If you ever see an
            analysis you think is wrong, that&apos;s exactly the feedback we want.
          </p>
        </div>
      </Section>

      <Section id="ai" title="Where AI is used" titleAr="الذَّكَاءُ الاصْطِنَاعِيُّ">
        <div className={`${CARD} space-y-2 text-sm leading-relaxed text-foreground`}>
          <p>
            <strong>Never for grammar.</strong> Roots, morphology and i&apos;rab always come from the rules and the dictionary.
          </p>
          <p>An AI model (Google Gemini) is used only for things that aren&apos;t grammar claims, and they&apos;re always marked “AI-suggested”:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>the English translation under a sentence you type in the I&apos;rab section;</li>
            <li>a word&apos;s English meaning — only when you press “Show meaning” or Auto-fill;</li>
            <li>reading the text of scanned PDF pages, and book summaries / benefits / comprehension questions when you ask for them.</li>
          </ul>
          <p className="text-muted">
            The AI service has a daily limit. If a meaning or summary doesn&apos;t come back, try again later — everything else keeps working.
          </p>
        </div>
      </Section>

      <Section id="privacy" title="Your data" titleAr="بَيَانَاتُكَ">
        <div className={`${CARD} space-y-2 text-sm leading-relaxed text-foreground`}>
          <p>Your words, reviews, quiz results, books and notes are stored in the app&apos;s database and are visible only to you — and to anyone you choose to share a book with.</p>
          <p>
            Passwords are stored only as secure hashes. Pages of a scanned PDF, and text you ask to summarise or translate, are sent to Google&apos;s Gemini
            service to do that job. Please don&apos;t upload anything private you wouldn&apos;t want processed that way.
          </p>
          <p className="text-muted">This is an early test version — please keep your own copy of anything important.</p>
        </div>
      </Section>

      <Section id="feedback" title="Feedback" titleAr="مُلَاحَظَاتُكَ">
        <div className={`${CARD} border-emerald-200 bg-emerald-50 text-sm leading-relaxed text-foreground dark:border-emerald-900/50 dark:bg-emerald-950/30`}>
          <p>
            Found something confusing, broken, or an i&apos;rab you disagree with? Email{" "}
            <a href={FEEDBACK_MAILTO} className="font-semibold text-emerald-700 underline decoration-emerald-400 underline-offset-2 hover:text-emerald-900 dark:text-emerald-300 dark:hover:text-emerald-200">
              {FEEDBACK_EMAIL}
            </a>{" "}
            — with a screenshot and the sentence you typed. <Ar>جَزَاكُمُ اللهُ خَيْرًا</Ar>
          </p>
          <a
            href={FEEDBACK_MAILTO}
            className="mt-3 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600"
          >
            Send feedback by email
          </a>
        </div>
      </Section>
    </div>
  );
}
