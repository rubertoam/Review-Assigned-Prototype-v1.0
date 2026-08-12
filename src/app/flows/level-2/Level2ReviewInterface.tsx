/** Level 2 user flow â€” cloned from Level 1; diverge flow-specific edits here only. */
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
import { CaseListLevel2TodoEmptyState } from "../../components/CaseListLevel2TodoEmptyState";
import { Level2AwaitingLevel1State } from "../../components/Level2AwaitingLevel1State";
import { CaseListFilterEmptyState } from "../../components/CaseListFilterEmptyState";
import { CaseListSection } from "../../components/CaseListSection";
import { ThemeProvider } from "../../context/ThemeContext";
import { aceAccordionFixedHeaderClass } from "../../lib/aceAccordion";
import { aceDropShadowXsClass } from "../../lib/aceShadow";
import { aceTypography, ACE_TYPE } from "../../lib/aceTypography";
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
  caseHasLevel2Activity,
  caseHasLevel2QueueWork,
  caseIsLevel2Done,
  getScreeningRowsForCase,
  isCaseReviewComplete,
  isLevel2ReviewedRow,
  LEVEL2_ANALYST_REVIEWER,
  type CaseListSectionContext,
  type ScreeningResultRow,
  type ScreeningRowStatus,
} from "../../components/ScreeningResultsTable";
import { isLevel1InProcessStatus } from "../../lib/reviewDecisionConfig";
import {
  ensureScreeningRowsForCase,
  useScreeningRowsByCase,
} from "../../lib/screeningState";
import { useCompleteCaseSubmit } from "../../lib/useCompleteCaseSubmit";
import { ToastViewport } from "../../lib/toastPresentation";
import {
  ReviewOnboardingCoach,
  useReviewOnboardingCoach,
} from "../../components/ReviewOnboardingCoach";
import {
  buildSubmitUndoSnapshot,
  useBulkSubmitUndoToast,
} from "../../lib/useBulkSubmitUndoToast";
import {
  caseMatchesFilters,
  casesData,
  clientProfileForCaseIndex,
  compareCasesBySort,
  riskBandPresentation,
  type CaseFilterValue,
  type CaseSortValue,
} from "../../lib/reviewCaseData";
import { cn } from "../../components/ui/utils";
import { ReviewDrawer } from "../../components/ReviewDrawer";
import { ReviewTaskBar } from "../../components/ReviewTaskBar";
import {
  ReviewAssignedSidebar,
  withSanctionCount,
  type ReviewAssignedSidebarSelection,
} from "../../components/ReviewAssignedSidebar";
import { sidebarIconButtonClass } from "@ace-ds/components/organisms/AceSidebar/sidebarRowActions";
import { deriveReviewSidebarWorkflows } from "../../lib/reviewSidebarWorkflows";
import { AceAccordion } from "@ace-ds/components/molecules/AceAccordion/AceAccordion";

interface PageHeaderProps {
  isSidebarOpen: boolean;
  sidebarPinned: boolean;
  levelLabel: string;
  onTriggerClick: () => void;
  suppressSidebarTooltip?: boolean;
}

/**
 * Apply a Level 2 decision to a screening row. "Remediate" sends the match back
 * to Level 1 — it is reopened as "New" and the prior L1/L2 decision is cleared.
 */
function applyLevel2Decision(
  row: ScreeningResultRow,
  status: string,
  reason: string,
): ScreeningResultRow {
  if (status === "Remediate") {
    return {
      ...row,
      status: "New",
      level1Reason: undefined,
      level1Reviewer: undefined,
      decisionReason: undefined,
      decisionReviewer: undefined,
      remediatedFromLevel2: true,
      remediationReason: reason,
    };
  }
  return {
    ...row,
    status: status as ScreeningRowStatus,
    decisionReason: reason,
    decisionReviewer: LEVEL2_ANALYST_REVIEWER,
  };
}

function PageHeader({
  isSidebarOpen,
  sidebarPinned,
  levelLabel,
  onTriggerClick,
  suppressSidebarTooltip = false,
}: PageHeaderProps) {
  const sidebarToggleButton = (
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
  );

  return (
    <div className="flex shrink-0 items-center justify-between border-b border-[var(--screening-border-strong)] bg-[var(--screening-surface)] px-4 py-3 md:px-8">
      <div className="flex items-center gap-5">
        <div className="relative inline-flex" data-coach-target="sidebar-toggle">
          {suppressSidebarTooltip ? (
            sidebarToggleButton
          ) : (
            <AceTooltip>
              <AceTooltipTrigger asChild>{sidebarToggleButton}</AceTooltipTrigger>
              <AceTooltipContent side="top" variant="screening-toolbar" hideArrow>
                {isSidebarOpen ? "Close sidebar" : "Open sidebar"}
              </AceTooltipContent>
            </AceTooltip>
          )}
        </div>
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
      </div>
    </div>
  );
}

