import type { FinScanProfileAvatar } from "@ace-ds/lib/finscanProfileAvatars";
import { AceSiteHeader } from "@ace-ds/components/organisms/AceSiteHeader/AceSiteHeader";
import { MaterialSymbol } from "@ace-ds/components/molecules/AceAccordion/MaterialSymbol";
import { aceChevronIconClass } from "@ace-ds/lib/aceChevron";
import { useTheme } from "../context/ThemeContext";
import { useUserFlow } from "../flows/FlowContext";
import { getProfileForUserFlow } from "../lib/profileAssets";
import { aceDropShadowXsClass } from "../lib/aceShadow";
import { aceIconButtonHoverClass } from "../lib/aceIconButton";
import { aceTypography, ACE_TYPE } from "../lib/aceTypography";
import { cn } from "./ui/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuToggleItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

const captionBold =
  "[font:var(--ace-type-caption-bold)] [letter-spacing:var(--ace-type-caption-bold-tracking)]";
const p1 =
  "[font:var(--ace-type-paragraph-p1-regular)] [letter-spacing:var(--ace-type-paragraph-p1-regular-tracking)]";
const motionEase = "[transition-timing-function:var(--ace-motion-ease-standard)]";

export type ProductNavId = "watchlist" | "payments" | "kyc" | "reporting";

const PRODUCT_NAV: readonly {
  id: ProductNavId;
  label: string;
  accent: string;
}[] = [
  { id: "watchlist", label: "Watchlist", accent: "var(--ace-button-purple-500)" },
  { id: "payments", label: "Payments", accent: "var(--ace-secondary-enlighten-violet-500)" },
  { id: "kyc", label: "KYC", accent: "var(--ace-finscan-mark-blue)" },
  { id: "reporting", label: "Reporting", accent: "var(--ace-secondary-teal-500)" },
];

const WATCHLIST_FEATURE_ITEMS = [
  "Assigned Cases",
  "Case Browser",
  "Name/Address List Search",
  "Specific Element List Search",
  "QuickScan",
  "Search Audit Logs",
  "User Defined List Editor",
  "Match Simulation",
] as const;

const PAYMENTS_FEATURE_ITEMS = [
  "Assigned Transactions",
  "Payments Browser",
  "Safe List Search",
  "Payments Management",
] as const;

const KYC_FEATURE_ITEMS = [
  "Client Search",
  "Media Search",
  "Verify Search",
  "Validate Search",
  "Add Client",
  "Upload Client File",
] as const;

const REPORTING_FEATURE_ITEMS = [
  "Dashboard",
  "Report Library",
  "Data Manager",
] as const;

const SECTION_ITEMS = ["Reports", "Dashboards"] as const;

const navTriggerClass = cn(
  p1,
  "relative inline-flex h-full min-h-[2.5rem] items-center gap-2 rounded-[var(--radius-sm)] px-3 py-3 text-sm text-[var(--screening-text-primary)]",
  "transition-colors duration-[var(--ace-motion-duration-fast)]",
  motionEase,
  "hover:bg-[var(--ace-site-header-nav-hover)]",
  "data-[state=open]:bg-[var(--ace-site-header-nav-hover)]",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--screening-primary-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--screening-primary-ring-offset)]",
);

const profileTriggerClass = cn(
  "inline-flex shrink-0 cursor-pointer rounded-full p-1 transition-colors duration-[var(--ace-motion-duration-fast)]",
  motionEase,
  "hover:bg-[var(--ace-site-header-nav-hover)]",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--screening-primary-ring)]",
  "data-[state=open]:bg-[var(--ace-site-header-nav-hover)]",
);

const menuItemClass = cn(
  "cursor-pointer rounded-[var(--radius-sm)] px-3 py-2",
  "text-[var(--screening-text-primary)]",
  "data-[highlighted]:bg-[var(--ace-dropdown-menu-row-hover)]",
);

