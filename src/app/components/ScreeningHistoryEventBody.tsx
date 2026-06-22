import { aceTypography, ACE_TYPE } from "../lib/aceTypography";
import type { ScreeningHistoryDetail } from "../lib/screeningHistoryData";
import { cn } from "./ui/utils";

const notoVar = { fontVariationSettings: "'CTGR' 0, 'wdth' 100" } as const;

const detailRows: { key: keyof ScreeningHistoryDetail; label: string }[] = [
  { key: "reason", label: "Reason" },
  { key: "comment", label: "Comment" },
  { key: "listVersion", label: "List Version" },
  { key: "timeViewed", label: "Time Viewed" },
  { key: "daysOpen", label: "Days Open" },
];

export function ScreeningHistoryEventBody({ details }: { details: ScreeningHistoryDetail }) {
  return (
    <div className="flex w-full flex-col items-start justify-start gap-2 px-1 py-1">
      {detailRows.map(({ key, label }) => (
        <p
          key={key}
          className={cn(
            aceTypography(ACE_TYPE.p1Regular),
            "m-0 w-full text-[var(--screening-text-primary)]",
          )}
          style={notoVar}
        >
          <span className={cn(aceTypography(ACE_TYPE.p1SemiBold), "text-[var(--screening-text-primary)]")}>
            {label}
          </span>
          <span className="text-[var(--screening-text-muted)]"> · </span>
          <span>{details[key]}</span>
        </p>
      ))}
    </div>
  );
}
