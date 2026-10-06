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
import { InsightsInlineDrawer } from "../../components/InsightsInlineDrawer";
import { CaseListLevel2TodoEmptyState } from "../../components/CaseListLevel2TodoEmptyState";
import { Level2AwaitingLevel1State } from "../../components/Level2AwaitingLevel1State";
import { CaseListFilterEmptyState } from "../../components/CaseListFilterEmptyState";
import { CaseListSection } from "../../components/CaseListSection";
import { ThemeProvider } from "../../context/ThemeContext";
import { aceClientProfileAccordionHeaderClass } from "../../lib/aceAccordion";
import { aceDropShadowXsClass } from "../../lib/aceShadow";
import { aceTypography, ACE_TYPE } from "../../lib/aceTypography";
import { ReviewPanelEmptyState } from "../../components/ReviewPanelEmptyState";
import { ReviewFlowSiteHeader } from "../../components/ReviewFlowSiteHeader";
import {
  ClientProfileAccordionHeaderTags,
  ClientProfileClientIdRow,
  ClientProfileNameRow,
  ClientProfileStatusRow,
  OverdueWarningIcon,
} from "../../components/ClientProfileHeaderBadges";
import { ClientProfileAddressSection } from "../../components/ClientProfileAddressSection";
import { ClientProfileCopyablePanel } from "../../components/ClientProfileCopyablePanel";
import { ClientProfileMetaLine } from "../../components/ClientProfileMetaLine";
import { ClientProfileTruncatedField } from "../../components/ClientProfileTruncatedField";
import {
  CLIENT_PROFILE_PASSTHROUGH_PLACEHOLDER,
  clientProfileCommentForCase,
} from "../../lib/clientProfileCommentData";
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
  clientIdMatchesSearchQuery,
  clientProfileForLevel2Case,
  compareCasesBySort,
  normalizeClientIdSearchQuery,
  riskBandPresentation,
  type CaseFilterValue,
  type CaseSortValue,
  type Level2WorkQueueId,
} from "../../lib/reviewCaseData";
import { cn } from "../../components/ui/utils";
import { ReviewDrawer } from "../../components/ReviewDrawer";
import { ReviewTaskBar } from "../../components/ReviewTaskBar";
import {
  ReviewAssignedSidebar,
  formatReviewApplicationLabel,
  type ReviewAssignedSidebarSelection,
} from "../../components/ReviewAssignedSidebar";
import { SearchClientIdModal } from "../../components/SearchClientIdModal";
import { sidebarIconButtonClass } from "@ace-ds/components/organisms/AceSidebar/sidebarRowActions";
import { screeningToolbarIconButtonClass } from "@ace-ds/components/organisms/ScreeningResultsTable/screeningTableToolbar";
import {
  defaultSidebarStepSelection,
  deriveReviewSidebarGroups,
  findSidebarStep,
  isSidebarStepVisible,
  LEVEL2_SIDEBAR_GROUP_DEFS,
  type ReviewSidebarGroupCount,
} from "../../lib/reviewSidebarGroups";
import {
  INITIAL_ESCALATED_FINANCIAL_QUEUE,
  INITIAL_ESCALATED_PEP_QUEUE,
} from "../../lib/escalatedWorkQueues";
import type { PepCaseListItem } from "../../lib/pepWorkQueue";
import { AceAccordion } from "@ace-ds/components/molecules/AceAccordion/AceAccordion";

interface PageHeaderProps {
  isSidebarOpen: boolean;
  sidebarPinned: boolean;
  levelLabel: string;
  onTriggerClick: () => void;
  onOpenInsights: () => void;
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
  onOpenInsights,
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
            Workbench
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
                aria-label="Insights"
                className={cn(screeningToolbarIconButtonClass, "leading-none")}
                onClick={onOpenInsights}
              >
                <MaterialSymbol name="earthquake" size="md" weight={300} className="text-current" />
              </button>
            </AceTooltipTrigger>
            <AceTooltipContent side="top" variant="screening-toolbar" hideArrow>
              Insights
            </AceTooltipContent>
          </AceTooltip>
        </div>
      </div>
    </div>
  );
}

const SIDEBAR_ORGANIZATIONS = [{ id: "level-2-users", label: "Level 2 Users" }] as const;

