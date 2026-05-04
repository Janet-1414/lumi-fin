"use client";
import { useState, useEffect } from "react";
import { useUser } from "@/hooks/useUser";
import { api } from "@/lib/api";
import CommunityTabs, { type CommunityTab } from "@/components/community/CommunityTabs";
import WinPostCard from "@/components/community/WinPostCard";
import LeaderboardRow from "@/components/community/LeaderboardRow";
import WeeklyPulseBanner from "@/components/community/WeeklyPulseBanner";
import TipCard from "@/components/community/TipCard";
import GroupChallengeCard from "@/components/community/GroupChallengeCard";
import Spinner from "@/components/ui/Spinner";
import type { CommunityPost, LeaderboardEntry, CommunityPulse } from "@/types/community";
import toast from "react-hot-toast";

export default function CommunityPage() {
  const user = useUser();
  const [tab, setTab] = useState<CommunityTab>("Feed");
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [pulse, setPulse] = useState<CommunityPulse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isPro = user?.subscription_tier === "pro";

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [feedData, lbData] = await Promise.all([
          api.get<CommunityPost[]>("/community/feed"),
          api.get<LeaderboardEntry[]>("/community/leaderboard"),
        ]);
        setPosts(feedData);
        setLeaderboard(lbData);

        if (isPro) {
          const pulseData = await api.get<CommunityPulse>("/community/pulse").catch(() => null);
          if (pulseData) setPulse(pulseData);
        }
      } catch (e: any) {
        toast.error("Failed to load community");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [isPro]);

  const handleLike = async (id: string) => {
    if (!isPro) { toast.error("Upgrade to Pro to interact with posts"); return; }
    try {
      const result = await api.post<{ likes: number }>(`/community/feed/${id}/like`);
      setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, likes: result.likes } : p)));
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const winPosts = posts.filter((p) => p.post_type === "win");
  const tipPosts = posts.filter((p) => p.post_type === "tip");

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-5">Community</h1>

      {pulse && <WeeklyPulseBanner pulse={pulse} />}

      <CommunityTabs active={tab} onChange={setTab} />

      <div className="mt-5">
        {isLoading ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : tab === "Feed" ? (
          <div className="space-y-3">
            {winPosts.length === 0 ? (
              <p className="text-center text-[var(--text-muted)] py-12">No wins shared yet. Be the first! 🏆</p>
            ) : (
              winPosts.map((p) => <WinPostCard key={p.id} post={p} onLike={handleLike} />)
            )}
          </div>
        ) : tab === "Leaderboard" ? (
          <div className="glass-card divide-y divide-[var(--border)]">
            {leaderboard.length === 0 ? (
              <p className="text-center text-[var(--text-muted)] py-12">No rankings yet. Start saving!</p>
            ) : (
              leaderboard.map((entry) => <LeaderboardRow key={entry.rank} entry={entry} />)
            )}
          </div>
        ) : tab === "Tips" ? (
          <div className="space-y-3">
            {tipPosts.length === 0 ? (
              <p className="text-center text-[var(--text-muted)] py-12">No tips yet.</p>
            ) : (
              tipPosts.map((p) => <TipCard key={p.id} post={p} />)
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <GroupChallengeCard
              title="30-Day No Unnecessary Spend"
              description="Cut non-essential spending for 30 days"
              participantsCount={142}
              completionPercentage={68}
              daysLeft={12}
              onJoin={() => !isPro && toast.error("Requires Lumi Pro")}
              isPro={isPro}
            />
            <GroupChallengeCard
              title="Save 20% This Month"
              description="Save at least 20% of your income this month"
              participantsCount={89}
              completionPercentage={45}
              daysLeft={18}
              onJoin={() => !isPro && toast.error("Requires Lumi Pro")}
              isPro={isPro}
            />
          </div>
        )}
      </div>
    </div>
  );
}
