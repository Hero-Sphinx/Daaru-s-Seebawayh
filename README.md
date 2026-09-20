# Al-Lisan (اللِّسَان)

A deterministic, non-LLM Arabic learning and I'rab (grammatical analysis)
platform. Every syntactic and morphological claim the app makes is backed by
a verified rule engine or an annotated treebank (Quranic Arabic Corpus /
QADT, Farasa, CAMeL Tools) — never by generative text prediction.

## Tech stack

| Layer            | Choice                                          | Why |
|-------------------|--------------------------------------------------|-----|
| Frontend          | Next.js 16 (App Router) + React 19 + TypeScript | Server components for data-heavy pages (reader, dashboard), client components only where interactive (I'rab workspace, SRS practice) |
| Styling           | Tailwind CSS v4                                  | RTL utilities, dark mode, fast iteration on data-dense UI |
| Database          | PostgreSQL                                       | Relational integrity for the token/dependency graph; see [db/schema.sql](db/schema.sql) |
| NLP (Quranic)     | Quranic Arabic Corpus / QADT (bulk import)       | Pre-verified, no runtime dependency |
| NLP (general text)| Farasa API / farasapy                            | POS tagging, segmentation, diacritization for library uploads |
| Morphology        | CAMeL Tools                                      | Lemmatization, root lookup fallback |

## Project structure

```
src/
  app/
    page.tsx              Dashboard
    library/page.tsx       Maktabah document list
    library/[id]/page.tsx  Document reader
    irab/page.tsx           I'rab Workspace
    vocabulary/page.tsx     SRS review queue
  components/
    IrabWorkspace.tsx       Color-coded sentence + token cards + dependency tree
    VocabularyPractice.tsx  SM-2 flashcard practice loop
  lib/
    srs/sm2.ts              SM-2 algorithm (pure, unit-tested)
    db.ts                   Postgres connection pool
    data/                   Mock data (swap for real queries in Phase 1+)
  types/irab.ts             Token / dependency-edge types mirroring the schema
db/schema.sql               Full PostgreSQL schema
ROADMAP.md                  Phased implementation plan
```

## Getting started

```bash
npm install
npm run dev       # http://localhost:3000
npm test          # SM-2 engine unit tests
npm run build     # production build + type check
```

To connect a real database:

```bash
cp .env.example .env
psql "$DATABASE_URL" -f db/schema.sql
```

The app currently reads from mock data in `src/lib/data/`; see
[ROADMAP.md](ROADMAP.md) Phase 1 for wiring it to Postgres.

## UI/UX blueprint

### Dashboard (`/`)

```
┌────────────────────────────────────────────────────────────┐
│ اللِّسَان   Dashboard   Library   I'rab Workspace   Vocabulary │
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
│ ← Back to library                         │ Fawā'id from    │
│ Riyad as-Salihin                          │ this text       │
│ ┌────────────────────────────────────────┐│ • بَلَاغَة: ...   │
│ │  نَص تَجْرِيبِيّ يُمَثِّل صَفْحَة مِن الكِتَاب،     ││ • rare word...  │
│ │  حَيْثُ يُمْكِن للمُسْتَخْدِم النَّقْر عَلَى        ││                 │
│ │  أَيّ كَلِمَة لِعَرْض تَحْلِيلهَا الصَّرْفِيّ         ││ Click a word    │
│ │  وَالنَّحْوِيّ.                                  ││ to see I'rab →  │
│ │  (each word is clickable)                ││                 │
│ └────────────────────────────────────────┘│                 │
└──────────────────────────────────────────┴─────────────────┘
```

Clicking any word in the reader opens the same breakdown as the I'rab
Workspace below — one component, two entry points.

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
see `src/components/IrabWorkspace.tsx`.

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
