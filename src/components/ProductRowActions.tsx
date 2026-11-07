"use client";

import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { AddProductModal } from "./AddProductModal";
import { DeleteConfirmationModal } from "./DeleteConfirmationModal";
import { EditProductModal } from "./EditProductModal";
import type { Item } from "../types";

interface ProductCatalogActionsProps {
  product?: Item;
}

export function ProductCatalogActions({ product }: ProductCatalogActionsProps) {
  const router = useRouter();
  const [addOpen, setAddOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Item | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Item | null>(null);

  if (!product) {
    return (
      <>
        <button className="button-primary" type="button" onClick={() => setAddOpen(true)}>
          <Plus aria-hidden="true" size={15} /> Add Product
        </button>
        <AddProductModal open={addOpen} onClose={() => setAddOpen(false)} onSaved={() => router.refresh()} />
      </>
    );
  }

  return (
    <>
      <div className="product-row-actions">
        <button className="button-tertiary" type="button" onClick={() => setEditingProduct(product)} aria-label={`Edit ${product.name}`}>
          <Pencil aria-hidden="true" size={13} /> Edit
        </button>
        <button className="button-danger" type="button" onClick={() => setDeletingProduct(product)} aria-label={`Delete ${product.name}`}>
          <Trash2 aria-hidden="true" size={13} /> Delete
        </button>
      </div>
      <EditProductModal product={editingProduct} onClose={() => setEditingProduct(null)} onSaved={() => router.refresh()} />
      <DeleteConfirmationModal product={deletingProduct} onClose={() => setDeletingProduct(null)} />
    </>
  );
}
