import { useCallback, useEffect, useMemo, useState } from "react";
import { History } from "lucide-react";
import { AceAccordion } from "@ace-ds/components/molecules/AceAccordion/AceAccordion";
import {
  CompleteCaseConfirmDialog,
  shouldSkipCompleteCaseDialog,
  setSkipCompleteCaseDialog,
} from "./CompleteCaseConfirmDialog";
import { DecisionPrimaryDropdown } from "./DecisionPrimaryDropdown";
import {
  LEVEL1_DECISION_STATUSES,
  LEVEL2_DECISION_STATUSES,
  getReasonsForDecisionStatus,
} from "../lib/reviewDecisionConfig";
import { aceTypography, ACE_TYPE } from "../lib/aceTypography";
import { cn } from "./ui/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { SideDrawer } from "./SideDrawer";

const notoVar = { fontVariationSettings: "'CTGR' 0, 'wdth' 100" } as const;

const drawerAccordionTitleClass = cn(
  aceTypography(ACE_TYPE.p1SemiBold),
  "text-[var(--screening-text-primary)]",
);

const drawerAccordionClass =
  "border-[var(--ace-accordion-border)] shadow-none";

export interface ReviewDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  flowVariant: "level-1" | "level-2";
  selectedCount: number;
  /** Actionable screening rows in the current case (L1: New; L2: L1 in-process). */
  actionableRowCount?: number;
  onSubmit?: (status: string, reason: string) => void;
}

