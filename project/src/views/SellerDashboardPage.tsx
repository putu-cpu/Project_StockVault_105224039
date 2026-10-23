import { useState } from "react";
import { Building2, CircleDollarSign, FileCheck2, MapPin, PackageCheck, PackagePlus, PackageSearch, ShieldAlert, Truck } from "lucide-react";
import { InvoiceDetailModal } from "../components/InvoiceDetailModal";
import { ProductCatalogModal } from "../components/ProductCatalogModal";
import { StatCard } from "../components/StatCard";
import { StatusBadge } from "../components/StatusBadge";
import { TransactionEditModal } from "../components/TransactionEditModal";
import { formatIDR, hotelPartners } from "../data/mockData";
import type { DeliveryStatus, Item, Transaction, TransactionItem } from "../types";
import type { SidebarWorkspace } from "../components/Sidebar";

interface SellerDashboardPageProps {
  transactions: Transaction[];
  catalog: Item[];
  workspace: SidebarWorkspace;
  onNavigate: (workspace: SidebarWorkspace) => void;
  onSaveCatalog: (items: Item[]) => void;
  onUpdateDeliveryStatus: (transactionId: string, status: DeliveryStatus) => void;
  onReviewTermination: (transactionId: string, approved: boolean) => void;
  onRequestEdit: (transactionId: string) => void;
  onSaveEdit: (transactionId: string, items: TransactionItem[]) => Promise<void>;
  onDeleteRecord: (transactionId: string) => void;
}

