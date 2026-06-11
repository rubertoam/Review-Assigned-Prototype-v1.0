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
import { MoreVertical } from "lucide-react";
import { ThemeProvider } from "../../context/ThemeContext";
import { aceAccordionFixedHeaderClass } from "../../lib/aceAccordion";
import { aceDropShadowXsClass } from "../../lib/aceShadow";
import { aceTypography, ACE_TYPE } from "../../lib/aceTypography";
import { ReviewFlowSiteHeader } from "../../components/ReviewFlowSiteHeader";
import {
  ClientProfileMetaBadge,
  ClientProfileOverdueBadge,
  OverdueWarningIcon,
} from "../../components/ClientProfileHeaderBadges";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import {
  ScreeningResultsTable,
  getScreeningRowsForCase,
  screeningNewPillSurfaceClass,
  type ScreeningResultRow,
} from "../../components/ScreeningResultsTable";
import { cn } from "../../components/ui/utils";
import { ReviewDrawer } from "../../components/ReviewDrawer";
import { AceSidebar } from "@ace-ds/components/organisms/AceSidebar/AceSidebar";
import { AceAccordion } from "@ace-ds/components/molecules/AceAccordion/AceAccordion";

interface PageHeaderProps {
  isSidebarOpen: boolean;
  sidebarPinned: boolean;
  onTriggerClick: () => void;
  onTriggerMouseEnter: () => void;
  onTriggerMouseLeave: () => void;
}

