-- Book flashcards released with the class: an admin flag on users, and the
-- decks an admin has unlocked. Already folded into db/schema.sql; upgrades an
-- older database. Idempotent.
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS flashcard_releases (
    book_slug           TEXT NOT NULL,
    section_number      SMALLINT NOT NULL CHECK (section_number > 0),
    released_by         UUID REFERENCES users(id) ON DELETE SET NULL,
    released_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (book_slug, section_number)
);

-- No rows are seeded here on purpose: re-running this file must never re-open
-- a deck an admin has locked. Decks are unlocked from /admin.
