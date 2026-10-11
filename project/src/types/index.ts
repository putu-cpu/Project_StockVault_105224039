export type TransactionStatus = "PENDING" | "LOCKED" | "TERMINATION_REQUESTED" | "TERMINATED";

export type DeliveryStatus = "PREPARING" | "IN_TRANSIT" | "ARRIVED";

export type Role = "SELLER" | "BUYER";

export type UserRole = Role;

export type PaymentStatus = "UNPAID" | "PAID";

export type PaymentMethod = "BCA_VA" | "MANDIRI_VA" | "QRIS" | "BANK_TRANSFER";

export interface HotelPartner {
  id: string;
  name: string;
  location: string;
}

export interface Item {
  id: string;
  name: string;
  category: string;
  size: string;
  unitPrice: number;
}

export interface TransactionItem {
  item: Item;
  quantitySent: number;
  quantityReceived: number;
  remainingStock: number;
  remainingStockConfirmed: boolean;
}

export interface MonthlyInvoice {
  month: number;
  dueDate: string;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  paymentReceiptName?: string;
}

export interface Transaction {
  id: string;
  hotelId: string;
  hotel: string;
  location: string;
  createdAt: string;
  contractDurationMonths: number;
  monthlyInvoices: MonthlyInvoice[];
  status: TransactionStatus;
  deliveryStatus: DeliveryStatus;
  items: TransactionItem[];
  editAccessRequested?: boolean;
  editAccessApproved?: boolean;
  hashSignature?: string;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  paymentReceiptName?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  hotelId?: string;
}