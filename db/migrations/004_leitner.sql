-- Phase 5: Leitner boxes as an alternative to SM-2 — already folded into
-- db/schema.sql; upgrades an older database. Idempotent.
ALTER TABLE users ADD COLUMN IF NOT EXISTS srs_algorithm TEXT NOT NULL DEFAULT 'sm2';
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_srs_algorithm_check;
ALTER TABLE users ADD CONSTRAINT users_srs_algorithm_check CHECK (srs_algorithm IN ('sm2','leitner'));

ALTER TABLE srs_cards ADD COLUMN IF NOT EXISTS leitner_box SMALLINT NOT NULL DEFAULT 1;
ALTER TABLE srs_cards DROP CONSTRAINT IF EXISTS srs_cards_leitner_box_check;
ALTER TABLE srs_cards ADD CONSTRAINT srs_cards_leitner_box_check CHECK (leitner_box BETWEEN 1 AND 5);
