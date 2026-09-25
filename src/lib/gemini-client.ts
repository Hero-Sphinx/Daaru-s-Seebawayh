/**
 * Gemini API client — used for FR-2.2/2.3 (chapter summaries, Fawā'id
 * extraction) and OCR of scanned/image-only PDF pages (transcription, not a
 * grammar claim — see src/lib/library/extract-pdf.ts). Never used for grammar/
 * morphology claims — see README.md's AI usage policy. Everything this
 * produces must be labeled "AI-generated, unverified" in the UI; it is not
 * cross-checked against a verified source.
 *
 * Model name is configurable (GEMINI_MODEL) since Gemini model identifiers
 * change over time — default is current as of this writing, but if it 404s,
 * check https://ai.google.dev/gemini-api/docs/models and set the env var.
 */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-3.8-flash";

export class GeminiNotConfiguredError extends Error {}

/**
 * Thrown for a 429 whose body identifies it as RESOURCE_EXHAUSTED (a real
 * quota cap, not transient rate limiting) — confirmed live: the free tier
 * caps at 20 requests, easily hit mid-way through OCR'ing a multi-page
 * scanned book. Retrying this with backoff is futile (the quota resets on
 * Google's clock, typically daily, not in the ~30s a few retries cover) and
 * previously caused exactly that: every remaining page independently
 * retried the same failure 4x with backoff before giving up, turning one
 * exhausted quota into a multi-minute stall. Callers that process several
 * items in one request (see extractPdfText's OCR loop) should catch this
 * and stop attempting further items immediately instead of continuing.
 */
export class GeminiQuotaExhaustedError extends Error {}

interface JsonSchema {
  type: string;
  [key: string]: unknown;
}

const MAX_RETRIES = 4;
const RETRY_BASE_DELAY_MS = 2000;

/**
 * Gemini's popular flash models return 503 "high demand" fairly often on
 * the free tier — confirmed live while building this (see ROADMAP.md).
 * Retries with exponential backoff before giving up. 429 is deliberately
 * NOT retried here — see GeminiQuotaExhaustedError's header for why a short
 * backoff doesn't help with an exhausted quota, and callGemini distinguishes
 * that from a merely-rate-limited 429 before deciding whether to retry.
 */
async function fetchWithRetry(url: string, init: RequestInit): Promise<Response> {
  let response: Response;
  for (let attempt = 0; ; attempt++) {
    response = await fetch(url, init);
    if (response.status !== 503 || attempt === MAX_RETRIES) {
      return response;
    }
    await new Promise((resolve) => setTimeout(resolve, RETRY_BASE_DELAY_MS * 2 ** attempt));
  }
}

type ContentPart = { text: string } | { inlineData: { mimeType: string; data: string } };

/**
 * Quota cooldown (circuit breaker). Confirmed live: once the free tier's
 * request cap is hit, every further call — e.g. each word click in the
 * Library reader — still went to Google, failed with the same 429, and
 * logged a multi-line error. After a 429 we stop calling until Google's own
 * "retry in Ns" hint has passed (floor of 60s when there's no hint), and
 * fail fast locally instead. Per server process, which is the right scope:
 * the quota is per API key, not per request.
 */
const MIN_COOLDOWN_MS = 60_000;
let quotaBlockedUntil = 0;

/** Parses Gemini's "Please retry in 27.08s" hint (message text or RetryInfo "27s") into ms; null if absent. */
export function parseRetryDelayMs(body: string): number | null {
  const m = /retry in ([\d.]+)s/i.exec(body) ?? /"retryDelay":\s*"([\d.]+)s"/.exec(body);
  return m ? Math.ceil(Number(m[1]) * 1000) : null;
}

/** For callers that want to skip optional Gemini work entirely while cooling down. */
export function isGeminiCoolingDown(): boolean {
  return Date.now() < quotaBlockedUntil;
}

const DEFAULT_TIMEOUT_MS = 90_000;

/** True for a request that hit its timeout (AbortSignal.timeout) rather than failing outright. */
export function isGeminiTimeout(err: unknown): boolean {
  return err instanceof Error && (err.name === "TimeoutError" || err.name === "AbortError");
}

