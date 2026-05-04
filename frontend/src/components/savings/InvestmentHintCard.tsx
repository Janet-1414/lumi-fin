"use client";
import { useState } from "react";
import { TrendingUp, Lock } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import type { SavingsGoal } from "@/types/savings";

interface InvestmentHintCardProps {
  isPro: boolean;
  goals: SavingsGoal[];
}

export default function InvestmentHintCard({ isPro, goals }: InvestmentHintCardProps) {
  const [hint, setHint] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const completedGoals = goals.filter((g) => g.status === "completed").length;
  const isUnlocked = isPro && completedGoals >= 1;

  const fetchHint = async () => {
    setIsLoading(true);
    try {
      const data = await api.get<any>("/ai/investment-hint");
      setHint(data);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp size={18} className="text-mg-success" />
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">Investment Hint</h3>
      </div>
      {!isUnlocked ? (
        <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
          <Lock size={14} />
          <span>{!isPro ? "Requires Lumi Pro" : "Complete a savings goal to unlock investment hints"}</span>
        </div>
      ) : hint ? (
        <div className="space-y-2">
          <p className="font-semibold text-mg-success">{hint.title}</p>
          <p className="text-sm text-[var(--text-secondary)]">{hint.description}</p>
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${hint.risk_level === "low" ? "bg-mg-success/20 text-mg-success" : "bg-mg-alert/20 text-mg-alert"}`}>
              {hint.risk_level} risk
            </span>
            <span className="text-xs text-[var(--text-muted)]">{hint.relevant_to_country}</span>
          </div>
          {hint.how_to_start && <p className="text-xs text-[var(--text-muted)] italic">{hint.how_to_start}</p>}
        </div>
      ) : (
        <Button size="sm" variant="secondary" onClick={fetchHint} isLoading={isLoading} className="w-full">
          Get Investment Hint
        </Button>
      )}
    </Card>
  );
}
