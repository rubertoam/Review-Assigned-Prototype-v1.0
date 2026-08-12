import { AceTabs } from "@ace-ds/components/atoms/AceTabs/AceTabs";
import { MaterialSymbol } from "@ace-ds/components/molecules/AceAccordion/MaterialSymbol";
import type { ReactNode } from "react";
import { aceTypography, ACE_TYPE } from "../lib/aceTypography";
import { cn } from "./ui/utils";

const notoVar = { fontVariationSettings: "'CTGR' 0, 'wdth' 100" } as const;

export const ROW_DRILLDOWN_TAB_ITEMS = [
  { id: "screening-history", label: "Match History" },
  { id: "documents", label: "Documents" },
  { id: "match-simulator", label: "Match Simulator" },
  { id: "list-history", label: "List History" },
] as const;

export type RowDrilldownViewId = (typeof ROW_DRILLDOWN_TAB_ITEMS)[number]["id"];

export interface RowDrilldownShellProps {
  view: RowDrilldownViewId;
  onViewChange: (view: RowDrilldownViewId) => void;
  onBack: () => void;
  matchName: string;
  children: ReactNode;
}

export function RowDrilldownShell({
  view,
  onViewChange,
  onBack,
  matchName,
  children,
}: RowDrilldownShellProps) {
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <div className="shrink-0 border-b border-[var(--screening-border-strong)] bg-[var(--screening-surface)] px-4 pb-0 pt-3">
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
        <AceTabs
          aria-label="Match detail views"
          className="gap-4"
          items={[...ROW_DRILLDOWN_TAB_ITEMS]}
          value={view}
          onValueChange={(next) => onViewChange(next as RowDrilldownViewId)}
        />
        <p className="sr-only">Selected match: {matchName}</p>
      </div>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">{children}</div>
    </div>
  );
}
