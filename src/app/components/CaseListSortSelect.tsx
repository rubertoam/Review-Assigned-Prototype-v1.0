import { useMemo } from "react";
import {
  AceDropdownMenu,
  type AceDropdownMenuEntry,
} from "@ace-ds/components/molecules/AceDropdownMenu/AceDropdownMenu";
import { CASE_SORT_OPTIONS, type CaseSortValue } from "../lib/reviewCaseData";

function sortTriggerLabel(value: CaseSortValue): string {
  const match = CASE_SORT_OPTIONS.find((option) => option.value === value);
  return match ? `Sort: ${match.label}` : "Sort";
}

export function CaseListSortSelect({
  value,
  onValueChange,
}: {
  value: CaseSortValue;
  onValueChange: (value: CaseSortValue) => void;
}) {
  const items = useMemo((): AceDropdownMenuEntry[] => {
    return [
      {
        type: "radioGroup",
        value,
        onValueChange: (next) => onValueChange(next as CaseSortValue),
        options: CASE_SORT_OPTIONS.map((option) => ({
          value: option.value,
          label: option.label,
        })),
      },
    ];
  }, [onValueChange, value]);

  return (
    <AceDropdownMenu
      triggerLabel={sortTriggerLabel(value)}
      triggerMode="field"
      size="sm"
      panelWidth="wide"
      align="start"
      className="!w-full !max-w-full font-['Noto_Sans:Regular',sans-serif] font-normal"
      items={items}
    />
  );
}
