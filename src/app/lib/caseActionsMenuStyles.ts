import { cn } from "../components/ui/utils";

/** Three-dot menu trigger in the client profile accordion header. */
export const caseActionsMenuTriggerClass = cn(
  "inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-[var(--radius-sm)] border border-[var(--screening-border-strong)] bg-[var(--screening-surface)] text-[var(--screening-text-secondary)] transition-colors duration-200 ease-out",
  "hover:border-[var(--screening-border-hover)] hover:bg-[var(--screening-surface-hover)] hover:text-[var(--screening-text-primary)]",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--screening-primary-ring)] focus-visible:ring-offset-2",
);

export const caseActionsMenuIconClass = "text-current";

/** Same trigger as client profile; show on row hover / open / focus. */
export const screeningRowActionsMenuTriggerClass = cn(
  caseActionsMenuTriggerClass,
  "opacity-0 pointer-events-none group-hover/row:pointer-events-auto group-hover/row:opacity-100",
  "data-[state=open]:pointer-events-auto data-[state=open]:opacity-100",
  "data-[state=open]:border-[var(--screening-border-hover)] data-[state=open]:bg-[var(--screening-surface-hover)] data-[state=open]:text-[var(--screening-text-primary)]",
  "focus-visible:pointer-events-auto focus-visible:opacity-100",
);

/** Compact panel sized to longest label; at least as wide as the trigger. */
export const screeningRowActionsMenuContentClass =
  "w-max min-w-[var(--radix-dropdown-menu-trigger-width)]";

export const screeningRowActionsMenuItemClass = "w-full whitespace-nowrap";

/** Client profile overflow — same sizing so longer labels (e.g. View Networks) fit. */
export const caseActionsMenuContentClass = screeningRowActionsMenuContentClass;
export const caseActionsMenuItemClass = screeningRowActionsMenuItemClass;