const SIDEBAR_ORGANIZATIONS = [{ id: "level-2-users", label: "Level 2 Users" }] as const;

const MY_WORK_BADGE = "text-[#523eb9]";

const SIDEBAR_WORK_CATEGORIES = [
  {
    id: "sanction",
    label: "Escalated Sanctions",
    selectable: true,
    badgeLabelClass: MY_WORK_BADGE,
  },
  {
    id: "pep",
    label: "Escalated PEPs",
    selectable: false,
    badgeLabelClass: MY_WORK_BADGE,
  },
  {
    id: "financial",
    label: "Escalated Financial Crime",
    selectable: false,
    badgeLabelClass: MY_WORK_BADGE,
  },
] as const;

const STATIC_SIDEBAR_COUNTS: Record<string, number> = {
  pep: 18,
  financial: 8,
};

interface ReviewSidebarProps {
  isOpen: boolean;
  sanctionMatchCount: number;
  workflowItems: ReturnType<typeof deriveReviewSidebarWorkflows>;
}

function ReviewSidebar({ isOpen, sanctionMatchCount, workflowItems }: ReviewSidebarProps) {
  const [selection, setSelection] = useState<ReviewAssignedSidebarSelection>({
    kind: "work",
    id: "sanction",
  });
  const workCategories = useMemo(
    () =>
      withSanctionCount(
        SIDEBAR_WORK_CATEGORIES,
        STATIC_SIDEBAR_COUNTS,
        sanctionMatchCount,
      ),
    [sanctionMatchCount],
  );

  return (
    <ReviewAssignedSidebar
      open={isOpen}
      organizations={SIDEBAR_ORGANIZATIONS}
      workCategories={workCategories}
      workflowItems={workflowItems}
      selection={selection}
      onSelectionChange={setSelection}
    />
  );
}

interface CaseListProps {
  onSelectCase: (index: number, section: CaseListSectionContext) => void;
  selectedCaseIndex: number | null;
  selectedCaseListSection: CaseListSectionContext | null;
  screeningRowsByCase: Record<number, ScreeningResultRow[]>;
  onFilterVisibilityChange?: (state: { filtersActive: boolean; filteredCount: number }) => void;
}

type CaseListRow = { item: (typeof casesData)[number]; index: number };

