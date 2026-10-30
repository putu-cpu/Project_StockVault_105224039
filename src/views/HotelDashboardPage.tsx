import { useEffect, useState } from "react";
import { ArrowDownToLine, Check, FileCheck2, LockKeyhole, MapPin, PackageCheck, ShieldCheck } from "lucide-react";
import { AlertBanner } from "../components/AlertBanner";
import { DataTable, type LineErrors } from "../components/DataTable";
import { ModalConfirmation } from "../components/ModalConfirmation";
import { PaymentModal } from "../components/PaymentModal";
import { ProductCatalogModal } from "../components/ProductCatalogModal";
import { StatusBadge } from "../components/StatusBadge";
import { formatIDR } from "../data/mockData";
import type { Item, PaymentMethod, Transaction, TransactionItem } from "../types";

type HotelTab = "locked" | "billing" | "pending" | "paid" | "terminated";
type DashboardRow = { key: string; transaction: Transaction; month?: number; itemName?: string; amount?: number; consumed?: number };

interface HotelDashboardPageProps {
  hotelName: string;
  hotelLocation: string;
  transactions: Transaction[];
  catalog: Item[];
  onCreateOrder: (items: TransactionItem[], durationMonths?: number) => void;
  onConfirmArrival: (transactionId: string) => void;
  onLockDelivery: (transactionId: string, received: Record<string, number>) => Promise<void>;
  onUpdateStock: (transactionId: string, itemId: string, remainingStock: number) => void;
  onConfirmPayment: (transactionId: string, invoiceMonth: number, method: PaymentMethod, receiptName?: string) => void;
  onTerminate: (transactionId: string) => void;
  onApproveEditAccess: (transactionId: string) => void;
  onDeleteRecord: (transactionId: string) => void;
}

