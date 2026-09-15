import { useEffect, useId, useState, type ReactNode } from "react";
import { DialogModal } from "@ace-ds/components/molecules/DialogModal/DialogModal";
import { AceTabs, aceTabButtonId } from "./ui/ace-tabs";
import { getGeneralProfileViewForRow } from "../lib/listProfileData";
import { DocumentsPanel } from "./DocumentsPanel";
import { ListHistoryPanel } from "./ListHistoryPanel";
import { MatchSimulatorPanel } from "./MatchSimulatorPanel";
import {
  ROW_DRILLDOWN_TAB_ITEMS,
  type RowDrilldownViewId,
} from "./RowDrilldownShell";
import { ScreeningHistoryPanel } from "./ScreeningHistoryPanel";
import { ScreeningStatusBadge } from "./ScreeningStatusBadge";
import type { ScreeningResultRow } from "./ScreeningResultsTable";
import { cn } from "./ui/utils";

const matchAlertDrilldownModalShellClass = cn(
  "!flex !h-fit !max-h-[min(85vh,calc(100dvh-2rem))] !w-full !max-w-[min(56rem,calc(100vw-2rem))] !flex-col !overflow-hidden",
);

function listProfileNameForRow(row: ScreeningResultRow): string {
  const view = getGeneralProfileViewForRow(row);
  const nameField = view.comparison.find((field) => field.field === "Name");
  return nameField?.list?.trim() || row.name;
}

function MatchAlertDrilldownTitle({
  name,
  status,
}: {
  name: string;
  status: string;
}): ReactNode {
  return (
    <span className="inline-flex min-w-0 max-w-full flex-wrap items-center gap-2">
      <span className="min-w-0 truncate">{name}</span>
      <ScreeningStatusBadge status={status} className="shrink-0" />
    </span>
  );
}

export interface MatchAlertDrilldownModalProps {
  open: boolean;
  row: ScreeningResultRow | null;
  view: RowDrilldownViewId | null;
  onViewChange: (view: RowDrilldownViewId) => void;
  onClose: () => void;
}

export function MatchAlertDrilldownModal({
  open,
  row,
  view,
  onViewChange,
  onClose,
}: MatchAlertDrilldownModalProps) {
  const tabPrefix = useId();
  const titleName = row ? listProfileNameForRow(row) : "Match details";
  const activeView = view ?? "screening-history";
  const [mountedView, setMountedView] = useState(activeView);

  useEffect(() => {
    if (open && view) setMountedView(view);
  }, [open, view]);

  return (
    <DialogModal
      open={open && row != null && view != null}
      onClose={onClose}
      title={
        row ? (
          <MatchAlertDrilldownTitle name={titleName} status={row.status} />
        ) : (
          titleName
        )
      }
      size="lg"
      fitContent
      className={matchAlertDrilldownModalShellClass}
      bodyClassName={cn(
        // Cap at the panel max-height: keep header/footer fixed and scroll the body.
        "!mt-3 !min-h-0 !flex-1 !gap-0 !overflow-y-auto",
        "[&>div]:!pt-0 [&>div]:!gap-0 [&>div]:!flex-none",
      )}
      primaryAction={{
        label: "Close",
        onClick: onClose,
      }}
    >
      {row ? (
        <div className="flex flex-col">
          <div className="shrink-0">
            <AceTabs
              items={[...ROW_DRILLDOWN_TAB_ITEMS]}
              value={mountedView}
              onValueChange={(next) => onViewChange(next as RowDrilldownViewId)}
              idPrefix={tabPrefix}
              aria-label="Match detail views"
            />
          </div>
          {/* Keep List History in the layout stack so shorter tabs don’t shrink the modal. */}
          <div
            role="tabpanel"
            id={`${tabPrefix}-panel-${mountedView}`}
            aria-labelledby={aceTabButtonId(tabPrefix, mountedView)}
            className="mt-3 grid"
          >
            <div
              className={cn(
                "col-start-1 row-start-1",
                mountedView !== "list-history" && "invisible pointer-events-none",
              )}
              aria-hidden={mountedView !== "list-history"}
              {...(mountedView !== "list-history" ? ({ inert: "" } as { inert: string }) : {})}
            >
              <ListHistoryPanel row={row} onBack={onClose} hideChrome />
            </div>
            {mountedView !== "list-history" ? (
              <div className="col-start-1 row-start-1 flex h-full min-h-0 flex-col">
                {mountedView === "screening-history" ? (
                  <ScreeningHistoryPanel row={row} onBack={onClose} hideChrome />
                ) : null}
                {mountedView === "documents" ? (
                  <DocumentsPanel row={row} onBack={onClose} hideChrome />
                ) : null}
                {mountedView === "match-simulator" ? (
                  <MatchSimulatorPanel row={row} onBack={onClose} hideChrome />
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </DialogModal>
  );
}
