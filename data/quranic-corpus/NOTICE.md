# Quranic Arabic Corpus — data provenance

`quranic-corpus-morphology-0.4.txt` is an unmodified, verbatim copy of the
Quranic Arabic Corpus's morphological data release (version 0.4), downloaded
from a GitHub mirror of the file distributed at
[corpus.quran.com/download](https://corpus.quran.com/download/) (© 2011 Kais
Dukes, GNU General Public License; see the file's own embedded copyright
header for the exact terms). It also bundles the Tanzil Quran text (Uthmani,
v1.0.2) under its own Creative Commons BY-ND 3.0 terms — see that same
header.

Per the file's terms of use:

- This file itself must stay verbatim/unmodified if copied — it does, here.
- Its annotation may be used in an application, provided the source
  (Quranic Arabic Corpus) is clearly indicated and a link is made to
  <http://corpus.quran.com>.

Daaru-s-Seebawayh does exactly that: `services/camel/scripts/import_quranic_corpus.py`
reads this file (never modifies it) and derives a separate, generated
lookup table (`src/lib/data/quranic-corpus-words.json`) used as a
deterministic fallback root/lemma/POS source for classical/Quranic
vocabulary CAMeL Tools' MSA-only database doesn't cover. Any word sourced
from it is labeled `analysisSource: "quranic_corpus"` in the UI, distinct
from live CAMeL analysis, and this notice + a link to corpus.quran.com is
kept in the main README's data-sources section.
