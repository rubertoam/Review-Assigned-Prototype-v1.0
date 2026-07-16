import {
  aceBadgeTagLabelClass,
  aceBadgeTagNeutralTokens,
  aceBadgeTagShellClass,
} from "@ace-ds/components/atoms/AceBadge/badgeFieldStyles";
import { cn } from "./ui/utils";
import type { CSSProperties } from "react";

/** Small bordered meta tag (e.g. Level 1, Client ID) — ACE badge tag / neutral tokens. */
export function ReviewMetaTag({ children, className }: { children: string; className?: string }) {
  return (
    <span
      className={cn(aceBadgeTagShellClass, className)}
      style={
        {
          "--ace-badge-tag-border": aceBadgeTagNeutralTokens.border,
          "--ace-badge-tag-surface": aceBadgeTagNeutralTokens.surface,
          "--ace-badge-tag-label": aceBadgeTagNeutralTokens.label,
        } as CSSProperties
      }
    >
      <span className={aceBadgeTagLabelClass}>{children}</span>
    </span>
  );
}
