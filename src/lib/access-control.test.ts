import { describe, expect, it } from "vitest";
import { demoUsers } from "../data/mockData";
import { isAuthorized, type ProtectedOperation } from "./access-control";

const operations: ProtectedOperation[] = ["catalog:write", "delivery:lock"];

describe("role access controls", () => {
  it.each([
    ["seller", demoUsers[0], [true, false]],
    ["Grand Hyatt buyer", demoUsers[1], [false, true]],
    ["Ayana buyer", demoUsers[2], [false, true]],
    ["unauthenticated", undefined, [false, false]],
  ] as const)("enforces the complete operation matrix for %s", (_account, user, expected) => {
    expect(operations.map((operation) => isAuthorized(user, operation))).toEqual(expected);
  });

  it("denies delivery locking to a buyer without a hotel workspace", () => {
    expect(isAuthorized({ role: "BUYER" }, "delivery:lock")).toBe(false);
  });
});
