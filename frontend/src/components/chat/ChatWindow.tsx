"use client";
import { useEffect, useRef } from "react";
import ChatBubble from "./ChatBubble";
import type { ChatMessage } from "@/types/api";
import LumiAvatar from "./LumiAvatar";

interface ChatWindowProps {
  messages: ChatMessage[];
  isStreaming: boolean;
  userName: string;
}

export default function ChatWindow({ messages, isStreaming, userName }: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center">
        <LumiAvatar size={56} />
        <div>
          <h3 className="text-base font-semibold text-[var(--text-primary)] mb-1">
            Hi {userName}! I'm Lumi 👋
          </h3>
          <p className="text-sm text-[var(--text-muted)] max-w-xs">
            Ask me anything about your finances. I can see your real transactions, goals, and savings data.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((msg, i) => (
        <ChatBubble
          key={i}
          message={msg}
          isStreaming={isStreaming && i === messages.length - 1 && msg.role === "assistant"}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
