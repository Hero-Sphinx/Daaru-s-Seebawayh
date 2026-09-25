import { NextResponse } from "next/server";
import { parseWith, withAuth } from "@/server/lib";
import { getSpeech } from "@/server/services";
import { speechTextSchema } from "@/server/validators/speech/validate";

/**
 * Pronunciation audio for an Arabic word or short phrase — a plain WAV file,
 * so it plays on every device (Android, iPhone, Windows) without relying on
 * speech voices installed there. See getSpeech() for the caching.
 */
export const GET = withAuth(async ({ req }) => {
  const text = parseWith(speechTextSchema, new URL(req.url).searchParams.get("text") ?? "");
  const audio = await getSpeech(text);
  return new NextResponse(Buffer.from(audio), {
    headers: {
      "Content-Type": "audio/wav",
      "Content-Length": String(audio.byteLength),
      // The same word always sounds the same — let the browser keep it.
      "Cache-Control": "private, max-age=31536000, immutable",
    },
  });
});
