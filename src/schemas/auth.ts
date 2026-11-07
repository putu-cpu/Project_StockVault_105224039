import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email({
    message: "Format alamat email tidak valid (contoh: partner@hotel.com)",
  }),
  password: z.string().trim().min(1, {
    message: "Kata sandi wajib diisi dan tidak boleh hanya spasi",
  }),
});