export function HotelDashboardPage({ hotelName, hotelLocation, transactions, catalog, onCreateOrder, onConfirmArrival, onLockDelivery, onUpdateStock, onConfirmPayment, onTerminate, onApproveEditAccess, onDeleteRecord }: HotelDashboardPageProps) {
  const [selectedId, setSelectedId] = useState(() => transactions[0]?.id ?? "");
  const [selectedMonth, setSelectedMonth] = useState(1);
  const [receivedDrafts, setReceivedDrafts] = useState<Record<string, string>>({});
  const [remainingDrafts, setRemainingDrafts] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<HotelTab>("pending");
  const [lockOpen, setLockOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [orderOpen, setOrderOpen] = useState(false);
  const [terminationOpen, setTerminationOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [paidNotice, setPaidNotice] = useState(false);
  const transaction = transactions.find((entry) => entry.id === selectedId) ?? transactions[0];

  useEffect(() => {
    if (!transactions.some((entry) => entry.id === selectedId) && transactions[0]) setSelectedId(transactions[0].id);
  }, [transactions, selectedId]);

  const amountDue = transaction?.items.reduce((sum, line) => sum + (line.quantityReceived - line.remainingStock) * line.item.unitPrice, 0) ?? 0;
  const consumedUnits = transaction?.items.reduce((sum, line) => sum + line.quantityReceived - line.remainingStock, 0) ?? 0;
  const stockOpnameComplete = Boolean(transaction?.items.every((line) => line.remainingStockConfirmed));
  const invoiceAmounts = transaction?.monthlyInvoices.map((invoice, index, invoices) => ({
    invoice,
    amount: Math.floor(amountDue / invoices.length) + (index < amountDue % invoices.length ? 1 : 0),
    consumed: Math.floor(consumedUnits / invoices.length) + (index < consumedUnits % invoices.length ? 1 : 0),
  })) ?? [];
  const billingRows: DashboardRow[] = transactions.flatMap((entry) => {
    if (entry.status === "PENDING") return [];
    const total = entry.items.reduce((sum, line) => sum + (line.quantityReceived - line.remainingStock) * line.item.unitPrice, 0);
    const units = entry.items.reduce((sum, line) => sum + line.quantityReceived - line.remainingStock, 0);
    return entry.monthlyInvoices.map((invoice, index, invoices) => ({
      key: `${entry.id}:${invoice.month}`,
      transaction: entry,
      month: invoice.month,
      amount: Math.floor(total / invoices.length) + (index < total % invoices.length ? 1 : 0),
      consumed: Math.floor(units / invoices.length) + (index < units % invoices.length ? 1 : 0),
    }));
  });
  const tabRows: DashboardRow[] = activeTab === "locked"
    ? transactions.filter((entry) => entry.status !== "PENDING").flatMap((entry) => entry.items.map((line) => ({ key: `${entry.id}:${line.item.id}`, transaction: entry, itemName: line.item.name })))
    : activeTab === "billing"
      ? billingRows.filter((row) => row.transaction.monthlyInvoices.find((invoice) => invoice.month === row.month)?.paymentStatus === "UNPAID")
      : activeTab === "paid"
        ? billingRows.filter((row) => row.transaction.monthlyInvoices.find((invoice) => invoice.month === row.month)?.paymentStatus === "PAID")
        : activeTab === "pending"
          ? transactions.filter((entry) => entry.status === "PENDING").map((entry) => ({ key: entry.id, transaction: entry }))
          : transactions.filter((entry) => entry.status === "TERMINATED" || entry.status === "TERMINATION_REQUESTED").map((entry) => ({ key: entry.id, transaction: entry }));

  const tabCounts = {
    locked: transactions.filter((entry) => entry.status !== "PENDING").reduce((count, entry) => count + entry.items.length, 0),
    billing: billingRows.filter((row) => row.transaction.monthlyInvoices.find((invoice) => invoice.month === row.month)?.paymentStatus === "UNPAID").length,
    pending: transactions.filter((entry) => entry.status === "PENDING").length,
    paid: billingRows.filter((row) => row.transaction.monthlyInvoices.find((invoice) => invoice.month === row.month)?.paymentStatus === "PAID").length,
    terminated: transactions.filter((entry) => entry.status === "TERMINATED" || entry.status === "TERMINATION_REQUESTED").length,
  };

  if (!transaction) {
    return <section className="page-section" aria-labelledby="hotel-dashboard-title">
      <div className="section-heading"><div><p className="eyebrow">HOTEL PARTNER / PRIVATE ACCOUNT</p><h1 id="hotel-dashboard-title">{hotelName}</h1><p className="section-intro"><MapPin aria-hidden="true" className="mr-1 inline" size={14} />{hotelLocation} · deliveries and invoices from CV. Alam Zempol.</p></div><button className="button-primary shrink-0" type="button" onClick={() => setOrderOpen(true)}><PackageCheck aria-hidden="true" size={16} /> Add items / create order</button><span className="secure-label"><ShieldCheck aria-hidden="true" size={15} /> HOTEL DATA ISOLATED</span></div>
      <section className="panel hotel-operations-panel" aria-label="Hotel operations"><HotelOperationsTabs activeTab={activeTab} onChange={setActiveTab} counts={tabCounts} /><div className="empty-state"><span className="empty-state-mark"><PackageCheck aria-hidden="true" size={22} /></span><p className="eyebrow">CV. ALAM ZEMPOL / HOTEL WORKSPACE</p><h2>Your ledger starts here.</h2><p>Request the amenities your team needs from the shared supplier catalog. New deliveries will appear in this private hotel workspace.</p><button className="button-primary" type="button" onClick={() => setOrderOpen(true)}><PackageCheck aria-hidden="true" size={16} /> Add Items / Order Request</button></div></section>
      <ProductCatalogModal open={orderOpen} mode="select" catalog={catalog} onClose={() => setOrderOpen(false)} onSubmitOrder={(items, _hotelId, durationMonths) => onCreateOrder(items, durationMonths)} />
    </section>;
  }

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
    if (transaction.status === "PENDING" && transaction.deliveryStatus === "ARRIVED") {
      if (!receivedText.trim()) errors[line.item.id] = { quantityReceived: "Enter the quantity physically received." };
      else if (!Number.isInteger(received) || received < 0 || received > line.quantitySent) errors[line.item.id] = { quantityReceived: `Enter a whole number from 0 to ${line.quantitySent}.` };
    }
    if (transaction.status !== "PENDING" && remainingDrafts[key] !== undefined) {
      if (!remainingText.trim()) errors[line.item.id] = { ...errors[line.item.id], remainingStock: "Enter remaining units." };
      else if (!Number.isInteger(remaining) || remaining < 0 || remaining > line.quantityReceived) errors[line.item.id] = { ...errors[line.item.id], remainingStock: `Enter a whole number from 0 to ${line.quantityReceived}.` };
    }
    return { ...line, quantityReceived: Number.isInteger(received) ? received : line.quantityReceived, remainingStock: Number.isInteger(remaining) ? remaining : line.remainingStock };
  });
  const canLock = transaction.status === "PENDING" && transaction.deliveryStatus === "ARRIVED" && lines.every((line) => {
    const value = currentReceivedValues[line.item.id];
    const count = Number(value);
    return value.trim() !== "" && Number.isInteger(count) && count >= 0 && count <= line.quantitySent;
  });
  const activeInvoice = invoiceAmounts.find(({ invoice }) => invoice.month === selectedMonth) ?? invoiceAmounts[0];

  async function confirmLock() {
    const received = Object.fromEntries(lines.map((line) => [line.item.id, Number(currentReceivedValues[line.item.id])])) as Record<string, number>;
    setBusy(true);
    setError("");
    try { await onLockDelivery(transaction.id, received); setActiveTab("locked"); setLockOpen(false); }
    catch { setError("This delivery could not be locked. Please try again."); }
    finally { setBusy(false); }
  }

  function updateRemaining(itemId: string, value: string) {
    const key = `${transaction.id}:${itemId}`;
    setRemainingDrafts((current) => ({ ...current, [key]: value }));
    setPaidNotice(false);
    const parsed = Number(value);
    const line = transaction.items.find((entry) => entry.item.id === itemId);
    if (line && value.trim() !== "" && Number.isInteger(parsed) && parsed >= 0 && parsed <= line.quantityReceived) onUpdateStock(transaction.id, itemId, parsed);
  }

  function completePayment(method: PaymentMethod, receiptName?: string) {
    if (!activeInvoice) return;
    onConfirmPayment(transaction.id, activeInvoice.invoice.month, method, receiptName);
    setActiveTab("paid");
    setPaymentOpen(false);
    setPaidNotice(true);
  }

  function selectRow(row: DashboardRow) {
    setSelectedId(row.transaction.id);
    if (row.month !== undefined) setSelectedMonth(row.month);
    setError("");
    setPaidNotice(false);
  }

  return (
    <section className="page-section" aria-labelledby="hotel-dashboard-title">
      <div className="section-heading"><div><p className="eyebrow">HOTEL PARTNER / PRIVATE ACCOUNT</p><h1 id="hotel-dashboard-title">{hotelName}</h1><p className="section-intro"><MapPin aria-hidden="true" className="mr-1 inline" size={14} />{hotelLocation} · deliveries and invoices from CV. Alam Zempol.</p></div><button className="button-primary shrink-0" type="button" onClick={() => setOrderOpen(true)}><PackageCheck aria-hidden="true" size={16} /> Add items / create order</button><span className="secure-label"><ShieldCheck aria-hidden="true" size={15} /> HOTEL DATA ISOLATED</span></div>
      {paidNotice && <div className="mb-5"><AlertBanner tone="success" title="Payment confirmed" message="This demo marked the selected monthly invoice as paid. No funds were transferred." /></div>}
      {transaction.status === "TERMINATION_REQUESTED" && <div className="mb-5"><AlertBanner tone="warning" title="Termination awaiting seller approval" message="CV. Alam Zempol must approve this request before the contract is terminated or its record can be deleted." /></div>}
      {transaction.status === "TERMINATED" && <div className="mb-5"><AlertBanner tone="warning" title="Partnership ended · final settlement required" message="Return any unused sealed amenities to CV. Alam Zempol. The verified stock and invoice history remain available." /></div>}

      <section className="panel hotel-operations-panel" aria-label="Hotel operations">
        <div className="panel-heading"><div><h2>Partner operations</h2><p>Inventory, delivery sign-off, and monthly reconciliation in one workspace.</p></div><span className="record-count">{transactions.length} contract records</span></div>
        <HotelOperationsTabs activeTab={activeTab} onChange={setActiveTab} counts={tabCounts} />
        <div className="hotel-workspace-rows">
          {tabRows.length === 0 ? <div className="empty-table">No records in this section.</div> : tabRows.map((row) => {
            const selected = row.transaction.id === transaction.id && (row.month === undefined || row.month === selectedMonth);
            const invoice = row.month === undefined ? undefined : row.transaction.monthlyInvoices.find((entry) => entry.month === row.month);
            const rowStockCounted = row.transaction.items.every((line) => line.remainingStockConfirmed);
            return <button className={`hotel-workspace-row ${selected ? "hotel-workspace-row-active" : ""}`} type="button" key={row.key} onClick={() => selectRow(row)} aria-current={selected ? "true" : undefined}>
              <span className="hotel-workspace-row-main"><strong>{row.itemName ?? row.transaction.hotel}</strong><span>{row.transaction.id}{row.month ? ` · Month ${row.month}` : ` · ${row.transaction.contractDurationMonths}-month contract`}</span></span>
              <span className="hotel-workspace-row-meta">{invoice ? <><span>{invoice.dueDate}</span><StatusBadge status={invoice.paymentStatus} /></> : <><StatusBadge status={row.transaction.deliveryStatus} /><StatusBadge status={row.transaction.status} /></>}</span>
              {row.amount !== undefined && <span className="hotel-workspace-row-amount"><strong>{rowStockCounted ? formatIDR(row.amount) : "Awaiting stock opname"}</strong><span>{row.consumed} units consumed</span></span>}
              {row.itemName && <span className="hotel-workspace-hash">SHA-256 · {row.transaction.hashSignature ? `${row.transaction.hashSignature.slice(7, 23)}…` : "PENDING SIGN-OFF"}</span>}
            </button>;
          })}
        </div>
        <div className="table-footer"><span>{tabRows.length} {activeTab === "locked" ? "inventory items" : activeTab === "billing" || activeTab === "paid" ? "monthly invoices" : "records"}</span><span><FileCheck2 aria-hidden="true" size={13} /> Private hotel ledger</span></div>
      </section>

      <div className="panel hotel-detail-panel">
        <div className="panel-heading"><div><p className="eyebrow">{transaction.id} · {transaction.createdAt}</p><h2>{transaction.hotel}</h2><p>{transaction.contractDurationMonths}-month contract · {transaction.items.length} products</p></div><div className="flex flex-wrap items-center gap-2"><StatusBadge status={transaction.deliveryStatus} /><StatusBadge status={transaction.status} /></div></div>
        <div className="px-4 pb-5 sm:px-5">
          {transaction.status === "PENDING" && transaction.deliveryStatus === "PREPARING" && <div className="delivery-arrival-banner"><div><p className="font-semibold">Delivery is being prepared</p><p>CV. Alam Zempol will update the shipment status once it is in transit.</p></div></div>}
          {transaction.status === "PENDING" && transaction.deliveryStatus === "IN_TRANSIT" && <div className="delivery-arrival-banner"><div><p className="font-semibold">Delivery in transit</p><p>Confirm physical arrival before entering received quantities.</p></div><button className="button-secondary" type="button" onClick={() => onConfirmArrival(transaction.id)}><PackageCheck aria-hidden="true" size={15} /> Confirm arrival</button></div>}
          {transaction.status === "PENDING" && transaction.deliveryStatus === "ARRIVED" && <div className="delivery-arrival-banner"><div><p className="font-semibold">Delivery arrived · awaiting sign-off</p><p>Confirm every physical quantity, then accept the delivery and lock this stock record.</p></div></div>}
          {transaction.editAccessRequested && !transaction.editAccessApproved && transaction.status === "LOCKED" && <div className="edit-access-banner"><div><p className="font-semibold">Supplier requested edit access</p><p>Approving temporarily unlocks supplier changes. Saving the edit signs and locks the record again.</p></div><button className="button-secondary" type="button" onClick={() => onApproveEditAccess(transaction.id)}>Approve Edit Access</button></div>}
          {transaction.editAccessApproved && transaction.status === "LOCKED" && <div className="edit-access-banner"><p className="font-semibold">Edit access approved. CV. Alam Zempol can update this record and re-lock it when saved.</p></div>}
          <DataTable items={lines} catalog={catalog} location={hotelLocation} calculationsEnabled={transaction.status !== "PENDING"} editable={transaction.status === "PENDING" && transaction.deliveryStatus === "ARRIVED" || transaction.status !== "PENDING" && transaction.paymentStatus === "UNPAID"} allowProductChanges={false} allowRemove={false} quantityValues={currentReceivedValues} remainingValues={currentRemainingValues} remainingReadOnlyLabel={transaction.status === "PENDING" ? "Enter after lock" : undefined} errors={errors} onQuantityReceivedChange={transaction.status === "PENDING" && transaction.deliveryStatus === "ARRIVED" ? (itemId, value) => setReceivedDrafts((current) => ({ ...current, [`${transaction.id}:${itemId}`]: value })) : undefined} onRemainingStockChange={transaction.status !== "PENDING" && transaction.paymentStatus === "UNPAID" ? updateRemaining : undefined} />
          {error && <p className="field-error mt-3" role="alert">{error}</p>}
          {transaction.status === "PENDING" && (transaction.deliveryStatus === "ARRIVED" ? <div className="mt-5 flex flex-col justify-between gap-3 border-t border-stone-200 pt-4 sm:flex-row sm:items-center"><p className="flex items-center gap-2 text-xs leading-5 text-stone-500"><PackageCheck aria-hidden="true" size={15} /> Confirm the received count for each product.</p><button className="button-primary" type="button" disabled={!canLock} onClick={() => setLockOpen(true)}><Check aria-hidden="true" size={16} /> Accept Delivery &amp; Lock Stock</button></div> : <p className="mt-4 border-t border-stone-200 pt-4 text-xs text-stone-500">Stock input and acceptance unlock when the seller marks this delivery as arrived.</p>)}
          {transaction.status !== "PENDING" && transaction.hashSignature && <div className="signature-block mt-5"><div className="signature-icon"><FileCheck2 aria-hidden="true" size={18} /></div><div className="min-w-0 flex-1"><p className="text-sm font-semibold text-emerald-950">Immutable delivery record · SHA-256</p><p className="mt-1 break-all font-mono text-[11px] leading-5 text-emerald-900">{transaction.hashSignature}</p></div><LockKeyhole aria-label="Locked" className="hidden shrink-0 text-emerald-800 sm:block" size={17} /></div>}
        </div>
      </div>

      {transaction.status !== "PENDING" && <section className="panel hotel-billing-detail" aria-labelledby="monthly-invoices-heading"><div className="panel-heading"><div><p className="eyebrow">CONTRACT BILLING</p><h2 id="monthly-invoices-heading">Monthly invoice schedule</h2><p>{consumedUnits} units consumed · {stockOpnameComplete ? formatIDR(amountDue) : "complete the stock opname to finalize amounts"}</p></div><span className="record-count">{transaction.monthlyInvoices.length} monthly entries</span></div><div className="invoice-cycle-list">{invoiceAmounts.map(({ invoice, amount, consumed }) => <div className="invoice-cycle-row" key={invoice.month}><div><strong>Month {invoice.month}</strong><span>Due {invoice.dueDate} · {consumed} units consumed</span></div><strong>{stockOpnameComplete ? formatIDR(amount) : "Awaiting stock opname"}</strong><StatusBadge status={invoice.paymentStatus} />{invoice.paymentStatus === "UNPAID" && <button className="button-primary" type="button" disabled={!stockOpnameComplete} onClick={() => { setSelectedMonth(invoice.month); setPaymentOpen(true); }}><ArrowDownToLine aria-hidden="true" size={15} /> Pay invoice</button>}</div>)}</div><p className="payment-formula px-5 pb-4">Monthly invoice allocations reconcile total recorded consumption across the selected contract duration.</p>
        {transaction.status === "LOCKED" && <div className="flex flex-wrap gap-2 border-t border-stone-200 px-5 py-4"><button className="button-danger" type="button" onClick={() => setTerminationOpen(true)}>Request contract termination</button></div>}
        {transaction.status === "TERMINATION_REQUESTED" && <div className="border-t border-stone-200 px-5 py-4 text-xs text-stone-600">This contract is not terminated until CV. Alam Zempol approves the request.</div>}
        {transaction.status === "TERMINATED" && <div className="border-t border-stone-200 px-5 py-4"><button className="button-danger" type="button" onClick={() => { onDeleteRecord(transaction.id); setSelectedId(""); setActiveTab("pending"); }}>Delete Record</button></div>}
      </section>}
      <ModalConfirmation open={lockOpen} onClose={() => setLockOpen(false)} onConfirm={confirmLock} busy={busy} hotelName={hotelName} />
      <ModalConfirmation open={terminationOpen} onClose={() => setTerminationOpen(false)} onConfirm={() => { onTerminate(transaction.id); setActiveTab("terminated"); setTerminationOpen(false); }} hotelName={hotelName} title="Request contract termination?" description={<>CV. Alam Zempol must approve this request before the contract can end. Your locked inventory and invoice history will remain available.</>} confirmLabel="Send termination request" busyLabel="Submitting request..." />
      <PaymentModal open={paymentOpen} invoiceId={`${transaction.id}-M${selectedMonth}`} amount={activeInvoice && stockOpnameComplete ? formatIDR(activeInvoice.amount) : "Awaiting stock opname"} onClose={() => setPaymentOpen(false)} onConfirm={completePayment} />
      <ProductCatalogModal open={orderOpen} mode="select" catalog={catalog} onClose={() => setOrderOpen(false)} onSubmitOrder={(items, _hotelId, durationMonths) => onCreateOrder(items, durationMonths)} />
    </section>
  );
}

function HotelOperationsTabs({ activeTab, onChange, counts }: { activeTab: HotelTab; onChange: (tab: HotelTab) => void; counts: Record<HotelTab, number> }) {
  const tabs: { id: HotelTab; label: string }[] = [
    { id: "locked", label: "Locked Items" },
    { id: "billing", label: "Monthly Billing" },
    { id: "pending", label: "Pending Verification" },
    { id: "paid", label: "Paid Invoices" },
    { id: "terminated", label: "Terminated Contracts" },
  ];
  return <div className="hotel-record-tabs hotel-primary-tabs" role="tablist" aria-label="Hotel operations">{tabs.map((tab) => <button type="button" role="tab" aria-selected={activeTab === tab.id} className={activeTab === tab.id ? "hotel-record-tab-active" : ""} key={tab.id} onClick={() => onChange(tab.id)}>{tab.label}<span>{counts[tab.id]}</span></button>)}</div>;
}