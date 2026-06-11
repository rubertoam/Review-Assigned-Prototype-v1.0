import type { ReactNode } from "react";
import { durationAccordion, easeAccordion } from "./ExpandableFinScanTable";
import { cn } from "./ui/utils";

export interface AnimatedCollapseProps {
  open: boolean;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}

/** Height collapse with the same easing used for expandable table rows. */
export function AnimatedCollapse({
  open,
  children,
  className,
  contentClassName,
}: AnimatedCollapseProps) {
  return (
    <div
      className={cn(
        "grid transition-[grid-template-rows] will-change-[grid-template-rows]",
        durationAccordion,
        easeAccordion,
        open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        className,
      )}
      aria-hidden={!open}
    >
      <div className={cn("min-h-0 overflow-hidden", contentClassName)}>{children}</div>
    </div>
  );
}
