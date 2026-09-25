import { NextResponse } from "next/server";
import { analyzeWord, CamelServiceUnavailableError, type CamelCandidate } from "@/lib/camel-client";

export type EnrichCandidate = CamelCandidate;

interface EnrichBody {
  word: string;
}

/**
 * FR-4.2 morphological enrichment. Deterministic — see README.md's AI usage
 * policy. Fails soft: if the CAMeL service isn't running, this is the only
 * thing that breaks (the "Auto-fill" button), not vocabulary entry itself.
 */
export async function POST(request: Request) {
  const body = (await request.json()) as EnrichBody;
  if (!body.word?.trim()) {
    return NextResponse.json({ error: "word is required" }, { status: 400 });
  }

  try {
    const candidates = await analyzeWord(body.word.trim());
    return NextResponse.json({ word: body.word.trim(), candidates });
  } catch (err) {
    if (err instanceof CamelServiceUnavailableError) {
      return NextResponse.json({ error: err.message }, { status: 503 });
    }
    return NextResponse.json({ error: "CAMeL Tools service returned an error" }, { status: 502 });
  }
}
