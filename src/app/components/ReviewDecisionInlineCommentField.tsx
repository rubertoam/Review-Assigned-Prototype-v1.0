import { AceInputField } from "@ace-ds/components/atoms/AceInputField";
import { aceTypography, ACE_TYPE } from "../lib/aceTypography";
import { cn } from "./ui/utils";

const notoVar = { fontVariationSettings: "'CTGR' 0, 'wdth' 100" } as const;

export function ReviewDecisionInlineCommentField({
  value,
  onChange,
  disabled = false,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex w-full min-w-0 flex-col gap-2">
      <p
        className={cn(aceTypography(ACE_TYPE.labelBold), "text-[var(--screening-text-primary)]")}
        style={notoVar}
      >
        Add Comment
      </p>
      <div className="w-full min-w-0 [&_input]:text-xs [&_input]:leading-[1.65] [&_input]:placeholder:text-xs [&_input]:placeholder:leading-[1.65]">
        <AceInputField
          fieldSize="sm"
          placeholder="Add a comment. Use @ to mention"
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          aria-label="Add comment"
        />
      </div>
    </div>
  );
}
