import { describe, expect, it } from "vitest";
import nextConfig, { SECURITY_HEADERS } from "../../next.config";

/** The baseline security headers stay on every route, and the server doesn't advertise itself. */
describe("security headers", () => {
  it("are sent on every path", async () => {
    const rules = (await nextConfig.headers?.()) ?? [];
    expect(rules).toContainEqual({ source: "/:path*", headers: SECURITY_HEADERS });
  });

  it.each([
    ["X-Content-Type-Options", "nosniff"],
    ["X-Frame-Options", "DENY"],
    ["Content-Security-Policy", "frame-ancestors 'none'"],
    ["Referrer-Policy", "strict-origin-when-cross-origin"],
  ])("include %s: %s", (key, value) => {
    expect(SECURITY_HEADERS).toContainEqual({ key, value });
  });

  it("never ask for camera, microphone or location", () => {
    const policy = SECURITY_HEADERS.find((h) => h.key === "Permissions-Policy")?.value ?? "";
    for (const feature of ["camera=()", "microphone=()", "geolocation=()"]) expect(policy).toContain(feature);
  });

  it("hide the X-Powered-By header", () => {
    expect(nextConfig.poweredByHeader).toBe(false);
  });
});
