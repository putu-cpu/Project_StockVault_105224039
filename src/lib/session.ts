import "server-only";

import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { demoUsers } from "../data/mockData";
import type { User } from "../types";

const SESSION_COOKIE = "session_id";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24;
let developmentSecret: string | undefined;

function getSessionSecret(): string {
  const configuredSecret = process.env.SESSION_SECRET;
  if (configuredSecret) return configuredSecret;

  if (process.env.NODE_ENV === "development") {
    developmentSecret ??= randomBytes(32).toString("hex");
    return developmentSecret;
  }

  throw new Error("SESSION_SECRET must be configured to use authenticated actions.");
}

function sign(userId: string, issuedAt: number): string {
  return createHmac("sha256", getSessionSecret())
    .update(`${userId}.${issuedAt}`)
    .digest("hex");
}

export function createSessionToken(userId: string): string {
  const issuedAt = Date.now();
  return `sv_sess_${userId}_${issuedAt}_${sign(userId, issuedAt)}`;
}

export async function getSessionUser(): Promise<User | undefined> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const match = token?.match(/^sv_sess_(.+)_(\d+)_([a-f0-9]{64})$/);
  if (!match) return undefined;

  const [, userId, timestamp, signature] = match;
  const issuedAt = Number(timestamp);
  const ageInSeconds = (Date.now() - issuedAt) / 1000;
  if (!Number.isSafeInteger(issuedAt) || ageInSeconds < 0 || ageInSeconds > SESSION_MAX_AGE_SECONDS) {
    return undefined;
  }

  const expectedSignature = Buffer.from(sign(userId, issuedAt), "hex");
  const providedSignature = Buffer.from(signature, "hex");
  if (
    expectedSignature.length !== providedSignature.length ||
    !timingSafeEqual(expectedSignature, providedSignature)
  ) {
    return undefined;
  }

  return demoUsers.find((user) => user.id === userId);
}