/** One generateContent call with the shared key check, quota cool-down and 503 retries. Returns the parsed response body. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function postGemini(model: string, body: unknown, timeoutMs: number): Promise<any> {
  if (!GEMINI_API_KEY) {
    throw new GeminiNotConfiguredError("GEMINI_API_KEY is not set — add it to .env to enable this feature");
  }
  if (isGeminiCoolingDown()) {
    const seconds = Math.ceil((quotaBlockedUntil - Date.now()) / 1000);
    throw new GeminiQuotaExhaustedError(`Gemini quota exhausted — not retrying for another ${seconds}s`);
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
  const res = await fetchWithRetry(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    if (res.status === 429) {
      const delay = Math.max(parseRetryDelayMs(body) ?? 0, MIN_COOLDOWN_MS);
      quotaBlockedUntil = Date.now() + delay;
      throw new GeminiQuotaExhaustedError(`Gemini quota exceeded (cooling down ${Math.round(delay / 1000)}s): ${body.slice(0, 300)}`);
    }
    throw new Error(`Gemini API error (${res.status}): ${body.slice(0, 500)}`);
  }
  return res.json();
}

async function callGemini<T>(parts: ContentPart[], schema: JsonSchema, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<T> {
  const data = await postGemini(
    GEMINI_MODEL,
    {
      contents: [{ role: "user", parts }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.3,
      },
    },
    timeoutMs
  );
  const text: string | undefined = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("Gemini returned no content (may have been blocked by safety filters)");
  }
  return JSON.parse(text) as T;
}

export async function generateStructured<T>(prompt: string, schema: JsonSchema): Promise<T> {
  return callGemini<T>([{ text: prompt }], schema);
}

/**
 * Same as generateStructured, but with an image attached (Gemini's
 * multimodal input) — used only for OCR of scanned/image-only PDF pages
 * (src/lib/library/extract-pdf.ts). Transcription, not a grammar claim, so this
 * stays within the AI usage policy the same way summaries do; the caller
 * is responsible for labeling the result "AI-extracted (OCR), unverified"
 * wherever it's displayed.
 */
export async function generateStructuredFromImage<T>(
  prompt: string,
  schema: JsonSchema,
  image: { mimeType: string; base64Data: string },
  options: { timeoutMs?: number } = {}
): Promise<T> {
  return callGemini<T>([{ text: prompt }, { inlineData: { mimeType: image.mimeType, data: image.base64Data } }], schema, options.timeoutMs);
}

/** Text-to-speech model (separate from GEMINI_MODEL; it has its own quota). */
const GEMINI_TTS_MODEL = process.env.GEMINI_TTS_MODEL || "gemini-2.5-flash-preview-tts";

/**
 * Speaks Arabic text with Gemini's text-to-speech — pronunciation audio for
 * vocabulary, not a grammar claim. Returns a playable WAV. Callers cache the
 * result (see /api/speech), so each word is generated once.
 */
export async function generateArabicSpeech(text: string): Promise<Buffer> {
  const data = await postGemini(
    GEMINI_TTS_MODEL,
    {
      contents: [{ role: "user", parts: [{ text: `Say clearly and slowly, in Modern Standard Arabic, exactly as vowelled: ${text}` }] }],
      generationConfig: {
        responseModalities: ["AUDIO"],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Kore" } } },
      },
    },
    30_000
  );
  const part = data.candidates?.[0]?.content?.parts?.find((p: { inlineData?: unknown }) => p.inlineData)?.inlineData as { mimeType?: string; data?: string } | undefined;
  if (!part?.data) throw new Error("Gemini returned no audio");
  const pcm = Buffer.from(part.data, "base64");
  // Raw 16-bit little-endian PCM ("audio/L16;codec=pcm;rate=24000") — wrap it in a WAV header so browsers can play it.
  const rate = Number(/rate=(\d+)/.exec(part.mimeType ?? "")?.[1] ?? 24000);
  return pcmToWav(pcm, rate);
}

export function pcmToWav(pcm: Buffer, sampleRate: number, channels = 1, bitsPerSample = 16): Buffer {
  const blockAlign = (channels * bitsPerSample) / 8;
  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16); // fmt chunk size
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * blockAlign, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write("data", 36);
  header.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([header, pcm]);
}
