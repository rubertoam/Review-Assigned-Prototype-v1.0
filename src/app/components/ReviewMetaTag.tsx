import { AceBadge } from "@ace-ds/components/atoms/AceBadge/AceBadge";
import { cn } from "./ui/utils";

/** Small bordered meta tag (e.g. Level 1, Client ID) — ACE badge tag, gray. */
export function ReviewMetaTag({ children, className }: { children: string; className?: string }) {
  return (
    <AceBadge appearance="tag" variant="gray" className={cn(className)}>
      {children}
    </AceBadge>
  );
}