function PageHeader({
  isSidebarOpen,
  sidebarPinned,
  onTriggerClick,
  onTriggerMouseEnter,
  onTriggerMouseLeave,
}: PageHeaderProps) {
  return (
    <div className="flex shrink-0 items-center justify-between border-b border-[var(--screening-border-strong)] bg-[var(--screening-surface)] px-4 py-3 md:px-8">
      <div className="flex gap-5 items-center">
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
        <p className={cn(aceTypography(ACE_TYPE.h6Bold), "leading-[1.65] text-[var(--screening-text-primary)]")}>
          Review Assigned
        </p>
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

const SIDEBAR_ORGANIZATIONS = [{ id: "group-a", label: "Group A" }] as const;

type SidebarNavItemConfig = {
  id: string;
  label: string;
  count: number;
  selectable: boolean;
  badgeLabelClass: string;
};

const SIDEBAR_NAV_ITEMS: readonly SidebarNavItemConfig[] = [
  {
    id: "sanction",
    label: "Sanction Matches",
    count: 6,
    selectable: true,
    badgeLabelClass: "text-[#523eb9]",
  },
  {
    id: "pep",
    label: "PEP Screening",
    count: 53,
    selectable: false,
    badgeLabelClass: "text-[#92278f]",
  },
  {
    id: "new-clients",
    label: "New Clients",
    count: 27,
    selectable: false,
    badgeLabelClass: "text-[#87b531]",
  },
  {
    id: "financial",
    label: "Financial Crime",
    count: 19,
    selectable: false,
    badgeLabelClass: "text-[#0672a3]",
  },
];

function SidebarNavCountBadge({
  count,
  badgeLabelClass,
}: Pick<SidebarNavItemConfig, "count" | "badgeLabelClass">) {
  return (
    <span
      className={cn(
        "mr-3 inline-flex shrink-0 items-center justify-end tabular-nums",
        aceTypography(ACE_TYPE.captionBold),
        badgeLabelClass,
      )}
      aria-hidden
    >
      {count}
    </span>
  );
}

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
            : "cursor-default",
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
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

function ReviewSidebar({ isOpen, onMouseEnter, onMouseLeave }: ReviewSidebarProps) {
  const [selectedOrgId, setSelectedOrgId] = useState<string>(SIDEBAR_ORGANIZATIONS[0].id);
  const [selectedNavId, setSelectedNavId] = useState<string>(SIDEBAR_NAV_ITEMS[0].id);

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
          {SIDEBAR_NAV_ITEMS.map((item) => (
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

const CASE_INTERACTION_OPTIONS = [
  "Risk",
  "Review Target",
  "Organization",
  "Individual",
] as const;
type CaseInteraction = (typeof CASE_INTERACTION_OPTIONS)[number];
type CaseInteractionPicklist = "all" | CaseInteraction;

const casesData = [
  { name: "John Smith", results: 8, selected: true, interaction: "Individual" as const },
  { name: "Mr. Jose A Gonzalez", results: 8, selected: false, interaction: "Review Target" as const },
  { name: "Muammar Qadhafi", results: 7, selected: false, interaction: "Risk" as const },
  { name: "Jane Doe", results: 5, selected: false, interaction: "Individual" as const },
  { name: "Bank of Iran", results: 3, selected: false, isEntity: true, interaction: "Organization" as const },
  { name: "Bank of Moscow", results: 2, selected: false, isEntity: true, interaction: "Organization" as const },
] as const;

type ClientRiskBand = "low" | "medium" | "high";

interface ClientProfileFields {
  countryLabel: string;
  dob: string | null;
  gender: string | null;
  addressLines: readonly [string, string, string];
  lastModified: string;
  applicationLabel: string;
  reviewTargetSummary: string;
  reviewTargetOverdue: boolean;
  riskBand: ClientRiskBand;
  showIdVerified: boolean;
}

/** Per-case profile: aligned with `casesData` indices (0â€“5). */
const CLIENT_PROFILES: readonly ClientProfileFields[] = [
  {
    countryLabel: "USA",
    dob: "03/23/1978",
    gender: "Male",
    addressLines: ["3943 Allegheny Blvd.", "Pittsburgh, PA 15203", "USA"],
    lastModified: "01 Oct 2025 16:44:14",
    applicationLabel: "ISI Focus",
    reviewTargetSummary: "Level 1",
    reviewTargetOverdue: true,
    riskBand: "low",
    showIdVerified: true,
  },
  {
    countryLabel: "USA",
    dob: "04/11/1985",
    gender: "Male",
    addressLines: ["2200 Brickell Ave, Ste 400", "Miami, FL 33129", "USA"],
    lastModified: "28 Sep 2025 09:12:03",
    applicationLabel: "ISI Focus",
    reviewTargetSummary: "Level 1",
    reviewTargetOverdue: false,
    riskBand: "low",
    showIdVerified: true,
  },
  {
    countryLabel: "LBY",
    dob: "06/07/1942",
    gender: "Male",
    addressLines: ["Government District, Bab al-Azizia complex", "Tripoli, Tripoli District", "Libya"],
    lastModified: "15 Sep 2025 11:30:44",
    applicationLabel: "ISI Focus",
    reviewTargetSummary: "Level 1",
    reviewTargetOverdue: false,
    riskBand: "high",
    showIdVerified: true,
  },
  {
    countryLabel: "USA",
    dob: "09/14/1992",
    gender: "Female",
    addressLines: ["88 Beacon St, Unit 6B", "Boston, MA 02108", "USA"],
    lastModified: "22 Aug 2025 14:05:47",
    applicationLabel: "ISI Focus",
    reviewTargetSummary: "Level 1",
    reviewTargetOverdue: false,
    riskBand: "medium",
    showIdVerified: true,
  },
  {
    countryLabel: "IRN",
    dob: null,
    gender: null,
    addressLines: ["No. 328 Mirdamad Blvd, Valiasr Office Tower", "Tehran 19115", "Iran"],
    lastModified: "10 Jul 2025 08:41:19",
    applicationLabel: "ISI Focus",
    reviewTargetSummary: "Level 1",
    reviewTargetOverdue: false,
    riskBand: "high",
    showIdVerified: false,
  },
  {
    countryLabel: "RUS",
    dob: null,
    gender: null,
    addressLines: ["12 Neglinnaya St, Central Bank Annex", "Moscow 107031", "Russia"],
    lastModified: "03 Jun 2025 17:22:11",
    applicationLabel: "ISI Focus",
    reviewTargetSummary: "Level 1",
    reviewTargetOverdue: false,
    riskBand: "high",
    showIdVerified: false,
  },
];

function clientProfileForCaseIndex(caseIndex: number): ClientProfileFields {
  const i = Math.max(0, Math.min(caseIndex, CLIENT_PROFILES.length - 1));
  return CLIENT_PROFILES[i];
}

function riskBandPresentation(band: ClientRiskBand): { box: string; text: string; label: string } {
  if (band === "high") {
    return { box: "bg-[#fdeaea] dark:bg-[#3d2f2f]", text: "text-[#9e2a2a] dark:text-[#f0b4b4]", label: "High Risk" };
  }
  if (band === "medium") {
    return { box: "bg-[#fff4e8] dark:bg-[#3d3628]", text: "text-[#c2410c] dark:text-[#f0c090]", label: "Medium Risk" };
  }
  return { box: "bg-[#f8fbf1] dark:bg-[#2a302c]", text: "text-[#87b531]", label: "Low Risk" };
}

function MetaDot() {
  return (
    <span
      className="mx-1 inline-block h-1 w-1 shrink-0 rounded-full bg-[#523eb9] align-middle dark:bg-[#8696a7]"
      aria-hidden
    />
  );
}

interface CaseListProps {
  onSelectCase: (index: number) => void;
  selectedCaseIndex: number;
}

function CaseList({ onSelectCase, selectedCaseIndex }: CaseListProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [interactionPicklist, setInteractionPicklist] =
    useState<CaseInteractionPicklist>("all");

  const visibleRows = useMemo(() => {
    const out: { item: (typeof casesData)[number]; index: number }[] = [];
    casesData.forEach((item, index) => {
      if (interactionPicklist === "all" || item.interaction === interactionPicklist) {
        out.push({ item, index });
      }
    });
    return out;
  }, [interactionPicklist]);

  const caseReviewProgress = useMemo(
    () =>
      casesData.map((_, i) => {
        const rows = getScreeningRowsForCase(i, "level-2");
        const done = rows.filter((r) => r.status === "Escalated").length;
        return { done, total: rows.length };
      }),
    [],
  );

  useEffect(() => {
    if (visibleRows.some((r) => r.index === selectedCaseIndex)) return;
    if (visibleRows.length > 0) {
      onSelectCase(visibleRows[0].index);
    }
  }, [visibleRows, selectedCaseIndex, onSelectCase]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isFocused) return;

      const pos = visibleRows.findIndex((r) => r.index === selectedCaseIndex);
      if (pos < 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (pos < visibleRows.length - 1) {
          onSelectCase(visibleRows[pos + 1].index);
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (pos > 0) {
          onSelectCase(visibleRows[pos - 1].index);
        }
      }
    };

    const listElement = listRef.current;
    if (listElement) {
      listElement.addEventListener('keydown', handleKeyDown);
      return () => listElement.removeEventListener('keydown', handleKeyDown);
    }
  }, [selectedCaseIndex, onSelectCase, isFocused, visibleRows]);

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
        <p className="font-['Noto_Sans:Bold',sans-serif] font-bold leading-[1.65] text-[14px] text-black dark:text-[#b6c2cf]" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100" }}>
          Sanction Matches
        </p>
        <div className="flex items-center justify-center border border-[#d6cef5] bg-[#f4f1fc] dark:border-[#454c59] dark:bg-[#333a42] px-2 py-1 rounded-[4px] min-w-[25px]">
          <p className="font-['Noto_Sans:Bold',sans-serif] font-bold leading-[1.65] text-[#523eb9] dark:text-[#9fadbc] text-[14px]" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100" }}>{visibleRows.length}</p>
        </div>
      </div>
      <div className="shrink-0 border-b border-[#cfd2d9] dark:border-[#38414a] bg-white dark:bg-[#22272b] px-3 py-2.5">
        <div className="flex flex-col gap-1.5">
          <span
            className="font-['Noto_Sans:SemiBold',sans-serif] text-[13px] text-[#23262c] dark:text-[#b6c2cf]"
            style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100" }}
          >
            Filter by
          </span>
          <Select
            value={interactionPicklist}
            onValueChange={(v) => setInteractionPicklist(v as CaseInteractionPicklist)}
          >
            <SelectTrigger
              size="sm"
              className={cn(
                "h-8 w-full rounded-[4px] border-[#cfd2d9] dark:border-[#38414a] bg-white dark:bg-[#22272b] px-2.5 py-1.5 text-[13px] font-['Noto_Sans:Regular',sans-serif] font-normal text-[#23262c] dark:text-[#b6c2cf] shadow-none hover:bg-[#eff0f2] dark:hover:bg-[#2c333a] focus-visible:border-[#523eb9] focus-visible:ring-[#523eb9]/30",
                "[&_svg]:size-3.5 [&_svg]:opacity-60",
              )}
              style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100" }}
            >
              <SelectValue placeholder="Select interaction" />
            </SelectTrigger>
            <SelectContent
              position="popper"
              className={cn(
                "rounded-[var(--radius-sm)] border border-[var(--screening-border-strong)] bg-[var(--screening-surface)] p-1",
                aceDropShadowXsClass,
              )}
            >
              <SelectItem
                value="all"
                className="rounded-[4px] py-1.5 pl-2 pr-8 text-[13px] font-['Noto_Sans:Regular',sans-serif] focus:bg-[#efeef9] dark:bg-[#333a42] focus:text-[#23262c] dark:text-[#b6c2cf]"
                style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100" }}
              >
                All
              </SelectItem>
              {CASE_INTERACTION_OPTIONS.map((opt) => (
                <SelectItem
                  key={opt}
                  value={opt}
                  className="rounded-[4px] py-1.5 pl-2 pr-8 text-[13px] font-['Noto_Sans:Regular',sans-serif] focus:bg-[#efeef9] dark:bg-[#333a42] focus:text-[#23262c] dark:text-[#b6c2cf]"
                  style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100" }}
                >
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex flex-col">
        {visibleRows.map(({ item: caseItem, index }) => {
          const isEntity = "isEntity" in caseItem && caseItem.isEntity;
          const { done, total } = caseReviewProgress[index] ?? { done: 0, total: 1 };
          const progressPct = total > 0 ? (done / total) * 100 : 0;
          return (
          <div
            key={index}
            className={cn(
              "group relative cursor-pointer px-4 pb-2.5 pt-1 transition-colors",
              selectedCaseIndex === index ? "bg-[#e4e6ea] dark:bg-[#333a42]" : "hover:bg-[#e4e6ea] dark:hover:bg-[#333a42]",
            )}
            onClick={() => onSelectCase(index)}
          >
            {selectedCaseIndex === index && isFocused && (
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
                {caseItem.results} results
              </p>
            </div>
            </div>
            {caseItem.name === "John Smith" ? (
              <span className="shrink-0" title="Overdue warning">
                <OverdueWarningIcon />
                <span className="sr-only">Overdue warning</span>
              </span>
            ) : null}
            </div>
            <div
              className="pointer-events-none absolute bottom-1 left-4 right-4 z-10 h-1 overflow-hidden rounded-full border border-[#e4e6ea] bg-[#eff0f2] dark:bg-[#2c333a] opacity-0 transition-opacity duration-200 group-hover:opacity-100"
              aria-hidden
            >
              <div className="h-full rounded-full bg-[#523eb9] transition-[width] duration-300 ease-out" style={{ width: `${progressPct}%` }} />
            </div>
          </div>
          );
        })}
      </div>
    </div>
  );
}

interface DetailPanelProps {
  selectedCase: (typeof casesData)[number];
  selectedCaseIndex: number;
  screeningRows: ScreeningResultRow[];
  screeningSelectedIds: Set<string>;
  onScreeningSelectedIdsChange: Dispatch<SetStateAction<Set<string>>>;
}

function DetailPanel({
  selectedCase,
  selectedCaseIndex,
  screeningRows,
  screeningSelectedIds,
  onScreeningSelectedIdsChange,
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

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-y-auto">
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
        title={selectedCase.name}
        titleClassName={cn(
          aceTypography(ACE_TYPE.p1SemiBold),
          "text-[var(--screening-text-primary)]",
        )}
        headerTrailing={
          <div
            className="flex max-w-[min(100%,28rem)] flex-nowrap items-center justify-end gap-2 self-center overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <ClientProfileMetaBadge>{profile.countryLabel}</ClientProfileMetaBadge>
            {profile.dob ? <ClientProfileMetaBadge>{profile.dob}</ClientProfileMetaBadge> : null}
            {profile.reviewTargetOverdue ? <ClientProfileOverdueBadge /> : null}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="Case actions"
                  className="inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-[var(--radius-sm)] border border-[var(--screening-border-strong)] bg-[var(--screening-surface)] text-[var(--screening-text-secondary)] transition-colors duration-200 ease-out hover:border-[var(--screening-border-hover)] hover:bg-[var(--screening-surface-hover)] hover:text-[var(--screening-text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--screening-primary-ring)] focus-visible:ring-offset-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="size-4 shrink-0 rotate-90" strokeWidth={2} aria-hidden />
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
                <div className="flex gap-2.5 items-start">
                  <div className="h-[23px] w-[16px] shrink-0">
                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 23">
                      <path d="M8 0C3.57714 0 0 3.5995 0 8.05C0 14.0875 8 23 8 23C8 23 16 14.0875 16 8.05C16 3.5995 12.4229 0 8 0ZM8 10.925C6.42286 10.925 5.14286 9.637 5.14286 8.05C5.14286 6.463 6.42286 5.175 8 5.175C9.57714 5.175 10.8571 6.463 10.8571 8.05C10.8571 9.637 9.57714 10.925 8 10.925Z" fill="#523EB9" />
                    </svg>
                  </div>
                  <div className="font-['Noto_Sans:Regular',sans-serif] font-normal text-[14px] text-[#23262c] dark:text-[#b6c2cf]" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100" }}>
                    {profile.addressLines.map((line, lineIdx) => (
                      <p key={lineIdx} className="m-0 leading-[1.65]">
                        {line}
                      </p>
                    ))}
                  </div>
                </div>
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
                  <p className="font-['Noto_Sans:Regular',sans-serif] font-normal leading-[1.65] text-[14px] text-[#23262c] dark:text-[#b6c2cf]" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100" }}>
                    <span>Gender </span>
                    <MetaDot />
                    <span>{profile.gender}</span>
                  </p>
                ) : null}
                {profile.dob != null ? (
                  <p className="font-['Noto_Sans:Regular',sans-serif] font-normal leading-[1.65] text-[14px] text-[#23262c] dark:text-[#b6c2cf]" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100" }}>
                    <span>Date of Birth </span>
                    <MetaDot />
                    <span>{profile.dob}</span>
                  </p>
                ) : null}
                <p className="font-['Noto_Sans:Regular',sans-serif] font-normal leading-[1.65] text-[14px] text-[#23262c] dark:text-[#b6c2cf]" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100" }}>
                  <span>Application </span>
                  <MetaDot />
                  <span>{profile.applicationLabel}</span>
                </p>
                <p className="font-['Noto_Sans:Regular',sans-serif] font-normal leading-[1.65] text-[14px] text-[#23262c] dark:text-[#b6c2cf]" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100" }}>
                  <span>Review Target </span>
                  <MetaDot />
                  <span>{profile.reviewTargetSummary}</span>
                  {profile.reviewTargetOverdue ? (
                    <span className="text-[#e65100]"> Overdue Warning</span>
                  ) : null}
                </p>
                <p className="font-['Noto_Sans:Regular',sans-serif] font-normal leading-[1.65] text-[14px] text-[#23262c] dark:text-[#b6c2cf]" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100" }}>
                  <span>Last Modified </span>
                  <MetaDot />
                  <span>{profile.lastModified}</span>
                </p>
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
        className="w-full"
        rows={screeningRows}
        flowVariant="level-2"
        selectedIds={screeningSelectedIds}
        onSelectedIdsChange={onScreeningSelectedIdsChange}
      />
    </div>
  );
}

interface TaskBarProps {
  onShowReview: () => void;
  isReviewOpen: boolean;
  screeningSelectionCount: number;
  onDeselectAllScreening: () => void;
}

function TaskBar({
  onShowReview,
  isReviewOpen,
  screeningSelectionCount,
  onDeselectAllScreening,
}: TaskBarProps) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-between gap-4 rounded-[var(--radius-sm)] border border-[var(--screening-border-strong)] bg-[var(--screening-surface)] px-4 py-4",
        aceDropShadowXsClass,
      )}
    >
      <div className="flex gap-4 items-center cursor-pointer min-w-0">
        <div className="relative size-[24px] shrink-0">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
            <path d={svgPaths.p2f74d800} fill="var(--fill-0, #7868CD)" />
            <path d={svgPaths.p273dbb80} fill="var(--fill-0, #7868CD)" transform="translate(8.04, 5.64)" />
            <path d={svgPaths.p212023c0} fill="var(--fill-0, #7868CD)" transform="translate(10.67, 15.72)" />
          </svg>
        </div>
        <p className="font-['Noto_Sans:Regular',sans-serif] font-normal leading-[1.65] text-[#7868cd] text-[14px]" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100" }}>
          Show me how this works
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        {screeningSelectionCount > 0 ? (
          <>
            <span
              className="font-['Noto_Sans:Regular',sans-serif] text-[13px] tabular-nums text-[#464c59] dark:text-[#9fadbc] whitespace-nowrap"
              style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100" }}
            >
              {screeningSelectionCount} selected
            </span>
            <button
              type="button"
              onClick={onDeselectAllScreening}
              className="font-['Noto_Sans:SemiBold',sans-serif] text-[13px] rounded-[4px] px-2 py-1.5 text-[#523eb9] transition-colors hover:bg-[#f4f1fc] dark:hover:bg-[#2c333a] hover:text-[#3d2e8a] dark:hover:text-[#dcd7e8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#523eb9]/35 focus-visible:ring-offset-2"
              style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100" }}
            >
              Deselect all
            </button>
          </>
        ) : null}
        <div
          className="shrink-0 bg-[#3d2e8a] px-4 py-2 rounded-[4px] cursor-pointer hover:bg-[#523eb9] transition-colors"
          onClick={onShowReview}
        >
          <p className="font-['Noto_Sans:Bold',sans-serif] font-bold leading-[1.65] text-[14px] text-white" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100" }}>
            {isReviewOpen ? 'Hide Review' : 'Show Review'}
          </p>
        </div>
      </div>
    </div>
  );
}


export function Level2ReviewInterface() {
  const [sidebarPinned, setSidebarPinned] = useState(true);
  const [sidebarPeek, setSidebarPeek] = useState(false);
  const [selectedCaseIndex, setSelectedCaseIndex] = useState(0);
  const [isReviewDrawerOpen, setIsReviewDrawerOpen] = useState(false);
  const [screeningSelectedIds, setScreeningSelectedIds] = useState<Set<string>>(() => new Set());

  const screeningRows = useMemo(
    () => getScreeningRowsForCase(selectedCaseIndex, "level-2"),
    [selectedCaseIndex],
  );

  const actionableScreeningCount = useMemo(
    () => screeningRows.filter((row) => row.status === "Escalated").length,
    [screeningRows],
  );

  const handleShowReview = useCallback(() => {
    setIsReviewDrawerOpen((open) => !open);
  }, []);

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
        onTriggerClick={handleTriggerClick}
        onTriggerMouseEnter={handleTriggerMouseEnter}
        onTriggerMouseLeave={handleTriggerMouseLeave}
      />
      <div className="flex flex-1 overflow-hidden">
        <ReviewSidebar isOpen={sidebarOpen} onMouseEnter={handleSidebarMouseEnter} onMouseLeave={handleSidebarMouseLeave} />
        <div className="flex flex-1 overflow-hidden">
          <div className="flex flex-col flex-1 min-h-0 overflow-hidden px-4 pb-4 gap-4">
            <div className="flex flex-1 min-h-0 overflow-hidden gap-4 pt-4">
              <div className="shrink-0 self-stretch flex flex-col min-h-0">
                <CaseList onSelectCase={setSelectedCaseIndex} selectedCaseIndex={selectedCaseIndex} />
              </div>
              <DetailPanel
                selectedCase={casesData[selectedCaseIndex]}
                selectedCaseIndex={selectedCaseIndex}
                screeningRows={screeningRows}
                screeningSelectedIds={screeningSelectedIds}
                onScreeningSelectedIdsChange={setScreeningSelectedIds}
              />
            </div>
            <TaskBar
              onShowReview={handleShowReview}
              isReviewOpen={isReviewDrawerOpen}
              screeningSelectionCount={screeningSelectedIds.size}
              onDeselectAllScreening={() => setScreeningSelectedIds(new Set())}
            />
          </div>
          <ReviewDrawer
            isOpen={isReviewDrawerOpen}
            onClose={() => setIsReviewDrawerOpen(false)}
            flowVariant="level-2"
            selectedCount={screeningSelectedIds.size}
            actionableRowCount={actionableScreeningCount}
          />
        </div>
      </div>
    </div>
    </ThemeProvider>
  );
}
