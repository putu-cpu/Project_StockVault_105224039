import { useEffect, useMemo, useState } from "react";
import { ArrowDownToLine, Check, FileCheck2, LockKeyhole, MapPin, PackageCheck, ShieldCheck, Truck } from "lucide-react";
import { AlertBanner } from "../components/AlertBanner";
import { DataTable, type LineErrors } from "../components/DataTable";
import { ModalConfirmation } from "../components/ModalConfirmation";
import { PaymentModal } from "../components/PaymentModal";
import { ProductCatalogModal } from "../components/ProductCatalogModal";
import { StatusBadge } from "../components/StatusBadge";
import { formatIDR } from "../data/mockData";
import type { Item, PaymentMethod, Transaction, TransactionItem } from "../types";

interface HotelDashboardPageProps {
  hotelName: string;
  hotelLocation: string;
  transactions: Transaction[];
  catalog: Item[];
  onCreateOrder: (items: TransactionItem[]) => void;
  onConfirmDeliveryArrival: (transactionId: string) => void;
  onLockDelivery: (transactionId: string, received: Record<string, number>) => Promise<void>;
  onUpdateStock: (transactionId: string, itemId: string, remainingStock: number) => void;
  onConfirmPayment: (transactionId: string, method: PaymentMethod, receiptName?: string) => void;
  onTerminate: (transactionId: string) => void;
  onApproveEditAccess: (transactionId: string) => void;
  onDeleteRecord: (transactionId: string) => void;
}

