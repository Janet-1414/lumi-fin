"use client";
import Link from "next/link";
import { formatCurrency } from "@/lib/currency";
import { format } from "date-fns";
import { clsx } from "clsx";
import type { Transaction } from "@/types/transaction";
import CategoryIcon from "@/components/transactions/CategoryIcon";

interface RecentTransactionsProps {
  transactions: Transaction[];
  currency: string;
}

export default function RecentTransactions({ transactions, currency }: RecentTransactionsProps) {
  const recent = transactions.slice(0, 5);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide">Recent Transactions</h3>
        <Link href="/transactions" className="text-xs text-mg-gold hover:underline">View all</Link>
      </div>
      {recent.length === 0 ? (
        <p className="text-sm text-[var(--text-muted)] text-center py-8">No transactions yet. Add your first one!</p>
      ) : (
        <div className="space-y-3">
          {recent.map((tx) => (
            <div key={tx.id} className="flex items-center gap-3">
              <CategoryIcon category={tx.category} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--text-primary)] truncate">{tx.description}</p>
                <p className="text-xs text-[var(--text-muted)]">
                  {format(new Date(tx.transaction_date), "dd MMM")}
                  {tx.ai_scanned && <span className="ml-2 text-mg-gold">✦ AI</span>}
                </p>
              </div>
              <span className={clsx("text-sm font-semibold tabular-nums", tx.type === "income" ? "text-mg-success" : "text-mg-alert")}>
                {tx.type === "income" ? "+" : "−"}{formatCurrency(tx.amount, currency)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
