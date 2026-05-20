"use client";
import { useState } from "react";
import { Heart, MessageCircle, Trophy, Lightbulb, HelpCircle, ChevronDown, ChevronUp, CornerDownRight, ThumbsUp } from "lucide-react";
import Card from "@/components/ui/Card";
import { formatDistanceToNow } from "date-fns";
import type { CommunityPost, PostType } from "@/types/community";

interface Comment {
  id: string;
  content: string;
  display_name: string;
  created_at: string;
  likes: number;
  liked: boolean;
  replies: Reply[];
}

interface Reply {
  id: string;
  content: string;
  display_name: string;
  created_at: string;
  likes: number;
  liked: boolean;
}

interface WinPostCardProps {
  post: CommunityPost;
  onLike: (id: string) => void;
  hasLiked: boolean;
}

const COMMENT_KEY = "lumi_comments_v2";

function loadComments(postId: string): Comment[] {
  try {
    const all = JSON.parse(localStorage.getItem(COMMENT_KEY) || "{}");
    return all[postId] || [];
  } catch { return []; }
}

function saveComments(postId: string, comments: Comment[]) {
  try {
    const all = JSON.parse(localStorage.getItem(COMMENT_KEY) || "{}");
    all[postId] = comments;
    localStorage.setItem(COMMENT_KEY, JSON.stringify(all));
  } catch {}
}

const POST_ICONS: Record<PostType, React.ReactNode> = {
  win: <Trophy size={15} className="text-mg-gold" />,
  tip: <Lightbulb size={15} className="text-mg-success" />,
  question: <HelpCircle size={15} className="text-blue-400" />,
};

const POST_LABELS: Record<PostType, string> = {
  win: "Win",
  tip: "Tip",
  question: "Question",
};

const POST_LABEL_COLORS: Record<PostType, string> = {
  win: "text-mg-gold bg-mg-gold/10 border-mg-gold/30",
  tip: "text-mg-success bg-mg-success/10 border-mg-success/30",
  question: "text-blue-400 bg-blue-400/10 border-blue-400/30",
};

function toLocalDate(utcString: string): Date {
  const normalized = utcString.endsWith("Z") ? utcString : utcString + "Z";
  return new Date(normalized);
}

