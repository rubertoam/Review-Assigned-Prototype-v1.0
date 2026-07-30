import { useMemo, useState } from "react";
import {
  AceSidebar,
  type AceSidebarGroup,
  type AceSidebarNavItem,
} from "@ace-ds/components/organisms/AceSidebar/AceSidebar";
import { MaterialSymbol } from "@ace-ds/components/molecules/AceAccordion/MaterialSymbol";
import {
  AceTooltip,
  AceTooltipContent,
  AceTooltipTrigger,
} from "@ace-ds/components/atoms/AceTooltip/AceTooltip";
import { screeningToolbarIconButtonClass } from "@ace-ds/components/organisms/ScreeningResultsTable/screeningTableToolbar";
import { SidebarNavCountBadge } from "./SidebarNavCountBadge";
import type { ReviewSidebarWorkflowItem } from "../lib/reviewSidebarWorkflows";
import { cn } from "./ui/utils";

export type ReviewAssignedWorkCategory = {
  id: string;
  label: string;
  count: number;
  selectable: boolean;
  badgeLabelClass: string;
};

export type ReviewAssignedSidebarSelection =
  | { kind: "work"; id: string }
  | { kind: "workflow"; id: string };

export type ReviewAssignedSidebarProps = {
  open: boolean;
  organizations: readonly { id: string; label: string }[];
  workCategories: readonly ReviewAssignedWorkCategory[];
  /** Empty until cleared work exists — Workflows group is omitted. */
  workflowItems: readonly ReviewSidebarWorkflowItem[];
  selection: ReviewAssignedSidebarSelection;
  onSelectionChange: (selection: ReviewAssignedSidebarSelection) => void;
  /** Opens the Work History modal owned by the review interface. */
  onOpenWorkLog?: () => void;
  className?: string;
};

function categoryToNavItem(
  item: ReviewAssignedWorkCategory,
  selection: ReviewAssignedSidebarSelection,
  onSelect: (selection: ReviewAssignedSidebarSelection) => void,
): AceSidebarNavItem {
  const selected = item.selectable && selection.kind === "work" && selection.id === item.id;
  return {
    id: item.id,
    label: item.label,
    selected,
    disabled: !item.selectable,
    onSelect: item.selectable
      ? () => onSelect({ kind: "work", id: item.id })
      : undefined,
    trailing: (
      <SidebarNavCountBadge count={item.count} badgeLabelClass={item.badgeLabelClass} />
    ),
  };
}

function workflowToNavItem(
  item: ReviewSidebarWorkflowItem,
  selection: ReviewAssignedSidebarSelection,
  onSelect: (selection: ReviewAssignedSidebarSelection) => void,
): AceSidebarNavItem {
  const selected = selection.kind === "workflow" && selection.id === item.id;
  return {
    id: item.id,
    label: item.label,
    selected,
    onSelect: () => onSelect({ kind: "workflow", id: item.id }),
    trailing: (
      <SidebarNavCountBadge count={item.count} badgeLabelClass={item.badgeLabelClass} />
    ),
  };
}

/**
 * Review Assigned sidebar — AceSidebar `variant="groups"`.
 * My Work always; Workflows only after cleared work produces destinations.
 */
export function ReviewAssignedSidebar({
  open,
  organizations,
  workCategories,
  workflowItems,
  selection,
  onSelectionChange,
  onOpenWorkLog,
  className,
}: ReviewAssignedSidebarProps) {
  const [selectedOrgId, setSelectedOrgId] = useState(organizations[0]?.id ?? "");
  const [myWorkExpanded, setMyWorkExpanded] = useState(true);
  const [workflowsExpanded, setWorkflowsExpanded] = useState(true);

  const groups = useMemo((): AceSidebarGroup[] => {
    const next: AceSidebarGroup[] = [
      {
        id: "my-work",
        label: "My Work",
        expanded: myWorkExpanded,
        onToggle: () => setMyWorkExpanded((value) => !value),
        items: workCategories.map((item) =>
          categoryToNavItem(item, selection, onSelectionChange),
        ),
      },
    ];

    if (workflowItems.length > 0) {
      next.push({
        id: "workflows",
        label: "Workflows",
        expanded: workflowsExpanded,
        onToggle: () => setWorkflowsExpanded((value) => !value),
        items: workflowItems.map((item) =>
          workflowToNavItem(item, selection, onSelectionChange),
        ),
      });
    }

    return next;
  }, [
    myWorkExpanded,
    workflowsExpanded,
    workCategories,
    workflowItems,
    selection,
    onSelectionChange,
  ]);

  const workLogTrigger = (
    <div className="inline-flex size-8 shrink-0 items-center justify-center leading-none">
      <AceTooltip>
        <AceTooltipTrigger asChild>
          <button
            type="button"
            aria-label="Work History"
            className={cn(screeningToolbarIconButtonClass, "leading-none")}
            onClick={() => onOpenWorkLog?.()}
          >
            <MaterialSymbol name="history" size="md" weight={300} className="text-current" />
          </button>
        </AceTooltipTrigger>
        <AceTooltipContent side="top" variant="screening-toolbar" hideArrow>
          Work History
        </AceTooltipContent>
      </AceTooltip>
    </div>
  );

  const onlineHelp = (
    <button
      type="button"
      className={cn(
        "flex w-full items-center gap-3 rounded-[var(--ace-sidebar-item-radius)] border-0 bg-transparent px-3 py-2 text-left",
        "text-[var(--ace-button-purple-400)] transition-colors",
        "hover:bg-[var(--ace-sidebar-item-selected-bg)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--screening-primary-ring)]",
        "focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--screening-primary-ring-offset)]",
      )}
    >
      <MaterialSymbol
        name="help"
        size="md"
        className="shrink-0 text-[var(--ace-button-purple-400)]"
      />
      <span
        className={cn(
          "[font:var(--ace-type-paragraph-p1-regular)] [letter-spacing:var(--ace-type-paragraph-p1-regular-tracking)]",
          "truncate text-sm text-[var(--ace-button-purple-400)]",
        )}
      >
        Online Help
      </span>
    </button>
  );

  return (
    <div className="h-full shrink-0">
      <AceSidebar
        open={open}
        variant="groups"
        organizations={[...organizations]}
        selectedOrganizationId={selectedOrgId}
        onOrganizationChange={setSelectedOrgId}
        groups={groups}
        showGroupAdd={false}
        headerTrailing={workLogTrigger}
        className={className ?? "h-full"}
      >
        <div className="mt-auto shrink-0 pb-4 pt-2">
          {onlineHelp}
        </div>
      </AceSidebar>
    </div>
  );
}

/** Convenience for building category rows with live / static counts by id. */
export function withWorkCounts(
  categories: readonly Omit<ReviewAssignedWorkCategory, "count">[],
  countsById: Record<string, number>,
): ReviewAssignedWorkCategory[] {
  return categories.map((item) => ({
    ...item,
    count: countsById[item.id] ?? 0,
  }));
}

/** @deprecated Prefer `withWorkCounts`. */
export function withSanctionCount(
  categories: readonly Omit<ReviewAssignedWorkCategory, "count">[],
  staticCounts: Record<string, number>,
  sanctionMatchCount: number,
  sanctionId = "sanction",
): ReviewAssignedWorkCategory[] {
  return withWorkCounts(categories, {
    ...staticCounts,
    [sanctionId]: sanctionMatchCount,
  });
}
