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
import { MoreVertical } from "lucide-react";
import { caseActionsMenuIconClass, caseActionsMenuTriggerClass } from "../../lib/caseActionsMenuStyles";
import { AllCasesClearedState } from "../../components/AllCasesClearedState";
import { CaseListFilterEmptyState } from "../../components/CaseListFilterEmptyState";
import { CaseListLockReviewerAvatar } from "../../components/CaseListLockReviewerAvatar";
import { CaseListSection } from "../../components/CaseListSection";
import { ThemeProvider } from "../../context/ThemeContext";
import { aceAccordionFixedHeaderClass } from "../../lib/aceAccordion";
import { aceDropShadowXsClass } from "../../lib/aceShadow";
import { aceTypography, ACE_TYPE } from "../../lib/aceTypography";
import { ReviewMetaTag } from "../../components/ReviewMetaTag";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import {
  ScreeningResultsTable,
  getScreeningRowsForCase,
  isCaseScreeningComplete,
  isLevel2ReviewedRow,
  level1ReviewerForCaseIndex,
  screeningNewPillSurfaceClass,
  type CaseListSectionContext,
  type ScreeningResultRow,
  type ScreeningRowStatus,
} from "../../components/ScreeningResultsTable";
import { useScreeningRowsByCase } from "../../lib/screeningState";
import { useCompleteCaseSubmit } from "../../lib/useCompleteCaseSubmit";
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
import { cn } from "../../components/ui/utils";
import { ReviewDrawer } from "../../components/ReviewDrawer";
import { ReviewTaskBar } from "../../components/ReviewTaskBar";
import { SidebarNavCountBadge } from "../../components/SidebarNavCountBadge";
import {
  isLevel1InProcessStatus,
  type Level1ScreeningStatus,
} from "../../lib/reviewDecisionConfig";
import { AceSidebar } from "@ace-ds/components/organisms/AceSidebar/AceSidebar";
import { AceAccordion } from "@ace-ds/components/molecules/AceAccordion/AceAccordion";

interface PageHeaderProps {
  isSidebarOpen: boolean;
  sidebarPinned: boolean;
  levelLabel: string;
  onTriggerClick: () => void;
  onTriggerMouseEnter: () => void;
  onTriggerMouseLeave: () => void;
}

