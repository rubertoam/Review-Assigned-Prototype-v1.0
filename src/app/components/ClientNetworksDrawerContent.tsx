import { useEffect, useState, type ReactNode } from "react";
import { AceAccordion } from "@ace-ds/components/molecules/AceAccordion/AceAccordion";
import { MaterialSymbol } from "@ace-ds/components/molecules/AceAccordion/MaterialSymbol";
import { AceBadge } from "@ace-ds/components/atoms/AceBadge/AceBadge";
import {
  AceTooltip,
  AceTooltipContent,
  AceTooltipTrigger,
} from "@ace-ds/components/atoms/AceTooltip/AceTooltip";
import {
  initialNetworksForCase,
  riskBadgeVariant,
  type ClientNetwork,
  type NetworkMember,
} from "../lib/clientNetworksData";
import { aceTypography, ACE_TYPE } from "../lib/aceTypography";
import noDocumentsEmptyImage from "../../assets/client-documents/no-documents-empty.png";
import { cn } from "./ui/utils";

const notoVar = { fontVariationSettings: "'CTGR' 0, 'wdth' 100" } as const;

const drawerAccordionClass = "border-[var(--ace-accordion-border)] shadow-none";

const accordionHeaderIconButtonClass = cn(
  "inline-flex size-6 shrink-0 items-center justify-center rounded-[var(--radius-sm)] transition-colors",
  "hover:bg-[var(--screening-surface-hover)]",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--screening-primary-ring)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--screening-primary-ring-offset)]",
);

function MetaChip({ label, value }: { label: string; value: ReactNode }) {
  return (
    <span
      className={cn(
        aceTypography(ACE_TYPE.footerRegular),
        "inline-flex items-center gap-1 text-[var(--screening-text-secondary)]",
      )}
      style={notoVar}
    >
      <span>{label}:</span>
      <span className="text-[var(--screening-text-primary)]">{value}</span>
    </span>
  );
}

function NetworkMemberCard({ member }: { member: NetworkMember }) {
  return (
    <div className="flex w-full min-w-0 flex-col gap-2 rounded-[var(--radius-sm)] border border-solid border-[var(--screening-border-strong)] bg-[var(--screening-surface)] px-3 py-3">
      <div className="flex min-w-0 items-start gap-2">
        <MaterialSymbol
          name="account_circle"
          size="lg"
          className="mt-0.5 shrink-0 text-[var(--screening-primary)]"
        />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex min-w-0 items-start justify-between gap-2">
            <p
              className={cn(
                aceTypography(ACE_TYPE.p1SemiBold),
                "m-0 min-w-0 text-[var(--screening-text-primary)]",
              )}
              style={notoVar}
            >
              {member.name}
            </p>
            <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5">
              {member.focusLabel ? (
                <AceBadge appearance="tag" variant="purple">
                  {member.focusLabel}
                </AceBadge>
              ) : null}
              <AceBadge
                appearance="tag"
                variant={member.status === "Active" ? "green" : "gray"}
              >
                {member.status}
              </AceBadge>
              <AceBadge appearance="tag" variant={riskBadgeVariant(member.risk)}>
                {member.risk}
              </AceBadge>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <MetaChip label="Client ID" value={member.clientId} />
            <MetaChip label="Relationship" value={member.relationship} />
            <MetaChip label="Matches" value={member.matches} />
          </div>
        </div>
      </div>
    </div>
  );
}

