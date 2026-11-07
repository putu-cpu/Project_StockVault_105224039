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
  const supplier = await prisma.supplier.upsert({
    where: { slug: "alam-zempol" },
    update: {},
    create: {
      slug: "alam-zempol",
      name: "CV. Alam Zempol",
      legalName: "CV. Alam Zempol",
      email: "seller@alamzempol.com",
    },
  });

  const hotels = [
    {
      slug: "grand-hyatt",
      name: "Grand Hyatt Bali",
      location: "Nusa Dua, Bali",
      contactEmail: "hotel@grandhyatt.com",
    },
    {
      slug: "ayana-resort",
      name: "Ayana Resort Bali",
      location: "Jimbaran, Bali",
      contactEmail: "hotel@ayana.com",
    },
  ];

  for (const hotel of hotels) {
    await prisma.hotel.upsert({
      where: { slug: hotel.slug },
      update: {},
      create: hotel,
    });
  }

  const products = [
    { sku: "soap-natural-100", name: "Natural Soap 100g", category: "SOAP", size: "100g", unitPrice: 42_000 },
    { sku: "toner-moist-125", name: "Face Toner Moist 125ml", category: "FACE CARE", size: "125ml", unitPrice: 75_000 },
    { sku: "body-soap-pump-500", name: "Liquid Body Soap 500ml Pump", category: "BODY CARE", size: "500ml", unitPrice: 78_000 },
    { sku: "massage-oil-100", name: "Massage Oil 100ml", category: "BODY CARE", size: "100ml", unitPrice: 57_000 },
    { sku: "shampoo-pump-500", name: "Shampoo 500ml Pump", category: "HAIR CARE", size: "500ml", unitPrice: 78_000 },
    { sku: "citronella-oil-20", name: "Essential Oil Citronella 20ml", category: "AROMA", size: "20ml", unitPrice: 56_000 },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: {
        supplierId_sku: {
          supplierId: supplier.id,
          sku: product.sku,
        },
      },
      update: {},
      create: {
        ...product,
        supplierId: supplier.id,
      },
    });
  }

  const [supplierCount, hotelCount, productCount] = await Promise.all([
    prisma.supplier.count({ where: { slug: "alam-zempol" } }),
    prisma.hotel.count({ where: { slug: { in: hotels.map((hotel) => hotel.slug) } } }),
    prisma.product.count({ where: { supplierId: supplier.id } }),
  ]);

  console.log(
    `Seed selesai. Data seed saat ini: ${supplierCount} supplier, ${hotelCount} hotel, ${productCount} produk.`,
  );
}

main()
  .catch((error: unknown) => {
    console.error("Seed gagal:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
