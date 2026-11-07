import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ShoppingBasket, X } from "lucide-react";
import { formatIDR, hotelPartners } from "../data/mockData";
import { useFocusTrap } from "../hooks/useFocusTrap";
import type { Item, TransactionItem } from "../types";

type ProductCatalogMode = "manage" | "select" | "delivery";

interface ProductCatalogModalProps {
  open: boolean;
  mode: ProductCatalogMode;
  catalog: Item[];
  onClose: () => void;
  onSaveCatalog?: (items: Item[]) => void;
  onSubmitOrder?: (items: TransactionItem[], hotelId?: string, durationMonths?: number) => void;
}

export function ProductCatalogModal({ open, mode, catalog, onClose, onSaveCatalog, onSubmitOrder }: ProductCatalogModalProps) {
  const dialogRef = useFocusTrap<HTMLDivElement>(open, onClose);
  const [draftCatalog, setDraftCatalog] = useState(catalog);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [quantities, setQuantities] = useState<Record<string, string>>({});
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [size, setSize] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [hotelId, setHotelId] = useState(hotelPartners[0]?.id ?? "");
  const [durationMonths, setDurationMonths] = useState(1);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setDraftCatalog(catalog.map((item) => ({ ...item })));
    setSelected({});
    setQuantities({});
    setName("");
    setCategory("");
    setSize("");
    setUnitPrice("");
    setHotelId(hotelPartners[0]?.id ?? "");
    setError("");
  }, [open, catalog]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) return null;

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (mode === "manage") {
      const hasInvalidCatalogRow = draftCatalog.some((item) => !item.name.trim() || !item.category.trim() || !item.size.trim() || !Number.isInteger(item.unitPrice) || item.unitPrice < 1);
      if (hasInvalidCatalogRow) {
        setError("Every catalog item needs a name, category, size, and whole-number price in rupiah.");
        return;
      }
      const price = Number(unitPrice);
      if (!name.trim() || !category.trim() || !size.trim() || !Number.isInteger(price) || price < 1) {
        setError("Enter a product name, category, size, and whole-number price in rupiah.");
        return;
      }
      const idBase = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      let id = idBase;
      let suffix = 2;
      while (draftCatalog.some((item) => item.id === id)) {
        id = `${idBase}-${suffix}`;
        suffix += 1;
      }
      onSaveCatalog?.([...draftCatalog, { id, name: name.trim(), category: category.trim().toUpperCase(), size: size.trim(), unitPrice: price }]);
      onClose();
      return;
    }

    const orderItems = draftCatalog.flatMap((item): TransactionItem[] => {
      if (!selected[item.id]) return [];
      const amount = Number(quantities[item.id]);
      if (!Number.isInteger(amount) || amount < 1) return [];
      return [{ item, quantitySent: amount, quantityReceived: 0, remainingStock: 0, remainingStockConfirmed: false }];
    });
    const selectedCount = Object.values(selected).filter(Boolean).length;
    if (selectedCount === 0 || orderItems.length !== selectedCount) {
      setError("Select at least one product and enter a whole quantity of 1 or more for each item.");
      return;
    }
    if (mode === "delivery" && !hotelId) {
      setError("Choose a hotel partner for this delivery.");
      return;
    }
    onSubmitOrder?.(orderItems, mode === "delivery" ? hotelId : undefined, durationMonths);
    onClose();
  }

  function updateCatalogItem(itemId: string, field: "name" | "category" | "size" | "unitPrice", value: string) {
    setDraftCatalog((current) => current.map((item) => {
      if (item.id !== itemId) return item;
      return { ...item, [field]: field === "unitPrice" ? Number(value) : value };
    }));
  }

  const isManage = mode === "manage";
  const isDelivery = mode === "delivery";
  const title = isManage ? "CV. Alam Zempol master catalog" : isDelivery ? "Create partner delivery" : "Create a delivery request";
  const selectedItems = catalog.filter((item) => selected[item.id] && Number.isInteger(Number(quantities[item.id])) && Number(quantities[item.id]) > 0);
  const selectedQuantity = selectedItems.reduce((total, item) => total + Number(quantities[item.id]), 0);
  const estimatedValue = selectedItems.reduce((total, item) => total + Number(quantities[item.id]) * item.unitPrice, 0);

  function toggleItem(itemId: string, checked: boolean) {
    setSelected((current) => ({ ...current, [itemId]: checked }));
    setQuantities((current) => ({ ...current, [itemId]: checked ? current[itemId] || "1" : "0" }));
    setError("");
  }

  function updateOrderQuantity(itemId: string, value: string) {
    const quantity = Number(value);
    const isSelected = value.trim() !== "" && Number.isInteger(quantity) && quantity > 0;
    setQuantities((current) => ({ ...current, [itemId]: value }));
    setSelected((current) => ({ ...current, [itemId]: isSelected }));
    setError("");
  }

  return createPortal((
    <div className="modal-backdrop bg-slate-900/40 backdrop-blur-sm" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div ref={dialogRef} className="modal-panel max-h-[85vh] max-w-3xl overflow-y-auto product-catalog-modal" role="dialog" aria-modal="true" aria-labelledby="catalog-modal-title" aria-describedby="catalog-modal-description">
        <form className="product-modal-form" onSubmit={submit}>
          <header className="product-modal-header">
            <div className="min-w-0"><p className="eyebrow">{isManage ? "SELLER / MASTER STOCK" : isDelivery ? "SELLER / DELIVERY CREATION" : "HOTEL / ORDER REQUEST"}</p><h2 id="catalog-modal-title" className="mt-2 text-xl font-semibold tracking-tight text-stone-950">{title}</h2><p id="catalog-modal-description" className="mt-2 text-sm leading-6 text-stone-600">{isManage ? "Update the shared product names, categories and IDR prices used for new hotel orders." : isDelivery ? "Choose a partner and quantities from the live CV. Alam Zempol master catalog." : "Select products from the live Alam Zempol catalog. The supplier will prepare the requested quantities for delivery."}</p></div>
            <button className="icon-button -mr-1 -mt-1" type="button" onClick={onClose} aria-label="Close product catalog"><X aria-hidden="true" size={18} /></button>
          </header>
          <div className="product-modal-body">
          {isManage ? (
            <>
              <div className="overflow-x-auto rounded-md border border-stone-200">
                <table className="catalog-edit-table">
                  <caption className="sr-only">Edit Alam Zempol product master stock</caption>
                  <thead><tr><th scope="col">Product name</th><th scope="col">Size</th><th scope="col">Category</th><th scope="col">Unit price (Rp)</th></tr></thead>
                  <tbody>{draftCatalog.map((item) => (
                    <tr key={item.id}>
                      <td><label className="sr-only" htmlFor={`catalog-name-${item.id}`}>Product name for {item.name}</label><input className="form-control" id={`catalog-name-${item.id}`} value={item.name} onChange={(event) => updateCatalogItem(item.id, "name", event.target.value)} /></td>
                      <td><label className="sr-only" htmlFor={`catalog-size-${item.id}`}>Size for {item.name}</label><input className="form-control" id={`catalog-size-${item.id}`} value={item.size} onChange={(event) => updateCatalogItem(item.id, "size", event.target.value)} /></td>
                      <td><label className="sr-only" htmlFor={`catalog-category-${item.id}`}>Category for {item.name}</label><input className="form-control" id={`catalog-category-${item.id}`} value={item.category} onChange={(event) => updateCatalogItem(item.id, "category", event.target.value)} /></td>
                      <td><label className="sr-only" htmlFor={`catalog-price-${item.id}`}>Unit price in rupiah for {item.name}</label><input className="form-control" id={`catalog-price-${item.id}`} type="number" min="1" step="1" value={item.unitPrice} onChange={(event) => updateCatalogItem(item.id, "unitPrice", event.target.value)} /></td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
              <fieldset className="new-product-fieldset mt-5">
                <legend className="form-label">Add a master product</legend>
                <div className="new-product-grid">
                  <div><label className="form-label" htmlFor="new-product-name">Product name</label><input className="form-control" id="new-product-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Herbal Bath Salt 250g" /></div>
                  <div><label className="form-label" htmlFor="new-product-size">Size</label><input className="form-control" id="new-product-size" value={size} onChange={(event) => setSize(event.target.value)} placeholder="250g" /></div>
                  <div><label className="form-label" htmlFor="new-product-category">Category</label><input className="form-control" id="new-product-category" value={category} onChange={(event) => setCategory(event.target.value)} placeholder="BATH CARE" /></div>
                  <div><label className="form-label" htmlFor="new-product-price">Unit price (Rp)</label><input className="form-control" id="new-product-price" type="number" min="1" step="1" value={unitPrice} onChange={(event) => setUnitPrice(event.target.value)} placeholder="65000" /></div>
                </div>
              </fieldset>
            </>
          ) : (
            <>
              <div className="mb-4 grid gap-3 sm:grid-cols-2">
                {isDelivery && <div><label className="form-label" htmlFor="delivery-hotel">Hotel partner</label><select className="form-control" id="delivery-hotel" value={hotelId} onChange={(event) => setHotelId(event.target.value)}>{hotelPartners.map((partner) => <option key={partner.id} value={partner.id}>{partner.name}</option>)}</select></div>}
                <div><label className="form-label" htmlFor="contract-duration">Contract Duration (Months)</label><select className="form-control" id="contract-duration" value={durationMonths} onChange={(event) => setDurationMonths(Number(event.target.value))}><option value={1}>1 Month</option><option value={2}>2 Months</option><option value={6}>6 Months</option><option value={12}>12 Months</option></select></div>
              </div>
              <div className="catalog-select-list">
                {catalog.map((item) => (
                  <div className={`catalog-select-row ${selected[item.id] ? "catalog-select-row-active" : ""}`} key={item.id}>
                    <label className="catalog-select-product"><input type="checkbox" checked={Boolean(selected[item.id])} onChange={(event) => toggleItem(item.id, event.target.checked)} /><span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-stone-900">{item.name}</span><span className="mt-1 block text-[10px] font-semibold tracking-wide text-stone-500">{item.size} · {item.category}</span></span><span className="catalog-product-price">{formatIDR(item.unitPrice)}<span>/ unit</span></span></label>
                    <div className="catalog-quantity"><label className="form-label" htmlFor={`order-quantity-${item.id}`}>{isDelivery ? "Delivery quantity" : "Request quantity"}</label><input className="form-control" id={`order-quantity-${item.id}`} type="number" min="0" step="1" value={quantities[item.id] ?? "0"} onChange={(event) => updateOrderQuantity(item.id, event.target.value)} /></div>
                  </div>
                ))}
              </div>
            </>
          )}
          {error && <p className="field-error mt-3" role="alert">{error}</p>}
          </div>
          <footer className="product-modal-footer">
            {!isManage && <div className="product-order-summary"><div><span>Total Selected Items</span><strong>{selectedItems.length} products · {selectedQuantity} units</strong></div><div><span>Estimated Value (Rp)</span><strong>{formatIDR(estimatedValue)}</strong></div></div>}
            <button className="button-secondary" type="button" onClick={onClose}>Cancel</button>
            <button className="button-primary" type="submit" disabled={!isManage && selectedItems.length === 0}>{isManage ? <><Check aria-hidden="true" size={15} /> Save catalog</> : <><ShoppingBasket aria-hidden="true" size={15} /> {isDelivery ? "Create delivery" : "Submit Order Request"}</>}</button>
          </footer>
        </form>
      </div>
    </div>
  ), document.body);
}
