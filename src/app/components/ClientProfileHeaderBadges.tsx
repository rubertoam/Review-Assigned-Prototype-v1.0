import { aceTypography, ACE_TYPE } from "../lib/aceTypography";
import { ReviewMetaTag } from "./ReviewMetaTag";
import { cn } from "./ui/utils";

const clientBodyLineTextClass =
  "m-0 font-['Noto_Sans:Regular',sans-serif] font-normal leading-[1.65] text-[14px] text-[#23262c] dark:text-[#b6c2cf]";

const clientBodyNotoVar = { fontVariationSettings: "'CTGR' 0, 'wdth' 100" } as const;

/** Filled circular alert (Escalated orange) for overdue indicators. */
export function OverdueWarningIcon({ className = "size-4 text-[10px]" }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-[#ef6c00] font-['Noto_Sans:Bold',sans-serif] font-bold leading-none text-white",
        className,
      )}
      aria-hidden
    >
      !
    </span>
  );
}

export function ClientProfileOverdueBadge() {
  return (
    <span
      className={cn(
        aceTypography(ACE_TYPE.captionBold),
        "inline-flex shrink-0 items-center gap-1.5 rounded-[var(--radius-sm)] border px-2 py-0.5",
        "border-[var(--screening-pill-escalated-dot)] bg-[var(--ace-warning-50)] text-[var(--screening-pill-escalated-label)]",
      )}
    >
      <OverdueWarningIcon className="size-3 text-[8px]" />
      Overdue Warning
    </span>
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

export function ClientProfileClientIdRow({ clientId }: { clientId: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <svg
        viewBox="0 0 16 16"
        className="size-4 shrink-0 text-[#523eb9] dark:text-[#b5aae0]"
        aria-hidden
      >
        <path
          fill="currentColor"
          d="M8 8a3.25 3.25 0 1 0 0-6.5 3.25 3.25 0 0 0 0 6.5Zm-5.5 6.25a5.5 5.5 0 0 1 11 0H2.5Z"
        />
      </svg>
      <p className={clientBodyLineTextClass} style={clientBodyNotoVar}>
        Client ID · {clientId}
      </p>
    </div>
  );
}
