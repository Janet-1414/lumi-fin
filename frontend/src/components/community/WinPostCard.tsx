"use client";
import { Heart, MessageCircle, Trophy } from "lucide-react";
import Card from "@/components/ui/Card";
import { formatDistanceToNow } from "date-fns";
import type { CommunityPost } from "@/types/community";

interface WinPostCardProps {
  post: CommunityPost;
  onLike: (id: string) => void;
  onComment: (post: CommunityPost) => void;
  hasLiked: boolean;
}

export default function WinPostCard({ post, onLike, onComment, hasLiked }: WinPostCardProps) {
  return (
    <Card hoverable>
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-mg-gold/20 flex items-center justify-center flex-shrink-0">
          <Trophy size={16} className="text-mg-gold" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-mg-gold">{post.display_name}</span>
            <span className="text-xs text-[var(--text-muted)]">
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
            </span>
          </div>
          <p className="text-sm text-[var(--text-primary)] leading-relaxed">{post.content}</p>
          {post.savings_percentage && (
            <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 rounded-card bg-mg-success/10 border border-mg-success/20">
              <span className="text-xs font-bold text-mg-success">+{post.savings_percentage}% saved</span>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center justify-end mt-3 gap-3">
        <button
          onClick={() => onComment(post)}
          className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-mg-gold transition-colors"
        >
          <MessageCircle size={14} />
          Comment
        </button>
        <button
          onClick={() => !hasLiked && onLike(post.id)}
          disabled={hasLiked}
          className={`flex items-center gap-1.5 text-xs transition-colors ${
            hasLiked
              ? "text-mg-alert cursor-default"
              : "text-[var(--text-muted)] hover:text-mg-alert cursor-pointer"
          }`}
          title={hasLiked ? "Already liked" : "Like this post"}
        >
          <Heart size={14} fill={hasLiked ? "currentColor" : "none"} />
          {post.likes}
        </button>
      </div>
    </Card>
  );
}
