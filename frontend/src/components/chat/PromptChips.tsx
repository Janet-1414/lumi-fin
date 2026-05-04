"use client";

const SUGGESTED_PROMPTS = [
  "How much did I spend this month?",
  "What are my top expenses?",
  "How close am I to my savings goals?",
  "Give me tips to save more money",
  "What's my current streak?",
  "Help me create a budget",
];

interface PromptChipsProps {
  onSelect: (prompt: string) => void;
}

export default function PromptChips({ onSelect }: PromptChipsProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {SUGGESTED_PROMPTS.map((prompt) => (
        <button
          key={prompt}
          onClick={() => onSelect(prompt)}
          className="px-3 py-1.5 rounded-full border border-[var(--border)] text-xs text-[var(--text-secondary)] hover:border-mg-gold/50 hover:text-mg-gold hover:bg-mg-gold/5 transition-all"
        >
          {prompt}
        </button>
      ))}
    </div>
  );
}
