import { ChevronDown } from "lucide-react";
import { aceTypography, ACE_TYPE } from "../lib/aceTypography";
import { cn } from "./ui/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

const notoVar = { fontVariationSettings: "'CTGR' 0, 'wdth' 100" } as const;

/** ACE field trigger — matches AceDropdownMenu field mode, full width in the drawer. */
export const decisionPrimaryTriggerClass = cn(
  "inline-flex w-full items-center justify-between gap-[var(--space-2)] rounded-[var(--radius-sm)] border border-solid border-[var(--screening-border-strong)] bg-[var(--screening-surface)] px-[var(--ace-button-px-sm)] py-[var(--ace-button-py-sm)] text-xs font-semibold leading-[1.65] text-[var(--screening-text-primary)] outline-none transition-colors [font-family:var(--font-screening)]",
  "hover:bg-[var(--screening-surface-hover)] focus-visible:ring-2 focus-visible:ring-[var(--screening-primary-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--screening-primary-ring-offset)]",
  "data-[state=open]:bg-[var(--screening-surface-hover)] data-[state=open]:ring-2 data-[state=open]:ring-[var(--screening-primary-ring)] data-[state=open]:ring-offset-2 data-[state=open]:ring-offset-[var(--screening-primary-ring-offset)]",
  "disabled:pointer-events-none disabled:opacity-50",
);

export function DecisionPrimaryDropdown({
  label,
  placeholder,
  value,
  options,
  onChange,
  disabled = false,
}: {
  label: string;
  placeholder: string;
  value: string | null;
  options: readonly string[];
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  const displayLabel = value ?? placeholder;

  return (
    <div className="flex w-full flex-col gap-2">
      <p
        className={cn(aceTypography(ACE_TYPE.labelBold), "text-[var(--screening-text-primary)]")}
        style={notoVar}
      >
        {label}
      </p>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger
          disabled={disabled}
          className={cn(
            decisionPrimaryTriggerClass,
            !value && "font-normal text-[var(--screening-text-muted)]",
          )}
        >
          <span className="min-w-0 flex-1 truncate text-left">{displayLabel}</span>
          <ChevronDown className="ml-auto size-4 shrink-0 opacity-70" aria-hidden />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          variant="primary"
          align="start"
          side="bottom"
          collisionPadding={12}
          className={cn(
            "z-[400]",
            "w-[var(--radix-dropdown-menu-trigger-width)] min-w-[var(--radix-dropdown-menu-trigger-width)] max-w-[var(--radix-dropdown-menu-trigger-width)]",
            "max-h-[min(20rem,50vh)] overflow-y-auto",
          )}
        >
          {options.map((option) => (
            <DropdownMenuItem
              key={option}
              className={cn(
                option === value &&
                  "bg-[var(--screening-surface-hover)] [&>span:first-child]:bg-[var(--ace-dropdown-menu-primary)]",
              )}
              onSelect={() => onChange(option)}
            >
              {option}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
