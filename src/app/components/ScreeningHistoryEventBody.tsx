import { useCallback } from "react";
import { aceTypography, ACE_TYPE } from "../lib/aceTypography";
import type { ScreeningHistoryDetail } from "../lib/screeningHistoryData";
import { ClientProfileCopyButton } from "./ClientProfileCopyablePanel";
import { cn } from "./ui/utils";

const notoVar = { fontVariationSettings: "'CTGR' 0, 'wdth' 100" } as const;

const detailRows: { key: keyof ScreeningHistoryDetail; label: string }[] = [
  { key: "reason", label: "Reason" },
  { key: "comment", label: "Comment" },
  { key: "listVersion", label: "List Version" },
  { key: "timeViewed", label: "Time Viewed" },
  { key: "daysOpen", label: "Days Open" },
];

function DetailLine({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <p
      className={cn(
        aceTypography(ACE_TYPE.p1Regular),
        "m-0 min-w-0 flex-1 text-[var(--screening-text-primary)]",
      )}
      style={notoVar}
    >
      <span className={cn(aceTypography(ACE_TYPE.p1SemiBold), "text-[var(--screening-text-primary)]")}>
        {label}
      </span>
      <span className="text-[var(--screening-text-muted)]"> · </span>
      <span>{value}</span>
    </p>
  );
}

export function ScreeningHistoryEventBody({ details }: { details: ScreeningHistoryDetail }) {
  const getCommentText = useCallback(() => details.comment, [details.comment]);

  return (
    <div className="flex w-full flex-col items-start justify-start gap-2 px-1 py-1">
      {detailRows.map(({ key, label }) => {
        if (key === "comment") {
          return (
            <div key={key} className="flex w-full items-start gap-2">
              <div className="shrink-0 pt-0.5">
                <ClientProfileCopyButton getText={getCommentText} label="Copy comment" />
              </div>
              <DetailLine label={label} value={details.comment} />
            </div>
          );
        }

        return <DetailLine key={key} label={label} value={details[key]} />;
      })}
    </div>
  );
}
