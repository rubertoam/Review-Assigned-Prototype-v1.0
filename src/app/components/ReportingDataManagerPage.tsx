import { aceTypography, ACE_TYPE } from "../lib/aceTypography";
import {
  useSidebarGroupActions,
  type SidebarGroupData,
} from "../lib/useSidebarGroupActions";
import { ReportingWorkspaceShell } from "./ReportingWorkspaceShell";
import { SidebarGroupActionModals } from "./SidebarGroupActionModals";
import { cn } from "./ui/utils";

const DATA_MANAGER_GROUPS: readonly SidebarGroupData[] = [
  {
    id: "jobs",
    label: "Jobs",
    expanded: false,
    items: [
      { id: "active-jobs", label: "Active Jobs (12)" },
      { id: "scheduled-jobs", label: "Scheduled Jobs (4)" },
      { id: "configurations", label: "Configurations (8)" },
      { id: "extraction-history", label: "Extraction History" },
    ],
  },
  {
    id: "quick-actions",
    label: "Quick Actions",
    expanded: false,
    items: [
      { id: "schedule-job", label: "Schedule New Job" },
      { id: "create-config", label: "Create New Configuration" },
      { id: "export-data", label: "Export Data" },
      { id: "import-data", label: "Import Data" },
    ],
  },
];

export function ReportingDataManagerPage() {
  const actions = useSidebarGroupActions(DATA_MANAGER_GROUPS, {
    contextLabel: "data manager group",
    initialSelectedItemId: "active-jobs",
  });

  return (
    <ReportingWorkspaceShell
      title="Data Manager"
      showNewGroupControl={false}
      sidebarGroups={actions.sidebarGroups}
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
          {actions.selectedItemLabel.replace(/\s*\(\d+\)\s*$/, "") || "Active Jobs"}
        </h2>
      </div>
    </ReportingWorkspaceShell>
  );
}
