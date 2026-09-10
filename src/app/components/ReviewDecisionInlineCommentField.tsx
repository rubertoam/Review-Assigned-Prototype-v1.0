import { useLayoutEffect, useRef } from "react";
import { aceTypography, ACE_TYPE } from "../lib/aceTypography";
import { cn } from "./ui/utils";

const notoVar = { fontVariationSettings: "'CTGR' 0, 'wdth' 100" } as const;

const MIN_HEIGHT_PX = 88;
const MAX_HEIGHT_PX = 280;

const commentFieldClass = cn(
  "box-border w-full min-w-0 resize-none rounded-[var(--screening-input-radius)] border border-solid border-[var(--screening-input-border)] bg-[var(--color-surface)] px-[var(--screening-input-px)] py-2",
  aceTypography(ACE_TYPE.p1Regular),
  "text-[var(--screening-text-primary)] placeholder:text-[var(--screening-input-placeholder)]",
  "outline-none transition-[background-color,border-color,box-shadow] duration-150 ease-out",
  "focus:border-[var(--screening-input-border-focus)] focus:bg-[var(--screening-input-bg-focus)] focus:shadow-[0_0_0_2px_var(--screening-input-focus-ring)]",
  "disabled:cursor-not-allowed disabled:border-[var(--ace-input-disabled-border)] disabled:bg-[var(--ace-input-disabled-bg)] disabled:text-[var(--ace-input-disabled-text)] disabled:placeholder:text-[var(--ace-input-disabled-text)]",
);

export function ReviewDecisionInlineCommentField({
  value,
  onChange,
  disabled = false,
  placeholder = "Add a comment. Use @ to mention",
}: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    // Use `auto` (not 0) so width stays stable and scrollHeight stays content-sized.
    el.style.height = "auto";
    const contentHeight = el.scrollHeight;
    const nextHeight = Math.min(Math.max(contentHeight, MIN_HEIGHT_PX), MAX_HEIGHT_PX);
    el.style.height = `${nextHeight}px`;
    el.style.overflowY = contentHeight > MAX_HEIGHT_PX ? "auto" : "hidden";
  }, [value]);

  return (
    <div className="flex w-full min-w-0 flex-col gap-2">
      <p
        className={cn(aceTypography(ACE_TYPE.labelBold), "text-[var(--screening-text-primary)]")}
        style={notoVar}
      >
        Comment
      </p>
      <textarea
        ref={textareaRef}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label="Comment"
        rows={3}
        className={commentFieldClass}
        style={{ height: MIN_HEIGHT_PX }}
      />
    </div>
  );
}
