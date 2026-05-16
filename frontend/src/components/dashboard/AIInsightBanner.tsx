"use client";
import { useState, useEffect } from "react";
import { Zap, Lock, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useUser } from "@/hooks/useUser";
import { api } from "@/lib/api";

const INSIGHT_CACHE_KEY = "lumi_dashboard_insight";
const INSIGHT_CACHE_TTL = 3 * 60 * 60 * 1000; // 3 hours

function getCachedInsight(): string | null {
  try {
    const raw = sessionStorage.getItem(INSIGHT_CACHE_KEY);
    if (!raw) return null;
    const { insight, timestamp } = JSON.parse(raw);
    if (Date.now() - timestamp > INSIGHT_CACHE_TTL) {
      sessionStorage.removeItem(INSIGHT_CACHE_KEY);
      return null;
    }
    return insight;
  } catch {
    return null;
  }
}

function cacheInsight(insight: string) {
  try {
    sessionStorage.setItem(
      INSIGHT_CACHE_KEY,
      JSON.stringify({ insight, timestamp: Date.now() })
    );
  } catch {}
}

export default function AIInsightBanner() {
  const user = useUser();
  const isPro = user?.subscription_tier === "pro";
  const [insight, setInsight] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isPro) return;
    const cached = getCachedInsight();
    if (cached) { setInsight(cached); return; }
    fetchInsight();
  }, [isPro]);

  const fetchInsight = async () => {
    setIsLoading(true);
    try {
      const [summary, report] = await Promise.all([
        api.get<any>("/transactions/summary", { period: "month" }),
        api.get<any>("/reports", { period: "month" }),
      ]);

      const income = summary?.total_income || 0;
      const expenses = summary?.total_expenses || 0;
      const balance = summary?.balance || 0;
      const savingsRate = report?.savings_rate || 0;
      const topCat = report?.top_categories?.[0]?.category || "general";
      const topAmount = report?.top_categories?.[0]?.amount || 0;
      const currency = user?.currency_code || "UGX";
      const name = user?.first_name || "there";

      // Build a varied insight using real data — pick one of several angles
      // Use actual numbers so each insight is genuinely different
      const seed = Math.floor(Date.now() / (1000 * 60)) % 8; // changes every minute

      const insights = [
        income > 0
          ? `${name}, you've saved ${savingsRate.toFixed(1)}% of your income this month. ${savingsRate >= 20 ? "That's above the recommended 20% — excellent discipline! Keep this up." : savingsRate >= 10 ? "You're making progress. Push to 20% by cutting one non-essential expense this week." : "There's room to grow. Try the 50/30/20 rule — 50% needs, 30% wants, 20% savings."}`
          : `${name}, start logging your income so Lumi can calculate your savings rate and give you personalised insights.`,

        expenses > 0
          ? `${name}, your biggest expense this month is ${topCat.replace("_", " ")} at ${currency} ${topAmount.toLocaleString()}. ${topAmount > income * 0.3 ? "That's over 30% of your income in one category — worth reviewing." : "That looks manageable. Keep tracking to stay on top of it."}`
          : `${name}, no expenses logged yet. Start tracking every purchase — even small ones add up to surprising totals by month end.`,

        balance > 0
          ? `${name}, you have ${currency} ${balance.toLocaleString()} left this month after expenses. Consider moving part of it directly into your savings goal before you spend it.`
          : `${name}, your expenses have exceeded your income by ${currency} ${Math.abs(balance).toLocaleString()} this month. Let's identify one category you can cut next month.`,

        income > 0
          ? `${name}, if you save an extra ${currency} ${Math.round(income * 0.05).toLocaleString()} this month (just 5% more), that compounds into significant wealth over time. Small increases make a big difference.`
          : `${name}, tracking your income and expenses consistently is the first step to financial clarity. Every entry counts.`,

        expenses > 0
          ? `${name}, you've logged ${currency} ${expenses.toLocaleString()} in expenses this month. ${expenses < income * 0.7 ? "You're spending well within your means — great financial discipline." : "Your spending is high relative to income. Review your top 3 categories."}`
          : `${name}, the best financial habit is logging every transaction the moment it happens. Try it today.`,

        `${name}, East African financial tip: a SACCO membership can help you save consistently and access low-interest loans when you need them. Ask your employer or community if there's one you can join.`,

        `${name}, the MTN and Airtel withdrawal fee trap is real. Withdrawing ${currency} 100,000 once costs far less than withdrawing ${currency} 10,000 ten times. Plan your withdrawals in bulk this week.`,

        income > 0 && savingsRate > 0
          ? `${name}, at your current savings rate of ${savingsRate.toFixed(1)}%, you'd save ${currency} ${Math.round(income * savingsRate / 100 * 12).toLocaleString()} in a year. ${savingsRate >= 20 ? "That's a strong foundation for your goals." : "Imagine what 20% could look like."}`
          : `${name}, even saving 5% of your income consistently builds a habit that grows over time. Start small, stay consistent.`,
      ];

      const text = insights[seed] || insights[0];
      setInsight(text);
      cacheInsight(text);
    } catch {
      setInsight(`${user?.first_name}, keep logging your transactions — Lumi needs your data to generate personalised insights.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    sessionStorage.removeItem(INSIGHT_CACHE_KEY);
    setInsight(null);
    fetchInsight();
  };

  if (!isPro) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-card bg-mg-gold/10 border border-mg-gold/30">
        <Lock size={18} className="text-mg-gold flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-mg-gold">AI Insights — Lumi Pro</p>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Unlock personalised daily AI insights based on your real spending data
          </p>
        </div>
        <Link
          href="/subscription"
          className="text-xs font-semibold text-mg-gold border border-mg-gold/40 px-3 py-1.5 rounded-card hover:bg-mg-gold/20 transition-all flex-shrink-0"
        >
          Upgrade
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 p-4 rounded-card bg-mg-gold/10 border border-mg-gold/30">
      <div className="w-8 h-8 rounded-lg bg-mg-gold/20 flex items-center justify-center flex-shrink-0">
        <Zap size={16} className="text-mg-gold" fill="currentColor" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-mg-gold uppercase tracking-wide mb-1">
          Lumi AI Insight
        </p>
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full border-2 border-mg-gold/30 border-t-mg-gold animate-spin" />
            <p className="text-xs text-[var(--text-muted)]">Analysing your finances...</p>
          </div>
        ) : (
          <p className="text-sm text-[var(--text-primary)] leading-relaxed">{insight}</p>
        )}
      </div>
      {!isLoading && insight && (
        <button
          onClick={handleRefresh}
          className="text-[var(--text-muted)] hover:text-mg-gold transition-colors flex-shrink-0 mt-0.5"
          title="Get a new insight"
        >
          <RefreshCw size={14} />
        </button>
      )}
    </div>
  );
}
