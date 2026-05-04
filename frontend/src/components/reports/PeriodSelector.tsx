"use client";
import { clsx } from "clsx";

interface PeriodSelectorProps {
  period: string;
  onChange: (p: string) => void;
}

export default function PeriodSelector({ period, onChange }: PeriodSelectorProps) {
  return (
    <div className="flex gap-2 p-1 rounded-card bg-[var(--bg-card)] border border-[var(--border)] w-fit">
      {["month", "year"].map((p) => (
        <button
          key={p} onClick={() => onChange(p)}
          className={clsx("px-4 py-1.5 rounded-card text-sm font-medium transition-all", period === p ? "bg-mg-gold text-mg-bg shadow-gold-glow-sm" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]")}
        >
          {p === "month" ? "This Month" : "This Year"}
        </button>
      ))}
    </div>
  );
}
