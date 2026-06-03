"use client";
import { useState } from "react";
import { format } from "date-fns";
import { Trash2, Bot, Trophy, ChevronUp } from "lucide-react";
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
  onIncreaseTarget?: (id: string) => void;
  isPro: boolean;
}

export default function GoalCard({ goal, currency, onDelete, onDeposit, onCoach, onIncreaseTarget, isPro }: GoalCardProps) {
  const [showIncreaseInput, setShowIncreaseInput] = useState(false);
  const [newTarget, setNewTarget] = useState("");

  const isCompleted = goal.status === "completed" || goal.progress_percentage >= 100;
  const progressColor = isCompleted ? "success" : goal.progress_percentage >= 50 ? "gold" : "gold";

  const handleIncreaseTarget = () => {
    const amount = parseFloat(newTarget);
    if (!isNaN(amount) && amount > goal.target_amount) {
      onIncreaseTarget?.(goal.id);
      setShowIncreaseInput(false);
      setNewTarget("");
    }
  };

  return (
    <Card className={`group ${isCompleted ? "border-mg-success/40 bg-mg-success/5" : ""}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{goal.emoji || "🎯"}</span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">{goal.name}</h3>
              {isCompleted && (
                <span className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-mg-success/20 text-mg-success border border-mg-success/30">
                  <Trophy size={9} />
                  Complete
                </span>
              )}
            </div>
            {goal.deadline && (
              <p className="text-xs text-[var(--text-muted)]">
                Due {format(new Date(goal.deadline), "dd MMM yyyy")}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={() => onDelete(goal.id)}
          className="opacity-0 group-hover:opacity-100 text-[var(--text-muted)] hover:text-mg-alert transition-all"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <div className="mb-3">
        <div className="flex justify-between mb-1.5">
          <span className="text-lg font-bold text-mg-gold">
            {formatCurrency(goal.current_amount, currency)}
          </span>
          <span className="text-sm text-[var(--text-muted)]">
            of {formatCurrency(goal.target_amount, currency)}
          </span>
        </div>
        <ProgressBar value={Math.min(goal.progress_percentage, 100)} color={progressColor} size="md" />
        <p className="text-xs text-[var(--text-muted)] mt-1">
          {isCompleted ? "🎉 Goal reached!" : `${goal.progress_percentage.toFixed(1)}% complete`}
        </p>
      </div>

      {isCompleted ? (
        <div className="space-y-2">
          {showIncreaseInput ? (
            <div className="flex gap-2">
              <input
                type="number"
                value={newTarget}
                onChange={(e) => setNewTarget(e.target.value)}
                placeholder={`New target (min ${formatCurrency(goal.target_amount + 1, currency)})`}
                className="flex-1 px-2 py-1.5 text-xs rounded-card border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:border-mg-gold"
              />
              <button
                onClick={handleIncreaseTarget}
                className="px-3 py-1.5 rounded-card text-xs font-medium bg-mg-gold text-mg-bg hover:bg-yellow-400 transition-all"
              >
                Save
              </button>
              <button
                onClick={() => setShowIncreaseInput(false)}
                className="px-2 py-1.5 rounded-card text-xs text-[var(--text-muted)] hover:text-mg-alert transition-all"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => setShowIncreaseInput(true)}
                className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-card text-xs font-medium bg-mg-gold/10 text-mg-gold border border-mg-gold/30 hover:bg-mg-gold/20 transition-all"
              >
                <ChevronUp size={12} />
                Increase Target
              </button>
              <button
                onClick={() => onDelete(goal.id)}
                className="flex-1 py-1.5 rounded-card text-xs font-medium bg-mg-success/10 text-mg-success border border-mg-success/30 hover:bg-mg-success/20 transition-all"
              >
                Close Goal ✓
              </button>
            </div>
          )}
        </div>
      ) : (
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
      )}
    </Card>
  );
}