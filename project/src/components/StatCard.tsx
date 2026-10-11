import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string;
  detail: string;
  icon: ReactNode;
  tone?: "green" | "orange" | "blue";
}

export function StatCard({ label, value, detail, icon, tone = "green" }: StatCardProps) {
  return (
    <article className="stat-card">
      <div className={`stat-icon stat-icon-${tone}`} aria-hidden="true">{icon}</div>
      <div className="min-w-0">
        <p className="stat-label">{label}</p>
        <p className="stat-value">{value}</p>
        <p className="stat-detail">{detail}</p>
      </div>
    </article>
  );
}