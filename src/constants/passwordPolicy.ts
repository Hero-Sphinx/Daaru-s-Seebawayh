// Client-safe (no node:crypto), shared by the signup form and src/server/lib/password.ts.
export const MIN_PASSWORD_LENGTH = 8;
/** Upper bound so a huge "password" can't tie up scrypt. */
export const MAX_PASSWORD_LENGTH = 200;
export const MAX_DISPLAY_NAME_LENGTH = 60;
