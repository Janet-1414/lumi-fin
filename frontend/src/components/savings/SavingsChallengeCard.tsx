"use client";
import { useState, useEffect } from "react";
import { Sparkles, CheckCircle, X, Check } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import ProgressBar from "@/components/ui/ProgressBar";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

interface Challenge {
  title: string;
  description: string;
  duration_days: number;
  target_amount: number | null;
  tips: string[];
}

interface ActiveChallenge extends Challenge {
  accepted_at: string;
  checked_in_dates: string[]; // ISO date strings of days checked in
}

interface SavingsChallengeCardProps {
  isPro: boolean;
  currency: string;
}

const STORAGE_KEY = "lumi_active_challenge";

function loadActiveChallenge(): ActiveChallenge | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    // Ensure checked_in_dates always exists — handles old data gracefully
    if (!Array.isArray(parsed.checked_in_dates)) {
      parsed.checked_in_dates = [];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    }
    return parsed;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

function saveActiveChallenge(challenge: ActiveChallenge) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(challenge));
  } catch {}
}

function getTodayString(): string {
  return new Date().toISOString().split("T")[0];
}

function getDaysElapsed(acceptedAt: string): number {
  const accepted = new Date(acceptedAt);
  const today = new Date();
  return Math.floor((today.getTime() - accepted.getTime()) / (1000 * 60 * 60 * 24));
}

