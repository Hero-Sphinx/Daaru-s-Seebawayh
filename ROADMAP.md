# Roadmap

Phased build-out from the current scaffold to the full platform described in
the project brief. Each phase should ship independently usable value; don't
start a phase before the previous one's exit criteria are met.

## Phase 0 — Scaffold (done)

- Next.js 16 / React 19 / TypeScript / Tailwind v4 app shell with RTL-aware
  Arabic typography (`font-arabic`, Amiri).
- PostgreSQL schema (`db/schema.sql`) covering users, roots/lemmas, Quranic
  corpus, library documents, unified tokens/dependency graph, fawā'id, SRS,
  and the quiz engine.
- SM-2 spaced-repetition engine (`src/lib/srs/sm2.ts`) with unit tests.
- I'rab Workspace UI (`src/components/IrabWorkspace.tsx`) rendering a
  color-coded sentence, expandable token cards, and an SVG dependency tree
  from static mock data.
- Dashboard, Library, Library reader, and Vocabulary review pages wired to
  mock data (no live database yet).

**Exit criteria:** `npm run build` and `npm test` pass; every route renders.

## Phase 1 — Persistence & auth (MVP core)

- Stand up Postgres, run `db/schema.sql`, wire `src/lib/db.ts` to a real
  connection string.
- Auth (email/password or magic link) writing to `users`.
- CRUD for `vocabulary_items` + `srs_cards`; replace the mock queue in
  `/vocabulary` with cards actually due (`WHERE due_at <= now()`).
- Wire `VocabularyPractice`'s `grade()` calls to a `POST /api/srs/review`
  route that persists the SM-2 update and appends to `srs_review_log`.

**Exit criteria:** a user can sign up, add a word manually, and review it
tomorrow with a schedule that survives a server restart.

## Phase 2 — Quranic Corpus integration

- One-time import job: pull word-by-word morphology + dependency data from
  the Quranic Arabic Corpus / QADT into `quran_chapters`, `quran_verses`,
  `tokens`, and `dependency_edges` (`analysis_source = 'qadt'`).
- Replace the static `sampleSentence` in `/irab` with a verse picker backed
  by real QADT data.
- Root/lemma lookup: populate `roots` and `lemmas` from the corpus's
  morphology, so vocabulary extraction has a real dictionary to match against.

**Exit criteria:** any of the 114 surahs renders a correct I'rab breakdown
sourced entirely from QADT, with zero hand-authored data.

## Phase 3 — Library & Farasa pipeline

- PDF/EPUB upload → text extraction → `library_documents` +
  `library_text_units`.
- Background `extraction_jobs` worker calling the Farasa API (segmentation,
  POS tagging, diacritization) and writing results into the same
  `tokens`/`dependency_edges` tables (`analysis_source = 'farasa'`), so the
  I'rab Workspace and reader work identically for uploaded books.
- Fawā'id extraction pass: rule-based candidates (rare-root frequency
  threshold, idiom pattern list) written to `fawaid`.

**Exit criteria:** uploading a PDF produces a readable, clickable page where
every word opens the same I'rab breakdown as a Quranic verse.

## Phase 4 — Quiz engine

- Author `quiz_templates` for the four MVP types (root matching, POS
  selection, diacritic placement, cloze) as data, not code.
- Question generator: given a template + a pool of tokens/vocabulary items,
  produce `quiz_questions` with distractors drawn from the same root/POS
  family (harder distractors = same root, different form).
- Quiz UI + `quiz_attempts` logging + `user_quiz_stats` aggregation for the
  dashboard's accuracy widget (currently mocked).

**Exit criteria:** a user can take an infinite-length quiz session in any of
the four types with zero repeated questions in a row and correct-answer
explanations that cite `grammatical_roles.rule_reference`.

## Phase 5 — Polish & advanced features

- I'rab reconstruction quiz type (user builds the dependency tree themselves).
- Audio pronunciation (recorded or TTS) on vocabulary cards.
- Leitner-box alternative to SM-2 as a user preference.
- Full-text search across the library (root + lemma aware, not just string
  match) using `pg_trgm` already enabled in the schema.
- Multi-user collaboration/sharing on annotated library documents.

Do not start Phase 5 items opportunistically while Phases 1-4 are incomplete
— they add surface area without unlocking new core functionality.
