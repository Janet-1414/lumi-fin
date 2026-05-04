"use client";
import { clsx } from "clsx";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "income", label: "Income" },
  { key: "expense", label: "Expenses" },
  { key: "food", label: "Food" },
  { key: "transport", label: "Transport" },
  { key: "mobile_money", label: "Mobile Money" },
  { key: "shopping", label: "Shopping" },
];

interface FilterPillsProps {
  active: string;
  onChange: (filter: string) => void;
}

export default function FilterPills({ active, onChange }: FilterPillsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {FILTERS.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={clsx(
            "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-150 border",
            active === key
              ? "bg-mg-gold text-mg-bg border-mg-gold shadow-gold-glow-sm"
              : "bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border)] hover:border-mg-gold/40"
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
