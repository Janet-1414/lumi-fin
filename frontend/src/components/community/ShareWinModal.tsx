"use client";
import { useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { api } from "@/lib/api";
import type { CommunityPost, PostType } from "@/types/community";
import type { CommunityTab } from "./CommunityTabs";

interface ShareWinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPosted: (post: CommunityPost) => void;
  currentTab: CommunityTab;
}

export default function ShareWinModal({ isOpen, onClose, onPosted, currentTab }: ShareWinModalProps) {
  const defaultType: PostType = "win";
  const [postType, setPostType] = useState<PostType>(defaultType);
  const [content, setContent] = useState("");
  const [savingsPct, setSavingsPct] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setIsLoading(true);
    try {
      const post = await api.post<CommunityPost>("/community/feed", {
        post_type: postType,
        content: content.trim(),
        is_anonymous: isAnonymous,
        savings_percentage: savingsPct ? parseFloat(savingsPct) : null,
      });
      onPosted(post);
      setContent("");
      setSavingsPct("");
    } catch (e: any) {
      const toast = (await import("react-hot-toast")).default;
      toast.error(e.message || "Failed to post");
    } finally {
      setIsLoading(false);
    }
  };

  const POST_TYPES: { type: PostType; label: string; emoji: string; placeholder: string }[] = [
    { type: "win", label: "Win", emoji: "🏆", placeholder: "Share a savings win — e.g. I saved 30% of my salary this month!" },
    { type: "tip", label: "Tip", emoji: "💡", placeholder: "Share a money tip — e.g. Always withdraw cash in bulk to save on Mobile Money fees." },
    { type: "question", label: "Question", emoji: "❓", placeholder: "Ask the community — e.g. What's the best SACCO to join in Kampala?" },
  ];

  const selected = POST_TYPES.find((p) => p.type === postType)!;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share with Community">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Post type selector */}
        <div className="flex gap-2">
          {POST_TYPES.map(({ type, label, emoji }) => (
            <button
              key={type}
              type="button"
              onClick={() => setPostType(type)}
              className={`flex-1 py-2 rounded-card text-xs font-medium border transition-all ${
                postType === type
                  ? "bg-mg-gold/20 text-mg-gold border-mg-gold/40"
                  : "border-[var(--border)] text-[var(--text-muted)]"
              }`}
            >
              {emoji} {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[var(--text-secondary)]">What do you want to share?</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={selected.placeholder}
            rows={4}
            maxLength={500}
            required
            className="w-full rounded-card border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] px-3 py-2.5 text-sm focus:outline-none focus:border-mg-gold resize-none"
          />
          <p className="text-xs text-[var(--text-muted)] text-right">{content.length}/500</p>
        </div>

        {/* Savings % — only for wins */}
        {postType === "win" && (
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--text-secondary)]">
              Savings percentage (optional)
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                max="100"
                value={savingsPct}
                onChange={(e) => setSavingsPct(e.target.value)}
                placeholder="e.g. 30"
                className="w-full rounded-card border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] px-3 py-2.5 text-sm focus:outline-none focus:border-mg-gold pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[var(--text-muted)]">%</span>
            </div>
            <p className="text-xs text-[var(--text-muted)]">Never share actual amounts — percentages only keep everyone's privacy safe</p>
          </div>
        )}

        {/* Anonymous toggle */}
        <div className="flex items-center justify-between p-3 rounded-card bg-[var(--bg-secondary)] border border-[var(--border)]">
          <div>
            <p className="text-sm font-medium text-[var(--text-primary)]">Post anonymously</p>
            <p className="text-xs text-[var(--text-muted)]">Your name won't be shown</p>
          </div>
          <button
            type="button"
            onClick={() => setIsAnonymous(!isAnonymous)}
            className={`relative w-11 h-6 rounded-full transition-colors ${isAnonymous ? "bg-mg-success" : "bg-[var(--border)]"}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${isAnonymous ? "translate-x-5" : "translate-x-0"}`} />
          </button>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" className="flex-1" isLoading={isLoading}>
            Share {selected.emoji}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