function NetworkAccordion({
  network,
  open,
  onOpenChange,
}: {
  network: ClientNetwork;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <AceAccordion
      title={
        (
          <span className="flex min-w-0 flex-col gap-1.5 text-left">
            <span
              className={cn(
                aceTypography(ACE_TYPE.p1SemiBold),
                "text-[var(--screening-text-primary)]",
              )}
              style={notoVar}
            >
              {network.name}
            </span>
            <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <MetaChip label="Network ID" value={network.networkId} />
              <MetaChip label="Type" value={network.type} />
              <MetaChip label="Members" value={network.members.length} />
              <span className="inline-flex items-center gap-1">
                <span
                  className={cn(
                    aceTypography(ACE_TYPE.footerRegular),
                    "text-[var(--screening-text-secondary)]",
                  )}
                  style={notoVar}
                >
                  Risk Rating:
                </span>
                <AceBadge appearance="tag" variant={riskBadgeVariant(network.risk)}>
                  {network.risk}
                </AceBadge>
              </span>
            </span>
          </span>
        ) as unknown as string
      }
      surface="white"
      dropShadow={false}
      showTag={false}
      showAddIcon={false}
      showDeleteIcon={false}
      showEditIcon={false}
      showMoreIcon={false}
      open={open}
      onOpenChange={onOpenChange}
      className={drawerAccordionClass}
      titleClassName="min-w-0 flex-1 !overflow-visible whitespace-normal"
      headerTrailing={
        <AceTooltip>
          <AceTooltipTrigger asChild>
            <button
              type="button"
              aria-label={`Reports for ${network.name}`}
              className={accordionHeaderIconButtonClass}
              onClick={(event) => event.stopPropagation()}
            >
              <MaterialSymbol
                name="lab_profile"
                size="sm"
                className="text-[var(--ace-accordion-icon)]"
              />
            </button>
          </AceTooltipTrigger>
          <AceTooltipContent side="top" variant="screening-toolbar">
            Reports
          </AceTooltipContent>
        </AceTooltip>
      }
    >
      <div className="flex w-full min-w-0 flex-col gap-3">
        <p
          className={cn(
            aceTypography(ACE_TYPE.p1SemiBold),
            "m-0 text-[var(--screening-text-primary)]",
          )}
          style={notoVar}
        >
          Network Members ({network.members.length})
        </p>
        <div className="flex w-full min-w-0 flex-col gap-2">
          {network.members.map((member) => (
            <NetworkMemberCard key={member.id} member={member} />
          ))}
        </div>
      </div>
    </AceAccordion>
  );
}

export function ClientNetworksDrawerContent({ caseIndex }: { caseIndex: number }) {
  const [networks, setNetworks] = useState(() => initialNetworksForCase(caseIndex));
  const [expandedIds, setExpandedIds] = useState<ReadonlySet<string>>(() => new Set());

  useEffect(() => {
    setNetworks(initialNetworksForCase(caseIndex));
    setExpandedIds(new Set());
  }, [caseIndex]);

  const allExpanded =
    networks.length > 0 && networks.every((network) => expandedIds.has(network.id));

  const setNetworkOpen = (networkId: string, open: boolean) => {
    setExpandedIds((current) => {
      const next = new Set(current);
      if (open) next.add(networkId);
      else next.delete(networkId);
      return next;
    });
  };

  const toggleExpandAll = () => {
    if (allExpanded) {
      setExpandedIds(new Set());
      return;
    }
    setExpandedIds(new Set(networks.map((network) => network.id)));
  };

  if (networks.length === 0) {
    return (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
        <img
          src={noDocumentsEmptyImage}
          alt=""
          className="h-auto w-full max-w-[16rem] object-contain"
        />
        <p
          className={cn(
            aceTypography(ACE_TYPE.p1Regular),
            "m-0 max-w-xs text-[var(--screening-text-muted)]",
          )}
          style={notoVar}
        >
          There are no Networks for this client record
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
      {networks.length > 1 ? (
        <div className="flex shrink-0 justify-end">
          <button
            type="button"
            onClick={toggleExpandAll}
            className={cn(
              aceTypography(ACE_TYPE.p1SemiBold),
              "cursor-pointer rounded-[var(--radius-sm)] border-0 bg-transparent p-0 text-[var(--screening-primary)]",
              "hover:text-[var(--dialog-modal-primary-hover)]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--screening-primary-ring)] focus-visible:ring-offset-2",
            )}
          >
            {allExpanded ? "Collapse all" : "Expand all"}
          </button>
        </div>
      ) : null}
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex flex-col gap-4">
          {networks.map((network) => (
            <NetworkAccordion
              key={network.id}
              network={network}
              open={expandedIds.has(network.id)}
              onOpenChange={(open) => setNetworkOpen(network.id, open)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
