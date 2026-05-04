"use client";
import { Lightbulb } from "lucide-react";
import Card from "@/components/ui/Card";
import type { CommunityPost } from "@/types/community";
import { formatDistanceToNow } from "date-fns";

export default function TipCard({ post }: { post: CommunityPost }) {
  return (
    <Card hoverable>
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-mg-gold/10 flex items-center justify-center flex-shrink-0">
          <Lightbulb size={15} className="text-mg-gold" />
        </div>
        <div>
          <p className="text-sm text-[var(--text-primary)] leading-relaxed">{post.content}</p>
          <p className="text-xs text-[var(--text-muted)] mt-1.5">
            {post.display_name} · {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
          </p>
        </div>
      </div>
    </Card>
  );
}
