import { AceBadge } from "@ace-ds/components/atoms/AceBadge/AceBadge";
import { aceBadgeWarningIconClass } from "@ace-ds/components/atoms/AceBadge/badgeFieldStyles";
import { MaterialSymbol } from "@ace-ds/components/molecules/AceAccordion/MaterialSymbol";
import { ReviewMetaTag } from "./ReviewMetaTag";
import { cn } from "./ui/utils";

/** ACE badge warning “!” — used in case list overdue affordance. */
export function OverdueWarningIcon({ className }: { className?: string }) {
  return (
    <span className={cn(aceBadgeWarningIconClass, className)} aria-hidden>
      !
    </span>
  );
}

export function ClientProfileOverdueBadge() {
  return (
    <AceBadge appearance="tag" variant="orange" showWarningIcon>
      Overdue Warning
    </AceBadge>
  );
}

export function ClientProfileAccordionHeaderTags({
  clientId,
  countryLabel,
  dob,
  showOverdueWarning,
}: {
  clientId: string;
  countryLabel: string;
  dob?: string | null;
  showOverdueWarning: boolean;
}) {
  return (
    <div className="flex min-w-0 flex-nowrap items-center gap-1.5 overflow-hidden">
      <ReviewMetaTag>{`Client ID · ${clientId}`}</ReviewMetaTag>
      <ReviewMetaTag>{countryLabel}</ReviewMetaTag>
      {dob ? <ReviewMetaTag>{`DOB · ${dob}`}</ReviewMetaTag> : null}
      {showOverdueWarning ? <ClientProfileOverdueBadge /> : null}
    </div>
  );
}

const clientBodyLineTextClass =
  "m-0 font-['Noto_Sans:Regular',sans-serif] font-normal leading-[1.65] text-[14px] text-[var(--screening-text-primary)]";

const clientBodyNotoVar = { fontVariationSettings: "'CTGR' 0, 'wdth' 100" } as const;

export function ClientProfileClientIdRow({ clientId }: { clientId: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <MaterialSymbol
        name="account_circle"
        size="md"
        className="text-[var(--screening-primary)]"
      />
      <p className={clientBodyLineTextClass} style={clientBodyNotoVar}>
        Client ID · {clientId}
      </p>
    </div>
  );
}
