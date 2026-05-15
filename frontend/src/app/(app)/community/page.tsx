"use client";
import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { useUser } from "@/hooks/useUser";
import { api } from "@/lib/api";
import CommunityTabs, { type CommunityTab } from "@/components/community/CommunityTabs";
import WinPostCard from "@/components/community/WinPostCard";
import LeaderboardRow from "@/components/community/LeaderboardRow";
import WeeklyPulseBanner from "@/components/community/WeeklyPulseBanner";
import TipCard from "@/components/community/TipCard";
import GroupChallengeCard from "@/components/community/GroupChallengeCard";
import ShareWinModal from "@/components/community/ShareWinModal";
import CommentModal from "@/components/community/CommentModal";
import Spinner from "@/components/ui/Spinner";
import Button from "@/components/ui/Button";
import type { CommunityPost, LeaderboardEntry, CommunityPulse } from "@/types/community";
import toast from "react-hot-toast";

const LIKED_KEY = "lumi_liked_posts";

function getLikedPosts(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(LIKED_KEY) || "[]"));
  } catch {
    return new Set();
  }
}

function saveLike(id: string) {
  try {
    const liked = getLikedPosts();
    liked.add(id);
    localStorage.setItem(LIKED_KEY, JSON.stringify([...liked]));
  } catch {}
}

export default function CommunityPage() {
  const user = useUser();
  const [tab, setTab] = useState<CommunityTab>("Feed");
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [pulse, setPulse] = useState<CommunityPulse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [commentPost, setCommentPost] = useState<CommunityPost | null>(null);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(() => getLikedPosts());

  const isPro = user?.subscription_tier === "pro";

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
    } catch {
      toast.error("Failed to load community");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [isPro]);

  const handleLike = async (id: string) => {
    if (!isPro) { toast.error("Upgrade to Pro to interact with posts"); return; }
    if (likedPosts.has(id)) return; // already liked
    try {
      const result = await api.post<{ likes: number }>(`/community/feed/${id}/like`);
      saveLike(id);
      setLikedPosts((prev) => new Set([...prev, id]));
      setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, likes: result.likes } : p)));
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handlePostShared = (newPost: CommunityPost) => {
    setPosts((prev) => [newPost, ...prev]);
    setIsShareOpen(false);
    toast.success("Your win has been shared! 🏆");
  };

  const winPosts = posts.filter((p) => p.post_type === "win");
  const tipPosts = posts.filter((p) => p.post_type === "tip");

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Community</h1>
        {isPro && (
          <Button variant="primary" size="sm" onClick={() => setIsShareOpen(true)}>
            <Plus size={16} />
            Share Win
          </Button>
        )}
      </div>

      {pulse && <WeeklyPulseBanner pulse={pulse} />}

      <CommunityTabs active={tab} onChange={setTab} />

      <div className="mt-5">
        {isLoading ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : tab === "Feed" ? (
          <div className="space-y-3">
            {!isPro && (
              <div className="p-4 rounded-card bg-mg-gold/10 border border-mg-gold/30 text-center mb-4">
                <p className="text-sm font-medium text-mg-gold mb-1">You're in read-only mode</p>
                <p className="text-xs text-[var(--text-muted)]">Upgrade to Pro to share wins and engage with the community</p>
              </div>
            )}
            {winPosts.length === 0 ? (
              <p className="text-center text-[var(--text-muted)] py-12">No wins shared yet. Be the first! 🏆</p>
            ) : (
              winPosts.map((p) => (
                <WinPostCard
                  key={p.id}
                  post={p}
                  onLike={handleLike}
                  onComment={setCommentPost}
                  hasLiked={likedPosts.has(p.id)}
                />
              ))
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
            {isPro && (
              <button
                onClick={() => setIsShareOpen(true)}
                className="w-full py-3 rounded-card border border-dashed border-[var(--border)] text-sm text-[var(--text-muted)] hover:border-mg-gold/40 hover:text-mg-gold transition-all"
              >
                + Share a money tip
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-3 rounded-card bg-[var(--bg-card)] border border-[var(--border)]">
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                <span className="font-semibold text-mg-gold">About these numbers:</span> Participant counts and completion percentages shown here are illustrative — they represent what active community engagement looks like. Your personal challenge progress is tracked separately on the Savings page.
              </p>
            </div>
            <GroupChallengeCard
              title="30-Day No Unnecessary Spend"
              description="Cut non-essential spending for 30 days and redirect those funds to your savings goals"
              participantsCount={142}
              completionPercentage={68}
              daysLeft={12}
              onJoin={() => toast.success("Challenge added to your Savings page! 💪")}
              isPro={isPro}
            />
            <GroupChallengeCard
              title="Save 20% This Month"
              description="Save at least 20% of your income this month by tracking every expense carefully"
              participantsCount={89}
              completionPercentage={45}
              daysLeft={18}
              onJoin={() => toast.success("Challenge added to your Savings page! 💪")}
              isPro={isPro}
            />
          </div>
        )}
      </div>

      <ShareWinModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        onPosted={handlePostShared}
        currentTab={tab}
      />

      <CommentModal
        post={commentPost}
        isOpen={!!commentPost}
        onClose={() => setCommentPost(null)}
      />
    </div>
  );
}
