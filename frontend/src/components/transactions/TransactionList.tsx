"use client";
import { format } from "date-fns";
import TransactionItem from "./TransactionItem";
import type { Transaction } from "@/types/transaction";

interface TransactionListProps {
  transactions: Transaction[];
  currency: string;
  onDelete: (id: string) => void;
}

function groupByDate(txs: Transaction[]): Record<string, Transaction[]> {
  return txs.reduce((acc, tx) => {
    const date = format(new Date(tx.transaction_date), "dd MMM yyyy");
    return { ...acc, [date]: [...(acc[date] || []), tx] };
  }, {} as Record<string, Transaction[]>);
}

export default function TransactionList({ transactions, currency, onDelete }: TransactionListProps) {
  if (transactions.length === 0) {
    return <p className="text-center text-[var(--text-muted)] text-sm py-12">No transactions found</p>;
  }

  const grouped = groupByDate(transactions);

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([date, txs]) => (
        <div key={date}>
          <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-2 px-3">{date}</p>
          <div className="glass-card divide-y divide-[var(--border)]">
            {txs.map((tx) => (
              <TransactionItem key={tx.id} transaction={tx} currency={currency} onDelete={onDelete} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
