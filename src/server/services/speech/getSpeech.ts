import "server-only";
import { ApiError } from "@/server/constants";
import { db } from "@/server/databases";
import { GeminiNotConfiguredError, GeminiQuotaExhaustedError, generateArabicSpeech } from "@/server/helpers";

/**
 * Pronunciation audio for an Arabic word or short phrase, as WAV bytes.
 * Generated once with Gemini TTS and stored in speech_cache, so each word
 * costs one AI request ever, shared by all users; after that it's served
 * straight from the database.
 */
export async function getSpeech(text: string): Promise<Uint8Array<ArrayBuffer>> {
  const cached = await db.speech_cache.findUnique({ where: { text_key: text }, select: { audio: true } });
  if (cached) return cached.audio;

  let wav: Buffer;
  try {
    wav = await generateArabicSpeech(text);
  } catch (err) {
    if (err instanceof GeminiNotConfiguredError) throw new ApiError(503, "Speech isn't configured on this server.");
    if (err instanceof GeminiQuotaExhaustedError) throw new ApiError(503, "The voice service is busy for today — try again later.");
    console.error("Speech generation failed:", err);
    throw new ApiError(502, "Couldn't generate the audio.");
  }
  const audio = new Uint8Array(wav.buffer.slice(wav.byteOffset, wav.byteOffset + wav.byteLength) as ArrayBuffer);
  // Another request may have generated the same word meanwhile — either copy is fine.
  await db.speech_cache.upsert({ where: { text_key: text }, create: { text_key: text, audio }, update: {} });
  return audio;
}