export function SellerDashboardPage({ transactions, catalog, workspace, onNavigate, onSaveCatalog, onUpdateDeliveryStatus, onReviewTermination, onRequestEdit, onSaveEdit, onDeleteRecord }: SellerDashboardPageProps) {
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [hotelTab, setHotelTab] = useState<"pending" | "locked" | "paid" | "terminated">("pending");
  const partner = hotelPartners.find((entry) => entry.id === workspace);
  const activePartners = new Set(transactions.filter((entry) => entry.status !== "TERMINATED").map((entry) => entry.hotelId)).size;
  const pendingCount = transactions.filter((entry) => entry.status === "PENDING").length;
  const terminationRequests = transactions.filter((entry) => entry.status === "TERMINATION_REQUESTED");
  const lockedCount = transactions.filter((entry) => entry.status === "LOCKED").length;
  const unpaidCount = transactions.filter((entry) => entry.paymentStatus === "UNPAID").length;
  const verifiedRevenue = transactions
    .filter((entry) => (entry.status === "LOCKED" || entry.status === "TERMINATED") && entry.items.every((line) => line.remainingStockConfirmed))
    .reduce((total, entry) => total + entry.items.reduce((sum, line) => sum + (line.quantityReceived - line.remainingStock) * line.item.unitPrice, 0), 0);
  const partnerTransactions = partner ? transactions.filter((entry) => entry.hotelId === partner.id) : transactions;
  const visibleTransactions = partner ? partnerTransactions.filter((entry) => {
    if (hotelTab === "pending") return entry.status === "PENDING";
    if (hotelTab === "locked") return entry.status === "LOCKED" && entry.paymentStatus === "UNPAID";
    if (hotelTab === "paid") return entry.paymentStatus === "PAID";
    return entry.status === "TERMINATED" || entry.status === "TERMINATION_REQUESTED";
  }) : transactions;
  const pageTitle = workspace === "catalog" ? "Master catalog" : workspace === "deliveries" ? "Delivery tracker" : workspace === "locked-stock" ? "Locked Stock" : partner ? partner.name : "Your partner ledger";
  const lockedInventory = transactions.filter((entry) => entry.status === "LOCKED").flatMap((transaction) => transaction.items.map((line) => ({ transaction, line })));
  const currentSelectedTransaction = transactions.find((entry) => entry.id === selectedTransaction?.id) ?? null;

  return (
    <section className="page-section" aria-labelledby="seller-dashboard-title">
      <div className="overview-welcome">
        <div>
          <p className="eyebrow welcome-eyebrow"><Building2 aria-hidden="true" size={13} /> CV. ALAM ZEMPOL / {partner ? "HOTEL WORKSPACE" : "PARTNER OPERATIONS"}</p>
          <h1 id="seller-dashboard-title">{pageTitle}<span>.</span></h1>
          <p>{partner ? `Review ${partner.name} delivery records, stock verification, and invoice activity.` : "Manage the master catalog, track hotel orders, and review every stock sign-off and invoice."}</p>
        </div>
        <div className="welcome-stamp"><span>ACTIVE</span><strong>{String(activePartners).padStart(2, "0")}</strong><span>PARTNERS</span></div>
      </div>

      <div className="stats-grid">
        <StatCard label="Verified invoice value" value={formatIDR(verifiedRevenue)} detail="All locked partner invoices" icon={<CircleDollarSign size={19} />} tone="green" />
        <StatCard label="Locked deliveries" value={String(lockedCount).padStart(2, "0")} detail={`${activePartners} active hotel partners`} icon={<Building2 size={18} />} tone="blue" />
        <StatCard label="Pending reviews" value={String(pendingCount).padStart(2, "0")} detail={`${unpaidCount} unpaid invoices across partners`} icon={<ShieldAlert size={18} />} tone="orange" />
      </div>

      {terminationRequests.length > 0 && <section className="seller-termination-requests" aria-labelledby="termination-requests-title"><div className="seller-request-heading"><div><p className="eyebrow">SELLER REVIEW REQUIRED</p><h2 id="termination-requests-title">Contract termination requests</h2></div><span>{terminationRequests.length} awaiting review</span></div>{terminationRequests.map((entry) => <div className="seller-termination-row" key={entry.id}><div className="min-w-0"><strong>{entry.hotel}</strong><span>{entry.id} · {entry.contractDurationMonths}-month contract</span></div><div className="flex flex-wrap gap-2"><button className="button-secondary" type="button" onClick={() => onReviewTermination(entry.id, false)}>Reject Request</button><button className="button-danger" type="button" onClick={() => onReviewTermination(entry.id, true)}>Approve Contract Termination</button></div></div>)}</section>}

      {workspace === "catalog" ? (
        <div className="panel mt-4 overflow-hidden">
          <div className="panel-heading"><div><h2>CV. Alam Zempol master catalog</h2><p>Price and product changes sync to new hotel orders.</p></div></div>
          <div className="overflow-x-auto"><table className="record-table"><caption className="sr-only">Alam Zempol master product catalog and stock price list</caption><thead><tr><th scope="col">Product</th><th scope="col">Size</th><th scope="col">Category</th><th scope="col" className="text-right">Unit price</th></tr></thead><tbody>{catalog.map((item) => <tr key={item.id}><td className="font-medium text-stone-900">{item.name}</td><td>{item.size}</td><td>{item.category}</td><td className="text-right font-semibold">{formatIDR(item.unitPrice)}</td></tr>)}</tbody></table></div>
          <div className="table-footer"><span>{catalog.length} products in the supplier master list</span><button className="text-link" type="button" onClick={() => setCatalogOpen(true)}><PackageSearch aria-hidden="true" size={13} /> Manage catalog</button></div>
        </div>
      ) : workspace === "deliveries" ? (
        <div className="panel mt-4 overflow-hidden">
          <div className="panel-heading"><div><h2>Delivery tracker</h2><p>Update preparation and transit states; hotel staff confirms arrival.</p></div></div>
          {transactions.length === 0 ? <div className="empty-state empty-state-compact"><span className="empty-state-mark"><Truck aria-hidden="true" size={21} /></span><h2>No deliveries yet</h2><p>Created deliveries will appear here for shipment tracking.</p><button className="button-secondary" type="button" onClick={() => onNavigate("catalog")}>Open master catalog</button></div> : <div className="overflow-x-auto"><table className="record-table"><caption className="sr-only">Supplier deliveries and current delivery state</caption><thead><tr><th scope="col">Hotel / delivery</th><th scope="col">Products</th><th scope="col">Created</th><th scope="col">Delivery state</th><th scope="col">Record state</th><th scope="col"><span className="sr-only">Review stock detail</span></th></tr></thead><tbody>
            {transactions.map((transaction) => <tr key={transaction.id}><td><span className="font-semibold text-stone-900">{transaction.hotel}</span><span className="mt-1 block font-mono text-[10px] text-stone-500">{transaction.id}</span></td><td>{transaction.items.length} products</td><td>{transaction.createdAt}</td><td>{transaction.status === "PENDING" && transaction.deliveryStatus !== "ARRIVED" ? <select className="table-select" aria-label={`Delivery status for ${transaction.hotel}`} value={transaction.deliveryStatus} onChange={(event) => onUpdateDeliveryStatus(transaction.id, event.target.value as DeliveryStatus)}><option value="PREPARING">PREPARING</option><option value="IN_TRANSIT">IN_TRANSIT</option></select> : <StatusBadge status={transaction.deliveryStatus} />}</td><td><StatusBadge status={transaction.status} /></td><td><button className="button-tertiary" type="button" onClick={() => setSelectedTransaction(transaction)} aria-label={`Review delivery for ${transaction.hotel}`}>Review delivery</button></td></tr>)}
          </tbody></table></div>}
          <div className="table-footer"><span><Truck aria-hidden="true" size={13} /> {transactions.filter((entry) => entry.deliveryStatus === "IN_TRANSIT").length} deliveries in transit</span><span>Arrival confirmation is completed by the receiving hotel</span></div>
        </div>
      ) : workspace === "locked-stock" ? (
        <div className="panel mt-4 overflow-hidden">
          <div className="panel-heading"><div><h2>Consolidated locked stock</h2><p>Verified product inventory across all partner hotels.</p></div><span className="record-count">{lockedInventory.length} products · {lockedInventory.length ? new Set(lockedInventory.map(({ transaction }) => transaction.id)).size : 0} records</span></div>
          {lockedInventory.length === 0 ? <div className="empty-state empty-state-compact"><span className="empty-state-mark"><PackageCheck aria-hidden="true" size={21} /></span><h2>No locked stock yet</h2><p>Products appear here after a hotel verifies and permanently locks a delivery.</p><button className="button-secondary" type="button" onClick={() => onNavigate("deliveries")}>Open delivery tracker</button></div> : <div className="overflow-x-auto"><table className="record-table"><caption className="sr-only">Unified locked stock inventory across partner hotels</caption><thead><tr><th scope="col">Hotel / record</th><th scope="col">Product</th><th scope="col">Received</th><th scope="col">Remaining</th><th scope="col">Consumed</th><th scope="col" className="text-right">Billed</th><th scope="col"><span className="sr-only">Review record</span></th></tr></thead><tbody>{lockedInventory.map(({ transaction, line }) => <tr key={`${transaction.id}:${line.item.id}`}><td><span className="font-semibold text-stone-900">{transaction.hotel}</span><span className="mt-1 block font-mono text-[10px] text-stone-500">{transaction.id}</span></td><td><span className="font-medium text-stone-900">{line.item.name}</span><span className="mt-1 block text-[10px] text-stone-500">{line.item.size} · {line.item.category}</span></td><td>{line.quantityReceived}</td><td>{line.remainingStockConfirmed ? line.remainingStock : "Awaiting stock opname"}</td><td>{line.remainingStockConfirmed ? line.quantityReceived - line.remainingStock : "—"}</td><td className="text-right font-semibold">{line.remainingStockConfirmed ? formatIDR((line.quantityReceived - line.remainingStock) * line.item.unitPrice) : "—"}</td><td><button className="button-tertiary" type="button" onClick={() => setSelectedTransaction(transaction)} aria-label={`Review locked stock for ${transaction.hotel}`}>Review record</button></td></tr>)}</tbody></table></div>}
        </div>
      ) : workspace === "overview" && transactions.length === 0 ? (
        <div className="empty-state"><span className="empty-state-mark"><PackagePlus aria-hidden="true" size={22} /></span><p className="eyebrow">CV. ALAM ZEMPOL / SUPPLIER WORKSPACE</p><h2>Your partner ledger starts here.</h2><p>Delivery records will appear when a hotel submits an order request or items are dispatched. Manage products in the master catalog.</p><button className="button-secondary" type="button" onClick={() => onNavigate("catalog")}><PackageSearch aria-hidden="true" size={15} /> Open Master Catalog</button></div>
      ) : <div className="panel mt-4 overflow-hidden">
        <div className="panel-heading">
          <div><h2>{partner ? `${partner.name} transactions` : "Hotel invoices & stock reviews"}</h2><p>{partner ? `${partner.location} · isolated partner ledger` : "Review every Alam Zempol order, stock snapshot and payment proof."}</p></div>
        </div>
        {partner && <div className="hotel-record-tabs" role="tablist" aria-label={`${partner.name} transaction status`}>
          <button type="button" role="tab" aria-selected={hotelTab === "pending"} className={hotelTab === "pending" ? "hotel-record-tab-active" : ""} onClick={() => setHotelTab("pending")}>Pending Verification</button>
          <button type="button" role="tab" aria-selected={hotelTab === "locked"} className={hotelTab === "locked" ? "hotel-record-tab-active" : ""} onClick={() => setHotelTab("locked")}>Locked &amp; Verified</button>
          <button type="button" role="tab" aria-selected={hotelTab === "paid"} className={hotelTab === "paid" ? "hotel-record-tab-active" : ""} onClick={() => setHotelTab("paid")}>Paid invoices</button>
          <button type="button" role="tab" aria-selected={hotelTab === "terminated"} className={hotelTab === "terminated" ? "hotel-record-tab-active" : ""} onClick={() => setHotelTab("terminated")}>Terminated contracts</button>
        </div>}
        <div className="overflow-x-auto">
          <table className="record-table partner-table">
            <caption className="sr-only">Alam Zempol hotel deliveries, stock status, payment status and billing</caption>
            <thead><tr><th scope="col">Hotel / invoice</th><th scope="col">Location</th><th scope="col">Order date</th><th scope="col">Delivery</th><th scope="col">Record</th><th scope="col">Payment</th><th scope="col" className="text-right">Invoice total</th><th scope="col"><span className="sr-only">Review stock detail</span></th></tr></thead>
            <tbody>
              {visibleTransactions.map((transaction) => {
                const stockOpnameComplete = transaction.items.every((line) => line.remainingStockConfirmed);
                const amount = transaction.items.reduce((sum, line) => sum + (line.quantityReceived - line.remainingStock) * line.item.unitPrice, 0);
                return (
                  <tr key={transaction.id}>
                    <td><span className="font-semibold text-stone-900">{transaction.hotel}</span><span className="mt-1 block font-mono text-[10px] text-stone-500">{transaction.id}</span></td>
                    <td><span className="inline-flex items-center gap-1.5 whitespace-nowrap"><MapPin aria-hidden="true" size={13} className="text-stone-400" />{transaction.location}</span></td>
                    <td>{transaction.createdAt}</td>
                    <td><StatusBadge status={transaction.deliveryStatus} /></td>
                    <td><StatusBadge status={transaction.status} /></td>
                    <td><StatusBadge status={transaction.paymentStatus} /></td>
                    <td className="whitespace-nowrap text-right font-semibold text-stone-800">{transaction.status === "PENDING" ? "Awaiting sign-off" : stockOpnameComplete ? formatIDR(amount) : "Awaiting stock opname"}</td>
                    <td><button className="button-tertiary" type="button" onClick={() => setSelectedTransaction(transaction)} aria-label={`Review stock data for ${transaction.hotel}`}>Review stock data</button></td>
                  </tr>
                );
              })}
              {visibleTransactions.length === 0 && <tr><td colSpan={8} className="empty-table">No transactions in this status.</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="table-footer"><span>{partner ? `${partner.name} · ${visibleTransactions.length} records` : `${activePartners} active · ${transactions.length} records`}</span><span><FileCheck2 aria-hidden="true" size={13} /> Seller invoice review</span></div>
      </div>}
      {workspace === "overview" && <div className="overview-bottomline"><span><span className="bottomline-dot" /> Vendor ledger operational</span><button className="text-link" type="button" onClick={() => onNavigate("deliveries")}><Truck aria-hidden="true" size={13} /> Open delivery tracker</button></div>}
      <ProductCatalogModal open={catalogOpen} mode="manage" catalog={catalog} onClose={() => setCatalogOpen(false)} onSaveCatalog={onSaveCatalog} />
      <InvoiceDetailModal open={currentSelectedTransaction !== null} transaction={currentSelectedTransaction} onClose={() => setSelectedTransaction(null)} onRequestEdit={onRequestEdit} onEditApproved={(transaction) => { setSelectedTransaction(null); setEditingTransaction(transaction); }} onDeleteRecord={(transactionId) => { onDeleteRecord(transactionId); setSelectedTransaction(null); }} />
      <TransactionEditModal open={editingTransaction !== null} transaction={editingTransaction && transactions.find((entry) => entry.id === editingTransaction.id) || null} catalog={catalog} onClose={() => setEditingTransaction(null)} onSave={onSaveEdit} />
    </section>
  );
}