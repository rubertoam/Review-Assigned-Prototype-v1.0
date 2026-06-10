import { useMemo, useState } from "react";
import { AceSiteHeader } from "@ace-ds/components/organisms/AceSiteHeader/AceSiteHeader";
import {
  AceDropdownMenu,
  type AceDropdownMenuEntry,
} from "@ace-ds/components/molecules/AceDropdownMenu/AceDropdownMenu";
import { useTheme } from "../context/ThemeContext";
import { USER_FLOWS } from "../flows/flowTypes";
import { useUserFlow } from "../flows/FlowContext";
import { getProfileForUserFlow } from "../lib/profileAssets";
import { aceDropShadowXsClass } from "../lib/aceShadow";
import { aceTypography, ACE_TYPE } from "../lib/aceTypography";
import { cn } from "./ui/utils";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

function FlowSwitcher() {
  const { flowId, currentFlow, setFlowId } = useUserFlow();

  const flowMenuItems = useMemo(
    (): AceDropdownMenuEntry[] =>
      USER_FLOWS.map(
        (flow): AceDropdownMenuEntry => ({
          type: "item",
          id: flow.id,
          label: flow.label,
          selected: flow.id === flowId,
          onSelect: () => setFlowId(flow.id),
        }),
      ),
    [flowId, setFlowId],
  );

  return (
    <AceDropdownMenu
      triggerLabel={currentFlow.label}
      items={flowMenuItems}
      triggerMode="field"
      size="sm"
      align="start"
      panelWidth="default"
      className="w-auto min-w-0 max-w-[8.5rem]"
    />
  );
}

export function ReviewFlowSiteHeader() {
  const { isDark, setIsDark } = useTheme();
  const { flowId } = useUserFlow();
  const profile = getProfileForUserFlow(flowId);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  return (
    <div className="relative shrink-0">
      <AceSiteHeader
        userName={profile.greetingName}
        showNotifications
        showHelp
        showProfile
        profileImageUrl={profile.imageUrl}
        profileInitials={profile.initials}
        onProfileClick={() => setProfileMenuOpen(true)}
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 flex h-[var(--ace-site-header-height)] items-center justify-center gap-2">
        <span
          className={cn(
            aceTypography(ACE_TYPE.captionBold),
            "inline-flex items-center rounded-[var(--radius-sm)] bg-red-600 px-3 py-1 uppercase tracking-[0.12em] text-white",
            aceDropShadowXsClass,
          )}
        >
          UX Concept
        </span>
        <div className="pointer-events-auto">
          <FlowSwitcher />
        </div>
      </div>
      <DropdownMenu open={profileMenuOpen} onOpenChange={setProfileMenuOpen}>
        <DropdownMenuTrigger className="sr-only" tabIndex={-1} aria-hidden>
          Profile menu
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" variant="primary">
          <DropdownMenuLabel>Appearance</DropdownMenuLabel>
          <DropdownMenuCheckboxItem
            checked={isDark}
            onCheckedChange={(checked) => setIsDark(checked === true)}
          >
            Dark mode
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
