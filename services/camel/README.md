# CAMeL Tools morphology service

A small self-hosted FastAPI service wrapping [CAMeL Tools](https://github.com/CAMeL-Lab/CAMeL_Tools)'
MSA morphological analyzer, used for FR-4.2 (vocabulary root/lemma/POS
enrichment). Deterministic, no API key, no external network call at request
time — see the main [README.md](../../README.md)'s AI usage policy for why
this matters.

## Setup

```bash
cd services/camel
python -m venv .venv
./.venv/Scripts/activate      # Windows; use `source .venv/bin/activate` on macOS/Linux
pip install -r requirements.txt
camel_data -i morphology-db-msa-r13   # ~40MB, downloads to your CAMeL Tools data dir
```

## Run

```bash
./.venv/Scripts/uvicorn.exe app:app --port 8001
```

The Next.js app expects this at `CAMEL_SERVICE_URL` (defaults to
`http://localhost:8001` — see `.env.example` at the repo root) and calls it
through `src/lib/camel-client.ts`. It is not started automatically by
`npm run dev` — run it separately. Features that need it: the vocabulary
form's "Auto-fill" button, the I'rab Workspace's "Type your own sentence"
mode (`/api/irab/parse`), the Library reader's click-a-word lookups, and
book I'rab quizzes. Without it those show a "CAMeL Tools service is
unreachable" error; everything else (including the Qur'an reader and
Quiz Center) works without it.

## API

`POST /analyze` — body `{"word": "كتاب"}`, returns every distinct
morphological reading CAMeL Tools finds (root, lemma, POS, diacritized form,
gender, number), since an undiacritized word out of context is often
genuinely ambiguous (e.g. "كتاب" is both "كِتَاب" book and "كُتّاب"
Quranic-school). The caller should let the user pick, not silently take the
first candidate.

With `"dedupe": false` (the I'rab parser), each candidate also carries CAMeL's
morphosyntactic features — `person`, `aspect`, `mood`, `case`, `state`,
`voice`, `prc0`–`prc3`, `enc0` and `bw` (the tagged morpheme segmentation).
**After updating this file, restart the service** — the app detects an
older running version and asks for a restart instead of mis-parsing.

`GET /health` — liveness check.

## License note

The `calima-msa-r13` data package is GPL v2 licensed (the `camel_tools`
Python library itself is MIT). It's used here only as a local analysis
service the app calls over HTTP — nothing from it is redistributed or
statically linked into the Next.js app — but if you ever plan to ship this
data file itself, check GPL v2 compatibility first.
