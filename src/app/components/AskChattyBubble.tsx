import { useEffect, useId, useRef, useState } from "react";
import { MaterialSymbol } from "@ace-ds/components/molecules/AceAccordion/MaterialSymbol";
import { aceTypography, ACE_TYPE } from "../lib/aceTypography";
import { aceIconButtonHoverClass } from "../lib/aceIconButton";
import { cn } from "./ui/utils";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

type AskChattyBubbleProps = {
  open: boolean;
  onClose: () => void;
};

const FALLBACK_REPLIES = [
  "Happy to help — try asking about Watchlist cases, Payments, KYC, or Reporting.",
  "I can walk you through FinScan features. What are you trying to do?",
  "Got it. Ask about Workbench, dashboards, or how to set your start page.",
] as const;

function buildChattyReply(input: string): string {
  const q = input.toLowerCase();

  if (/\b(hi|hello|hey|good (morning|afternoon|evening))\b/.test(q)) {
    return "Hello! I'm Chatty. Ask me about Watchlist, Payments, KYC, or Reporting.";
  }
  if (/\b(thank|thanks|thx)\b/.test(q)) {
    return "You're welcome. Anything else I can help with?";
  }
  if (/\b(watchlist|workbench|assigned cases?|sanction|pep)\b/.test(q)) {
    return "On Watchlist, open Workbench from the landing cards or the Watchlist menu to review matches. The red badge shows your open case count.";
  }
  if (/\b(payment|transaction|safe list)\b/.test(q)) {
    return "Payments screens incoming and outgoing transactions in real time. Start from Assigned Transactions or Payments Browser on the Payments landing page.";
  }
  if (/\b(kyc|client search|media search|verify|validate)\b/.test(q)) {
    return "KYC covers Client Search, Media Search, Verify, and Validate. Use the KYC landing cards or the KYC menu to jump into a search.";
  }
  if (/\b(report|dashboard|data manager|reporting)\b/.test(q)) {
    return "Reporting has Dashboard, Report Library, and Data Manager. Open Reporting in the header, then pick the tool you need.";
  }
  if (/\b(start page|home page|default)\b/.test(q)) {
    return "Check “Set as my start page” on a product landing. Only one product can be your start page at a time.";
  }
  if (/\b(dark mode|theme|appearance)\b/.test(q)) {
    return "Open your profile menu in the header and toggle Dark mode under Appearance.";
  }
  if (/\b(help|how do i|what can you)\b/.test(q)) {
    return "I can explain FinScan landings, navigation, and common review tasks. Try: “Where is Workbench?” or “How do I open Reporting?”";
  }
  if (/\b(bye|goodbye|see you)\b/.test(q)) {
    return "Bye for now — open Ask Chatty anytime you need a hand.";
  }

  const hash = [...input].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  return FALLBACK_REPLIES[hash % FALLBACK_REPLIES.length]!;
}

