import { useMemo } from "react";
import {
  AceDropdownMenu,
  type AceDropdownMenuEntry,
} from "@ace-ds/components/molecules/AceDropdownMenu/AceDropdownMenu";
import { aceTypography, ACE_TYPE } from "../lib/aceTypography";
import { cn } from "./ui/utils";

const notoVar = { fontVariationSettings: "'CTGR' 0, 'wdth' 100" } as const;

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
  const items = useMemo((): AceDropdownMenuEntry[] => {
    return options.map((option) => ({
      type: "item",
      label: option,
      highlighted: option === value,
      onSelect: () => onChange(option),
    }));
  }, [onChange, options, value]);

  return (
    <div className="flex w-full flex-col gap-2">
      <p
        className={cn(aceTypography(ACE_TYPE.labelBold), "text-[var(--screening-text-primary)]")}
        style={notoVar}
      >
        {label}
      </p>
      <AceDropdownMenu
        triggerLabel={value ?? placeholder}
        triggerMode="field"
        size="sm"
        panelWidth="wide"
        align="start"
        disabled={disabled}
        className={cn(
          "!w-full !max-w-full font-['Noto_Sans:Regular',sans-serif] font-normal",
          !value && "text-[var(--screening-text-muted)]",
        )}
        items={items}
      />
    </div>
  );
}
