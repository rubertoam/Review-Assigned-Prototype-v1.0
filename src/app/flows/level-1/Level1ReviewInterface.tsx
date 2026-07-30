/** Level 1 user flow — Review Assigned (primary UX concept). */
import svgPaths from "../../../imports/ReviewAssignedAllCollapsed/svg-e16bopzh98";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { AceBadge } from "@ace-ds/components/atoms/AceBadge/AceBadge";
import {
  AceTooltip,
  AceTooltipContent,
  AceTooltipTrigger,
} from "@ace-ds/components/atoms/AceTooltip/AceTooltip";
import { MaterialSymbol } from "@ace-ds/components/molecules/AceAccordion/MaterialSymbol";
import {
  caseActionsMenuContentClass,
  caseActionsMenuIconClass,
  caseActionsMenuItemClass,
  caseActionsMenuTriggerClass,
} from "../../lib/caseActionsMenuStyles";
import {
  CLIENT_PROFILE_ACTIONS,
  type ClientProfileActionId,
} from "../../lib/clientProfileActions";
import { AllCasesClearedState } from "../../components/AllCasesClearedState";
import { ClientProfileActionDrawer } from "../../components/ClientProfileActionDrawer";
import { CaseListFilterEmptyState } from "../../components/CaseListFilterEmptyState";
import { CaseListLockReviewerAvatar } from "../../components/CaseListLockReviewerAvatar";
import { CaseListSection } from "../../components/CaseListSection";
import { ThemeProvider } from "../../context/ThemeContext";
import { aceAccordionFixedHeaderClass } from "../../lib/aceAccordion";
import { aceDropShadowXsClass } from "../../lib/aceShadow";
import { aceTypography, ACE_TYPE } from "../../lib/aceTypography";
import { ReviewPanelInlineInfoMessage } from "../../components/ReviewPanelInlineInfoMessage";
import { ReviewPanelEmptyState } from "../../components/ReviewPanelEmptyState";
import { ReviewFlowSiteHeader } from "../../components/ReviewFlowSiteHeader";
import {
  ClientProfileAccordionHeaderTags,
  ClientProfileClientIdRow,
  OverdueWarningIcon,
} from "../../components/ClientProfileHeaderBadges";
import { ClientProfileAddressSection } from "../../components/ClientProfileAddressSection";
import { ClientProfileMetaLine } from "../../components/ClientProfileMetaLine";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { CaseListFilterSelect } from "../../components/CaseListFilterSelect";
import { CaseListSortSelect } from "../../components/CaseListSortSelect";
import {
  ScreeningResultsTable,
  getScreeningRowsForCase,
  isCaseScreeningComplete,
  isLevel2ReviewedRow,
  screeningNewPillSurfaceClass,
  type CaseListSectionContext,
  type ScreeningResultRow,
  type ScreeningRowStatus,
} from "../../components/ScreeningResultsTable";
import { useScreeningRowsByCase } from "../../lib/screeningState";
import { useCompleteCaseSubmit } from "../../lib/useCompleteCaseSubmit";
import {
  buildSubmitUndoSnapshot,
  useBulkSubmitUndoToast,
} from "../../lib/useBulkSubmitUndoToast";
import {
  createWorkLogEntriesForMatches,
  removeWorkLogEntriesForRowIds,
  WORK_LOG_REVIEWER,
  type WorkLogEntry,
} from "../../lib/workLogState";
import { WorkLogModal } from "../../components/WorkLogModal";
import { WorkLogIntroModal } from "../../components/WorkLogIntroModal";
import { useOverdueWarningToast } from "../../lib/useOverdueWarningToast";
import {
  caseMatchesFilters,
  casesData,
  clientProfileForCaseIndex,
  compareCasesBySort,
  riskBandPresentation,
  type CaseFilterValue,
  type CaseSortValue,
} from "../../lib/reviewCaseData";
import {
  isCaseLockedByAnotherUser,
  lockedCaseReviewer,
} from "../../lib/caseLockConfig";
import { deriveReviewSidebarWorkflows } from "../../lib/reviewSidebarWorkflows";
import { cn } from "../../components/ui/utils";
import { ReviewDrawer } from "../../components/ReviewDrawer";
import { ReviewTaskBar } from "../../components/ReviewTaskBar";
import {
  getLevel1DecisionStatusesForRows,
  getLevel1StatusesForWorkflowId,
  getWorkflowLabelById,
  isDocumentsRequiredWorkflowId,
  isLevel1DecisionStatus,
  isLevel1MyWorkStatus,
  type Level1ScreeningStatus,
} from "../../lib/reviewDecisionConfig";
import {
  ReviewAssignedSidebar,
  withWorkCounts,
  type ReviewAssignedSidebarSelection,
} from "../../components/ReviewAssignedSidebar";
import { INITIAL_PEP_WORK_QUEUE, type PepCaseListItem } from "../../lib/pepWorkQueue";
import { sidebarIconButtonClass } from "@ace-ds/components/organisms/AceSidebar/sidebarRowActions";
import { screeningToolbarIconButtonClass } from "@ace-ds/components/organisms/ScreeningResultsTable/screeningTableToolbar";
import { AceAccordion } from "@ace-ds/components/molecules/AceAccordion/AceAccordion";

interface PageHeaderProps {
  isSidebarOpen: boolean;
  sidebarPinned: boolean;
  levelLabel: string;
  onTriggerClick: () => void;
  onOpenWorkLog: () => void;
}

function PageHeader({
  isSidebarOpen,
  sidebarPinned,
  levelLabel,
  onTriggerClick,
  onOpenWorkLog,
}: PageHeaderProps) {
  return (
    <div className="flex shrink-0 items-center justify-between border-b border-[var(--screening-border-strong)] bg-[var(--screening-surface)] px-4 py-3 md:px-8">
      <div className="flex items-center gap-5">
        <button
          type="button"
          aria-expanded={isSidebarOpen}
          aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
          className={sidebarIconButtonClass}
          onClick={onTriggerClick}
        >
          <MaterialSymbol
            name="left_panel_close"
            size="md"
            className={cn("text-current", !sidebarPinned && "rotate-180")}
          />
        </button>
        <div className="flex items-center gap-2">
          <p className={cn(aceTypography(ACE_TYPE.h6Bold), "leading-[1.65] text-[var(--screening-text-primary)]")}>
            Review Assigned
          </p>
          <AceBadge appearance="tag" variant="gray">
            {levelLabel}
          </AceBadge>
        </div>
      </div>
      <div className="flex gap-2 md:gap-4 items-center">
        <div className="bg-[#87b531] rounded-[100px] size-[8px] animate-pulse" />
        <p className={cn(aceTypography(ACE_TYPE.p1Regular), "hidden text-sm leading-[1.65] text-[var(--screening-text-primary)] sm:block")}>
          Last updated 30 seconds ago
        </p>
        <div className="inline-flex size-8 shrink-0 items-center justify-center leading-none">
          <AceTooltip>
            <AceTooltipTrigger asChild>
              <button
                type="button"
                aria-label="Work History"
                className={cn(screeningToolbarIconButtonClass, "leading-none")}
                onClick={onOpenWorkLog}
              >
                <MaterialSymbol name="history" size="md" weight={300} className="text-current" />
              </button>
            </AceTooltipTrigger>
            <AceTooltipContent side="top" variant="screening-toolbar" hideArrow>
              Work History
            </AceTooltipContent>
          </AceTooltip>
        </div>
      </div>
    </div>
  );
}

