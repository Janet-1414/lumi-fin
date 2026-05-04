"use client";
import { Users } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import ProgressBar from "@/components/ui/ProgressBar";

interface GroupChallengeCardProps {
  title: string;
  description: string;
  participantsCount: number;
  completionPercentage: number;
  daysLeft: number;
  onJoin: () => void;
  isPro: boolean;
}

export default function GroupChallengeCard({ title, description, participantsCount, completionPercentage, daysLeft, onJoin, isPro }: GroupChallengeCardProps) {
  return (
    <Card>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">{title}</h3>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">{description}</p>
        </div>
        <span className="text-xs text-mg-alert font-medium">{daysLeft}d left</span>
      </div>
      <div className="mb-3">
        <div className="flex justify-between mb-1">
          <span className="text-xs text-[var(--text-muted)] flex items-center gap-1"><Users size={11} />{participantsCount} participants</span>
          <span className="text-xs text-mg-gold font-medium">{completionPercentage.toFixed(0)}%</span>
        </div>
        <ProgressBar value={completionPercentage} color="gold" size="sm" />
      </div>
      <Button size="sm" variant="primary" onClick={onJoin} disabled={!isPro} className="w-full">
        {isPro ? "Join Challenge" : "Pro Required"}
      </Button>
    </Card>
  );
}
