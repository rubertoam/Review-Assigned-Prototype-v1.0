import { useState } from "react";
import { DialogModal } from "@ace-ds/components/molecules/DialogModal/DialogModal";
import {
  CLIENT_PROFILE_FIELD_CHAR_LIMIT,
  truncateClientProfileField,
} from "../lib/clientProfileCommentData";
import { MetaDot } from "./ClientProfileMetaLine";
import { cn } from "./ui/utils";

const clientMetaLineClass =
  "m-0 font-['Noto_Sans:Regular',sans-serif] font-normal leading-[1.65] text-[14px] text-[#23262c] dark:text-[#b6c2cf]";

const clientMetaNotoVar = { fontVariationSettings: "'CTGR' 0, 'wdth' 100" } as const;

export function ClientProfileTruncatedField({
  label,
  value,
  charLimit = CLIENT_PROFILE_FIELD_CHAR_LIMIT,
}: {
  label: string;
  value: string;
  charLimit?: number;
}) {
  const [open, setOpen] = useState(false);
  const { display, truncated } = truncateClientProfileField(value, charLimit);

  return (
    <>
      <p className={clientMetaLineClass} style={clientMetaNotoVar}>
        <span className="inline-flex min-w-0 items-start gap-1.5">
          <span className="shrink-0">{label}</span>
          {/* Optically center the 4px dot on the first text line (14px / leading 1.65). */}
          <MetaDot className="mt-[0.55em]" />
          {truncated ? (
            <button
              type="button"
              onClick={() => setOpen(true)}
              className={cn(
                clientMetaLineClass,
                "min-w-0 flex-1 cursor-pointer rounded-[var(--radius-sm)] border-0 bg-transparent p-0 text-left",
                "underline-offset-2 hover:underline",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--screening-primary-ring)] focus-visible:ring-offset-1",
              )}
              style={clientMetaNotoVar}
              aria-label={`View full ${label.toLowerCase()}`}
            >
              {display}
            </button>
          ) : (
            <span className="min-w-0 flex-1 break-words">{display}</span>
          )}
        </span>
      </p>

      <DialogModal
        open={open}
        onClose={() => setOpen(false)}
        title={label}
        size="md"
        fitContent
        primaryAction={{
          label: "Close",
          onClick: () => setOpen(false),
        }}
      >
        <p className={cn(clientMetaLineClass, "whitespace-pre-wrap")} style={clientMetaNotoVar}>
          {value}
        </p>
      </DialogModal>
    </>
  );
}
