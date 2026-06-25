import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, History } from "lucide-react";
import { AceAccordion } from "@ace-ds/components/molecules/AceAccordion/AceAccordion";
import { AceButton } from "@ace-ds/components/atoms/AceButton";
import {
  AceAttachments,
  type AceAttachmentFile,
  type AceAttachmentLink,
} from "@ace-ds/components/organisms/AceAttachments/AceAttachments";
import { ReviewDrawerQuickClear } from "./ReviewDrawerQuickClear";
import { ReviewDrawerVersionB } from "./ReviewDrawerVersionB";
import { ReviewPanelVersionSelect } from "./ReviewPanelVersionSelect";
import { ReviewPanelInlineInfoMessage } from "./ReviewPanelInlineInfoMessage";
import { ScreeningHistoryTimelineView } from "./ScreeningHistoryTimelineView";
import { DecisionPrimaryDropdown } from "./DecisionPrimaryDropdown";
import {
  createSubmittedComment,
  type ReviewActivityFilter,
  type SubmittedReviewComment,
} from "../lib/reviewActivityData";
import {
  appendPersistedReviewActivity,
  buildReviewSubmitActivity,
} from "../lib/reviewActivityState";
import type { ReviewPanelVersion } from "../lib/reviewPanelVersions";
import {
  LEVEL1_DECISION_STATUSES,
  LEVEL2_DECISION_STATUSES,
  getReasonsForDecisionStatus,
} from "../lib/reviewDecisionConfig";
import {
  renderFieldValue,
  renderMatchStatusValue,
  resolveReviewLastUpdatedFields,
  REVIEW_EMPTY_FIELD,
  REVIEW_MULTIPLE_MESSAGE,
} from "../lib/reviewLastUpdated";
import { aceTypography, ACE_TYPE } from "../lib/aceTypography";
import { cn } from "./ui/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { SideDrawer } from "./SideDrawer";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import type { ScreeningResultRow } from "./ScreeningResultsTable";

const notoVar = { fontVariationSettings: "'CTGR' 0, 'wdth' 100" } as const;

const drawerAccordionTitleClass = cn(
  aceTypography(ACE_TYPE.p1SemiBold),
  "text-[var(--screening-text-primary)]",
);

const drawerAccordionClass =
  "border-[var(--ace-accordion-border)] shadow-none";

const reviewCommentFieldClass = cn(
  "min-h-24 w-full min-w-0 resize-y rounded-[var(--screening-input-radius)] border border-solid border-[var(--screening-input-border)] bg-[var(--color-surface)] px-[var(--screening-input-px)] py-2",
  aceTypography(ACE_TYPE.p1Regular),
  "text-[var(--screening-text-primary)] placeholder:text-[var(--screening-input-placeholder)]",
  "outline-none transition-[background-color,border-color,box-shadow] duration-150 ease-out",
  "focus:border-[var(--screening-input-border-focus)] focus:bg-[var(--screening-input-bg-focus)] focus:shadow-[0_0_0_2px_var(--screening-input-focus-ring)]",
  "disabled:cursor-not-allowed disabled:border-[var(--ace-input-disabled-border)] disabled:bg-[var(--ace-input-disabled-bg)] disabled:text-[var(--ace-input-disabled-text)] disabled:placeholder:text-[var(--ace-input-disabled-text)]",
);

function createAttachmentId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

export interface ReviewDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  flowVariant: "level-1" | "level-2";
  selectedCount: number;
  selectedRows: readonly ScreeningResultRow[];
  onSubmit?: (status: string, reason: string) => void;
}

function LastUpdatedMetaLine({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <p className="m-0 leading-[1.65]">
      <span className="font-semibold">{label}</span>
      <span> · </span>
      {children}
    </p>
  );
}

