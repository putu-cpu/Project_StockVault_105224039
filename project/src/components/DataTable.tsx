import { PackageOpen } from "lucide-react";
import { formatIDR } from "../data/mockData";
import type { Item, TransactionItem } from "../types";

export interface LineErrors {
  quantityReceived?: string;
  remainingStock?: string;
}

interface DataTableProps {
  items: TransactionItem[];
  catalog?: Item[];
  location: string;
  calculationsEnabled?: boolean;
  editable?: boolean;
  allowProductChanges?: boolean;
  allowRemove?: boolean;
  quantityValues?: Record<string, string>;
  remainingValues?: Record<string, string>;
  remainingReadOnlyLabel?: string;
  errors?: Record<string, LineErrors>;
  onQuantityReceivedChange?: (itemId: string, value: string) => void;
  onRemainingStockChange?: (itemId: string, value: string) => void;
  onItemChange?: (currentItemId: string, nextItem: Item) => void;
  onRemoveItem?: (itemId: string) => void;
}

export function DataTable({
  items,
  catalog = [],
  location,
  calculationsEnabled = true,
  editable = false,
  allowProductChanges = editable,
  allowRemove = editable,
  quantityValues = {},
  remainingReadOnlyLabel,
  onQuantityReceivedChange,
  onRemainingStockChange,
  onItemChange,
  onRemoveItem,
  errors = {},
  remainingValues = {},
}: DataTableProps) {
  if (items.length === 0) {
    return (
      <div className="empty-table">
        <PackageOpen aria-hidden="true" size={22} />
        <p>Add at least one product to continue.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border border-stone-200">
      <table className="data-table">
        <caption className="sr-only">
          Hotel stock submission, location, sold units and invoice amount
        </caption>
        <thead>
          <tr>
            <th scope="col">Product</th>
            <th scope="col">Partner location</th>
            <th scope="col">Unit price</th>
            <th scope="col">Sent</th>
            <th scope="col">Received</th>
            <th scope="col">Remaining</th>
            <th scope="col">Sold</th>
            <th scope="col" className="text-right">Amount</th>
            {editable && allowRemove && <th scope="col"><span className="sr-only">Row actions</span></th>}
          </tr>
        </thead>
        <tbody>
          {items.map((line) => {
            const { item } = line;
            const receivedText = quantityValues[item.id] ?? String(line.quantityReceived);
            const remainingText = remainingValues[item.id] ?? String(line.remainingStock);
            const received = Number(receivedText);
            const remaining = Number(remainingText);
            const valid = calculationsEnabled && receivedText.trim() !== "" && remainingText.trim() !== ""
              && Number.isInteger(received) && Number.isInteger(remaining)
              && received >= 0 && remaining >= 0 && remaining <= received;
            const sold = valid ? received - remaining : 0;
            const lineErrors = errors[item.id] ?? {};

            return (
              <tr key={item.id}>
                <td>
                  {editable && allowProductChanges && onItemChange ? (
                    <select
                      className="table-select"
                      value={item.id}
                      onChange={(event) => {
                        const nextItem = catalog.find((entry) => entry.id === event.target.value);
                        if (nextItem) onItemChange(item.id, nextItem);
                      }}
                      aria-label={`Product for ${location} row`}
                    >
                      {catalog.map((entry) => (
                        <option key={entry.id} value={entry.id} disabled={items.some((candidate) => candidate.item.id === entry.id && candidate.item.id !== item.id)}>
                          {entry.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <>
                      <span className="block font-medium text-stone-900">{item.name}</span>
                      <span className="mt-1 block text-xs font-medium tracking-wide text-stone-500">{item.category}</span>
                    </>
                  )}
                </td>
                <td className="whitespace-nowrap">{location}</td>
                <td className="whitespace-nowrap">{formatIDR(item.unitPrice)}</td>
                <td>{line.quantitySent}</td>
                <td>
                  {editable && onQuantityReceivedChange ? (
                    <div>
                      <input className={`table-input ${lineErrors.quantityReceived ? "table-input-error" : ""}`} type="number" min="0" max={line.quantitySent} step="1" value={receivedText} onChange={(event) => onQuantityReceivedChange(item.id, event.target.value)} aria-label={`Received quantity for ${item.name}`} aria-invalid={Boolean(lineErrors.quantityReceived)} aria-describedby={lineErrors.quantityReceived ? `received-error-${item.id}` : undefined} />
                      {lineErrors.quantityReceived && <p id={`received-error-${item.id}`} className="field-error" role="alert">{lineErrors.quantityReceived}</p>}
                    </div>
                  ) : <span>{line.quantityReceived}</span>}
                </td>
                <td>
                  {editable && onRemainingStockChange ? (
                    <div>
                      <input className={`table-input ${lineErrors.remainingStock ? "table-input-error" : ""}`} type="number" min="0" max={line.quantityReceived} step="1" value={remainingText} onChange={(event) => onRemainingStockChange(item.id, event.target.value)} aria-label={`Remaining stock for ${item.name}`} aria-invalid={Boolean(lineErrors.remainingStock)} aria-describedby={lineErrors.remainingStock ? `remaining-error-${item.id}` : undefined} />
                      {lineErrors.remainingStock && <p id={`remaining-error-${item.id}`} className="field-error" role="alert">{lineErrors.remainingStock}</p>}
                    </div>
                  ) : <span>{remainingReadOnlyLabel ?? line.remainingStock}</span>}
                </td>
                <td>{valid ? sold : "—"}</td>
                <td className="whitespace-nowrap text-right font-semibold text-stone-900">{valid ? formatIDR(sold * item.unitPrice) : "—"}</td>
                {editable && allowRemove && <td><button className="icon-button" type="button" onClick={() => onRemoveItem?.(item.id)} disabled={items.length === 1} aria-label={`Remove ${item.name}`}><span aria-hidden="true">×</span></button></td>}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}