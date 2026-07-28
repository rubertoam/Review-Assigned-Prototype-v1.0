import { MaterialSymbol } from "@ace-ds/components/molecules/AceAccordion/MaterialSymbol";
import { aceChevronIconClass } from "@ace-ds/lib/aceChevron";
import { aceTypography, ACE_TYPE } from "../lib/aceTypography";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { cn } from "./ui/utils";
import type { ScreeningResultRow } from "./ScreeningResultsTable";

const notoVar = { fontVariationSettings: "'CTGR' 0, 'wdth' 100" } as const;

const fieldTriggerClass = cn(
  aceTypography(ACE_TYPE.p1Regular),
  "inline-flex w-max max-w-full shrink-0 items-center justify-between gap-2",
  "rounded-[var(--radius-sm)] border border-solid border-[var(--screening-border-strong)]",
  "bg-[var(--screening-surface)] px-[var(--ace-button-px-sm)] py-[var(--ace-button-py-sm)]",
  "text-xs font-normal leading-[1.65] text-[#23262c]",
  "[font-family:var(--font-screening)] outline-none transition-colors",
  "hover:bg-[var(--screening-surface-hover)]",
  "focus-visible:ring-2 focus-visible:ring-[var(--screening-primary-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--screening-primary-ring-offset)]",
  "data-[state=open]:bg-[var(--screening-surface-hover)]",
  "data-[state=open]:ring-2 data-[state=open]:ring-[var(--screening-primary-ring)]",
  "data-[state=open]:ring-offset-2 data-[state=open]:ring-offset-[var(--screening-primary-ring-offset)]",
);

const menuItemClass = cn(
  "[&>span:last-child]:overflow-visible [&>span:last-child]:whitespace-nowrap",
);

function matchLabel(row: ScreeningResultRow) {
  return `${row.name} · ${row.dob}`;
}

export function ReviewActivityMatchSelect({
  rows,
  value,
  onChange,
}: {
  rows: readonly ScreeningResultRow[];
  value: string;
  onChange: (rowId: string) => void;
}) {
  const activeRow = rows.find((row) => row.id === value) ?? rows[0];
  const triggerLabel = activeRow ? matchLabel(activeRow) : "Select match";

  return (
    <div className="shrink-0 overflow-visible p-1">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={fieldTriggerClass}
            aria-label="View activity for match"
            style={notoVar}
          >
            <span className="whitespace-nowrap">{triggerLabel}</span>
            <MaterialSymbol name="keyboard_arrow_down" size="md" className={cn(aceChevronIconClass, "opacity-70")} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          variant="primary"
          align="end"
          className="w-max min-w-[var(--radix-dropdown-menu-trigger-width)] p-1 py-2"
        >
          {rows.map((row) => (
            <DropdownMenuItem
              key={row.id}
              className={cn(
                menuItemClass,
                row.id === value && "bg-[var(--screening-surface-hover)]",
              )}
              onSelect={() => onChange(row.id)}
            >
              {matchLabel(row)}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
