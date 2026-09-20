-- ============================================================================
-- Al-Lisan Platform — Core PostgreSQL Schema
-- Deterministic, non-LLM Arabic linguistics platform
-- ============================================================================
-- Design principle: Quranic Corpus tokens (QADT) and Farasa-parsed library
-- tokens share ONE token/dependency model, so the I'rab UI, quiz engine, and
-- vocabulary module work identically regardless of text origin. Only the
-- import pipeline differs (QADT bulk-load vs Farasa API call).
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_trgm; -- fuzzy Arabic search on lemmas/roots

-- ============================================================================
-- 1. USERS
-- ============================================================================

CREATE TABLE users (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email               TEXT UNIQUE NOT NULL,
    password_hash       TEXT NOT NULL,
    display_name        TEXT,
    native_language     TEXT DEFAULT 'en',
    arabic_level        TEXT CHECK (arabic_level IN ('beginner','intermediate','advanced','classical')) DEFAULT 'beginner',
    timezone            TEXT DEFAULT 'UTC',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_login_at       TIMESTAMPTZ
);

-- ============================================================================
-- 2. LINGUISTIC REFERENCE / TAXONOMY TABLES
-- (Shared dictionary layer used by morphology, vocabulary, and quizzes)
-- ============================================================================

CREATE TABLE roots (
    id                  BIGSERIAL PRIMARY KEY,
    root_letters        TEXT NOT NULL UNIQUE,      -- e.g. 'ك ت ب'
    letter_count        SMALLINT NOT NULL,          -- 3, 4, quadriliteral etc.
    transliteration     TEXT,
    meaning_summary_en  TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_roots_letters_trgm ON roots USING gin (root_letters gin_trgm_ops);

-- POS tags kept as a lookup, not an enum, because Quranic Corpus and Farasa
-- use different tag sets (tagset column disambiguates provenance).
CREATE TABLE pos_tags (
    id                  SERIAL PRIMARY KEY,
    tagset              TEXT NOT NULL CHECK (tagset IN ('qadt','farasa','camel','custom')),
    code                TEXT NOT NULL,              -- raw source code, e.g. 'N', 'PN', 'V'
    name_ar             TEXT NOT NULL,              -- اسم، فعل، حرف...
    name_en             TEXT NOT NULL,
    category            TEXT,                       -- noun/verb/particle grouping
    UNIQUE (tagset, code)
);

-- Grammatical roles used as dependency-edge labels (Mubtada', Khabar, Fa'il...)
CREATE TABLE grammatical_roles (
    id                  SERIAL PRIMARY KEY,
    code                TEXT NOT NULL UNIQUE,       -- 'MUBTADA', 'KHABAR', 'FAAIL'
    name_ar             TEXT NOT NULL,
    name_en             TEXT NOT NULL,
    category            TEXT,                       -- nominal/verbal/particle-related
    rule_reference       TEXT                        -- e.g. 'Ajurrumiyyah ch.3'
);

-- I'rab case/mood signs (Harakat / Alamat)
CREATE TABLE case_signs (
    id                  SERIAL PRIMARY KEY,
    case_type           TEXT NOT NULL CHECK (case_type IN ('rafa','nasb','jarr','jazm','mabni')),
    sign_ar             TEXT NOT NULL,               -- ضمة، فتحة، كسرة، سكون، حذف النون...
    sign_en             TEXT NOT NULL,
    description_ar      TEXT
);

CREATE TABLE verb_forms (
    id                  SERIAL PRIMARY KEY,
    form_number         SMALLINT NOT NULL UNIQUE,    -- I..X
    wazn_pattern        TEXT NOT NULL,                -- فَعَّلَ، أَفْعَلَ...
    name_en             TEXT
);

-- Canonical dictionary entry — one row per (root + pos + meaning cluster).
-- Vocabulary items and morphology tokens both point here so a user studying
-- a word from the Quran and a word from a library book share one entry.
CREATE TABLE lemmas (
    id                  BIGSERIAL PRIMARY KEY,
    lemma_ar            TEXT NOT NULL,
    lemma_transliteration TEXT,
    root_id             BIGINT REFERENCES roots(id),
    pos_tag_id          INT REFERENCES pos_tags(id),
    verb_form_id        INT REFERENCES verb_forms(id),
    plural_form_ar      TEXT,
    meaning_en          TEXT,
    meaning_ar          TEXT,
    frequency_rank      INT,                          -- corpus frequency, for difficulty tiering
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_lemmas_root ON lemmas (root_id);
CREATE INDEX idx_lemmas_ar_trgm ON lemmas USING gin (lemma_ar gin_trgm_ops);

-- ============================================================================
-- 3. QURANIC CORPUS (imported verbatim from corpus.quran.com / QADT)
-- ============================================================================

CREATE TABLE quran_chapters (
    id                  SMALLINT PRIMARY KEY,          -- surah number 1-114
    name_ar             TEXT NOT NULL,
    name_en             TEXT NOT NULL,
    revelation_place    TEXT CHECK (revelation_place IN ('meccan','medinan')),
    verse_count         SMALLINT NOT NULL
);

CREATE TABLE quran_verses (
    id                  BIGSERIAL PRIMARY KEY,
    chapter_id          SMALLINT NOT NULL REFERENCES quran_chapters(id),
    verse_number        SMALLINT NOT NULL,
    text_uthmani        TEXT NOT NULL,
    text_simple         TEXT,
    UNIQUE (chapter_id, verse_number)
);

-- ============================================================================
-- 4. LIBRARY (Maktabah) — user-uploaded PDFs/EPUBs parsed via Farasa
-- ============================================================================

CREATE TABLE library_documents (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_user_id       UUID REFERENCES users(id) ON DELETE CASCADE,
    title               TEXT NOT NULL,
    author              TEXT,
    file_type           TEXT NOT NULL CHECK (file_type IN ('pdf','epub')),
    storage_path        TEXT NOT NULL,                 -- object storage key/URL
    page_count          INT,
    language            TEXT DEFAULT 'ar',
    processing_status   TEXT NOT NULL DEFAULT 'pending'
                         CHECK (processing_status IN ('pending','processing','completed','failed')),
    uploaded_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- One row per sentence/paragraph unit extracted from a document, prior to
-- (or after) Farasa segmentation. Mirrors quran_verses' role for the Quran.
CREATE TABLE library_text_units (
    id                  BIGSERIAL PRIMARY KEY,
    document_id         UUID NOT NULL REFERENCES library_documents(id) ON DELETE CASCADE,
    page_number         INT,
    sequence_in_doc      INT NOT NULL,
    raw_text            TEXT NOT NULL,
    processing_status   TEXT NOT NULL DEFAULT 'pending'
                         CHECK (processing_status IN ('pending','tokenized','failed')),
    UNIQUE (document_id, sequence_in_doc)
);

CREATE TABLE extraction_jobs (
    id                  BIGSERIAL PRIMARY KEY,
    document_id         UUID NOT NULL REFERENCES library_documents(id) ON DELETE CASCADE,
    job_type            TEXT NOT NULL CHECK (job_type IN ('tokenize','pos_tag','dependency_parse','fawaid_extract')),
    status              TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','running','completed','failed')),
    started_at          TIMESTAMPTZ,
    completed_at        TIMESTAMPTZ,
    error_message       TEXT
);

-- ============================================================================
-- 5. MORPHOLOGY TOKENS & DEPENDENCY GRAPH (unified for Quran + Library)
-- ============================================================================

CREATE TABLE tokens (
    id                          BIGSERIAL PRIMARY KEY,

    -- Exactly one of these is set — the token's source unit.
    quran_verse_id              BIGINT REFERENCES quran_verses(id) ON DELETE CASCADE,
    library_text_unit_id        BIGINT REFERENCES library_text_units(id) ON DELETE CASCADE,

    position_in_unit            INT NOT NULL,           -- word order within the verse/sentence
    surface_form                TEXT NOT NULL,          -- as printed, with tashkeel
    surface_form_bare           TEXT,                   -- undiacritized, for search

    lemma_id                    BIGINT REFERENCES lemmas(id),
    root_id                     BIGINT REFERENCES roots(id),
    pos_tag_id                  INT REFERENCES pos_tags(id),
    case_sign_id                INT REFERENCES case_signs(id),

    -- morphological features
    gender                      TEXT CHECK (gender IN ('m','f')),
    grammatical_number          TEXT CHECK (grammatical_number IN ('singular','dual','plural')),
    person                      SMALLINT CHECK (person IN (1,2,3)),
    definiteness                TEXT CHECK (definiteness IN ('definite','indefinite')),
    verb_aspect                 TEXT CHECK (verb_aspect IN ('perfect','imperfect','imperative')),
    verb_mood                   TEXT CHECK (verb_mood IN ('indicative','subjunctive','jussive')),

    parent_segment_token_id     BIGINT REFERENCES tokens(id), -- groups clitic segments (و+الكتاب)
    analysis_source             TEXT NOT NULL CHECK (analysis_source IN ('qadt','farasa','camel','manual')),
    raw_features                JSONB,                  -- verbatim source feature string, for audit/debug

    created_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT chk_token_single_source CHECK (
        (quran_verse_id IS NOT NULL)::int + (library_text_unit_id IS NOT NULL)::int = 1
    )
);
CREATE INDEX idx_tokens_quran_verse ON tokens (quran_verse_id, position_in_unit);
CREATE INDEX idx_tokens_library_unit ON tokens (library_text_unit_id, position_in_unit);
CREATE INDEX idx_tokens_lemma ON tokens (lemma_id);
CREATE INDEX idx_tokens_root ON tokens (root_id);

-- Dependency graph: one head per token (nullable = sentence root).
CREATE TABLE dependency_edges (
    id                  BIGSERIAL PRIMARY KEY,
    token_id            BIGINT NOT NULL UNIQUE REFERENCES tokens(id) ON DELETE CASCADE,
    head_token_id       BIGINT REFERENCES tokens(id) ON DELETE CASCADE,
    grammatical_role_id INT NOT NULL REFERENCES grammatical_roles(id),
    relation_label_raw  TEXT,                            -- original QADT/Farasa tag, for audit
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_dependency_head ON dependency_edges (head_token_id);

-- ============================================================================
-- 6. FAWA'ID (extracted insights, linked to a Quran verse or library unit)
-- ============================================================================

CREATE TABLE fawaid (
    id                  BIGSERIAL PRIMARY KEY,
    quran_verse_id      BIGINT REFERENCES quran_verses(id) ON DELETE CASCADE,
    library_text_unit_id BIGINT REFERENCES library_text_units(id) ON DELETE CASCADE,
    related_token_id    BIGINT REFERENCES tokens(id) ON DELETE SET NULL,
    category            TEXT NOT NULL CHECK (category IN ('vocabulary','balaghah','idiom','grammar_note')),
    title               TEXT NOT NULL,
    body_ar             TEXT,
    body_en             TEXT,
    created_by          TEXT NOT NULL CHECK (created_by IN ('system','user')),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT chk_fawaid_single_source CHECK (
        (quran_verse_id IS NOT NULL)::int + (library_text_unit_id IS NOT NULL)::int = 1
    )
);

-- ============================================================================
-- 7. VOCABULARY & SPACED REPETITION (SM-2)
-- ============================================================================

CREATE TABLE vocabulary_items (
    id                  BIGSERIAL PRIMARY KEY,
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lemma_id            BIGINT REFERENCES lemmas(id),      -- linked to dictionary, when matched
    custom_word_ar      TEXT,                               -- fallback for unmatched/manual entries
    custom_root         TEXT,
    example_sentence_ar TEXT,
    example_sentence_en TEXT,
    audio_url           TEXT,
    notes               TEXT,
    source              TEXT NOT NULL CHECK (source IN ('manual','library_extraction','quran')),
    source_token_id     BIGINT REFERENCES tokens(id),       -- provenance, if extracted
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT chk_vocab_has_word CHECK (lemma_id IS NOT NULL OR custom_word_ar IS NOT NULL)
);
CREATE INDEX idx_vocab_user ON vocabulary_items (user_id);

CREATE TABLE srs_cards (
    id                  BIGSERIAL PRIMARY KEY,
    vocabulary_item_id  BIGINT NOT NULL REFERENCES vocabulary_items(id) ON DELETE CASCADE,
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    card_type           TEXT NOT NULL CHECK (card_type IN ('ar_to_en','en_to_ar','root_id','cloze')),

    -- SM-2 state
    easiness_factor     NUMERIC(4,2) NOT NULL DEFAULT 2.5,
    interval_days       INT NOT NULL DEFAULT 0,
    repetitions         INT NOT NULL DEFAULT 0,
    due_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_reviewed_at    TIMESTAMPTZ,

    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (vocabulary_item_id, card_type)
);
CREATE INDEX idx_srs_due ON srs_cards (user_id, due_at);

CREATE TABLE srs_review_log (
    id                  BIGSERIAL PRIMARY KEY,
    card_id             BIGINT NOT NULL REFERENCES srs_cards(id) ON DELETE CASCADE,
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    quality_rating      SMALLINT NOT NULL CHECK (quality_rating BETWEEN 0 AND 5), -- SM-2 scale
    previous_interval   INT NOT NULL,
    new_interval        INT NOT NULL,
    previous_ef         NUMERIC(4,2) NOT NULL,
    new_ef              NUMERIC(4,2) NOT NULL,
    reviewed_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_review_log_card ON srs_review_log (card_id, reviewed_at);

-- ============================================================================
-- 8. RULE-BASED QUIZ ENGINE
-- ============================================================================

CREATE TABLE quiz_templates (
    id                  BIGSERIAL PRIMARY KEY,
    quiz_type           TEXT NOT NULL CHECK (quiz_type IN
                         ('root_matching','pos_selection','diacritic_placement',
                          'irab_reconstruction','sentence_ordering','cloze')),
    difficulty_tier     TEXT NOT NULL CHECK (difficulty_tier IN ('beginner','intermediate','advanced','classical')),
    template_body       JSONB NOT NULL,       -- generation rules / slot definitions
    explanation_template TEXT,
    rule_reference       TEXT,                 -- e.g. 'Alfiyyah bayt 42'
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Generated question instances, cached so repeated attempts stay consistent
-- and so difficulty/coverage analytics can be run without regenerating.
CREATE TABLE quiz_questions (
    id                  BIGSERIAL PRIMARY KEY,
    template_id         BIGINT NOT NULL REFERENCES quiz_templates(id),
    source_token_id     BIGINT REFERENCES tokens(id),
    source_vocabulary_item_id BIGINT REFERENCES vocabulary_items(id),
    question_payload    JSONB NOT NULL,        -- rendered prompt + options
    correct_answer      JSONB NOT NULL,
    distractors         JSONB,
    difficulty_tier     TEXT NOT NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE quiz_attempts (
    id                  BIGSERIAL PRIMARY KEY,
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    question_id         BIGINT REFERENCES quiz_questions(id),
    template_id         BIGINT NOT NULL REFERENCES quiz_templates(id),
    user_answer         JSONB NOT NULL,
    is_correct          BOOLEAN NOT NULL,
    response_time_ms    INT,
    answered_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_quiz_attempts_user ON quiz_attempts (user_id, answered_at);

-- Materialized per-user aggregate for fast dashboard stats.
CREATE TABLE user_quiz_stats (
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    quiz_type           TEXT NOT NULL,
    difficulty_tier     TEXT NOT NULL,
    total_attempts      INT NOT NULL DEFAULT 0,
    correct_attempts    INT NOT NULL DEFAULT 0,
    current_streak      INT NOT NULL DEFAULT 0,
    last_attempt_at     TIMESTAMPTZ,
    PRIMARY KEY (user_id, quiz_type, difficulty_tier)
);
