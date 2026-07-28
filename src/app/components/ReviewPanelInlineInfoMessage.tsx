import type { ReactNode } from "react";
import { MaterialSymbol } from "@ace-ds/components/molecules/AceAccordion/MaterialSymbol";
import { aceTypography, ACE_TYPE } from "../lib/aceTypography";
import { cn } from "./ui/utils";

const notoVar = { fontVariationSettings: "'CTGR' 0, 'wdth' 100" } as const;

/** ACE inline info strip — same pattern as `DialogModalInlineError`, with primary (purple) semantics. */
export function ReviewPanelInlineInfoMessage({
  children,
  trailing,
}: {
  children: ReactNode;
  /** Optional control aligned to the right of the message (e.g. View Workflow). */
  trailing?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex w-full items-center gap-3 rounded-[var(--radius-sm)] border border-[var(--screening-primary)] bg-[var(--screening-primary-soft-bg)] px-4 py-2",
        "dark:border-[#7c6bc4] dark:bg-[#2a2540]",
      )}
      role="status"
    >
      <span
        className="inline-flex size-4 shrink-0 items-center justify-center rounded-full bg-[var(--screening-primary)] text-white dark:bg-[#7c6bc4]"
        aria-hidden
      >
        <MaterialSymbol name="info" size="sm" className="text-white" />
      </span>
      <span
        className={cn(
          aceTypography(ACE_TYPE.p1Regular),
          "min-w-0 flex-1 leading-[1.65] text-[var(--screening-text-primary)]",
        )}
        style={notoVar}
      >
        {children}
      </span>
      {trailing ? <div className="ml-auto shrink-0">{trailing}</div> : null}
    </div>
  );
}
