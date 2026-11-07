"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Check, X } from "lucide-react";
import { productCategories } from "../../lib/validations";
import type { CatalogActionResult } from "../app/actions/catalog";
import { useFocusTrap } from "../hooks/useFocusTrap";
import type { Item } from "../types";

interface CatalogProductFormModalProps {
  open: boolean;
  title: string;
  description: string;
  initialProduct?: Item;
  submitProduct: (input: unknown) => Promise<CatalogActionResult>;
  onClose: () => void;
  onSaved: () => void;
}

type FormFields = {
  name: string;
  category: string;
  packageSize: string;
  price: string;
};

const emptyFields: FormFields = {
  name: "",
  category: "",
  packageSize: "",
  price: "",
};

export function CatalogProductFormModal({
  open,
  title,
  description,
  initialProduct,
  submitProduct,
  onClose,
  onSaved,
}: CatalogProductFormModalProps) {
  const dialogRef = useFocusTrap<HTMLDivElement>(open, onClose);
  const [mounted, setMounted] = useState(false);
  const [fields, setFields] = useState<FormFields>(emptyFields);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [formError, setFormError] = useState("");
  const [isPending, setIsPending] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    setFields(initialProduct
      ? {
          name: initialProduct.name,
          category: initialProduct.category,
          packageSize: initialProduct.size,
          price: String(initialProduct.unitPrice),
        }
      : emptyFields);
    setFieldErrors({});
    setFormError("");
  }, [open, initialProduct]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open || !mounted) return null;

  function updateField(field: keyof FormFields, value: string) {
    setFields((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: [] }));
    setFormError("");
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPending(true);
    setFieldErrors({});
    setFormError("");

    try {
      const result = await submitProduct(fields);
      if (!result.success) {
        setFieldErrors(result.fieldErrors ?? {});
        setFormError(result.message);
        return;
      }

      onSaved();
      onClose();
    } catch (error) {
      console.error("Catalog product form submission failed.", error);
      setFormError("The request could not be completed. Check your connection and try again.");
    } finally {
      setIsPending(false);
    }
  }

  return createPortal(
    <div
      className="modal-backdrop bg-slate-900/40 backdrop-blur-sm"
      onMouseDown={(event) => event.target === event.currentTarget && !isPending && onClose()}
    >
      <div
        ref={dialogRef}
        className="modal-panel catalog-product-form-modal max-h-[85vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-form-title"
        aria-describedby="product-form-description"
      >
        <form noValidate onSubmit={submit}>
          <header className="product-modal-header">
            <div>
              <p className="eyebrow">SELLER / MASTER CATALOG</p>
              <h2 id="product-form-title" className="mt-2 text-xl font-semibold text-stone-950">{title}</h2>
              <p id="product-form-description" className="mt-2 text-sm leading-6 text-stone-600">{description}</p>
            </div>
            <button className="icon-button" type="button" onClick={onClose} disabled={isPending} aria-label="Close product form">
              <X aria-hidden="true" size={18} />
            </button>
          </header>

          <div className="catalog-product-form-fields">
            <div>
              <label className="form-label" htmlFor="catalog-product-name">Product name</label>
              <input
                className={`form-control ${fieldErrors.name?.length ? "table-input-error" : ""}`}
                id="catalog-product-name"
                name="name"
                minLength={3}
                maxLength={120}
                required
                value={fields.name}
                onChange={(event) => updateField("name", event.target.value)}
                aria-invalid={Boolean(fieldErrors.name?.length)}
                aria-describedby={fieldErrors.name?.length ? "catalog-product-name-error" : undefined}
              />
              {fieldErrors.name?.[0] && <p className="field-error mt-1" id="catalog-product-name-error">{fieldErrors.name[0]}</p>}
            </div>

            <div className="catalog-product-fields-grid">
              <div>
                <label className="form-label" htmlFor="catalog-product-category">Category</label>
                <select
                  className={`form-control ${fieldErrors.category?.length ? "table-input-error" : ""}`}
                  id="catalog-product-category"
                  name="category"
                  required
                  value={fields.category}
                  onChange={(event) => updateField("category", event.target.value)}
                  aria-invalid={Boolean(fieldErrors.category?.length)}
                  aria-describedby={fieldErrors.category?.length ? "catalog-product-category-error" : undefined}
                >
                  <option value="" disabled>Select a category</option>
                  {productCategories.map((category) => <option key={category} value={category}>{category}</option>)}
                </select>
                {fieldErrors.category?.[0] && <p className="field-error mt-1" id="catalog-product-category-error">{fieldErrors.category[0]}</p>}
              </div>

              <div>
                <label className="form-label" htmlFor="catalog-product-size">Package size</label>
                <input
                  className={`form-control ${fieldErrors.packageSize?.length ? "table-input-error" : ""}`}
                  id="catalog-product-size"
                  name="packageSize"
                  maxLength={40}
                  placeholder="e.g. 100g or 125ml"
                  required
                  value={fields.packageSize}
                  onChange={(event) => updateField("packageSize", event.target.value)}
                  aria-invalid={Boolean(fieldErrors.packageSize?.length)}
                  aria-describedby={fieldErrors.packageSize?.length ? "catalog-product-size-error" : undefined}
                />
                {fieldErrors.packageSize?.[0] && <p className="field-error mt-1" id="catalog-product-size-error">{fieldErrors.packageSize[0]}</p>}
              </div>
            </div>

            <div>
              <label className="form-label" htmlFor="catalog-product-price">Unit price (IDR)</label>
              <input
                className={`form-control ${fieldErrors.price?.length ? "table-input-error" : ""}`}
                id="catalog-product-price"
                name="price"
                type="number"
                min="1"
                step="1"
                inputMode="numeric"
                required
                value={fields.price}
                onChange={(event) => updateField("price", event.target.value)}
                aria-invalid={Boolean(fieldErrors.price?.length)}
                aria-describedby={fieldErrors.price?.length ? "catalog-product-price-error" : undefined}
              />
              {fieldErrors.price?.[0] && <p className="field-error mt-1" id="catalog-product-price-error">{fieldErrors.price[0]}</p>}
            </div>

            {formError && <p className="field-error" role="alert">{formError}</p>}
          </div>

          <footer className="catalog-product-form-footer">
            <button className="button-secondary" type="button" onClick={onClose} disabled={isPending}>Cancel</button>
            <button className="button-primary" type="submit" disabled={isPending}>
              <Check aria-hidden="true" size={15} />
              {isPending ? "Saving..." : "Save product"}
            </button>
          </footer>
        </form>
      </div>
    </div>,
    document.body,
  );
}
