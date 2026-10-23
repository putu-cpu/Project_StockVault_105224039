import { ExternalLink, FileCheck2, LockKeyhole, MapPin, X } from "lucide-react";
import { DataTable } from "./DataTable";
import { StatusBadge } from "./StatusBadge";
import { formatIDR } from "../data/mockData";
import { useFocusTrap } from "../hooks/useFocusTrap";
import type { Transaction } from "../types";

interface InvoiceDetailModalProps {
  open: boolean;
  transaction: Transaction | null;
  onClose: () => void;
  onRequestEdit?: (transactionId: string) => void;
  onEditApproved?: (transaction: Transaction) => void;
  onDeleteRecord?: (transactionId: string) => void;
}

export function InvoiceDetailModal({ open, transaction, onClose, onRequestEdit, onEditApproved, onDeleteRecord }: InvoiceDetailModalProps) {
  const dialogRef = useFocusTrap<HTMLDivElement>(open, onClose);
  if (!open || !transaction) return null;

  const consumed = transaction.items.reduce((sum, line) => sum + line.quantityReceived - line.remainingStock, 0);
  const billed = transaction.items.reduce((sum, line) => sum + (line.quantityReceived - line.remainingStock) * line.item.unitPrice, 0);
  const stockOpnameComplete = transaction.items.every((line) => line.remainingStockConfirmed);

  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div ref={dialogRef} className="modal-panel max-w-4xl invoice-detail-modal" role="dialog" aria-modal="true" aria-labelledby="invoice-detail-title" aria-describedby="invoice-detail-description">
        <div className="flex items-start justify-between gap-4">
          <div><p className="eyebrow">SELLER REVIEW / {transaction.id}</p><h2 id="invoice-detail-title" className="mt-2 text-xl font-semibold tracking-tight text-stone-950">{transaction.hotel}</h2><p id="invoice-detail-description" className="mt-2 inline-flex items-center gap-1.5 text-sm text-stone-600"><MapPin aria-hidden="true" size={14} />{transaction.location} · Submitted {transaction.createdAt}</p></div>
          <button className="icon-button -mr-1 -mt-1" type="button" onClick={onClose} aria-label="Close invoice detail"><X aria-hidden="true" size={18} /></button>
        </div>

        <div className="invoice-detail-badges mt-5"><span className="detail-label">Delivery <StatusBadge status={transaction.deliveryStatus} /></span><span className="detail-label">Record <StatusBadge status={transaction.status} /></span><span className="detail-label">Payment <StatusBadge status={transaction.paymentStatus} /></span></div>
        <div className="mt-4"><DataTable items={transaction.items} location={transaction.location} calculationsEnabled={transaction.status !== "PENDING" && stockOpnameComplete} remainingReadOnlyLabel={transaction.status === "PENDING" ? "Not verified" : stockOpnameComplete ? undefined : "Awaiting stock opname"} /></div>

        <div className="invoice-detail-totals">
          <div><span>Received items</span><strong>{transaction.items.reduce((sum, line) => sum + line.quantityReceived, 0)} units</strong></div>
          <div><span>Remaining stock</span><strong>{stockOpnameComplete ? `${transaction.items.reduce((sum, line) => sum + line.remainingStock, 0)} units` : "Awaiting counts"}</strong></div>
          <div><span>Consumed</span><strong>{stockOpnameComplete ? `${consumed} units` : "Awaiting counts"}</strong></div>
          <div className="invoice-detail-amount"><span>Total billing</span><strong>{transaction.status === "PENDING" ? "Awaiting lock" : stockOpnameComplete ? formatIDR(billed) : "Awaiting stock opname"}</strong></div>
        </div>

        <div className="invoice-detail-proof">
          {transaction.paymentStatus === "PAID" ? <FileCheck2 aria-hidden="true" size={17} /> : <LockKeyhole aria-hidden="true" size={17} />}
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-stone-900">{transaction.paymentStatus === "PAID" ? "Payment recorded" : transaction.status === "LOCKED" ? "Payment pending" : transaction.status === "TERMINATED" ? "Final settlement pending" : "Awaiting hotel verification"}</p>
            {transaction.paymentMethod && <p className="mt-1 text-xs text-stone-600">Method: {transaction.paymentMethod.replaceAll("_", " ")}</p>}
            {transaction.paymentReceiptName && <p className="mt-1 break-all text-xs text-stone-600">Proof: {transaction.paymentReceiptName}</p>}
            {transaction.hashSignature && <p className="mt-2 break-all font-mono text-[10px] leading-5 text-emerald-900">{transaction.hashSignature}</p>}
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <a
              href={`/transactions/${transaction.id}`}
              target="_blank"
              rel="noreferrer"
              className="button-tertiary inline-flex items-center gap-1.5"
              title="Buka sertifikat verifikasi kriptografi rute dinamis"
            >
              <ExternalLink size={12} /> Audit SHA-256
            </a>
            {transaction.status === "LOCKED" && transaction.paymentStatus === "UNPAID" && onRequestEdit && !transaction.editAccessRequested && !transaction.editAccessApproved && <button className="button-secondary" type="button" onClick={() => onRequestEdit(transaction.id)}>Request Edit Access</button>}
            {transaction.editAccessRequested && !transaction.editAccessApproved && <span className="edit-access-state">Awaiting hotel approval</span>}
            {transaction.editAccessApproved && onEditApproved && <button className="button-primary" type="button" onClick={() => onEditApproved(transaction)}>Edit locked record</button>}
            {transaction.status === "TERMINATED" && onDeleteRecord && <button className="button-danger" type="button" onClick={() => onDeleteRecord(transaction.id)}>Delete Record</button>}
            <button className="button-secondary" type="button" onClick={onClose}>Done</button>
          </div>
        </div>
      </div>
    </div>
  );
}
