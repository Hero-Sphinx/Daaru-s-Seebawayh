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
- SM-2 spaced-repetition engine (`src/helpers/srs/sm2.ts`) with unit tests.
- I'rab Workspace UI (`src/libs/IrabWrapper/components/IrabWorkspace/index.tsx`) rendering a
  color-coded sentence, expandable token cards, and an SVG dependency tree
  from static mock data.
- Dashboard, Library, Library reader, and Vocabulary review pages wired to
  mock data (no live database yet).

**Exit criteria:** `npm run build` and `npm test` pass; every route renders.

## Phase 1 — Persistence & auth (MVP core)

- [x] Stand up Postgres (Neon), run `db/schema.sql`, wire `src/server/databases/db.ts` to a
  real connection string via Prisma (`@prisma/adapter-pg`); `prisma/schema.prisma`
  is introspected from `db/schema.sql`, not hand-maintained — after any schema
  change, apply it with `prisma db execute --file db/schema.sql` (or a targeted
  `ALTER`), then `prisma db pull && prisma generate`.
- [x] CRUD for `vocabulary_items` + `srs_cards` (`src/app/api/vocabulary/`),
  including bulk/CSV import (`src/helpers/vocabulary.ts`); `/vocabulary` reads
  cards actually due (`WHERE due_at <= now()`) instead of a mock queue.
- [x] Wired `VocabularyPractice`'s `grade()` calls to `POST /api/srs/review`,
  which persists the SM-2 update and appends to `srs_review_log`.
- [x] Quiz attempts persist too (`POST /api/quiz/attempt`), aggregated into
  `user_quiz_stats`; the dashboard's "cards due" / "words mastered" / "quiz
  accuracy (7d)" stats are now live queries, not mocked.
- [x] Auth: email/password sign-up/login (`/signup`, `/login`, server
  actions in `src/server/actions/auth.ts`) writing to `users`. No new
  dependencies — scrypt hashing via `node:crypto` (`src/server/lib/password.ts`).
  **Database sessions**, not stateless JWTs: the cookie holds a random
  256-bit token and the `sessions` table stores only its SHA-256 hash, so
  logout / password reset revoke immediately and a DB leak can't be
  replayed. 30-day sliding expiry (DB row extended, no write per request).
  Two layers per the Next 16 auth guide: `src/proxy.ts` does an optimistic
  cookie-presence gate (redirect pages to `/login?next=…`, 401 for
  `/api/*`); `src/server/lib/auth.ts` does the real check — `getCurrentUserId()`
  (pages, redirects) and `getApiUserId()` + `unauthorizedResponse()`
  (route handlers, JSON 401 rather than a redirect a `fetch()` would choke
  on). `?next=` is open-redirect-safe (`src/constants/safeRedirect.ts`).
  Pre-auth data stays with the legacy `dev@al-lisan.local` user; claim it
  with `npm run user:set-password` (see README). Not built: email
  verification, password reset by email (needs an email provider), login
  rate limiting.
- Added `custom_meaning_en` / `custom_transliteration` columns to
  `vocabulary_items` (not in the original schema) — needed so a manually
  entered word has somewhere to store its meaning/transliteration when it
  isn't linked to a `lemmas` row (which is the common case; `lemmas` has no
  seed data yet — see Phase 2).
- Widened the `quiz_templates.quiz_type` CHECK constraint to add
  `vocab_recall` / `wazn_identification`, matching the topics the client-side
  quiz generator (Phase 4 note below) actually produces.
- [x] FR-4.2 morphological enrichment: `services/camel/` is a self-hosted
  FastAPI service wrapping CAMeL Tools' MSA analyzer (`calima-msa-r13`,
  ~40MB, deterministic, no API key). `POST /api/vocabulary/enrich` proxies
  to it; the vocabulary form's "Auto-fill" button fills root + a diacritized
  form from it. An undiacritized word is often genuinely ambiguous (e.g.
  "كتاب" could be "كِتَاب" book or "كُتّاب" Quranic-school) — the service
  returns every distinct root+lemma+POS reading and the UI makes the user
  pick, rather than silently guessing one. Not auto-started by `npm run dev`;
  see `services/camel/README.md`. No plural/pattern suggestion yet — CAMeL
  Tools' *analyzer* doesn't produce one; that would need its separate
  *generator* API, not attempted here.

