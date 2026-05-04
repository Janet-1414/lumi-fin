"use client";
import { Brain } from "lucide-react";
import Card from "@/components/ui/Card";

interface MoneyPersonalityBadgeProps {
  personality: string | null;
  isPro: boolean;
}

export default function MoneyPersonalityBadge({ personality, isPro }: MoneyPersonalityBadgeProps) {
  const PERSONALITY_ICONS: Record<string, string> = {
    "The Saver": "🐝",
    "The Spender": "🌊",
    "The Investor": "🦅",
    "The Avoider": "🦉",
    "The Planner": "🗺️",
    "The Hustler": "🚀",
  };

  return (
    <Card>
      <div className="flex items-center gap-2 mb-3">
        <Brain size={18} className="text-mg-gold" />
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">Money Personality</h3>
      </div>
      {personality ? (
        <div className="flex items-center gap-3">
          <span className="text-3xl">{PERSONALITY_ICONS[personality] || "💰"}</span>
          <div>
            <p className="font-semibold text-mg-gold">{personality}</p>
            <p className="text-xs text-[var(--text-muted)]">Your AI-determined money style</p>
          </div>
        </div>
      ) : (
        <p className="text-sm text-[var(--text-muted)]">
          {isPro ? "Complete the money personality quiz to discover your style." : "Upgrade to Pro to discover your money personality."}
        </p>
      )}
    </Card>
  );
}
