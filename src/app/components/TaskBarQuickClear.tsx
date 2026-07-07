import { ChevronDown } from "lucide-react";
import {
  LEVEL1_DECISION_STATUSES,
  LEVEL2_DECISION_STATUSES,
} from "../lib/reviewDecisionConfig";
import { aceTypography, ACE_TYPE } from "../lib/aceTypography";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { cn } from "./ui/utils";
import type { ScreeningRowStatus } from "./ScreeningResultsTable";

const fieldTriggerClass = cn(
  aceTypography(ACE_TYPE.p1Regular),
  "inline-flex shrink-0 items-center justify-between gap-2",
  "rounded-[4px] border border-solid border-[var(--screening-border-strong)]",
  "bg-[var(--screening-surface)] px-3 py-2",
  "text-[14px] font-normal leading-[1.65] text-[#23262c] dark:text-[#b6c2cf]",
  "[font-family:var(--font-screening)] outline-none transition-colors",
  "hover:bg-[var(--screening-surface-hover)]",
  "focus-visible:ring-2 focus-visible:ring-[var(--screening-primary-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--screening-primary-ring-offset)]",
  "data-[state=open]:bg-[var(--screening-surface-hover)]",
  "data-[state=open]:ring-2 data-[state=open]:ring-[var(--screening-primary-ring)]",
  "data-[state=open]:ring-offset-2 data-[state=open]:ring-offset-[var(--screening-primary-ring-offset)]",
  "disabled:cursor-not-allowed disabled:opacity-50",
);

interface TaskBarQuickClearProps {
  disabled: boolean;
  flowVariant: "level-1" | "level-2";
  onSelect: (status: ScreeningRowStatus) => void;
}

/** Task bar combo button — bulk quick clear with the same options as the table row menu. */
export function TaskBarQuickClear({
  disabled,
  flowVariant,
  onSelect,
}: TaskBarQuickClearProps) {
  const options =
    flowVariant === "level-2" ? LEVEL2_DECISION_STATUSES : LEVEL1_DECISION_STATUSES;

  const trigger = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={disabled}>
        <button type="button" className={fieldTriggerClass}>
          <span className="whitespace-nowrap">Quick Clear</span>
          <ChevronDown className="size-4 shrink-0 opacity-70" strokeWidth={2} aria-hidden />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side="top" sideOffset={8} className="min-w-[12rem]">
        <DropdownMenuLabel>Quick Clear</DropdownMenuLabel>
        {options.map((status) => (
          <DropdownMenuItem
            key={status}
            onSelect={() => onSelect(status as ScreeningRowStatus)}
          >
            {status}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  if (disabled) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex shrink-0">{trigger}</span>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          hideArrow
          className={cn(
            aceTypography(ACE_TYPE.captionSemiBold),
            "border border-[var(--screening-border-strong)] bg-[var(--screening-surface)] text-[var(--screening-text-primary)] shadow-[var(--ace-drop-shadow-xs)]",
          )}
        >
          Select one or more matches
        </TooltipContent>
      </Tooltip>
    );
  }

  return trigger;
}
