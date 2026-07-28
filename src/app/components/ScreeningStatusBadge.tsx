import type { ReactNode } from "react";
import type { AceBadgeVariant } from "@ace-ds/components/atoms/AceBadge/badgeFieldStyles";
import { AceBadge } from "@ace-ds/components/atoms/AceBadge/AceBadge";

/** Map screening decision statuses to ACE badge color variants. */
export const SCREENING_STATUS_BADGE_VARIANT: Record<string, AceBadgeVariant> = {
  New: "purple",
  "Documents Required": "yellow",
  Safe: "green",
  "Escalate to Team Lead": "orange",
  "Documents Uploaded": "blue",
  /** Legacy / history display */
  Escalate: "orange",
  "Flag for EDD": "yellow",
  "Research (Internal)": "blue",
  "Research (External)": "teal",
  "Route to Supervisor": "pink",
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
