"use client";
import { Zap } from "lucide-react";
import type { CommunityPulse } from "@/types/community";

interface WeeklyPulseBannerProps {
  pulse: CommunityPulse;
}

export default function WeeklyPulseBanner({ pulse }: WeeklyPulseBannerProps) {
  return (
    <div className="p-4 rounded-card bg-mg-gold/10 border border-mg-gold/30 mb-5">
      <div className="flex items-center gap-2 mb-2">
        <Zap size={16} className="text-mg-gold" fill="currentColor" />
        <span className="text-xs font-bold text-mg-gold uppercase tracking-wide">Weekly Community Pulse</span>
      </div>
      <p className="text-sm text-[var(--text-primary)] leading-relaxed mb-3">{pulse.ai_summary}</p>
      <div className="flex gap-4">
        <div className="text-center">
          <p className="text-lg font-black text-mg-gold">{pulse.total_savers_this_week}</p>
          <p className="text-[10px] text-[var(--text-muted)] uppercase">Active Savers</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-black text-mg-success">{pulse.total_goals_achieved}</p>
          <p className="text-[10px] text-[var(--text-muted)] uppercase">Goals Hit</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-black text-[var(--text-primary)]">{pulse.average_savings_rate.toFixed(0)}%</p>
          <p className="text-[10px] text-[var(--text-muted)] uppercase">Avg. Rate</p>
        </div>
      </div>
    </div>
  );
}