**Exit criteria:** a user can sign up, add a word manually, and review it
tomorrow with a schedule that survives a server restart. *(Met — verified
end-to-end over HTTP: sign-up, duplicate/wrong-password errors, `?next=`
redirect, logout revoking the session server-side.)*

## Free-text I'rab parsing (FR-1.1, FR-1.3) — done, not phase-numbered

Doesn't map cleanly onto the phases above, so it's called out separately.
`src/helpers/irab/freeTextParser.ts` — deterministic, rule-based, no LLM (see
the AI usage policy at the top of README.md). `/irab` now has a "Type your
own sentence" mode alongside the curated picker
(`src/libs/IrabWrapper/components/FreeTextIrabInput/index.tsx` → `POST /api/irab/parse`).

- **Scope**: exactly 3 sentence patterns — verb-subject-object, simple
  mubtada'-khabar, each with an optional trailing preposition phrase (same
  3 patterns as the curated bank in `sample-sentence.ts`). Anything else is
  reported as unparsed with a specific reason, never guessed.
- **Requires full tashkeel.** Undiacritized Arabic is genuinely ambiguous;
  the parser won't vocalize for you.
- **Disambiguation strategy**: for each word, calls the CAMeL service
  (`dedupe=false`) and keeps only candidates whose diacritized form matches
  the user's input. Real homographs survive this (e.g. "ذَهَبَ" is
  identically spelled as "he went" and "gold") — where the sentence
  pattern's position uniquely resolves it (verb slot expects a verb), that
  reading is used and flagged via a `resolutionNote`; where it doesn't,
  the token is left unparsed.
