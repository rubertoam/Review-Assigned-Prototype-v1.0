import { useMemo } from "react";
import {
  AceDropdownMenu,
  type AceDropdownMenuEntry,
} from "@ace-ds/components/molecules/AceDropdownMenu/AceDropdownMenu";
import { MaterialSymbol } from "@ace-ds/components/molecules/AceAccordion/MaterialSymbol";
import {
  CLIENT_PROFILE_ACTIONS,
  clientProfileActionLabel,
  type ClientProfileActionId,
} from "../lib/clientProfileActions";
import { aceIconButtonHoverClass } from "../lib/aceIconButton";
import { ClientDocumentsDrawerContent } from "./ClientDocumentsDrawerContent";
import { ClientHistoryDrawerContent } from "./ClientHistoryDrawerContent";
import { ClientNetworksDrawerContent } from "./ClientNetworksDrawerContent";
import { ClientNotesDrawerContent } from "./ClientNotesDrawerContent";
import { ClientReportsDrawerContent } from "./ClientReportsDrawerContent";
import { ClientRiskRatingDrawerContent } from "./ClientRiskRatingDrawerContent";
import { SideDrawer } from "./SideDrawer";
import { cn } from "./ui/utils";

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
            <AceDropdownMenu
              triggerLabel={title}
              triggerMode="field"
              size="sm"
              panelWidth="wide"
              align="start"
              className={cn(
                "min-w-0 shrink font-['Noto_Sans:Regular',sans-serif] font-normal",
                "!w-fit !max-w-full [&_span:first-of-type]:flex-none",
              )}
              items={items}
            />
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className={aceIconButtonHoverClass}
            >
              <MaterialSymbol name="close" size="md" className="text-current" />
            </button>
          </div>
        </div>

        <div className="relative flex min-h-px w-full flex-1 flex-col overflow-hidden bg-[var(--screening-surface)] px-5 py-4">
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
