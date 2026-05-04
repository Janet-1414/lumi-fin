"use client";
import { useState } from "react";
import { Plus } from "lucide-react";
import { useUser } from "@/hooks/useUser";
import { useTransactions } from "@/hooks/useTransactions";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import StatCards from "@/components/dashboard/StatCards";
import TransactionList from "@/components/transactions/TransactionList";
import FilterPills from "@/components/transactions/FilterPills";
import AddTransactionModal from "@/components/transactions/AddTransactionModal";
import ReceiptScannerBanner from "@/components/transactions/ReceiptScannerBanner";

export default function TransactionsPage() {
  const user = useUser();
  const { transactions, summary, isLoading, createTransaction, deleteTransaction } = useTransactions("month");
  const [filter, setFilter] = useState("all");
  const [isAddOpen, setIsAddOpen] = useState(false);

  const filtered = transactions.filter((tx) => {
    if (filter === "all") return true;
    if (filter === "income" || filter === "expense") return tx.type === filter;
    return tx.category === filter;
  });

  if (!user) return null;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Transactions</h1>
        <Button variant="primary" size="sm" onClick={() => setIsAddOpen(true)}>
          <Plus size={16} />
          Add
        </Button>
      </div>

      <StatCards
        income={summary?.total_income || 0}
        expenses={summary?.total_expenses || 0}
        balance={summary?.balance || 0}
        currency={user.currency_code}
      />

      <ReceiptScannerBanner />

      <Card className="my-5">
        <FilterPills active={filter} onChange={setFilter} />
      </Card>

      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : (
        <TransactionList transactions={filtered} currency={user.currency_code} onDelete={deleteTransaction} />
      )}

      <AddTransactionModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onAdd={createTransaction}
        currency={user.currency_code}
      />
    </div>
  );
}
