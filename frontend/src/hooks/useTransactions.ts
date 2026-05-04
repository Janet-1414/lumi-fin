"use client";
import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import type { Transaction, TransactionSummary, CreateTransactionPayload } from "@/types/transaction";
import toast from "react-hot-toast";

export function useTransactions(period: string = "month") {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<TransactionSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const [txs, sum] = await Promise.all([
        api.get<Transaction[]>("/transactions"),
        api.get<TransactionSummary>("/transactions/summary", { period }),
      ]);
      setTransactions(txs);
      setSummary(sum);
    } catch (e: any) {
      toast.error(e.message || "Failed to load transactions");
    } finally {
      setIsLoading(false);
    }
  }, [period]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const createTransaction = async (data: CreateTransactionPayload) => {
    const tx = await api.post<Transaction>("/transactions", data);
    setTransactions((prev) => [tx, ...prev]);
    toast.success("Transaction added!");
    await fetchAll();
    return tx;
  };

  const deleteTransaction = async (id: string) => {
    await api.delete(`/transactions/${id}`);
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    toast.success("Transaction deleted");
    await fetchAll();
  };

  return { transactions, summary, isLoading, createTransaction, deleteTransaction, refetch: fetchAll };
}
