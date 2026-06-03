"use client";
import { useState } from "react";
import { Plus, Trophy, ChevronDown, ChevronUp } from "lucide-react";
import { useUser } from "@/hooks/useUser";
import { useSavingsGoals } from "@/hooks/useSavingsGoals";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import StreakBanner from "@/components/savings/StreakBanner";
import GoalCard from "@/components/savings/GoalCard";
import SavingsChallengeCard from "@/components/savings/SavingsChallengeCard";
import InvestmentHintCard from "@/components/savings/InvestmentHintCard";
import AddGoalModal from "@/components/savings/AddGoalModal";
import BadgeGrid from "@/components/profile/BadgeGrid";
import Card from "@/components/ui/Card";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/currency";
import { format } from "date-fns";
import toast from "react-hot-toast";

export default function SavingsPage() {
  const user = useUser();
  const { goals, streak, badges, isLoading, createGoal, updateGoal, deleteGoal } = useSavingsGoals();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [showAchieved, setShowAchieved] = useState(false);
  const [coachingMessage, setCoachingMessage] = useState<{ goalId: string; message: string } | null>(null);

  const isPro = user?.subscription_tier === "pro";

  const activeGoals = goals.filter((g) => g.status === "active" || g.status === "paused");
  const achievedGoals = goals.filter((g) => g.status === "completed");

  const handleCoach = async (goalId: string) => {
    try {
      const data = await api.post<{ coaching_message: string }>(`/savings/goals/${goalId}/coach`);
      setCoachingMessage({ goalId, message: data.coaching_message });
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleDeposit = async (goalId: string) => {
    const amountStr = prompt("How much are you adding?");
    if (!amountStr) return;
    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) return;
    const goal = goals.find((g) => g.id === goalId);
    if (!goal) return;
    await updateGoal(goalId, { current_amount: goal.current_amount + amount });
  };

  const handleIncreaseTarget = async (goalId: string) => {
    const goal = goals.find((g) => g.id === goalId);
    if (!goal) return;
    const amountStr = prompt(`Current target: ${goal.target_amount.toLocaleString()} ${user?.currency_code}. Enter new target amount:`);
    if (!amountStr) return;
    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= goal.target_amount) {
      toast.error(`New target must be greater than ${goal.target_amount.toLocaleString()}`);
      return;
    }
    await updateGoal(goalId, { target_amount: amount, status: "active" });
    toast.success("Target increased! Keep saving 💪");
  };

  if (!user) return null;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Savings Goals</h1>
        <Button variant="primary" size="sm" onClick={() => setIsAddOpen(true)}>
          <Plus size={16} />
          New Goal
        </Button>
      </div>

      {streak && <StreakBanner streak={streak} userName={user.first_name} />}

      {coachingMessage && (
        <Card glow className="mb-5">
          <p className="text-xs font-bold text-mg-gold mb-2">🤖 AI Savings Coach</p>
          <p className="text-sm text-[var(--text-primary)] leading-relaxed">{coachingMessage.message}</p>
          <button onClick={() => setCoachingMessage(null)} className="text-xs text-[var(--text-muted)] mt-2 hover:text-mg-gold">Dismiss</button>
        </Card>
      )}

      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : (
        <>
          {/* Active goals */}
          {activeGoals.length === 0 && achievedGoals.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-4xl mb-4">🎯</p>
              <p className="text-lg font-semibold text-[var(--text-primary)]">No goals yet, {user.first_name}</p>
              <p className="text-sm text-[var(--text-muted)] mb-6">Set your first savings goal and start your journey</p>
              <Button variant="primary" onClick={() => setIsAddOpen(true)}>Create your first goal</Button>
            </div>
          ) : (
            <>
              {activeGoals.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  {activeGoals.map((goal) => (
                    <GoalCard
                      key={goal.id}
                      goal={goal}
                      currency={user.currency_code}
                      onDelete={deleteGoal}
                      onDeposit={handleDeposit}
                      onCoach={handleCoach}
                      onIncreaseTarget={handleIncreaseTarget}
                      isPro={isPro}
                    />
                  ))}
                </div>
              )}

              {/* Goals Achieved section */}
              {achievedGoals.length > 0 && (
                <div className="mb-6">
                  <button
                    onClick={() => setShowAchieved(!showAchieved)}
                    className="w-full flex items-center justify-between p-4 rounded-card bg-mg-success/10 border border-mg-success/30 hover:bg-mg-success/15 transition-all mb-3"
                  >
                    <div className="flex items-center gap-2">
                      <Trophy size={16} className="text-mg-success" />
                      <span className="text-sm font-semibold text-mg-success">
                        Goals Achieved — {achievedGoals.length} goal{achievedGoals.length !== 1 ? "s" : ""} completed
                      </span>
                    </div>
                    {showAchieved ? (
                      <ChevronUp size={16} className="text-mg-success" />
                    ) : (
                      <ChevronDown size={16} className="text-mg-success" />
                    )}
                  </button>

                  {showAchieved && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {achievedGoals.map((goal) => (
                        <GoalCard
                          key={goal.id}
                          goal={goal}
                          currency={user.currency_code}
                          onDelete={deleteGoal}
                          onDeposit={handleDeposit}
                          onCoach={handleCoach}
                          onIncreaseTarget={handleIncreaseTarget}
                          isPro={isPro}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <SavingsChallengeCard isPro={isPro} currency={user.currency_code} />
        <InvestmentHintCard isPro={isPro} goals={goals} />
      </div>

      <BadgeGrid badges={badges} />
      <AddGoalModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onAdd={async (data) => { await createGoal(data); }}
        currency={user.currency_code}
      />
    </div>
  );
}