import { afterEach, describe, expect, it, vi } from "vitest";
import { FetchError, fetcher } from "@/constants";

const respond = (body: BodyInit | null, status: number, contentType = "application/json") =>
  vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(new Response(body, { status, headers: { "Content-Type": contentType } }));

afterEach(() => vi.restoreAllMocks());

describe("fetcher", () => {
  it("returns the parsed body and sends json as a JSON request", async () => {
    const spy = respond('{"ok":true}', 200);
    await expect(fetcher("/api/x", { method: "POST", json: { a: 1 } })).resolves.toEqual({ ok: true });
    const init = spy.mock.calls[0][1]!;
    expect(init.body).toBe('{"a":1}');
    expect(new Headers(init.headers).get("Content-Type")).toBe("application/json");
  });

  it("uses the route's own error message", async () => {
    respond('{"error":"That word isn\'t in your bank."}', 404);
    await expect(fetcher("/api/x")).rejects.toMatchObject({ status: 404, message: "That word isn't in your bank." });
  });

  it("explains a platform error page that isn't JSON", async () => {
    respond("<html>Request Entity Too Large</html>", 413, "text/html");
    await expect(fetcher("/api/x")).rejects.toMatchObject({ status: 413, message: "That's too large to send." });
  });

  it("says when the server can't be reached", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(new TypeError("Failed to fetch"));
    const err = (await fetcher("/api/x").catch((e: unknown) => e)) as FetchError;
    expect(err).toBeInstanceOf(FetchError);
    expect(err.message).toMatch(/connection/);
  });

  it("treats 204 as success with no body", async () => {
    respond(null, 204);
    await expect(fetcher("/api/x", { method: "DELETE" })).resolves.toBeUndefined();
  });
});
