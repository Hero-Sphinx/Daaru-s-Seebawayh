-- Phase 4 template engine — already folded into db/schema.sql; upgrades an
-- older database. Idempotent.
ALTER TABLE quiz_templates ADD COLUMN IF NOT EXISTS code TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS quiz_templates_code_key ON quiz_templates (code);

-- Legacy rows were one-per-quiz_type; give them that as their code so the
-- seed's upsert-by-code adopts them instead of duplicating them.
UPDATE quiz_templates SET code = quiz_type WHERE code IS NULL;

ALTER TABLE quiz_templates DROP CONSTRAINT IF EXISTS quiz_templates_quiz_type_check;
ALTER TABLE quiz_templates ADD CONSTRAINT quiz_templates_quiz_type_check CHECK (quiz_type IN
    ('root_matching','pos_selection','diacritic_placement',
     'irab_reconstruction','sentence_ordering','cloze',
     'vocab_recall','wazn_identification',
     'book_comprehension','fawaid_recall',
     'sentence_meaning_match',
     'case_identification'));
