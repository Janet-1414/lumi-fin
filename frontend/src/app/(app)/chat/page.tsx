"use client";
import { useUser } from "@/hooks/useUser";
import { useChat } from "@/hooks/useChat";
import ChatWindow from "@/components/chat/ChatWindow";
import ChatInput from "@/components/chat/ChatInput";
import PromptChips from "@/components/chat/PromptChips";
import { Trash2, Lock } from "lucide-react";
import Link from "next/link";

export default function ChatPage() {
  const user = useUser();
  const { messages, isStreaming, sendMessage, stopStreaming, clearChat } = useChat();
  const isPro = user?.subscription_tier === "pro";

  if (!user) return null;

  if (!isPro) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-16 h-16 rounded-full bg-mg-gold/10 border border-mg-gold/30 flex items-center justify-center mb-5">
          <Lock size={28} className="text-mg-gold" />
        </div>
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Chat with Your Finances</h2>
        <p className="text-[var(--text-muted)] text-sm max-w-xs mb-6 leading-relaxed">
          Ask {user.first_name}, Lumi AI can see your real transactions, goals, and streak data. Upgrade to Pro to unlock this feature.
        </p>
        <Link href="/subscription" className="px-6 py-3 bg-mg-gold text-mg-bg font-bold rounded-card hover:bg-yellow-400 transition-all shadow-gold-glow">
          Upgrade to Lumi Pro — $1/month
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] lg:h-[calc(100vh-60px)]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">Chat with Lumi AI</h1>
          <p className="text-xs text-[var(--text-muted)]">Powered by LangGraph + OpenAI · Sees your real data</p>
        </div>
        {messages.length > 0 && (
          <button onClick={clearChat} className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-mg-alert transition-colors">
            <Trash2 size={14} />
            Clear
          </button>
        )}
      </div>

      <div className="flex-1 glass-card overflow-hidden flex flex-col">
        <ChatWindow messages={messages} isStreaming={isStreaming} userName={user.first_name} />
        <div className="p-4 border-t border-[var(--border)]">
          {messages.length === 0 && <PromptChips onSelect={sendMessage} />}
          <ChatInput onSend={sendMessage} onStop={stopStreaming} isStreaming={isStreaming} />
        </div>
      </div>
    </div>
  );
}
