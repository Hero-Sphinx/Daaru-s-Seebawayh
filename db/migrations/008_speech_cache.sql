-- Pronunciation audio for vocabulary words, generated once (Gemini TTS) and
-- reused for everyone after that (src/app/api/speech/route.ts). Already folded
-- into db/schema.sql; upgrades an older database. Idempotent.
CREATE TABLE IF NOT EXISTS speech_cache (
    text_key            TEXT PRIMARY KEY,          -- the word, NFC-normalized, exactly as vowelled
    audio               BYTEA NOT NULL,            -- WAV
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
