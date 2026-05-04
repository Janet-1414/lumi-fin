"use client";
import Card from "@/components/ui/Card";
import type { Badge } from "@/types/savings";

const BADGE_ICONS: Record<string, string> = {
  first_save: "🌱", week_streak: "🔥", month_streak: "⚡", goal_crusher: "🏆",
  budget_master: "👑", community_star: "⭐", investment_ready: "💎",
  money_mentor: "🎓", savings_champion: "🥇", discipline_king: "👊",
};

const BADGE_COLORS: Record<string, string> = {
  bronze: "border-orange-400/50 bg-orange-400/10",
  silver: "border-gray-400/50 bg-gray-400/10",
  gold: "border-mg-gold/50 bg-mg-gold/10",
  diamond: "border-cyan-400/50 bg-cyan-400/10",
};

export default function BadgeGrid({ badges }: { badges: Badge[] }) {
  return (
    <Card>
      <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Your Badges</h3>
      {badges.length === 0 ? (
        <p className="text-sm text-[var(--text-muted)] text-center py-4">Start saving to earn badges! 🎯</p>
      ) : (
        <div className="grid grid-cols-4 gap-3">
          {badges.map((badge) => (
            <div key={badge.id} className={`aspect-square rounded-card border flex flex-col items-center justify-center gap-1 p-2 ${BADGE_COLORS[badge.badge_type]}`} title={badge.description}>
              <span className="text-2xl">{BADGE_ICONS[badge.name] || "🏅"}</span>
              <p className="text-[9px] text-center text-[var(--text-muted)] leading-tight">{badge.name.replace("_", " ")}</p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
