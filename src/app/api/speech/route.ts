import { NextResponse } from "next/server";
import db from "@/server/databases/db";
import { getApiUserId, unauthorizedResponse } from "@/server/lib/auth";
import { isArabicWord } from "@/helpers/arabic/script";
import { generateArabicSpeech, GeminiNotConfiguredError, GeminiQuotaExhaustedError } from "@/server/helpers/geminiClient";

/**
 * Pronunciation audio for an Arabic word or short phrase — a plain WAV file,
 * so it plays on every device (Android, iPhone, Windows) without relying on
 * speech voices installed there. Generated once with Gemini TTS and stored
 * in speech_cache, so each word costs one AI request ever, shared by all
 * users; after that it's served straight from the database.
 */

const MAX_LENGTH = 60;

export async function GET(request: Request) {
  const userId = await getApiUserId();
  if (!userId) return unauthorizedResponse();

  const text = new URL(request.url).searchParams.get("text")?.trim().normalize("NFC") ?? "";
  if (!text || text.length > MAX_LENGTH || !text.split(/\s+/).every(isArabicWord)) {
    return NextResponse.json({ error: "Send a short Arabic word or phrase as ?text=" }, { status: 400 });
  }

  const cached = await db.speech_cache.findUnique({ where: { text_key: text }, select: { audio: true } });
  let audio: Uint8Array<ArrayBuffer>;
  if (cached) {
    audio = cached.audio;
  } else {
    try {
      const wav = await generateArabicSpeech(text);
      audio = new Uint8Array(wav.buffer.slice(wav.byteOffset, wav.byteOffset + wav.byteLength) as ArrayBuffer);
      // Another request may have generated the same word meanwhile — either copy is fine.
      await db.speech_cache.upsert({ where: { text_key: text }, create: { text_key: text, audio }, update: {} });
    } catch (err) {
      if (err instanceof GeminiNotConfiguredError) return NextResponse.json({ error: "Speech isn't configured on this server." }, { status: 503 });
      if (err instanceof GeminiQuotaExhaustedError) return NextResponse.json({ error: "The voice service is busy for today — try again later." }, { status: 503 });
      console.error("Speech generation failed:", err);
      return NextResponse.json({ error: "Couldn't generate the audio." }, { status: 502 });
    }
  }

  return new NextResponse(Buffer.from(audio), {
    headers: {
      "Content-Type": "audio/wav",
      "Content-Length": String(audio.byteLength),
      // The same word always sounds the same — let the browser keep it.
      "Cache-Control": "private, max-age=31536000, immutable",
    },
  });
}
