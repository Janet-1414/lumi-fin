"use client";
import { useState, useEffect } from "react";
import { Users, Clock, CheckCircle, Check } from "lucide-react";
import Card from "@/components/ui/Card";
import ProgressBar from "@/components/ui/ProgressBar";
import Button from "@/components/ui/Button";

interface GroupChallengeCardProps {
  id: string;
  title: string;
  description: string;
  participantsCount: number;
  completionPercentage: number;
  daysLeft: number;
  difficulty?: string;
  isJoined?: boolean;
  onJoin: () => void;
  isPro: boolean;
}

const DIFFICULTY_COLORS: Record<string, string> = {
  Easy: "text-mg-success bg-mg-success/10 border-mg-success/30",
  Medium: "text-mg-gold bg-mg-gold/10 border-mg-gold/30",
  Ambitious: "text-mg-alert bg-mg-alert/10 border-mg-alert/30",
};

const ACTIVE_CHALLENGE_KEY = "lumi_active_challenge";

function getTodayString(): string {
  const now = new Date();
  // Use local date not UTC — important for EAT timezone (UTC+3)
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getPersonalProgress(challengeId: string): { checkedIn: number; hasCheckedInToday: boolean } | null {
  try {
    const stored = localStorage.getItem(ACTIVE_CHALLENGE_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    // Only return progress if this is the same challenge
    if (parsed.community_id !== challengeId) return null;
    const checkedIn = Array.isArray(parsed.checked_in_dates) ? parsed.checked_in_dates.length : 0;
    const hasCheckedInToday = Array.isArray(parsed.checked_in_dates) && parsed.checked_in_dates.includes(getTodayString());
    return { checkedIn, hasCheckedInToday };
  } catch {
    return null;
  }
}

function checkInToday(challengeId: string) {
  try {
    const stored = localStorage.getItem(ACTIVE_CHALLENGE_KEY);
    if (!stored) return;
    const parsed = JSON.parse(stored);
    if (parsed.community_id !== challengeId) return;
    const today = getTodayString();
    if (!Array.isArray(parsed.checked_in_dates)) parsed.checked_in_dates = [];
    if (!parsed.checked_in_dates.includes(today)) {
      parsed.checked_in_dates.push(today);
      localStorage.setItem(ACTIVE_CHALLENGE_KEY, JSON.stringify(parsed));
    }
  } catch {}
}

export default function GroupChallengeCard({
  id, title, description, participantsCount, completionPercentage,
  daysLeft, difficulty, isJoined, onJoin, isPro,
}: GroupChallengeCardProps) {
  const [progress, setProgress] = useState(() => getPersonalProgress(id));

  // Refresh progress when joining
  useEffect(() => {
    if (isJoined) setProgress(getPersonalProgress(id));
  }, [isJoined, id]);

  const handleCheckIn = () => {
    checkInToday(id);
    setProgress(getPersonalProgress(id));
  };

  return (
    <Card>
      <div className="flex items-start justify-between mb-2">
        <p className="font-semibold text-[var(--text-primary)] text-sm flex-1 pr-2">{title}</p>
        {difficulty && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0 ${DIFFICULTY_COLORS[difficulty] || DIFFICULTY_COLORS.Medium}`}>
            {difficulty}
          </span>
        )}
      </div>
      <p className="text-xs text-[var(--text-secondary)] mb-3 leading-relaxed">{description}</p>

      {/* Community progress bar */}
      <div className="space-y-1.5 mb-3">
        <div className="flex justify-between text-xs text-[var(--text-muted)]">
          <span>Community progress</span>
          <span className="font-semibold text-[var(--text-primary)]">{completionPercentage}%</span>
        </div>
        <ProgressBar value={completionPercentage} color="gold" size="sm" />
      </div>

      <div className="flex items-center gap-3 mb-3 text-xs text-[var(--text-muted)]">
        <span className="flex items-center gap-1">
          <Users size={11} />
          {participantsCount.toLocaleString()} joined
        </span>
        <span className="flex items-center gap-1">
          <Clock size={11} />
          {isJoined && progress !== null
            ? `${Math.max(0, daysLeft - progress.checkedIn)} day${Math.max(0, daysLeft - progress.checkedIn) !== 1 ? "s" : ""} left`
            : `${daysLeft} day${daysLeft !== 1 ? "s" : ""} left`}
        </span>
      </div>

      {isJoined && progress !== null ? (
        // ── Joined + tracking view
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 rounded-card bg-mg-success/10 border border-mg-success/20">
            <div className="flex items-center gap-2">
              <CheckCircle size={13} className="text-mg-success flex-shrink-0" />
              <span className="text-xs font-semibold text-mg-success">Joined</span>
            </div>
            <span className="text-xs text-[var(--text-muted)]">
              {progress.checkedIn} day{progress.checkedIn !== 1 ? "s" : ""} checked in
            </span>
          </div>
          <button
            onClick={handleCheckIn}
            disabled={progress.hasCheckedInToday}
            className={`w-full flex items-center justify-center gap-2 py-2 rounded-card text-xs font-semibold transition-all ${
              progress.hasCheckedInToday
                ? "bg-mg-success/10 text-mg-success border border-mg-success/20 cursor-default"
                : "bg-mg-gold text-mg-bg hover:bg-yellow-400 active:scale-95"
            }`}
          >
            <Check size={13} />
            {progress.hasCheckedInToday ? "Checked in today ✓" : "Check in for today"}
          </button>
        </div>
      ) : isJoined ? (
        <div className="flex items-center justify-center gap-2 py-2 rounded-card bg-mg-success/10 border border-mg-success/30 text-xs font-semibold text-mg-success">
          <CheckCircle size={14} />
          Joined — check in daily below
        </div>
      ) : (
        <Button
          size="sm"
          variant={isPro ? "primary" : "secondary"}
          className="w-full"
          onClick={onJoin}
          disabled={!isPro}
        >
          {isPro ? "Join Challenge" : "Pro required"}
        </Button>
      )}
    </Card>
  );
}
