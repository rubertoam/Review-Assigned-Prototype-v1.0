import { useEffect, useState } from "react";
import { AceBadge } from "@ace-ds/components/atoms/AceBadge/AceBadge";
import { MaterialSymbol } from "@ace-ds/components/molecules/AceAccordion/MaterialSymbol";
import { AceAccordion } from "@ace-ds/components/molecules/AceAccordion/AceAccordion";
import {
  AceAttachments,
  type AceAttachmentFile,
  type AceAttachmentLink,
} from "@ace-ds/components/organisms/AceAttachments/AceAttachments";
import { DecisionPrimaryDropdown } from "./DecisionPrimaryDropdown";
import { ReviewActivityFeed } from "./ReviewActivityFeed";
import { ReviewDecisionInlineCommentField } from "./ReviewDecisionInlineCommentField";
import type { ReviewActivityFilter } from "../lib/reviewActivityData";
import { aceTypography, ACE_TYPE } from "../lib/aceTypography";
import { cn } from "./ui/utils";
import type { ScreeningResultRow } from "./ScreeningResultsTable";

const notoVar = { fontVariationSettings: "'CTGR' 0, 'wdth' 100" } as const;

const drawerAccordionTitleClass = cn(
  aceTypography(ACE_TYPE.p1SemiBold),
  "text-[var(--screening-text-primary)]",
);

const drawerAccordionClass = "shrink-0 border-[var(--ace-accordion-border)] shadow-none";

function ActivityNewBadge({ count }: { count: number }) {
  return (
    <span aria-label={`${count} new activity item${count === 1 ? "" : "s"}`}>
      <AceBadge appearance="pill" variant="red" showDot={false}>
        {count}
      </AceBadge>
    </span>
  );
}

