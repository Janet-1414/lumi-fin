"use client";
import { useState } from "react";
import { useUser } from "@/hooks/useUser";
import { useReports } from "@/hooks/useReports";
import Card from "@/components/ui/Card";
import Spinner from "@/components/ui/Spinner";
import PeriodSelector from "@/components/reports/PeriodSelector";
import IncomeExpenseBar from "@/components/reports/IncomeExpenseBar";
import CategoryDonut from "@/components/reports/CategoryDonut";
import AISummaryCard from "@/components/reports/AISummaryCard";
import TopCategoriesList from "@/components/reports/TopCategoriesList";
import { formatCurrency } from "@/lib/currency";

export default function ReportsPage() {
  const user = useUser();
  const [period, setPeriod] = useState("month");
  const { report, aiSummary, isLoading, isSummaryLoading, fetchAiSummary } = useReports(period);
  const isPro = user?.subscription_tier === "pro";

  if (!user) return null;

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Financial Reports</h1>
        <PeriodSelector period={period} onChange={setPeriod} />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : report ? (
        <div className="space-y-5">
          {/* Key metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Income", value: report.total_income, color: "text-mg-success" },
              { label: "Expenses", value: report.total_expenses, color: "text-mg-alert" },
              { label: "Net Balance", value: report.net_balance, color: "text-mg-gold" },
              { label: "Savings Rate", value: null, pct: report.savings_rate, color: "text-blue-400" },
            ].map(({ label, value, pct, color }) => (
              <Card key={label}>
                <p className="text-xs text-[var(--text-muted)] mb-1 uppercase tracking-wide">{label}</p>
                <p className={`text-xl font-bold ${color}`}>
                  {pct !== undefined ? `${pct.toFixed(1)}%` : formatCurrency(value!, user.currency_code)}
                </p>
              </Card>
            ))}
          </div>

          <AISummaryCard
            summary={aiSummary}
            isLoading={isSummaryLoading}
            onFetch={fetchAiSummary}
            isPro={isPro}
            userName={user.first_name}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Card>
              <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-4">Income vs Expenses</h3>
              <IncomeExpenseBar data={report.monthly_data} currency={user.currency_code} />
            </Card>
            <Card>
              <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-4">Spending by Category</h3>
              <CategoryDonut data={report.category_breakdown} currency={user.currency_code} />
            </Card>
          </div>

          <Card>
            <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-4">Top Spending Categories</h3>
            <TopCategoriesList categories={report.top_categories} currency={user.currency_code} />
          </Card>
        </div>
      ) : (
        <div className="text-center py-16 text-[var(--text-muted)]">No report data available yet</div>
      )}
    </div>
  );
}
