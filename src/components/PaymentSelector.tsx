import { Banknote, Building2, QrCode } from "lucide-react";
import type { PaymentMethod } from "../types";

interface PaymentSelectorProps {
  value: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
}

const methods: { value: PaymentMethod; label: string; detail: string; icon: typeof Building2 }[] = [
  { value: "BCA_VA", label: "BCA Virtual Account", detail: "Automatic bank confirmation", icon: Building2 },
  { value: "MANDIRI_VA", label: "Mandiri Virtual Account", detail: "Automatic bank confirmation", icon: Building2 },
  { value: "QRIS", label: "QRIS", detail: "Scan using your hotel banking app", icon: QrCode },
  { value: "BANK_TRANSFER", label: "Bank transfer", detail: "Upload a transfer slip", icon: Banknote },
];

export function PaymentSelector({ value, onChange }: PaymentSelectorProps) {
  return (
    <fieldset className="payment-method-list">
      <legend className="form-label">Select a payment method</legend>
      {methods.map(({ value: method, label, detail, icon: Icon }) => (
        <label className={`payment-method ${value === method ? "payment-method-selected" : ""}`} key={method}>
          <input type="radio" name="payment-method" value={method} checked={value === method} onChange={() => onChange(method)} />
          <span className="payment-method-icon"><Icon aria-hidden="true" size={17} /></span>
          <span className="min-w-0 flex-1"><span className="block text-xs font-semibold text-stone-900">{label}</span><span className="mt-1 block text-[10px] text-stone-500">{detail}</span></span>
        </label>
      ))}
    </fieldset>
  );
}