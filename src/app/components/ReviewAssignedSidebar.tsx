import { useMemo, useState, type ReactNode } from "react";
import {
  AceSidebar,
  type AceSidebarNavItem,
} from "@ace-ds/components/organisms/AceSidebar/AceSidebar";
import { MaterialSymbol } from "@ace-ds/components/molecules/AceAccordion/MaterialSymbol";
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
  /** Cleared-work destinations — appended as flat nav items when present. */
  workflowItems: readonly ReviewSidebarWorkflowItem[];
  selection: ReviewAssignedSidebarSelection;
  onSelectionChange: (selection: ReviewAssignedSidebarSelection) => void;
  /** Optional control to the right of the organization switcher (e.g. search). */
  headerTrailing?: ReactNode;
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
 * Review Assigned sidebar — AceSidebar `variant="navigation"`.
 * Flat list of work queues (and workflow destinations when present).
 */
export function ReviewAssignedSidebar({
  open,
  organizations,
  workCategories,
  workflowItems,
  selection,
  onSelectionChange,
  headerTrailing,
  className,
}: ReviewAssignedSidebarProps) {
  const [selectedOrgId, setSelectedOrgId] = useState(organizations[0]?.id ?? "");

  const navItems = useMemo((): AceSidebarNavItem[] => {
    return [
      ...workCategories.map((item) =>
        categoryToNavItem(item, selection, onSelectionChange),
      ),
      ...workflowItems.map((item) =>
        workflowToNavItem(item, selection, onSelectionChange),
      ),
    ];
  }, [workCategories, workflowItems, selection, onSelectionChange]);

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
    <div className="h-full shrink-0" data-coach-target="assignment">
      <AceSidebar
        open={open}
        variant="navigation"
        organizations={[...organizations]}
        selectedOrganizationId={selectedOrgId}
        onOrganizationChange={setSelectedOrgId}
        navItems={navItems}
        headerTrailing={headerTrailing}
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
