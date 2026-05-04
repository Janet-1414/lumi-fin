"use client";
import { useState } from "react";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

const GOAL_EMOJIS = ["🏠", "🚗", "💻", "📱", "✈️", "💍", "🎓", "💰", "🎯", "🌟"];

interface AddGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: any) => Promise<void>;
  currency: string;
}

export default function AddGoalModal({ isOpen, onClose, onAdd, currency }: AddGoalModalProps) {
  const [form, setForm] = useState({ name: "", target_amount: 0, deadline: "", emoji: "🎯" });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onAdd({ ...form, target_amount: Number(form.target_amount) });
      onClose();
      setForm({ name: "", target_amount: 0, deadline: "", emoji: "🎯" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Savings Goal">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-[var(--text-secondary)] block mb-2">Choose an emoji</label>
          <div className="flex flex-wrap gap-2">
            {GOAL_EMOJIS.map((e) => (
              <button
                key={e} type="button"
                onClick={() => setForm((f) => ({ ...f, emoji: e }))}
                className={`w-9 h-9 rounded-card text-xl flex items-center justify-center border transition-all ${form.emoji === e ? "border-mg-gold bg-mg-gold/10" : "border-[var(--border)]"}`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>
        <Input label="Goal name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. New Laptop" required />
        <Input label={`Target amount (${currency})`} type="number" min="1" value={form.target_amount || ""} onChange={(e) => setForm((f) => ({ ...f, target_amount: parseFloat(e.target.value) || 0 }))} required />
        <Input label="Deadline (optional)" type="date" value={form.deadline} onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))} />
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" className="flex-1" isLoading={isLoading}>Create Goal</Button>
        </div>
      </form>
    </Modal>
  );
}
