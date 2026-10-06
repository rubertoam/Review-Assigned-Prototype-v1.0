import { useEffect, useMemo, useState, type ReactNode } from "react";
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
  /** Application ID scope when multiple applications are selected. */
  applicationId?: string;
};

/** Application ID options for the sidebar header icon dropdown. */
export const REVIEW_SIDEBAR_APPLICATIONS = [
  { id: "isi", label: "ISI", code: "ISI" },
  { id: "isi-focus", label: "ISI Focus", code: "FOCUS" },
  { id: "watchlist-api", label: "Watchlist API", code: "WATCHLIST" },
  { id: "edd", label: "EDD", code: "EDD" },
] as const;

/** Profile / copy display: e.g. "ISI Focus (FOCUS)", "ISI (ISI)". */
export function formatReviewApplicationLabel(applicationId: string | undefined): string {
  const app =
    REVIEW_SIDEBAR_APPLICATIONS.find((a) => a.id === applicationId) ??
    REVIEW_SIDEBAR_APPLICATIONS[0]!;
  return `${app.label} (${app.code})`;
}

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

function workflowGroupKey(applicationId: string, groupId: string) {
  return `${applicationId}::${groupId}`;
}

/**
 * Workbench sidebar — AceSidebar `variant="groups"`.
 * Each workflow is a group; nested items are workflow steps with counts.
 * Group badge = sum of step counts.
 * Header: Group + Application ID icon dropdowns with selected names inline
 * (truncated). Application ID supports multi-select; multiple selections show
 * Application ID section headers above each workflow set.
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
  const [selectedApplicationIds, setSelectedApplicationIds] = useState<string[]>(() => {
    const first = REVIEW_SIDEBAR_APPLICATIONS[0]?.id;
    return first ? [first] : [];
  });
  const [expandedById, setExpandedById] = useState<Record<string, boolean>>({});

  const selectedApplications = useMemo(
    () =>
      REVIEW_SIDEBAR_APPLICATIONS.filter((app) =>
        selectedApplicationIds.includes(app.id),
      ),
    [selectedApplicationIds],
  );

  const showApplicationHeaders = selectedApplications.length > 1;

  useEffect(() => {
    if (selectedApplications.length === 0) return;
    const activeAppId = selection.applicationId;
    const appStillSelected =
      activeAppId != null &&
      selectedApplications.some((app) => app.id === activeAppId);
    if (appStillSelected) return;

    const fallbackApp = selectedApplications[0]!;
    const fallbackGroup =
      groups.find((group) => group.steps.some((step) => step.count > 0)) ?? groups[0];
    const fallbackStep =
      fallbackGroup?.steps.find((step) => step.count > 0) ?? fallbackGroup?.steps[0];
    if (!fallbackGroup || !fallbackStep) return;

    onSelectionChange({
      kind: "step",
      applicationId: fallbackApp.id,
      groupId: fallbackGroup.id,
      stepId: fallbackStep.id,
    });
  }, [selectedApplications, selection.applicationId, groups, onSelectionChange]);

  const aceGroups = useMemo((): AceSidebarGroup[] => {
    const buildWorkflowGroup = (
      applicationId: string,
      group: ReviewSidebarGroupCount,
    ): AceSidebarGroup => {
      const key = workflowGroupKey(applicationId, group.id);
      const selectedAppId = selection.applicationId ?? selectedApplicationIds[0];
      const isSelectedScope =
        !showApplicationHeaders || selectedAppId === applicationId;

      return {
        id: key,
        label: group.label,
        expanded:
          expandedById[key] ??
          (isSelectedScope && group.id === selection.groupId),
        onToggle: () =>
          setExpandedById((prev) => ({
            ...prev,
            [key]: !(
              prev[key] ??
              (isSelectedScope && group.id === selection.groupId)
            ),
          })),
        trailing: (
          <SidebarNavCountBadge
            count={group.count}
            badgeLabelClass={REVIEW_SIDEBAR_BADGE_CLASS}
          />
        ),
        items: group.steps.map((step) => ({
          id: `${key}:${step.id}`,
          label: step.label,
          selected:
            isSelectedScope &&
            selection.groupId === group.id &&
            selection.stepId === step.id,
          onSelect: () =>
            onSelectionChange({
              kind: "step",
              applicationId,
              groupId: group.id,
              stepId: step.id,
            }),
          trailing: (
            <SidebarNavCountBadge
              count={step.count}
              badgeLabelClass={REVIEW_SIDEBAR_BADGE_CLASS}
            />
          ),
        })),
      };
    };

    if (!showApplicationHeaders) {
      const soleAppId =
        selectedApplications[0]?.id ?? REVIEW_SIDEBAR_APPLICATIONS[0]?.id ?? "isi";
      return groups.map((group) => buildWorkflowGroup(soleAppId, group));
    }

    const next: AceSidebarGroup[] = [];
    for (const app of selectedApplications) {
      next.push({
        id: `section::${app.id}`,
        label: app.label,
        sectionHeader: true,
      });
      for (const group of groups) {
        next.push(buildWorkflowGroup(app.id, group));
      }
    }
    return next;
  }, [
    groups,
    expandedById,
    selection,
    onSelectionChange,
    selectedApplications,
    selectedApplicationIds,
    showApplicationHeaders,
  ]);

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
        selectedApplicationIds={selectedApplicationIds}
        onApplicationIdsChange={setSelectedApplicationIds}
        groups={aceGroups}
        emptyGroupMessage="No workflow steps in this group."
        headerTrailing={trailing}
        className={className ?? "h-full"}
      />
    </div>
  );
}
