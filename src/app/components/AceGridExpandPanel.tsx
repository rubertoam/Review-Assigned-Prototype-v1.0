import type { ReactNode } from "react";
import { cn } from "./ui/utils";

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
}: {
  open: boolean;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}) {
  return (
    <div
      className={cn(
        "grid overflow-hidden transition-[grid-template-rows]",
        "duration-[var(--ace-accordion-duration)] [transition-timing-function:var(--ace-accordion-ease)]",
        open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        className,
      )}
      aria-hidden={!open}
    >
      <div className="min-h-0 overflow-hidden">
        <div className={contentClassName}>{children}</div>
      </div>
    </div>
  );
}