function CaseList({
  onSelectCase,
  selectedCaseIndex,
  selectedCaseListSection,
  screeningRowsByCase,
  onFilterVisibilityChange,
}: CaseListProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [caseListMinimized, setCaseListMinimized] = useState(false);
  const [doneSectionExpanded, setDoneSectionExpanded] = useState(false);
  const [selectedCaseFilters, setSelectedCaseFilters] = useState<ReadonlySet<CaseFilterValue>>(
    () => new Set(),
  );
  const [caseSort, setCaseSort] = useState<CaseSortValue>("results-desc");
  const wasSelectedCaseCompleteRef = useRef(false);

  const caseRowsForIndex = useCallback(
    (index: number) => screeningRowsByCase[index] ?? [],
    [screeningRowsByCase],
  );

  /** Results in the Level 2 queue, or reviewed count once the case is complete. */
  const level2ResultCount = useCallback(
    (index: number) => {
      const rows = caseRowsForIndex(index);
      const inQueue = rows.filter((r) => isLevel1InProcessStatus(r.status)).length;
      if (inQueue > 0) return inQueue;
      return rows.filter((r) => isLevel2ReviewedRow(r)).length;
    },
    [caseRowsForIndex],
  );

  const filteredRows = useMemo(() => {
    const out: CaseListRow[] = [];
    casesData.forEach((item, index) => {
      if (caseMatchesFilters(index, selectedCaseFilters)) {
        out.push({ item, index });
      }
    });
    out.sort((a, b) => compareCasesBySort(a.index, b.index, caseSort, level2ResultCount));
    return out;
  }, [selectedCaseFilters, caseSort, level2ResultCount]);

  useEffect(() => {
    onFilterVisibilityChange?.({
      filtersActive: selectedCaseFilters.size > 0,
      filteredCount: filteredRows.length,
    });
  }, [filteredRows.length, selectedCaseFilters.size, onFilterVisibilityChange]);

  const { pendingRows, doneRows } = useMemo(() => {
    const pending: CaseListRow[] = [];
    const done: CaseListRow[] = [];
    filteredRows.forEach((row) => {
      const caseRows = caseRowsForIndex(row.index);
      if (caseIsLevel2Done(caseRows)) {
        done.push(row);
      } else if (caseHasLevel2QueueWork(caseRows)) {
        pending.push(row);
      }
    });
    return { pendingRows: pending, doneRows: done };
  }, [filteredRows, caseRowsForIndex]);

  useEffect(() => {
    if (pendingRows.length === 0 && doneRows.length > 0) {
      setDoneSectionExpanded(true);
    }
  }, [pendingRows.length, doneRows.length]);

  const caseReviewProgress = useMemo(
    () =>
      casesData.map((_, i) => {
        const rows = caseRowsForIndex(i);
        const done = rows.filter((r) => isLevel2ReviewedRow(r)).length;
        const inQueue = rows.filter((r) => isLevel1InProcessStatus(r.status)).length;
        return { done, total: done + inQueue };
      }),
    [caseRowsForIndex],
  );

  useEffect(() => {
    if (selectedCaseIndex === null) {
      wasSelectedCaseCompleteRef.current = false;
      return;
    }
    wasSelectedCaseCompleteRef.current = caseIsLevel2Done(caseRowsForIndex(selectedCaseIndex));
  }, [selectedCaseIndex, caseRowsForIndex]);

  useEffect(() => {
    if (selectedCaseIndex === null || selectedCaseListSection !== "todo") return;
    const complete = caseIsLevel2Done(caseRowsForIndex(selectedCaseIndex));
    if (complete && !wasSelectedCaseCompleteRef.current && pendingRows.length > 0) {
      onSelectCase(pendingRows[0].index, "todo");
    }
    wasSelectedCaseCompleteRef.current = complete;
  }, [
    screeningRowsByCase,
    selectedCaseIndex,
    selectedCaseListSection,
    pendingRows,
    onSelectCase,
    caseRowsForIndex,
  ]);

  useEffect(() => {
    if (selectedCaseIndex === null || selectedCaseListSection === null) return;
    const activeList = selectedCaseListSection === "done" ? doneRows : pendingRows;
    if (activeList.some((r) => r.index === selectedCaseIndex)) return;
    if (activeList.length > 0) {
      onSelectCase(activeList[0].index, selectedCaseListSection);
    }
  }, [doneRows, pendingRows, selectedCaseIndex, selectedCaseListSection, onSelectCase]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isFocused || selectedCaseIndex === null || selectedCaseListSection === null) return;

      const activeList = selectedCaseListSection === "done" ? doneRows : pendingRows;
      const pos = activeList.findIndex((r) => r.index === selectedCaseIndex);
      if (pos < 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (pos < activeList.length - 1) {
          onSelectCase(activeList[pos + 1].index, selectedCaseListSection);
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (pos > 0) {
          onSelectCase(activeList[pos - 1].index, selectedCaseListSection);
        }
      }
    };

    const listElement = listRef.current;
    if (listElement) {
      listElement.addEventListener('keydown', handleKeyDown);
      return () => listElement.removeEventListener('keydown', handleKeyDown);
    }
  }, [
    selectedCaseIndex,
    selectedCaseListSection,
    onSelectCase,
    isFocused,
    pendingRows,
    doneRows,
  ]);

  const renderCaseRow = (
    caseItem: (typeof casesData)[number],
    index: number,
    section: CaseListSectionContext,
  ) => {
    const isEntity = "isEntity" in caseItem && caseItem.isEntity;
    const profile = clientProfileForCaseIndex(index);
    const clientId = profile.clientId;
    const caseRows = caseRowsForIndex(index);
    const inQueueCount = caseRows.filter((r) => isLevel1InProcessStatus(r.status)).length;
    const reviewedCount = caseRows.filter((r) => isLevel2ReviewedRow(r)).length;
    const resultsCount = section === "todo" ? inQueueCount : reviewedCount;
    const { done, total } = caseReviewProgress[index] ?? { done: 0, total: 1 };
    const progressPct = total > 0 ? (done / total) * 100 : 0;
    const isSelected =
      selectedCaseIndex === index && selectedCaseListSection === section;
    const hasOverdueRowHighlight = profile.reviewTargetOverdue || profile.reviewTargetPastDue;
    return (
      <div
        key={`${section}-${index}`}
        className={cn(
          "group relative cursor-pointer px-4 pb-2.5 pt-1 transition-colors",
          hasOverdueRowHighlight
            ? isSelected
              ? "bg-[var(--ace-warning-50)]"
              : "bg-[var(--ace-warning-50)] hover:bg-[var(--ace-warning-100)]"
            : isSelected
              ? "bg-[#e4e6ea] dark:bg-[#333a42]"
              : "hover:bg-[#e4e6ea] dark:hover:bg-[#333a42]",
        )}
        onClick={() => onSelectCase(index, section)}
      >
        {isSelected && isFocused && (
          <div aria-hidden="true" className="absolute inset-0 z-20 border-[0.5px] border-[#523eb9] border-solid pointer-events-none" />
        )}
        <div className="relative z-10 flex items-center justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className={`${isEntity ? 'h-[15px]' : ''} w-[16px] shrink-0`}>
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox={isEntity ? "0 0 16 15" : "0 0 16 16"}>
                <path d={isEntity ? svgPaths.p1ac17500 : svgPaths.p8c3ef80} fill="var(--fill-0, #523EB9)" />
              </svg>
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <p className="font-['Noto_Sans:Regular',sans-serif] font-normal leading-[1.65] text-[#23262c] dark:text-[#b6c2cf] text-[14px]" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100" }}>
                {caseItem.name}
              </p>
              <p className="font-['Noto_Sans:Regular',sans-serif] font-normal leading-[1.65] text-[#23262c] dark:text-[#b6c2cf] text-[10px] tracking-[0.2px]" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100" }}>
                {clientId} · {resultsCount} results
              </p>
            </div>
          </div>
          {(profile.reviewTargetOverdue || profile.reviewTargetPastDue) &&
          caseHasLevel2QueueWork(caseRowsForIndex(index)) ? (
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
        </div>
        <div
          className="pointer-events-none absolute bottom-1 left-4 right-4 z-10 h-1 overflow-hidden rounded-full border border-[#e4e6ea] bg-[#eff0f2] dark:bg-[#2c333a] opacity-0 transition-opacity duration-200 group-hover:opacity-100"
          aria-hidden
        >
          <div
            className="h-full rounded-full bg-[#523eb9] transition-[width] duration-300 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>
    );
  };

  const listTitle = "Sanction Matches";

  return (
    <div
      ref={listRef}
      tabIndex={0}
      data-coach-target="case-list"
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      className={cn(
        "flex min-h-0 flex-1 flex-col overflow-hidden rounded-[var(--radius-sm)] border border-[var(--screening-border-strong)] bg-[var(--screening-surface)] outline-none",
        "transition-[width] duration-200 ease-out",
        caseListMinimized ? "w-10" : "w-64 lg:w-72",
        aceDropShadowXsClass,
      )}
    >
      {caseListMinimized ? (
        <div className="flex h-full min-h-0 flex-col items-center gap-3 px-1 pb-3 pt-3">
          <AceTooltip>
            <AceTooltipTrigger asChild>
              <button
                type="button"
                aria-expanded={false}
                aria-label="Expand case list"
                className={sidebarIconButtonClass}
                onClick={() => setCaseListMinimized(false)}
              >
                <MaterialSymbol
                  name="keyboard_arrow_right"
                  size="md"
                  className="text-current"
                />
              </button>
            </AceTooltipTrigger>
            <AceTooltipContent side="right" variant="screening-toolbar" hideArrow>
              Expand case list
            </AceTooltipContent>
          </AceTooltip>
          <span
            className="max-h-full truncate font-['Noto_Sans:Bold',sans-serif] text-[12px] font-bold leading-none tracking-[0.02em] text-[var(--screening-text-secondary)]"
            style={{
              fontVariationSettings: "'CTGR' 0, 'wdth' 100",
              writingMode: "vertical-rl",
              transform: "rotate(180deg)",
            }}
            title={listTitle}
          >
            {listTitle}
          </span>
        </div>
      ) : (
        <>
          <div className="flex shrink-0 items-center justify-between gap-2 px-3 pb-3 pt-5">
            <p
              className="min-w-0 truncate font-['Noto_Sans:Bold',sans-serif] text-[14px] font-bold leading-[1.65] text-[var(--screening-text-primary)]"
              style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100" }}
            >
              {listTitle}
            </p>
            <AceTooltip>
              <AceTooltipTrigger asChild>
                <button
                  type="button"
                  aria-expanded={true}
                  aria-label="Minimize case list"
                  className={cn(sidebarIconButtonClass, "shrink-0")}
                  onClick={() => setCaseListMinimized(true)}
                >
                  <MaterialSymbol name="keyboard_arrow_left" size="md" className="text-current" />
                </button>
              </AceTooltipTrigger>
              <AceTooltipContent side="top" variant="screening-toolbar" hideArrow>
                Minimize case list
              </AceTooltipContent>
            </AceTooltip>
          </div>
          <div className="shrink-0 bg-[var(--screening-surface)] px-3 py-2.5">
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
          <div className="flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto">
            <CaseListSection
              title="Cases"
              count={pendingRows.length}
              collapsible={false}
              stickyHeader
              emptyContent={
                selectedCaseFilters.size > 0 ? (
                  <CaseListFilterEmptyState />
                ) : (
                  <CaseListLevel2TodoEmptyState />
                )
              }
            >
              {pendingRows.map(({ item, index }) => renderCaseRow(item, index, "todo"))}
            </CaseListSection>
            <CaseListSection
              title="Sent to Final Status"
              count={doneRows.length}
              expanded={doneSectionExpanded}
              onExpandedChange={setDoneSectionExpanded}
              hideWhenEmpty
              emptyContent={
                selectedCaseFilters.size > 0 ? <CaseListFilterEmptyState /> : undefined
              }
            >
              {doneRows.map(({ item, index }) => renderCaseRow(item, index, "done"))}
            </CaseListSection>
          </div>
        </>
      )}
    </div>
  );
}

interface DetailPanelProps {
  selectedCase: (typeof casesData)[number] | null;
  selectedCaseIndex: number | null;
  caseListSection: CaseListSectionContext | null;
  screeningRows: ScreeningResultRow[];
  screeningSelectedIds: Set<string>;
  onScreeningSelectedIdsChange: Dispatch<SetStateAction<Set<string>>>;
  allCasesCleared: boolean;
  awaitingLevel1Work: boolean;
  onQuickClearRow: (rowId: string, status: ScreeningRowStatus) => void;
  showFilterEmptyState?: boolean;
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
  awaitingLevel1Work,
  onQuickClearRow,
  showFilterEmptyState = false,
  onOpenClientProfileAction,
}: DetailPanelProps) {
  const [clientExpanded, setClientExpanded] = useState(false);

  if (showFilterEmptyState) {
    return (
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <ReviewPanelEmptyState message="No cases match the selected filters." />
      </div>
    );
  }

  if (awaitingLevel1Work) {
    return (
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <Level2AwaitingLevel1State />
      </div>
    );
  }

  if (allCasesCleared) {
    return (
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <AllCasesClearedState />
      </div>
    );
  }

  if (selectedCaseIndex === null || selectedCase === null) {
    return (
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <Level2NoCaseSelectedState />
      </div>
    );
  }

  const profile = clientProfileForCaseIndex(selectedCaseIndex);
  const riskPresentation = riskBandPresentation(profile.riskBand);
  const isCaseComplete = isCaseReviewComplete(screeningRows, "level-2");
  const showOverdueWarning = profile.reviewTargetOverdue && !isCaseComplete;

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-x-hidden overflow-y-auto">
      <div
        className="sticky top-0 z-20 flex shrink-0 flex-col gap-2 bg-[var(--screening-surface-muted)] pb-2"
        data-coach-target="client-profile"
      >
        <p
          className="m-0 font-['Noto_Sans:Bold',sans-serif] text-[14px] font-bold leading-[1.65] text-[var(--screening-text-primary)]"
          style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100" }}
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
              showOverdueWarning={showOverdueWarning}
            />
          </div>
        }
        titleClassName={cn(
          aceTypography(ACE_TYPE.p1SemiBold),
          "min-w-0 flex-1 overflow-visible text-[var(--screening-text-primary)] !truncate",
        )}
        headerTrailing={
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
        }
      >
            <div className="flex min-h-[260px] gap-4 items-stretch">
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
                  {showOverdueWarning ? (
                    <span className="text-[#e65100]"> Overdue Warning</span>
                  ) : null}
                </ClientProfileMetaLine>
                <ClientProfileMetaLine label="Last Modified">
                  {profile.lastModified}
                </ClientProfileMetaLine>
              </div>

              <AceTooltip>
                <AceTooltipTrigger asChild>
                  <button
                    type="button"
                    aria-label="View Risk Rating"
                    onClick={() => onOpenClientProfileAction?.("risk-rating")}
                    className={cn(
                      "flex min-h-0 min-w-[140px] flex-1 flex-col items-center justify-center self-stretch rounded p-6",
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
      </AceAccordion>
      </div>

      <div className="flex shrink-0 flex-col gap-2">
        <p
          className="m-0 shrink-0 font-['Noto_Sans:Bold',sans-serif] text-[14px] font-bold leading-[1.65] text-[var(--screening-text-primary)]"
          style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100" }}
        >
          Match Alerts
        </p>
      <ScreeningResultsTable
        rows={screeningRows}
        title="Matches"
        flowVariant="level-2"
        caseListSection={caseListSection ?? "todo"}
        selectedIds={screeningSelectedIds}
        onSelectedIdsChange={onScreeningSelectedIdsChange}
        onQuickClearRow={onQuickClearRow}
      />
      </div>
    </div>
  );
}

