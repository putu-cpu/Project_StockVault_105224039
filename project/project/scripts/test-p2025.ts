import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL belum diatur di .env");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function main() {
  const missingProductId = `p2025-test-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;

  try {
    await prisma.product.update({
      where: { id: missingProductId },
      data: { name: "Produk yang tidak akan dibuat" },
    });

    throw new Error("Pengujian gagal: update terhadap ID yang tidak ada berhasil.");
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2025"
    ) {
      console.log("Berhasil: Prisma menghasilkan P2025 untuk Product yang tidak ditemukan.");
      return;
    }

    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error("Pengujian P2025 gagal:", error);
  process.exitCode = 1;
});
