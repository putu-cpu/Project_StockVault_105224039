"use client";

import { createProduct } from "../app/actions/catalog";
import { CatalogProductFormModal } from "./CatalogProductFormModal";

interface AddProductModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export function AddProductModal({ open, onClose, onSaved }: AddProductModalProps) {
  return (
    <CatalogProductFormModal
      open={open}
      title="Add product"
      description="Add a product to the master catalog shared with hotel partners."
      submitProduct={createProduct}
      onClose={onClose}
      onSaved={onSaved}
    />
  );
}
