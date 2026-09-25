-- Accounts that others can use: login rate limiting and password reset by
-- email. Already folded into db/schema.sql; upgrades an older database.
-- Idempotent.

-- One row per failed sign-in / reset request, keyed by what's being
-- protected ('email:<address>' and 'ip:<address>'). Rows older than the
-- window are ignored and cleaned up opportunistically (src/lib/rate-limit.ts).
CREATE TABLE IF NOT EXISTS auth_attempts (
    id                  BIGSERIAL PRIMARY KEY,
    bucket              TEXT NOT NULL,
    kind                TEXT NOT NULL CHECK (kind IN ('login','reset')),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_auth_attempts_bucket ON auth_attempts (kind, bucket, created_at);

-- Single-use reset links. Like sessions, only the SHA-256 of the token is
-- stored, so a leaked table can't be used to reset anyone's password.
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash          TEXT NOT NULL UNIQUE,
    expires_at          TIMESTAMPTZ NOT NULL,
    used_at             TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user ON password_reset_tokens (user_id);
