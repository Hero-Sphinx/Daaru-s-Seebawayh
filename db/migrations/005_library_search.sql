-- Phase 5: root-aware + diacritic-insensitive library search. Already folded
-- into db/schema.sql; this upgrades an older database. Idempotent.
--
-- The expression MUST match normalizeArabicForSearch() in
-- src/lib/arabic-normalize.ts exactly: strip harakat (U+064B-065F), dagger
-- alif (U+0670), Qur'anic marks (U+06D6-06ED) and tatweel (U+0640); fold
-- hamza/madda/wasla alifs (U+0623/0625/0622/0671) to bare alif (U+0627).
-- Built with chr(<decimal code point>) so no invisible combining characters
-- sit in the source.
ALTER TABLE library_text_units ADD COLUMN IF NOT EXISTS raw_text_normalized TEXT
    GENERATED ALWAYS AS (
        translate(
            regexp_replace(raw_text, '[' || chr(1611) || '-' || chr(1631) || chr(1648) || chr(1750) || '-' || chr(1773) || chr(1600) || ']', '', 'g'),
            chr(1571) || chr(1573) || chr(1570) || chr(1649), repeat(chr(1575), 4))
    ) STORED;

-- pg_trgm GIN index: accelerates both substring search and the regex
-- pre-filter root search uses.
CREATE INDEX IF NOT EXISTS idx_library_text_units_normalized_trgm
    ON library_text_units USING gin (raw_text_normalized gin_trgm_ops);
