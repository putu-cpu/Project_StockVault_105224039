import { describe, expect, it } from "vitest";
import { loginSchema } from "./auth";

describe("loginSchema", () => {
  it("TC-01: menerima email dan password valid", () => {
    const result = loginSchema.safeParse({ email: "seller@alamzempol.com", password: "demo" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("seller@alamzempol.com");
      expect(result.data.password).toBe("demo");
    }
  });

  it("TC-02: menormalisasi email dengan spasi dan huruf kapital", () => {
    const result = loginSchema.safeParse({ email: "  SELLER@ALAMZEMPOL.COM  ", password: "demo" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("seller@alamzempol.com");
    }
  });

  it("TC-03: menolak format email tanpa simbol @", () => {
    const result = loginSchema.safeParse({ email: "seller-alamzempol.com", password: "demo" });
    expect(result.success).toBe(false);
  });

  it("TC-04: menolak string email kosong", () => {
    const result = loginSchema.safeParse({ email: "", password: "demo" });
    expect(result.success).toBe(false);
  });

  it("TC-05: menolak email yang hanya berisi spasi", () => {
    const result = loginSchema.safeParse({ email: "   ", password: "demo" });
    expect(result.success).toBe(false);
  });

  it("TC-06: menolak kata sandi kosong", () => {
    const result = loginSchema.safeParse({ email: "hotel@grandhyatt.com", password: "" });
    expect(result.success).toBe(false);
  });

  it("TC-07: menolak kata sandi yang hanya berisi karakter spasi", () => {
    const result = loginSchema.safeParse({ email: "hotel@ayana.com", password: "   " });
    expect(result.success).toBe(false);
  });

  it("TC-08: menolak format email tanpa domain (simulasi bypass novalidate)", () => {
    const result = loginSchema.safeParse({ email: "user@", password: "password123" });
    expect(result.success).toBe(false);
  });
});