const menuSelectedClass = cn(
  menuItemClass,
  "bg-[var(--screening-primary-soft-bg)] data-[highlighted]:bg-[var(--screening-primary-soft-bg)]",
);

const dashedSeparatorClass =
  "my-2 h-0 bg-transparent border-t border-dashed border-[var(--screening-border-row)]";

function ToolbarIconButton({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button type="button" aria-label={label} className={aceIconButtonHoverClass}>
      {children}
    </button>
  );
}

const SETTINGS_MENU_ITEMS = [
  "Organization",
  "Payments Management",
  "Administration",
  "Screening Settings",
  "Focus Health",
  "Database Connections",
  "Common Configurations",
  "Batch Job Settings",
  "Risk Score Evaluator",
  "KYC Configurations",
  "Enhance Discover Configurations",
  "MTV Settings, Rules, Processes",
] as const;

function SettingsMenuDropdown() {
  const {
    appView,
    openAllSettings,
    openOrganizationSettings,
    openPaymentsManagement,
    openAdministrationSettings,
  } = useUserFlow();
  const onAllSettings = appView === "all-settings";
  const onOrganization = appView === "organization-settings";
  const onPaymentsManagement = appView === "payments-management";
  const onAdministration = appView === "administration-settings";

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button type="button" aria-label="Settings" className={aceIconButtonHoverClass}>
          <MaterialSymbol
            name="tune"
            size="xl"
            className="text-[var(--ace-site-header-toolbar-icon-color)]"
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={4}
        className="min-w-[16.5rem] max-w-[20rem] p-1"
      >
        <DropdownMenuItem
          className={cn(
            menuItemClass,
            onAllSettings &&
              "bg-[var(--screening-primary-soft-bg)] text-[var(--ace-button-purple-500)] data-[highlighted]:bg-[var(--screening-primary-soft-bg)] data-[highlighted]:text-[var(--ace-button-purple-500)]",
          )}
          onSelect={() => openAllSettings()}
        >
          All Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator className={dashedSeparatorClass} />
        {SETTINGS_MENU_ITEMS.map((item) => (
          <DropdownMenuItem
            key={item}
            className={cn(
              menuItemClass,
              ((item === "Organization" && onOrganization) ||
                (item === "Payments Management" && onPaymentsManagement) ||
                (item === "Administration" && onAdministration)) &&
                "bg-[var(--screening-primary-soft-bg)] text-[var(--ace-button-purple-500)] data-[highlighted]:bg-[var(--screening-primary-soft-bg)] data-[highlighted]:text-[var(--ace-button-purple-500)]",
            )}
            onSelect={() => {
              if (item === "Organization") openOrganizationSettings();
              if (item === "Payments Management") openPaymentsManagement();
              if (item === "Administration") openAdministrationSettings();
            }}
          >
            {item}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ProfileMenuDropdown({ profile }: { profile: FinScanProfileAvatar }) {
  const { isDark, setIsDark } = useTheme();

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="User profile menu"
          className={profileTriggerClass}
          data-coach-target="dark-mode"
        >
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
      <DropdownMenuContent align="end" sideOffset={4} className="min-w-[12rem]">
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

function HeaderTrailingActions({ profile }: { profile: FinScanProfileAvatar }) {
  return (
    <div className="flex items-center gap-[var(--ace-site-header-toolbar-gap)] overflow-visible py-1">
      {/* Settings / product landings hidden until those screens are ready to share. */}
      <ToolbarIconButton label="Notifications">
        <MaterialSymbol name="notifications" size="md" />
      </ToolbarIconButton>
      <ToolbarIconButton label="Help">
        <MaterialSymbol name="help" size="md" />
      </ToolbarIconButton>
      <ProfileMenuDropdown profile={profile} />
    </div>
  );
}

function ProductAccent({ color }: { color: string }) {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-x-3 bottom-0 h-[3px] rounded-full"
      style={{ backgroundColor: color }}
    />
  );
}

function WatchlistNavMenu({
  selected,
  accent,
  activeItem,
  onOverviewSelect,
  onAssignedCasesSelect,
}: {
  selected: boolean;
  accent: string;
  activeItem: "overview" | "assigned-cases" | null;
  onOverviewSelect: () => void;
  onAssignedCasesSelect: () => void;
}) {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-current={selected ? "page" : undefined}
          className={navTriggerClass}
        >
          <span>Watchlist</span>
          <MaterialSymbol name="keyboard_arrow_down" className={aceChevronIconClass} />
          {selected ? <ProductAccent color={accent} /> : null}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" sideOffset={4} className="min-w-[16.5rem] p-2">
        <DropdownMenuItem
          className={activeItem === "overview" ? menuSelectedClass : menuItemClass}
          onSelect={onOverviewSelect}
        >
          Overview
        </DropdownMenuItem>

        <DropdownMenuSeparator className={dashedSeparatorClass} />

        {WATCHLIST_FEATURE_ITEMS.map((label) => {
          const isAssignedCases = label === "Assigned Cases";
          const isSelected = isAssignedCases && activeItem === "assigned-cases";
          return (
            <DropdownMenuItem
              key={label}
              className={isSelected ? menuSelectedClass : menuItemClass}
              onSelect={isAssignedCases ? onAssignedCasesSelect : undefined}
            >
              {label}
            </DropdownMenuItem>
          );
        })}

        <DropdownMenuSeparator className={dashedSeparatorClass} />

        {SECTION_ITEMS.map((label) => (
          <DropdownMenuItem key={label} className={menuItemClass}>
            <span className="min-w-0 flex-1 truncate">{label}</span>
            <MaterialSymbol
              name="chevron_right"
              size="md"
              className={cn(aceChevronIconClass, "ml-auto text-[var(--ace-dropdown-menu-primary)]")}
            />
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ProductLandingNavMenu({
  label,
  selected,
  accent,
  activeItem,
  featureItems,
  onOverviewSelect,
  onFeatureSelect,
  activeFeature,
  showOverview = true,
  showSections = true,
}: {
  label: string;
  selected: boolean;
  accent: string;
  activeItem: "overview" | null;
  featureItems: readonly string[];
  onOverviewSelect: () => void;
  onFeatureSelect?: (feature: string) => void;
  activeFeature?: string | null;
  showOverview?: boolean;
  showSections?: boolean;
}) {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-current={selected ? "page" : undefined}
          className={navTriggerClass}
        >
          <span>{label}</span>
          <MaterialSymbol name="keyboard_arrow_down" className={aceChevronIconClass} />
          {selected ? <ProductAccent color={accent} /> : null}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" sideOffset={4} className="min-w-[16.5rem] p-2">
        {showOverview ? (
          <>
            <DropdownMenuItem
              className={activeItem === "overview" ? menuSelectedClass : menuItemClass}
              onSelect={onOverviewSelect}
            >
              Overview
            </DropdownMenuItem>
            <DropdownMenuSeparator className={dashedSeparatorClass} />
          </>
        ) : null}

        {featureItems.map((itemLabel) => {
          const isActive = activeFeature === itemLabel;
          return (
            <DropdownMenuItem
              key={itemLabel}
              className={isActive ? menuSelectedClass : menuItemClass}
              onSelect={
                onFeatureSelect
                  ? () => onFeatureSelect(itemLabel)
                  : itemLabel === featureItems[0]
                    ? onOverviewSelect
                    : undefined
              }
            >
              {itemLabel}
            </DropdownMenuItem>
          );
        })}

        {showSections ? (
          <>
            <DropdownMenuSeparator className={dashedSeparatorClass} />
            {SECTION_ITEMS.map((sectionLabel) => (
              <DropdownMenuItem key={sectionLabel} className={menuItemClass}>
                <span className="min-w-0 flex-1 truncate">{sectionLabel}</span>
                <MaterialSymbol
                  name="chevron_right"
                  size="md"
                  className={cn(aceChevronIconClass, "ml-auto text-[var(--ace-dropdown-menu-primary)]")}
                />
              </DropdownMenuItem>
            ))}
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ProductNav({ activeId }: { activeId: ProductNavId }) {
  const {
    appView,
    landingProduct,
    openWatchlistLanding,
    openPaymentsLanding,
    openKycLanding,
    openReportingLanding,
    openReportingDashboard,
    openReportingReportLibrary,
    openReportingDataManager,
    openReviewAssigned,
  } = useUserFlow();
  const watchlistActiveItem =
    appView === "review"
      ? "assigned-cases"
      : landingProduct === "watchlist"
        ? "overview"
        : null;
  const paymentsActiveItem =
    appView === "landing" && landingProduct === "payments" ? "overview" : null;
  const kycActiveItem = appView === "landing" && landingProduct === "kyc" ? "overview" : null;
  const reportingActiveFeature =
    appView === "reporting-dashboard"
      ? "Dashboard"
      : appView === "reporting-report-library"
        ? "Report Library"
        : appView === "reporting-data-manager"
          ? "Data Manager"
          : null;

  return (
    <nav className="flex h-full min-w-0 items-center" aria-label="Product navigation">
      {PRODUCT_NAV.map((item) => {
        const selected = item.id === activeId;

        if (item.id === "watchlist") {
          return (
            <WatchlistNavMenu
              key={item.id}
              selected={selected}
              accent={item.accent}
              activeItem={watchlistActiveItem}
              onOverviewSelect={openWatchlistLanding}
              onAssignedCasesSelect={openReviewAssigned}
            />
          );
        }

        if (item.id === "payments") {
          return (
            <ProductLandingNavMenu
              key={item.id}
              label="Payments"
              selected={selected}
              accent={item.accent}
              activeItem={paymentsActiveItem}
              featureItems={PAYMENTS_FEATURE_ITEMS}
              onOverviewSelect={openPaymentsLanding}
            />
          );
        }

        if (item.id === "kyc") {
          return (
            <ProductLandingNavMenu
              key={item.id}
              label="KYC"
              selected={selected}
              accent={item.accent}
              activeItem={kycActiveItem}
              featureItems={KYC_FEATURE_ITEMS}
              onOverviewSelect={openKycLanding}
            />
          );
        }

        if (item.id === "reporting") {
          return (
            <ProductLandingNavMenu
              key={item.id}
              label="Reporting"
              selected={selected}
              accent={item.accent}
              activeItem={null}
              featureItems={REPORTING_FEATURE_ITEMS}
              onOverviewSelect={openReportingLanding}
              activeFeature={reportingActiveFeature}
              onFeatureSelect={(feature) => {
                if (feature === "Dashboard") openReportingDashboard();
                else if (feature === "Report Library") openReportingReportLibrary();
                else if (feature === "Data Manager") openReportingDataManager();
                else openReportingLanding();
              }}
              showOverview={false}
              showSections={false}
            />
          );
        }

        return null;
      })}
    </nav>
  );
}

export function ReviewFlowSiteHeader({
  activeProduct: _activeProduct,
}: {
  activeProduct?: ProductNavId;
} = {}) {
  const { flowId } = useUserFlow();
  const profile = getProfileForUserFlow(flowId);

  return (
    <div className="relative shrink-0">
      <AceSiteHeader
        userName={profile.greetingName}
        showNotifications={false}
        showHelp={false}
        showProfile={false}
        trailing={<HeaderTrailingActions profile={profile} />}
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 flex h-[var(--ace-site-header-height)] items-center justify-center">
        <span
          className={cn(
            aceTypography(ACE_TYPE.captionBold),
            "inline-flex items-center rounded-[var(--radius-sm)] bg-red-600 px-3 py-1 uppercase tracking-[0.12em] text-white",
            aceDropShadowXsClass,
          )}
        >
          UX Prototype
        </span>
      </div>
    </div>
  );
}
