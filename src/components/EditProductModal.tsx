"use client";

import { updateProduct } from "../app/actions/catalog";
import type { Item } from "../types";
import { CatalogProductFormModal } from "./CatalogProductFormModal";

interface EditProductModalProps {
  product: Item | null;
  onClose: () => void;
  onSaved: () => void;
}

export function EditProductModal({ product, onClose, onSaved }: EditProductModalProps) {
  return (
    <CatalogProductFormModal
      open={Boolean(product)}
      title="Edit product"
      description="Changes apply to new hotel orders. Existing order snapshots stay unchanged."
      initialProduct={product ?? undefined}
      submitProduct={(input) => product ? updateProduct(product.id, input) : Promise.resolve({ success: false, message: "Select a product to edit." })}
      onClose={onClose}
      onSaved={onSaved}
    />
  );
}
