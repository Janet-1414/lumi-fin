"use client";
import { clsx } from "clsx";
import LumiAvatar from "./LumiAvatar";
import type { ChatMessage } from "@/types/api";

interface ChatBubbleProps {
  message: ChatMessage;
  isStreaming?: boolean;
}

export default function ChatBubble({ message, isStreaming }: ChatBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={clsx("flex gap-3 animate-fade-in", isUser && "flex-row-reverse")}>
      {!isUser && <LumiAvatar size={32} />}
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-[var(--border)] flex items-center justify-center text-sm font-bold text-[var(--text-muted)] flex-shrink-0">
          U
        </div>
      )}
      <div
        className={clsx(
          "max-w-[80%] px-4 py-3 rounded-card text-sm leading-relaxed",
          isUser
            ? "bg-mg-gold/20 border border-mg-gold/30 text-[var(--text-primary)] rounded-tr-sm"
            : "bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-primary)] rounded-tl-sm",
          isStreaming && !isUser && message.content === "" && "streaming-cursor"
        )}
      >
        {message.content || (isStreaming ? "" : "")}
        {isStreaming && !isUser && message.content !== "" && <span className="streaming-cursor" />}
      </div>
    </div>
  );
}