/** Escalate-to-lead (and open AI/compliance queue) steps are actionable Level 2 work. */
function isLevel2ActionableStep(groupId: string, stepId: string): boolean {
  if (stepId === "escalate-to-lead") return true;
  if (groupId === "compliance-workbench") {
    return stepId === "documents-required" || stepId === "documents-uploaded";
  }
  if (groupId === "ai-workbench") {
    return stepId === "ai-escalate" || stepId === "ai-suspected-safe";
  }
  return false;
}

function caseListSectionForGroup(groupId: string, stepId: string): CaseListSectionContext {
  if (isLevel2ActionableStep(groupId, stepId)) return "todo";
  return "done";
}

function workQueueIdForGroup(groupId: string): Level2WorkQueueId {
  if (groupId === "pep") return "pep";
  if (groupId === "compliance-workbench") return "financial";
  return "sanction";
}

interface ReviewSidebarProps {
  isOpen: boolean;
  groups: readonly ReviewSidebarGroupCount[];
  selection: ReviewAssignedSidebarSelection;
  onSelectionChange: (selection: ReviewAssignedSidebarSelection) => void;
  onOpenClientIdSearch: () => void;
  clientIdSearchActive: boolean;
}

function ReviewSidebar({
  isOpen,
  groups,
  selection,
  onSelectionChange,
  onOpenClientIdSearch,
  clientIdSearchActive,
}: ReviewSidebarProps) {
  return (
    <ReviewAssignedSidebar
      open={isOpen}
      organizations={SIDEBAR_ORGANIZATIONS}
      groups={groups}
      selection={selection}
      onSelectionChange={onSelectionChange}
      onOpenClientIdSearch={onOpenClientIdSearch}
      clientIdSearchActive={clientIdSearchActive}
    />
  );
}

interface CaseListProps {
  onSelectCase: (index: number, section: CaseListSectionContext) => void;
  selectedCaseIndex: number | null;
  selectedCaseListSection: CaseListSectionContext | null;
  screeningRowsByCase: Record<number, ScreeningResultRow[]>;
  onFilterVisibilityChange?: (state: { filtersActive: boolean; filteredCount: number }) => void;
  /** Case-list Client ID filter from the sidebar search modal (substring, case-insensitive). */
  clientIdFilter?: string | null;
  listTitle?: string;
  workQueueId: Level2WorkQueueId;
  /** When set, case list + counts filter to these match statuses. */
  statusFilter?: readonly string[] | null;
  cases?: readonly PepCaseListItem[] | typeof casesData;
  getRowsForCase?: (index: number) => ScreeningResultRow[];
}

type CaseListRow = {
  item: PepCaseListItem | (typeof casesData)[number];
  index: number;
};

