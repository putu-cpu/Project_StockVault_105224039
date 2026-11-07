import type { User } from "../types";

export type ProtectedOperation = "catalog:write" | "delivery:lock";

export function isAuthorized(
  user: Pick<User, "role" | "hotelId"> | undefined,
  operation: ProtectedOperation,
): boolean {
  if (!user) return false;

  if (operation === "catalog:write") {
    return user.role === "SELLER";
  }

  return user.role === "BUYER" && Boolean(user.hotelId);
}