export function ReviewDrawerVersionB({
  selectedCount,
  selectedRows,
  decisionExpanded,
  onDecisionExpandedChange,
  selectedStatus,
  onSelectedStatusChange,
  selectedReason,
  onSelectedReasonChange,
  statusOptions,
  reasonOptions,
  decisionCommentDraft,
  onDecisionCommentDraftChange,
  attachmentFiles,
  attachmentLinks,
  attachmentUrlDraft,
  onAttachmentUrlDraftChange,
  onFilesSelected,
  onAddUrl,
  onRemoveFile,
  onRemoveLink,
  activityFilter,
  onActivityFilterChange,
  canSubmit,
  onSubmit,
  onReset,
  activityResetSignal,
  activityViewRowId,
  onActivityViewRowIdChange,
  activityPersistRevision,
}: {
  selectedCount: number;
  selectedRows: readonly ScreeningResultRow[];
  decisionExpanded: boolean;
  onDecisionExpandedChange: (open: boolean) => void;
  selectedStatus: string | null;
  onSelectedStatusChange: (value: string) => void;
  selectedReason: string | null;
  onSelectedReasonChange: (value: string) => void;
  statusOptions: readonly string[];
  reasonOptions: readonly string[];
  decisionCommentDraft: string;
  onDecisionCommentDraftChange: (value: string) => void;
  attachmentFiles: AceAttachmentFile[];
  attachmentLinks: AceAttachmentLink[];
  attachmentUrlDraft: string;
  onAttachmentUrlDraftChange: (value: string) => void;
  onFilesSelected: (files: FileList) => void;
  onAddUrl: () => void;
  onRemoveFile: (id: string) => void;
  onRemoveLink: (id: string) => void;
  activityFilter: ReviewActivityFilter;
  onActivityFilterChange: (filter: ReviewActivityFilter) => void;
  canSubmit: boolean;
  onSubmit: () => void;
  onReset: () => void;
  activityResetSignal: number;
  activityViewRowId: string | null;
  onActivityViewRowIdChange: (rowId: string) => void;
  activityPersistRevision: number;
}) {
  const [activityExpanded, setActivityExpanded] = useState(false);
  const [attachmentsExpanded, setAttachmentsExpanded] = useState(false);
  const [activitySeen, setActivitySeen] = useState(false);
  const [activityPulseSignal, setActivityPulseSignal] = useState(0);

  const selectionKey = selectedRows.map((row) => row.id).join("|");
  useEffect(() => {
    setActivitySeen(false);
  }, [selectionKey, activityPersistRevision]);

  const handleActivityOpenChange = (open: boolean) => {
    setActivityExpanded(open);
    if (open) {
      setActivitySeen(true);
      setActivityPulseSignal((signal) => signal + 1);
    }
  };

  const showActivityBadge = !activityExpanded && !activitySeen && selectedRows.length > 0;

  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-6 pb-24">
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
          onOpenChange={onDecisionExpandedChange}
          className={drawerAccordionClass}
          titleClassName={drawerAccordionTitleClass}
        >
          <div className="flex flex-col gap-4">
            <DecisionPrimaryDropdown
              label="Select Status"
              placeholder="Status..."
              value={selectedStatus}
              options={statusOptions}
              onChange={onSelectedStatusChange}
              disabled={selectedCount === 0}
            />

            <DecisionPrimaryDropdown
              key={selectedStatus ?? "no-status"}
              label="Select Reason"
              placeholder="Reason..."
              value={selectedReason}
              options={reasonOptions}
              onChange={onSelectedReasonChange}
              disabled={selectedCount === 0 || !selectedStatus}
            />

            <ReviewDecisionInlineCommentField
              value={decisionCommentDraft}
              onChange={onDecisionCommentDraftChange}
              disabled={selectedCount === 0}
            />
          </div>
        </AceAccordion>

        <AceAccordion
          title="Activity"
          surface="white"
          dropShadow={false}
          showTag={false}
          showAddIcon={false}
          showDeleteIcon={false}
          showEditIcon={false}
          showMoreIcon={false}
          open={activityExpanded}
          onOpenChange={handleActivityOpenChange}
          className={drawerAccordionClass}
          titleClassName={drawerAccordionTitleClass}
          headerTrailing={showActivityBadge ? <ActivityNewBadge count={1} /> : undefined}
        >
          <ReviewActivityFeed
            selectedRows={selectedRows}
            activityViewRowId={activityViewRowId}
            onActivityViewRowIdChange={onActivityViewRowIdChange}
            activityFilter={activityFilter}
            onActivityFilterChange={onActivityFilterChange}
            resetSignal={activityResetSignal}
            activityPersistRevision={activityPersistRevision}
            pulseSignal={activityPulseSignal}
          />
        </AceAccordion>

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
        >
          <AceAttachments
            className="w-full min-w-0 border-0 bg-transparent p-0 [&>h2]:sr-only"
            files={attachmentFiles}
            links={attachmentLinks}
            urlDraft={attachmentUrlDraft}
            disabled={selectedCount === 0}
            onUrlDraftChange={onAttachmentUrlDraftChange}
            onFilesSelected={onFilesSelected}
            onAddUrl={onAddUrl}
            onRemoveFile={onRemoveFile}
            onRemoveLink={onRemoveLink}
          />
        </AceAccordion>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-[var(--screening-surface)] p-6">
        <div className="pointer-events-auto flex w-full items-center justify-between gap-4">
          {canSubmit ? (
            <span
              className={cn(
                aceTypography(ACE_TYPE.p1Regular),
                "inline-flex items-center gap-2 text-[var(--ace-success-500,#87b531)]",
              )}
              style={notoVar}
            >
              <MaterialSymbol name="check_circle" size="sm" />
              Ready to submit
            </span>
          ) : (
            <span
              className={cn(aceTypography(ACE_TYPE.p1SemiBold), "text-[var(--screening-primary)]")}
              style={notoVar}
            >
              Not ready to submit
            </span>
          )}
          <div className="flex shrink-0 items-center gap-3">
            <button
              type="button"
              onClick={onReset}
              className="flex cursor-pointer items-center justify-center rounded-[var(--radius-sm)] border border-[var(--screening-primary-hover-border)] bg-[var(--screening-surface)] px-4 py-2 transition-colors hover:bg-[var(--screening-surface-hover)]"
            >
              <p
                className={cn(aceTypography(ACE_TYPE.p1Bold), "whitespace-nowrap text-[var(--screening-primary)]")}
                style={notoVar}
              >
                Reset
              </p>
            </button>
            <button
              type="button"
              disabled={!canSubmit}
              onClick={onSubmit}
              className={cn(
                "flex cursor-pointer items-center justify-center rounded-[var(--radius-sm)] px-4 py-2 transition-colors",
                canSubmit
                  ? "bg-[var(--ace-success-500,#87b531)] hover:bg-[#76a02b]"
                  : "cursor-not-allowed bg-[var(--screening-icon-muted)] opacity-80",
              )}
            >
              <p
                className={cn(aceTypography(ACE_TYPE.p1Bold), "whitespace-nowrap text-white")}
                style={notoVar}
              >
                Submit
              </p>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
