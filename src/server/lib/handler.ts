import "server-only";
import { NextResponse } from "next/server";
import type { ZodType } from "zod";
import { ApiError, badRequest, unauthorized } from "@/server/constants";
import { CamelServiceUnavailableError, GeminiNotConfiguredError, GeminiQuotaExhaustedError } from "@/server/helpers";
import { getApiUserId } from "./auth";

/**
 * Shared plumbing for API route handlers, so every route gets the same:
 * - real session check (the proxy only checks that a cookie is present),
 * - JSON body parsing and validation that answers 400, never 500,
 * - error responses: `{ error }` JSON with a meaningful status.
 */

interface RouteArgs<P> {
  req: Request;
  userId: string;
  params: P;
}

/** Wraps a route handler that needs a signed-in user. */
export function withAuth<P = Record<string, never>>(handler: (args: RouteArgs<P>) => Promise<Response>) {
  return async (req: Request, ctx: { params: Promise<P> }): Promise<Response> => {
    try {
      const userId = await getApiUserId();
      if (!userId) throw unauthorized();
      const params = ctx?.params ? await ctx.params : ({} as P);
      return await handler({ req, userId, params });
    } catch (err) {
      return handleError(err);
    }
  };
}

/** The request's JSON body, validated — a malformed or invalid body is a 400 with a readable message. */
export async function readJson<T>(req: Request, schema: ZodType<T>): Promise<T> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw badRequest("The request body must be valid JSON.");
  }
  return parseWith(schema, body);
}

export function parseWith<T>(schema: ZodType<T>, value: unknown): T {
  const result = schema.safeParse(value);
  if (!result.success) {
    const issue = result.error.issues[0];
    const where = issue?.path.length ? `${issue.path.join(".")}: ` : "";
    throw badRequest(`${where}${issue?.message ?? "Invalid request"}`);
  }
  return result.data;
}

export function handleError(err: unknown): Response {
  if (err instanceof ApiError) return json({ error: err.message }, err.status);
  // The two outside services fail in ways the learner can act on — say so plainly.
  if (err instanceof CamelServiceUnavailableError) return json({ error: err.message }, 503);
  if (err instanceof GeminiNotConfiguredError) return json({ error: "This feature needs the AI service, which isn't configured on this server." }, 503);
  if (err instanceof GeminiQuotaExhaustedError) return json({ error: "The AI service has reached its limit for today — please try again later." }, 503);
  console.error("Unhandled API error:", err);
  return json({ error: "Something went wrong on our side — please try again." }, 500);
}

export function json(body: unknown, status = 200): Response {
  return NextResponse.json(body, { status });
}

export function noContent(): Response {
  return new NextResponse(null, { status: 204 });
}