function CaseList({
  onSelectCase,
  selectedCaseIndex,
  selectedCaseListSection,
  screeningRowsByCase,
  onFilterVisibilityChange,
  clientIdFilter = null,
  listTitle = "Escalated Sanctions",
  workQueueId,
  statusFilter = null,
  cases = casesData,
  getRowsForCase,
}: CaseListProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [caseListMinimized, setCaseListMinimized] = useState(false);
  const [doneSectionExpanded, setDoneSectionExpanded] = useState(false);
  const [selectedCaseFilters, setSelectedCaseFilters] = useState<ReadonlySet<CaseFilterValue>>(
    () => new Set(),
  );
  const [caseSort, setCaseSort] = useState<CaseSortValue>("name-asc");
  const wasSelectedCaseCompleteRef = useRef(false);

  const workflowStatuses = useMemo(
    () => (statusFilter && statusFilter.length > 0 ? [...statusFilter] : []),
    [statusFilter],
  );
  const isStepView = workflowStatuses.length > 0;
  /** Open-queue statuses land in Todo; disposition statuses land in Done. */
  const isOpenQueueStep = workflowStatuses.some(
    (status) =>
      status === "Escalate to Team Lead" ||
      status === "Documents Required" ||
      status === "Documents Uploaded" ||
      status === "AI-Escalate" ||
      status === "AI-Suspected Safe",
  );

  const caseRowsForIndex = useCallback(
    (index: number) =>
      screeningRowsByCase[index] ?? getRowsForCase?.(index) ?? [],
    [screeningRowsByCase, getRowsForCase],
  );

  /** Results in the Level 2 queue, or reviewed count once the case is complete. */
  const level2ResultCount = useCallback(
    (index: number) => {
      const rows = caseRowsForIndex(index);
      if (isStepView) {
        return rows.filter((r) => workflowStatuses.includes(r.status)).length;
      }
      const inQueue = rows.filter((r) => isLevel1InProcessStatus(r.status)).length;
      if (inQueue > 0) return inQueue;
      return rows.filter((r) => isLevel2ReviewedRow(r)).length;
    },
    [caseRowsForIndex, isStepView, workflowStatuses],
  );

  const filteredRows = useMemo(() => {
    const out: CaseListRow[] = [];
    const clientNeedle = normalizeClientIdSearchQuery(clientIdFilter ?? "");
    cases.forEach((item, index) => {
      if (!caseMatchesFilters(index, selectedCaseFilters)) return;
      if (clientNeedle) {
        const clientId = clientProfileForLevel2Case(workQueueId, index).clientId;
        if (!clientIdMatchesSearchQuery(clientId, clientNeedle)) return;
      }
      out.push({ item, index });
    });
    out.sort((a, b) => compareCasesBySort(a.index, b.index, caseSort, level2ResultCount));
    return out;
  }, [cases, selectedCaseFilters, clientIdFilter, caseSort, level2ResultCount, workQueueId]);

  useEffect(() => {
    onFilterVisibilityChange?.({
      filtersActive: selectedCaseFilters.size > 0 || Boolean(normalizeClientIdSearchQuery(clientIdFilter ?? "")),
      filteredCount: filteredRows.length,
    });
  }, [filteredRows.length, selectedCaseFilters.size, clientIdFilter, onFilterVisibilityChange]);

  const { pendingRows, doneRows } = useMemo(() => {
    const pending: CaseListRow[] = [];
    const done: CaseListRow[] = [];
    filteredRows.forEach((row) => {
      const caseRows = caseRowsForIndex(row.index);
      if (isStepView) {
        if (level2ResultCount(row.index) === 0) return;
        if (isOpenQueueStep) {
          pending.push(row);
        } else {
          done.push(row);
        }
        return;
      }
      if (caseIsLevel2Done(caseRows)) {
        done.push(row);
      } else if (caseHasLevel2QueueWork(caseRows)) {
        pending.push(row);
      }
    });
    return { pendingRows: pending, doneRows: done };
  }, [filteredRows, caseRowsForIndex, isStepView, isOpenQueueStep, level2ResultCount]);

  useEffect(() => {
    if (pendingRows.length === 0 && doneRows.length > 0) {
      setDoneSectionExpanded(true);
    }
  }, [pendingRows.length, doneRows.length]);

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
    caseItem: PepCaseListItem | (typeof casesData)[number],
    index: number,
    section: CaseListSectionContext,
  ) => {
    const isEntity = "isEntity" in caseItem && caseItem.isEntity;
    const profile = clientProfileForLevel2Case(workQueueId, index);
    const clientId = profile.clientId;
    const caseRows = caseRowsForIndex(index);
    const inQueueCount = isStepView
      ? caseRows.filter((r) => workflowStatuses.includes(r.status)).length
      : caseRows.filter((r) => isLevel1InProcessStatus(r.status)).length;
    const reviewedCount = isStepView
      ? caseRows.filter((r) => workflowStatuses.includes(r.status)).length
      : caseRows.filter((r) => isLevel2ReviewedRow(r)).length;
    const resultsCount = section === "todo" ? inQueueCount : reviewedCount;
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
                {clientId} · {resultsCount} Alerts
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
      </div>
    );
  };

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
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <CaseListSection
              title="Clients"
              count={pendingRows.length}
              collapsible={false}
              stickyHeader
              emptyContent={
                pendingRows.length === 0 && doneRows.length === 0 ? (
                  selectedCaseFilters.size > 0 ? (
                    <CaseListFilterEmptyState />
                  ) : (
                    <CaseListLevel2TodoEmptyState />
                  )
                ) : undefined
              }
            >
              {pendingRows.map(({ item, index }) => renderCaseRow(item, index, "todo"))}
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
            </CaseListSection>
          </div>
        </>
      )}
    </div>
  );
}

