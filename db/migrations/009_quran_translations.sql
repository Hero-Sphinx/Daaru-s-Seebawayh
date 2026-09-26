-- Word-by-word English for Qur'an words (Quran.com), shown in the Qur'an
-- reader and used to give each Qur'an lemma a meaning. Filled by
-- scripts/import-quran-translations.ts. Already folded into db/schema.sql;
-- upgrades an older database. Idempotent.
ALTER TABLE tokens ADD COLUMN IF NOT EXISTS translation_en TEXT;
