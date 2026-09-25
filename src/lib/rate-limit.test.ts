import { beforeEach, describe, expect, it, vi } from "vitest";

// In-memory stand-in for the auth_attempts table.
const rows: { kind: string; bucket: string; created_at: Date }[] = [];

vi.mock("next/headers", () => ({ headers: async () => new Headers({ "x-forwarded-for": "203.0.113.7, 10.0.0.1" }) }));
vi.mock("@/lib/db", () => ({
  default: {
    auth_attempts: {
      findMany: async ({ where }: { where: { kind: string; bucket: string; created_at: { gte: Date } } }) =>
        rows
          .filter((r) => r.kind === where.kind && r.bucket === where.bucket && r.created_at >= where.created_at.gte)
          .sort((a, b) => a.created_at.getTime() - b.created_at.getTime()),
      deleteMany: async ({ where }: { where: { kind?: string; bucket?: string; created_at?: { lt: Date } } }) => {
        for (let i = rows.length - 1; i >= 0; i--) {
          const r = rows[i];
          const match = (!where.kind || r.kind === where.kind) && (!where.bucket || r.bucket === where.bucket) && (!where.created_at || r.created_at < where.created_at.lt);
          if (match) rows.splice(i, 1);
        }
      },
      createMany: async ({ data }: { data: { kind: string; bucket: string }[] }) => {
        for (const d of data) rows.push({ ...d, created_at: new Date() });
      },
    },
    $transaction: async (ops: Promise<unknown>[]) => Promise.all(ops),
  },
}));

const { clearAttempts, clientIp, recordAttempt, retryAfterMinutes } = await import("./rate-limit");

describe("login rate limiting", () => {
  beforeEach(() => {
    rows.length = 0;
  });

  it("reads the client IP from the first x-forwarded-for hop", async () => {
    expect(await clientIp()).toBe("203.0.113.7");
  });

  it("allows 5 failures per account, then locks it for the rest of the window", async () => {
    for (let i = 0; i < 4; i++) await recordAttempt("login", "a@b.co", "1.1.1.1");
    expect(await retryAfterMinutes("login", "a@b.co", "1.1.1.1")).toBe(0);
    await recordAttempt("login", "a@b.co", "1.1.1.1");
    const wait = await retryAfterMinutes("login", "a@b.co", "1.1.1.1");
    expect(wait).toBeGreaterThan(0);
    expect(wait).toBeLessThanOrEqual(15);
    // A different account from another address is unaffected.
    expect(await retryAfterMinutes("login", "c@d.co", "2.2.2.2")).toBe(0);
  });

  it("limits one IP trying many accounts", async () => {
    for (let i = 0; i < 20; i++) await recordAttempt("login", `user${i}@x.co`, "9.9.9.9");
    expect(await retryAfterMinutes("login", "fresh@x.co", "9.9.9.9")).toBeGreaterThan(0);
  });

  it("forgets failures older than the window, and a success clears the account", async () => {
    const old = new Date(Date.now() - 16 * 60_000);
    for (let i = 0; i < 5; i++) rows.push({ kind: "login", bucket: "email:a@b.co", created_at: old });
    expect(await retryAfterMinutes("login", "a@b.co", "1.1.1.1")).toBe(0);
    for (let i = 0; i < 5; i++) await recordAttempt("login", "a@b.co", "1.1.1.1");
    await clearAttempts("login", "a@b.co");
    expect(await retryAfterMinutes("login", "a@b.co", "3.3.3.3")).toBe(0);
  });
});
