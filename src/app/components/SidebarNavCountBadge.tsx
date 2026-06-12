import { aceTypography, ACE_TYPE } from "../lib/aceTypography";
import { cn } from "./ui/utils";

export function SidebarNavCountBadge({
  count,
  badgeLabelClass,
}: {
  count: number;
  badgeLabelClass: string;
}) {
  return (
    <span
      className={cn(
        "mr-3 inline-flex shrink-0 items-center justify-end tabular-nums",
        aceTypography(ACE_TYPE.captionBold),
        badgeLabelClass,
      )}
      aria-hidden
    >
      {count}
    </span>
  );
}
