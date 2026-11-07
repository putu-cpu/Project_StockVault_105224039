import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ShoppingBasket, X } from "lucide-react";
import { listProducts } from "../app/actions/catalog";
import { formatIDR } from "../data/mockData";
import { useFocusTrap } from "../hooks/useFocusTrap";
import type { Item, TransactionItem } from "../types";

interface ProductCatalogModalProps {
  open: boolean;
  catalog: Item[];
  onCatalogLoaded: (catalog: Item[]) => void;
  onClose: () => void;
  onSubmitOrder: (items: TransactionItem[], durationMonths?: number) => void;
}

export function ProductCatalogModal({ open, catalog, onCatalogLoaded, onClose, onSubmitOrder }: ProductCatalogModalProps) {
  const dialogRef = useFocusTrap<HTMLDivElement>(open, onClose);
  const catalogRef = useRef(catalog);
  const onCatalogLoadedRef = useRef(onCatalogLoaded);
  catalogRef.current = catalog;
  onCatalogLoadedRef.current = onCatalogLoaded;
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [quantities, setQuantities] = useState<Record<string, string>>({});
  const [durationMonths, setDurationMonths] = useState(1);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);
  const [liveCatalog, setLiveCatalog] = useState(catalog);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(false);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (!open) return;
    setSelected({});
    setQuantities({});
    setDurationMonths(1);
    setError("");
    setLiveCatalog(catalogRef.current);
    setIsLoadingCatalog(true);
    let active = true;
    listProducts()
      .then((products) => {
        if (active) {
          setLiveCatalog(products);
          onCatalogLoadedRef.current(products);
        }
      })
      .catch((loadError: unknown) => {
        console.error("Could not refresh the hotel product catalog.", loadError);
        if (active) {
          setLiveCatalog([]);
          setError("The live catalog could not be loaded. Close this window and try again.");
        }
      })
      .finally(() => {
        if (active) setIsLoadingCatalog(false);
      });
    return () => {
      active = false;
    };
  }, [open]);
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open || !mounted) return null;

  const selectedItems = liveCatalog.filter((item) => selected[item.id] && Number.isInteger(Number(quantities[item.id])) && Number(quantities[item.id]) > 0);
  const selectedQuantity = selectedItems.reduce((total, item) => total + Number(quantities[item.id]), 0);
  const estimatedValue = selectedItems.reduce((total, item) => total + Number(quantities[item.id]) * item.unitPrice, 0);

  function updateOrderQuantity(itemId: string, value: string) {
    const quantity = Number(value);
    setQuantities((current) => ({ ...current, [itemId]: value }));
    setSelected((current) => ({ ...current, [itemId]: value.trim() !== "" && Number.isInteger(quantity) && quantity > 0 }));
    setError("");
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const orderItems = liveCatalog.flatMap((item): TransactionItem[] => {
      if (!selected[item.id]) return [];
      const quantity = Number(quantities[item.id]);
      if (!Number.isInteger(quantity) || quantity < 1) return [];
      return [{ item, quantitySent: quantity, quantityReceived: 0, remainingStock: 0, remainingStockConfirmed: false }];
    });

    if (orderItems.length === 0 || orderItems.length !== Object.values(selected).filter(Boolean).length) {
      setError("Select at least one product and enter a whole quantity of 1 or more.");
      return;
    }

    onSubmitOrder(orderItems, durationMonths);
    onClose();
  }

  return createPortal(
    <div className="modal-backdrop bg-slate-900/40 backdrop-blur-sm" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div ref={dialogRef} className="modal-panel max-h-[85vh] max-w-3xl overflow-y-auto product-catalog-modal" role="dialog" aria-modal="true" aria-labelledby="catalog-modal-title" aria-describedby="catalog-modal-description">
        <form className="product-modal-form" onSubmit={submit}>
          <header className="product-modal-header">
            <div className="min-w-0">
              <p className="eyebrow">HOTEL / ORDER REQUEST</p>
              <h2 id="catalog-modal-title" className="mt-2 text-xl font-semibold tracking-tight text-stone-950">Request items from the supplier catalog</h2>
              <p id="catalog-modal-description" className="mt-2 text-sm leading-6 text-stone-600">Choose products from the live Alam Zempol catalog. The supplier will prepare the requested quantities for delivery.</p>
            </div>
            <button className="icon-button -mr-1 -mt-1" type="button" onClick={onClose} aria-label="Close product catalog"><X aria-hidden="true" size={18} /></button>
          </header>
          <div className="product-modal-body">
            <div className="mb-4 grid gap-3 sm:grid-cols-2">
              <div>
                <label className="form-label" htmlFor="contract-duration">Contract Duration (Months)</label>
                <select className="form-control" id="contract-duration" value={durationMonths} onChange={(event) => setDurationMonths(Number(event.target.value))}>
                  <option value={1}>1 Month</option>
                  <option value={2}>2 Months</option>
                  <option value={6}>6 Months</option>
                  <option value={12}>12 Months</option>
                </select>
              </div>
            </div>
            {isLoadingCatalog ? (
              <div className="empty-state empty-state-compact"><h2>Loading live catalog</h2><p>Checking the latest products and prices from CV. Alam Zempol.</p></div>
            ) : liveCatalog.length === 0 ? (
              <div className="empty-state empty-state-compact"><h2>No products are available</h2><p>Please contact CV. Alam Zempol for the current master catalog.</p></div>
            ) : (
              <div className="catalog-select-list">
                {liveCatalog.map((item) => (
                  <div className={`catalog-select-row ${selected[item.id] ? "catalog-select-row-active" : ""}`} key={item.id}>
                    <label className="catalog-select-product">
                      <input type="checkbox" checked={Boolean(selected[item.id])} onChange={(event) => {
                        setSelected((current) => ({ ...current, [item.id]: event.target.checked }));
                        setQuantities((current) => ({ ...current, [item.id]: event.target.checked ? current[item.id] || "1" : "0" }));
                        setError("");
                      }} />
                      <span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-stone-900">{item.name}</span><span className="mt-1 block text-[10px] font-semibold tracking-wide text-stone-500">{item.size} · {item.category}</span></span>
                      <span className="catalog-product-price">{formatIDR(item.unitPrice)}<span>/ unit</span></span>
                    </label>
                    <div className="catalog-quantity"><label className="form-label" htmlFor={`order-quantity-${item.id}`}>Request quantity</label><input className="form-control" id={`order-quantity-${item.id}`} type="number" min="0" step="1" value={quantities[item.id] ?? "0"} onChange={(event) => updateOrderQuantity(item.id, event.target.value)} /></div>
                  </div>
                ))}
              </div>
            )}
            {error && <p className="field-error mt-3" role="alert">{error}</p>}
          </div>
          <footer className="product-modal-footer">
            <div className="product-order-summary"><div><span>Total Selected Items</span><strong>{selectedItems.length} products · {selectedQuantity} units</strong></div><div><span>Estimated Value (Rp)</span><strong>{formatIDR(estimatedValue)}</strong></div></div>
            <button className="button-secondary" type="button" onClick={onClose}>Cancel</button>
            <button className="button-primary" type="submit" disabled={selectedItems.length === 0 || isLoadingCatalog || liveCatalog.length === 0}><Check aria-hidden="true" size={15} /><ShoppingBasket aria-hidden="true" size={15} /> Submit Order Request</button>
          </footer>
        </form>
      </div>
    </div>,
    document.body,
  );
}