interface DetailPanelProps {
  selectedCase: PepCaseListItem | (typeof casesData)[number] | null;
  selectedCaseIndex: number | null;
  caseListSection: CaseListSectionContext | null;
  screeningRows: ScreeningResultRow[];
  screeningSelectedIds: Set<string>;
  onScreeningSelectedIdsChange: Dispatch<SetStateAction<Set<string>>>;
  allCasesCleared: boolean;
  awaitingLevel1Work: boolean;
  onQuickClearRow: (rowId: string, status: ScreeningRowStatus) => void;
  showFilterEmptyState?: boolean;
  workQueueId: Level2WorkQueueId;
  onOpenClientProfileAction?: (action: ClientProfileActionId) => void;
  onDrilldownRowChange?: (row: ScreeningResultRow | null) => void;
  /** Sidebar Application ID — drives the Application field in the client profile. */
  applicationId?: string;
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
  workQueueId,
  onOpenClientProfileAction,
  onDrilldownRowChange,
  applicationId,
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

  const profile = clientProfileForLevel2Case(workQueueId, selectedCaseIndex);
  const applicationLabel = formatReviewApplicationLabel(applicationId);
  const riskPresentation = riskBandPresentation(profile.riskBand);
  const isCaseComplete = isCaseReviewComplete(screeningRows, "level-2");
  const showOverdueWarning = profile.reviewTargetOverdue && !isCaseComplete;
  const profileComment = clientProfileCommentForCase(selectedCaseIndex);
  const profilePassthrough = CLIENT_PROFILE_PASSTHROUGH_PLACEHOLDER;

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-hidden">
      <div
        className="flex shrink-0 flex-col gap-2 bg-[var(--screening-surface-muted)]"
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
          aceClientProfileAccordionHeaderClass,
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
              <ClientProfileCopyablePanel
                copyLabel="Copy identity details"
                getCopyText={() => {
                  const lines = [
                    ...profile.addressLines,
                    `Client Name · ${selectedCase.name}`,
                    `Client ID · ${profile.clientId}`,
                    "Client Active",
                    "Address Validated",
                  ];
                  if (profile.showIdVerified) lines.push("ID Verified");
                  return lines.join("\n");
                }}
              >
                <ClientProfileAddressSection addressLines={profile.addressLines} />
                <ClientProfileNameRow name={selectedCase.name} />
                <ClientProfileClientIdRow clientId={profile.clientId} />
                <ClientProfileStatusRow label="Client Active" />
                <ClientProfileStatusRow label="Address Validated" />
                {profile.showIdVerified ? (
                  <ClientProfileStatusRow label="ID Verified" />
                ) : null}
              </ClientProfileCopyablePanel>