const SIDEBAR_ORGANIZATIONS = [{ id: "level-1-users", label: "Level 1 Users" }] as const;

const MY_WORK_BADGE = "text-[#523eb9]";

const SIDEBAR_WORK_CATEGORIES = [
  {
    id: "sanction",
    label: "Sanction Matches",
    selectable: true,
    badgeLabelClass: MY_WORK_BADGE,
  },
  {
    id: "pep",
    label: "PEP Screening",
    selectable: true,
    badgeLabelClass: MY_WORK_BADGE,
  },
] as const;

interface ReviewSidebarProps {
  isOpen: boolean;
  sanctionMatchCount: number;
  pepMatchCount: number;
  workflowItems: ReturnType<typeof deriveReviewSidebarWorkflows>;
  selection: ReviewAssignedSidebarSelection;
  onSelectionChange: (selection: ReviewAssignedSidebarSelection) => void;
}

function ReviewSidebar({
  isOpen,
  sanctionMatchCount,
  pepMatchCount,
  workflowItems,
  selection,
  onSelectionChange,
}: ReviewSidebarProps) {
  const workCategories = useMemo(
    () =>
      withWorkCounts(SIDEBAR_WORK_CATEGORIES, {
        sanction: sanctionMatchCount,
        pep: pepMatchCount,
      }),
    [sanctionMatchCount, pepMatchCount],
  );

  return (
    <ReviewAssignedSidebar
      open={isOpen}
      organizations={SIDEBAR_ORGANIZATIONS}
      workCategories={workCategories}
      workflowItems={workflowItems}
      selection={selection}
      onSelectionChange={onSelectionChange}
    />
  );
}

interface CaseListProps {
  onSelectCase: (index: number, section: CaseListSectionContext) => void;
  selectedCaseIndex: number;
  selectedCaseListSection: CaseListSectionContext;
  screeningRowsByCase: Record<number, ScreeningResultRow[]>;
  onFilterVisibilityChange?: (state: { filtersActive: boolean; filteredCount: number }) => void;
  /** When set, list shows cases that have matches in this workflow (read-only destination). */
  workflowId?: string | null;
  listTitle?: string;
  /** Cases shown in this list (Sanction Matches or PEP Screening). */
  cases?: readonly PepCaseListItem[] | typeof casesData;
  /** When false, skip Laura lock treatment (PEP queue). */
  applyCaseLocks?: boolean;
  /** Fallback row factory when a case has no stored screening rows. */
  getRowsForCase?: (index: number) => ScreeningResultRow[];
}

type CaseListRow = { item: PepCaseListItem | (typeof casesData)[number]; index: number };

