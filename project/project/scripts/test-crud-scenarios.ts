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

const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const supplierA_slug = `crud-a-${suffix}`;
const supplierB_slug = `crud-b-${suffix}`;
const sku = `CRUD-${suffix}`;
const failures: string[] = [];
let supplierAId: string | undefined;
let supplierBId: string | undefined;

async function runScenario(name: string, operation: () => Promise<void>) {
  try {
    await operation();
    console.log(`LULUS ${name}`);
  } catch (error) {
    failures.push(name);
    console.error(`GAGAL ${name}:`, error);
  }
}

function isPrismaErrorCode(error: unknown, code: string): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === code
  );
}

async function main() {
  try {
    await runScenario("1 - membuat Supplier dengan slug baru", async () => {
      const supplier = await prisma.supplier.create({
        data: {
          slug: supplierA_slug,
          name: "Supplier Uji CRUD A",
        },
      });
      supplierAId = supplier.id;

      const count = await prisma.supplier.count({
        where: { id: supplier.id, slug: supplierA_slug },
      });
      if (count !== 1) {
        throw new Error("Supplier baru tidak ditemukan setelah dibuat.");
      }
    });

    await runScenario("2 - slug Supplier duplikat menghasilkan P2002", async () => {
      if (!supplierAId) {
        throw new Error("Supplier skenario 1 belum tersedia.");
      }

      try {
        await prisma.supplier.create({
          data: {
            slug: supplierA_slug,
            name: "Supplier Duplikat",
          },
        });
        throw new Error("Supplier duplikat berhasil dibuat.");
      } catch (error) {
        if (!isPrismaErrorCode(error, "P2002")) {
          throw error;
        }
      }

      const count = await prisma.supplier.count({
        where: { slug: supplierA_slug },
      });
      if (count !== 1) {
        throw new Error(`Diharapkan 1 Supplier, ditemukan ${count}.`);
      }
    });

    let productAId: string | undefined;

    await runScenario("3 - membuat Product dengan Supplier valid", async () => {
      if (!supplierAId) {
        throw new Error("Supplier skenario 1 belum tersedia.");
      }

      const product = await prisma.product.create({
        data: {
          supplierId: supplierAId,
          sku,
          name: "Produk Uji CRUD",
          category: "TEST",
          size: "1 unit",
          unitPrice: 1000,
        },
        include: { supplier: true },
      });
      productAId = product.id;

      if (product.supplier.id !== supplierAId) {
        throw new Error("Relasi Product ke Supplier tidak sesuai.");
      }
    });

    await runScenario("5 - SKU sama di Supplier berbeda diizinkan", async () => {
      const supplier = await prisma.supplier.create({
        data: {
          slug: supplierB_slug,
          name: "Supplier Uji CRUD B",
        },
      });
      supplierBId = supplier.id;

      const product = await prisma.product.create({
        data: {
          supplierId: supplier.id,
          sku,
          name: "Produk SKU Sama dari Supplier B",
          category: "TEST",
          size: "1 unit",
          unitPrice: 1200,
        },
      });

      if (product.supplierId !== supplier.id || product.sku !== sku) {
        throw new Error("Product kedua tidak memiliki supplier/SKU yang diharapkan.");
      }
    });

    await runScenario("7 - memperbarui Product yang ada", async () => {
      if (!productAId) {
        throw new Error("Product skenario 3 belum tersedia.");
      }

      const updated = await prisma.product.update({
        where: { id: productAId },
        data: { name: "Produk Uji CRUD Diperbarui" },
      });

      if (updated.name !== "Produk Uji CRUD Diperbarui") {
        throw new Error("Nama Product tidak berubah setelah update.");
      }
    });

    const passed = 5 - failures.length;
    console.log(`Ringkasan skenario yang dijalankan: ${passed}/5 lulus.`);

    if (failures.length > 0) {
      process.exitCode = 1;
    }
  } finally {
    try {
      const supplierIds = [supplierAId, supplierBId].filter(
        (id): id is string => Boolean(id),
      );
      if (supplierIds.length > 0) {
        await prisma.product.deleteMany({
          where: { supplierId: { in: supplierIds } },
        });
        await prisma.supplier.deleteMany({
          where: { id: { in: supplierIds } },
        });
      }
    } finally {
      await prisma.$disconnect();
    }
  }
}

main().catch((error: unknown) => {
  console.error("Pengujian skenario CRUD gagal:", error);
  process.exitCode = 1;
});
