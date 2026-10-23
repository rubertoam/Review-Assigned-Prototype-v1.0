import { useMemo } from "react";
import {
  AceDropdownMenu,
  type AceDropdownMenuEntry,
} from "@ace-ds/components/molecules/AceDropdownMenu/AceDropdownMenu";
import { MaterialSymbol } from "@ace-ds/components/molecules/AceAccordion/MaterialSymbol";
import type { Dispatch, SetStateAction } from "react";
import {
  CLIENT_PROFILE_ACTIONS,
  clientProfileActionMenuLabel,
  type ClientProfileActionCounts,
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
  actionCounts: ClientProfileActionCounts;
  onActionCountsChange: Dispatch<SetStateAction<ClientProfileActionCounts>>;
  /** When set, shown above the section switcher so the drawer is tied to a client. */
  clientName?: string;
  clientId?: string;
  className?: string;
}

export function ClientProfileActionDrawer({
  open,
  action,
  onActionChange,
  onClose,
  caseIndex,
  actionCounts,
  onActionCountsChange,
  clientName,
  clientId,
  className,
}: ClientProfileActionDrawerProps) {
  const title = clientProfileActionMenuLabel(action, actionCounts);
  const showClientContext = Boolean(clientName || clientId);

  const items = useMemo((): AceDropdownMenuEntry[] => {
    return CLIENT_PROFILE_ACTIONS.map((entry) => ({
      type: "item" as const,
      label: clientProfileActionMenuLabel(entry.id, actionCounts),
      highlighted: entry.id === action,
      onSelect: () => onActionChange(entry.id),
    }));
  }, [action, actionCounts, onActionChange]);

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
          <div className="flex size-full flex-col gap-2 overflow-clip rounded-[inherit] px-5 py-4">
            {showClientContext ? (
              <div className="min-w-0 pr-8">
                {clientName ? (
                  <p
                    className="m-0 truncate font-['Noto_Sans:SemiBold',sans-serif] text-[14px] font-semibold leading-[1.65] text-[var(--screening-text-primary)]"
                    style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100" }}
                    title={clientName}
                  >
                    {clientName}
                  </p>
                ) : null}
                {clientId ? (
                  <p
                    className="m-0 truncate font-['Noto_Sans:Regular',sans-serif] text-[12px] font-normal leading-[1.65] text-[var(--screening-text-secondary)]"
                    style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100" }}
                  >
                    Client ID · {clientId}
                  </p>
                ) : null}
              </div>
            ) : null}
            <div className="flex flex-row items-center justify-between gap-3">
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
                className={cn(aceIconButtonHoverClass, showClientContext && "absolute right-5 top-4")}
              >
                <MaterialSymbol name="close" size="lg" className="text-current" />
              </button>
            </div>
          </div>
        </div>

        <div className="relative flex min-h-px w-full flex-1 flex-col overflow-hidden bg-[var(--screening-surface)] px-5 py-4">
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            {action === "documents" ? (
              <ClientDocumentsDrawerContent
                caseIndex={caseIndex}
                onCountChange={(count) =>
                  onActionCountsChange((prev) => ({ ...prev, documents: count }))
                }
              />
            ) : null}
            {action === "notes" ? (
              <ClientNotesDrawerContent caseIndex={caseIndex} onClose={onClose} />
            ) : null}
            {action === "history" ? (
              <ClientHistoryDrawerContent
                caseIndex={caseIndex}
                onClose={onClose}
                onCountChange={(count) =>
                  onActionCountsChange((prev) => ({ ...prev, history: count }))
                }
              />
            ) : null}
            {action === "networks" ? (
              <ClientNetworksDrawerContent
                caseIndex={caseIndex}
                onCountChange={(count) =>
                  onActionCountsChange((prev) => ({ ...prev, networks: count }))
                }
              />
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
