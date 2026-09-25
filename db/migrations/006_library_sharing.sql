-- Phase 5: annotations + sharing on library documents. Already folded into
-- db/schema.sql; upgrades an older database. Idempotent.

-- Who else can open a document. The owner (library_documents.owner_user_id)
-- is never listed here; 'viewer' can read the text and everyone's shared
-- notes, 'annotator' can also add notes of their own.
CREATE TABLE IF NOT EXISTS library_document_shares (
    document_id         UUID NOT NULL REFERENCES library_documents(id) ON DELETE CASCADE,
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role                TEXT NOT NULL CHECK (role IN ('viewer','annotator')),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (document_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_library_document_shares_user ON library_document_shares (user_id);

-- A highlighted passage on one page plus an optional note. Offsets index
-- into library_text_units.raw_text; quote is kept verbatim so the note still
-- makes sense (and can be re-anchored) if offsets ever drift.
CREATE TABLE IF NOT EXISTS library_annotations (
    id                  BIGSERIAL PRIMARY KEY,
    document_id         UUID NOT NULL REFERENCES library_documents(id) ON DELETE CASCADE,
    text_unit_id        BIGINT NOT NULL REFERENCES library_text_units(id) ON DELETE CASCADE,
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    start_offset        INT NOT NULL CHECK (start_offset >= 0),
    end_offset          INT NOT NULL,
    quote               TEXT NOT NULL,
    note                TEXT,
    -- 'private' notes are visible only to their author, even on a shared document.
    visibility          TEXT NOT NULL DEFAULT 'shared' CHECK (visibility IN ('private','shared')),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_annotation_range CHECK (end_offset > start_offset)
);
CREATE INDEX IF NOT EXISTS idx_library_annotations_unit ON library_annotations (text_unit_id);
CREATE INDEX IF NOT EXISTS idx_library_annotations_document ON library_annotations (document_id);