export function AskChattyBubble({ open, onClose }: AskChattyBubbleProps) {
  const titleId = useId();
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const replyTimerRef = useRef<number | null>(null);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<readonly ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const canSend = draft.trim().length > 0 && !isTyping;

  useEffect(() => {
    if (!open) return;
    const frame = window.requestAnimationFrame(() => inputRef.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [open]);

  useEffect(() => {
    return () => {
      if (replyTimerRef.current != null) {
        window.clearTimeout(replyTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const el = transcriptRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, isTyping, open]);

  if (!open) return null;

  const send = () => {
    const next = draft.trim();
    if (!next || isTyping) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: next,
    };
    setMessages((prev) => [...prev, userMessage]);
    setDraft("");
    setIsTyping(true);

    if (replyTimerRef.current != null) {
      window.clearTimeout(replyTimerRef.current);
    }
    replyTimerRef.current = window.setTimeout(() => {
      const reply: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        text: buildChattyReply(next),
      };
      setMessages((prev) => [...prev, reply]);
      setIsTyping(false);
      replyTimerRef.current = null;
    }, 550 + Math.min(900, next.length * 18));
  };

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby={titleId}
      className={cn(
        "fixed bottom-[5.5rem] right-6 z-30 flex w-[min(22.5rem,calc(100vw-2rem))] flex-col overflow-hidden",
        "rounded-[var(--radius-md)] border border-[var(--screening-border-strong)]",
        "bg-[var(--screening-surface)] shadow-[var(--ace-drop-shadow-lg)]",
        "animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-2",
        "duration-[var(--ace-motion-duration-medium)]",
        "[animation-timing-function:var(--ace-motion-ease-standard)]",
      )}
    >
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-[var(--screening-border-strong)] bg-[var(--screening-surface-muted)] px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <MaterialSymbol
            name="smart_toy"
            size="md"
            className="text-[var(--screening-primary)]"
          />
          <h2
            id={titleId}
            className={cn(
              aceTypography(ACE_TYPE.p1SemiBold),
              "m-0 truncate text-sm text-[var(--screening-text-primary)]",
            )}
          >
            Ask Chatty
          </h2>
        </div>
        <button
          type="button"
          aria-label="Close Ask Chatty"
          onClick={onClose}
          className={aceIconButtonHoverClass}
        >
          <MaterialSymbol name="close" size="md" />
        </button>
      </header>

      <div
        ref={transcriptRef}
        className="flex max-h-[36rem] min-h-[22.5rem] flex-col gap-3 overflow-y-auto px-4 py-3"
        aria-live="polite"
      >
        <p
          className={cn(
            aceTypography(ACE_TYPE.p1Regular),
            "m-0 text-sm text-[var(--screening-text-secondary)]",
          )}
        >
          Hi! I&apos;m Chatty. Ask me anything about FinScan.
        </p>
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "max-w-[85%] rounded-[var(--radius-md)] px-3 py-2 text-sm",
              aceTypography(ACE_TYPE.p1Regular),
              message.role === "user"
                ? "ml-auto bg-[var(--screening-primary-soft-bg)] text-[var(--screening-text-primary)]"
                : "mr-auto border border-[var(--screening-border-row)] bg-[var(--screening-surface-muted)] text-[var(--screening-text-primary)]",
            )}
          >
            {message.text}
          </div>
        ))}
        {isTyping ? (
          <div
            className={cn(
              "mr-auto inline-flex items-center gap-1 rounded-[var(--radius-md)] border border-[var(--screening-border-row)]",
              "bg-[var(--screening-surface-muted)] px-3 py-2 text-[var(--screening-text-secondary)]",
              aceTypography(ACE_TYPE.captionBold),
              "text-[10px] tracking-wide",
            )}
            aria-label="Chatty is typing"
          >
            <span className="animate-pulse">Chatty is typing…</span>
          </div>
        ) : null}
      </div>

      <form
        className="shrink-0 border-t border-[var(--screening-border-strong)] px-3 py-3"
        onSubmit={(event) => {
          event.preventDefault();
          send();
        }}
      >
        <div
          className={cn(
            "flex h-[var(--ace-input-height-sm)] min-w-0 items-center gap-1.5",
            "rounded-[var(--screening-input-radius)] border border-solid",
            "border-[var(--screening-input-border)] bg-[var(--color-surface)]",
            "pl-[var(--screening-input-px)] pr-1.5",
            "font-[family-name:var(--font-ace-inter)]",
            "transition-[background-color,border-color,box-shadow] duration-150 ease-out",
            "focus-within:border-[var(--screening-input-border-focus)]",
            "focus-within:bg-[var(--screening-input-bg-focus)]",
            "focus-within:shadow-[0_0_0_2px_var(--screening-input-focus-ring)]",
          )}
        >
          <input
            ref={inputRef}
            id={inputId}
            type="text"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Ask a question..."
            aria-label="Message for Chatty"
            disabled={isTyping}
            className={cn(
              "min-w-0 flex-1 border-0 bg-transparent p-0 outline-none",
              "text-[length:var(--ace-input-font-sm)] leading-[var(--ace-input-leading-sm)]",
              "text-[var(--screening-text-primary)] placeholder:text-[var(--screening-input-placeholder)]",
              "disabled:cursor-not-allowed",
            )}
          />
          <button
            type="submit"
            aria-label="Send message"
            disabled={!canSend}
            className={cn(
              "inline-flex size-5 shrink-0 items-center justify-center rounded-full",
              "bg-[var(--ace-button-purple-500)] text-white",
              "transition-opacity duration-[var(--ace-motion-duration-fast)]",
              "[transition-timing-function:var(--ace-motion-ease-standard)]",
              "hover:opacity-90",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ace-button-focus-ring)]",
              "disabled:cursor-not-allowed disabled:opacity-35",
            )}
          >
            <MaterialSymbol name="arrow_upward" className="text-[12px] leading-none" />
          </button>
        </div>
      </form>
    </div>
  );
}
