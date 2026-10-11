import { Check, CircleDashed, LockKeyhole, OctagonAlert } from "lucide-react";
import type { DeliveryStatus, PaymentStatus, TransactionStatus } from "../types";

type BadgeStatus = TransactionStatus | PaymentStatus | DeliveryStatus;

const statusStyles: Record<BadgeStatus, string> = {
  PENDING: "border-amber-300 bg-amber-50 text-amber-950",
  LOCKED: "border-emerald-300 bg-emerald-50 text-emerald-950",
  TERMINATED: "border-rose-300 bg-rose-50 text-rose-950",
  IN_TRANSIT: "border-sky-300 bg-sky-50 text-sky-950",
  DELIVERED: "border-teal-300 bg-teal-50 text-teal-950",
  UNPAID: "border-orange-300 bg-orange-50 text-orange-950",
  PAID: "border-emerald-300 bg-emerald-50 text-emerald-950",
};

export function StatusBadge({ status }: { status: BadgeStatus }) {
  const Icon = status === "LOCKED" ? LockKeyhole : status === "TERMINATED" ? OctagonAlert : status === "PAID" || status === "DELIVERED" ? Check : CircleDashed;

  return (
    <span className={`status-badge ${statusStyles[status]}`}>
      <Icon aria-hidden="true" size={13} strokeWidth={2.2} />
      <span>{status}</span>
      {status === "LOCKED" && <Check aria-hidden="true" size={12} strokeWidth={2.6} />}
    </span>
  );
}