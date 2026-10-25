-- Brief tafsīr for every āyah, shown under it in the Qur'an reader:
-- at-Tafsīr al-Muyassar (Arabic, King Fahd Complex) and al-Mukhtaṣar fī
-- Tafsīr al-Qurʾān (English, Tafsir Center for Quranic Studies), both from
-- QuranEnc.com. Filled by scripts/import-quran-tafsir.ts. Already folded into
-- db/schema.sql; upgrades an older database. Idempotent.
ALTER TABLE quran_verses ADD COLUMN IF NOT EXISTS tafsir_muyassar_ar TEXT;
ALTER TABLE quran_verses ADD COLUMN IF NOT EXISTS tafsir_mukhtasar_en TEXT;