function Level2NoCaseSelectedState() {
  return (
    <div className="flex min-h-0 min-w-0 flex-1 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--screening-border-strong)] bg-[var(--screening-surface)] px-6 py-12">
      <p
        className="m-0 text-center font-['Noto_Sans:Regular',sans-serif] text-[14px] leading-[1.65] text-[#464c59] dark:text-[#9fadbc]"
        style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100" }}
      >
        Select a case from the case list to begin review.
      </p>
    </div>
  );
}

export function Level2ReviewInterface() {
  const [sidebarPinned, setSidebarPinned] = useState(true);
  const [selectedCaseIndex, setSelectedCaseIndex] = useState<number | null>(null);
  const [selectedCaseListSection, setSelectedCaseListSection] =
    useState<CaseListSectionContext | null>(null);
  const [isReviewDrawerOpen, setIsReviewDrawerOpen] = useState(false);
  const [clientProfileAction, setClientProfileAction] = useState<ClientProfileActionId | null>(
    null,
  );
  const [screeningSelectedIds, setScreeningSelectedIds] = useState<Set<string>>(() => new Set());
  const [caseFilterVisibility, setCaseFilterVisibility] = useState({
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

  const ensureSidebarOpen = useCallback(() => {
    setSidebarPinned(true);
  }, []);
  const ensureDetailVisible = useCallback(() => {
    setSelectedCaseIndex((current) => {
      if (current !== null) return current;
      for (let index = 0; index < casesData.length; index += 1) {
        const rows = screeningRowsByCase[index];
        if (rows && caseHasLevel2QueueWork(rows)) {
          setSelectedCaseListSection("todo");
          return index;
        }
      }
      setSelectedCaseListSection("todo");
      return 0;
    });
  }, [screeningRowsByCase]);
  const {
    promptOpen: onboardingPromptOpen,
    active: onboardingCoachActive,
    step: onboardingCoachStep,
    stepIndex: onboardingCoachStepIndex,
    stepCount: onboardingCoachStepCount,
    isLast: onboardingCoachIsLast,
    startTour: startOnboardingCoach,
    declineTour: declineOnboardingCoach,
    next: advanceOnboardingCoach,
    dismiss: dismissOnboardingCoach,
  } = useReviewOnboardingCoach({
    onEnsureSidebarOpen: ensureSidebarOpen,
    onEnsureDetailVisible: ensureDetailVisible,
  });

  const screeningRows = useMemo(
    () =>
      selectedCaseIndex === null
        ? []
        : screeningRowsByCase[selectedCaseIndex] ?? getScreeningRowsForCase(selectedCaseIndex),
    [screeningRowsByCase, selectedCaseIndex],
  );

  const selectedScreeningRows = useMemo(
    () => screeningRows.filter((row) => screeningSelectedIds.has(row.id)),
    [screeningRows, screeningSelectedIds],
  );

  const awaitingLevel1Work = useMemo(
    () =>
      !casesData.some((_, index) => {
        const rows = screeningRowsByCase[index];
        return rows ? caseHasLevel2Activity(rows) : false;
      }),
    [screeningRowsByCase],
  );

  const allCasesCleared = useMemo(() => {
    if (awaitingLevel1Work) return false;
    return casesData.every((_, index) => {
      const rows = screeningRowsByCase[index];
      return rows ? !caseHasLevel2QueueWork(rows) : true;
    });
  }, [screeningRowsByCase, awaitingLevel1Work]);

  const pendingSanctionCount = useMemo(
    () =>
      casesData.reduce((count, _, index) => {
        const rows = screeningRowsByCase[index];
        return rows && caseHasLevel2QueueWork(rows) ? count + 1 : count;
      }, 0),
    [screeningRowsByCase],
  );

  useEffect(() => {
    if (selectedCaseIndex === null) return;
    setScreeningRowsByCase((prev) => ensureScreeningRowsForCase(prev, selectedCaseIndex));
  }, [selectedCaseIndex, setScreeningRowsByCase]);

  const sidebarWorkflowItems = useMemo(
    () => deriveReviewSidebarWorkflows(screeningRowsByCase, "level-2"),
    [screeningRowsByCase],
  );

  /** Only one inline drawer at a time — opening either replaces the other. */
  const handleOpenClientProfileAction = useCallback((action: ClientProfileActionId) => {
    setIsReviewDrawerOpen(false);
    setClientProfileAction(action);
  }, []);

  const handleShowReview = useCallback(() => {
    setIsReviewDrawerOpen((open) => {
      const next = !open;
      if (next) setClientProfileAction(null);
      return next;
    });
  }, []);

  useEffect(() => {
    if (screeningSelectedIds.size > 0) {
      setClientProfileAction(null);
      setIsReviewDrawerOpen(true);
    }
  }, [screeningSelectedIds]);

  const restoreSubmittedRows = useCallback(
    (caseIndex: number, previousRowsById: Record<string, (typeof screeningRows)[number]>) => {
      setScreeningRowsByCase((prev) => {
        const current = prev[caseIndex] ?? getScreeningRowsForCase(caseIndex);
        return {
          ...prev,
          [caseIndex]: current.map((row) => previousRowsById[row.id] ?? row),
        };
      });
    },
    [setScreeningRowsByCase],
  );

  const { showBulkSubmitToast, commitPendingToast, bulkSubmitToast } = useBulkSubmitUndoToast({
    restoreRows: restoreSubmittedRows,
  });

  const handleSubmitDecision = useCallback(
    (status: string, reason: string) => {
      if (selectedCaseIndex === null) return;

      const current =
        screeningRowsByCase[selectedCaseIndex] ?? getScreeningRowsForCase(selectedCaseIndex);
      const snapshot = buildSubmitUndoSnapshot({
        caseIndex: selectedCaseIndex,
        caseName: casesData[selectedCaseIndex]?.name ?? "Case",
        rows: current,
        selectedIds: screeningSelectedIds,
        status,
        flowVariant: "level-2",
      });

      commitPendingToast();

      setScreeningRowsByCase((prev) => {
        const rows =
          prev[selectedCaseIndex] ?? getScreeningRowsForCase(selectedCaseIndex);
        return {
          ...prev,
          [selectedCaseIndex]: rows.map((row) =>
            screeningSelectedIds.has(row.id) ? applyLevel2Decision(row, status, reason) : row,
          ),
        };
      });
      setScreeningSelectedIds(new Set());
      showBulkSubmitToast(snapshot);
    },
    [
      selectedCaseIndex,
      screeningSelectedIds,
      screeningRowsByCase,
      setScreeningRowsByCase,
      commitPendingToast,
      showBulkSubmitToast,
    ],
  );

  const handleQuickClearRow = useCallback(
    (rowId: string, status: ScreeningRowStatus) => {
      if (selectedCaseIndex === null) return;

      const current =
        screeningRowsByCase[selectedCaseIndex] ?? getScreeningRowsForCase(selectedCaseIndex);
      const snapshot = buildSubmitUndoSnapshot({
        caseIndex: selectedCaseIndex,
        caseName: casesData[selectedCaseIndex]?.name ?? "Case",
        rows: current,
        selectedIds: new Set([rowId]),
        status,
        flowVariant: "level-2",
      });

      commitPendingToast();

      setScreeningRowsByCase((prev) => {
        const rows =
          prev[selectedCaseIndex] ?? getScreeningRowsForCase(selectedCaseIndex);
        return {
          ...prev,
          [selectedCaseIndex]: rows.map((row) =>
            row.id === rowId ? applyLevel2Decision(row, status, status) : row,
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
      screeningRowsByCase,
      setScreeningRowsByCase,
      commitPendingToast,
      showBulkSubmitToast,
    ],
  );

  const handleBulkQuickClear = useCallback(
    (status: ScreeningRowStatus) => {
      if (selectedCaseIndex === null) return;

      const current =
        screeningRowsByCase[selectedCaseIndex] ?? getScreeningRowsForCase(selectedCaseIndex);
      const snapshot = buildSubmitUndoSnapshot({
        caseIndex: selectedCaseIndex,
        caseName: casesData[selectedCaseIndex]?.name ?? "Case",
        rows: current,
        selectedIds: screeningSelectedIds,
        status,
        flowVariant: "level-2",
      });

      commitPendingToast();

      setScreeningRowsByCase((prev) => {
        const rows =
          prev[selectedCaseIndex] ?? getScreeningRowsForCase(selectedCaseIndex);
        return {
          ...prev,
          [selectedCaseIndex]: rows.map((row) =>
            screeningSelectedIds.has(row.id)
              ? applyLevel2Decision(row, status, status)
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
      screeningRowsByCase,
      setScreeningRowsByCase,
      commitPendingToast,
      showBulkSubmitToast,
    ],
  );

  const { submitReviewDecision, completeCaseConfirmDialog } = useCompleteCaseSubmit({
    rows: screeningRows,
    selectedIds: screeningSelectedIds,
    flowVariant: "level-2",
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
        levelLabel="Level 2"
        onTriggerClick={handleTriggerClick}
        suppressSidebarTooltip={
          onboardingCoachActive && onboardingCoachStep.id === "sidebar-toggle"
        }
      />
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <ReviewSidebar
          isOpen={sidebarPinned}
          sanctionMatchCount={pendingSanctionCount}
          workflowItems={sidebarWorkflowItems}
        />
        <div className="flex min-h-0 flex-1 overflow-hidden">
          <div className="flex flex-col flex-1 min-h-0 overflow-hidden px-4 pb-4 gap-4">
            <div className="flex flex-1 min-h-0 overflow-hidden gap-4 pt-4">
              <div className="shrink-0 self-stretch flex flex-col min-h-0">
                <CaseList
                  onSelectCase={handleSelectCase}
                  selectedCaseIndex={selectedCaseIndex}
                  selectedCaseListSection={selectedCaseListSection}
                  screeningRowsByCase={screeningRowsByCase}
                  onFilterVisibilityChange={setCaseFilterVisibility}
                />
              </div>
              <DetailPanel
                selectedCase={
                  selectedCaseIndex === null ? null : casesData[selectedCaseIndex]
                }
                selectedCaseIndex={selectedCaseIndex}
                caseListSection={selectedCaseListSection}
                screeningRows={screeningRows}
                screeningSelectedIds={screeningSelectedIds}
                onScreeningSelectedIdsChange={setScreeningSelectedIds}
                allCasesCleared={allCasesCleared}
                awaitingLevel1Work={awaitingLevel1Work}
                onQuickClearRow={handleQuickClearRow}
                showFilterEmptyState={
                  caseFilterVisibility.filtersActive && caseFilterVisibility.filteredCount === 0
                }
                onOpenClientProfileAction={handleOpenClientProfileAction}
              />
            </div>
            {!allCasesCleared && !awaitingLevel1Work ? (
              <ReviewTaskBar
                flowVariant="level-2"
                onShowReview={handleShowReview}
                isReviewOpen={isReviewDrawerOpen}
                screeningSelectionCount={screeningSelectedIds.size}
                selectedRows={selectedScreeningRows}
                onDeselectAllScreening={() => setScreeningSelectedIds(new Set())}
                onBulkQuickClear={handleBulkQuickClear}
              />
            ) : null}
          </div>
          <ClientProfileActionDrawer
            open={clientProfileAction !== null}
            action={clientProfileAction ?? "notes"}
            onActionChange={handleOpenClientProfileAction}
            onClose={() => setClientProfileAction(null)}
            caseIndex={selectedCaseIndex ?? 0}
          />
          <ReviewDrawer
            isOpen={isReviewDrawerOpen}
            onClose={() => setIsReviewDrawerOpen(false)}
            flowVariant="level-2"
            selectedCount={screeningSelectedIds.size}
            selectedRows={selectedScreeningRows}
            onSubmit={submitReviewDecision}
          />
        </div>
      </div>
      {completeCaseConfirmDialog}
      <ToastViewport>{bulkSubmitToast}</ToastViewport>
      <ReviewOnboardingCoach
        promptOpen={onboardingPromptOpen}
        onStartTour={startOnboardingCoach}
        onDeclineTour={declineOnboardingCoach}
        active={onboardingCoachActive}
        step={onboardingCoachStep}
        stepIndex={onboardingCoachStepIndex}
        stepCount={onboardingCoachStepCount}
        isLast={onboardingCoachIsLast}
        onNext={advanceOnboardingCoach}
        onDismiss={dismissOnboardingCoach}
      />
    </div>
    </ThemeProvider>
  );
}
