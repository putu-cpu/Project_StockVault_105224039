import { useEffect, useState } from "react";
import { PackagePlus, Trash2, X } from "lucide-react";
import { formatIDR } from "../data/mockData";
import { useFocusTrap } from "../hooks/useFocusTrap";
import type { Item, Transaction, TransactionItem } from "../types";

interface TransactionEditModalProps {
  open: boolean;
  transaction: Transaction | null;
  catalog: Item[];
  onClose: () => void;
  onSave: (transactionId: string, items: TransactionItem[]) => Promise<void>;
}

export function TransactionEditModal({ open, transaction, catalog, onClose, onSave }: TransactionEditModalProps) {
  const dialogRef = useFocusTrap<HTMLDivElement>(open, onClose);
  const [items, setItems] = useState<TransactionItem[]>([]);
  const [itemToAdd, setItemToAdd] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open || !transaction) return;
    setItems(transaction.items.map((line) => ({ ...line })));
    setItemToAdd(catalog.find((item) => !transaction.items.some((line) => line.item.id === item.id))?.id ?? "");
    setError("");
  }, [open, transaction, catalog]);

  if (!open || !transaction) return null;

  const transactionId = transaction.id;
  const availableItems = catalog.filter((item) => !items.some((line) => line.item.id === item.id));

  function addItem() {
    const item = catalog.find((entry) => entry.id === itemToAdd);
    if (!item || items.some((line) => line.item.id === item.id)) return;
    setItems((current) => [...current, { item, quantitySent: 1, quantityReceived: 0, remainingStock: 0, remainingStockConfirmed: false }]);
    setItemToAdd("");
    setError("");
  }

  function updateQuantity(itemId: string, value: string) {
    const quantitySent = Number(value);
    setItems((current) => current.map((line) => line.item.id === itemId ? { ...line, quantitySent: Number.isInteger(quantitySent) ? quantitySent : 0 } : line));
    setError("");
  }

  function replaceItem(currentId: string, nextId: string) {
    const nextItem = catalog.find((item) => item.id === nextId);
    if (!nextItem) return;
    setItems((current) => current.map((line) => line.item.id === currentId
      ? { item: nextItem, quantitySent: line.quantitySent, quantityReceived: 0, remainingStock: 0, remainingStockConfirmed: false }
      : line));
    setError("");
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (items.length === 0 || items.some((line) => !Number.isInteger(line.quantitySent) || line.quantitySent < 1 || line.quantitySent < line.quantityReceived)) {
      setError("Keep at least one product and use whole quantities that cover the received stock.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await onSave(transactionId, items);
      onClose();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "The updated record could not be locked.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && !busy && onClose()}>
      <div ref={dialogRef} className="modal-panel max-w-3xl" role="dialog" aria-modal="true" aria-labelledby="transaction-edit-title" aria-describedby="transaction-edit-description">
        <div className="flex items-start justify-between gap-4">
          <div><p className="eyebrow">HOTEL-APPROVED EDIT / {transaction.id}</p><h2 id="transaction-edit-title" className="mt-2 text-xl font-semibold text-stone-950">Edit locked stock record</h2><p id="transaction-edit-description" className="mt-2 text-sm leading-6 text-stone-600">Update products and sent quantities. Saving creates a new SHA-256 signature and immediately locks the record again.</p></div>
          <button className="icon-button -mr-1 -mt-1" type="button" onClick={onClose} aria-label="Close record editor" disabled={busy}><X aria-hidden="true" size={18} /></button>
        </div>
        <form className="mt-5" onSubmit={save}>
          <div className="transaction-edit-list">
            {items.map((line) => (
              <div className="transaction-edit-row" key={line.item.id}>
                <div className="min-w-0 flex-1"><label className="form-label" htmlFor={`edit-product-${line.item.id}`}>Product</label><select className="form-control" id={`edit-product-${line.item.id}`} value={line.item.id} onChange={(event) => replaceItem(line.item.id, event.target.value)}>{catalog.map((item) => <option key={item.id} value={item.id} disabled={items.some((candidate) => candidate.item.id === item.id && candidate.item.id !== line.item.id)}>{item.name} · {item.size}</option>)}</select><p className="mt-1 text-[10px] text-stone-500">{line.item.category} · {formatIDR(line.item.unitPrice)} · {line.quantityReceived} received</p></div>
                <div className="transaction-edit-quantity"><label className="form-label" htmlFor={`edit-quantity-${line.item.id}`}>Sent quantity</label><input className="form-control" id={`edit-quantity-${line.item.id}`} type="number" min={Math.max(1, line.quantityReceived)} step="1" value={line.quantitySent || ""} onChange={(event) => updateQuantity(line.item.id, event.target.value)} /></div>
                <button className="icon-button transaction-edit-remove" type="button" onClick={() => { setItems((current) => current.filter((entry) => entry.item.id !== line.item.id)); setError(""); }} aria-label={`Remove ${line.item.name}`}><Trash2 aria-hidden="true" size={16} /></button>
              </div>
            ))}
          </div>
          <div className="transaction-edit-add"><label className="sr-only" htmlFor="edit-add-product">Add product</label><select className="form-control" id="edit-add-product" value={itemToAdd} onChange={(event) => setItemToAdd(event.target.value)} disabled={availableItems.length === 0}><option value="">{availableItems.length ? "Choose a catalog item" : "All catalog items are included"}</option>{availableItems.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.size}</option>)}</select><button className="button-secondary" type="button" onClick={addItem} disabled={!itemToAdd}><PackagePlus aria-hidden="true" size={15} /> Add product</button></div>
          {error && <p className="field-error mt-3" role="alert">{error}</p>}
          <div className="mt-5 flex flex-col-reverse gap-2 border-t border-stone-200 pt-4 sm:flex-row sm:justify-end"><button className="button-secondary" type="button" onClick={onClose} disabled={busy}>Cancel</button><button className="button-primary" type="submit" disabled={busy}>{busy ? "Saving and locking..." : "Save & Permanently Lock"}</button></div>
        </form>
      </div>
    </div>
  );
}