export function ReviewDrawer({
  isOpen,
  onClose,
  flowVariant,
  selectedCount,
  actionableRowCount = 0,
  onSubmit,
}: ReviewDrawerProps) {
  const [decisionExpanded, setDecisionExpanded] = useState(true);
  const [commentsExpanded, setCommentsExpanded] = useState(false);
  const [attachmentsExpanded, setAttachmentsExpanded] = useState(false);
  const [matchHistoryOpen, setMatchHistoryOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [completeCaseDialogOpen, setCompleteCaseDialogOpen] = useState(false);
  const [dontShowCompleteCaseDialog, setDontShowCompleteCaseDialog] = useState(false);
  const [pendingSubmit, setPendingSubmit] = useState<{
    status: string;
    reason: string;
  } | null>(null);

  const statusOptions = useMemo(
    () => (flowVariant === "level-1" ? LEVEL1_DECISION_STATUSES : LEVEL2_DECISION_STATUSES),
    [flowVariant],
  );

  const reasonOptions = useMemo(
    () => getReasonsForDecisionStatus(flowVariant, selectedStatus),
    [flowVariant, selectedStatus],
  );

  useEffect(() => {
    if (!isOpen) {
      setMatchHistoryOpen(false);
      setSelectedStatus(null);
      setSelectedReason(null);
      setCompleteCaseDialogOpen(false);
      setPendingSubmit(null);
      setDontShowCompleteCaseDialog(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedCount === 0) {
      setSelectedStatus(null);
      setSelectedReason(null);
    }
  }, [selectedCount]);

  useEffect(() => {
    setSelectedReason(null);
    if (!selectedStatus) return;
    const reasons = getReasonsForDecisionStatus(flowVariant, selectedStatus);
    if (reasons.length === 1) {
      setSelectedReason(reasons[0]);
    }
  }, [selectedStatus, flowVariant]);

  const canSubmit =
    selectedCount > 0 && selectedStatus !== null && selectedReason !== null;

  const isClearingAllResults =
    actionableRowCount > 0 && selectedCount === actionableRowCount;

  const finalizeSubmit = useCallback(
    (status: string, reason: string) => {
      onSubmit?.(status, reason);
      setSelectedStatus(null);
      setSelectedReason(null);
    },
    [onSubmit],
  );

  const handleSubmit = () => {
    if (!canSubmit || !selectedStatus || !selectedReason) return;
    if (isClearingAllResults && !shouldSkipCompleteCaseDialog()) {
      setPendingSubmit({ status: selectedStatus, reason: selectedReason });
      setCompleteCaseDialogOpen(true);
      return;
    }
    finalizeSubmit(selectedStatus, selectedReason);
  };

  const handleConfirmCompleteCase = () => {
    if (dontShowCompleteCaseDialog) {
      setSkipCompleteCaseDialog(true);
    }
    if (pendingSubmit) {
      finalizeSubmit(pendingSubmit.status, pendingSubmit.reason);
    }
    setPendingSubmit(null);
    setCompleteCaseDialogOpen(false);
    setDontShowCompleteCaseDialog(false);
  };

  const handleCancelCompleteCase = () => {
    setPendingSubmit(null);
    setCompleteCaseDialogOpen(false);
    setDontShowCompleteCaseDialog(false);
  };

  return (
    <SideDrawer
      isOpen={isOpen}
      onClose={onClose}
      widthStorageKey="review-assigned-review-drawer-width"
      defaultWidth={480}
      className="self-stretch"
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="relative w-full shrink-0 bg-[var(--screening-surface)]">
          <div className="flex size-full flex-row items-center overflow-clip rounded-[inherit]">
            <div className="relative flex size-full items-center px-5 py-4">
              <p
                className={cn(
                  aceTypography(ACE_TYPE.h6SmallBold),
                  "shrink-0 whitespace-nowrap text-[var(--screening-text-primary)]",
                )}
                style={notoVar}
              >
                Review
              </p>
            </div>
          </div>
        </div>

        <div className="relative flex w-full min-h-px flex-1 flex-col bg-[var(--screening-surface)]">
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-6">
            <AceAccordion
              title="Decision"
              surface="white"
              dropShadow={false}
              showTag={false}
              showAddIcon={false}
              showDeleteIcon={false}
              showEditIcon={false}
              showMoreIcon={false}
              open={decisionExpanded}
              onOpenChange={setDecisionExpanded}
              className={drawerAccordionClass}
              titleClassName={drawerAccordionTitleClass}
              headerTrailing={
                <button
                  type="button"
                  aria-label="Decision history"
                  className="inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-[var(--radius-sm)] border border-[var(--screening-border-strong)] bg-[var(--screening-surface)] text-[var(--screening-text-secondary)] transition-colors hover:border-[var(--screening-border-hover)] hover:bg-[var(--screening-surface-hover)] hover:text-[var(--screening-text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--screening-primary-ring)]"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMatchHistoryOpen(true);
                  }}
                >
                  <History className="size-4 shrink-0" aria-hidden />
                </button>
              }
            >
              <div className="flex flex-col gap-4">
                <div className="flex w-full flex-col gap-3">
                  <p
                    className={cn(
                      aceTypography(ACE_TYPE.p1SemiBold),
                      "text-[var(--screening-text-primary)]",
                    )}
                    style={notoVar}
                  >
                    Last Updated
                  </p>
                  <div
                    className={cn(
                      aceTypography(ACE_TYPE.p1Regular),
                      "flex w-full flex-col gap-1 text-[var(--screening-text-primary)]",
                    )}
                    style={notoVar}
                  >
                    <p className="m-0 leading-[1.65]">
                      <span className="font-semibold">User</span>
                      {" · Laura Leader"}
                    </p>
                    <p className="m-0 flex flex-wrap items-center gap-1 leading-[1.65]">
                      <span className="font-semibold">Match Status</span>
                      <span> · </span>
                      <span className="font-bold text-[#87b531]">Confirmed Safe</span>
                      <span aria-hidden>→</span>
                      <span>New</span>
                    </p>
                    <p className="m-0 leading-[1.65]">
                      <span className="font-semibold">Comment</span>
                      {" · Last user comment goes here"}
                    </p>
                    <p className="m-0 leading-[1.65]">
                      <span className="font-semibold">Modified Date</span>
                      {" · 05 Oct 2025 17:33:23"}
                    </p>
                  </div>
                </div>

                <DecisionPrimaryDropdown
                  label="Select Status"
                  placeholder="Status..."
                  value={selectedStatus}
                  options={statusOptions}
                  onChange={setSelectedStatus}
                  disabled={selectedCount === 0}
                />

                <DecisionPrimaryDropdown
                  key={selectedStatus ?? "no-status"}
                  label="Select Reason"
                  placeholder="Reason..."
                  value={selectedReason}
                  options={reasonOptions}
                  onChange={setSelectedReason}
                  disabled={selectedCount === 0 || !selectedStatus}
                />
              </div>
            </AceAccordion>

            <AceAccordion
              title="Comments"
              surface="white"
              dropShadow={false}
              showTag={false}
              showAddIcon={false}
              showDeleteIcon={false}
              showEditIcon={false}
              showMoreIcon={false}
              open={commentsExpanded}
              onOpenChange={setCommentsExpanded}
              className={drawerAccordionClass}
              titleClassName={drawerAccordionTitleClass}
            />

            <AceAccordion
              title="Attachments"
              surface="white"
              dropShadow={false}
              showTag={false}
              showAddIcon={false}
              showDeleteIcon={false}
              showEditIcon={false}
              showMoreIcon={false}
              open={attachmentsExpanded}
              onOpenChange={setAttachmentsExpanded}
              className={drawerAccordionClass}
              titleClassName={drawerAccordionTitleClass}
            />
          </div>

          <div className="shrink-0 p-6">
            <div className="flex w-full items-start justify-end gap-4">
              <button
                type="button"
                onClick={onClose}
                className="relative flex cursor-pointer items-start rounded-[var(--radius-sm)] border border-[var(--screening-primary)] bg-[var(--screening-surface)] px-4 py-2 transition-colors hover:bg-[var(--screening-surface-hover)]"
              >
                <p
                  className={cn(
                    aceTypography(ACE_TYPE.p1Bold),
                    "relative whitespace-nowrap text-[var(--screening-primary)]",
                  )}
                  style={notoVar}
                >
                  Close
                </p>
              </button>
              <button
                type="button"
                disabled={!canSubmit}
                onClick={handleSubmit}
                className={cn(
                  "flex cursor-pointer items-center justify-center rounded-[var(--radius-sm)] bg-[var(--screening-primary)] px-4 py-2 transition-colors hover:bg-[var(--dialog-modal-primary-hover)]",
                  !canSubmit && "cursor-not-allowed opacity-50",
                )}
              >
                <p
                  className={cn(
                    aceTypography(ACE_TYPE.p1Bold),
                    "whitespace-nowrap text-white",
                  )}
                  style={notoVar}
                >
                  Submit
                </p>
              </button>
            </div>
          </div>
        </div>
      </div>

      <CompleteCaseConfirmDialog
        open={completeCaseDialogOpen}
        dontShowAgain={dontShowCompleteCaseDialog}
        onDontShowAgainChange={setDontShowCompleteCaseDialog}
        onConfirm={handleConfirmCompleteCase}
        onCancel={handleCancelCompleteCase}
      />

      <Dialog open={isOpen && matchHistoryOpen} onOpenChange={setMatchHistoryOpen}>
        <DialogContent className="max-w-lg gap-0 overflow-hidden rounded-[var(--radius-sm)] border-[var(--screening-border-strong)] bg-[var(--screening-surface)] p-0 sm:max-w-lg">
          <DialogHeader className="border-b border-[var(--screening-border-strong)] px-6 py-4 text-left">
            <DialogTitle
              className={cn(
                aceTypography(ACE_TYPE.h6SmallBold),
                "text-[var(--screening-text-primary)]",
              )}
              style={notoVar}
            >
              Match History
            </DialogTitle>
          </DialogHeader>
          <div className="min-h-[200px] px-6 py-6" />
        </DialogContent>
      </Dialog>
    </SideDrawer>
  );
}
