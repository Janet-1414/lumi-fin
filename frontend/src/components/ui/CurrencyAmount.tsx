import { formatCurrency, formatCompact } from "@/lib/currency";
import { clsx } from "clsx";

interface CurrencyAmountProps {
  amount: number;
  currency: string;
  type?: "income" | "expense" | "neutral";
  size?: "sm" | "md" | "lg" | "xl";
  compact?: boolean;
}

export default function CurrencyAmount({ amount, currency, type = "neutral", size = "md", compact }: CurrencyAmountProps) {
  const formatted = compact ? formatCompact(amount, currency) : formatCurrency(amount, currency);
  const colors = {
    income: "text-mg-success",
    expense: "text-mg-alert",
    neutral: "text-[var(--text-primary)]",
  };
  const sizes = { sm: "text-sm", md: "text-base", lg: "text-xl font-semibold", xl: "text-3xl font-bold" };

  return (
    <span className={clsx(colors[type], sizes[size], "tabular-nums font-medium")}>
      {type === "expense" && amount > 0 ? "−" : ""}{formatted}
    </span>
  );
}