export default function SavingsChallengeCard({ isPro, currency }: SavingsChallengeCardProps) {
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [activeChallenge, setActiveChallenge] = useState<ActiveChallenge | null>(loadActiveChallenge);
  const [isLoading, setIsLoading] = useState(false);

  const today = getTodayString();
  const hasCheckedInToday = activeChallenge?.checked_in_dates.includes(today) ?? false;
  const daysElapsed = activeChallenge ? getDaysElapsed(activeChallenge.accepted_at) : 0;
  const checkedInCount = activeChallenge?.checked_in_dates.length ?? 0;
  const progressPct = activeChallenge
    ? Math.min(100, Math.round((checkedInCount / activeChallenge.duration_days) * 100))
    : 0;
  const daysLeft = activeChallenge ? Math.max(0, activeChallenge.duration_days - daysElapsed) : 0;
  const isComplete = activeChallenge ? checkedInCount >= activeChallenge.duration_days : false;

  useEffect(() => {
    if (activeChallenge && isComplete) {
      toast.success(`You completed "${activeChallenge.title}"! 🎉`, { duration: 6000 });
    }
  }, []);

  const generate = async () => {
    setIsLoading(true);
    try {
      const data = await api.post<Challenge>("/savings/challenges/generate");
      setChallenge(data);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = () => {
    if (!challenge) return;
    const active: ActiveChallenge = {
      ...challenge,
      accepted_at: new Date().toISOString(),
      checked_in_dates: [],
    };
    saveActiveChallenge(active);
    setActiveChallenge(active);
    setChallenge(null);
    toast.success(`Challenge accepted! Check in daily to track your progress 🔥`);
  };

  const handleCheckIn = () => {
    if (!activeChallenge || hasCheckedInToday) return;
    const updated: ActiveChallenge = {
      ...activeChallenge,
      checked_in_dates: [...activeChallenge.checked_in_dates, today],
    };
    saveActiveChallenge(updated);
    setActiveChallenge(updated);
    toast.success("Daily check-in recorded! Keep it up 💪");
  };

  const handleAbandon = () => {
    localStorage.removeItem(STORAGE_KEY);
    setActiveChallenge(null);
    toast("Challenge abandoned. Generate a new one anytime.");
  };

  const handleComplete = () => {
    localStorage.removeItem(STORAGE_KEY);
    setActiveChallenge(null);
    toast.success("Amazing work! Challenge complete 🏆");
  };

  const formatAmount = (amount: number | null) => {
    if (!amount || amount === 0) return "No specific target";
    return `${currency} ${Number(amount).toLocaleString()}`;
  };

  // ── Active challenge tracker
  if (activeChallenge) {
    return (
      <Card glow>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-mg-gold" />
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">Active Challenge</h3>
          </div>
          {!isComplete && (
            <button onClick={handleAbandon} className="text-[var(--text-muted)] hover:text-mg-alert transition-colors" title="Abandon">
              <X size={14} />
            </button>
          )}
        </div>

        {isComplete ? (
          <div className="text-center py-2 space-y-3">
            <CheckCircle size={36} className="text-mg-success mx-auto" />
            <p className="font-semibold text-mg-success text-base">Challenge Complete! 🎉</p>
            <p className="text-xs text-[var(--text-muted)]">You checked in {checkedInCount} days for "{activeChallenge.title}"</p>
            <Button size="sm" variant="primary" className="w-full" onClick={handleComplete}>
              Claim & Start New
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="font-semibold text-mg-gold text-sm">{activeChallenge.title}</p>
            <p className="text-xs text-[var(--text-secondary)]">{activeChallenge.description}</p>

            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-xs text-[var(--text-muted)]">
                  {checkedInCount} of {activeChallenge.duration_days} days checked in
                </span>
                <span className="text-xs font-semibold text-mg-gold">{progressPct}%</span>
              </div>
              <ProgressBar value={progressPct} color="gold" size="md" />
              <p className="text-xs text-[var(--text-muted)] mt-1">
                {daysLeft === 0 ? "Last day today!" : `${daysLeft} day${daysLeft !== 1 ? "s" : ""} remaining`}
                {activeChallenge.target_amount ? ` · ${formatAmount(activeChallenge.target_amount)}` : ""}
              </p>
            </div>

            {/* Daily check-in button */}
            <button
              onClick={handleCheckIn}
              disabled={hasCheckedInToday}
              className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-card text-sm font-semibold transition-all ${
                hasCheckedInToday
                  ? "bg-mg-success/20 text-mg-success border border-mg-success/30 cursor-default"
                  : "bg-mg-gold text-mg-bg hover:bg-yellow-400 active:scale-95"
              }`}
            >
              <Check size={16} />
              {hasCheckedInToday ? "Checked in today ✓" : "Check in for today"}
            </button>

            {activeChallenge.tips?.length > 0 && (
              <div className="space-y-1 pt-1 border-t border-[var(--border)]">
                <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">Tips</p>
                {activeChallenge.tips.map((tip, i) => (
                  <p key={i} className="text-xs text-[var(--text-secondary)]">· {tip}</p>
                ))}
              </div>
            )}
          </div>
        )}
      </Card>
    );
  }

  // ── Generated challenge pending accept/skip
  if (challenge) {
    return (
      <Card glow>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={18} className="text-mg-gold" />
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">AI Savings Challenge</h3>
        </div>
        <div className="space-y-2">
          <p className="font-semibold text-mg-gold">{challenge.title}</p>
          <p className="text-sm text-[var(--text-secondary)]">{challenge.description}</p>
          <p className="text-xs text-[var(--text-muted)]">
            {challenge.duration_days} days · {formatAmount(challenge.target_amount)}
          </p>
          {challenge.tips?.length > 0 && (
            <div className="space-y-1 pt-1">
              <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">Tips</p>
              {challenge.tips.map((tip, i) => (
                <p key={i} className="text-xs text-[var(--text-secondary)]">· {tip}</p>
              ))}
            </div>
          )}
          <div className="flex gap-2 pt-1">
            <Button size="sm" variant="primary" className="flex-1" onClick={handleAccept}>Accept 🎯</Button>
            <Button size="sm" variant="ghost" className="flex-1" onClick={() => setChallenge(null)}>Skip</Button>
          </div>
          <Button size="sm" variant="secondary" className="w-full text-xs" onClick={generate} isLoading={isLoading}>
            Generate another
          </Button>
        </div>
      </Card>
    );
  }

  // ── Default
  return (
    <Card glow>
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={18} className="text-mg-gold" />
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">AI Savings Challenge</h3>
        {!isPro && (
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-mg-gold/20 text-mg-gold border border-mg-gold/30">PRO</span>
        )}
      </div>
      <div className="text-center py-4">
        <p className="text-sm text-[var(--text-muted)] mb-3">
          Let Lumi AI generate a personalised savings challenge based on your spending habits
        </p>
        <Button size="sm" variant="primary" onClick={generate} isLoading={isLoading} disabled={!isPro}>
          Generate Challenge
        </Button>
      </div>
    </Card>
  );
}
