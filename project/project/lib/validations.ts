import { z } from "zod";

export const productCategories = [
  "SOAP",
  "FACE CARE",
  "BODY CARE",
  "HAIR CARE",
  "AROMA",
] as const;

export const productSchema = z.object({
  name: z.string().trim().min(3, "Product name must be at least 3 characters.").max(120, "Product name must be 120 characters or less."),
  category: z.enum(productCategories, {
    error: "Select a valid product category.",
  }),
  packageSize: z.string().trim().min(1, "Package size is required.").max(40, "Package size must be 40 characters or less."),
  price: z.union([
    z.number(),
    z.string().regex(/^\d+$/, "Price must be a whole number of rupiah."),
  ])
    .transform(Number)
    .pipe(z.number()
    .int("Price must be a whole number of rupiah.")
    .positive("Price must be greater than zero.")
    .max(2_147_483_647, "Price exceeds the supported maximum.")),
});

export type ProductInput = z.infer<typeof productSchema>;
