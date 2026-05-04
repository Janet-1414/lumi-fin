"use client";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";
import Card from "@/components/ui/Card";
import { formatCurrency } from "@/lib/currency";
import { clsx } from "clsx";

interface StatCardsProps {
  income: number;
  expenses: number;
  balance: number;
  currency: string;
}

export default function StatCards({ income, expenses, balance, currency }: StatCardsProps) {
  const cards = [
    { label: "Total Income", amount: income, icon: TrendingUp, color: "text-mg-success", bg: "bg-mg-success/10", type: "income" as const },
    { label: "Total Expenses", amount: expenses, icon: TrendingDown, color: "text-mg-alert", bg: "bg-mg-alert/10", type: "expense" as const },
    { label: "Net Balance", amount: balance, icon: Wallet, color: "text-mg-gold", bg: "bg-mg-gold/10", type: "neutral" as const },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      {cards.map(({ label, amount, icon: Icon, color, bg }) => (
        <Card key={label}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-[var(--text-muted)] mb-2 uppercase tracking-wide">{label}</p>
              <p className={clsx("text-2xl font-bold tabular-nums", color)}>
                {formatCurrency(amount, currency)}
              </p>
            </div>
            <div className={clsx("p-2.5 rounded-card", bg)}>
              <Icon size={20} className={color} />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
