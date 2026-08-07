import { useCallback, useMemo } from "react";
import {
  AceDropdownMenu,
  type AceDropdownMenuEntry,
} from "@ace-ds/components/molecules/AceDropdownMenu/AceDropdownMenu";
import {
  CASE_FILTER_GROUPS,
  caseFilterTriggerLabel,
  type CaseFilterValue,
} from "../lib/reviewCaseData";

export function CaseListFilterSelect({
  selectedFilters,
  onSelectedFiltersChange,
}: {
  selectedFilters: ReadonlySet<CaseFilterValue>;
  onSelectedFiltersChange: (filters: ReadonlySet<CaseFilterValue>) => void;
}) {
  const setFilterChecked = useCallback(
    (value: CaseFilterValue, checked: boolean) => {
      const next = new Set(selectedFilters);
      if (checked) next.add(value);
      else next.delete(value);
      onSelectedFiltersChange(next);
    },
    [onSelectedFiltersChange, selectedFilters],
  );

  const items = useMemo((): AceDropdownMenuEntry[] => {
    const entries: AceDropdownMenuEntry[] = [];

    for (const group of CASE_FILTER_GROUPS) {
      entries.push({ type: "label", label: group.label });
      for (const item of group.items) {
        entries.push({
          type: "checkbox",
          label: item.label,
          checked: selectedFilters.has(item.value),
          style: "assignment",
          emphasized:
            item.value === "review-target-overdue-warning" ? "warning" : undefined,
          onCheckedChange: (checked) => setFilterChecked(item.value, checked),
        });
      }
    }

    return entries;
  }, [onSelectedFiltersChange, selectedFilters, setFilterChecked]);

  return (
    <AceDropdownMenu
      triggerLabel={caseFilterTriggerLabel(selectedFilters)}
      triggerMode="field"
      size="sm"
      panelWidth="wide"
      align="start"
      className="!w-full !max-w-full font-['Noto_Sans:Regular',sans-serif] font-normal"
      items={items}
    />
  );
}
