"use client";
import { useUser } from "@/hooks/useUser";
import { useTransactions } from "@/hooks/useTransactions";
import GreetingBanner from "@/components/dashboard/GreetingBanner";
import StatCards from "@/components/dashboard/StatCards";
import SpendingDonut from "@/components/dashboard/SpendingDonut";
import RecentTransactions from "@/components/dashboard/RecentTransactions";
import AIInsightBanner from "@/components/dashboard/AIInsightBanner";
import Card from "@/components/ui/Card";
import Spinner from "@/components/ui/Spinner";
import { api } from "@/lib/api";
import { useState, useEffect } from "react";

export default function DashboardPage() {
  const user = useUser();
  const { transactions, summary, isLoading } = useTransactions("month");
  const [report, setReport] = useState<any>(null);

  useEffect(() => {
    api.get<any>("/reports", { period: "month" }).then(setReport).catch(() => {});
  }, []);

  if (!user || isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <GreetingBanner />
      <StatCards
        income={summary?.total_income || 0}
        expenses={summary?.total_expenses || 0}
        balance={summary?.balance || 0}
        currency={user.currency_code}
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <Card>
          <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-4">Spending by Category</h3>
          <SpendingDonut
            data={report?.category_breakdown || []}
            currency={user.currency_code}
          />
        </Card>
        <Card>
          <RecentTransactions transactions={transactions} currency={user.currency_code} />
        </Card>
      </div>
      <AIInsightBanner />
    </div>
  );
}
