import { ArrowUp } from "lucide-react";
import { AceInputField } from "@ace-ds/components/atoms/AceInputField";
import { aceTypography, ACE_TYPE } from "../lib/aceTypography";
import { cn } from "./ui/utils";

const notoVar = { fontVariationSettings: "'CTGR' 0, 'wdth' 100" } as const;

export function ReviewDecisionInlineCommentField({
  value,
  onChange,
  onSubmit,
  disabled = false,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
}) {
  const canSubmit = !disabled && value.trim().length > 0;

  return (
    <div className="flex w-full min-w-0 flex-col gap-2">
      <p
        className={cn(aceTypography(ACE_TYPE.labelBold), "text-[var(--screening-text-primary)]")}
        style={notoVar}
      >
        Add Comment
      </p>
      <div className="flex w-full min-w-0 items-center gap-2">
        <div className="min-w-0 flex-1 [&_input]:text-xs [&_input]:leading-[1.65] [&_input]:placeholder:text-xs [&_input]:placeholder:leading-[1.65]">
          <AceInputField
            fieldSize="sm"
            placeholder="Add a comment and press Enter. Use @ to mention."
            value={value}
            disabled={disabled}
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                if (canSubmit) onSubmit();
              }
            }}
            aria-label="Add comment"
          />
        </div>
        <button
          type="button"
          aria-label="Submit comment"
          disabled={!canSubmit}
          onClick={onSubmit}
          className={cn(
            "inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-[var(--screening-primary)] text-white transition-colors",
            "hover:bg-[var(--dialog-modal-primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--screening-primary-ring)] focus-visible:ring-offset-2",
            !canSubmit && "cursor-not-allowed opacity-50",
          )}
        >
          <ArrowUp className="size-4" strokeWidth={2} aria-hidden />
        </button>
      </div>
    </div>
  );
}