              <ClientProfileCopyablePanel
                copyLabel="Copy profile details"
                getCopyText={() => {
                  const lines: string[] = [];
                  if (profile.gender != null) lines.push(`Gender · ${profile.gender}`);
                  if (profile.dob != null) lines.push(`Date of Birth · ${profile.dob}`);
                  lines.push(`Application · ${applicationLabel}`);
                  lines.push(
                    `Review Target · ${profile.reviewTargetSummary}${
                      showOverdueWarning ? " Overdue Warning" : ""
                    }`,
                  );
                  lines.push(`Last Modified · ${profile.lastModified}`);
                  lines.push(`Comments · ${profileComment}`);
                  lines.push(`Passthrough · ${profilePassthrough}`);
                  return lines.join("\n");
                }}
              >
                {profile.gender != null ? (
                  <ClientProfileMetaLine label="Gender">{profile.gender}</ClientProfileMetaLine>
                ) : null}
                {profile.dob != null ? (
                  <ClientProfileMetaLine label="Date of Birth">{profile.dob}</ClientProfileMetaLine>
                ) : null}
                <ClientProfileMetaLine label="Application">
                  {applicationLabel}
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
                <ClientProfileTruncatedField label="Comments" value={profileComment} />
                <ClientProfileTruncatedField label="Passthrough" value={profilePassthrough} />
              </ClientProfileCopyablePanel>

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

      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden">
        <p
          className="m-0 shrink-0 font-['Noto_Sans:Bold',sans-serif] text-[14px] font-bold leading-[1.65] text-[var(--screening-text-primary)]"
          style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100" }}
        >
          Match Alerts
        </p>
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <ScreeningResultsTable
            rows={screeningRows}
            title="Match Alerts"
            flowVariant="level-2"
            caseListSection={caseListSection ?? "todo"}
            selectedIds={screeningSelectedIds}
            onSelectedIdsChange={onScreeningSelectedIdsChange}
            onQuickClearRow={onQuickClearRow}
            onDrilldownRowChange={onDrilldownRowChange}
          />
        </div>
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
  const [insightsOpen, setInsightsOpen] = useState(false);
  const [clientProfileAction, setClientProfileAction] = useState<ClientProfileActionId | null>(
    null,
  );
  const [screeningSelectedIds, setScreeningSelectedIds] = useState<Set<string>>(() => new Set());
  const [drilldownReviewRow, setDrilldownReviewRow] = useState<ScreeningResultRow | null>(null);
  const [caseFilterVisibility, setCaseFilterVisibility] = useState({
    filtersActive: false,
    filteredCount: casesData.length,
  });
  const handleSelectCase = useCallback((index: number, section: CaseListSectionContext) => {
    setSelectedCaseIndex(index);
    setSelectedCaseListSection(section);
    setScreeningSelectedIds(new Set());
    setDrilldownReviewRow(null);
    setClientProfileAction(null);
  }, []);
  const [screeningRowsByCase, setScreeningRowsByCase] = useScreeningRowsByCase();
  const [sidebarSelection, setSidebarSelection] = useState<ReviewAssignedSidebarSelection>({
    kind: "step",
    applicationId: "isi",
    groupId: "pep",
    stepId: "escalate-to-lead",
  });
  const [pepCases] = useState(() => INITIAL_ESCALATED_PEP_QUEUE.cases);
  const [pepScreeningRowsByCase, setPepScreeningRowsByCase] = useState(
    () => INITIAL_ESCALATED_PEP_QUEUE.screeningRowsByCase,
  );
  const [financialCases] = useState(() => INITIAL_ESCALATED_FINANCIAL_QUEUE.cases);
  const [financialScreeningRowsByCase, setFinancialScreeningRowsByCase] = useState(
    () => INITIAL_ESCALATED_FINANCIAL_QUEUE.screeningRowsByCase,
  );
  const [clientIdSearchOpen, setClientIdSearchOpen] = useState(false);
  const [clientIdFilter, setClientIdFilter] = useState<string | null>(null);

  const selectedStep = findSidebarStep(
    LEVEL2_SIDEBAR_GROUP_DEFS,
    sidebarSelection.groupId,
    sidebarSelection.stepId,
  );
  const stepStatuses = selectedStep?.statuses ?? [];
  const isActionableStep = isLevel2ActionableStep(
    sidebarSelection.groupId,
    sidebarSelection.stepId,
  );
  const workQueueId = workQueueIdForGroup(sidebarSelection.groupId);
  const isPepWork = sidebarSelection.groupId === "pep";
  const isFinancialWork = sidebarSelection.groupId === "compliance-workbench";
  const isAiWorkbench = sidebarSelection.groupId === "ai-workbench";
  const activeCases = isPepWork
    ? pepCases
    : isFinancialWork
      ? financialCases
      : isAiWorkbench
        ? []
        : casesData;
  const activeScreeningRowsByCase = isPepWork
    ? pepScreeningRowsByCase
    : isFinancialWork
      ? financialScreeningRowsByCase
      : screeningRowsByCase;
  const setActiveScreeningRowsByCase = isPepWork
    ? setPepScreeningRowsByCase
    : isFinancialWork
      ? setFinancialScreeningRowsByCase
      : setScreeningRowsByCase;

  const getActiveRowsForCase = useCallback(
    (index: number) => {
      if (isPepWork) return pepScreeningRowsByCase[index] ?? [];
      if (isFinancialWork) return financialScreeningRowsByCase[index] ?? [];
      return screeningRowsByCase[index] ?? getScreeningRowsForCase(index);
    },
    [
      isPepWork,
      isFinancialWork,
      pepScreeningRowsByCase,
      financialScreeningRowsByCase,
      screeningRowsByCase,
    ],
  );

