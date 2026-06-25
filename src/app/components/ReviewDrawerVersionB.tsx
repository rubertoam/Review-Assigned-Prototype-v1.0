import { useId } from "react";
import { CircleCheck } from "lucide-react";
import { AceAccordion } from "@ace-ds/components/molecules/AceAccordion/AceAccordion";
import {
  AceAttachments,
  type AceAttachmentFile,
  type AceAttachmentLink,
} from "@ace-ds/components/organisms/AceAttachments/AceAttachments";
import { AceTabs, aceTabButtonId } from "./ui/ace-tabs";
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

const drawerAccordionClass = "border-[var(--ace-accordion-border)] shadow-none";

const REVIEW_PANEL_TABS = [
  { id: "activity", label: "Activity" },
  { id: "attachments", label: "Attachments" },
] as const;

type ReviewPanelTab = (typeof REVIEW_PANEL_TABS)[number]["id"];

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
  activeTab,
  onActiveTabChange,
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
  activeTab: ReviewPanelTab;
  onActiveTabChange: (tab: ReviewPanelTab) => void;
  canSubmit: boolean;
  onSubmit: () => void;
  onReset: () => void;
  activityResetSignal: number;
  activityViewRowId: string | null;
  onActivityViewRowIdChange: (rowId: string) => void;
  activityPersistRevision: number;
}) {
  const tabsIdPrefix = useId();

  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-6">
        <div className="mb-4 shrink-0">
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
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-hidden">
          <AceTabs
            items={[...REVIEW_PANEL_TABS]}
            value={activeTab}
            onValueChange={(value) => onActiveTabChange(value as ReviewPanelTab)}
            idPrefix={tabsIdPrefix}
            aria-label="Review panel sections"
            className="shrink-0"
          />

          <div
            role="tabpanel"
            id={`${tabsIdPrefix}-panel-${activeTab}`}
            aria-labelledby={aceTabButtonId(tabsIdPrefix, activeTab)}
            className="min-h-0 flex-1 overflow-y-auto"
          >
            {activeTab === "activity" ? (
              <ReviewActivityFeed
                selectedRows={selectedRows}
                activityViewRowId={activityViewRowId}
                onActivityViewRowIdChange={onActivityViewRowIdChange}
                activityFilter={activityFilter}
                onActivityFilterChange={onActivityFilterChange}
                resetSignal={activityResetSignal}
                activityPersistRevision={activityPersistRevision}
              />
            ) : (
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
            )}
          </div>
        </div>
      </div>

      <div className="shrink-0 p-6">
        <div className="flex w-full items-center justify-between gap-4">
          {canSubmit ? (
            <span
              className={cn(
                aceTypography(ACE_TYPE.p1Regular),
                "inline-flex items-center gap-2 text-[#87b531]",
              )}
              style={notoVar}
            >
              <CircleCheck className="size-3 shrink-0" strokeWidth={2} aria-hidden />
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
              className="flex cursor-pointer items-center justify-center rounded-[var(--radius-sm)] border border-[#3d2e8a] bg-[var(--screening-surface)] px-4 py-2 transition-colors hover:bg-[var(--screening-surface-hover)]"
            >
              <p
                className={cn(aceTypography(ACE_TYPE.p1Bold), "whitespace-nowrap text-[#523eb9]")}
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
                  ? "bg-[#87b531] hover:bg-[#76a02b]"
                  : "cursor-not-allowed bg-[#949baa] opacity-80",
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
