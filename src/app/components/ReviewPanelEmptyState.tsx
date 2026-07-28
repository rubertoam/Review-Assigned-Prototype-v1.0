import type { ReactNode } from "react";
import { aceDropShadowXsClass } from "../lib/aceShadow";
import { cn } from "./ui/utils";

const notoVar = { fontVariationSettings: "'CTGR' 0, 'wdth' 100" } as const;

export interface ReviewPanelEmptyStateProps {
  message: string;
  children?: ReactNode;
}

export function ReviewPanelEmptyState({ message, children }: ReviewPanelEmptyStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-0 min-w-0 flex-1 flex-col items-center justify-center gap-4 rounded-[var(--radius-sm)] border border-[var(--screening-border-strong)] bg-[var(--screening-surface)] px-6 py-16 text-center",
        aceDropShadowXsClass,
      )}
    >
      <p
        className="m-0 max-w-sm font-['Noto_Sans:Regular',sans-serif] text-[14px] leading-[1.65] text-[var(--ace-neutral-800)]"
        style={notoVar}
      >
        {message}
      </p>
      {children}
    </div>
  );
}
