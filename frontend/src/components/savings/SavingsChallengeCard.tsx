"use client";
import { useState, useEffect } from "react";
import { Sparkles, CheckCircle, X, Check, AlertTriangle } from "lucide-react";
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
  difficulty?: string;
}

interface ActiveChallenge extends Challenge {
  accepted_at: string;
  checked_in_dates: string[];
}

interface SavingsChallengeCardProps {
  isPro: boolean;
  currency: string;
}

const STORAGE_KEY = "lumi_active_challenge";

const DIFFICULTY_COLORS: Record<string, string> = {
  Easy: "text-mg-success bg-mg-success/10 border-mg-success/30",
  Medium: "text-mg-gold bg-mg-gold/10 border-mg-gold/30",
  Ambitious: "text-mg-alert bg-mg-alert/10 border-mg-alert/30",
};

function loadActiveChallenge(): ActiveChallenge | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored);
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

function getTodayString(): string {
  return new Date().toISOString().split("T")[0];
}

function getDaysElapsed(acceptedAt: string): number {
  const accepted = new Date(acceptedAt);
  const today = new Date();
  return Math.floor((today.getTime() - accepted.getTime()) / (1000 * 60 * 60 * 24));
}

function getMissedConsecutiveDays(challenge: ActiveChallenge): number {
  const daysElapsed = getDaysElapsed(challenge.accepted_at);
  if (daysElapsed === 0) return 0;
  let consecutive = 0;
  for (let i = daysElapsed; i >= 1; i--) {
    const d = new Date(challenge.accepted_at);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split("T")[0];
    if (!challenge.checked_in_dates.includes(dateStr)) {
      consecutive++;
    } else {
      break;
    }
  }
  return consecutive;
}

