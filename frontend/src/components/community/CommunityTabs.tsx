"use client";

export type CommunityTab = "Feed" | "Leaderboard" | "Challenges";

const TABS: CommunityTab[] = ["Feed", "Leaderboard", "Challenges"];

interface CommunityTabsProps {
  active: CommunityTab;
  onChange: (tab: CommunityTab) => void;
}

export default function CommunityTabs({ active, onChange }: CommunityTabsProps) {
  return (
    <div className="flex gap-1 p-1 rounded-card bg-[var(--bg-secondary)] border border-[var(--border)]">
      {TABS.map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={`flex-1 py-2 rounded-card text-sm font-medium transition-all ${
            active === tab
              ? "bg-[var(--bg-card)] text-mg-gold shadow-sm border border-[var(--border)]"
              : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
