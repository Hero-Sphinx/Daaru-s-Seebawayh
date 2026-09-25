-- Phase 2 (Quranic Corpus import) columns/indexes — already folded into
-- db/schema.sql; this upgrades a database created before them. Idempotent.
ALTER TABLE quran_chapters ADD COLUMN IF NOT EXISTS name_transliteration TEXT;

ALTER TABLE tokens ADD COLUMN IF NOT EXISTS verb_voice TEXT CHECK (verb_voice IN ('active','passive'));
ALTER TABLE tokens ADD COLUMN IF NOT EXISTS grammatical_case TEXT CHECK (grammatical_case IN ('nominative','accusative','genitive'));
ALTER TABLE tokens ADD COLUMN IF NOT EXISTS segment_index SMALLINT;
ALTER TABLE tokens ADD COLUMN IF NOT EXISTS segment_type TEXT CHECK (segment_type IN ('prefix','stem','suffix'));
CREATE INDEX IF NOT EXISTS idx_tokens_parent_segment ON tokens (parent_segment_token_id);

CREATE UNIQUE INDEX IF NOT EXISTS uq_lemmas_natural ON lemmas (lemma_ar, root_id, pos_tag_id) NULLS NOT DISTINCT;
