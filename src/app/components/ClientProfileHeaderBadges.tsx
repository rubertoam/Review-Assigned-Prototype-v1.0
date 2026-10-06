import { AceBadge } from "@ace-ds/components/atoms/AceBadge/AceBadge";
import { aceBadgeWarningIconClass } from "@ace-ds/components/atoms/AceBadge/badgeFieldStyles";
import { MaterialSymbol } from "@ace-ds/components/molecules/AceAccordion/MaterialSymbol";
import { cn } from "./ui/utils";

/** Shared icon column so address / name / ID / status icons share one vertical axis. */
export const clientProfileIconSlotClass =
  "inline-flex size-6 shrink-0 items-center justify-center text-[var(--screening-primary)]";

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
      <AceBadge appearance="tag" variant="purple">{`Client ID · ${clientId}`}</AceBadge>
      <AceBadge appearance="tag" variant="purple">{`Country · ${countryLabel}`}</AceBadge>
      {dob ? (
        <AceBadge appearance="tag" variant="purple">{`DOB · ${dob}`}</AceBadge>
      ) : null}
      {showOverdueWarning ? <ClientProfileOverdueBadge /> : null}
    </div>
  );
}

const clientBodyLineTextClass =
  "m-0 font-['Noto_Sans:Regular',sans-serif] font-normal leading-[1.65] text-[14px] text-[var(--screening-text-primary)]";

const clientBodyNotoVar = { fontVariationSettings: "'CTGR' 0, 'wdth' 100" } as const;

export function ClientProfileNameRow({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className={clientProfileIconSlotClass} aria-hidden>
        <MaterialSymbol name="account_circle" size="sm" className="text-current" />
      </span>
      <p className={clientBodyLineTextClass} style={clientBodyNotoVar}>
        Client Name · {name}
      </p>
    </div>
  );
}

export function ClientProfileClientIdRow({ clientId }: { clientId: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className={clientProfileIconSlotClass} aria-hidden>
        <MaterialSymbol name="account_circle" size="sm" className="text-current" />
      </span>
      <p className={clientBodyLineTextClass} style={clientBodyNotoVar}>
        Client ID · {clientId}
      </p>
    </div>
  );
}

export function ClientProfileStatusRow({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className={clientProfileIconSlotClass} aria-hidden>
        <svg className="block size-4" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
          <path
            d="M6.88 9.44L5.14 7.7C4.99333 7.55333 4.81333 7.48 4.6 7.48C4.38667 7.48 4.2 7.56 4.04 7.72C3.89333 7.86667 3.82 8.05333 3.82 8.28C3.82 8.50667 3.89333 8.69333 4.04 8.84L6.32 11.12C6.46667 11.2667 6.65333 11.34 6.88 11.34C7.10667 11.34 7.29333 11.2667 7.44 11.12L11.98 6.58C12.1267 6.43333 12.2 6.25333 12.2 6.04C12.2 5.82667 12.12 5.64 11.96 5.48C11.8133 5.33333 11.6267 5.26 11.4 5.26C11.1733 5.26 10.9867 5.33333 10.84 5.48L6.88 9.44ZM8 16C6.89333 16 5.85333 15.7899 4.88 15.3696C3.90667 14.9499 3.06 14.38 2.34 13.66C1.62 12.94 1.05013 12.0933 0.6304 11.12C0.210133 10.1467 0 9.10667 0 8C0 6.89333 0.210133 5.85333 0.6304 4.88C1.05013 3.90667 1.62 3.06 2.34 2.34C3.06 1.62 3.90667 1.04987 4.88 0.6296C5.85333 0.209867 6.89333 0 8 0C9.10667 0 10.1467 0.209867 11.12 0.6296C12.0933 1.04987 12.94 1.62 13.66 2.34C14.38 3.06 14.9499 3.90667 15.3696 4.88C15.7899 5.85333 16 6.89333 16 8C16 9.10667 15.7899 10.1467 15.3696 11.12C14.9499 12.0933 14.38 12.94 13.66 13.66C12.94 14.38 12.0933 14.9499 11.12 15.3696C10.1467 15.7899 9.10667 16 8 16Z"
            fill="#87B531"
          />
        </svg>
      </span>
      <p
        className="m-0 font-['Noto_Sans:Regular',sans-serif] text-[14px] font-normal leading-[1.65] text-[#23262c] dark:text-[#b6c2cf]"
        style={clientBodyNotoVar}
      >
        {label}
      </p>
    </div>
  );
}
