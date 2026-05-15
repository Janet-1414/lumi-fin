"use client";
import { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import type { CreateTransactionPayload, TransactionType, TransactionCategory } from "@/types/transaction";

const CATEGORIES: TransactionCategory[] = [
  "food", "transport", "entertainment", "utilities", "health",
  "education", "shopping", "savings", "salary", "freelance", "mobile_money", "rent", "other"
];

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: CreateTransactionPayload) => Promise<void>;
  currency: string;
  prefill?: Partial<CreateTransactionPayload> | null;
}

const DEFAULT_FORM: CreateTransactionPayload = {
  amount: 0,
  type: "expense",
  category: "food",
  description: "",
};

export default function AddTransactionModal({ isOpen, onClose, onAdd, currency, prefill }: AddTransactionModalProps) {
  const [form, setForm] = useState<CreateTransactionPayload>(DEFAULT_FORM);
  const [isLoading, setIsLoading] = useState(false);

  // When prefill changes (e.g. from scanner), populate the form
  useEffect(() => {
    if (prefill) {
      setForm({ ...DEFAULT_FORM, ...prefill });
    } else {
      setForm(DEFAULT_FORM);
    }
  }, [prefill, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.description || form.amount <= 0) return;
    setIsLoading(true);
    try {
      await onAdd(form);
      onClose();
      setForm(DEFAULT_FORM);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={prefill ? "Confirm Scanned Transaction" : "Add Transaction"}>
      {prefill && (
        <p className="text-xs text-mg-gold bg-mg-gold/10 px-3 py-2 rounded-card border border-mg-gold/20 mb-4">
          ✦ AI pre-filled this from your scan. Review and adjust before saving.
        </p>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setForm((f) => ({ ...f, type: "expense" }))}
            className={`py-2 rounded-card text-sm font-medium border transition-all ${form.type === "expense" ? "bg-mg-alert/20 text-mg-alert border-mg-alert/40" : "border-[var(--border)] text-[var(--text-muted)]"}`}
          >
            Expense
          </button>
          <button
            type="button"
            onClick={() => setForm((f) => ({ ...f, type: "income" }))}
            className={`py-2 rounded-card text-sm font-medium border transition-all ${form.type === "income" ? "bg-mg-success/20 text-mg-success border-mg-success/40" : "border-[var(--border)] text-[var(--text-muted)]"}`}
          >
            Income
          </button>
        </div>
        <Input
          label={`Amount (${currency})`}
          type="number"
          min="1"
          value={form.amount || ""}
          onChange={(e) => setForm((f) => ({ ...f, amount: parseFloat(e.target.value) || 0 }))}
          placeholder="0"
          required
        />
        <Input
          label="Description"
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          placeholder="e.g. Lunch at Cafe Javas"
          required
        />
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[var(--text-secondary)]">Category</label>
          <select
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as TransactionCategory }))}
            className="w-full rounded-card border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-primary)] px-3 py-2.5 text-sm focus:outline-none focus:border-mg-gold"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1).replace("_", " ")}</option>
            ))}
          </select>
        </div>
        <Input
          label="Merchant (optional)"
          value={form.merchant || ""}
          onChange={(e) => setForm((f) => ({ ...f, merchant: e.target.value }))}
          placeholder="e.g. MTN Mobile Money"
        />
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" className="flex-1" isLoading={isLoading}>
            {prefill ? "Save Transaction" : "Add Transaction"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
