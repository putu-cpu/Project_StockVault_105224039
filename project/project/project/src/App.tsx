import { useState } from "react";
import { Menu } from "lucide-react";
import { catalog as initialCatalog, hotelPartners } from "./data/mockData";
import { Sidebar, type SidebarWorkspace } from "./components/Sidebar";
import { HotelDashboardPage } from "./pages/HotelDashboardPage";
import { LoginPage } from "./pages/LoginPage";
import { SellerDashboardPage } from "./pages/SellerDashboardPage";
import { generateDataHash } from "./utils/crypto";
import type { DeliveryStatus, Item, PaymentMethod, Transaction, TransactionItem, User } from "./types";

async function signDeliverySnapshot(transaction: Transaction, items: TransactionItem[]) {
  const payload = {
    transactionId: transaction.id,
    hotelId: transaction.hotelId,
    hotel: transaction.hotel,
    location: transaction.location,
    items: items.map(({ item, quantitySent, quantityReceived }) => ({ item, quantitySent, quantityReceived })),
    signedAt: new Date().toISOString(),
  };
  return `SHA256: ${generateDataHash(payload)}`;
}

export default function App() {
  const [workspace, setWorkspace] = useState<SidebarWorkspace>("overview");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [masterCatalog, setMasterCatalog] = useState<Item[]>(initialCatalog);
  const [user, setUser] = useState<User | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [workspaceMountKey, setWorkspaceMountKey] = useState(0);

  const hotel = user?.hotelId ? hotelPartners.find((entry) => entry.id === user.hotelId) : undefined;
  const visibleTransactions = user?.role === "BUYER" && user.hotelId
    ? transactions.filter((entry) => entry.hotelId === user.hotelId)
    : transactions;
  const pendingOrders = visibleTransactions.filter((entry) => entry.status === "PENDING").length;

  function createOrder(items: TransactionItem[], durationMonths = 1) {
    const hotelId = user?.hotelId;
    if (!user || user.role !== "BUYER" || !hotelId) return;
    const partner = hotelPartners.find((entry) => entry.id === hotelId);
    if (!partner || ![1, 2, 6, 12].includes(durationMonths) || items.length === 0 || items.some((line) => !masterCatalog.some((item) => item.id === line.item.id))) return;
    const dateKey = new Date().toISOString().slice(2, 7).replace("-", "");
    let sequence = transactions.length + 1;
    let id = `LF-${dateKey}-${String(sequence).padStart(3, "0")}`;
    while (transactions.some((entry) => entry.id === id)) {
      sequence += 1;
      id = `LF-${dateKey}-${String(sequence).padStart(3, "0")}`;
    }
    const transaction: Transaction = {
      id,
      hotelId: partner.id,
      hotel: partner.name,
      location: partner.location,
      createdAt: new Date().toISOString().slice(0, 10),
      contractDurationMonths: durationMonths,
      monthlyInvoices: Array.from({ length: durationMonths }, (_, index) => {
        const dueDate = new Date();
        dueDate.setDate(1);
        dueDate.setMonth(dueDate.getMonth() + index);
        return { month: index + 1, dueDate: dueDate.toISOString().slice(0, 10), paymentStatus: "UNPAID" as const };
      }),
      status: "PENDING",
      deliveryStatus: "PREPARING",
      paymentStatus: "UNPAID",
      items: items.map((line) => ({ ...line, quantityReceived: 0, remainingStock: 0, remainingStockConfirmed: false })),
    };
    setTransactions((current) => [transaction, ...current]);
  }

  async function lockHotelDelivery(transactionId: string, receivedQuantities: Record<string, number>) {
    const transaction = transactions.find((entry) => entry.id === transactionId);
    if (user?.role !== "BUYER" || !user.hotelId || transaction?.hotelId !== user.hotelId || transaction.status !== "PENDING" || transaction.deliveryStatus !== "ARRIVED") {
      throw new Error("This hotel account cannot lock the selected transaction.");
    }
    const items = transaction.items.map((line) => {
      const quantityReceived = receivedQuantities[line.item.id];
      if (!Number.isInteger(quantityReceived) || quantityReceived < 0 || quantityReceived > line.quantitySent) {
        throw new Error("Received quantity is outside the allowed range.");
      }
      return { ...line, quantityReceived, remainingStock: 0, remainingStockConfirmed: false };
    });
    const hashSignature = await signDeliverySnapshot(transaction, items);
    setTransactions((current) => current.map((transaction) => transaction.id === transactionId
      ? { ...transaction, items, status: "LOCKED", hashSignature, editAccessRequested: false, editAccessApproved: false }
      : transaction));
  }

  function requestEditAccess(transactionId: string) {
    if (user?.role !== "SELLER") return;
    setTransactions((current) => current.map((transaction) => transaction.id === transactionId
      && transaction.status === "LOCKED"
      && transaction.paymentStatus === "UNPAID"
      ? { ...transaction, editAccessRequested: true, editAccessApproved: false }
      : transaction));
  }

  function approveEditAccess(transactionId: string) {
    if (user?.role !== "BUYER" || !user.hotelId) return;
    setTransactions((current) => current.map((transaction) => transaction.id === transactionId
      && transaction.hotelId === user.hotelId
      && transaction.status === "LOCKED"
      && transaction.paymentStatus === "UNPAID"
      && transaction.editAccessRequested
      ? { ...transaction, editAccessApproved: true }
      : transaction));
  }

  async function saveApprovedEdit(transactionId: string, requestedItems: TransactionItem[]) {
    if (user?.role !== "SELLER") throw new Error("Only the supplier can edit a locked record.");
    const transaction = transactions.find((entry) => entry.id === transactionId);
    if (!transaction || transaction.status !== "LOCKED" || transaction.paymentStatus !== "UNPAID" || !transaction.editAccessApproved) {
      throw new Error("Hotel approval is required before editing this record.");
    }
    if (requestedItems.length === 0 || new Set(requestedItems.map((line) => line.item.id)).size !== requestedItems.length) {
      throw new Error("Keep at least one unique product in the delivery.");
    }
    const items = requestedItems.map((requested) => {
      const item = masterCatalog.find((entry) => entry.id === requested.item.id);
      const previous = transaction.items.find((line) => line.item.id === requested.item.id);
      if (!item || !Number.isInteger(requested.quantitySent) || requested.quantitySent < 1 || requested.quantitySent < (previous?.quantityReceived ?? 0)) {
        throw new Error("Each product needs a valid quantity that covers the confirmed received stock.");
      }
      return previous
        ? { ...previous, item, quantitySent: requested.quantitySent }
        : { item, quantitySent: requested.quantitySent, quantityReceived: 0, remainingStock: 0, remainingStockConfirmed: false };
    });
    const hashSignature = await signDeliverySnapshot(transaction, items);
    setTransactions((current) => current.map((entry) => entry.id === transactionId
      ? { ...entry, items, hashSignature, editAccessRequested: false, editAccessApproved: false }
      : entry));
  }

  function updateDeliveryStatus(transactionId: string, deliveryStatus: DeliveryStatus) {
    if (user?.role !== "SELLER" || deliveryStatus === "ARRIVED") return;
    setTransactions((current) => current.map((transaction) => transaction.id === transactionId && transaction.status === "PENDING"
      && transaction.deliveryStatus !== "ARRIVED"
      ? { ...transaction, deliveryStatus }
      : transaction));
  }

  function confirmHotelArrival(transactionId: string) {
    if (user?.role !== "BUYER" || !user.hotelId) return;
    setTransactions((current) => current.map((transaction) => transaction.id === transactionId
      && transaction.hotelId === user.hotelId
      && transaction.status === "PENDING"
      && transaction.deliveryStatus === "IN_TRANSIT"
      ? { ...transaction, deliveryStatus: "ARRIVED" }
      : transaction));
  }

  function updateStock(transactionId: string, itemId: string, remainingStock: number) {
    if (user?.role !== "BUYER" || !user.hotelId) return;
    setTransactions((current) => current.map((transaction) => {
      if (transaction.id !== transactionId || transaction.hotelId !== user.hotelId || (transaction.status !== "LOCKED" && transaction.status !== "TERMINATION_REQUESTED" && transaction.status !== "TERMINATED") || transaction.paymentStatus !== "UNPAID") return transaction;
      return { ...transaction, items: transaction.items.map((line) => line.item.id === itemId ? { ...line, remainingStock, remainingStockConfirmed: true } : line) };
    }));
  }

  function confirmPayment(transactionId: string, invoiceMonth: number, method: PaymentMethod, receiptName?: string) {
    if (user?.role !== "BUYER" || !user.hotelId) return;
    setTransactions((current) => current.map((transaction) => {
      if (transaction.id !== transactionId || transaction.hotelId !== user.hotelId || (transaction.status !== "LOCKED" && transaction.status !== "TERMINATION_REQUESTED" && transaction.status !== "TERMINATED") || transaction.items.some((line) => !line.remainingStockConfirmed) || !transaction.monthlyInvoices.some((invoice) => invoice.month === invoiceMonth && invoice.paymentStatus === "UNPAID")) return transaction;
      const monthlyInvoices = transaction.monthlyInvoices.map((invoice) => invoice.month === invoiceMonth && invoice.paymentStatus === "UNPAID"
        ? { ...invoice, paymentStatus: "PAID" as const, paymentMethod: method, paymentReceiptName: receiptName }
        : invoice);
      return { ...transaction, monthlyInvoices, paymentStatus: monthlyInvoices.every((invoice) => invoice.paymentStatus === "PAID") ? "PAID" : "UNPAID", paymentMethod: method, paymentReceiptName: receiptName };
    }));
  }

  function terminatePartnership(transactionId: string) {
    if (user?.role !== "BUYER" || !user.hotelId) return;
    setTransactions((current) => current.map((transaction) => transaction.id === transactionId
      && transaction.hotelId === user.hotelId
      && transaction.status === "LOCKED"
      ? { ...transaction, status: "TERMINATION_REQUESTED" }
      : transaction));
  }

  function reviewTerminationRequest(transactionId: string, approved: boolean) {
    if (user?.role !== "SELLER") return;
    setTransactions((current) => current.map((transaction) => transaction.id === transactionId && transaction.status === "TERMINATION_REQUESTED"
      ? { ...transaction, status: approved ? "TERMINATED" : "LOCKED" }
      : transaction));
  }

  function deleteTerminatedRecord(transactionId: string) {
    const transaction = transactions.find((entry) => entry.id === transactionId);
    if (transaction?.status !== "TERMINATED" || !user || user.role === "BUYER" && transaction.hotelId !== user.hotelId) return;
    setTransactions((current) => current.filter((entry) => entry.id !== transactionId));
  }

  function updateCatalog(items: Item[]) {
    if (user?.role === "SELLER") setMasterCatalog(items);
  }

  function navigate(nextWorkspace: SidebarWorkspace) {
    setWorkspace(nextWorkspace);
    setWorkspaceMountKey((current) => current + 1);
    setMobileMenuOpen(false);
  }

  if (!user) return <LoginPage onLogin={setUser} />;

  return (
    <div className="app-frame">
      <Sidebar user={user} workspace={workspace} pendingCount={pendingOrders} mobileOpen={mobileMenuOpen} onNavigate={navigate} onSignOut={() => { setUser(null); setWorkspace("overview"); setMobileMenuOpen(false); }} />

      {mobileMenuOpen && <button type="button" className="mobile-scrim" aria-label="Close navigation" onClick={() => setMobileMenuOpen(false)} />}

      <main className="main-area">
        <header className="topbar">
          <button className="icon-button mobile-menu-button" type="button" onClick={() => setMobileMenuOpen(true)} aria-label="Open navigation"><Menu aria-hidden="true" size={20} /></button>
          <div className="breadcrumbs"><span>{user.role === "SELLER" ? "StokVault" : hotel?.name}</span><span aria-hidden="true">/</span><strong>{user.role === "SELLER" ? workspace === "catalog" ? "Master catalog" : workspace === "deliveries" ? "Delivery tracker" : workspace === "locked-stock" ? "Locked Stock" : hotelPartners.find((entry) => entry.id === workspace)?.name ?? "Overview" : "Hotel workspace"}</strong></div>
          <div className="topbar-actions">
            <span className="live-indicator"><span /> SYSTEM LIVE</span>
            <span className="topbar-divider" />
            <span className="topbar-date">{new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(new Date())}</span>
          </div>
        </header>

        <div className="content-wrap">
          {user.role === "SELLER" ? (
            <SellerDashboardPage key={workspaceMountKey} transactions={visibleTransactions} catalog={masterCatalog} workspace={workspace} onNavigate={navigate} onSaveCatalog={updateCatalog} onUpdateDeliveryStatus={updateDeliveryStatus} onReviewTermination={reviewTerminationRequest} onRequestEdit={requestEditAccess} onSaveEdit={saveApprovedEdit} onDeleteRecord={deleteTerminatedRecord} />
          ) : (
            <HotelDashboardPage
              key={workspaceMountKey}
              hotelName={hotel?.name ?? "Hotel"}
              hotelLocation={hotel?.location ?? ""}
              transactions={visibleTransactions}
              catalog={masterCatalog}
              onCreateOrder={createOrder}
              onConfirmArrival={confirmHotelArrival}
              onLockDelivery={lockHotelDelivery}
              onUpdateStock={updateStock}
              onConfirmPayment={confirmPayment}
              onTerminate={terminatePartnership}
              onApproveEditAccess={approveEditAccess}
              onDeleteRecord={deleteTerminatedRecord}
            />
          )}
          <footer className="app-footer"><span>STOKVAULT <span className="footer-dot">·</span> CV. ALAM ZEMPOL</span><span>Secure consignment ledger</span></footer>
        </div>
      </main>
    </div>
  );
}