export default function SavingsChallengeCard({ isPro, currency }: SavingsChallengeCardProps) {
  const [options, setOptions] = useState<Challenge[]>([]);
  const [activeChallenge, setActiveChallenge] = useState<ActiveChallenge | null>(loadActiveChallenge);
  const [isLoading, setIsLoading] = useState(false);
  const [view, setView] = useState<"default" | "options" | "active" | "complete">("default");

  const today = getTodayString();
  const hasCheckedInToday = activeChallenge?.checked_in_dates.includes(today) ?? false;
  const daysElapsed = activeChallenge ? getDaysElapsed(activeChallenge.accepted_at) : 0;
  const checkedInCount = activeChallenge?.checked_in_dates.length ?? 0;
  const progressPct = activeChallenge
    ? Math.min(100, Math.round((checkedInCount / activeChallenge.duration_days) * 100))
    : 0;
  const daysLeft = activeChallenge ? Math.max(0, activeChallenge.duration_days - daysElapsed) : 0;
  const isComplete = activeChallenge ? checkedInCount >= activeChallenge.duration_days : false;
  const missedDays = activeChallenge ? getMissedConsecutiveDays(activeChallenge) : 0;

  useEffect(() => {
    if (activeChallenge) {
      if (isComplete) {
        setView("complete");
      } else if (missedDays >= 2) {
        toast.error(`Challenge abandoned — you missed ${missedDays} days in a row. Generate a new one!`, { duration: 6000 });
        localStorage.removeItem(STORAGE_KEY);
        setActiveChallenge(null);
        setView("default");
      } else {
        setView("active");
      }
    } else {
      setView("default");
    }
  }, []);

  const generate = async () => {
    setIsLoading(true);
    setOptions([]);
    try {
      const data = await api.post<Challenge[]>("/savings/challenges/generate");
      if (Array.isArray(data) && data.length > 0) {
        setOptions(data);
        setView("options");
      } else {
        toast.error("Could not generate challenges. Try again.");
      }
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = (challenge: Challenge) => {
    const active: ActiveChallenge = {
      ...challenge,
      accepted_at: new Date().toISOString(),
      checked_in_dates: [],
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(active));
    setActiveChallenge(active);
    setOptions([]);
    setView("active");
    toast.success(`Challenge accepted! Check in daily to keep it alive 🔥`);
  };

  const handleCheckIn = () => {
    if (!activeChallenge || hasCheckedInToday) return;
    const updated: ActiveChallenge = {
      ...activeChallenge,
      checked_in_dates: [...activeChallenge.checked_in_dates, today],
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setActiveChallenge(updated);
    const newCount = updated.checked_in_dates.length;
    if (newCount >= updated.duration_days) setView("complete");
    toast.success("Day checked in! Keep going 💪");
  };

  const handleAbandon = () => {
    localStorage.removeItem(STORAGE_KEY);
    setActiveChallenge(null);
    setView("default");
    toast("Challenge abandoned. Generate a new one anytime.");
  };

  // After completing — auto-generate new options
  const handleClaim = async () => {
    localStorage.removeItem(STORAGE_KEY);
    setActiveChallenge(null);
    toast.success("🏆 Challenge complete! Here are your next options.");
    await generate(); // automatically fetch 3 new challenges
  };

  const formatAmount = (amount: number | null) => {
    if (!amount || amount === 0) return null;
    return `${currency} ${Number(amount).toLocaleString()}`;
  };

  // ── Complete view
  if (view === "complete" && activeChallenge) {
    return (
      <Card glow>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={18} className="text-mg-gold" />
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Challenge Complete!</h3>
        </div>
        <div className="text-center py-2 space-y-3">
          <CheckCircle size={36} className="text-mg-success mx-auto" />
          <p className="font-semibold text-mg-success text-base">🎉 You did it!</p>
          <p className="text-xs text-[var(--text-muted)]">
            You completed "{activeChallenge.title}" with {checkedInCount} check-ins!
          </p>
          <Button size="sm" variant="primary" className="w-full" onClick={handleClaim} isLoading={isLoading}>
            Claim & Pick Next Challenge
          </Button>
        </div>
      </Card>
    );
  }

  // ── Active challenge tracker
  if (view === "active" && activeChallenge) {
    return (
      <Card glow>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-mg-gold" />
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">Active Challenge</h3>
          </div>
          <button onClick={handleAbandon} className="text-[var(--text-muted)] hover:text-mg-alert transition-colors" title="Abandon">
            <X size={14} />
          </button>
        </div>
        <div className="space-y-3">
          {missedDays === 1 && !hasCheckedInToday && (
            <div className="flex items-center gap-2 p-2 rounded-card bg-mg-alert/10 border border-mg-alert/30">
              <AlertTriangle size={14} className="text-mg-alert flex-shrink-0" />
              <p className="text-xs text-mg-alert">⚠️ You missed yesterday! Miss one more day and this challenge auto-abandons.</p>
            </div>
          )}
          <p className="font-semibold text-mg-gold text-sm">{activeChallenge.title}</p>
          <p className="text-xs text-[var(--text-secondary)]">{activeChallenge.description}</p>
          <div>
            <div className="flex justify-between mb-1.5">
              <span className="text-xs text-[var(--text-muted)]">{checkedInCount} of {activeChallenge.duration_days} days checked in</span>
              <span className="text-xs font-semibold text-mg-gold">{progressPct}%</span>
            </div>
            <ProgressBar value={progressPct} color="gold" size="md" />
            <p className="text-xs text-[var(--text-muted)] mt-1">
              {daysLeft === 0 ? "Last day today!" : `${daysLeft} day${daysLeft !== 1 ? "s" : ""} remaining`}
              {formatAmount(activeChallenge.target_amount) ? ` · ${formatAmount(activeChallenge.target_amount)}` : ""}
            </p>
          </div>
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
      </Card>
    );
  }

  // ── 3 options to pick from
  if (view === "options" && options.length > 0) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-mg-gold" />
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">Pick a Challenge</h3>
          </div>
          <button onClick={() => setView("default")} className="text-xs text-[var(--text-muted)] hover:text-mg-alert">Cancel</button>
        </div>
        {options.map((challenge, i) => (
          <Card key={i} className="border border-[var(--border)] hover:border-mg-gold/40 transition-all">
            <div className="flex items-start justify-between mb-2">
              <p className="font-semibold text-[var(--text-primary)] text-sm flex-1 pr-2">{challenge.title}</p>
              {challenge.difficulty && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0 ${DIFFICULTY_COLORS[challenge.difficulty] || DIFFICULTY_COLORS.Easy}`}>
                  {challenge.difficulty}
                </span>
              )}
            </div>
            <p className="text-xs text-[var(--text-secondary)] mb-2 leading-relaxed">{challenge.description}</p>
            <p className="text-xs text-[var(--text-muted)] mb-3">
              {challenge.duration_days} days{formatAmount(challenge.target_amount) ? ` · Target: ${formatAmount(challenge.target_amount)}` : ""}
            </p>
            {challenge.tips?.slice(0, 2).map((tip, j) => (
              <p key={j} className="text-xs text-[var(--text-muted)] mb-0.5">· {tip}</p>
            ))}
            <Button size="sm" variant="primary" className="w-full mt-2" onClick={() => handleAccept(challenge)}>
              Accept This Challenge 🎯
            </Button>
          </Card>
        ))}
        <Button size="sm" variant="secondary" className="w-full" onClick={generate} isLoading={isLoading}>
          Generate 3 different options
        </Button>
      </div>
    );
  }

  // ── Default — no challenge yet
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
        <p className="text-sm text-[var(--text-muted)] mb-1">Get 3 personalised challenge options based on your spending habits</p>
        <p className="text-xs text-[var(--text-muted)] mb-4">Easy · Medium · Ambitious — pick the one that fits your life</p>
        <Button size="sm" variant="primary" onClick={generate} isLoading={isLoading} disabled={!isPro}>
          Generate 3 Challenges
        </Button>
      </div>
    </Card>
  );
}
