import { NextResponse } from "next/server";
import { generateAiMeaningQuestions } from "@/lib/quiz/generate-meaning-ai";

interface GenerateBody {
  count?: number;
}

const MAX_COUNT = 15;

/**
 * FR-4.x Quiz Center "meaning" topic — Gemini-generated sentence+
 * translation pairs, fresh each request rather than capped at the curated
 * sample-sentence.ts bank. See generate-meaning-ai.ts's header for the AI
 * usage policy line this stays within. Always returns 200 (with an empty
 * array on failure) — this is a variety boost the client falls back from,
 * not something that should surface as an error to the user.
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as GenerateBody;
  const count = Math.min(Math.max(body.count ?? 8, 2), MAX_COUNT);
  const questions = await generateAiMeaningQuestions(count, Math.random);
  return NextResponse.json({ questions });
}
