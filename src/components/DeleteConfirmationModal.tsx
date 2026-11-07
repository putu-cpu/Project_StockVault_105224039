"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Trash2, X } from "lucide-react";
import { deleteProduct } from "../app/actions/catalog";
import { formatIDR } from "../data/mockData";
import { useFocusTrap } from "../hooks/useFocusTrap";
import type { Item } from "../types";

interface DeleteConfirmationModalProps {
  product: Item | null;
  onClose: () => void;
}

export function DeleteConfirmationModal({ product, onClose }: DeleteConfirmationModalProps) {
  const router = useRouter();
  const open = Boolean(product);
  const dialogRef = useFocusTrap<HTMLDivElement>(open, onClose);
  const [mounted, setMounted] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => setMounted(true), []);
  useEffect(() => setError(""), [product]);
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open || !mounted || !product) return null;
  const selectedProduct = product;

  async function confirmDelete() {
    setIsPending(true);
    setError("");
    try {
      const result = await deleteProduct(selectedProduct.id);
      if (!result.success) {
        setError(result.message);
        return;
      }
      onClose();
      router.refresh();
    } catch (deleteError) {
      console.error("Catalog product deletion failed.", deleteError);
      setError("The product could not be deleted. Check your connection and try again.");
    } finally {
      setIsPending(false);
    }
  }

  return createPortal(
    <div className="modal-backdrop bg-slate-900/40 backdrop-blur-sm" onMouseDown={(event) => event.target === event.currentTarget && !isPending && onClose()}>
      <div ref={dialogRef} className="modal-panel catalog-delete-modal" role="alertdialog" aria-modal="true" aria-labelledby="delete-product-title" aria-describedby="delete-product-description">
        <header className="product-modal-header">
          <div>
            <p className="eyebrow">SELLER / MASTER CATALOG</p>
            <h2 id="delete-product-title" className="mt-2 text-xl font-semibold text-stone-950">Delete product?</h2>
          </div>
          <button className="icon-button" type="button" onClick={onClose} disabled={isPending} aria-label="Close delete confirmation"><X aria-hidden="true" size={18} /></button>
        </header>
        <div className="catalog-delete-content">
          <p id="delete-product-description">This permanently removes <strong>{product.name}</strong> ({product.size}, {formatIDR(product.unitPrice)}) from the active hotel catalog.</p>
          <p className="catalog-delete-note">Products referenced by order history cannot be deleted; those records must remain intact.</p>
          {error && <p className="field-error mt-3" role="alert">{error}</p>}
        </div>
        <footer className="catalog-product-form-footer">
          <button className="button-secondary" type="button" onClick={onClose} disabled={isPending}>Cancel</button>
          <button className="button-danger" type="button" onClick={confirmDelete} disabled={isPending}>
            <Trash2 aria-hidden="true" size={14} />
            {isPending ? "Deleting..." : "Delete product"}
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