function CaseList({
  onSelectCase,
  selectedCaseIndex,
  selectedCaseListSection,
  screeningRowsByCase,
  onFilterVisibilityChange,
  workflowId = null,
  listTitle = "Sanction Matches",
  cases = casesData,
  applyCaseLocks = true,
  getRowsForCase = getScreeningRowsForCase,
}: CaseListProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [selectedCaseFilters, setSelectedCaseFilters] = useState<ReadonlySet<CaseFilterValue>>(
    () => new Set(),
  );
  const [caseSort, setCaseSort] = useState<CaseSortValue>("results-desc");
  const wasSelectedCaseCompleteRef = useRef(false);
  const isWorkflowView = Boolean(workflowId);
  const isDocumentsRequiredWorkflow = isDocumentsRequiredWorkflowId(workflowId);
  const workflowCaseSection: CaseListSectionContext = isDocumentsRequiredWorkflow
    ? "documents-required"
    : "done";
  const workflowStatuses = useMemo(
    () => (workflowId ? getLevel1StatusesForWorkflowId(workflowId) : []),
    [workflowId],
  );

  const caseRowsForIndex = useCallback(
    (index: number) => screeningRowsByCase[index] ?? getRowsForCase(index),
    [screeningRowsByCase, getRowsForCase],
  );

  /** Results still awaiting Level 1 review in My Work. */
  const pendingResultCount = useCallback(
    (index: number) =>
      caseRowsForIndex(index).filter((r) => isLevel1MyWorkStatus(r.status)).length,
    [caseRowsForIndex],
  );

  const workflowResultCount = useCallback(
    (index: number) =>
      caseRowsForIndex(index).filter((r) =>
        workflowStatuses.includes(r.status as (typeof workflowStatuses)[number]),
      ).length,
    [caseRowsForIndex, workflowStatuses],
  );

  const filteredRows = useMemo(() => {
    const out: CaseListRow[] = [];
    cases.forEach((item, index) => {
      if (caseMatchesFilters(index, selectedCaseFilters)) {
        out.push({ item, index });
      }
    });
    out.sort((a, b) =>
      compareCasesBySort(
        a.index,
        b.index,
        caseSort,
        isWorkflowView ? workflowResultCount : pendingResultCount,
        (index) => cases[index]?.name ?? "",
      ),
    );
    return out;
  }, [
    cases,
    selectedCaseFilters,
    caseSort,
    pendingResultCount,
    workflowResultCount,
    isWorkflowView,
  ]);

  const visibleRows = useMemo(() => {
    if (isWorkflowView) {
      return filteredRows.filter((row) => workflowResultCount(row.index) > 0);
    }
    return filteredRows.filter((row) => !isCaseScreeningComplete(caseRowsForIndex(row.index)));
  }, [filteredRows, isWorkflowView, workflowResultCount, caseRowsForIndex]);

  useEffect(() => {
    onFilterVisibilityChange?.({
      filtersActive: selectedCaseFilters.size > 0,
      filteredCount: visibleRows.length,
    });
  }, [visibleRows.length, selectedCaseFilters.size, onFilterVisibilityChange]);

  const caseReviewProgress = useMemo(
    () =>
      cases.map((_, i) => {
        const rows = caseRowsForIndex(i);
        const done = rows.filter((r) => isLevel1DecisionStatus(r.status)).length;
        return { done, total: rows.filter((r) => r.status !== "Documents Required").length };
      }),
    [cases, caseRowsForIndex],
  );

  useEffect(() => {
    if (isWorkflowView) return;
    const rows = caseRowsForIndex(selectedCaseIndex);
    wasSelectedCaseCompleteRef.current = isCaseScreeningComplete(rows);
  }, [selectedCaseIndex, caseRowsForIndex, isWorkflowView]);

  useEffect(() => {
    if (isWorkflowView) return;
    if (selectedCaseListSection !== "todo") return;
    const rows = caseRowsForIndex(selectedCaseIndex);
    const complete = isCaseScreeningComplete(rows);
    if (complete && !wasSelectedCaseCompleteRef.current && visibleRows.length > 0) {
      onSelectCase(visibleRows[0].index, "todo");
    }
    wasSelectedCaseCompleteRef.current = complete;
  }, [
    screeningRowsByCase,
    selectedCaseIndex,
    selectedCaseListSection,
    visibleRows,
    onSelectCase,
    caseRowsForIndex,
    isWorkflowView,
  ]);

  useEffect(() => {
    if (visibleRows.some((r) => r.index === selectedCaseIndex)) return;
    if (visibleRows.length > 0) {
      onSelectCase(visibleRows[0].index, isWorkflowView ? workflowCaseSection : "todo");
    }
  }, [visibleRows, selectedCaseIndex, onSelectCase, isWorkflowView, workflowCaseSection]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isFocused) return;

      const pos = visibleRows.findIndex((r) => r.index === selectedCaseIndex);
      if (pos < 0) return;
      const section: CaseListSectionContext = isWorkflowView ? workflowCaseSection : "todo";

      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (pos < visibleRows.length - 1) {
          onSelectCase(visibleRows[pos + 1].index, section);
        }
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (pos > 0) {
          onSelectCase(visibleRows[pos - 1].index, section);
        }
      }
    };

    const listElement = listRef.current;
    if (listElement) {
      listElement.addEventListener("keydown", handleKeyDown);
      return () => listElement.removeEventListener("keydown", handleKeyDown);
    }
  }, [selectedCaseIndex, onSelectCase, isFocused, visibleRows, isWorkflowView, workflowCaseSection]);

  const renderCaseRow = (caseItem: PepCaseListItem | (typeof casesData)[number], index: number) => {
    const section: CaseListSectionContext = isWorkflowView ? workflowCaseSection : "todo";
    const isEntity = "isEntity" in caseItem && caseItem.isEntity;
    const profile = clientProfileForCaseIndex(index);
    const clientId = profile.clientId;
    const { done, total } = caseReviewProgress[index] ?? { done: 0, total: 1 };
    const progressPct = total > 0 ? (done / total) * 100 : 0;
    const pendingCount = pendingResultCount(index);
    const resultsCount = isWorkflowView
      ? workflowResultCount(index)
      : pendingCount > 0
        ? pendingCount
        : caseItem.results;
    const isSelected = selectedCaseIndex === index && selectedCaseListSection === section;
    const lockReviewer = applyCaseLocks ? lockedCaseReviewer(index) : null;
    return (
      <div
        key={`${section}-${index}`}
        className={cn(
          "group relative cursor-pointer px-4 pb-2.5 pt-1 transition-colors",
          isSelected ? "bg-[#e4e6ea] dark:bg-[#333a42]" : "hover:bg-[#e4e6ea] dark:hover:bg-[#333a42]",
        )}
        onClick={() => onSelectCase(index, section)}
      >
        {isSelected && isFocused && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-20 border-[0.5px] border-solid border-[#523eb9]"
          />
        )}
        <div className="relative z-10 flex items-center justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className={`${isEntity ? "h-[15px]" : ""} w-[16px] shrink-0`}>
              <svg
                className="block size-full"
                fill="none"
                preserveAspectRatio="none"
                viewBox={isEntity ? "0 0 16 15" : "0 0 16 16"}
              >
                <path
                  d={isEntity ? svgPaths.p1ac17500 : svgPaths.p8c3ef80}
                  fill="var(--fill-0, #523EB9)"
                />
              </svg>
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
              <p
                className="font-['Noto_Sans:Regular',sans-serif] text-[14px] font-normal leading-[1.65] text-[#23262c] dark:text-[#b6c2cf]"
                style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100" }}
              >
                {caseItem.name}
              </p>
              <p
                className="font-['Noto_Sans:Regular',sans-serif] text-[10px] font-normal leading-[1.65] tracking-[0.2px] text-[#23262c] dark:text-[#b6c2cf]"
                style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100" }}
              >
                {clientId} · {resultsCount} results
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            {profile.reviewTargetOverdue || profile.reviewTargetPastDue ? (
              <span
                className="shrink-0"
                title={profile.reviewTargetPastDue ? "Overdue" : "Overdue warning"}
              >
                <OverdueWarningIcon />
                <span className="sr-only">
                  {profile.reviewTargetPastDue ? "Overdue" : "Overdue warning"}
                </span>
              </span>
            ) : null}
            {lockReviewer ? (
              <CaseListLockReviewerAvatar
                imageUrl={lockReviewer.imageUrl}
                reviewerName={lockReviewer.name}
              />
            ) : null}
          </div>
        </div>
        {!isWorkflowView ? (
          <div
            className="pointer-events-none absolute bottom-1 left-4 right-4 z-10 h-1 overflow-hidden rounded-full border border-[#e4e6ea] bg-[#eff0f2] opacity-0 transition-opacity duration-200 group-hover:opacity-100 dark:bg-[#2c333a]"
            aria-hidden
          >
            <div
              className="h-full rounded-full bg-[#523eb9] transition-[width] duration-300 ease-out"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <div
      ref={listRef}
      tabIndex={0}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      className={cn(
        "flex min-h-0 w-64 flex-1 flex-col overflow-x-hidden overflow-y-auto rounded-[var(--radius-sm)] border border-[var(--screening-border-strong)] bg-[var(--screening-surface)] outline-none lg:w-72",
        aceDropShadowXsClass,
      )}
    >
      <div className="flex items-center justify-between px-3 pb-3 pt-5">
        <p
          className="font-['Noto_Sans:Bold',sans-serif] text-[14px] font-bold leading-[1.65] text-[var(--screening-text-primary)]"
          style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100" }}
        >
          {listTitle}
        </p>
        <AceBadge appearance="tag" variant="purple">
          {visibleRows.length}
        </AceBadge>
      </div>
      <div className="shrink-0 border-b border-[var(--screening-border-strong)] bg-[var(--screening-surface)] px-3 py-2.5">
        <div className="flex items-end gap-2">
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <span
              className="font-['Noto_Sans:SemiBold',sans-serif] text-[13px] text-[#23262c] dark:text-[#b6c2cf]"
              style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100" }}
            >
              Filter by
            </span>
            <CaseListFilterSelect
              selectedFilters={selectedCaseFilters}
              onSelectedFiltersChange={setSelectedCaseFilters}
            />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <span
              className="font-['Noto_Sans:SemiBold',sans-serif] text-[13px] text-[#23262c] dark:text-[#b6c2cf]"
              style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100" }}
            >
              Sort by
            </span>
            <CaseListSortSelect value={caseSort} onValueChange={setCaseSort} />
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <CaseListSection
          title={isWorkflowView ? "Cases" : "Case List - To Do"}
          count={visibleRows.length}
          collapsible={false}
          emptyContent={
            selectedCaseFilters.size > 0 && visibleRows.length === 0 ? (
              <CaseListFilterEmptyState />
            ) : isWorkflowView && visibleRows.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p
                  className="m-0 font-['Noto_Sans:Regular',sans-serif] text-[13px] leading-[1.65] text-[var(--ace-neutral-800)]"
                  style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100" }}
                >
                  No cases in this workflow yet.
                </p>
              </div>
            ) : undefined
          }
        >
          {visibleRows.map(({ item, index }) => renderCaseRow(item, index))}
        </CaseListSection>
      </div>
    </div>
  );
}

interface DetailPanelProps {
  selectedCase: PepCaseListItem | (typeof casesData)[number];
  selectedCaseIndex: number;
  caseListSection: CaseListSectionContext;
  screeningRows: ScreeningResultRow[];
  screeningSelectedIds: Set<string>;
  onScreeningSelectedIdsChange: Dispatch<SetStateAction<Set<string>>>;
  allCasesCleared: boolean;
  onQuickClearRow: (rowId: string, status: ScreeningRowStatus) => void;
  showFilterEmptyState?: boolean;
  emptyStateMessage?: string;
  isCaseReadOnly?: boolean;
  /** When set, show the workflow info banner above the client profile. */
  workflowLabel?: string | null;
  /** True for workflows that have left Level 1 action (not Documents Required). */
  workflowReadOnly?: boolean;
  onOpenClientProfileAction?: (action: ClientProfileActionId) => void;
}

function DetailPanel({
  selectedCase,
  selectedCaseIndex,
  caseListSection,
  screeningRows,
  screeningSelectedIds,
  onScreeningSelectedIdsChange,
  allCasesCleared,
  onQuickClearRow,
  showFilterEmptyState = false,
  emptyStateMessage = "No cases match the selected filters.",
  isCaseReadOnly = false,
  workflowLabel = null,
  workflowReadOnly = false,
  onOpenClientProfileAction,
}: DetailPanelProps) {
  const [clientExpanded, setClientExpanded] = useState(false);
  const profile = clientProfileForCaseIndex(selectedCaseIndex);
  const riskPresentation = riskBandPresentation(profile.riskBand);
  const isWorkflowView = Boolean(workflowLabel);

  if (showFilterEmptyState) {
    return (
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <ReviewPanelEmptyState message={emptyStateMessage} />
      </div>
    );
  }

  if (allCasesCleared && !isWorkflowView) {
    return (
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <AllCasesClearedState />
      </div>
    );
  }

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-hidden">
      {isWorkflowView ? (
        <ReviewPanelInlineInfoMessage>
          The matches in this case are part of an active workflow.
        </ReviewPanelInlineInfoMessage>
      ) : isCaseReadOnly ? (
        <ReviewPanelInlineInfoMessage>
          Read only. This case is locked and in review by another user.
        </ReviewPanelInlineInfoMessage>
      ) : null}
      <div className="flex shrink-0 flex-col gap-2">
        <p
          className={cn(
            aceTypography(ACE_TYPE.labelBold),
            "m-0 text-[var(--screening-text-primary)]",
          )}
        >
          Client Profile
        </p>
      <AceAccordion
        className={cn(
          "shrink-0 border-[var(--screening-border-strong)]",
          aceAccordionFixedHeaderClass,
        )}
        surface="white"
        dropShadow
        showTag={false}
        showAddIcon={false}
        showDeleteIcon={false}
        showEditIcon={false}
        showMoreIcon={false}
        open={clientExpanded}
        onOpenChange={setClientExpanded}
        title={
          <div
            className="flex min-w-0 flex-nowrap items-center gap-2 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="truncate">{selectedCase.name}</span>
            <ClientProfileAccordionHeaderTags
              clientId={profile.clientId}
              countryLabel={profile.countryLabel}
              dob={profile.dob}
              showOverdueWarning={profile.reviewTargetOverdue}
            />
          </div>
        }
        titleClassName={cn(
          aceTypography(ACE_TYPE.p1SemiBold),
          "min-w-0 flex-1 overflow-visible text-[var(--screening-text-primary)] !truncate",
        )}
        headerTrailing={
          isCaseReadOnly || workflowReadOnly ? null : (
          <div className="shrink-0 self-center" onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="Case actions"
                  className={caseActionsMenuTriggerClass}
                  onClick={(e) => e.stopPropagation()}
                >
                  <MaterialSymbol name="more_horiz" size="md" weight={300} className={caseActionsMenuIconClass} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                variant="compact"
                className={caseActionsMenuContentClass}
                onClick={(e) => e.stopPropagation()}
              >
                {CLIENT_PROFILE_ACTIONS.map((entry) => (
                  <DropdownMenuItem
                    key={entry.id}
                    className={caseActionsMenuItemClass}
                    onSelect={() => onOpenClientProfileAction?.(entry.id)}
                  >
                    {entry.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          )
        }
      >
            <div className="flex min-h-[260px] gap-4 items-stretch">
              <div className="flex min-h-0 flex-1 flex-col gap-3">
                <div
                  className={cn(
                    "flex min-h-[120px] flex-1 flex-col items-center justify-center rounded p-6",
                    screeningNewPillSurfaceClass,
                  )}
                >
                  <p className="font-['Noto_Sans:Bold',sans-serif] font-bold leading-[1.65] text-[#523eb9] text-[20px]" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100" }}>
                    In Process
                  </p>
                </div>
                <AceTooltip>
                  <AceTooltipTrigger asChild>
                    <button
                      type="button"
                      aria-label="View Risk Rating"
                      onClick={() => onOpenClientProfileAction?.("risk-rating")}
                      className={cn(
                        "flex min-h-[120px] flex-1 flex-col items-center justify-center rounded p-6",
                        "cursor-pointer border-0 transition-opacity hover:opacity-90",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--screening-primary-ring)] focus-visible:ring-offset-2",
                        riskPresentation.box,
                      )}
                    >
                      <p
                        className={cn(
                          "font-['Noto_Sans:Bold',sans-serif] font-bold leading-[1.65] text-[20px]",
                          riskPresentation.text,
                        )}
                        style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100" }}
                      >
                        {riskPresentation.label}
                      </p>
                    </button>
                  </AceTooltipTrigger>
                  <AceTooltipContent side="top" variant="screening-toolbar">
                    View Risk Rating
                  </AceTooltipContent>
                </AceTooltip>
              </div>

              <div className="flex min-h-0 flex-1 flex-col gap-2 self-stretch rounded border border-[#cfd2d9] dark:border-[#38414a] bg-white dark:bg-[#22272b] p-6">
                <ClientProfileAddressSection addressLines={profile.addressLines} />
                <ClientProfileClientIdRow clientId={profile.clientId} />
                <div className="flex gap-2.5 items-center">
                  <div className="size-[16px] shrink-0">
                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
                      <path d="M6.88 9.44L5.14 7.7C4.99333 7.55333 4.81333 7.48 4.6 7.48C4.38667 7.48 4.2 7.56 4.04 7.72C3.89333 7.86667 3.82 8.05333 3.82 8.28C3.82 8.50667 3.89333 8.69333 4.04 8.84L6.32 11.12C6.46667 11.2667 6.65333 11.34 6.88 11.34C7.10667 11.34 7.29333 11.2667 7.44 11.12L11.98 6.58C12.1267 6.43333 12.2 6.25333 12.2 6.04C12.2 5.82667 12.12 5.64 11.96 5.48C11.8133 5.33333 11.6267 5.26 11.4 5.26C11.1733 5.26 10.9867 5.33333 10.84 5.48L6.88 9.44ZM8 16C6.89333 16 5.85333 15.7899 4.88 15.3696C3.90667 14.9499 3.06 14.38 2.34 13.66C1.62 12.94 1.05013 12.0933 0.6304 11.12C0.210133 10.1467 0 9.10667 0 8C0 6.89333 0.210133 5.85333 0.6304 4.88C1.05013 3.90667 1.62 3.06 2.34 2.34C3.06 1.62 3.90667 1.04987 4.88 0.6296C5.85333 0.209867 6.89333 0 8 0C9.10667 0 10.1467 0.209867 11.12 0.6296C12.0933 1.04987 12.94 1.62 13.66 2.34C14.38 3.06 14.9499 3.90667 15.3696 4.88C15.7899 5.85333 16 6.89333 16 8C16 9.10667 15.7899 10.1467 15.3696 11.12C14.9499 12.0933 14.38 12.94 13.66 13.66C12.94 14.38 12.0933 14.9499 11.12 15.3696C10.1467 15.7899 9.10667 16 8 16Z" fill="#87B531" />
                    </svg>
                  </div>
                  <p className="font-['Noto_Sans:Regular',sans-serif] font-normal leading-[1.65] text-[14px] text-[#23262c] dark:text-[#b6c2cf]" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100" }}>
                    Client Active
                  </p>
                </div>
                <div className="flex gap-2.5 items-center">
                  <div className="size-[16px] shrink-0">
                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
                      <path d="M6.88 9.44L5.14 7.7C4.99333 7.55333 4.81333 7.48 4.6 7.48C4.38667 7.48 4.2 7.56 4.04 7.72C3.89333 7.86667 3.82 8.05333 3.82 8.28C3.82 8.50667 3.89333 8.69333 4.04 8.84L6.32 11.12C6.46667 11.2667 6.65333 11.34 6.88 11.34C7.10667 11.34 7.29333 11.2667 7.44 11.12L11.98 6.58C12.1267 6.43333 12.2 6.25333 12.2 6.04C12.2 5.82667 12.12 5.64 11.96 5.48C11.8133 5.33333 11.6267 5.26 11.4 5.26C11.1733 5.26 10.9867 5.33333 10.84 5.48L6.88 9.44ZM8 16C6.89333 16 5.85333 15.7899 4.88 15.3696C3.90667 14.9499 3.06 14.38 2.34 13.66C1.62 12.94 1.05013 12.0933 0.6304 11.12C0.210133 10.1467 0 9.10667 0 8C0 6.89333 0.210133 5.85333 0.6304 4.88C1.05013 3.90667 1.62 3.06 2.34 2.34C3.06 1.62 3.90667 1.04987 4.88 0.6296C5.85333 0.209867 6.89333 0 8 0C9.10667 0 10.1467 0.209867 11.12 0.6296C12.0933 1.04987 12.94 1.62 13.66 2.34C14.38 3.06 14.9499 3.90667 15.3696 4.88C15.7899 5.85333 16 6.89333 16 8C16 9.10667 15.7899 10.1467 15.3696 11.12C14.9499 12.0933 14.38 12.94 13.66 13.66C12.94 14.38 12.0933 14.9499 11.12 15.3696C10.1467 15.7899 9.10667 16 8 16Z" fill="#87B531" />
                    </svg>
                  </div>
                  <p className="font-['Noto_Sans:Regular',sans-serif] font-normal leading-[1.65] text-[14px] text-[#23262c] dark:text-[#b6c2cf]" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100" }}>
                    Address Validated
                  </p>
                </div>
                {profile.showIdVerified ? (
                  <div className="flex gap-2.5 items-center">
                    <div className="size-[16px] shrink-0">
                      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
                        <path d="M6.88 9.44L5.14 7.7C4.99333 7.55333 4.81333 7.48 4.6 7.48C4.38667 7.48 4.2 7.56 4.04 7.72C3.89333 7.86667 3.82 8.05333 3.82 8.28C3.82 8.50667 3.89333 8.69333 4.04 8.84L6.32 11.12C6.46667 11.2667 6.65333 11.34 6.88 11.34C7.10667 11.34 7.29333 11.2667 7.44 11.12L11.98 6.58C12.1267 6.43333 12.2 6.25333 12.2 6.04C12.2 5.82667 12.12 5.64 11.96 5.48C11.8133 5.33333 11.6267 5.26 11.4 5.26C11.1733 5.26 10.9867 5.33333 10.84 5.48L6.88 9.44ZM8 16C6.89333 16 5.85333 15.7899 4.88 15.3696C3.90667 14.9499 3.06 14.38 2.34 13.66C1.62 12.94 1.05013 12.0933 0.6304 11.12C0.210133 10.1467 0 9.10667 0 8C0 6.89333 0.210133 5.85333 0.6304 4.88C1.05013 3.90667 1.62 3.06 2.34 2.34C3.06 1.62 3.90667 1.04987 4.88 0.6296C5.85333 0.209867 6.89333 0 8 0C9.10667 0 10.1467 0.209867 11.12 0.6296C12.0933 1.04987 12.94 1.62 13.66 2.34C14.38 3.06 14.9499 3.90667 15.3696 4.88C15.7899 5.85333 16 6.89333 16 8C16 9.10667 15.7899 10.1467 15.3696 11.12C14.9499 12.0933 14.38 12.94 13.66 13.66C12.94 14.38 12.0933 14.9499 11.12 15.3696C10.1467 15.7899 9.10667 16 8 16Z" fill="#87B531" />
                      </svg>
                    </div>
                    <p className="font-['Noto_Sans:Regular',sans-serif] font-normal leading-[1.65] text-[14px] text-[#23262c] dark:text-[#b6c2cf]" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100" }}>
                      ID Verified
                    </p>
                  </div>
                ) : null}
              </div>

              <div className="flex min-h-0 flex-1 flex-col gap-2 self-stretch rounded border border-[#cfd2d9] dark:border-[#38414a] bg-white dark:bg-[#22272b] p-6">
                {profile.gender != null ? (
                  <ClientProfileMetaLine label="Gender">{profile.gender}</ClientProfileMetaLine>
                ) : null}
                {profile.dob != null ? (
                  <ClientProfileMetaLine label="Date of Birth">{profile.dob}</ClientProfileMetaLine>
                ) : null}
                <ClientProfileMetaLine label="Application">
                  {profile.applicationLabel}
                </ClientProfileMetaLine>
                <ClientProfileMetaLine label="Review Target">
                  {profile.reviewTargetSummary}
                  {profile.reviewTargetOverdue ? (
                    <span className="text-[#e65100]"> Overdue Warning</span>
                  ) : null}
                </ClientProfileMetaLine>
                <ClientProfileMetaLine label="Last Modified">
                  {profile.lastModified}
                </ClientProfileMetaLine>
              </div>
            </div>
      </AceAccordion>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden">
        <p
          className={cn(
            aceTypography(ACE_TYPE.labelBold),
            "m-0 shrink-0 text-[var(--screening-text-primary)]",
          )}
        >
          Screening Results
        </p>
      <ScreeningResultsTable
        rows={screeningRows}
        title="Matches"
        caseListSection={caseListSection}
        selectedIds={screeningSelectedIds}
        onSelectedIdsChange={onScreeningSelectedIdsChange}
        onQuickClearRow={onQuickClearRow}
        readOnly={isCaseReadOnly || workflowReadOnly}
      />
      </div>
    </div>
  );
}

export function Level1ReviewInterface() {
  const [sidebarPinned, setSidebarPinned] = useState(true);
  const [selectedCaseIndex, setSelectedCaseIndex] = useState(0);
  const [selectedCaseListSection, setSelectedCaseListSection] =
    useState<CaseListSectionContext>("todo");
  const [sidebarSelection, setSidebarSelection] = useState<ReviewAssignedSidebarSelection>({
    kind: "work",
    id: "sanction",
  });
  const [isReviewDrawerOpen, setIsReviewDrawerOpen] = useState(false);
  const [clientProfileAction, setClientProfileAction] = useState<ClientProfileActionId | null>(
    null,
  );
  const [screeningSelectedIds, setScreeningSelectedIds] = useState<Set<string>>(() => new Set());
  const [caseFilterVisibility, setCaseFilterVisibility] = useState<{
    filtersActive: boolean;
    filteredCount: number;
  }>({
    filtersActive: false,
    filteredCount: casesData.length,
  });
  const handleSelectCase = useCallback((index: number, section: CaseListSectionContext) => {
    setSelectedCaseIndex(index);
    setSelectedCaseListSection(section);
    setScreeningSelectedIds(new Set());
    setClientProfileAction(null);
  }, []);
  const [screeningRowsByCase, setScreeningRowsByCase] = useScreeningRowsByCase();
  const [pepCases] = useState(() => INITIAL_PEP_WORK_QUEUE.cases);
  const [pepScreeningRowsByCase, setPepScreeningRowsByCase] = useState(
    () => INITIAL_PEP_WORK_QUEUE.screeningRowsByCase,
  );
  const [workLogEntries, setWorkLogEntries] = useState<WorkLogEntry[]>([]);
  const [workLogOpen, setWorkLogOpen] = useState(false);
  const [workLogIntroOpen, setWorkLogIntroOpen] = useState(false);
  const workLogIntroShownRef = useRef(false);
  const undoWorkQueueRef = useRef<"sanction" | "pep">("sanction");

  const recordWorkLogDecision = useCallback(
    ({
      caseIndex,
      origin,
      clientName,
      clientId,
      status,
      matches,
    }: {
      caseIndex: number;
      origin: string;
      clientName: string;
      clientId: string;
      status: string;
      matches: readonly { id: string; name: string }[];
    }) => {
      const entries = createWorkLogEntriesForMatches({
        caseIndex,
        origin,
        clientName,
        clientId,
        status,
        matches,
      });
      if (entries.length === 0) return;
      setWorkLogEntries((prev) => {
        if (prev.length === 0 && !workLogIntroShownRef.current) {
          workLogIntroShownRef.current = true;
          queueMicrotask(() => setWorkLogIntroOpen(true));
        }
        return [...entries, ...prev];
      });
    },
    [],
  );

  const isWorkflowView = sidebarSelection.kind === "workflow";
  const isPepWork = sidebarSelection.kind === "work" && sidebarSelection.id === "pep";
  const activeCases = isWorkflowView || !isPepWork ? casesData : pepCases;
  const activeScreeningRowsByCase =
    isWorkflowView || !isPepWork ? screeningRowsByCase : pepScreeningRowsByCase;
  const setActiveScreeningRowsByCase =
    isWorkflowView || !isPepWork ? setScreeningRowsByCase : setPepScreeningRowsByCase;
  const getActiveRowsForCase = useCallback(
    (index: number) => {
      if (isPepWork && !isWorkflowView) {
        return pepScreeningRowsByCase[index] ?? [];
      }
      return screeningRowsByCase[index] ?? getScreeningRowsForCase(index);
    },
    [isPepWork, isWorkflowView, pepScreeningRowsByCase, screeningRowsByCase],
  );

  /** Client identity for the case that owns the submitted matches. */
  const workLogClientForCaseIndex = useCallback(
    (caseIndex: number) => {
      const clientName =
        (isPepWork ? pepCases[caseIndex]?.name : casesData[caseIndex]?.name)?.trim() || "—";
      const clientId = clientProfileForCaseIndex(caseIndex).clientId.trim() || "—";
      return { clientName, clientId };
    },
    [isPepWork, pepCases],
  );

  const workListTitle = isPepWork ? "PEP Screening" : "Sanction Matches";
  const screeningRuleLabel = isPepWork ? "PEP Screening" : "Sanctioned Matches";

  const selectedWorkflowId = isWorkflowView ? sidebarSelection.id : null;
  const selectedWorkflowLabel = selectedWorkflowId
    ? getWorkflowLabelById(selectedWorkflowId)
    : null;
  /** Work Log Origin — workflow name or My Work screening rule. */
  const workLogOrigin = isWorkflowView
    ? (selectedWorkflowLabel ?? "Workflow")
    : workListTitle;
  const isDocumentsRequiredWorkflow = isDocumentsRequiredWorkflowId(selectedWorkflowId);
  const isWorkflowReadOnlyView = isWorkflowView && !isDocumentsRequiredWorkflow;
  const workflowStatuses = useMemo(
    () => (selectedWorkflowId ? getLevel1StatusesForWorkflowId(selectedWorkflowId) : []),
    [selectedWorkflowId],
  );

  const screeningRows = useMemo(() => {
    const rows = getActiveRowsForCase(selectedCaseIndex);
    if (isWorkflowView) {
      return rows.filter((row) =>
        workflowStatuses.includes(row.status as (typeof workflowStatuses)[number]),
      );
    }
    // My Work — only New. Submitted decisions are recorded in the Work Log.
    return rows.filter((row) => isLevel1MyWorkStatus(row.status));
  }, [getActiveRowsForCase, selectedCaseIndex, isWorkflowView, workflowStatuses]);

  const handleSidebarSelectionChange = useCallback(
    (selection: ReviewAssignedSidebarSelection) => {
      setSidebarSelection(selection);
      setScreeningSelectedIds(new Set());
      setClientProfileAction(null);
      setIsReviewDrawerOpen(false);
      setSelectedCaseIndex(0);
      if (selection.kind === "workflow") {
        setSelectedCaseListSection(
          isDocumentsRequiredWorkflowId(selection.id) ? "documents-required" : "done",
        );
      } else {
        setSelectedCaseListSection("todo");
      }
    },
    [],
  );

  const isSelectedCaseReadOnly =
    !isPepWork && isCaseLockedByAnotherUser(selectedCaseIndex);

  useEffect(() => {
    if (isSelectedCaseReadOnly) {
      setScreeningSelectedIds(new Set());
      setIsReviewDrawerOpen(false);
    }
  }, [isSelectedCaseReadOnly, selectedCaseIndex]);

  const selectedScreeningRows = useMemo(
    () => screeningRows.filter((row) => screeningSelectedIds.has(row.id)),
    [screeningRows, screeningSelectedIds],
  );

  const allCasesCleared = useMemo(
    () =>
      activeCases.every((_, index) => isCaseScreeningComplete(getActiveRowsForCase(index))),
    [activeCases, getActiveRowsForCase],
  );

  const pendingSanctionCount = useMemo(
    () =>
      casesData.reduce((count, _, index) => {
        const rows = screeningRowsByCase[index] ?? getScreeningRowsForCase(index);
        return isCaseScreeningComplete(rows) ? count : count + 1;
      }, 0),
    [screeningRowsByCase],
  );

  const pendingPepCount = useMemo(
    () =>
      pepCases.reduce((count, _, index) => {
        const rows = pepScreeningRowsByCase[index] ?? [];
        return isCaseScreeningComplete(rows) ? count : count + 1;
      }, 0),
    [pepCases, pepScreeningRowsByCase],
  );

  const sidebarWorkflowItems = useMemo(
    () => deriveReviewSidebarWorkflows(screeningRowsByCase, "level-1"),
    [screeningRowsByCase],
  );

  useEffect(() => {
    if (sidebarSelection.kind !== "workflow") return;
    const stillPresent = sidebarWorkflowItems.some((item) => item.id === sidebarSelection.id);
    if (!stillPresent) {
      setSidebarSelection({ kind: "work", id: "sanction" });
      setSelectedCaseListSection("todo");
    }
  }, [sidebarSelection, sidebarWorkflowItems]);

  const workflowHasCases = useMemo(() => {
    if (!isWorkflowView) return true;
    return casesData.some((_, index) => {
      const rows = screeningRowsByCase[index] ?? getScreeningRowsForCase(index);
      return rows.some((row) =>
        workflowStatuses.includes(row.status as (typeof workflowStatuses)[number]),
      );
    });
  }, [isWorkflowView, screeningRowsByCase, workflowStatuses]);

  const handleShowReview = useCallback(() => {
    setIsReviewDrawerOpen((open) => !open);
  }, []);

  const restoreSubmittedRows = useCallback(
    (caseIndex: number, previousRowsById: Record<string, (typeof screeningRows)[number]>) => {
      setWorkLogEntries((prev) =>
        removeWorkLogEntriesForRowIds(prev, Object.keys(previousRowsById)),
      );
      const restoreInPep = undoWorkQueueRef.current === "pep";
      const applyRestore = (
        prev: Record<number, ScreeningResultRow[]>,
        fallback: (index: number) => ScreeningResultRow[],
      ) => {
        const current = prev[caseIndex] ?? fallback(caseIndex);
        return {
          ...prev,
          [caseIndex]: current.map((row) => previousRowsById[row.id] ?? row),
        };
      };
      if (restoreInPep) {
        setPepScreeningRowsByCase((prev) => applyRestore(prev, () => []));
      } else {
        setScreeningRowsByCase((prev) => applyRestore(prev, getScreeningRowsForCase));
      }
    },
    [setScreeningRowsByCase],
  );

  const { showBulkSubmitToast, commitPendingToast, bulkSubmitToast } = useBulkSubmitUndoToast({
    restoreRows: restoreSubmittedRows,
  });

  const overdueWarningToast = useOverdueWarningToast();

  const handleSubmitDecision = useCallback(
    (status: string, reason: string) => {
      const current = getActiveRowsForCase(selectedCaseIndex);
      const selectedRows = current.filter((row) => screeningSelectedIds.has(row.id));
      if (
        !(getLevel1DecisionStatusesForRows(selectedRows) as readonly string[]).includes(status)
      ) {
        return;
      }
      const caseName = activeCases[selectedCaseIndex]?.name ?? "Case";
      const snapshot = buildSubmitUndoSnapshot({
        caseIndex: selectedCaseIndex,
        caseName,
        rows: current,
        selectedIds: screeningSelectedIds,
        status,
        flowVariant: "level-1",
        screeningRuleLabel,
      });

      commitPendingToast();
      undoWorkQueueRef.current = isPepWork ? "pep" : "sanction";

      const reviewer = WORK_LOG_REVIEWER;
      const { clientName, clientId } = workLogClientForCaseIndex(selectedCaseIndex);
      recordWorkLogDecision({
        caseIndex: selectedCaseIndex,
        origin: workLogOrigin,
        clientName,
        clientId,
        status,
        matches: selectedRows.map((row) => ({ id: row.id, name: row.name })),
      });

      setActiveScreeningRowsByCase((prev) => {
        const rows = prev[selectedCaseIndex] ?? getActiveRowsForCase(selectedCaseIndex);
        return {
          ...prev,
          [selectedCaseIndex]: rows.map((row) =>
            screeningSelectedIds.has(row.id)
              ? {
                  ...row,
                  status: status as Level1ScreeningStatus,
                  level1Reason: reason,
                  level1Reviewer: reviewer,
                }
              : row,
          ),
        };
      });
      setScreeningSelectedIds(new Set());
      showBulkSubmitToast(snapshot);
    },
    [
      selectedCaseIndex,
      screeningSelectedIds,
      getActiveRowsForCase,
      activeCases,
      screeningRuleLabel,
      isPepWork,
      workLogOrigin,
      setActiveScreeningRowsByCase,
      recordWorkLogDecision,
      workLogClientForCaseIndex,
      commitPendingToast,
      showBulkSubmitToast,
    ],
  );

  const handleQuickClearRow = useCallback(
    (rowId: string, status: ScreeningRowStatus) => {
      const current = getActiveRowsForCase(selectedCaseIndex);
      const target = current.find((row) => row.id === rowId);
      if (!target) return;
      if (
        !(getLevel1DecisionStatusesForRows([target]) as readonly string[]).includes(status)
      ) {
        return;
      }
      const caseName = activeCases[selectedCaseIndex]?.name ?? "Case";
      const snapshot = buildSubmitUndoSnapshot({
        caseIndex: selectedCaseIndex,
        caseName,
        rows: current,
        selectedIds: new Set([rowId]),
        status,
        flowVariant: "level-1",
        screeningRuleLabel,
      });

      commitPendingToast();
      undoWorkQueueRef.current = isPepWork ? "pep" : "sanction";

      const reviewer = WORK_LOG_REVIEWER;
      const { clientName, clientId } = workLogClientForCaseIndex(selectedCaseIndex);
      recordWorkLogDecision({
        caseIndex: selectedCaseIndex,
        origin: workLogOrigin,
        clientName,
        clientId,
        status,
        matches: [{ id: target.id, name: target.name }],
      });

      setActiveScreeningRowsByCase((prev) => {
        const rows = prev[selectedCaseIndex] ?? getActiveRowsForCase(selectedCaseIndex);
        return {
          ...prev,
          [selectedCaseIndex]: rows.map((row) =>
            row.id === rowId
              ? {
                  ...row,
                  status: status as Level1ScreeningStatus,
                  level1Reason: status,
                  level1Reviewer: reviewer,
                }
              : row,
          ),
        };
      });
      setScreeningSelectedIds((prev) => {
        if (!prev.has(rowId)) return prev;
        const next = new Set(prev);
        next.delete(rowId);
        return next;
      });
      showBulkSubmitToast(snapshot);
    },
    [
      selectedCaseIndex,
      getActiveRowsForCase,
      activeCases,
      screeningRuleLabel,
      isPepWork,
      workLogOrigin,
      setActiveScreeningRowsByCase,
      recordWorkLogDecision,
      workLogClientForCaseIndex,
      commitPendingToast,
      showBulkSubmitToast,
    ],
  );

  const handleBulkQuickClear = useCallback(
    (status: ScreeningRowStatus) => {
      const current = getActiveRowsForCase(selectedCaseIndex);
      const selectedRows = current.filter((row) => screeningSelectedIds.has(row.id));
      if (
        !(getLevel1DecisionStatusesForRows(selectedRows) as readonly string[]).includes(status)
      ) {
        return;
      }
      const caseName = activeCases[selectedCaseIndex]?.name ?? "Case";
      const snapshot = buildSubmitUndoSnapshot({
        caseIndex: selectedCaseIndex,
        caseName,
        rows: current,
        selectedIds: screeningSelectedIds,
        status,
        flowVariant: "level-1",
        screeningRuleLabel,
      });

      commitPendingToast();
      undoWorkQueueRef.current = isPepWork ? "pep" : "sanction";

      const reviewer = WORK_LOG_REVIEWER;
      const { clientName, clientId } = workLogClientForCaseIndex(selectedCaseIndex);
      recordWorkLogDecision({
        caseIndex: selectedCaseIndex,
        origin: workLogOrigin,
        clientName,
        clientId,
        status,
        matches: selectedRows.map((row) => ({ id: row.id, name: row.name })),
      });

      setActiveScreeningRowsByCase((prev) => {
        const rows = prev[selectedCaseIndex] ?? getActiveRowsForCase(selectedCaseIndex);
        return {
          ...prev,
          [selectedCaseIndex]: rows.map((row) =>
            screeningSelectedIds.has(row.id)
              ? {
                  ...row,
                  status: status as Level1ScreeningStatus,
                  level1Reason: status,
                  level1Reviewer: reviewer,
                }
              : row,
          ),
        };
      });
      setScreeningSelectedIds(new Set());
      showBulkSubmitToast(snapshot);
    },
    [
      selectedCaseIndex,
      screeningSelectedIds,
      getActiveRowsForCase,
      activeCases,
      screeningRuleLabel,
      isPepWork,
      workLogOrigin,
      setActiveScreeningRowsByCase,
      recordWorkLogDecision,
      workLogClientForCaseIndex,
      commitPendingToast,
      showBulkSubmitToast,
    ],
  );

  const { submitReviewDecision, completeCaseConfirmDialog } = useCompleteCaseSubmit({
    rows: screeningRows,
    selectedIds: screeningSelectedIds,
    flowVariant: "level-1",
    onSubmit: handleSubmitDecision,
  });

  useEffect(() => {
    setScreeningSelectedIds(new Set());
  }, [selectedCaseIndex]);

  const handleTriggerClick = useCallback(() => {
    setSidebarPinned((pinned) => !pinned);
  }, []);

  return (
    <ThemeProvider>
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-[var(--screening-surface-muted)] text-[var(--screening-text-primary)]">
      <ReviewFlowSiteHeader />
      <PageHeader
        isSidebarOpen={sidebarPinned}
        sidebarPinned={sidebarPinned}
        levelLabel="Level 1"
        onTriggerClick={handleTriggerClick}
        onOpenWorkLog={() => setWorkLogOpen(true)}
      />
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <ReviewSidebar
          isOpen={sidebarPinned}
          sanctionMatchCount={pendingSanctionCount}
          pepMatchCount={pendingPepCount}
          workflowItems={sidebarWorkflowItems}
          selection={sidebarSelection}
          onSelectionChange={handleSidebarSelectionChange}
        />
        <div className="flex min-h-0 flex-1 overflow-hidden">
          <div className="flex flex-col flex-1 min-h-0 overflow-hidden px-4 pb-4 gap-4">
            <div className="flex flex-1 min-h-0 overflow-hidden gap-4 pt-4">
              <div className="shrink-0 self-stretch flex flex-col min-h-0">
                <CaseList
                  onSelectCase={handleSelectCase}
                  selectedCaseIndex={selectedCaseIndex}
                  selectedCaseListSection={selectedCaseListSection}
                  screeningRowsByCase={activeScreeningRowsByCase}
                  onFilterVisibilityChange={setCaseFilterVisibility}
                  workflowId={selectedWorkflowId}
                  listTitle={selectedWorkflowLabel ?? workListTitle}
                  cases={activeCases}
                  applyCaseLocks={!isPepWork}
                  getRowsForCase={getActiveRowsForCase}
                />
              </div>
              <DetailPanel
                selectedCase={activeCases[selectedCaseIndex] ?? activeCases[0]!}
                selectedCaseIndex={selectedCaseIndex}
                caseListSection={selectedCaseListSection}
                screeningRows={screeningRows}
                screeningSelectedIds={screeningSelectedIds}
                onScreeningSelectedIdsChange={setScreeningSelectedIds}
                allCasesCleared={allCasesCleared && !isWorkflowView}
                onQuickClearRow={handleQuickClearRow}
                showFilterEmptyState={
                  (caseFilterVisibility.filtersActive &&
                    caseFilterVisibility.filteredCount === 0) ||
                  (isWorkflowView && !workflowHasCases)
                }
                emptyStateMessage={
                  isWorkflowView && !workflowHasCases
                    ? "No cases in this workflow yet."
                    : "No cases match the selected filters."
                }
                isCaseReadOnly={isSelectedCaseReadOnly}
                workflowLabel={selectedWorkflowLabel}
                workflowReadOnly={isWorkflowReadOnlyView}
                onOpenClientProfileAction={setClientProfileAction}
              />
            </div>
            {!allCasesCleared &&
            !isSelectedCaseReadOnly &&
            (!isWorkflowView || isDocumentsRequiredWorkflow) ? (
              <ReviewTaskBar
                flowVariant="level-1"
                onShowReview={handleShowReview}
                isReviewOpen={isReviewDrawerOpen}
                screeningSelectionCount={screeningSelectedIds.size}
                selectedRows={selectedScreeningRows}
                onDeselectAllScreening={() => setScreeningSelectedIds(new Set())}
                onBulkQuickClear={handleBulkQuickClear}
                onOpenWorkLog={() => setWorkLogOpen(true)}
              />
            ) : null}
          </div>
          <ClientProfileActionDrawer
            open={clientProfileAction !== null}
            action={clientProfileAction ?? "notes"}
            onActionChange={setClientProfileAction}
            onClose={() => setClientProfileAction(null)}
            caseIndex={selectedCaseIndex}
          />
          <ReviewDrawer
            isOpen={isReviewDrawerOpen}
            onClose={() => setIsReviewDrawerOpen(false)}
            flowVariant="level-1"
            selectedCount={screeningSelectedIds.size}
            selectedRows={selectedScreeningRows}
            onSubmit={submitReviewDecision}
          />
        </div>
      </div>
      {completeCaseConfirmDialog}
      {bulkSubmitToast}
      {overdueWarningToast}
      <WorkLogModal
        open={workLogOpen}
        onClose={() => setWorkLogOpen(false)}
        entries={workLogEntries}
      />
      <WorkLogIntroModal
        open={workLogIntroOpen}
        onClose={() => setWorkLogIntroOpen(false)}
      />
    </div>
    </ThemeProvider>
  );
}
