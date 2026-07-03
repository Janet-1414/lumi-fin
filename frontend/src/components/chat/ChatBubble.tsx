"use client";
import { clsx } from "clsx";
import LumiAvatar from "./LumiAvatar";
import type { ChatMessage } from "@/types/api";

interface ChatBubbleProps {
  message: ChatMessage;
  isStreaming?: boolean;
}

function renderInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const regex = /\*\*(.+?)\*\*|\*(.+?)\*/g;
  let last = 0;
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    if (match[1] !== undefined) {
      parts.push(<strong key={match.index} className="font-semibold">{match[1]}</strong>);
    } else if (match[2] !== undefined) {
      parts.push(<em key={match.index}>{match[2]}</em>);
    }
    last = regex.lastIndex;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts.length === 0 ? text : <>{parts}</>;
}

function splitInlineNumbered(text: string): string[] | null {
  const parts = text.split(/(?=\d+[.)]\s)/);
  const numbered = parts.filter((p) => /^\d+[.)]\s/.test(p.trim()));
  if (numbered.length >= 2) return parts.filter((p) => p.trim());
  return null;
}

function splitInlineBullets(text: string): string[] | null {
  const parts = text.split(/(?=[-•]\s)/);
  const bullets = parts.filter((p) => /^[-•]\s/.test(p.trim()));
  if (bullets.length >= 2) return parts.filter((p) => p.trim());
  return null;
}

function renderMarkdown(text: string): React.ReactNode {
  // Fix streaming artifacts — collapse orphaned digits/commas back onto previous line
  const cleaned = text
    .replace(/(\d+,)\n(\d)/g, "$1$2")
    .replace(/,\n(\d{3})/g, ",$1")
    .replace(/(\d)\n(\d{3}[,\s])/g, "$1$2");

  // Try splitting the whole text by numbered items inline
  const inlineNumbered = splitInlineNumbered(cleaned);
  if (inlineNumbered) {
    const intro = inlineNumbered.filter((p) => !/^\d+[.)]\s/.test(p.trim()));
    const items = inlineNumbered.filter((p) => /^\d+[.)]\s/.test(p.trim()));
    return (
      <div className="space-y-2">
        {intro.map((p, i) => <p key={i} className="leading-relaxed">{renderInline(p.trim())}</p>)}
        <ol className="list-decimal list-outside ml-4 space-y-2">
          {items.map((item, i) => (
            <li key={i}>{renderInline(item.replace(/^\d+[.)]\s+/, "").trim())}</li>
          ))}
        </ol>
      </div>
    );
  }

  // Try splitting the whole text by inline bullets
  const inlineBullets = splitInlineBullets(cleaned);
  if (inlineBullets) {
    const intro = inlineBullets.filter((p) => !/^[-•]\s/.test(p.trim()));
    const items = inlineBullets.filter((p) => /^[-•]\s/.test(p.trim()));
    return (
      <div className="space-y-2">
        {intro.map((p, i) => <p key={i} className="leading-relaxed">{renderInline(p.trim())}</p>)}
        <ul className="list-disc list-outside ml-4 space-y-2">
          {items.map((item, i) => (
            <li key={i}>{renderInline(item.replace(/^[-•]\s+/, "").trim())}</li>
          ))}
        </ul>
      </div>
    );
  }

  // Process line by line for multi-line responses
  const lines = cleaned.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const trimmed = lines[i].trim();
    if (!trimmed) { i++; continue; }

    if (/^\d+[.)]\s+/.test(trimmed)) {
      const items: React.ReactNode[] = [];
      while (i < lines.length && /^\d+[.)]\s+/.test(lines[i].trim())) {
        const content = lines[i].trim().replace(/^\d+[.)]\s+/, "");
        items.push(<li key={i}>{renderInline(content)}</li>);
        i++;
      }
      elements.push(
        <ol key={`ol-${i}`} className="list-decimal list-outside ml-4 space-y-2 my-2">
          {items}
        </ol>
      );
      continue;
    }

    if (/^[-*•]\s+/.test(trimmed)) {
      const items: React.ReactNode[] = [];
      while (i < lines.length && /^[-*•]\s+/.test(lines[i].trim())) {
        const content = lines[i].trim().replace(/^[-*•]\s+/, "");
        items.push(<li key={i}>{renderInline(content)}</li>);
        i++;
      }
      elements.push(
        <ul key={`ul-${i}`} className="list-disc list-outside ml-4 space-y-2 my-2">
          {items}
        </ul>
      );
      continue;
    }

    elements.push(
      <p key={i} className="leading-relaxed">{renderInline(trimmed)}</p>
    );
    i++;
  }

  return <div className="space-y-2">{elements}</div>;
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
          "max-w-[80%] px-4 py-3 rounded-card text-sm",
          isUser
            ? "bg-mg-gold/20 border border-mg-gold/30 text-[var(--text-primary)] rounded-tr-sm"
            : "bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-primary)] rounded-tl-sm",
          isStreaming && !isUser && message.content === "" && "streaming-cursor"
        )}
      >
        {isUser ? (
          <p className="leading-relaxed">{message.content}</p>
        ) : (
          <>
            {renderMarkdown(message.content)}
            {isStreaming && !isUser && message.content !== "" && (
              <span className="streaming-cursor" />
            )}
          </>
        )}
      </div>
    </div>
  );
}