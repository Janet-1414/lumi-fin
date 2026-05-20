"use client";
import { useState, useEffect } from "react";
import { Plus, RefreshCw } from "lucide-react";
import { useUser } from "@/hooks/useUser";
import { api } from "@/lib/api";
import CommunityTabs, { type CommunityTab } from "@/components/community/CommunityTabs";
import WinPostCard from "@/components/community/WinPostCard";
import LeaderboardRow from "@/components/community/LeaderboardRow";
import WeeklyPulseBanner from "@/components/community/WeeklyPulseBanner";
import GroupChallengeCard from "@/components/community/GroupChallengeCard";
import ShareWinModal from "@/components/community/ShareWinModal";
import Spinner from "@/components/ui/Spinner";
import Button from "@/components/ui/Button";
import type { CommunityPost, LeaderboardEntry, CommunityPulse } from "@/types/community";
import toast from "react-hot-toast";

const LIKED_KEY = "lumi_liked_posts";
const JOINED_KEY = "lumi_joined_challenges";
const ACTIVE_CHALLENGE_KEY = "lumi_active_challenge";

const DEFAULT_CHALLENGES = [
  { id: "c1", title: "30-Day No Unnecessary Spend", description: "For 30 days, cut all non-essential spending. Every shilling saved goes toward your personal savings goals.", participantsCount: 142, completionPercentage: 68, daysLeft: 30, difficulty: "Medium" },
  { id: "c2", title: "Save 20% This Month", description: "Together we save at least 20% of our income this month. Track every expense and celebrate when you hit the target.", participantsCount: 89, completionPercentage: 45, daysLeft: 14, difficulty: "Ambitious" },
  { id: "c3", title: "7-Day Mobile Money Fee Tracker", description: "Track every Mobile Money fee you pay for 7 days. Awareness is the first step to saving more.", participantsCount: 203, completionPercentage: 82, daysLeft: 7, difficulty: "Easy" },
];

function getLikedPosts(): Set<string> { try { return new Set(JSON.parse(localStorage.getItem(LIKED_KEY) || "[]")); } catch { return new Set(); } }
function getJoinedChallenges(): Set<string> { try { return new Set(JSON.parse(localStorage.getItem(JOINED_KEY) || "[]")); } catch { return new Set(); } }
function saveLike(id: string) { try { const l = getLikedPosts(); l.add(id); localStorage.setItem(LIKED_KEY, JSON.stringify([...l])); } catch {} }

