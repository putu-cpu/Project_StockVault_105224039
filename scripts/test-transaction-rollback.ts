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

function isPrismaErrorCode(error: unknown, code: string): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === code
  );
}

async function main() {
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const restrictedSupplierSlug = `restrict-test-${suffix}`;
  let restrictedSupplierId: string | undefined;

  try {
    const supplier = await prisma.supplier.create({
      data: {
        slug: restrictedSupplierSlug,
        name: "Supplier Uji Restrict",
      },
    });
    restrictedSupplierId = supplier.id;

    await prisma.product.create({
      data: {
        supplierId: supplier.id,
        sku: `RESTRICT-${suffix}`,
        name: "Produk Uji Restrict",
        category: "TEST",
        size: "1 unit",
        unitPrice: 1000,
      },
    });

    console.log("Penghapusan tanpa transaksi: Supplier memiliki 1 Product.");

    try {
      await prisma.supplier.delete({ where: { id: supplier.id } });
      throw new Error("Pengujian gagal: Supplier yang direferensikan berhasil dihapus.");
    } catch (error) {
      if (isPrismaErrorCode(error, "P2003")) {
        const [supplierStillExists, productCount] = await Promise.all([
          prisma.supplier.count({ where: { id: supplier.id } }),
          prisma.product.count({ where: { supplierId: supplier.id } }),
        ]);

        if (supplierStillExists !== 1 || productCount !== 1) {
          throw new Error("Data setelah penolakan penghapusan tidak sesuai kondisi awal.");
        }

        console.log(
          `Hasil: P2003; setelah gagal hapus tetap ada ${supplierStillExists} Supplier dan ${productCount} Product.`,
        );
      } else {
        throw error;
      }
    }
  } finally {
    if (restrictedSupplierId) {
      await prisma.product.deleteMany({
        where: { supplierId: restrictedSupplierId },
      });
      await prisma.supplier.delete({
        where: { id: restrictedSupplierId },
      });
    }
  }

  const rollbackSupplierSlug = `rollback-test-${suffix}`;
  const beforeRollback = await prisma.supplier.count({
    where: { slug: rollbackSupplierSlug },
  });

  console.log(`Sebelum transaksi: ${beforeRollback} Supplier dengan slug uji.`);

  try {
    await prisma.$transaction(async (transaction) => {
      const supplier = await transaction.supplier.create({
        data: {
          slug: rollbackSupplierSlug,
          name: "Supplier Uji Rollback",
        },
      });

      await transaction.product.create({
        data: {
          supplierId: `missing-supplier-${suffix}`,
          sku: `ROLLBACK-${suffix}`,
          name: "Produk Pemicu Rollback",
          category: "TEST",
          size: "1 unit",
          unitPrice: 1000,
        },
      });

      return supplier;
    });

    throw new Error("Pengujian gagal: operasi dengan foreign key tidak valid berhasil.");
  } catch (error) {
    if (!isPrismaErrorCode(error, "P2003")) {
      throw error;
    }

    console.log("Transaksi gagal sesuai harapan dengan P2003.");
  }

  const afterRollback = await prisma.supplier.count({
    where: { slug: rollbackSupplierSlug },
  });

  console.log(`Sesudah rollback: ${afterRollback} Supplier dengan slug uji.`);

  if (beforeRollback !== 0 || afterRollback !== beforeRollback) {
    throw new Error("Rollback gagal: perubahan Supplier masih tersimpan.");
  }

  console.log("Berhasil: perubahan di dalam transaksi sudah di-rollback.");
}

main()
  .catch((error: unknown) => {
    console.error("Pengujian Restrict/rollback gagal:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
