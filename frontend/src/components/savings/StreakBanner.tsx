"use client";
import { api } from "@/lib/api";
import type { Streak } from "@/types/savings";

interface StreakBannerProps {
  streak: Streak;
  userName: string;
}

function getCheckedInToday(streak: Streak): boolean {
  if (!streak.last_activity_date) return false;
  const today = new Date().toISOString().split("T")[0];
  const last = new Date(streak.last_activity_date).toISOString().split("T")[0];
  return today === last;
}

export default function StreakBanner({ streak, userName }: StreakBannerProps) {
  const checkedInToday = getCheckedInToday(streak);
  const hasStreak = streak.current_streak > 0;

  return (
    <div className={`p-4 rounded-card mb-6 border ${
      checkedInToday
        ? "bg-gradient-to-r from-mg-alert/20 to-mg-gold/20 border-mg-gold/30"
        : hasStreak
        ? "bg-mg-alert/10 border-mg-alert/40"
        : "bg-[var(--bg-card)] border-[var(--border)]"
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className={`text-3xl ${checkedInToday ? "fire-animation" : "grayscale opacity-50"}`}>
            🔥
          </span>
          <div>
            {checkedInToday ? (
              <>
                <p className="text-base font-bold text-[var(--text-primary)]">
                  {streak.current_streak}-day streak, {userName}! 🎉
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  You've checked in today · Longest: {streak.longest_streak} days
                </p>
              </>
            ) : hasStreak ? (
              <>
                <p className="text-base font-bold text-mg-alert">
                  ⚠️ {userName}, your {streak.current_streak}-day streak is at risk!
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  Add a transaction or update a goal today to keep your streak alive
                </p>
              </>
            ) : (
              <>
                <p className="text-base font-bold text-[var(--text-primary)]">
                  Start your streak today, {userName}!
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  Log a transaction daily to build your saving habit
                </p>
              </>
            )}
          </div>
        </div>
        <div className="text-center flex-shrink-0">
          <p className={`text-2xl font-black ${checkedInToday ? "text-mg-gold" : hasStreak ? "text-mg-alert" : "text-[var(--text-muted)]"}`}>
            {streak.current_streak}
          </p>
          <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wide">days</p>
        </div>
      </div>
    </div>
  );
}
