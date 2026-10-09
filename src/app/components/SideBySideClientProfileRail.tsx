/**
 * Side-by-side experiment: client profile in the left scrollable list chrome.
 */
import { useState } from "react";
import { AceBadge } from "@ace-ds/components/atoms/AceBadge/AceBadge";
import {
  AceTooltip,
  AceTooltipContent,
  AceTooltipTrigger,
} from "@ace-ds/components/atoms/AceTooltip/AceTooltip";
import { MaterialSymbol } from "@ace-ds/components/molecules/AceAccordion/MaterialSymbol";
import { sidebarIconButtonClass } from "@ace-ds/components/organisms/AceSidebar/sidebarRowActions";
import {
  CLIENT_PROFILE_ACTIONS,
  type ClientProfileActionId,
} from "../lib/clientProfileActions";
import {
  CLIENT_PROFILE_PASSTHROUGH_PLACEHOLDER,
  clientProfileCommentForCase,
} from "../lib/clientProfileCommentData";
import { aceDropShadowXsClass } from "../lib/aceShadow";
import { aceTypography, ACE_TYPE } from "../lib/aceTypography";
import {
  caseActionsMenuContentClass,
  caseActionsMenuIconClass,
  caseActionsMenuItemClass,
  caseActionsMenuTriggerClass,
} from "../lib/caseActionsMenuStyles";
import {
  clientProfileForCaseIndex,
  riskBandPresentation,
  type ClientIdSeries,
} from "../lib/reviewCaseData";
import {
  ClientProfileAccordionHeaderTags,
  ClientProfileActiveIndicator,
  ClientProfileClientIdRow,
  ClientProfileNameRow,
  ClientProfileOverdueBadge,
  ClientProfileRiskTag,
  ClientProfileStatusRow,
} from "./ClientProfileHeaderBadges";
import { ClientProfileAddressSection } from "./ClientProfileAddressSection";
import { ClientProfileCopyablePanel } from "./ClientProfileCopyablePanel";
import { ClientProfileMetaLine } from "./ClientProfileMetaLine";
import { ClientProfileTruncatedField } from "./ClientProfileTruncatedField";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { cn } from "./ui/utils";

type SideBySideClientProfileRailProps = {
  caseName: string;
  caseIndex: number;
  isEntity?: boolean;
  clientIdSeries?: ClientIdSeries;
  applicationLabel: string;
  readOnly?: boolean;
  onOpenClientProfileAction?: (action: ClientProfileActionId) => void;
  /** When false, parent renders the section label (aligned with Match Alerts). */
  showSectionLabel?: boolean;
  /** Notify parent when the rail collapses so shared label width can track. */
  onMinimizedChange?: (minimized: boolean) => void;
};

