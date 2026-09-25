"""Parses the Quranic Arabic Corpus's raw morphology file (see
data/quranic-corpus/NOTICE.md for provenance/license) into a deduped
root/lemma/POS lookup table Daaru-s-Seebawayh can use as a deterministic fallback
candidate source for classical/Quranic vocabulary CAMeL Tools' MSA-only
database doesn't cover.

Run from services/camel with its venv active:
    .venv/Scripts/python.exe scripts/import_quranic_corpus.py

Only content-bearing POS tags (noun, proper noun, verb, adjective, pronoun)
are extracted — function words (prepositions, conjunctions, particles,
demonstratives, ...) are already covered deterministically by Daaru-s-Seebawayh's own
closed-class particle list (src/helpers/irab/particles.ts), so this corpus adds
nothing there; importing them would just be noise.

Orthographic normalization (sun-letter assimilation, matres lectionis, etc.)
is intentionally NOT done here — that logic already exists once, in
src/helpers/irab/normalize.ts, and duplicating it in Python would risk the two
implementations drifting apart. This script only transliterates
(Buckwalter -> Arabic, using camel_tools' own vetted mapping table) and
extracts fields; the TypeScript loader applies normalizeForMatch at lookup
time, same as it already does for live CAMeL candidates.
"""

import json
import re
from collections import defaultdict
from pathlib import Path

from camel_tools.utils.charmap import CharMapper

# This corpus uses JQuranTree's *extended* Buckwalter scheme, not plain
# Buckwalter: 14 extra ASCII symbols (^ # : @ " [ ; , . ! - + % ]) stand in
# for Uthmani recitation/pause marks (maddah, hamza-above, small recitation
# letters, pause stops, ...) that plain Buckwalter has no symbol for — see
# https://corpus.quran.com/java/buckwalter.jsp ("Extended Buckwalter
# Transliteration"). camel_tools' standard bw2ar mapper doesn't recognize
# them and passes them through as literal ASCII, which garbles the decoded
# Arabic (e.g. a stray "^" left sitting in the output). None of them carry
# information a standard MSA typist would ever produce, so they're dropped
# before decoding rather than mapped — this is a fallback vocabulary
# source, not a recitation tool, and root/lemma quality matters far more
# than reproducing an occurrence-specific Uthmani pause mark.
STANDARD_BUCKWALTER_RE = re.compile(r"[^'|>&<}AbptvjHxd*rzs$SDTZEgfqklmnhwyYFNKaui~o`{]")


def strip_extended_symbols(buckwalter: str) -> str:
    return STANDARD_BUCKWALTER_RE.sub("", buckwalter)

SCRIPT_DIR = Path(__file__).resolve().parent
REPO_ROOT = SCRIPT_DIR.parent.parent.parent
RAW_FILE = REPO_ROOT / "data" / "quranic-corpus" / "quranic-corpus-morphology-0.4.txt"
OUTPUT_FILE = REPO_ROOT / "src" / "lib" / "data" / "quranic-corpus-words.json"

# Corpus TAG -> pos string, chosen to match what coarsePos() in
# src/helpers/irab/classify.ts already expects from CAMeL Tools' own tags
# (noun/noun_prop -> "noun" bucket via startsWith("noun"), adj -> same
# bucket, verb -> "verb" bucket, pron -> "noun" bucket) — no separate
# mapping table needed on the TypeScript side.
CONTENT_POS_MAP = {
    "N": "noun",
    "PN": "noun_prop",
    "V": "verb",
    "ADJ": "adj",
    "PRON": "pron",
}

LOCATION_RE = re.compile(r"^\((\d+):(\d+):(\d+):(\d+)\)$")


def decode(mapper: CharMapper, buckwalter: str) -> str:
    return mapper(strip_extended_symbols(buckwalter))


def decode_root(mapper: CharMapper, buckwalter_root: str) -> str:
    # Corpus roots are bare consonant strings ("Hmd"); Daaru-s-Seebawayh's convention
    # (matching CAMeL Tools' own output) is space-separated letters ("ح م د").
    return " ".join(mapper(ch) for ch in strip_extended_symbols(buckwalter_root))


def parse_features(features: str) -> dict[str, str]:
    parsed: dict[str, str] = {}
    for part in features.split("|"):
        if ":" in part:
            key, _, value = part.partition(":")
            parsed[key] = value
    return parsed


def main() -> None:
    mapper = CharMapper.builtin_mapper("bw2ar")

    # (chapter, verse, word) -> list of (segment_index, form, tag, features)
    words: dict[tuple[int, int, int], list[tuple[int, str, str, str]]] = defaultdict(list)

    with RAW_FILE.open("r", encoding="utf-8") as f:
        for line in f:
            line = line.rstrip("\n")
            if not line or line.startswith("#") or line.startswith("LOCATION"):
                continue
            columns = line.split("\t")
            if len(columns) != 4:
                continue
            location, form, tag, features = columns
            m = LOCATION_RE.match(location)
            if not m:
                continue
            chapter, verse, word, segment = (int(g) for g in m.groups())
            words[(chapter, verse, word)].append((segment, form, tag, features))

    seen: set[tuple[str, str, str, str]] = set()
    entries: list[dict[str, str | None]] = []
    skipped_no_stem = 0

    for segments in words.values():
        segments.sort(key=lambda s: s[0])
        full_buckwalter = "".join(s[1] for s in segments)

        stem = None
        for segment_index, form, tag, features in segments:
            if features.startswith("STEM|") and tag in CONTENT_POS_MAP:
                stem = (form, tag, features)
                break
        if stem is None:
            skipped_no_stem += 1
            continue

        _, tag, features = stem
        parsed = parse_features(features)
        lem_bw = parsed.get("LEM")
        root_bw = parsed.get("ROOT")
        if lem_bw is None:
            continue

        diac = decode(mapper, full_buckwalter)
        lemma = decode(mapper, lem_bw)
        root = decode_root(mapper, root_bw) if root_bw else None
        pos = CONTENT_POS_MAP[tag]

        key = (diac, root or "", lemma, pos)
        if key in seen:
            continue
        seen.add(key)
        entries.append({"diac": diac, "root": root, "lemma": lemma, "pos": pos})

    entries.sort(key=lambda e: (e["diac"], e["pos"]))

    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    with OUTPUT_FILE.open("w", encoding="utf-8") as f:
        json.dump(entries, f, ensure_ascii=False, indent=None, separators=(",", ":"))

    print(f"word-groups: {len(words)}")
    print(f"skipped (no content-POS stem): {skipped_no_stem}")
    print(f"unique entries written: {len(entries)}")
    print(f"output: {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
