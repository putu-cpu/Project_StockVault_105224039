"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "../../../lib/prisma";
import { productSchema } from "../../../lib/validations";
import { getSessionUser } from "../../lib/session";
import { isAuthorized } from "../../lib/access-control";
import type { Item } from "../../types";

type CatalogFieldErrors = Partial<Record<"name" | "category" | "packageSize" | "price", string[]>>;

export type CatalogActionResult =
  | { success: true; product?: Item }
  | { success: false; message: string; fieldErrors?: CatalogFieldErrors };

async function getSellerSupplierId(): Promise<string | CatalogActionResult> {
  const user = await getSessionUser();
  if (!isAuthorized(user, "catalog:write")) {
    return { success: false, message: "Only an authenticated supplier can manage the master catalog." };
  }

  const supplier = await prisma.supplier.findUnique({
    where: { slug: "alam-zempol" },
    select: { id: true },
  });
  if (!supplier) {
    return { success: false, message: "CV. Alam Zempol is not configured in the database. Run the Prisma seed first." };
  }

  return supplier.id;
}

function isActionError(value: string | CatalogActionResult): value is CatalogActionResult {
  return typeof value !== "string";
}

function parseProduct(input: unknown) {
  const result = productSchema.safeParse(input);
  if (!result.success) {
    return {
      success: false as const,
      message: "Please correct the highlighted product details.",
      fieldErrors: result.error.flatten().fieldErrors,
    };
  }
  return { success: true as const, data: result.data };
}

function toItem(product: {
  id: string;
  name: string;
  category: string;
  size: string;
  unitPrice: number;
}): Item {
  return {
    id: product.id,
    name: product.name,
    category: product.category,
    size: product.size,
    unitPrice: product.unitPrice,
  };
}

export async function listProducts(): Promise<Item[]> {
  const supplier = await prisma.supplier.findUnique({
    where: { slug: "alam-zempol" },
    select: { id: true },
  });
  if (!supplier) return [];

  const products = await prisma.product.findMany({
    where: { supplierId: supplier.id, isActive: true },
    orderBy: [{ name: "asc" }, { id: "asc" }],
    select: { id: true, name: true, category: true, size: true, unitPrice: true },
  });

  return products.map(toItem);
}

export async function createProduct(input: unknown): Promise<CatalogActionResult> {
  const parsed = parseProduct(input);
  if (!parsed.success) return parsed;

  const supplierId = await getSellerSupplierId();
  if (isActionError(supplierId)) return supplierId;

  try {
    const product = await prisma.product.create({
      data: {
        supplierId,
        sku: `manual-${randomUUID()}`,
        name: parsed.data.name,
        category: parsed.data.category,
        size: parsed.data.packageSize,
        unitPrice: parsed.data.price,
      },
      select: { id: true, name: true, category: true, size: true, unitPrice: true },
    });
    revalidatePath("/");
    return { success: true, product: toItem(product) };
  } catch (error) {
    console.error("Could not create master catalog product.", error);
    return { success: false, message: "The product could not be saved. Check the database connection and try again." };
  }
}

export async function updateProduct(id: string, input: unknown): Promise<CatalogActionResult> {
  const parsed = parseProduct(input);
  if (!parsed.success) return parsed;

  const supplierId = await getSellerSupplierId();
  if (isActionError(supplierId)) return supplierId;

  try {
    const product = await prisma.product.update({
      where: { id, supplierId, isActive: true },
      data: {
        name: parsed.data.name,
        category: parsed.data.category,
        size: parsed.data.packageSize,
        unitPrice: parsed.data.price,
      },
      select: { id: true, name: true, category: true, size: true, unitPrice: true },
    });
    revalidatePath("/");
    return { success: true, product: toItem(product) };
  } catch (error) {
    console.error("Could not update master catalog product.", error);
    return { success: false, message: "The product could not be updated. It may have been removed; refresh and try again." };
  }
}

export async function deleteProduct(id: string): Promise<CatalogActionResult> {
  const supplierId = await getSellerSupplierId();
  if (isActionError(supplierId)) return supplierId;

  try {
    const product = await prisma.product.findFirst({
      where: { id, supplierId, isActive: true },
      select: { id: true },
    });
    if (!product) {
      return { success: false, message: "This product is no longer available in the supplier catalog." };
    }

    const transactionItemCount = await prisma.transactionItem.count({
      where: { productId: product.id },
    });
    if (transactionItemCount > 0) {
      return {
        success: false,
        message: "This product is part of an order history and cannot be permanently deleted. Historical order records must remain intact.",
      };
    }

    await prisma.product.delete({ where: { id: product.id } });
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Could not delete master catalog product.", error);
    return { success: false, message: "The product could not be deleted. Refresh the catalog and try again." };
  }
}
