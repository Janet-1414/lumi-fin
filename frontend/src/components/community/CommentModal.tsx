"use client";
import { useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { Trophy, MessageCircle } from "lucide-react";
import type { CommunityPost } from "@/types/community";
import { formatDistanceToNow } from "date-fns";

interface Comment {
  id: string;
  content: string;
  display_name: string;
  created_at: string;
}

interface CommentModalProps {
  post: CommunityPost | null;
  isOpen: boolean;
  onClose: () => void;
}

const COMMENT_STORAGE_KEY = "lumi_comments";

function loadComments(postId: string): Comment[] {
  try {
    const all = JSON.parse(localStorage.getItem(COMMENT_STORAGE_KEY) || "{}");
    return all[postId] || [];
  } catch {
    return [];
  }
}

function saveComment(postId: string, comment: Comment) {
  try {
    const all = JSON.parse(localStorage.getItem(COMMENT_STORAGE_KEY) || "{}");
    all[postId] = [...(all[postId] || []), comment];
    localStorage.setItem(COMMENT_STORAGE_KEY, JSON.stringify(all));
  } catch {}
}

export default function CommentModal({ post, isOpen, onClose }: CommentModalProps) {
  const [comments, setComments] = useState<Comment[]>(post ? loadComments(post.id) : []);
  const [text, setText] = useState("");
  const [isAnon, setIsAnon] = useState(true);

  if (!post) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    const comment: Comment = {
      id: Date.now().toString(),
      content: text.trim(),
      display_name: isAnon ? "Anonymous" : "Community Member",
      created_at: new Date().toISOString(),
    };
    saveComment(post.id, comment);
    setComments((prev) => [...prev, comment]);
    setText("");
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Comments" size="md">
      {/* Original post */}
      <div className="flex items-start gap-3 p-3 rounded-card bg-[var(--bg-secondary)] border border-[var(--border)] mb-4">
        <Trophy size={16} className="text-mg-gold flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-semibold text-mg-gold mb-1">{post.display_name}</p>
          <p className="text-sm text-[var(--text-primary)]">{post.content}</p>
          {post.savings_percentage && (
            <span className="text-xs text-mg-success font-bold">+{post.savings_percentage}% saved</span>
          )}
        </div>
      </div>

      {/* Comments list */}
      <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
        {comments.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)] text-center py-4">
            No comments yet. Be the first to respond!
          </p>
        ) : (
          comments.map((c) => (
            <div key={c.id} className="flex items-start gap-2">
              <div className="w-7 h-7 rounded-full bg-[var(--border)] flex items-center justify-center flex-shrink-0">
                <MessageCircle size={12} className="text-[var(--text-muted)]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-semibold text-[var(--text-secondary)]">{c.display_name}</span>
                  <span className="text-[10px] text-[var(--text-muted)]">
                    {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm text-[var(--text-primary)]">{c.content}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add comment form */}
      <form onSubmit={handleSubmit} className="space-y-3 border-t border-[var(--border)] pt-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add an encouraging comment..."
          rows={2}
          maxLength={300}
          className="w-full rounded-card border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] px-3 py-2 text-sm focus:outline-none focus:border-mg-gold resize-none"
        />
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-xs text-[var(--text-muted)] cursor-pointer">
            <input
              type="checkbox"
              checked={isAnon}
              onChange={(e) => setIsAnon(e.target.checked)}
              className="rounded"
            />
            Post anonymously
          </label>
          <Button type="submit" size="sm" variant="primary" disabled={!text.trim()}>
            Comment
          </Button>
        </div>
      </form>
    </Modal>
  );
}