"use client";
import ProgressBar from "@/components/ui/ProgressBar";
import type { LeaderboardEntry } from "@/types/community";

interface LeaderboardRowProps {
  entry: LeaderboardEntry;
}

const RANK_STYLES: Record<number, { bg: string; text: string }> = {
  1: { bg: "bg-mg-gold/20", text: "text-mg-gold" },
  2: { bg: "bg-gray-400/20", text: "text-gray-400" },
  3: { bg: "bg-orange-400/20", text: "text-orange-400" },
};

export default function LeaderboardRow({ entry }: LeaderboardRowProps) {
  const rankStyle = RANK_STYLES[entry.rank] || { bg: "bg-[var(--border)]", text: "text-[var(--text-muted)]" };

  return (
    <div className="flex items-center gap-3 p-3 rounded-card hover:bg-[var(--bg-card-hover)] transition-colors">
      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${rankStyle.bg} ${rankStyle.text}`}>
        {entry.rank}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium text-[var(--text-primary)]">{entry.display_name}</span>
          <span className="text-sm font-bold text-mg-gold">{entry.goal_completion_percentage.toFixed(0)}%</span>
        </div>
        <ProgressBar value={entry.goal_completion_percentage} color="gold" size="sm" />
        <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Goal completion rate</p>
      </div>
    </div>
  );
}
