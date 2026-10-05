import { useMemo, useState, type ReactNode } from "react";
import {
  AceSidebar,
  type AceSidebarGroup,
} from "@ace-ds/components/organisms/AceSidebar/AceSidebar";
import {
  AceTooltip,
  AceTooltipContent,
  AceTooltipTrigger,
} from "@ace-ds/components/atoms/AceTooltip/AceTooltip";
import { MaterialSymbol } from "@ace-ds/components/molecules/AceAccordion/MaterialSymbol";
import { sidebarIconButtonClass } from "@ace-ds/components/organisms/AceSidebar/sidebarRowActions";
import { SidebarNavCountBadge } from "./SidebarNavCountBadge";
import {
  REVIEW_SIDEBAR_BADGE_CLASS,
  type ReviewSidebarGroupCount,
} from "../lib/reviewSidebarGroups";
import { cn } from "./ui/utils";

export type ReviewAssignedSidebarSelection = {
  kind: "step";
  groupId: string;
  stepId: string;
};

/** Application ID options for the sidebar header icon dropdown. */
export const REVIEW_SIDEBAR_APPLICATIONS = [
  { id: "isi", label: "ISI" },
  { id: "isi-focus", label: "ISI Focus" },
  { id: "watchlist-api", label: "Watchlist API" },
  { id: "edd", label: "EDD" },
] as const;

export type ReviewAssignedSidebarProps = {
  open: boolean;
  organizations: readonly { id: string; label: string }[];
  groups: readonly ReviewSidebarGroupCount[];
  selection: ReviewAssignedSidebarSelection;
  onSelectionChange: (selection: ReviewAssignedSidebarSelection) => void;
  /** Opens the Search Client ID modal (icon to the right of the header icons). */
  onOpenClientIdSearch?: () => void;
  /** When true, search icon uses the selected/active treatment. */
  clientIdSearchActive?: boolean;
  /** Optional extra control to the right of the organization switcher (after search). */
  headerTrailing?: ReactNode;
  className?: string;
};

/**
 * Workbench sidebar — AceSidebar `variant="groups"`.
 * Each workflow is a group; nested items are workflow steps with counts.
 * Group badge = sum of step counts.
 * Header: Group + Application ID icon dropdowns (non-bordered), search trailing,
 * and a label under the icons showing the selected group · application ID.
 */
export function ReviewAssignedSidebar({
  open,
  organizations,
  groups,
  selection,
  onSelectionChange,
  onOpenClientIdSearch,
  clientIdSearchActive = false,
  headerTrailing,
  className,
}: ReviewAssignedSidebarProps) {
  const [selectedOrgId, setSelectedOrgId] = useState(organizations[0]?.id ?? "");
  const [selectedApplicationId, setSelectedApplicationId] = useState<string>(
    REVIEW_SIDEBAR_APPLICATIONS[0]?.id ?? "",
  );
  const [expandedById, setExpandedById] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const group of groups) {
      initial[group.id] = group.id === selection.groupId;
    }
    return initial;
  });

  const selectedOrgLabel =
    organizations.find((org) => org.id === selectedOrgId)?.label ??
    organizations[0]?.label ??
    "";
  const selectedApplicationLabel =
    REVIEW_SIDEBAR_APPLICATIONS.find((app) => app.id === selectedApplicationId)
      ?.label ??
    REVIEW_SIDEBAR_APPLICATIONS[0]?.label ??
    "";
  const selectionSummary =
    selectedOrgLabel && selectedApplicationLabel
      ? `Group: ${selectedOrgLabel} · Application: ${selectedApplicationLabel}`
      : selectedOrgLabel
        ? `Group: ${selectedOrgLabel}`
        : selectedApplicationLabel
          ? `Application: ${selectedApplicationLabel}`
          : "";

  const aceGroups = useMemo((): AceSidebarGroup[] => {
    return groups.map((group) => ({
      id: group.id,
      label: group.label,
      expanded: expandedById[group.id] ?? group.id === selection.groupId,
      onToggle: () =>
        setExpandedById((prev) => ({
          ...prev,
          [group.id]: !(prev[group.id] ?? group.id === selection.groupId),
        })),
      trailing: (
        <SidebarNavCountBadge
          count={group.count}
          badgeLabelClass={REVIEW_SIDEBAR_BADGE_CLASS}
        />
      ),
      items: group.steps.map((step) => ({
        id: `${group.id}:${step.id}`,
        label: step.label,
        selected: selection.groupId === group.id && selection.stepId === step.id,
        onSelect: () =>
          onSelectionChange({ kind: "step", groupId: group.id, stepId: step.id }),
        trailing: (
          <SidebarNavCountBadge
            count={step.count}
            badgeLabelClass={REVIEW_SIDEBAR_BADGE_CLASS}
          />
        ),
      })),
    }));
  }, [groups, expandedById, selection, onSelectionChange]);

  const searchButton =
    onOpenClientIdSearch != null ? (
      <AceTooltip>
        <AceTooltipTrigger asChild>
          <button
            type="button"
            aria-label="Search Client ID"
            aria-pressed={clientIdSearchActive}
            onClick={onOpenClientIdSearch}
            className={cn(
              sidebarIconButtonClass,
              clientIdSearchActive &&
                "border-[var(--ace-icon-button-border)] bg-[var(--ace-icon-button-hover-bg)] text-[var(--ace-icon-button-icon)]",
            )}
          >
            <MaterialSymbol name="search" size="md" className="text-current" />
          </button>
        </AceTooltipTrigger>
        <AceTooltipContent side="bottom" variant="screening-toolbar">
          Search Client ID
        </AceTooltipContent>
      </AceTooltip>
    ) : null;

  const trailing =
    searchButton != null || headerTrailing != null ? (
      <div className="inline-flex shrink-0 items-center gap-1">
        {searchButton}
        {headerTrailing}
      </div>
    ) : undefined;

  return (
    <div className="h-full shrink-0 overflow-hidden" data-coach-target="assignment">
      <AceSidebar
        open={open}
        variant="groups"
        showGroupAdd={false}
        organizations={[...organizations]}
        selectedOrganizationId={selectedOrgId}
        onOrganizationChange={setSelectedOrgId}
        organizationDisplay="icon"
        applications={[...REVIEW_SIDEBAR_APPLICATIONS]}
        selectedApplicationId={selectedApplicationId}
        onApplicationChange={setSelectedApplicationId}
        groups={aceGroups}
        emptyGroupMessage="No workflow steps in this group."
        headerTrailing={trailing}
        headerBelow={
          selectionSummary ? (
            <p
              className={cn(
                "m-0 truncate text-sm",
                "[font:var(--ace-type-paragraph-p1-regular)]",
                "[letter-spacing:var(--ace-type-paragraph-p1-regular-tracking)]",
              )}
              title={selectionSummary}
            >
              {selectedOrgLabel ? (
                <>
                  <span className="text-[var(--screening-text-muted)]">Group: </span>
                  <span className="text-[var(--screening-text-primary)]">
                    {selectedOrgLabel}
                  </span>
                </>
              ) : null}
              {selectedOrgLabel && selectedApplicationLabel ? (
                <span className="text-[var(--screening-text-muted)]"> · </span>
              ) : null}
              {selectedApplicationLabel ? (
                <>
                  <span className="text-[var(--screening-text-muted)]">
                    Application:{" "}
                  </span>
                  <span className="text-[var(--screening-text-primary)]">
                    {selectedApplicationLabel}
                  </span>
                </>
              ) : null}
            </p>
          ) : undefined
        }
        className={className ?? "h-full"}
      />
    </div>
  );
}
