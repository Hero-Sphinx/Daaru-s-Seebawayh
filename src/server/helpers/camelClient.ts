/**
 * Server-only client for the self-hosted CAMeL Tools service
 * (services/camel/). Shared by the vocabulary enrichment route (FR-4.2) and
 * the free-text I'rab parser route (FR-1.1).
 */

import { ApiError } from "@/server/constants";
import type { MorphCandidate } from "@/types";

const CAMEL_SERVICE_URL = process.env.CAMEL_SERVICE_URL ?? "http://localhost:8001";

/** CAMeL Tools' analysis of one reading of a word. */
export type CamelCandidate = MorphCandidate;

export class CamelServiceUnavailableError extends Error {}

/**
 * The running service predates the morphosyntactic features the I'rab
 * parser needs (services/camel/app.py returns `aspect`, `bw`… for
 * dedupe=false). Surfaced as a clear instruction instead of letting every
 * verb fail with "tense couldn't be determined".
 */
export class CamelServiceOutdatedError extends CamelServiceUnavailableError {}

/**
 * dedupe=true (default) collapses case-ending variants of the same lexeme —
 * right for vocabulary enrichment. dedupe=false keeps every distinct
 * (root, lemma, pos, diac) reading — needed by the free-text parser, which
 * matches against the user's exact input diacritics.
 */
export async function analyzeWord(word: string, dedupe = true): Promise<CamelCandidate[]> {
  let upstream: Response;
  try {
    upstream = await fetch(`${CAMEL_SERVICE_URL}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ word, dedupe }),
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    // Developers get the fix; learners get something they can act on. A
    // free-tier host sleeps when idle, so the usual cause in production is a
    // cold start that outlasts the timeout — the next try normally works.
    console.warn(`CAMeL Tools service unreachable at ${CAMEL_SERVICE_URL} — is it running? See services/camel/README.md`);
    throw new CamelServiceUnavailableError("The word-analysis service isn't responding right now — it may be waking up. Please try again in a minute.");
  }

  if (!upstream.ok) {
    console.error(`CAMeL Tools service answered ${upstream.status} for "${word}"`);
    throw new ApiError(502, "The word-analysis service couldn't analyse that word.");
  }

  const data = (await upstream.json()) as { word: string; candidates: CamelCandidate[] };
  if (!dedupe && data.candidates.length > 0 && data.candidates.every((c) => !("aspect" in c))) {
    throw new CamelServiceOutdatedError(
      "The CAMeL Tools service is running an older version — restart it (services/camel: uvicorn app:app --port 8001) so the I'rab parser gets the morphological features it needs."
    );
  }
  return data.candidates;
}
