"use client";
import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Wallet, ArrowUp, ArrowDown, Minus } from "lucide-react";
import Card from "@/components/ui/Card";
import { formatCurrency } from "@/lib/currency";
import { api } from "@/lib/api";
import { clsx } from "clsx";

interface StatCardsProps {
  income: number;
  expenses: number;
  balance: number;
  currency: string;
}

interface LastMonthData {
  total_income: number;
  total_expenses: number;
  net_balance: number;
}

function getChangePct(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return Math.round(((current - previous) / previous) * 100);
}

function ChangeTag({ current, previous, invert = false }: { current: number; previous: number; invert?: boolean }) {
  const pct = getChangePct(current, previous);
  if (pct === null) return <span className="text-xs text-[var(--text-muted)]">No data last month</span>;

  const isGood = invert ? pct < 0 : pct >= 0;
  const isZero = pct === 0;

  return (
    <div className={clsx(
      "flex items-center gap-0.5 text-xs font-medium",
      isZero ? "text-[var(--text-muted)]" : isGood ? "text-mg-success" : "text-mg-alert"
    )}>
      {isZero ? <Minus size={11} /> : isGood ? <ArrowUp size={11} /> : <ArrowDown size={11} />}
      {isZero ? "Same as last month" : `${Math.abs(pct)}% vs last month`}
    </div>
  );
}

export default function StatCards({ income, expenses, balance, currency }: StatCardsProps) {
  const [lastMonth, setLastMonth] = useState<LastMonthData | null>(null);

  useEffect(() => {
    api.get<LastMonthData>("/reports", { period: "last_month" })
      .then(setLastMonth)
      .catch(() => {});
  }, []);

  const cards = [
    {
      label: "Total Income",
      amount: income,
      lastAmount: lastMonth?.total_income ?? null,
      icon: TrendingUp,
      color: "text-mg-success",
      bg: "bg-mg-success/10",
      invert: false,
    },
    {
      label: "Total Expenses",
      amount: expenses,
      lastAmount: lastMonth?.total_expenses ?? null,
      icon: TrendingDown,
      color: "text-mg-alert",
      bg: "bg-mg-alert/10",
      invert: true, // for expenses, down is good
    },
    {
      label: "Net Balance",
      amount: balance,
      lastAmount: lastMonth?.net_balance ?? null,
      icon: Wallet,
      color: balance >= 0 ? "text-mg-success" : "text-mg-alert",
      bg: "bg-mg-gold/10",
      invert: false,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      {cards.map(({ label, amount, lastAmount, icon: Icon, color, bg, invert }) => (
        <Card key={label}>
          <div className="flex items-start justify-between mb-2">
            <p className="text-xs text-[var(--text-muted)] uppercase tracking-wide">{label}</p>
            <div className={clsx("p-2.5 rounded-card", bg)}>
              <Icon size={18} className={color} />
            </div>
          </div>
          <p className={clsx("text-2xl font-bold tabular-nums mb-1.5", color)}>
            {formatCurrency(amount, currency)}
          </p>
          {lastAmount !== null && (
            <ChangeTag current={amount} previous={lastAmount} invert={invert} />
          )}
        </Card>
      ))}
    </div>
  );
}