  const handleSidebarSelectionChange = useCallback(
    (selection: ReviewAssignedSidebarSelection) => {
      setSidebarSelection(selection);
      setScreeningSelectedIds(new Set());
      setDrilldownReviewRow(null);
      setClientProfileAction(null);
      setIsReviewDrawerOpen(false);
      setInsightsOpen(false);
      setClientIdFilter(null);
      setSelectedCaseIndex(0);
      setSelectedCaseListSection(
        caseListSectionForGroup(selection.groupId, selection.stepId),
      );
    },
    [],
  );

  const ensureSidebarOpen = useCallback(() => {
    setSidebarPinned(true);
  }, []);
  const ensureDetailVisible = useCallback(() => {
    setSelectedCaseIndex((current) => {
      if (current !== null) return current;
      for (let index = 0; index < activeCases.length; index += 1) {
        const rows = getActiveRowsForCase(index);
        if (caseHasLevel2QueueWork(rows)) {
          setSelectedCaseListSection("todo");
          return index;
        }
      }
      setSelectedCaseListSection("todo");
      return 0;
    });
  }, [activeCases.length, getActiveRowsForCase]);
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

  const screeningRows = useMemo(() => {
    const rows = selectedCaseIndex === null ? [] : getActiveRowsForCase(selectedCaseIndex);
    if (stepStatuses.length === 0) return rows;
    return rows.filter((row) => stepStatuses.includes(row.status));
  }, [getActiveRowsForCase, selectedCaseIndex, stepStatuses]);

  const selectedScreeningRows = useMemo(
    () => screeningRows.filter((row) => screeningSelectedIds.has(row.id)),
    [screeningRows, screeningSelectedIds],
  );

  const awaitingLevel1Work = useMemo(() => {
    if (isPepWork || isFinancialWork || isAiWorkbench) return false;
    return !casesData.some((_, index) => {
      const rows = screeningRowsByCase[index];
      return rows ? caseHasLevel2Activity(rows) : false;
    });
  }, [isPepWork, isFinancialWork, isAiWorkbench, screeningRowsByCase]);

  const allCasesCleared = useMemo(() => {
    if (awaitingLevel1Work) return false;
    if (activeCases.length === 0) return true;
    return activeCases.every((_, index) => !caseHasLevel2QueueWork(getActiveRowsForCase(index)));
  }, [awaitingLevel1Work, activeCases, getActiveRowsForCase]);

  useEffect(() => {
    if (selectedCaseIndex === null || isPepWork || isFinancialWork || isAiWorkbench) return;
    setScreeningRowsByCase((prev) => ensureScreeningRowsForCase(prev, selectedCaseIndex));
  }, [selectedCaseIndex, isPepWork, isFinancialWork, isAiWorkbench, setScreeningRowsByCase]);

  const sidebarGroups = useMemo(
    () =>
      deriveReviewSidebarGroups(
        LEVEL2_SIDEBAR_GROUP_DEFS,
        {
          sanction: screeningRowsByCase,
          pep: pepScreeningRowsByCase,
          compliance: financialScreeningRowsByCase,
          ai: {},
        },
        {
          caseIndexesByGroup: {
            pep: pepCases.map((_, index) => index),
            "compliance-workbench": financialCases.map((_, index) => index),
            sanction: casesData.map((_, index) => index),
          },
        },
      ),
    [
      screeningRowsByCase,
      pepScreeningRowsByCase,
      financialScreeningRowsByCase,
      pepCases,
      financialCases,
    ],
  );

  useEffect(() => {
    if (
      isSidebarStepVisible(
        sidebarGroups,
        sidebarSelection.groupId,
        sidebarSelection.stepId,
      )
    ) {
      return;
    }
    const next = defaultSidebarStepSelection(sidebarGroups);
    setSidebarSelection({ kind: "step", groupId: next.groupId, stepId: next.stepId });
    setSelectedCaseListSection(caseListSectionForGroup(next.groupId, next.stepId));
  }, [sidebarGroups, sidebarSelection.groupId, sidebarSelection.stepId]);