export default function CommunityPage() {
  const user = useUser();
  const [tab, setTab] = useState<CommunityTab>("Feed");
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [pulse, setPulse] = useState<CommunityPulse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(() => getLikedPosts());
  const [joinedChallenges, setJoinedChallenges] = useState<Set<string>>(() => getJoinedChallenges());
  const [challenges, setChallenges] = useState(DEFAULT_CHALLENGES);
  const [isGenerating, setIsGenerating] = useState(false);
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
          const p = await api.get<CommunityPulse>("/community/pulse").catch(() => null);
          if (p) setPulse(p);
        }
      } catch { toast.error("Failed to load community"); }
      finally { setIsLoading(false); }
    };
    fetchData();
  }, [isPro]);

  const handleLike = async (id: string) => {
    if (!isPro) { toast.error("Upgrade to Pro to like posts"); return; }
    if (likedPosts.has(id)) return;
    try {
      const r = await api.post<{ likes: number }>(`/community/feed/${id}/like`);
      saveLike(id);
      setLikedPosts((prev) => new Set([...prev, id]));
      setPosts((prev) => prev.map((p) => p.id === id ? { ...p, likes: r.likes } : p));
    } catch (e: any) { toast.error(e.message); }
  };

  const handlePostShared = (newPost: CommunityPost) => {
    setPosts((prev) => [newPost, ...prev]);
    setIsShareOpen(false);
    toast.success("Posted to the community feed! 🎉");
  };

  const handleJoinChallenge = (challenge: typeof DEFAULT_CHALLENGES[0]) => {
    if (!isPro) { toast.error("Upgrade to Pro to join challenges"); return; }
    const existing = localStorage.getItem(ACTIVE_CHALLENGE_KEY);
    if (existing) {
      try {
        const parsed = JSON.parse(existing);
        if (parsed.community_id !== challenge.id) {
          if (!window.confirm(`You have an active challenge "${parsed.title}". Replace it with this one?`)) return;
        }
      } catch {}
    }
    localStorage.setItem(ACTIVE_CHALLENGE_KEY, JSON.stringify({
      title: challenge.title, description: challenge.description,
      duration_days: challenge.daysLeft, target_amount: null, tips: [],
      difficulty: challenge.difficulty, accepted_at: new Date().toISOString(),
      checked_in_dates: [], community_id: challenge.id,
    }));
    const updated = new Set([...joinedChallenges, challenge.id]);
    setJoinedChallenges(updated);
    localStorage.setItem(JOINED_KEY, JSON.stringify([...updated]));
    toast.success(`Joined! Check in daily here or on the Savings page 💪`);
  };

  const handleGenerateNew = async () => {
    if (!isPro) return;
    setIsGenerating(true);
    try {
      const data = await api.post<any[]>("/savings/challenges/generate");
      if (Array.isArray(data) && data.length > 0) {
        setChallenges(data.map((c, i) => ({
          id: `gen-${Date.now()}-${i}`, title: c.title,
          description: c.description + " Join the community!",
          participantsCount: Math.floor(Math.random() * 150) + 20,
          completionPercentage: Math.floor(Math.random() * 60) + 10,
          daysLeft: c.duration_days, difficulty: c.difficulty || "Medium",
        })));
        toast.success("New challenges generated!");
      }
    } catch { toast.error("Could not generate challenges"); }
    finally { setIsGenerating(false); }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Community</h1>
        {isPro && (
          <Button variant="primary" size="sm" onClick={() => setIsShareOpen(true)}>
            <Plus size={16} />
            Post
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
              <div className="p-4 rounded-card bg-mg-gold/10 border border-mg-gold/30 text-center mb-2">
                <p className="text-sm font-medium text-mg-gold mb-1">Read-only mode</p>
                <p className="text-xs text-[var(--text-muted)]">Upgrade to Pro to post wins, tips, questions and engage with the community</p>
              </div>
            )}
            {posts.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-4xl mb-3">💬</p>
                <p className="text-sm font-medium text-[var(--text-primary)]">No posts yet</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">Share a win, tip, or question to start the conversation</p>
              </div>
            ) : (
              posts.map((p) => (
                <WinPostCard
                  key={p.id}
                  post={p}
                  onLike={handleLike}
                  hasLiked={likedPosts.has(p.id)}
                />
              ))
            )}
          </div>
        ) : tab === "Leaderboard" ? (
          <div className="glass-card divide-y divide-[var(--border)]">
            {leaderboard.length === 0
              ? <p className="text-center text-[var(--text-muted)] py-12">No rankings yet. Start saving!</p>
              : leaderboard.map((e) => <LeaderboardRow key={e.rank} entry={e} />)}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-3 rounded-card bg-[var(--bg-card)] border border-[var(--border)]">
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                <span className="font-semibold text-mg-gold">How it works:</span> Join a challenge and check in daily — right here or on the Savings page. Both track the same progress. You can only be active on one challenge at a time.
              </p>
            </div>
            {challenges.map((c) => (
              <GroupChallengeCard
                key={c.id} id={c.id} title={c.title} description={c.description}
                participantsCount={c.participantsCount} completionPercentage={c.completionPercentage}
                daysLeft={c.daysLeft} difficulty={c.difficulty}
                isJoined={joinedChallenges.has(c.id)}
                onJoin={() => handleJoinChallenge(c)} isPro={isPro}
              />
            ))}
            <Button variant="secondary" size="sm" className="w-full" onClick={handleGenerateNew} isLoading={isGenerating} disabled={!isPro}>
              <RefreshCw size={14} />
              {isPro ? "Generate different challenges" : "Upgrade to Pro for more challenges"}
            </Button>
          </div>
        )}
      </div>

      <ShareWinModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        onPosted={handlePostShared}
        currentTab="Feed"
      />
    </div>
  );
}
