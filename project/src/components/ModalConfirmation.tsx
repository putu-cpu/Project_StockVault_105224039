import { LockKeyhole, X } from "lucide-react";
import type { ReactNode } from "react";
import { useFocusTrap } from "../hooks/useFocusTrap";

interface ModalConfirmationProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  busy?: boolean;
  hotelName: string;
  title?: string;
  description?: ReactNode;
  confirmLabel?: string;
  busyLabel?: string;
}

export function ModalConfirmation({ open, onClose, onConfirm, busy = false, hotelName, title = "Lock this stock submission permanently?", description, confirmLabel = "Confirm & Lock Permanently", busyLabel = "Creating signature..." }: ModalConfirmationProps) {
  const dialogRef = useFocusTrap<HTMLDivElement>(open, onClose);
  if (!open) return null;

  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div
        ref={dialogRef}
        className="modal-panel max-w-lg"
        role="dialog"
        aria-modal="true"
        aria-labelledby="lock-dialog-title"
        aria-describedby="lock-dialog-description"
      >
        <div className="flex items-start justify-between gap-4">
          <span className="modal-symbol"><LockKeyhole aria-hidden="true" size={20} /></span>
          <button className="icon-button -mr-1 -mt-1" type="button" onClick={onClose} aria-label="Close confirmation">
            <X aria-hidden="true" size={18} />
          </button>
        </div>
        <h2 id="lock-dialog-title" className="mt-5 text-xl font-semibold tracking-tight text-stone-950">
          {title}
        </h2>
        <p id="lock-dialog-description" className="mt-2 text-sm leading-6 text-stone-600">
          {description ?? <>Confirming {hotelName} records the submitted location and stock counts as an immutable snapshot. Future billing will use this signed record.</>}
        </p>
        <div className="mt-7 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button className="button-secondary" type="button" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button className="button-primary" type="button" onClick={onConfirm} disabled={busy}>
            <LockKeyhole aria-hidden="true" size={16} />
            {busy ? busyLabel : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}