import { cn } from "../components/ui/utils";

/**
 * ACE “No border stroke” icon button — transparent at rest;
 * hover fills surface + 1px ring (DialogModal close, sidebar pin, drawers).
 */
export const aceIconButtonHoverClass = cn(
  "relative z-[1] inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-[var(--radius-sm)]",
  "text-[var(--screening-text-primary)]",
  "transition-[background-color,box-shadow,color]",
  "duration-[var(--ace-motion-duration-medium)]",
  "[transition-timing-function:var(--ace-motion-ease-standard)]",
  "motion-reduce:transition-none motion-reduce:duration-0",
  "hover:bg-[var(--screening-surface-hover)] hover:shadow-[0_0_0_1px_var(--screening-border-strong)]",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--screening-primary-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--screening-primary-ring-offset)]",
);