  const selectedGroupDef = LEVEL2_SIDEBAR_GROUP_DEFS.find(
    (group) => group.id === sidebarSelection.groupId,
  );
  const workListTitle = selectedStep
    ? `${selectedGroupDef?.label ?? "Sanction Matches"} · ${selectedStep.label}`
    : selectedGroupDef?.label ?? "Sanction Matches";

  const workflowHasCases = useMemo(() => {
    if (activeCases.length === 0) return false;
    return activeCases.some((_, index) => {
      const rows = getActiveRowsForCase(index);
      if (stepStatuses.length === 0) return rows.length > 0;
      return rows.some((row) => stepStatuses.includes(row.status));
    });
  }, [activeCases, getActiveRowsForCase, stepStatuses]);

  /** Only one inline drawer at a time — opening either replaces the other. */
  const handleOpenClientProfileAction = useCallback((action: ClientProfileActionId) => {
    setIsReviewDrawerOpen(false);
    setInsightsOpen(false);
    setClientProfileAction(action);
  }, []);

  const handleShowReview = useCallback(() => {
    setIsReviewDrawerOpen((open) => {
      const next = !open;
      if (next) {
        setClientProfileAction(null);
        setInsightsOpen(false);
        if (screeningSelectedIds.size === 0 && drilldownReviewRow != null) {
          setScreeningSelectedIds(new Set([drilldownReviewRow.id]));
        }
      }
      return next;
    });
  }, [screeningSelectedIds.size, drilldownReviewRow]);

  const handleOpenInsights = useCallback(() => {
    setInsightsOpen((open) => {
      const next = !open;
      if (next) {
        setClientProfileAction(null);
        setIsReviewDrawerOpen(false);
      }
      return next;
    });
  }, []);

  useEffect(() => {
    if (screeningSelectedIds.size > 0) {
      setClientProfileAction(null);
      setInsightsOpen(false);
      setIsReviewDrawerOpen(true);
    }
  }, [screeningSelectedIds]);

  const restoreSubmittedRows = useCallback(
    (caseIndex: number, previousRowsById: Record<string, (typeof screeningRows)[number]>) => {
      setActiveScreeningRowsByCase((prev) => {
        const current =
          prev[caseIndex] ??
          (isPepWork || isFinancialWork ? [] : getScreeningRowsForCase(caseIndex));
        return {
          ...prev,
          [caseIndex]: current.map((row) => previousRowsById[row.id] ?? row),
        };
      });
    },
    [setActiveScreeningRowsByCase, isPepWork, isFinancialWork],
  );

  const { showBulkSubmitToast, commitPendingToast, bulkSubmitToast } = useBulkSubmitUndoToast({
    restoreRows: restoreSubmittedRows,
  });

