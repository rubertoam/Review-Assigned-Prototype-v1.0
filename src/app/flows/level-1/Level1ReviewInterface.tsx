/** Level 1 user flow — Workbench (primary UX concept). */
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
import {
  ReviewLayoutProvider,
  useReviewLayout,
} from "../../context/ReviewLayoutContext";
import { aceClientProfileAccordionHeaderClass } from "../../lib/aceAccordion";
import { aceDropShadowXsClass } from "../../lib/aceShadow";
import { aceTypography, ACE_TYPE } from "../../lib/aceTypography";
import { ReviewPanelInlineInfoMessage } from "../../components/ReviewPanelInlineInfoMessage";
import { ReviewPanelEmptyState } from "../../components/ReviewPanelEmptyState";
import { ReviewFlowSiteHeader } from "../../components/ReviewFlowSiteHeader";
import { SideBySideClientProfileRail } from "../../components/SideBySideClientProfileRail";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "../../components/ui/carousel";
import {
  ClientProfileAccordionHeaderTags,
  ClientProfileActiveIndicator,
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
  getScreeningRowsForCase,
  getSeedDocumentsRequiredCount,
  getSeedLevel1MyWorkPendingCount,
  isCaseScreeningComplete,
  isLevel2ReviewedRow,
  type CaseListSectionContext,
  type ScreeningResultRow,
  type ScreeningRowStatus,
} from "../../components/ScreeningResultsTable";
import {
  ensureScreeningRowsForCase,
  useScreeningRowsByCase,
} from "../../lib/screeningState";
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
import {
  ReviewOnboardingCoach,
  useReviewOnboardingCoach,
} from "../../components/ReviewOnboardingCoach";
import { ToastViewport } from "../../lib/toastPresentation";
import { useOverdueWarningToast } from "../../lib/useOverdueWarningToast";
import {
  caseMatchesFilters,
  casesData,
  clientIdMatchesSearchQuery,
  clientProfileForCaseIndex,
  compareCasesBySort,
  normalizeClientIdSearchQuery,
  type CaseFilterValue,
  type CaseSortValue,
  type ClientIdSeries,
} from "../../lib/reviewCaseData";
import {
  isCaseLockedByAnotherUser,
  lockedCaseReviewer,
} from "../../lib/caseLockConfig";
import {
  defaultSidebarStepSelection,
  deriveReviewSidebarGroups,
  findSidebarStep,
  isSidebarStepVisible,
  LEVEL1_SIDEBAR_GROUP_DEFS,
  type ReviewSidebarGroupCount,
} from "../../lib/reviewSidebarGroups";
import { cn } from "../../components/ui/utils";
import { ReviewDrawer } from "../../components/ReviewDrawer";
import { ReviewTaskBar } from "../../components/ReviewTaskBar";
import {
  getLevel1DecisionStatusesForRows,
  isAiWorkbenchWorkflowId,
  isDocumentsRequiredWorkflowId,
  isLevel1AiWorkbenchStatus,
  isLevel1MyWorkStatus,
  type Level1ScreeningStatus,
} from "../../lib/reviewDecisionConfig";
import {
  ReviewAssignedSidebar,
  formatReviewApplicationLabel,
  type ReviewAssignedSidebarSelection,
} from "../../components/ReviewAssignedSidebar";
import { SearchClientIdModal } from "../../components/SearchClientIdModal";
import { INITIAL_PEP_WORK_QUEUE, type PepCaseListItem } from "../../lib/pepWorkQueue";
import { AI_QUEUE_REVISION, INITIAL_AI_WORK_QUEUE, type AiCaseListItem } from "../../lib/aiWorkQueue";
import { sidebarIconButtonClass } from "@ace-ds/components/organisms/AceSidebar/sidebarRowActions";
import { screeningToolbarIconButtonClass } from "@ace-ds/components/organisms/ScreeningResultsTable/screeningTableToolbar";
import { AceAccordion } from "@ace-ds/components/molecules/AceAccordion/AceAccordion";

interface PageHeaderProps {
  isSidebarOpen: boolean;
  sidebarPinned: boolean;
  levelLabel: string;
  onTriggerClick: () => void;
  onOpenWorkLog: () => void;
  suppressSidebarTooltip?: boolean;
}

