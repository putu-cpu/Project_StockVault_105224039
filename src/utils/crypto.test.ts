import { describe, expect, it } from "vitest";
import {
  generateAuthenticatedSignature,
  generateCSPRNGNonce,
  verifyAuthenticatedSignature,
  type TransactionPayload,
} from "./crypto";

const TEST_KEY = "0123456789abcdef".repeat(4);

const validPayload: TransactionPayload = {
  transactionId: "LF-2610-005",
  hotelId: "grand-hyatt",
  timestamp: "2026-10-11T10:00:00Z",
  totalItems: 22,
  itemsJson: '[{"sku":"soap-natural-100","quantity":22}]',
};

describe("StokVault authenticated transaction signatures", () => {
  it("generates a 64-character hexadecimal HMAC and a 128-bit CSPRNG nonce", () => {
    const signature = generateAuthenticatedSignature(
      validPayload,
      undefined,
      TEST_KEY,
    );

    expect(signature.authTag).toMatch(/^[a-f0-9]{64}$/);
    expect(signature.nonce).toMatch(/^[a-f0-9]{32}$/);
    expect(signature.aad).toBe(
      `${validPayload.hotelId}:${validPayload.timestamp}:${validPayload.transactionId}`,
    );
    expect(generateCSPRNGNonce()).toMatch(/^[a-f0-9]{32}$/);
  });

  it("verifies an untampered payload with the correct key", () => {
    const signature = generateAuthenticatedSignature(
      validPayload,
      undefined,
      TEST_KEY,
    );

    expect(verifyAuthenticatedSignature(validPayload, signature, TEST_KEY)).toBe(
      true,
    );
  });

  it("generates different nonces and authentication tags for separate calls", () => {
    const first = generateAuthenticatedSignature(
      validPayload,
      undefined,
      TEST_KEY,
    );
    const second = generateAuthenticatedSignature(
      validPayload,
      undefined,
      TEST_KEY,
    );

    expect(first.nonce).not.toBe(second.nonce);
    expect(first.authTag).not.toBe(second.authTag);
  });

  it("fails closed for modified payloads, wrong keys, and corrupted signature data", () => {
    const signature = generateAuthenticatedSignature(
      validPayload,
      undefined,
      TEST_KEY,
    );
    const tamperedPayload = { ...validPayload, totalItems: 999 };
    const wrongKey = "fedcba9876543210".repeat(4);
    const corruptedTag = {
      ...signature,
      authTag: `${signature.authTag[0] === "0" ? "1" : "0"}${signature.authTag.slice(1)}`,
    };
    const corruptedNonce = {
      ...signature,
      nonce: `${signature.nonce[0] === "0" ? "1" : "0"}${signature.nonce.slice(1)}`,
    };

    expect(
      verifyAuthenticatedSignature(tamperedPayload, signature, TEST_KEY),
    ).toBe(false);
    expect(verifyAuthenticatedSignature(validPayload, signature, wrongKey)).toBe(
      false,
    );
    expect(
      verifyAuthenticatedSignature(validPayload, corruptedTag, TEST_KEY),
    ).toBe(false);
    expect(
      verifyAuthenticatedSignature(validPayload, corruptedNonce, TEST_KEY),
    ).toBe(false);
    expect(
      verifyAuthenticatedSignature(validPayload, { ...signature, nonce: "bad" }, TEST_KEY),
    ).toBe(false);
  });
});
