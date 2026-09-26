# Daaru-s-Seebawayh Li Ta'leemi Al-Lughatil 'Arabiyyati wal Islaamiyyati (دَارُ سِيبَوَيْهِ)

An Arabic learning and I'rab (grammatical analysis) platform with a firm
line between two kinds of content:

- **Grammar/morphology claims** (case endings, syntactic roles, root/lemma)
  are always deterministic — backed by a verified rule engine, CAMeL Tools,
  or the Quranic Arabic Corpus's morphology data (root/lemma/POS fallback
  for classical/Quranic words CAMeL's MSA-only database has no coverage
  for — see `src/server/services/irab/quranicCorpus.ts` and
  [data/quranic-corpus/NOTICE.md](data/quranic-corpus/NOTICE.md) for
  provenance/license; note this is *morphology only* — the corpus's
  syntactic dependency treebank isn't available as clean bulk data, so
  role/case assignment always comes from this app's own rule-based parser,
  never from that corpus) — **never** an LLM. A wrong grammar claim stated
  confidently is worse than no answer, so this is non-negotiable; see the
  curated sentence bank in
  [src/constants/data/sampleSentences.ts](src/constants/data/sampleSentences.ts) and the
  rule-based free-text parser (`src/helpers/irab/freeTextParser.ts`) for what
  "verified" means here.
- **Everything else that has no deterministic alternative** uses an LLM
  (Gemini) and is visibly labeled "AI-generated"/"AI-suggested" in the UI,
  distinct from "verified" grammar content:
  - Library chapter summaries and Fawā'id extraction (inherently generative
    — there's no rule that "summarizes").
  - Book comprehension quiz questions (needs actual reading comprehension).
  - OCR of scanned/image-only PDF pages that have no embedded text layer at
    all (`src/server/services/library/extractPdf.ts`) — transcription, not a
    grammatical claim; labeled in the reader UI and tagged
    `extraction_source: 'ocr'` in the DB, distinct from directly-extracted
    text.
  - Vocabulary word **meaning** and **transliteration**, and resolving a
    transliteration guess (e.g. "kitab") to an Arabic spelling when the user
    doesn't know the script (`src/server/services/vocabulary/lookupPrompt.ts`) — a dictionary-
    lookup/spelling task, not a grammatical claim. The word's **root/lemma/
    POS stay CAMeL-only**, even in this same lookup call — see that file's
    header comment for the line being drawn.

## Tech stack

