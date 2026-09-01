import type { ReactNode, TransitionEvent } from "react";
import { cn } from "./ui/utils";

/** Keep in sync with `--ace-accordion-duration` (variables.css). */
export const ACE_ACCORDION_DURATION_MS = 420;

/**
 * Same grid expand/collapse shell as ACE `AccordionPanel`
 * (`AceAccordion` / `--ace-accordion-duration` + `--ace-accordion-ease`).
 *
 * Padding and backgrounds belong on `contentClassName` (inner wrapper), not on the
 * `min-h-0 overflow-hidden` clip layer — otherwise collapsed rows leak content.
 */
export function AceGridExpandPanel({
  open,
  children,
  className,
  contentClassName,
  /** When false, skip the grid-rows transition (bulk expand/collapse). Default true. */
  animate = true,
  onTransitionEnd,
}: {
  open: boolean;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  animate?: boolean;
  onTransitionEnd?: (event: TransitionEvent<HTMLDivElement>) => void;
}) {
  return (
    <div
      className={cn(
        "grid overflow-hidden",
        // Always declare the transition property so toggling `animate` back on
        // can interpolate on the next open/close (duration-0 when skipped).
        "transition-[grid-template-rows] [transition-timing-function:var(--ace-accordion-ease)]",
        animate ? "duration-[420ms]" : "duration-0",
        open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        className,
      )}
      aria-hidden={!open}
      onTransitionEnd={onTransitionEnd}
    >
      <div className="min-h-0 overflow-hidden">
        <div className={contentClassName}>{children}</div>
      </div>
    </div>
  );
}
