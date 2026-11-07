import { describe, expect, it } from "vitest";
import { productSchema } from "../../lib/validations";

describe("productSchema", () => {
  const validProduct = {
    name: "Natural Soap",
    category: "SOAP",
    packageSize: "100g",
    price: "42000",
  };

  it("accepts valid catalog details and normalizes the product name", () => {
    const result = productSchema.safeParse({ ...validProduct, name: "  Natural Soap  " });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Natural Soap");
      expect(result.data.price).toBe(42000);
    }
  });

  it("requires a product name with at least three non-space characters", () => {
    expect(productSchema.safeParse({ ...validProduct, name: "  ab " }).success).toBe(false);
  });

  it("rejects categories outside the supported catalog categories", () => {
    expect(productSchema.safeParse({ ...validProduct, category: "BATH CARE" }).success).toBe(false);
  });

  it("requires a package size", () => {
    expect(productSchema.safeParse({ ...validProduct, packageSize: "  " }).success).toBe(false);
  });

  it("requires a positive whole-number IDR price", () => {
    expect(productSchema.safeParse({ ...validProduct, price: "0" }).success).toBe(false);
    expect(productSchema.safeParse({ ...validProduct, price: "12.5" }).success).toBe(false);
    expect(productSchema.safeParse({ ...validProduct, price: true }).success).toBe(false);
  });
});
