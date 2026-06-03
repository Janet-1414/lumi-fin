"use client";
import { useState, useEffect } from "react";
import { useUser } from "@/hooks/useUser";
import { api } from "@/lib/api";
import Card from "@/components/ui/Card";
import Spinner from "@/components/ui/Spinner";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import { TrendingUp, TrendingDown, Wallet, ChevronDown } from "lucide-react";
import type { ReportData } from "@/types/reports";
import { clsx } from "clsx";

const COLORS = ["#FAC775", "#1D9E75", "#D85A30", "#6366f1", "#ec4899", "#14b8a6"];

const PERIOD_OPTIONS = [
  { label: "This Month", value: "month" },
  { label: "Last Month", value: "last_month" },
  { label: "This Year", value: "year" },
  { label: "All Time", value: "all_time" },
];

function formatCategory(cat: string): string {
  return cat
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function getMonthOptions() {
  const options = [];
  const now = new Date();
  for (let i = 1; i <= 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("en-UG", { month: "long", year: "numeric" });
    options.push({ label, value });
  }
  return options;
}

export default function ReportsPage() {
  const user = useUser();
  const [period, setPeriod] = useState("month");
  const [report, setReport] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const isPro = user?.subscription_tier === "pro";
  const currency = user?.currency_code || "UGX";
  const monthOptions = getMonthOptions();
  const allPeriodOptions = [...PERIOD_OPTIONS, ...monthOptions];

  useEffect(() => {
    const fetchReport = async () => {
      setIsLoading(true);
      setAiSummary(null);
      try {
        const data = await api.get<ReportData>("/reports", { period });
        setReport(data);
      } catch {}
      finally { setIsLoading(false); }
    };
    fetchReport();
  }, [period]);

  const fetchAiSummary = async () => {
    setIsAiLoading(true);
    try {
      const data = await api.get<{ summary: string }>("/reports/ai-summary", { period });
      setAiSummary(data.summary);
    } catch {}
    finally { setIsAiLoading(false); }
  };

  const selectedLabel = allPeriodOptions.find((o) => o.value === period)?.label || "This Month";

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Reports</h1>

        <div className="relative">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="appearance-none bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-primary)] text-sm rounded-card px-4 py-2 pr-8 focus:outline-none focus:border-mg-gold cursor-pointer"
          >
            <optgroup label="Quick Select">
              {PERIOD_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </optgroup>
            <optgroup label="Previous Months">
              {monthOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </optgroup>
          </select>
          <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : !report ? (
        <p className="text-center text-[var(--text-muted)] py-16">Could not load report.</p>
      ) : (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp size={16} className="text-mg-success" />
                <p className="text-xs text-[var(--text-muted)] uppercase tracking-wide">Income</p>
              </div>
              <p className="text-2xl font-bold text-mg-success">{currency} {report.total_income.toLocaleString()}</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">{selectedLabel}</p>
            </Card>
            <Card>
              <div className="flex items-center gap-2 mb-1">
                <TrendingDown size={16} className="text-mg-alert" />
                <p className="text-xs text-[var(--text-muted)] uppercase tracking-wide">Expenses</p>
              </div>
              <p className="text-2xl font-bold text-mg-alert">{currency} {report.total_expenses.toLocaleString()}</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">{selectedLabel}</p>
            </Card>
            <Card>
              <div className="flex items-center gap-2 mb-1">
                <Wallet size={16} className="text-mg-gold" />
                <p className="text-xs text-[var(--text-muted)] uppercase tracking-wide">Net Balance</p>
              </div>
              <p className={clsx("text-2xl font-bold", report.net_balance >= 0 ? "text-mg-success" : "text-mg-alert")}>
                {currency} {report.net_balance.toLocaleString()}
              </p>
              <p className="text-xs text-[var(--text-muted)] mt-1">Savings rate: {report.savings_rate}%</p>
            </Card>
          </div>

          {report.monthly_data?.length > 0 && (
            <Card>
              <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Income vs Expenses</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={report.monthly_data}>
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--text-muted)" }} />
                  <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }} />
                  <Tooltip
                    formatter={(v: number) => `${currency} ${v.toLocaleString()}`}
                    contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8 }}
                  />
                  <Bar dataKey="income" fill="#1D9E75" radius={[4, 4, 0, 0]} name="Income" />
                  <Bar dataKey="expenses" fill="#D85A30" radius={[4, 4, 0, 0]} name="Expenses" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          )}

          {report.category_breakdown?.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card>
                <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Spending by Category</h3>
              <ResponsiveContainer width="100%" height={220}>
  <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
    <Pie
      data={report.category_breakdown.map((c) => ({ ...c, category: formatCategory(c.category) }))}
      dataKey="amount"
      nameKey="category"
      cx="50%"
      cy="45%"
      outerRadius={75}
      label={false}
    >
      {report.category_breakdown.map((_, i) => (
        <Cell key={i} fill={COLORS[i % COLORS.length]} />
      ))}
    </Pie>
    <Tooltip
      formatter={(v: number) => [`${currency} ${v.toLocaleString()}`, "Amount"]}
      contentStyle={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: 8,
        color: "var(--text-primary)",
        fontSize: 12,
      }}
      itemStyle={{ color: "var(--text-primary)" }}
      labelStyle={{ color: "var(--text-primary)", fontWeight: 600, marginBottom: 4 }}
    />
    <Legend
      verticalAlign="bottom"
      height={40}
      iconType="circle"
      iconSize={8}
      formatter={(value) => (
        <span style={{ color: "var(--text-secondary)", fontSize: 11, marginLeft: 4 }}>{value}</span>
      )}
    />
  </PieChart>
</ResponsiveContainer>
              </Card>
              <Card>
                <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Top Categories</h3>
                <div className="space-y-3">
                  {report.top_categories?.map((cat, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-[var(--text-primary)]">{formatCategory(cat.category)}</span>
                        <span className="text-[var(--text-muted)]">{currency} {cat.amount.toLocaleString()} · {cat.percentage}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-[var(--border)]">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${cat.percentage}%`, background: COLORS[i % COLORS.length] }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {isPro && (
            <Card glow>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-mg-gold">✨ AI Financial Summary</p>
                {!aiSummary && (
                  <button
                    onClick={fetchAiSummary}
                    disabled={isAiLoading}
                    className="text-xs text-mg-gold border border-mg-gold/40 px-3 py-1.5 rounded-card hover:bg-mg-gold/10 transition-all disabled:opacity-50"
                  >
                    {isAiLoading ? "Generating..." : "Generate Summary"}
                  </button>
                )}
              </div>
              {aiSummary ? (
                <p className="text-sm text-[var(--text-primary)] leading-relaxed">{aiSummary}</p>
              ) : (
                <p className="text-xs text-[var(--text-muted)]">
                  Get a personalised AI analysis of your {selectedLabel.toLowerCase()} finances.
                </p>
              )}
            </Card>
          )}
        </div>
      )}
    </div>
  );
}