export function HotelDashboardPage({ hotelName, hotelLocation, transactions, catalog, onCreateOrder, onConfirmDeliveryArrival, onLockDelivery, onUpdateStock, onConfirmPayment, onTerminate, onApproveEditAccess, onDeleteRecord }: HotelDashboardPageProps) {
  const [selectedId, setSelectedId] = useState(() => transactions.find((entry) => entry.status === "PENDING")?.id ?? transactions[0]?.id ?? "");
  const [receivedDrafts, setReceivedDrafts] = useState<Record<string, string>>({});
  const [remainingDrafts, setRemainingDrafts] = useState<Record<string, string>>({});
  const [lockOpen, setLockOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [orderOpen, setOrderOpen] = useState(false);
  const [terminationOpen, setTerminationOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [paidNotice, setPaidNotice] = useState(false);
  const [recordTab, setRecordTab] = useState<"pending" | "locked" | "paid" | "terminated">("pending");
  const transaction = transactions.find((entry) => entry.id === selectedId) ?? transactions[0];
  const tabTransactions = transactions.filter((entry) => {
    if (recordTab === "pending") return entry.status === "PENDING" || entry.deliveryStatus === "IN_TRANSIT";
    if (recordTab === "locked") return entry.status === "LOCKED" && entry.paymentStatus === "UNPAID";
    if (recordTab === "paid") return entry.paymentStatus === "PAID";
    return entry.status === "TERMINATED";
  });

  useEffect(() => {
    const newestPending = transactions.find((entry) => entry.status === "PENDING");
    if (newestPending) setSelectedId(newestPending.id);
  }, [transactions.length]);

  const lockedInvoices = useMemo(() => transactions.filter((entry) => entry.status === "LOCKED" || entry.status === "TERMINATED"), [transactions]);
  const amountDue = transaction?.items.reduce((sum, line) => sum + (line.quantityReceived - line.remainingStock) * line.item.unitPrice, 0) ?? 0;
  const consumedUnits = transaction?.items.reduce((sum, line) => sum + line.quantityReceived - line.remainingStock, 0) ?? 0;

  if (!transaction) {
    return <section className="page-section" aria-labelledby="hotel-empty-title"><div className="empty-state"><span className="empty-state-mark"><PackageCheck aria-hidden="true" size={22} /></span><p className="eyebrow">CV. ALAM ZEMPOL / HOTEL WORKSPACE</p><h1 id="hotel-empty-title">Your ledger starts here.</h1><p>Request the amenities your team needs from the shared supplier catalog. New deliveries will appear in this private hotel workspace.</p><button className="button-primary" type="button" onClick={() => setOrderOpen(true)}><PackageCheck aria-hidden="true" size={16} /> Add Items / Order Request</button></div><ProductCatalogModal open={orderOpen} mode="select" catalog={catalog} onClose={() => setOrderOpen(false)} onSubmitOrder={onCreateOrder} /></section>;
  }

  const stockOpnameComplete = transaction.items.every((line) => {
    const key = `${transaction.id}:${line.item.id}`;
    const value = remainingDrafts[key] ?? (line.remainingStockConfirmed ? String(line.remainingStock) : "");
    const parsed = Number(value);
    return line.remainingStockConfirmed && value.trim() !== "" && Number.isInteger(parsed) && parsed >= 0 && parsed <= line.quantityReceived;
  });
  const errors: Record<string, LineErrors> = {};
  const currentReceivedValues: Record<string, string> = {};
  const currentRemainingValues: Record<string, string> = {};
  const lines: TransactionItem[] = transaction.items.map((line) => {
    const key = `${transaction.id}:${line.item.id}`;
    const receivedText = receivedDrafts[key] ?? (transaction.status === "PENDING" ? "" : String(line.quantityReceived));
    const remainingText = remainingDrafts[key] ?? (line.remainingStockConfirmed ? String(line.remainingStock) : "");
    currentReceivedValues[line.item.id] = receivedText;
    currentRemainingValues[line.item.id] = remainingText;
    const received = Number(receivedText);
    const remaining = Number(remainingText);

    if (transaction.status === "PENDING" && transaction.deliveryStatus === "DELIVERED") {
      if (!receivedText.trim()) errors[line.item.id] = { quantityReceived: "Enter the quantity physically received." };
      else if (!Number.isInteger(received) || received < 0 || received > line.quantitySent) errors[line.item.id] = { quantityReceived: `Enter a whole number from 0 to ${line.quantitySent}.` };
    }
    if (transaction.status === "LOCKED" && remainingDrafts[key] !== undefined) {
      if (!remainingText.trim()) errors[line.item.id] = { ...errors[line.item.id], remainingStock: "Enter remaining units." };
      else if (!Number.isInteger(remaining) || remaining < 0 || remaining > line.quantityReceived) errors[line.item.id] = { ...errors[line.item.id], remainingStock: `Enter a whole number from 0 to ${line.quantityReceived}.` };
    }
    return { ...line, quantityReceived: Number.isInteger(received) ? received : line.quantityReceived, remainingStock: Number.isInteger(remaining) ? remaining : line.remainingStock };
  });

  const canLock = transaction.status === "PENDING" && transaction.deliveryStatus === "DELIVERED" && lines.every((line) => {
    const value = currentReceivedValues[line.item.id];
    const count = Number(value);
    return value.trim() !== "" && Number.isInteger(count) && count >= 0 && count <= line.quantitySent;
  });

  async function confirmLock() {
    const received = Object.fromEntries(lines.map((line) => [line.item.id, Number(currentReceivedValues[line.item.id])])) as Record<string, number>;
    setBusy(true);
    setError("");
    try { await onLockDelivery(transaction.id, received); setRecordTab("locked"); setLockOpen(false); }
    catch { setError("This delivery could not be locked. Please try again."); }
    finally { setBusy(false); }
  }

  function updateRemaining(itemId: string, value: string) {
    const key = `${transaction.id}:${itemId}`;
    setRemainingDrafts((current) => ({ ...current, [key]: value }));
    setPaidNotice(false);
    const parsed = Number(value);
    const line = transaction.items.find((entry) => entry.item.id === itemId);
    if (line && value.trim() !== "" && Number.isInteger(parsed) && parsed >= 0 && parsed <= line.quantityReceived) {
      onUpdateStock(transaction.id, itemId, parsed);
    }
  }

  function completePayment(method: PaymentMethod, receiptName?: string) {
    onConfirmPayment(transaction.id, method, receiptName);
    setRecordTab("paid");
    setPaymentOpen(false);
    setPaidNotice(true);
  }

  return (
    <section className="page-section" aria-labelledby="hotel-dashboard-title">
      <div className="section-heading">
        <div><p className="eyebrow">HOTEL PARTNER / PRIVATE ACCOUNT</p><h1 id="hotel-dashboard-title">{hotelName}</h1><p className="section-intro"><MapPin aria-hidden="true" className="mr-1 inline" size={14} />{hotelLocation} · deliveries and invoices from CV. Alam Zempol.</p></div>
        <button className="button-primary shrink-0" type="button" onClick={() => setOrderOpen(true)}><PackageCheck aria-hidden="true" size={16} /> Add items / create order</button>
        <span className="secure-label"><ShieldCheck aria-hidden="true" size={15} /> HOTEL DATA ISOLATED</span>
      </div>

      {paidNotice && <div className="mb-5"><AlertBanner tone="success" title="Payment confirmed" message="This demo marked the selected invoice as paid. No funds were transferred." /></div>}
      {transaction.status === "TERMINATED" && <div className="mb-5"><AlertBanner tone="warning" title="Partnership ending · final settlement required" message="Return any unused sealed amenities to CV. Alam Zempol. Only consumed units are billed." /></div>}

      <div className="grid gap-5 xl:grid-cols-[250px_minmax(0,1fr)]">
        <aside className="panel h-fit" aria-label="My deliveries and invoices">
          <div className="panel-heading compact-panel-heading"><div><h2>My account</h2><p>{transactions.length} hotel records · {lockedInvoices.length} locked invoices</p></div></div>
          <div className="hotel-record-tabs hotel-record-tabs-vertical" role="tablist" aria-label="Hotel transaction status">
            <button type="button" role="tab" aria-selected={recordTab === "pending"} className={recordTab === "pending" ? "hotel-record-tab-active" : ""} onClick={() => { setRecordTab("pending"); const next = transactions.find((entry) => entry.status === "PENDING" || entry.deliveryStatus === "IN_TRANSIT"); if (next) setSelectedId(next.id); }}>Pending Verification</button>
            <button type="button" role="tab" aria-selected={recordTab === "locked"} className={recordTab === "locked" ? "hotel-record-tab-active" : ""} onClick={() => { setRecordTab("locked"); const next = transactions.find((entry) => entry.status === "LOCKED" && entry.paymentStatus === "UNPAID"); if (next) setSelectedId(next.id); }}>Locked &amp; Verified</button>
            <button type="button" role="tab" aria-selected={recordTab === "paid"} className={recordTab === "paid" ? "hotel-record-tab-active" : ""} onClick={() => { setRecordTab("paid"); const next = transactions.find((entry) => entry.paymentStatus === "PAID"); if (next) setSelectedId(next.id); }}>Paid invoices</button>
            <button type="button" role="tab" aria-selected={recordTab === "terminated"} className={recordTab === "terminated" ? "hotel-record-tab-active" : ""} onClick={() => { setRecordTab("terminated"); const next = transactions.find((entry) => entry.status === "TERMINATED"); if (next) setSelectedId(next.id); }}>Terminated contracts</button>
          </div>
          <div className="record-list">
            {tabTransactions.map((entry) => (
              <button className={`record-list-button ${entry.id === transaction.id ? "record-list-active" : ""}`} type="button" key={entry.id} onClick={() => { setSelectedId(entry.id); setError(""); setPaidNotice(false); }} aria-current={entry.id === transaction.id ? "true" : undefined}>
                <span className="flex items-center justify-between gap-2"><span className="truncate font-medium">CV. Alam Zempol</span>{entry.id === transaction.id && <span className="record-selection-dot" aria-hidden="true" />}</span>
                <span className="mt-2 flex items-center justify-between gap-2"><span className="font-mono text-[11px] text-stone-500">{entry.id}</span><StatusBadge status={entry.status} /></span>
                {(entry.status === "LOCKED" || entry.status === "TERMINATED") && <span className="mt-2 block"><StatusBadge status={entry.paymentStatus} /></span>}
              </button>
            ))}
            {tabTransactions.length === 0 && <p className="hotel-empty-tab">No records in this status.</p>}
          </div>
        </aside>

        <div className="min-w-0 space-y-5">
          <div className="panel min-w-0 overflow-hidden">
            <div className="panel-heading"><div><p className="eyebrow">{transaction.id} · {transaction.createdAt}</p><h2 className="mt-1">CV. Alam Zempol</h2><p>Organic body care &amp; hotel amenities</p></div><div className="flex flex-wrap items-center gap-2"><StatusBadge status={transaction.deliveryStatus} /><StatusBadge status={transaction.status} /></div></div>
            <div className="px-4 pb-5 sm:px-5">
              {transaction.status === "PENDING" && transaction.deliveryStatus === "IN_TRANSIT" && <div className="delivery-arrival-banner"><div><p className="font-semibold">Delivery in transit</p><p>Confirm physical arrival before entering received quantities.</p></div><button className="button-secondary" type="button" onClick={() => onConfirmDeliveryArrival(transaction.id)}><Truck aria-hidden="true" size={15} /> Confirm arrival</button></div>}
              {transaction.status === "PENDING" && transaction.deliveryStatus === "DELIVERED" && <div className="delivery-arrival-banner"><div><p className="font-semibold">Delivery Received &amp; Awaiting Sign-Off</p><p>Verify every physical quantity, then permanently lock this delivery record.</p></div></div>}
              {transaction.editAccessRequested && !transaction.editAccessApproved && transaction.status === "LOCKED" && <div className="edit-access-banner"><div><p className="font-semibold">Supplier requested edit access</p><p>Approving temporarily unlocks supplier changes. Saving the edit signs and locks the record again.</p></div><button className="button-secondary" type="button" onClick={() => onApproveEditAccess(transaction.id)}>Approve Edit Access</button></div>}
              {transaction.editAccessApproved && transaction.status === "LOCKED" && <div className="edit-access-banner"><p className="font-semibold">Edit access approved. CV. Alam Zempol can update this record and re-lock it when saved.</p></div>}
              <DataTable
                items={lines}
                catalog={catalog}
                location={hotelLocation}
                calculationsEnabled={transaction.status !== "PENDING"}
                editable={transaction.status === "PENDING" && transaction.deliveryStatus === "DELIVERED" || (transaction.status === "LOCKED" || transaction.status === "TERMINATED") && transaction.paymentStatus === "UNPAID"}
                allowProductChanges={false}
                allowRemove={false}
                quantityValues={currentReceivedValues}
                remainingValues={currentRemainingValues}
                remainingReadOnlyLabel={transaction.status === "PENDING" ? "Enter after lock" : undefined}
                errors={errors}
                onQuantityReceivedChange={transaction.status === "PENDING" && transaction.deliveryStatus === "DELIVERED" ? (itemId, value) => setReceivedDrafts((current) => ({ ...current, [`${transaction.id}:${itemId}`]: value })) : undefined}
                onRemainingStockChange={(transaction.status === "LOCKED" || transaction.status === "TERMINATED") && transaction.paymentStatus === "UNPAID" ? updateRemaining : undefined}
              />
              {error && <p className="field-error mt-3" role="alert">{error}</p>}
              {transaction.status === "PENDING" ? (
                transaction.deliveryStatus === "DELIVERED" ? <div className="mt-5 flex flex-col justify-between gap-3 border-t border-stone-200 pt-4 sm:flex-row sm:items-center"><p className="flex items-center gap-2 text-xs leading-5 text-stone-500"><PackageCheck aria-hidden="true" size={15} /> Confirm the received count for each product.</p><button className="button-primary" type="button" disabled={!canLock} onClick={() => setLockOpen(true)}><Check aria-hidden="true" size={16} /> Approve &amp; Permanently Lock Data</button></div>
                  : <p className="mt-4 border-t border-stone-200 pt-4 text-xs text-stone-500">Stock input and approval unlock after the hotel confirms delivery arrival.</p>
              ) : transaction.hashSignature ? (
                <div className="signature-block mt-5"><div className="signature-icon"><FileCheck2 aria-hidden="true" size={18} /></div><div className="min-w-0 flex-1"><p className="text-sm font-semibold text-emerald-950">Immutable delivery record</p><p className="mt-1 break-all font-mono text-[11px] leading-5 text-emerald-900">{transaction.hashSignature}</p></div><LockKeyhole aria-label="Locked" className="hidden shrink-0 text-emerald-800 sm:block" size={17} /></div>
              ) : <AlertBanner tone="warning" title="Supplier partnership ended" message="This delivery is kept for your hotel’s final settlement record." />}
            </div>
          </div>

          {(transaction.status === "LOCKED" || transaction.status === "TERMINATED") && (
            <section className="payment-summary" aria-labelledby="invoice-payment-title">
              <div className="payment-summary-top"><div><p className="eyebrow text-emerald-100">INVOICE &amp; PAYMENT</p><h2 id="invoice-payment-title">Monthly consumption</h2><p>{transaction.hotel} · {transaction.id}</p></div><StatusBadge status={transaction.paymentStatus} /></div>
              <div className="payment-total"><div><span>Total consumed</span><strong>{stockOpnameComplete ? `${consumedUnits} units` : "Awaiting counts"}</strong></div><div><span>Amount due</span><strong>{stockOpnameComplete ? formatIDR(amountDue) : "Awaiting stock opname"}</strong></div></div>
              <p className="payment-formula">(Received − remaining stock) × unit price · CV. Alam Zempol</p>
              {transaction.paymentStatus === "PAID" ? <div className="payment-paid-note"><Check aria-hidden="true" size={16} /><span>Paid via {transaction.paymentMethod?.replaceAll("_", " ") ?? "confirmed payment"}{transaction.paymentReceiptName && <span className="block mt-1 text-[10px] font-normal">Slip: {transaction.paymentReceiptName}</span>}</span></div> : <button className="button-primary mt-5" type="button" disabled={!stockOpnameComplete} onClick={() => setPaymentOpen(true)}><ArrowDownToLine aria-hidden="true" size={16} /> Choose payment method</button>}
              {!stockOpnameComplete && transaction.paymentStatus === "UNPAID" && <p className="mt-3 text-xs leading-5 text-emerald-50">Enter a valid remaining-stock count for every item to finalize monthly billing.</p>}
              {transaction.status === "LOCKED" && <button className="button-danger mt-5" type="button" onClick={() => setTerminationOpen(true)}>End amenity partnership</button>}
              {transaction.status === "TERMINATED" && <button className="button-danger mt-5" type="button" onClick={() => { onDeleteRecord(transaction.id); setSelectedId(""); setRecordTab("pending"); }}>Delete Record</button>}
            </section>
          )}
        </div>
      </div>
      <ModalConfirmation open={lockOpen} onClose={() => setLockOpen(false)} onConfirm={confirmLock} busy={busy} hotelName={hotelName} />
      <ModalConfirmation open={terminationOpen} onClose={() => setTerminationOpen(false)} onConfirm={() => { onTerminate(transaction.id); setRecordTab("terminated"); setTerminationOpen(false); }} hotelName={hotelName} title="End this amenity partnership?" description={<>This will begin final settlement for {hotelName}. The locked delivery and invoice remain available, and unused sealed items must be returned to CV. Alam Zempol.</>} confirmLabel="End partnership" busyLabel="Ending partnership..." />
      <PaymentModal open={paymentOpen} invoiceId={transaction.id} amount={formatIDR(amountDue)} onClose={() => setPaymentOpen(false)} onConfirm={completePayment} />
      <ProductCatalogModal open={orderOpen} mode="select" catalog={catalog} onClose={() => setOrderOpen(false)} onSubmitOrder={onCreateOrder} />
    </section>
  );
}