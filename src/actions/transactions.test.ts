import { beforeEach, describe, expect, it, vi } from "vitest";
import { demoUsers } from "../data/mockData";
import { getSessionUser } from "../lib/session";
import { lockDeliveryAction } from "./transactions";

const { generateDataHashMock, generateAuthenticatedSignatureMock } = vi.hoisted(() => ({
  generateDataHashMock: vi.fn(() => "synthetic-test-signature"),
  generateAuthenticatedSignatureMock: vi.fn(() => ({
    nonce: "a".repeat(32),
    aad: "test-hotel:test-time:test-transaction",
    authTag: "b".repeat(64),
  })),
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("../lib/session", () => ({ getSessionUser: vi.fn() }));
vi.mock("../utils/crypto", () => ({
  generateDataHash: generateDataHashMock,
  generateAuthenticatedSignature: generateAuthenticatedSignatureMock,
}));

const sessionUser = vi.mocked(getSessionUser);

describe("delivery lock authorization", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("denies a request without an authenticated session", async () => {
    sessionUser.mockResolvedValue(undefined);
    const result = await lockDeliveryAction({
      transactionId: "test-transaction",
      receivedQuantities: { "test-product": 1 },
    });

    expect(result.success).toBe(false);
    expect(generateDataHashMock).not.toHaveBeenCalled();
    expect(generateAuthenticatedSignatureMock).not.toHaveBeenCalled();
  });

  it("denies the seller role before generating a signature", async () => {
    sessionUser.mockResolvedValue(demoUsers[0]);
    const result = await lockDeliveryAction({
      transactionId: "test-transaction",
      receivedQuantities: { "test-product": 1 },
    });

    expect(result.success).toBe(false);
    expect(generateDataHashMock).not.toHaveBeenCalled();
    expect(generateAuthenticatedSignatureMock).not.toHaveBeenCalled();
  });

  it("allows an authenticated buyer role to reach the lock operation", async () => {
    sessionUser.mockResolvedValue(demoUsers[1]);
    const result = await lockDeliveryAction({
      transactionId: "test-transaction",
      receivedQuantities: { "test-product": 1 },
    });

    expect(result.success).toBe(true);
    expect(
      generateDataHashMock.mock.calls.length + generateAuthenticatedSignatureMock.mock.calls.length,
    ).toBe(1);
  });
});
