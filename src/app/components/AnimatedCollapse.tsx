import type { ReactNode } from "react";
import { AceGridExpandPanel } from "./AceGridExpandPanel";

export interface AnimatedCollapseProps {
  open: boolean;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}

/** Height collapse with ACE accordion grid motion. */
export function AnimatedCollapse({
  open,
  children,
  className,
  contentClassName,
}: AnimatedCollapseProps) {
  return (
    <AceGridExpandPanel open={open} className={className} contentClassName={contentClassName}>
      {children}
    </AceGridExpandPanel>
  );
}
