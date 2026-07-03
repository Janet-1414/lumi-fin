"use client";
import { useState, useCallback, useRef, useEffect } from "react";
import { API_BASE } from "@/lib/api";
import { getToken } from "@/lib/auth";
import type { ChatMessage } from "@/types/api";

const STORAGE_KEY = "lumi_chat_current";
const MAX_STORED = 50;

function loadHistory(): ChatMessage[] {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveHistory(messages: ChatMessage[]) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-MAX_STORED)));
  } catch {}
}

export function useChat() {
  const [messages, setMessagesState] = useState<ChatMessage[]>(() => loadHistory());
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    saveHistory(messages);
  }, [messages]);

  const setMessages = useCallback((msgs: ChatMessage[]) => {
    setMessagesState(msgs);
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    const userMsg: ChatMessage = { role: "user", content };
    const assistantMsg: ChatMessage = { role: "assistant", content: "" };

    setMessagesState((prev) => [...prev, userMsg, assistantMsg]);
    setIsStreaming(true);

    abortRef.current = new AbortController();

    // Get Bearer token for mobile iOS where cookies don't work
    const token = getToken();
    const authHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    try {
      const snapshot = messages;

      // Try streaming first
      const response = await fetch(`${API_BASE}/api/v1/chat/stream`, {
        method: "POST",
        credentials: "include",
        headers: authHeaders,
        body: JSON.stringify({
          message: content,
          conversation_history: snapshot,
        }),
        signal: abortRef.current.signal,
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ detail: "Chat failed" }));
        throw new Error(err.detail || "Chat failed");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      // If no reader (streaming not supported), fall back to non-streaming
      if (!reader) {
        const fallback = await fetch(`${API_BASE}/api/v1/chat`, {
          method: "POST",
          credentials: "include",
          headers: authHeaders,
          body: JSON.stringify({
            message: content,
            conversation_history: snapshot,
          }),
        });
        const data = await fallback.json();
        setMessagesState((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "assistant", content: data.response || "Sorry, no response." };
          return updated;
        });
        return;
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split("\n")) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") break;
          try {
            const parsed = JSON.parse(data);
            if (parsed.token) {
              setMessagesState((prev) => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                updated[updated.length - 1] = { ...last, content: last.content + parsed.token };
                return updated;
              });
            }
          } catch {}
        }
      }
    } catch (error: any) {
      if (error.name === "AbortError") return;

      // If streaming failed, try non-streaming fallback
      if (!error.message.includes("Pro") && !error.message.includes("401")) {
        try {
          const fallback = await fetch(`${API_BASE}/api/v1/chat`, {
            method: "POST",
            credentials: "include",
            headers: authHeaders,
            body: JSON.stringify({
              message: content,
              conversation_history: messages,
            }),
          });
          if (fallback.ok) {
            const data = await fallback.json();
            setMessagesState((prev) => {
              const updated = [...prev];
              updated[updated.length - 1] = { role: "assistant", content: data.response || "Sorry, no response." };
              return updated;
            });
            return;
          }
        } catch {}
      }

      setMessagesState((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: error.message.includes("Pro")
            ? "This feature requires Lumi Pro. Upgrade for $1/month to chat with your finances! 💛"
            : "Sorry, I encountered an error. Please try again.",
        };
        return updated;
      });
    } finally {
      setIsStreaming(false);
    }
  }, [messages]);

  const stopStreaming = () => {
    abortRef.current?.abort();
    setIsStreaming(false);
  };

  const clearChat = () => {
    setMessagesState([]);
    try { sessionStorage.removeItem(STORAGE_KEY); } catch {}
  };

  return { messages, isStreaming, sendMessage, stopStreaming, clearChat, setMessages };
}
