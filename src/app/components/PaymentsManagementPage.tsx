import { useState } from "react";
import { aceTypography, ACE_TYPE } from "../lib/aceTypography";
import {
  useSidebarGroupActions,
  type SidebarGroupData,
} from "../lib/useSidebarGroupActions";
import { SettingsWorkspaceShell } from "./SettingsWorkspaceShell";
import { cn } from "./ui/utils";

const PAYMENTS_MANAGEMENT_GROUPS: readonly SidebarGroupData[] = [
  {
    id: "general",
    label: "General Settings",
    expanded: false,
    items: [
      { id: "applications", label: "Applications" },
      { id: "list-sets", label: "List Sets" },
      { id: "node-sets", label: "Node Sets" },
      { id: "trusted-accounts", label: "Trusted Account Numbers" },
      { id: "trusted-bics", label: "Trusted BICs" },
      { id: "external-support", label: "External Support Files" },
    ],
  },
  {
    id: "payment-systems",
    label: "Payment Systems",
    expanded: false,
    items: [
      { id: "field-mappings", label: "Field Mappings" },
      { id: "name-screening", label: "Name Screening" },
    ],
  },
  {
    id: "screening-rules",
    label: "Screening Rules",
    expanded: false,
    items: [
      { id: "group-assignment", label: "Group Assignment" },
      { id: "rules", label: "Rules" },
      { id: "expressions", label: "Expressions" },
    ],
  },
];

export function PaymentsManagementPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const actions = useSidebarGroupActions(PAYMENTS_MANAGEMENT_GROUPS, {
    contextLabel: "settings group",
    initialSelectedItemId: "rules",
    enableGroupMenus: false,
    showItemCounts: false,
  });

  return (
    <SettingsWorkspaceShell
      activeProduct="payments"
      showSidebarToggle
      sidebarOpen={sidebarOpen}
      onSidebarOpenChange={setSidebarOpen}
      sidebarGroups={actions.sidebarGroups}
      headerStart={
        <h1
          className={cn(
            aceTypography(ACE_TYPE.h6Bold),
            "m-0 text-base leading-[1.65] text-[var(--screening-text-primary)]",
          )}
        >
          Payments Management
        </h1>
      }
    >
      <div className="px-6 py-5">
        <h2
          className={cn(
            aceTypography(ACE_TYPE.p1Bold),
            "m-0 text-base text-[var(--screening-text-primary)]",
          )}
        >
          {actions.selectedItemLabel || "Page Title Goes Here..."}
        </h2>
      </div>
    </SettingsWorkspaceShell>
  );
}
