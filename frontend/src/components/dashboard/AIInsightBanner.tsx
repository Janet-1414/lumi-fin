"use client";
import { Zap, Lock } from "lucide-react";
import Link from "next/link";
import { useUser } from "@/hooks/useUser";

interface AIInsightBannerProps {
  insight?: string;
}

export default function AIInsightBanner({ insight }: AIInsightBannerProps) {
  const user = useUser();
  const isPro = user?.subscription_tier === "pro";

  if (!isPro) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-card bg-mg-gold/10 border border-mg-gold/30">
        <Lock size={18} className="text-mg-gold flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-mg-gold">AI Insights — Lumi Pro</p>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">Unlock personalised AI insights for just $1/month</p>
        </div>
        <Link href="/subscription" className="text-xs font-semibold text-mg-gold border border-mg-gold/40 px-3 py-1.5 rounded-card hover:bg-mg-gold/20 transition-all flex-shrink-0">
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
      <div>
        <p className="text-xs font-semibold text-mg-gold uppercase tracking-wide mb-1">Lumi AI Insight</p>
        <p className="text-sm text-[var(--text-primary)] leading-relaxed">
          {insight || `${user?.first_name}, you're doing great! Keep tracking your expenses to get personalised AI insights.`}
        </p>
      </div>
    </div>
  );
}
