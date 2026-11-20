import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";

const NONCE_BYTES = 16;
const KEY_HEX_PATTERN = /^[a-fA-F0-9]{64}$/;
const NONCE_HEX_PATTERN = /^[a-fA-F0-9]{32}$/;
const AUTH_TAG_HEX_PATTERN = /^[a-fA-F0-9]{64}$/;
const MAX_ITEMS_JSON_LENGTH = 1_000_000;
const SIGNATURE_CONTEXT = "StokVault:transaction-signature:v1";

// Public, deterministic development-only key; production always requires an environment key.
const DEVELOPMENT_FALLBACK_KEY =
  "53544f4b5641554c542d4445562d4f4e4c592d4b45592d46414b452d30303031";

function isValidJson(value: string): boolean {
  try {
    JSON.parse(value);
    return true;
  } catch {
    return false;
  }
}

export const TransactionPayloadSchema = z.strictObject({
  transactionId: z.string().trim().min(1).max(128),
  hotelId: z.string().trim().min(1).max(128),
  timestamp: z.string().datetime({ offset: true }),
  totalItems: z.number().int().nonnegative().safe(),
  itemsJson: z
    .string()
    .min(2)
    .max(MAX_ITEMS_JSON_LENGTH)
    .refine(isValidJson, "itemsJson must contain valid JSON"),
});

export type TransactionPayload = z.infer<typeof TransactionPayloadSchema>;

export const AuthenticatedSignaturePackageSchema = z.strictObject({
  nonce: z.string().regex(NONCE_HEX_PATTERN),
  aad: z.string().min(1),
  authTag: z.string().regex(AUTH_TAG_HEX_PATTERN),
});

export type AuthenticatedSignaturePackage = z.infer<
  typeof AuthenticatedSignaturePackageSchema
>;

function resolveKey(overrideKey?: string): Buffer | undefined {
  const keyHex = overrideKey ?? process.env.STOKVAULT_SECRET_KEY;

  if (keyHex === undefined || keyHex.length === 0) {
    if (overrideKey === undefined && process.env.NODE_ENV === "development") {
      return Buffer.from(DEVELOPMENT_FALLBACK_KEY, "hex");
    }

    return undefined;
  }

  if (!KEY_HEX_PATTERN.test(keyHex)) {
    return undefined;
  }

  return Buffer.from(keyHex, "hex");
}

function createAad(payload: TransactionPayload): string {
  return `${payload.hotelId}:${payload.timestamp}:${payload.transactionId}`;
}

function calculateAuthTag(
  payload: TransactionPayload,
  nonce: string,
  aad: string,
  key: Buffer,
): string {
  const serializedPayload = JSON.stringify(payload);
  return createHmac("sha256", key)
    .update(SIGNATURE_CONTEXT)
    .update("\0")
    .update(nonce)
    .update("\0")
    .update(aad)
    .update("\0")
    .update(serializedPayload)
    .digest("hex");
}

export function generateCSPRNGNonce(): string {
  const nonceBytes = new Uint8Array(NONCE_BYTES);
  globalThis.crypto.getRandomValues(nonceBytes);
  return Buffer.from(nonceBytes).toString("hex");
}

export function generateAuthenticatedSignature(
  payload: unknown,
  customNonce?: string,
  overrideKey?: string,
): AuthenticatedSignaturePackage {
  const validatedPayload = TransactionPayloadSchema.parse(payload);
  const nonce = customNonce ?? generateCSPRNGNonce();

  if (!NONCE_HEX_PATTERN.test(nonce)) {
    throw new Error("Nonce must be a 128-bit hexadecimal value.");
  }

  const key = resolveKey(overrideKey);
  if (!key) {
    throw new Error(
      "STOKVAULT_SECRET_KEY must be configured as 64 hexadecimal characters.",
    );
  }

  const aad = createAad(validatedPayload);
  const authTag = calculateAuthTag(validatedPayload, nonce, aad, key);

  return { nonce, aad, authTag };
}

export function verifyAuthenticatedSignature(
  payload: unknown,
  packageData: unknown,
  overrideKey?: string,
): boolean {
  const validatedPayload = TransactionPayloadSchema.safeParse(payload);
  const validatedPackage =
    AuthenticatedSignaturePackageSchema.safeParse(packageData);
  const key = resolveKey(overrideKey);

  if (!validatedPayload.success || !validatedPackage.success || !key) {
    return false;
  }

  const expectedAad = createAad(validatedPayload.data);
  if (validatedPackage.data.aad !== expectedAad) {
    return false;
  }

  const expectedTag = Buffer.from(
    calculateAuthTag(
      validatedPayload.data,
      validatedPackage.data.nonce,
      expectedAad,
      key,
    ),
    "hex",
  );
  const providedTag = Buffer.from(validatedPackage.data.authTag, "hex");

  return timingSafeEqual(expectedTag, providedTag);
}
