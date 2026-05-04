"use client";
import { format } from "date-fns";
import { Trash2, Bot } from "lucide-react";
import Card from "@/components/ui/Card";
import ProgressBar from "@/components/ui/ProgressBar";
import { formatCurrency } from "@/lib/currency";
import type { SavingsGoal } from "@/types/savings";

interface GoalCardProps {
  goal: SavingsGoal;
  currency: string;
  onDelete: (id: string) => void;
  onDeposit: (id: string) => void;
  onCoach?: (id: string) => void;
  isPro: boolean;
}

export default function GoalCard({ goal, currency, onDelete, onDeposit, onCoach, isPro }: GoalCardProps) {
  const progressColor = goal.progress_percentage >= 100 ? "success" : goal.progress_percentage >= 50 ? "gold" : "gold";

  return (
    <Card className="group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{goal.emoji || "🎯"}</span>
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">{goal.name}</h3>
            {goal.deadline && (
              <p className="text-xs text-[var(--text-muted)]">Due {format(new Date(goal.deadline), "dd MMM yyyy")}</p>
            )}
          </div>
        </div>
        <button onClick={() => onDelete(goal.id)} className="opacity-0 group-hover:opacity-100 text-[var(--text-muted)] hover:text-mg-alert transition-all">
          <Trash2 size={14} />
        </button>
      </div>

      <div className="mb-3">
        <div className="flex justify-between mb-1.5">
          <span className="text-lg font-bold text-mg-gold">{formatCurrency(goal.current_amount, currency)}</span>
          <span className="text-sm text-[var(--text-muted)]">of {formatCurrency(goal.target_amount, currency)}</span>
        </div>
        <ProgressBar value={goal.progress_percentage} color={progressColor} size="md" />
        <p className="text-xs text-[var(--text-muted)] mt-1">{goal.progress_percentage.toFixed(1)}% complete</p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onDeposit(goal.id)}
          className="flex-1 py-1.5 rounded-card text-xs font-medium bg-mg-gold/10 text-mg-gold border border-mg-gold/30 hover:bg-mg-gold/20 transition-all"
        >
          Add Funds
        </button>
        {isPro && (
          <button
            onClick={() => onCoach?.(goal.id)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-card text-xs font-medium bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-secondary)] hover:border-mg-gold/40 transition-all"
          >
            <Bot size={12} />
            Coach
          </button>
        )}
      </div>
    </Card>
  );
}
