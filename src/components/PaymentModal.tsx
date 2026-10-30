import { useState } from "react";
import { CheckCircle2, Copy, QrCode, X } from "lucide-react";
import { useFocusTrap } from "../hooks/useFocusTrap";
import type { PaymentMethod } from "../types";
import { PaymentSelector } from "./PaymentSelector";

interface PaymentModalProps {
  open: boolean;
  invoiceId: string;
  amount: string;
  onClose: () => void;
  onConfirm: (method: PaymentMethod, receiptName?: string) => void;
}

export function PaymentModal({ open, invoiceId, amount, onClose, onConfirm }: PaymentModalProps) {
  const dialogRef = useFocusTrap<HTMLDivElement>(open, onClose);
  const [method, setMethod] = useState<PaymentMethod>("BCA_VA");
  const [receipt, setReceipt] = useState<File | null>(null);
  const [error, setError] = useState("");
  if (!open) return null;

  const accountNumber = `88002${invoiceId.replace(/\D/g, "").padStart(11, "0").slice(-11)}`;

  function confirm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (method === "BANK_TRANSFER" && !receipt) {
      setError("Choose the bank transfer slip you want to attach.");
      return;
    }
    onConfirm(method, receipt?.name);
  }

  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div ref={dialogRef} className="modal-panel max-w-xl" role="dialog" aria-modal="true" aria-labelledby="payment-title" aria-describedby="payment-description">
        <div className="flex items-start justify-between gap-4">
          <div><p className="eyebrow">INVOICE {invoiceId}</p><h2 id="payment-title" className="mt-2 text-xl font-semibold tracking-tight text-stone-950">Choose payment method</h2></div>
          <button className="icon-button -mr-1 -mt-1" type="button" onClick={onClose} aria-label="Close payment options"><X aria-hidden="true" size={18} /></button>
        </div>
        <p id="payment-description" className="mt-3 text-sm text-stone-600">Amount due <strong className="ml-1 text-stone-950">{amount}</strong></p>
        <form className="mt-5" onSubmit={confirm}>
          <PaymentSelector value={method} onChange={(next) => { setMethod(next); setError(""); }} />
          {method.endsWith("_VA") && (
            <div className="payment-instructions" aria-live="polite">
              <div><p className="eyebrow">{method.replace("_VA", "")} VIRTUAL ACCOUNT</p><p className="mt-2 font-mono text-lg font-semibold tracking-wider text-stone-900">{accountNumber}</p></div>
              <button className="icon-button" type="button" onClick={() => navigator.clipboard?.writeText(accountNumber)} aria-label="Copy virtual account number"><Copy aria-hidden="true" size={15} /></button>
            </div>
          )}
          {method === "QRIS" && <QrisPreview amount={amount} />}
          {method === "BANK_TRANSFER" && (
            <div className="payment-instructions">
              <div className="min-w-0 flex-1"><label className="form-label" htmlFor="transfer-slip">Transfer slip (JPG, PNG or PDF)</label><input className="form-control h-auto py-2" id="transfer-slip" type="file" accept="image/jpeg,image/png,application/pdf" onChange={(event) => { setReceipt(event.target.files?.[0] ?? null); setError(""); }} /></div>
            </div>
          )}
          {error && <p className="field-error mt-3" role="alert">{error}</p>}
          <p className="mt-4 text-[10px] leading-5 text-stone-500">Demo checkout only. No bank or payment gateway is contacted and no money is transferred.</p>
          <div className="mt-5 flex flex-col-reverse gap-2 border-t border-stone-200 pt-4 sm:flex-row sm:justify-end">
            <button className="button-secondary" type="button" onClick={onClose}>Cancel</button>
            <button className="button-primary" type="submit"><CheckCircle2 aria-hidden="true" size={16} /> Confirm demo payment</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function QrisPreview({ amount }: { amount: string }) {
  function isDark(row: number, column: number) {
    for (const [top, left] of [[0, 0], [0, 14], [14, 0]]) {
      const within = row >= top && row < top + 7 && column >= left && column < left + 7;
      if (within) {
        const edge = row === top || row === top + 6 || column === left || column === left + 6;
        const center = row >= top + 2 && row <= top + 4 && column >= left + 2 && column <= left + 4;
        return edge || center;
      }
    }
    return (row * 17 + column * 13 + (row * column) % 7) % 3 === 0;
  }

  return (
    <div className="payment-instructions">
      <div className="qris-code" role="img" aria-label={`Simulated QRIS code for ${amount}`}>
        {Array.from({ length: 441 }, (_, index) => <span className={isDark(Math.floor(index / 21), index % 21) ? "qris-cell-dark" : "qris-cell-light"} key={index} />)}
      </div>
      <div><p className="eyebrow">QRIS PAYMENT REQUEST</p><p className="mt-2 text-xs font-semibold text-stone-900">{amount}</p><p className="mt-1 text-[10px] text-stone-500">Simulation code · not scannable</p><QrCode aria-hidden="true" className="mt-2 text-emerald-800" size={17} /></div>
    </div>
  );
}