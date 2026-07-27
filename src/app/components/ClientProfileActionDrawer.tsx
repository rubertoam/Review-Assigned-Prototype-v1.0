import { useMemo } from "react";
import {
  AceDropdownMenu,
  type AceDropdownMenuEntry,
} from "@ace-ds/components/molecules/AceDropdownMenu/AceDropdownMenu";
import { MaterialSymbol } from "@ace-ds/components/molecules/AceAccordion/MaterialSymbol";
import { screeningToolbarIconButtonClass } from "@ace-ds/components/organisms/ScreeningResultsTable/screeningTableToolbar";
import {
  CLIENT_PROFILE_ACTIONS,
  clientProfileActionLabel,
  type ClientProfileActionId,
} from "../lib/clientProfileActions";
import { aceTypography, ACE_TYPE } from "../lib/aceTypography";
import { ClientDocumentsDrawerContent } from "./ClientDocumentsDrawerContent";
import { ClientHistoryDrawerContent } from "./ClientHistoryDrawerContent";
import { ClientNetworksDrawerContent } from "./ClientNetworksDrawerContent";
import { ClientNotesDrawerContent } from "./ClientNotesDrawerContent";
import { ClientReportsDrawerContent } from "./ClientReportsDrawerContent";
import { ClientRiskRatingDrawerContent } from "./ClientRiskRatingDrawerContent";
import { SideDrawer } from "./SideDrawer";
import { cn } from "./ui/utils";

const notoVar = { fontVariationSettings: "'CTGR' 0, 'wdth' 100" } as const;

export interface ClientProfileActionDrawerProps {
  open: boolean;
  action: ClientProfileActionId;
  onActionChange: (action: ClientProfileActionId) => void;
  onClose: () => void;
  caseIndex: number;
  className?: string;
}

export function ClientProfileActionDrawer({
  open,
  action,
  onActionChange,
  onClose,
  caseIndex,
  className,
}: ClientProfileActionDrawerProps) {
  const title = clientProfileActionLabel(action);

  const items = useMemo((): AceDropdownMenuEntry[] => {
    return CLIENT_PROFILE_ACTIONS.map((entry) => ({
      type: "item" as const,
      label: entry.label,
      highlighted: entry.id === action,
      onSelect: () => onActionChange(entry.id),
    }));
  }, [action, onActionChange]);

  return (
    <SideDrawer
      isOpen={open}
      onClose={onClose}
      widthStorageKey="review-assigned-client-profile-action-drawer-width"
      defaultWidth={480}
      className={cn("min-h-0 self-stretch", className)}
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="relative w-full shrink-0 bg-[var(--screening-surface)]">
          <div className="flex size-full flex-row items-center justify-between gap-3 overflow-clip rounded-[inherit] px-5 py-4">
            <p
              className={cn(
                aceTypography(ACE_TYPE.h6SmallBold),
                "shrink-0 whitespace-nowrap text-[var(--screening-text-primary)]",
              )}
              style={notoVar}
            >
              {title}
            </p>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className={screeningToolbarIconButtonClass}
            >
              <MaterialSymbol name="close" size="md" className="text-current" />
            </button>
          </div>
        </div>

        <div className="relative flex min-h-px w-full flex-1 flex-col gap-4 overflow-hidden bg-[var(--screening-surface)] px-5 py-4">
          <AceDropdownMenu
            triggerLabel={title}
            triggerMode="field"
            size="sm"
            panelWidth="wide"
            align="start"
            className={cn(
              "shrink-0 font-['Noto_Sans:Regular',sans-serif] font-normal",
              "!w-fit !max-w-none [&_span:first-of-type]:flex-none",
            )}
            items={items}
          />
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            {action === "documents" ? (
              <ClientDocumentsDrawerContent caseIndex={caseIndex} />
            ) : null}
            {action === "notes" ? (
              <ClientNotesDrawerContent caseIndex={caseIndex} onClose={onClose} />
            ) : null}
            {action === "history" ? (
              <ClientHistoryDrawerContent caseIndex={caseIndex} onClose={onClose} />
            ) : null}
            {action === "networks" ? (
              <ClientNetworksDrawerContent caseIndex={caseIndex} />
            ) : null}
            {action === "reports" ? <ClientReportsDrawerContent /> : null}
            {action === "risk-rating" ? (
              <ClientRiskRatingDrawerContent caseIndex={caseIndex} />
            ) : null}
          </div>
        </div>
      </div>
    </SideDrawer>
  );
}
