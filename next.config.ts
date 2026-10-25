import type { NextConfig } from "next";

/**
 * Sent with every response. Deliberately small: no full Content-Security-Policy
 * (Next's inline scripts and the Google fonts would need nonces), but the page
 * can't be framed (clickjacking), the browser won't guess content types, other
 * sites don't see our URLs, and no camera, microphone or location is ever asked
 * for. tests/config/securityHeaders.test.ts keeps these in place.
 */
export const SECURITY_HEADERS = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: SECURITY_HEADERS }];
  },
};

export default nextConfig;