function PageHeader({
  isSidebarOpen,
  sidebarPinned,
  levelLabel,
  onTriggerClick,
  onTriggerMouseEnter,
  onTriggerMouseLeave,
}: PageHeaderProps) {
  return (
    <div className="flex shrink-0 items-center justify-between border-b border-[var(--screening-border-strong)] bg-[var(--screening-surface)] px-4 py-3 md:px-8">
      <div className="flex items-center gap-5">
        <button
          type="button"
          aria-expanded={isSidebarOpen}
          aria-label={
            isSidebarOpen
              ? "Sidebar is open. Click to close and unpin."
              : "Open sidebar. Hover to preview; click to pin open."
          }
          className={`size-[16px] cursor-pointer border-0 bg-transparent p-0 text-[#23262c] transition-transform duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#523eb9]/35 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:text-[#b6c2cf] dark:focus-visible:ring-offset-[#22272b] rounded ${sidebarPinned ? "" : "rotate-180"}`}
          onClick={onTriggerClick}
          onMouseEnter={onTriggerMouseEnter}
          onMouseLeave={onTriggerMouseLeave}
        >
          <svg className="block size-full pointer-events-none" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
            <path d={svgPaths.p3f53b460} fill="currentColor" />
          </svg>
        </button>
        <div className="flex items-center gap-2">
          <p className={cn(aceTypography(ACE_TYPE.h6Bold), "leading-[1.65] text-[var(--screening-text-primary)]")}>
            Review Assigned
          </p>
          <ReviewMetaTag>{levelLabel}</ReviewMetaTag>
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

const SIDEBAR_ORGANIZATIONS = [{ id: "level-1-users", label: "Level 1 Users" }] as const;

type SidebarNavItemConfig = {
  id: string;
  label: string;
  count: number;
  selectable: boolean;
  badgeLabelClass: string;
};

const SIDEBAR_NAV_ITEMS: readonly Omit<SidebarNavItemConfig, "count">[] = [
  {
    id: "sanction",
    label: "Sanction Matches",
    selectable: true,
    badgeLabelClass: "text-[#523eb9]",
  },
  {
    id: "pep",
    label: "PEP Screening",
    selectable: false,
    badgeLabelClass: "text-[#92278f]",
  },
  {
    id: "new-clients",
    label: "New Clients",
    selectable: false,
    badgeLabelClass: "text-[#87b531]",
  },
  {
    id: "financial",
    label: "Financial Crime",
    selectable: false,
    badgeLabelClass: "text-[#0672a3]",
  },
];

const STATIC_SIDEBAR_COUNTS: Record<string, number> = {
  pep: 53,
  "new-clients": 27,
  financial: 19,
};

function ReviewSidebarNavRow({
  item,
  selected,
  onSelect,
}: {
  item: SidebarNavItemConfig;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <div
      className={cn(
        "group/row relative z-[1] flex items-center rounded-[var(--ace-sidebar-item-radius)]",
        selected
          ? "bg-[var(--ace-sidebar-item-selected-bg)] text-[var(--ace-sidebar-item-selected-text)]"
          : item.selectable
            ? "text-[var(--screening-text-primary)] hover:bg-[var(--ace-sidebar-item-hover-bg)]"
            : "text-[var(--screening-text-muted)]",
      )}
    >
      <button
        type="button"
        disabled={!item.selectable}
        aria-label={`${item.label}, ${item.count}`}
        aria-current={selected ? "page" : undefined}
        onClick={item.selectable ? onSelect : undefined}
        className={cn(
          "flex min-w-0 flex-1 items-center border-0 bg-transparent px-3 py-1.5 text-left outline-none",
          "transition-colors duration-[var(--ace-motion-duration-fast)] [transition-timing-function:var(--ace-motion-ease-standard)]",
          item.selectable
            ? "cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--screening-primary-ring)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--screening-primary-ring-offset)]"
            : "cursor-not-allowed",
        )}
      >
        <span
          className={cn(
            aceTypography(ACE_TYPE.p1Regular),
            "min-w-0 flex-1 truncate text-sm leading-[1.3125rem]",
          )}
        >
          {item.label}
        </span>
      </button>
      <SidebarNavCountBadge count={item.count} badgeLabelClass={item.badgeLabelClass} />
    </div>
  );
}

interface ReviewSidebarProps {
  isOpen: boolean;
  sanctionMatchCount: number;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

function ReviewSidebar({ isOpen, sanctionMatchCount, onMouseEnter, onMouseLeave }: ReviewSidebarProps) {
  const [selectedOrgId, setSelectedOrgId] = useState<string>(SIDEBAR_ORGANIZATIONS[0].id);
  const [selectedNavId, setSelectedNavId] = useState<string>(SIDEBAR_NAV_ITEMS[0].id);

  const navItems = useMemo(
    (): SidebarNavItemConfig[] =>
      SIDEBAR_NAV_ITEMS.map((item) => ({
        ...item,
        count: item.id === "sanction" ? sanctionMatchCount : (STATIC_SIDEBAR_COUNTS[item.id] ?? 0),
      })),
    [sanctionMatchCount],
  );

  return (
    <div className="h-full shrink-0" onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      <AceSidebar
        open={isOpen}
        variant="navigation"
        organizations={[...SIDEBAR_ORGANIZATIONS]}
        selectedOrganizationId={selectedOrgId}
        onOrganizationChange={setSelectedOrgId}
        navItems={[]}
        className="h-full"
      >
        <div className="flex flex-col gap-0">
          <p
            className={cn(
              aceTypography(ACE_TYPE.p1SemiBold),
              "px-3 pb-2 pt-1 text-[var(--screening-text-primary)]",
            )}
          >
            My Assigned Work
          </p>
          {navItems.map((item) => (
            <ReviewSidebarNavRow
              key={item.id}
              item={item}
              selected={item.id === selectedNavId}
              onSelect={() => setSelectedNavId(item.id)}
            />
          ))}
        </div>
      </AceSidebar>
    </div>
  );
}

interface CaseListProps {
  onSelectCase: (index: number, section: CaseListSectionContext) => void;
  selectedCaseIndex: number;
  selectedCaseListSection: CaseListSectionContext;
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
  const [doneSectionExpanded, setDoneSectionExpanded] = useState(false);
  const [selectedCaseFilters, setSelectedCaseFilters] = useState<ReadonlySet<CaseFilterValue>>(
    () => new Set(),
  );
  const [caseSort, setCaseSort] = useState<CaseSortValue>("results-desc");
  const wasSelectedCaseCompleteRef = useRef(false);

  const caseRowsForIndex = useCallback(
    (index: number) => screeningRowsByCase[index] ?? getScreeningRowsForCase(index),
    [screeningRowsByCase],
  );

  /** Results still awaiting Level 1 review (the count the analyst acts on). */
  const pendingResultCount = useCallback(
    (index: number) => caseRowsForIndex(index).filter((r) => r.status === "New").length,
    [caseRowsForIndex],
  );

  const filteredRows = useMemo(() => {
    const out: CaseListRow[] = [];
    casesData.forEach((item, index) => {
      if (caseMatchesFilters(index, selectedCaseFilters)) {
        out.push({ item, index });
      }
    });
    out.sort((a, b) => compareCasesBySort(a.index, b.index, caseSort, pendingResultCount));
    return out;
  }, [selectedCaseFilters, caseSort, pendingResultCount]);

  useEffect(() => {
    onFilterVisibilityChange?.({
      filtersActive: selectedCaseFilters.size > 0,
      filteredCount: filteredRows.length,
    });
  }, [filteredRows.length, selectedCaseFilters.size, onFilterVisibilityChange]);

  /** Results sent to (or through) Level 2 — used in the done section row label. */
  const sentToLevel2ResultCount = useCallback(
    (index: number) =>
      caseRowsForIndex(index).filter(
        (r) => isLevel1InProcessStatus(r.status) || isLevel2ReviewedRow(r),
      ).length,
    [caseRowsForIndex],
  );

  const { pendingRows, doneRows } = useMemo(() => {
    const pending: CaseListRow[] = [];
    const done: CaseListRow[] = [];
    filteredRows.forEach((row) => {
      const caseRows = caseRowsForIndex(row.index);
      const complete = isCaseScreeningComplete(caseRows);
      // Any result that has moved to (or through) Level 2.
      const hasSentToLevel2 = caseRows.some(
        (r) => isLevel1InProcessStatus(r.status) || isLevel2ReviewedRow(r),
      );
      if (!complete) pending.push(row);
      // A case keeps a spot in "Sent to Level 2" whenever it has work there,
      // even if remediated results have reopened it in "To Do".
      if (complete || hasSentToLevel2) done.push(row);
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
        const done = rows.filter((r) => r.status !== "New").length;
        return { done, total: rows.length };
      }),
    [caseRowsForIndex],
  );

  useEffect(() => {
    const rows = caseRowsForIndex(selectedCaseIndex);
    wasSelectedCaseCompleteRef.current = isCaseScreeningComplete(rows);
  }, [selectedCaseIndex, caseRowsForIndex]);

  useEffect(() => {
    if (selectedCaseListSection !== "todo") return;
    const rows = caseRowsForIndex(selectedCaseIndex);
    const complete = isCaseScreeningComplete(rows);
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
    const activeList = selectedCaseListSection === "done" ? doneRows : pendingRows;
    if (activeList.some((r) => r.index === selectedCaseIndex)) return;
    if (activeList.length > 0) {
      onSelectCase(activeList[0].index, selectedCaseListSection);
    }
  }, [doneRows, pendingRows, selectedCaseIndex, selectedCaseListSection, onSelectCase]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isFocused) return;

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
  }, [selectedCaseIndex, selectedCaseListSection, onSelectCase, isFocused, pendingRows, doneRows]);

  const renderCaseRow = (
    caseItem: (typeof casesData)[number],
    index: number,
    section: CaseListSectionContext,
  ) => {
    const isEntity = "isEntity" in caseItem && caseItem.isEntity;
    const profile = clientProfileForCaseIndex(index);
    const clientId = profile.clientId;
    const { done, total } = caseReviewProgress[index] ?? { done: 0, total: 1 };
    const progressPct = total > 0 ? (done / total) * 100 : 0;
    const pendingCount = pendingResultCount(index);
    const resultsCount =
      section === "todo"
        ? pendingCount > 0
          ? pendingCount
          : caseItem.results
        : sentToLevel2ResultCount(index);
    const isSelected =
      selectedCaseIndex === index && selectedCaseListSection === section;
    const lockReviewer = lockedCaseReviewer(index);
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
        <p className="font-['Noto_Sans:Bold',sans-serif] font-bold leading-[1.65] text-[14px] text-[var(--screening-text-primary)]" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100" }}>
          Sanction Matches
        </p>
        <div className="flex items-center justify-center rounded-[4px] border border-[var(--screening-pill-new-border)] bg-[var(--screening-pill-new-surface)] px-2 py-1 min-w-[25px]">
          <p className="font-['Noto_Sans:Bold',sans-serif] font-bold leading-[1.65] text-[var(--screening-pill-new-label)] text-[14px]" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100" }}>{pendingRows.length}</p>
        </div>
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
          title="Case List - To Do"
          count={pendingRows.length}
          collapsible={false}
          emptyContent={
            selectedCaseFilters.size > 0 && pendingRows.length === 0 ? (
              <CaseListFilterEmptyState />
            ) : undefined
          }
        >
          {pendingRows.map(({ item, index }) => renderCaseRow(item, index, "todo"))}
        </CaseListSection>
        <CaseListSection
          title="Sent to Level 2"
          count={doneRows.length}
          expanded={doneSectionExpanded}
          onExpandedChange={setDoneSectionExpanded}
          hideWhenEmpty
          emptyContent={
            selectedCaseFilters.size > 0 && doneRows.length === 0 ? (
              <CaseListFilterEmptyState />
            ) : undefined
          }
        >
          {doneRows.map(({ item, index }) => renderCaseRow(item, index, "done"))}
        </CaseListSection>
      </div>
    </div>
  );
}

interface DetailPanelProps {
  selectedCase: (typeof casesData)[number];
  selectedCaseIndex: number;
  caseListSection: CaseListSectionContext;
  screeningRows: ScreeningResultRow[];
  screeningSelectedIds: Set<string>;
  onScreeningSelectedIdsChange: Dispatch<SetStateAction<Set<string>>>;
  allCasesCleared: boolean;
  onQuickClearRow: (rowId: string, status: ScreeningRowStatus) => void;
  showFilterEmptyState?: boolean;
  isCaseReadOnly?: boolean;
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
  isCaseReadOnly = false,
}: DetailPanelProps) {
  const [clientExpanded, setClientExpanded] = useState(false);
  const [caseActionModal, setCaseActionModal] = useState<
    null | "comments" | "history" | "reports"
  >(null);
  const profile = clientProfileForCaseIndex(selectedCaseIndex);
  const riskPresentation = riskBandPresentation(profile.riskBand);

  const caseActionModalTitle =
    caseActionModal === "comments"
      ? "Comments"
      : caseActionModal === "history"
        ? "History"
        : caseActionModal === "reports"
          ? "Reports"
          : "";

  if (showFilterEmptyState) {
    return (
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <ReviewPanelEmptyState message="No cases match the selected filters." />
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

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-hidden">
      {isCaseReadOnly ? (
        <ReviewPanelInlineInfoMessage>
          Read only. This case is locked and in review by another user.
        </ReviewPanelInlineInfoMessage>
      ) : null}
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
          isCaseReadOnly ? null : (
          <div className="shrink-0 self-center" onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="Case actions"
                  className={caseActionsMenuTriggerClass}
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className={caseActionsMenuIconClass} strokeWidth={2} aria-hidden />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                variant="compact"
                onClick={(e) => e.stopPropagation()}
              >
                <DropdownMenuItem onSelect={() => setCaseActionModal("comments")}>
                  Comments
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setCaseActionModal("history")}>
                  History
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setCaseActionModal("reports")}>
                  Reports
                </DropdownMenuItem>
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
                <div
                  className={cn(
                    "flex min-h-[120px] flex-1 flex-col items-center justify-center rounded p-6",
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
                </div>
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

      <Dialog
        open={caseActionModal !== null}
        onOpenChange={(open) => {
          if (!open) setCaseActionModal(null);
        }}
      >
        <DialogContent className="max-w-lg gap-0 overflow-hidden rounded-[4px] border-[#cfd2d9] dark:border-[#38414a] bg-white dark:bg-[#22272b] p-0 sm:max-w-lg">
          <DialogHeader className="border-b border-[#cfd2d9] dark:border-[#38414a] px-6 py-4 text-left">
            <DialogTitle
              className="font-['Noto_Sans:Bold',sans-serif] text-[18px] font-bold text-[#23262c] dark:text-[#b6c2cf]"
              style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100" }}
            >
              {caseActionModalTitle}
            </DialogTitle>
          </DialogHeader>
          <div className="min-h-[200px] px-6 py-6" />
        </DialogContent>
      </Dialog>

      <ScreeningResultsTable
        rows={screeningRows}
        caseListSection={caseListSection}
        selectedIds={screeningSelectedIds}
        onSelectedIdsChange={onScreeningSelectedIdsChange}
        onQuickClearRow={onQuickClearRow}
        readOnly={isCaseReadOnly}
      />
    </div>
  );
}

export function Level1ReviewInterface() {
  const [sidebarPinned, setSidebarPinned] = useState(true);
  const [sidebarPeek, setSidebarPeek] = useState(false);
  const [selectedCaseIndex, setSelectedCaseIndex] = useState(0);
  const [selectedCaseListSection, setSelectedCaseListSection] =
    useState<CaseListSectionContext>("todo");
  const [isReviewDrawerOpen, setIsReviewDrawerOpen] = useState(false);
  const [screeningSelectedIds, setScreeningSelectedIds] = useState<Set<string>>(() => new Set());
  const [caseFilterVisibility, setCaseFilterVisibility] = useState({
    filtersActive: false,
    filteredCount: casesData.length,
  });
  const handleSelectCase = useCallback((index: number, section: CaseListSectionContext) => {
    setSelectedCaseIndex(index);
    setSelectedCaseListSection(section);
    setScreeningSelectedIds(new Set());
  }, []);
  const [screeningRowsByCase, setScreeningRowsByCase] = useScreeningRowsByCase();

  const screeningRows = useMemo(
    () => screeningRowsByCase[selectedCaseIndex] ?? getScreeningRowsForCase(selectedCaseIndex),
    [screeningRowsByCase, selectedCaseIndex],
  );

  const isSelectedCaseReadOnly = isCaseLockedByAnotherUser(selectedCaseIndex);

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
      casesData.every((_, index) => {
        const rows = screeningRowsByCase[index] ?? getScreeningRowsForCase(index);
        return isCaseScreeningComplete(rows);
      }),
    [screeningRowsByCase],
  );

  const pendingSanctionCount = useMemo(
    () =>
      casesData.reduce((count, _, index) => {
        const rows = screeningRowsByCase[index] ?? getScreeningRowsForCase(index);
        return isCaseScreeningComplete(rows) ? count : count + 1;
      }, 0),
    [screeningRowsByCase],
  );

  const handleShowReview = useCallback(() => {
    setIsReviewDrawerOpen((open) => !open);
  }, []);

  const handleSubmitDecision = useCallback(
    (status: string, reason: string) => {
      setScreeningRowsByCase((prev) => {
        const current =
          prev[selectedCaseIndex] ?? getScreeningRowsForCase(selectedCaseIndex);
        return {
          ...prev,
          [selectedCaseIndex]: current.map((row) =>
            screeningSelectedIds.has(row.id)
              ? {
                  ...row,
                  status: status as Level1ScreeningStatus,
                  level1Reason: reason,
                  level1Reviewer: level1ReviewerForCaseIndex(selectedCaseIndex),
                }
              : row,
          ),
        };
      });
      setScreeningSelectedIds(new Set());
    },
    [selectedCaseIndex, screeningSelectedIds, setScreeningRowsByCase],
  );

  const handleQuickClearRow = useCallback(
    (rowId: string, status: ScreeningRowStatus) => {
      setScreeningRowsByCase((prev) => {
        const current =
          prev[selectedCaseIndex] ?? getScreeningRowsForCase(selectedCaseIndex);
        return {
          ...prev,
          [selectedCaseIndex]: current.map((row) =>
            row.id === rowId
              ? {
                  ...row,
                  status: status as Level1ScreeningStatus,
                  level1Reason: status,
                  level1Reviewer: level1ReviewerForCaseIndex(selectedCaseIndex),
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
    },
    [selectedCaseIndex, setScreeningRowsByCase],
  );

  const handleBulkQuickClear = useCallback(
    (status: ScreeningRowStatus) => {
      setScreeningRowsByCase((prev) => {
        const current =
          prev[selectedCaseIndex] ?? getScreeningRowsForCase(selectedCaseIndex);
        return {
          ...prev,
          [selectedCaseIndex]: current.map((row) =>
            screeningSelectedIds.has(row.id)
              ? {
                  ...row,
                  status: status as Level1ScreeningStatus,
                  level1Reason: status,
                  level1Reviewer: level1ReviewerForCaseIndex(selectedCaseIndex),
                }
              : row,
          ),
        };
      });
      setScreeningSelectedIds(new Set());
    },
    [selectedCaseIndex, screeningSelectedIds, setScreeningRowsByCase],
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

  const sidebarPinnedRef = useRef(sidebarPinned);
  sidebarPinnedRef.current = sidebarPinned;

  const peekCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearPeekCloseTimer = useCallback(() => {
    if (peekCloseTimerRef.current !== null) {
      clearTimeout(peekCloseTimerRef.current);
      peekCloseTimerRef.current = null;
    }
  }, []);

  const schedulePeekClose = useCallback(() => {
    clearPeekCloseTimer();
    peekCloseTimerRef.current = setTimeout(() => {
      peekCloseTimerRef.current = null;
      if (!sidebarPinnedRef.current) {
        setSidebarPeek(false);
      }
    }, 280);
  }, [clearPeekCloseTimer]);

  useEffect(() => () => clearPeekCloseTimer(), [clearPeekCloseTimer]);

  const sidebarOpen = sidebarPinned || sidebarPeek;

  const handleTriggerClick = useCallback(() => {
    clearPeekCloseTimer();
    if (sidebarPinnedRef.current) {
      setSidebarPinned(false);
      setSidebarPeek(false);
    } else {
      setSidebarPinned(true);
    }
  }, [clearPeekCloseTimer]);

  const handleTriggerMouseEnter = useCallback(() => {
    clearPeekCloseTimer();
    if (!sidebarPinnedRef.current) {
      setSidebarPeek(true);
    }
  }, [clearPeekCloseTimer]);

  const handleTriggerMouseLeave = useCallback(() => {
    if (!sidebarPinnedRef.current) {
      schedulePeekClose();
    }
  }, [schedulePeekClose]);

  const handleSidebarMouseEnter = useCallback(() => {
    clearPeekCloseTimer();
    if (!sidebarPinnedRef.current) {
      setSidebarPeek(true);
    }
  }, [clearPeekCloseTimer]);

  const handleSidebarMouseLeave = useCallback(() => {
    if (!sidebarPinnedRef.current) {
      schedulePeekClose();
    }
  }, [schedulePeekClose]);

  return (
    <ThemeProvider>
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-[var(--screening-surface-muted)] text-[var(--screening-text-primary)]">
      <ReviewFlowSiteHeader />
      <PageHeader
        isSidebarOpen={sidebarOpen}
        sidebarPinned={sidebarPinned}
        levelLabel="Level 1"
        onTriggerClick={handleTriggerClick}
        onTriggerMouseEnter={handleTriggerMouseEnter}
        onTriggerMouseLeave={handleTriggerMouseLeave}
      />
      <div className="flex flex-1 overflow-hidden">
        <ReviewSidebar
          isOpen={sidebarOpen}
          sanctionMatchCount={pendingSanctionCount}
          onMouseEnter={handleSidebarMouseEnter}
          onMouseLeave={handleSidebarMouseLeave}
        />
        <div className="flex flex-1 overflow-hidden">
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
                selectedCase={casesData[selectedCaseIndex]}
                selectedCaseIndex={selectedCaseIndex}
                caseListSection={selectedCaseListSection}
                screeningRows={screeningRows}
                screeningSelectedIds={screeningSelectedIds}
                onScreeningSelectedIdsChange={setScreeningSelectedIds}
                allCasesCleared={allCasesCleared}
                onQuickClearRow={handleQuickClearRow}
                showFilterEmptyState={
                  caseFilterVisibility.filtersActive && caseFilterVisibility.filteredCount === 0
                }
                isCaseReadOnly={isSelectedCaseReadOnly}
              />
            </div>
            {!allCasesCleared && !isSelectedCaseReadOnly ? (
              <ReviewTaskBar
                flowVariant="level-1"
                onShowReview={handleShowReview}
                isReviewOpen={isReviewDrawerOpen}
                screeningSelectionCount={screeningSelectedIds.size}
                onDeselectAllScreening={() => setScreeningSelectedIds(new Set())}
                onBulkQuickClear={handleBulkQuickClear}
              />
            ) : null}
          </div>
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
    </div>
    </ThemeProvider>
  );
}
