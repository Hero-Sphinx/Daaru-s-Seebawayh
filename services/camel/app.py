"""
CAMeL Tools morphology service — deterministic Arabic root/lemma/POS
analysis for FR-4.2 (vocabulary enrichment). Self-hosted so it needs no API
key, unlike Farasa; see README.md's AI usage policy for why this stays
deterministic while summarization (a separate service) uses an LLM.

An out-of-context, undiacritized word is often genuinely ambiguous (e.g.
"كتاب" analyzes as both "كِتَاب" book and "كُتّاب" Quranic-school/writers) —
this returns every distinct candidate reading rather than silently picking
one, so the caller can let the user choose instead of asserting a guess as
fact.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from camel_tools.morphology.database import MorphologyDB
from camel_tools.morphology.analyzer import Analyzer

app = FastAPI(title="Daaru-s-Seebawayh CAMeL Tools service")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["POST", "GET"],
)

_db = MorphologyDB.builtin_db("calima-msa-r13")
_analyzer = Analyzer(_db)


class AnalyzeRequest(BaseModel):
    word: str
    # True (default): collapse case-ending inflections of the same lexeme
    # (root+lemma+POS) into one candidate — right for vocabulary enrichment,
    # where only the dictionary form matters. False: keep every distinct
    # (root, lemma, pos, diac) reading — needed by the free-text I'rab parser
    # (src/lib/irab/free-text-parser.ts), which matches the user's exact
    # input diacritics against `diac` to disambiguate, so it needs the case
    # ending preserved.
    dedupe: bool = True


class Candidate(BaseModel):
    root: str | None = None
    lemma: str | None = None
    pos: str | None = None
    diac: str | None = None
    gender: str | None = None
    number: str | None = None
    # Morphosyntactic features for the free-text I'rab parser (only filled
    # when dedupe=False). Values are CAMeL's own codes, passed through as-is:
    # asp p/i/c, mod i/s/j/u, cas n/a/g/u, stt d/i/c, per 1/2/3, vox a/p;
    # prc0-3 proclitics (e.g. Al_det, bi_prep, w_conj), enc0 enclitic pronoun
    # (e.g. 3ms_poss, 3ms_dobj); bw = the tagged morpheme segmentation
    # ("بِ/PREP+ال/DET+قَلَم/NOUN+ِ/CASE_DEF_GEN").
    person: str | None = None
    aspect: str | None = None
    mood: str | None = None
    case: str | None = None
    state: str | None = None
    voice: str | None = None
    prc0: str | None = None
    prc1: str | None = None
    prc2: str | None = None
    prc3: str | None = None
    enc0: str | None = None
    bw: str | None = None


class AnalyzeResponse(BaseModel):
    word: str
    candidates: list[Candidate]


def _normalize_root(root: str | None) -> str | None:
    """CAMeL Tools separates root radicals with '.' (e.g. 'ك.ت.ب');
    the app's convention (grammatical-roles.ts, sample-sentence.ts) is
    space-separated ('ك ت ب'). CAMeL also uses '#' as a placeholder for a
    weak/hamzated radical it hasn't resolved to a specific letter (seen for
    both hollow roots, e.g. 'ن.#.ر' for نور, and hamzated roots, e.g.
    'ق.ر.#' for قرأ) — rather than guess which letter that is, drop it and
    show only the radicals that are actually known.
    """
    if not root:
        return None
    letters = [r for r in root.split(".") if r != "#"]
    return " ".join(letters) if letters else None


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/analyze", response_model=AnalyzeResponse)
def analyze(req: AnalyzeRequest):
    analyses = _analyzer.analyze(req.word)

    candidates: list[Candidate] = []
    seen: set[tuple] = set()
    for a in analyses:
        root = _normalize_root(a.get("root"))
        lemma = a.get("lex")
        pos = a.get("pos")
        diac = a.get("diac")
        # dedupe=True (vocabulary enrichment): collapse case-ending variants of
        # the same lexeme. dedupe=False (free-text I'rab parser): keep every
        # distinct reading, only dropping exact full duplicates.
        # For the parser, two analyses with the same spelling can still differ
        # grammatically (case, mood, enclitic...) — keep those apart.
        key = (
            (root, lemma, pos)
            if req.dedupe
            else (root, lemma, pos, diac, a.get("cas"), a.get("mod"), a.get("enc0"), a.get("per"), a.get("num"), a.get("gen"), a.get("bw"))
        )
        if key in seen:
            continue
        seen.add(key)
        candidate = Candidate(root=root, lemma=lemma, pos=pos, diac=diac, gender=a.get("gen"), number=a.get("num"))
        if not req.dedupe:
            candidate.person = a.get("per")
            candidate.aspect = a.get("asp")
            candidate.mood = a.get("mod")
            candidate.case = a.get("cas")
            candidate.state = a.get("stt")
            candidate.voice = a.get("vox")
            candidate.prc0 = a.get("prc0")
            candidate.prc1 = a.get("prc1")
            candidate.prc2 = a.get("prc2")
            candidate.prc3 = a.get("prc3")
            candidate.enc0 = a.get("enc0")
            candidate.bw = a.get("bw")
        candidates.append(candidate)

    return AnalyzeResponse(word=req.word, candidates=candidates)
