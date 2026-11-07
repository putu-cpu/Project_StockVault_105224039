import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { demoPasswordHashes } from "../data/demoCredentials";
import { createSession } from "./auth";

const { setCookie } = vi.hoisted(() => ({ setCookie: vi.fn() }));

vi.mock("next/headers", () => ({
  cookies: async () => ({ set: setCookie }),
}));
vi.mock("../lib/session", () => ({
  createSessionToken: () => "sv_sess_synthetic_test_token",
}));

describe("demo account authentication", () => {
  beforeEach(() => {
    vi.stubEnv("SESSION_SECRET", "synthetic-session-secret-for-tests");
    setCookie.mockClear();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it.each(Object.keys(demoPasswordHashes))("authenticates the test account %s", async (email) => {
    await expect(createSession(email, "StokVault-Test-2026!")).resolves.toEqual({ success: true });
    expect(setCookie).toHaveBeenCalledWith(
      "session_id",
      expect.stringMatching(/^sv_sess_/),
      expect.objectContaining({ httpOnly: true, sameSite: "lax" }),
    );
  });

  it("rejects a wrong password without creating a session", async () => {
    await expect(createSession("seller@alamzempol.com", "wrong-test-password")).resolves.toEqual({
      success: false,
      message: "Invalid email or password.",
    });
    expect(setCookie).not.toHaveBeenCalled();
  });

  it("uses the same failure message for an unknown account", async () => {
    await expect(createSession("unknown@stokvault.invalid", "StokVault-Test-2026!")).resolves.toEqual({
      success: false,
      message: "Invalid email or password.",
    });
    expect(setCookie).not.toHaveBeenCalled();
  });
});