export default function WinPostCard({ post, onLike, hasLiked }: WinPostCardProps) {
  const [comments, setComments] = useState<Comment[]>(() => loadComments(post.id));
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isAnon, setIsAnon] = useState(true);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const postType = post.post_type as PostType;

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    const comment: Comment = {
      id: `c-${Date.now()}`,
      content: newComment.trim(),
      display_name: isAnon ? "Anonymous" : "Community Member",
      created_at: new Date().toISOString(),
      likes: 0,
      liked: false,
      replies: [],
    };
    const updated = [...comments, comment];
    setComments(updated);
    saveComments(post.id, updated);
    setNewComment("");
  };

  const handleLikeComment = (commentId: string) => {
    const updated = comments.map((c) =>
      c.id === commentId && !c.liked
        ? { ...c, likes: c.likes + 1, liked: true }
        : c
    );
    setComments(updated);
    saveComments(post.id, updated);
  };

  const handleAddReply = (commentId: string) => {
    if (!replyText.trim()) return;
    const reply: Reply = {
      id: `r-${Date.now()}`,
      content: replyText.trim(),
      display_name: isAnon ? "Anonymous" : "Community Member",
      created_at: new Date().toISOString(),
      likes: 0,
      liked: false,
    };
    const updated = comments.map((c) =>
      c.id === commentId
        ? { ...c, replies: [...c.replies, reply] }
        : c
    );
    setComments(updated);
    saveComments(post.id, updated);
    setReplyText("");
    setReplyingTo(null);
  };

  const handleLikeReply = (commentId: string, replyId: string) => {
    const updated = comments.map((c) =>
      c.id === commentId
        ? {
            ...c,
            replies: c.replies.map((r) =>
              r.id === replyId && !r.liked
                ? { ...r, likes: r.likes + 1, liked: true }
                : r
            ),
          }
        : c
    );
    setComments(updated);
    saveComments(post.id, updated);
  };

  const totalComments = comments.reduce((acc, c) => acc + 1 + c.replies.length, 0);

  return (
    <Card hoverable className="space-y-3">
      {/* Post header */}
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-[var(--bg-secondary)] border border-[var(--border)] flex items-center justify-center flex-shrink-0">
          {POST_ICONS[postType]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-xs font-semibold text-[var(--text-primary)]">{post.display_name}</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${POST_LABEL_COLORS[postType]}`}>
              {POST_LABELS[postType]}
            </span>
            <span className="text-xs text-[var(--text-muted)] ml-auto">
              {formatDistanceToNow(toLocalDate(post.created_at), { addSuffix: true })}
            </span>
          </div>
          <p className="text-sm text-[var(--text-primary)] leading-relaxed">{post.content}</p>
          {post.savings_percentage && (
            <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-card bg-mg-success/10 border border-mg-success/20">
              <span className="text-xs font-bold text-mg-success">+{post.savings_percentage}% saved</span>
            </div>
          )}
        </div>
      </div>

      {/* Action bar */}
      <div className="flex items-center gap-4 pt-1 border-t border-[var(--border)]">
        <button
          onClick={() => !hasLiked && onLike(post.id)}
          disabled={hasLiked}
          className={`flex items-center gap-1.5 text-xs transition-colors ${
            hasLiked ? "text-mg-alert cursor-default" : "text-[var(--text-muted)] hover:text-mg-alert"
          }`}
        >
          <Heart size={13} fill={hasLiked ? "currentColor" : "none"} />
          {post.likes > 0 && <span>{post.likes}</span>}
          <span>{hasLiked ? "Liked" : "Like"}</span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-mg-gold transition-colors"
        >
          <MessageCircle size={13} />
          <span>{totalComments > 0 ? `${totalComments} comment${totalComments !== 1 ? "s" : ""}` : "Comment"}</span>
          {totalComments > 0 && (showComments ? <ChevronUp size={11} /> : <ChevronDown size={11} />)}
        </button>
      </div>

      {/* Comments section */}
      {showComments && (
        <div className="space-y-3 pt-1">
          {/* Existing comments */}
          {comments.map((comment) => (
            <div key={comment.id} className="space-y-2">
              {/* Comment */}
              <div className="flex gap-2">
                <div className="w-6 h-6 rounded-full bg-[var(--border)] flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-[var(--text-muted)]">
                  {comment.display_name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="bg-[var(--bg-secondary)] rounded-card px-3 py-2">
                    <p className="text-xs font-semibold text-[var(--text-primary)] mb-0.5">{comment.display_name}</p>
                    <p className="text-sm text-[var(--text-primary)] leading-relaxed">{comment.content}</p>
                  </div>
                  <div className="flex items-center gap-3 mt-1 ml-1">
                    <span className="text-[10px] text-[var(--text-muted)]">
                      {formatDistanceToNow(toLocalDate(comment.created_at), { addSuffix: true })}
                    </span>
                    <button
                      onClick={() => handleLikeComment(comment.id)}
                      disabled={comment.liked}
                      className={`flex items-center gap-1 text-[10px] transition-colors ${
                        comment.liked ? "text-mg-gold cursor-default" : "text-[var(--text-muted)] hover:text-mg-gold"
                      }`}
                    >
                      <ThumbsUp size={10} fill={comment.liked ? "currentColor" : "none"} />
                      {comment.likes > 0 && comment.likes}
                      {comment.liked ? "Liked" : "Like"}
                    </button>
                    <button
                      onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                      className="flex items-center gap-1 text-[10px] text-[var(--text-muted)] hover:text-mg-gold transition-colors"
                    >
                      <CornerDownRight size={10} />
                      Reply
                    </button>
                  </div>

                  {/* Replies */}
                  {comment.replies.length > 0 && (
                    <div className="ml-3 mt-2 space-y-2 border-l-2 border-[var(--border)] pl-3">
                      {comment.replies.map((reply) => (
                        <div key={reply.id} className="flex gap-2">
                          <div className="w-5 h-5 rounded-full bg-[var(--border)] flex items-center justify-center flex-shrink-0 text-[9px] font-bold text-[var(--text-muted)]">
                            {reply.display_name[0]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="bg-[var(--bg-secondary)] rounded-card px-2.5 py-1.5">
                              <p className="text-[10px] font-semibold text-[var(--text-primary)] mb-0.5">{reply.display_name}</p>
                              <p className="text-xs text-[var(--text-primary)] leading-relaxed">{reply.content}</p>
                            </div>
                            <div className="flex items-center gap-3 mt-0.5 ml-1">
                              <span className="text-[10px] text-[var(--text-muted)]">
                                {formatDistanceToNow(toLocalDate(reply.created_at), { addSuffix: true })}
                              </span>
                              <button
                                onClick={() => handleLikeReply(comment.id, reply.id)}
                                disabled={reply.liked}
                                className={`flex items-center gap-1 text-[10px] transition-colors ${
                                  reply.liked ? "text-mg-gold cursor-default" : "text-[var(--text-muted)] hover:text-mg-gold"
                                }`}
                              >
                                <ThumbsUp size={9} fill={reply.liked ? "currentColor" : "none"} />
                                {reply.likes > 0 && reply.likes}
                                {reply.liked ? "Liked" : "Like"}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reply input */}
                  {replyingTo === comment.id && (
                    <div className="ml-3 mt-2 flex gap-2">
                      <div className="w-5 h-5 rounded-full bg-mg-gold/20 flex items-center justify-center flex-shrink-0 text-[9px] font-bold text-mg-gold">
                        Y
                      </div>
                      <div className="flex-1 flex gap-2">
                        <input
                          type="text"
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder={`Reply to ${comment.display_name}...`}
                          className="flex-1 text-xs bg-[var(--bg-secondary)] border border-[var(--border)] rounded-card px-2.5 py-1.5 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-mg-gold"
                          onKeyDown={(e) => { if (e.key === "Enter") handleAddReply(comment.id); }}
                          autoFocus
                        />
                        <button
                          onClick={() => handleAddReply(comment.id)}
                          disabled={!replyText.trim()}
                          className="text-[10px] font-semibold text-mg-gold border border-mg-gold/40 px-2 py-1 rounded-card hover:bg-mg-gold/10 disabled:opacity-40 transition-all"
                        >
                          Reply
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* New comment input */}
          <form onSubmit={handleAddComment} className="flex gap-2 pt-1">
            <div className="w-6 h-6 rounded-full bg-mg-gold/20 flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-mg-gold">
              Y
            </div>
            <div className="flex-1 space-y-1.5">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={postType === "question" ? "Share your answer or thoughts..." : "Write a comment..."}
                className="w-full text-sm bg-[var(--bg-secondary)] border border-[var(--border)] rounded-card px-3 py-2 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-mg-gold"
              />
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAnon}
                    onChange={(e) => setIsAnon(e.target.checked)}
                    className="rounded"
                  />
                  Anonymous
                </label>
                <button
                  type="submit"
                  disabled={!newComment.trim()}
                  className="text-xs font-semibold text-mg-gold border border-mg-gold/40 px-3 py-1 rounded-card hover:bg-mg-gold/10 disabled:opacity-40 transition-all"
                >
                  {postType === "question" ? "Answer" : "Post"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </Card>
  );
}
