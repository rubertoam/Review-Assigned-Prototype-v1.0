import { useMemo, useState } from "react";
import {
  AceSidebar,
  type AceSidebarGroup,
  type AceSidebarNavItem,
} from "@ace-ds/components/organisms/AceSidebar/AceSidebar";
import { SidebarNavCountBadge } from "./SidebarNavCountBadge";
import type { ReviewSidebarWorkflowItem } from "../lib/reviewSidebarWorkflows";

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
        className={className ?? "h-full"}
      />
    </div>
  );
}

/** Convenience for building category rows with a live sanction count. */
export function withSanctionCount(
  categories: readonly Omit<ReviewAssignedWorkCategory, "count">[],
  staticCounts: Record<string, number>,
  sanctionMatchCount: number,
  sanctionId = "sanction",
): ReviewAssignedWorkCategory[] {
  return categories.map((item) => ({
    ...item,
    count: item.id === sanctionId ? sanctionMatchCount : (staticCounts[item.id] ?? 0),
  }));
}
