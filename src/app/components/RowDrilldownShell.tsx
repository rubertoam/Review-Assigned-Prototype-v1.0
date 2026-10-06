import { AceTabs } from "@ace-ds/components/atoms/AceTabs/AceTabs";
import { MaterialSymbol } from "@ace-ds/components/molecules/AceAccordion/MaterialSymbol";
import type { ReactNode } from "react";
import { aceTypography, ACE_TYPE } from "../lib/aceTypography";
import { ScreeningStatusBadge } from "./ScreeningStatusBadge";
import { cn } from "./ui/utils";

const notoVar = { fontVariationSettings: "'CTGR' 0, 'wdth' 100" } as const;

export const ROW_DRILLDOWN_TAB_ITEMS = [
  { id: "screening-history", label: "Match History" },
  { id: "match-simulator", label: "Match Summary" },
  { id: "list-history", label: "List History" },
  { id: "documents", label: "Documents" },
] as const;

export type RowDrilldownViewId = (typeof ROW_DRILLDOWN_TAB_ITEMS)[number]["id"];

export function rowDrilldownTabItems(documentsCount: number) {
  return ROW_DRILLDOWN_TAB_ITEMS.map((item) =>
    item.id === "documents"
      ? { id: item.id, label: `Documents (${documentsCount})` }
      : { id: item.id, label: item.label },
  );
}

export interface RowDrilldownShellProps {
  view: RowDrilldownViewId;
  onViewChange: (view: RowDrilldownViewId) => void;
  onBack: () => void;
  /** List Record name shown in the drill-down header. */
  matchName: string;
  /** Match status shown beside the List Record name. */
  status: string;
  /** Current match document count for the Documents tab label. */
  documentsCount?: number;
  children: ReactNode;
}

export function RowDrilldownShell({
  view,
  onViewChange,
  onBack,
  matchName,
  status,
  documentsCount = 0,
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
        <div className="mb-3 flex min-w-0 flex-wrap items-center gap-2">
          <h2
            className={cn(
              aceTypography(ACE_TYPE.h6Bold),
              "m-0 min-w-0 truncate text-[var(--screening-text-primary)]",
            )}
            style={notoVar}
            title={matchName}
          >
            {matchName}
          </h2>
          <ScreeningStatusBadge status={status} className="shrink-0" />
        </div>
        <AceTabs
          aria-label="Match detail views"
          className="gap-4"
          items={rowDrilldownTabItems(documentsCount)}
          value={view}
          onValueChange={(next) => onViewChange(next as RowDrilldownViewId)}
        />
      </div>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">{children}</div>
    </div>
  );
}
