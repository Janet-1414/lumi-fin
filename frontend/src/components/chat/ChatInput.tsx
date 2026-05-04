"use client";
import { useState, KeyboardEvent } from "react";
import { Send, Square } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  onStop: () => void;
  isStreaming: boolean;
  disabled?: boolean;
}

export default function ChatInput({ onSend, onStop, isStreaming, disabled }: ChatInputProps) {
  const [value, setValue] = useState("");

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || isStreaming) return;
    onSend(trimmed);
    setValue("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex gap-2 items-end p-3 border border-[var(--border)] rounded-card bg-[var(--bg-card)]">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask Lumi anything about your finances..."
        disabled={disabled}
        rows={1}
        className="flex-1 bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] resize-none focus:outline-none max-h-32 min-h-[20px]"
        style={{ lineHeight: "1.5" }}
      />
      {isStreaming ? (
        <button onClick={onStop} className="w-8 h-8 rounded-card bg-mg-alert/20 flex items-center justify-center text-mg-alert hover:bg-mg-alert/30 transition-all flex-shrink-0">
          <Square size={14} fill="currentColor" />
        </button>
      ) : (
        <button
          onClick={handleSend}
          disabled={!value.trim() || disabled}
          className="w-8 h-8 rounded-card bg-mg-gold flex items-center justify-center text-mg-bg hover:bg-yellow-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex-shrink-0"
        >
          <Send size={14} />
        </button>
      )}
    </div>
  );
}
