import type { FinScanProfileAvatar } from "@ace-ds/lib/finscanProfileAvatars";
import { AceSiteHeader } from "@ace-ds/components/organisms/AceSiteHeader/AceSiteHeader";
import { useTheme } from "../context/ThemeContext";
import { useUserFlow } from "../flows/FlowContext";
import { getProfileForUserFlow } from "../lib/profileAssets";
import { aceDropShadowXsClass } from "../lib/aceShadow";
import { aceTypography, ACE_TYPE } from "../lib/aceTypography";
import { cn } from "./ui/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuToggleItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

const captionBold =
  "[font:var(--ace-type-caption-bold)] [letter-spacing:var(--ace-type-caption-bold-tracking)]";

const profileTriggerClass = cn(
  "inline-flex shrink-0 cursor-pointer rounded-full p-1 transition-colors duration-[var(--ace-motion-duration-fast)]",
  "[transition-timing-function:var(--ace-motion-ease-standard)]",
  "hover:bg-[var(--ace-site-header-nav-hover)]",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--screening-primary-ring)]",
  "data-[state=open]:bg-[var(--ace-site-header-nav-hover)]",
);

function ProfileMenuDropdown({ profile }: { profile: FinScanProfileAvatar }) {
  const { isDark, setIsDark } = useTheme();

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button type="button" aria-label="User profile menu" className={profileTriggerClass}>
          {profile.imageUrl ? (
            <img
              src={profile.imageUrl}
              alt=""
              className="size-8 rounded-full object-cover"
            />
          ) : (
            <span
              className={cn(
                captionBold,
                "inline-flex size-8 items-center justify-center rounded-full bg-[var(--screening-surface-muted)] text-xs text-[var(--screening-text-primary)]",
              )}
            >
              {profile.initials}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={4}>
        <DropdownMenuLabel>Appearance</DropdownMenuLabel>
        <DropdownMenuToggleItem
          checked={isDark}
          onCheckedChange={(checked) => setIsDark(checked)}
        >
          Dark mode
        </DropdownMenuToggleItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function ReviewFlowSiteHeader() {
  const { flowId } = useUserFlow();
  const profile = getProfileForUserFlow(flowId);

  return (
    <div className="relative shrink-0">
      <AceSiteHeader
        userName={profile.greetingName}
        showNotifications
        showHelp
        showProfile={false}
        trailing={<ProfileMenuDropdown profile={profile} />}
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 flex h-[var(--ace-site-header-height)] items-center justify-center">
        <span
          className={cn(
            aceTypography(ACE_TYPE.captionBold),
            "inline-flex items-center rounded-[var(--radius-sm)] bg-red-600 px-3 py-1 uppercase tracking-[0.12em] text-white",
            aceDropShadowXsClass,
          )}
        >
          UX Concept
        </span>
      </div>
    </div>
  );
}
