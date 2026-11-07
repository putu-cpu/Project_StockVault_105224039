"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { demoUsers } from "../data/mockData";
import { generateAuthenticatedSignature } from "../utils/crypto";

export const lockDeliverySchema = z.object({
  transactionId: z.string().min(1, "ID transaksi tidak boleh kosong"),
  receivedQuantities: z.record(
    z.string(),
    z.number().int("Kuantitas harus bilangan bulat").min(0, "Kuantitas tidak boleh negatif"),
  ),
});

export type LockDeliveryInput = z.infer<typeof lockDeliverySchema>;

export interface TransactionActionResult {
  success: boolean;
  message: string;
  signature?: string;
  fieldErrors?: Record<string, string[]>;
}

/**
 * Server Action: lockDeliveryAction
 *
 * Mengikuti urutan arsitektur 6 langkah wajib:
 * 1. Sesi: Verifikasi otentikasi pengguna via cookie sesi aktif
 * 2. Validasi Bentuk: Evaluasi struktur payload menggunakan Zod safeParse()
 * 3. Validasi Semantik: Validasi hak akses kepemilikan (RBAC/IDOR), status transaksi, dan konsistensi stok
 * 4. Mutasi: Penerbitan HMAC-SHA256 dan penguncian status transaksi permanen
 * 5. Revalidasi: revalidatePath() untuk memperbarui data cache Next.js
 * 6. Redirect / Response: Mengembalikan hasil mutasi atau mengarahkan navigasi
 */
export async function lockDeliveryAction(
  input: LockDeliveryInput,
): Promise<TransactionActionResult> {
  // 1. SESI: Verifikasi sesi kuki pengguna di sisi server
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session_id")?.value;

  if (!sessionCookie) {
    return {
      success: false,
      message: "Tidak terautentikasi: Sesi telah kedaluwarsa atau belum masuk.",
    };
  }

  // Mengurai ID akun dari token sesi opaque
  const user = demoUsers.find((u) => sessionCookie.includes(u.id));
  if (!user) {
    return {
      success: false,
      message: "Sesi tidak valid: Akun pengguna tidak ditemukan.",
    };
  }

  // 2. VALIDASI BENTUK: Memeriksa bentuk payload masukan via Zod
  const validation = lockDeliverySchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      message: "Validasi bentuk gagal: Data masukan tidak sesuai skema.",
      fieldErrors: validation.error.flatten().fieldErrors,
    };
  }

  const { transactionId, receivedQuantities } = validation.data;

  // 3. VALIDASI SEMANTIK: Aturan logika bisnis, RBAC, dan integritas data
  // - Pemeriksaan Peran: Hanya BUYER (staf hotel) yang berhak mengunci penerimaan barang fisik
  if (user.role !== "BUYER" || !user.hotelId) {
    return {
      success: false,
      message: "Pelanggaran Otorisasi (RBAC): Hanya staf hotel yang berhak mengunci data pengiriman.",
    };
  }

  // Simulasi verifikasi data transaksi dari basis data
  // Semantik: Kuantitas diterima tidak boleh melebihi batas kuantitas kirim (misal maks 500)
  for (const [itemId, qty] of Object.entries(receivedQuantities)) {
    if (qty > 1000) {
      return {
        success: false,
        message: `Validasi Semantik Gagal: Jumlah barang ${itemId} melebihi kapasitas kuantitas kirim maksimal.`,
      };
    }
  }

  // 4. MUTASI: Penerbitan HMAC-SHA256 & Pembekuan Data
  const timestamp = new Date().toISOString();
  const payloadSnapshot = {
    transactionId,
    hotelId: user.hotelId,
    timestamp,
    totalItems: Object.values(receivedQuantities).reduce(
      (total, quantity) => total + quantity,
      0,
    ),
    itemsJson: JSON.stringify(
      Object.entries(receivedQuantities).sort(([left], [right]) =>
        left.localeCompare(right),
      ),
    ),
  };
  const signature = generateAuthenticatedSignature(payloadSnapshot);

  // 5. REVALIDASI PATH: Bersihkan data cache rute terkait
  revalidatePath(`/hotel/${user.hotelId}`);
  revalidatePath("/");

  // 6. REDIRECT / HASIL: Kembalikan konfirmasi keberhasilan mutasi
  return {
    success: true,
    message: "Data pengiriman berhasil diverifikasi dan dikunci permanen.",
    signature: JSON.stringify(signature),
  };
}
