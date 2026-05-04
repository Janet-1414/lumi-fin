"use client";
import { Check, X } from "lucide-react";

const FEATURES = [
  { label: "Income & expense tracking", free: true, pro: true },
  { label: "Manual transaction entry", free: true, pro: true },
  { label: "Community feed (read-only)", free: true, pro: true },
  { label: "Basic financial reports", free: true, pro: true },
  { label: "Transactions per month", free: "20 max", pro: "Unlimited" },
  { label: "AI Receipt & SMS Scanner", free: false, pro: true },
  { label: "Smart Spending Alerts", free: false, pro: true },
  { label: "Money Personality Profile", free: false, pro: true },
  { label: "Personalised Financial Lessons", free: false, pro: true },
  { label: "AI Savings Coach", free: false, pro: true },
  { label: "AI Savings Challenges", free: false, pro: true },
  { label: "Chat with Your Finances", free: false, pro: true },
  { label: "AI Visual Reports & Summaries", free: false, pro: true },
  { label: "East Africa Investment Hints", free: false, pro: true },
  { label: "Smart Notification Intelligence", free: false, pro: true },
  { label: "Weekly Community Pulse", free: false, pro: true },
  { label: "Community posting & challenges", free: false, pro: true },
  { label: "Streaks, badges & leaderboard", free: false, pro: true },
  { label: "Priority support", free: false, pro: true },
];

function Cell({ value }: { value: boolean | string }) {
  if (value === true) return <Check size={16} className="text-mg-success mx-auto" />;
  if (value === false) return <X size={16} className="text-[var(--text-muted)] mx-auto" />;
  return <span className="text-xs font-medium text-[var(--text-primary)]">{value}</span>;
}

export default function PlanComparisonTable() {
  return (
    <div className="overflow-hidden rounded-card border border-[var(--border)]">
      <div className="grid grid-cols-3 text-center text-sm font-semibold border-b border-[var(--border)]">
        <div className="py-3 px-4 text-left text-[var(--text-secondary)]">Feature</div>
        <div className="py-3 px-4 text-[var(--text-muted)] border-l border-[var(--border)]">Free</div>
        <div className="py-3 px-4 text-mg-gold border-l border-[var(--border)] bg-mg-gold/5">Pro ✦</div>
      </div>
      {FEATURES.map((f, i) => (
        <div key={f.label} className={`grid grid-cols-3 text-center items-center ${i % 2 === 0 ? "bg-[var(--bg-card)]" : ""}`}>
          <div className="py-2.5 px-4 text-left text-xs text-[var(--text-secondary)]">{f.label}</div>
          <div className="py-2.5 px-4 border-l border-[var(--border)] flex justify-center"><Cell value={f.free} /></div>
          <div className="py-2.5 px-4 border-l border-[var(--border)] bg-mg-gold/5 flex justify-center"><Cell value={f.pro} /></div>
        </div>
      ))}
    </div>
  );
}
