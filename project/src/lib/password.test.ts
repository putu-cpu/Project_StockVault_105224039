import { describe, expect, it } from "vitest";
import { demoPasswordHashes } from "../data/demoCredentials";
import { hashPassword, verifyPassword } from "./password";

const syntheticDemoPassword = "StokVault-Test-2026!";

describe("scrypt password storage", () => {
  it("stores a salted scrypt digest and verifies it without storing the password", async () => {
    const encodedHash = await hashPassword(syntheticDemoPassword);

    expect(encodedHash).toMatch(/^scrypt\$16384\$8\$1\$[a-f0-9]{32}\$[a-f0-9]{128}$/);
    expect(encodedHash).not.toContain(syntheticDemoPassword);
    await expect(verifyPassword(syntheticDemoPassword, encodedHash)).resolves.toBe(true);
    await expect(verifyPassword("incorrect-test-password", encodedHash)).resolves.toBe(false);
  });

  it("verifies all synthetic role test accounts and rejects malformed hashes", async () => {
    const accountHashes = Object.values(demoPasswordHashes);
    const results = await Promise.all(
      accountHashes.map((encodedHash) => verifyPassword(syntheticDemoPassword, encodedHash)),
    );

    expect(results).toEqual([true, true, true]);
    await expect(verifyPassword(syntheticDemoPassword, "sha256$not-a-password-hash")).resolves.toBe(false);
  });
});
