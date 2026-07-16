import { MaterialSymbol } from "@ace-ds/components/molecules/AceAccordion/MaterialSymbol";
import { useUserFlow } from "../flows/FlowContext";
import { aceTypography, ACE_TYPE } from "../lib/aceTypography";
import {
  useSidebarGroupActions,
  type SidebarGroupData,
} from "../lib/useSidebarGroupActions";
import { SettingsWorkspaceShell } from "./SettingsWorkspaceShell";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./ui/breadcrumb";
import { cn } from "./ui/utils";

const ORGANIZATION_GROUPS: readonly SidebarGroupData[] = [
  {
    id: "general",
    label: "General Settings",
    expanded: false,
    items: [
      { id: "user-management", label: "User Management" },
      { id: "users", label: "Users" },
      { id: "groups", label: "Groups" },
      { id: "rights", label: "Rights" },
    ],
  },
  { id: "notifications", label: "Notifications", expanded: false, items: [] },
  { id: "lists", label: "Lists", expanded: false, items: [] },
  {
    id: "client-data",
    label: "Client Data Settings",
    expanded: false,
    items: [
      { id: "applications", label: "Applications" },
      { id: "compliance-search-rules", label: "Compliance Search Rules" },
      { id: "user-fields", label: "User Fields" },
    ],
  },
  {
    id: "watchlist-rules",
    label: "Watchlist Screening Rules",
    expanded: false,
    items: [],
  },
  {
    id: "review",
    label: "Review Settings",
    expanded: false,
    items: [
      { id: "statuses", label: "Statuses" },
      { id: "quick-clear", label: "Quick Clear" },
      { id: "review-target", label: "Review Target" },
    ],
  },
  {
    id: "advanced",
    label: "Advanced Settings",
    expanded: false,
    items: [{ id: "sftp", label: "SFTP Credential Sets" }],
  },
];

export function OrganizationSettingsPage() {
  const { openAllSettings } = useUserFlow();
  const actions = useSidebarGroupActions(ORGANIZATION_GROUPS, {
    contextLabel: "settings group",
    initialSelectedItemId: "user-management",
    enableGroupMenus: false,
    showItemCounts: false,
  });

  return (
    <SettingsWorkspaceShell
      sidebarGroups={actions.sidebarGroups}
      headerStart={
        <Breadcrumb>
          <BreadcrumbList className="gap-2 text-[var(--screening-text-primary)] sm:gap-2">
            <BreadcrumbItem>
              <BreadcrumbLink
                asChild
                className="inline-flex items-center text-[var(--ace-button-purple-500)] hover:text-[var(--ace-button-purple-500)]"
              >
                <button type="button" onClick={openAllSettings} aria-label="All Settings">
                  <MaterialSymbol name="tune" size="md" />
                </button>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-[var(--screening-text-muted)]" />
            <BreadcrumbItem>
              <BreadcrumbPage
                className={cn(
                  aceTypography(ACE_TYPE.h6Bold),
                  "text-base text-[var(--screening-text-primary)]",
                )}
              >
                Organization
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      }
    >
      <div className="px-6 py-5">
        <h2
          className={cn(
            aceTypography(ACE_TYPE.p1Bold),
            "m-0 text-base text-[var(--screening-text-primary)]",
          )}
        >
          {actions.selectedItemLabel || "User Management"}
        </h2>
      </div>
    </SettingsWorkspaceShell>
  );
}