| Layer            | Choice                                          | Why |
|-------------------|--------------------------------------------------|-----|
| Frontend          | Next.js 16 (App Router) + React 19 + TypeScript | Server components for data-heavy pages (reader, dashboard), client components only where interactive (I'rab workspace, SRS practice) |
| Styling           | Tailwind CSS v4                                  | RTL utilities, dark mode, fast iteration on data-dense UI |
| Database          | PostgreSQL (Neon) via Prisma 7 (`@prisma/adapter-pg`) | Relational integrity for the token/dependency graph; schema lives in [db/schema.sql](db/schema.sql) (source of truth), `prisma/schema.prisma` is introspected from it, not hand-written |
| NLP (Quranic vocab)| [Quranic Arabic Corpus](https://corpus.quran.com) morphology (bulk import) | Root/lemma/POS fallback for classical/Quranic words CAMeL Tools' MSA-only DB misses — static, bundled data, no runtime service. Attribution required by its license; see `data/quranic-corpus/NOTICE.md` |
| NLP (general text)| CAMeL Tools (self-hosted)                        | Root/lemma/POS enrichment — deterministic, no API key. Farasa was the original plan but requires an external API key; CAMeL Tools needs neither an account nor a network call |
| Free-text I'rab   | Hand-written rule-based parser + CAMeL Tools     | Deterministic but limited coverage (verb-subject-object, mubtada'-khabar, each with an optional trailing preposition phrase, and any nominal slot optionally followed by agreeing adjectives/na't); reports "can't determine" rather than guessing outside its coverage — see `src/helpers/irab/freeTextParser.ts` |
| PDF extraction    | [unpdf](https://github.com/unjs/unpdf)           | Pure JS (no native deps), works in serverless runtimes. Always NFKC-normalized — see `src/server/services/library/extractPdf.ts` for why that's not optional. A page with no embedded text layer (scanned/image-only) falls back to Gemini's native PDF understanding (sends the raw file, not a per-page rendered image — Gemini supports up to 50MB/1000 pages this way) to transcribe just those page numbers, batched (not one request per page); transcription, not a grammar claim, same policy as summaries. OCR'd text is labeled in the UI and tagged `extraction_source: 'ocr'` in the DB |
| Summarization     | Gemini API                                       | Chapter summaries / Fawā'id extraction only — see the policy note above |

## Project structure

Pages stay thin: each `app/**/page.tsx` loads its data through a server service
and renders one `@/libs/<Name>Wrapper`. Everything else is imported through the
top-level barrels (`@/components`, `@/layouts`, `@/libs`, `@/hooks`,
`@/constants`, `@/helpers`, `@/types`, `@/server/lib`, `@/server/services`,
`@/server/constants`, `@/server/databases`, `@/server/helpers`). Validators and
server actions are imported by their full path; files inside the same area
import each other relatively.

```
src/
  app/                        Routes only. page.tsx = auth check + service call + <XWrapper />
    page.tsx                    Dashboard
    (auth)/                     login, signup, forgot-password, reset-password
    library/, library/[id]/, library/[id]/quiz/
    irab/, vocabulary/, quizzes/, quran/, quran/[chapter]/, guide/, vision/, settings/
    api/<domain>/               Route handlers: withAuth() + zod validator (when there is input) + service
    error.tsx, not-found.tsx, loading.tsx
  proxy.ts                    Optimistic auth gate (cookie present?), Next 16's renamed middleware
  libs/                       One folder per page: <Name>Wrapper/index.tsx plus a
                                components/ subfolder (with an index.ts barrel) for the
                                pieces only that page uses, e.g.
    IrabWrapper/                IrabWorkspace, FreeTextIrabInput, IrabCheatSheet, IrabReconstruction
    VocabularyWrapper/          VocabularyManager (add, bulk/CSV import, CAMeL "Auto-fill"),
                                VocabularyPractice (SM-2 / Leitner flip cards)
    LibraryDocumentWrapper/     Reader with click-a-word morphology, share panel, and the
                                summary panel (always shows the "AI-generated, unverified" badge)
    BookQuizWrapper/            Book quiz setup/generation, plays through the shared QuizPlayer
    shared/                     AuthForm and the password reset forms, used by several wrappers
  layouts/                    Navbar (nav, dark mode, Arabic font size), Footer, PageBanner,
                                StatusPage (404 / error screens)
  components/                 Shared UI: QuizPlayer (used by the Quiz Center and book quizzes),
                                Icons (local inline-SVG set, no icon-font CDN), MobileSheet,
                                ProcessingRefresher
  hooks/                      useKeyboardShortcuts, Audio/useListen, Library/useWordLookup
  constants/                  Client-safe constants: fetcher, safeRedirect, theme cookies,
                                password policy, and data/ (grammaticalRoles.ts and wazn.ts are
                                the single source of truth shared with prisma/seed.ts;
                                sampleSentences.ts, wisdom.ts)
  helpers/                    Pure logic, all unit-tested, no DB or network:
    srs/                        sm2.ts, leitner.ts
    irab/                       Free-text I'rab parser (tokenize, normalize, classify, particles,
                                freeTextParser, grammar, caseEnding, reconstruction...);
                                see ROADMAP.md's dedicated section
    quiz/                       primitives, templates + templateTypes + templateEngine,
                                distractors, answerLabels, generate (curated banks),
                                bookGenerate (Fawa'id-recall and I'rab-excerpt subtypes)
    quran/                      buckwalter (extended Buckwalter -> Arabic), corpusParser,
                                chapters, tagset, lemmaMatch, audio
    arabic/, audio/, library/, vocabulary.ts, time.ts (Date wrappers kept out of
                                component bodies for react-hooks/purity)
  types/<domain>/             Shared TypeScript types (irab mirrors the token/edge schema)
  server/                     Server-only code
    lib/                        auth (DB-backed sessions, getCurrentUserId), handler (withAuth,
                                json, readJson, error mapping), password (scrypt via
                                node:crypto), rateLimit, email
    constants/errors/           Typed API errors
    databases/db.ts             Prisma Client singleton (@prisma/adapter-pg)
    helpers/                    camelClient (CAMeL Tools service), geminiClient (REST client
                                with 429/503 retry-with-backoff; summaries, Fawa'id and
                                comprehension only, see the AI usage policy above)
    services/<domain>/          Data access and business logic per domain (library, quiz,
                                vocabulary, irab, quran, srs, speech, auth, dashboard,
                                settings), including each page's get<Page>Page() loader.
                                library/ holds extractPdf (NFKC normalization), summarize,
                                quizComprehension (the one Gemini quiz subtype), rootSearch,
                                access (the single document-permission check)
    validators/<domain>/validate.ts   zod schemas for route bodies and queries
    actions/                    Server actions (auth.ts, settings.ts)
  styles/globals.css          Theme tokens (--brand, --accent...) and Tailwind layers
  generated/prisma/           Generated Prisma Client (do not edit)
tests/                        Mirrors src/: tests/helpers, tests/server, tests/constants,
                                plus fixtures/ and stubs/ (server-only)
db/schema.sql                 Full PostgreSQL schema, the source of truth; prisma/schema.prisma
                                is introspected from it, never hand-edited
db/migrations/                Idempotent upgrade scripts for databases created before a change
prisma/
  schema.prisma                 Introspected from db/schema.sql (`prisma db pull`)
  seed.ts                       Idempotent: grammatical_roles/case_signs/quiz_templates
scripts/
  import-quran.ts               `npm run quran:import`: corpus -> DB, one transaction, idempotent
  set-password.ts               `npm run user:set-password`: admin password reset
services/
  camel/                        Self-hosted FastAPI + CAMeL Tools service (FR-4.2 enrichment);
                                separate Python venv, run independently, see services/camel/README.md
ROADMAP.md                    Phased implementation plan
```

## Getting started

```bash
npm install
npm run dev       # http://localhost:3000
npm test          # unit tests
npm run build     # production build + type check
```

To connect a real database (any Postgres ≥ 15 works — Neon/Supabase/Railway or local):

```bash
cp .env.example .env        # then set DATABASE_URL to your connection string
npx prisma db execute --file db/schema.sql
npx prisma db pull && npx prisma generate
npx prisma db seed          # lookup tables + quiz templates — required before the app will run
npm run quran:import        # Qur'an corpus -> chapters/verses/roots/lemmas/tokens (~15s, idempotent)
```

**Upgrading an existing database** (created before these tables/columns
existed): apply the numbered files in `db/migrations/` in order with
`npx prisma db execute --file db/migrations/<file>.sql` — each is
idempotent — then `db pull` → `generate` → `db seed` → `quran:import` as
above. `db/schema.sql` already includes everything they add. (There are seven: `001` sessions → `007` auth hardening — login rate limiting and password-reset tokens.)

**Accounts.** Sign up at `/signup`; every page and API route requires a
session (see `src/server/lib/auth.ts` and `src/proxy.ts`). Data created before
auth existed belongs to the legacy `dev@al-lisan.local` user — claim it
by giving that account a real password (and optionally your email):

```bash
npm run user:set-password -- dev@al-lisan.local "your-password" you@example.com
```

Sign-in is rate limited (5 failed attempts per account and 20 per IP in 15
minutes; `src/server/lib/rateLimit.ts`). **Forgot password** (`/forgot-password`)
emails a single-use, one-hour reset link — through any SMTP account
(`SMTP_USER` + `SMTP_PASS`; a Gmail App Password works, free, no domain
needed) or Resend (`RESEND_API_KEY` + `EMAIL_FROM`). In development without
either, the link is printed to the `npm run dev` console; in production the
login page hides "Forgot password?" and tells users to ask whoever invited
them (reset with `npm run user:set-password`). A **How to use** page for
testers is at `/guide` — public, linked from the header and the sign-in form.

After changing `db/schema.sql`, re-run the `db execute`
→ `db pull` → `generate` sequence above to keep `prisma/schema.prisma` in
sync; it's generated, not hand-edited. **If `npm run dev` was already
running** when you do this, restart it with a fresh Turbopack cache
(`rm -rf .next/dev` first) — confirmed live that a running dev server can
keep using a stale cached copy of the old generated client and throw
"Unknown argument" on the new columns otherwise.

Several features need the CAMeL Tools service — the vocabulary form's
"Auto-fill" button (FR-4.2), the I'rab Workspace's "Type your own sentence"
mode, the Library reader's click-a-word lookups (FR-2.4), and book I'rab
quizzes. Run it separately; it's not started by `npm run dev`:

```bash
cd services/camel && ./.venv/Scripts/uvicorn.exe app:app --port 8001
```

See [services/camel/README.md](services/camel/README.md) for first-time setup.

For the Library's "Generate summary & Fawā'id" button (FR-2.2/2.3), set
`GEMINI_API_KEY` in `.env` (get one at
[aistudio.google.com/apikey](https://aistudio.google.com/apikey)). Without
it, that one button returns a clear error — nothing else depends on it.
Word meanings in the Library reader are also Gemini-suggested, but only
fetched when the learner presses "Show meaning" — reading a page doesn't
spend the daily quota.

**I'rab accuracy.** `npm run irab:accuracy` scores the parser against 186
gold textbook sentences (correct / declined / wrong — see ROADMAP.md);
`npm run irab:record-fixtures` re-records the CAMeL analyses the tests use
(needs the CAMeL service; set `CAMEL_SERVICE_URL` if it isn't on 8001).
`npx tsx scripts/irab-debug.ts "<sentence>"` prints any recorded sentence's
full analysis.

## Deployment

Two pieces, plus a database:

1. **Postgres** — Neon/Supabase/Railway. Create it, set `DATABASE_URL`, and
   run the database steps under *Getting started* once against it.
2. **CAMeL service** — a container: `services/camel/Dockerfile` bakes in the
   morphology database, listens on `$PORT` (default 8001) and has a
   `/health` check (it needs ~400 MB of memory). On **Render**: New → Web
   Service → this repo, root directory `services/camel`, runtime Docker,
   health check path `/health`. The free instance sleeps after 15 idle
   minutes (first request then takes ~1 min); a free pinger such as
   cron-job.org calling `/health` every 10 minutes keeps it awake.
3. **The web app** — Vercel (or any Node host running `npm run build` and
   `npm start`; `postinstall` generates the Prisma client). Environment:
   `DATABASE_URL`, `CAMEL_SERVICE_URL` (the service's URL), `APP_URL` (the
   app's own public URL, for reset links), `SMTP_USER` + `SMTP_PASS` (+
   `EMAIL_FROM`) for password resets, and optionally `GEMINI_API_KEY` /
   `GEMINI_MODEL`.

The CAMeL service has no authentication of its own and only exposes a
read-only analyzer, so a public URL is acceptable; to keep it private, run
it on the same private network as the web app (e.g. Railway's internal
networking) and use the internal URL.

## Design system

A restrained, print-inspired palette — warm paper and ink, one deep green
for identity and actions, a muted gold used sparingly — with Amiri for
Arabic. Tokens (`--background`, `--surface`, `--border`, `--muted`,
`--brand`, `--accent`) are CSS custom properties in `src/styles/globals.css`
(`@theme inline`, Tailwind v4's CSS-first config), redefined under `.dark`.
Theme and Arabic text size are cookie-backed and read by the server layout,
so the first render is already right (no flash). The ع−/ع+ control scales
**every** Arabic element — words, chips, inputs, the reader — through the
`--arabic-scale` variable, which `.font-arabic` applies with CSS `zoom` (so
padding scales with the text); the header, footer and dependency-tree SVG
keep a fixed size. The dashboard's *Wisdom of the day*
(`src/constants/data/wisdom.ts`) rotates daily through naḥw verse (Ibn Mālik,
al-ʿImrīṭī), classical poetry and sayings on knowledge and Arabic, each with
its author, source and an English meaning; traditional-but-uncertain
attributions are labelled as such.

## UI/UX blueprint

### Dashboard (`/`)

```
┌────────────────────────────────────────────────────────────┐
│ دَارُ سِيبَوَيْهِ   Dashboard   Library   I'rab Workspace   Vocabulary │
├────────────────────────────────────────────────────────────┤
│ Welcome back                                                │
│ Here's where you left off.                                  │
│                                                              │
│ ┌─────────────┐ ┌─────────────────┐ ┌────────────────────┐ │
│ │ Cards due   │ │ Documents in     │ │ Quiz accuracy (7d) │ │
│ │ today: 12   │ │ library: 4       │ │ 82%                │ │
│ └─────────────┘ └─────────────────┘ └────────────────────┘ │
│                                                              │
│ ┌─────────────────────────┐ ┌─────────────────────────────┐ │
│ │ Continue learning        │ │ Library                     │ │
│ │ 12 cards due → Review    │ │ • Riyad as-Salihin  done    │ │
│ │                          │ │ • Al-Ajurrumiyyah   done    │ │
│ │                          │ │ • Fiqh al-Sunnah    ⋯       │ │
│ └─────────────────────────┘ └─────────────────────────────┘ │
│                                                              │
│ ┌──────────────────────────────────────────────────────────┐│
│ │ Recent Fawā'id                                            ││
│ │ [balaghah] الالتفات في سورة يوسف                          ││
│ │ [vocabulary] غَاسِق — encroaching darkness                 ││
│ └──────────────────────────────────────────────────────────┘│
└────────────────────────────────────────────────────────────┘
```

### Library reader (`/library/[id]`)

```
┌──────────────────────────────────────────┬─────────────────┐
│ ← Back to library                         │ الدَرْس          │
│ Test Arabic Book                          │ root: د ر س     │
│ ┌────────────────────────────────────────┐│ lemma: دَرْس     │
│ │  Page 1 of 2          [Prev] [Next]     ││ pos: noun       │
│ │  كتب الطالب الدرس                         │└─────────────────┘
│ │  العلم نور                                │
│ │  (each word is clickable)                │
│ └────────────────────────────────────────┘│
├──────────────────────────────────────────┴─────────────────┤
│ Summary  [Generate summary & Fawā'id (Gemini)]               │
│ Fawā'id  (populated once generated, each AI-generated badged)│
└───────────────────────────────────────────────────────────┘
```

Clicking a word shows its root/lemma/POS via the same CAMeL Tools lookup
vocabulary enrichment uses — real, functional, but morphology only, not
full syntactic I'rab. Extracted book text is mostly undiacritized (see
ROADMAP.md's Phase 3), and the free-text I'rab parser needs full tashkeel
to assign a syntactic role, so it isn't run automatically on book text; use
the I'rab Workspace's "Type your own sentence" mode for that directly.

### I'rab Workspace (`/irab`)

```
┌────────────────────────────────────────────────────────────┐
│ Al-Ajurrumiyyah — worked example                            │
│                                                              │
│   [الدَّرْسَ]      [الطَّالِبُ]      [كَتَبَ]                     │
│   mansub·purple  marfu'·green   verb·blue      (RTL order)  │
│                                                              │
│ ┌───────────┐ ┌───────────┐ ┌───────────┐                   │
│ │ الدَّرْسَ    │ │ الطَّالِبُ   │ │ كَتَبَ      │  ← expandable  │
│ │ Root: درس  │ │ Root: طلب  │ │ Root: كتب  │    token cards │
│ │ POS: Noun  │ │ POS: Noun  │ │ POS: Verb  │                │
│ │ Case: Fatha│ │ Case: Damma│ │ Mabni      │                │
│ │ Role: M.Bih│ │ Role: Fa'il│ │ Role: Fi'l │                │
│ └───────────┘ └───────────┘ └───────────┘                   │
│                                                              │
│              [كَتَبَ]                                        │
│             /        \                                      │
│      Subject          Direct object                         │
│    [الطَّالِبُ]          [الدَّرْسَ]        ← SVG dependency   │
│                                              tree diagram    │
└────────────────────────────────────────────────────────────┘
```

Selecting a word (in the sentence, a card, or the tree) highlights it
consistently across all three views — this is implemented, not a mockup;
see `src/libs/IrabWrapper/components/IrabWorkspace/index.tsx`.

### Vocabulary review (`/vocabulary`)

```
┌───────────────────────────────┐
│ Card 1 of 4                    │
│                                 │
│           كِتَاب                │
│           kitāb                 │
│                                 │
│      [ Show answer ]            │
│                                 │
│  ↓ after reveal:                │
│  book · الجذر: ك ت ب            │
│  قَرَأْتُ الكِتَابَ                │
│  [Again] [Hard] [Good] [Easy]   │
└───────────────────────────────┘
```

Grading a card calls the real SM-2 function (`reviewSm2`) and shows the
computed next-due date at the end of the session — functional, not mocked.

### Quiz Center (`/quizzes`)

```
┌───────────────────────────────┐
│ Quiz configuration              │
│  Topic: Mixed / Vocab /         │
│         I'rab / Sarf            │
│  Questions: 5 / 10 / 15         │
│      [ Start custom quiz ]      │
└───────────────────────────────┘
        ↓
┌───────────────────────────────┐
│ Question 3 of 10        [irab] │
│ كَتَبَ الطَّالِبُ الدَّرْسَ           │
│ What is the role of "الدَّرْسَ"?  │
│  ( ) Subject (fa'il)            │
│  ( ) Direct object          ✓   │
│  ( ) Topic (mubtada')           │
│  ( ) Object of preposition      │
└───────────────────────────────┘
```

`src/helpers/quiz/generate.ts` generates real questions (pure, unit-tested,
seedable) from the existing vocabulary bank, I'rab worked examples, and a
curated Sarf wazn table — entirely client-side, with no repeats in a session.
This is a stand-in for the templated `quiz_templates`/`quiz_questions` engine
in `db/schema.sql`; see ROADMAP.md Phase 4 for what persistence/analytics it
still needs.
