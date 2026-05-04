"use client";
import { formatCurrency } from "@/lib/currency";
import ProgressBar from "@/components/ui/ProgressBar";

interface TopCategoriesListProps {
  categories: Array<{ category: string; amount: number; percentage: number }>;
  currency: string;
}

export default function TopCategoriesList({ categories, currency }: TopCategoriesListProps) {
  return (
    <div className="space-y-3">
      {categories.map((cat, i) => (
        <div key={cat.category}>
          <div className="flex justify-between mb-1">
            <span className="text-sm text-[var(--text-primary)] capitalize">{i + 1}. {cat.category.replace("_", " ")}</span>
            <span className="text-sm font-medium text-mg-alert">{formatCurrency(cat.amount, currency)}</span>
          </div>
          <ProgressBar value={cat.percentage} color="alert" size="sm" />
          <p className="text-xs text-[var(--text-muted)] mt-0.5">{cat.percentage.toFixed(1)}% of expenses</p>
        </div>
      ))}
    </div>
  );
}
