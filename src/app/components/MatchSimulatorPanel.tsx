import { MaterialSymbol } from "@ace-ds/components/molecules/AceAccordion/MaterialSymbol";
import { aceTypography, ACE_TYPE } from "../lib/aceTypography";
import { cn } from "./ui/utils";
import type { ScreeningResultRow } from "./ScreeningResultsTable";
import { MatchSimulatorContent } from "./MatchSimulatorDrawerContent";

const notoVar = { fontVariationSettings: "'CTGR' 0, 'wdth' 100" } as const;

export interface MatchSimulatorPanelProps {
  row: ScreeningResultRow;
  onBack: () => void;
  /** When true, omit Back + title (parent shell provides navigation). */
  hideChrome?: boolean;
}

export function MatchSimulatorPanel({
  row,
  onBack,
  hideChrome = false,
}: MatchSimulatorPanelProps) {
  const body = (
    <div className="min-h-0 flex-1 overflow-y-auto bg-[var(--screening-surface)] px-4 py-4">
      <MatchSimulatorContent row={row} layout="inline" />
    </div>
  );

  if (hideChrome) {
    return <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">{body}</div>;
  }

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
          Match Simulator
        </p>
      </div>
      {body}
    </div>
  );
}
