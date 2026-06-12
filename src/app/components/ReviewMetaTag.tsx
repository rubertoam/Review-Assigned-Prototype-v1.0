import { aceTypography, ACE_TYPE } from "../lib/aceTypography";
import { cn } from "./ui/utils";

/** Small bordered meta tag (e.g. Level 1, Client ID). */
export function ReviewMetaTag({ children, className }: { children: string; className?: string }) {
  return (
    <span
      className={cn(
        aceTypography(ACE_TYPE.captionBold),
        "inline-flex shrink-0 items-center rounded-[var(--radius-sm)] border border-[var(--screening-border-strong)] bg-[var(--screening-surface-muted)] px-2 py-0.5 text-[var(--screening-text-secondary)]",
        className,
      )}
    >
      {children}
    </span>
  );
}
