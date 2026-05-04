"use client";
import { clsx } from "clsx";

const TABS = ["Feed", "Challenges", "Leaderboard", "Tips"] as const;
export type CommunityTab = typeof TABS[number];

interface CommunityTabsProps {
  active: CommunityTab;
  onChange: (tab: CommunityTab) => void;
}

export default function CommunityTabs({ active, onChange }: CommunityTabsProps) {
  return (
    <div className="flex gap-1 border-b border-[var(--border)] overflow-x-auto">
      {TABS.map((tab) => (
        <button
          key={tab} onClick={() => onChange(tab)}
          className={clsx("px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-all -mb-px",
            active === tab ? "border-mg-gold text-mg-gold" : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          )}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
