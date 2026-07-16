import { aceTypography, ACE_TYPE } from "../lib/aceTypography";
import {
  useSidebarGroupActions,
  type SidebarGroupData,
} from "../lib/useSidebarGroupActions";
import { ReportingWorkspaceShell } from "./ReportingWorkspaceShell";
import { SidebarGroupActionModals } from "./SidebarGroupActionModals";
import { cn } from "./ui/utils";

const REPORT_LIBRARY_GROUPS: readonly SidebarGroupData[] = [
  {
    id: "saved",
    label: "Saved Configurations",
    expanded: false,
    items: [],
  },
  {
    id: "custom",
    label: "Custom Reports",
    expanded: false,
    items: [{ id: "custom-1", label: "Custom Report 1" }],
  },
  {
    id: "watchlist-screening",
    label: "Watchlist Screening",
    expanded: false,
    items: [
      { id: "wl-case-work", label: "Case Work Report" },
      { id: "wl-client-query", label: "Client Query Report" },
      { id: "wl-composition", label: "Composition Report" },
      { id: "wl-composition-export", label: "Composition Export by List Report" },
      { id: "wl-match-detail", label: "Match Detail Report" },
      { id: "wl-productivity", label: "Analyst Productivity Report" },
      { id: "wl-rules", label: "Rules Generating Results Report" },
      { id: "wl-screening-summary", label: "Screening Summary Report" },
      { id: "wl-load-summary", label: "Load Summary Report" },
      { id: "wl-open-age", label: "Open Matches by Age Report" },
    ],
  },
  {
    id: "data-quality",
    label: "Data Quality",
    expanded: false,
    items: [{ id: "dq-enhance", label: "FinScan Enhance Report" }],
  },
  {
    id: "administration",
    label: "Administration",
    expanded: false,
    items: [
      { id: "admin-status", label: "Status Distribution" },
      { id: "admin-referral", label: "Referral Resolution" },
      { id: "admin-overrides", label: "Client Overrides" },
      { id: "admin-users", label: "User Activity Report" },
      { id: "admin-audit", label: "Audit Trail Report" },
    ],
  },
  {
    id: "list-search",
    label: "List Search",
    expanded: false,
    items: [
      { id: "ls-classification", label: "Search Classification Summary Report" },
      { id: "ls-application", label: "Total Searches by Application Report" },
    ],
  },
];

export function ReportingReportLibraryPage() {
  const actions = useSidebarGroupActions(REPORT_LIBRARY_GROUPS, {
    contextLabel: "report category",
    initialSelectedItemId: "custom-1",
  });

  return (
    <ReportingWorkspaceShell
      title="Report Library"
      showNewGroupControl={false}
      sidebarGroups={actions.sidebarGroups}
      emptyGroupMessage="None."
      modals={
        <SidebarGroupActionModals
          groupForm={actions.groupForm}
          onGroupNameChange={(name) =>
            actions.setGroupForm((prev) => (prev ? { ...prev, draftName: name } : prev))
          }
          onToggleItemRemoval={(itemId) =>
            actions.setGroupForm((prev) =>
              prev
                ? {
                    ...prev,
                    items: prev.items.map((item) =>
                      item.id === itemId
                        ? { ...item, markedForRemoval: !item.markedForRemoval }
                        : item,
                    ),
                  }
                : prev,
            )
          }
          onCloseGroupForm={actions.closeGroupForm}
          onSubmitGroupForm={actions.submitGroupForm}
          groupFormPrimaryDisabled={actions.groupFormPrimaryDisabled}
          deleteTarget={actions.deleteTarget}
          deleteConfirmText={actions.deleteConfirmText}
          onDeleteConfirmTextChange={actions.setDeleteConfirmText}
          onCloseDelete={actions.closeDeleteModal}
          onConfirmDelete={actions.confirmDelete}
        />
      }
    >
      <div className="px-6 py-5">
        <h2
          className={cn(
            aceTypography(ACE_TYPE.p1Bold),
            "m-0 text-base text-[var(--screening-text-primary)]",
          )}
        >
          {actions.selectedItemLabel || "Report Name Goes Here..."}
        </h2>
      </div>
    </ReportingWorkspaceShell>
  );
}
