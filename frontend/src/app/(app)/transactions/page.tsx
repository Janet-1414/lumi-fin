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
import type { CreateTransactionPayload, TransactionCategory, TransactionType } from "@/types/transaction";

export default function TransactionsPage() {
  const user = useUser();
  const { transactions, summary, isLoading, createTransaction, deleteTransaction } = useTransactions("month");
  const [filter, setFilter] = useState("all");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [prefillData, setPrefillData] = useState<Partial<CreateTransactionPayload> | null>(null);

  const filtered = transactions.filter((tx) => {
    if (filter === "all") return true;
    if (filter === "income" || filter === "expense") return tx.type === filter;
    return tx.category === filter;
  });

  const handleScanned = (result: any) => {
    if (result && !result.error) {
      setPrefillData({
        amount: result.amount || 0,
        type: (result.type as TransactionType) || "expense",
        category: (result.category as TransactionCategory) || "other",
        description: result.description || "",
        merchant: result.merchant || "",
      });
      setIsAddOpen(true);
    }
  };

  if (!user) return null;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Transactions</h1>
        <Button variant="primary" size="sm" onClick={() => { setPrefillData(null); setIsAddOpen(true); }}>
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

      <ReceiptScannerBanner onScanned={handleScanned} />

      <Card className="my-5">
        <FilterPills active={filter} onChange={setFilter} />
      </Card>

      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : (
        <TransactionList
          transactions={filtered}
          currency={user.currency_code}
          onDelete={deleteTransaction}
        />
      )}

      <AddTransactionModal
        isOpen={isAddOpen}
        onClose={() => { setIsAddOpen(false); setPrefillData(null); }}
        onAdd={async (data) => { await createTransaction(data); }}
        currency={user.currency_code}
        prefill={prefillData}
      />
    </div>
  );
}
