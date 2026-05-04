"use client";
import { useState } from "react";
import { Sparkles, Loader } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

interface SavingsChallengeCardProps {
  isPro: boolean;
  currency: string;
}

export default function SavingsChallengeCard({ isPro, currency }: SavingsChallengeCardProps) {
  const [challenge, setChallenge] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const generate = async () => {
    setIsLoading(true);
    try {
      const data = await api.post<any>("/savings/challenges/generate");
      setChallenge(data);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card glow>
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={18} className="text-mg-gold" />
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">AI Savings Challenge</h3>
        {!isPro && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-mg-gold/20 text-mg-gold border border-mg-gold/30">PRO</span>}
      </div>
      {challenge ? (
        <div className="space-y-2">
          <p className="font-semibold text-mg-gold">{challenge.title}</p>
          <p className="text-sm text-[var(--text-secondary)]">{challenge.description}</p>
          <p className="text-xs text-[var(--text-muted)]">{challenge.duration_days} days · {currency} {challenge.target_amount?.toLocaleString() || "No target"}</p>
          <Button size="sm" variant="primary" className="w-full mt-2">Accept Challenge 🎯</Button>
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-sm text-[var(--text-muted)] mb-3">Let Lumi AI generate a personalised savings challenge based on your spending habits</p>
          <Button size="sm" variant="primary" onClick={generate} isLoading={isLoading} disabled={!isPro}>
            Generate Challenge
          </Button>
        </div>
      )}
    </Card>
  );
}
