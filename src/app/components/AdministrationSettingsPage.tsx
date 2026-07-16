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

const ADMINISTRATION_GROUPS: readonly SidebarGroupData[] = [
  {
    id: "list-management",
    label: "List Management",
    expanded: false,
    items: [
      { id: "list-definitions", label: "List Definitions" },
      { id: "categories", label: "Categories" },
      { id: "change-rules", label: "Change Rules" },
    ],
  },
  {
    id: "load-summaries",
    label: "Load Summaries",
    expanded: false,
    items: [
      { id: "clients", label: "Clients" },
      { id: "lists", label: "Lists" },
      { id: "screening-results", label: "Screening Results" },
    ],
  },
  {
    id: "system",
    label: "System",
    expanded: false,
    items: [
      { id: "event-log", label: "Event Log" },
      { id: "system-activity", label: "System Activity" },
      { id: "settings", label: "Settings" },
      { id: "administrators", label: "Administrators" },
      { id: "process-manager", label: "Process Manager" },
      { id: "license-keys", label: "License Keys" },
      { id: "application-change-rules", label: "Application Change Rules" },
    ],
  },
  {
    id: "provider-credentials",
    label: "Provider Credentials",
    expanded: false,
    items: [
      { id: "media", label: "Media" },
      { id: "verify", label: "Verify" },
      { id: "validate", label: "Validate" },
    ],
  },
  {
    id: "processing",
    label: "Processing",
    expanded: false,
    items: [
      { id: "list-processing", label: "List Processing" },
      { id: "ip-maintenance", label: "IP Maintenance" },
    ],
  },
];

export function AdministrationSettingsPage() {
  const { openAllSettings } = useUserFlow();
  const actions = useSidebarGroupActions(ADMINISTRATION_GROUPS, {
    contextLabel: "settings group",
    initialSelectedItemId: "list-definitions",
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
                Administration
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
          {actions.selectedItemLabel || "Page Title Goes Here..."}
        </h2>
      </div>
    </SettingsWorkspaceShell>
  );
}
