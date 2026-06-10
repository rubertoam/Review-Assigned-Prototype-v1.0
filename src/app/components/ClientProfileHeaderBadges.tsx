import type { ReactNode } from "react";
import { AceBadge } from "@ace-ds/components/atoms/AceBadge/AceBadge";
import { cn } from "./ui/utils";

/** Filled circular alert (Escalated orange) for overdue indicators. */
export function OverdueWarningIcon({ className = "size-4 text-[10px]" }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-[#ef6c00] font-['Noto_Sans:Bold',sans-serif] font-bold leading-none text-white",
        className,
      )}
      aria-hidden
    >
      !
    </span>
  );
}

const profileBadgeClass = "self-center";

export function ClientProfileMetaBadge({ children }: { children: ReactNode }) {
  return (
    <AceBadge variant="active" className={profileBadgeClass}>
      {children}
    </AceBadge>
  );
}

export function ClientProfileOverdueBadge() {
  return (
    <AceBadge
      variant="active"
      className={cn(
        profileBadgeClass,
        "border border-[var(--screening-pill-escalated-dot)] bg-[var(--ace-warning-50)] text-[var(--screening-pill-escalated-label)]",
        "[&>span]:inline-flex [&>span]:items-center [&>span]:gap-1.5",
      )}
    >
      <OverdueWarningIcon className="size-3 text-[8px]" />
      Overdue Warning
    </AceBadge>
  );
}
