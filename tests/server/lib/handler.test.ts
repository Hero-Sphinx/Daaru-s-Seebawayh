import { describe, expect, it, vi } from "vitest";
import { z } from "zod";

vi.mock("@/server/lib/auth", () => ({ getApiUserId: vi.fn() }));

import { ApiError } from "@/server/constants";
import { CamelServiceUnavailableError, GeminiNotConfiguredError, GeminiQuotaExhaustedError } from "@/server/helpers";
import { getApiUserId, handleError, readJson, withAuth } from "@/server/lib";

const post = (body: string) => new Request("http://test/api", { method: "POST", body, headers: { "Content-Type": "application/json" } });

describe("readJson", () => {
  const schema = z.object({ word: z.string().min(1, "word is required") });

  it("returns the validated body", async () => {
    await expect(readJson(post('{"word":"كتاب"}'), schema)).resolves.toEqual({ word: "كتاب" });
  });

  it("turns malformed JSON into a 400, not a crash", async () => {
    await expect(readJson(post("{not json"), schema)).rejects.toMatchObject({ status: 400 });
  });

  it("names the failing field", async () => {
    await expect(readJson(post('{"word":""}'), schema)).rejects.toMatchObject({ status: 400, message: "word: word is required" });
  });
});

describe("handleError", () => {
  const statusOf = (err: unknown) => handleError(err).status;

  it("passes ApiError status and message through", async () => {
    const res = handleError(new ApiError(404, "Not found"));
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: "Not found" });
  });

  it("maps outside-service failures to 503", () => {
    expect(statusOf(new CamelServiceUnavailableError("asleep"))).toBe(503);
    expect(statusOf(new GeminiNotConfiguredError("no key"))).toBe(503);
    expect(statusOf(new GeminiQuotaExhaustedError("quota"))).toBe(503);
  });

  it("hides unexpected errors behind a generic 500", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const res = handleError(new Error("connection string leaked here"));
    expect(res.status).toBe(500);
    expect(JSON.stringify(await res.json())).not.toContain("leaked");
  });
});

describe("withAuth", () => {
  const route = withAuth<{ id: string }>(async ({ userId, params }) => Response.json({ userId, id: params.id }));
  const ctx = { params: Promise.resolve({ id: "42" }) };

  it("answers 401 without a live session, whatever the cookie says", async () => {
    vi.mocked(getApiUserId).mockResolvedValueOnce(null);
    expect((await route(new Request("http://test/api"), ctx)).status).toBe(401);
  });

  it("hands the handler the user and the route params", async () => {
    vi.mocked(getApiUserId).mockResolvedValueOnce("user-1");
    const res = await route(new Request("http://test/api"), ctx);
    expect(await res.json()).toEqual({ userId: "user-1", id: "42" });
  });
});
