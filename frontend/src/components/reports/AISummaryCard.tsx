"use client";
import { Zap } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";

interface AISummaryCardProps {
  summary: string | null;
  isLoading: boolean;
  onFetch: () => void;
  isPro: boolean;
  userName: string;
}

export default function AISummaryCard({ summary, isLoading, onFetch, isPro, userName }: AISummaryCardProps) {
  return (
    <Card glow>
      <div className="flex items-center gap-2 mb-3">
        <Zap size={18} className="text-mg-gold" fill="currentColor" />
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">AI Report Summary</h3>
      </div>
      {!isPro ? (
        <p className="text-sm text-[var(--text-muted)]">Upgrade to Lumi Pro to get {userName}'s personalised AI-written report summary.</p>
      ) : summary ? (
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">{summary}</p>
      ) : (
        <div className="text-center py-4">
          <p className="text-sm text-[var(--text-muted)] mb-3">Generate a personalised AI summary of your financial report</p>
          <Button size="sm" variant="primary" onClick={onFetch} isLoading={isLoading}>
            {isLoading ? "Generating..." : "Generate AI Summary"}
          </Button>
        </div>
      )}
      {isLoading && <div className="flex justify-center mt-4"><Spinner /></div>}
    </Card>
  );
}