export function ReviewDrawer({
  isOpen,
  onClose,
  flowVariant,
  selectedCount,
  selectedRows,
  onSubmit,
}: ReviewDrawerProps) {
  const [panelVersion, setPanelVersion] = useState<ReviewPanelVersion>("a");
  const [decisionExpanded, setDecisionExpanded] = useState(true);
  const [commentsExpanded, setCommentsExpanded] = useState(false);
  const [commentDraft, setCommentDraft] = useState("");
  const [savedComment, setSavedComment] = useState("");
  const [decisionCommentDraft, setDecisionCommentDraft] = useState("");
  const [submittedComments, setSubmittedComments] = useState<SubmittedReviewComment[]>([]);
  const [activityFilter, setActivityFilter] = useState<ReviewActivityFilter>("all");
  const [activePanelTab, setActivePanelTab] = useState<"activity" | "attachments">("activity");
  const [attachmentsExpanded, setAttachmentsExpanded] = useState(false);
  const [attachmentFiles, setAttachmentFiles] = useState<AceAttachmentFile[]>([]);
  const [attachmentLinks, setAttachmentLinks] = useState<AceAttachmentLink[]>([]);
  const [attachmentUrlDraft, setAttachmentUrlDraft] = useState("");
  const [screeningHistoryOpen, setScreeningHistoryOpen] = useState(false);
  const [historyPageIndex, setHistoryPageIndex] = useState(0);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [activityResetSignal, setActivityResetSignal] = useState(0);
  const [activityViewRowId, setActivityViewRowId] = useState<string | null>(null);
  const [activityPersistRevision, setActivityPersistRevision] = useState(0);

  const statusOptions = useMemo(
    () => (flowVariant === "level-1" ? LEVEL1_DECISION_STATUSES : LEVEL2_DECISION_STATUSES),
    [flowVariant],
  );

  const reasonOptions = useMemo(
    () => getReasonsForDecisionStatus(flowVariant, selectedStatus),
    [flowVariant, selectedStatus],
  );

  const lastUpdatedFields = useMemo(
    () => resolveReviewLastUpdatedFields(selectedRows),
    [selectedRows],
  );

  const activeHistoryRow = selectedRows[historyPageIndex] ?? null;

  useEffect(() => {
    if (!isOpen) {
      setScreeningHistoryOpen(false);
      setSelectedStatus(null);
      setSelectedReason(null);
      setAttachmentFiles([]);
      setAttachmentLinks([]);
      setAttachmentUrlDraft("");
      setCommentDraft("");
      setSavedComment("");
      setDecisionCommentDraft("");
      setSubmittedComments([]);
      setActivityFilter("all");
      setActivePanelTab("activity");
      setActivityViewRowId(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedCount === 0) {
      setSelectedStatus(null);
      setSelectedReason(null);
      setScreeningHistoryOpen(false);
    }
  }, [selectedCount]);

  useEffect(() => {
    setHistoryPageIndex(0);
  }, [screeningHistoryOpen, selectedRows]);

  useEffect(() => {
    if (historyPageIndex >= selectedRows.length) {
      setHistoryPageIndex(0);
    }
  }, [historyPageIndex, selectedRows.length]);

  useEffect(() => {
    if (selectedRows.length === 0) {
      setActivityViewRowId(null);
      return;
    }
    if (!activityViewRowId || !selectedRows.some((row) => row.id === activityViewRowId)) {
      setActivityViewRowId(selectedRows[0]!.id);
    }
  }, [activityViewRowId, selectedRows]);

  useEffect(() => {
    setSelectedReason(null);
    if (!selectedStatus) return;
    const reasons = getReasonsForDecisionStatus(flowVariant, selectedStatus);
    if (reasons.length === 1) {
      setSelectedReason(reasons[0]);
    }
  }, [selectedStatus, flowVariant]);

  const canSaveComment =
    selectedCount > 0 && commentDraft.trim().length > 0 && commentDraft.trim() !== savedComment;

  const handleSaveComment = () => {
    const trimmed = commentDraft.trim();
    if (!trimmed || selectedCount === 0) return;
    setSavedComment(trimmed);
  };

  const canSubmitVersionA =
    selectedCount > 0 && selectedStatus !== null && selectedReason !== null;

  const canSubmitVersionB =
    selectedCount > 0 &&
    selectedStatus !== null &&
    selectedReason !== null &&
    decisionCommentDraft.trim().length > 0;

  const canSubmit = panelVersion === "b" ? canSubmitVersionB : canSubmitVersionA;

  const handleSubmit = () => {
    if (!canSubmit || !selectedStatus || !selectedReason) return;

    const trimmedDecisionComment = decisionCommentDraft.trim();
    const decisionComments = trimmedDecisionComment
      ? [createSubmittedComment(trimmedDecisionComment)]
      : [];

    appendPersistedReviewActivity(
      selectedRows.map((row) => row.id),
      buildReviewSubmitActivity(flowVariant, {
        status: selectedStatus,
        comments: [...submittedComments, ...decisionComments],
        files: attachmentFiles,
        links: attachmentLinks,
      }),
    );
    setActivityPersistRevision((current) => current + 1);

    onSubmit?.(selectedStatus, selectedReason);
    setSelectedStatus(null);
    setSelectedReason(null);
    setDecisionCommentDraft("");
    setSubmittedComments([]);
    setAttachmentFiles([]);
    setAttachmentLinks([]);
    setAttachmentUrlDraft("");
  };

  const handleResetVersionB = () => {
    setSelectedStatus(null);
    setSelectedReason(null);
    setDecisionCommentDraft("");
    setSubmittedComments([]);
    setAttachmentFiles([]);
    setAttachmentLinks([]);
    setAttachmentUrlDraft("");
    setActivityFilter("all");
    setActivityResetSignal((current) => current + 1);
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
          <div className="flex size-full flex-row items-center justify-between gap-3 overflow-clip rounded-[inherit] px-5 py-4">
            <p
              className={cn(
                aceTypography(ACE_TYPE.h6SmallBold),
                "shrink-0 whitespace-nowrap text-[var(--screening-text-primary)]",
              )}
              style={notoVar}
            >
              Review
            </p>
            <div className="flex min-w-0 items-center justify-end gap-2">
              {panelVersion === "b" ? <ReviewDrawerQuickClear /> : null}
              <ReviewPanelVersionSelect value={panelVersion} onChange={setPanelVersion} />
            </div>
          </div>
        </div>

        <div className="relative flex w-full min-h-px flex-1 flex-col bg-[var(--screening-surface)]">
          {panelVersion === "b" ? (
            <ReviewDrawerVersionB
              selectedCount={selectedCount}
              selectedRows={selectedRows}
              decisionExpanded={decisionExpanded}
              onDecisionExpandedChange={setDecisionExpanded}
              selectedStatus={selectedStatus}
              onSelectedStatusChange={setSelectedStatus}
              selectedReason={selectedReason}
              onSelectedReasonChange={setSelectedReason}
              statusOptions={statusOptions}
              reasonOptions={reasonOptions}
              decisionCommentDraft={decisionCommentDraft}
              onDecisionCommentDraftChange={setDecisionCommentDraft}
              attachmentFiles={attachmentFiles}
              attachmentLinks={attachmentLinks}
              attachmentUrlDraft={attachmentUrlDraft}
              onAttachmentUrlDraftChange={setAttachmentUrlDraft}
              onFilesSelected={(fileList) => {
                const next = Array.from(fileList).map((file) => ({
                  id: createAttachmentId("upload"),
                  name: file.name,
                  status: "complete" as const,
                  sizeLabel: file.size
                    ? `${Math.max(1, Math.round(file.size / (1024 * 1024)))}mb`
                    : undefined,
                }));
                setAttachmentFiles((current) => [...current, ...next]);
              }}
              onAddUrl={() => {
                const trimmed = attachmentUrlDraft.trim();
                if (!trimmed) return;
                setAttachmentLinks((current) => [
                  ...current,
                  { id: createAttachmentId("link"), url: trimmed },
                ]);
                setAttachmentUrlDraft("");
              }}
              onRemoveFile={(id) =>
                setAttachmentFiles((current) => current.filter((file) => file.id !== id))
              }
              onRemoveLink={(id) =>
                setAttachmentLinks((current) => current.filter((link) => link.id !== id))
              }
              activityFilter={activityFilter}
              onActivityFilterChange={setActivityFilter}
              activeTab={activePanelTab}
              onActiveTabChange={setActivePanelTab}
              canSubmit={canSubmit}
              onSubmit={handleSubmit}
              onReset={handleResetVersionB}
              activityResetSignal={activityResetSignal}
              activityViewRowId={activityViewRowId}
              onActivityViewRowIdChange={setActivityViewRowId}
              activityPersistRevision={activityPersistRevision}
            />
          ) : (
            <>
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
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      aria-label="Screening History"
                      disabled={selectedCount === 0}
                      className={cn(
                        "inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-[var(--radius-sm)] border border-[var(--screening-border-strong)] bg-[var(--screening-surface)] text-[var(--screening-text-secondary)] transition-colors hover:border-[var(--screening-border-hover)] hover:bg-[var(--screening-surface-hover)] hover:text-[var(--screening-text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--screening-primary-ring)]",
                        selectedCount === 0 && "cursor-not-allowed opacity-50",
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (selectedCount > 0) setScreeningHistoryOpen(true);
                      }}
                    >
                      <History className="size-4 shrink-0" aria-hidden />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    hideArrow
                    className={cn(
                      aceTypography(ACE_TYPE.captionSemiBold),
                      "border border-[var(--screening-border-strong)] bg-[var(--screening-surface)] text-[var(--screening-text-primary)] shadow-[var(--ace-drop-shadow-xs)]",
                    )}
                  >
                    Screening History
                  </TooltipContent>
                </Tooltip>
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
                  {selectedCount > 1 ? (
                    <ReviewPanelInlineInfoMessage>
                      {REVIEW_MULTIPLE_MESSAGE}
                    </ReviewPanelInlineInfoMessage>
                  ) : (
                    <div
                      className={cn(
                        aceTypography(ACE_TYPE.p1Regular),
                        "flex w-full flex-col gap-1 text-[var(--screening-text-primary)]",
                      )}
                      style={notoVar}
                    >
                      <LastUpdatedMetaLine label="User">
                        {selectedCount === 0
                          ? renderFieldValue(REVIEW_EMPTY_FIELD)
                          : lastUpdatedFields
                            ? renderFieldValue(lastUpdatedFields.user)
                            : null}
                      </LastUpdatedMetaLine>
                      <LastUpdatedMetaLine label="Match Status">
                        <span className="inline-flex flex-wrap items-center gap-1">
                          {selectedCount === 0
                            ? renderFieldValue(REVIEW_EMPTY_FIELD)
                            : lastUpdatedFields
                              ? renderMatchStatusValue(lastUpdatedFields)
                              : null}
                        </span>
                      </LastUpdatedMetaLine>
                      <LastUpdatedMetaLine label="Comment">
                        {selectedCount === 0
                          ? renderFieldValue(REVIEW_EMPTY_FIELD)
                          : lastUpdatedFields
                            ? renderFieldValue(lastUpdatedFields.comment)
                            : null}
                      </LastUpdatedMetaLine>
                      <LastUpdatedMetaLine label="Modified Date">
                        {selectedCount === 0
                          ? renderFieldValue(REVIEW_EMPTY_FIELD)
                          : lastUpdatedFields
                            ? renderFieldValue(lastUpdatedFields.modifiedDate)
                            : null}
                      </LastUpdatedMetaLine>
                    </div>
                  )}
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
            >
              <div className="flex w-full min-w-0 flex-col gap-3">
                <textarea
                  value={commentDraft}
                  onChange={(event) => setCommentDraft(event.target.value)}
                  placeholder="Enter comment..."
                  disabled={selectedCount === 0}
                  aria-label="Comment"
                  className={reviewCommentFieldClass}
                  style={notoVar}
                />
                <div className="flex w-full justify-end">
                  <AceButton
                    type="button"
                    variant="primary"
                    palette="purple"
                    size="sm"
                    disabled={!canSaveComment}
                    onClick={handleSaveComment}
                  >
                    Save
                  </AceButton>
                </div>
              </div>
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
              <div className="w-full min-w-0">
                <AceAttachments
                  className="w-full min-w-0 border-0 bg-transparent p-0 [&>h2]:sr-only"
                  files={attachmentFiles}
                  links={attachmentLinks}
                  urlDraft={attachmentUrlDraft}
                  disabled={selectedCount === 0}
                  onUrlDraftChange={setAttachmentUrlDraft}
                  onFilesSelected={(fileList) => {
                    const next = Array.from(fileList).map((file) => ({
                      id: createAttachmentId("upload"),
                      name: file.name,
                      status: "complete" as const,
                      sizeLabel: file.size
                        ? `${Math.max(1, Math.round(file.size / (1024 * 1024)))}mb`
                        : undefined,
                    }));
                    setAttachmentFiles((current) => [...current, ...next]);
                  }}
                  onAddUrl={() => {
                    const trimmed = attachmentUrlDraft.trim();
                    if (!trimmed) return;
                    setAttachmentLinks((current) => [
                      ...current,
                      { id: createAttachmentId("link"), url: trimmed },
                    ]);
                    setAttachmentUrlDraft("");
                  }}
                  onRemoveFile={(id) =>
                    setAttachmentFiles((current) => current.filter((file) => file.id !== id))
                  }
                  onRemoveLink={(id) =>
                    setAttachmentLinks((current) => current.filter((link) => link.id !== id))
                  }
                />
              </div>
            </AceAccordion>
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
            </>
          )}
        </div>
      </div>

      <Dialog open={isOpen && screeningHistoryOpen} onOpenChange={setScreeningHistoryOpen}>
        <DialogContent className="flex !w-[calc(100vw-2rem)] !max-w-[calc(100vw-2rem)] flex-col gap-0 overflow-hidden rounded-[var(--radius-sm)] border-[var(--screening-border-strong)] bg-[var(--screening-surface)] p-0 sm:!w-[min(50vw,calc(100vw-2rem))] sm:!max-w-[min(50vw,calc(100vw-2rem))] 880px">
          <DialogHeader className="shrink-0 border-b border-[var(--screening-border-strong)] px-4 py-3 text-left sm:px-6 sm:py-4">
            <DialogTitle
              className={cn(
                aceTypography(ACE_TYPE.h6SmallBold),
                "text-[var(--screening-text-primary)]",
              )}
              style={notoVar}
            >
              Screening History
            </DialogTitle>
          </DialogHeader>

          {activeHistoryRow ? (
            <div
              className={cn(
                "flex shrink-0 items-center gap-2 border-b border-[var(--screening-border-strong)] px-4 py-2.5 sm:gap-3 sm:px-6 sm:py-3",
                selectedRows.length === 1 && "justify-center",
              )}
            >
              {selectedRows.length > 1 ? (
                <button
                  type="button"
                  aria-label="Previous match screening history"
                  disabled={historyPageIndex === 0}
                  onClick={() => setHistoryPageIndex((index) => Math.max(0, index - 1))}
                  className={cn(
                    "inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-[var(--radius-sm)] border border-[var(--screening-border-strong)] bg-[var(--screening-surface)] text-[var(--screening-text-secondary)] transition-colors hover:bg-[var(--screening-surface-hover)] hover:text-[var(--screening-text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--screening-primary-ring)]",
                    historyPageIndex === 0 && "cursor-not-allowed opacity-50",
                  )}
                >
                  <ChevronLeft className="size-4" aria-hidden />
                </button>
              ) : null}

              <p
                className={cn(
                  aceTypography(ACE_TYPE.p1SemiBold),
                  "m-0 min-w-0 truncate text-[var(--screening-text-primary)]",
                  selectedRows.length > 1 ? "flex-1 text-center" : "text-center",
                )}
                style={notoVar}
              >
                {activeHistoryRow.name}
                {selectedRows.length > 1 ? (
                  <span
                    className={cn(
                      aceTypography(ACE_TYPE.p1Regular),
                      "font-normal text-[var(--screening-text-muted)]",
                    )}
                  >
                    {` · ${historyPageIndex + 1} of ${selectedRows.length}`}
                  </span>
                ) : null}
              </p>

              {selectedRows.length > 1 ? (
                <button
                  type="button"
                  aria-label="Next match screening history"
                  disabled={historyPageIndex >= selectedRows.length - 1}
                  onClick={() =>
                    setHistoryPageIndex((index) => Math.min(selectedRows.length - 1, index + 1))
                  }
                  className={cn(
                    "inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-[var(--radius-sm)] border border-[var(--screening-border-strong)] bg-[var(--screening-surface)] text-[var(--screening-text-secondary)] transition-colors hover:bg-[var(--screening-surface-hover)] hover:text-[var(--screening-text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--screening-primary-ring)]",
                    historyPageIndex >= selectedRows.length - 1 && "cursor-not-allowed opacity-50",
                  )}
                >
                  <ChevronRight className="size-4" aria-hidden />
                </button>
              ) : null}
            </div>
          ) : null}

          <div className="h-[min(63.75vh,calc(100vh-8rem))] max-h-[min(63.75vh,calc(100vh-8rem))] shrink-0 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
            {activeHistoryRow ? (
              <ScreeningHistoryTimelineView row={activeHistoryRow} />
            ) : (
              <p
                className={cn(
                  aceTypography(ACE_TYPE.p1Regular),
                  "m-0 text-[var(--screening-text-muted)]",
                )}
                style={notoVar}
              >
                Select a match to view screening history.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </SideDrawer>
  );
}
