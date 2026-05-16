"use client";
import { useState, useRef, useCallback } from "react";
import { useUser } from "@/hooks/useUser";
import { useChat } from "@/hooks/useChat";
import ChatWindow from "@/components/chat/ChatWindow";
import ChatInput from "@/components/chat/ChatInput";
import PromptChips from "@/components/chat/PromptChips";
import { Plus, MessageCircle, Trash2, Lock } from "lucide-react";
import Link from "next/link";
import type { ChatMessage } from "@/types/api";

const SESSIONS_KEY = "lumi_chat_sessions";
const MAX_SESSIONS = 10;

interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  created_at: string;
}

function loadSessions(): ChatSession[] {
  try {
    const raw = sessionStorage.getItem(SESSIONS_KEY);
    if (!raw) return [];
    const all: ChatSession[] = JSON.parse(raw);
    const seen = new Set<string>();
    return all.filter((s) => {
      if (seen.has(s.id)) return false;
      seen.add(s.id);
      return true;
    }).filter((s) => s.messages.some((m) => m.role === "user"));
  } catch {
    return [];
  }
}

function saveSessions(sessions: ChatSession[]) {
  try {
    const seen = new Set<string>();
    const deduped = sessions
      .filter((s) => s.messages.some((m) => m.role === "user"))
      .filter((s) => { if (seen.has(s.id)) return false; seen.add(s.id); return true; });
    sessionStorage.setItem(SESSIONS_KEY, JSON.stringify(deduped.slice(0, MAX_SESSIONS)));
  } catch {}
}

function getSessionTitle(messages: ChatMessage[]): string {
  const first = messages.find((m) => m.role === "user");
  if (!first) return "New conversation";
  return first.content.slice(0, 40) + (first.content.length > 40 ? "..." : "");
}

export default function ChatPage() {
  const user = useUser();
  const { messages, isStreaming, sendMessage, stopStreaming, clearChat, setMessages } = useChat();
  const [sessions, setSessions] = useState<ChatSession[]>(() => loadSessions());
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const isPro = user?.subscription_tier === "pro";

  // Track whether we are in a loaded (read-only) session or an active one
  const sessionIdRef = useRef<string | null>(null);
  const isLoadedSessionRef = useRef(false);

  // Called only when user sends a message — not on page load
  const handleSend = useCallback(async (content: string) => {
    // Mark that we are now in an active session (not loaded)
    isLoadedSessionRef.current = false;

    // Create session ID once per conversation
    if (!sessionIdRef.current) {
      const newId = Date.now().toString();
      sessionIdRef.current = newId;
      setActiveSessionId(newId);
    }

    await sendMessage(content);

    // Save after send — read messages from the hook via a small timeout
    // so the state has updated
    setTimeout(() => {
      if (isLoadedSessionRef.current) return;
      const sessionId = sessionIdRef.current;
      if (!sessionId) return;

      // Re-read from sessionStorage to get the latest messages
      try {
        const stored = sessionStorage.getItem("lumi_chat_current");
        if (!stored) return;
        const latestMessages: ChatMessage[] = JSON.parse(stored);
        if (!latestMessages.some((m) => m.role === "user")) return;

        const updatedSession: ChatSession = {
          id: sessionId,
          title: getSessionTitle(latestMessages),
          messages: latestMessages,
          created_at: new Date().toISOString(),
        };

        setSessions((prev) => {
          const exists = prev.some((s) => s.id === sessionId);
          const updated = exists
            ? prev.map((s) => (s.id === sessionId ? updatedSession : s))
            : [updatedSession, ...prev];
          saveSessions(updated);
          return updated;
        });
      } catch {}
    }, 200);
  }, [sendMessage, sessionIdRef]);

  const handleNewChat = () => {
    isLoadedSessionRef.current = false;
    sessionIdRef.current = null;
    clearChat();
    setActiveSessionId(null);
  };

  const handleLoadSession = (session: ChatSession) => {
    isLoadedSessionRef.current = true;
    sessionIdRef.current = session.id;
    setMessages(session.messages);
    setActiveSessionId(session.id);
  };

  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = sessions.filter((s) => s.id !== id);
    setSessions(updated);
    saveSessions(updated);
    if (activeSessionId === id) handleNewChat();
  };

  if (!user) return null;

  if (!isPro) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-16 h-16 rounded-full bg-mg-gold/10 border border-mg-gold/30 flex items-center justify-center mb-5">
          <Lock size={28} className="text-mg-gold" />
        </div>
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Chat with Your Finances</h2>
        <p className="text-[var(--text-muted)] text-sm max-w-xs mb-6 leading-relaxed">
          Ask Lumi anything about your money. It sees your real transactions, goals, and streak data.
        </p>
        <Link href="/subscription" className="px-6 py-3 bg-mg-gold text-mg-bg font-bold rounded-card hover:bg-yellow-400 transition-all shadow-gold-glow">
          Upgrade to Lumi Pro — $1/month
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-140px)] lg:h-[calc(100vh-60px)] gap-4">
      <aside className="hidden lg:flex flex-col w-56 flex-shrink-0">
        <button
          onClick={handleNewChat}
          className="flex items-center gap-2 px-3 py-2.5 rounded-card bg-mg-gold text-mg-bg font-semibold text-sm hover:bg-yellow-400 transition-all mb-3 shadow-gold-glow-sm"
        >
          <Plus size={16} />
          New Chat
        </button>

        <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-2 px-1">
          Recent
        </p>

        <div className="flex-1 overflow-y-auto space-y-1">
          {sessions.length === 0 ? (
            <p className="text-xs text-[var(--text-muted)] px-2 py-4 text-center">
              Your conversations will appear here
            </p>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                onClick={() => handleLoadSession(session)}
                className={`group flex items-center gap-2 px-3 py-2 rounded-card cursor-pointer transition-all ${
                  activeSessionId === session.id
                    ? "bg-mg-gold/10 border border-mg-gold/20 text-mg-gold"
                    : "text-[var(--text-secondary)] hover:bg-[var(--bg-card)]"
                }`}
              >
                <MessageCircle size={13} className="flex-shrink-0" />
                <span className="text-xs flex-1 truncate">{session.title}</span>
                <button
                  onClick={(e) => handleDeleteSession(session.id, e)}
                  className="opacity-0 group-hover:opacity-100 text-[var(--text-muted)] hover:text-mg-alert transition-all flex-shrink-0"
                >
                  <Trash2 size={11} />
                </button>
              </div>
            ))
          )}
        </div>
      </aside>

      <div className="flex-1 flex flex-col glass-card overflow-hidden">
        <div className="lg:hidden flex items-center justify-between p-3 border-b border-[var(--border)]">
          <p className="text-sm font-semibold text-[var(--text-primary)]">Lumi AI</p>
          <button
            onClick={handleNewChat}
            className="flex items-center gap-1.5 text-xs text-mg-gold border border-mg-gold/40 px-2.5 py-1.5 rounded-card hover:bg-mg-gold/10 transition-all"
          >
            <Plus size={12} /> New Chat
          </button>
        </div>

        <ChatWindow messages={messages} isStreaming={isStreaming} userName={user.first_name} />

        <div className="p-4 border-t border-[var(--border)]">
          {messages.length === 0 && <PromptChips onSelect={handleSend} />}
          <ChatInput onSend={handleSend} onStop={stopStreaming} isStreaming={isStreaming} />
        </div>
      </div>
    </div>
  );
}
