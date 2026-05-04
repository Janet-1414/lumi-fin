"use client";
import { Trash2 } from "lucide-react";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/currency";
import CategoryIcon from "./CategoryIcon";
import { clsx } from "clsx";
import type { Transaction } from "@/types/transaction";

interface TransactionItemProps {
  transaction: Transaction;
  currency: string;
  onDelete: (id: string) => void;
}

export default function TransactionItem({ transaction: tx, currency, onDelete }: TransactionItemProps) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-card hover:bg-[var(--bg-card-hover)] group transition-colors">
      <CategoryIcon category={tx.category} size="sm" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-[var(--text-primary)] truncate">{tx.description}</p>
          {tx.ai_scanned && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-mg-gold/20 text-mg-gold border border-mg-gold/30 flex-shrink-0">AI</span>
          )}
        </div>
        <p className="text-xs text-[var(--text-muted)] capitalize">
          {tx.category.replace("_", " ")} · {format(new Date(tx.transaction_date), "dd MMM yyyy")}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <span className={clsx("text-sm font-bold tabular-nums", tx.type === "income" ? "text-mg-success" : "text-mg-alert")}>
          {tx.type === "income" ? "+" : "−"}{formatCurrency(tx.amount, currency)}
        </span>
        <button
          onClick={() => onDelete(tx.id)}
          className="opacity-0 group-hover:opacity-100 text-[var(--text-muted)] hover:text-mg-alert transition-all"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