  const handleSubmitDecision = useCallback(
    (status: string, reason: string) => {
      if (selectedCaseIndex === null) return;

      const current = getActiveRowsForCase(selectedCaseIndex);
      const snapshot = buildSubmitUndoSnapshot({
        caseIndex: selectedCaseIndex,
        caseName: activeCases[selectedCaseIndex]?.name ?? "Case",
        rows: current,
        selectedIds: screeningSelectedIds,
        status,
        flowVariant: "level-2",
      });

      commitPendingToast();

      setActiveScreeningRowsByCase((prev) => {
        const rows = prev[selectedCaseIndex] ?? current;
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
      getActiveRowsForCase,
      activeCases,
      setActiveScreeningRowsByCase,
      commitPendingToast,
      showBulkSubmitToast,
    ],
  );

  const handleQuickClearRow = useCallback(
    (rowId: string, status: ScreeningRowStatus) => {
      if (selectedCaseIndex === null) return;

      const current = getActiveRowsForCase(selectedCaseIndex);
      const snapshot = buildSubmitUndoSnapshot({
        caseIndex: selectedCaseIndex,
        caseName: activeCases[selectedCaseIndex]?.name ?? "Case",
        rows: current,
        selectedIds: new Set([rowId]),
        status,
        flowVariant: "level-2",
      });

      commitPendingToast();

      setActiveScreeningRowsByCase((prev) => {
        const rows = prev[selectedCaseIndex] ?? current;
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
      getActiveRowsForCase,
      activeCases,
      setActiveScreeningRowsByCase,
      commitPendingToast,
      showBulkSubmitToast,
    ],
  );

  const handleBulkQuickClear = useCallback(
    (status: ScreeningRowStatus) => {
      if (selectedCaseIndex === null) return;

      const current = getActiveRowsForCase(selectedCaseIndex);
      const snapshot = buildSubmitUndoSnapshot({
        caseIndex: selectedCaseIndex,
        caseName: activeCases[selectedCaseIndex]?.name ?? "Case",
        rows: current,
        selectedIds: screeningSelectedIds,
        status,
        flowVariant: "level-2",
      });

      commitPendingToast();

      setActiveScreeningRowsByCase((prev) => {
        const rows = prev[selectedCaseIndex] ?? current;
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
      getActiveRowsForCase,
      activeCases,
      setActiveScreeningRowsByCase,
      commitPendingToast,
      showBulkSubmitToast,
    ],
  );

  const { submitReviewDecision } = useCompleteCaseSubmit({
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
        onOpenInsights={handleOpenInsights}
        suppressSidebarTooltip={
          onboardingCoachActive && onboardingCoachStep.id === "sidebar-toggle"
        }
      />
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <ReviewSidebar
          isOpen={sidebarPinned}
          groups={sidebarGroups}
          selection={sidebarSelection}
          onSelectionChange={handleSidebarSelectionChange}
          onOpenClientIdSearch={() => setClientIdSearchOpen(true)}
          clientIdSearchActive={Boolean(normalizeClientIdSearchQuery(clientIdFilter ?? ""))}
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
                  clientIdFilter={clientIdFilter}
                  listTitle={workListTitle}
                  workQueueId={workQueueId}
                  statusFilter={stepStatuses}
                  cases={activeCases}
                  getRowsForCase={
                    isPepWork || isFinancialWork || isAiWorkbench
                      ? undefined
                      : getScreeningRowsForCase
                  }
                />
              </div>
              <DetailPanel
                selectedCase={
                  selectedCaseIndex === null ? null : activeCases[selectedCaseIndex] ?? null
                }
                selectedCaseIndex={selectedCaseIndex}
                caseListSection={selectedCaseListSection}
                screeningRows={screeningRows}
                screeningSelectedIds={screeningSelectedIds}
                onScreeningSelectedIdsChange={setScreeningSelectedIds}
                allCasesCleared={allCasesCleared && isActionableStep}
                awaitingLevel1Work={
                  awaitingLevel1Work && !isPepWork && !isFinancialWork && !isAiWorkbench
                }
                onQuickClearRow={handleQuickClearRow}
                showFilterEmptyState={
                  (caseFilterVisibility.filtersActive &&
                    caseFilterVisibility.filteredCount === 0) ||
                  !workflowHasCases
                }
                workQueueId={workQueueId}
                onOpenClientProfileAction={handleOpenClientProfileAction}
                onDrilldownRowChange={setDrilldownReviewRow}
                applicationId={sidebarSelection.applicationId}
              />
            </div>
            {workflowHasCases && isActionableStep && !allCasesCleared && !awaitingLevel1Work ? (
              <ReviewTaskBar
                flowVariant="level-2"
                onShowReview={handleShowReview}
                isReviewOpen={isReviewDrawerOpen}
                screeningSelectionCount={screeningSelectedIds.size}
                selectedRows={selectedScreeningRows}
                onDeselectAllScreening={() => setScreeningSelectedIds(new Set())}
                onBulkQuickClear={handleBulkQuickClear}
                hasDrilldownContext={drilldownReviewRow != null}
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
          <InsightsInlineDrawer
            open={insightsOpen}
            onClose={() => setInsightsOpen(false)}
          />
        </div>
      </div>
      <ToastViewport>{bulkSubmitToast}</ToastViewport>
      <SearchClientIdModal
        open={clientIdSearchOpen}
        onClose={() => setClientIdSearchOpen(false)}
        initialQuery={clientIdFilter ?? ""}
        onSearch={(query) => {
          const normalized = normalizeClientIdSearchQuery(query);
          setClientIdFilter(normalized || null);
        }}
      />
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
