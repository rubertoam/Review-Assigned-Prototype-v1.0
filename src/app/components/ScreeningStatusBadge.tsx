import type { ReactNode } from "react";
import type { AceBadgeVariant } from "@ace-ds/components/atoms/AceBadge/badgeFieldStyles";
import { AceBadge } from "@ace-ds/components/atoms/AceBadge/AceBadge";

/** Map screening decision statuses to ACE badge color variants. */
export const SCREENING_STATUS_BADGE_VARIANT: Record<string, AceBadgeVariant> = {
  New: "purple",
  Escalate: "orange",
  "Flag for EDD": "yellow",
  "Research (Internal)": "blue",
  "Research (External)": "teal",
  "Route to Supervisor": "pink",
  Safe: "green",
  "Confirmed Safe": "green",
  "False Positive": "gray",
  Remediate: "red",
};

export function ScreeningStatusBadge({
  status,
  className,
  children,
}: {
  status: string;
  className?: string;
  /** Optional display label when variant is keyed by a different status string. */
  children?: ReactNode;
}) {
  const variant = SCREENING_STATUS_BADGE_VARIANT[status] ?? "orange";
  return (
    <AceBadge appearance="pill" variant={variant} className={className}>
      {children ?? status}
    </AceBadge>
  );
}
