"use client";
import { Check } from "lucide-react";

const PRO_HIGHLIGHTS = [
  "All 11 AI features fully unlocked",
  "Unlimited transaction logging",
  "Scan receipts & Mobile Money SMS",
  "Chat with your finances in real-time",
  "Personalised savings coach & challenges",
  "Investment hints for East Africa",
  "Streaks, badges & leaderboard",
  "Full community participation",
  "Priority support",
];

export default function FeatureList() {
  return (
    <ul className="space-y-2.5">
      {PRO_HIGHLIGHTS.map((f) => (
        <li key={f} className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-full bg-mg-success/20 flex items-center justify-center flex-shrink-0">
            <Check size={12} className="text-mg-success" />
          </div>
          <span className="text-sm text-[var(--text-primary)]">{f}</span>
        </li>
      ))}
    </ul>
  );
}