function PageHeader({
  isSidebarOpen,
  sidebarPinned,
  levelLabel,
  onTriggerClick,
  onOpenWorkLog,
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
                aria-label="Work History"
                className={cn(screeningToolbarIconButtonClass, "leading-none")}
                onClick={onOpenWorkLog}
              >
                <MaterialSymbol name="tab_recent" size="md" weight={300} className="text-current" />
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

function isLevel1ActionableStep(groupId: string, stepId: string): boolean {
  // Every listed sidebar step is a live workbench queue (including Suspected Hit / FP / EDD).
  if (groupId === "sanction" || groupId === "pep") return Boolean(stepId);
  if (groupId === "compliance-workbench") return Boolean(stepId);
  if (groupId === "ai-workbench") return Boolean(stepId);
  return false;
}

function caseListSectionForGroup(groupId: string): CaseListSectionContext {
  if (groupId === "compliance-workbench") return "documents-required";
  if (groupId === "ai-workbench") return "ai-workbench";
  if (groupId === "sanction" || groupId === "pep") return "todo";
  return "done";
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
  selectedCaseIndex: number;
  selectedCaseListSection: CaseListSectionContext;
  screeningRowsByCase: Record<number, ScreeningResultRow[]>;
  onFilterVisibilityChange?: (state: { filtersActive: boolean; filteredCount: number }) => void;
  /** Case-list Client ID filter from the sidebar search modal (substring, case-insensitive). */
  clientIdFilter?: string | null;
  /** Disjoint ID series so Sanction vs PEP clients never share an ID. */
  clientIdSeries?: ClientIdSeries;
  /** Group id used for section/queue routing (sanction, pep, compliance-workbench, ai-workbench). */
  workflowId?: string | null;
  /** When set, case list + counts filter to these match statuses. */
  statusFilter?: readonly string[] | null;
  listTitle?: string;
  /** Cases shown in this list (Sanction Matches, PEP Screening, or AI Workbench). */
  cases?: readonly PepCaseListItem[] | readonly AiCaseListItem[] | typeof casesData;
  /** When false, skip Laura lock treatment (PEP / AI queues). */
  applyCaseLocks?: boolean;
  /** Fallback row factory when a case has no stored screening rows. */
  getRowsForCase?: (index: number) => ScreeningResultRow[];
  /**
   * `list` — default left rail rows.
   * `carousel` — side-by-side accordion + horizontal case cards (profile slot).
   */
  presentation?: "list" | "carousel";
}

type CaseListRow = {
  item: PepCaseListItem | AiCaseListItem | (typeof casesData)[number];
  index: number;
};

function CaseList({
  onSelectCase,
  selectedCaseIndex,
  selectedCaseListSection,
  screeningRowsByCase,
  onFilterVisibilityChange,
  clientIdFilter = null,
  clientIdSeries = 1,
  workflowId = null,
  statusFilter = null,
  listTitle = "Sanction Matches",
  cases = casesData,
  applyCaseLocks = true,
  getRowsForCase = getScreeningRowsForCase,
  presentation = "list",
}: CaseListProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [caseListMinimized, setCaseListMinimized] = useState(false);
  const [casesAccordionOpen, setCasesAccordionOpen] = useState(true);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const isCarousel = presentation === "carousel";
  const [selectedCaseFilters, setSelectedCaseFilters] = useState<ReadonlySet<CaseFilterValue>>(
    () => new Set(),
  );
  const [caseSort, setCaseSort] = useState<CaseSortValue>("name-asc");
  const wasSelectedCaseCompleteRef = useRef(false);
  const isDocumentsRequiredWorkflow = isDocumentsRequiredWorkflowId(workflowId);
  const isAiWorkbench = isAiWorkbenchWorkflowId(workflowId);
  const workflowCaseSection: CaseListSectionContext = isDocumentsRequiredWorkflow
    ? "documents-required"
    : isAiWorkbench
      ? "ai-workbench"
      : workflowId === "pep" || workflowId === "sanction"
        ? "todo"
        : "done";
  const workflowStatuses = useMemo(
    () => (statusFilter && statusFilter.length > 0 ? [...statusFilter] : []),
    [statusFilter],
  );
  const isWorkflowView = workflowStatuses.length > 0;

  /** Prefer cached rows; materialize only for the selected case (never the whole queue). */
  const caseRowsForIndex = useCallback(
    (index: number) => {
      const cached = screeningRowsByCase[index];
      if (cached) return cached;
      if (index === selectedCaseIndex) return getRowsForCase(index);
      return null;
    },
    [screeningRowsByCase, getRowsForCase, selectedCaseIndex],
  );

  /** Results still awaiting Level 1 review in My Work. */
  const pendingResultCount = useCallback(
    (index: number) => {
      const rows = screeningRowsByCase[index];
      if (rows) return rows.filter((r) => isLevel1MyWorkStatus(r.status)).length;
      return getSeedLevel1MyWorkPendingCount(index);
    },
    [screeningRowsByCase],
  );

  const workflowResultCount = useCallback(
    (index: number) => {
      const rows = screeningRowsByCase[index];
      if (!rows) {
        // Match sidebar seedCaseMatches so unmaterialized cases still appear.
        if (isDocumentsRequiredWorkflow || workflowStatuses.includes("Documents Required")) {
          return getSeedDocumentsRequiredCount(index);
        }
        if (workflowStatuses.includes("New")) {
          return getSeedLevel1MyWorkPendingCount(index);
        }
        return 0;
      }
      return rows.filter((r) =>
        workflowStatuses.includes(r.status as (typeof workflowStatuses)[number]),
      ).length;
    },
    [screeningRowsByCase, workflowStatuses, isDocumentsRequiredWorkflow],
  );

  const filteredRows = useMemo(() => {
    const out: CaseListRow[] = [];
    const clientNeedle = normalizeClientIdSearchQuery(clientIdFilter ?? "");
    cases.forEach((item, index) => {
      if (!caseMatchesFilters(index, selectedCaseFilters)) return;
      if (clientNeedle) {
        const clientId = clientProfileForCaseIndex(index, clientIdSeries).clientId;
        if (!clientIdMatchesSearchQuery(clientId, clientNeedle)) return;
      }
      out.push({ item, index });
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
    clientIdFilter,
    clientIdSeries,
    caseSort,
    pendingResultCount,
    workflowResultCount,
    isWorkflowView,
  ]);

  const visibleRows = useMemo(() => {
    if (isWorkflowView) {
      return filteredRows.filter((row) => workflowResultCount(row.index) > 0);
    }
    return filteredRows.filter((row) => {
      const rows = screeningRowsByCase[row.index];
      if (!rows) return getSeedLevel1MyWorkPendingCount(row.index) > 0;
      return !isCaseScreeningComplete(rows);
    });
  }, [filteredRows, isWorkflowView, workflowResultCount, screeningRowsByCase]);

  useEffect(() => {
    onFilterVisibilityChange?.({
      filtersActive: selectedCaseFilters.size > 0 || Boolean(normalizeClientIdSearchQuery(clientIdFilter ?? "")),
      filteredCount: visibleRows.length,
    });
  }, [visibleRows.length, selectedCaseFilters.size, clientIdFilter, onFilterVisibilityChange]);

  useEffect(() => {
    if (isWorkflowView) return;
    const rows = caseRowsForIndex(selectedCaseIndex);
    wasSelectedCaseCompleteRef.current = rows ? isCaseScreeningComplete(rows) : false;
  }, [selectedCaseIndex, caseRowsForIndex, isWorkflowView]);

  useEffect(() => {
    if (isWorkflowView) return;
    if (selectedCaseListSection !== "todo") return;
    const rows = caseRowsForIndex(selectedCaseIndex);
    const complete = rows ? isCaseScreeningComplete(rows) : false;
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

  /** Entering / switching a workflow always lands on the first client in the sorted list. */
  const previousWorkflowIdRef = useRef<string | null | undefined>(undefined);
  useEffect(() => {
    if (!isWorkflowView || !workflowId) {
      previousWorkflowIdRef.current = workflowId;
      return;
    }
    if (previousWorkflowIdRef.current === workflowId) return;
    if (visibleRows.length === 0) return;
    previousWorkflowIdRef.current = workflowId;
    onSelectCase(visibleRows[0].index, workflowCaseSection);
  }, [workflowId, isWorkflowView, visibleRows, onSelectCase, workflowCaseSection]);

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

  /** Keep carousel in sync when selection changes — never force-scroll after a user drag. */
  useEffect(() => {
    if (!isCarousel || !carouselApi) return;
    const pos = visibleRows.findIndex((r) => r.index === selectedCaseIndex);
    if (pos < 0) return;
    if (carouselApi.selectedScrollSnap() === pos) return;
    carouselApi.scrollTo(pos);
    // Intentionally omit visibleRows — recalcs must not yank scroll back to selection.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync on selection only
  }, [isCarousel, carouselApi, selectedCaseIndex]);

  const renderCaseCard = (
    caseItem: PepCaseListItem | AiCaseListItem | (typeof casesData)[number],
    index: number,
  ) => {
    const section: CaseListSectionContext = isWorkflowView ? workflowCaseSection : "todo";
    const isEntity = "isEntity" in caseItem && caseItem.isEntity;
    const profile = clientProfileForCaseIndex(index, clientIdSeries, {
      name: caseItem.name,
      isEntity: Boolean(isEntity),
    });
    const pendingCount = pendingResultCount(index);
    const resultsCount = isWorkflowView ? workflowResultCount(index) : pendingCount;
    const isSelected = selectedCaseIndex === index && selectedCaseListSection === section;
    const hasOverdue = profile.reviewTargetOverdue || profile.reviewTargetPastDue;
    const lockReviewer = applyCaseLocks ? lockedCaseReviewer(index) : null;

    // Use a div (not <button>) so Embla can own pointer drag without the control snapping back.
    return (
      <div
        key={`${section}-card-${index}`}
        role="button"
        tabIndex={0}
        onClick={() => onSelectCase(index, section)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelectCase(index, section);
          }
        }}
        className={cn(
          "flex h-full w-full cursor-pointer flex-col gap-2 rounded-[var(--radius-sm)] border border-solid px-3 py-3 text-left transition-colors",
          isSelected
            ? "border-[var(--screening-primary)] bg-[#e4e6ea] dark:bg-[#333a42]"
            : hasOverdue
              ? "border-[var(--ace-warning-200)] bg-[var(--ace-warning-50)] hover:bg-[var(--ace-warning-100)]"
              : "border-[var(--screening-border-strong)] bg-[var(--screening-surface)] hover:bg-[#e4e6ea] dark:hover:bg-[#333a42]",
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <div className={`${isEntity ? "h-[15px]" : ""} w-4 shrink-0`}>
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
            <p
              className="m-0 min-w-0 truncate font-['Noto_Sans:SemiBold',sans-serif] text-[13px] leading-[1.4] text-[var(--screening-text-primary)]"
              style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100" }}
            >
              {caseItem.name}
            </p>
          </div>
          {hasOverdue ? (
            <span className="shrink-0" title={profile.reviewTargetPastDue ? "Overdue" : "Overdue warning"}>
              <OverdueWarningIcon />
            </span>
          ) : null}
        </div>
        <p
          className="m-0 font-['Noto_Sans:Regular',sans-serif] text-[11px] leading-[1.4] text-[var(--screening-text-secondary)]"
          style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100" }}
        >
          {profile.clientId}
        </p>
        <div className="mt-auto flex items-center justify-between gap-2">
          <AceBadge appearance="tag" variant="gray">
            {resultsCount} Alerts
          </AceBadge>
          {lockReviewer ? (
            <CaseListLockReviewerAvatar
              imageUrl={lockReviewer.imageUrl}
              reviewerName={lockReviewer.name}
            />
          ) : null}
        </div>
      </div>
    );
  };

  const filterSortRow = (stretch: boolean) => (
    <div className={cn("flex items-end gap-2", stretch ? "w-full" : "w-fit")}>
      <div
        className={cn(
          "flex flex-col gap-1.5",
          stretch ? "min-w-0 flex-1" : "w-44 shrink-0",
        )}
      >
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
      <div
        className={cn(
          "flex flex-col gap-1.5",
          stretch ? "min-w-0 flex-1" : "w-44 shrink-0",
        )}
      >
        <span
          className="font-['Noto_Sans:SemiBold',sans-serif] text-[13px] text-[#23262c] dark:text-[#b6c2cf]"
          style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100" }}
        >
          Sort by
        </span>
        <CaseListSortSelect value={caseSort} onValueChange={setCaseSort} />
      </div>
    </div>
  );

  const emptyCarouselContent =
    selectedCaseFilters.size > 0 && visibleRows.length === 0 ? (
      <CaseListFilterEmptyState />
    ) : isWorkflowView && visibleRows.length === 0 ? (
      <div className="px-4 py-6 text-center">
        <p
          className="m-0 font-['Noto_Sans:Regular',sans-serif] text-[13px] leading-[1.65] text-[var(--ace-neutral-800)]"
          style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100" }}
        >
          No cases in this workflow yet.
        </p>
      </div>
    ) : null;

  if (isCarousel) {
    return (
      <div
        ref={listRef}
        tabIndex={0}
        data-coach-target="case-list"
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="flex w-full shrink-0 flex-col gap-2 outline-none"
      >
        <p
          className="m-0 shrink-0 font-['Noto_Sans:Bold',sans-serif] text-[14px] font-bold leading-[1.65] text-[var(--screening-text-primary)]"
          style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100" }}
        >
          Clients
        </p>
        <AceAccordion
          className={cn(
            "w-full shrink-0 border-[var(--screening-border-strong)]",
            aceClientProfileAccordionHeaderClass,
          )}
          surface="white"
          dropShadow
          showTag={false}
          showAddIcon={false}
          showDeleteIcon={false}
          showEditIcon={false}
          showMoreIcon={false}
          open={casesAccordionOpen}
          onOpenChange={setCasesAccordionOpen}
          title={
            <span className="truncate">
              {listTitle} · {visibleRows.length}
            </span>
          }
          titleClassName={cn(
            aceTypography(ACE_TYPE.p1SemiBold),
            "min-w-0 flex-1 text-[var(--screening-text-primary)] !truncate",
          )}
        >
          <div className="flex flex-col gap-3">
            {filterSortRow(false)}
            {emptyCarouselContent ? (
              emptyCarouselContent
            ) : (
              <Carousel
                setApi={setCarouselApi}
                opts={{
                  align: "start",
                  containScroll: "trimSnaps",
                  dragFree: true,
                  skipSnaps: true,
                }}
                className="w-full px-10"
              >
                <CarouselContent className="-ml-3">
                  {visibleRows.map(({ item, index }) => (
                    <CarouselItem
                      key={`carousel-${index}`}
                      className="basis-[min(100%,11.5rem)] pl-3 sm:basis-[11.5rem]"
                    >
                      {renderCaseCard(item, index)}
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious
                  className="left-0 size-8 border-[var(--screening-border-strong)] bg-[var(--screening-surface)]"
                  variant="outline"
                  size="icon"
                />
                <CarouselNext
                  className="right-0 size-8 border-[var(--screening-border-strong)] bg-[var(--screening-surface)]"
                  variant="outline"
                  size="icon"
                />
              </Carousel>
            )}
          </div>
        </AceAccordion>
      </div>
    );
  }

  const renderCaseRow = (caseItem: PepCaseListItem | (typeof casesData)[number], index: number) => {
    const section: CaseListSectionContext = isWorkflowView ? workflowCaseSection : "todo";
    const isEntity = "isEntity" in caseItem && caseItem.isEntity;
    const profile = clientProfileForCaseIndex(index, clientIdSeries, {
      name: caseItem.name,
      isEntity: Boolean(isEntity),
    });
    const clientId = profile.clientId;
    const pendingCount = pendingResultCount(index);
    const resultsCount = isWorkflowView
      ? workflowResultCount(index)
      : pendingCount;
    const isSelected = selectedCaseIndex === index && selectedCaseListSection === section;
    const hasOverdueRowHighlight = profile.reviewTargetOverdue || profile.reviewTargetPastDue;
    const lockReviewer = applyCaseLocks ? lockedCaseReviewer(index) : null;
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
                {clientId} · {resultsCount} Alerts
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
        caseListMinimized ? "w-10" : "w-[19.2rem] lg:w-[21.6rem]",
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
            {filterSortRow(true)}
          </div>
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <CaseListSection
              title="Clients"
              count={visibleRows.length}
              collapsible={false}
              stickyHeader
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
        </>
      )}
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
  /** When set, treat as workflow step view (skip all-cleared empty for disposition steps). */
  workflowLabel?: string | null;
  /** True for workflows that have left Level 1 action (not Documents Required). */
  workflowReadOnly?: boolean;
  onOpenClientProfileAction?: (action: ClientProfileActionId) => void;
  clientIdSeries?: ClientIdSeries;
  onDrilldownRowChange?: (row: ScreeningResultRow | null) => void;
  /** Sidebar Application ID — drives the Application field in the client profile. */
  applicationId?: string;
  /** Side-by-side: profile lives in the left rail; omit the top Client Profile block. */
  hideClientProfile?: boolean;
  /** Side-by-side: Match Alerts title is rendered in the shared labels row. */
  hideMatchAlertsLabel?: boolean;
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
  clientIdSeries = 1,
  onDrilldownRowChange,
  applicationId,
  hideClientProfile = false,
  hideMatchAlertsLabel = false,
}: DetailPanelProps) {
  const [clientExpanded, setClientExpanded] = useState(false);
  const profile = clientProfileForCaseIndex(selectedCaseIndex, clientIdSeries, {
    name: selectedCase.name,
    isEntity: "isEntity" in selectedCase && selectedCase.isEntity,
  });
  const applicationLabel = formatReviewApplicationLabel(applicationId);
  const isWorkflowView = Boolean(workflowLabel);
  const profileComment = clientProfileCommentForCase(selectedCaseIndex);
  const profilePassthrough = CLIENT_PROFILE_PASSTHROUGH_PLACEHOLDER;

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
      {isCaseReadOnly ? (
        <ReviewPanelInlineInfoMessage>
          Read only. This case is locked and in review by another user.
        </ReviewPanelInlineInfoMessage>
      ) : null}
      {hideClientProfile ? null : (
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
            <ClientProfileActiveIndicator />
            <span className="truncate">{selectedCase.name}</span>
            <ClientProfileAccordionHeaderTags
              clientId={profile.clientId}
              riskBand={profile.riskBand}
              showOverdueWarning={profile.reviewTargetOverdue}
              onRiskClick={
                isCaseReadOnly || workflowReadOnly
                  ? undefined
                  : () => onOpenClientProfileAction?.("risk-rating")
              }
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
              <ClientProfileCopyablePanel
                copyLabel="Copy identity details"
                getCopyText={() => {
                  const lines = [
                    ...profile.addressLines,
                    `Client Name · ${selectedCase.name}`,
                    `Client ID · ${profile.clientId}`,
                    "Address Validated",
                  ];
                  if (profile.showIdVerified) lines.push("ID Verified");
                  return lines.join("\n");
                }}
              >
                <ClientProfileAddressSection addressLines={profile.addressLines} />
                <ClientProfileNameRow name={selectedCase.name} />
                <ClientProfileClientIdRow clientId={profile.clientId} />
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
                      profile.reviewTargetOverdue ? " Overdue Warning" : ""
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
                  {profile.reviewTargetOverdue ? (
                    <span className="text-[#e65100]"> Overdue Warning</span>
                  ) : null}
                </ClientProfileMetaLine>
                <ClientProfileMetaLine label="Last Modified">
                  {profile.lastModified}
                </ClientProfileMetaLine>
                <ClientProfileTruncatedField label="Comments" value={profileComment} />
                <ClientProfileTruncatedField label="Passthrough" value={profilePassthrough} />
              </ClientProfileCopyablePanel>
            </div>
      </AceAccordion>
      </div>
      )}

      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden">
        {hideMatchAlertsLabel ? null : (
          <p
            className="m-0 shrink-0 font-['Noto_Sans:Bold',sans-serif] text-[14px] font-bold leading-[1.65] text-[var(--screening-text-primary)]"
            style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100" }}
          >
            Match Alerts
          </p>
        )}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <ScreeningResultsTable
            rows={screeningRows}
            title="Match Alerts"
            caseListSection={caseListSection}
            selectedIds={screeningSelectedIds}
            onSelectedIdsChange={onScreeningSelectedIdsChange}
            onQuickClearRow={onQuickClearRow}
            readOnly={isCaseReadOnly || workflowReadOnly}
            onDrilldownRowChange={onDrilldownRowChange}
          />
        </div>
      </div>
    </div>
  );
}

const sideBySideSectionLabelClass =
  "m-0 shrink-0 font-['Noto_Sans:Bold',sans-serif] text-[14px] font-bold leading-[1.65] text-[var(--screening-text-primary)]";

function Level1ReviewWorkspace() {
  const { isSideBySide } = useReviewLayout();
  const [profileRailMinimized, setProfileRailMinimized] = useState(false);
  const [sidebarPinned, setSidebarPinned] = useState(true);
  const ensureSidebarOpen = useCallback(() => {
    setSidebarPinned(true);
  }, []);
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
  } = useReviewOnboardingCoach({ onEnsureSidebarOpen: ensureSidebarOpen });
  const [selectedCaseIndex, setSelectedCaseIndex] = useState(0);
  const [selectedCaseListSection, setSelectedCaseListSection] =
    useState<CaseListSectionContext>("todo");
  const [sidebarSelection, setSidebarSelection] = useState<ReviewAssignedSidebarSelection>({
    kind: "step",
    applicationId: "isi",
    groupId: "sanction",
    stepId: "new",
  });
  const [isReviewDrawerOpen, setIsReviewDrawerOpen] = useState(false);
  const [clientProfileAction, setClientProfileAction] = useState<ClientProfileActionId | null>(
    null,
  );
  const [screeningSelectedIds, setScreeningSelectedIds] = useState<Set<string>>(() => new Set());
  const [drilldownReviewRow, setDrilldownReviewRow] = useState<ScreeningResultRow | null>(null);
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
    setDrilldownReviewRow(null);
    setClientProfileAction(null);
  }, []);
  const [screeningRowsByCase, setScreeningRowsByCase] = useScreeningRowsByCase();
  const [pepCases] = useState(() => INITIAL_PEP_WORK_QUEUE.cases);
  const [pepScreeningRowsByCase, setPepScreeningRowsByCase] = useState(
    () => INITIAL_PEP_WORK_QUEUE.screeningRowsByCase,
  );
  const [aiCases, setAiCases] = useState(() => INITIAL_AI_WORK_QUEUE.cases);
  const [aiScreeningRowsByCase, setAiScreeningRowsByCase] = useState(
    () => INITIAL_AI_WORK_QUEUE.screeningRowsByCase,
  );

  useEffect(() => {
    setAiCases(INITIAL_AI_WORK_QUEUE.cases);
    setAiScreeningRowsByCase(INITIAL_AI_WORK_QUEUE.screeningRowsByCase);
  }, [AI_QUEUE_REVISION]);
  const [workLogEntries, setWorkLogEntries] = useState<WorkLogEntry[]>([]);
  const [workLogOpen, setWorkLogOpen] = useState(false);
  const [workLogIntroOpen, setWorkLogIntroOpen] = useState(false);
  const [clientIdSearchOpen, setClientIdSearchOpen] = useState(false);
  const [clientIdFilter, setClientIdFilter] = useState<string | null>(null);
  const workLogIntroShownRef = useRef(false);
  const undoWorkQueueRef = useRef<"sanction" | "pep" | "ai">("sanction");

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

  const isPepWork = sidebarSelection.groupId === "pep";
  const isAiWorkbench = sidebarSelection.groupId === "ai-workbench";
  const isDocumentsRequiredWorkflow = sidebarSelection.groupId === "compliance-workbench";
  const selectedStep = findSidebarStep(
    LEVEL1_SIDEBAR_GROUP_DEFS,
    sidebarSelection.groupId,
    sidebarSelection.stepId,
  );
  const stepStatuses = selectedStep?.statuses ?? [];
  const isActionableStep = isLevel1ActionableStep(
    sidebarSelection.groupId,
    sidebarSelection.stepId,
  );
  const isWorkflowReadOnlyView = !isActionableStep;
  const activeCases = isAiWorkbench
    ? aiCases
    : isPepWork
      ? pepCases
      : casesData;
  const activeScreeningRowsByCase = isAiWorkbench
    ? aiScreeningRowsByCase
    : isPepWork
      ? pepScreeningRowsByCase
      : screeningRowsByCase;
  const setActiveScreeningRowsByCase = isAiWorkbench
    ? setAiScreeningRowsByCase
    : isPepWork
      ? setPepScreeningRowsByCase
      : setScreeningRowsByCase;
  const getActiveRowsForCase = useCallback(
    (index: number) => {
      if (isAiWorkbench) {
        return aiScreeningRowsByCase[index] ?? [];
      }
      if (isPepWork) {
        return pepScreeningRowsByCase[index] ?? [];
      }
      return screeningRowsByCase[index] ?? getScreeningRowsForCase(index);
    },
    [
      isAiWorkbench,
      isPepWork,
      aiScreeningRowsByCase,
      pepScreeningRowsByCase,
      screeningRowsByCase,
    ],
  );

  /** Client identity for the case that owns the submitted matches. */
  const workLogClientForCaseIndex = useCallback(
    (caseIndex: number) => {
      const clientName =
        (isAiWorkbench
          ? aiCases[caseIndex]?.name
          : isPepWork
            ? pepCases[caseIndex]?.name
            : casesData[caseIndex]?.name
        )?.trim() || "—";
      const clientIdSeries: ClientIdSeries = isAiWorkbench ? 6 : isPepWork ? 5 : 1;
      const clientId = clientProfileForCaseIndex(caseIndex, clientIdSeries).clientId.trim() || "—";
      return { clientName, clientId };
    },
    [isAiWorkbench, isPepWork, aiCases, pepCases],
  );

  const selectedGroupDef = LEVEL1_SIDEBAR_GROUP_DEFS.find(
    (group) => group.id === sidebarSelection.groupId,
  );
  const workListTitle = selectedGroupDef?.label ?? "Sanction Matches";
  const screeningRuleLabel = isPepWork ? "PEP Screening" : "Sanctioned Matches";
  const selectedWorkflowId = sidebarSelection.groupId;
  const selectedWorkflowLabel = selectedStep
    ? `${workListTitle} · ${selectedStep.label}`
    : workListTitle;
  /** Work Log Origin — workflow group name. */
  const workLogOrigin = workListTitle;
  const workflowStatuses = stepStatuses;

  const screeningRows = useMemo(() => {
    const rows = getActiveRowsForCase(selectedCaseIndex);
    if (workflowStatuses.length === 0) return rows;
    return rows.filter((row) => workflowStatuses.includes(row.status));
  }, [getActiveRowsForCase, selectedCaseIndex, workflowStatuses]);

  const handleSidebarSelectionChange = useCallback(
    (selection: ReviewAssignedSidebarSelection) => {
      setSidebarSelection(selection);
      setScreeningSelectedIds(new Set());
      setDrilldownReviewRow(null);
      setClientProfileAction(null);
      setIsReviewDrawerOpen(false);
      setClientIdFilter(null);
      setSelectedCaseIndex(0);
      setSelectedCaseListSection(caseListSectionForGroup(selection.groupId));
    },
    [],
  );

  const isSelectedCaseReadOnly =
    !isPepWork &&
    !isAiWorkbench &&
    !isDocumentsRequiredWorkflow &&
    isCaseLockedByAnotherUser(selectedCaseIndex);

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
      activeCases.every((_, index) => {
        if (isAiWorkbench) {
          const rows = aiScreeningRowsByCase[index] ?? [];
          // AI Workbench is clear only when no AI open statuses remain.
          return (
            rows.length > 0 &&
            rows.every((row) => !isLevel1AiWorkbenchStatus(row.status))
          );
        }
        if (isPepWork) {
          return isCaseScreeningComplete(pepScreeningRowsByCase[index] ?? []);
        }
        const rows = screeningRowsByCase[index];
        if (!rows) return getSeedLevel1MyWorkPendingCount(index) === 0;
        return isCaseScreeningComplete(rows);
      }),
    [
      activeCases,
      isAiWorkbench,
      isPepWork,
      aiScreeningRowsByCase,
      pepScreeningRowsByCase,
      screeningRowsByCase,
    ],
  );

  const sidebarGroups = useMemo(
    () =>
      deriveReviewSidebarGroups(
        LEVEL1_SIDEBAR_GROUP_DEFS,
        {
          sanction: screeningRowsByCase,
          pep: pepScreeningRowsByCase,
          compliance: screeningRowsByCase,
          ai: aiScreeningRowsByCase,
        },
        {
          caseIndexesByGroup: {
            sanction: casesData.map((_, index) => index),
            compliance: casesData.map((_, index) => index),
            pep: pepCases.map((_, index) => index),
            "ai-workbench": aiCases.map((_, index) => index),
          },
          seedCaseMatches: (caseIndex, statuses) => {
            if (statuses.includes("New") && getSeedLevel1MyWorkPendingCount(caseIndex) > 0) {
              return true;
            }
            if (
              statuses.includes("Documents Required") &&
              getSeedDocumentsRequiredCount(caseIndex) > 0
            ) {
              return true;
            }
            return false;
          },
        },
      ),
    [screeningRowsByCase, pepScreeningRowsByCase, aiScreeningRowsByCase, pepCases, aiCases],
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
    setSelectedCaseListSection(caseListSectionForGroup(next.groupId));
  }, [sidebarGroups, sidebarSelection.groupId, sidebarSelection.stepId]);

  const workflowHasCases = useMemo(() => {
    return activeCases.some((_, index) => {
      const cached = (
        isAiWorkbench
          ? aiScreeningRowsByCase
          : isPepWork
            ? pepScreeningRowsByCase
            : screeningRowsByCase
      )[index];
      if (!cached) {
        if (isDocumentsRequiredWorkflow || workflowStatuses.includes("Documents Required")) {
          return getSeedDocumentsRequiredCount(index) > 0;
        }
        if (workflowStatuses.includes("New")) {
          return getSeedLevel1MyWorkPendingCount(index) > 0;
        }
      }
      const rows = getActiveRowsForCase(index);
      if (rows.length === 0 && isDocumentsRequiredWorkflow) {
        return getSeedDocumentsRequiredCount(index) > 0;
      }
      if (workflowStatuses.length === 0) return rows.length > 0;
      return rows.some((row) => workflowStatuses.includes(row.status));
    });
  }, [
    activeCases,
    getActiveRowsForCase,
    isDocumentsRequiredWorkflow,
    isAiWorkbench,
    isPepWork,
    aiScreeningRowsByCase,
    pepScreeningRowsByCase,
    screeningRowsByCase,
    workflowStatuses,
  ]);

  useEffect(() => {
    if (isAiWorkbench || isPepWork) return;
    setScreeningRowsByCase((prev) => ensureScreeningRowsForCase(prev, selectedCaseIndex));
  }, [selectedCaseIndex, isAiWorkbench, isPepWork, setScreeningRowsByCase]);

  /** Only one inline drawer at a time — opening either replaces the other. */
  const handleOpenClientProfileAction = useCallback((action: ClientProfileActionId) => {
    setIsReviewDrawerOpen(false);
    setClientProfileAction(action);
  }, []);

  const handleShowReview = useCallback(() => {
    setIsReviewDrawerOpen((open) => {
      const next = !open;
      if (next) {
        setClientProfileAction(null);
        if (screeningSelectedIds.size === 0 && drilldownReviewRow != null) {
          setScreeningSelectedIds(new Set([drilldownReviewRow.id]));
        }
      }
      return next;
    });
  }, [screeningSelectedIds.size, drilldownReviewRow]);

  useEffect(() => {
    if (screeningSelectedIds.size > 0) {
      setClientProfileAction(null);
      setIsReviewDrawerOpen(true);
    }
  }, [screeningSelectedIds]);

  const restoreSubmittedRows = useCallback(
    (caseIndex: number, previousRowsById: Record<string, (typeof screeningRows)[number]>) => {
      setWorkLogEntries((prev) =>
        removeWorkLogEntriesForRowIds(prev, Object.keys(previousRowsById)),
      );
      const restoreQueue = undoWorkQueueRef.current;
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
      if (restoreQueue === "pep") {
        setPepScreeningRowsByCase((prev) => applyRestore(prev, () => []));
      } else if (restoreQueue === "ai") {
        setAiScreeningRowsByCase((prev) => applyRestore(prev, () => []));
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
      undoWorkQueueRef.current = isAiWorkbench ? "ai" : isPepWork ? "pep" : "sanction";

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
      isAiWorkbench,
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
      undoWorkQueueRef.current = isAiWorkbench ? "ai" : isPepWork ? "pep" : "sanction";

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
      isAiWorkbench,
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
      undoWorkQueueRef.current = isAiWorkbench ? "ai" : isPepWork ? "pep" : "sanction";

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
      isAiWorkbench,
      workLogOrigin,
      setActiveScreeningRowsByCase,
      recordWorkLogDecision,
      workLogClientForCaseIndex,
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

  const clientIdSeriesValue: ClientIdSeries = isAiWorkbench ? 6 : isPepWork ? 5 : 1;
  const selectedCaseItem = activeCases[selectedCaseIndex] ?? activeCases[0]!;
  const caseListSharedProps = {
    onSelectCase: handleSelectCase,
    selectedCaseIndex,
    selectedCaseListSection,
    screeningRowsByCase: activeScreeningRowsByCase,
    onFilterVisibilityChange: setCaseFilterVisibility,
    clientIdFilter,
    clientIdSeries: clientIdSeriesValue,
    workflowId: selectedWorkflowId,
    statusFilter: workflowStatuses,
    listTitle: selectedWorkflowLabel,
    cases: activeCases,
    applyCaseLocks: !isPepWork && !isAiWorkbench && !isDocumentsRequiredWorkflow,
    getRowsForCase: getActiveRowsForCase,
  } as const;

  const detailPanelSharedProps = {
    selectedCase: selectedCaseItem,
    selectedCaseIndex,
    caseListSection: selectedCaseListSection,
    screeningRows,
    screeningSelectedIds,
    onScreeningSelectedIdsChange: setScreeningSelectedIds,
    allCasesCleared: allCasesCleared && isActionableStep,
    onQuickClearRow: handleQuickClearRow,
    showFilterEmptyState:
      (caseFilterVisibility.filtersActive && caseFilterVisibility.filteredCount === 0) ||
      !workflowHasCases,
    emptyStateMessage: !workflowHasCases
      ? "No cases in this workflow step yet."
      : "No cases match the selected filters.",
    isCaseReadOnly: isSelectedCaseReadOnly,
    workflowLabel: selectedWorkflowLabel,
    workflowReadOnly: isWorkflowReadOnlyView,
    onOpenClientProfileAction: handleOpenClientProfileAction,
    clientIdSeries: clientIdSeriesValue,
    onDrilldownRowChange: setDrilldownReviewRow,
    applicationId: sidebarSelection.applicationId,
  } as const;

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-[var(--screening-surface-muted)] text-[var(--screening-text-primary)]">
      <ReviewFlowSiteHeader />
      <PageHeader
        isSidebarOpen={sidebarPinned}
        sidebarPinned={sidebarPinned}
        levelLabel="Level 1"
        onTriggerClick={handleTriggerClick}
        onOpenWorkLog={() => setWorkLogOpen(true)}
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
              {isSideBySide ? (
                <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-hidden">
                  <CaseList {...caseListSharedProps} presentation="carousel" />
                  <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden">
                    <div className="flex shrink-0 items-center gap-4">
                      <p
                        className={cn(
                          sideBySideSectionLabelClass,
                          "transition-[width] duration-200 ease-out",
                          profileRailMinimized
                            ? "w-10 overflow-hidden opacity-0"
                            : "w-[21.6rem] lg:w-96",
                        )}
                        style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100" }}
                        aria-hidden={profileRailMinimized}
                      >
                        Client Profile
                      </p>
                      <p
                        className={cn(sideBySideSectionLabelClass, "min-w-0 flex-1")}
                        style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100" }}
                      >
                        Match Alerts
                      </p>
                    </div>
                    <div className="flex min-h-0 flex-1 gap-4 overflow-hidden">
                      <div className="flex h-full min-h-0 shrink-0 self-stretch flex-col">
                        <SideBySideClientProfileRail
                          caseName={selectedCaseItem.name}
                          caseIndex={selectedCaseIndex}
                          isEntity={
                            "isEntity" in selectedCaseItem && Boolean(selectedCaseItem.isEntity)
                          }
                          clientIdSeries={clientIdSeriesValue}
                          applicationLabel={formatReviewApplicationLabel(
                            sidebarSelection.applicationId,
                          )}
                          readOnly={isSelectedCaseReadOnly || isWorkflowReadOnlyView}
                          onOpenClientProfileAction={handleOpenClientProfileAction}
                          showSectionLabel={false}
                          onMinimizedChange={setProfileRailMinimized}
                        />
                      </div>
                      <DetailPanel
                        {...detailPanelSharedProps}
                        hideClientProfile
                        hideMatchAlertsLabel
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="shrink-0 self-stretch flex flex-col min-h-0">
                    <CaseList {...caseListSharedProps} />
                  </div>
                  <DetailPanel {...detailPanelSharedProps} />
                </>
              )}
            </div>
            {workflowHasCases && !isSelectedCaseReadOnly && isActionableStep ? (
              <ReviewTaskBar
                flowVariant="level-1"
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
      <ToastViewport>
        {bulkSubmitToast}
        {overdueWarningToast}
      </ToastViewport>
      <SearchClientIdModal
        open={clientIdSearchOpen}
        onClose={() => setClientIdSearchOpen(false)}
        initialQuery={clientIdFilter ?? ""}
        onSearch={(query) => {
          const normalized = normalizeClientIdSearchQuery(query);
          setClientIdFilter(normalized || null);
        }}
      />
      <WorkLogModal
        open={workLogOpen}
        onClose={() => setWorkLogOpen(false)}
        entries={workLogEntries}
      />
      <WorkLogIntroModal
        open={workLogIntroOpen}
        onClose={() => setWorkLogIntroOpen(false)}
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
  );
}

export function Level1ReviewInterface() {
  return (
    <ThemeProvider>
      <ReviewLayoutProvider>
        <Level1ReviewWorkspace />
      </ReviewLayoutProvider>
    </ThemeProvider>
  );
}
