import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import type { ReactNode } from "react";

interface AlertBannerProps {
  title: string;
  message: ReactNode;
  tone?: "warning" | "error" | "success";
  onDismiss?: () => void;
  action?: ReactNode;
}

export function AlertBanner({ title, message, tone = "warning", onDismiss, action }: AlertBannerProps) {
  const Icon = tone === "success" ? CheckCircle2 : tone === "error" ? AlertTriangle : Info;

  return (
    <section className={`alert-banner alert-${tone}`} role={tone === "error" ? "alert" : "status"}>
      <Icon className="mt-0.5 shrink-0" aria-hidden="true" size={19} />
      <div className="min-w-0 flex-1">
        <h3 className="font-semibold">{title}</h3>
        <div className="mt-1 text-sm leading-6">{message}</div>
        {action && <div className="mt-3">{action}</div>}
      </div>
      {onDismiss && (
        <button className="icon-button -mr-1 -mt-1" type="button" onClick={onDismiss} aria-label="Dismiss alert">
          <X aria-hidden="true" size={16} />
        </button>
      )}
    </section>
  );
}