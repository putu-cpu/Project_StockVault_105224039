import { beforeEach, describe, expect, it, vi } from "vitest";
import { demoUsers } from "../../data/mockData";
import { getSessionUser } from "../../lib/session";
import { prisma } from "../../../lib/prisma";
import { createProduct, deleteProduct, updateProduct } from "./catalog";

vi.mock("../../lib/session", () => ({ getSessionUser: vi.fn() }));
vi.mock("../../../lib/prisma", () => ({
  prisma: {
    supplier: { findUnique: vi.fn() },
    product: { create: vi.fn(), update: vi.fn(), findFirst: vi.fn(), delete: vi.fn() },
    transactionItem: { count: vi.fn() },
  },
}));

const sessionUser = vi.mocked(getSessionUser);
const findSupplier = vi.mocked(prisma.supplier.findUnique);
const validProduct = {
  name: "Synthetic Access Test Product",
  category: "SOAP",
  packageSize: "100g",
  price: 1000,
};

describe.each(demoUsers.slice(1))("catalog writes for buyer account $email", (buyer) => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionUser.mockResolvedValue(buyer);
  });

  it.each([
    ["create", () => createProduct(validProduct)],
    ["update", () => updateProduct("test-product", validProduct)],
    ["delete", () => deleteProduct("test-product")],
  ])("denies %s before any database lookup", async (_operation, invoke) => {
    await expect(invoke()).resolves.toMatchObject({
      success: false,
      message: "Only an authenticated supplier can manage the master catalog.",
    });
    expect(findSupplier).not.toHaveBeenCalled();
  });
});

describe("catalog writes without a session", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionUser.mockResolvedValue(undefined);
  });

  it.each([
    ["create", () => createProduct(validProduct)],
    ["update", () => updateProduct("test-product", validProduct)],
    ["delete", () => deleteProduct("test-product")],
  ])("denies %s before any database lookup", async (_operation, invoke) => {
    await expect(invoke()).resolves.toMatchObject({
      success: false,
      message: "Only an authenticated supplier can manage the master catalog.",
    });
    expect(findSupplier).not.toHaveBeenCalled();
  });
});
