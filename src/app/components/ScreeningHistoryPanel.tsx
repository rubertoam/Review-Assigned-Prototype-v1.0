import { MaterialSymbol } from "@ace-ds/components/molecules/AceAccordion/MaterialSymbol";
import { aceTypography, ACE_TYPE } from "../lib/aceTypography";
import { cn } from "./ui/utils";
import { ScreeningHistoryTimelineView } from "./ScreeningHistoryTimelineView";
import type { ScreeningResultRow } from "./ScreeningResultsTable";

const notoVar = { fontVariationSettings: "'CTGR' 0, 'wdth' 100" } as const;

export interface ScreeningHistoryPanelProps {
  row: ScreeningResultRow;
  onBack: () => void;
}

export function ScreeningHistoryPanel({ row, onBack }: ScreeningHistoryPanelProps) {
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <div className="shrink-0 bg-[var(--screening-surface)] px-4 pb-2 pt-3">
        <button
          type="button"
          onClick={onBack}
          className={cn(
            "mb-3 inline-flex cursor-pointer items-center gap-1 rounded-[var(--radius-sm)] border-0 bg-transparent p-0 text-[var(--screening-primary)] transition-colors",
            "hover:text-[var(--dialog-modal-primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--screening-primary-ring)] focus-visible:ring-offset-2",
          )}
        >
          <MaterialSymbol name="keyboard_arrow_left" size="md" />
          <span
            className={cn(aceTypography(ACE_TYPE.p1Bold), "text-[var(--screening-primary)]")}
            style={notoVar}
          >
            Back to List
          </span>
        </button>
        <p
          className={cn(aceTypography(ACE_TYPE.p1SemiBold), "text-[var(--screening-text-primary)]")}
          style={notoVar}
        >
          Screening History
        </p>
        <p className="sr-only">Selected match: {row.name}</p>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto bg-[var(--screening-surface)] px-4 py-4">
        <ScreeningHistoryTimelineView row={row} />
      </div>
    </div>
  );
}