export function SideBySideClientProfileRail({
  caseName,
  caseIndex,
  isEntity = false,
  clientIdSeries = 1,
  applicationLabel,
  readOnly = false,
  onOpenClientProfileAction,
  showSectionLabel = true,
  onMinimizedChange,
}: SideBySideClientProfileRailProps) {
  const [minimized, setMinimized] = useState(false);
  const setMinimizedAndNotify = (next: boolean) => {
    setMinimized(next);
    onMinimizedChange?.(next);
  };
  const profile = clientProfileForCaseIndex(caseIndex, clientIdSeries, {
    name: caseName,
    isEntity,
  });
  const profileComment = clientProfileCommentForCase(caseIndex);
  const profilePassthrough = CLIENT_PROFILE_PASSTHROUGH_PLACEHOLDER;
  const riskLabel = riskBandPresentation(profile.riskBand).label;

  return (
    <div
      data-coach-target="client-profile"
      className={cn(
        "flex h-full min-h-0 flex-col",
        showSectionLabel && "gap-2",
        "transition-[width] duration-200 ease-out",
        minimized ? "w-10" : "w-[21.6rem] lg:w-96",
      )}
    >
      {showSectionLabel ? (
        <p
          className={cn(
            "m-0 shrink-0 font-['Noto_Sans:Bold',sans-serif] text-[14px] font-bold leading-[1.65] text-[var(--screening-text-primary)]",
            minimized && "invisible",
          )}
          style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100" }}
          aria-hidden={minimized}
        >
          Client Profile
        </p>
      ) : null}

      <div
        className={cn(
          "flex min-h-0 flex-1 flex-col overflow-hidden rounded-[var(--radius-sm)] border border-[var(--screening-border-strong)] bg-[var(--screening-surface)]",
          aceDropShadowXsClass,
        )}
      >
        {minimized ? (
          <div className="flex h-full min-h-0 flex-col items-center gap-3 px-1 pb-3 pt-3">
            <AceTooltip>
              <AceTooltipTrigger asChild>
                <button
                  type="button"
                  aria-expanded={false}
                  aria-label="Expand client profile"
                  className={sidebarIconButtonClass}
                  onClick={() => setMinimizedAndNotify(false)}
                >
                  <MaterialSymbol
                    name="keyboard_arrow_right"
                    size="md"
                    className="text-current"
                  />
                </button>
              </AceTooltipTrigger>
              <AceTooltipContent side="right" variant="screening-toolbar" hideArrow>
                Expand client profile
              </AceTooltipContent>
            </AceTooltip>

            <ClientProfileActiveIndicator />

            <span
              className="max-h-[35%] truncate font-['Noto_Sans:Bold',sans-serif] text-[12px] font-bold leading-none tracking-[0.02em] text-[var(--screening-text-primary)] [writing-mode:vertical-lr]"
              style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100" }}
              title={caseName}
            >
              {caseName}
            </span>

            <div className="flex min-h-0 flex-1 flex-col items-center gap-2 overflow-x-hidden overflow-y-auto pb-1">
              <div className="shrink-0 [writing-mode:vertical-lr]">
                <AceBadge appearance="tag" variant="purple">
                  {`Client ID · ${profile.clientId}`}
                </AceBadge>
              </div>
              <div className="shrink-0 [writing-mode:vertical-lr]">
                <ClientProfileRiskTag
                  riskBand={profile.riskBand}
                  onClick={
                    readOnly ? undefined : () => onOpenClientProfileAction?.("risk-rating")
                  }
                />
              </div>
              {profile.reviewTargetOverdue ? (
                <div className="shrink-0 [writing-mode:vertical-lr]">
                  <ClientProfileOverdueBadge />
                </div>
              ) : null}
            </div>
            <span className="sr-only">
              {caseName}. Client ID {profile.clientId}. Risk {riskLabel}.
              {profile.reviewTargetOverdue ? " Overdue warning." : ""}
            </span>
          </div>
        ) : (
          <>
            <div className="flex shrink-0 items-start justify-between gap-2 px-3 pb-3 pt-3">
              <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                <ClientProfileActiveIndicator />
                <span
                  className={cn(
                    aceTypography(ACE_TYPE.p1SemiBold),
                    "min-w-0 truncate text-[var(--screening-text-primary)]",
                  )}
                >
                  {caseName}
                </span>
                <ClientProfileAccordionHeaderTags
                  clientId={profile.clientId}
                  riskBand={profile.riskBand}
                  showOverdueWarning={profile.reviewTargetOverdue}
                  onRiskClick={
                    readOnly ? undefined : () => onOpenClientProfileAction?.("risk-rating")
                  }
                />
              </div>
              <div className="flex shrink-0 items-center gap-0.5 self-start">
                {readOnly ? null : (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        aria-label="Case actions"
                        className={caseActionsMenuTriggerClass}
                      >
                        <MaterialSymbol
                          name="more_horiz"
                          size="md"
                          weight={300}
                          className={caseActionsMenuIconClass}
                        />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      variant="compact"
                      className={caseActionsMenuContentClass}
                    >
                      {CLIENT_PROFILE_ACTIONS.map((entry) => (
                        <DropdownMenuItem
                          key={entry.id}
                          className={caseActionsMenuItemClass}
                          onSelect={() => onOpenClientProfileAction?.(entry.id)}
                        >
                          {entry.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
                <AceTooltip>
                  <AceTooltipTrigger asChild>
                    <button
                      type="button"
                      aria-expanded={true}
                      aria-label="Minimize client profile"
                      className={cn(sidebarIconButtonClass, "shrink-0")}
                      onClick={() => setMinimizedAndNotify(true)}
                    >
                      <MaterialSymbol
                        name="keyboard_arrow_left"
                        size="md"
                        className="text-current"
                      />
                    </button>
                  </AceTooltipTrigger>
                  <AceTooltipContent side="top" variant="screening-toolbar" hideArrow>
                    Minimize client profile
                  </AceTooltipContent>
                </AceTooltip>
              </div>
            </div>

            <div className="flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto px-3 pb-3">
              <div className="flex flex-col gap-3">
                <ClientProfileCopyablePanel
                  copyLabel="Copy identity details"
                  getCopyText={() => {
                    const lines = [
                      ...profile.addressLines,
                      `Client Name · ${caseName}`,
                      `Client ID · ${profile.clientId}`,
                      "Address Validated",
                    ];
                    if (profile.showIdVerified) lines.push("ID Verified");
                    return lines.join("\n");
                  }}
                >
                  <ClientProfileAddressSection addressLines={profile.addressLines} />
                  <ClientProfileNameRow name={caseName} />
                  <ClientProfileClientIdRow clientId={profile.clientId} />
                  <ClientProfileStatusRow label="Address Validated" />
                  {profile.showIdVerified ? (
                    <ClientProfileStatusRow label="ID Verified" />
                  ) : null}
                </ClientProfileCopyablePanel>

                <ClientProfileCopyablePanel
                  copyLabel="Copy profile details"
                  getCopyText={() => {
                    const lines: string[] = [];
                    if (profile.gender != null) lines.push(`Gender · ${profile.gender}`);
                    if (profile.dob != null) lines.push(`Date of Birth · ${profile.dob}`);
                    lines.push(`Application · ${applicationLabel}`);
                    lines.push(
                      `Review Target · ${profile.reviewTargetSummary}${
                        profile.reviewTargetOverdue ? " Overdue Warning" : ""
                      }`,
                    );
                    lines.push(`Last Modified · ${profile.lastModified}`);
                    lines.push(`Comments · ${profileComment}`);
                    lines.push(`Passthrough · ${profilePassthrough}`);
                    return lines.join("\n");
                  }}
                >
                  {profile.gender != null ? (
                    <ClientProfileMetaLine label="Gender">{profile.gender}</ClientProfileMetaLine>
                  ) : null}
                  {profile.dob != null ? (
                    <ClientProfileMetaLine label="Date of Birth">{profile.dob}</ClientProfileMetaLine>
                  ) : null}
                  <ClientProfileMetaLine label="Application">{applicationLabel}</ClientProfileMetaLine>
                  <ClientProfileMetaLine label="Review Target">
                    {profile.reviewTargetSummary}
                    {profile.reviewTargetOverdue ? (
                      <span className="text-[#e65100]"> Overdue Warning</span>
                    ) : null}
                  </ClientProfileMetaLine>
                  <ClientProfileMetaLine label="Last Modified">
                    {profile.lastModified}
                  </ClientProfileMetaLine>
                  <ClientProfileTruncatedField label="Comments" value={profileComment} />
                  <ClientProfileTruncatedField label="Passthrough" value={profilePassthrough} />
                </ClientProfileCopyablePanel>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
