/**
 * Server-only client for the self-hosted CAMeL Tools service
 * (services/camel/). Shared by the vocabulary enrichment route (FR-4.2) and
 * the free-text I'rab parser route (FR-1.1).
 */

const CAMEL_SERVICE_URL = process.env.CAMEL_SERVICE_URL ?? "http://localhost:8001";

export interface CamelCandidate {
  root: string | null;
  lemma: string | null;
  pos: string | null;
  diac: string | null;
  gender: string | null;
  number: string | null;
  // Morphosyntactic features — present only for dedupe=false (the I'rab
  // parser). CAMeL's own codes; see services/camel/app.py's Candidate.
  person?: string | null;
  aspect?: string | null;
  mood?: string | null;
  case?: string | null;
  state?: string | null;
  voice?: string | null;
  prc0?: string | null;
  prc1?: string | null;
  prc2?: string | null;
  prc3?: string | null;
  enc0?: string | null;
  bw?: string | null;
}

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
    throw new CamelServiceUnavailableError("CAMeL Tools service is unreachable — is it running? See services/camel/README.md");
  }

  if (!upstream.ok) {
    throw new Error("CAMeL Tools service returned an error");
  }

  const data = (await upstream.json()) as { word: string; candidates: CamelCandidate[] };
  if (!dedupe && data.candidates.length > 0 && data.candidates.every((c) => !("aspect" in c))) {
    throw new CamelServiceOutdatedError(
      "The CAMeL Tools service is running an older version — restart it (services/camel: uvicorn app:app --port 8001) so the I'rab parser gets the morphological features it needs."
    );
  }
  return data.candidates;
}
