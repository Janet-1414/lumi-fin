"use client";
import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import type { SavingsGoal, Streak, Badge } from "@/types/savings";
import toast from "react-hot-toast";

export function useSavingsGoals() {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [streak, setStreak] = useState<Streak | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const [g, s, b] = await Promise.all([
        api.get<SavingsGoal[]>("/savings/goals"),
        api.get<Streak>("/savings/streak"),
        api.get<Badge[]>("/savings/badges"),
      ]);
      setGoals(g);
      setStreak(s);
      setBadges(b);
    } catch (e: any) {
      toast.error(e.message || "Failed to load savings data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const createGoal = async (data: Partial<SavingsGoal>) => {
    const goal = await api.post<SavingsGoal>("/savings/goals", data);
    setGoals((prev) => [goal, ...prev]);
    toast.success("Goal created! 🎯");
    return goal;
  };

  const updateGoal = async (id: string, data: Partial<SavingsGoal>) => {
    const updated = await api.patch<SavingsGoal>(`/savings/goals/${id}`, data);
    setGoals((prev) => prev.map((g) => (g.id === id ? updated : g)));
    toast.success("Goal updated!");
    return updated;
  };

  const deleteGoal = async (id: string) => {
    await api.delete(`/savings/goals/${id}`);
    setGoals((prev) => prev.filter((g) => g.id !== id));
    toast.success("Goal removed");
  };

  return { goals, streak, badges, isLoading, createGoal, updateGoal, deleteGoal, refetch: fetchAll };
}
