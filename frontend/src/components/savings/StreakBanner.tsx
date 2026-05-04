"use client";
import type { Streak } from "@/types/savings";

interface StreakBannerProps {
  streak: Streak;
  userName: string;
}

function FireIcon({ size = 24 }: { size?: number }) {
  return (
    <span className="fire-animation inline-block" style={{ fontSize: size }}>🔥</span>
  );
}

export default function StreakBanner({ streak, userName }: StreakBannerProps) {
  return (
    <div className="p-4 rounded-card bg-gradient-to-r from-mg-alert/20 to-mg-gold/20 border border-mg-gold/30 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FireIcon size={32} />
          <div>
            <p className="text-base font-bold text-[var(--text-primary)]">
              {streak.current_streak > 0
                ? `${streak.current_streak}-day streak, ${userName}! 🎉`
                : `Start your streak today, ${userName}!`}
            </p>
            <p className="text-xs text-[var(--text-muted)]">
              Longest: {streak.longest_streak} days · Total active: {streak.total_days_active} days
            </p>
          </div>
        </div>
        <div className="text-center">
          <p className="text-2xl font-black text-mg-gold">{streak.current_streak}</p>
          <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wide">days</p>
        </div>
      </div>
    </div>
  );
}
