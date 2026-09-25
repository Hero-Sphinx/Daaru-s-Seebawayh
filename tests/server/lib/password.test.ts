import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "@/server/lib";

describe("password hashing", () => {
  it("verifies the right password and rejects a wrong one", async () => {
    const hash = await hashPassword("correct horse battery");
    expect(await verifyPassword("correct horse battery", hash)).toBe(true);
    expect(await verifyPassword("correct horse batterY", hash)).toBe(false);
  });

  it("salts every hash, so equal passwords produce different hashes", async () => {
    const [a, b] = await Promise.all([hashPassword("same-password"), hashPassword("same-password")]);
    expect(a).not.toBe(b);
    expect(await verifyPassword("same-password", a)).toBe(true);
    expect(await verifyPassword("same-password", b)).toBe(true);
  });

  it("rejects malformed and legacy placeholder hashes instead of throwing", async () => {
    expect(await verifyPassword("anything", "no-auth-yet")).toBe(false);
    expect(await verifyPassword("anything", "scrypt$16384$8$1$$")).toBe(false);
    expect(await verifyPassword("anything", "")).toBe(false);
  });
});
