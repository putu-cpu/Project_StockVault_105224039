import { sha256 } from "@noble/hashes/sha256";
import { bytesToHex, utf8ToBytes } from "@noble/hashes/utils";

export interface TransactionPayload {
  transactionId: string;
  hotelId: string;
  timestamp: string;
  totalItems: number;
}

function stableSerialize(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value) ?? "null";
  }

  if (Array.isArray(value)) {
    return `[${value.map(stableSerialize).join(",")}]`;
  }

  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, entryValue]) => entryValue !== undefined)
    .sort(([left], [right]) => left.localeCompare(right));
  return `{${entries.map(([key, entryValue]) => `${JSON.stringify(key)}:${stableSerialize(entryValue)}`).join(",")}}`;
}

export function generateDataHash(payload: object): string {
  return bytesToHex(sha256(utf8ToBytes(stableSerialize(payload))));
}

export function verifyDataHash(payload: object, hash: string): boolean {
  if (!/^[a-f0-9]{64}$/.test(hash)) return false;

  const expected = generateDataHash(payload);
  let difference = 0;
  for (let index = 0; index < expected.length; index += 1) {
    difference |= expected.charCodeAt(index) ^ hash.charCodeAt(index);
  }
  return difference === 0;
}