- **Normalization gotchas found by testing against real CAMeL output**
  (`src/helpers/irab/normalize.ts`, all covered by unit tests) — worth reading
  before touching this code, since they weren't obvious from the API docs:
  - CAMeL's own diacritization is inconsistent about the sun-letter
    position after the definite article ("الطَّالِبُ" → CAMeL's "الطالِبُ",
    "الدَّرْسَ" → CAMeL's "الدَرْسَ") — sometimes bare, sometimes vowel-only,
    never with the shadda a learner would write. Stripped unconditionally at
    that one letter position (sun letters are a fixed, closed set).
  - Short vowels immediately before their matching long-vowel letter are
    dropped by CAMeL (matres lectionis: "كِتَاب" → CAMeL's "كِتاب"). Stripped
    symmetrically on both sides.
  - Explicit sukun vs. a bare consonant are treated as equivalent.
  - CAMeL's root field uses `#` as a placeholder for an unresolved
    weak/hamzated radical (e.g. "نور" → `ن.#.ر`, "قرأ" → `ق.ر.#`) — rather
    than guess the letter, `services/camel/app.py` drops it and returns only
    the known radicals.
- **Known gaps, by design**: only free-standing prepositions (في, على, من,
  ...) — ب/ل/ك/و attach to the next word with no space and aren't segmented.
  No verb mood for present-tense verbs, no idafa chains, no coordination, no
  relative clauses.
- Verified against all 3 curated sentences (exact match to their
  hand-verified analyses) plus new sentences outside the bank; 22 unit tests
  across `tokenize.ts`/`normalize.ts`/`free-text-parser.ts`.

### Parser correctness pass (after live reports)

Three real misparses, all fixed and pinned by tests with the exact sentences:

- **Typed endings are now binding.** إِنَّ الحَقَّ وَاضِحٌ came out as verb +
  fa'il with "sign: damma" on a word visibly ending in a fatha — case was
  assigned by position and never checked against what was typed. Every slot
  now requires a compatible ending (`src/helpers/irab/caseEnding.ts`), and the
  sign shown is derived from it, including substitute signs: و/ي for sound
  masculine plurals, ا/ي for duals, kasra for the nasb of sound feminine
  plurals. Sound plurals are recognised only when CAMeL says plural *and* the
  word is literally lemma + suffix, so الدِّينَ or مَسَاكِينَ are never
  mistaken for them. Diptotes in jarr and maqsur/manqus words (implied case)
  are left unparsed rather than given a wrong sign.
- **Closed classes come from lists, not CAMeL.** CAMeL offers an
  imperative-verb reading of إِنَّ; closed-class words (`particles.ts`) are
  now recognised first: إنّ and its sisters (new pattern: particle + ism
  manṣūb + khabar marfūʿ, roles INNA / ISM_INNA / KHABAR_INNA named after the
  particle actually used), detached pronouns and demonstratives (mabni
  mubtada' "في محل رفع", with the fixed ending stated only where the grammar
  books agree), and other particles, reported as unsupported instead of
  misread.
- **Na't vs. khabar by definiteness.** الوَلَدُ الصَّغِيرُ نَائِمٌ now gives
  mubtada' + na't + khabar: a na't must match its noun's case and
  definiteness (after an indefinite noun it only needs to lack ال, so
  diptote adjectives like حَمْرَاءَ still count).

### Full grammar (every previously-unsupported construction)

The pattern matcher was replaced by a recursive-descent grammar
(`src/helpers/irab/grammar.ts`) over real CAMeL morphology. The CAMeL service
now passes through its morphosyntactic features (aspect, mood, case, state,
person/gender/number, voice, proclitics, enclitic, and the tagged morpheme
segmentation `bw`) — `morph.ts` turns them into structured facts, and words
are split into their pieces (بِـ + القَلَمِ, كِتَابُ + ـهُ) so each gets its own
i'rab and its own node in the dependency tree.

- **Attached pronouns**: possessive (mudaf ilayh), object, after a
  preposition (عَلَيْهِ), as ism inna (إِنَّهُ); their fixed ending is read
  off what was typed. Attached **prepositions** (ب/ل/ك) and **conjunctions**
  (و/ف) likewise.
- **كان and its sisters** (incl. لَيْسَ and ما زال / ما برح / ما فتئ / ما انفك),
  identified by lemma in any conjugation; ism attached, explicit or implied;
  khabar a noun or a prepositional phrase.
- **Negation**: لم (jussive), لن (subjunctive), لا الناهية / النافية, ما + past,
  ما الحجازية (khabar mansub) vs. ما المهملة, **لا النافية للجنس** (ism mabni on
  the fatha, or mansub when mudaf). Also قد and سوف / سَـ.
- **Idafa**: chains, attached pronouns, **the five nouns** (أبو/أبا/أبي…), sound
  plurals/duals in construct (مُعَلِّمُو); a following na't attaches to
  whichever noun its case agrees with.
- **Khabar as a phrase**: prepositional (with "متعلقان بمحذوف…"), a verbal
  clause ("والجملة الفعلية في محل رفع خبر…"), and the fronted khabar with a
  delayed mubtada' (في الدارِ رجلٌ).
- **Implied case**: maqsur (مُوسَى، عَصًا — للتعذر), manqus (القَاضِي، قَاضٍ — للثقل,
  visible fatha in nasb), ya' al-mutakallim (كِتَابِي).
- **Verbs**: past built on the fatha / damma (واو الجماعة) / sukun (moving
  subject pronoun) incl. implied fatha (دَعَا); present mood read from the
  typed ending and *checked against the governing particle* (a damma after
  لم is refused, with the reason), five verbs (ثبوت النون / حذف النون), weak
  verbs (implied damma, حذف حرف العلة); imperative (سكون / حذف النون / حذف حرف
  العلة); passive → na'ib fa'il; attached and implied subjects stated the
  book way ("ضمير مستتر وجوبًا تقديره أنت"). CAMeL has no imperatives for
  verbs with a connecting alif, so they're rebuilt from the 2nd-person
  jussive (`candidates.ts`) and accepted only on an exact match.
- Also fixed on the way: every word with a conjunction/preposition before
  ال failed to match CAMeL at all (sun-letter normalization anchored at the
  start of the word).

Tests run on **real CAMeL analyses** recorded into
`tests/fixtures/irab/camelCandidates.json`
(`npm run irab:record-fixtures`), covering ~55 sentences.

### Accuracy run and the remaining constructions

A gold set of **186 textbook sentences** with their correct i'rab
(`tests/fixtures/irab/gold.ts`) is scored word by word by
`npm run irab:accuracy`: *correct*, *refused* (the parser declined and said
why), or *wrong* (a confident false analysis). It includes constructions the
parser deliberately doesn't cover. A test fails on any *wrong* sentence or if
coverage drops below 90%.

| | correct | refused | wrong |
|---|---|---|---|
| first run | 136 (73.1%) | 43 | 7 |
| now | **175 (94.1%)** | 11 | **0** |

Added along the way:

- **التقاء الساكنين**: a sukun typed as its helping vowel before hamzat al-wasl
  (لَمْ يَكْتُبِ الطَّالِبُ، اُكْتُبِ الدَّرْسَ، ذَهَبَتِ الطَّالِبَةُ، قَدِ اجْتَهَدَ) is accepted and
  stated ("وحُرِّك بالكسر منعًا لالتقاء الساكنين"). Prepositions take their
  built-on vowel from a fixed table — مِنَ is still built on the sukun.
- **حال**: an indefinite accusative adjective after a complete clause, or any
  indefinite descriptive accusative after a known intransitive verb.
- **مفعول مطلق**: a derived verb's regular masdar (forms II–X are
  predictable), a same-root noun after the object, or after an intransitive
  verb. A form-I same-root noun with nothing else to go on (كَتَبَ كِتَابًا) is
  reported as undecidable.
- **تمييز** after an elative (أَكْثَرُ عِلْمًا) and after the tens, which are
  now declined as "ملحق بجمع المذكر السالم".
- **مفعول فيه (ظرف)**: place adverbs and قبل/بعد (never objects or subjects),
  time nouns in construct or after an intransitive verb — as complements, as
  a khabar (الكِتَابُ فَوْقَ المَكْتَبِ), and as a fronted khabar (عِنْدِي سَيَّارَةٌ).
  مَعَ is now a ظرف, not a preposition.
- **Relative clauses** (الذي، التي، الذين، اللاتي): the pronoun fills its slot
  (mabni, in that slot's position) or is na't of a definite noun; the sila is
  a verbal clause whose subject is the returning pronoun, or a
  prepositional phrase ("لا محل لها من الإعراب").
- **Conditionals**: إِنْ and مَنْ (jussive verbs, or past verbs "في محل جزم";
  a nominal answer with الفاء الرابطة), and إِذَا (non-jussive, with the
  positions of its two clauses).
- **أَنْ + subjunctive** as the object (masdar mu'awwal); refused where it
  could equally be the subject (يَجِبُ أَنْ…).
- **Two-object verbs** (ظنّ and أعطى and their sisters), **كان with a
  verbal khabar**, **إنّ with a fronted khabar**, **قال + a quoted sentence**
  (مقول القول), **هَلْ** and **لَقَدْ** before a sentence, **diptotes in jarr**
  where the form shows why (علمية وتأنيث، علمية وزيادة الألف والنون، صيغة
  منتهى الجموع، ألف التأنيث الممدودة، وصفية ووزن الفعل), **لفظ الجلالة** in
  every attached form, and indefinite mubtada' made specific by idafa
  (كُلُّ طَالِبٍ).
- **Refused rather than guessed**: مَا + أَفْعَلَ (exclamation or negation?),
  a time noun that could be an object, same-root form-I nouns.
- Bugs the run exposed: 1st-person plural verbs (نُرِيدُ) were treated as one
  of the five verbs; the imperative rebuild could invent an imperative from
  an indicative (صَادِقُونَ); tanween + shadda (حَارًّا) never matched; homographs
  with identical i'rab (طَالِعَة/طَالِع) were refused.

**Still not covered (declined, never guessed):** vocatives, interrogative
nouns (أين، من، ما), exclamation, the pronoun of separation (ضمير الفصل),
tawkid, maf'ul li-ajlih, nun al-tawkid, lam al-ta'lil + verb, coordination of
whole clauses, and diptotes whose reason the form doesn't show (feminine
names without ة, foreign names).

## Phase 2 — Quranic Corpus integration (done, scoped — see below)

- [x] **Import job** — `npm run quran:import` (`scripts/import-quran.ts`)
  loads the bundled Quranic Arabic Corpus morphology
  (`data/quranic-corpus/`) into `quran_chapters` (114), `quran_verses`
  (6,236), `roots` (1,642), `lemmas` (5,152, with corpus `frequency_rank`),
  `pos_tags` (QADT tagset), `verb_forms` (I–XII) and `tokens` (77,429
  word rows + 128,219 clitic-segment rows via `parent_segment_token_id`,
  `analysis_source = 'qadt'`) — totals match the corpus's published counts
  exactly. One transaction (never half-imported), idempotent (upserts on
  natural keys; a re-run is a ~2s no-op; `--force` reloads tokens), and it
  fails loudly on any unparseable line, unknown POS tag or unknown
  Buckwalter character rather than skipping it.
- [x] **Extended Buckwalter decoding** (`src/helpers/quran/buckwalter.ts`):
  the corpus uses JQuranTree's extended scheme; Uthmani marks are kept for
  displayed text and dropped for dictionary keys, and output is
  NFC-normalized (the source writes shadda-then-fatha; typed Arabic is the
  reverse). Corpus quirks found by running it, all handled and tested:
  homonym lemma numbers (`maE2`, 15 lemmas), a word written in two parts
  (37:130), imperfect verbs with no MOOD tag (= indicative, the corpus
  default).
- [x] **Verse reader** at `/quran` → `/quran/[chapter]` (not a picker
  inside `/irab` — the I'rab Workspace is built around syntactic roles,
  which this data doesn't have; see the scope note): words colour-coded by
  case; click a word for POS, lemma, root, case/mood, aspect/voice/form,
  person/gender/number, definiteness, prefix/stem/suffix segments, and its
  root family with Qur'an occurrence counts (`GET /api/quran/roots/[id]`).
  Paginated at 30 verses.
- [x] **Dictionary for vocabulary** — `POST /api/vocabulary` auto-links a new
  word to its Qur'an lemma (`vocabulary_items.lemma_id`) when exactly one
  lemma matches (`src/helpers/quran/lemmaMatch.ts`: Uthmani ↔ standard
  spelling, both dagger-alif spellings, diacritics/root narrow it down;
  ambiguous words like undiacritized كتب stay unlinked). The importer
  backfills existing items the same way. The learner's own spelling is
  still what's displayed.
- **Scope note (the original exit criterion isn't fully achievable):**
  the corpus's bulk download is *morphology only*. Its syntactic treebank
  (dependency graph, roles like fāʿil/mafʿūl) isn't available as clean bulk
  data, so `dependency_edges` stay empty for the Qur'an and the reader
  shows case/mood but never a syntactic role — labelled as such in the UI
  rather than guessed. **Revised exit criterion, met:** any of the 114
  surahs renders a word-by-word morphological breakdown sourced entirely
  from QADT, with zero hand-authored data (except surah names and
  revelation place, `src/helpers/quran/chapters.ts`, which the corpus file
  doesn't carry).

## Phase 3 — Library pipeline (FR-2.1 - FR-2.5)

Built, but diverges from the original plan above in a few real ways worth
flagging (Farasa was already dropped app-wide in favor of CAMeL Tools —
see Phase 1):

- [x] **FR-2.1 PDF upload & extraction**: `POST /api/library` (multipart)
  reads the file with [unpdf](https://github.com/unjs/unpdf) (pure JS, no
  native deps), one `library_text_units` row per page. **PDF only, not
  EPUB** — not attempted. Runs **synchronously within the request**, not a
  background worker — still tracked via an `extraction_jobs` row
  (`job_type = 'text_extraction'`) for an audit trail, but there's no real
  job queue; fine for the page counts a browser upload realistically
  handles, would need revisiting for very large scanned books.
  **Only the extracted text is kept** — no object storage is configured
  (see README.md), so the original PDF bytes are discarded after
  extraction; `storage_path` holds just the original filename.
  **Text-only PDFs** — a scanned/image-only PDF extracts no text and the
  upload fails with a clear error; OCR isn't attempted.
- [x] **Critical fix found by testing against a real generated PDF, not
  assumed**: some PDF generators embed pre-shaped Arabic glyphs (Unicode
  Arabic Presentation Forms, contextual letter shapes) instead of logical
  characters — extracted text in that case is unusable by CAMeL Tools or
  anything else without conversion. Fixed by always applying Unicode NFKC
  normalization (`src/server/services/library/extractPdf.ts::normalizePdfText`,
  unit-tested). Also confirmed empirically: real book PDFs are mostly not
  fully diacritized, which is exactly what the free-text I'rab parser
  (Phase 1.5 above) already assumes and handles honestly.
- [x] **FR-2.4 clickable words**: word-level only, via the same CAMeL
  enrichment endpoint vocabulary uses (`POST /api/vocabulary/enrich`) —
  root/lemma/POS, shown as multiple candidates when the (usually
  undiacritized) extracted text is genuinely ambiguous. **Not** full
  syntactic I'rab position — the free-text parser's 3 supported patterns
  need full tashkeel, which book text mostly lacks; running it
  automatically on arbitrary book sentences would mean mostly "unparsed"
  results, so it isn't wired into the reader. Use the I'rab Workspace's
  "Type your own sentence" mode directly for that.
- [x] **FR-2.5 search**: `GET /api/library/search` — plain substring match
  (`raw_text` `contains`) across the user's `library_text_units`, not
  `pg_trgm` fuzzy matching — a learner searching for a specific term wants
  exact hits, not fuzzy noise; `pg_trgm` stays reserved for short-string
  lookups (roots/lemmas) where fuzziness helps. No highlighting/note-taking
  UI yet, just result snippets.
- [x] **FR-2.2/2.3 summaries & Fawā'id**: `POST /api/library/[id]/summarize`
  — the one Gemini-backed endpoint in the app (see README.md's AI usage
  policy). One call summarizes the whole document (truncated to a ~40K-char
  budget, `src/server/services/library/summarize.ts::buildDocumentText`) and extracts
  Fawā'id grounded to specific pages via Gemini's structured-output mode
  (`responseSchema`), stored on `library_documents.summary_en/ar` and as
  `fawaid` rows (`created_by = 'system'`). Both are rendered with a visible
  "AI-generated, unverified" badge (`src/libs/LibraryDocumentWrapper/components/LibrarySummary/index.tsx`).
  **No per-chapter summaries** — PDFs don't have machine-readable chapter
  boundaries without further heading-detection work, so this is
  document-level only; noted here as a real gap against the FR, not silently
  dropped.
- [x] **Verified against a real Gemini response**, with a real key, through
  the actual running app (not just a direct API call) — summary + 5 Fawā'id
  generated, all correctly categorized and attributed to the right page
  numbers, persisted, and retrievable. Two things learned in the process,
  both now handled:
  - `gemini-3.8-flash` (the default) hit a **429 quota** error under real
    testing, not just the 503 "high demand" seen earlier — free-tier quotas
    per model are tighter than they look. `generateStructured` now retries
    with exponential backoff on 429/503 (`src/server/helpers/geminiClient.ts`); if a
    model is out of quota, override `GEMINI_MODEL` (`gemini-2.5-flash`
    confirmed working) rather than waiting on it.
  - **Turbopack dev-cache gotcha**: after `prisma generate` picks up new
    columns (here, `summary_en`/`summary_ar`), an *already-running* `next
    dev` process can keep using a stale cached copy of the generated
    client and throw "Unknown argument" on the new fields — even after
    `pkill`+restart. Fix is `rm -rf .next/dev` before restarting. Only
    matters if you change `db/schema.sql` while `next dev` is running.

**Exit criteria:** uploading a PDF produces a readable, clickable page where
every word shows its morphology, text is searchable, and a summary/Fawā'id
can be generated on demand. *(Met, with the scope notes above.)*

## Phase 4 — Quiz engine

A client-side prototype ships at `/quizzes`
(`src/libs/QuizzesWrapper/index.tsx` + `src/helpers/quiz/generate.ts`): it generates
real vocab/I'rab/Sarf multiple-choice questions from the user's actual
vocabulary bank and the app's I'rab/wazn data, with no repeats in a session,
entirely in the browser (no `quiz_templates`-driven question bank, no
distractor-family tuning — distractors are just random same-pool picks, not
"same root, different form"). **Persistence is real, not a gap anymore**:
`POST /api/quiz/attempt` logs every attempt and updates
`user_quiz_stats` (Phase 1), and the dashboard's "cards due" / "words
mastered" / "quiz accuracy (7d)" stats are live queries against it — not
mocked, as an earlier version of this doc said.

- [x] **Template-driven generation.** `quiz_templates` rows now carry a
  stable `code` and a real `template_body` (source, filter, prompt with
  placeholders, answer field, distractor strategy, explanation) — authored
  in `src/helpers/quiz/templates.ts`, seeded by code, validated on read
  (`template-types.ts`; an invalid row is skipped, not fatal), and
  interpreted by a generic, pure engine (`template-engine.ts`). New
  question types from the Phase 2 data: case identification (new
  `case_identification` quiz type), noun/particle kind, verb tense, verb
  form, root, and "which word is from root X".
- [x] **Distractor tuning** (`distractors.ts`): roots are scored by shared
  radicals (in place > out of place), so wrong options are look-alikes
  (ن ف س → ن ف ث / ن ف ق / ن ك س), not random; POS options stay within the
  word's own category; root-family options are real words from look-alike
  roots.
- [x] **Server-side sessions** — `POST /api/quiz/session` (topic,
  difficulty, count) replaces client-side generation in `QuizCenter`;
  difficulty = lemma frequency tier (top ~300 / ~1,500 / all). The curated
  I'rab-role and wazn banks (`generate.ts`) are blended in (at most a
  quarter of a session). Every question carries its template code; attempts
  log against that template and the chosen difficulty (`user_quiz_stats` is
  now per difficulty, not hard-coded "beginner"). Explanations are shown
  after answering, with the template's rule reference.
- Not persisted: generated Quiz Center questions aren't written to
  `quiz_questions` (attempts reference the template, not a question row) —
  add that if per-question analytics are needed. `sentence_meaning_match`
  keeps its existing Gemini/curated path.

**Exit criteria:** a user can take an infinite-length quiz session in any of
the four types with zero repeated questions in a row and correct-answer
explanations that cite `grammatical_roles.rule_reference`. *(Met — no
question repeats within a session, no two consecutive questions about the
same word unless nothing else is left, and every template question has an
explanation and rule reference. Sessions are capped at 30 questions per
request rather than literally infinite.)*

## Book quizzes (FR-3.1, FR-3.2) — done, not phase-numbered

Same reasoning as the free-text I'rab section above — doesn't map onto the
phases cleanly. `/library/[id]/quiz`
(`src/libs/BookQuizWrapper/components/BookQuizPlayer/index.tsx` → `POST`/`GET /api/library/[id]/quiz`),
linked from the document reader page. Reuses `QuizPlayer.tsx`, extracted
from `QuizCenter.tsx` so both the general and book quiz UIs share one
"play a session" implementation instead of duplicating it.

Deliberately hybrid — only the one subtype that genuinely needs it uses
Gemini, matching this app's whole approach to AI usage:

- **FR-3.2 "Linguistic Gem Identification" → `fawaid_recall`**: fully
  deterministic (`src/helpers/quiz/bookGenerate.ts::buildFawaidQuestions`) —
  just reformats already-extracted `fawaid` rows into MCQ form, the same
  pattern as the vocab quiz. (The underlying Fawā'id content is still
  Gemini-sourced from Phase 3, so these questions inherit that
  "AI-generated, unverified" status even though generating *the quiz* from
  them needs no AI.)
- **FR-3.2 "In-Context I'rab Drills" → `irab_reconstruction`**: fully
  deterministic (`buildIrabExcerptQuestions`) — excerpts real sentences from
  the book and runs them through the same free-text I'rab parser the I'rab
  Workspace uses, only producing a question when a sentence *fully*
  resolves (no partial-credit guessing). Verified directly with 8 unit
  tests including a fully-resolvable diacritized sentence — but **not yet
  seen producing a question against a real uploaded book**, because every
  PDF tested so far extracted without full tashkeel (expected — see Phase 3
  section above) or hasn't been tried against a naturally-voweled source.
  Try it against a children's book, a Qur'an-adjacent text, or another
  fully-vocalized PDF to see this subtype actually populate.
- **FR-3.1/FR-3.2 "Chapter Summary Verification" → `book_comprehension`**:
  the one subtype using Gemini (`src/server/services/library/quizComprehension.ts`),
  since comprehension inherently needs reading, not rule-matching. Skipped
  (not failed) if `GEMINI_API_KEY` is unset — the other two subtypes still
  generate.
- Generation is triggered once per document (idempotent — `POST` is a
  no-op if questions already exist) and cached in `quiz_questions`
  (`source_library_document_id`, added this phase — that FK didn't exist
  before). No regeneration UI yet if you want a fresh comprehension set.
- **Verified live, real key, full pipeline**: uploaded a test book,
  summarized it (3 Fawā'id), generated a 6-question bank (3 Fawā'id-recall +
  3 Gemini comprehension — 0 I'rab-excerpt, expected per above), fetched it,
  logged an attempt, confirmed `user_quiz_stats` updated. Not a hypothetical
  — actually ran.
- **FR-5.1** wants three *distinct* quiz portals. Interpreted as: general
  Quiz Center (`/quizzes`, vocab + I'rab + sarf via a topic selector) and
  book quizzes (`/library/[id]/quiz`, document-scoped) are the two real
  surfaces — not three separate top-level pages, since Vocabulary and
  I'rab&Grammar already share one portal with a topic switch and splitting
  them wouldn't add anything.

## Phase 5 — Polish & advanced features (done)

All five items built and verified end-to-end (a 45-check HTTP run with two
real accounts: access control, sharing, notes, search, Leitner reviews).

- [x] **I'rab reconstruction** — I'rab Workspace → "Build it yourself":
  the learner picks each word's role and the word it depends on, then
  checks it against the verified analysis (`src/helpers/irab/reconstruction.ts`,
  role and head graded separately, rule references shown for mistakes).
  Works on the curated bank and on any typed sentence the deterministic
  parser *fully* resolves — a partial answer key would mark right answers
  wrong, so partially-parsed sentences are refused. Attempts are logged
  (`irab_reconstruction`).
- [x] **Audio** — real recitation, not TTS, for anything Qur'anic
  (synthesized "recitation" would get tajwid wrong): word-by-word audio
  from Quran.com's CDN (`src/helpers/quran/audio.ts`; its word numbering was
  verified to match the corpus's across 9 verses before relying on it).
  Qur'an reader: "Listen" per word and "Recite word by word" per verse
  with the current word underlined. Vocabulary: any word linked to a
  Qur'an lemma gets a "hear it in the Qur'an" button (flashcard + word
  list) — also the fallback for devices with no Arabic TTS voice. Browser
  TTS stays for everything else.
- [x] **Leitner boxes** as a per-user alternative to SM-2 (`/settings`,
  `users.srs_algorithm`, `srs_cards.leitner_box`, `src/helpers/srs/leitner.ts`):
  5 boxes at 1/3/7/14/30 days, two-button grading. Switching to Leitner
  places each card in the box matching its SM-2 interval; Leitner reviews
  keep SM-2's interval/repetitions in step, so switching back resumes
  sensibly.
- [x] **Root-aware library search** — "Same root" mode: input can be a
  root (ك ت ب), a headword, or an inflected form (يكتبون); every form of
  that root attested in the Qur'an is matched in the library, both
  dagger-alif spellings, with و/ف, ب/ل/ك, ال and one suffix layer peeled
  (`src/server/services/library/rootSearch.ts`). Uses pg_trgm twice: a GIN trigram
  index on the new generated `library_text_units.raw_text_normalized`
  (pre-filter; also makes plain search diacritic-insensitive) and
  `similarity()` for "did you mean" suggestions. **Limitation, by design:**
  forms the Qur'an never uses (e.g. مكتبة) aren't found — no guess-stemming.
- [x] **Sharing + annotations** — highlight a passage and attach a note
  ("Highlight & add notes" in the reader), shared or private; share a
  document by email as *viewer* or *annotator*
  (`library_document_shares`, `library_annotations`). One access module
  (`src/server/services/library/access.ts`, Prisma + raw-SQL forms) used by every
  library page/route: owner does everything; annotators add notes; viewers
  read; others get 404 (existence isn't leaked). Owner-only: delete,
  summarize (spends Gemini quota), share. Owners can remove others' shared
  notes; nobody sees anyone else's private notes. **Not built:** email
  invitations (no email provider — the other person must already have an
  account), real-time co-editing.
